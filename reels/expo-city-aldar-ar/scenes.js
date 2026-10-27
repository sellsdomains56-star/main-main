'use strict';
// ---------------------------------------------------------------------------
// "ليش الدار اختارت إكسبو سيتي؟" - his Arabic recording (WeTransfer 27 Oct 2026, 4K 25 fps, 60.7 s, Gulf Arabic), played at 1.1x (cut.json: voice time-stretched with
// rubberband, pitch and formants kept; picture setpts=PTS/1.1) -> 55.2 s.  0 - 5.67 s: him at the podcast table, as recorded, with the opening question as Arabic
// captions; from 5.67 s the recording is BLACK with his voice only -> every beat is a real article page or the map, everything on screen in Arabic (right to left),
// no face circle.  Real pages (captured with shot_hl.mjs into assets/, not committed), flown like the map, the marker wiping right to left over the exact words:
//   Sky News Arabia 10 Oct 2024 - Aldar x Expo City Dubai partnership: a mixed-use project (homes, offices, retail), total cost "تتجاوز 1.75 مليار درهم", next to DEC
//   Emarat Al Youm 24 Sep 2024 - DEC expansion master plan, AED 10 billion; "تعزّز مكانة مدينة إكسبو كمركز اقتصادي ديناميكي، مدفوعاً بالمعارض والفعاليات العالمية"
//   WAM 28 Apr 2024 - Al Maktoum International Airport new passenger terminal, AED 128 billion
// Map: Expo 2020 district (OSM way 499367597), DEC halls (ways 750115631/2), Al Maktoum International Airport (way 214188740).  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  const K = {
    blk: 5.39,                                                       // the recording turns black at 5.67 s (1.1x): the face beat's 0.4 s cross-fade finishes there
    milyar: tw(/^المليار$/, 0, 8.86), jawab: tw(/^الجواب$/, 0, 10.6), jawab2: tw(/^الجواب$/, 1, 12.18),
    aldar2: tw(/^الدار$/, 2, 13.9), shiraka: tw(/^بشراكة$/, 0, 14.98), makatib: tw(/^مكاتب$/, 0, 18.16), sakaniya: tw(/^سكنية\.?$/, 0, 19.54),
    bas: tw(/^بس$/, 1, 20.02), qarib: tw(/^قريب$/, 0, 22.02), markaz: tw(/^مركز$/, 0, 22.5), khitta: tw(/^خطة$/, 0, 25.06),
    qarib2: tw(/^وقريب$/, 0, 27.54), matar: tw(/^مطار$/, 0, 28.66), yatjahaz: tw(/^يتجهز$/, 0, 30.64), yani: tw(/^يعني$/, 0, 32.38),
    sakan: tw(/^للسكن،?$/, 0, 34.06), tajhiz: tw(/^تجهيزها$/, 0, 35.36), aamal: tw(/^للأعمال$/, 0, 37.04), maarid: tw(/^والمعارض$/, 0, 37.6), sharikat: tw(/^والشركات\.?$/, 0, 38.1),
    taslim: tw(/^والتسليم$/, 0, 38.64), y2028: tw(/^2028\.?$/, 0, 40.56), hin: tw(/^الحين$/, 0, 41.38), hal: tw(/^هل$/, 0, 42.86), makatib2: tw(/^المكاتب$/, 0, 45.2), sanawat: tw(/^السنوات$/, 0, 47.16),
    itha: tw(/^إذا$/, 0, 48.1), tafasil: tw(/^تفاصيل$/, 0, 49.06), khitta2: tw(/^وخطة$/, 0, 50.1), uktub: tw(/^اكتب$/, 0, 51.62), expoC: tw(/^إكسبو$/, 4, 52.04), atrish: tw(/^وبأطرش$/, 0, 53.02),
  };

  const FACE_SEGS = [[0, K.blk]], PUNCHES = [], OVERLAYS = [];
  const IMAGES = { sky: 'assets/sky_aldar.png', ey: 'assets/ey_dec.png', wam: 'assets/wam_dwc.png' };
  const GOLD = '#E9C47C', BLUE = ['#3DB2FF', '#A9DEFF'], TEAL = ['#2FD8A0', '#A6F3D6'], GOLDS = ['#C99A4A', '#F3D9A4'];
  const P = GEO.x.points || {}, EXPO = P.expo || [55.1544, 24.9587], DEC = P.dec || [55.1468, 24.9625], DWC = P.dwc || [55.1593, 24.892], TERM = P.dwc_term || [55.1592, 24.8863];

  // ---- beats after the footage: every one is a real page (p_) or the map (m)
  const T_SKY1 = [K.blk, K.jawab - 0.1], T_M1 = [K.jawab - 0.1, K.aldar2 - 0.1], T_SKY2 = [K.aldar2 - 0.1, K.bas - 0.1], T_M2 = [K.bas - 0.1, K.khitta - 0.3], T_EY1 = [K.khitta - 0.3, K.qarib2 - 0.05],
    T_M3 = [K.qarib2 - 0.05, K.yatjahaz - 0.35], T_WAM = [K.yatjahaz - 0.35, K.yani - 0.05], T_M4 = [K.yani - 0.05, K.tajhiz - 0.3], T_EY2 = [K.tajhiz - 0.3, K.taslim - 0.1],
    T_M5 = [K.taslim - 0.1, K.hin - 0.1], T_M6 = [K.hin - 0.1, K.itha - 0.1], T_SKY3 = [K.itha - 0.1, K.uktub - 0.1];
  const dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  flight('m1', T_M1, [[0, 55.151, 24.9605, 15.0, 150, 30], [1.0, 55.151, 24.96, 14.5, 150, 30], [dur(T_M1) + 0.5, 55.155, 24.952, 13.0, 40, 22]]);
  flight('m2', T_M2, [[0, 55.149, 24.9615, 13.7, 150, 30], [1.5, 55.1475, 24.962, 14.75, 150, 40], [dur(T_M2) + 0.5, 55.1475, 24.962, 15.0, 150, 42]]);
  flight('m3', T_M3, [[0, 55.153, 24.95, 13.3, 60, 22], [dur(T_M3) + 0.5, 55.156, 24.922, 12.55, -60, 18]]);
  flight('m4', T_M4, [[0, 55.156, 24.926, 12.45, -10, 18], [dur(T_M4) + 0.5, 55.156, 24.926, 12.3, -10, 22]]);
  flight('m5', T_M5, [[0, 55.15, 24.9608, 14.3, 150, 32], [dur(T_M5) + 0.5, 55.1495, 24.961, 14.85, 150, 40]]);
  flight('m6', T_M6, [[0, 55.153, 24.957, 13.6, 150, 26], [dur(T_M6) + 0.5, 55.149, 24.962, 14.6, 150, 44]]);
  // the real pages (Arabic): the marker wipes right to left over the exact words
  const mk = (b, t0, t1) => ({ bbox: b, t0, t1, rtl: true });
  const page = (id, img, [a, b], keys, hl) => add({ id, kind: 'page', img, a, b, keys, hl });
  const E1 = T_EY1[0], W0 = T_WAM[0];
  page('p_sky1', 'sky', T_SKY1, [[0, 538, 330, 0.95, 0], [0.9, 538, 340, 0.98, 4], [1.7, 540, 2790, 0.97, 16], [dur(T_SKY1) + 0.5, 540, 2795, 1.0, 18]],
    [mk([187, 2759, 634, 58], K.milyar - 0.9, K.milyar + 0.9)]);
  page('p_sky2', 'sky', T_SKY2, [[0, 540, 1150, 0.9, 10], [0.7, 540, 1405, 0.97, 16], [dur(T_SKY2) + 0.5, 540, 1412, 1.0, 18]],
    [mk([266, 1304, 784, 65], K.shiraka - 0.2, K.shiraka + 0.7), mk([804, 1376, 246, 65], K.shiraka + 0.7, K.shiraka + 1.0), mk([80, 1376, 693, 65], K.makatib - 0.3, K.makatib + 0.5), mk([426, 1448, 624, 65], K.makatib + 0.5, K.sakaniya)]);
  page('p_ey1', 'ey', T_EY1, [[0, 540, 2380, 0.9, 8], [0.6, 540, 2525, 0.97, 16], [dur(T_EY1) + 0.5, 540, 2530, 1.0, 18]],
    [mk([90, 2449, 665, 50], E1 + 0.6, E1 + 1.1), mk([128, 2517, 897, 50], E1 + 1.1, E1 + 1.95), mk([930, 2584, 95, 50], E1 + 1.95, E1 + 2.15)]);
  page('p_wam', 'wam', T_WAM, [[0, 538, 330, 0.92, 0], [dur(T_WAM) + 0.5, 538, 345, 0.98, 6]],
    [mk([84, 322, 145, 85], W0 + 0.2, W0 + 0.5), mk([702, 390, 334, 85], W0 + 0.5, W0 + 1.2)]);
  page('p_ey2', 'ey', T_EY2, [[0, 540, 2120, 0.9, 10], [0.6, 540, 2240, 0.97, 16], [dur(T_EY2) + 0.5, 540, 2245, 1.0, 18]],
    [mk([91, 2202, 934, 50], K.tajhiz + 0.5, K.aamal + 0.2), mk([348, 2269, 677, 50], K.maarid - 0.1, K.sharikat + 0.3)]);
  page('p_sky3', 'sky', T_SKY3, [[0, 538, 360, 0.86, 0], [dur(T_SKY3) + 0.5, 538, 600, 0.9, 8]], []);

  const HX = SAFE.x1;                                                    // right edge of the HUD text (no face circle: the title uses the full width)
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;
  const fit = (s, f, w) => Math.min(1, w / M(s, f));

  // ---- the HUD title, mirrored for Arabic: small kicker, the name, a coloured underline and sub line, all right-aligned
  const hudAR = (t, kicker, name, sub, a0, a1, color = GOLD) => {
    const al = ea(t, a0, a0 + 0.35) * (a1 ? 1 - ea(t, a1, a1 + 0.35) : 1); if (al <= 0.003) return;
    const e = ea(t, a0, a0 + 0.7, E.out4), dy = (1 - e) * 34, MW = HX - SAFE.x0, f = F.d(800, 56), fk = F.d(700, 30), f3 = F.d(700, 31);
    ctx.save(); ctx.globalAlpha *= al; { const g = ctx.createLinearGradient(0, 270, 0, 600); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(0.2, 'rgba(8,8,10,0.62)'); g.addColorStop(0.62, 'rgba(8,8,10,0.62)'); g.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 270, W, 330); }
    ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 2 * SS;
    T(kicker, HX, 356 + dy, { font: fk, color: C.dim, align: 'right', sx: fit(kicker, fk, MW) });
    T(name, HX, 424 + dy, { font: f, color: C.ink, align: 'right', sx: fit(name, f, MW) });
    rr(HX - 120 * e, 464 + dy, 120 * e, 6, 3); ctx.fillStyle = color; ctx.fill();
    if (sub) T(sub, HX, 512 + dy, { font: f3, color, align: 'right', sx: fit(sub, f3, MW) });
    ctx.restore();
  };
  // ---- a map callout, mirrored: anchor ring, leader, dark plate with the coloured edge on the right, right-aligned Arabic
  const calloutAR = (t, cam, [lon, lat], label, sub, color, a0, a1, dx = 0, dy = -150) => {
    const al = ea(t, a0, a0 + 0.3) * (a1 ? 1 - ea(t, a1, a1 + 0.4) : 1); if (al <= 0.003) return;
    const [ax, ay] = satProj(cam, lon, lat), f = F.d(800, 36), f2 = F.d(700, 25), tw2 = Math.max(M(label, f), sub ? M(sub, f2) : 0), pw = tw2 + 70, ph = sub ? 108 : 70;
    const lx = clamp(ax + dx, SAFE.x0 + pw / 2, SAFE.x1 - pw / 2), ly = clamp(ay + dy, 640 + ph / 2, 1300 - ph / 2), e = ea(t, a0, a0 + 0.5, E.back), p = ea(t, a0 - 0.1, a0 + 0.35, E.out3);
    const ex = clamp(ax, lx - pw / 2 + 24, lx + pw / 2 - 24), ey = ay < ly ? ly - ph / 2 : ly + ph / 2, my = lerp(ay, ey, 0.55);
    ctx.save(); ctx.globalAlpha *= al; ring(ax, ay, 15, { color: '#FFFFFF', w: 3 }); dot(ax, ay, 6.5, '#FFFFFF');
    const leg = [[ax, ay], [ax, my], [ex, my], [ex, ey]].filter((q, i, arr) => !i || Math.hypot(q[0] - arr[i - 1][0], q[1] - arr[i - 1][1]) > 0.5);
    strokePoly(leg, p, { color: 'rgba(8,9,11,0.6)', w: 6 }); strokePoly(leg, p, { color: '#FFFFFF', w: 2.5 });
    ctx.translate(lx, ly); ctx.scale(lerp(0.88, 1, e), lerp(0.88, 1, e)); ctx.globalAlpha *= clamp(e * 1.4);
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18 * SS; rr(-pw / 2, -ph / 2, pw, ph, 18); ctx.fillStyle = 'rgba(10,11,14,0.9)'; ctx.fill(); ctx.shadowColor = 'transparent';
    rr(pw / 2 - 10, -ph / 2, 10, ph, [0, 18, 18, 0]); ctx.fillStyle = color; ctx.fill();
    T(label, pw / 2 - 34, -ph / 2 + 48, { font: f, color: '#FFFFFF', align: 'right' });
    if (sub) T(sub, pw / 2 - 34, ph / 2 - 20, { font: f2, color, align: 'right' });
    ctx.restore();
  };
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 25), w = M(txt, f) + 48; ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 54, 27); T(txt, CX, 1209, { font: f, color: '#FFFFFF' }); ctx.restore(); };
  const chip = (t, txt, a0, a1, y = 1150, color = GOLD) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 31), w = M(txt, f) + 64; ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0)); glassPill(CX - w / 2, y, w, 66, 33); T(txt, CX, y + 44, { font: f, color }); ctx.restore(); };
  const rings = (t, cam, [lon, lat], a0, a1, m = 3800) => { const al = win(t, a0, a1); if (al <= 0.003) return; const [x, y] = satProj(cam, lon, lat); for (let i = 0; i < 3; i++) { const u = ((t - a0) / 1.8 + i / 3) % 1; ring(x, y, m * (0.15 + 0.85 * u) / mpp(cam, lat), { color: 'rgb(233,196,124)', w: 6, alpha: (1 - u) * 0.9 * al }); } };

  // ---- the maps
  SCENES.find(s => s.id === 'm1').cfg.top = (t, cam) => {          // the answer is around the project
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M1[0] + 0.1, dur: 1.0, on: [T_M1[0] + 0.3, T_M1[1]] });
    calloutAR(t, cam, EXPO, 'إكسبو سيتي دبي', 'منطقة إكسبو 2020', GOLD, T_M1[0] + 0.5, K.jawab2 - 0.1, 0, -170);
    rings(t, cam, EXPO, K.jawab2 - 0.1, T_M1[1]);
  };
  SCENES.find(s => s.id === 'm2').cfg.top = (t, cam) => {          // look at the location: next to the Dubai Exhibition Centre
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M2[0] - 2, dur: 0.1, base: 0.35 });
    mapArea(t, cam, 'dec_n', { c: BLUE, a0: K.markaz - 0.3, dur: 0.8, on: [K.markaz - 0.2, T_M2[1]] });
    mapArea(t, cam, 'dec_s', { c: BLUE, a0: K.markaz - 0.1, dur: 0.8, on: [K.markaz, T_M2[1]] });
    calloutAR(t, cam, DEC, 'مركز دبي للمعارض', 'توسعة كبرى قادمة', BLUE[1], K.markaz + 0.1, 0, 120, -190);
    chip(t, 'مشروع الدار بجانب المركز', K.qarib - 0.2, T_M2[1]);
  };
  SCENES.find(s => s.id === 'm3').cfg.top = (t, cam) => {          // and near Al Maktoum International Airport
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M3[0] - 2, dur: 0.1, base: 0.6 });
    mapArea(t, cam, 'dec_n', { c: BLUE, a0: T_M3[0] - 2, dur: 0.1, base: 0.5 }); mapArea(t, cam, 'dec_s', { c: BLUE, a0: T_M3[0] - 2, dur: 0.1, base: 0.5 });
    mapArea(t, cam, 'dwc', { c: TEAL, a0: K.matar - 0.4, dur: 1.0, on: [K.matar - 0.2, T_M3[1]] });
    mapFlow(t, cam, EXPO, TERM, K.qarib2, 0, { dur: 1.1, bend: 0.12 });
    calloutAR(t, cam, EXPO, 'إكسبو سيتي', '', GOLD, T_M3[0] + 0.2, K.matar, -150, -120);
    calloutAR(t, cam, DWC, 'مطار آل مكتوم الدولي', 'توسعة جداً ضخمة', TEAL[1], K.matar + 0.2, 0, 0, 260);
  };
  SCENES.find(s => s.id === 'm4').cfg.top = (t, cam) => {          // the whole area: not only a place to live
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M4[0] + 0.05, dur: 0.6, on: [T_M4[0] + 0.1, T_M4[1]] });
    mapArea(t, cam, 'dec_n', { c: BLUE, a0: T_M4[0] + 0.2, dur: 0.6, on: [T_M4[0] + 0.3, T_M4[1]] }); mapArea(t, cam, 'dec_s', { c: BLUE, a0: T_M4[0] + 0.2, dur: 0.6, on: [T_M4[0] + 0.3, T_M4[1]] });
    mapArea(t, cam, 'dwc', { c: TEAL, a0: T_M4[0] + 0.35, dur: 0.8, on: [T_M4[0] + 0.5, T_M4[1]] });
    rings(t, cam, [(EXPO[0] + DWC[0]) / 2, (EXPO[1] + DWC[1]) / 2], T_M4[0] + 0.4, T_M4[1], 7000);
    chip(t, 'ليست وجهة للسكن فقط', K.sakan - 0.35, T_M4[1], 1160);
  };
  SCENES.find(s => s.id === 'm5').cfg.top = (t, cam) => {          // the expected handover he gives
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M5[0] - 2, dur: 0.1, base: 0.5 });
    mapArea(t, cam, 'dec_n', { c: BLUE, a0: T_M5[0] - 2, dur: 0.1, on: [T_M5[0], T_M5[1]] }); mapArea(t, cam, 'dec_s', { c: BLUE, a0: T_M5[0] - 2, dur: 0.1, on: [T_M5[0], T_M5[1]] });
    calloutAR(t, cam, EXPO, 'إكسبو سيتي دبي', '', GOLD, T_M5[0] + 0.2, 0, -120, -170);
    const ye = win(t, K.y2028 - 0.5, T_M5[1]); if (ye > 0.003) {                  // the year he gives, big
      ctx.save(); ctx.globalAlpha *= ye; ctx.translate(0, slide(t, K.y2028 - 0.5)); glassPill(CX - 230, 1030, 460, 230, 34);
      T('التسليم المتوقع للمشروع', CX, 1090, { font: F.d(800, 32), color: GOLD }); T('2028', CX, 1214, { font: F.d(800, 120), color: '#FFFFFF', sx: lerp(0.9, 1, ea(t, K.y2028 - 0.5, K.y2028 + 0.2, E.back)) }); ctx.restore(); }
  };
  SCENES.find(s => s.id === 'm6').cfg.top = (t, cam) => {          // the question, over Expo City
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M6[0] + 0.1, dur: 0.8, on: [T_M6[0] + 0.2, T_M6[1]] });
    const qa = win(t, K.hal - 0.2, T_M6[1]); if (qa > 0.003) {
      ctx.save(); ctx.globalAlpha *= qa; ctx.translate(0, slide(t, K.hal - 0.2)); glassPill(SAFE.x0, 1010, SAFE.w, 240, 32); rr(SAFE.x1 - 10, 1010, 10, 240, [0, 32, 32, 0]); ctx.fillStyle = GOLD; ctx.fill();
      T('هل تصبح إكسبو سيتي', SAFE.x1 - 44, 1080, { font: F.d(800, 46), color: '#FFFFFF', align: 'right' });
      const l2 = 'من أهم وجهات المكاتب التجارية في دبي؟'; T(l2, SAFE.x1 - 44, 1150, { font: F.d(800, 40), color: GOLD, align: 'right', alpha: ea(t, K.makatib2 - 0.3, K.makatib2 + 0.2), sx: fit(l2, F.d(800, 40), SAFE.w - 80) });
      T('خلال السنوات القادمة', SAFE.x1 - 44, 1212, { font: F.d(800, 30), color: C.dim, align: 'right', alpha: ea(t, K.sanawat - 0.2, K.sanawat + 0.2) });
      ctx.restore(); }
  };
  // ---- what he will send, over the Sky News Arabia page (the project): the project details and the area's development plan
  const details = (t) => {
    const a0 = T_SKY3[0] + 0.2, a1 = T_SKY3[1], al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    glassPill(SAFE.x0, 1020, SAFE.w, 250, 32); rr(SAFE.x1 - 10, 1020, 10, 250, [0, 32, 32, 0]); ctx.fillStyle = GOLD; ctx.fill();
    T('التفاصيل الكاملة', SAFE.x1 - 44, 1080, { font: F.d(800, 32), color: GOLD, align: 'right' });
    [['تفاصيل مشروع الدار', K.tafasil], ['خطة تطوير المنطقة', K.khitta2]].forEach(([s2, a], i) => {
      const e = ea(t, a - 0.2, a + 0.3, E.out4); if (e <= 0.003) return; const y = 1158 + i * 72;
      ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * 34, 0); dot(SAFE.x1 - 66, y - 13, 19, GOLD); icon('check', SAFE.x1 - 66, y - 12, 10, { p: ea(t, a, a + 0.4), color: '#0A0A0B', w: 4 });
      T(s2, SAFE.x1 - 102, y, { font: F.d(800, 38), color: '#FFFFFF', align: 'right' }); ctx.restore();
    });
    ctx.restore();
  };

  const overlay = (t) => {
    hudAR(t, 'الدار · من أبوظبي إلى دبي', 'لماذا إكسبو سيتي؟', 'مشروع بأكثر من 1.75 مليار درهم', T_SKY1[0] + 0.1, T_SKY1[1] - 0.1);
    hudAR(t, 'الجواب', 'ما يحدث حول المشروع', 'إكسبو سيتي دبي', T_M1[0] + 0.05, T_M1[1] - 0.1);
    hudAR(t, 'أكتوبر 2024', 'الدار × إكسبو سيتي دبي', 'مكاتب · محلات · وحدات سكنية', T_SKY2[0] + 0.05, T_SKY2[1] - 0.1);
    hudAR(t, 'شوفوا الموقع', 'بجانب مركز دبي للمعارض', 'المركز المستقبلي للمعارض', T_M2[0] + 0.05, T_EY1[1] - 0.1, BLUE[1]);
    hudAR(t, 'وقريب أيضاً من', 'مطار آل مكتوم الدولي', 'مبنى مسافرين بـ 128 مليار درهم', T_M3[0] + 0.05, T_WAM[1] - 0.1, TEAL[1]);
    hudAR(t, 'يعني المنطقة', 'أكثر من وجهة سكن', 'مركز للأعمال والمعارض والشركات', T_M4[0] + 0.05, T_EY2[1] - 0.1);
    hudAR(t, 'الموعد', 'التسليم المتوقع', 'للمشروع', T_M5[0] + 0.05, T_M5[1] - 0.1);
    hudAR(t, 'الحين السؤال', 'وجهة مكاتب جديدة؟', 'إكسبو سيتي دبي', T_M6[0] + 0.05, T_M6[1] - 0.1);
    hudAR(t, 'تبغى تعرف أكثر؟', 'التفاصيل', 'مشروع الدار وخطة تطوير المنطقة', T_SKY3[0] + 0.05, T_SKY3[1] - 0.1);
    srcChip(t, 'سكاي نيوز عربية · 10 أكتوبر 2024', T_SKY1[0] + 0.4, T_SKY1[1] - 0.15);
    srcChip(t, 'سكاي نيوز عربية · 10 أكتوبر 2024', T_SKY2[0] + 0.3, T_SKY2[1] - 0.15);
    srcChip(t, 'الإمارات اليوم · 24 سبتمبر 2024', T_EY1[0] + 0.25, T_EY1[1] - 0.15);
    srcChip(t, 'وام · 28 أبريل 2024', T_WAM[0] + 0.25, T_WAM[1] - 0.15);
    srcChip(t, 'الإمارات اليوم · 24 سبتمبر 2024', T_EY2[0] + 0.25, T_EY2[1] - 0.15);
    details(t);

    // the comment: "اكتب إكسبو في التعليقات" - typed, sent, answered; then the end card with his name
    const ce = ea(t, K.uktub - 0.1, K.uktub + 0.6, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('عبدالله أهلي', CX, 620, { font: F.d(800, 80), color: C.ink }); T('ABDULLAH AHLI', CX, 684, { font: F.d(700, 32), ls: 6, color: C.gold }); ctx.restore();
      const send = K.atrish - 0.1, sent = ea(t, send, send + 0.35), ia = ea(t, K.uktub + 0.2, K.uktub + 0.7, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'إكسبو';
      const typed = ea(t, K.expoC - 0.05, K.expoC + 0.35, E.lin);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      if (typed > 0.01) { ctx.save(); ctx.beginPath(); ctx.rect(X1 - 56 - M(msg, F.d(700, 58)) * typed - 4, iy - 60, M(msg, F.d(700, 58)) * typed + 8, 120); ctx.clip(); T(msg, X1 - 56, iy + 20, { font: F.d(700, 58), color: C.ink, align: 'right', alpha: 1 - sent }); ctx.restore(); }   // typed right to left
      T('أضف تعليقاً…', X1 - 56, iy + 20, { font: F.d(700, 52), color: C.mute, align: 'right', alpha: (1 - ea(t, K.expoC - 0.05, K.expoC + 0.05)) * (1 - sent) });
      dot(X0 + 66, iy, 48, C.gold); ctx.save(); ctx.translate(X0 + 66, iy); ctx.scale(-1, 1); icon('plane', 0, 0, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore(); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, F.d(700, 58)) + 84; rr(X0, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X0 + w / 2, 975, { font: F.d(700, 58), color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'بأرسل لك التفاصيل', f = F.d(700, 46), w = Math.min(BW, M(rp, f) + 130); rr(X1 - w, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X1 - 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X1 - 112, 1102, { font: f, color: C.ink, align: 'right' }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  [T_SKY1[0], T_M1[0], T_SKY2[0], T_M2[0], T_EY1[0], T_M3[0], T_WAM[0], T_M4[0], T_EY2[0], T_M5[0], T_M6[0], T_SKY3[0], K.uktub].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.milyar, K.aamal, K.maarid, K.sharikat, K.y2028].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.atrish - 0.1 });
  // captions: only the opening question (his recording + the first page), in Arabic
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, FOOT_MAX: 1655, NO_CAPTIONS: false, CAP_UNTIL: K.jawab - 0.15, STATIC_FACE: true };
}
