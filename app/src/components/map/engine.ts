/**
 * The website's 3D map engine: draws the offline UAE map (uae.json, built from OpenStreetMap by
 * scripts/build-uae-map.mjs) on a canvas, with perspective tilt, rotation and extruded buildings.
 * Coordinates are Web Mercator "world units" (0..1). No tiles, no network, no workers — it runs
 * anywhere, including the self-contained demo page.
 */
import raw from "./uae.json";

export type Box = [number, number, number, number];
interface Line { c: Float64Array; b: Box }
interface Poly { rings: Float64Array[]; b: Box }
interface Building { ring: Float64Array; h: number; b: Box; x: number; y: number }
export type LabelKind = "sea" | "emirate" | "city" | "town" | "village" | "island" | "suburb" | "landmark" | "airport" | "shield";
interface Label { t: string; k: LabelKind; x: number; y: number; r: number }
interface RoadName { t: string; c: string; line: Line }
type Roads = Record<string, Line[]>;
interface City { box: Box; water: Poly[]; green: Poly[]; roads: Roads }

interface Pack {
  bbox: Box;
  region: { box: Box; water: Poly[] };
  water: { lo: Poly[]; mid: Poly[] };
  roads: { lo: Roads; mid: Roads };
  cities: City[];
  streets: Roads;
  buildings: Building[];
  borders: { l: number; line: Line }[];
  runways: Line[];
  labels: Label[];
  roadNames: RoadName[];
}

// ---- Decoding ---------------------------------------------------------------------------------

interface RawPack {
  q: number;
  bbox: number[];
  region: { box: number[]; water: string[][] };
  water: { lo: string[][]; mid: string[][] };
  roads: { lo: Record<string, string[]>; mid: Record<string, string[]> };
  cities: { box: number[]; water: string[][]; green: string[][]; roads: Record<string, string[]> }[];
  streets: Record<string, string[]>;
  buildings: { h: number; g: string }[];
  borders: { l: number; g: string }[];
  runways: string[];
  labels: Label[];
  roadNames: { t: string; c: string; g: string }[];
}

const B64 = new Int16Array(128).fill(-1);
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("").forEach((ch, i) => (B64[ch.charCodeAt(0)] = i));

function bytes(s: string): Uint8Array {
  const out = new Uint8Array(Math.floor((s.length * 3) / 4));
  let n = 0;
  for (let i = 0; i < s.length; i += 4) {
    const a = B64[s.charCodeAt(i)]!, b = B64[s.charCodeAt(i + 1)]!, c = B64[s.charCodeAt(i + 2)] ?? -1, d = B64[s.charCodeAt(i + 3)] ?? -1;
    out[n++] = (a << 2) | (b >> 4);
    if (c >= 0) out[n++] = ((b & 15) << 4) | (c >> 2);
    if (d >= 0) out[n++] = ((c & 3) << 6) | d;
  }
  return out.subarray(0, n);
}

/** Inverse of the build script's encode(): base64 → varints → deltas → world coordinates. */
function decode(s: string, q: number): Float64Array {
  const b = bytes(s);
  const vals: number[] = [];
  for (let i = 0; i < b.length; ) {
    let v = 0, mul = 1, byte: number;
    do {
      byte = b[i++]!;
      v += (byte & 127) * mul;
      mul *= 128;
    } while (byte & 128);
    vals.push(v % 2 ? -(v + 1) / 2 : v / 2);
  }
  const out = new Float64Array(vals.length);
  let x = 0, y = 0;
  for (let i = 0; i < vals.length; i += 2) {
    x += vals[i]!;
    y += vals[i + 1]!;
    out[i] = x / q;
    out[i + 1] = y / q;
  }
  return out;
}

