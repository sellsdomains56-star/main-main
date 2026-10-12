'use strict';
// ---------------------------------------------------------------------------
// Scenes for "Ohana townhouses" (Abu Dhabi look + real material). buildScenes() is called once the timeline is loaded.
// FACE (him, full-screen) 0-4.2 = his own hook; every other beat is one calm hero: a satellite flight to the site on Yas Canal, real brochure pictures,
// price bars, the Emirati Broker Programme article (marker highlights), a payment timeline, two gauges, a chat call-to-action.
// Everything stays inside SAFE (Reels UI-safe zone): content y 330-1270, x 130-950; captions at y~1372.
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], tw = (re, n = 0, fb = 0, from = 0) => wt(re, n, fb, from);
  const cut = t => cues.push({ k: 'cut', t });
  const add = (s, cutCue = true) => { SCENES.push(s); if (cutCue && s.a > 0.5) cut(s.a); return s; };
  const wh = (t, d = 0.4, g, up = true) => cues.push({ k: 'wh', t, d, g, up });

  // ---- key times (from the spoken words)
  const K = {
    six: tw(/^6$/, 0, 1.10), n72: tw(/^72/, 0, 3.18), hours: tw(/^HOURS\?$/, 0, 3.66),
    here: tw(/^HERE'S$/, 0, 4.47), ohana: tw(/^OHANA$/, 0, 4.95), th: tw(/^TOWNHOUSES$/, 0, 5.25), diff: tw(/^DIFFERENT\.$/, 0, 6.03),
    two: tw(/^TWO-BEDROOM$/, 0, 6.81), townhouse: tw(/^TOWNHOUSE$/, 0, 7.33), fig1: tw(/^1,852/, 0, 8.31), dirhams: tw(/^DIRHAMS$/, 0, 9.89), sqft: tw(/^SQUARE$/, 0, 10.67),
    newest: tw(/^NEWEST$/, 0, 11.57), orchids: tw(/^ORCHIDS,$/, 0, 12.69), island: tw(/^ISLAND,$/, 0, 13.81), fig2: tw(/^2,470/, 0, 14.73),
    so: tw(/^SO$/, 0, 16.43), pct25: tw(/^25%$/, 0, 17.41), cheaper: tw(/^CHEAPER\.$/, 0, 18.33),
    its: tw(/^IT'S$/, 0, 18.97), avg: tw(/^AVERAGE$/, 0, 21.05), luxury: tw(/^LUXURY$/, 0, 21.37), apt: tw(/^APARTMENT$/, 0, 21.63), yas: tw(/^YAS\.$/, 0, 22.43),
    family: tw(/^FAMILY$/, 0, 22.83), fig37: tw(/^3\.7$/, 0, 24.13), fig53: tw(/^5\.3$/, 0, 25.41), million: tw(/^MILLION$/, 0, 25.97), rare: tw(/^RARE\.$/, 0, 27.11),
    almost: tw(/^ALMOST$/, 0, 27.53), nobody: tw(/^NOBODY$/, 0, 27.85), launching: tw(/^LAUNCHING$/, 0, 28.51),
    ohana2: tw(/^OHANA$/, 2, 29.17), emirati: tw(/^EMIRATI$/, 0, 30.25), broker: tw(/^BROKER$/, 0, 30.63), prog: tw(/^PROGRAMME\.$/, 0, 31.07),
    emirati2: tw(/^EMIRATI$/, 1, 31.63), brokers: tw(/^BROKERS$/, 0, 32.09), first: tw(/^FIRST$/, 0, 32.75), access: tw(/^ACCESS$/, 0, 33.05), inventory: tw(/^INVENTORY$/, 0, 33.67),
    bookings: tw(/^BOOKINGS$/, 0, 34.27), launches: tw(/^LAUNCHES\.$/, 0, 34.87),
    you: tw(/^YOU$/, 0, 35.41), pct5: tw(/^5%$/, 0, 35.93), every: tw(/^EVERY$/, 0, 36.47), six2: tw(/^SIX$/, 0, 36.89), months: tw(/^MONTHS,$/, 0, 37.09),
    rest: tw(/^REST$/, 0, 38.03), handover: tw(/^HANDOVER$/, 0, 38.33), y2029: tw(/^2029/, 0, 39.01),
    uae: tw(/^UAE$/, 0, 39.91), nat: tw(/^NATIONALS$/, 0, 40.47), pct30: tw(/^30%/, 0, 41.25), before: tw(/^BEFORE$/, 0, 41.89),
    else: tw(/^ELSE$/, 0, 43.19), pct35: tw(/^35%/, 0, 43.63),
    if: tw(/^IF$/, 0, 44.41), price: tw(/^PRICE$/, 0, 45.09), msg: tw(/^MESSAGE$/, 0, 45.69), me: tw(/^ME$/, 0, 46.13), final: tw(/^TOWNHOUSES\.$/, 0, 46.35),
  };
  K.finalEnd = wend(/^TOWNHOUSES\.$/, 0, 47.3);
  const HOOK_END = 4.17;
  const FACE_SEGS = [[0, HOOK_END]];
  const PUNCHES = [[K.six, 0.06], [K.n72, 0.06]];
  const IMAGES = { th_a: 'assets/th_a.jpg', th_b: 'assets/th_b.jpg', th_c: 'assets/th_c.jpg', cbn: 'assets/cbn.png' };
  const X0 = SAFE.x0, FULL = SAFE.w, MAXV = 2470;

  // a bar row: label + small line + a bar that grows (value counts up inside it)
  const barRow = (t, o) => {
    const e = enter(t, o.a, 0.5, 22); if (e.a <= 0.003) return;
    const by = o.y + 72, bh = 100, g = ea(t, o.g0, o.g1, E.out4), len = FULL * o.val / MAXV, ink = '#0A0A0B';
    T(o.label, X0, o.y + e.dy, { font: F.d(800, 50), ls: 3, align: 'left', color: o.gold ? C.gold : C.ink, alpha: e.a });
    if (o.sub) T(o.sub, X0, o.y + 50 + e.dy, { font: F.d(700, 34), ls: 2, align: 'left', color: C.dim, alpha: e.a });
    ctx.save(); ctx.globalAlpha *= e.a; rr(X0, by + e.dy, FULL, bh, 20); ctx.fillStyle = 'rgba(243,239,230,0.07)'; ctx.fill();
    if (g > 0.002) {
      const w = Math.max(24, len * g); ctx.save(); ctx.translate(0, e.dy); rr(X0, by, w, bh, 20); ctx.fillStyle = o.gold ? C.gold : C.ink; ctx.fill(); ctx.clip();
      drawNumber(numberStr(o.val * g, 0), numberStr(o.val, 0), X0 + 34, by + bh / 2 + 24, { font: F.d(800, 68), color: ink, ls: 0, alpha: ea(t, o.g0 + 0.1, o.g0 + 0.4) }); ctx.restore();
    }
    ctx.restore();
    return { by, len };
  };
  const SRC = t => { const a = ea(t, 0, 1); T("SOURCES: OHANA PRICE LIST · THE ORCHIDS · CHRISTIE'S H1 2026", CX, 1236, { font: F.d(700, 26), ls: 1, color: C.dim, alpha: a * 0.9, sx: Math.min(1, FULL / M("SOURCES: OHANA PRICE LIST · THE ORCHIDS · CHRISTIE'S H1 2026", F.d(700, 26), 1)) }); };

  // ---- 1. satellite flight to the site: Yas Island, on Yas Canal -------------------------------------------------------------------------
  const s1a = HOOK_END, s1b = K.two - 0.06;
  SAT_SCENES.map = { a: s1a, b: s1b + 0.6, veil: 'top', keys: [[0, 54.605, 24.474, 12.55], [1.5, 54.616, 24.4725, 13.45], [(s1b - s1a) + 0.4, 54.6222, 24.4715, 14.35]] };
  add({ id: 'map', kind: 'sat', a: s1a, b: s1b, cfg: {
    outlines: [{ key: 'yas', t0: s1a + 0.15, t1: K.ohana + 0.55 }],
    pins: [{ lon: 54.6220, lat: 24.4720, t: K.ohana, title: 'OHANA', sub: 'YAS CANAL · YAS ISLAND' }, { lon: 54.6074, lat: 24.4837, t: K.th + 0.2, title: 'FERRARI WORLD' }],
    top(t) {
      bw(t, 'YAS ISLAND · ABU DHABI', 375, s1a + 0.1, { size: 42, ls: 6, color: C.dim, w: 700 });
      bw(t, 'OHANA TOWNHOUSES', 455, K.ohana - 0.1, { size: 74, ls: 2, hl: true });
      bw(t, 'ARE DIFFERENT', 535, K.diff - 0.1, { size: 62, ls: 4, color: C.gold });
    } } });
  cues.push({ k: 'pin', t: K.ohana }, { k: 'pin', t: K.th + 0.2, g: 0.5 }, { k: 'wh', t: s1a - 0.1, d: 0.7 });

  // ---- 2. two-bedroom townhouse: 1,852 dirhams per square foot (brochure picture + counter) -----------------------------------------------
  const s2b = K.newest - 0.08;
  add({ id: 'price', a: s1b, b: s2b, box: [330, 1270], fn(t) {
    card(t, 'th_a', { x: 140, y: 345, w: 800, h: 420, a: s1b + 0.04, out: s2b - 0.3, from: [-260, 40], rot: -2, fit: 'cover', fy: 0.35, zoom: [1, 1.05], chip: 'OHANA · TOWNHOUSES' });
    bw(t, 'TWO-BEDROOM TOWNHOUSE', 880, K.two - 0.1, { size: 52, ls: 4, color: C.dim, w: 700 });
    bigNumber(t, { val: 1852, dec: 0, fin: '1,852', suffix: '', a0: K.fig1, a1: K.fig1 + 1.2, y: 1010, sc: 0.9 });
    bw(t, 'DIRHAMS PER SQ FT', 1235, K.dirhams - 0.05, { size: 60, ls: 8, color: C.gold });
  } });
  cues.push({ k: 'wh', t: K.fig1 - 0.1, d: 0.3 });

  // ---- 3a. The Orchids (same island): 2,470 -> Ohana is 25% cheaper ------------------------------------------------------------------------
  const s3b = K.its - 0.04;
  add({ id: 'orchids', a: s2b, b: s3b, box: [330, 1270], fn(t) {
    bw(t, 'DIRHAMS PER SQ FT', 392, s2b + 0.05, { size: 46, ls: 8, color: C.dim, w: 700 });
    const r1 = barRow(t, { label: 'OHANA', sub: '2-BEDROOM TOWNHOUSE', y: 520, a: s2b + 0.1, g0: s2b + 0.25, g1: s2b + 1.0, val: 1852, gold: true });
    barRow(t, { label: 'THE ORCHIDS', sub: 'NEWEST TOWNHOUSES · SAME ISLAND', y: 800, a: K.orchids - 0.2, g0: K.fig2 - 0.1, g1: K.fig2 + 1.35, val: 2470 });
    const gp = ea(t, K.so + 0.5, K.pct25 + 0.35, E.out4);                       // the gap between the two bars = 25%
    if (gp > 0.002 && r1) {
      const gx = X0 + r1.len, gw = (FULL - r1.len) * gp;
      ctx.save(); rr(gx + 6, r1.by + 3, Math.max(gw - 6, 2), 94, 18); ctx.setLineDash([14, 10]); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
      T('−25%', gx + 6 + (FULL - r1.len) / 2, r1.by + 66, { font: F.d(800, 48), color: C.gold, alpha: ea(t, K.pct25, K.pct25 + 0.3) }); ctx.restore();
      line(X0 + FULL, r1.by + 100, X0 + FULL, 872 + 0, { color: C.gold, w: 3, dash: [10, 10], alpha: gp * 0.8 });
    }
    bw(t, '25% CHEAPER', 1160, K.pct25 - 0.15, { size: 112, ls: 2, hl: true, maxW: 740 });
    SRC(t);
  } });
  cues.push({ k: 'wh', t: K.orchids - 0.2, d: 0.3 }, { k: 'stamp', t: K.pct25 - 0.1, g: 0.5 });

  // ---- 3b. ...even cheaper than the average luxury apartment on Yas ----------------------------------------------------------------------------
  const s4a = K.family - 0.05;
  add({ id: 'apts', a: s3b, b: s4a, box: [330, 1270], fn(t) {
    bw(t, 'EVEN CHEAPER', 450, K.its - 0.05, { size: 112, ls: 2, hl: true });
    barRow(t, { label: 'OHANA', sub: '2-BEDROOM TOWNHOUSE', y: 640, a: s3b - 5, g0: s3b - 5, g1: s3b - 4, val: 1852, gold: true });
    barRow(t, { label: 'YAS LUXURY APARTMENTS', sub: 'AVERAGE PRICE PER SQ FT', y: 930, a: K.avg - 1.0, g0: K.luxury, g1: K.luxury + 1.1, val: 2393 });
    SRC(t);
  } });
  cues.push({ k: 'wh', t: K.avg - 0.2, d: 0.3 });

  // ---- 4a. family townhouses between 3.7 and 5.3 million dirhams -----------------------------------------------------------------------------
  const s4b = K.rare - 0.06;
  add({ id: 'range', a: s4a, b: s4b, box: [330, 1270], fn(t) {
    card(t, 'th_b', { x: 140, y: 345, w: 800, h: 420, a: s4a + 0.04, out: s4b - 0.3, from: [260, 40], rot: 1.8, fit: 'cover', fy: 0.4, zoom: [1, 1.05], chip: 'OHANA · FAMILY TOWNHOUSES' });
    const pop = (s, x, a0) => { const e = ea(t, a0, a0 + 0.5, E.back), al = ea(t, a0, a0 + 0.15); T(s, x, 1010, { font: F.d(800, 190), ls: -4, color: C.ink, alpha: al, sx: lerp(0.7, 1, e), sy: lerp(0.7, 1, e) }); };
    pop('3.7', 272, K.fig37 - 0.1); pop('5.3', 808, K.fig53 - 0.1);
    const ap = ea(t, K.fig37 + 0.5, K.fig53 - 0.15, E.inOut2); if (ap > 0.002) { const hd = strokePoly([[440, 925], [640, 925]], ap, { color: C.gold, w: 12 }); if (ap > 0.97) strokePoly([[602, 890], [640, 925], [602, 960]], 1, { color: C.gold, w: 12 }); }
    bw(t, 'MILLION DIRHAMS', 1130, K.million - 0.05, { size: 62, ls: 8, color: C.gold });
  } });
  cues.push({ k: 'wh', t: K.fig37 - 0.15, d: 0.3 }, { k: 'wh', t: K.fig53 - 0.15, d: 0.3 });

  // ---- 4b. ...rare. Almost nobody is launching them ---------------------------------------------------------------------------------------------
  const s5a = K.ohana2 - 0.07;
  add({ id: 'rare', a: s4b, b: s5a, box: [330, 1270], fn(t) {
    card(t, 'th_c', { x: 140, y: 345, w: 800, h: 400, a: s4b + 0.04, out: s5a - 0.3, from: [0, 120], rot: -1.4, fit: 'cover', fy: 0.4, zoom: [1, 1.05], chip: 'OHANA · FAMILY TOWNHOUSES' });
    ovStamp('RARE', K.rare, 1e9, { y: 760, size: 120, rot: -0.06 })(t);
    bw(t, 'ALMOST NOBODY', 990, K.almost - 0.05, { size: 96, ls: 2 });
    bw(t, 'IS LAUNCHING THEM', 1110, K.launching - 0.25, { size: 78, ls: 2, color: C.gold });
  } });
  cues.push({ k: 'stamp', t: K.rare }, { k: 'wh', t: K.almost - 0.1, d: 0.3 });

  // ---- 5. the Emirati Broker Programme (Ohana's own news: Construction Business News ME) -----------------------------------------------------
  const s6a = K.you - 0.04;
  add({ id: 'prog', a: s5a, b: s6a, box: [330, 1270], fn(t) {
    bw(t, 'EMIRATI BROKER PROGRAMME', 385, K.emirati - 0.1, { size: 62, ls: 2, hl: true });
    card(t, 'cbn', { x: 140, y: 495, w: 800, h: 510, a: s5a + 0.04, out: s6a - 0.3, from: [-250, 50], rot: -1.6, fit: 'cover', fy: 0, zoom: [1, 1.03], chip: 'CONSTRUCTION BUSINESS NEWS ME',
      focus: [{ bbox: [72, 690, 1270, 170], t0: s5a + 0.6, t1: s5a + 1.3, zoom: 1.12 }, { bbox: [365, 3973, 489, 32], t0: K.emirati2 - 0.3, t1: K.emirati2 + 0.7, zoom: 1.45 }, { bbox: [308, 4031, 629, 31], t0: K.bookings - 0.6, t1: K.bookings + 0.1, zoom: 1.2 }],
      hl: [{ bbox: [1113, 701, 226, 67], t0: K.emirati, t1: K.emirati + 0.45 }, { bbox: [74, 789, 630, 69], t0: K.broker, t1: K.broker + 0.6 },
        { bbox: [365, 3973, 489, 32], t0: K.first - 0.05, t1: K.first + 0.8 }, { bbox: [308, 4031, 629, 31], t0: K.bookings - 0.1, t1: K.bookings + 0.9 }] });
    pillRow(t, 'flag', 'FIRST ACCESS', 1100, K.first - 0.1, { w: 820, h: 104 });
    pillRow(t, 'check', 'LAUNCH BOOKINGS', 1220, K.bookings - 0.15, { w: 820, h: 104 });
  } });
  cues.push({ k: 'wh', t: K.emirati - 0.2, d: 0.3 }, { k: 'wh', t: K.first - 0.1, d: 0.3 }, { k: 'wh', t: K.bookings - 0.15, d: 0.3 });

  // ---- 6. payment plan: 5% every six months, the rest at handover in 2029 ---------------------------------------------------------------------------
  const s7a = K.uae - 0.04;
  add({ id: 'plan', a: s6a, b: s7a, box: [330, 1270], fn(t) {
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
  cues.push({ k: 'wh', t: K.pct5 - 0.1, d: 0.3 }, { k: 'pin', t: K.rest, g: 0.5 });

  // ---- 7. UAE nationals 30% before handover, everyone else 35% -------------------------------------------------------------------------------------
  const s8a = K.if - 0.04;
  add({ id: 'split', a: s7a, b: s8a, box: [330, 1270], fn(t) {
    bw(t, 'PAID BEFORE HANDOVER', 410, K.uae - 0.1, { size: 50, ls: 7, color: C.dim, w: 700 });
    const gauge = (cx, label1, label2, pct, a0, a1, col) => {
      const p = ea(t, a0, a1, E.out4), cy = 770, r = 175;
      ring(cx, cy, r, { color: C.faint, w: 26, alpha: ea(t, a0 - 0.3, a0, E.lin) });
      if (p > 0.002) { ctx.save(); ctx.shadowColor = col === C.gold ? 'rgba(233,196,124,0.55)' : 'rgba(243,239,230,0.35)'; ctx.shadowBlur = 18 * SS; ring(cx, cy, r, { color: col, w: 26, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * pct / 100 * p }); ctx.restore(); }
      T(Math.round(pct * p) + '%', cx, cy + 38, { font: F.d(800, 110), ls: -2, color: col, alpha: ea(t, a0 - 0.05, a0 + 0.25) });
      bw(t, label1, 1030, a0 - 0.55, { size: 50, ls: 3, x: cx, maxW: 380 }); bw(t, label2, 1095, a0 - 0.45, { size: 50, ls: 3, x: cx, maxW: 380, color: C.dim });
    };
    gauge(340, 'UAE', 'NATIONALS', 30, K.pct30 - 0.1, K.pct30 + 0.8, C.gold);
    gauge(740, 'EVERYONE', 'ELSE', 35, K.pct35 - 0.1, K.pct35 + 0.8, C.ink);
  } });
  cues.push({ k: 'wh', t: K.uae - 0.1, d: 0.3 }, { k: 'wh', t: K.else - 0.2, d: 0.3 });

  // ---- 8. call to action: message me "townhouses" --------------------------------------------------------------------------------------------------------
  const send = K.finalEnd + 0.1;
  add({ id: 'cta', a: s8a, b: DUR, last: true, box: [440, 1280], fn(t) {
    sceneChat(t, { head: 'Price list?', sub: 'Ohana Townhouses · Yas Island', show: s8a + 0.25, typeA: K.final - 0.05, typeB: K.finalEnd - 0.05, send, msg: 'Townhouses', reply: 'Price list' });
  } });
  cues.push({ k: 'send', t: send });

  // ---- overlay on his face beat: the hook, "6 BILLION" / "IN 72 HOURS" slamming in as he says them -----------------------------------------------------------
  const OVERLAYS = [ovHook([['6 BILLION', K.six - 0.05, 'box'], ['IN 72 HOURS', K.n72 - 0.05, 'ivory']], { out: HOOK_END - 0.2, size: 100, y: 400 })];
  cues.push({ k: 'stamp', t: K.six - 0.05 }, { k: 'stamp', t: K.n72 - 0.05 });
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, PIV: [540, 1500], FOOT_MAX: 124 };
}
