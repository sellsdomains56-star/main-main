#!/usr/bin/env node
/**
 * Builds src/components/map/uae.json — the offline map of the UAE drawn by the app's 3D map.
 *
 * Data: © OpenStreetMap contributors (ODbL), in the OpenMapTiles schema, read from OpenFreeMap's
 * free vector tiles. The UAE is drawn at four levels of detail: the whole country, the coast,
 * the cities (Dubai–Sharjah–Ajman, Abu Dhabi), and street level with 3D buildings around every
 * barber and barbershop in the seed (server/src/seed.ts). Geometry is simplified, quantised and
 * delta-encoded so the whole file stays small enough to ship inside the app.
 *
 *   node scripts/build-uae-map.mjs          (tiles are cached in node_modules/.cache/uae-tiles)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { VectorTile } from "@mapbox/vector-tile";
import Protobuf from "pbf";
import ClipperLib from "clipper-lib";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(root, "src/components/map/uae.json");
const CACHE = path.join(root, "node_modules/.cache/uae-tiles");
const SEED = path.join(root, "../server/src/seed.ts");
fs.mkdirSync(CACHE, { recursive: true });

const Q = 2 ** 25; // world units (0..1 Web Mercator) → integers, ~1 m in the UAE
const M = 40075016.686 * Math.cos((24.5 * Math.PI) / 180); // metres per world unit at the UAE's latitude
const metres = (m) => (m / M) * Q; // a distance in quantised units

// The whole country, with a margin of the Gulf, Oman (Musandam, Al Buraimi) and the Gulf of Oman.
const UAE = { w: 51.4, s: 22.55, e: 56.75, n: 26.45 };
// Cities drawn in full: street grid, parks, detailed coastline (the Palms, the Creek, the islands).
const CITIES = [
  { name: "Dubai, Sharjah and Ajman", w: 54.95, s: 24.93, e: 55.6, n: 25.47 },
  { name: "Abu Dhabi", w: 54.25, s: 24.33, e: 54.7, n: 24.6 },
];
// Skylines: every tower of 60 m or more, in 3D.
const SKYLINES = [
  { w: 55.12, s: 25.055, e: 55.165, n: 25.098 }, // Dubai Marina, JBR, JLT
  { w: 55.165, s: 25.095, e: 55.215, n: 25.125 }, // Al Barsha, Barsha Heights
  { w: 55.215, s: 25.17, e: 55.305, n: 25.235 }, // Downtown, Business Bay, DIFC, Sheikh Zayed Road
  { w: 55.29, s: 25.24, e: 55.34, n: 25.275 }, // Deira, Al Rigga, the Creek
  { w: 55.13, s: 25.105, e: 55.16, n: 25.14 }, // Palm Jumeirah trunk
  { w: 54.315, s: 24.445, e: 54.42, n: 24.505 }, // Abu Dhabi Corniche and Al Reem
  { w: 55.365, s: 25.305, e: 55.41, n: 25.345 }, // Sharjah Al Majaz and Al Khan
];
const STREET_RADIUS = 800; // metres of street-level detail around each barber
const BUILDING_RADIUS = 400; // metres of every building, any height, around each barber
const TERTIARY_RADIUS = 3500; // metres of the finer city street grid around each barber

const lng2x = (lng) => (lng + 180) / 360;
const lat2y = (lat) => {
  const r = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2;
};
const qx = (lng) => Math.round(lng2x(lng) * Q);
const qy = (lat) => Math.round(lat2y(lat) * Q);
const box = (b) => [qx(b.w), qy(b.n), qx(b.e), qy(b.s)];

function tileRange(b, z) {
  const n = 2 ** z;
  return {
    x0: Math.floor(lng2x(b.w) * n), x1: Math.floor(lng2x(b.e) * n),
    y0: Math.floor(lat2y(b.n) * n), y1: Math.floor(lat2y(b.s) * n),
  };
}
const tilesIn = (b, z) => {
  const r = tileRange(b, z);
  const out = [];
  for (let x = r.x0; x <= r.x1; x++) for (let y = r.y0; y <= r.y1; y++) out.push([z, x, y]);
  return out;
};

// ---- Tiles ---------------------------------------------------------------------------------

let tileUrl;
async function getTile(z, x, y) {
  const file = path.join(CACHE, `${z}-${x}-${y}.pbf`);
  if (!fs.existsSync(file)) {
    tileUrl ??= (await (await fetch("https://tiles.openfreemap.org/planet")).json()).tiles[0];
    const url = tileUrl.replace("{z}", z).replace("{x}", x).replace("{y}", y);
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${url}`);
        fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
        break;
      } catch (e) {
        if (attempt >= 3) throw e;
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
    await new Promise((r) => setTimeout(r, 60)); // be gentle with a free service
  }
  return new VectorTile(new Protobuf(fs.readFileSync(file)));
}

/** A feature's geometry in quantised world coordinates: rings (polygons) or lines. */
function geometry(feature, z, x, y) {
  const n = 2 ** z;
  const e = feature.extent;
  return feature.loadGeometry().map((ring) => ring.map((p) => [Math.round(((x + p.x / e) / n) * Q), Math.round(((y + p.y / e) / n) * Q)]));
}

