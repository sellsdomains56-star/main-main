'use strict';
// ---------------------------------------------------------------------------
// Animated vector map of Abu Dhabi.  Map data: (c) OpenStreetMap contributors (ODbL), drawn in the reel's own style.
// A fly-to camera glides between the places he names; pins ripple in on the word, arcs link them.
// ---------------------------------------------------------------------------
const MAPD = { ready: false, coarse: null, fine: null, major: null, minor: null, places: null };
const MAP_CY = 1000;                     // screen y of the camera centre (just above his head)
const merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;

function polysPath(polys) {
  const p = new Path2D();
  for (const poly of polys) for (const ring of poly) { ring.forEach(([lon, lat], i) => (i ? p.lineTo(lon, merc(lat)) : p.moveTo(lon, merc(lat)))); p.closePath(); }
  return p;
}
function linesPath(lines) {
  const p = new Path2D();
  for (const l of lines) l.forEach(([lon, lat], i) => (i ? p.lineTo(lon, merc(lat)) : p.moveTo(lon, merc(lat))));
  return p;
}
async function loadMap() {
  try {
    const d = await (await fetch('build/map/map.json')).json();
    MAPD.coarse = polysPath(d.coarse); MAPD.fine = polysPath(d.fine);
    MAPD.major = linesPath(d.roads.major || []); MAPD.minor = linesPath(d.roads.minor || []);
    MAPD.places = await (await fetch('places.json')).json();
    MAPD.ready = true;
  } catch (e) { console.error('map data missing', e); }
}

// camera keyframes: [time (graphics s), lon, lat, visible width in degrees]
const CAM = [
  [0, 54.35, 24.35, 1.6], [8.7, 54.28, 24.40, 1.25],
  [9.8, 54.3902, 24.5021, 0.100], [13.0, 54.3902, 24.5021, 0.085],                       // Mubadala · Al Maryah Island
  [14.2, 54.3516, 24.4861, 0.100], [16.0, 54.3516, 24.4861, 0.085],                       // ADIA · Corniche
  [17.5, 54.43, 24.48, 0.62], [21.4, 54.45, 24.47, 0.56],                                 // the investment network
  [22.9, 54.52, 24.52, 0.30], [26.0, 54.52, 24.52, 0.28],                                 // Saadiyat + Yas
  [27.2, 54.3603, 24.4171, 0.130], [31.0, 54.3603, 24.4171, 0.110],                       // Hudayriyat
  [32.6, 54.45, 24.47, 0.60], [37.5, 54.46, 24.47, 0.52],                                 // what to look for
  [39.0, 54.40, 24.42, 1.0], [41.8, 54.35, 24.35, 1.6], [46.8, 54.38, 24.36, 1.5],        // zoom out: bigger than oil
].map(([t, lon, lat, w]) => ({ t, lon, ym: merc(lat), w, lat }));

function camera(t) {
  if (t <= CAM[0].t) return { lon: CAM[0].lon, ym: CAM[0].ym, w: CAM[0].w };
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i], b = CAM[i + 1];
    if (t >= a.t && t <= b.t) {
      const e = E.inOut3(prog(t, a.t, b.t));
      const dist = Math.hypot(b.lon - a.lon, b.ym - a.ym), moved = dist > 1e-6;
      const dip = moved ? clamp(Math.log2(Math.max(dist / Math.min(a.w, b.w), 1)) * 0.45, 0, 1.4) : 0;   // fly-over arc on long hops
      const z = lerp(Math.log2(360 / a.w), Math.log2(360 / b.w), e) - dip * Math.sin(Math.PI * e);
      return { lon: lerp(a.lon, b.lon, e), ym: lerp(a.ym, b.ym, e), w: 360 / Math.pow(2, z) };
    }
  }
  const l = CAM[CAM.length - 1]; return { lon: l.lon, ym: l.ym, w: l.w };
}

