'use strict';
// ---------------------------------------------------------------------------
// Satellite map layer. Real aerial imagery (Esri World Imagery tiles, prefetched by fetch_tiles.mjs into build/tiles/{z}/{x}/{y}.jpg),
// flown by a deterministic camera; the islands the video names are traced with animated outlines (OpenStreetMap coast, outlines.json).
// Imagery (c) Esri, Maxar, Earthstar Geographics.  The camera maths is pure so fetch_tiles.mjs can list the tiles each frame needs.
// ---------------------------------------------------------------------------
const SAT_W = 1080, SAT_H = 1920, SAT_CX = 540, SAT_CY = 880, SAT_ZMAX = 17, SAT_SS = 1.5;
const sEase = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const sLerp = (a, b, t) => a + (b - a) * t;
const mercYr = lat => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const latFromMercYr = y => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;
const worldX = (lon, z) => ((lon + 180) / 360) * 256 * Math.pow(2, z);
const worldY = (lat, z) => (1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * 256 * Math.pow(2, z);

// camera keyframes per map scene: [seconds into the scene, lon, lat, zoom]  (zoom in css px: 1 css px = 1 world px at that zoom)
const SAT_SCENES = {
  mubadala:   { a: 8.95,  b: 11.77, keys: [[0, 54.4025, 24.4690, 12.0], [1.45, 54.3902, 24.5000, 14.9], [2.9, 54.3902, 24.5003, 15.3]] },
  aldar:      { veil: 'tl', a: 21.91, b: 24.46, keys: [[0, 54.4500, 24.5440, 13.7], [1.0, 54.4500, 24.5440, 13.85], [1.55, 54.5250, 24.5170, 12.45], [2.1, 54.6020, 24.4890, 13.8], [2.6, 54.6020, 24.4890, 13.95]] },
  hudayriyat: { a: 26.26, b: 28.19, keys: [[0, 54.3800, 24.4000, 13.0], [1.95, 54.3800, 24.4000, 13.5]] },
};
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
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(14,15,18,0.05)'; ctx.fillRect(0, 0, W, H);
  if (sc.veil === 'tl') { const gv = ctx.createRadialGradient(0, 380, 0, 0, 380, 980); gv.addColorStop(0, 'rgba(12,13,16,0.92)'); gv.addColorStop(0.6, 'rgba(12,13,16,0.55)'); gv.addColorStop(1, 'rgba(12,13,16,0)'); ctx.fillStyle = gv; ctx.fillRect(0, 0, W, H); }   // open sea at the coverage edge: let it fall into shadow
  const gt = ctx.createLinearGradient(0, 0, 0, 640); gt.addColorStop(0, 'rgba(14,15,18,0.82)'); gt.addColorStop(1, 'rgba(14,15,18,0)'); ctx.fillStyle = gt; ctx.fillRect(0, 0, W, 640);
  const gb = ctx.createLinearGradient(0, 1180, 0, H); gb.addColorStop(0, 'rgba(14,15,18,0)'); gb.addColorStop(0.45, 'rgba(14,15,18,0.78)'); gb.addColorStop(1, 'rgba(14,15,18,0.92)'); ctx.fillStyle = gb; ctx.fillRect(0, 1180, W, H - 1180);
  ctx.restore();
  return cam;
}
function satOutline(cam, pts, p, color = C.gold) {                // animated traced outline of an island
  if (p <= 0.001) return;
  const P = pts.map(([lo, la]) => satProj(cam, lo, la));
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (p >= 0.995) { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = 'rgba(205,191,159,0.16)'; ctx.fill(); }
  strokePoly(P, p, { color: 'rgba(8,9,11,0.6)', w: 13 });
  ctx.shadowColor = 'rgba(205,191,159,0.9)'; ctx.shadowBlur = 16 * SS; const hd = strokePoly(P, p, { color, w: 6 }); ctx.shadowColor = 'transparent';
  if (hd && p < 0.995) { glow(hd.x, hd.y, 60, '255,246,222', 0.55); dot(hd.x, hd.y, 7, '#FFF8E6'); }
  ctx.restore();
}
function satPin(x, y, t, a0, title, sub) {                         // pin + one pulse + a big, plain label
  const e = ea(t, a0, a0 + 0.45, E.back), al = ea(t, a0, a0 + 0.25) * (1 - ea(y, 1400, 1480)) * ea(y, 330, 420) * ea(x, -40, 40) * (1 - ea(x, W - 40, W + 40)); if (al <= 0.003) return;
  const u = ((t - a0) / 2.0) % 1;
  ring(x, y, 16 + 70 * E.out3(u), { color: '#FFFFFF', w: 3, alpha: (1 - u) * 0.7 * al });
  dot(x, y, 20 * e, 'rgba(255,255,255,0.95)'); dot(x, y, 11 * e, C.gold);
  const f1 = F.d(700, 50), f2 = F.d(500, 36), w1 = M(title, f1, 1), w2 = sub ? M(sub, f2, 1) : 0, pw = Math.max(w1, w2) + 70, ph = sub ? 124 : 84;
  const lx = Math.min(W - 40 - pw / 2, Math.max(40 + pw / 2, x)), ly = y + 40 + (1 - e) * 20;
  ctx.save(); ctx.globalAlpha *= al; rr(lx - pw / 2, ly, pw, ph, 22); ctx.fillStyle = 'rgba(16,17,20,0.86)'; ctx.fill(); ctx.strokeStyle = 'rgba(205,191,159,0.7)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  T(title, lx, ly + 58, { font: f1, ls: 1, color: '#FFFFFF', alpha: al });
  if (sub) T(sub, lx, ly + 100, { font: f2, ls: 1, color: C.gold, alpha: al });
}