/** Rings of a polygon feature grouped into polygons (outer ring + holes), by winding. */
function polygons(rings) {
  const out = [];
  for (const ring of rings) {
    if (ring.length < 4) continue;
    if (area(ring) > 0 || !out.length) out.push([ring]);
    else out[out.length - 1].push(ring);
  }
  return out;
}
function area(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return a / 2;
}

/** Clip a line to a tile's square (tiles carry a buffer; without this, edges are stored twice). */
function clipLine(line, [x0, y0, x1, y1]) {
  const out = [];
  let cur = null;
  for (let i = 1; i < line.length; i++) {
    let [ax, ay] = line[i - 1];
    let [bx, by] = line[i];
    let t0 = 0, t1 = 1;
    const dx = bx - ax, dy = by - ay;
    let inside = true;
    for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
      if (p === 0) { if (q < 0) { inside = false; break; } continue; }
      const t = q / p;
      if (p < 0) { if (t > t1) { inside = false; break; } if (t > t0) t0 = t; }
      else { if (t < t0) { inside = false; break; } if (t < t1) t1 = t; }
    }
    if (!inside) { cur = null; continue; }
    const a = [Math.round(ax + t0 * dx), Math.round(ay + t0 * dy)];
    const b = [Math.round(ax + t1 * dx), Math.round(ay + t1 * dy)];
    if (!cur || t0 > 0) { cur = [a]; out.push(cur); }
    cur.push(b);
    if (t1 < 1) cur = null;
  }
  return out.filter((l) => l.length > 1);
}
const tileBox = (z, x, y) => {
  const s = Q / 2 ** z;
  return [x * s, y * s, (x + 1) * s, (y + 1) * s];
};

// ---- Geometry ------------------------------------------------------------------------------

function simplify(points, tolerance, closed) {
  if (points.length <= (closed ? 4 : 2)) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const t2 = tolerance * tolerance;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, index = -1;
    const [ax, ay] = points[a], [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      let t = len ? ((px - ax) * dx + (py - ay) * dy) / len : 0;
      t = Math.max(0, Math.min(1, t));
      const ex = ax + t * dx - px, ey = ay + t * dy - py;
      const d = ex * ex + ey * ey;
      if (d > max) { max = d; index = i; }
    }
    if (max > t2) { keep[index] = 1; stack.push([a, index], [index, b]); }
  }
  const out = points.filter((_, i) => keep[i]);
  return closed && out.length < 4 ? [] : out;
}

const zigzag = (n) => (n < 0 ? -2 * n - 1 : 2 * n);
/** Points → delta-encoded zigzag varints → base64. The app decodes with decodeLine(). */
function encode(points) {
  const bytes = [];
  let px = 0, py = 0;
  const push = (v) => {
    while (v >= 128) { bytes.push((v % 128) | 128); v = Math.floor(v / 128); }
    bytes.push(v);
  };
  for (const [x, y] of points) { push(zigzag(x - px)); push(zigzag(y - py)); px = x; py = y; }
  return Buffer.from(bytes).toString("base64");
}

