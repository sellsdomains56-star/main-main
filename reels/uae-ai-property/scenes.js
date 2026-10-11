'use strict';
// ---------------------------------------------------------------------------
// Scenes for "AI -> SI and Abu Dhabi property" (Abu Dhabi look). buildScenes() is called once the timeline is loaded.
// Beats: FACE (him, full-screen) 0-6.0 and 43.9-47.45; everything else is one calm hero graphic per beat, a satellite flyover of Reem + Al Maryah, a chat call-to-action.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const cut = t => cues.push({ k: 'cut', t });
  const add = (s, cutCue = true) => { SCENES.push(s); if (cutCue && s.a > 0.5) cut(s.a); return s; };

  // ---- key times (from the spoken words)
  const K = {
    si: tw(/^SI,?$/, 1, 7.53), super: tw(/^SUPERINTELLIGENCE/, 0, 7.91), official: tw(/^OFFICIAL$/, 0, 9.16), across: tw(/^ACROSS$/, 0, 10.25),
    doesnt: tw(/^DOESN'T$/, 0, 12.37), auto: tw(/^AUTOMATICALLY$/, 0, 12.81), incr: tw(/^INCREASE$/, 0, 13.57),
    msft: tw(/^MICROSOFT\.?$/, 0, 15.42), around: tw(/^AROUND$/, 0, 16.83), fig: tw(/^15\.2$/, 0, 17.21), bill: tw(/^BILLION,?$/, 0, 18.19),
    incl: tw(/^INCLUDING$/, 0, 18.68), part: tw(/^PARTNERSHIP$/, 0, 19.45), abu1: tw(/^ABU$/, 0, 20.37), g42: tw(/^G42/, 0, 21.02),
    eng: tw(/^ENGINEERING$/, 0, 23.31), dev: tw(/^DEVELOPMENT$/, 0, 23.96), abu2: tw(/^ABU$/, 1, 25.16),
    attr: tw(/^ATTRACTING$/, 0, 25.76), intl: tw(/^INTERNATIONAL$/, 0, 26.36), tech: tw(/^TECHNOLOGY$/, 0, 27.12), talent: tw(/^TALENT/, 0, 27.71),
    when: tw(/^WHEN$/, 0, 28.15), comp: tw(/^COMPANIES$/, 0, 28.42), hire: tw(/^HIRE$/, 0, 30.08), engs: tw(/^ENGINEERS/, 0, 30.24), exec: tw(/^EXECUTIVES/, 0, 30.82), skill: tw(/^SKILLED$/, 0, 31.74),
    those: tw(/^THOSE$/, 0, 32.86), somew: tw(/^SOMEWHERE$/, 0, 33.68), pot: tw(/^POTENTIAL$/, 0, 35.54), rental1: tw(/^RENTAL$/, 0, 35.82),
    you: tw(/^YOU$/, 0, 36.84, 36.5), resid: tw(/^RESIDENTIAL$/, 0, 37.96), near: tw(/^NEAR$/, 0, 38.84), reem: tw(/^REEM$/, 0, 41.62), maryah: tw(/^MARYAH$/, 0, 43.14),
    buy: tw(/^BUY$/, 0, 43.9), and2: tw(/^AND$/, 0, 47.46, 47.4), benefit: tw(/^BENEFIT$/, 0, 47.9, 47.4), both: tw(/^BOTH$/, 0, 48.44), rentalI: tw(/^RENTAL$/, 0, 48.66, 48.4), cap: tw(/^CAPITAL$/, 0, 49.58),
    shortlist: tw(/^SHORTLIST$/, 0, 51.32), msg: tw(/^MESSAGE$/, 0, 55.1), me: tw(/^ME\.?$/, 0, 55.38, 55.0),
  };
  const FACE_SEGS = [[0, tw(/^DONALD$/, 1, 5.9) - 0.02], [K.buy - 0.02, K.and2 - 0.01]];
  const PUNCHES = [[tw(/^SI,?$/, 0, 1.26), 0.06], [tw(/^MONEY\?$/, 0, 5.62), 0.06], [K.buy, 0.05], [tw(/^ACTUAL$/, 0, 46.16), 0.06]];

  // ---- 1. AI -> SI -----------------------------------------------------------------------------------------------------------
  const s1a = FACE_SEGS[0][1], s1b = tw(/^BUT$/, 0, 11.99) - 0.05;
  add({ id: 'si', a: s1a, b: s1b, box: [500, 1180], fn(t) {
    const out = 1 - ea(t, K.si - 0.12, K.si + 0.2), inn = ea(t, K.si - 0.08, K.si + 0.34, E.out5), e0 = enter(t, s1a + 0.1, 0.5, 40);
    T_('AI', CX, 790 + e0.dy, { font: F.d(800, 330), ls: -8, color: C.ink, alpha: e0.a * out, sx: lerp(1, 0.92, 1 - out) });
    T_('SI', CX, 790, { font: F.d(800, 330), ls: -8, color: C.gold, alpha: inn, sx: lerp(1.3, 1, inn), sy: lerp(1.3, 1, inn) });
    bw(t, 'SUPERINTELLIGENCE', 930, K.super, { size: 74, ls: 6, color: C.gold, w: 800 });
    bw(t, 'OFFICIAL TERM FOR AI', 1050, K.official, { size: 52, ls: 6, color: C.dim, w: 700 });
    bw(t, 'IN THE US EXECUTIVE BRANCH', 1125, K.across, { size: 52, ls: 6, color: C.ink, w: 700 });
  } });
  cues.push({ k: 'pop', t: K.si, f: 540 });

  // ---- 2. SI does not automatically raise prices ------------------------------------------------------------------------------
  const s2b = K.msft - 0.45;
  add({ id: 'notauto', a: s1b, b: s2b, box: [460, 1230], fn(t) {
    bw(t, 'SI', 600, K.doesnt - 0.2, { size: 210, ls: -4, color: C.gold, w: 800 });
    bw(t, "DOESN'T", 770, K.doesnt, { size: 112, ls: 2 });
    bw(t, 'AUTOMATICALLY', 910, K.auto, { size: 112, ls: 2, color: C.gold });
    bw(t, 'INCREASE', 1060, K.incr, { size: 98, ls: 4 });
    bw(t, 'PROPERTY PRICES', 1180, tw(/^PROPERTY$/, 1, 14.06), { size: 98, ls: 2 });
  } });

  // ---- 3. Microsoft: the number -----------------------------------------------------------------------------------------------
  const s3b = K.incl + 0.2;
  add({ id: 'msft', a: s2b, b: s3b, box: [400, 1100], fn(t) {
    bw(t, 'MICROSOFT', 470, K.msft - 0.2, { size: 132, ls: 6 });
    bigNumber(t, { pre: 'INVESTING AROUND', preT: K.around - 0.6, val: 15.2, dec: 1, fin: '15.2', suffix: '', a0: K.fig, a1: K.fig + 0.85, y: 850, sc: 0.95 });
    const e = enter(t, K.bill, 0.5, 20); T_('US$ BILLION', CX, 1040 + e.dy, { font: F.d(800, 84), ls: 12, color: C.gold, alpha: e.a });
  } });
  cues.push({ k: 'count', t: K.fig, t1: K.fig + 0.85, n: 12 });

  // ---- 4. ...with Abu Dhabi's G42 ---------------------------------------------------------------------------------------------
  const s4b = tw(/^MICROSOFT\.?$/, 1, 21.3) - 0.04;
  add({ id: 'g42', a: s3b, b: s4b, box: [420, 1100], fn(t) {
    bw(t, 'INCLUDING ITS PARTNERSHIP WITH', 530, K.incl + 0.1, { size: 50, ls: 5, color: C.dim, w: 700 });
    bw(t, "ABU DHABI'S", 740, K.abu1, { size: 116, ls: 2 });
    const e = ea(t, K.g42 - 0.25, K.g42 + 0.1, E.out5), a = ea(t, K.g42 - 0.25, K.g42 - 0.05, E.out2);
    T_('G42', CX, 1060, { font: F.d(800, 300), ls: -6, color: C.gold, alpha: a, sx: lerp(1.35, 1, e), sy: lerp(1.35, 1, e) });
  } });
  cues.push({ k: 'pop', t: K.g42 - 0.25, f: 480 });

  // ---- 5. an engineering development center in Abu Dhabi ----------------------------------------------------------------------
  const s5b = K.attr - 0.06;
  add({ id: 'center', a: s4b, b: s5b, box: [420, 1160], fn(t) {
    bw(t, 'MICROSOFT', 490, s4b + 0.15, { size: 56, ls: 14, color: C.dim, w: 700 });
    icon('building', CX, 690, 105, { p: ea(t, s4b + 0.5, K.eng + 0.2, E.out3), color: C.gold, w: 6 });
    bw(t, 'ENGINEERING', 930, K.eng, { size: 104, ls: 2 });
    bw(t, 'DEVELOPMENT CENTER', 1050, K.dev, { size: 104, ls: 2, color: C.gold });
    bw(t, 'IN ABU DHABI', 1155, K.abu2 - 0.1, { size: 66, ls: 8, w: 700, color: C.ink });
  } });

  // ---- 6. attracting international technology talent --------------------------------------------------------------------------
  const s6b = K.when - 0.05;
  add({ id: 'talent', a: s5b, b: s6b, box: [440, 1100], fn(t) {
    bw(t, 'ATTRACTING', 520, K.attr, { size: 58, ls: 14, color: C.dim, w: 700 });
    bw(t, 'INTERNATIONAL', 700, K.intl, { size: 112, ls: 1 });
    bw(t, 'TECHNOLOGY', 850, K.tech, { size: 112, ls: 1 });
    bw(t, 'TALENT', 1040, K.talent, { size: 150, ls: 4, color: C.gold });
  } });

  // ---- 7. companies expand -> they hire ---------------------------------------------------------------------------------------
  const s7b = K.those - 0.05;
  add({ id: 'hire', a: s6b, b: s7b, box: [400, 1160], fn(t) {
    bw(t, 'COMPANIES EXPAND', 470, K.when, { size: 78, ls: 4, color: C.gold });
    bw(t, 'AND HIRE', 590, K.hire - 0.15, { size: 56, ls: 14, color: C.dim, w: 700 });
    const items = [['ENGINEERS', K.engs], ['EXECUTIVES', K.exec], ['SKILLED PROFESSIONALS', K.skill]];
    items.forEach(([txt, a], i) => { const nxt = items[i + 1], dim = nxt ? 1 - 0.5 * ea(t, nxt[1], nxt[1] + 0.4) : 1; bw(t, txt, 780 + i * 135, a, { size: 100, ls: 2, alpha: dim }); });
  } });

  // ---- 8. somewhere to live -> rental demand ----------------------------------------------------------------------------------
  const s8b = K.you - 0.02;
  add({ id: 'live', a: s7b, b: s8b, box: [400, 1230], fn(t) {
    icon('house', CX, 560, 105, { p: ea(t, s7b + 0.25, K.somew + 0.9, E.out3), color: C.gold, w: 6 });
    bw(t, 'SOMEWHERE TO LIVE', 830, K.somew - 0.1, { size: 100, ls: 2 });
    bw(t, 'POTENTIAL', 1010, K.pot, { size: 58, ls: 14, color: C.dim, w: 700 });
    bw(t, 'RENTAL DEMAND', 1150, K.rental1, { size: 128, ls: 2, color: C.gold });
  } });

  // ---- 9. satellite flyover: Reem Island + Al Maryah Island -------------------------------------------------------------------
  const s9b = K.buy - 0.02;
  SAT_SCENES.map = { a: s8b, b: s9b + 0.6, veil: 'top', keys: [[0, 54.425, 24.52, 12.3], [3.2, 54.412, 24.508, 13.3], [(K.reem - s8b) + 0.2, 54.407, 24.4965, 14.1], [s9b - s8b + 0.5, 54.406, 24.4935, 14.45]] };
  add({ id: 'map', kind: 'sat', a: s8b, b: s9b, cfg: {
    outlines: [{ key: 'reem', t0: K.reem - 0.1, t1: K.reem + 0.95 }, { key: 'mubadala', t0: K.maryah - 0.35, t1: K.maryah + 0.45 }],
    pins: [{ lon: 54.4098, lat: 24.4875, t: K.reem + 0.55, title: 'REEM ISLAND' }, { lon: 54.3908, lat: 24.5018, t: K.maryah + 0.15, title: 'AL MARYAH ISLAND' }],
    top(t) {
      const a = ea(t, K.resid - 0.1, K.resid + 0.5, E.out4) * (1 - ea(t, K.reem - 0.5, K.reem - 0.1)), dy = (1 - ea(t, K.resid - 0.1, K.resid + 0.6, E.out4)) * 26;
      T_('RESIDENTIAL COMMUNITIES', CX, 250 + dy, { font: F.d(800, 58), ls: 3, color: C.ink, alpha: a });
      const b = ea(t, K.near - 0.1, K.near + 0.5, E.out4) * (1 - ea(t, K.reem - 0.5, K.reem - 0.1)), dy2 = (1 - ea(t, K.near - 0.1, K.near + 0.6, E.out4)) * 26;
      T_('NEAR GROWING BUSINESS DISTRICTS', CX, 325 + dy2, { font: F.d(800, 44), ls: 3, color: C.gold, alpha: b, sx: Math.min(1, 940 / M('NEAR GROWING BUSINESS DISTRICTS', F.d(800, 44), 3)) });
    } } });
  cues.push({ k: 'pin', t: K.reem + 0.55 }, { k: 'pin', t: K.maryah + 0.15 }, { k: 'riser', t: s8b - 0.3, d: 0.8 });

  // ---- 10. both rental income and capital appreciation ------------------------------------------------------------------------
  const s10a = K.and2 - 0.01, s10b = tw(/^IF$/, 0, 50.7) - 0.04;
  add({ id: 'benefit', a: s10a, b: s10b, box: [380, 1100], fn(t) {
    bw(t, 'YOU COULD BENEFIT FROM', 480, K.benefit - 0.3, { size: 62, ls: 5, color: C.dim, w: 700 });
    iconRow(t, 'house', 'RENTAL', 'INCOME', 760, K.rentalI - 0.1, K.cap, { dimTo: 0.55 });
    iconRow(t, 'chart', 'CAPITAL', 'APPRECIATION', 990, K.cap - 0.05, 999);
  } });

  // ---- 11. call to action: message me -----------------------------------------------------------------------------------------
  const send = K.me + 0.05;
  add({ id: 'cta', a: s10b, b: DUR, last: true, box: [440, 1280], fn(t) {
    sceneChat(t, { head: 'Want my shortlist?', sub: "Properties positioned for Abu Dhabi's tech growth", show: s10b + 0.25, typeA: K.msg - 0.4, typeB: K.msg + 0.1, send, msg: 'Shortlist', reply: 'My shortlist' });
  } });
  cues.push({ k: 'type', t: K.msg - 0.4, n: 9 }, { k: 'send', t: send }, { k: 'chime', t: send + 0.85, f: 1568 });

  // ---- overlays on his face beats ---------------------------------------------------------------------------------------------
  const sHit = tw(/^SI,?$/, 0, 1.26), OVERLAYS = [ovStamp('AI → SI', sHit, sHit + 1.7, { y: 1040 })];
  cues.push({ k: 'stamp', t: sHit });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues };
}
// text helper local to the scenes: T() is the shared text drawer 
function T_(s, x, y, o) { T(s, x, y, o); }
