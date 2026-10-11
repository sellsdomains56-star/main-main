'use strict';
// ---------------------------------------------------------------------------
// Satellite map layer. Real aerial imagery (Esri World Imagery tiles, prefetched by fetch_tiles.mjs into build/tiles/{z}/{x}/{y}.jpg),
// flown by a deterministic camera; routes between the places are drawn on top as animated lines.
// Imagery (c) Esri, Maxar, Earthstar Geographics.  The camera maths is pure so fetch_tiles.mjs can list the tiles each frame needs.
// ---------------------------------------------------------------------------
const SAT_W = 1080, SAT_H = 1920, SAT_CX = 540, SAT_CY = 860, SAT_ZMAX = 17, SAT_SS = 1.5;
const sEase = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const sLerp = (a, b, t) => a + (b - a) * t;
const mercYr = lat => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const latFromMercYr = y => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;
const worldX = (lon, z) => ((lon + 180) / 360) * 256 * Math.pow(2, z);
const worldY = (lat, z) => (1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * 256 * Math.pow(2, z);

// camera keyframes: [seconds into the scene, lon, lat, zoom]  (zoom in css px: 1 css px = 1 world px at that zoom)
// Yas Island flyover: wide context first, then in on the site with Ferrari World, the circuit and the airport around it
const yasScene = (a, b) => ({ a, b, keys: [[0, 54.6150, 24.4700, 12.45], [(b - a) * 0.28, 54.6200, 24.4680, 13.0], [b - a, 54.6290, 24.4585, 13.75]] });
// places (lon, lat). The site is the plot across Yas Canal from Ferrari World / the circuit, next to the E11 (indicative position from the brochure's location map).
const YAS_PLACES = { site: [54.6220, 24.4720], ferrari: [54.6074, 24.4837], circuit: [54.6031, 24.4672], airport: [54.6511, 24.4330] };
function satCam(sc, tg) {
  const keys = sc.keys, lt = Math.min(Math.max(tg - sc.a, 0), (sc.b - sc.a) + 0.5);
  let i = 0; while (i < keys.length - 2 && lt > keys[i + 1][0]) i++;
  const k0 = keys[i], k1 = keys[i + 1], u = sEase(Math.min(1, Math.max(0, (lt - k0[0]) / (k1[0] - k0[0]))));
  return { lon: sLerp(k0[1], k1[1], u), lat: latFromMercYr(sLerp(mercYr(k0[2]), mercYr(k1[2]), u)), z: sLerp(k0[3], k1[3], u) };
}
const satTileZ = zoom => Math.min(SAT_ZMAX, Math.max(6, Math.ceil(zoom + Math.log2(SAT_SS) - 0.02)));
function satTiles(cam) {                                         // every tile the frame needs: [{z,x,y}]
  const z = satTileZ(cam.z), ppt = 256 * Math.pow(2, cam.z - z), n = Math.pow(2, z);
  const cx = worldX(cam.lon, z) / 256, cy = worldY(cam.lat, z) / 256, out = [];
  const x0 = Math.floor(cx - SAT_CX / ppt), x1 = Math.floor(cx + (SAT_W - SAT_CX) / ppt), y0 = Math.floor(cy - SAT_CY / ppt), y1 = Math.floor(cy + (SAT_H - SAT_CY) / ppt);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (y >= 0 && y < n) out.push({ z, x: ((x % n) + n) % n, y, dx: x });
  return out;
}
const satProj = (cam, lon, lat) => [SAT_CX + worldX(lon, cam.z) - worldX(cam.lon, cam.z), SAT_CY + worldY(lat, cam.z) - worldY(cam.lat, cam.z)];

// ---- browser side ---------------------------------------------------------------------------------------------------------------
const SAT_CACHE = new Map();
const satKey = t => `${t.z}/${t.x}/${t.y}`;
function satLoad(t) {
  const k = satKey(t); if (SAT_CACHE.has(k)) return SAT_CACHE.get(k);
  const p = new Promise(res => {
    const im = new Image(); im.onerror = () => res(null); im.src = `build/tiles/${k}.jpg`;
    im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 8; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 8, 8); const d = g.getImageData(0, 0, 8, 8).data, v = []; for (let i = 0; i < d.length; i += 4) v.push((d[i] + d[i + 1] + d[i + 2]) / 3); const m = v.reduce((x, y) => x + y, 0) / v.length, sd = Math.sqrt(v.reduce((x, y) => x + (y - m) * (y - m), 0) / v.length); im.blank = m < 45 && sd < 6; res(im); };
  });
  SAT_CACHE.set(k, p); return p;
}
async function satEnsure(sc, tg) {
  const tiles = satTiles(satCam(sc, tg)); const ims = await Promise.all(tiles.map(satLoad)), extra = [];
  tiles.forEach((t, i) => { SAT_READY.set(satKey(t), ims[i]); if (!ims[i] || ims[i].blank) { let z = t.z, x = t.x, y = t.y; for (let k = 0; k < 5 && z > 6; k++) { z--; x >>= 1; y >>= 1; extra.push({ z, x, y }); } } });
  const eims = await Promise.all(extra.map(satLoad)); extra.forEach((t, i) => SAT_READY.set(satKey(t), eims[i]));
  if (SAT_CACHE.size > 900) { for (const k of [...SAT_CACHE.keys()].slice(0, 300)) { SAT_CACHE.delete(k); SAT_READY.delete(k); } }
}
const SAT_READY = new Map();
function satDraw(sc, tg) {
  const cam = satCam(sc, tg), tiles = satTiles(cam), z = satTileZ(cam.z), ppt = 256 * Math.pow(2, cam.z - z);
  const cx = worldX(cam.lon, z) / 256, cy = worldY(cam.lat, z) / 256;
  ctx.save(); ctx.fillStyle = '#0f1012'; ctx.fillRect(0, 0, W, H);
  for (const t of tiles) {
    let im = SAT_READY.get(satKey(t)), sx = 0, sy = 0, sw = 256;
    if (!im || im.blank) {                                         // no imagery at this zoom (open sea): use a softer ancestor tile instead
      im = null; let z = t.z, ax = t.x, ay = t.y;
      for (let k = 1; k <= 5 && z > 6; k++) { z--; ax >>= 1; ay >>= 1; const a = SAT_READY.get(`${z}/${ax}/${ay}`); if (a && !a.blank) { const f = 1 << k; sw = 256 / f; sx = (t.x & (f - 1)) * sw; sy = (t.y & (f - 1)) * sw; im = a; break; } }
      if (!im) continue;
    }
    ctx.drawImage(im, sx, sy, sw, sw, SAT_CX + (t.dx - cx) * ppt, SAT_CY + (t.y - cy) * ppt, ppt + 0.8, ppt + 0.8);
  }
  // grade: a little less saturated, a little darker, so the line work and type sit on it
  ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.2; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(8,8,10,0.05)'; ctx.fillRect(0, 0, W, H);
  if (false) { const gv = ctx.createRadialGradient(0, 380, 0, 0, 380, 980); gv.addColorStop(0, 'rgba(8,8,10,0.92)'); gv.addColorStop(0.6, 'rgba(8,8,10,0.55)'); gv.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = gv; ctx.fillRect(0, 0, W, H); }   // open sea at the coverage edge: let it fall into shadow
  const gt = ctx.createLinearGradient(0, 0, 0, 640); gt.addColorStop(0, 'rgba(8,8,10,0.82)'); gt.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = gt; ctx.fillRect(0, 0, W, 640);
  const gb = ctx.createLinearGradient(0, 1180, 0, H); gb.addColorStop(0, 'rgba(8,8,10,0)'); gb.addColorStop(0.45, 'rgba(8,8,10,0.78)'); gb.addColorStop(1, 'rgba(8,8,10,0.92)'); ctx.fillStyle = gb; ctx.fillRect(0, 1180, W, H - 1180);
  ctx.restore();
  return cam;
}
function satArc(cam, A, B, bend = 0.16) {                          // curved route between two places, as screen points
  const a = satProj(cam, A[0], A[1]), b = satProj(cam, B[0], B[1]), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const cx = (a[0] + b[0]) / 2 - dy * bend, cy = (a[1] + b[1]) / 2 + dx * bend, pts = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * cx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * cy + u * u * b[1]]); }
  return pts;
}
function satRoute(cam, A, B, p, o = {}) {                         // a line that draws itself, with a bright head
  if (p <= 0.001) return null;
  const pts = satArc(cam, A, B, o.bend ?? 0.16);
  ctx.save(); strokePoly(pts, p, { color: 'rgba(8,8,10,0.6)', w: 15 });
  ctx.shadowColor = 'rgba(233,196,124,0.9)'; ctx.shadowBlur = 16 * SS; const hd = strokePoly(pts, p, { color: o.color || C.gold, w: 7 }); ctx.shadowColor = 'transparent';
  if (hd && p < 0.995) { glow(hd.x, hd.y, 60, '255,236,190', 0.55); dot(hd.x, hd.y, 8, '#FFF3D0'); }
  ctx.restore(); return pts[Math.floor(pts.length / 2)];
}
// pin + a big, plain label (dark pill with a gold edge). side: where the label sits relative to the pin
function satPin(x, y, t, a0, title, o = {}) {
  const e = ea(t, a0, a0 + 0.45, E.back), al = ea(t, a0, a0 + 0.25); if (al <= 0.003) return;
  const main = !!o.main, u = ((t - a0) / 2.0) % 1;
  ring(x, y, (main ? 24 : 16) + (main ? 90 : 60) * E.out3(u), { color: C.gold, w: 3, alpha: (1 - u) * 0.75 * al });
  dot(x, y, (main ? 28 : 19) * e, 'rgba(255,255,255,0.96)'); dot(x, y, (main ? 17 : 10) * e, C.gold);
  const f1 = F.d(800, o.size || 50), pw = M(title, f1, 1) + 56, ph = 78, side = o.side || 'below', gap = main ? 46 : 34;
  let lx = x, ly = y + gap + (1 - e) * 16;
  if (side === 'above') ly = y - gap - ph - (1 - e) * 16; else if (side === 'left') { lx = x - gap - pw / 2; ly = y - ph / 2; } else if (side === 'right') { lx = x + gap + pw / 2; ly = y - ph / 2; }
  lx = Math.min(W - 36 - pw / 2, Math.max(36 + pw / 2, lx));
  ctx.save(); ctx.globalAlpha *= al; rr(lx - pw / 2, ly, pw, ph, 20); ctx.fillStyle = main ? C.gold : 'rgba(8,8,10,0.88)'; ctx.fill(); ctx.strokeStyle = main ? 'rgba(8,8,10,0.4)' : 'rgba(233,196,124,0.75)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
  T(title, lx, ly + 53, { font: f1, ls: 1, color: main ? '#0A0A0B' : '#FFFFFF', alpha: al });
}