/** Join line pieces that meet end to end (tiles cut every road at their edges) into long lines. */
function joinLines(lines, tolerance) {
  const key = ([x, y]) => `${Math.round(x / tolerance)},${Math.round(y / tolerance)}`;
  const ends = new Map();
  const add = (k, i) => (ends.get(k) ?? ends.set(k, []).get(k)).push(i);
  lines.forEach((l, i) => { add(key(l[0]), i); add(key(l[l.length - 1]), i); });
  const used = new Uint8Array(lines.length);
  const take = (pt, self) => {
    for (const i of ends.get(key(pt)) ?? []) {
      if (used[i] || i === self) continue;
      const l = lines[i];
      if (dist(l[0], pt) <= tolerance * 1.5) { used[i] = 1; return l; }
      if (dist(l[l.length - 1], pt) <= tolerance * 1.5) { used[i] = 1; return [...l].reverse(); }
    }
    return null;
  };
  const out = [];
  lines.forEach((l, i) => {
    if (used[i]) return;
    used[i] = 1;
    let line = [...l];
    for (let next; (next = take(line[line.length - 1], i)); ) line = line.concat(next.slice(1));
    for (let prev; (prev = take(line[0], i)); ) line = [...prev].reverse().concat(line.slice(1)); // prev starts where line starts
    out.push(line);
  });
  return out;
}

/**
 * Union polygon pieces from many tiles into seamless shapes, then simplify. Clipper works in
 * integers, which the quantised coordinates already are, so tile edges merge exactly.
 */
function merge(pieces, tolerance, minArea) {
  if (!pieces.length) return [];
  const clipper = new ClipperLib.Clipper();
  for (const poly of pieces) for (const ring of poly) clipper.AddPath(ring.map(([X, Y]) => ({ X, Y })), ClipperLib.PolyType.ptSubject, true);
  const tree = new ClipperLib.PolyTree();
  // Holes wind the other way (vector tile rule), so non-zero filling keeps islands as holes.
  clipper.Execute(ClipperLib.ClipType.ctUnion, tree, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
  const ring = (contour) => {
    const pts = contour.map((p) => [p.X, p.Y]);
    pts.push(pts[0]);
    return simplify(pts, tolerance, true);
  };
  const out = [];
  const walk = (node) => {
    for (const outer of node.Childs()) {
      const shell = ring(outer.Contour());
      if (shell.length >= 4 && Math.abs(area(shell)) >= minArea) {
        const holes = outer.Childs().map((h) => ring(h.Contour())).filter((h) => h.length >= 4 && Math.abs(area(h)) >= minArea / 4);
        out.push([shell, ...holes].map(encode));
      }
      for (const hole of outer.Childs()) walk(hole); // islands inside lakes inside islands…
    }
  };
  walk(tree);
  return out;
}

const nameOf = (p) => p["name:en"] || p.name_en || p.name_int || p["name:latin"] || p.name;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ---- Barbers -------------------------------------------------------------------------------

const seed = fs.readFileSync(SEED, "utf8");
const PINS = [...seed.matchAll(/countryCode: "AE".*?lat: ([\d.]+), lng: ([\d.]+)/g)].map((m) => [qx(+m[2]), qy(+m[1])]);
const pinBoxes = (radius) => PINS.map(([x, y]) => {
  const r = metres(radius);
  const w = ((x - r) / Q) * 360 - 180, e = ((x + r) / Q) * 360 - 180;
  const lat = (yy) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * yy) / Q))) * 180) / Math.PI;
  return { w, e, n: lat(y - r), s: lat(y + r) };
});
console.log(`${PINS.length} barbers and barbershops in the UAE`);
const near = (pt, radius) => PINS.some((p) => dist(p, pt) <= metres(radius));

// ---- Build ---------------------------------------------------------------------------------

const unique = (list) => [...new Map(list.map((t) => [t.join("/"), t])).values()];

async function collect(tiles, onLayer) {
  let done = 0;
  for (const [z, x, y] of tiles) {
    const tile = await getTile(z, x, y);
    for (const [name, layer] of Object.entries(tile.layers)) {
      for (let i = 0; i < layer.length; i++) onLayer(name, layer.feature(i), z, x, y);
    }
    if (++done % 25 === 0) console.log(`  ${done}/${tiles.length} tiles`);
  }
}

