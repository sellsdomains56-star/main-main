'use strict';
// ---------------------------------------------------------------------------
// Scenes for "Is Dubai heading for another 2008?" (Abu Dhabi look). buildScenes() is called once the timeline is loaded.
// Beats: FACE (him, full-screen) 0-6.9 and the "corrections are part of every cycle" line; everything else is one calm hero graphic per beat:
// the market-cycle curve, Fitch's 15%, the 917 billion, the geopolitical list, the 2.5 billion, what to watch, then a satellite flight over Dubai.
// ---------------------------------------------------------------------------
// the schematic price curve of the cycle (illustrative, not data): control points -> Catmull-Rom spline sampled by segment index s in [0, 6]
const CYC_PTS = [[110, 960], [250, 830], [425, 1120], [600, 850], [745, 1000], [830, 1140], [975, 780]];
const CYC = (() => {
  const P = CYC_PTS, out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < 40; k++) {
      const u = k / 40, u2 = u * u, u3 = u2 * u;
      const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push({ s: i + u, x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]) });
    }
  }
  const L = P[P.length - 1]; out.push({ s: P.length - 1, x: L[0], y: L[1] }); return out;
})();
function curveUpTo(s) {
  const pts = []; for (const q of CYC) { if (q.s <= s) pts.push([q.x, q.y]); else { const k = pts.length; if (k) { const a = CYC[k - 1], b = q, f = (s - a.s) / (b.s - a.s); pts.push([lerp(a.x, b.x, f), lerp(a.y, b.y, f)]); } break; } }
  return pts;
}

