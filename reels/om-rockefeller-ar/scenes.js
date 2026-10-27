'use strict';
// ---------------------------------------------------------------------------
// "في برج مكاتب جديد قادم على شارع الشيخ زايد يحمل اسم روكفيلر" - voice note n4 of 27 Oct 2026 (03:41), the whole take: the name's
// background (Standard Oil, Rockefeller Center), Christian Rockefeller and LMD, the amenities, the options, the prices, the three points, "report".
// Everything on screen in Arabic, right to left; every beat is a real page (marker on the exact words) or the map; no face (audio only); captions on the
// opening line only.  His voice: the whole note, untouched (one plain gain, pauses over 0.3 s shortened).  Pages: pagedata.js (captures in assets/, not
// committed).  Beats reused from ../office-market-ar (the combined video), re-timed with OFFS.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], add = (s) => { SCENES.push(s); return s; };
  // word times.  A(): anchors written in the combined video's times (the beats come from ../office-market-ar), shifted to this video by OFFS
  // (the same note with the same pauses, so one constant shift per piece); B(): anchors in this video's own times.
  const OFFS = [];
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
  const TW = P.tower;
  // ---- 1. a new office tower on Sheikh Zayed Road called Rockefeller; first, the background of the name
  const k1 = [0, B('عائلة', 9.2) - 0.1];
  flight('m_r1', k1, [[0, 55.268, 25.2, 13.2, 60, 26], [dur(k1) + 0.5, 55.266, 25.196, 14.8, 150, 44]], (t, cam) => {
    mapRoad(t, cam, 'E11', { a0: 0.3, dur: 1.2, alpha: 0.9 }); towerPin(t, cam, TW, B('برج', 0.3) + 0.2);
    calloutAR(t, cam, TW, 'برج روكفيلر للأعمال', 'شارع الشيخ زايد', GOLD, B('روكفيلر', 3.6) - 0.1, 0, -140, 230);
    chip(t, 'خلفية الاسم وعلاقته بعالم الأعمال', B('خلفية', 6.7) - 0.2, k1[1], 1150, '#FFFFFF', 32);
  });
  beat(k1, ['برج مكاتب جديد', 'برج روكفيلر للأعمال', 'على شارع الشيخ زايد']);
  // ---- 2. the family: Standard Oil, Rockefeller Center (Arabic Wikipedia)
  const k2 = [k1[1], B('جون', 12.2) - 0.1], k3 = [k2[1], B('وابنه', 15) - 0.1], k4 = [k3[1], B('واليوم', 21.6) - 0.1];
  page('p_fam', 'wiki_family', k2, [[k2[0] + 0.1, qy('wiki_family', 0)]], [[0, B('لها', 10.2), B('الأمريكي', 11.6) + 0.4]], true, 0.92);
  beat(k2, ['عائلة روكفيلر', 'تاريخ طويل في الاقتصاد الأمريكي', 'الصناعة والسياسة والصيرفة'], 'ويكيبيديا · عائلة روكفلر');
  page('p_so', 'wiki_so', k3, [[k3[0] + 0.1, qy('wiki_so', 0)]], [[0, B('شارك', 13.2) - 0.1, B('أويل', 14.7) + 0.3]], true, 0.92);
  beat(k3, ['جون دي روكفيلر', 'شارك في تأسيس ستاندرد أويل', 'عام 1870'], 'ويكيبيديا · ستاندرد أويل');
  page('p_rc', 'wiki_rc', k4, [[k4[0] + 0.1, (qy('wiki_rc', 0) + qy('wiki_rc', 1)) / 2]], [[1, B('وراء', 15.9), B('نيويورك', 17.7) + 0.4], [0, B('مجمع', 18.2), B('واحد', 21.2) + 0.2]], true, 0.92);
  beat(k4, ['وابنه', 'روكفيلر سنتر في نيويورك', 'مجمع للأعمال والتجارة والإعلام'], 'ويكيبيديا · مركز روكفلر');
  // ---- 3. Christian Rockefeller, the sixth generation, with the developer LMD; his first branded real-estate project
  const k5 = [k4[1], B('بالشراكة', 27.4) - 0.1], k6 = [k5[1], B('وهذا', 29.5) - 0.1], k7 = [k6[1], B('ومن', 35.4) - 0.1];
  page('p_masd1', 'masd_rock', k5, [[B('كريستيان', 22.5) + 0.2, qy('masd_rock', 0)]], [[0, B('الجيل', 23.8), B('دبي', 27.1) + 0.2]]);
  beat(k5, ['واليوم', 'كريستيان روكفيلر', 'من الجيل السادس للعائلة'], 'المصدر العقاري · أكتوبر 2026');
  page('p_bayan0', 'bayan_rock', k6, [[k6[0] + 0.1, qy('bayan_rock', 0)]], [[0, B('مع', 28.2) - 0.1, B('LMD', 29) + 0.4]], true, 0.92);
  beat(k6, ['بالشراكة مع المطور', 'LMD', 'برج كريستيان أ. روكفلر التجاري'], 'البيان · أكتوبر 2026');
  page('p_bayan1', 'bayan_rock', k7, [[B('أول', 30.1) - 0.1, qy('bayan_rock', 1)]], [[1, B('أول', 30.1), B('التجارية', 32.2) + 0.4]]);
  beat(k7, ['أول مشروع عقاري', 'يحمل علامته التجارية', 'كريستيان روكفيلر بيزنس تاور'], 'البيان · أكتوبر 2026');
  // ---- 4. his view: the brand counts when the work environment backs it
  const k8 = [k7[1], B('والمشروع', 42.3) - 0.1];
  flight('m_view', k8, [[0, 55.266, 25.196, 14.6, 150, 42], [dur(k8) + 0.5, 55.2662, 25.1958, 15.1, 150, 46]], (t, cam) => {
    towerPin(t, cam, TW, k8[0] - 2); mapRoad(t, cam, 'E11', { a0: k8[0] - 2, dur: 0.1, alpha: 0.9 });
    card(t, [['من وجهة نظري', B('ومن', 35.4)], ['قيمة البراند في المكاتب', B('قيمة', 36.6) - 0.1, true], ['تظهر لما تدعمها بيئة عمل تليق بالشركات', B('بيئة', 39.9) - 0.1]], B('ومن', 35.4) - 0.1, k8[1], 980);
  });
  beat(k8, ['من وجهة نظري', 'قيمة البراند', 'تدعمها بيئة العمل']);
  // ---- 5. five amenity floors, hospitality-inspired facilities
  const k9 = [k8[1], B('ومرافق', 48.2) - 0.1], k10 = [k9[1], B('والخيارات', 50.7) - 0.1];
  page('p_masd2', 'masd_rock', k9, [[k9[0] + 0.6, qy('masd_rock', 2)]], [[2, B('خمس', 43.8) - 0.1, B('للمرافق', 44.6) + 0.5]], true, 0.9);
  beat(k9, ['والمشروع', 'خمسة طوابق للمرافق', 'المرافق والخدمات'], 'المصدر العقاري · أكتوبر 2026');
  page('p_bayan2', 'bayan_rock', k10, [[k10[0] + 0.1, qy('bayan_rock', 2)]], [[2, B('مستوحاة', 49.1) - 0.1, B('الفندقية', 50.1) + 0.4]], true, 0.9);
  beat(k10, ['ومرافق', 'مستوحاة من الضيافة الفندقية', 'مكاتب فاخرة'], 'البيان · أكتوبر 2026');
  // ---- 6. the options, the prices and the payment plan
  const k11 = [k10[1], B('وبحسب', 55.1) - 0.1], k12 = [k11[1], B('الاسم', 69.4) - 0.1];
  const FO = [B('مستقلة', 52.2), B('نص', 53.3), B('كامل', 54.4)];
  flight('m_opts', k11, [[0, 55.266, 25.1955, 15.0, 150, 44], [dur(k11) + 0.5, 55.266, 25.1955, 15.3, 150, 46]], (t, cam) => { towerPin(t, cam, TW, k11[0] - 2); });
  beat(k11, ['الخيارات', 'من مكتب مستقل', 'إلى نص طابق أو طابق كامل']);
  flight('m_r2', k12, [[0, 55.266, 25.1955, 15.3, 150, 46], [dur(k12) + 0.5, 55.2655, 25.195, 15.6, 150, 48]], (t, cam) => {
    towerPin(t, cam, TW, k12[0] - 2); mapRoad(t, cam, 'E11', { a0: k12[0] - 2, dur: 0.1, alpha: 0.9 });
    card(t, [['بحسب التسعير الأولي المتاح', B('وبحسب', 55.1) - 0.1], ['من أقل من 4.4 مليون درهم', B('تبدأ', 58.1) - 0.1, true], ['4,000 – 4,600 درهم للقدم المربع', B('يتراوح', 61.8) + 0.3, true]], B('وبحسب', 55.1) - 0.2, B('وخطة', 67.3) - 0.1, 980);
    card(t, [['خطة الدفع', B('وخطة', 67.3) - 0.1], ['50 / 50', B('50-50', 68.9) - 0.3, true]], B('وخطة', 67.3) - 0.1, k12[1], 980);
  });
  beat(k12, ['بحسب التسعير الأولي المتاح', 'الأسعار وخطة الدفع', 'حسب الوحدة']);
  // ---- 7. the name gets attention, the comparison shows the value: three points; then the benchmark against the towers around it
  const k13 = [k12[1], B('إذا', 79) - 0.1], k14 = [k13[1], B('اكتب', 83.3) - 0.1];
  flight('m_r3', k13, [[0, 55.268, 25.198, 14.0, 120, 34], [dur(k13) + 0.5, 55.269, 25.199, 13.7, 90, 30]], (t, cam) => {
    towerPin(t, cam, TW, k13[0] - 2); mapRoad(t, cam, 'E11', { a0: k13[0] - 2, dur: 0.1, alpha: 0.9 });
    chip(t, 'الاسم يلفت الانتباه · والمقارنة تبين القيمة', B('الاسم', 69.4) - 0.1, B('هني', 73.6) - 0.2, 1150, '#FFFFFF', 30);
    card(t, [['الموقع', B('الموقع', 75.5) - 0.1, true], ['مواصفات المكتب', B('مواصفات', 76.4) - 0.1, true], ['السعر مقابل البدائل', B('والسعر', 77.6) - 0.1, true]], B('هني', 73.6) - 0.1, k13[1], 900);
  });
  beat(k13, ['الاسم يلفت الانتباه', 'والمقارنة تبين القيمة', 'الدراسة على ثلاث نقاط']);
  flight('m_r4', k14, [[0, 55.27, 25.2, 13.4, 60, 26], [dur(k14) + 0.5, 55.27, 25.2, 13.1, 30, 22]], (t, cam) => {
    towerPin(t, cam, TW, k14[0] - 2); rings(t, cam, TW, k14[0] + 0.2, k14[1], 1600);
    area(t, cam, 'difc', RED, k14[0] + 0.3, [k14[0] + 0.4, k14[1]], 0.5); area(t, cam, 'downtown', VIO, k14[0] + 0.5, [k14[0] + 0.6, k14[1]], 0.5); area(t, cam, 'bbay', TEAL, k14[0] + 0.7, [k14[0] + 0.8, k14[1]], 0.5);
    chip(t, 'مقارنة معيارية مع الأبراج المنافسة حوله', B('مقارنة', 79.7) - 0.2, k14[1], 1150, '#FFFFFF', 30);
  });
  beat(k14, ['مقارنة معيارية', 'برج روكفيلر مقابل المنافسين', 'الأبراج اللي حوله']);

  // ---------------------------------------------------------------- overlay: HUD titles, source chips, the call to action (his own, from this note)
  const CTA = B('اكتب', 83.3), KW = B('report', 83.9), SEND = B('وبطرش', 84.1), MSG = 'report', REPLY = 'بأرسل لك المقارنة كاملة';
  const overlay = (t) => {
    BEATS.forEach(({ T: B0, hud, src }, i) => {                      // consecutive beats with the same title share one title (it stays up, then fades once)
      const same = (x) => x && x.hud && hud && x.hud[1] === hud[1];
      if (hud && !same(BEATS[i - 1])) { let j = i; while (same(BEATS[j + 1])) j++; hudAR(t, hud[0], hud[1], hud[2], B0[0] + 0.05, BEATS[j].T[1] - 0.1, hud[3] || GOLD); }
      if (src) srcChip(t, src, B0[0] + 0.3, B0[1] - 0.15);
    });
    // the options: a floor of four bays - one office, half a floor, a whole floor (lights up as he names each)
    { const al = win(t, k11[0] + 0.1, k11[1] - 0.1); if (al > 0.003) {
      ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, slide(t, k11[0] + 0.1)); const y = 900, h = 330; glassPill(SAFE.x0, y, SAFE.w, h, 30);
      const lit = FO.reduce((n, a, i) => t >= a - 0.1 ? [1, 2, 4][i] : n, 0), cur = FO.reduce((k, a, i) => t >= a - 0.1 ? i : k, -1), bw = (SAFE.w - 120 - 3 * 14) / 4;
      for (let i = 0; i < 4; i++) { const x = SAFE.x1 - 60 - (i + 1) * bw - i * 14, on = i < lit; rr(x, y + 60, bw, 120, 14); ctx.fillStyle = on ? 'rgba(233,196,124,0.85)' : 'rgba(243,239,230,0.08)'; ctx.fill(); ctx.strokeStyle = on ? GOLD : 'rgba(243,239,230,0.25)'; ctx.lineWidth = 2; ctx.stroke(); }
      const L = ['مكتب مستقل', 'نص طابق', 'طابق كامل'];
      if (cur >= 0) T(L[cur], CX, y + 262, { font: F.d(800, 52), color: '#FFFFFF' });
      ctx.restore(); } }
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
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, NO_CAPTIONS: false, CAP_UNTIL: B('وقبل', 4.1) - 0.05, STATIC_FACE: true };
}
