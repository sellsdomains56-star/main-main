'use strict';
// ---------------------------------------------------------------------------
// "سوق المكاتب" - ONE video from his five voice notes of 27 Oct 2026 (03:40-03:42), joined by assemble_voice.py (edl.json): his voice untouched (no stretch, no
// filter, one plain gain per note), one take of each idea, one call to action.  Order: n5 the office market today + DIFC -> n3 the DIFC Zabeel expansion ->
// n1 Expo City -> n2 ADGM, Al Maryah and Al Reem -> Rockefeller (n4's first line + n5's take) -> n5 conclusion + "report".
// Everything on screen in Arabic, right to left; every beat is a real page (marker on the exact words) or the map; no face (audio only); captions only on the
// opening sentence.  Pages: pagedata.js (boxes from shot_hl.mjs; captures in assets/, not committed).  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], add = (s) => { SCENES.push(s); return s; };
  // word time: first word (punctuation ignored) at or after `from`
  const A = (w, from = 0) => { const n = s => s.replace(/[.،؟?:!]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === w); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const END = TL.dur;

  const FACE_SEGS = [], PUNCHES = [], OVERLAYS = [];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  const GOLD = '#E9C47C', BLUE = ['#3DB2FF', '#A9DEFF'], TEAL = ['#2FD8A0', '#A6F3D6'], GOLDS = ['#C99A4A', '#F3D9A4'], VIO = ['#8C7BFF', '#CFC6FF'], RED = ['#E5484D', '#FF8A8E'];
  const P = GEO.x.points || {};
  const HX = SAFE.x1;
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;
  const fit = (s, f, w) => Math.min(1, w / M(s, f));
  const dur = T => T[1] - T[0];

  // ---------------------------------------------------------------- beat builders
  const BEATS = [];                                                  // [{T, hud:[kicker, name, sub, color], src}]
  const flight = (id, T, keys, top) => { SAT_SCENES[id] = { a: T[0], b: T[1], veil: 'map', keys: keys.map(k => camKey(...k)).sort((p, q) => p[0] - q[0]) }; add({ id, kind: 'sat', a: T[0], b: T[1], cfg: { top } }); };
  // a page: headline first, then the camera flies to each stop [abs time, image y] and holds; marks: [phrase index, t0, t1] (the marker wipes line by line)
  const lineBoxes = (rects) => {                                     // merge the rects of one phrase into one box per text line, top line first
    const L = []; for (const [x, y, w, h] of rects) { const l = L.find(q => Math.abs(q.y - y) < 12); if (l) { l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + w); } else L.push({ x0: x, x1: x + w, y, h }); }
    return L.sort((a, b) => a.y - b.y).map(l => [l.x0, l.y, l.x1 - l.x0, l.h]);
  };
  const page = (id, img, T, stops, marks, rtl = true, k0 = 0.95) => {
    const keys = [[0, 538, 330, k0, 0]]; let pr = 0, pc = [538, 330, k0, 0];
    if (stops.length && stops[0][0] - T[0] < 0.9) { pc = [540, stops[0][1] - 110, 0.92, 10]; keys[0] = [0, ...pc]; }   // a short beat opens on the quoted line, not on the headline
    for (const [ta, cy, k = 0.97] of stops) { const r = ta - T[0]; keys.push([Math.max(r - 0.75, pr + 0.05), ...pc]); pc = [540, cy, k, 16]; keys.push([r, ...pc]); pr = r; }
    keys.push([dur(T) + 0.5, pc[0], pc[1] + 6, pc[2] * 1.03, pc[3] + 2]);
    const hl = [];
    for (const [pi, t0, t1] of marks) {
      const ls = lineBoxes(PAGES[img].boxes[pi]), tot = ls.reduce((s, b) => s + b[2], 0); let acc = 0;
      for (const b of ls) { const a = t0 + (t1 - t0) * acc / tot; acc += b[2]; hl.push({ bbox: b, t0: a, t1: t0 + (t1 - t0) * acc / tot, rtl }); }
    }
    add({ id, kind: 'page', img, a: T[0], b: T[1], keys, hl });
  };
  const beat = (T, hud, src) => BEATS.push({ T, hud, src });

  // ---------------------------------------------------------------- overlay pieces
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
  const chip = (t, txt, a0, a1, y = 1150, color = GOLD, size = 31) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, size), w = Math.min(SAFE.w, M(txt, f) + 64); ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0)); glassPill(CX - w / 2, y, w, size + 35, (size + 35) / 2); T(txt, CX, y + size * 0.5 + 28, { font: f, color, sx: fit(txt, f, SAFE.w - 64) }); ctx.restore(); };
  // a card of up to three lines (right-aligned, gold edge on the right) - for his figures on the map
  const card = (t, rows, a0, a1, y = 1000) => {
    const al = win(t, a0, a1); if (al <= 0.003) return; const h = 40 + rows.length * 76;
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, a0)); glassPill(SAFE.x0, y, SAFE.w, h, 30); rr(SAFE.x1 - 10, y, 10, h, [0, 30, 30, 0]); ctx.fillStyle = GOLD; ctx.fill();
    rows.forEach(([txt, a, gold], i) => { const e = ea(t, a - 0.15, a + 0.3, E.out4); if (e <= 0.003) return; const f = F.d(800, i === 0 && rows.length > 1 && !gold ? 34 : 40); ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * 30, 0); T(txt, SAFE.x1 - 40, y + 72 + i * 76, { font: f, color: gold ? GOLD : '#FFFFFF', align: 'right', sx: fit(txt, f, SAFE.w - 80) }); ctx.restore(); });
    ctx.restore();
  };
  const tiles = (t, items, a1, y = 1030) => {                       // 2x2 tiles that pop in one by one (right to left, top to bottom)
    const tw3 = 390, th = 110, gap = 30, x0 = CX - tw3 - gap / 2;
    items.forEach(([txt, a], i) => { const e = ea(t, a - 0.1, a + 0.35, E.back) * (1 - ea(t, a1, a1 + 0.35)); if (e <= 0.003) return; const col = i % 2, row = Math.floor(i / 2), x = col ? x0 : x0 + tw3 + gap, yy = y + row * (th + gap);
      ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x + tw3 / 2, yy + th / 2); ctx.scale(lerp(0.85, 1, e), lerp(0.85, 1, e)); glassPill(-tw3 / 2, -th / 2, tw3, th, 26); rr(-tw3 / 2, -th / 2, tw3, th, 26); ctx.strokeStyle = 'rgba(233,196,124,0.85)'; ctx.lineWidth = 3; ctx.stroke(); T(txt, 0, 16, { font: F.d(800, 46), color: GOLD }); ctx.restore(); });
  };
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 25), w = M(txt, f) + 48; ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 54, 27); T(txt, CX, 1209, { font: f, color: '#FFFFFF' }); ctx.restore(); };
  const rings = (t, cam, [lon, lat], a0, a1, m = 3800) => { const al = win(t, a0, a1); if (al <= 0.003) return; const [x, y] = satProj(cam, lon, lat); for (let i = 0; i < 3; i++) { const u = ((t - a0) / 1.8 + i / 3) % 1; ring(x, y, m * (0.15 + 0.85 * u) / mpp(cam, lat), { color: 'rgb(233,196,124)', w: 6, alpha: (1 - u) * 0.9 * al }); } };
  const towerPin = (t, cam, [lon, lat], a0) => { const al = ea(t, a0, a0 + 0.4); if (al <= 0.003) return; const [x, y] = satProj(cam, lon, lat), h = 260 * ea(t, a0, a0 + 0.9, E.out3);
    ctx.save(); ctx.globalAlpha *= al; const g = ctx.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, 'rgba(233,196,124,0)'); g.addColorStop(1, 'rgba(233,196,124,0.85)'); ctx.fillStyle = g; ctx.fillRect(x - 5, y - h, 10, h); glow(x, y, 70, '233,196,124', 0.5); dot(x, y, 11, '#FFF6DE'); ring(x, y, 22, { color: GOLD, w: 3 }); ctx.restore(); };
  const area = (t, cam, key, c, a0, on, base = 0.5) => mapArea(t, cam, key, { c, a0, dur: 0.8, on, base });

  // ================================================================ the beats
  // ---- 1. the office market today (n5)
  const t1 = [0, A('بعد', 12) - 0.1], t2 = [t1[1], A('اليوم', 21) - 0.1], t3 = [t2[1], A('خذ', 33) - 0.1];
  flight('m_open', t1, [[0, 55.272, 25.2, 12.9, 60, 20], [dur(t1) + 0.5, 55.276, 25.198, 14.0, 120, 40]], (t, cam) => {
    area(t, cam, 'difc', RED, 0.6, [0.8, t1[1]]); area(t, cam, 'downtown', VIO, 1.1, [1.3, t1[1]]); area(t, cam, 'bbay', TEAL, 1.6, [1.8, t1[1]]);
    mapRoad(t, cam, 'E11', { a0: 0.4, dur: 1.4, alpha: 0.85 });
  });
  beat(t1, ['دبي · 2026', 'قطاع المكاتب التجارية', 'يذكرني ببداية نمو السكني في 2021']);
  flight('m_villa', t2, [[0, 55.268, 25.06, 13.4, 120, 30], [dur(t2) + 0.5, 55.27, 25.052, 14.1, 150, 40]], (t, cam) => {
    area(t, cam, 'ranches', GOLDS, t2[0] + 0.2, [t2[0] + 0.4, t2[1]]);
    calloutAR(t, cam, P.ranches, 'المرابع العربية', 'قطاع الفلل', GOLD, t2[0] + 0.6, 0, 0, -200);
    chip(t, 'من محركات نمو قطاع الفلل', A('وهذا', 19) - 0.1, t2[1]);
  });
  beat(t2, ['بعد الجائحة', 'الطلب على البيوت الأكبر', 'ومشترون عالميون ودوليون']);
  page('p_savills', 'bayan_savills', t3, [[A('الشركات', 24) - 0.1, 2438]], [[0, A('الشركات', 24) + 0.2, A('حديثة', 27) + 0.4]]);
  beat(t3, ['اليوم في قطاع المكاتب', 'الشركات تتوسع', 'وتبحث عن مساحات حديثة'], 'البيان · تقرير سافيلز · أبريل 2026');

  // ---- 2. DIFC (n5)
  const t4 = [t3[1], A('عدد', 36) - 0.05], t5 = [t4[1], A('دبي', 49) - 0.15];
  flight('m_difc', t4, [[0, 55.281, 25.212, 14.6, 150, 36], [dur(t4) + 0.5, 55.281, 25.213, 15.0, 150, 40]], (t, cam) => {
    area(t, cam, 'difc', RED, t4[0] + 0.05, [t4[0] + 0.2, t4[1]]);
    calloutAR(t, cam, P.difc, 'مركز دبي المالي العالمي', 'DIFC', RED[1], t4[0] + 0.3, 0, 0, -210);
  });
  beat(t4, ['خذ مثال', 'مركز دبي المالي العالمي', 'DIFC'], null, RED[1]);
  page('p_difc', 'dmo_difc', t5, [[A('تجاوز', 37) - 0.2, 2110], [A('سيتادل', 45) - 0.6, 5160]],
    [[0, A('تجاوز', 37), A('2026', 39) + 0.4], [1, A('الثلاثين', 42) - 0.2, A('بالمئة', 43) + 0.4], [2, A('سيتادل', 45), A('سيتادل', 45) + 0.6], [3, A('وجي', 46), A('أدفايزرز', 48) + 0.6]]);
  beat(t5, ['مركز دبي المالي العالمي', 'أكثر من 10 آلاف شركة', 'نمو سنوي 30%'], 'المكتب الإعلامي لحكومة دبي · يوليو 2026', RED[1]);

  // ---- 3. the DIFC Zabeel expansion (n3)
  const t6 = [t5[1], A('نتكلم', 57) - 0.1], t7 = [t6[1], A('والخطة', 65) - 0.1], t8 = [t7[1], A('الحين', 75) - 0.1], t9 = [t8[1], A('ليش', 83) - 0.15];
  page('p_zab1', 'dmo_zabeel', t6, [[A('مائة', 52) - 0.4, 2410]], [[0, A('مائة', 52) - 0.2, A('درهم', 53) + 0.6]]);
  beat(t6, ['يناير 2026', 'مشروع بقيمة 100 مليار درهم', 'يغيّر سوق المكاتب التجارية'], 'المكتب الإعلامي لحكومة دبي · يناير 2026');
  flight('m_zabeel', t7, [[0, 55.285, 25.212, 13.9, 120, 30], [dur(t7) + 0.5, 55.29, 25.21, 14.3, 120, 36]], (t, cam) => {
    area(t, cam, 'difc', RED, t7[0] - 2, [t7[0], t7[1]]);
    area(t, cam, 'zabeel', GOLDS, A('زعبيل', 60) - 0.4, [A('زعبيل', 60) - 0.2, t7[1]]);
    calloutAR(t, cam, P.difc, 'مركز دبي المالي العالمي', '', RED[1], t7[0] + 0.3, A('زعبيل', 60) - 0.2, -160, -170);
    calloutAR(t, cam, P.zabeel, 'منطقة زعبيل', 'زعبيل ديستركت', GOLD, A('زعبيل', 60) - 0.1, 0, 120, -200);
    card(t, [['مساحة البناء', A('بمساحة', 61) - 0.1], ['17.7 مليون قدم مربع', A('17.7', 63) - 0.1, true]], A('بمساحة', 61) - 0.2, t7[1], 1050);
  });
  beat(t7, ['التوسعة', 'مركز دبي المالي في زعبيل', 'زعبيل ديستركت'], null);
  page('p_zab2', 'dmo_zabeel', t8, [[A('أكثر', 67.5) - 0.3, 3316], [A('المرحلة', 72) - 0.1, 11058]], [[2, A('أكثر', 67.5), A('موظف', 72) + 0.4], [3, A('المرحلة', 72) + 0.3, A('2030', 75) + 0.5]]);
  beat(t8, ['القدرة الاستيعابية', '42 ألف شركة · 125 ألف موظف', 'المرحلة الأولى 2030'], 'المكتب الإعلامي لحكومة دبي · يناير 2026');
  flight('m_demand', t9, [[0, 55.285, 25.205, 13.4, 60, 24], [dur(t9) + 0.5, 55.284, 25.203, 13.1, 60, 22]], (t, cam) => {
    area(t, cam, 'difc', RED, t9[0] - 2, [t9[0], t9[1]], 0.7); area(t, cam, 'zabeel', GOLDS, t9[0] - 2, [t9[0], t9[1]], 0.7);
    area(t, cam, 'downtown', VIO, t9[0] + 0.3, [t9[0] + 0.4, t9[1]]); area(t, cam, 'bbay', TEAL, t9[0] + 0.5, [t9[0] + 0.6, t9[1]]);
    tiles(t, [['مكاتب', A('مكاتب', 80)], ['شقق', A('شقق', 81)], ['مطاعم', A('مطاعم', 82)], ['خدمات', A('وخدمات', 82.5)]], t9[1] - 0.1);
  });
  beat(t9, ['اتخيل معاي', 'حجم الطلب القادم', 'من كل هالشركات والموظفين']);

  // ---- 4. Expo City (n1)
  const X0 = 83, e1 = [t9[1], A('الجواب', X0) - 0.1], e2 = [e1[1], A('الدار', 98) - 0.1], e3 = [e2[1], A('بس', 105) - 0.1], e4 = [e3[1], A('خطة', 110) - 0.3], e5 = [e4[1], A('وقريب', 112) - 0.05],
    e6 = [e5[1], A('يتجهز', 115.5) - 0.35], e7 = [e6[1], A('يعني', 117.5) - 0.05], e8 = [e7[1], A('تجهيزها', 120.5) - 0.3], e9 = [e8[1], A('والتسليم', 124) - 0.1], e10 = [e9[1], A('الحين', 127) - 0.1], e11 = [e10[1], A('في', 134.5) - 0.1];
  const EX = P.expo, DEC = P.dec, DWC = P.dwc, TERM = P.dwc_term;
  page('p_sky1', 'sky_aldar', e1, [[A('مشروع', 91.5) - 0.2, 2790]], [[2, A('المليار', 93) - 0.9, A('المليار', 93) + 0.9]]);
  beat(e1, ['الدار · من أبوظبي إلى دبي', 'ليش إكسبو سيتي؟', 'مشروع بأكثر من 1.75 مليار درهم'], 'سكاي نيوز عربية · أكتوبر 2024');
  flight('m_e1', e2, [[0, 55.151, 24.9605, 15.0, 150, 30], [1.0, 55.151, 24.96, 14.5, 150, 30], [dur(e2) + 0.5, 55.155, 24.952, 13.0, 40, 22]], (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: e2[0] + 0.1, dur: 1.0, on: [e2[0] + 0.3, e2[1]] });
    calloutAR(t, cam, EX, 'إكسبو سيتي دبي', 'منطقة إكسبو 2020', GOLD, e2[0] + 0.5, A('الجواب', 96.8) - 0.1, 0, -170); rings(t, cam, EX, A('الجواب', 96.8) - 0.1, e2[1]);
  });
  beat(e2, ['الجواب', 'ما يحدث حول المشروع', 'إكسبو سيتي دبي']);
  page('p_sky2', 'sky_aldar', e3, [[A('دخلت', 99.5) - 0.2, 1405]], [[0, A('بشراكة', 100) - 0.2, A('بشراكة', 100) + 1.0], [1, A('مكاتب', 103) - 0.3, A('سكنية', 104.5) + 0.2]], true, 0.9);
  beat(e3, ['أكتوبر 2024', 'الدار × إكسبو سيتي دبي', 'مكاتب · محلات · وحدات سكنية'], 'سكاي نيوز عربية · أكتوبر 2024');
  flight('m_e2', e4, [[0, 55.149, 24.9615, 13.7, 150, 30], [1.5, 55.1475, 24.962, 14.75, 150, 40], [dur(e4) + 0.5, 55.1475, 24.962, 15.0, 150, 42]], (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: e4[0] - 2, dur: 0.1, base: 0.35 });
    const mk = A('مركز', 107.8); mapArea(t, cam, 'dec_n', { c: BLUE, a0: mk - 0.3, dur: 0.8, on: [mk - 0.2, e4[1]] }); mapArea(t, cam, 'dec_s', { c: BLUE, a0: mk - 0.1, dur: 0.8, on: [mk, e4[1]] });
    calloutAR(t, cam, DEC, 'مركز دبي للمعارض', 'توسعة كبرى قادمة', BLUE[1], mk + 0.1, 0, 120, -190); chip(t, 'مشروع الدار بجانب المركز', A('قريب', 107) - 0.2, e4[1]);
  });
  beat(e4, ['شوفوا الموقع', 'بجانب مركز دبي للمعارض', 'المركز المستقبلي للمعارض'], null, BLUE[1]);
  page('p_ey1', 'ey_dec', e5, [[e5[0] + 0.6, 2525]], [[0, e5[0] + 0.6, e5[0] + 2.2]], true, 0.9);
  beat(e5, ['شوفوا الموقع', 'خطة توسعة بـ 10 مليارات', 'مركز دبي للمعارض'], 'الإمارات اليوم · سبتمبر 2024', BLUE[1]);
  flight('m_e3', e6, [[0, 55.153, 24.95, 13.3, 60, 22], [dur(e6) + 0.5, 55.156, 24.922, 12.55, -60, 18]], (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: e6[0] - 2, dur: 0.1, base: 0.6 }); mapArea(t, cam, 'dec_n', { c: BLUE, a0: e6[0] - 2, dur: 0.1, base: 0.5 }); mapArea(t, cam, 'dec_s', { c: BLUE, a0: e6[0] - 2, dur: 0.1, base: 0.5 });
    const mt = A('مطار', 114); mapArea(t, cam, 'dwc', { c: TEAL, a0: mt - 0.4, dur: 1.0, on: [mt - 0.2, e6[1]] }); mapFlow(t, cam, EX, TERM, e6[0] + 0.05, 0, { dur: 1.1, bend: 0.12 });
    calloutAR(t, cam, EX, 'إكسبو سيتي', '', GOLD, e6[0] + 0.2, mt, -150, -120); calloutAR(t, cam, DWC, 'مطار آل مكتوم الدولي', 'توسعة جداً ضخمة', TEAL[1], mt + 0.2, 0, 0, 260);
  });
  beat(e6, ['وقريب أيضاً من', 'مطار آل مكتوم الدولي', 'مبنى مسافرين بـ 128 مليار درهم'], null, TEAL[1]);
  page('p_wam', 'wam_dwc', e7, [], [[0, e7[0] + 0.2, e7[0] + 1.2]], true, 0.92);
  beat(e7, ['وقريب أيضاً من', 'مطار آل مكتوم الدولي', 'مبنى مسافرين بـ 128 مليار درهم'], 'وام · أبريل 2024', TEAL[1]);
  flight('m_e4', e8, [[0, 55.156, 24.926, 12.45, -10, 18], [dur(e8) + 0.5, 55.156, 24.926, 12.3, -10, 22]], (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: e8[0] + 0.05, dur: 0.6, on: [e8[0] + 0.1, e8[1]] }); mapArea(t, cam, 'dec_n', { c: BLUE, a0: e8[0] + 0.2, dur: 0.6, on: [e8[0] + 0.3, e8[1]] }); mapArea(t, cam, 'dec_s', { c: BLUE, a0: e8[0] + 0.2, dur: 0.6, on: [e8[0] + 0.3, e8[1]] });
    mapArea(t, cam, 'dwc', { c: TEAL, a0: e8[0] + 0.35, dur: 0.8, on: [e8[0] + 0.5, e8[1]] }); chip(t, 'ليست وجهة للسكن فقط', A('للسكن', 119.5) - 0.35, e8[1], 1160);
  });
  beat(e8, ['يعني المنطقة', 'أكثر من وجهة سكن', 'مركز للأعمال والمعارض والشركات']);
  page('p_ey2', 'ey_dec', e9, [[e9[0] + 0.6, 2240]], [[1, e9[0] + 0.9, A('والشركات', 123.5) + 0.3]], true, 0.9);
  beat(e9, ['يعني المنطقة', 'أكثر من وجهة سكن', 'مركز للأعمال والمعارض والشركات'], 'الإمارات اليوم · سبتمبر 2024');
  flight('m_e5', e10, [[0, 55.15, 24.9608, 14.3, 150, 32], [dur(e10) + 0.5, 55.1495, 24.961, 14.85, 150, 40]], (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: e10[0] - 2, dur: 0.1, base: 0.5 }); mapArea(t, cam, 'dec_n', { c: BLUE, a0: e10[0] - 2, dur: 0.1, on: [e10[0], e10[1]] }); mapArea(t, cam, 'dec_s', { c: BLUE, a0: e10[0] - 2, dur: 0.1, on: [e10[0], e10[1]] });
    calloutAR(t, cam, EX, 'إكسبو سيتي دبي', '', GOLD, e10[0] + 0.2, 0, -120, -170);
    const y8 = A('2028', 126); card(t, [['التسليم المتوقع للمشروع', y8 - 0.5], ['2028', y8 - 0.3, true]], y8 - 0.5, e10[1], 1050);
  });
  beat(e10, ['الموعد', 'التسليم المتوقع', 'للمشروع']);
  flight('m_e6', e11, [[0, 55.153, 24.957, 13.6, 150, 26], [dur(e11) + 0.5, 55.149, 24.962, 14.6, 150, 44]], (t, cam) => {
    mapArea(t, cam, 'expo', { c: GOLDS, a0: e11[0] + 0.1, dur: 0.8, on: [e11[0] + 0.2, e11[1]] });
    const h = A('هل', 129); card(t, [['هل تصبح إكسبو سيتي', h - 0.1], ['من أهم وجهات المكاتب التجارية في دبي؟', A('المكاتب', 131) - 0.3, true]], h - 0.2, e11[1], 1030);
  });
  beat(e11, ['الحين السؤال', 'وجهة مكاتب جديدة؟', 'إكسبو سيتي دبي']);

  // ---- 5. Abu Dhabi: ADGM, Al Maryah and Al Reem (n2)
  const a1 = [e11[1], A('نتكلم', 142) - 0.1], a2 = [a1[1], A('نسبة', 153.5) - 0.1], a3 = [a2[1], A('الحين', 164) - 0.1], a4 = [a3[1], A('ومع', 179) - 0.1], a5 = [a4[1], A('في', 187.5) - 0.1];
  const MAR = P.maryah, REEM = P.reem;
  flight('m_ad1', a1, [[0, 54.38, 24.47, 12.6, 60, 20], [dur(a1) + 0.5, 54.392, 24.5, 14.2, 150, 38]], (t, cam) => {
    area(t, cam, 'maryah', BLUE, a1[0] + 1.2, [a1[0] + 1.4, a1[1]]);
    calloutAR(t, cam, MAR, 'جزيرة الماريه', 'سوق أبوظبي العالمي ADGM', BLUE[1], a1[0] + 1.6, 0, 0, -210);
    chip(t, 'الطلب على المكاتب يرتفع', A('الطلب', 139.5) - 0.1, a1[1]);
  });
  beat(a1, ['في شيء قاعد يصير في أبوظبي', 'الطلب على المكاتب', 'يرتفع بشكل ملحوظ'], null, BLUE[1]);
  page('p_adgm', 'admo_adgm', a2, [[A('عدد', 145.5) - 0.2, 7362]], [[0, A('عدد', 145.5), A('موظف', 148.5) + 0.3], [1, A('بنمو', 149) - 0.1, A('فقط', 152) + 0.2]]);
  beat(a2, ['سوق أبوظبي العالمي ADGM', 'قرابة 50 ألف موظف', 'نمو 34% خلال سنة'], 'المكتب الإعلامي لحكومة أبوظبي · سبتمبر 2026', BLUE[1]);
  page('p_cw', 'cw_ad', a3, [[A('نسبة', 153.5) + 1.2, 3740]], [[1, A('حالياً', 157.5) - 0.3, A('99%', 159) + 0.6], [0, A('والإيجارات', 161) - 0.1, A('32%', 162.5) + 0.6]], false);
  beat(a3, ['بس وين التحدي؟', 'إشغال 99% للفئة الأولى', 'والإيجارات +32%'], 'كوشمان آند ويكفيلد كور · أغسطس 2026', BLUE[1]);
  flight('m_ad2', a4, [[0, 54.392, 24.502, 14.3, 150, 36], [dur(a4) + 0.5, 54.396, 24.5, 13.8, 120, 32]], (t, cam) => {
    const tm = A('المارية', 171), tr = A('الريم', 172);
    area(t, cam, 'maryah', BLUE, a4[0] - 2, [tm - 0.2, a4[1]], 0.6); area(t, cam, 'reem', TEAL, tr - 0.4, [tr - 0.2, a4[1]]);
    chip(t, 'وين راح يسكنون؟', A('وين', 168.5) - 0.2, tm - 0.4, 1150, '#FFFFFF', 36);
    calloutAR(t, cam, MAR, 'جزيرة الماريه', 'السوق الفاخر', BLUE[1], tm - 0.1, 0, -150, -200);
    calloutAR(t, cam, REEM, 'جزيرة الريم', 'خيارات سكنية أوسع', TEAL[1], A('والريم', 175) - 0.1, 0, 150, 240);
  });
  beat(a4, ['وين راح يسكنون؟', 'الماريه والريم', 'سكن قريب من المكاتب'], null, TEAL[1]);
  flight('m_ad3', a5, [[0, 54.398, 24.5, 13.6, 120, 30], [dur(a5) + 0.5, 54.395, 24.497, 13.1, 60, 22]], (t, cam) => {
    area(t, cam, 'maryah', BLUE, a5[0] - 2, [a5[0], a5[1]], 0.6); area(t, cam, 'reem', TEAL, a5[0] - 2, [a5[0], a5[1]], 0.6);
    card(t, [['الطلب على السكن راح يرتفع', A('الطلب', 181) - 0.1], ['الفرص في المكاتب وحتى في السكني', A('يعني', 183.5) - 0.1, true]], A('الطلب', 181) - 0.2, a5[1], 1030);
  });
  beat(a5, ['مع استمرار دخول الشركات', 'الطلب على السكن', 'فرص في المكاتب وحتى السكني'], null, TEAL[1]);

  // ---- 6. the Rockefeller tower (n4's first line + n5)
  const r1 = [a5[1], A('كريستيان', 192) - 0.1], r2 = [r1[1], A('يعني', 199.8) - 0.1], r3 = [r2[1], A('المشروع', 207) - 0.1], r4 = [r3[1], A('ومستوحى', 214) - 0.2], r5 = [r4[1], A('بحسب', 215.3) - 0.1],
    r6 = [r5[1], A('الفكرة', 229.5) - 0.1], r7 = [r6[1], A('اكتب', 241) - 0.1];
  const TW = P.tower;
  flight('m_r1', r1, [[0, 55.268, 25.2, 13.2, 60, 26], [dur(r1) + 0.5, 55.266, 25.196, 14.6, 150, 42]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: r1[0] + 0.1, dur: 1.2, alpha: 0.9 }); towerPin(t, cam, TW, A('برج', 188.2) - 0.1);
    calloutAR(t, cam, TW, 'برج روكفيلر للأعمال', 'شارع الشيخ زايد', GOLD, A('روكفيلر', 191.5) - 0.1, 0, -140, 230);
  });
  beat(r1, ['برج مكاتب جديد', 'برج روكفيلر للأعمال', 'على شارع الشيخ زايد']);
  page('p_masd1', 'masd_rock', r2, [[A('الجيل', 194) - 0.3, 1790]], [[0, A('الجيل', 194), A('دبي', 199.5) + 0.2]]);
  beat(r2, ['كريستيان أ. روكفلر', 'الجيل السادس لعائلة روكفلر', 'أول مشروع يحمل علامته'], 'المصدر العقاري · أكتوبر 2026');
  page('p_bayan1', 'bayan_rock', r3, [[A('الاسم', 200.3) - 0.2, 1544]], [[1, A('الاسم', 200.3), A('القطاع', 203.5) + 0.3]]);
  beat(r3, ['الاسم والإرث', 'علامة جديدة في العقار', 'اللي يستاهل الدراسة: المشروع نفسه'], 'البيان · أكتوبر 2026');
  page('p_masd2', 'masd_rock', r4, [[r4[0] + 0.6, 2170]], [[1, A('مكاتب', 208.5) - 0.1, A('A', 209.8) + 0.3], [2, A('خمس', 210.3) - 0.1, A('للمرافق', 211.2) + 0.5]]);
  beat(r4, ['المشروع', 'مكاتب Grade A', 'وخمسة طوابق للمرافق'], 'المصدر العقاري · أكتوبر 2026');
  page('p_bayan2', 'bayan_rock', r5, [[r5[0] + 0.3, 2182]], [[2, r5[0] + 0.4, r5[1] - 0.2]], true, 0.9);
  beat(r5, ['المشروع', 'مستوحى من الضيافة', 'مكاتب فاخرة'], 'البيان · أكتوبر 2026');
  flight('m_r2', r6, [[0, 55.266, 25.1955, 15.2, 150, 44], [dur(r6) + 0.5, 55.2655, 25.195, 15.6, 150, 48]], (t, cam) => {
    towerPin(t, cam, TW, r6[0] - 2); mapRoad(t, cam, 'E11', { a0: r6[0] - 2, dur: 0.1, alpha: 0.9 });
    card(t, [['بحسب العرض المتاح', A('بحسب', 215.3) - 0.1], ['من أقل من 4.4 مليون درهم', A('تبدأ', 217.5) - 0.1, true], ['4,000 – 4,600 درهم للقدم المربع', A('يتراوح', 221.8) + 0.3, true]], A('بحسب', 215.3) - 0.2, A('وخطة', 225.3) - 0.1, 980);
    card(t, [['خطة الدفع', A('وخطة', 225.3) - 0.1], ['50 / 50', A('تكون', 226.5) + 0.3, true], ['قبل الرسوم والضريبة', A('قبل', 227.6) - 0.1]], A('وخطة', 225.3) - 0.1, r6[1], 980);
  });
  beat(r6, ['بحسب العرض المتاح', 'الأسعار وخطة الدفع', 'برج روكفيلر للأعمال']);
  flight('m_end', r7, [[0, 55.276, 25.203, 14.0, 60, 30], [dur(r7) + 0.5, 55.278, 25.2, 12.9, 0, 20]], (t, cam) => {
    area(t, cam, 'difc', RED, r7[0] + 0.1, [r7[0] + 0.2, r7[1]], 0.7); area(t, cam, 'zabeel', GOLDS, r7[0] + 0.3, [r7[0] + 0.4, r7[1]], 0.7); area(t, cam, 'downtown', VIO, r7[0] + 0.5, [r7[0] + 0.6, r7[1]], 0.7); area(t, cam, 'bbay', TEAL, r7[0] + 0.7, [r7[0] + 0.8, r7[1]], 0.7);
    towerPin(t, cam, TW, r7[0] + 0.3);
    card(t, [['مو كل مكتب اليوم فرصة', A('الفكرة', 229.5) + 0.1], ['توسع الشركات يحدد المكتب المناسب', A('الفكرة', 231.5) + 0.2, true]], A('الفكرة', 229.5), A('تبغى', 237) - 0.2, 1030);
    chip(t, 'وين تسعير روكفيلر مقارنة بالأبراج المنافسة؟', A('تبغى', 237) - 0.1, r7[1], 1150, '#FFFFFF', 30);
  });
  beat(r7, ['الخلاصة', 'المكتب المناسب', 'لاحتياجات الشركات القادمة']);

  // ---------------------------------------------------------------- overlay: HUD titles, source chips, the call to action
  const CTA = A('اكتب', 241), RP = A('ريبورت', 242), SEND = A('وبطرش', 242.5);
  const overlay = (t) => {
    BEATS.forEach(({ T: B, hud, src }, i) => {                       // consecutive beats with the same title share one title (it stays up, then fades once)
      const same = (x) => x && x.hud && hud && x.hud[1] === hud[1];
      if (hud && !same(BEATS[i - 1])) { let j = i; while (same(BEATS[j + 1])) j++; hudAR(t, hud[0], hud[1], hud[2], B[0] + 0.05, BEATS[j].T[1] - 0.1, hud[3] || GOLD); }
      if (src) srcChip(t, src, B[0] + 0.3, B[1] - 0.15);
    });
    const ce = ea(t, CTA - 0.1, CTA + 0.6, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('عبدالله أهلي', CX, 620, { font: F.d(800, 80), color: C.ink }); T('ABDULLAH AHLI', CX, 684, { font: F.d(700, 32), ls: 6, color: C.gold }); ctx.restore();
      const send = SEND - 0.1, sent = ea(t, send, send + 0.35), ia = ea(t, CTA + 0.2, CTA + 0.7, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = 'ريبورت';
      const typed = ea(t, RP - 0.05, RP + 0.35, E.lin), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      if (typed > 0.01) { ctx.save(); ctx.beginPath(); ctx.rect(X1 - 56 - M(msg, fm) * typed - 4, iy - 60, M(msg, fm) * typed + 8, 120); ctx.clip(); T(msg, X1 - 56, iy + 20, { font: fm, color: C.ink, align: 'right', alpha: 1 - sent }); ctx.restore(); }
      T('أضف تعليقاً…', X1 - 56, iy + 20, { font: F.d(700, 52), color: C.mute, align: 'right', alpha: (1 - ea(t, RP - 0.05, RP + 0.05)) * (1 - sent) });
      dot(X0 + 66, iy, 48, C.gold); ctx.save(); ctx.translate(X0 + 66, iy); ctx.scale(-1, 1); icon('plane', 0, 0, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore(); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X0, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X0 + w / 2, 975, { font: fm, color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const rp = 'بأرسل لك المقارنة', f = F.d(700, 46), w = Math.min(BW, M(rp, f) + 130); rr(X1 - w, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X1 - 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(rp, X1 - 112, 1102, { font: f, color: C.ink, align: 'right' }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  BEATS.forEach(b => cues.push({ k: 'wh', t: b.T[0] - 0.2, d: 0.5 })); cues.push({ k: 'wh', t: CTA - 0.2, d: 0.5 }); cues.push({ k: 'send', t: SEND - 0.1 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, NO_CAPTIONS: false, CAP_UNTIL: t1[1] - 0.05, STATIC_FACE: true };
}
