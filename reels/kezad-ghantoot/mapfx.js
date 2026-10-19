'use strict';
// ---------------------------------------------------------------------------
// Map layer v2: the real highways (E11 / E311 / E611), the zone bands between them, the Dubai Metro Red Line, traced community
// outlines with callouts, landmarks, measured distances and a scale bar.  Geometry: roads.json, geo_extra.json (data/build_*.py) and
// outlines.json - all (c) OpenStreetMap contributors (ODbL).  Everything goes through the satellite camera maths, so it sits exactly on
// the imagery, tilted views included.
// ---------------------------------------------------------------------------
const GEO = { roads: {}, x: { bands: {}, outlines: {}, points: {}, metro_red1: [], stations: [] } };
async function loadGeo() {
  try { GEO.roads = await (await fetch('roads.json')).json(); } catch (e) { console.error('roads.json missing'); }
  try { GEO.x = await (await fetch('geo_extra.json')).json(); } catch (e) { console.error('geo_extra.json missing'); }
}
const ROAD_NAME = { E11: 'SHEIKH ZAYED RD', E311: 'SHEIKH MOHAMMED BIN ZAYED RD', E611: 'EMIRATES RD' };
const MAP_BOX = { x0: SAFE.x0, x1: SAFE.x1, y0: 640, y1: 1250 };          // where map labels may sit (under the HUD, above the panels / captions)
const onScr = (x, y, m = 0) => x > -m && x < W + m && y > -m && y < H + m;

// ---- ground geometry
function geoDist(a, b) { const r = Math.PI / 180, dLa = (b[1] - a[1]) * r, dLo = (b[0] - a[0]) * r, h = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLo / 2) ** 2; return 2 * 6371.0088 * Math.asin(Math.sqrt(h)); }   // km
const _cum = new WeakMap();
function geoCum(pts) { let c = _cum.get(pts); if (!c) { c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + geoDist(pts[i - 1], pts[i])); _cum.set(pts, c); } return c; }
function geoSlice(pts, f0, f1 = null) {                               // the part of a line between fractions f0 and f1 of its ground length (one argument: 0..f0)
  if (f1 === null) { f1 = f0; f0 = 0; }
  const c = geoCum(pts), Lt = c[c.length - 1], L0 = Lt * clamp(f0), L1 = Lt * clamp(f1), at = L => { for (let i = 1; i < pts.length; i++) if (c[i] >= L) { const u = (L - c[i - 1]) / ((c[i] - c[i - 1]) || 1); return [i, [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]]; } return [pts.length, pts[pts.length - 1]]; };
  const [i0, p0] = at(L0), [i1, p1] = at(L1), out = [p0]; for (let i = i0; i < i1; i++) out.push(pts[i]); out.push(p1); return out;
}
function nearestF(pts, q) { const c = geoCum(pts); let bi = 0, bd = 1e9; pts.forEach((p, i) => { const d = geoDist(p, q); if (d < bd) { bd = d; bi = i; } }); return c[bi] / c[c.length - 1]; }
const centroid = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

// screen points of a line; under a 3D tilt the points too far below the camera are dropped and the line is split into runs
function projRuns(cam, pts) {
  const tilt = cam.pitch > 0.05, s = Math.sin(Math.min(cam.pitch || 0, P3_MAX) * Math.PI / 180), wx = worldX(cam.lon, cam.z), wy = worldY(cam.lat, cam.z), runs = []; let cur = [];
  for (const [lo, la] of pts) {
    const x = SAT_CX + worldX(lo, cam.z) - wx, y = SAT_CY + worldY(la, cam.z) - wy, ok = !tilt || P3_D - (y - SAT_CY) * s > 0.3 * P3_D;
    if (ok) cur.push(tilt ? p3pt(x, y, cam.pitch) : [x, y]); else { if (cur.length > 1) runs.push(cur); cur = []; }
  }
  if (cur.length > 1) runs.push(cur); return runs;
}
const strokeRuns = (runs, o) => runs.forEach(r => strokePoly(r, 1, o));
const tracePath = P => { ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };

// ---- a highway that draws itself along its real course (south-west -> north-east), dark casing + glowing core + white hairline.
// o: {a0, dur, a1, alpha, hi (0..1 emphasis), color, shields: [[lon, lat], ...] (snapped to the road), name}
function mapRoad(t, cam, ref, o = {}) {
  const ls = GEO.roads[ref]; if (!ls) return;
  const dur = o.dur ?? 1.6, p = ea(t, o.a0, o.a0 + dur, E.inOut2), al = (o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.5) : 1) * (o.alpha ?? 1); if (p <= 0.002 || al <= 0.003) return;
  const col = o.color || '#FFD166', hi = o.hi ?? 0, w = (o.w ?? 7) + 3 * hi, l = ls[0], runs = projRuns(cam, geoSlice(l, p));
  ctx.save(); ctx.globalAlpha *= al;
  strokeRuns(runs, { color: 'rgba(8,9,11,0.62)', w: w + 8 });
  ctx.shadowColor = col; ctx.shadowBlur = (12 + 18 * hi) * SS; strokeRuns(runs, { color: col, w }); ctx.shadowColor = 'transparent';
  strokeRuns(runs, { color: 'rgba(255,255,255,0.85)', w: 1.8 });
  const last = runs[runs.length - 1], head = last && last[last.length - 1];
  if (head && p < 0.995 && onScr(head[0], head[1])) { glow(head[0], head[1], 56, '255,226,150', 0.6); dot(head[0], head[1], 8, '#FFFFFF'); }
  ctx.restore();
  for (const s of o.shields || []) {                                   // ONE shield per road: the first candidate that is on screen; it pops in once the line has passed it
    const f = nearestF(l, s), q = geoSlice(l, f).pop(), [x, y] = satProj(cam, q[0], q[1]);
    if (x < MAP_BOX.x0 + 70 || x > MAP_BOX.x1 - 70 || y < MAP_BOX.y0 || y > MAP_BOX.y1 - 60) continue;
    if (p >= f) roadShield(t, x, y, ref, o.name === undefined ? ROAD_NAME[ref] : o.name, o.a0 + dur * f, al);
    break;
  }
}
// UAE-style route marker: white plate, dark-blue number, the road's name on a dark tab underneath
function roadShield(t, x, y, ref, name, a, al = 1) {
  const e = ea(t, a, a + 0.45, E.back); if (e <= 0.003) return;
  const f = F.d(800, 30), w = M(ref, f, 1) + 32, h = 46;
  ctx.save(); ctx.globalAlpha *= al * clamp(e * 1.5); ctx.translate(x, y); ctx.scale(e, e);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12 * SS; rr(-w / 2, -h / 2, w, h, 10); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#0B3A75'; ctx.lineWidth = 3.5; rr(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 7); ctx.stroke();
  T(ref, 0, 11, { font: f, ls: 1, color: '#0B3A75' });
  if (name) { const f2 = F.d(800, 21), w2 = M(name, f2, 2) + 26; rr(-w2 / 2, h / 2 + 6, w2, 32, 16); ctx.fillStyle = 'rgba(8,8,10,0.85)'; ctx.fill(); T(name, 0, h / 2 + 29, { font: f2, ls: 2, color: '#FFFFFF' }); }
  ctx.restore();
}

// ---- a zone band (the land between two highways): tinted fill + fine hatching that sweeps in from the south-west end, the sweep front glowing.
// o: {a0, dur, a1, alpha, fill}
function mapBand(t, cam, key, color, o = {}) {
  const pts = (GEO.x.bands || {})[key]; if (!pts) return;
  const p = ea(t, o.a0, o.a0 + (o.dur ?? 1.4), E.inOut2), al = (o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.6) : 1) * (o.alpha ?? 1); if (p <= 0.002 || al <= 0.003) return;
  const runs = projRuns(cam, pts); if (!runs.length) return;
  const A = satProj(cam, pts[0][0], pts[0][1]), mid = pts[Math.floor(pts.length / 2) - 1], B = satProj(cam, mid[0], mid[1]);
  let dx = B[0] - A[0], dy = B[1] - A[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  let s1 = 0; runs.forEach(r => r.forEach(([x, y]) => { s1 = Math.max(s1, (x - A[0]) * dx + (y - A[1]) * dy); }));
  const sl = s1 * p + 40, BIG = 6000, nx = -dy, ny = dx;
  ctx.save(); ctx.globalAlpha *= al;
  ctx.beginPath(); ctx.moveTo(A[0] - dx * BIG + nx * BIG, A[1] - dy * BIG + ny * BIG); ctx.lineTo(A[0] + dx * sl + nx * BIG, A[1] + dy * sl + ny * BIG); ctx.lineTo(A[0] + dx * sl - nx * BIG, A[1] + dy * sl - ny * BIG); ctx.lineTo(A[0] - dx * BIG - nx * BIG, A[1] - dy * BIG - ny * BIG); ctx.closePath(); ctx.clip();
  ctx.beginPath(); runs.forEach(P => { P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); });
  ctx.save(); ctx.globalAlpha *= o.fill ?? 0.26; ctx.fillStyle = color; ctx.fill(); ctx.restore();
  ctx.save(); ctx.clip(); ctx.strokeStyle = color; ctx.globalAlpha *= o.hatch ?? 0.3; ctx.lineWidth = 2; ctx.beginPath(); for (let d = -2400; d < 2400; d += 26) { ctx.moveTo(SAT_CX + d - 1600, -200); ctx.lineTo(SAT_CX + d + 1600, 2200); } ctx.stroke(); ctx.restore();
  ctx.restore();
  if (p < 0.995) {                                                    // the sweep front
    const fx = A[0] + dx * sl, fy = A[1] + dy * sl; ctx.save(); ctx.globalAlpha *= al * 0.8 * (1 - p);
    ctx.beginPath(); runs.forEach(P => { P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }); ctx.clip();
    line(fx + nx * 2000, fy + ny * 2000, fx - nx * 2000, fy - ny * 2000, { color: '#FFFFFF', w: 5 }); ctx.restore();
  }
}