const WATER = new Set(["ocean", "lake", "river", "pond", "lagoon", "bay"]); // not swimming pools
const pack = {
  attribution: "© OpenStreetMap contributors",
  q: Q,
  bbox: box(UAE),
  region: null,
  water: {},
  roads: {},
  cities: [],
  streets: [],
  buildings: [],
  borders: [],
  runways: [],
  labels: [],
  roadNames: [],
};

// 0. The region around it (z6): the Gulf, Qatar, Saudi Arabia, Oman and Iran's coast, for the zoomed-out view.
const REGION = { w: 46, s: 19, e: 62, n: 30 };
{
  console.log("region (z6)");
  const water = [];
  await collect(tilesIn(REGION, 6), (layer, f, z, x, y) => {
    if (layer === "water" && WATER.has(f.properties.class)) water.push(...polygons(geometry(f, z, x, y)));
  });
  pack.region = { box: box(REGION), water: merge(water, metres(1200), metres(6000) ** 2) };
}

// 1. Country: coast and highways (z8), then the whole coastline and main roads (z10).
for (const [level, z, tolerance, minArea, classes] of [
  ["lo", 8, metres(220), metres(1400) ** 2, ["motorway", "trunk"]],
  ["mid", 10, metres(50), metres(380) ** 2, ["motorway", "trunk", "primary"]],
]) {
  console.log(`level ${level} (z${z})`);
  const water = [];
  const roads = Object.fromEntries(classes.map((c) => [c, []]));
  await collect(tilesIn(UAE, z), (layer, f, tz, tx, ty) => {
    const p = f.properties;
    if (layer === "water" && WATER.has(p.class)) water.push(...polygons(geometry(f, tz, tx, ty)));
    if (layer === "transportation" && classes.includes(p.class) && f.type === 2 && p.brunnel !== "tunnel" && !p.ramp) {
      // Inside the cities, the city level takes over from zoom 10; there only highways matter here.
      const city = (pt) => CITIES.some((b) => { const [x0, y0, x1, y1] = box(b); return pt[0] >= x0 && pt[0] <= x1 && pt[1] >= y0 && pt[1] <= y1; });
      for (const line of geometry(f, tz, tx, ty)) for (const part of clipLine(line, tileBox(tz, tx, ty))) if (p.class !== "primary" || !city(part[0])) roads[p.class].push(part);
    }
    if (level === "mid" && layer === "boundary" && f.type === 2 && !p.maritime && (p.admin_level === 2 || p.admin_level === 4)) {
      for (const line of geometry(f, tz, tx, ty)) for (const part of clipLine(line, tileBox(tz, tx, ty))) pack.borders.push({ l: p.admin_level, g: encode(simplify(part, metres(40))) });
    }
    if (level === "mid" && layer === "aeroway" && p.class === "runway" && f.type === 2) {
      for (const line of geometry(f, tz, tx, ty)) for (const part of clipLine(line, tileBox(tz, tx, ty))) pack.runways.push(encode(simplify(part, metres(10))));
    }
    if (layer === "place" && f.type === 1 && ["city", "town", "village", "island"].includes(p.class)) {
      const [[[x, y]]] = geometry(f, tz, tx, ty);
      const [x0, y0, x1, y1] = tileBox(tz, tx, ty);
      if (x < x0 || x >= x1 || y < y0 || y >= y1) return;
      const kind = p.class;
      if (level === "lo" && kind !== "city") return;
      if (level === "mid" && (kind === "city" || kind === "village")) return;
      pack.labels.push({ t: nameOf(p), k: kind, x, y, r: p.rank ?? 10 });
    }
    if (level === "mid" && layer === "transportation_name" && p.ref && /^E\s?\d+$/.test(p.ref) && f.type === 2) {
      const line = geometry(f, tz, tx, ty)[0];
      const mid = line[Math.floor(line.length / 2)];
      const [x0, y0, x1, y1] = tileBox(tz, tx, ty);
      if (mid[0] >= x0 && mid[0] < x1 && mid[1] >= y0 && mid[1] < y1) pack.labels.push({ t: p.ref.replace(/\s/g, ""), k: "shield", x: mid[0], y: mid[1], r: 0 });
    }
  });
  pack.water[level] = merge(water, tolerance, minArea);
  pack.roads[level] = Object.fromEntries(Object.entries(roads).map(([c, lines]) => [c, joinLines(lines, metres(z === 8 ? 60 : 15)).map((l) => simplify(l, tolerance)).filter((l) => l.length > 1).map(encode)]));
}

