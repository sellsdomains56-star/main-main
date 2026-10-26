'use strict';
// ---------------------------------------------------------------------------
// "Dubai - Abu Dhabi by train" - HeyGen take e283a962 (62 s, English), Abdullah Ahli's twin.  Map from the first frame; his face is the small round bubble.
// The passenger line is the real track: OSM route relation 21493966 "Etihad Rail: Dubai -> Abu Dhabi" (146.9 km, Dubai station on Al Yalayis Street by
// Jumeirah Golf Estates -> Abu Dhabi station in Mohamed Bin Zayed City). ~64 min, from AED 39 (Etihad Rail fares, Sep 2026).
// REAL PAGES as proof (captured with shot_hl.mjs + cut_blank.py into assets/, not committed), flown like the map with a marker on the exact words:
// Khaleej Times 28 Sep 2026 ('each taking 1 hour and 4 minutes', 'start at Dh39') and Gulf News 23 Jan 2025 ('in a matter of 30 minutes').
// The high-speed line (~30 min, up to 350 km/h, announced Jan 2025) has six announced stations - Al Jaddaf and Al Maktoum Intl (Dubai), Zayed Intl Airport,
// Yas, Saadiyat, Reem (Abu Dhabi) - but no published route, so it is drawn as a dashed schematic through those stations.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  const K = {
    train: tw(/^TRAIN$/, 0, 2.5), m64: tw(/^64$/, 0, 3.34), fares: tw(/^FARES$/, 0, 4.7), a39: tw(/^39$/, 0, 5.52), sep: tw(/^SEPARATE$/, 0, 6.78), hs: tw(/^HIGH-SPEED$/, 0, 7.08), m30: tw(/^30$/, 0, 10.58),
    that: tw(/^THAT$/, 0, 11.44), dubai2: tw(/^DUBAI$/, 1, 12.88), abu2: tw(/^ABU$/, 1, 14.3), people2: tw(/^PEOPLE$/, 1, 15.32), dubai3: tw(/^DUBAI\.$/, 0, 17.54), biz: tw(/^BUSINESSES$/, 0, 18.1), wider: tw(/^WIDER$/, 0, 19.6),
    forany: tw(/^FOR$/, 0, 22.62, 22.4), full: tw(/^FULL$/, 0, 25.06), howfar: tw(/^FAR$/, 0, 25.96), often: tw(/^OFTEN$/, 0, 27.66), arrival: tw(/^ARRIVAL$/, 0, 30.04), m30b: tw(/^30$/, 1, 31.81), hour: tw(/^HOUR$/, 0, 33.74), desk: tw(/^DESK\.$/, 0, 35.72),
    comm: tw(/^COMMUNITIES$/, 0, 36.97), but: tw(/^BUT$/, 0, 40.06), schools: tw(/^SCHOOLS,$/, 0, 41.12), shops: tw(/^SHOPS,$/, 0, 42.08), services: tw(/^SERVICES$/, 0, 42.74), you: tw(/^YOU$/, 0, 43.9, 43.5),
    premium: tw(/^PREMIUM$/, 0, 46.32), compare: tw(/^COMPARE$/, 0, 47.6), rents: tw(/^RENTS,$/, 0, 49.48), supply: tw(/^SUPPLY$/, 0, 50.44), extra: tw(/^EXTRA$/, 0, 51.88), study: tw(/^THERE'S$/, 0, 53.24),
    comment: tw(/^COMMENT$/, 0, 60.66), rail: tw(/^RAIL$/, 0, 60.82, 60.5),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = { kt: 'assets/kt_rail.png', gn: 'assets/gn_hsr.png' };
  const GOLD = '#E9C47C', RAIL = '#E5484D', RAIL2 = '#FF8A8E', HSR = '#7FE7FF', TEAL = '#2FD8A0';
  const T_W1A = [0, K.m64 - 0.15], T_KT = [K.m64 - 0.15, K.sep - 0.15], T_GN = [K.sep - 0.15, K.that - 0.15], T_W1 = [K.that - 0.15, K.forany - 0.15], T_W2 = [K.forany - 0.15, K.study - 0.15], T_W3 = [K.study - 0.15, K.comment - 0.2];
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  flight('w1a', T_W1A, [[0, 54.85, 24.675, 9.95, 55, 10], [dur(T_W1A) + 0.5, 54.85, 24.675, 9.88, 55, 11]]);
  flight('w1', T_W1, [[0, 54.88, 24.78, 9.62, 45, 12], [dur(T_W1) + 0.5, 54.88, 24.78, 9.5, 45, 14]]);
  // the real pages: Khaleej Times (today's train: 1 h 4 min, from Dh39) and Gulf News (the high-speed project: 30 minutes)
  const mk = (b, t0, t1) => ({ bbox: b, t0, t1 });
  const page = (id, img, [a, b], keys, hl) => add({ id, kind: 'page', img, a, b, keys, hl });
  const A1 = T_KT[0], A2 = T_GN[0];
  page('p_kt', 'kt', T_KT, [[0, 538, 300, 0.95, 0], [0.55, 538, 310, 0.98, 4], [1.15, 540, 2945, 0.97, 16], [dur(T_KT) + 0.5, 540, 2950, 1.0, 18]],
    [mk([890, 2967, 86, 50], A1 + 1.15, A1 + 1.35), mk([38, 3027, 479, 50], A1 + 1.35, A1 + 1.75), mk([371, 2807, 586, 50], A1 + 1.6, A1 + 2.1), mk([38, 2867, 348, 50], A1 + 2.1, A1 + 2.4)]);
  page('p_gn', 'gn', T_GN, [[0, 538, 380, 0.92, 0], [2.2, 538, 400, 0.98, 6], [2.95, 540, 2808, 0.97, 16], [dur(T_GN) + 0.5, 540, 2812, 1.0, 18]],
    [mk([38, 2743, 960, 48], A2 + 3.2, A2 + 3.75), mk([38, 2809, 220, 48], A2 + 3.75, A2 + 4.05)]);
  flight('w2', T_W2, [[0, 55.12, 24.99, 11.6, 150, 26], [1.6, 55.168, 25.017, 13.6, 150, 40], [rel(T_W2, K.comm), 55.168, 25.017, 13.9, 150, 44], [dur(T_W2) + 0.5, 55.17, 25.02, 13.4, 150, 40]]);
  flight('w3', T_W3, [[0, 54.88, 24.777, 9.55, 112, 12], [dur(T_W3) + 0.5, 54.88, 24.777, 9.45, 112, 12]]);

  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.comment - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.comment + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;

  const PT = GEO.x.points || {}, SDX = PT.st_dxb || [55.1678, 25.0171], SAD = PT.st_auh || [54.5297, 24.3339];
  const HS = [['AL JADDAF', [55.3319, 25.2214]], ['AL MAKTOUM INTL', [55.17, 24.898]], ['ZAYED INTL AIRPORT', [54.651, 24.433]], ['YAS', [54.603, 24.488]], ['SAADIYAT', [54.44, 24.545]], ['REEM', [54.405, 24.495]]];
  // the real passenger track, drawn (and a train running along it)
  const railLine = (t, cam, a0, d, alpha = 1, trainAt = null) => {
    const L = GEO.x.rail; if (!L) return; const p = ea(t, a0, a0 + d, E.inOut2); if (p <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const r of projRuns(cam, geoSlice(L, 0, p))) { strokePoly(r, 1, { color: 'rgba(8,9,11,0.65)', w: 11 }); ctx.shadowColor = RAIL; ctx.shadowBlur = 14 * SS; strokePoly(r, 1, { color: RAIL, w: 5.5 }); ctx.shadowColor = 'transparent'; }
    if (trainAt !== null) { const q = trainAt(t); if (q > 0 && q < 1) { const pts = geoSlice(L, 0, q), [lon, lat] = pts[pts.length - 1], [x, y] = satProj(cam, lon, lat); glow(x, y, 40, '255,138,142', 0.6); dot(x, y, 9, '#FFFFFF'); } }
    ctx.restore();
  };
  const hsrLine = (t, cam, a0, d, alpha = 1) => {
    const p = ea(t, a0, a0 + d, E.inOut2); if (p <= 0.002) return; const pts = HS.map(s => satProj(cam, s[1][0], s[1][1])), n = (pts.length - 1) * p;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.setLineDash([16, 12]); ctx.lineCap = 'round'; ctx.strokeStyle = HSR; ctx.lineWidth = 4.5; ctx.shadowColor = HSR; ctx.shadowBlur = 10 * SS; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= Math.floor(n); i++) ctx.lineTo(pts[i][0], pts[i][1]);
    const f = n - Math.floor(n), i0 = Math.floor(n); if (i0 < pts.length - 1) ctx.lineTo(pts[i0][0] + (pts[i0 + 1][0] - pts[i0][0]) * f, pts[i0][1] + (pts[i0 + 1][1] - pts[i0][1]) * f); ctx.stroke(); ctx.restore();
    pts.forEach(([x, y], i) => { const e = ea(t, a0 + d * i / (pts.length - 1) - 0.1, a0 + d * i / (pts.length - 1) + 0.25); if (e > 0.003) { ctx.save(); ctx.globalAlpha *= e * alpha; dot(x, y, 8, '#0A0A0B'); ring(x, y, 8, { color: HSR, w: 3 }); ctx.restore(); } });
  };
  const tag = (t, cam, [lon, lat], txt, c, a0, dx = 0, dy = 0, a1 = 0) => {
    const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
    const [x, y] = satProj(cam, lon, lat), f = F.d(800, 24), w = M(txt, f, 1.5) + 36, X = Math.max(SAFE.x0, Math.min(SAFE.x1 - w, x + dx - w / 2)), Y = y + dy, e = ea(t, a0, a0 + 0.45, E.back);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - e) * 14); rr(X, Y - 21, w, 42, 21); ctx.fillStyle = 'rgba(8,8,10,0.8)'; ctx.fill();
    rr(X, Y - 21, 8, 42, 4); ctx.fillStyle = c; ctx.fill(); T(txt, X + w / 2 + 4, Y + 8, { font: f, ls: 1.5, color: '#FFFFFF' }); ctx.restore();
  };
  const station = (t, cam, p, a0) => { const al = ea(t, a0, a0 + 0.3); if (al <= 0.003) return; const [x, y] = satProj(cam, p[0], p[1]); ctx.save(); ctx.globalAlpha *= al; dot(x, y, 12, '#FFFFFF'); ring(x, y, 12, { color: RAIL, w: 4 }); ctx.restore(); };

  SCENES.find(s => s.id === 'w1a').cfg.top = (t, cam) => {
    mapName(t, cam, 55.36, 25.06, 'DUBAI', 0.2, 0, { color: '#FFFFFF', size: 32, ls: 10, alpha: 0.9 });
    mapName(t, cam, 54.37, 24.47, 'ABU DHABI', 0.4, 0, { color: '#FFFFFF', size: 32, ls: 10, alpha: 0.9 });
    mapName(t, cam, 54.62, 24.9, 'ARABIAN GULF', 0.8, 0, { rot: -0.62, size: 24 });
    railLine(t, cam, 0.4, 2.6, 1, tt => ea(tt, 0.4, 3.0, E.inOut2));
    station(t, cam, SDX, 0.4); station(t, cam, SAD, 2.9);
    tag(t, cam, SDX, 'DUBAI STATION', RAIL, 0.6, 90, 40); tag(t, cam, SAD, 'ABU DHABI STATION', RAIL, 2.8, 0, -46);
  };
  SCENES.find(s => s.id === 'w1').cfg.top = (t, cam) => {
    const a = T_W1[0];
    mapName(t, cam, 55.36, 25.06, 'DUBAI', a, 0, { color: '#FFFFFF', size: 32, ls: 10, alpha: 0.9 });
    mapName(t, cam, 54.37, 24.47, 'ABU DHABI', a, 0, { color: '#FFFFFF', size: 32, ls: 10, alpha: 0.9 });
    railLine(t, cam, a - 3, 0.1, 1, tt => ((tt - a) / 6) % 1); station(t, cam, SDX, a - 1); station(t, cam, SAD, a - 1);
    hsrLine(t, cam, a + 0.2, 1.4, 0.75);
    // work in one city, live in the other: two arcs
    mapFlow(t, cam, [55.27, 25.2], [54.42, 24.46], K.dubai2 - 0.1, K.forany - 0.5, { dur: 1.2, bend: 0.2 });
    mapFlow(t, cam, [54.42, 24.46], [55.27, 25.2], K.people2 - 0.1, K.forany - 0.5, { dur: 1.2, bend: 0.2 });
  };
  SCENES.find(s => s.id === 'w2').cfg.top = (t, cam) => {
    railLine(t, cam, T_W2[0] - 3, 0.1, 1); station(t, cam, SDX, T_W2[0] - 1);
    tag(t, cam, SDX, 'DUBAI STATION · AL YALAYIS', RAIL, T_W2[0] + 0.6, 0, -56);
    mapScale(t, cam, T_W2[0] + 1.6, 0);
  };
  SCENES.find(s => s.id === 'w3').cfg.top = (t, cam) => {
    railLine(t, cam, T_W3[0] - 3, 0.1, 1, tt => ((tt - T_W3[0]) / 5) % 1); station(t, cam, SDX, T_W3[0] - 1); station(t, cam, SAD, T_W3[0] - 1);
    hsrLine(t, cam, T_W3[0] - 3, 0.1, 0.6);
    tag(t, cam, SDX, 'DUBAI', RAIL, T_W3[0] + 0.3, 70, 40); tag(t, cam, SAD, 'ABU DHABI', RAIL, T_W3[0] + 0.5, 0, -46);
  };

  // ---- legend for the two lines on the wide map: today's train (real track) and the planned high-speed line (schematic)
  const legend = (t) => {
    const a0 = T_W1[0] + 0.5, a1 = K.biz - 0.2, al = win(t, a0, a1); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 1128, h = 132;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0)); glassPill(X, y0, Wd, h, 28);
    ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = RAIL; ctx.beginPath(); ctx.moveTo(X + 36, y0 + 44); ctx.lineTo(X + 110, y0 + 44); ctx.stroke();
    ctx.setLineDash([14, 10]); ctx.lineWidth = 5; ctx.strokeStyle = HSR; ctx.beginPath(); ctx.moveTo(X + 36, y0 + 94); ctx.lineTo(X + 110, y0 + 94); ctx.stroke(); ctx.setLineDash([]);
    T('TRAIN TODAY · ≈64 MIN · FROM AED 39', X + 134, y0 + 54, { font: F.d(800, 27), color: '#FFFFFF', align: 'left' });
    T('HIGH-SPEED · PLANNED · ≈30 MIN', X + 134, y0 + 104, { font: F.d(800, 27), color: HSR, align: 'left' });
    ctx.restore();
  };
  // where a page comes from (small chip above the captions)
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 24), w = M(txt, f, 2) + 48; ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1176, w, 50, 25); T(txt, CX, 1209, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore(); };
  // ---- the door-to-desk commute
  const commute = (t) => {
    const a0 = K.full - 0.3, a1 = K.comm - 0.25, al = win(t, a0, a1); if (al <= 0.003) return;
    const X = SAFE.x0, Wd = SAFE.w, y0 = 870, h = 392;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0)); glassPill(X, y0, Wd, h, 30);
    T('CHECK THE FULL COMMUTE', X + 34, y0 + 46, { font: F.d(800, 26), ls: 4, color: GOLD, align: 'left' });
    const qs = [['HOME → STATION?', K.howfar], ['HOW OFTEN DO TRAINS RUN?', K.often], ['STATION → WORKPLACE?', K.arrival]];
    qs.forEach(([q, a], i) => { const e = ea(t, a - 0.2, a + 0.3, E.out4); if (e <= 0.003) return; ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -24, 0); dot(X + 52, y0 + 98 + i * 52, 14, GOLD); T('?', X + 52, y0 + 106 + i * 52, { font: F.d(800, 20), color: '#0A0A0B' }); T(q, X + 82, y0 + 108 + i * 52, { font: F.d(800, 28), color: '#FFFFFF', align: 'left' }); ctx.restore(); });
    // door to desk bar: grey unknowns around a 30-minute train ride
    const be = ea(t, K.m30b - 0.2, K.m30b + 0.4); if (be > 0.003) { ctx.save(); ctx.globalAlpha *= be; const by = y0 + 236, bx = X + 34, bw = Wd - 68;
      const segs = [[0.18, 'rgba(243,239,230,0.22)', 'GET THERE'], [0.12, 'rgba(243,239,230,0.14)', 'WAIT'], [0.45, HSR, '30 MIN TRAIN'], [0.25, 'rgba(243,239,230,0.22)', 'LAST MILE']];
      let x = bx; segs.forEach(([f, c, lab], i) => { const e = ea(t, K.m30b + i * 0.25, K.m30b + 0.4 + i * 0.25, E.out3), w = bw * f; rr(x + 2, by, (w - 4) * e, 44, 10); ctx.fillStyle = c; ctx.fill(); T(lab, x + w / 2, by + 76, { font: F.d(800, 20), ls: 1, color: i === 2 ? HSR : C.dim, alpha: e }); x += w; });
      T('≈1 HOUR OR MORE · DOOR TO DESK', CX, y0 + h - 22, { font: F.d(800, 24), ls: 2, color: '#FFFFFF', alpha: ea(t, K.hour - 0.1, K.hour + 0.3) }); ctx.restore(); }
    ctx.restore();
  };
  // ---- the study card
  const studyCard = (t) => {
    const se = win(t, K.study - 0.1, T_W3[1] - 0.15); if (se <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= se; ctx.translate(0, slide(t, K.study - 0.1)); glassPill(SAFE.x0, 1040, SAFE.w, 220, 28); rr(SAFE.x0, 1040, 10, 220, 5); ctx.fillStyle = GOLD; ctx.fill();
    T('THE FULL STUDY', SAFE.x0 + 40, 1094, { font: F.d(800, 28), ls: 5, color: GOLD, align: 'left' });
    ['RAIL CONNECTIONS', 'NEARBY COMMUNITIES', 'PROPERTY OPTIONS ALONG THE CORRIDOR'].forEach((s2, i) => T('·  ' + s2, SAFE.x0 + 40, 1146 + i * 40, { font: F.d(800, 28), color: '#FFFFFF', align: 'left', alpha: ea(t, K.study + 0.9 + i * 0.9, K.study + 1.3 + i * 0.9) }));
    ctx.restore();
  };

  const overlay = (t) => {
    hudTitle(t, 'ALREADY CONNECTED', 'DUBAI ↔ ABU DHABI', 'BY PASSENGER TRAIN', 0.3, K.sep - 0.2, RAIL2);
    hudTitle(t, 'BEING DEVELOPED', 'HIGH-SPEED LINE', '≈30 MINUTES CITY TO CITY', K.sep - 0.15, K.that - 0.2, HSR);
    hudTitle(t, 'WHAT IT COULD CHANGE', 'WORK HERE, LIVE THERE', 'BOTH DIRECTIONS', K.that - 0.15, K.biz - 0.2, GOLD);
    hudTitle(t, 'FOR BUSINESSES', 'A WIDER HIRING AREA', 'WITHOUT EVERYONE RELOCATING', K.biz - 0.15, T_W1[1] - 0.1, GOLD);
    hudTitle(t, 'BUYING ALONG THE ROUTE?', 'CHECK THE COMMUTE', 'FRONT DOOR TO DESK', T_W2[0] + 0.1, K.comm - 0.25, GOLD);
    hudTitle(t, 'NEAR A STATION', 'STILL NEEDS LIFE', 'SCHOOLS · SHOPS · SERVICES', K.comm - 0.2, K.you - 0.2, GOLD);
    hudTitle(t, 'BEFORE YOU PAY EXTRA', 'A RAILWAY PREMIUM?', 'COMPARE FIRST', K.you - 0.15, T_W2[1] - 0.1, RAIL2);
    hudTitle(t, 'DUBAI ↔ ABU DHABI CORRIDOR', 'THE FULL STUDY', 'RAIL · COMMUNITIES · PROPERTY', T_W3[0] + 0.1, T_W3[1] - 0.1, GOLD);
    srcChip(t, 'KHALEEJ TIMES · 28 SEP 2026', T_KT[0] + 0.3, T_KT[1] - 0.15); srcChip(t, 'GULF NEWS · 23 JAN 2025', T_GN[0] + 0.3, T_GN[1] - 0.15);
    legend(t); commute(t); studyCard(t);
    breakdown(t, { title: 'RESIDENTS STILL NEED', a0: K.but - 0.3, a1: K.you - 0.25, items: [{ txt: 'SCHOOLS', a: K.schools }, { txt: 'SHOPS', a: K.shops }, { txt: 'SERVICES NEARBY', a: K.services, gold: true }] });
    breakdown(t, { title: 'BEFORE PAYING FOR THE RAILWAY', a0: K.premium - 0.4, a1: T_W2[1] - 0.15, items: [{ txt: 'IS THE SELLER CHARGING A PREMIUM?', a: K.premium - 0.3 }, { txt: 'SIMILAR PROPERTIES', a: K.compare }, { txt: 'CURRENT RENTS', a: K.rents }, { txt: 'UPCOMING SUPPLY', a: K.supply, gold: true }] });
    const be = win(t, K.biz - 0.1, T_W1[1] - 0.2); if (be > 0.003) { ctx.save(); ctx.globalAlpha *= be; ctx.translate(0, slide(t, K.biz - 0.1)); glassPill(SAFE.x0, 1110, SAFE.w, 150, 28); T('BUSINESSES COULD RECRUIT', CX, 1172, { font: F.d(800, 34), color: '#FFFFFF' }); T('FROM A WIDER AREA', CX, 1222, { font: F.d(800, 34), color: GOLD, alpha: ea(t, K.wider - 0.1, K.wider + 0.3) }); ctx.restore(); }

    const ce = ea(t, K.comment + 0.1, K.comment + 0.8, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.rail + 0.8, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.4, K.comment + 0.9, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'RAIL', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.rail - 0.05, K.rail + 0.35, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.rail - 0.05, K.rail + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Sending you the full study', f = F.d(700, 44), w = Math.min(BW, M(rp, f) + 130); rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1102, { font: f, color: C.ink, align: 'left' }); ctx.restore(); }
    }
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.4, 3.8));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  [T_KT[0] + 0.2, K.sep, K.that, T_W2[0], K.comm, T_W3[0], K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.m64, K.m30, K.hour, K.premium].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.rail + 0.8 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 1872 };
}
