'use strict';
// ---------------------------------------------------------------------------
// "ليش الدار اختارت إكسبو سيتي؟" - voice note n1 of 27 Oct 2026 (03:40), the whole note with his call to action "إكسبو".
// Everything on screen in Arabic, right to left; every beat is a real page (marker on the exact words) or the map; no face (audio only); captions on the
// opening line only.  His voice: the whole note, untouched (one plain gain, pauses over 0.3 s shortened).  Pages: pagedata.js (captures in assets/, not
// committed).  Beats reused from ../office-market-ar (the combined video), re-timed with OFFS.  Safe zone: x 130-950, y 300-1420.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], add = (s) => { SCENES.push(s); return s; };
  // word times.  A(): anchors written in the combined video's times (the beats come from ../office-market-ar), shifted to this video by OFFS
  // (the same note with the same pauses, so one constant shift per piece); B(): anchors in this video's own times.
  const OFFS = [[83.0, 135.5, -83.62]];
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
  // ---- 0. his opening question: Aldar, an Abu Dhabi company, expanding in Dubai, in Expo City
  const o1 = [0, B('ليش', 5.5) - 0.1], ALDAR = [54.604, 24.449];                  // Aldar HQ, Al Raha Beach, Abu Dhabi
  flight('m_o1', o1, [[0, 54.88, 24.7, 10.2, 0, 8], [dur(o1) + 0.5, 54.9, 24.72, 10.55, 0, 14]], (t, cam) => {
    calloutAR(t, cam, ALDAR, 'الدار', 'أبوظبي', GOLD, B('الدار', 1.2) - 0.1, 0, 0, 210);
    mapFlow(t, cam, ALDAR, P.expo, B('تتوسع', 3) - 0.2, 0, { dur: 1.4, bend: 0.15 });
    calloutAR(t, cam, P.expo, 'إكسبو سيتي دبي', 'دبي', GOLD, B('إكسبو', 4.8) - 0.2, 0, 0, -210);
  });
  beat(o1, ['عبدالله', 'ليش الدار تتوسع في دبي؟', 'من أبوظبي إلى إكسبو سيتي']);

  // ---- 1. Expo City
  const X0 = 83, e1 = [o1[1], A('الجواب', X0) - 0.1], e2 = [e1[1], A('الدار', 98) - 0.1], e3 = [e2[1], A('بس', 105) - 0.1], e4 = [e3[1], A('خطة', 110) - 0.3], e5 = [e4[1], A('وقريب', 112) - 0.05],
    e6 = [e5[1], A('يتجهز', 115.5) - 0.35], e7 = [e6[1], A('يعني', 117.5) - 0.05], e8 = [e7[1], A('تجهيزها', 120.5) - 0.3], e9 = [e8[1], A('والتسليم', 124) - 0.1], e10 = [e9[1], A('الحين', 127) - 0.1], e11 = [e10[1], B('إذا', 51.2) - 0.1];
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

  // ---- 2. for the project details and the area plan
  const c1 = [e11[1], B('اكتب', 54.9) - 0.1];
  page('p_sky3', 'sky_aldar', c1, [], []);
  beat(c1, ['إذا تبغى تعرف', 'تفاصيل مشروع الدار', 'وخطة تطوير المنطقة'], 'سكاي نيوز عربية · أكتوبر 2024');

  // ---------------------------------------------------------------- overlay: HUD titles, source chips, the call to action (his own, from this note)
  const CTA = B('اكتب', 54.9), KW = B('إكسبو', 55.4), SEND = B('وبأطرش', 56.4), MSG = 'إكسبو', REPLY = 'بأرسل لك التفاصيل';
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
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, NO_CAPTIONS: false, CAP_UNTIL: o1[1] - 0.05, STATIC_FACE: true };
}