// 2. Cities (z12): detailed coastline, parks, the street grid, the metro and district names.
for (const city of CITIES) {
  console.log(`city: ${city.name} (z12)`);
  const tiles = tilesIn(city, 12);
  const r = tileRange(city, 12);
  const s = Q / 2 ** 12;
  const water = [];
  const green = [];
  const lines = { motorway: [], trunk: [], primary: [], secondary: [], tertiary: [], rail: [] };
  await collect(tiles, (layer, f, z, x, y) => {
    const p = f.properties;
    if (layer === "water" && WATER.has(p.class)) water.push(...polygons(geometry(f, z, x, y)));
    if ((layer === "landcover" && p.class === "grass") || (layer === "park" && f.type === 3)) green.push(...polygons(geometry(f, z, x, y)));
    if (layer === "transportation" && f.type === 2) {
      const cls = p.class === "transit" || p.class === "rail" ? "rail" : p.class;
      if (!(cls in lines) || (p.brunnel === "tunnel" && cls !== "rail") || (p.ramp && cls !== "motorway")) return;
      for (const line of geometry(f, z, x, y)) for (const part of clipLine(line, tileBox(z, x, y))) {
        if (cls === "tertiary" && !part.some((pt) => near(pt, TERTIARY_RADIUS))) continue; // the finer grid only around barbers
        lines[cls].push(part);
      }
    }
    if (layer === "place" && f.type === 1 && ["suburb", "quarter", "island"].includes(p.class)) {
      const name = nameOf(p);
      if (!name || (/\s\d+$/.test(name) && p.class !== "island")) return; // "Al Quoz 3": keep "Al Quoz"
      const [[[px, py]]] = geometry(f, z, x, y);
      const [x0, y0, x1, y1] = tileBox(z, x, y);
      if (px < x0 || px >= x1 || py < y0 || py >= y1) return;
      pack.labels.push({ t: name, k: p.class === "island" ? "island" : "suburb", x: px, y: py, r: p.rank ?? 12 });
    }
    if (layer === "transportation_name" && f.type === 2 && ["motorway", "trunk", "primary"].includes(p.class) && nameOf(p) && !p.subclass) {
      for (const line of geometry(f, z, x, y)) for (const part of clipLine(line, tileBox(z, x, y))) {
        const simple = simplify(part, metres(12));
        if (simple.length > 1) pack.roadNames.push({ t: nameOf(p), c: p.class, g: encode(simple) });
      }
    }
  });
  pack.cities.push({
    name: city.name,
    box: [r.x0 * s, r.y0 * s, (r.x1 + 1) * s, (r.y1 + 1) * s].map(Math.round),
    water: merge(water, metres(5), metres(40) ** 2),
    green: merge(green, metres(7), metres(90) ** 2),
    roads: Object.fromEntries(Object.entries(lines).map(([c, ls]) => [c, joinLines(ls, metres(4)).map((l) => simplify(l, metres(c === "motorway" || c === "trunk" ? 4 : 6))).filter((l) => l.length > 1).map(encode)])),
  });
}