function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const cut = t => cues.push({ k: 'cut', t });
  const add = (s, cutCue = true) => { SCENES.push(s); if (cutCue && s.a > 0.5) cut(s.a); return s; };
  const yr = (y, n = 0, fb = 0) => tw(new RegExp('^' + y + '[,.?]?$'), n, fb);

  // ---- key times (from the spoken words) ----
  const K = {
    y2008: tw(/^2008,$/, 0, 7.3), crash: tw(/^CRASH\.?$/, 0, 9.72), y2014: tw(/^2014,$/, 0, 10.58), peaked: tw(/^PEAKED$/, 0, 11.48), corr: tw(/^CORRECTION\.?$/, 0, 13.34), followed: tw(/^FOLLOWED$/, 0, 12.36),
    y2020: tw(/^2020,$/, 0, 14.04), covid: tw(/^COVID$/, 0, 14.76), down: tw(/^DOWN$/, 0, 15.88), recov: tw(/^RECOVERED,$/, 0, 17.46), prices: tw(/^PRICES$/, 0, 20.24, 19.5), p60: tw(/^60%$/, 0, 21.46), between: tw(/^BETWEEN$/, 0, 22.38), early: tw(/^EARLY$/, 0, 23.88), y2025a: tw(/^2025\.$/, 0, 24.22),
    in2025: tw(/^2025,$/, 0, 25.36), fitch: tw(/^FITCH$/, 0, 26.06), poss: tw(/^POSSIBLE$/, 0, 27.08), p15: tw(/^15%$/, 0, 27.5), thru: tw(/^THROUGH$/, 0, 28.62),
    yet: tw(/^YET$/, 0, 30.04), over: tw(/^OVER$/, 0, 31.26), n917: tw(/^917$/, 0, 31.54), bil1: tw(/^BILLION$/, 0, 32.46), real: tw(/^REAL$/, 0, 33.32), y2025b: tw(/^2025$/, 0, 34.52),
    geo: tw(/^GEOPOLITICAL$/, 0, 36.42), tens: tw(/^TENSIONS$/, 0, 37.06), affect: tw(/^AFFECTING$/, 0, 38.88), tour: tw(/^TOURISM,$/, 0, 39.3), inv: tw(/^INVESTOR$/, 0, 40.16), prop: tw(/^PROPERTY$/, 3, 41.32),
    but: tw(/^BUT$/, 0, 42.82, 42.0), govt: tw(/^GOVERNMENT$/, 0, 43.98), n25: tw(/^2\.5$/, 0, 45.12), bil2: tw(/^BILLION$/, 1, 45.92), econ: tw(/^ECONOMIC$/, 0, 46.68), incl: tw(/^INCLUDING$/, 0, 48.02), re: tw(/^REAL$/, 1, 49.16), constr: tw(/^CONSTRUCTION\.?$/, 0, 49.9),
    you: tw(/^YOU$/, 0, 50.28, 50.0), cycle: tw(/^CYCLE\.$/, 0, 54.18),
    watch: tw(/^WATCH$/, 0, 54.62), supply: tw(/^SUPPLY,$/, 0, 55.36), rental: tw(/^RENTAL$/, 0, 55.84), entry: tw(/^ENTRY$/, 0, 57.48), thats: tw(/^THAT'S$/, 0, 58.08), invest: tw(/^INVESTMENT$/, 0, 58.78), decis: tw(/^DECISIONS$/, 0, 59.3), start: tw(/^START\.$/, 0, 60.34),
    rem: tw(/^REMEMBER$/, 0, 60.88), sheikh: tw(/^SHEIKH$/, 0, 61.16), bubble: tw(/^BUBBLE$/, 0, 62.74), people: tw(/^PEOPLE$/, 0, 63.54), burst: tw(/^BURST,$/, 0, 65.82), chasing: tw(/^CHASING$/, 0, 67.76),
    q2008: tw(/^2008\?$/, 0, 3.9), y20: tw(/^20$/, 0, 6.38),
  };
  const VOICE_END = TL.words[TL.words.length - 1].e;
  const FACE_SEGS = [[0, K.y2008 - 0.2], [K.you - 0.03, K.cycle + 0.4]];
  const PUNCHES = [[K.q2008, 0.06], [K.y20, 0.06], [K.you + 0.5, 0.05], [tw(/^CORRECTIONS$/, 0, 52.16), 0.06]];

  // ---- 1. the cycle: 2008 -> 2014 -> 2020 -> recovery (+60%) -----------------------------------------------------------------------
  const c0 = FACE_SEGS[0][1], c1 = K.in2025 - 0.35;
  const KF = [[c0 + 0.05, 0], [K.y2008 + 0.5, 1], [K.crash + 0.45, 2], [K.y2014 - 0.1, 2], [K.peaked + 0.5, 3], [K.followed - 0.1, 3], [K.corr + 0.4, 4], [K.y2020 + 0.1, 4], [K.down + 0.6, 5], [K.recov - 0.2, 5], [K.p60 + 0.3, 6]];
  const curveS = t => { if (t <= KF[0][0]) return 0; for (let i = 1; i < KF.length; i++) if (t <= KF[i][0]) { const [t0, s0] = KF[i - 1], [t1, s1] = KF[i]; return lerp(s0, s1, E.inOut2(prog(t, t0, t1))); } return 6; };
  const BIG = [['2008', K.y2008 - 0.1, K.y2014 - 0.2], ['2014', K.y2014 - 0.1, K.y2020 - 0.25], ['2020', K.y2020 - 0.1, K.recov - 0.35], ['RECOVERY', K.recov - 0.25, K.prices + 0.05]];
  const SUB = [['THE CRASH', K.crash - 0.1, K.y2014 - 0.2], ['THE PEAK', K.peaked - 0.1, K.followed - 0.2], ['THEN YEARS OF CORRECTION', K.followed + 0.1, K.y2020 - 0.25], ['COVID HITS', K.covid - 0.1, K.down - 0.05], ['DOWN EVEN FURTHER', K.down, K.recov - 0.35]];
  add({ id: 'cycle', a: c0, b: c1, box: [330, 1210], fn(t) {
    const base = ea(t, c0 + 0.05, c0 + 0.6); line(110, 1195, 975, 1195, { color: C.faint, w: 2, alpha: base });
    for (const [txt, a, b] of BIG) { const e = enter(t, a, 0.55, 34), o = 1 - ea(t, b, b + 0.25); T(txt, CX, 575 + e.dy, { font: F.d(800, txt.length > 5 ? 150 : 230), ls: -4, color: txt === 'RECOVERY' ? C.gold : C.ink, alpha: e.a * o }); }
    for (const [txt, a, b] of SUB) { const e = enter(t, a, 0.5, 18), o = 1 - ea(t, b, b + 0.25); Tfit(txt, CX, 680 + e.dy, { font: F.d(800, 58), ls: 8, color: C.gold, alpha: e.a * o }, 900); }
    bigNumber(t, { pre: 'PRICES UP', preT: K.prices, val: 60, dec: 0, fin: '60', suffix: '%', a0: K.p60 - 0.55, a1: K.p60 + 0.4, y: 520, sc: 0.8 });
    const ge = enter(t, K.between, 0.5, 18); Tfit('2022 – EARLY 2025', CX, 690 + ge.dy, { font: F.d(800, 58), ls: 8, color: C.gold, alpha: ge.a }, 900);
    const s = curveS(t); if (s > 0.001) {
      const pts = curveUpTo(s), g = pts.filter((_, i) => i >= 0), splitIdx = CYC.findIndex(q => q.s >= 5);
      const part = (pp, col) => { if (pp.length > 1) strokePoly(pp, 1, { color: col, w: 9 }); };
      const k5 = pts.length > splitIdx ? splitIdx : pts.length;
      part(pts.slice(0, k5 + 1), C.ink); if (pts.length > splitIdx) part(pts.slice(splitIdx), C.gold);
      const hd = pts[pts.length - 1]; glow(hd[0], hd[1], 70, '233,196,124', 0.5); dot(hd[0], hd[1], 15, C.gold); dot(hd[0], hd[1], 7, '#FFF8E6');
    }
  } });
  cues.push({ k: 'pop', t: K.y2008 - 0.1, f: 520 }, { k: 'pop', t: K.y2014 - 0.1, f: 560 }, { k: 'pop', t: K.y2020 - 0.1, f: 500 }, { k: 'pop', t: K.recov - 0.25, f: 640 }, { k: 'count', t: K.p60 - 0.55, t1: K.p60 + 0.4, n: 10 });

  // ---- 2. Fitch: a possible 15% correction through 2026 ------------------------------------------------------------------------
  const f1 = K.yet - 0.12;
  add({ id: 'fitch', a: c1, b: f1, box: [330, 1270], fn(t) {
    card(t, 'kt', { x: 120, y: 340, w: 840, h: 560, a: c1 + 0.05, out: f1 - 0.3, from: [220, 60], rot: -2.2, fit: 'cover', fy: 0.42, chip: 'KHALEEJ TIMES · MAY 2025', zoom: [1, 1.04],
      focus: { bbox: [45, 1230, 1300, 400], t0: K.fitch, t1: K.fitch + 0.9, zoom: 1.08 }, hl: { bbox: [255, 1375, 450, 100], t0: K.p15 - 0.15, t1: K.p15 + 0.5, color: '#FFC93C' } });
    bigNumber(t, { pre: 'POSSIBLE CORRECTION', preT: K.poss - 0.1, val: 15, dec: 0, fin: '15', suffix: '%', a0: K.p15 - 0.1, a1: K.p15 + 0.65, y: 1085, sc: 0.62 });
    icon('up', 770, 1085, 42, { p: ea(t, K.p15 + 0.6, K.p15 + 1.1), color: C.gold, w: 7, rot: Math.PI, alpha: ea(t, K.p15 + 0.6, K.p15 + 0.9) });
    bw(t, 'THROUGH 2026', 1240, K.thru - 0.1, { size: 66, ls: 8, color: C.gold });
  } });
  cues.push({ k: 'count', t: K.p15 - 0.1, t1: K.p15 + 0.65, n: 9 }, { k: 'wh', t: c1 + 0.05, d: 0.45 });

  // ---- 3. over 917 billion in real estate transactions ---------------------------------------------------------------------------
  const g0 = K.geo - 0.08;
  add({ id: 'volume', a: f1, b: g0, box: [480, 1220], fn(t) {
    bigNumber(t, { pre: 'STILL RECORDED OVER', preT: K.yet + 0.3, val: 917, dec: 0, fin: '917', suffix: '', a0: K.n917 - 0.05, a1: K.n917 + 0.9, y: 790, sc: 1.0 });
    bw(t, 'BILLION', 1005, K.bil1 - 0.05, { size: 96, ls: 14, color: C.gold });
    bw(t, 'REAL ESTATE TRANSACTIONS', 1110, K.real - 0.1, { size: 54, ls: 4, w: 800 });
    bw(t, '2025 – 2026', 1195, K.y2025b - 0.1, { size: 58, ls: 10, color: C.dim, w: 700 });
  } });
  cues.push({ k: 'count', t: K.n917 - 0.05, t1: K.n917 + 0.9, n: 14 });

  // ---- 4. geopolitical tensions -> tourism, investor confidence, transactions -----------------------------------------------------
  const r0 = K.but - 0.05;
  add({ id: 'geo', a: g0, b: r0, box: [380, 1170], fn(t) {
    const dim = 1 - 0.6 * ea(t, K.affect, K.affect + 0.4);
    bw(t, 'GEOPOLITICAL', 470, K.geo, { size: 118, ls: 2, alpha: dim });
    bw(t, 'TENSIONS', 600, K.tens, { size: 118, ls: 2, color: C.gold, alpha: dim });
    bw(t, 'AFFECTING', 760, K.affect - 0.1, { size: 54, ls: 14, color: C.dim, w: 700 });
    bw(t, 'TOURISM', 890, K.tour, { size: 100, ls: 3 });
    bw(t, 'INVESTOR CONFIDENCE', 1015, K.inv, { size: 100, ls: 3 });
    bw(t, 'PROPERTY TRANSACTIONS', 1140, K.prop, { size: 100, ls: 3 });
  } });

  // ---- 5. but Dubai is responding: 2.5 billion in incentives ----------------------------------------------------------------------
  const r1 = K.incl - 0.06;
  add({ id: 'resp', a: r0, b: r1, box: [400, 1170], fn(t) {
    const o1 = 1 - ea(t, K.govt - 0.15, K.govt + 0.15);
    bw(t, 'DUBAI IS RESPONDING', 470, K.but, { size: 88, ls: 3, color: C.gold, alpha: o1 });
    bw(t, 'THE GOVERNMENT INTRODUCED', 470, K.govt, { size: 58, ls: 6, color: C.dim, w: 700 });
    bigNumber(t, { pre: '', preT: 0, val: 2.5, dec: 1, fin: '2.5', suffix: '', a0: K.n25 - 0.05, a1: K.n25 + 0.75, y: 810, sc: 1.0 });
    bw(t, 'BILLION', 1020, K.bil2 - 0.05, { size: 96, ls: 14, color: C.gold });
    bw(t, 'ECONOMIC INCENTIVES', 1135, K.econ - 0.05, { size: 70, ls: 6 });
  } });
  cues.push({ k: 'count', t: K.n25 - 0.05, t1: K.n25 + 0.75, n: 9 });

  // ---- 6. ...including support for real estate and construction -------------------------------------------------------------------
  const face1 = FACE_SEGS[1][0] + 0.03;
  add({ id: 'support', a: r1, b: face1, box: [400, 1100], fn(t) {
    bw(t, 'INCLUDING SUPPORT FOR', 500, K.incl - 0.05, { size: 54, ls: 8, color: C.dim, w: 700 });
    iconRow(t, 'house', 'REAL ESTATE', '', 780, K.re - 0.1, K.constr);
    iconRow(t, 'building', 'CONSTRUCTION', '', 1000, K.constr - 0.1, 999);
  } });

  // ---- 7. what to watch, and where decisions start ---------------------------------------------------------------------------------
  const w0 = FACE_SEGS[1][1], w1 = K.rem - 0.12;
  add({ id: 'watch', a: w0, b: w1, box: [380, 1330], fn(t) {
    const dim = 1 - 0.55 * ea(t, K.thats, K.thats + 0.4);
    bw(t, 'WATCH', 450, K.watch, { size: 92, ls: 18, color: C.gold });
    ctx.save(); ctx.globalAlpha *= dim;
    iconRow(t, 'cube', 'FUTURE SUPPLY', '', 650, K.supply - 0.5, 999, { dimTo: 1 });
    iconRow(t, 'house', 'RENTAL DEMAND', '', 820, K.rental - 0.1, 999, { dimTo: 1 });
    iconRow(t, 'tag', 'ENTRY PRICE', '', 990, K.entry - 0.1, 999, { dimTo: 1 });
    ctx.restore();
    bw(t, 'WHERE INVESTMENT', 1190, K.invest - 0.1, { size: 84, ls: 3, color: C.gold });
    bw(t, 'DECISIONS START', 1290, K.decis - 0.1, { size: 84, ls: 3, color: C.gold });
  } });

  // ---- 8. the bubble analogy: a flight over Dubai (Palm Jumeirah -> Downtown) ------------------------------------------------------
  const m1 = VOICE_END + 0.12;
  SAT_SCENES.flight = { a: w1, b: m1 + 0.6, veil: 'tl', keys: [[0, 55.0, 25.06, 10.9], [2.8, 55.135, 25.118, 12.9], [4.2, 55.14, 25.122, 13.2], [7.0, 55.272, 25.19, 13.3]] };
  const palmT0 = K.sheikh + 0.4, palmT1 = K.sheikh + 1.7;
  add({ id: 'flight', kind: 'sat', a: w1, b: m1, cfg: {
    outlines: [{ key: 'palm', t0: palmT0, t1: palmT1 }],
    pins: [{ lon: 55.1345, lat: 25.1173, t: palmT1 - 0.1, title: 'PALM JUMEIRAH' }, { lon: 55.2744, lat: 25.1972, t: K.chasing, title: 'DOWNTOWN DUBAI', sub: 'BURJ KHALIFA' }],
    top(t) {
      const a = ea(t, K.sheikh - 0.1, K.sheikh + 0.5, E.out4) * (1 - ea(t, K.burst - 0.1, K.burst + 0.4)), dy = (1 - ea(t, K.sheikh - 0.1, K.sheikh + 0.6, E.out4)) * 26;
      T('SHEIKH MOHAMMED BIN RASHID', CX, 240 + dy, { font: F.d(800, 44), ls: 4, color: C.ink, alpha: a, sx: Math.min(1, 940 / M('SHEIKH MOHAMMED BIN RASHID', F.d(800, 44), 4)) });
      const b = ea(t, K.bubble - 0.1, K.bubble + 0.5, E.out4) * (1 - ea(t, K.burst - 0.1, K.burst + 0.4)), dy2 = (1 - ea(t, K.bubble - 0.1, K.bubble + 0.6, E.out4)) * 26;
      T('THE BUBBLE ANALOGY', CX, 330 + dy2, { font: F.d(800, 66), ls: 8, color: C.gold, alpha: b });
    } } });
  cues.push({ k: 'pin', t: palmT1 - 0.1 }, { k: 'pin', t: K.chasing }, { k: 'riser', t: w1 - 0.3, d: 0.8 });

  // ---- 9. end card (silent): message me ------------------------------------------------------------------------------------------
  const e0 = m1, send = e0 + 1.4;
  add({ id: 'cta', a: e0, b: DUR, last: true, box: [440, 1280], fn(t) {
    sceneChat(t, { head: 'Questions on Dubai?', show: e0 + 0.15, typeA: e0 + 0.8, typeB: e0 + 1.2, send, msg: 'Dubai', reply: "Let's talk" });
  } });
  cues.push({ k: 'type', t: e0 + 0.8, n: 5 }, { k: 'send', t: send }, { k: 'chime', t: send + 0.85, f: 1568 });

  // ---- overlay on his first face beat: "ANOTHER 2008?" ----------------------------------------------------------------------------
  const OVERLAYS = [ovStamp('ANOTHER 2008?', K.q2008, K.q2008 + 1.5, { y: 1040, size: 96 })];
  cues.push({ k: 'stamp', t: K.q2008 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES: { kt: 'assets/test_kt.png' } };
}