// ---- a community: its outline traces itself, fills in the zone colours, a callout (leader + plate) names it while it is the one he talks about;
// afterwards it stays on the map, softer, with a small name tag. o: {c: [c0, c1], a0, on: [a, b], label, sub, dx, dy, base, small, a1}
function mapArea(t, cam, key, o) {
  const pts = OUTLINES[key] || (GEO.x.outlines || {})[key]; if (!pts || t < o.a0) return;
  const al = o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.6) : 1; if (al <= 0.003) return;
  const runs = projRuns(cam, pts); if (!runs.length) return; const P = runs[0];
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; P.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
  if (x1 < -80 || x0 > W + 80 || y1 < 0 || y0 > H) return;
  const tr = ea(t, o.a0, o.a0 + (o.dur ?? 0.8), E.inOut2), hi = o.on ? ea(t, o.on[0], o.on[0] + 0.35) * (1 - ea(t, o.on[1], o.on[1] + 0.6)) : 0, base = o.base ?? 0.6;
  const [c0, c1] = o.c, loop = P.concat([P[0]]);
  ctx.save(); ctx.globalAlpha *= al; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const fa = ea(t, o.a0 + 0.45, o.a0 + 1.0) * lerp(0.2, 0.5, hi);
  if (fa > 0.003) { tracePath(P); const g = ctx.createLinearGradient(x0, y1, x1, y0); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.save(); ctx.globalAlpha *= fa; ctx.fillStyle = g; ctx.fill(); ctx.restore(); }
  const ea2 = lerp(base, 1, Math.max(hi, 1 - ea(t, o.a0 + 1.0, o.a0 + 1.6)));
  ctx.save(); ctx.globalAlpha *= ea2; strokePoly(loop, tr, { color: 'rgba(8,9,11,0.55)', w: 9 });
  ctx.shadowColor = c1; ctx.shadowBlur = (10 + 12 * hi) * SS; const hd = strokePoly(loop, tr, { color: '#FFFFFF', w: 3 + 1.2 * hi }); ctx.shadowColor = 'transparent'; ctx.restore();
  if (hd && tr < 0.995) { glow(hd.x, hd.y, 46, '255,246,222', 0.55); dot(hd.x, hd.y, 6, '#FFFFFF'); }
  ctx.restore();
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (o.label && hi > 0.01) callout(t, cx, cy, o.label, o.sub, c1, o.on[0] + 0.15, hi * al, o.dx ?? 0, o.dy ?? -150);
  const tagA = (1 - hi) * ea(t, o.on ? o.on[1] : o.a0 + 1, (o.on ? o.on[1] : o.a0 + 1) + 0.5) * al * (o.tag ?? 0.95);
  if (o.label && tagA > 0.01 && cx > MAP_BOX.x0 && cx < MAP_BOX.x1 && cy > MAP_BOX.y0 - 20 && cy < MAP_BOX.y1 + 20) {
    const txt = Array.isArray(o.label) ? o.label.join(' ') : o.label, f = F.d(800, o.small ?? 22), w = M(txt, f, 1.5) + 20, ty = y1 + 22 > MAP_BOX.y1 ? y0 - 16 : y1 + 24;
    ctx.save(); ctx.globalAlpha *= tagA; rr(cx - w / 2, ty - 17, w, 32, 16); ctx.fillStyle = 'rgba(8,8,10,0.72)'; ctx.fill(); T(txt, cx, ty + 7, { font: f, ls: 1.5, color: '#FFFFFF' }); ctx.restore();
  }
}
// a callout: anchor ring on the place, an elbow leader, a dark plate with a coloured edge, the name (+ a smaller line)
function callout(t, ax, ay, label, sub, color, a, al, dx, dy) {
  const lines = Array.isArray(label) ? label : [label], f = F.d(800, 36), f2 = F.d(700, 24), tw = Math.max(...lines.map(s => M(s, f, 1)), sub ? M(sub, f2, 3) : 0), pw = tw + 64, ph = 22 + lines.length * 40 + (sub ? 34 : 0);
  const lx = clamp(ax + dx, MAP_BOX.x0 + pw / 2, MAP_BOX.x1 - pw / 2), ly = clamp(ay + dy, MAP_BOX.y0 + ph / 2, MAP_BOX.y1 - ph / 2), e = ea(t, a, a + 0.5, E.back), p = ea(t, a - 0.1, a + 0.35, E.out3);
  const ex = clamp(ax, lx - pw / 2 + 24, lx + pw / 2 - 24), ey = ay < ly ? ly - ph / 2 : ly + ph / 2, mx = ax, my = lerp(ay, ey, 0.55);
  ctx.save(); ctx.globalAlpha *= al;
  ring(ax, ay, 15, { color: '#FFFFFF', w: 3 }); dot(ax, ay, 6.5, '#FFFFFF');
  const leg = [[ax, ay], [mx, my], [ex, my], [ex, ey]].filter((q, i, arr) => !i || Math.hypot(q[0] - arr[i - 1][0], q[1] - arr[i - 1][1]) > 0.5);
  strokePoly(leg, p, { color: 'rgba(8,9,11,0.6)', w: 6 }); strokePoly(leg, p, { color: '#FFFFFF', w: 2.5 });
  ctx.translate(lx, ly); ctx.scale(lerp(0.88, 1, e), lerp(0.88, 1, e)); ctx.globalAlpha *= clamp(e * 1.4);
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18 * SS; rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = 'rgba(10,11,14,0.9)'; ctx.fill(); ctx.shadowColor = 'transparent';
  rr(-pw / 2, -ph / 2, 10, ph, [18, 0, 0, 18]); ctx.fillStyle = color; ctx.fill();
  lines.forEach((s, i) => T(s, -pw / 2 + 34, -ph / 2 + 50 + i * 40, { font: f, ls: 1, color: '#FFFFFF', align: 'left' }));
  if (sub) T(sub, -pw / 2 + 34, ph / 2 - 18, { font: f2, ls: 3, color, align: 'left' });
  ctx.restore();
}