function bboxOf(c: Float64Array): Box {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < c.length; i += 2) {
    const x = c[i]!, y = c[i + 1]!;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

let decoded: Pack | null = null;
/** The UAE map, decoded once on first use. */
export function uae(): Pack {
  if (decoded) return decoded;
  const r = raw as unknown as RawPack;
  const q = r.q;
  const line = (g: string): Line => {
    const c = decode(g, q);
    return { c, b: bboxOf(c) };
  };
  const polys = (list: string[][]): Poly[] =>
    list.map((rings) => {
      const rs = rings.map((g) => decode(g, q));
      return { rings: rs, b: bboxOf(rs[0]!) };
    });
  const roads = (rec: Record<string, string[]>): Roads => Object.fromEntries(Object.entries(rec).map(([k, v]) => [k, v.map(line)]));
  const box = (b: number[]) => b.map((v) => v / q) as Box;
  decoded = {
    bbox: box(r.bbox),
    region: { box: box(r.region.box), water: polys(r.region.water) },
    water: { lo: polys(r.water.lo), mid: polys(r.water.mid) },
    roads: { lo: roads(r.roads.lo), mid: roads(r.roads.mid) },
    cities: r.cities.map((c) => ({ box: box(c.box), water: polys(c.water), green: polys(c.green), roads: roads(c.roads) })),
    streets: roads(r.streets),
    buildings: r.buildings.map((bd) => {
      const ring = decode(bd.g, q);
      const b = bboxOf(ring);
      return { ring, h: bd.h, b, x: (b[0] + b[2]) / 2, y: (b[1] + b[3]) / 2 };
    }),
    borders: r.borders.map((bd) => ({ l: bd.l, line: line(bd.g) })),
    runways: r.runways.map(line),
    labels: r.labels.map((l) => ({ ...l, x: l.x / q, y: l.y / q })),
    roadNames: r.roadNames.map((n) => ({ t: n.t, c: n.c, line: line(n.g) })),
  };
  return decoded;
}

// ---- Projection -------------------------------------------------------------------------------

export const lngToX = (lng: number) => (lng + 180) / 360;
export const latToY = (lat: number) => {
  const r = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2;
};
export const xToLng = (x: number) => x * 360 - 180;
export const yToLat = (y: number) => (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;

/** Where the camera is: centre (world units), zoom (256 px tiles), bearing and pitch in degrees. */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export const MAX_PITCH = 60;

/** A camera fixed to a canvas size: projects world points (with a height in metres) to the screen and back. */
export class View {
  readonly s: number; // px per world unit
  readonly f: number; // focal length, px
  readonly cB: number;
  readonly sB: number;
  readonly cP: number;
  readonly sP: number;
  readonly cx: number; // projection centre on screen
  readonly cy: number;
  readonly mPx: number; // px per metre at the centre
  readonly nearR: number; // ground points further toward the camera than this are clipped

  constructor(readonly cam: Camera, readonly w: number, readonly h: number, offsetY = 0) {
    this.s = 256 * 2 ** cam.zoom;
    this.f = 1.5 * h;
    const b = (cam.bearing * Math.PI) / 180;
    const p = (Math.min(MAX_PITCH, Math.max(0, cam.pitch)) * Math.PI) / 180;
    this.cB = Math.cos(b);
    this.sB = Math.sin(b);
    this.cP = Math.cos(p);
    this.sP = Math.sin(p);
    this.cx = w / 2;
    this.cy = h / 2 + offsetY;
    const lat = (Math.atan(Math.sinh(Math.PI * (1 - 2 * cam.y))) * 180) / Math.PI;
    this.mPx = this.s / (40075016.686 * Math.cos((lat * Math.PI) / 180));
    this.nearR = this.sP > 0.01 ? (this.f * 0.85) / this.sP : Infinity;
  }

  /** Rotated ground coordinates (px from the centre, y toward the viewer). */
  ground(x: number, y: number): [number, number] {
    const dx = (x - this.cam.x) * this.s;
    const dy = (y - this.cam.y) * this.s;
    return [dx * this.cB + dy * this.sB, -dx * this.sB + dy * this.cB];
  }

  /** Screen position and depth of a world point at `metres` above the ground. */
  project(x: number, y: number, metres = 0): [number, number, number] {
    const [rx, ry] = this.ground(x, y);
    return this.projectGround(rx, ry, metres * this.mPx);
  }

  projectGround(rx: number, ry: number, hp = 0): [number, number, number] {
    const depth = this.f - ry * this.sP - hp * this.cP;
    return [this.cx + (this.f * rx) / depth, this.cy + (this.f * (ry * this.cP - hp * this.sP)) / depth, depth];
  }

  /** The world point under a screen position, or null above the horizon. */
  unproject(sx: number, sy: number): [number, number] | null {
    const u = (sx - this.cx) / this.f;
    const v = (sy - this.cy) / this.f;
    const den = this.cP + v * this.sP;
    if (den <= 0.02) return null;
    const ry = (v * this.f) / den;
    const rx = u * (this.f - ry * this.sP);
    const dx = rx * this.cB - ry * this.sB;
    const dy = rx * this.sB + ry * this.cB;
    return [this.cam.x + dx / this.s, this.cam.y + dy / this.s];
  }

  /** World-space box the screen can see (generous with a tilted camera). */
  bounds(): Box {
    const pts: [number, number][] = [];
    const steps = [0, 0.5, 1];
    for (const fx of steps) for (const fy of steps) {
      const p = this.unproject(fx * this.w, Math.max(fy * this.h, this.horizonY() + 4));
      if (p) pts.push(p);
    }
    if (!pts.length) return [this.cam.x, this.cam.y, this.cam.x, this.cam.y];
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const pad = 24 / this.s;
    return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad];
  }

  /** Screen y of the horizon (negative = above the top edge). */
  horizonY() {
    return this.sP < 0.01 ? -Infinity : this.cy - (this.f * this.cP) / this.sP;
  }
}

const overlaps = (a: Box, b: Box) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];

