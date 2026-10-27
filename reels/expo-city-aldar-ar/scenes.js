'use strict';
// ---------------------------------------------------------------------------
// "ليش الدار اختارت إكسبو سيتي؟" - his Arabic recording (WeTransfer 27 Oct 2026, 4K 25 fps, 60.7 s, Gulf Arabic).  0 - 6.24 s: him at the podcast table, as recorded;
// 6.24 s to the end the recording is BLACK with his voice only -> all animation, everything on screen in Arabic (right to left), his face as a small still circle.
// Facts on screen come from real pages (captured with shot_hl.mjs into assets/, not committed), flown like the map with a marker on the exact words:
//   Sky News Arabia 10 Oct 2024 - Aldar x Expo City Dubai partnership: a mixed-use project (homes, offices, retail), total cost "تتجاوز 1.75 مليار درهم", next to DEC
//   Emarat Al Youm 24 Sep 2024 - Mohammed bin Rashid approves the Dubai Exhibition Centre expansion master plan, AED 10 billion
//   WAM 28 Apr 2024 - Al Maktoum International Airport new passenger terminal, AED 128 billion
// Map: Expo 2020 district (OSM way 499367597), DEC halls (ways 750115631/2), Al Maktoum International Airport (way 214188740).  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s) => { SCENES.push(s); return s; };

  const K = {
    blk: 6.24, milyar: tw(/^المليار$/, 0, 9.78), jawab: tw(/^الجواب$/, 0, 11.66), jawab2: tw(/^الجواب$/, 1, 13.4),
    aldar2: tw(/^الدار$/, 2, 15.3), shiraka: tw(/^بشراكة$/, 0, 16.46), makatib: tw(/^مكاتب$/, 0, 19.98), mahallat: tw(/^ومحلات$/, 0, 20.56), sakaniya: tw(/^سكنية\.?$/, 0, 21.5),
    bas: tw(/^بس$/, 1, 22.0), shufu: tw(/^شوفوا$/, 0, 22.66), qarib: tw(/^قريب$/, 0, 24.22), markaz: tw(/^مركز$/, 0, 24.74), khitta: tw(/^خطة$/, 0, 27.56), m10: tw(/^10$/, 0, 28.84),
    qarib2: tw(/^وقريب$/, 0, 30.28), matar: tw(/^مطار$/, 0, 31.52), yatjahaz: tw(/^يتجهز$/, 0, 33.7), yani: tw(/^يعني$/, 0, 35.62),
    sakan: tw(/^للسكن،?$/, 0, 37.46), tajhiz: tw(/^تجهيزها$/, 0, 38.92), aamal: tw(/^للأعمال$/, 0, 40.76), maarid: tw(/^والمعارض$/, 0, 41.36), sharikat: tw(/^والشركات\.?$/, 0, 41.9),
    taslim: tw(/^والتسليم$/, 0, 42.5), y2028: tw(/^2028\.?$/, 0, 44.62), hin: tw(/^الحين$/, 0, 45.48), hal: tw(/^هل$/, 0, 47.14), makatib2: tw(/^المكاتب$/, 0, 49.72), sanawat: tw(/^السنوات$/, 0, 51.88),
    itha: tw(/^إذا$/, 0, 52.86), tafasil: tw(/^تفاصيل$/, 0, 53.96), khitta2: tw(/^وخطة$/, 0, 55.1), uktub: tw(/^اكتب$/, 0, 56.78), expoC: tw(/^إكسبو$/, 4, 57.24), atrish: tw(/^وبأطرش$/, 0, 58.28),
  };

  const FACE_SEGS = [[0, K.blk]], PUNCHES = [], OVERLAYS = [];
  const IMAGES = { portrait: 'assets/portrait.jpg', sky: 'assets/sky_aldar.png', ey: 'assets/ey_dec.png', wam: 'assets/wam_dwc.png' };
  const GOLD = '#E9C47C', SOFT = '#F3D9A4', BLUE = ['#3DB2FF', '#A9DEFF'], TEAL = ['#2FD8A0', '#A6F3D6'], GOLDS = ['#C99A4A', '#F3D9A4'];
  const P = GEO.x.points || {}, EXPO = P.expo || [55.1544, 24.9587], DEC = P.dec || [55.1468, 24.9625], DWC = P.dwc || [55.1593, 24.892], TERM = P.dwc_term || [55.1592, 24.8863];

  // ---- beats: the black part of the recording, one background per beat
  const T_B1 = [K.blk, K.jawab - 0.1], T_M1 = [K.jawab - 0.1, K.aldar2 - 0.1], T_SKY = [K.aldar2 - 0.1, K.bas - 0.1], T_M2 = [K.bas - 0.1, K.khitta - 0.3], T_EY = [K.khitta - 0.3, K.qarib2 - 0.05],
    T_M3 = [K.qarib2 - 0.05, K.yatjahaz - 0.35], T_WAM = [K.yatjahaz - 0.35, K.yani - 0.05], T_HUB = [K.yani - 0.05, K.taslim - 0.1], T_28 = [K.taslim - 0.1, K.hin - 0.1], T_Q = [K.hin - 0.1, K.itha - 0.1], T_CTA = [K.itha - 0.1, K.uktub - 0.1];
  const rel = (T, t) => t - T[0], dur = T => T[1] - T[0];
  const flight = (id, [a, b], keys) => { SAT_SCENES[id] = { a, b, veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a, b, cfg: {} }); return SAT_SCENES[id]; };
  flight('m1', T_M1, [[0, 55.151, 24.9605, 15.0, 150, 30], [1.0, 55.151, 24.9600, 14.5, 150, 30], [dur(T_M1) + 0.5, 55.155, 24.952, 13.0, 40, 22]]);
  flight('m2', T_M2, [[0, 55.149, 24.9615, 13.7, 150, 30], [1.5, 55.1475, 24.962, 14.75, 150, 40], [dur(T_M2) + 0.5, 55.1475, 24.962, 15.0, 150, 42]]);
  flight('m3', T_M3, [[0, 55.153, 24.95, 13.3, 60, 22], [dur(T_M3) + 0.5, 55.156, 24.922, 12.55, -60, 18]]);
  // the real pages (Arabic): the marker wipes right to left over the exact words
  const mk = (b, t0, t1) => ({ bbox: b, t0, t1, rtl: true });
  const page = (id, img, [a, b], keys, hl) => add({ id, kind: 'page', img, a, b, keys, hl });
  const S0 = T_SKY[0], E0 = T_EY[0], W0 = T_WAM[0];
  page('p_sky', 'sky', T_SKY, [[0, 538, 330, 0.95, 0], [0.7, 538, 340, 0.98, 4], [1.4, 540, 1405, 0.97, 16], [dur(T_SKY) + 0.5, 540, 1412, 1.0, 18]],
    [mk([266, 1304, 784, 65], K.shiraka - 0.2, K.shiraka + 0.7), mk([804, 1376, 246, 65], K.shiraka + 0.7, K.shiraka + 1.0), mk([80, 1376, 693, 65], K.makatib - 0.3, K.makatib + 0.5), mk([426, 1448, 624, 65], K.makatib + 0.5, K.sakaniya)]);
  page('p_ey', 'ey', T_EY, [[0, 540, 2380, 0.9, 8], [0.7, 540, 2525, 0.97, 16], [dur(T_EY) + 0.5, 540, 2530, 1.0, 18]],
    [mk([90, 2449, 665, 50], E0 + 0.7, E0 + 1.2), mk([128, 2517, 897, 50], E0 + 1.2, E0 + 2.1), mk([930, 2584, 95, 50], E0 + 2.1, E0 + 2.3)]);
  page('p_wam', 'wam', T_WAM, [[0, 538, 330, 0.92, 0], [dur(T_WAM) + 0.5, 538, 345, 0.98, 6]],
    [mk([84, 322, 145, 85], W0 + 0.2, W0 + 0.5), mk([702, 390, 334, 85], W0 + 0.5, W0 + 1.2)]);

  // his face: a small still circle top-right (the recording is black after 6.24 s); it grows to the centre for the end card
  const BUBBLE = { img: 'portrait', t0: K.blk - 0.05, keys: [{ t: 0, cx: 865, cy: 418, r: 78 }, { t: K.uktub - 0.2, cx: 865, cy: 418, r: 78 }, { t: K.uktub + 0.9, cx: 540, cy: 470, r: 125 }] };
  const HX = 765;                                                        // right edge of the HUD text (left of the bubble)
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;
  const fit = (s, f, w) => Math.min(1, w / M(s, f));

  // ---- the HUD title, mirrored for Arabic: small kicker, the name, a coloured underline and sub line, all right-aligned next to the bubble
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

  // ---- the three maps
  SCENES.find(s => s.id === 'm1').cfg.top = (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M1[0] + 0.1, dur: 1.0, on: [T_M1[0] + 0.3, T_M1[1]] });
    calloutAR(t, cam, EXPO, 'إكسبو سيتي دبي', 'منطقة إكسبو 2020', GOLD, T_M1[0] + 0.5, K.jawab2 - 0.1, 0, -170);
    if (t > K.jawab2 - 0.1) for (let i = 0; i < 3; i++) { const u = ((t - K.jawab2 + 0.1) / 1.8 + i / 3) % 1, [x, y] = satProj(cam, EXPO[0], EXPO[1]), R = 3800 * (0.15 + 0.85 * u) / mpp(cam, EXPO[1]); ring(x, y, R, { color: 'rgb(233,196,124)', w: 6, alpha: (1 - u) * 0.9 * ea(t, K.jawab2 - 0.1, K.jawab2 + 0.4) }); }
  };
  SCENES.find(s => s.id === 'm2').cfg.top = (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M2[0] - 2, dur: 0.1, base: 0.35 });
    mapArea(t, cam, 'dec_n', { c: BLUE, a0: K.markaz - 0.3, dur: 0.8, on: [K.markaz - 0.2, T_M2[1]] });
    mapArea(t, cam, 'dec_s', { c: BLUE, a0: K.markaz - 0.1, dur: 0.8, on: [K.markaz, T_M2[1]] });
    calloutAR(t, cam, DEC, 'مركز دبي للمعارض', 'توسعة كبرى قادمة', BLUE[1], K.markaz + 0.1, 0, 120, -190);
    const ce = win(t, K.qarib - 0.2, T_M2[1]); if (ce > 0.003) { const txt = 'مشروع الدار بجانب المركز', f = F.d(800, 30), w = M(txt, f) + 60; ctx.save(); ctx.globalAlpha *= ce; ctx.translate(0, slide(t, K.qarib - 0.2)); glassPill(CX - w / 2, 1150, w, 64, 32); T(txt, CX, 1193, { font: f, color: GOLD }); ctx.restore(); }
  };
  SCENES.find(s => s.id === 'm3').cfg.top = (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: T_M3[0] - 2, dur: 0.1, base: 0.6 });
    mapArea(t, cam, 'dec_n', { c: BLUE, a0: T_M3[0] - 2, dur: 0.1, base: 0.5 }); mapArea(t, cam, 'dec_s', { c: BLUE, a0: T_M3[0] - 2, dur: 0.1, base: 0.5 });
    mapArea(t, cam, 'dwc', { c: TEAL, a0: K.matar - 0.4, dur: 1.0, on: [K.matar - 0.2, T_M3[1]] });
    mapFlow(t, cam, EXPO, TERM, K.qarib2, 0, { dur: 1.1, bend: 0.12 });
    calloutAR(t, cam, EXPO, 'إكسبو سيتي', '', GOLD, T_M3[0] + 0.2, K.matar, -150, -120);
    calloutAR(t, cam, DWC, 'مطار آل مكتوم الدولي', 'توسعة جداً ضخمة', TEAL[1], K.matar + 0.2, 0, 0, 260);
  };

  // ---- icons for the animated beats
  const glyph = (k, x, y, s, c) => {
    ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (k === 'home') { ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.8); ctx.lineTo(x - s, y - s * 0.1); ctx.lineTo(x, y - s); ctx.lineTo(x + s, y - s * 0.1); ctx.lineTo(x + s, y + s * 0.8); ctx.closePath(); ctx.stroke(); rr(x - s * 0.25, y + s * 0.2, s * 0.5, s * 0.6, 3); ctx.stroke(); }
    if (k === 'tower') { rr(x - s * 0.55, y - s, s * 1.1, s * 1.9, 6); ctx.stroke(); for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 2; c2++) rr(x - s * 0.32 + c2 * s * 0.4, y - s * 0.75 + r * s * 0.4, s * 0.24, s * 0.22, 2), ctx.fill(); }
    if (k === 'case') { rr(x - s, y - s * 0.45, s * 2, s * 1.35, 8); ctx.stroke(); rr(x - s * 0.4, y - s * 0.85, s * 0.8, s * 0.4, 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - s, y + s * 0.1); ctx.lineTo(x + s, y + s * 0.1); ctx.stroke(); }
    if (k === 'hall') { ctx.beginPath(); ctx.moveTo(x - s * 1.1, y - s * 0.2); ctx.quadraticCurveTo(x, y - s * 1.1, x + s * 1.1, y - s * 0.2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - s * 1.1, y - s * 0.2); ctx.lineTo(x - s * 1.1, y + s * 0.8); ctx.lineTo(x + s * 1.1, y + s * 0.8); ctx.lineTo(x + s * 1.1, y - s * 0.2); ctx.stroke(); for (let i = -1; i <= 1; i++) rr(x + i * s * 0.6 - s * 0.14, y + s * 0.15, s * 0.28, s * 0.65, 3), ctx.fill(); }
    ctx.restore();
  };

  // ---- 1: the question - why Expo City? a project of more than AED 1.75 billion (as the Sky News Arabia page says: "بتكلفة إجمالية تتجاوز 1.75 مليار درهم")
  const value = (t) => {
    const a0 = T_B1[0] + 0.1, a1 = T_B1[1], al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    T('بتكلفة إجمالية تتجاوز', CX, 760, { font: F.d(800, 40), color: GOLD, alpha: ea(t, a0 + 0.3, a0 + 0.7) });
    const v = 1.75 * ea(t, a0 + 0.2, K.milyar + 0.4, E.out3);
    T(v.toFixed(2), CX, 935, { font: F.d(800, 190), color: '#FFFFFF' });
    T('مليار درهم', CX, 1040, { font: F.d(800, 64), color: '#FFFFFF', alpha: ea(t, a0 + 0.4, a0 + 0.8) });
    const pe = ea(t, K.milyar + 0.6, K.milyar + 1.0); if (pe > 0.003) { const txt = 'مشروع متعدد الاستخدامات في إكسبو سيتي دبي', f = F.d(800, 30), w = M(txt, f) + 64; ctx.save(); ctx.globalAlpha *= pe; glassPill(CX - w / 2, 1110, w, 64, 32); T(txt, CX, 1153, { font: f, color: '#FFFFFF' }); ctx.restore(); }
    ctx.restore();
  };
  // ---- 2: not just homes - a hub for business, exhibitions and companies
  const hub = (t) => {
    const a0 = T_HUB[0] + 0.1, a1 = T_HUB[1], al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al;
    const tiles = [['home', 'سكن', K.sakan - 0.3, false], ['case', 'أعمال', K.aamal - 0.1, true], ['hall', 'معارض', K.maarid - 0.1, true], ['tower', 'شركات', K.sharikat - 0.1, true]];
    const tw3 = 390, th = 250, gap = 40, x0 = CX - tw3 - gap / 2, y0 = 700;
    tiles.forEach(([g, lab, a, gold], i) => {
      const e = ea(t, a, a + 0.45, E.back); if (e <= 0.003) return;
      const col = i % 2, row = Math.floor(i / 2), x = col ? x0 : x0 + tw3 + gap, y = y0 + row * (th + gap);   // right to left: the first tile on the right
      const dim = !gold ? 1 - 0.55 * ea(t, K.tajhiz - 0.2, K.tajhiz + 0.3) : 1;
      ctx.save(); ctx.globalAlpha *= clamp(e) * dim; ctx.translate(x + tw3 / 2, y + th / 2); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e));
      glassPill(-tw3 / 2, -th / 2, tw3, th, 30); if (gold) { rr(-tw3 / 2, -th / 2, tw3, th, 30); ctx.strokeStyle = 'rgba(233,196,124,0.85)'; ctx.lineWidth = 3; ctx.stroke(); }
      glyph(g, 0, -32, 42, gold ? GOLD : '#FFFFFF'); T(lab, 0, 86, { font: F.d(800, 48), color: gold ? GOLD : '#FFFFFF' });
      ctx.restore();
    });
    const ne = ea(t, K.sakan - 0.1, K.sakan + 0.3); if (ne > 0.003) T('ليست وجهة للسكن فقط', CX, 1300, { font: F.d(800, 40), color: '#FFFFFF', alpha: ne * (1 - ea(t, K.tajhiz - 0.2, K.tajhiz + 0.2)) });
    const me = ea(t, K.tajhiz - 0.1, K.tajhiz + 0.3); if (me > 0.003) T('مركز للأعمال والمعارض والشركات', CX, 1300, { font: F.d(800, 40), color: GOLD, alpha: me });
    ctx.restore();
  };
  // ---- 3: the expected handover he gives (2028)
  const handover = (t) => {
    const a0 = T_28[0] + 0.1, a1 = T_28[1], al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    glassPill(SAFE.x0, 700, SAFE.w, 470, 34);
    T('التسليم المتوقع للمشروع', CX, 790, { font: F.d(800, 42), color: GOLD });
    T('2028', CX, 960, { font: F.d(800, 170), color: '#FFFFFF', alpha: ea(t, K.y2028 - 0.25, K.y2028 + 0.15), sx: lerp(0.9, 1, ea(t, K.y2028 - 0.25, K.y2028 + 0.4, E.back)) });
    const lx0 = SAFE.x1 - 120, lx1 = SAFE.x0 + 120, ly = 1075, p = ea(t, a0 + 0.3, K.y2028 + 0.2, E.inOut2);   // right to left: 2024 on the right, 2028 on the left
    line(lx0, ly, lx1, ly, { color: 'rgba(243,239,230,0.18)', w: 6 }); line(lx0, ly, lerp(lx0, lx1, p), ly, { color: GOLD, w: 6 });
    dot(lx0, ly, 13, GOLD); dot(lx1, ly, 13, p > 0.98 ? GOLD : 'rgba(243,239,230,0.35)');
    T('2024 · الإعلان', lx0, ly + 52, { font: F.d(800, 26), color: C.dim }); T('2028 · التسليم', lx1, ly + 52, { font: F.d(800, 26), color: p > 0.98 ? GOLD : C.dim });
    ctx.restore();
  };
  // ---- 4: the question - could Expo City become one of Dubai's top office destinations?
  const question = (t) => {
    const a0 = T_Q[0] + 0.1, a1 = T_Q[1], al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al;
    const hs = [150, 230, 190], bx = [CX + 150, CX, CX - 150];
    hs.forEach((h, i) => { const e = ea(t, K.hal + i * 0.25, K.hal + 0.9 + i * 0.25, E.out3); if (e <= 0.003) return; const x = bx[i] - 55, hh = h * e, y = 960 - hh;
      ctx.save(); const g = ctx.createLinearGradient(0, y, 0, 960); g.addColorStop(0, 'rgba(233,196,124,0.95)'); g.addColorStop(1, 'rgba(233,196,124,0.2)'); rr(x, y, 110, hh, 10); ctx.fillStyle = g; ctx.fill();
      for (let r = 0; r * 34 + 24 < hh - 10; r++) for (let c2 = 0; c2 < 3; c2++) { rr(x + 16 + c2 * 30, y + 18 + r * 34, 18, 16, 3); ctx.fillStyle = 'rgba(10,10,12,0.55)'; ctx.fill(); }
      ctx.restore(); });
    T('؟', CX + 290, 780, { font: F.d(800, 170), color: GOLD, alpha: ea(t, K.hal - 0.1, K.hal + 0.3) });
    line(SAFE.x0 + 60, 962, SAFE.x1 - 60, 962, { color: 'rgba(243,239,230,0.3)', w: 3 });
    T('هل تصبح إكسبو سيتي', CX, 1060, { font: F.d(800, 50), color: '#FFFFFF', alpha: ea(t, K.hal - 0.1, K.hal + 0.3) });
    T('من أهم وجهات المكاتب التجارية في دبي؟', CX, 1130, { font: F.d(800, 44), color: GOLD, alpha: ea(t, K.makatib2 - 0.3, K.makatib2 + 0.2), sx: fit('من أهم وجهات المكاتب التجارية في دبي؟', F.d(800, 44), SAFE.w) });
    T('خلال السنوات القادمة', CX, 1196, { font: F.d(800, 32), color: C.dim, alpha: ea(t, K.sanawat - 0.2, K.sanawat + 0.2) });
    ctx.restore();
  };
  // ---- 5: what he will send - the project details and the area's development plan
  const details = (t) => {
    const a0 = T_CTA[0] + 0.1, a1 = T_CTA[1], al = win(t, a0, a1); if (al <= 0.003) return;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0));
    glassPill(SAFE.x0, 760, SAFE.w, 330, 32); rr(SAFE.x1 - 10, 760, 10, 330, [0, 32, 32, 0]); ctx.fillStyle = GOLD; ctx.fill();
    T('التفاصيل الكاملة', SAFE.x1 - 44, 836, { font: F.d(800, 36), color: GOLD, align: 'right' });
    [['تفاصيل مشروع الدار', K.tafasil], ['خطة تطوير المنطقة', K.khitta2]].forEach(([s2, a], i) => {
      const e = ea(t, a - 0.2, a + 0.3, E.out4); if (e <= 0.003) return; const y = 930 + i * 90;
      ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * 34, 0); dot(SAFE.x1 - 66, y - 14, 20, GOLD); icon('check', SAFE.x1 - 66, y - 13, 11, { p: ea(t, a, a + 0.4), color: '#0A0A0B', w: 4 });
      T(s2, SAFE.x1 - 104, y, { font: F.d(800, 42), color: '#FFFFFF', align: 'right' }); ctx.restore();
    });
    ctx.restore();
  };

  const overlay = (t) => {
    hudAR(t, 'الدار · من أبوظبي إلى دبي', 'لماذا إكسبو سيتي؟', 'مشروع بأكثر من 1.75 مليار درهم', T_B1[0] + 0.1, T_B1[1] - 0.1);
    hudAR(t, 'الجواب', 'ما يحدث حول المشروع', 'إكسبو سيتي دبي', T_M1[0] + 0.05, T_M1[1] - 0.1);
    hudAR(t, 'أكتوبر 2024', 'الدار × إكسبو سيتي دبي', 'مكاتب · محلات · وحدات سكنية', T_SKY[0] + 0.05, T_SKY[1] - 0.1);
    hudAR(t, 'شوفوا الموقع', 'بجانب مركز دبي للمعارض', 'المركز المستقبلي للمعارض', T_M2[0] + 0.05, T_EY[1] - 0.1, BLUE[1]);
    hudAR(t, 'وقريب أيضاً من', 'مطار آل مكتوم الدولي', 'مبنى مسافرين بـ 128 مليار درهم', T_M3[0] + 0.05, T_WAM[1] - 0.1, TEAL[1]);
    hudAR(t, 'يعني المنطقة', 'أكثر من وجهة سكن', 'تجهيز لمركز أعمال', T_HUB[0] + 0.05, T_HUB[1] - 0.1);
    hudAR(t, 'الموعد', 'التسليم المتوقع', 'للمشروع', T_28[0] + 0.05, T_28[1] - 0.1);
    hudAR(t, 'الحين السؤال', 'وجهة مكاتب جديدة؟', 'إكسبو سيتي دبي', T_Q[0] + 0.05, T_Q[1] - 0.1);
    hudAR(t, 'تبغى تعرف أكثر؟', 'التفاصيل', 'مشروع الدار وخطة تطوير المنطقة', T_CTA[0] + 0.05, T_CTA[1] - 0.1);
    srcChip(t, 'المصدر: سكاي نيوز عربية · 10 أكتوبر 2024', T_B1[0] + 1.6, T_B1[1] - 0.15);
    srcChip(t, 'سكاي نيوز عربية · 10 أكتوبر 2024', T_SKY[0] + 0.3, T_SKY[1] - 0.15);
    srcChip(t, 'الإمارات اليوم · 24 سبتمبر 2024', T_EY[0] + 0.25, T_EY[1] - 0.15);
    srcChip(t, 'وام · 28 أبريل 2024', T_WAM[0] + 0.25, T_WAM[1] - 0.15);
    value(t); hub(t); handover(t); question(t); details(t);

    // the comment: "اكتب إكسبو في التعليقات" - typed, sent, answered; then the end card with his name
    const ce = ea(t, K.uktub - 0.1, K.uktub + 0.6, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('عبدالله أهلي', CX, 690, { font: F.d(800, 64), color: C.ink }); T('ABDULLAH AHLI', CX, 744, { font: F.d(700, 30), ls: 6, color: C.gold }); ctx.restore();
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

  [T_B1[0], T_M1[0], T_SKY[0], T_M2[0], T_EY[0], T_M3[0], T_WAM[0], T_HUB[0], T_28[0], T_Q[0], T_CTA[0], K.uktub].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.milyar, K.m10, K.aamal, K.maarid, K.sharikat, K.y2028].forEach(x => cues.push({ k: 'pin', t: x }));
  cues.push({ k: 'send', t: K.atrish - 0.1 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE, FOOT_MAX: 1821, NO_CAPTIONS: true, STATIC_FACE: true };
}
