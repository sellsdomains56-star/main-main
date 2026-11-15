import * as THREE from 'three';
import { rnd } from './state.js';
import { A } from './assets.js';

/* DOWNTOWN DUBAI — Burj Khalifa plaza.
   The Burj Khalifa footprint and the surrounding landmark outlines are real OpenStreetMap geometry
   (© OpenStreetMap contributors, ODbL), placed at their true relative positions in metres.
   Everything inside the arena is collision-checked; landmarks outside it form the skyline. */

export const HALF = 100;          // arena is 200 x 200 m
export const STEP = 0.5;
const REF = { lat: 25.1955, lon: 55.2760 };          // projection origin
const CENTER = { x: -180, z: -170 };                  // arena centre in that frame (on the Burj Khalifa)

const toLocal = (lon, lat) => [
  (lon - REF.lon) * 111320 * Math.cos((REF.lat * Math.PI) / 180) - CENTER.x,
  -(lat - REF.lat) * 110574 - CENTER.z,
];
const outer = (g) => (g.type === 'Polygon' ? [g.coordinates[0]] : g.type === 'MultiPolygon' ? g.coordinates.map((p) => p[0]) : []);

/* ------------------------------------------------------------ small canvas textures */
function cv(w, h = w) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function ctex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
function glassTex() {
  const c = cv(256), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#9fc0d6'); gr.addColorStop(0.5, '#7aa0bd'); gr.addColorStop(1, '#5d86a6');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) { g.fillStyle = `rgba(255,255,255,${0.06 + Math.random() * 0.12})`; g.fillRect(0, y, 256, 14); }
  g.fillStyle = 'rgba(20,35,50,.32)';
  for (let x = 0; x < 256; x += 16) g.fillRect(x, 0, 2, 256);
  for (let y = 0; y < 256; y += 16) g.fillRect(0, y, 256, 2);
  const t = ctex(c); return t;
}
function barkTex() {
  const c = cv(64, 128), g = c.getContext('2d');
  g.fillStyle = '#7b6a55'; g.fillRect(0, 0, 64, 128);
  for (let y = 0; y < 128; y += 7) { g.fillStyle = `rgba(40,30,20,${0.35 + Math.random() * 0.2})`; g.fillRect(0, y, 64, 2 + Math.random() * 2); }
  return ctex(c);
}
function frondTex() {
  const c = cv(128, 256), g = c.getContext('2d');
  g.clearRect(0, 0, 128, 256);
  g.strokeStyle = '#2f5a24'; g.lineWidth = 3; g.beginPath(); g.moveTo(64, 256); g.lineTo(64, 4); g.stroke();
  for (let y = 6; y < 250; y += 5) {
    const len = 58 * Math.sin(Math.min(1, (250 - y) / 250 + 0.1) * 2.2) * (0.5 + 0.5 * (y / 250) * 0.4 + 0.5 * Math.min(1, (250 - y) / 120));
    for (const s of [-1, 1]) {
      g.strokeStyle = `rgba(${55 + (Math.random() * 25) | 0},${105 + (Math.random() * 40) | 0},45,.95)`; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(64, y); g.lineTo(64 + s * len, y + 14 + len * 0.15); g.stroke();
    }
  }
  return ctex(c);
}