// ---- Drawing ----------------------------------------------------------------------------------

export interface Theme {
  land: string;
  water: string;
  coast: string;
  green: string;
  runway: string;
  border: string;
  roads: Record<string, string>;
  rail: string;
  roof: string;
  wall: [number, number, number]; // base rgb of walls, lit by direction
  highlight: string;
  label: string;
  labelMuted: string;
  halo: string;
  fog: string;
}

export const NIGHT: Theme = {
  land: "#1F1F1E",
  water: "#0A0A0B",
  coast: "rgba(244,242,238,0.2)",
  green: "#242723",
  runway: "#2F2E2C",
  border: "rgba(244,242,238,0.32)",
  roads: {
    motorway: "#8E8981",
    trunk: "#726E68",
    primary: "#615E59",
    secondary: "#55524E",
    tertiary: "#4A4844",
    minor: "#3D3C39",
    service: "#353431",
    path: "#3D3C39",
  },
  rail: "rgba(244,242,238,0.28)",
  roof: "#47453F",
  wall: [56, 54, 50],
  highlight: "#F4F2EE",
  label: "rgba(244,242,238,0.92)",
  labelMuted: "rgba(244,242,238,0.5)",
  halo: "rgba(10,10,10,0.85)",
  fog: "11,11,11",
};

/** Road widths in metres (drawn wider when zoomed out so the network stays readable). */
const ROAD_M: Record<string, number> = { motorway: 26, trunk: 20, primary: 16, secondary: 12, tertiary: 10, minor: 7, service: 4.5, path: 3 };
const ROAD_MIN: Record<string, number> = { motorway: 1.6, trunk: 1.3, primary: 1, secondary: 0.8, tertiary: 0.7, minor: 0.6, service: 0.5, path: 0.5 };

/** Scratch buffer for rotated coordinates. */
let scratch = new Float64Array(4096);

/** Adds a ground ring/line to the current path, clipped against the near plane. */
function tracePath(ctx: CanvasRenderingContext2D, v: View, c: Float64Array, closed: boolean) {
  const n = c.length / 2;
  if (scratch.length < c.length + 8) scratch = new Float64Array(c.length * 2 + 8);
  const { cam, s, cB, sB, nearR } = v;
  let anyNear = false;
  for (let i = 0; i < n; i++) {
    const dx = (c[i * 2]! - cam.x) * s, dy = (c[i * 2 + 1]! - cam.y) * s;
    const ry = -dx * sB + dy * cB;
    scratch[i * 2] = dx * cB + dy * sB;
    scratch[i * 2 + 1] = ry;
    if (ry > nearR) anyNear = true;
  }
  const { f, sP, cP, cx, cy } = v;
  const proj = (rx: number, ry: number, first: boolean) => {
    const depth = f - ry * sP;
    const x = cx + (f * rx) / depth, y = cy + (f * ry * cP) / depth;
    if (first) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  };
  if (!anyNear) {
    for (let i = 0; i < n; i++) proj(scratch[i * 2]!, scratch[i * 2 + 1]!, i === 0);
    if (closed) ctx.closePath();
    return;
  }
  // Part of it is behind the camera: clip to ry <= nearR.
  const cut = (i: number, j: number): [number, number] => {
    const ax = scratch[i * 2]!, ay = scratch[i * 2 + 1]!, bx = scratch[j * 2]!, by = scratch[j * 2 + 1]!;
    const t = (nearR - ay) / (by - ay);
    return [ax + t * (bx - ax), nearR];
  };
  const isIn = (i: number) => scratch[i * 2 + 1]! <= nearR;
  if (closed) {
    // Sutherland–Hodgman against one edge.
    let first = true;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      if (isIn(i)) {
        proj(scratch[i * 2]!, scratch[i * 2 + 1]!, first);
        first = false;
      }
      if (isIn(i) !== isIn(j)) {
        const [x, y] = cut(i, j);
        proj(x, y, first);
        first = false;
      }
    }
    if (!first) ctx.closePath();
    return;
  }
  let pen = false;
  for (let i = 0; i + 1 < n; i++) {
    const aIn = isIn(i), bIn = isIn(i + 1);
    if (aIn && bIn) {
      if (!pen) proj(scratch[i * 2]!, scratch[i * 2 + 1]!, true);
      proj(scratch[i * 2 + 2]!, scratch[i * 2 + 3]!, false);
      pen = true;
    } else if (aIn) {
      if (!pen) proj(scratch[i * 2]!, scratch[i * 2 + 1]!, true);
      const [x, y] = cut(i, i + 1);
      proj(x, y, false);
      pen = false;
    } else if (bIn) {
      const [x, y] = cut(i, i + 1);
      proj(x, y, true);
      proj(scratch[i * 2 + 2]!, scratch[i * 2 + 3]!, false);
      pen = true;
    } else pen = false;
  }
}

