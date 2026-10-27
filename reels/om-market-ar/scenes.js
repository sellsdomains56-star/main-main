'use strict';
// ---------------------------------------------------------------------------
// "قطاع المكاتب التجارية في دبي" - voice note n5 of 27 Oct 2026 (03:42), the whole note: the office market today, DIFC, DIFC Zabeel,
// the Rockefeller tower, the conclusion and his call to action "ريبورت".
// Everything on screen in Arabic, right to left; every beat is a real page (marker on the exact words) or the map; no face (audio only); captions on the
// opening line only.  His voice: the whole note, untouched (one plain gain, pauses over 0.3 s shortened).  Pages: pagedata.js (captures in assets/, not
// committed).  Beats reused from ../office-market-ar (the combined video), re-timed with OFFS.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], add = (s) => { SCENES.push(s); return s; };
  // word times.  A(): anchors written in the combined video's times (the beats come from ../office-market-ar), shifted to this video by OFFS
  // (the same note with the same pauses, so one constant shift per piece); B(): anchors in this video's own times.
  const OFFS = [[0, 50.0, -0.01], [150.0, 250, -129.55]];
  const cmap = c => { for (const [a, b, o] of OFFS) if (c >= a && c < b) return c + o; return c; };
  const find = (w, from) => { const n = s => s.replace(/[.،؟?:!]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === w); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const A = (w, from = 0) => find(w, Math.max(0, cmap(from) - 0.3)), B = (w, from = 0) => find(w, Math.max(0, from - 0.3));
  const qy = (img, pi) => { const r = PAGES[img].boxes[pi]; return (Math.min(...r.map(b => b[1])) + Math.max(...r.map(b => b[1] + b[3]))) / 2; };   // centre of a quoted phrase (image px)
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
  // ---- 1. the office market today
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


  // ---- 2. DIFC
  // ---- 2. DIFC (n5)
  const t4 = [t3[1], A('عدد', 36) - 0.05], t5 = [t4[1], B('ومع', 49.6) - 0.15];
  flight('m_difc', t4, [[0, 55.281, 25.212, 14.6, 150, 36], [dur(t4) + 0.5, 55.281, 25.213, 15.0, 150, 40]], (t, cam) => {
    area(t, cam, 'difc', RED, t4[0] + 0.05, [t4[0] + 0.2, t4[1]]);
    calloutAR(t, cam, P.difc, 'مركز دبي المالي العالمي', 'DIFC', RED[1], t4[0] + 0.3, 0, 0, -210);
  });
  beat(t4, ['خذ مثال', 'مركز دبي المالي العالمي', 'DIFC'], null, RED[1]);
  page('p_difc', 'dmo_difc', t5, [[A('تجاوز', 37) - 0.2, 2110], [A('سيتادل', 45) - 0.6, 5160]],
    [[0, A('تجاوز', 37), A('2026', 39) + 0.4], [1, A('الثلاثين', 42) - 0.2, A('بالمئة', 43) + 0.4], [2, A('سيتادل', 45), A('سيتادل', 45) + 0.6], [3, A('وجي', 46), A('أدفايزرز', 48) + 0.6]]);
  beat(t5, ['مركز دبي المالي العالمي', 'أكثر من 10 آلاف شركة', 'نمو سنوي 30%'], 'المكتب الإعلامي لحكومة دبي · يوليو 2026', RED[1]);


  // ---- 3. DIFC Zabeel (his short line in this note)
  const z1 = [t5[1], B('نشوف', 54) - 0.1], z2 = [z1[1], B('وهني', 57.9) - 0.1];
  page('p_zab1', 'dmo_zabeel', z1, [[B('تتجاوز', 52.5) - 0.2, 2410]], [[0, B('100', 53.3) - 0.3, B('درهم', 53.8) + 0.5]]);
  beat(z1, ['دي آي إف سي زعبيل', 'قيمة تطويرية تتجاوز 100 مليار', 'توسعة مركز دبي المالي العالمي'], 'المكتب الإعلامي لحكومة دبي · يناير 2026');
  flight('m_zabeel', z2, [[0, 55.285, 25.212, 13.9, 120, 30], [dur(z2) + 0.5, 55.29, 25.21, 14.3, 120, 36]], (t, cam) => {
    area(t, cam, 'difc', RED, z2[0] - 2, [z2[0], z2[1]]); area(t, cam, 'zabeel', GOLDS, z2[0] + 0.1, [z2[0] + 0.3, z2[1]]);
    calloutAR(t, cam, P.zabeel, 'منطقة زعبيل', 'التوسعة', GOLD, z2[0] + 0.4, 0, 120, -200);
    card(t, [['خطة طويلة المدى', B('خطة', 55) - 0.1], ['لاستيعاب شركات وعمال أكثر', B('لاستيعاب', 56.2) - 0.1, true]], B('خطة', 55) - 0.2, z2[1], 1050);
  });
  beat(z2, ['خطة طويلة المدى', 'مركز دبي المالي في زعبيل', 'شركات وعمال أكثر']);

  // ---- 4. the Rockefeller tower and the conclusion
  const r1 = [z2[1], A('كريستيان', 192) - 0.1], r2 = [r1[1], A('يعني', 199.8) - 0.1], r3 = [r2[1], A('المشروع', 207) - 0.1], r4 = [r3[1], A('ومستوحى', 214) - 0.2], r5 = [r4[1], A('بحسب', 215.3) - 0.1],
    r6 = [r5[1], A('الفكرة', 229.5) - 0.1], r7 = [r6[1], A('اكتب', 241) - 0.1];
  const TW = P.tower;
  flight('m_r1', r1, [[0, 55.268, 25.2, 13.2, 60, 26], [dur(r1) + 0.5, 55.266, 25.196, 14.6, 150, 42]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: r1[0] + 0.1, dur: 1.2, alpha: 0.9 }); towerPin(t, cam, TW, B('مشروع', 59.3) - 0.1);
    calloutAR(t, cam, TW, 'برج روكفيلر للأعمال', 'تطوير LMD · شارع الشيخ زايد', GOLD, B('روكفيلر', 59.8) - 0.1, 0, -140, 230);
  });
  beat(r1, ['وهني يجي دور', 'برج روكفيلر للأعمال', 'على شارع الشيخ زايد']);
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

  // ---------------------------------------------------------------- overlay: HUD titles, source chips, the call to action (his own, from this note)
  const CTA = A('اكتب', 241), KW = A('ريبورت', 242), SEND = A('وبطرش', 242.5), MSG = 'ريبورت', REPLY = 'بأرسل لك المقارنة';
  const overlay = (t) => {
    BEATS.forEach(({ T: B0, hud, src }, i) => {                      // consecutive beats with the same title share one title (it stays up, then fades once)
      const same = (x) => x && x.hud && hud && x.hud[1] === hud[1];
      if (hud && !same(BEATS[i - 1])) { let j = i; while (same(BEATS[j + 1])) j++; hudAR(t, hud[0], hud[1], hud[2], B0[0] + 0.05, BEATS[j].T[1] - 0.1, hud[3] || GOLD); }
      if (src) srcChip(t, src, B0[0] + 0.3, B0[1] - 0.15);
    });
    
    const ce = ea(t, CTA - 0.1, CTA + 0.6, E.out4);
    if (ce > 0.003) {
      ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ce; T('عبدالله أهلي', CX, 620, { font: F.d(800, 80), color: C.ink }); T('ABDULLAH AHLI', CX, 684, { font: F.d(700, 32), ls: 6, color: C.gold }); ctx.restore();
      const send = SEND - 0.1, sent = ea(t, send, send + 0.35), ia = ea(t, CTA + 0.2, CTA + 0.7, E.out4), iy = 1185, X0 = SAFE.x0, X1 = SAFE.x1, BW = X1 - X0, msg = MSG;
      const typed = ea(t, KW - 0.05, KW + 0.35, E.lin), fm = F.d(700, 58);
      ctx.save(); ctx.globalAlpha *= ia; rr(X0, iy - 65, BW, 130, 65); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      if (typed > 0.01) { ctx.save(); ctx.beginPath(); ctx.rect(X1 - 56 - M(msg, fm) * typed - 4, iy - 60, M(msg, fm) * typed + 8, 120); ctx.clip(); T(msg, X1 - 56, iy + 20, { font: fm, color: C.ink, align: 'right', alpha: 1 - sent }); ctx.restore(); }
      T('أضف تعليقاً…', X1 - 56, iy + 20, { font: F.d(700, 52), color: C.mute, align: 'right', alpha: (1 - ea(t, KW - 0.05, KW + 0.05)) * (1 - sent) });
      dot(X0 + 66, iy, 48, C.gold); ctx.save(); ctx.translate(X0 + 66, iy); ctx.scale(-1, 1); icon('plane', 0, 0, 20, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent }); ctx.restore(); ctx.restore();
      const b1 = ea(t, send, send + 0.5, E.out4), b2 = ea(t, send + 0.8, send + 1.3, E.out4);
      if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 36); const w = M(msg, fm) + 84; rr(X0, 900, w, 112, 56); ctx.fillStyle = C.gold; ctx.fill(); T(msg, X0 + w / 2, 975, { font: fm, color: '#17181B' }); ctx.restore(); }
      if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 36); const f = F.d(700, 46), w = Math.min(BW, M(REPLY, f) + 130); rr(X1 - w, 1030, w, 112, 56); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.28)'; ctx.lineWidth = 3; ctx.stroke(); icon('check', X1 - 66, 1087, 24, { p: ea(t, send + 1.0, send + 1.4), color: C.gold, w: 5 }); T(REPLY, X1 - 112, 1102, { font: f, color: C.ink, align: 'right' }); ctx.restore(); }
    }
  };
  OVERLAYS.push(overlay);

  BEATS.forEach(b => cues.push({ k: 'wh', t: b.T[0] - 0.2, d: 0.5 })); cues.push({ k: 'wh', t: CTA - 0.2, d: 0.5 }); cues.push({ k: 'send', t: SEND - 0.1 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, NO_CAPTIONS: false, CAP_UNTIL: t1[1] - 0.05, STATIC_FACE: true };
}