// 3. Street level (z14): every street and building around the barbers, and the skylines in 3D.
console.log("street level (z14)");
const streetTiles = unique(pinBoxes(STREET_RADIUS).flatMap((b) => tilesIn(b, 14)));
const skylineTiles = unique(SKYLINES.flatMap((b) => tilesIn(b, 14)));
const inSkyline = (pt) => SKYLINES.some((b) => { const [x0, y0, x1, y1] = box(b); return pt[0] >= x0 && pt[0] <= x1 && pt[1] >= y0 && pt[1] <= y1; });
const streets = { minor: [], service: [], path: [] };
const buildings = [];
await collect(unique([...streetTiles, ...skylineTiles]), (layer, f, z, x, y) => {
  const p = f.properties;
  if (layer === "transportation" && f.type === 2 && (p.class in streets) && p.brunnel !== "tunnel") {
    if (p.class === "path" && p.subclass !== "pedestrian") return;
    for (const line of geometry(f, z, x, y)) for (const part of clipLine(line, tileBox(z, x, y))) {
      if (part.some((pt) => near(pt, p.class === "service" ? BUILDING_RADIUS : STREET_RADIUS))) streets[p.class].push(simplify(part, metres(2.2)));
    }
  }
  if (layer === "building" && f.type === 3) {
    const h = Math.round(p.render_height ?? 6);
    for (const [ring] of polygons(geometry(f, z, x, y))) {
      const [x0, y0, x1, y1] = tileBox(z, x, y);
      const c = ring.reduce((a, pt) => [a[0] + pt[0] / ring.length, a[1] + pt[1] / ring.length], [0, 0]);
      if (c[0] < x0 || c[0] >= x1 || c[1] < y0 || c[1] >= y1) continue; // a building crossing tiles is kept once
      const tall = h >= 60 && inSkyline(c);
      if (!tall && !near(c, BUILDING_RADIUS)) continue;
      if (Math.abs(area(ring)) < metres(7) ** 2) continue;
      const simple = simplify(ring, metres(1.3), true);
      if (simple.length >= 4) buildings.push({ h, x: c[0], g: simple });
    }
  }
});
// Buildings drawn back to front need no sorting here; the renderer sorts by distance.
const seen = new Set();
pack.buildings = buildings
  .filter((b) => { const k = b.g.slice(0, 3).join(); if (seen.has(k)) return false; seen.add(k); return true; })
  .map((b) => ({ h: b.h, g: encode(b.g) }));
pack.streets = Object.fromEntries(Object.entries(streets).map(([c, ls]) => [c, joinLines(ls, metres(2)).filter((l) => l.length > 1).map(encode)]));

// 4. Labels: the seven emirates, the seas and the landmarks, placed by hand.
const place = (t, k, lat, lng, r = 0) => pack.labels.push({ t, k, x: qx(lng), y: qy(lat), r });
for (const [t, lat, lng] of [
  ["Abu Dhabi", 23.55, 54.0], ["Dubai", 24.98, 55.42], ["Sharjah", 25.2, 55.72], ["Ajman", 25.43, 55.6],
  ["Umm Al Quwain", 25.47, 55.78], ["Ras Al Khaimah", 25.6, 56.0], ["Fujairah", 25.3, 56.24],
]) place(t, "emirate", lat, lng);
place("Arabian Gulf", "sea", 25.55, 54.0);
place("The World", "island", 25.225, 55.172, 4);
place("Palm Jebel Ali", "island", 25.004, 54.99, 5);
place("Bluewaters", "island", 25.0785, 55.1205, 6);
place("Bur Dubai", "suburb", 25.2565, 55.2985, 10);
place("Gulf of Oman", "sea", 25.0, 57.05);
for (const [t, lat, lng, kind] of [
  ["Burj Khalifa", 25.19703, 55.27413], ["Burj Al Arab", 25.14133, 55.18540], ["Atlantis The Palm", 25.13045, 55.11713],
  ["The Dubai Mall", 25.19704, 55.27895], ["Mall of the Emirates", 25.11798, 55.20038], ["Dubai Frame", 25.23546, 55.30037],
  ["Museum of the Future", 25.21915, 55.28187], ["Ain Dubai", 25.08005, 55.12379], ["Dubai Opera", 25.19566, 55.27195],
  ["Al Fahidi", 25.26423, 55.30017], ["Expo City", 24.96349, 55.14608],
  ["Sheikh Zayed Grand Mosque", 24.41245, 54.47427], ["Louvre Abu Dhabi", 24.53368, 54.39861], ["Emirates Palace", 24.46239, 54.31747],
  ["Qasr Al Watan", 24.46259, 54.30683], ["Yas Marina Circuit", 24.47185, 54.60580], ["Ferrari World", 24.48407, 54.60989],
  ["Etihad Towers", 24.45860, 54.32179], ["Al Noor Mosque", 25.33482, 55.38715], ["Jebel Jais", 25.94, 56.15],
  ["Fujairah Fort", 25.13858, 56.33714], ["Jebel Hafeet", 24.05796, 55.78086],
  ["DXB", 25.25154, 55.36665, "airport"], ["DWC", 24.90915, 55.17178, "airport"], ["AUH", 24.44093, 54.63773, "airport"],
  ["SHJ", 25.32850, 55.51720, "airport"], ["RKT", 25.61296, 55.93968, "airport"],
]) place(t, kind ?? "landmark", lat, lng);

