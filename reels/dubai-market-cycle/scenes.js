'use strict';
// ---------------------------------------------------------------------------
// Scenes for "Is Dubai heading for another 2008?" (Abu Dhabi look + real material). buildScenes() is called once the timeline is loaded.
// FACE (him, full-screen) 0-7.1 and 48.4-52.4; every other beat is one hero: the price cycle, real articles as animated cards (Khaleej Times on Fitch,
// the Dubai Media Office on the AED 917 billion and the AED 2.5 billion, The National on the Q3 slowdown), what-to-watch pills, a satellite flight, a chat end card.
// Everything stays inside SAFE (Reels UI-safe zone): content y 330-1270, x 120-960; captions at y~1372.
// ---------------------------------------------------------------------------
// the schematic price curve of the cycle (illustrative, not data): control points -> Catmull-Rom spline sampled by segment index s in [0, 6]
const CYC_PTS = [[130, 960], [262, 840], [425, 1120], [598, 860], [738, 1000], [818, 1130], [950, 790]];
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

  // ---- key times (from the spoken words) ----
  const K = {
    dubai1: tw(/^DUBAI$/, 0, 1.2), collapse: tw(/^COLLAPSE\.?$/, 0, 2.5), y2008: tw(/^2008,$/, 0, 7.4), crash: tw(/^CRASH\.?$/, 0, 9.9), y2014: tw(/^2014,$/, 0, 10.9), peaked: tw(/^PEAKED$/, 0, 11.7), followed: tw(/^FOLLOWED$/, 0, 12.6),
    y2020: tw(/^2020,$/, 0, 14.4), covid: tw(/^COVID$/, 0, 15.1), down: tw(/^DOWN$/, 0, 16.2), recov: tw(/^RECOVERED,$/, 0, 17.9), prices: tw(/^PRICES$/, 0, 19.0, 18.0), p60: tw(/^60%$/, 0, 20.3), between: tw(/^BETWEEN$/, 0, 21.2), y2025a: tw(/^2025\.$/, 0, 23.1),
    in2025: tw(/^2025,$/, 0, 23.8), fitch: tw(/^FITCH$/, 0, 24.6), poss: tw(/^POSSIBLE$/, 0, 25.6), p15: tw(/^15%$/, 0, 26.0), thru: tw(/^THROUGH$/, 0, 27.2),
    yet: tw(/^YET$/, 0, 28.1), over: tw(/^OVER$/, 0, 29.5), n917: tw(/^917$/, 0, 29.7), bil1: tw(/^BILLION$/, 0, 30.7), real: tw(/^REAL$/, 0, 31.5), y2025b: tw(/^2025$/, 0, 32.7),
    geo: tw(/^GEOPOLITICAL$/, 0, 34.5), tens: tw(/^TENSIONS$/, 0, 35.1), affect: tw(/^AFFECTING$/, 0, 36.9), tour: tw(/^TOURISM,$/, 0, 37.3), inv: tw(/^INVESTOR$/, 0, 38.2), prop: tw(/^PROPERTY$/, 3, 39.5, 39.0),
    but: tw(/^BUT$/, 0, 40.8, 40.0), govt: tw(/^GOVERNMENT$/, 0, 42.3), n25: tw(/^2\.5$/, 0, 43.2), bil2: tw(/^BILLION$/, 1, 44.0), econ: tw(/^ECONOMIC$/, 0, 44.8), incl: tw(/^INCLUDING$/, 0, 46.1), re: tw(/^REAL$/, 1, 47.2), constr: tw(/^CONSTRUCTION\.?$/, 0, 48.0),
    you: tw(/^YOU$/, 0, 48.4, 48.0), corr: tw(/^CORRECTIONS$/, 0, 49.9), cycle: tw(/^CYCLE\.$/, 0, 52.0),
    watch: tw(/^WATCH$/, 0, 52.6), supply: tw(/^SUPPLY,$/, 0, 53.2), rental: tw(/^RENTAL$/, 0, 53.9), entry: tw(/^ENTRY$/, 0, 55.3), thats: tw(/^THAT'S$/, 0, 55.9), invest: tw(/^INVESTMENT$/, 0, 56.6), decis: tw(/^DECISIONS$/, 0, 57.1), start: tw(/^START\.$/, 0, 58.2),
    rem: tw(/^REMEMBER$/, 0, 58.5), sheikh: tw(/^SHEIKH$/, 0, 58.9), bubble: tw(/^BUBBLE$/, 0, 60.4), people: tw(/^PEOPLE$/, 0, 61.2), burst: tw(/^BURST,$/, 0, 63.5), chasing: tw(/^CHASING$/, 0, 65.4),
    q2008: tw(/^2008\?$/, 0, 4.0), y20: tw(/^20$/, 0, 6.5),
  };
  const VOICE_END = TL.words[TL.words.length - 1].e;
  const FACE_SEGS = [[0, K.y2008 - 0.2], [K.you - 0.03, K.cycle + 0.4]];
  const PUNCHES = [[K.collapse, 0.06], [K.q2008, 0.06], [K.y20, 0.06], [K.you + 0.5, 0.05], [K.corr, 0.06]];
  const IMAGES = { kt: 'assets/kt.png', fquote: 'assets/fitch_quote.png', aed: 'assets/aed917.png', geo: 'assets/geo.png', inc: 'assets/inc_text.png', sheikh: 'assets/sheikh.jpg' };

  // ---- 1. the cycle: 2008 -> 2014 -> 2020 -> recovery (+60%) -----------------------------------------------------------------------
  const c0 = FACE_SEGS[0][1], c1 = K.in2025 - 0.38;
  const KF = [[c0 + 0.05, 0], [K.y2008 + 0.5, 1], [K.crash + 0.45, 2], [K.y2014 - 0.1, 2], [K.peaked + 0.5, 3], [K.followed - 0.1, 3], [K.followed + 1.3, 4], [K.y2020 + 0.1, 4], [K.down + 0.6, 5], [K.recov - 0.2, 5], [K.p60 + 0.3, 6]];
  const curveS = t => { if (t <= KF[0][0]) return 0; for (let i = 1; i < KF.length; i++) if (t <= KF[i][0]) { const [t0, s0] = KF[i - 1], [t1, s1] = KF[i]; return lerp(s0, s1, E.inOut2(prog(t, t0, t1))); } return 6; };
  const BIG = [['2008', K.y2008 - 0.1, K.y2014 - 0.2], ['2014', K.y2014 - 0.1, K.y2020 - 0.25], ['2020', K.y2020 - 0.1, K.recov - 0.35], ['RECOVERY', K.recov - 0.25, K.prices + 0.1]];
  const SUB = [['THE CRASH', K.crash - 0.1, K.y2014 - 0.2], ['THE PEAK', K.peaked - 0.1, K.followed - 0.2], ['THEN YEARS OF CORRECTION', K.followed + 0.1, K.y2020 - 0.25], ['COVID HITS', K.covid - 0.1, K.down - 0.05], ['DOWN EVEN FURTHER', K.down, K.recov - 0.35]];
  const TICKS = [[262, '2008', 1], [598, '2014', 3], [818, '2020', 5], [950, '2025', 6]];
  add({ id: 'cycle', a: c0, b: c1, box: [330, 1270], fn(t) {
    const base = ea(t, c0 + 0.05, c0 + 0.6); line(130, 1195, 950, 1195, { color: C.faint, w: 2, alpha: base });
    for (const [x, lab, si] of TICKS) { const e = ea(curveS(t), si - 0.15, si + 0.05); if (e > 0.003) { line(x, 1195, x, 1212, { color: C.mute, w: 3, alpha: e }); T(lab, x, 1252, { font: F.d(700, 30), ls: 2, color: C.dim, alpha: e }); } }
    for (const [txt, a, b] of BIG) { const e = enter(t, a, 0.55, 34), o = 1 - ea(t, b, b + 0.25); T(txt, CX, 575 + e.dy, { font: F.d(800, txt.length > 5 ? 150 : 230), ls: -4, color: txt === 'RECOVERY' ? C.gold : C.ink, alpha: e.a * o }); }
    for (const [txt, a, b] of SUB) { const e = enter(t, a, 0.5, 18), o = 1 - ea(t, b, b + 0.25); Tfit(txt, CX, 690 + e.dy, { font: F.d(800, 56), ls: 8, color: C.gold, alpha: e.a * o }, SAFE.w); }
    bigNumber(t, { pre: 'PRICES UP', preT: K.prices, val: 60, dec: 0, fin: '60', suffix: '%', a0: K.p60 - 0.4, a1: K.p60 + 0.5, y: 520, sc: 0.8 });
    const ge = enter(t, K.between, 0.5, 18); Tfit('2022 – EARLY 2025', CX, 700 + ge.dy, { font: F.d(800, 56), ls: 8, color: C.gold, alpha: ge.a }, SAFE.w);
    const s = curveS(t); if (s > 0.001) {
      const pts = curveUpTo(s), splitIdx = CYC.findIndex(q => q.s >= 5), k5 = pts.length > splitIdx ? splitIdx : pts.length;
      if (pts.length > 1) strokePoly(pts, 1, { color: 'rgba(233,196,124,0.16)', w: 26 });                       // soft glow under the line
      if (pts.slice(0, k5 + 1).length > 1) strokePoly(pts.slice(0, k5 + 1), 1, { color: C.ink, w: 9 }); if (pts.length > splitIdx) strokePoly(pts.slice(splitIdx), 1, { color: C.gold, w: 9 });
      const hd = pts[pts.length - 1], pu = (t * 1.1) % 1; ring(hd[0], hd[1], 14 + 40 * pu, { color: C.gold, w: 3, alpha: (1 - pu) * 0.7 }); glow(hd[0], hd[1], 70, '233,196,124', 0.5); dot(hd[0], hd[1], 15, C.gold); dot(hd[0], hd[1], 7, '#FFF8E6');
    }
  } });
  cues.push({ k: 'wh', t: K.y2008 - 0.1, d: 0.35 }, { k: 'wh', t: K.y2014 - 0.1, d: 0.35 }, { k: 'wh', t: K.y2020 - 0.1, d: 0.35 }, { k: 'wh', t: K.recov - 0.25, d: 0.4 });

  // ---- 2. Fitch (Khaleej Times): a possible 15% correction through 2026 ------------------------------------------------------------------
  const f1 = K.yet - 0.1;
  add({ id: 'fitch', a: c1, b: f1, box: [330, 1270], fn(t) {
    card(t, 'kt', { x: 140, y: 360, w: 800, h: 560, a: c1 + 0.04, out: f1 - 0.3, from: [250, 60], rot: -2.2, fit: 'cover', fy: 0, chip: 'KHALEEJ TIMES · MAY 2025', zoom: [1, 1.035],
      focus: { bbox: [110, 470, 1560, 420], t0: K.fitch - 0.2, t1: K.fitch + 0.8, zoom: 1.0 }, hl: { bbox: [352, 636, 440, 116], t0: K.p15 - 0.1, t1: K.p15 + 0.5 } });
    bigNumber(t, { pre: 'POSSIBLE CORRECTION', preT: K.poss - 0.1, val: 15, dec: 0, fin: '15', suffix: '%', a0: K.p15 - 0.1, a1: K.p15 + 0.65, y: 1100, sc: 0.62 });
    icon('up', 775, 1100, 42, { p: ea(t, K.p15 + 0.6, K.p15 + 1.1), color: C.gold, w: 7, rot: Math.PI, alpha: ea(t, K.p15 + 0.6, K.p15 + 0.9) });
    bw(t, 'THROUGH 2026', 1252, K.thru - 0.1, { size: 66, ls: 8, color: C.gold });
  } });
  cues.push({ k: 'wh', t: c1 + 0.04, d: 0.45 });

  // ---- 3. over AED 917 billion in real-estate transactions (Dubai Media Office) --------------------------------------------------------------
  const g0 = K.geo - 0.08;
  add({ id: 'volume', a: f1, b: g0, box: [330, 1270], fn(t) {
    card(t, 'aed', { x: 140, y: 360, w: 800, h: 500, a: f1 + 0.04, out: g0 - 0.3, from: [-250, 60], rot: 2, fit: 'cover', fy: 0, chip: 'DUBAI MEDIA OFFICE · JAN 2026', zoom: [1, 1.035],
      focus: { bbox: [30, 430, 1400, 320], t0: K.over - 0.3, t1: K.over + 0.5, zoom: 1.0 }, hl: { bbox: [478, 638, 600, 92], t0: K.n917, t1: K.n917 + 0.9, color: '#FFC93C', mode: 'multiply' } });
    bigNumber(t, { pre: 'OVER AED', preT: K.over - 0.1, val: 917, dec: 0, fin: '917', suffix: '', a0: K.n917 - 0.05, a1: K.n917 + 0.9, y: 1030, sc: 0.6 });
    bw(t, 'BILLION · REAL ESTATE', 1195, K.bil1 - 0.05, { size: 54, ls: 6, color: C.gold });
  } });
  cues.push({ k: 'wh', t: f1 + 0.04, d: 0.45, up: false });

  // ---- 4. geopolitical tensions -> tourism, investor confidence, property transactions (The National) ------------------------------------------
  const r0 = K.but - 0.05;
  add({ id: 'geo', a: g0, b: r0, box: [330, 1270], fn(t) {
    card(t, 'geo', { x: 140, y: 350, w: 800, h: 560, a: g0 + 0.04, out: r0 - 0.3, from: [250, 60], rot: -2, fit: 'cover', fy: 0.4, chip: 'THE NATIONAL · OCT 2026', zoom: [1, 1.035],
      focus: { bbox: [380, 1020, 1560, 380], t0: K.geo - 0.1, t1: K.geo + 0.8, zoom: 1.0 }, hl: [{ bbox: [1160, 1223, 620, 92], t0: K.affect - 0.4, t1: K.affect + 0.3 }, { bbox: [436, 1336, 520, 76], t0: K.affect - 0.1, t1: K.affect + 0.5 }] });
    pillRow(t, 'plane', 'TOURISM', 985, K.tour - 0.15, { h: 104, size: 52 });
    pillRow(t, 'briefcase', 'INVESTOR CONFIDENCE', 1105, K.inv - 0.15, { h: 104, size: 52 });
    pillRow(t, 'house', 'PROPERTY TRANSACTIONS', 1225, K.prop - 0.15, { h: 104, size: 52 });
  } });
  cues.push({ k: 'wh', t: g0 + 0.04, d: 0.45 }, { k: 'wh', t: K.tour - 0.15, d: 0.3 }, { k: 'wh', t: K.inv - 0.15, d: 0.3 }, { k: 'wh', t: K.prop - 0.15, d: 0.3 });

  // ---- 5. Dubai is responding: AED 2.5 billion in economic incentives, incl. real estate + construction (Dubai Media Office) --------------------
  const face1 = FACE_SEGS[1][0] + 0.03;
  add({ id: 'incent', a: r0, b: face1, box: [330, 1270], fn(t) {
    bw(t, 'DUBAI IS', 640, K.but, { size: 130, ls: 2, out: K.govt - 0.1 });
    bw(t, 'RESPONDING', 790, K.but + 0.25, { size: 130, ls: 2, hl: true, out: K.govt - 0.1 });
    card(t, 'inc', { x: 140, y: 380, w: 800, h: 436, a: K.govt - 0.05, out: face1 - 0.3, from: [0, 160], rot: 1.6, fit: 'cover', chip: 'DUBAI MEDIA OFFICE · MAY 2026', zoom: [1, 1.04],
      focus: [{ bbox: [20, 150, 800, 300], t0: K.n25 - 0.5, t1: K.n25 + 0.2, zoom: 1.0 }, { bbox: [200, 480, 800, 120], t0: K.incl - 0.2, t1: K.incl + 0.5, zoom: 1.0 }],
      hl: [{ bbox: [34, 285, 226, 34], t0: K.n25, t1: K.n25 + 0.6 }, { bbox: [468, 527, 384, 40], t0: K.re - 0.1, t1: K.re + 0.6 }] });
    const nout = 1 - ea(t, K.incl - 0.15, K.incl + 0.15);
    ctx.save(); ctx.globalAlpha *= nout; bigNumber(t, { pre: 'AED', preT: K.n25 - 0.5, val: 2.5, dec: 1, fin: '2.5', suffix: '', a0: K.n25 - 0.05, a1: K.n25 + 0.75, y: 1030, sc: 0.62 });
    bw(t, 'BILLION · INCENTIVES', 1195, K.bil2 - 0.05, { size: 56, ls: 6, color: C.gold }); ctx.restore();
    pillRow(t, 'house', 'REAL ESTATE', 990, K.re - 0.15, { h: 110, size: 54 });
    pillRow(t, 'building', 'CONSTRUCTION', 1130, K.constr - 0.2, { h: 110, size: 54 });
  } });
  cues.push({ k: 'wh', t: K.but - 0.05, d: 0.5 }, { k: 'wh', t: K.govt - 0.05, d: 0.4 }, { k: 'wh', t: K.re - 0.15, d: 0.3 }, { k: 'wh', t: K.constr - 0.2, d: 0.3 });

  // ---- 6. what to watch, and where decisions start ---------------------------------------------------------------------------------------------
  const w0 = FACE_SEGS[1][1], w1 = K.rem - 0.12;
  add({ id: 'watch', a: w0, b: w1, box: [330, 1270], fn(t) {
    const dim = 1 - 0.5 * ea(t, K.thats, K.thats + 0.4);
    bw(t, 'WATCH', 420, K.watch, { size: 96, ls: 18, color: C.gold });
    pillRow(t, 'cube', 'FUTURE SUPPLY', 610, K.supply - 0.5, { dim });
    pillRow(t, 'house', 'RENTAL DEMAND', 760, K.rental - 0.1, { dim });
    pillRow(t, 'tag', 'ENTRY PRICE', 910, K.entry - 0.1, { dim });
    bw(t, 'WHERE INVESTMENT', 1105, K.invest - 0.1, { size: 78, ls: 3 });
    bw(t, 'DECISIONS START', 1215, K.decis - 0.1, { size: 78, ls: 3, hl: true });
  } });
  cues.push({ k: 'wh', t: K.supply - 0.5, d: 0.3 }, { k: 'wh', t: K.rental - 0.1, d: 0.3 }, { k: 'wh', t: K.entry - 0.1, d: 0.3 });

  // ---- 7. the bubble analogy: a flight over Dubai (Palm Jumeirah -> Downtown) + a bubble that bursts --------------------------------------------
  const m1 = VOICE_END + 0.12;
  SAT_SCENES.flight = { a: w1, b: m1 + 0.6, veil: 'top', keys: [[0, 55.0, 25.06, 10.9], [2.8, 55.135, 25.118, 12.9], [4.2, 55.14, 25.122, 13.2], [7.0, 55.272, 25.19, 13.3]] };
  const palmT0 = K.sheikh + 0.4, palmT1 = K.sheikh + 1.7;
  add({ id: 'flight', kind: 'sat', a: w1, b: m1, cfg: {
    outlines: [{ key: 'palm', t0: palmT0, t1: palmT1 }],
    pins: [{ lon: 55.1345, lat: 25.1173, t: palmT1 - 0.1, title: 'PALM JUMEIRAH' }, { lon: 55.2744, lat: 25.1972, t: K.chasing, title: 'DOWNTOWN DUBAI', sub: 'BURJ KHALIFA' }],
    top(t) {
      badge(t, 'sheikh', 250, 470, 96, K.sheikh - 0.2, 'SHEIKH MOHAMMED', { out: K.burst - 0.1, fx: 0.47, fy: 0.19, zoom: 2.3 });
      bw(t, 'THE BUBBLE ANALOGY', 345, K.bubble - 0.1, { size: 54, ls: 6, color: C.gold, out: K.burst - 0.1 });
      bubble(t, 745, 560, 118, K.bubble, K.burst);
      bw(t, 'CHASING IT', 600, K.chasing - 0.1, { size: 92, ls: 2, hl: true });
    } } });
  cues.push({ k: 'pin', t: palmT1 - 0.1 }, { k: 'pin', t: K.chasing }, { k: 'wh', t: w1 - 0.1, d: 0.7 }, { k: 'wh', t: K.burst - 0.05, d: 0.25, up: false, g: 0.06 });

  // ---- 8. end card (silent): message me --------------------------------------------------------------------------------------------------------
  const e0 = m1, send = e0 + 1.4;
  add({ id: 'cta', a: e0, b: DUR, last: true, box: [440, 1280], fn(t) {
    sceneChat(t, { head: 'Questions on Dubai?', show: e0 + 0.15, typeA: e0 + 0.8, typeB: e0 + 1.2, send, msg: 'Dubai', reply: "Let's talk" });
  } });
  cues.push({ k: 'send', t: send });

  // ---- hook + stamp on his first face beat -------------------------------------------------------------------------------------------------------
  const HOOK_OUT = K.q2008 - 0.2;
  const OVERLAYS = [
    ovHook([['DUBAI PROPERTY', 0.12, 'ink'], ['COLLAPSE?', K.collapse - 0.05, 'box']], { out: HOOK_OUT, y: 420, size: 104 }),
    ovStamp('ANOTHER 2008?', K.q2008, K.q2008 + 1.5, { y: 1040, size: 78 }),
  ];
  cues.push({ k: 'wh', t: 0.12, d: 0.4 }, { k: 'stamp', t: K.collapse - 0.05 }, { k: 'stamp', t: K.q2008 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES };
}
