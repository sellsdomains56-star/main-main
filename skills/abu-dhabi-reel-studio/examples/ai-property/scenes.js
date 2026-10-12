'use strict';
// ---------------------------------------------------------------------------
// Scenes for "AI -> SI and Abu Dhabi property" (Abu Dhabi look + real material). buildScenes() is called once the timeline is loaded.
// FACE (him, full-screen) 0-5.9 and 43.9-47.4; every other beat is one hero: real Truth Social posts and Microsoft pages as animated cards
// (marker highlights, zooms onto the line that matters), a satellite flight over Reem + Al Maryah, pills, kinetic type, a chat call-to-action.
// Everything stays inside SAFE (Reels UI-safe zone): content y 330-1270, x 120-960; captions at y~1372.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const cut = t => cues.push({ k: 'cut', t });
  const add = (s, cutCue = true) => { SCENES.push(s); if (cutCue && s.a > 0.5) cut(s.a); return s; };
  const wh = (t, d = 0.4, g, up = true) => cues.push({ k: 'wh', t, d, g, up });

  // ---- key times (from the spoken words)
  const K = {
    ai: tw(/^AI$/, 0, 0.52), si1: tw(/^SI,?$/, 0, 1.26), donald: tw(/^DONALD$/, 0, 2.18), money: tw(/^MONEY\?$/, 0, 5.62), donald2: tw(/^DONALD$/, 1, 5.9),
    si: tw(/^SI,?$/, 1, 7.53), super: tw(/^SUPERINTELLIGENCE/, 0, 7.91), official: tw(/^OFFICIAL$/, 0, 9.16), across: tw(/^ACROSS$/, 0, 10.25), exec: tw(/^EXECUTIVE$/, 0, 11.0), but: tw(/^BUT$/, 0, 11.99),
    doesnt: tw(/^DOESN'T$/, 0, 12.37), auto: tw(/^AUTOMATICALLY$/, 0, 12.81), incr: tw(/^INCREASE$/, 0, 13.57), prop: tw(/^PROPERTY$/, 1, 14.06),
    msft: tw(/^MICROSOFT\.?$/, 0, 15.42), around: tw(/^AROUND$/, 0, 16.83), fig: tw(/^15\.2$/, 0, 17.21), bill: tw(/^BILLION,?$/, 0, 18.19),
    incl: tw(/^INCLUDING$/, 0, 18.68), part: tw(/^PARTNERSHIP$/, 0, 19.45), abu1: tw(/^ABU$/, 0, 20.37), g42: tw(/^G42/, 0, 21.02),
    msft2: tw(/^MICROSOFT\.?$/, 1, 21.3), eng: tw(/^ENGINEERING$/, 0, 23.31), dev: tw(/^DEVELOPMENT$/, 0, 23.96), abu2: tw(/^ABU$/, 1, 25.16),
    attr: tw(/^ATTRACTING$/, 0, 25.76), intl: tw(/^INTERNATIONAL$/, 0, 26.36), tech: tw(/^TECHNOLOGY$/, 0, 27.12), talent: tw(/^TALENT/, 0, 27.71),
    when: tw(/^WHEN$/, 0, 28.15), comp: tw(/^COMPANIES$/, 0, 28.42), hire: tw(/^HIRE$/, 0, 30.08), engs: tw(/^ENGINEERS/, 0, 30.24), execs: tw(/^EXECUTIVES/, 0, 30.82), skill: tw(/^SKILLED$/, 0, 31.74),
    those: tw(/^THOSE$/, 0, 32.86), somew: tw(/^SOMEWHERE$/, 0, 33.68), pot: tw(/^POTENTIAL$/, 0, 35.54), rental1: tw(/^RENTAL$/, 0, 35.82),
    you: tw(/^YOU$/, 0, 36.84, 36.5), resid: tw(/^RESIDENTIAL$/, 0, 37.96), near: tw(/^NEAR$/, 0, 38.84), reem: tw(/^REEM$/, 0, 41.62), maryah: tw(/^MARYAH$/, 0, 43.14),
    buy: tw(/^BUY$/, 0, 43.9), entry: tw(/^ENTRY$/, 0, 44.82), actual: tw(/^ACTUAL$/, 0, 46.16), rentalD: tw(/^RENTAL$/, 0, 46.54, 46.0), and2: tw(/^AND$/, 0, 47.46, 47.4), benefit: tw(/^BENEFIT$/, 0, 47.9, 47.4), rentalI: tw(/^RENTAL$/, 0, 48.66, 48.4), cap: tw(/^CAPITAL$/, 0, 49.58),
    shortlist: tw(/^SHORTLIST$/, 0, 51.32), msg: tw(/^MESSAGE$/, 0, 55.1), me: tw(/^ME\.?$/, 0, 55.38, 55.0),
  };
  const FACE_SEGS = [[0, K.donald2 - 0.02], [K.buy - 0.02, K.and2 - 0.01]];
  const PUNCHES = [[K.si1, 0.06], [K.money, 0.06], [K.buy, 0.05], [K.actual, 0.06]];
  const IMAGES = { poll: 'assets/poll.png', eo: 'assets/eo.png', whhdr: 'assets/whhdr.png', wheo: 'assets/wheo.png', enemy: 'assets/enemy.png', ms15: 'assets/ms15.png', mseng: 'assets/mseng.png', trump: 'assets/trump.jpg', logo_g42: 'assets/g42.png', logo_msft: 'assets/msft.png' };

  // ---- 1. AI -> SI: the quick morph (SI is one more letter out) -------------------------------------------------------------------
  const s1a = FACE_SEGS[0][1], s1b = K.official - 0.05;
  add({ id: 'si', a: s1a, b: s1b, box: [330, 1270], fn(t) {
    card(t, 'poll', { x: 140, y: 345, w: 800, h: 408, a: s1a + 0.04, out: s1b - 0.3, from: [-260, 40], rot: -2, fit: 'cover', zoom: [1, 1.035], chip: 'TRUTH SOCIAL · SEP 21, 2026', hl: { bbox: [116, 336, 388, 34], t0: K.super - 0.1, t1: K.super + 0.5 } });
    const out = 1 - ea(t, K.si - 0.12, K.si + 0.2), inn = ea(t, K.si - 0.08, K.si + 0.34, E.out5), e0 = ea(t, s1a + 0.25, s1a + 0.8, E.out4);
    T('AI', CX, 1015 + (1 - e0) * 60, { font: F.d(800, 250), ls: -8, color: C.ink, alpha: e0 * out, sx: lerp(1, 0.9, 1 - out) });
    T('SI', CX, 1015, { font: F.d(800, 250), ls: -8, color: C.gold, alpha: inn, sx: lerp(1.35, 1, inn), sy: lerp(1.35, 1, inn) });
    bw(t, 'SUPERINTELLIGENCE', 1140, K.super, { size: 62, ls: 6, color: C.gold });
  } });
  cues.push({ k: 'pop', t: K.si - 0.1 }); wh(s1a + 0.04, 0.45, 0.05, false);

  // ---- 2. ...the official term across the US executive branch (the White House's own page + the order's text) -------------------------------------------
  const s2a = s1b, s2b = K.but - 0.05;
  add({ id: 'eo', a: s2a, b: s2b, box: [330, 1270], fn(t) {
    card(t, 'whhdr', { x: 140, y: 360, w: 800, h: 350, a: s2a + 0.04, out: s2b - 0.3, from: [-260, 40], rot: -1.8, fit: 'cover', fy: 0.42, zoom: [1, 1.04], chip: 'THE WHITE HOUSE · EO 14434' });
    card(t, 'wheo', { x: 140, y: 760, w: 800, h: 282, a: K.across - 0.35, out: s2b - 0.3, from: [260, 40], rot: 1.6, fit: 'cover', fy: 0, zoom: [1, 1.04],
      focus: { bbox: [20, 60, 1300, 200], t0: K.across - 0.3, t1: K.across + 0.5, zoom: 1.0 }, hl: { bbox: [28, 168, 1240, 38], t0: K.across + 0.1, t1: K.across + 0.8 } });
    bw(t, 'OFFICIAL TERM FOR AI', 1110, K.official - 0.1, { size: 44, ls: 8, color: C.dim, w: 700 });
    bw(t, 'US EXECUTIVE BRANCH', 1210, K.across, { size: 76, ls: 2, hl: true });
  } });

  // ---- 3. ...but SI does not automatically raise prices ---------------------------------------------------------------------------
  const s3b = K.msft - 0.45;
  add({ id: 'notauto', a: s2b, b: s3b, box: [330, 1270], fn(t) {
    bw(t, 'SI', 560, K.doesnt - 0.25, { size: 200, ls: -4, color: C.gold, w: 800 });
    bw(t, "DOESN'T", 730, K.doesnt, { size: 108, ls: 2 });
    bw(t, 'AUTOMATICALLY', 860, K.auto, { size: 108, ls: 2, color: C.gold });
    const ip = ea(t, K.incr - 0.1, K.incr + 0.5, E.out3), sl = ea(t, K.incr + 0.35, K.incr + 0.8, E.out4);
    icon('up', CX, 1010, 70, { p: ip, color: C.ink, w: 9 });
    if (sl > 0.002) strokePoly([[CX - 95, 1085], [CX - 95 + 190 * sl, 1085 - 150 * sl]], 1, { color: C.gold, w: 11 });
    bw(t, 'PROPERTY PRICES', 1190, K.incr, { size: 90, ls: 2 });
  } });
  cues.push({ k: 'wh', t: K.doesnt, d: 0.3 });

  // ---- 4. Microsoft: ~US$15.2 billion (Microsoft's own post) -------------------------------------------------------------------------
  const s4b = K.incl + 0.2;
  add({ id: 'msft', a: s3b, b: s4b, box: [330, 1270], fn(t) {
    card(t, 'ms15', { x: 140, y: 360, w: 800, h: 500, a: s3b + 0.04, out: s4b - 0.3, from: [240, 60], rot: -2, fit: 'cover', fy: 0, zoom: [1, 1.035], chip: 'MICROSOFT · NOV 2025',
      focus: { bbox: [170, 245, 900, 190], t0: K.msft + 0.3, t1: K.msft + 1.2, zoom: 1.08 }, hl: { bbox: [186, 262, 856, 70], t0: K.fig - 0.1, t1: K.fig + 0.55 } });
    bigNumber(t, { pre: 'INVESTING AROUND', preT: K.around - 0.4, val: 15.2, dec: 1, fin: '15.2', suffix: '', a0: K.fig, a1: K.fig + 0.85, y: 1040, sc: 0.6 });
    bw(t, 'US$ BILLION', 1200, K.bill - 0.05, { size: 66, ls: 12, color: C.gold });
  } });
  cues.push({ k: 'wh', t: s3b + 0.04, d: 0.45 });

  // ---- 5. ...including its partnership with Abu Dhabi's G42 --------------------------------------------------------------------------
  const s5b = K.msft2 - 0.04;
  add({ id: 'g42', a: s4b, b: s5b, box: [330, 1270], fn(t) {
    bw(t, 'INCLUDING ITS PARTNERSHIP WITH', 395, K.incl + 0.15, { size: 44, ls: 5, color: C.dim, w: 700 });
    bw(t, "ABU DHABI'S", 500, K.abu1 - 0.05, { size: 96, ls: 2 });
    bw(t, 'G42', 725, K.g42 - 0.2, { size: 180, ls: -2, hl: true });
    card(t, 'ms15', { x: 140, y: 840, w: 800, h: 420, a: s4b + 0.2, out: s5b - 0.2, from: [0, 160], rot: 1.2, fit: 'cover', zoom: [1.0, 1.03], chip: 'MICROSOFT · NOV 2025',
      focus: { bbox: [170, 1545, 1100, 300], t0: s4b - 1, t1: s4b - 0.5, zoom: 1.0 }, hl: { bbox: [420, 1757, 64, 34], t0: K.g42 - 0.2, t1: K.g42 + 0.4 } });
  } });
  cues.push({ k: 'wh', t: K.g42 - 0.25, d: 0.3 });

  // ---- 6. the engineering development center in Abu Dhabi -> attracting international tech talent ----------------------------------------
  const s6b = K.when - 0.05;
  add({ id: 'center', a: s5b, b: s6b, box: [330, 1270], fn(t) {
    card(t, 'mseng', { x: 140, y: 340, w: 800, h: 700, a: s5b + 0.04, out: s6b - 0.3, from: [-250, 40], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.04], chip: 'MICROSOFT SOURCE · SEP 2024',
      focus: [{ bbox: [70, 255, 1500, 300], t0: K.eng - 0.3, t1: K.eng + 0.5, zoom: 1.0 }, { bbox: [70, 1740, 1500, 150], t0: K.attr - 0.35, t1: K.attr + 0.45, zoom: 1.0 }],
      hl: [{ bbox: [773, 273, 590, 75], t0: K.eng, t1: K.eng + 0.5 }, { bbox: [86, 371, 700, 75], t0: K.dev, t1: K.dev + 0.6 }, { bbox: [690, 1829, 860, 37], t0: K.intl - 0.1, t1: K.intl + 0.8 }] });
    bw(t, 'DEVELOPMENT CENTER · ABU DHABI', 1120, K.dev - 0.1, { size: 54, ls: 3, out: K.attr - 0.1 });
    bw(t, 'INTERNATIONAL TECH TALENT', 1130, K.intl - 0.15, { size: 72, ls: 2, hl: true });
  } });
  cues.push({ k: 'wh', t: s5b + 0.04, d: 0.45, up: false });

  // ---- 7. companies expand -> they hire engineers, executives, skilled professionals -------------------------------------------------
  const s7b = K.those - 0.05;
  add({ id: 'hire', a: s6b, b: s7b, box: [330, 1230], fn(t) {
    bw(t, 'COMPANIES EXPAND', 410, K.when, { size: 78, ls: 3, color: C.gold });
    bw(t, 'AND THEY HIRE', 500, K.hire - 0.2, { size: 50, ls: 14, color: C.dim, w: 700 });
    pillRow(t, 'cube', 'ENGINEERS', 660, K.engs - 0.1);
    pillRow(t, 'briefcase', 'EXECUTIVES', 810, K.execs - 0.1);
    pillRow(t, 'chart', 'SKILLED PROFESSIONALS', 960, K.skill - 0.1);
  } });
  cues.push({ k: 'wh', t: K.engs - 0.1, d: 0.3 }, { k: 'wh', t: K.execs - 0.1, d: 0.3 }, { k: 'wh', t: K.skill - 0.1, d: 0.3 });

  // ---- 8. somewhere to live -> potential rental demand --------------------------------------------------------------------------------
  const s8b = K.you - 0.02;
  add({ id: 'live', a: s7b, b: s8b, box: [330, 1270], fn(t) {
    icon('house', CX, 520, 112, { p: ea(t, s7b + 0.2, K.somew + 0.8, E.out3), color: C.gold, w: 7 });
    bw(t, 'SOMEWHERE TO LIVE', 800, K.somew - 0.1, { size: 92, ls: 2 });
    bw(t, 'POTENTIAL', 975, K.pot - 0.05, { size: 52, ls: 14, color: C.dim, w: 700 });
    bw(t, 'RENTAL DEMAND', 1120, K.rental1 - 0.05, { size: 112, ls: 2, hl: true });
  } });

  // ---- 9. satellite flight: Reem Island + Al Maryah Island --------------------------------------------------------------------------------
  const s9b = K.buy - 0.02;
  SAT_SCENES.map = { a: s8b, b: s9b + 0.6, veil: 'top', keys: [[0, 54.425, 24.52, 12.3], [3.2, 54.412, 24.508, 13.3], [(K.reem - s8b) + 0.2, 54.407, 24.4965, 14.1], [s9b - s8b + 0.5, 54.406, 24.4935, 14.45]] };
  add({ id: 'map', kind: 'sat', a: s8b, b: s9b, cfg: {
    outlines: [{ key: 'reem', t0: K.reem - 0.1, t1: K.reem + 0.95 }, { key: 'mubadala', t0: K.maryah - 0.35, t1: K.maryah + 0.45 }],
    pins: [{ lon: 54.4098, lat: 24.4875, t: K.reem + 0.55, title: 'REEM ISLAND' }, { lon: 54.3908, lat: 24.5018, t: K.maryah + 0.15, title: 'AL MARYAH ISLAND' }],
    top(t) {
      const out = 1 - ea(t, K.reem - 0.5, K.reem - 0.1);
      bw(t, 'RESIDENTIAL COMMUNITIES', 360, K.resid - 0.1, { size: 54, ls: 3, out: K.reem - 0.5 });
      bw(t, 'NEAR GROWING BUSINESS DISTRICTS', 430, K.near - 0.1, { size: 42, ls: 3, color: C.gold, out: K.reem - 0.5 });
    } } });
  cues.push({ k: 'pin', t: K.reem + 0.55 }, { k: 'pin', t: K.maryah + 0.15 }, { k: 'wh', t: s8b - 0.1, d: 0.7 });

  // ---- 10. both rental income and capital appreciation -------------------------------------------------------------------------------------
  const s10a = K.and2 - 0.01, s10b = tw(/^IF$/, 0, 50.7) - 0.04;
  const GROW = (() => { const o = []; for (let i = 0; i <= 40; i++) { const u = i / 40; o.push([160 + 760 * u, 1250 - 250 * (u * u * 0.6 + u * 0.4) - 12 * Math.sin(u * 9)]); } return o; })();
  add({ id: 'benefit', a: s10a, b: s10b, box: [330, 1270], fn(t) {
    bw(t, 'YOU COULD BENEFIT FROM', 420, K.benefit - 0.3, { size: 52, ls: 5, color: C.dim, w: 700 });
    pillRow(t, 'house', 'RENTAL INCOME', 600, K.rentalI - 0.15);
    pillRow(t, 'chart', 'CAPITAL APPRECIATION', 760, K.cap - 0.15, { size: 56 });
    const gp = ea(t, K.cap - 0.1, K.cap + 1.0, E.inOut2); if (gp > 0.002) { const hd = strokePoly(GROW, gp, { color: C.gold, w: 9 }); if (hd) { glow(hd.x, hd.y, 60, '233,196,124', 0.5); dot(hd.x, hd.y, 13, C.gold); dot(hd.x, hd.y, 6, '#FFF8E6'); } }
    line(160, 1262, 920, 1262, { color: C.faint, w: 2, alpha: ea(t, K.cap - 0.1, K.cap + 0.4) });
  } });
  cues.push({ k: 'wh', t: K.rentalI - 0.15, d: 0.3 }, { k: 'wh', t: K.cap - 0.15, d: 0.3 });

  // ---- 11. call to action: message me ---------------------------------------------------------------------------------------------------
  const send = K.me + 0.05;
  add({ id: 'cta', a: s10b, b: DUR, last: true, box: [440, 1280], fn(t) {
    sceneChat(t, { head: 'Want my shortlist?', sub: "Properties positioned for Abu Dhabi's tech growth", show: s10b + 0.25, typeA: K.msg - 0.4, typeB: K.msg + 0.1, send, msg: 'Shortlist', reply: 'My shortlist' });
  } });
  cues.push({ k: 'send', t: send });

  // ---- overlays on his face beats ---------------------------------------------------------------------------------------------------------
  // hook: "AI -> SI" row at the top (AI slides in, the arrow draws, SI slams into a gold box on the word) and Trump's portrait pops in as he says the name
  const HOOK_OUT = K.money + 0.35;
  const ovHook1 = t => {
    const out = 1 - ea(t, HOOK_OUT, HOOK_OUT + 0.3, E.in2); if (out <= 0.003) return;
    const font = F.d(800, 140), y = 440, wAI = M('AI', font, 2), wSI = M('SI', font, 2), gap = 150, tot = wAI + gap + wSI + 60, x0 = CX - tot / 2;
    const eAI = ea(t, K.ai - 0.1, K.ai + 0.4, E.out4), eAr = ea(t, K.ai + 0.35, K.si1 - 0.05, E.out3), eSI = ea(t, K.si1 - 0.05, K.si1 + 0.3, E.out5);
    ctx.save(); ctx.globalAlpha *= out;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 26 * SS; ctx.shadowOffsetY = 6 * SS;
    ctx.beginPath(); ctx.rect(x0 - 20, y - 150, wAI + 40, 190); ctx.clip(); T('AI', x0 + wAI / 2, y + (1 - eAI) * 150, { font, ls: 2, color: C.ink, alpha: ea(t, K.ai - 0.1, K.ai + 0.15) }); ctx.restore();
    ctx.restore(); ctx.save(); ctx.globalAlpha *= out;
    const ax = x0 + wAI + 22, ay = y - 50; if (eAr > 0.002) { strokePoly([[ax, ay], [ax + gap - 44, ay]], eAr, { color: C.gold, w: 12 }); if (eAr > 0.98) strokePoly([[ax + gap - 90, ay - 34], [ax + gap - 44, ay], [ax + gap - 90, ay + 34]], 1, { color: C.gold, w: 12 }); }
    if (eSI > 0.002) { ctx.save(); ctx.translate(x0 + wAI + gap + 30 + wSI / 2, y - 50); ctx.scale(lerp(1.6, 1, eSI), lerp(1.6, 1, eSI)); ctx.rotate((1 - eSI) * 0.08); rr(-wSI / 2 - 30, -88, wSI + 60, 150, 22); ctx.fillStyle = C.gold; ctx.fill(); T('SI', 0, 50, { font, ls: 2, color: '#0A0A0B' }); ctx.restore(); }
    ctx.restore();
    badge(t, 'trump', 835, 640, 100, K.donald - 0.1, 'DONALD TRUMP', { out: HOOK_OUT, fx: 0.5, fy: 0.4 });
  };
  const OVERLAYS = [ovHook1,
    ovStamp('ENTRY PRICE', K.entry, K.entry + 1.15, { y: 1040, size: 78 }), ovStamp('RENTAL DEMAND', K.rentalD, K.rentalD + 1.0, { y: 1040, size: 78 })];
  cues.push({ k: 'stamp', t: K.si1 }, { k: 'wh', t: K.donald - 0.1, d: 0.4 }, { k: 'stamp', t: K.entry }, { k: 'stamp', t: K.rentalD });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES };
}
