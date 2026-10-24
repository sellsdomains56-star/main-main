'use strict';
// ---------------------------------------------------------------------------
// "Hudayriyat Island / Wadeem Gardens" - HeyGen take a40a4f33 (59 s, English), Abdullah Ahli's twin.
// No full-screen face: the map runs from the first frame (Esri satellite, OpenStreetMap outlines via mapfx.js); his face is the small round bubble top-left.
// Facts on screen: Hudayriyat 51 km2 (Modon masterplan, Jun 2023); Yas ~25 km2; H1 2026 residential sales (ADREC report, Aug 2026): Hudayriyat AED 19bn,
// Saadiyat 13.3bn, Al Reem + Al Maryah 10.5bn (reported together), Yas 7.3bn; Wadeem sits "opposite Abu Dhabi's Al Bateen area" (WAM, 1 Jul 2025) - no
// public plot map, so it is shown as a soft glow on that shore, not an outline; The Spine is shown as its 2.3 km LENGTH at map scale, not a route;
// drive times are the developer's ("according to the developer"). Palm Jumeirah ~5.7 km2 of land -> 51 / 5.7 = ~9.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  // ---- key times (from the spoken words)
  const K = {
    palm: tw(/^PALM$/, 0, 1.6), nine: tw(/^NINE$/, 0, 2.22), hottest: tw(/^HOTTEST$/, 0, 4.52), hud1: tw(/^HUDAYRIYAT$/, 0, 6.8),
    km51: tw(/^51$/, 0, 8.13), twice: tw(/^TWICE$/, 0, 10.08), yas1: tw(/^YAS$/, 0, 11.0), in1: tw(/^IN$/, 0, 12.02),
    b19: tw(/^19$/, 0, 13.31), sold: tw(/^SOLD$/, 0, 16.04), thats1: tw(/^THAT'S$/, 0, 17.16), saad: tw(/^SAADIYAT,$/, 0, 17.66), yas2: tw(/^YAS,$/, 0, 18.59), reem: tw(/^AL$/, 0, 19.34, 19),
    and2: tw(/^AND$/, 0, 20.73, 20.3), modon: tw(/^MODON$/, 0, 20.98), wadeem1: tw(/^WADEEM$/, 0, 21.98), three: tw(/^THREE$/, 0, 23.55), next: tw(/^NEXT$/, 0, 25.84),
    a23: tw(/^2\.3-KILOMETER$/, 0, 29.28), climate: tw(/^CLIMATE-CONTROLLED$/, 0, 30.5), spine: tw(/^SPINE\.$/, 0, 32.92),
    shops: tw(/^SHOPS,$/, 0, 34.06), rest: tw(/^RESTAURANTS,$/, 0, 34.97), ent: tw(/^ENTERTAINMENT,$/, 0, 35.8), off: tw(/^OFFICES,$/, 0, 36.58), health: tw(/^HEALTHCARE,$/, 0, 37.32), schools: tw(/^SCHOOLS,$/, 0, 38.28), door: tw(/^DOORSTEP\.$/, 0, 39.6),
    loc: tw(/^LOCATION\?$/, 0, 40.54), m20: tw(/^20$/, 0, 42.22), adgm: tw(/^ADGM$/, 0, 43.02), m25: tw(/^25$/, 0, 43.74), yas3: tw(/^YAS$/, 1, 44.64), dev: tw(/^DEVELOPER\.$/, 0, 45.88),
    now2: tw(/^NOW,$/, 0, 46.49), scale: tw(/^SCALE$/, 0, 47.66), infra: tw(/^INFRASTRUCTURE,$/, 0, 49.16), upcoming: tw(/^UPCOMING$/, 0, 48.86), demand: tw(/^DEMAND$/, 0, 50.44),
    thats2: tw(/^THAT'S$/, 2, 51.5, 51), wadeem2: tw(/^WADEEM$/, 1, 52.08), comment: tw(/^COMMENT$/, 0, 53.94), offplan: tw(/^OFFPLAN$/, 0, 54.24), send: tw(/^SEND$/, 0, 56.42),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = {};
  const GOLD = '#E9C47C', HUD = ['#E9C47C', '#FFE2A8'], SAAD = ['#3DB2FF', '#A9DEFF'], YAS = ['#FF8A5B', '#FFC7A3'], REEM = ['#2FD8A0', '#A6F3D6'], BATEEN = ['#7FB8FF', '#CFE3FF'];

  // ---- the beats (one map each)
  const T_B1 = [0, K.in1 - 0.15], T_B2 = [K.in1 - 0.15, K.and2 - 0.15], T_B3 = [K.and2 - 0.15, K.loc - 0.2], T_B4 = [K.loc - 0.2, K.now2 - 0.15], T_B5 = [K.now2 - 0.15, K.comment - 0.2];
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  flight('b1', T_B1, [[0, 54.392, 24.378, 12.25, 40, 18], [rel(T_B1, K.km51), 54.392, 24.381, 12.05, 40, 22], [rel(T_B1, K.twice) + 0.9, 54.48, 24.44, 11.05, 60, 16], [dur(T_B1) + 0.5, 54.48, 24.44, 11.0, 60, 16]]);
  flight('b2', T_B2, [[0, 54.475, 24.452, 10.9, 120, 0], [dur(T_B2) + 0.5, 54.475, 24.452, 10.97, 120, 4]]);
  flight('b3', T_B3, [[0, 54.37, 24.42, 11.9, 60, 18], [1.2, 54.348, 24.432, 13.0, 60, 26], [rel(T_B3, K.a23), 54.348, 24.432, 13.15, 60, 28], [dur(T_B3) + 0.5, 54.35, 24.43, 13.3, 60, 30]]);
  flight('b4', T_B4, [[0, 54.40, 24.44, 12.2, 40, 18], [1.2, 54.475, 24.462, 11.3, 40, 14], [dur(T_B4) + 0.5, 54.475, 24.462, 11.35, 40, 16]]);
  flight('b5', T_B5, [[0, 54.40, 24.40, 11.6, 60, 18], [dur(T_B5) + 0.5, 54.39, 24.385, 12.1, 60, 30]]);

  // ---- the face bubble (live video, small, top-left; grows for the call to action)
  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.comment - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.comment + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;

  const S = id => SCENES.find(s => s.id === id).cfg;
  const PT = GEO.x.points || {}, cen = k => centroid(OUTLINES[k] || [[0, 0]]);
  const ADGM = PT.adgm || [54.3885, 24.5013], YASC = PT.yas_c || [54.603, 24.488], BRIDGE = PT.bridge || [54.354, 24.4245], WAD = PT.wadeem || [54.352, 24.428];

  S('b1').top = (t, cam) => {
    mapName(t, cam, 54.26, 24.52, 'ARABIAN GULF', 0.6, 0, { rot: -0.5, size: 26 });
    mapArea(t, cam, 'hud', { c: HUD, a0: 0.25, dur: 1.6, on: [0.9, T_B1[1]], labelOn: K.hud1 - 0.1, label: ['HUDAYRIYAT', 'ISLAND'], sub: 'ABU DHABI', dx: 190, dy: -40, tag: 0 });
    mapName(t, cam, 54.37, 24.474, 'ABU DHABI', K.hottest - 0.2, 0, { color: '#FFFFFF', size: 30, ls: 8, alpha: 0.9 });
    mapArea(t, cam, 'yas', { c: YAS, a0: K.twice - 0.1, dur: 0.9, on: [K.yas1 - 0.1, T_B1[1]], label: 'YAS ISLAND', sub: '≈25 KM²', dx: 60, dy: -170, tag: 0 });
    mapScale(t, cam, 0.5, 0);
  };
  const islandTag = (t, cam, [lon, lat], txt, c, a0, dx = 0, dy = 0) => {      // a small name tag on the map (the values sit in the bar panel)
    const al = ea(t, a0, a0 + 0.35); if (al <= 0.003) return;
    const [x, y] = satProj(cam, lon, lat), f = F.d(800, 24), w = M(txt, f, 1.5) + 34, X = x + dx - w / 2, Y = y + dy, e = ea(t, a0, a0 + 0.45, E.back);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - e) * 14); rr(X, Y - 20, w, 40, 20); ctx.fillStyle = 'rgba(8,8,10,0.78)'; ctx.fill();
    rr(X, Y - 20, 8, 40, 4); ctx.fillStyle = c; ctx.fill(); T(txt, X + w / 2 + 4, Y + 8, { font: f, ls: 1.5, color: '#FFFFFF' }); ctx.restore();
  };
  S('b2').top = (t, cam) => {
    mapArea(t, cam, 'hud', { c: HUD, a0: T_B2[0], dur: 0.6, on: [K.b19 - 0.1, T_B2[1]], base: 0.8, tag: 0 });
    mapArea(t, cam, 'saadiyat', { c: SAAD, a0: K.saad - 0.2, on: [K.saad - 0.1, T_B2[1]], tag: 0 });
    mapArea(t, cam, 'yas', { c: YAS, a0: K.yas2 - 0.2, on: [K.yas2 - 0.1, T_B2[1]], tag: 0 });
    mapArea(t, cam, 'reem', { c: REEM, a0: K.reem - 0.2, on: [K.reem - 0.1, T_B2[1]], tag: 0 });
    mapArea(t, cam, 'maryah', { c: REEM, a0: K.reem - 0.1, on: [K.reem, T_B2[1]], tag: 0 });
    islandTag(t, cam, cen('hud'), 'HUDAYRIYAT', HUD[0], K.b19, 0, 70);
    islandTag(t, cam, cen('saadiyat'), 'SAADIYAT', SAAD[0], K.saad, 0, -62);
    islandTag(t, cam, cen('yas'), 'YAS', YAS[0], K.yas2, 0, -58);
    islandTag(t, cam, cen('reem'), 'AL REEM + AL MARYAH', REEM[0], K.reem, -40, 52);
  };
  S('b3').top = (t, cam) => {
    mapArea(t, cam, 'hud', { c: HUD, a0: T_B3[0], dur: 0.6, base: 0.35, tag: 0 });
    mapArea(t, cam, 'bateen', { c: BATEEN, a0: K.wadeem1 - 0.6, dur: 0.9, on: [K.wadeem1 - 0.5, T_B3[1]], label: 'AL BATEEN', sub: 'ABU DHABI ISLAND', dx: 150, dy: -150, base: 0.35, tag: 0 });
    mapPulse(t, cam, WAD[0], WAD[1], 1300, K.wadeem1 - 0.1, 0);
    mapLandmark(t, cam, { lon: WAD[0], lat: WAD[1], a0: K.wadeem1, text: 'WADEEM · OPPOSITE AL BATEEN', icon: 'dot', side: 'r', dy: 40 });
    mapScale(t, cam, T_B3[0] + 1.4, 0);
  };
  S('b4').top = (t, cam) => {
    mapArea(t, cam, 'hud', { c: HUD, a0: T_B4[0], dur: 0.6, base: 0.55, tag: 0 });
    mapLandmark(t, cam, { lon: WAD[0], lat: WAD[1], a0: T_B4[0] + 0.3, text: 'WADEEM', icon: 'dot', side: 'l', dy: 34 });
    mapFlow(t, cam, BRIDGE, ADGM, K.m20 - 0.35, 0, { dur: 1.0, bend: 0.22 });
    mapLandmark(t, cam, { lon: ADGM[0], lat: ADGM[1], a0: K.m20 + 0.4, text: 'ADGM · ≈20 MIN', icon: 'tower', side: 'l', dy: -30 });
    mapFlow(t, cam, BRIDGE, YASC, K.m25 - 0.3, 0, { dur: 1.2, bend: -0.18 });
    mapArea(t, cam, 'yas', { c: YAS, a0: K.m25, dur: 0.8, base: 0.5, tag: 0 });
    mapLandmark(t, cam, { lon: YASC[0], lat: YASC[1], a0: K.m25 + 0.5, text: 'YAS ISLAND · ≈25 MIN', icon: 'dot', side: 'l', dy: 46 });
    mapScale(t, cam, T_B4[0] + 1.4, 0);
  };
  S('b5').top = (t, cam) => {
    mapArea(t, cam, 'hud', { c: HUD, a0: T_B5[0], dur: 1.0, on: [K.scale - 0.1, T_B5[1]], label: 'HUDAYRIYAT', sub: '51 KM²', dx: 160, dy: -170, tag: 0 });
    mapPulse(t, cam, WAD[0], WAD[1], 1300, K.wadeem2 - 0.1, 0);
    mapLandmark(t, cam, { lon: WAD[0], lat: WAD[1], a0: K.wadeem2, text: 'WADEEM GARDENS', icon: 'dot', side: 'r', dy: 40 });
  };

  // ---- the hook: nine Palm Jumeirah silhouettes (Palm Jumeirah ~5.7 km2 of land; 51 / 5.7 = ~9) - icons, not to scale
  const palmIcon = (x, y, s, al) => {                                          // stylised Palm Jumeirah: trunk, 8 fronds a side, crescent (an icon, not to scale)
    if (al <= 0.003 || s < 2) return; const u = s / 64;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(x, y); ctx.strokeStyle = GOLD; ctx.lineCap = 'round';
    ctx.lineWidth = 4.2 * u; ctx.beginPath(); ctx.moveTo(0, 30 * u); ctx.lineTo(0, -16 * u); ctx.stroke();
    ctx.lineWidth = 2.6 * u; for (let i = 0; i < 8; i++) { const yy = 16 * u - i * 4.4 * u, L = (14 - Math.abs(i - 3.5) * 1.6) * u; ctx.beginPath(); ctx.moveTo(-2 * u, yy); ctx.lineTo(-2 * u - L, yy - 3 * u); ctx.moveTo(2 * u, yy); ctx.lineTo(2 * u + L, yy - 3 * u); ctx.stroke(); }
    ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.arc(0, 2 * u, 27 * u, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.restore();
  };
  const palms = (t) => {
    const a0 = K.palm - 0.25, a1 = K.hud1 - 0.3, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 1010, h = 250;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 28);
    const n = Math.min(9, Math.floor(9 * ea(t, K.palm + 0.05, K.nine + 0.35, E.lin) + 0.0001));
    for (let i = 0; i < 9; i++) { const e = ea(t, K.palm + 0.05 + i * (K.nine + 0.3 - K.palm) / 9, K.palm + 0.35 + i * (K.nine + 0.3 - K.palm) / 9, E.back); palmIcon(X + 70 + (i % 3) * 92, y0 + 52 + Math.floor(i / 3) * 74, 64 * e, e); }
    T('×' + Math.max(1, n), X + 460, y0 + 128, { font: F.d(800, 104), color: GOLD, align: 'left', alpha: ea(t, K.palm + 0.05, K.palm + 0.3) });
    T('PALM JUMEIRAH', X + 462, y0 + 176, { font: F.d(800, 30), ls: 3, color: '#FFFFFF', align: 'left' });
    T('≈5.7 KM² OF LAND EACH · ICONS NOT TO SCALE', X + 462, y0 + 214, { font: F.d(700, 19), ls: 2, color: C.mute, align: 'left' });
    ctx.restore();
  };
  // ---- 51 km2 against Yas (~25 km2): two bars
  const sizeBars = (t) => {
    const a0 = K.km51 - 0.2, a1 = T_B1[1] - 0.25, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 1040, h = 222, bx = X + 300, bw = Wd - 340;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 28);
    T('ISLAND SIZE · KM²', X + 34, y0 + 44, { font: F.d(800, 26), ls: 6, color: GOLD, align: 'left' });
    [[`HUDAYRIYAT`, 51, HUD, K.km51], ['YAS ISLAND', 25, YAS, K.twice]].forEach(([name, v, c, a], i) => {
      const e = ea(t, a - 0.05, a + 0.8, E.out3), y = y0 + 98 + i * 72; if (e <= 0.003) return;
      ctx.save(); ctx.globalAlpha *= ea(t, a - 0.1, a + 0.2);
      T(name, X + 34, y + 12, { font: F.d(800, 30), ls: 1, color: '#FFFFFF', align: 'left' });
      const w = bw * v / 51 * e, g = ctx.createLinearGradient(bx, 0, bx + w, 0); g.addColorStop(0, c[0]); g.addColorStop(1, c[1]); rr(bx, y - 18, Math.max(12, w), 40, 20); ctx.fillStyle = g; ctx.fill();
      T((i ? '≈' : '') + Math.round(v * e), bx + Math.max(12, w) - 16, y + 12, { font: F.d(800, 30), color: '#101014', align: 'right' });
      ctx.restore();
    });
    T('MODON MASTERPLAN (HUDAYRIYAT) · YAS ISLAND ≈25 KM²', X + 34, y0 + h - 18, { font: F.d(700, 17), ls: 2, color: C.mute, align: 'left' });
    ctx.restore();
  };
  // ---- H1 2026 residential sales, ADREC (AED bn): the bars appear as he names each island
  const salesBars = (t) => {
    const a0 = K.thats1 - 0.3, a1 = T_B2[1] - 0.2, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const rows = [['HUDAYRIYAT', 19.0, HUD, K.thats1], ['SAADIYAT', 13.3, SAAD, K.saad], ['AL REEM + AL MARYAH', 10.5, REEM, K.reem], ['YAS', 7.3, YAS, K.yas2]];
    const X = SAFE.x0, Wd = SAFE.w, rowH = 50, y0 = 1262 - (74 + rows.length * rowH + 36), bx = X + 340, bw = Wd - 400;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, 1262 - y0, 28);
    T('H1 2026 · HOMES SOLD · AED BN', X + 34, y0 + 44, { font: F.d(800, 26), ls: 5, color: GOLD, align: 'left' });
    rows.forEach(([name, v, c, a], i) => {
      const e = ea(t, a - 0.05, a + 0.7, E.out3), y = y0 + 96 + i * rowH; if (e <= 0.003) return;
      ctx.save(); ctx.globalAlpha *= ea(t, a - 0.1, a + 0.2);
      T(name, X + 34, y + 10, { font: F.d(800, 26), ls: 1, color: i ? '#FFFFFF' : GOLD, align: 'left', sx: Math.min(1, 310 / M(name, F.d(800, 26), 1)) });
      const w = bw * v / 19 * e, g = ctx.createLinearGradient(bx, 0, bx + w, 0); g.addColorStop(0, c[0]); g.addColorStop(1, c[1]); rr(bx, y - 16, Math.max(12, w), 34, 17); ctx.fillStyle = g; ctx.fill();
      T(numberStr(v * e, 1), bx + Math.max(12, w) + 12, y + 10, { font: F.d(800, 26), color: '#FFFFFF', align: 'left' });
      ctx.restore();
    });
    T('SOURCE: ABU DHABI REAL ESTATE CENTRE (ADREC), H1 2026 REPORT', X + 34, 1262 - 18, { font: F.d(700, 17), ls: 2, color: C.mute, align: 'left' });
    ctx.restore();
  };
  // ---- The Spine: its 2.3 km LENGTH at the map's scale (the route is not public, so it is a scale bar, not a line on the island)
  const spineBar = (t) => {
    const a0 = K.a23 - 0.2, a1 = K.shops - 0.35, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const sc = SAT_SCENES.b3, cam = sc ? satCam(sc, t) : null; if (!cam) return;
    const lat = 24.43, [ax] = satProj(cam, 54.34, lat), [bx] = satProj(cam, 54.34 + 2.3 / (111.32 * Math.cos(lat * Math.PI / 180)), lat), L = Math.abs(bx - ax);
    const X = SAFE.x0, Wd = SAFE.w, y0 = 1080, h = 182, x0 = X + (Wd - L) / 2, e = ea(t, K.a23, K.a23 + 0.9, E.inOut2);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30); glassPill(X, y0, Wd, h, 28);
    T('THE SPINE · 2.3 KM', X + 34, y0 + 46, { font: F.d(800, 30), ls: 4, color: GOLD, align: 'left' });
    T('CLIMATE-CONTROLLED', X + Wd - 34, y0 + 46, { font: F.d(700, 22), ls: 3, color: '#FFFFFF', align: 'right', alpha: ea(t, K.climate - 0.1, K.climate + 0.3) });
    const yb = y0 + 104; rr(x0, yb - 7, L * e, 14, 7); ctx.fillStyle = GOLD; ctx.fill(); dot(x0, yb, 11, GOLD); if (e > 0.98) dot(x0 + L, yb, 11, GOLD);
    T('LENGTH AT THIS MAP\'S SCALE · ROUTE NOT PUBLISHED', CX, y0 + h - 20, { font: F.d(700, 17), ls: 2, color: C.mute });
    ctx.restore();
  };
  // ---- what the spine brings: six chips that light up as he names them
  const chips = (t) => {
    const a0 = K.shops - 0.3, a1 = T_B3[1] - 0.2, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.35)); if (al <= 0.003) return;
    const items = [['SHOPS', K.shops], ['RESTAURANTS', K.rest], ['ENTERTAINMENT', K.ent], ['OFFICES', K.off], ['HEALTHCARE', K.health], ['SCHOOLS', K.schools]];
    const X = SAFE.x0, Wd = SAFE.w, gap = 16, w = (Wd - gap) / 2, h = 84, y0 = 1262 - 3 * h - 2 * gap;
    ctx.save(); ctx.globalAlpha *= al;
    items.forEach(([txt, a], i) => {
      const e = ea(t, a - 0.05, a + 0.4, E.out4); if (e <= 0.003) return;
      const x = X + (i % 2) * (w + gap), y = y0 + Math.floor(i / 2) * (h + gap), hi = 1 - ea(t, a + 0.4, a + 1.6);
      ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 22); glassPill(x, y, w, h, 24);
      if (hi > 0.01) { rr(x, y, w, h, 24); ctx.strokeStyle = `rgba(233,196,124,${0.9 * hi})`; ctx.lineWidth = 3; ctx.stroke(); }
      dot(x + 42, y + h / 2, 14, GOLD); icon('check', x + 42, y + h / 2 + 1, 8, { color: '#0A0A0B', w: 3.5 });
      T(txt, x + 72, y + h / 2 + 11, { font: F.d(800, 30), ls: 1, color: '#FFFFFF', align: 'left', sx: Math.min(1, (w - 90) / M(txt, F.d(800, 30), 1)) });
      ctx.restore();
    });
    ctx.restore();
  };

  const overlay = (t) => {
    hudTitle(t, 'IMAGINE AN ISLAND', '9× PALM JUMEIRAH', "ONE OF ABU DHABI'S HOTTEST MARKETS", 0.3, K.hud1 - 0.2, GOLD);
    hudTitle(t, 'ABU DHABI', 'HUDAYRIYAT ISLAND', '51 KM² · MORE THAN 2× YAS ISLAND', K.hud1 - 0.15, T_B1[1] - 0.1, GOLD);
    hudTitle(t, 'IN JUST SIX MONTHS', 'AED 19 BILLION', 'OF HOMES SOLD · H1 2026', T_B2[0] + 0.1, T_B2[1] - 0.1, GOLD);
    hudTitle(t, 'MODON · HUDAYRIYAT', 'WADEEM GARDENS', '3 GATED VILLA COMMUNITIES', T_B3[0] + 0.1, K.a23 - 0.35, GOLD);
    hudTitle(t, 'RIGHT NEXT TO IT', 'THE SPINE', 'SHOPS TO SCHOOLS ON YOUR DOORSTEP', K.a23 - 0.3, T_B3[1] - 0.1, GOLD);
    hudTitle(t, 'ACCORDING TO THE DEVELOPER', 'THE LOCATION', '≈20 MIN ADGM · ≈25 MIN YAS', T_B4[0] + 0.1, T_B4[1] - 0.1, GOLD);
    hudTitle(t, 'WHY IT IS WORTH WATCHING', 'WADEEM GARDENS', 'HUDAYRIYAT ISLAND · MODON', T_B5[0] + 0.1, T_B5[1] - 0.1, GOLD);
    palms(t); sizeBars(t); salesBars(t); spineBar(t); chips(t);
    breakdown(t, { title: 'PUT TOGETHER', a0: K.scale - 0.35, a1: T_B5[1] - 0.15, items: [{ txt: 'THE SCALE · 51 KM²', a: K.scale }, { txt: 'UPCOMING INFRASTRUCTURE', a: K.upcoming }, { txt: 'DEMAND · AED 19 BN IN H1 2026', a: K.demand, gold: true }] });

    // the call to action: dark background, the bubble grows, "OFFPLAN" is typed, sent and answered
    const ce = ea(t, K.comment + 0.1, K.comment + 0.8, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.offplan + 1.0, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.5, K.comment + 1.0, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'OFFPLAN', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.offplan - 0.05, K.offplan + 0.6, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.offplan - 0.05, K.offplan + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Sending the fact sheet & master plan', f = F.d(700, 40), w = Math.min(BW, M(rp, f) + 130); rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1101, { font: f, color: C.ink, align: 'left', sx: Math.min(1, (w - 140) / M(rp, f)) }); ctx.restore(); }
    }
    // name chip under the bubble while he is introduced
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.6, 4.0));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  // ---- sound: very quiet whooshes on the beat changes, soft pins on the places
  [T_B2[0], T_B3[0], T_B4[0], T_B5[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.hud1, K.saad, K.yas2, K.reem, K.wadeem1, K.adgm, K.yas3].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.offplan + 1.0 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 1762 };
}
