'use strict';
// ---------------------------------------------------------------------------
// "KEZAD: what Abu Dhabi is building on the other side" - HeyGen take 5829259d (55 s, English), Abdullah Ahli's twin.
// No full-screen face: the map runs from the first frame. ONE accurate map per beat (Esri satellite, OpenStreetMap geometry via mapfx.js):
// Dubai -> Abu Dhabi along the E11, JAFZA + Jebel Ali Port and the homes around them, Khalifa Port + KEZAD (Khalifa Industrial district,
// Al Ma'mourah), the homes near KEZAD, the investor question (both job hubs feeding Ghantoot), Ghantoot between the two corridors with
// measured distances. His face is only the small round bubble top-left. Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  // ---- key times (from the spoken words)
  const K = {
    abu1: tw(/^ABU$/, 0, 1.22), side: tw(/^SIDE\.$/, 0, 2.5), called: tw(/^CALLED$/, 0, 3.24), kezad1: tw(/^KEZAD\.$/, 0, 3.44),
    think: tw(/^THINK$/, 0, 4.06), jafza: tw(/^JAFZA$/, 0, 4.86), dubai1: tw(/^DUBAI\.$/, 0, 5.52),
    biz1: tw(/^BUSINESSES$/, 0, 6.1), jebel1: tw(/^JEBEL$/, 0, 7.26), port1: tw(/^PORT$/, 0, 7.76), trade: tw(/^TRADE$/, 0, 8.16), logist1: tw(/^LOGISTICS\.$/, 0, 8.74),
    those: tw(/^THOSE$/, 0, 9.48), biz2: tw(/^BUSINESSES$/, 1, 9.9), jobs: tw(/^JOBS,$/, 0, 10.58), demand1: tw(/^DEMAND$/, 0, 11.78), homes: tw(/^HOMES$/, 0, 12.44), around: tw(/^SURROUNDING$/, 0, 12.92), areas: tw(/^AREAS\.$/, 0, 13.24),
    employ1: tw(/^EMPLOYMENT$/, 0, 14.2), live1: tw(/^LIVE\.$/, 0, 16.1),
    now: tw(/^NOW$/, 0, 16.54), corr1: tw(/^CORRIDOR$/, 0, 17.0), khalifa1: tw(/^KHALIFA$/, 0, 17.62), port2: tw(/^PORT$/, 1, 18.06), abu2: tw(/^ABU$/, 1, 18.52),
    kezad2: tw(/^KEZAD$/, 0, 19.2), khalifa2: tw(/^KHALIFA$/, 1, 20.3), econ: tw(/^ECONOMIC$/, 0, 20.76), partof: tw(/^PART$/, 0, 22.24), ad: tw(/^AD$/, 0, 22.76), group: tw(/^GROUP\.$/, 0, 23.38),
    brings: tw(/^BRINGS$/, 0, 23.98), manuf: tw(/^MANUFACTURING,$/, 0, 25.2), logist2: tw(/^LOGISTICS,$/, 0, 26.16), food: tw(/^FOOD$/, 0, 26.94), other: tw(/^INDUSTRIES\.$/, 0, 28.28),
    these: tw(/^THESE$/, 0, 28.66), wareh: tw(/^WAREHOUSES,$/, 0, 30.34), fact: tw(/^FACTORIES,$/, 0, 31.04), supply: tw(/^SUPPLY$/, 0, 32.02), employees: tw(/^EMPLOYEES$/, 0, 33.18), somewhere: tw(/^SOMEWHERE$/, 0, 33.94), live2: tw(/^LIVE\.$/, 1, 34.42),
    for1: tw(/^FOR$/, 0, 34.78, 34.5), question: tw(/^QUESTION$/, 0, 36.3), resid: tw(/^RESIDENTIAL$/, 0, 38.12), demand2: tw(/^DEMAND\.$/, 0, 38.62),
    look2: tw(/^LOOK$/, 1, 39.6), ghantoot: tw(/^GHANTOOT,$/, 0, 40.22), jebel2: tw(/^JEBEL$/, 1, 41.44), south: tw(/^SOUTH$/, 0, 42.48), oneside: tw(/^SIDE$/, 0, 43.64), abu3: tw(/^ABU$/, 3, 44.18), indus: tw(/^INDUSTRIAL$/, 0, 44.82), growth: tw(/^GROWTH$/, 0, 45.04), corr3: tw(/^CORRIDOR$/, 2, 45.52), other2: tw(/^OTHER\.$/, 0, 46.2),
    worth: tw(/^WORTH$/, 0, 47.38), but: tw(/^BUT$/, 0, 48.26), project: tw(/^PROJECT,$/, 0, 48.7), price: tw(/^PRICE,$/, 0, 49.36), commute: tw(/^COMMUTE$/, 0, 50.58), matter: tw(/^MATTER\.$/, 0, 51.18),
    comment: tw(/^COMMENT$/, 0, 51.68), area: tw(/^AREA,$/, 0, 52.1), send: tw(/^SEND$/, 0, 52.98), report: tw(/^REPORT$/, 0, 53.66), at: tw(/^AT\.$/, 0, 54.86),
  };

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [], IMAGES = {};
    const DUB = ['#FF8A5B', '#FFC7A3'], AUH = ['#3DB2FF', '#A9DEFF'], HOME = ['#2FD8A0', '#A6F3D6'], GOLD = '#E9C47C';

  // ---- the beats
  const T_B1 = [0, K.biz1 - 0.2], T_B2 = [K.biz1 - 0.2, K.now - 0.15], T_B3 = [K.now - 0.15, K.these - 0.15], T_B4 = [K.these - 0.15, K.for1 - 0.05], T_B5 = [K.for1 - 0.05, K.comment - 0.2];
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  flight('b1', T_B1, [[0, 55.13, 25.05, 10.45, 110, 12], [2.6, 54.86, 24.83, 9.75, 110, 8], [dur(T_B1) + 0.5, 54.9, 24.85, 9.95, 110, 14]]);   // opens on Dubai, pans to Abu Dhabi
  flight('b2', T_B2, [[0, 55.0, 24.95, 10.6, 120, 14], [1.1, 55.095, 25.008, 12.3, 120, 26], [dur(T_B2) + 0.5, 55.105, 25.01, 12.5, 120, 28]]);
  flight('b3', T_B3, [[0, 54.98, 24.92, 10.7, 120, 14], [1.6, 54.80, 24.76, 11.0, 120, 22], [dur(T_B3) + 0.5, 54.79, 24.75, 11.15, 120, 24]]);
  flight('b4', T_B4, [[0, 54.80, 24.73, 11.1, 110, 20], [1.0, 54.78, 24.665, 11.7, 110, 26], [dur(T_B4) + 0.5, 54.775, 24.66, 11.85, 110, 28]]);
  const r5 = t => rel(T_B5, t);                                                   // the question over both job hubs, then into Ghantoot, then out to both corridors
  flight('b5', T_B5, [[0, 54.95, 24.84, 10.3, 110, 12], [r5(K.look2), 54.94, 24.845, 10.4, 112, 14], [r5(K.ghantoot) + 0.6, 54.9, 24.86, 11.2, 118, 20], [r5(K.jebel2) + 0.7, 54.9, 24.865, 10.55, 120, 16], [dur(T_B5) + 0.5, 54.9, 24.865, 10.65, 120, 18]]);

  // ---- the face bubble (live video, small, top-left on the map beats; grows for the call to action)
  const BUBBLE = { t0: 0.1, src: { cx: 562, cy: 820, size: 600 }, keys: [{ t: 0, cx: 215, cy: 418, r: 78 }, { t: K.comment - 0.2, cx: 215, cy: 418, r: 78 }, { t: K.comment + 0.9, cx: 540, cy: 470, r: 125 }] };
  HUD_X = 330;

  const S = id => SCENES.find(s => s.id === id).cfg;
  const PT = GEO.x.points || {}, cen = k => centroid(OUTLINES[k] || [[0, 0]]), JAP = PT.jebel_ali_port || [55.0599, 24.9805], GH = PT.ghantoot || [54.9008, 24.8647], KIZ = [54.8729, 24.6757];
  S('b1').top = (t, cam) => {
    mapName(t, cam, 54.62, 25.02, 'ARABIAN GULF', 1.9, 0, { rot: -0.62, size: 26 });
    mapName(t, cam, 55.17, 25.0, 'DUBAI', 0.15, 0, { color: '#FFFFFF', size: 34, ls: 10, alpha: 0.9 });
    mapName(t, cam, 54.47, 24.52, 'ABU DHABI', K.abu1 - 0.1, 0, { color: '#FFFFFF', size: 34, ls: 10, alpha: 0.9 });
    mapRoad(t, cam, 'E11', { a0: 0.5, dur: 2.0, name: '', shields: [[54.95, 24.89], [55.0, 24.93]] });
    mapArea(t, cam, 'kezad', { c: AUH, a0: K.kezad1 - 0.2, on: [K.kezad1 - 0.15, T_B1[1]], label: 'KEZAD', sub: 'ABU DHABI', dx: -60, dy: 170, tag: 0 });
    mapArea(t, cam, 'jafza', { c: DUB, a0: K.jafza - 0.2, on: [K.jafza - 0.15, T_B1[1]], label: 'JAFZA', sub: 'DUBAI', dx: 40, dy: -150, tag: 0 });
    mapScale(t, cam, T_B1[0] + 0.4, 0);
  };
  S('b2').top = (t, cam) => {
    mapName(t, cam, 55.02, 25.07, 'ARABIAN GULF', T_B2[0] + 0.3, 0, { rot: -0.6, size: 26 });
    mapRoad(t, cam, 'E11', { a0: T_B2[0], dur: 1.4, alpha: 0.9, shields: [[55.10, 24.99], [55.08, 24.975]] });
    mapArea(t, cam, 'jafza', { c: DUB, a0: T_B2[0] + 0.3, on: [T_B2[0] + 0.5, K.those - 0.2], label: 'JAFZA', sub: 'JEBEL ALI FREE ZONE', dx: 160, dy: -170 });
    mapLandmark(t, cam, { lon: JAP[0], lat: JAP[1], a0: K.jebel1 - 0.1, text: 'JEBEL ALI PORT', icon: 'port', side: 'l', dy: 30 });
    const homes = [['dgardens', ['DISCOVERY', 'GARDENS'], 170, -210], ['furjan', ['AL FURJAN'], 200, 60], ['javillage', ['JEBEL ALI', 'VILLAGE'], -200, -90]];
    homes.forEach(([k, lab, dx, dy], i) => {
      const a = K.homes - 0.1 + i * 0.32;
      mapFlow(t, cam, cen('jafza'), cen(k), a - 0.25, 0, { dur: 0.9, bend: 0.18 });
      mapArea(t, cam, k, { c: HOME, a0: a, on: [a + 0.05, K.employ1 - 0.1 + i * 0.25], label: lab, dx, dy, tag: 0 });
    });
    mapMeasure(t, cam, JAP, cen('furjan'), { a0: K.employ1 + 0.1, to: 'AL FURJAN', at: 0.55 });
    mapScale(t, cam, T_B2[0] + 0.4, 0);
  };
  S('b3').top = (t, cam) => {
    mapName(t, cam, 54.62, 24.92, 'ARABIAN GULF', T_B3[0] + 0.3, 0, { rot: -0.62, size: 26 });
    mapRoad(t, cam, 'E11', { a0: T_B3[0] - 0.1, dur: 1.8, hi: 0.4, shields: [[54.86, 24.77], [54.83, 24.74], [54.90, 24.80]] });
    mapArea(t, cam, 'kport', { c: AUH, a0: K.khalifa1 - 0.15, on: [K.khalifa1 - 0.1, K.kezad2 - 0.1], label: ['KHALIFA', 'PORT'], dx: 150, dy: -170 });
    mapArea(t, cam, 'maamoura', { c: AUH, a0: K.kezad2 - 0.2, on: [K.kezad2 - 0.15, K.brings - 0.2], base: 0.5, tag: 0 });
    mapArea(t, cam, 'kezad', { c: AUH, a0: K.kezad2 - 0.05, on: [K.kezad2, K.manuf - 0.2], label: 'KEZAD', sub: 'KHALIFA ECONOMIC ZONES', dx: 40, dy: 180 });
    mapScale(t, cam, T_B3[0] + 0.4, 0);
  };
  S('b4').top = (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: T_B4[0] - 0.1, dur: 1.2, alpha: 0.9, shields: [[54.77, 24.70], [54.74, 24.67]] });
    mapArea(t, cam, 'kezad', { c: AUH, a0: T_B4[0], on: [T_B4[0] + 0.2, K.employees - 0.2], label: 'KEZAD', sub: 'THE EMPLOYERS', dx: 120, dy: -170 });
    [['samha', 'AL SAMHA', -150, -150], ['rahba', 'AL RAHBA', -120, 140]].forEach(([k, lab, dx, dy], i) => {
      const a = K.employees + i * 0.35;
      mapFlow(t, cam, KIZ, cen(k), a - 0.3, 0, { dur: 0.9, bend: 0.2 });
      mapArea(t, cam, k, { c: HOME, a0: a, on: [a + 0.05, T_B4[1]], label: lab, sub: 'HOMES NEAR KEZAD', dx, dy });
    });
    mapScale(t, cam, T_B4[0] + 0.4, 0);
  };
  S('b5').top = (t, cam) => {
    mapName(t, cam, 54.78, 25.06, 'ARABIAN GULF', T_B5[0] + 0.3, 0, { rot: -0.62, size: 26 });
    mapRoad(t, cam, 'E11', { a0: T_B5[0], dur: 1.6, alpha: 0.95, name: '', shields: [[54.86, 24.83], [54.94, 24.89]] });
    // the question: two job hubs, where could they feed homes? (flows converge on Ghantoot before it is named)
    mapArea(t, cam, 'jafza', { c: DUB, a0: T_B5[0] + 0.2, on: [K.question - 0.2, K.look2 - 0.3], label: 'JAFZA', sub: 'JOBS', dx: 60, dy: -150, a1: K.look2 - 0.2 });
    mapArea(t, cam, 'kezad', { c: AUH, a0: T_B5[0] + 0.45, on: [K.question, K.look2 - 0.3], label: 'KEZAD', sub: 'JOBS', dx: -40, dy: 160, a1: K.look2 - 0.2 });
    mapFlow(t, cam, cen('jafza'), GH, K.resid - 0.45, K.ghantoot + 0.9, { dur: 1.0, bend: 0.2 });
    mapFlow(t, cam, cen('kezad'), GH, K.resid - 0.2, K.ghantoot + 0.9, { dur: 1.0, bend: -0.2 });
    mapPulse(t, cam, GH[0], GH[1], 3200, K.ghantoot - 0.1, 0);
    mapLandmark(t, cam, { lon: GH[0], lat: GH[1], a0: K.ghantoot, text: 'GHANTOOT', icon: 'dot', side: 'r', dy: 34 });
    [['dwc', 1], ['expo', 2], ['jafza', 0]].forEach(([k, i]) => mapArea(t, cam, k, { c: DUB, a0: K.jebel2 - 0.15 + i * 0.25, on: i ? null : [K.jebel2 - 0.1, K.abu3 - 0.2], label: i ? null : ['JEBEL ALI ·', 'DUBAI SOUTH'], sub: 'CORRIDOR', dx: 30, dy: -170, base: 0.75, tag: 0 }));
    ['kport', 'maamoura', 'kezad'].forEach((k, i) => mapArea(t, cam, k, { c: AUH, a0: K.abu3 - 0.15 + i * 0.25, on: i < 2 ? null : [K.abu3, K.other2 + 0.2], label: i < 2 ? null : ['ABU DHABI', 'INDUSTRIAL'], sub: 'GROWTH CORRIDOR', dx: -60, dy: 170, base: 0.75, tag: 0 }));
    mapMeasure(t, cam, GH, JAP, { a0: K.other2 + 0.15, to: 'JEBEL ALI PORT', at: 0.55 });
    mapMeasure(t, cam, GH, cen('kport'), { a0: K.other2 + 0.45, to: 'KHALIFA PORT', at: 0.55 });
    mapScale(t, cam, T_B5[0] + 0.4, 0);
  };

  // ---- the chain he describes for Dubai: port -> businesses -> jobs -> homes (a row of four steps that light up as he says them)
  const chain = (t) => {
    const a0 = K.port1 - 0.2, a1 = K.now - 0.3, al = ea(t, a0, a0 + 0.4) * (1 - ea(t, a1, a1 + 0.4)); if (al <= 0.003) return;
    const steps = [['PORT', K.port1], ['BUSINESSES', K.biz2], ['JOBS', K.jobs], ['HOMES', K.homes]], X = SAFE.x0, Wd = SAFE.w, y0 = 1110, h = 128, gap = 14, w = (Wd - gap * 3) / 4;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30);
    steps.forEach(([txt, a], i) => {
      const e = ea(t, a - 0.05, a + 0.35, E.out3), x = X + i * (w + gap), on = t >= a - 0.05;
      rr(x, y0, w, h, 22); ctx.fillStyle = on ? 'rgba(14,15,18,0.92)' : 'rgba(14,15,18,0.55)'; ctx.fill();
      ctx.strokeStyle = i === 3 ? `rgba(47,216,160,${0.25 + 0.75 * e})` : `rgba(233,196,124,${0.2 + 0.8 * e})`; ctx.lineWidth = 3; ctx.stroke();
      T(String(i + 1), x + w / 2, y0 + 44, { font: F.d(800, 30), color: i === 3 ? HOME[0] : GOLD, alpha: 0.35 + 0.65 * e });
      T(txt, x + w / 2, y0 + 96, { font: F.d(800, 27), ls: 1, color: '#FFFFFF', alpha: 0.3 + 0.7 * e, sx: Math.min(1, (w - 16) / M(txt, F.d(800, 27), 1)) });
      if (i < 3) { const ax = x + w + gap / 2, ay = y0 + h / 2, ea2 = ea(t, steps[i + 1][1] - 0.25, steps[i + 1][1]); ctx.save(); ctx.globalAlpha *= 0.3 + 0.7 * ea2; ctx.beginPath(); ctx.moveTo(ax - 5, ay - 9); ctx.lineTo(ax + 5, ay); ctx.lineTo(ax - 5, ay + 9); ctx.strokeStyle = GOLD; ctx.lineWidth = 3.5; ctx.stroke(); ctx.restore(); }
    });
    ctx.restore();
  };

  const overlay = (t) => {
    hudTitle(t, 'ABU DHABI · THE OTHER SIDE', 'KEZAD', 'WHILE EVERYONE WATCHES DUBAI', T_B1[0] + 0.1, K.think - 0.15, AUH[0]);
    hudTitle(t, 'THINK ABOUT WHAT', 'JAFZA DID FOR DUBAI', 'JEBEL ALI FREE ZONE', K.think - 0.1, T_B2[1] - 0.1, DUB[0]);
    hudTitle(t, 'NOW LOOK AT ABU DHABI', 'KHALIFA PORT', 'THE CORRIDOR AROUND IT', T_B3[0] + 0.1, K.kezad2 - 0.15, AUH[0]);
    hudTitle(t, 'KEZAD', 'KHALIFA ECONOMIC ZONES', 'ABU DHABI · PART OF AD PORTS GROUP', K.kezad2 - 0.1, T_B3[1] - 0.1, AUH[0]);
    hudTitle(t, 'THE EMPLOYERS', 'WHERE DO THEY LIVE?', 'HOMES NEAR KEZAD', T_B4[0] + 0.1, T_B4[1] - 0.1, HOME[0]);
    hudTitle(t, 'FOR PROPERTY INVESTORS', 'THE QUESTION', 'WHERE WILL THE WORKERS LIVE?', T_B5[0] + 0.1, K.look2 - 0.15, GOLD);
    hudTitle(t, 'A LOCATION WORTH STUDYING', 'GHANTOOT', 'BETWEEN TWO GROWTH CORRIDORS', K.look2 - 0.1, K.but - 0.15, GOLD);
    hudTitle(t, 'GHANTOOT', 'STILL CHECK', 'BEFORE YOU BUY', K.but - 0.1, T_B5[1] - 0.1, GOLD);
    chain(t);
    breakdown(t, { title: 'KEZAD · WHO IS THERE', a0: K.brings - 0.2, a1: K.these - 0.3, items: [{ txt: 'MANUFACTURING', a: K.manuf }, { txt: 'LOGISTICS', a: K.logist2 }, { txt: 'FOOD PROCESSING', a: K.food }, { txt: 'AND OTHER INDUSTRIES', a: K.other - 0.25, gold: true }] });
    breakdown(t, { title: 'THE EMPLOYERS BEHIND', a0: K.wareh - 0.25, a1: K.employees - 0.2, items: [{ txt: 'WAREHOUSES', a: K.wareh }, { txt: 'FACTORIES', a: K.fact }, { txt: 'SUPPLY CHAINS', a: K.supply, gold: true }] });
    breakdown(t, { title: 'STILL MATTERS', a0: K.but - 0.1, a1: T_B5[1] - 0.15, items: [{ txt: 'THE PROJECT', a: K.project }, { txt: 'THE PRICE', a: K.price }, { txt: 'THE EVERYDAY COMMUTE', a: K.commute - 0.3, gold: true }] });

    // the call to action: dark background, the bubble grows, "AREA" is typed, sent and answered
    const ce = ea(t, K.comment + 0.1, K.comment + 0.8, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('ABDULLAH AHLI', CX, 690, { font: F.d(800, 62), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 744, { font: F.d(700, 34), ls: 6, color: C.gold }); ctx.restore();
      const send = K.area + 0.75, sent = ea(t, send, send + 0.35), ia = ea(t, K.comment + 0.5, K.comment + 1.0, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'AREA', typed = msg.slice(0, Math.floor(msg.length * ea(t, K.area - 0.05, K.area + 0.45, E.lin) + 0.0001));
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      T(typed, X0 + 56, iy + 20, { font: F.d(700, 60), color: C.ink, align: 'left', alpha: 1 - sent }); T('Add a comment…', X0 + 56, iy + 20, { font: F.d(700, 60), color: C.mute, align: 'left', alpha: (1 - ea(t, K.area - 0.05, K.area + 0.05)) * (1 - sent) });
      dot(X1 - 66, iy, 48, C.gold); icon('plane', X1 - 66, iy, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X1 - w, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X1 - w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'Sending you the full report', w = M(rp, F.d(700, 46)) + 130; rr(X0, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X0 + 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X0 + 112, 1102, { font: F.d(700, 46), color: C.ink, align: 'left' }); ctx.restore(); }
    }
    // name chip under the bubble while he is introduced
    const nm = ea(t, 0.5, 1.0) * (1 - ea(t, 3.6, 4.0));
    if (nm > 0.003) { ctx.save(); ctx.globalAlpha *= nm; const f = F.d(800, 26), w = M('ABDULLAH AHLI', f, 3) + 44; glassPill(130, 514, w, 46, 23); T('ABDULLAH AHLI', 130 + w / 2, 547, { font: f, ls: 3, color: '#FFFFFF' }); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  // ---- sound: very quiet whooshes on the beat changes, soft pins on the places
  [T_B2[0], T_B3[0], T_B4[0], T_B5[0], K.look2, K.comment].forEach(x => cues.push({ k: 'wh', t: x - 0.1, d: 0.5 }));
  [K.kezad1, K.jafza, K.jebel1, K.homes, K.khalifa1, K.kezad2, K.somewhere, K.ghantoot].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.area + 0.75 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 1659 };
}