let _cam = null, _s = 1;
const proj = (lon, lat) => [CX + (lon - _cam.lon) * _s, MAP_CY - (merc(lat) - _cam.ym) * _s];

// pins: appear on the spoken word
const PINS = [
  { key: 'mubadala', t: 8.95, label: 'MUBADALA', sub: 'AL MARYAH ISLAND', side: 1 },
  { key: 'adia', t: 13.86, label: 'ADIA', sub: 'CORNICHE', side: -1 },
  { key: 'talay', t: 22.85, label: 'TALAY', sub: 'SAADIYAT ISLAND', side: -1 },
  { key: 'yas', t: 23.36, label: 'YAS RIVA RESERVE', sub: 'YAS ISLAND', side: 1 },
  { key: 'hudayriyat', t: 26.90, label: 'HUDAYRIYAT GOLF ESTATES', sub: 'HUDAYRIYAT ISLAND', side: 1 },
];
// arcs from the Al Maryah hub, drawn as the flywheel spins up
const ARCS = [
  { a: 'mubadala', b: 'adia', t0: 13.3, t1: 14.2 },
  { a: 'mubadala', b: 'talay', t0: 19.13, t1: 19.9 }, { a: 'mubadala', b: 'yas', t0: 20.11, t1: 20.9 }, { a: 'mubadala', b: 'hudayriyat', t0: 20.87, t1: 21.7 },
];

function mapAt(t, tg, A) {
  if (!MAPD.ready || A <= 0.003) return;
  _cam = camera(tg); _s = W / _cam.w;
  const w = _cam.w;
  const fineA = 1 - smoothStep(0.9, 1.4, w);                 // detailed coast in close, coarse when far
  ctx.save(); ctx.globalAlpha *= A * 0.9;
  ctx.translate(CX, MAP_CY); ctx.scale(_s, -_s); ctx.translate(-_cam.lon, -_cam.ym);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // land
  ctx.fillStyle = 'rgb(21,25,36)'; ctx.fill(MAPD.coarse, 'evenodd');
  if (fineA > 0.01) { ctx.globalAlpha *= fineA; ctx.fill(MAPD.fine, 'evenodd'); ctx.globalAlpha /= fineA; }
  // roads (city zoom only)
  const roadA = 1 - smoothStep(0.7, 1.1, w);
  if (roadA > 0.01) {
    ctx.globalAlpha *= roadA;
    ctx.strokeStyle = 'rgba(243,239,230,0.07)'; ctx.lineWidth = 1 / _s; ctx.stroke(MAPD.minor);
    ctx.strokeStyle = 'rgba(233,196,124,0.30)'; ctx.lineWidth = 1.6 / _s; ctx.stroke(MAPD.major);
    ctx.globalAlpha /= roadA;
  }
  // glowing coast
  const stroke = (path, a) => {
    if (a < 0.01) return;
    ctx.globalAlpha *= a;
    ctx.strokeStyle = 'rgba(233,196,124,0.10)'; ctx.lineWidth = 9 / _s; ctx.stroke(path);
    ctx.strokeStyle = 'rgba(233,196,124,0.85)'; ctx.lineWidth = 1.5 / _s; ctx.stroke(path);
    ctx.globalAlpha /= a;
  };
  stroke(MAPD.coarse, 1 - fineA); stroke(MAPD.fine, fineA);
  ctx.restore();

  // soft scrim so the graphics on top stay readable
  ctx.save(); ctx.globalAlpha *= A;
  const g = ctx.createLinearGradient(0, 0, 0, 1060);
  g.addColorStop(0, 'rgba(8,8,10,0.9)'); g.addColorStop(0.22, 'rgba(8,8,10,0.74)'); g.addColorStop(0.62, 'rgba(8,8,10,0.6)'); g.addColorStop(1, 'rgba(8,8,10,0.16)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1060); ctx.restore();

  // arcs + pins
  ctx.save(); ctx.globalAlpha *= A;
  const P = MAPD.places;
  for (const arc of ARCS) {
    const p = ea(tg, arc.t0, arc.t1, E.inOut2); if (p <= 0.001) continue;
    const a = proj(P[arc.a].lon, P[arc.a].lat), b = proj(P[arc.b].lon, P[arc.b].lat);
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const cx = mx - dy / L * L * 0.22, cy = my + dx / L * L * 0.22 - L * 0.1;
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * cx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * cy + u * u * b[1]]); }
    strokePoly(pts, p, { color: 'rgba(233,196,124,0.22)', w: 7, alpha: 1 });
    const hd = strokePoly(pts, p, { color: C.gold, w: 2.2, alpha: 0.9 });
    if (hd && p < 1) { glow(hd.x, hd.y, 40, '233,196,124', 0.5); dot(hd.x, hd.y, 4.5, '#FFF3D0'); }
  }
  for (const pin of PINS) {
    const e = ea(tg, pin.t, pin.t + 0.55, E.back); if (e <= 0.003) continue;
    const [x, y] = proj(P[pin.key].lon, P[pin.key].lat);
    if (x < -200 || x > W + 200 || y < 100 || y > H + 100) continue;
    for (let k = 0; k < 2; k++) {                                  // looping ripples
      const u = ((tg - pin.t) / 2.4 + k * 0.5) % 1, r = 12 + 70 * E.out3(Math.max(0, u));
      ring(x, y, r, { color: C.gold, w: 2, alpha: (1 - u) * 0.55 * Math.min(1, e) });
    }
    glow(x, y, 80, '233,196,124', 0.4 * e);
    dot(x, y, 14 * e, 'rgba(233,196,124,0.25)'); dot(x, y, 7 * e, C.gold); ring(x, y, 14 * e, { color: '#FFF3D0', w: 2, alpha: 0.9 });
  }
  ctx.restore();
}
function smoothStep(a, b, x) { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); }