// Thin out: one shield per road every ~12 km; island names from a list (OSM names every islet of
// The World after a city, and some only in Arabic).
const ISLANDS = {
  "Palm Jumeirah": "", "Jumeirah Bay Island": "", "Naia Island": "", "Deira Island": "Dubai Islands", "Saadiyat Island": "",
  "Al Reem Island": "", "Al Maryah Island": "", "Yas Island": "", "Hudariyat Island": "", "Al Lulu Island": "", "Al Jubail Island": "",
  "Sir Bani Yas": "Sir Bani Yas Island", "Dalma Island": "", "Das Island": "", "Sir Bu Nair Island": "", "Al Majaz Island": "",
  "جزيرة المرجان": "Al Marjan Island", "Abu Al Abyad Island": "",
};
const spaced = (list, kind, spacing) => {
  const kept = [];
  for (const l of list) {
    if (l.k !== kind) continue;
    if (!kept.some((k) => k.t === l.t && dist([k.x, k.y], [l.x, l.y]) < metres(spacing))) kept.push(l);
  }
  return kept;
};
const dedupe = (list) => { const s = new Set(); return list.filter((l) => { const k = `${l.k}/${l.t}`; if (s.has(k)) return false; s.add(k); return true; }); };
pack.labels = [
  ...pack.labels.filter((l) => !["shield", "island", "suburb", "town"].includes(l.k)),
  ...spaced(pack.labels, "shield", 12000),
  ...dedupe(pack.labels.filter((l) => l.k === "island" && ISLANDS[l.t] !== undefined).map((l) => ({ ...l, t: ISLANDS[l.t] || l.t }))),
  ...dedupe(pack.labels.filter((l) => (l.k === "suburb" || l.k === "town") && l.t)),
];

const json = JSON.stringify(pack);
fs.writeFileSync(OUT, json);
const kb = (o) => `${Math.round(JSON.stringify(o).length / 1024)} KB`;
console.log(`wrote ${path.relative(root, OUT)}: ${Math.round(json.length / 1024)} KB`);
console.log(`  water ${kb(pack.water)}, roads ${kb(pack.roads)}, cities ${kb(pack.cities)}, streets ${kb(pack.streets)}, buildings ${kb(pack.buildings)} (${pack.buildings.length}),`);
for (const c of pack.cities) console.log(`  ${c.name}: water ${kb(c.water)}, green ${kb(c.green)}, ` + Object.entries(c.roads).map(([k, v]) => `${k} ${kb(v)}`).join(", "));
for (const [l, r] of Object.entries(pack.roads)) console.log(`  roads ${l}: ` + Object.entries(r).map(([k, v]) => `${k} ${kb(v)}`).join(", "));
console.log(`  water lo ${kb(pack.water.lo)}, mid ${kb(pack.water.mid)}; streets ` + Object.entries(pack.streets).map(([k, v]) => `${k} ${kb(v)}`).join(", "));
const kinds = {};
for (const l of pack.labels) kinds[l.k] = (kinds[l.k] ?? 0) + 1;
console.log("  labels", JSON.stringify(kinds));
console.log(`  borders ${kb(pack.borders)}, runways ${kb(pack.runways)}, labels ${kb(pack.labels)} (${pack.labels.length}), road names ${kb(pack.roadNames)}`);