// ---- a landmark: small dark disc with a glyph + a name tab. o: {lon, lat, a0, a1, text, icon: 'tower' | 'plane' | 'port' | 'metro' | 'dot', side: 'r' | 'l', dy}
function mapLandmark(t, cam, o) {
  const al = ea(t, o.a0, o.a0 + 0.3) * (o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.4) : 1); if (al <= 0.003) return;
  const [x, y] = satProj(cam, o.lon, o.lat); if (x < MAP_BOX.x0 - 10 || x > MAP_BOX.x1 + 10 || y < MAP_BOX.y0 - 30 || y > MAP_BOX.y1 + 10) return;
  const e = ea(t, o.a0, o.a0 + 0.45, E.back), f = F.d(800, 23), w = M(o.text, f, 2) + 28, right = (o.side || 'r') === 'r', lx = right ? x + 30 : x - 30 - w, ly = y - 16 + (o.dy || 0);
  ctx.save(); ctx.globalAlpha *= al;
  const u = ((t - o.a0) / 2.2) % 1; ring(x, y, 20 + 26 * u, { color: '#FFFFFF', w: 2, alpha: (1 - u) * 0.55 });
  ctx.save(); ctx.translate(x, y); ctx.scale(e, e); dot(0, 0, 21, 'rgba(10,11,14,0.92)'); ring(0, 0, 21, { color: '#FFFFFF', w: 2.5 });
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  if (o.icon === 'tower') { ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(4.5, 11); ctx.lineTo(-4.5, 11); ctx.closePath(); ctx.fill(); ctx.fillRect(-7, 10, 14, 3); }
  else if (o.icon === 'plane') icon('plane', 0, 0, 12, { p: 1, color: '#FFFFFF', w: 3, rot: -0.6 });
  else if (o.icon === 'port') { ctx.beginPath(); ctx.arc(0, -9, 3.5, 0, 7); ctx.moveTo(0, -5.5); ctx.lineTo(0, 11); ctx.moveTo(-9, 3); ctx.quadraticCurveTo(-8, 11, 0, 11); ctx.quadraticCurveTo(8, 11, 9, 3); ctx.moveTo(-5, -2); ctx.lineTo(5, -2); ctx.stroke(); }
  else if (o.icon === 'metro') { T('M', 0, 9, { font: F.d(800, 24), color: '#FF3B4E' }); }
  else dot(0, 0, 7, C.gold);
  ctx.restore();
  ctx.globalAlpha *= clamp(e * 1.3); rr(lx, ly, w, 32, 16); ctx.fillStyle = 'rgba(8,8,10,0.85)'; ctx.fill(); T(o.text, lx + w / 2, ly + 23, { font: f, ls: 2, color: '#FFFFFF' });
  ctx.restore();
}