function fillPolys(ctx: CanvasRenderingContext2D, v: View, polys: Poly[], view: Box, color: string, stroke?: string) {
  ctx.beginPath();
  let any = false;
  for (const p of polys) {
    if (!overlaps(p.b, view)) continue;
    for (const r of p.rings) tracePath(ctx, v, r, true);
    any = true;
  }
  if (!any) return;
  ctx.fillStyle = color;
  ctx.fill("evenodd");
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function strokeLines(ctx: CanvasRenderingContext2D, v: View, lines: Line[] | undefined, view: Box, color: string, width: number, dash?: number[]) {
  if (!lines?.length) return;
  ctx.beginPath();
  let any = false;
  for (const l of lines) {
    if (!overlaps(l.b, view)) continue;
    tracePath(ctx, v, l.c, false);
    any = true;
  }
  if (!any) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash ?? []);
  ctx.stroke();
  ctx.setLineDash([]);
}

function roadWidth(v: View, cls: string) {
  return Math.max(ROAD_MIN[cls] ?? 0.5, Math.min(40, (ROAD_M[cls] ?? 6) * v.mPx));
}

function drawRoads(ctx: CanvasRenderingContext2D, v: View, roads: Roads, view: Box, theme: Theme, order: string[]) {
  for (const cls of order) {
    if (cls === "rail") continue;
    strokeLines(ctx, v, roads[cls], view, theme.roads[cls] ?? theme.roads.minor!, roadWidth(v, cls));
  }
  if (roads.rail) strokeLines(ctx, v, roads.rail, view, theme.rail, Math.max(1, 3 * v.mPx), [6, 4]);
}

/** Clip the canvas to a world box's footprint on screen (or to everything outside it). */
function clipBox(ctx: CanvasRenderingContext2D, v: View, box: Box, outside: boolean) {
  ctx.beginPath();
  if (outside) ctx.rect(-10, -10, v.w + 20, v.h + 20);
  tracePath(ctx, v, new Float64Array([box[0], box[1], box[2], box[1], box[2], box[3], box[0], box[3]]), true);
  ctx.clip("evenodd");
}

export interface Highlight {
  x: number;
  y: number;
}

/** Ray-casting point-in-polygon on a world ring. */
function inside(ring: Float64Array, x: number, y: number) {
  let hit = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const xi = ring[i]!, yi = ring[i + 1]!, xj = ring[j]!, yj = ring[j + 1]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function distanceToRing(ring: Float64Array, x: number, y: number) {
  let best = Infinity;
  for (let i = 0; i + 3 < ring.length; i += 2) {
    const ax = ring[i]!, ay = ring[i + 1]!, bx = ring[i + 2]!, by = ring[i + 3]!;
    const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
    const t = len ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len)) : 0;
    best = Math.min(best, Math.hypot(ax + t * dx - x, ay + t * dy - y));
  }
  return best;
}

/** The building a pin stands in — the tallest within ~35 m of it — for highlighting. */
export function buildingAt(x: number, y: number): Building | null {
  const pack = uae();
  const near = 35 / 36.3e6;
  let best: Building | null = null, score = -Infinity;
  for (const b of pack.buildings) {
    if (x < b.b[0] - near || x > b.b[2] + near || y < b.b[1] - near || y > b.b[3] + near) continue;
    const d = inside(b.ring, x, y) ? 0 : distanceToRing(b.ring, x, y);
    if (d > near) continue;
    const s = b.h + (d === 0 ? 8 : 0) - (d / near) * 10;
    if (s > score) {
      score = s;
      best = b;
    }
  }
  return best;
}

const SHADES = new Map<Theme, [string, string][]>();