/* ------------------------------------------------------------ world */
export function buildWorld(scene, renderer) {
  const boxes = [];
  const groups = new Map();
  const T = A.tex;

  const pbr = (name, tile, o = {}) => new THREE.MeshStandardMaterial({
    map: T[name].map, normalMap: T[name].normal, normalScale: new THREE.Vector2(o.ns ?? 0.9, o.ns ?? 0.9),
    roughness: o.rough ?? 0.92, metalness: o.metal ?? 0, color: o.color ?? 0xffffff, envMapIntensity: o.env ?? 0.5,
  });
  const glass = glassTex();
  const mats = {
    stone: pbr('large_sandstone_blocks_01', 4, { color: 0xf0e2c8 }),
    plaster: pbr('beige_wall_002', 3, { color: 0xfff1d8 }),
    brick: pbr('white_sandstone_bricks_03', 3, { color: 0xfff6e4 }),
    plaster2: pbr('plastered_wall_04', 3, { color: 0xf3e3c6 }),
    marble: pbr('marble_tiles', 3, { rough: 0.35, env: 0.8 }),
    concrete: pbr('concrete_wall_007', 3, { color: 0xe6e0d6 }),
    asphalt: pbr('asphalt_05', 4, { rough: 0.95 }),
    paving: pbr('rectangular_paving', 3, { color: 0xf2e6d2 }),
    roof: pbr('concrete_wall_007', 4, { color: 0xb9b2a6 }),
    glass: new THREE.MeshStandardMaterial({ map: glass, color: 0xffffff, metalness: 0.85, roughness: 0.18, envMapIntensity: 1.4 }),
    glassDark: new THREE.MeshStandardMaterial({ map: glass, color: 0x6f8aa0, metalness: 0.9, roughness: 0.14, envMapIntensity: 1.5 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x30343a, roughness: 0.45, metalness: 0.8, envMapIntensity: 0.9 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd9ad5a, roughness: 0.3, metalness: 0.95, envMapIntensity: 1.3 }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xfff0c8 }),
    water: new THREE.MeshStandardMaterial({ color: 0x1f8fa8, roughness: 0.04, metalness: 0.2, envMapIntensity: 2.0 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x4f7a34, roughness: 1 }),
    bush: new THREE.MeshStandardMaterial({ color: 0x3b6a2a, roughness: 1 }),
    soil: new THREE.MeshStandardMaterial({ color: 0xb08b5e, roughness: 1 }),
    paint: new THREE.MeshStandardMaterial({ color: 0xe9c24a, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    paintWhite: new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    carWhite: new THREE.MeshStandardMaterial({ color: 0xf0f0ee, roughness: 0.22, metalness: 0.65, envMapIntensity: 1.2 }),
    carBlack: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.2, metalness: 0.7, envMapIntensity: 1.2 }),
    carGold: new THREE.MeshStandardMaterial({ color: 0xc9a24a, roughness: 0.25, metalness: 0.8, envMapIntensity: 1.2 }),
    carGlass: new THREE.MeshStandardMaterial({ color: 0x0c1218, roughness: 0.05, metalness: 0.9, envMapIntensity: 1.6 }),
    tire: new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.9 }),
    trunk: new THREE.MeshStandardMaterial({ map: barkTex(), roughness: 1 }),
    frond: new THREE.MeshStandardMaterial({ map: frondTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8, transparent: false }),
  };

  function group(key) {
    let g = groups.get(key);
    if (!g) { g = { pos: [], nor: [], uv: [], idx: [], n: 0 }; groups.set(key, g); }
    return g;
  }
  function push(key, geom) {
    if (geom.index === null) geom = geom.toNonIndexed ? (() => { const idx = []; for (let i = 0; i < geom.attributes.position.count; i++) idx.push(i); geom.setIndex(idx); return geom; })() : geom;
    const g = group(key), p = geom.attributes.position, n = geom.attributes.normal, u = geom.attributes.uv;
    for (let i = 0; i < p.count; i++) { g.pos.push(p.getX(i), p.getY(i), p.getZ(i)); g.nor.push(n.getX(i), n.getY(i), n.getZ(i)); g.uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); }
    for (let i = 0; i < geom.index.count; i++) g.idx.push(geom.index.getX(i) + g.n);
    g.n += p.count; geom.dispose();
  }
  function box(cx, cz, w, d, h, key, o = {}) {
    const y0 = o.y0 || 0, tile = o.tile || 3, solid = o.solid !== false;
    const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv, ox = rnd(0, 1), oy = rnd(0, 1);
    for (let f = 0; f < 6; f++) {
      const su = f < 2 ? d : w, sv = f < 2 ? h : f < 4 ? d : h;
      for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * su / tile + ox, uv.getY(i) * sv / tile + oy); }
    }
    if (o.ry) geo.rotateY(o.ry);
    geo.translate(cx, y0 + h / 2, cz);
    push(key, geo);
    if (solid) boxes.push({ x0: cx - w / 2, x1: cx + w / 2, y0, y1: y0 + h, z0: cz - d / 2, z1: cz + d / 2 });
  }
  function cyl(cx, cz, r, h, key, o = {}) {
    const g = new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg || 14); g.translate(cx, (o.y0 || 0) + h / 2, cz); push(key, g);
    if (o.solid !== false) boxes.push({ x0: cx - r * 0.85, x1: cx + r * 0.85, y0: o.y0 || 0, y1: (o.y0 || 0) + h, z0: cz - r * 0.85, z1: cz + r * 0.85 });
  }
  const sphere = (cx, cy, cz, r, key) => { const g = new THREE.SphereGeometry(r, 16, 10); g.translate(cx, cy, cz); push(key, g); };
  const free = (x, z, w, d, pad = 0.6) => !boxes.some((b) => x + w / 2 + pad > b.x0 && x - w / 2 - pad < b.x1 && z + d / 2 + pad > b.z0 && z - d / 2 - pad < b.z1 && b.y0 < 2.5);

  /* ---------- wall/building helpers (same grammar as before) ---------- */
  function seg(axis, fixed, a0, a1, y0, y1, t, key) {
    if (a1 - a0 < 0.05 || y1 - y0 < 0.05) return;
    if (axis === 'x') box((a0 + a1) / 2, fixed, a1 - a0, t, y1 - y0, key, { y0, tile: 3 });
    else box(fixed, (a0 + a1) / 2, t, a1 - a0, y1 - y0, key, { y0, tile: 3 });
  }
  function wall(axis, fixed, c0, c1, h, t, ops, key) {
    const list = [...(ops || [])].sort((a, b) => a.at - b.at), mid = (c0 + c1) / 2; let cur = c0;
    for (const o of list) {
      const a = mid + o.at - o.w / 2, b = mid + o.at + o.w / 2;
      seg(axis, fixed, cur, a, 0, h, t, key);
      if (o.kind === 'win') { seg(axis, fixed, a, b, 0, 1.0, t, key); seg(axis, fixed, a, b, 2.3, h, t, key); } else seg(axis, fixed, a, b, 2.7, h, t, key);
      cur = b;
    }
    seg(axis, fixed, cur, c1, 0, h, t, key);
  }
  function building(cx, cz, w, d, h, o) {
    const t = 0.7, key = o.key || 'plaster';
    wall('x', cz - d / 2, cx - w / 2 - t / 2, cx + w / 2 + t / 2, h, t, o.n, key);
    wall('x', cz + d / 2, cx - w / 2 - t / 2, cx + w / 2 + t / 2, h, t, o.s, key);
    wall('z', cx - w / 2, cz - d / 2 + t / 2, cz + d / 2 - t / 2, h, t, o.w, key);
    wall('z', cx + w / 2, cz - d / 2 + t / 2, cz + d / 2 - t / 2, h, t, o.e, key);
    if (o.roof !== false) {
      box(cx, cz, w + 1.2, d + 1.2, 0.45, 'roof', { y0: h, tile: 4 });
      box(cx, cz - d / 2 - 0.3, w + 1.4, 0.35, 0.7, key, { y0: h + 0.45, tile: 3, solid: false });
      box(cx, cz + d / 2 + 0.3, w + 1.4, 0.35, 0.7, key, { y0: h + 0.45, tile: 3, solid: false });
      box(cx - w / 2 - 0.3, cz, 0.35, d + 1.4, 0.7, key, { y0: h + 0.45, tile: 3, solid: false });
      box(cx + w / 2 + 0.3, cz, 0.35, d + 1.4, 0.7, key, { y0: h + 0.45, tile: 3, solid: false });
    }
    if (o.tower) { // barjeel wind tower
      const tx = cx + (o.tower.dx || 0), tz = cz + (o.tower.dz || 0);
      box(tx, tz, 2.4, 2.4, 4.2, key, { y0: h + 0.45, tile: 2, solid: false });
      for (let i = 0; i < 4; i++) box(tx, tz, 1.0, 2.5, 1.6, 'metal', { y0: h + 2.6, tile: 1, solid: false });
      box(tx, tz, 2.6, 2.6, 0.3, 'roof', { y0: h + 4.65, tile: 2, solid: false });
    }
  }
  const D = (at, w = 3.2) => ({ at, w, kind: 'door' });
  const W = (at, w = 2.4) => ({ at, w, kind: 'win' });

  /* ---------- polygon tools ---------- */
  function extrude(pts, y0, y1, key, uvTile = 8) {
    const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1])));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2); geo.translate(0, y0, 0);
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / uvTile, uv.getY(i) / uvTile);
    push(key, geo);
  }
  function polyBoxes(pts, h, cell = 1.4) {
    const z0 = Math.max(-HALF, Math.min(...pts.map((p) => p[1]))), z1 = Math.min(HALF, Math.max(...pts.map((p) => p[1])));
    let prev = [];
    const out = [];
    for (let z = z0; z < z1; z += cell) {
      const zc = z + cell / 2, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= zc && b[1] > zc) || (b[1] <= zc && a[1] > zc)) xs.push(a[0] + ((zc - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
      xs.sort((p, q) => p - q);
      const spans = [];
      for (let i = 0; i + 1 < xs.length; i += 2) { const xa = Math.max(-HALF, xs[i]), xb = Math.min(HALF, xs[i + 1]); if (xb - xa > 0.2) spans.push([xa, xb]); }
      const next = [];
      for (const s of spans) {
        const m = prev.find((q) => Math.abs(q.x0 - s[0]) < 0.35 && Math.abs(q.x1 - s[1]) < 0.35 && !q.used);
        if (m) { m.z1 = z + cell; m.used = true; next.push(m); } else { const nb = { x0: s[0], x1: s[1], z0: z, z1: z + cell, y0: 0, y1: h, used: true }; out.push(nb); next.push(nb); }
      }
      for (const n of next) n.used = false;
      prev = next;
    }
    for (const b of out) { delete b.used; boxes.push(b); }
  }
  const scaleAbout = (pts, s) => { let cx = 0, cz = 0; for (const p of pts) { cx += p[0]; cz += p[1]; } cx /= pts.length; cz /= pts.length; return pts.map((p) => [cx + (p[0] - cx) * s, cz + (p[1] - cz) * s]); };

  const LM = A.landmarks;
  const ring = (name) => (LM[name] ? outer(LM[name].geo).map((r) => r.map((c) => toLocal(c[0], c[1]))) : []);

  /* ---------- THE BURJ KHALIFA (real footprint) ---------- */
  const burj = ring('Burj Khalifa Dubai')[0];
  polyBoxes(burj, 40);
  const tiers = [[0, 45, 1.0], [45, 110, 0.94], [110, 190, 0.85], [190, 290, 0.75], [290, 400, 0.65], [400, 510, 0.54], [510, 620, 0.43], [620, 710, 0.32], [710, 770, 0.2]];
  for (const [a, b, s] of tiers) extrude(s === 1 ? burj : scaleAbout(burj, s), a, b, 'glass', 40);
  { let cx = 0, cz = 0; for (const p of burj) { cx += p[0]; cz += p[1]; } cx /= burj.length; cz /= burj.length; cyl(cx, cz, 2.6, 60, 'metal', { r2: 0.25, y0: 768, solid: false, seg: 10 }); }
  // podium band + gold trim at the base so the plaza level has detail
  extrude(scaleAbout(burj, 1.02), 0, 3.2, 'stone', 4);
  extrude(scaleAbout(burj, 1.03), 3.2, 3.6, 'gold', 4);

  /* ---------- skyline: real outlines of neighbouring landmarks ---------- */
  const sky = [['The Address Downtown Dubai', 302, 'glass'], ['Boulevard Plaza Dubai', 263, 'glass'], ['The Lofts Downtown Dubai', 150, 'glassDark'], ['Vida Downtown Dubai', 95, 'glass'],
    ['Burj Views Dubai', 210, 'glassDark'], ['Palace Downtown Dubai', 42, 'stone'], ['Souk Al Bahar Dubai', 24, 'stone'], ['Dubai Opera', 30, 'brick']];
  for (const [name, h, mat] of sky) for (const r of ring(name)) { extrude(r, 0, h, mat, mat === 'stone' || mat === 'brick' ? 6 : 40); extrude(r, h, h + 0.8, 'roof', 4); }
  // The Dubai Mall: only its west lobe reaches the arena, so give it collision there
  for (const r of ring('The Dubai Mall')) { polyBoxes(r, 26); extrude(r, 0, 26, 'brick', 6); extrude(r, 26, 27, 'roof', 4); }
  for (const r of ring('Burj Park Dubai')) extrude(r, 0, 0.12, 'grass', 8);
  for (const r of ring('Dubai Fountain Dubai')) extrude(r, 0, 0.18, 'water', 8);

  /* ---------- arena boundary ---------- */
  const P = HALF + 1.5;
  for (const [x, z, w, d] of [[0, -P, HALF * 2 + 6, 3], [0, P, HALF * 2 + 6, 3], [-P, 0, 3, HALF * 2 + 6], [P, 0, 3, HALF * 2 + 6]]) {
    box(x, z, w, d, 5.5, 'stone', { tile: 4 });
    box(x, z, w + 0.4, d + 0.4, 0.4, 'gold', { y0: 5.5, tile: 3, solid: false });
  }

  /* ---------- Souk quarter (SW) ---------- */
  building(-62, 56, 24, 15, 6.4, { key: 'plaster', n: [D(-6), W(6)], s: [D(4), W(-7, 2.4)], w: [D(0)], e: [D(-3), W(4)], tower: { dx: -6, dz: 0 } });
  building(-82, 20, 15, 20, 6.0, { key: 'brick', n: [W(0)], s: [D(0)], w: [W(-5), W(5)], e: [D(-4), D(5)], tower: { dx: 0, dz: 5 } });
  building(-36, 78, 18, 12, 6.0, { key: 'plaster2', n: [D(0)], s: [W(0)], w: [D(0)], e: [W(0)], tower: { dx: 4, dz: 0 } });
  building(-35, 40, 13, 13, 5.6, { key: 'brick', n: [D(0)], s: [D(0)], w: [W(0)], e: [W(0)] });
  // arcade (covered walkway) in front of the souk
  for (let i = 0; i < 6; i++) box(-70 + i * 4.2, 33, 0.8, 0.8, 3.6, 'stone', { tile: 2 });
  box(-58.5, 33, 26, 2.6, 0.5, 'roof', { y0: 3.6, tile: 3, solid: false });

  /* ---------- mosque + minaret (NE of arena, west of the mall) ---------- */
  if (free(70, -20, 22, 16)) {
    building(70, -20, 20, 14, 6.6, { key: 'brick', roof: false, n: [W(-5), W(5)], s: [D(0, 4)], w: [D(0)], e: [W(0)] });
    box(70, -20, 21.4, 15.4, 0.5, 'roof', { y0: 6.6, tile: 4, solid: false });
    sphere(70, 8.4, -20, 5.2, 'gold');
    cyl(82.5, -28, 1.3, 24, 'brick', { r2: 1.0 }); sphere(82.5, 25.6, -28, 1.25, 'gold'); cyl(82.5, -28, 0.12, 4, 'gold', { y0: 26.5, solid: false, r2: 0.04 });
  }

  /* ---------- pavilions / majlis (colonnades with shade roofs) ---------- */
  function pavilion(cx, cz, nx, nz, sp, h = 4.2) {
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      if ((i === 0 || i === nx - 1) || (j === 0 || j === nz - 1)) box(cx + (i - (nx - 1) / 2) * sp, cz + (j - (nz - 1) / 2) * sp, 0.7, 0.7, h, 'stone', { tile: 2 });
    }
    box(cx, cz, (nx - 1) * sp + 3, (nz - 1) * sp + 3, 0.4, 'roof', { y0: h, tile: 4, solid: false });
    box(cx, cz, (nx - 1) * sp + 3.6, (nz - 1) * sp + 3.6, 0.2, 'gold', { y0: h + 0.4, tile: 3, solid: false });
  }
  pavilion(40, 62, 5, 3, 5); pavilion(-8, -70, 4, 3, 5);
  box(40, 62, 14, 4, 0.55, 'marble', { y0: 0, tile: 2 });  // raised majlis seating platform

  /* ---------- water features ---------- */
  function pool(cx, cz, w, d) {
    box(cx, cz, w, d, 0.45, 'marble', { tile: 2 });
    const g = new THREE.PlaneGeometry(w - 1.2, d - 1.2); g.rotateX(-Math.PI / 2); g.translate(cx, 0.43, cz); push('water', g);
  }
  pool(-8, 60, 18, 7); pool(60, 30, 14, 14); pool(-60, -76, 16, 6);

  /* ---------- planters, hedges, benches ---------- */
  function planter(cx, cz, w, d) {
    box(cx, cz, w, d, 0.9, 'stone', { tile: 2 });
    box(cx, cz, w - 0.5, d - 0.5, 0.1, 'soil', { y0: 0.9, tile: 3, solid: false });
    for (let i = 0; i < Math.max(2, Math.round(Math.max(w, d) / 1.4)); i++) { const px = cx + (Math.random() - 0.5) * (w - 0.8), pz = cz + (Math.random() - 0.5) * (d - 0.8); sphere(px, 1.25, pz, 0.55 + Math.random() * 0.2, 'bush'); }
  }
  for (const [x, z, w, d] of [[-8, 36, 10, 2.2], [14, 40, 2.2, 10], [-20, -34, 8, 2.2], [24, -40, 2.2, 9], [0, 12, 2.4, 8], [48, 6, 9, 2.2], [-46, -18, 2.2, 9], [30, -66, 10, 2.2], [66, 56, 8, 2.2], [-74, -48, 2.2, 8], [-26, 8, 7, 2.2], [20, -12, 6, 2.2]]) if (free(x, z, w, d)) planter(x, z, w, d);

  /* ---------- Dubai cars (cover) ---------- */
  function car(cx, cz, rot, bodyKey, big = true) {
    const L = big ? 4.9 : 4.4, Wd = 1.95, g = new THREE.Group();
    const parts = [];
    const add = (w, h, d, x, y, z, key) => { const geo = new THREE.BoxGeometry(w, h, d); geo.translate(x, y, z); parts.push([key, geo]); };
    add(L, 0.78, Wd, 0, 0.72, 0, bodyKey);
    add(L * 0.55, 0.62, Wd * 0.92, -L * 0.04, 1.38, 0, bodyKey);
    add(L * 0.5, 0.5, Wd * 0.94, -L * 0.04, 1.4, 0, 'carGlass');
    add(0.12, 0.4, Wd * 0.9, L / 2 - 0.05, 0.9, 0, 'carBlack');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14); w.rotateX(Math.PI / 2); w.translate(sx * L * 0.32, 0.42, sz * (Wd / 2 - 0.05)); parts.push(['tire', w]); }
    for (const [key, geo] of parts) { geo.rotateY(rot); geo.translate(cx, 0, cz); push(key, geo); }
    const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot)), hw = (L * c + Wd * s) / 2, hd = (L * s + Wd * c) / 2;
    boxes.push({ x0: cx - hw, x1: cx + hw, y0: 0.15, y1: 1.95, z0: cz - hd, z1: cz + hd });
  }
  for (const [x, z, r, k] of [[-20, 70, 0, 'carWhite'], [-28, 70, 0.1, 'carBlack'], [18, 78, 0, 'carWhite'], [30, 78, 0, 'carGold'], [-12, -50, Math.PI / 2, 'carWhite'], [10, -52, Math.PI / 2, 'carBlack'], [60, -56, 0, 'carWhite'], [-50, 4, Math.PI / 2, 'carGold'], [52, 82, 0, 'carBlack'], [-66, -20, Math.PI / 2, 'carWhite']])
    if (free(x, z, 5, 2.2, 0.4)) car(x, z, r, k);

  /* ---------- street furniture ---------- */
  for (const [x, z] of [[-40, -30], [-30, 20], [4, -24], [30, -6], [-4, 28], [50, -44], [-56, -62], [36, 40], [-90, 60], [90, 60], [-90, -60], [90, -60], [-5, 90], [5, -90]]) if (free(x, z, 0.6, 0.6)) {
    box(x, z, 0.3, 0.3, 7.5, 'metal', { tile: 2 }); box(x + 0.6, z, 1.4, 0.2, 0.18, 'metal', { y0: 7.4, solid: false, tile: 2 }); box(x + 1.2, z, 0.5, 0.3, 0.12, 'lamp', { y0: 7.28, solid: false, tile: 2 });
  }
  // road markings (south road + central avenue)
  for (let x = -96; x < 96; x += 6) box(x, 88, 3, 0.2, 0.02, 'paintWhite', { solid: false });
  for (let z = -96; z < 96; z += 8) if (free(0, z, 0.3, 2, 0.1)) box(0, z, 0.2, 3, 0.02, 'paint', { solid: false });

  /* ---------- real prop models (CC0, Poly Haven) ---------- */
  const props = [];
  function prop(name, x, z, ry, scale, bw, bd, bh) {
    if (!free(x, z, bw, bd, 0.3)) return;
    const o = A.models[name].scene.clone(true); o.position.set(x, 0, z); o.rotation.y = ry; o.scale.setScalar(scale);
    o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    props.push(o);
    const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
    boxes.push({ x0: x - (bw * c + bd * s) / 2, x1: x + (bw * c + bd * s) / 2, y0: 0, y1: bh, z0: z - (bw * s + bd * c) / 2, z1: z + (bw * s + bd * c) / 2 });
  }
  const barrierLine = [[-30, -12, 0], [-27, -12, 0], [-24, -12, 0], [26, 14, 0], [29, 14, 0], [32, 14, 0], [-6, -22, Math.PI / 2], [-6, -19, Math.PI / 2], [10, 20, Math.PI / 2], [10, 23, Math.PI / 2],
    [-50, 38, Math.PI / 2], [-50, 41, Math.PI / 2], [50, -56, 0], [53, -56, 0], [-44, -44, 0], [-41, -44, 0], [44, 44, 0], [47, 44, 0], [0, 50, 0], [3, 50, 0], [0, -40, 0], [-3, -40, 0], [70, 10, Math.PI / 2], [70, 13, Math.PI / 2], [-70, -30, Math.PI / 2], [-70, -33, Math.PI / 2]];
  for (const [x, z, r] of barrierLine) prop('barrier', x, z, r, 1.0, 1.56, 0.45, 1.1);
  for (const [x, z] of [[-14, -4], [-14.9, -3], [24, -26], [24.9, -27.2], [-40, 66], [-41, 67.2], [50, 70], [49, 68.8], [6, 0], [-58, -56], [76, 40], [-24, 94]]) prop('barrel', x, z, rnd(0, 6), 1.15, 0.65, 0.65, 1.0);
  for (const [x, z, r] of [[-18, 20, 0.3], [-17, 21.2, -0.2], [20, -22, 0.4], [21, -20.8, 0.1], [44, -8, 0], [-52, -10, 1], [60, 66, 0.5], [-4, -60, 0.2], [36, 20, 1.2], [-30, -50, 0.7]]) prop('crate', x, z, r, 1.7, 1.4, 0.8, 0.45);

  /* ---------- palms ---------- */
  const palmSpots = [];
  for (let i = -4; i <= 4; i++) { palmSpots.push([i * 10 + 5, 24], [i * 10 + 5, -30]); }
  for (let i = -3; i <= 3; i++) { palmSpots.push([-20, i * 14], [20, i * 14 + 6], [-88, i * 12], [88, i * 12 + 4]); }
  let palms = 0;
  for (const [px, pz] of palmSpots) {
    if (!free(px, pz, 0.7, 0.7, 0.8) || Math.abs(px) > HALF - 3 || Math.abs(pz) > HALF - 3 || palms > 46) continue;
    palms++;
    const H = rnd(7, 11), lean = rnd(-1, 1), leanA = rnd(0, 6.28), segs = 7;
    let prev = [0, 0, 0];
    for (let s = 0; s < segs; s++) {
      const t0 = s / segs, t1 = (s + 1) / segs;
      const off = (t) => lean * t * t * 2.2;
      const a = [Math.cos(leanA) * off(t0), t0 * H, Math.sin(leanA) * off(t0)], b = [Math.cos(leanA) * off(t1), t1 * H, Math.sin(leanA) * off(t1)];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const g = new THREE.CylinderGeometry(0.2 - t1 * 0.07, 0.2 - t0 * 0.07, len, 7, 1, true);
      const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
      g.translate(px + (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, pz + (a[2] + b[2]) / 2);
      push('trunk', g); prev = b;
    }
    const topX = px + prev[0], topY = prev[1], topZ = pz + prev[2];
    boxes.push({ x0: px - 0.25, x1: px + 0.25, y0: 0, y1: 4, z0: pz - 0.25, z1: pz + 0.25 });
    for (let f = 0; f < 15; f++) {
      const ang = (f / 15) * Math.PI * 2 + rnd(-0.15, 0.15), droop = rnd(0.7, 1.35), L = rnd(2.8, 3.8);
      const verts = [], uvs = [], idx = [], N = 7;
      for (let i = 0; i <= N; i++) {
        const t = i / N, r = L * t, y = Math.sin(t * 2.0) * 0.95 - t * t * droop * 1.7, wdt = 0.55 * Math.sin(Math.min(1, t * 3.2) * 1.4 + 0.2) * (1 - t * 0.55);
        const cx2 = Math.cos(ang) * r, cz2 = Math.sin(ang) * r, sx = -Math.sin(ang) * wdt, sz = Math.cos(ang) * wdt;
        verts.push(topX + cx2 - sx, topY + y, topZ + cz2 - sz, topX + cx2 + sx, topY + y, topZ + cz2 + sz);
        uvs.push(0, t, 1, t);
        if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
      push('frond', g);
    }
  }

  /* ---------- merge to meshes ---------- */
  for (const [key, g] of groups) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(g.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.uv, 2));
    geo.setIndex(g.n > 65535 ? new THREE.Uint32BufferAttribute(g.idx, 1) : new THREE.Uint16BufferAttribute(g.idx, 1));
    if (key === 'stone' || key === 'plaster' || key === 'brick' || key === 'plaster2' || key === 'marble' || key === 'concrete' || key === 'roof' || key === 'asphalt' || key === 'paving') geo.computeTangents && 0;
    geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mats[key]);
    m.castShadow = !['lamp', 'paint', 'paintWhite', 'water', 'grass'].includes(key);
    m.receiveShadow = key !== 'lamp';
    scene.add(m);
  }
  for (const o of props) scene.add(o);

  /* ---------- ground ---------- */
  const mkGround = (name, size, tile, y, color) => {
    const t = A.tex[name], m = new THREE.MeshStandardMaterial({ map: t.map.clone(), normalMap: t.normal.clone(), roughness: 0.95, color, envMapIntensity: 0.4 });
    for (const k of ['map', 'normalMap']) { m[k].repeat.set(size / tile, size / tile); m[k].needsUpdate = true; }
    const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m); g.rotation.x = -Math.PI / 2; g.position.y = y; g.receiveShadow = true; scene.add(g); return g;
  };
  mkGround('dense_sand', 3200, 8, -0.06, 0xe6cfa0);
  mkGround('rectangular_paving', HALF * 2 + 40, 3.2, 0, 0xf4e8d4);
  { // asphalt strip (south road) + curb
    const t = A.tex.asphalt_05, m = new THREE.MeshStandardMaterial({ map: t.map.clone(), normalMap: t.normal.clone(), roughness: 0.95, envMapIntensity: 0.4 });
    for (const k of ['map', 'normalMap']) { m[k].repeat.set(HALF * 2 / 4, 4); m[k].needsUpdate = true; }
    const r = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 16), m); r.rotation.x = -Math.PI / 2; r.position.set(0, 0.015, 88); r.receiveShadow = true; scene.add(r);
  }

  /* ---------- sky, sun, far skyline ---------- */
  const skyT = (() => {
    const c = cv(1024, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#2f6ab8'); gr.addColorStop(0.3, '#5e97d2'); gr.addColorStop(0.43, '#a9c6dc'); gr.addColorStop(0.5, '#ecdcc0'); gr.addColorStop(0.52, '#e8d3b0'); gr.addColorStop(1, '#cdb48f');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 70; i++) { const x = rnd(0, 1024), y = rnd(100, 215), rx = rnd(40, 150), ry = rnd(4, 12), cg = g.createRadialGradient(x, y, 0, x, y, rx); cg.addColorStop(0, 'rgba(255,255,255,.28)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = cg; g.fillRect(x - rx, y - rx, rx * 2, rx * 2); g.restore(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.mapping = THREE.EquirectangularReflectionMapping; return t;
  })();
  const skyMesh = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
  skyMesh.renderOrder = -10; scene.add(skyMesh);
  const az = 2.2, el = 0.62;
  const sunDir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  const glowC = cv(128), gg = glowC.getContext('2d'), grd = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,250,235,1)'); grd.addColorStop(0.15, 'rgba(255,235,190,.85)'); grd.addColorStop(0.5, 'rgba(255,210,150,.2)'); grd.addColorStop(1, 'rgba(255,200,130,0)');
  gg.fillStyle = grd; gg.fillRect(0, 0, 128, 128);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowC), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
  glow.position.copy(sunDir).multiplyScalar(1300); glow.scale.set(700, 700, 1); scene.add(glow);
  // ring of generic towers far away so the horizon feels like a city
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2 + rnd(-0.04, 0.04), r = rnd(380, 900), w = rnd(24, 60), d = rnd(24, 60), h = rnd(40, 220);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats[Math.random() < 0.6 ? 'glass' : 'glassDark']);
    m.position.set(Math.cos(a) * r, h / 2 - 2, Math.sin(a) * r); m.rotation.y = rnd(0, 1.6);
    const uv = m.geometry.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * w / 50, uv.getY(k) * h / 50);
    scene.add(m);
  }

  /* ---------- navigation grid ---------- */
  const CELL = 1.5, N = Math.ceil((HALF * 2) / CELL), blocked = new Uint8Array(N * N), INFL = 0.6;
  for (const b of boxes) {
    if (!(b.y0 < 1.8 && b.y1 > 0.45)) continue;
    const i0 = Math.max(0, Math.floor((b.x0 - INFL + HALF) / CELL)), i1 = Math.min(N - 1, Math.floor((b.x1 + INFL + HALF) / CELL));
    const j0 = Math.max(0, Math.floor((b.z0 - INFL + HALF) / CELL)), j1 = Math.min(N - 1, Math.floor((b.z1 + INFL + HALF) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const cx = -HALF + (i + 0.5) * CELL, cz = -HALF + (j + 0.5) * CELL;
      if (cx > b.x0 - INFL && cx < b.x1 + INFL && cz > b.z0 - INFL && cz < b.z1 + INFL) blocked[j * N + i] = 1;
    }
  }
  for (let k = 0; k < N; k++) { blocked[k] = 1; blocked[(N - 1) * N + k] = 1; blocked[k * N] = 1; blocked[k * N + N - 1] = 1; }
  const cellI = (x) => Math.max(0, Math.min(N - 1, Math.floor((x + HALF) / CELL)));
  const isBlocked = (x, z) => blocked[cellI(z) * N + cellI(x)] === 1;
  function nearestFree(i, j) {
    if (!blocked[j * N + i]) return [i, j];
    for (let r = 1; r < 16; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
      const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue;
      if (!blocked[jj * N + ii]) return [ii, jj];
    }
    return null;
  }
  function walkable(x0, z0, x1, z1) {
    const dx = x1 - x0, dz = z1 - z0, n = Math.ceil(Math.hypot(dx, dz) / 0.5);
    for (let k = 1; k <= n; k++) if (isBlocked(x0 + (dx * k) / n, z0 + (dz * k) / n)) return false;
    return true;
  }
  const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [-1, 1, 1.4142], [1, -1, 1.4142], [-1, -1, 1.4142]];
  const TOT = N * N, gS = new Float32Array(TOT), cameS = new Int32Array(TOT), closedS = new Uint8Array(TOT);
  const HCAP = TOT * 9, hF = new Float32Array(HCAP), hI = new Int32Array(HCAP);
  function findPath(sx, sz, ex, ez) {
    const s = nearestFree(cellI(sx), cellI(sz)), e = nearestFree(cellI(ex), cellI(ez));
    if (!s || !e) return [];
    gS.fill(1e9); cameS.fill(-1); closedS.fill(0);
    let hn = 0;
    const hpush = (f, i) => { let c = hn++; while (c > 0) { const p = (c - 1) >> 1; if (hF[p] <= f) break; hF[c] = hF[p]; hI[c] = hI[p]; c = p; } hF[c] = f; hI[c] = i; };
    const hpop = () => { const top = hI[0]; hn--; if (hn > 0) { const f = hF[hn], i = hI[hn]; let c = 0; for (;;) { const l = c * 2 + 1; if (l >= hn) break; const r = l + 1, m = r < hn && hF[r] < hF[l] ? r : l; if (hF[m] >= f) break; hF[c] = hF[m]; hI[c] = hI[m]; c = m; } hF[c] = f; hI[c] = i; } return top; };
    const si = s[1] * N + s[0], ei = e[1] * N + e[0], e0 = e[0], e1 = e[1];
    const hh = (i) => { const dx = Math.abs((i % N) - e0), dz = Math.abs(((i / N) | 0) - e1); return dx + dz - 0.5858 * Math.min(dx, dz); };
    gS[si] = 0; hpush(hh(si), si);
    let found = false, guard = 0;
    while (hn > 0 && guard++ < 20000) {
      const cur = hpop(); if (closedS[cur]) continue; closedS[cur] = 1;
      if (cur === ei) { found = true; break; }
      const ci = cur % N, cj = (cur / N) | 0;
      for (let k = 0; k < 8; k++) {
        const nb = NB[k], di = nb[0], dj = nb[1], ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
        const nI = nj * N + ni; if (blocked[nI] || closedS[nI]) continue;
        if (di !== 0 && dj !== 0 && (blocked[cj * N + ni] || blocked[nj * N + ci])) continue;
        const ng = gS[cur] + nb[2]; if (ng < gS[nI]) { gS[nI] = ng; cameS[nI] = cur; hpush(ng + hh(nI), nI); }
      }
    }
    if (!found) return [];
    const cells = []; for (let c = ei; c !== -1; c = cameS[c]) cells.push(c); cells.reverse();
    const pts = cells.map((c) => ({ x: -HALF + ((c % N) + 0.5) * CELL, z: -HALF + (((c / N) | 0) + 0.5) * CELL }));
    const out = []; let anchor = { x: sx, z: sz }, k = 0;
    while (k < pts.length) { let far = k; for (let m = Math.min(pts.length - 1, k + 40); m > k; m--) if (walkable(anchor.x, anchor.z, pts[m].x, pts[m].z)) { far = m; break; } out.push(pts[far]); anchor = pts[far]; k = far + 1; }
    return out;
  }
  function randomFreePoint(x0 = -HALF + 3, x1 = HALF - 3, z0 = -HALF + 3, z1 = HALF - 3) {
    for (let i = 0; i < 80; i++) { const x = rnd(x0, x1), z = rnd(z0, z1); if (!isBlocked(x, z)) return { x, z }; }
    return { x: 0, z: 90 };
  }

  /* ---------- physics ---------- */
  function groundHeight(x, z, r, feet) {
    let gy = 0;
    for (let i = 0; i < boxes.length; i++) { const b = boxes[i]; if (x + r > b.x0 && x - r < b.x1 && z + r > b.z0 && z - r < b.z1 && b.y1 <= feet + STEP + 0.001 && b.y1 > gy) gy = b.y1; }
    return gy;
  }
  function resolveCircle(p, r, feet, h) {
    let hit = false;
    for (let pass = 0; pass < 3; pass++) for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (b.y1 <= feet + STEP || b.y0 >= feet + h) continue;
      if (p.x < b.x0 - r || p.x > b.x1 + r || p.z < b.z0 - r || p.z > b.z1 + r) continue;
      const cx = p.x < b.x0 ? b.x0 : p.x > b.x1 ? b.x1 : p.x, cz = p.z < b.z0 ? b.z0 : p.z > b.z1 ? b.z1 : p.z;
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      hit = true;
      if (d2 > 1e-8) { const d = Math.sqrt(d2), push = r - d; p.x += (dx / d) * push; p.z += (dz / d) * push; }
      else { const l = p.x - b.x0, rr = b.x1 - p.x, t = p.z - b.z0, bt = b.z1 - p.z, m = Math.min(l, rr, t, bt); if (m === l) p.x = b.x0 - r; else if (m === rr) p.x = b.x1 + r; else if (m === t) p.z = b.z0 - r; else p.z = b.z1 + r; }
    }
    return hit;
  }
  const nrm = { x: 0, y: 0, z: 0 };
  function rayWorld(ox, oy, oz, dx, dy, dz, maxT) {
    let best = maxT, bn = -1, bs = 0; const eps = 1e-12;
    const ex = ox + dx * maxT, ez = oz + dz * maxT, minx = Math.min(ox, ex), maxx = Math.max(ox, ex), minz = Math.min(oz, ez), maxz = Math.max(oz, ez);
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (b.x1 < minx || b.x0 > maxx || b.z1 < minz || b.z0 > maxz) continue;
      let tn = -Infinity, tf = Infinity, axis = -1, sgn = 0;
      if (Math.abs(dx) < eps) { if (ox < b.x0 || ox > b.x1) continue; } else { let t1 = (b.x0 - ox) / dx, t2 = (b.x1 - ox) / dx, s = -1; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; } if (t1 > tn) { tn = t1; axis = 0; sgn = s; } if (t2 < tf) tf = t2; }
      if (Math.abs(dy) < eps) { if (oy < b.y0 || oy > b.y1) continue; } else { let t1 = (b.y0 - oy) / dy, t2 = (b.y1 - oy) / dy, s = -1; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; } if (t1 > tn) { tn = t1; axis = 1; sgn = s; } if (t2 < tf) tf = t2; }
      if (Math.abs(dz) < eps) { if (oz < b.z0 || oz > b.z1) continue; } else { let t1 = (b.z0 - oz) / dz, t2 = (b.z1 - oz) / dz, s = -1; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; } if (t1 > tn) { tn = t1; axis = 2; sgn = s; } if (t2 < tf) tf = t2; }
      if (tn > tf || tf < 0 || tn < 0) continue;
      if (tn < best) { best = tn; bn = axis; bs = sgn; }
    }
    if (dy < -1e-9) { const t = -oy / dy; if (t > 0 && t < best) { best = t; bn = 1; bs = 1; } }
    if (bn < 0) return -1;
    nrm.x = bn === 0 ? bs : 0; nrm.y = bn === 1 ? bs : 0; nrm.z = bn === 2 ? bs : 0;
    return best;
  }
  function hasLOS(ax, ay, az, bx, by, bz) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, len = Math.hypot(dx, dy, dz);
    if (len < 0.01) return true;
    return rayWorld(ax, ay, az, dx / len, dy / len, dz / len, len - 0.05) < 0;
  }

  /* ---------- spawns + points of interest ---------- */
  const snap = (p) => { const f = nearestFree(cellI(p.x), cellI(p.z)); return f ? { x: -HALF + (f[0] + 0.5) * CELL, z: -HALF + (f[1] + 0.5) * CELL } : p; };
  const spawns = [
    [{ x: -90, z: 70 }, { x: -90, z: 40 }, { x: -92, z: 10 }, { x: -86, z: 85 }, { x: -92, z: -20 }, { x: -76, z: 76 }],
    [{ x: 92, z: -70 }, { x: 92, z: -40 }, { x: 90, z: -10 }, { x: 86, z: -85 }, { x: 92, z: 20 }, { x: 76, z: -76 }],
  ].map((l) => l.map(snap));
  const pois = [];
  for (let x = -85; x <= 85; x += 17) for (let z = -85; z <= 85; z += 17) { if (!isBlocked(x, z)) pois.push({ x, z }); }

  return { boxes, spawns, pois, sunLight: { dir: sunDir }, mats, skyT, half: HALF, groundHeight, resolveCircle, rayWorld, hasLOS, rayNormal: nrm, findPath, randomFreePoint, isBlocked, walkable };
}