// ---- a measured straight line between two places, km label in the middle; if B is off screen the line runs to the edge of the map area
// and ends in an arrow, the label naming B. o: {a0, a1, dur, to: 'BURJ KHALIFA', color, at (label position along the line, 0..1)}
function mapMeasure(t, cam, A, B, o) {
  const al = ea(t, o.a0, o.a0 + 0.25) * (o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.45) : 1), p = ea(t, o.a0, o.a0 + (o.dur ?? 0.9), E.inOut2); if (al <= 0.003 || p <= 0.002) return;
  const a = satProj(cam, A[0], A[1]), b = satProj(cam, B[0], B[1]), km = geoDist(A, B), R = { x0: MAP_BOX.x0 + 10, x1: MAP_BOX.x1 - 10, y0: MAP_BOX.y0 - 10, y1: MAP_BOX.y1 };
  let u1 = 1; const dxl = b[0] - a[0], dyl = b[1] - a[1];                // clip a->b to the map area (Liang-Barsky, end only)
  [[-dxl, a[0] - R.x0], [dxl, R.x1 - a[0]], [-dyl, a[1] - R.y0], [dyl, R.y1 - a[1]]].forEach(([pp, q]) => { if (pp > 0) u1 = Math.min(u1, q / pp); });
  const off = u1 < 0.999, e = [a[0] + dxl * u1 * p, a[1] + dyl * u1 * p], col = o.color || '#FFFFFF', ang = Math.atan2(dyl, dxl);
  ctx.save(); ctx.globalAlpha *= al; ctx.lineCap = 'round';
  line(a[0], a[1], e[0], e[1], { color: 'rgba(8,9,11,0.6)', w: 8 }); ctx.setLineDash([16, 11]); line(a[0], a[1], e[0], e[1], { color: col, w: 3.5 }); ctx.setLineDash([]);
  const tick = (x, y) => line(x - Math.sin(ang) * 13, y + Math.cos(ang) * 13, x + Math.sin(ang) * 13, y - Math.cos(ang) * 13, { color: col, w: 3.5 });
  tick(a[0], a[1]);
  if (p > 0.98) { if (off) { ctx.save(); ctx.translate(e[0], e[1]); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-16, -11); ctx.lineTo(-16, 11); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); } else tick(e[0], e[1]); }
  const la = ea(t, o.a0 + (o.dur ?? 0.9) * 0.7, o.a0 + (o.dur ?? 0.9) + 0.3);
  if (la > 0.01) {
    const lf = o.at ?? 0.5, mx = lerp(a[0], e[0], lf), my = lerp(a[1], e[1], lf), f = F.d(800, 32), f2 = F.d(800, 19), s1 = (km < 10 ? km.toFixed(1) : Math.round(km)) + ' km', s2 = o.to ? 'TO ' + o.to : '', w = Math.max(M(s1, f, 1), M(s2, f2, 2)) + 34, h = s2 ? 70 : 46;
    const lx = clamp(mx, MAP_BOX.x0 + w / 2, MAP_BOX.x1 - w / 2), ly = clamp(my, MAP_BOX.y0 + h / 2, MAP_BOX.y1 - h / 2);
    ctx.globalAlpha *= la; rr(lx - w / 2, ly - h / 2, w, h, 14); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
    T(s1, lx, ly + (s2 ? -2 : 11), { font: f, ls: 1, color: '#0A0B0E' }); if (s2) T(s2, lx, ly + 25, { font: f2, ls: 2, color: '#3A3D44' });
  }
  ctx.restore();
}