function drawBuildings(ctx: CanvasRenderingContext2D, v: View, view: Box, theme: Theme, highlight: Building | null) {
  const pack = uae();
  const z = v.cam.zoom;
  if (z < 12.2) return;
  const minH = z >= 14.2 ? 0 : z >= 13.4 ? 30 : 90;
  const list: { b: Building; d: number }[] = [];
  for (const b of pack.buildings) {
    if (b.h < minH || !overlaps(b.b, view)) continue;
    const [, ry] = v.ground(b.x, b.y);
    if (ry > v.nearR * 0.8) continue;
    list.push({ b, d: v.f - ry * v.sP });
  }
  list.sort((a, b) => b.d - a.d); // far to near
  const fade = Math.min(1, (z - 12.2) / 0.8);
  ctx.globalAlpha = fade;
  const shades = SHADES.get(theme) ?? SHADES.set(theme, Array.from({ length: 17 }, (_, i) => {
    const k = 0.7 + (i / 16) * 0.6;
    return [`rgb(${theme.wall.map((c) => Math.round(c * k)).join(",")})`, `rgb(${[222, 218, 211].map((c) => Math.round(c * k)).join(",")})`] as [string, string];
  })).get(theme)!;
  // Light from the north-west, fixed to the world: walls change shade as the map turns.
  const lx = -0.7071, ly = -0.7071;
  const base = new Float64Array(512), top = new Float64Array(512), gr = new Float64Array(512);
  for (const { b } of list) {
    const ring = b.ring;
    const n = ring.length / 2 - 1; // closed ring: last point repeats the first
    if (n < 3 || n > 250) continue;
    const hp = b.h * v.mPx;
    const lit = b === highlight;
    let area = 0;
    for (let i = 0; i <= n; i++) {
      const [rx, ry] = v.ground(ring[i * 2]!, ring[i * 2 + 1]!);
      gr[i * 2] = rx;
      gr[i * 2 + 1] = ry;
      const p0 = v.projectGround(rx, ry, 0), p1 = v.projectGround(rx, ry, hp);
      base[i * 2] = p0[0];
      base[i * 2 + 1] = p0[1];
      top[i * 2] = p1[0];
      top[i * 2 + 1] = p1[1];
      if (i > 0) area += (gr[(i - 1) * 2]! * ry - rx * gr[(i - 1) * 2 + 1]!);
    }
    // Off screen? (all corners beyond one edge)
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < n; i++) {
      const xs = [base[i * 2]!, top[i * 2]!], ys = [base[i * 2 + 1]!, top[i * 2 + 1]!];
      for (const xx of xs) { if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; }
      for (const yy of ys) { if (yy < minY) minY = yy; if (yy > maxY) maxY = yy; }
    }
    if (maxX < 0 || minX > v.w || maxY < 0 || minY > v.h) continue;
    const ccw = area > 0;
    const flat = Math.abs(top[1]! - base[1]!) < 1.2 && Math.abs(top[0]! - base[0]!) < 1.2;
    // Walls facing the camera.
    for (let i = 0; i < n && !flat; i++) {
      const ax = gr[i * 2]!, ay = gr[i * 2 + 1]!, bx = gr[i * 2 + 2]!, by = gr[i * 2 + 3]!;
      const ex = bx - ax, ey = by - ay;
      const nx = ccw ? -ey : ey, ny = ccw ? ex : -ex; // outward normal (rotated ground)
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const toCam = nx * -mx + ny * (v.f * v.sP + 1e-6 - my);
      if (toCam <= 0) continue;
      // World-space normal for lighting.
      const wx = nx * v.cB - ny * v.sB, wy = nx * v.sB + ny * v.cB;
      const len = Math.hypot(wx, wy) || 1;
      const light = (wx * lx + wy * ly) / len; // -1 … 1
      ctx.fillStyle = shades[Math.round((light + 1) * 8)]![lit ? 1 : 0];
      ctx.beginPath();
      ctx.moveTo(base[i * 2]!, base[i * 2 + 1]!);
      ctx.lineTo(base[i * 2 + 2]!, base[i * 2 + 3]!);
      ctx.lineTo(top[i * 2 + 2]!, top[i * 2 + 3]!);
      ctx.lineTo(top[i * 2]!, top[i * 2 + 1]!);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    for (let i = 0; i < n; i++) (i ? ctx.lineTo : ctx.moveTo).call(ctx, top[i * 2]!, top[i * 2 + 1]!);
    ctx.closePath();
    ctx.fillStyle = lit ? theme.highlight : theme.roof;
    ctx.fill();
    ctx.strokeStyle = lit ? "rgba(255,255,255,0.9)" : "rgba(244,242,238,0.07)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ---- Labels -----------------------------------------------------------------------------------

export interface Fonts {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
}

interface Placed {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const MAJOR = new Set(["Burj Khalifa", "Burj Al Arab", "Atlantis The Palm", "Sheikh Zayed Grand Mosque", "Louvre Abu Dhabi", "Ain Dubai", "Dubai Frame", "Museum of the Future"]);

function labelRule(l: Label, z: number): { size: number; font: keyof Fonts; upper: boolean; spacing: number; muted: boolean; italic?: boolean } | null {
  switch (l.k) {
    case "sea":
      return z < 10.5 ? { size: 12, font: "medium", upper: true, spacing: 5, muted: true, italic: true } : null;
    case "emirate":
      return z >= 6.3 && z < 9.6 ? { size: 11, font: "semibold", upper: true, spacing: 3.5, muted: true } : null;
    case "city":
      return z >= 6.5 && z < 12.5 ? { size: z < 9 ? 13 : 15, font: "semibold", upper: false, spacing: 0, muted: false } : null;
    case "town":
      return z >= 9 && z < 14 ? { size: 12, font: "medium", upper: false, spacing: 0, muted: false } : null;
    case "village":
      return z >= 11 && z < 14.5 ? { size: 11, font: "regular", upper: false, spacing: 0, muted: true } : null;
    case "island":
      return z >= (l.r <= 12 ? 10 : 12) && z < 15.5 ? { size: 11, font: "medium", upper: false, spacing: 0.3, muted: true, italic: true } : null;
    case "suburb":
      return z >= (l.r <= 11 ? 11.3 : l.r <= 12 ? 12.3 : 13.2) && z < 16 ? { size: 10, font: "semibold", upper: true, spacing: 1.6, muted: true } : null;
    case "landmark":
      return z >= (MAJOR.has(l.t) ? 11.5 : 13) ? { size: 11, font: "semibold", upper: false, spacing: 0, muted: false } : null;
    case "airport":
      return z >= 8.5 && z < 15 ? { size: 10, font: "bold", upper: true, spacing: 1, muted: false } : null;
    case "shield":
      return z >= 9 && z < 14.5 ? { size: 9.5, font: "bold", upper: true, spacing: 0.4, muted: false } : null;
  }
  return null;
}

const widths = new Map<string, number>();
/** measureText is slow; label widths don't change. */
function measure(ctx: CanvasRenderingContext2D, text: string) {
  const key = `${ctx.font}|${(ctx as unknown as { letterSpacing?: string }).letterSpacing ?? ""}|${text}`;
  let w = widths.get(key);
  if (w === undefined) {
    w = ctx.measureText(text).width;
    if (widths.size > 4000) widths.clear();
    widths.set(key, w);
  }
  return w;
}

const PRIORITY: Record<LabelKind, number> = { sea: 0, emirate: 1, city: 2, airport: 3, landmark: 4, town: 5, island: 6, suburb: 7, shield: 8, village: 9 };

function drawLabels(ctx: CanvasRenderingContext2D, v: View, view: Box, theme: Theme, fonts: Fonts, avoid: Placed[], margins: { top: number; bottom: number }) {
  const pack = uae();
  const z = v.cam.zoom;
  const placed: Placed[] = [...avoid];
  const hit = (b: Placed) => placed.some((p) => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
  const items = pack.labels
    .filter((l) => l.x >= view[0] && l.x <= view[2] && l.y >= view[1] && l.y <= view[3])
    .map((l) => ({ l, rule: labelRule(l, z) }))
    .filter((i) => i.rule)
    .sort((a, b) => PRIORITY[a.l.k] - PRIORITY[b.l.k] || a.l.r - b.l.r);
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (const { l, rule } of items) {
    const r = rule!;
    const [sx, sy, depth] = v.project(l.x, l.y);
    if (depth <= 0 || sx < -40 || sx > v.w + 40 || sy < margins.top + 6 || sy > v.h - margins.bottom - 6) continue;
    const text = r.upper ? l.t.toUpperCase() : l.t;
    // Fade labels into the haze near the horizon.
    const far = Math.min(1, Math.max(0.25, (sy - Math.max(0, v.horizonY())) / (v.h * 0.35)));
    ctx.font = `${r.italic ? "italic " : ""}${r.size}px ${fonts[r.font]}, Inter, system-ui, sans-serif`;
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${r.spacing}px`;
    const w = measure(ctx, text);
    const icon = l.k === "landmark";
    const boxW = w + (l.k === "shield" || l.k === "airport" ? 12 : 4) + (icon ? 12 : 0);
    const box = { x0: sx - boxW / 2 - 3, y0: sy - r.size / 2 - 4, x1: sx + boxW / 2 + 3, y1: sy + r.size / 2 + 4 };
    if (hit(box)) continue;
    placed.push(box);
    ctx.globalAlpha = far;
    if (l.k === "shield" || l.k === "airport") {
      const h = r.size + 8;
      ctx.beginPath();
      ctx.roundRect(sx - boxW / 2, sy - h / 2, boxW, h, l.k === "shield" ? 4 : h / 2);
      ctx.fillStyle = l.k === "shield" ? "#262523" : "#0B0B0B";
      ctx.fill();
      ctx.strokeStyle = l.k === "shield" ? "rgba(244,242,238,0.35)" : "rgba(244,242,238,0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = theme.label;
      ctx.fillText(text, sx, sy + 0.5);
    } else {
      const tx = icon ? sx + 6 : sx;
      if (icon) {
        ctx.beginPath();
        ctx.moveTo(sx - boxW / 2 + 4, sy - 4);
        ctx.lineTo(sx - boxW / 2 + 8, sy);
        ctx.lineTo(sx - boxW / 2 + 4, sy + 4);
        ctx.lineTo(sx - boxW / 2, sy);
        ctx.closePath();
        ctx.fillStyle = theme.label;
        ctx.fill();
      }
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.strokeStyle = theme.halo;
      ctx.strokeText(text, tx, sy);
      ctx.fillStyle = r.muted ? theme.labelMuted : theme.label;
      ctx.fillText(text, tx, sy);
    }
  }
  ctx.globalAlpha = 1;
  (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
  if (z >= 14) drawRoadNames(ctx, v, view, theme, fonts, placed, margins);
}

/** Street names along the big roads, set on their straightest stretch. */
function drawRoadNames(ctx: CanvasRenderingContext2D, v: View, view: Box, theme: Theme, fonts: Fonts, placed: Placed[], margins: { top: number; bottom: number }) {
  const pack = uae();
  const done = new Map<string, [number, number][]>();
  ctx.font = `10.5px ${fonts.medium}, Inter, system-ui, sans-serif`;
  for (const rn of pack.roadNames) {
    if (!overlaps(rn.line.b, view)) continue;
    const w = measure(ctx, rn.t) + 16;
    const c = rn.line.c;
    for (let i = 0; i + 3 < c.length; i += 2) {
      const a = v.project(c[i]!, c[i + 1]!), b = v.project(c[i + 2]!, c[i + 3]!);
      if (a[2] <= 0 || b[2] <= 0) continue;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < w) continue;
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      if (mx < 20 || mx > v.w - 20 || my < margins.top + 20 || my > v.h - margins.bottom - 20) continue;
      const prev = done.get(rn.t) ?? [];
      if (prev.some(([px, py]) => Math.hypot(px - mx, py - my) < 260)) continue;
      const box = { x0: mx - w / 2, y0: my - w / 2, x1: mx + w / 2, y1: my + w / 2 };
      const tight = { x0: mx - w / 3, y0: my - 7, x1: mx + w / 3, y1: my + 7 };
      if (placed.some((p) => tight.x0 < p.x1 && tight.x1 > p.x0 && tight.y0 < p.y1 && tight.y1 > p.y0)) continue;
      let angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (angle > Math.PI / 2) angle -= Math.PI;
      if (angle < -Math.PI / 2) angle += Math.PI;
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.lineWidth = 3;
      ctx.strokeStyle = theme.halo;
      ctx.strokeText(rn.t, 0, 0);
      ctx.fillStyle = theme.labelMuted;
      ctx.fillText(rn.t, 0, 0);
      ctx.restore();
      prev.push([mx, my]);
      done.set(rn.t, prev);
      placed.push({ ...tight, x0: Math.min(tight.x0, box.x0 + w / 6), x1: Math.max(tight.x1, box.x1 - w / 6) });
    }
  }
}

// ---- Frame ------------------------------------------------------------------------------------

export interface FrameOptions {
  theme: Theme;
  fonts: Fonts;
  highlight: Building | null;
  /** Screen boxes labels must stay clear of (the pins). */
  avoid: Placed[];
  /** Draw a faint grid outside the UAE, where this map has no data. */
  grid: boolean;
  /** Keep labels out from under overlays at the top and bottom. */
  margins?: { top: number; bottom: number };
}

/** Draws one frame of the map. The canvas context is already scaled for the device pixel ratio. */
export function drawFrame(ctx: CanvasRenderingContext2D, v: View, o: FrameOptions) {
  const t0 = performance.now();
  const pack = uae();
  const { theme } = o;
  const z = v.cam.zoom;
  const view = v.bounds();
  ctx.fillStyle = theme.land;
  ctx.fillRect(0, 0, v.w, v.h);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const inRegion = overlaps(view, pack.region.box);
  if (!inRegion || o.grid) drawGrid(ctx, v, theme);
  if (inRegion) {
    // The wider region, then the UAE at the level of detail for this zoom on top.
    fillPolys(ctx, v, pack.region.water, view, theme.water);
    ctx.save();
    clipBox(ctx, v, pack.bbox, false);
    ctx.fillStyle = theme.land;
    ctx.fillRect(0, 0, v.w, v.h);
    const level = z < 8.6 ? "lo" : "mid";
    const cities = z >= 10.4 ? pack.cities.filter((c) => overlaps(c.box, view)) : [];
    ctx.save();
    for (const c of cities) clipBox(ctx, v, c.box, true);
    fillPolys(ctx, v, pack.water[level], view, theme.water, z >= 9 ? theme.coast : undefined);
    if (z >= 9.5) strokeLines(ctx, v, pack.runways, view, theme.runway, Math.max(1.2, 45 * v.mPx));
    drawRoads(ctx, v, pack.roads[level], view, theme, ["primary", "trunk", "motorway"]);
    ctx.restore();
    for (const c of cities) {
      ctx.save();
      clipBox(ctx, v, c.box, false);
      ctx.fillStyle = theme.land;
      ctx.fillRect(0, 0, v.w, v.h);
      if (z >= 11.5) fillPolys(ctx, v, c.green, view, theme.green);
      fillPolys(ctx, v, c.water, view, theme.water, theme.coast);
      strokeLines(ctx, v, pack.runways, view, theme.runway, Math.max(1.2, 45 * v.mPx));
      const order = z >= 12.5 ? ["tertiary", "secondary", "primary", "trunk", "motorway", "rail"] : z >= 11.2 ? ["secondary", "primary", "trunk", "motorway", "rail"] : ["primary", "trunk", "motorway"];
      if (z >= 13.3) drawRoads(ctx, v, pack.streets, view, theme, z >= 14.6 ? ["service", "path", "minor"] : ["minor"]);
      drawRoads(ctx, v, c.roads, view, theme, order);
      ctx.restore();
    }
    if (z >= 13.3) {
      // Street level outside the two big city areas (Fujairah, Ras Al Khaimah, Al Ain…).
      ctx.save();
      for (const c of pack.cities) clipBox(ctx, v, c.box, true);
      drawRoads(ctx, v, pack.streets, view, theme, z >= 14.6 ? ["service", "path", "minor"] : ["minor"]);
      ctx.restore();
    }
    // Emirate and country borders on land.
    if (z < 13) {
      for (const level of [4, 2]) {
        strokeLines(ctx, v, pack.borders.filter((b) => b.l === level).map((b) => b.line), view, theme.border, level === 2 ? 1.3 : 1, level === 2 ? [7, 3] : [3, 4]);
      }
    }
    const tb = performance.now();
    drawBuildings(ctx, v, view, theme, o.highlight);
    stats.buildings = performance.now() - tb;
    ctx.restore();
  }

  // Haze toward the horizon when tilted.
  if (v.sP > 0.05) {
    const top = Math.max(0, v.horizonY());
    const g = ctx.createLinearGradient(0, top, 0, top + v.h * 0.42);
    g.addColorStop(0, `rgba(${theme.fog},${Math.min(0.92, v.sP * 1.05)})`);
    g.addColorStop(1, `rgba(${theme.fog},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, v.w, v.h);
  }
  const t1 = performance.now();
  drawLabels(ctx, v, view, theme, o.fonts, o.avoid, o.margins ?? { top: 0, bottom: 0 });
  stats.map = t1 - t0;
  stats.labels = performance.now() - t1;
}

/** Last frame's drawing time in ms, for tests and tuning. */
export const stats = { map: 0, labels: 0, buildings: 0 };

/** A faint ground grid, for places this offline map doesn't cover. */
function drawGrid(ctx: CanvasRenderingContext2D, v: View, theme: Theme) {
  const step = 2 ** -Math.round(v.cam.zoom - 2); // ~1/4 of the screen
  const view = v.bounds();
  ctx.beginPath();
  for (let x = Math.floor(view[0] / step) * step; x <= view[2]; x += step) {
    tracePath(ctx, v, new Float64Array([x, view[1], x, view[3]]), false);
  }
  for (let y = Math.floor(view[1] / step) * step; y <= view[3]; y += step) {
    tracePath(ctx, v, new Float64Array([view[0], y, view[2], y]), false);
  }
  ctx.strokeStyle = "rgba(244,242,238,0.06)";
  ctx.lineWidth = 1;
  ctx.stroke();
  void theme;
}

/** True when a point is inside the area this offline map covers in detail. */
export function covered(x: number, y: number) {
  const b = uae().bbox;
  return x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
}

/** A distance for the scale bar that fits in `maxPx`, e.g. "500 m" or "2 km". */
export function scaleBar(v: View, maxPx: number): { px: number; label: string } {
  const metres = maxPx / v.mPx;
  const steps = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
  let m = steps[0]!;
  for (const s of steps) if (s <= metres) m = s;
  return { px: m * v.mPx, label: m >= 1000 ? `${m / 1000} km` : `${m} m` };
}
