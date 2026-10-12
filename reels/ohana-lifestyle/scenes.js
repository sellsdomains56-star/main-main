'use strict';
// ---------------------------------------------------------------------------
// Scenes for "Ohana townhouses - why townhouses" (Abu Dhabi look + real material). 94.6 s.
// Voice only (no on-camera beat). One hero per beat: satellite flight to the site, brochure picture + counter, price bars,
// real news pages as animated cards with marker highlights (Khaleej Times, WAM, Disney, Zawya, Construction Business News ME),
// a reason chain, an 80% gauge, three scenario bars from the investment study, payment timeline, two gauges, a comment call-to-action.
// Everything stays inside SAFE: content y 330-1270, x 130-950; captions at y~1372.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const add = (s, cutCue = true) => { SCENES.push(s); if (cutCue && s.a > 0.5) cues.push({ k: 'cut', t: s.a }); return s; };
  const wh = (t, d = 0.4, g, up = true) => cues.push({ k: 'wh', t, d, g, up });

  // ---- key times (from the spoken words)
  const K = {
    ohana: tw(/^OHANA$/, 0, 4.96), th: tw(/^TOWNHOUSES$/, 0, 5.28), diff: tw(/^DIFFERENT\.$/, 0, 5.98),
    two: tw(/^TWO-BEDROOM$/, 0, 6.9), fig1: tw(/^1,852/, 0, 8.28), sqft: tw(/^SQUARE$/, 0, 9.98),
    newest: tw(/^NEWEST$/, 0, 10.84), orchids: tw(/^ORCHIDS,$/, 0, 11.94), fig2: tw(/^2,470/, 0, 14.87), so: tw(/^SO$/, 0, 16.86), pct25: tw(/^25%$/, 0, 18.04),
    its: tw(/^IT'S$/, 0, 19.38), avg: tw(/^AVERAGE$/, 0, 21.44), luxury: tw(/^LUXURY$/, 0, 21.74),
    but: tw(/^BUT$/, 0, 23.59), whyth: tw(/^TOWNHOUSES\?$/, 0, 23.8), recent: tw(/^RECENT$/, 0, 24.82), yasI: tw(/^YAS$/, 0, 26.08), surr: tw(/^SURROUNDING$/, 0, 26.98), limited: tw(/^LIMITED\.$/, 0, 28.08),
    with: tw(/^WITH$/, 0, 28.4), strong: tw(/^STRONG$/, 0, 28.72), demand: tw(/^DEMAND$/, 0, 29.12), selling: tw(/^SELLING$/, 0, 30.4), days: tw(/^DAYS\.$/, 0, 31.08),
    because: tw(/^BECAUSE$/, 0, 32.06), lower: tw(/^LOWER$/, 0, 33.24), villas1: tw(/^VILLAS,$/, 0, 34.24), wider: tw(/^WIDER$/, 0, 35.5), potent: tw(/^POTENTIALLY$/, 0, 36.98), resale: tw(/^RESALE$/, 0, 37.54),
    previous: tw(/^PREVIOUS$/, 0, 38.8), villas2: tw(/^VILLAS,$/, 1, 40.94), but2: tw(/^BUT$/, 1, 41.4), second: tw(/^SECOND$/, 0, 42.28),
    pct80: tw(/^80%/, 0, 43.72), many: tw(/^MANY$/, 0, 46.96), below: tw(/^BELOW$/, 0, 47.52),
    disney: tw(/^DISNEY$/, 0, 49.1), island2: tw(/^ISLAND,$/, 1, 49.96), driver: tw(/^DRIVER$/, 0, 51.3), demand2: tw(/^DEMAND\.$/, 0, 52.06),
    now: tw(/^NOW,$/, 0, 52.91), study: tw(/^STUDY$/, 0, 53.76), three: tw(/^THREE$/, 0, 54.44), two2: tw(/^TWO-BEDROOM$/, 1, 56.14), hand1: tw(/^HANDOVER$/, 0, 57.26),
    scen: tw(/^SCENARIO$/, 0, 58.98), conservative: tw(/^CONSERVATIVE$/, 0, 59.66), fig433: tw(/^4\.33/, 0, 61.76), base: tw(/^BASE$/, 0, 64.52), fig473: tw(/^4\.73/, 0, 66.2),
    optimistic: tw(/^OPTIMISTIC$/, 0, 68.86), fig531: tw(/^5\.31/, 0, 71.61), scen2: tw(/^SCENARIO$/, 1, 63.48), scen3: tw(/^SCENARIO$/, 2, 68.03),
    ohana3: tw(/^OHANA$/, 2, 72.78), emirati: tw(/^EMIRATI$/, 0, 73.58), broker: tw(/^BROKER$/, 0, 73.9), emirati2: tw(/^EMIRATI$/, 1, 74.98), first: tw(/^FIRST$/, 0, 75.92), bookings: tw(/^BOOKINGS$/, 0, 77.5),
    you: tw(/^YOU$/, 0, 78.92), pct5: tw(/^5%$/, 0, 79.06), every: tw(/^EVERY$/, 0, 79.56), six2: tw(/^SIX$/, 0, 79.98), months: tw(/^MONTHS$/, 0, 80.2), rest: tw(/^REST$/, 0, 81.16), hand2: tw(/^HANDOVER$/, 1, 81.44), y2029: tw(/^2029\.?$/, 1, 82.02),
    uae: tw(/^UAE$/, 0, 83.12), pct30: tw(/^30%/, 0, 84.14), else: tw(/^ELSE$/, 0, 86.04), pct35: tw(/^35%/, 0, 86.54),
    if: tw(/^IF$/, 0, 87.34), study3: tw(/^STUDY$/, 1, 89.42), comments: tw(/^COMMENTS$/, 0, 90.0), report: tw(/^REPORT\.$/, 0, 91.44),
  };
  const FACE_SEGS = [], PUNCHES = [];                                   // voice only: no on-camera beat in this reel
  const IMAGES = { th_a: 'assets/th_a.jpg', cbn: 'assets/cbn.png', kt6: 'assets/kt6.png', wam: 'assets/orchids.png', disney: 'assets/disney.png', phase2: 'assets/phase2.png' };
  const X0 = SAFE.x0;

  // ---- 1. satellite flight to the site on Yas Canal, Yas Island -------------------------------------------------------------------------
  const s1a = 0, s1b = K.two - 0.06;
  SAT_SCENES.map = { a: s1a, b: s1b + 0.6, veil: 'top', keys: [[0, 54.605, 24.474, 12.55], [1.5, 54.616, 24.4725, 13.45], [(s1b - s1a) + 0.4, 54.6222, 24.4715, 14.35]] };
  add({ id: 'map', kind: 'sat', a: s1a, b: s1b, cfg: {
    outlines: [{ key: 'yas', t0: s1a + 0.5, t1: K.ohana + 0.55 }],
    pins: [{ lon: 54.6220, lat: 24.4720, t: K.ohana, title: 'OHANA', sub: 'YAS CANAL · YAS ISLAND' }, { lon: 54.6074, lat: 24.4837, t: K.diff + 0.15, title: 'FERRARI WORLD' }],
    top(t) {
      bw(t, 'YAS ISLAND · ABU DHABI', 375, s1a + 0.3, { size: 42, ls: 6, color: C.dim, w: 700 });
      bw(t, 'OHANA TOWNHOUSES', 455, K.ohana - 0.1, { size: 74, ls: 2, hl: true });
      bw(t, 'ARE DIFFERENT', 535, K.diff - 0.1, { size: 62, ls: 4, color: C.gold });
    } } });
  cues.push({ k: 'pin', t: K.ohana }, { k: 'pin', t: K.diff + 0.15 }, { k: 'wh', t: s1a - 0.1, d: 0.7 });

  // ---- 2. two-bedroom townhouse: 1,852 per square foot ---------------------------------------------------------------------------------------
  const s2b = K.newest - 0.08;
  add({ id: 'price', a: s1b, b: s2b, box: [330, 1270], fn(t) {
    card(t, 'th_a', { x: 140, y: 345, w: 800, h: 420, a: s1b + 0.04, out: s2b - 0.3, from: [-260, 40], rot: -2, fit: 'cover', fy: 0.35, zoom: [1, 1.05], chip: 'OHANA · TOWNHOUSES' });
    bw(t, 'TWO-BEDROOM TOWNHOUSE', 880, K.two - 0.1, { size: 52, ls: 4, color: C.dim, w: 700 });
    bigNumber(t, { val: 1852, dec: 0, fin: '1,852', suffix: '', a0: K.fig1, a1: K.fig1 + 1.2, y: 1010, sc: 0.9 });
    bw(t, 'DIRHAMS PER SQ FT', 1235, K.sqft - 0.05, { size: 60, ls: 8, color: C.gold });
  } });
  cues.push({ k: 'wh', t: K.fig1 - 0.1, d: 0.3 });

  // ---- 3a. The Orchids (same island): ~2,470 -> Ohana is 25% cheaper -----------------------------------------------------------------------------
  const s3b = K.its - 0.04;
  add({ id: 'orchids', a: s2b, b: s3b, box: [330, 1270], fn(t) {
    bw(t, 'DIRHAMS PER SQ FT', 392, s2b + 0.05, { size: 46, ls: 8, color: C.dim, w: 700 });
    const r1 = barRow(t, { label: 'OHANA', sub: '2-BEDROOM TOWNHOUSE', y: 520, a: s2b + 0.1, g0: s2b + 0.25, g1: s2b + 1.0, val: 1852, max: 2470, gold: true });
    barRow(t, { label: 'THE ORCHIDS', sub: 'NEWEST TOWNHOUSES · SAME ISLAND', y: 800, a: K.orchids - 0.2, g0: K.fig2 - 0.1, g1: K.fig2 + 1.35, val: 2470, max: 2470 });
    const gp = ea(t, K.so + 0.5, K.pct25 + 0.35, E.out4);                       // the gap between the two bars = 25%
    if (gp > 0.002 && r1) {
      const gx = X0 + r1.len, gw = (SAFE.w - r1.len) * gp;
      ctx.save(); rr(gx + 6, r1.by + 3, Math.max(gw - 6, 2), 94, 18); ctx.setLineDash([14, 10]); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
      T('−25%', gx + 6 + (SAFE.w - r1.len) / 2, r1.by + 66, { font: F.d(800, 48), color: C.gold, alpha: ea(t, K.pct25, K.pct25 + 0.3) }); ctx.restore();
      line(X0 + SAFE.w, r1.by + 100, X0 + SAFE.w, 872, { color: C.gold, w: 3, dash: [10, 10], alpha: gp * 0.8 });
    }
    bw(t, '25% CHEAPER', 1160, K.pct25 - 0.15, { size: 112, ls: 2, hl: true, maxW: 740 });
    T("SOURCES: OHANA PRICE LIST · THE ORCHIDS · CHRISTIE'S H1 2026", CX, 1236, { font: F.d(700, 26), ls: 1, color: C.dim, alpha: 0.9, sx: Math.min(1, SAFE.w / M("SOURCES: OHANA PRICE LIST · THE ORCHIDS · CHRISTIE'S H1 2026", F.d(700, 26), 1)) });
  } });
  cues.push({ k: 'wh', t: K.orchids - 0.2, d: 0.3 }, { k: 'stamp', t: K.pct25 - 0.1 });

  // ---- 3b. ...even cheaper than the average luxury apartment on Yas ------------------------------------------------------------------------------
  const s4a = K.but - 0.04;
  add({ id: 'apts', a: s3b, b: s4a, box: [330, 1270], fn(t) {
    bw(t, 'EVEN CHEAPER', 450, K.its - 0.05, { size: 112, ls: 2, hl: true });
    barRow(t, { label: 'OHANA', sub: '2-BEDROOM TOWNHOUSE', y: 640, a: s3b - 5, g0: s3b - 5, g1: s3b - 4, val: 1852, max: 2470, gold: true });
    barRow(t, { label: 'YAS LUXURY APARTMENTS', sub: 'AVERAGE PRICE PER SQ FT', y: 930, a: K.avg - 1.0, g0: K.luxury, g1: K.luxury + 1.1, val: 2393, max: 2470 });
    T("SOURCES: OHANA PRICE LIST · THE ORCHIDS · CHRISTIE'S H1 2026", CX, 1236, { font: F.d(700, 26), ls: 1, color: C.dim, alpha: 0.9, sx: Math.min(1, SAFE.w / M("SOURCES: OHANA PRICE LIST · THE ORCHIDS · CHRISTIE'S H1 2026", F.d(700, 26), 1)) });
  } });
  cues.push({ k: 'wh', t: K.avg - 0.2, d: 0.3 });

  // ---- 4. but why townhouses? recent townhouse launches on Yas have been limited ----------------------------------------------------------------------
  const s5b = K.with - 0.05;
  add({ id: 'why', a: s4a, b: s5b, box: [330, 1270], fn(t) {
    bw(t, 'BUT WHY', 520, K.but - 0.05, { size: 60, ls: 10, color: C.dim, w: 700, out: K.recent - 0.15 });
    bw(t, 'TOWNHOUSES?', 650, K.whyth - 0.1, { size: 118, ls: 2, hl: true, out: K.recent - 0.15 });
    bw(t, 'RECENT TOWNHOUSE LAUNCHES', 520, K.recent - 0.05, { size: 60, ls: 3 });
    bw(t, 'ON YAS ISLAND', 640, K.yasI - 0.1, { size: 86, ls: 2, color: C.gold });
    bw(t, 'AND SURROUNDING AREAS', 745, K.surr - 0.05, { size: 48, ls: 4, color: C.dim, w: 700 });
    bw(t, 'LIMITED', 1010, K.limited - 0.1, { size: 170, ls: 0, hl: true });
  } });
  cues.push({ k: 'wh', t: K.recent - 0.1, d: 0.3 }, { k: 'stamp', t: K.limited - 0.1 });

  // ---- 5. strong demand (Ohana: Dh6 billion in 72 hours) + selling out within days (The Orchids at Yas Acres) -------------------------------------
  const s6b = K.because - 0.05;
  add({ id: 'demand', a: s5b, b: s6b, box: [330, 1270], fn(t) {
    bw(t, 'STRONG DEMAND', 385, K.strong - 0.1, { size: 62, ls: 4, color: C.gold, out: K.selling - 0.25 });
    bw(t, 'SOLD OUT WITHIN DAYS', 385, K.selling - 0.1, { size: 62, ls: 2, hl: true });
    card(t, 'kt6', { x: 140, y: 480, w: 800, h: 520, a: s5b + 0.04, out: K.selling - 0.25, from: [-250, 50], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'KHALEEJ TIMES · OHANA',
      focus: [{ bbox: [49, 1250, 1360, 340], t0: s5b + 0.3, t1: s5b + 1.0, zoom: 1.12 }],
      hl: [{ bbox: [427, 1381, 487, 74], t0: K.strong + 0.1, t1: K.strong + 0.6 }, { bbox: [1299, 1381, 105, 74], t0: K.demand + 0.2, t1: K.demand + 0.5 }, { bbox: [53, 1501, 254, 74], t0: K.demand + 0.45, t1: K.demand + 0.8 }] });
    card(t, 'wam', { x: 140, y: 480, w: 800, h: 520, a: K.selling - 0.15, out: s6b - 0.3, from: [250, 50], rot: 1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'WAM · 26 JUN 2026',
      focus: [{ bbox: [188, 2185, 1600, 150], t0: K.selling - 0.1, t1: K.selling + 0.6, zoom: 1.08 }],
      hl: [{ bbox: [1245, 2196, 424, 42], t0: K.selling + 0.25, t1: K.selling + 0.85 }, { bbox: [533, 2282, 613, 37], t0: K.days - 0.1, t1: K.days + 0.5 }] });
    bw(t, 'DH6 BILLION IN 72 HOURS', 1120, K.demand - 0.1, { size: 54, ls: 3, color: C.gold, out: K.selling - 0.25 });
    bw(t, 'OHANA · FIRST PHASE', 1185, K.demand, { size: 38, ls: 6, color: C.dim, w: 700, out: K.selling - 0.25 });
    bw(t, 'THE ORCHIDS TOWNHOUSES', 1120, K.selling + 0.2, { size: 54, ls: 3, color: C.gold });
    bw(t, 'SOLD OUT · 680 MILLION DIRHAMS', 1185, K.selling + 0.35, { size: 38, ls: 6, color: C.dim, w: 700 });
  } });
  cues.push({ k: 'wh', t: K.strong - 0.2, d: 0.3 }, { k: 'wh', t: K.selling - 0.2, d: 0.3 });

  // ---- 6. lower entry price than villas -> a wider pool of buyers -> (potentially) easier resale ------------------------------------------------
  const s7b = K.previous - 0.05;
  add({ id: 'chain', a: s6b, b: s7b, box: [330, 1270], fn(t) {
    bw(t, 'TOWNHOUSE VS VILLA', 392, s6b + 0.1, { size: 46, ls: 8, color: C.dim, w: 700 });
    pillRow(t, 'tag', 'LOWER ENTRY PRICE', 560, K.lower - 0.2, { w: 820, h: 128 });
    pillRow(t, 'building', 'WIDER POOL OF BUYERS', 750, K.wider - 0.2, { w: 820, h: 128 });
    pillRow(t, 'chart', 'EASIER RESALE', 940, K.resale - 0.2, { w: 820, h: 128 });
    const arrow = (y, a0) => { const p = ea(t, a0, a0 + 0.4, E.out3); if (p > 0.002) { strokePoly([[CX, y], [CX, y + 46]], p, { color: C.gold, w: 8 }); if (p > 0.95) strokePoly([[CX - 16, y + 30], [CX, y + 48], [CX + 16, y + 30]], 1, { color: C.gold, w: 8 }); } };
    arrow(630, K.wider - 0.4); arrow(820, K.resale - 0.4);
    bw(t, 'POTENTIALLY', 1070, K.potent - 0.1, { size: 46, ls: 10, color: C.gold, w: 700 });
  } });
  cues.push({ k: 'wh', t: K.lower - 0.2, d: 0.3 }, { k: 'wh', t: K.wider - 0.2, d: 0.3 }, { k: 'wh', t: K.resale - 0.2, d: 0.3 });

  // ---- 7. previous launches: villas. Ohana's second phase is different (the launch press release) ---------------------------------------------------
  const s8b = K.pct80 - 0.05;
  add({ id: 'phase2', a: s7b, b: s8b, box: [330, 1270], fn(t) {
    bw(t, 'PREVIOUS LAUNCHES ON YAS', 385, K.previous - 0.05, { size: 46, ls: 6, color: C.dim, w: 700 });
    const st = ea(t, K.but2 - 0.15, K.but2 + 0.35, E.out4);
    bw(t, 'VILLAS', 520, K.villas2 - 0.5, { size: 120, ls: 2, color: st > 0.5 ? C.mute : C.ink });
    if (st > 0.002) line(CX - 220, 482, CX - 220 + 440 * st, 482, { color: C.gold, w: 10 });
    bw(t, 'OHANA PHASE 2', 650, K.second - 0.15, { size: 84, ls: 2, hl: true });
    card(t, 'phase2', { x: 140, y: 740, w: 800, h: 440, a: K.second - 0.2, out: s8b - 0.3, from: [0, 120], rot: 1.2, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'ZAWYA · OHANA · 12 OCT 2026',
      focus: [{ bbox: [60, 2990, 1400, 110], t0: K.second - 0.1, t1: K.second + 0.6, zoom: 0.8 }],
      hl: [{ bbox: [595, 3002, 855, 28], t0: K.second + 0.4, t1: K.second + 1.2 }, { bbox: [65, 3050, 435, 26], t0: K.second + 1.0, t1: K.second + 1.6 }] });
  } });
  cues.push({ k: 'wh', t: K.previous - 0.1, d: 0.3 }, { k: 'stamp', t: K.second });

  // ---- 8. 80% of this launch consists of townhouses, many priced below 5 million ---------------------------------------------------------------------
  const s9b = K.disney - 0.1;
  add({ id: 'eighty', a: s8b, b: s9b, box: [330, 1270], fn(t) {
    bw(t, 'PHASE 2 LAUNCH', 400, s8b + 0.05, { size: 46, ls: 8, color: C.dim, w: 700 });
    gauge(t, { cx: CX, cy: 640, r: 190, pct: 80, a0: K.pct80 - 0.1, a1: K.pct80 + 1.0, gold: true, l1: 'OF THIS LAUNCH', l2: 'ARE TOWNHOUSES' });
    bw(t, 'MANY PRICED', 1080, K.many - 0.1, { size: 46, ls: 8, color: C.dim, w: 700 });
    bw(t, 'BELOW 5 MILLION', 1185, K.below - 0.1, { size: 92, ls: 2, hl: true });
    T('SOURCE: INVESTMENT STUDY · MILLION DIRHAMS', CX, 1250, { font: F.d(700, 26), ls: 1, color: C.dim, alpha: ea(t, K.below, K.below + 0.4) * 0.9 });
  } });
  cues.push({ k: 'wh', t: K.pct80 - 0.2, d: 0.3 }, { k: 'stamp', t: K.below - 0.1 });

  // ---- 9. Disney is coming to Yas Island (Disney's own announcement) --------------------------------------------------------------------------------------
  const s10b = K.now - 0.04;
  add({ id: 'disney', a: s9b, b: s10b, box: [330, 1270], fn(t) {
    bw(t, 'DISNEY ON YAS ISLAND', 385, K.disney - 0.1, { size: 62, ls: 3, hl: true });
    card(t, 'disney', { x: 140, y: 495, w: 800, h: 510, a: s9b + 0.04, out: s10b - 0.3, from: [-250, 50], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'THE WALT DISNEY COMPANY · MAY 2025',
      focus: [{ bbox: [70, 920, 2020, 1130], t0: s9b + 0.3, t1: s9b + 0.9, zoom: 1.0 }, { bbox: [900, 2309, 600, 36], t0: K.island2 - 0.6, t1: K.island2 + 0.2, zoom: 1.15 }],
      hl: [{ bbox: [1245, 2309, 150, 36], t0: K.island2 - 0.05, t1: K.island2 + 0.5 }] });
    bw(t, 'ANOTHER MAJOR DRIVER', 1110, K.driver - 0.15, { size: 52, ls: 3, color: C.dim, w: 700 });
    bw(t, 'OF FUTURE DEMAND', 1215, K.demand2 - 0.55, { size: 76, ls: 2, hl: true });
  } });
  cues.push({ k: 'wh', t: K.disney - 0.2, d: 0.35 });

  // ---- 10a. our investment study models three scenarios (2-bedroom townhouse, by handover in 2029) -----------------------------------------------------
  const s11b = K.scen - 0.05;
  add({ id: 'study', a: s10b, b: s11b, box: [330, 1270], fn(t) {
    icon('house', CX, 450, 70, { p: ea(t, s10b + 0.2, K.three + 0.4, E.out3), color: C.gold, w: 7 });
    bw(t, 'INVESTMENT STUDY', 640, K.study - 0.15, { size: 100, ls: 2, hl: true });
    bw(t, 'THREE SCENARIOS', 790, K.three - 0.1, { size: 84, ls: 2 });
    bw(t, '2-BEDROOM TOWNHOUSE', 910, K.two2 - 0.1, { size: 60, ls: 3, color: C.gold });
    bw(t, 'BY HANDOVER · 2029', 1030, K.hand1 - 0.1, { size: 72, ls: 3 });
  } });
  cues.push({ k: 'wh', t: K.study - 0.2, d: 0.3 });

  // ---- 10b. the three scenarios: 4.33 / 4.73 / 5.31 million ------------------------------------------------------------------------------------------------
  const s12b = K.ohana3 - 0.05;
  add({ id: 'scen', a: s11b, b: s12b, box: [330, 1270], fn(t) {
    bw(t, '2-BED TOWNHOUSE · BY 2029', 392, s11b + 0.05, { size: 44, ls: 6, color: C.dim, w: 700 });
    barRow(t, { label: 'SCENARIO 1', sub: 'CONSERVATIVE GROWTH', y: 470, a: K.scen - 0.1, g0: K.fig433 - 0.2, g1: K.fig433 + 0.9, val: 4.33, dec: 2, max: 5.31 });
    barRow(t, { label: 'SCENARIO 2', sub: 'BASE CASE GROWTH', y: 720, a: K.scen2 - 0.1, g0: K.fig473 - 0.2, g1: K.fig473 + 0.9, val: 4.73, dec: 2, max: 5.31, gold: true });
    barRow(t, { label: 'SCENARIO 3', sub: 'OPTIMISTIC GROWTH', y: 970, a: K.scen3 - 0.1, g0: K.fig531 - 0.2, g1: K.fig531 + 0.9, val: 5.31, dec: 2, max: 5.31 });
    bw(t, 'MILLION DIRHAMS', 1195, K.fig433 - 0.5, { size: 46, ls: 8, color: C.gold });
    T('MODELLED SCENARIOS · NOT A GUARANTEE · SOURCE: INVESTMENT STUDY', CX, 1250, { font: F.d(700, 24), ls: 1, color: C.dim, alpha: ea(t, K.fig433, K.fig433 + 0.4) * 0.9, sx: Math.min(1, SAFE.w / M('MODELLED SCENARIOS · NOT A GUARANTEE · SOURCE: INVESTMENT STUDY', F.d(700, 24), 1)) });
  } });
  cues.push({ k: 'wh', t: K.scen - 0.1, d: 0.3 }, { k: 'wh', t: K.scen2 - 0.1, d: 0.3 }, { k: 'wh', t: K.scen3 - 0.1, d: 0.3 });

  // ---- 11. the Emirati Broker Program (Ohana's own news: Construction Business News ME) -------------------------------------------------------------------
  const s13b = K.you - 0.04;
  add({ id: 'prog', a: s12b, b: s13b, box: [330, 1270], fn(t) {
    bw(t, 'EMIRATI BROKER PROGRAM', 385, K.emirati - 0.1, { size: 62, ls: 2, hl: true });
    card(t, 'cbn', { x: 140, y: 495, w: 800, h: 510, a: s12b + 0.04, out: s13b - 0.3, from: [-250, 50], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'CONSTRUCTION BUSINESS NEWS ME',
      focus: [{ bbox: [72, 690, 1270, 170], t0: s12b + 0.6, t1: s12b + 1.3, zoom: 1.12 }, { bbox: [365, 3973, 489, 32], t0: K.emirati2 - 0.3, t1: K.emirati2 + 0.7, zoom: 1.45 }, { bbox: [308, 4031, 629, 31], t0: K.bookings - 0.6, t1: K.bookings + 0.1, zoom: 1.2 }],
      hl: [{ bbox: [1113, 701, 226, 67], t0: K.emirati, t1: K.emirati + 0.45 }, { bbox: [74, 789, 630, 69], t0: K.broker, t1: K.broker + 0.6 },
        { bbox: [365, 3973, 489, 32], t0: K.first - 0.05, t1: K.first + 0.8 }, { bbox: [308, 4031, 629, 31], t0: K.bookings - 0.1, t1: K.bookings + 0.9 }] });
    pillRow(t, 'flag', 'FIRST ACCESS', 1100, K.first - 0.1, { w: 820, h: 104 });
    pillRow(t, 'check', 'LAUNCH BOOKINGS', 1220, K.bookings - 0.15, { w: 820, h: 104 });
  } });
  cues.push({ k: 'wh', t: K.emirati - 0.2, d: 0.3 }, { k: 'wh', t: K.first - 0.1, d: 0.3 }, { k: 'wh', t: K.bookings - 0.15, d: 0.3 });

  // ---- 12. payment plan: 5% every six months, the rest at handover in 2029 ------------------------------------------------------------------------------------
  const s14b = K.uae - 0.04;
  add({ id: 'plan', a: s13b, b: s14b, box: [330, 1270], fn(t) {
    bigNumber(t, { pre: 'YOU PAY', preT: K.you, val: 5, dec: 0, fin: '5', suffix: '%', a0: K.pct5, a1: K.pct5 + 0.5, y: 625, sc: 0.8 });
    bw(t, 'EVERY SIX MONTHS', 805, K.every - 0.05, { size: 66, ls: 4, color: C.gold });
    const ly = 925, xs = [170, 320, 470, 620], xf = 840, nodeT = [K.pct5 + 0.05, K.every + 0.1, K.six2 + 0.1, K.months + 0.1];
    const lp = ea(t, K.pct5, K.rest + 0.3, E.inOut2); if (lp > 0.002) strokePoly([[xs[0], ly], [xf, ly]], lp, { color: 'rgba(243,239,230,0.35)', w: 6 });
    xs.forEach((x, i) => { const e = ea(t, nodeT[i], nodeT[i] + 0.4, E.back), al = ea(t, nodeT[i], nodeT[i] + 0.15); if (al <= 0.003) return; dot(x, ly, 26 * e, C.gold, al); T('5%', x, ly + 66, { font: F.d(800, 40), ls: 1, color: C.ink, alpha: al }); });
    const fe = ea(t, K.rest - 0.05, K.rest + 0.5, E.back), fa = ea(t, K.rest - 0.05, K.rest + 0.2);
    if (fa > 0.003) { glow(xf, ly, 110, '233,196,124', 0.5 * fa); dot(xf, ly, 44 * fe, C.gold, fa); icon('house', xf, ly + 2, 24, { p: ea(t, K.rest, K.rest + 0.6), color: '#0A0A0B', w: 5 }); }
    bw(t, 'THE REST AT HANDOVER', 1115, K.rest - 0.1, { size: 56, ls: 3 });
    bw(t, '2029', 1235, K.y2029 - 0.15, { size: 108, ls: 2, hl: true });
  } });
  cues.push({ k: 'wh', t: K.pct5 - 0.1, d: 0.3 }, { k: 'pin', t: K.rest });

  // ---- 13. UAE nationals 30% before handover, everyone else 35% ----------------------------------------------------------------------------------------------
  const s15b = K.if - 0.04;
  add({ id: 'split', a: s14b, b: s15b, box: [330, 1270], fn(t) {
    bw(t, 'PAID BEFORE HANDOVER', 410, K.uae - 0.1, { size: 50, ls: 7, color: C.dim, w: 700 });
    gauge(t, { cx: 340, pct: 30, a0: K.pct30 - 0.1, a1: K.pct30 + 0.8, gold: true, l1: 'UAE', l2: 'NATIONALS' });
    gauge(t, { cx: 740, pct: 35, a0: K.pct35 - 0.1, a1: K.pct35 + 0.8, l1: 'EVERYONE', l2: 'ELSE' });
  } });
  cues.push({ k: 'wh', t: K.uae - 0.1, d: 0.3 }, { k: 'wh', t: K.else - 0.2, d: 0.3 });

  // ---- 14. call to action: write "study" in the comments --------------------------------------------------------------------------------------------------------
  const send = K.comments + 0.15;
  add({ id: 'cta', a: s15b, b: DUR, last: true, box: [440, 1280], fn(t) {
    sceneChat(t, { head: 'Full study?', sub: 'Ohana Townhouses · Yas Island', show: s15b + 0.25, typeA: K.study3 - 0.05, typeB: K.study3 + 0.45, send, msg: 'study', reply: 'Full report', ph: 'Add a comment…' });
  } });
  cues.push({ k: 'send', t: send });

  const OVERLAYS = [];
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, PIV: [540, 1500], FOOT_MAX: 124 };
}