// pin labels live on top of the graphics so they never get buried
function mapLabels(tg, A) {
  if (!MAPD.ready || A <= 0.003 || !_cam) return;
  const P = MAPD.places;
  ctx.save(); ctx.globalAlpha *= A;
  for (const pin of PINS) {
    const e = ea(tg, pin.t + 0.15, pin.t + 0.7, E.out3) * (1 - smoothStep(0.2, 0.34, _cam.w)); if (e <= 0.01) continue;
    const [x, y] = proj(P[pin.key].lon, P[pin.key].lat);
    if (x < 40 || x > W - 40 || y < 560 || y > 1040) continue;      // only label pins that sit in the open band above his head
    const side = x > 700 ? -1 : x < 380 ? 1 : pin.side, lx = x + side * 34, ly = y - 26;
    line(x + side * 10, y - 8, lx, ly + 6, { color: 'rgba(233,196,124,0.7)', w: 1.5, alpha: e });
    const al = side > 0 ? 'left' : 'right';
    const f1 = F.t(700, 19), f2 = F.t(600, 15);
    for (const o of [{ c: 'rgba(8,8,10,0.85)', d: 2 }, { c: C.ink, d: 0 }]) {
      if (o.d) { ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = o.c; ctx.lineJoin = 'round'; ctx.font = f1; ctx.letterSpacing = '5px'; ctx.textAlign = al; ctx.globalAlpha *= e; ctx.strokeText(pin.label, lx + (al === 'left' ? 2 : 5), ly - 4); ctx.font = f2; ctx.letterSpacing = '6px'; ctx.strokeText(pin.sub, lx + (al === 'left' ? 2 : 6), ly + 20); ctx.restore(); }
      else { T(pin.label, lx, ly - 4, { font: f1, ls: 5, color: C.ink, align: al, alpha: e }); T(pin.sub, lx, ly + 20, { font: f2, ls: 6, color: C.gold, align: al, alpha: e * 0.95 }); }
    }
  }
  ctx.restore();
}