// ---- the Dubai Metro Red Line (Centrepoint -> Expo City Dubai): draws along its real track, white station dots, chosen stations named.
// o: {a0, dur, a1, alpha, from (0..1, draw from this fraction), labels: ['Expo City Dubai', ...]}
function mapMetro(t, cam, o) {
  const L = GEO.x.metro_red1; if (!L || !L.length) return;
  const p = ea(t, o.a0, o.a0 + (o.dur ?? 2.0), E.inOut2), al = (o.a1 ? 1 - ea(t, o.a1, o.a1 + 0.5) : 1) * (o.alpha ?? 1); if (p <= 0.002 || al <= 0.003) return;
  const f0 = o.from ?? 0, runs = projRuns(cam, geoSlice(L, f0, f0 + (1 - f0) * p));
  ctx.save(); ctx.globalAlpha *= al; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  strokeRuns(runs, { color: 'rgba(8,9,11,0.6)', w: 12 }); ctx.shadowColor = '#FF3B4E'; ctx.shadowBlur = 12 * SS; strokeRuns(runs, { color: '#E8202F', w: 6 }); ctx.shadowColor = 'transparent';
  const reach = f0 + (1 - f0) * p;
  for (const s of GEO.x.stations || []) {
    const f = nearestF(L, [s.lon, s.lat]); if (f < f0 - 0.001 || f > reach) continue;
    const [x, y] = satProj(cam, s.lon, s.lat); if (!onScr(x, y, 20)) continue;
    dot(x, y, 6.5, '#FFFFFF'); ring(x, y, 6.5, { color: '#E8202F', w: 2.5 });
    if ((o.labels || []).includes(s.name) && x > MAP_BOX.x0 && x < MAP_BOX.x1 && y > MAP_BOX.y0 && y < MAP_BOX.y1) {
      const f2 = F.d(800, 21), txt = s.name.toUpperCase() + ' · METRO', w = M(txt, f2, 2) + 26, lx = clamp(x + 18, MAP_BOX.x0, MAP_BOX.x1 - w);
      rr(lx, y - 14, w, 30, 15); ctx.fillStyle = '#E8202F'; ctx.fill(); T(txt, lx + w / 2, y + 7, { font: f2, ls: 2, color: '#FFFFFF' });
    }
  }
  ctx.restore();
}

// ---- scale bar + north arrow (top right, under the HUD); the length is a round number of km measured at the screen centre
function mapScale(t, cam, a0, a1) {
  const al = ea(t, a0, a0 + 0.4) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
  const m = mpp(cam, cam.lat), L = [0.5, 1, 2, 5, 10, 20].find(k => k * 1000 / m >= 110) || 20, px = L * 1000 / m, x1 = SAFE.x1, x0 = x1 - px, y = 572;
  ctx.save(); ctx.globalAlpha *= al;
  rr(x0 - 16, y - 40, px + 32, 62, 14); ctx.fillStyle = 'rgba(8,8,10,0.55)'; ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x0, y, px / 2, 7); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x0 + px / 2, y, px / 2, 7);
  [0, 0.5, 1].forEach(k => line(x0 + px * k, y - 6, x0 + px * k, y + 7, { color: '#FFFFFF', w: 2.5 }));
  T((L < 1 ? L * 1000 + ' m' : L + ' km'), x1, y - 14, { font: F.d(800, 22), ls: 1, color: '#FFFFFF', align: 'right' });
  const nx = x0 - 46; ctx.beginPath(); ctx.moveTo(nx, y - 30); ctx.lineTo(nx + 9, y - 6); ctx.lineTo(nx, y - 11); ctx.lineTo(nx - 9, y - 6); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  T('N', nx, y + 16, { font: F.d(800, 18), color: '#FFFFFF' });
  ctx.restore();
}
// ---- a water / region name written on the map (wide letter spacing, soft)
function mapName(t, cam, lon, lat, text, a0, a1, o = {}) {
  const al = ea(t, a0, a0 + 0.6) * (a1 ? 1 - ea(t, a1, a1 + 0.5) : 1); if (al <= 0.003) return;
  const [x, y] = satProj(cam, lon, lat); if (!onScr(x, y, 200)) return;
  ctx.save(); ctx.globalAlpha *= al * (o.alpha ?? 0.75); ctx.translate(x, y); ctx.rotate(o.rot ?? 0); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10 * SS;
  T(text, 0, 0, { font: F.d(700, o.size ?? 28), ls: o.ls ?? 14, color: o.color || '#CFE8FF' }); ctx.restore();
}
