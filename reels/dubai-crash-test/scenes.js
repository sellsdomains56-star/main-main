'use strict';
// ---------------------------------------------------------------------------
// "Could continued Iranian attacks on the Gulf trigger a Dubai property crash?" - HeyGen take 8c060a42 (81.3 s, English), Abdullah Ahli's twin.
// His face full screen (never the small bubble) on the hook and four short lines; every claim on a REAL PAGE with a marker on the exact words
// (pagedata.js, captures in assets/, not committed); clean animation for the rest.  No map (nothing to locate).  Safe zone: x 130-950, y 300-1420.
// Sources: The National 2 Sep 2026 (Iran's latest attacks across the region), 6 Apr 2026 ($20tn asset managers boosting regional operations),
// 20 Oct 2026 (Ministry of Investment: investors waiting or delaying); WAM 30 Jul 2026 (4.58M, +332,000, the new method); Gulf News 29 Sep 2026
// (4,807,185); Arada press release 4 Jun 2026 (Penta Group survey, 1-23 April, 689 investors: UAE 56%, US 54%, UK 41%).
// ---------------------------------------------------------------------------
function buildScenes() {
  const cues = [], SCENES = [], add = (s) => { SCENES.push(s); return s; };
  // word time: first word (case and trailing punctuation ignored) at or after `from`
  const A = (w, from = 0) => { const n = s => s.toUpperCase().replace(/[.,?!:;]+$/, ''); const x = TL.words.find(q => q.t >= from - 1e-6 && n(q.text) === n(w)); if (!x) console.error('anchor missing: ' + w + ' @' + from); return x ? x.t : from; };
  const END = TL.dur, VEND = TL.voice_dur;

  const PUNCHES = [], OVERLAYS = [];
  const IMAGES = Object.fromEntries(Object.keys(PAGES).map(k => [k, `assets/${k}.png`]));
  const GOLD = '#E9C47C', RED = '#E5484D', RED2 = '#FF8A8E', TEAL = '#2FD8A0';
  const win = (t, a0, a1, d = 0.4) => ea(t, a0, a0 + d) * (1 - ea(t, a1, a1 + 0.35));
  const slide = (t, a0) => (1 - ea(t, a0, a0 + 0.5, E.out4)) * 30;
  const fit = (s, f, w, ls = 0) => Math.min(1, w / M(s, f, ls));
  const dur = T => T[1] - T[0];
  HUD_X = SAFE.x0;

  // ---------------------------------------------------------------- the beats (times from the words)
  const K = {
    gulf: A('the', 1.5), fewer: A('fewer'), move: A('move'), biz: A('businesses'), delay: A('delay'), homes: A('homes'), entering: A('entering'), prices: A('prices'), pressure: A('pressure'),
    but: A('but'), some: A('some'), boosting: A('continued', 14), despite: A('despite'), others: A('others'), cautious: A('cautious'),
    their: A('their'), supports: A('supports'), doesnt: A("doesn't", 21), guarantee: A('guarantee'), dubai: A('dubai', 24), n458: A('4.58'), adding: A('adding'), n332: A('332,000'),
    by: A('by', 31), reported: A('reported'), n48: A('4.8'), counting: A('the', 36.2), changed: A('changed'), so: A('so', 38), treat: A('treat'), newly: A('newly'), assume: A('assume'), indef: A('indefinitely'),
    investor: A('investor'), inAn: A('in', 45.5), arada: A('arada'), n56: A('56%'), n689: A('689'), expressed: A('expressed'), ahead: A('ahead'), us: A('us', 56), uk: A('uk'),
    but2: A('but', 58.5), purchase: A('purchase'), pop2: A('population', 60), every2: A('every', 62), equally: A('equally'),
    watch: A('watch'), sales: A('sales'), rents: A('rents', 64.5), bizexp: A('business', 65.5), supply: A('supply'),
    uncert: A('uncertainty'), before: A('before'), check: A('check', 71), rents2: A('rents', 72.5), handover: A('handover'), selling: A('selling'), expected: A('expected'),
    buy: A('buy', 77), fall: A('fall'),
  };
  const FACE_SEGS = [[0, K.gulf - 0.05], [K.but - 0.12, K.some - 0.15], [K.investor - 0.12, K.inAn - 0.1], [K.uncert - 0.12, K.before - 0.1], [K.buy - 0.12, VEND]];

  // a page: headline first, then the camera flies to each stop [abs time, image y, scale] and holds; marks: [phrase index, t0, t1] (the marker wipes line by line)
  const lineBoxes = (rects) => {
    const L = []; for (const [x, y, w, h] of rects) { const l = L.find(q => Math.abs(q.y - y) < 12); if (l) { l.x0 = Math.min(l.x0, x); l.x1 = Math.max(l.x1, x + w); } else L.push({ x0: x, x1: x + w, y, h }); }
    return L.sort((a, b) => a.y - b.y).map(l => [l.x0, l.y, l.x1 - l.x0, l.h]);
  };
  const page = (id, img, T, stops, marks, k0 = 0.95) => {
    const keys = [[0, 538, 330, k0, 0]]; let pr = 0, pc = [538, 330, k0, 0];
    if (stops.length && stops[0][0] - T[0] < 0.9) { pc = [540, stops[0][1] - 110, 0.92, 10]; keys[0] = [0, ...pc]; }   // a short beat opens on the quoted line
    for (const [ta, cy, k = 0.97] of stops) { const r = ta - T[0]; keys.push([Math.max(r - 0.75, pr + 0.05), ...pc]); pc = [540, cy, k, 16]; keys.push([r, ...pc]); pr = r; }
    keys.push([dur(T) + 0.5, pc[0], pc[1] + 6, pc[2] * 1.03, pc[3] + 2]);
    const hl = [];
    for (const [pi, t0, t1] of marks) {
      const ls = lineBoxes(PAGES[img].boxes[pi]), tot = ls.reduce((s, b) => s + b[2], 0); let acc = 0;
      for (const b of ls) { const a = t0 + (t1 - t0) * acc / tot; acc += b[2]; hl.push({ bbox: b, t0: a, t1: t0 + (t1 - t0) * acc / tot }); }
    }
    add({ id, kind: 'page', img, a: T[0], b: T[1], keys, hl });
  };
  const qy = (img, pi) => { const r = PAGES[img].boxes[pi]; return (Math.min(...r.map(b => b[1])) + Math.max(...r.map(b => b[1] + b[3]))) / 2; };   // centre of a quoted phrase (image px)

  const T1 = [K.gulf - 0.05, K.fewer - 0.1], T2 = [T1[1], K.but - 0.12], T3 = [K.some - 0.15, K.others - 0.15], T4 = [T3[1], K.their - 0.12], T5 = [T4[1], K.dubai - 0.12];
  const T6 = [T5[1], K.by - 0.15], T7 = [T6[1], K.counting - 0.12], T8 = [T7[1], K.so - 0.05], T9 = [T8[1], K.investor - 0.12], T10 = [K.inAn - 0.1, K.but2 - 0.12];
  const T11 = [T10[1], K.watch - 0.12], T12 = [T11[1], K.uncert - 0.12], T13 = [K.before - 0.1, K.buy - 0.12];

  page('p_attacks', 'tn_attacks', T1, [[T1[0] + 0.1, qy('tn_attacks', 0)]], [[0, K.gulf + 0.2, K.gulf + 1.6]]);
  page('p_20tn', 'tn_20tn', T3, [[K.boosting - 0.1, qy('tn_20tn', 0)]], [[0, K.boosting + 0.3, K.despite + 0.75]]);
  page('p_fdi', 'tn_fdi', T4, [[T4[0] + 0.1, qy('tn_fdi', 0) + 150]], [[0, K.others + 0.2, K.cautious + 0.55]]);
  page('p_wam1', 'wam_pop', T6, [[K.n458 - 0.25, qy('wam_pop', 0)]], [[0, K.n458 - 0.05, K.n332 + 0.5]]);
  page('p_gn', 'gn_pop', T7, [[K.reported - 0.2, qy('gn_pop', 0)]], [[0, K.n48 - 0.8, K.n48 + 0.7]]);
  page('p_wam2', 'wam_pop', T8, [[T8[0] + 0.1, qy('wam_pop', 1)]], [[1, K.counting + 0.2, K.changed + 0.45]]);
  page('p_arada', 'arada', T10, [[K.n56 - 0.35, qy('arada', 0)], [K.n689 - 0.2, qy('arada', 2)], [K.expressed - 0.1, qy('arada', 0)], [K.ahead - 0.3, qy('arada', 1)]],
    [[0, K.n56 - 0.1, K.n689 - 0.3], [2, K.n689 - 0.05, K.expressed - 0.2], [1, K.ahead, K.uk + 0.6]]);

  // ---------------------------------------------------------------- overlay pieces
  const srcChip = (t, txt, a0, a1) => { const al = win(t, a0, a1); if (al <= 0.003) return; const f = F.d(800, 25), w = M(txt, f, 2) + 48; ctx.save(); ctx.globalAlpha *= al; glassPill(CX - w / 2, 1172, w, 54, 27); T(txt, CX, 1209, { font: f, ls: 2, color: '#FFFFFF' }); ctx.restore(); };
  const arrow = (x, y, dir, s, color, p = 1) => {                    // a short arrow pointing up (dir -1) or down (dir 1)
    if (p <= 0.003) return; ctx.save(); ctx.globalAlpha *= p; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const L = s * p; ctx.beginPath(); ctx.moveTo(x, y - dir * s / 2); ctx.lineTo(x, y - dir * s / 2 + dir * L); ctx.stroke();
    const ty = y - dir * s / 2 + dir * L; ctx.beginPath(); ctx.moveTo(x, ty + dir * 10); ctx.lineTo(x - 15, ty - dir * 10); ctx.lineTo(x + 15, ty - dir * 10); ctx.closePath(); ctx.fill(); ctx.restore();
  };
  const cross = (x, y, r, color, p = 1) => { if (p <= 0.003) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'; const q = r * 0.42, a = clamp(p * 2), b = clamp(p * 2 - 1);
    ctx.beginPath(); ctx.moveTo(x - q, y - q); ctx.lineTo(x - q + 2 * q * a, y - q + 2 * q * a); ctx.stroke(); if (b > 0) { ctx.beginPath(); ctx.moveTo(x + q, y - q); ctx.lineTo(x + q - 2 * q * b, y - q + 2 * q * b); ctx.stroke(); } ctx.restore(); };
  // one frosted row: icon disc on the left, text, optional sign on the right
  const row = (t, y, h, a, txt, o = {}) => {
    const e = ea(t, a - 0.1, a + 0.4, E.out4); if (e <= 0.003) return; const f = F.d(800, o.size || 42);
    ctx.save(); ctx.globalAlpha *= e; ctx.translate((1 - e) * -34, 0); glassPill(SAFE.x0, y, SAFE.w, h, 26);
    if (o.edge) { rr(SAFE.x0, y, 10, h, [26, 0, 0, 26]); ctx.fillStyle = o.edge; ctx.fill(); }
    const cy = y + h / 2; if (o.icon) { dot(SAFE.x0 + 70, cy, 36, o.disc || C.goldSoft); icon(o.icon, SAFE.x0 + 70, cy, 20, { p: ea(t, a, a + 0.5), color: o.ic || GOLD, w: 3.5 }); }
    const tx = SAFE.x0 + (o.icon ? 128 : 44), mw = SAFE.x1 - tx - (o.sign ? 110 : 40);
    if (o.sub) { T(txt, tx, cy - 6, { font: f, color: '#FFFFFF', align: 'left', sx: fit(txt, f, mw) }); T(o.sub, tx, cy + 36, { font: F.d(700, 26), ls: 2, color: o.subc || C.dim, align: 'left', sx: fit(o.sub, F.d(700, 26), mw, 2) }); }
    else T(txt, tx, cy + (o.size || 42) * 0.36, { font: f, color: '#FFFFFF', align: 'left', sx: fit(txt, f, mw) });
    if (o.sign) o.sign(SAFE.x1 - 66, cy, ea(t, (o.signAt ?? a) - 0.05, (o.signAt ?? a) + 0.45, E.out3));
    ctx.restore();
  };
  const neq = (t, y, left, right, a, b, o = {}) => {                // "LEFT ≠ RIGHT" card, the sign drops in when he says the second half
    const e = ea(t, a - 0.1, a + 0.4, E.out4); if (e <= 0.003) return; const h = o.h || 200, f = F.d(800, o.size || 44);
    ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 26); glassPill(SAFE.x0, y, SAFE.w, h, 30);
    const e2 = ea(t, b - 0.15, b + 0.35, E.back), L = SAFE.x0 + 60, R = SAFE.x1 - 60;
    left.forEach((s, i) => T(s, L, y + 86 + i * 52 - (left.length - 1) * 26, { font: f, color: '#FFFFFF', align: 'left', sx: fit(s, f, 300) }));
    ctx.save(); ctx.globalAlpha *= clamp(e2); ctx.translate(CX + 10, y + h / 2); ctx.scale(lerp(0.6, 1, e2), lerp(0.6, 1, e2)); T('≠', 0, 30, { font: F.d(800, 92), color: o.signc || RED }); ctx.restore();
    right.forEach((s, i) => T(s, R, y + 86 + i * 52 - (right.length - 1) * 26, { font: f, color: o.rc || GOLD, align: 'right', alpha: clamp(e2 * 1.5), sx: fit(s, f, 300) }));
    ctx.restore();
  };

  // ---- S1: what a crash would need (3.9 - 11)
  const crashCase = (t) => {
    const al = win(t, T2[0], T2[1] - 0.1); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    row(t, 636, 114, K.fewer, 'FEWER PEOPLE MOVE HERE', { icon: 'plane', sign: (x, y, p) => arrow(x, y, 1, 50, RED2, p), signAt: K.move });
    row(t, 766, 114, K.biz, 'BUSINESSES DELAY EXPANSION', { icon: 'briefcase', sign: (x, y, p) => { ctx.save(); ctx.globalAlpha *= p; rr(x - 17, y - 24, 11, 48, 4); ctx.fillStyle = RED2; ctx.fill(); rr(x + 6, y - 24, 11, 48, 4); ctx.fill(); ctx.restore(); }, signAt: K.delay + 0.2 });
    row(t, 896, 114, K.homes - 0.15, 'NEW HOMES KEEP COMING', { icon: 'building', sign: (x, y, p) => arrow(x, y, -1, 50, RED2, p), signAt: K.entering });
    // the price line bends down
    const e = ea(t, K.prices - 0.2, K.prices + 0.3, E.out4); if (e > 0.003) {
      ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 26); const y = 1036, h = 224; glassPill(SAFE.x0, y, SAFE.w, h, 30); rr(SAFE.x0, y, 10, h, [30, 0, 0, 30]); ctx.fillStyle = RED; ctx.fill();
      T('PRICES', SAFE.x0 + 44, y + 70, { font: F.d(800, 30), ls: 5, color: C.dim, align: 'left' }); T('UNDER PRESSURE', SAFE.x0 + 44, y + 128, { font: F.d(800, 46), color: RED2, align: 'left', alpha: ea(t, K.pressure - 0.2, K.pressure + 0.2) });
      const p = ea(t, K.prices, K.pressure + 0.6, E.inOut2), x0 = SAFE.x0 + 470, x1 = SAFE.x1 - 40, pts = [];
      for (let i = 0; i <= 40; i++) { const u = i / 40, yy = y + 70 + 22 * Math.sin(u * 9) * (1 - u) + (u > 0.45 ? Math.pow((u - 0.45) / 0.55, 1.6) * 110 : 0); pts.push([lerp(x0, x1, u), yy]); }
      strokePoly(pts, p, { color: RED2, w: 5 }); if (p > 0.98) dot(x1, pts[40][1], 9, RED2);
      line(x0, y + h - 36, x1, y + h - 36, { color: 'rgba(243,239,230,0.2)', w: 2 }); ctx.restore(); }
    ctx.restore();
  };
  // ---- S2: their presence supports business activity; it doesn't guarantee prices (20.2 - 24.1)
  const presence = (t) => {
    const al = win(t, T5[0], T5[1] - 0.1); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    row(t, 700, 150, K.their, 'SUPPORTS', { sub: 'BUSINESS ACTIVITY', size: 50, subc: TEAL, edge: TEAL, sign: (x, y, p) => { dot(x, y, 36, 'rgba(47,216,160,0.18)'); icon('check', x, y + 2, 18, { p, color: TEAL, w: 5 }); }, signAt: K.supports });
    row(t, 880, 150, K.doesnt - 0.1, "DOESN'T GUARANTEE", { sub: 'PROPERTY PRICES', size: 50, subc: RED2, edge: RED, sign: (x, y, p) => { dot(x, y, 36, 'rgba(229,72,77,0.18)'); cross(x, y, 36, RED2, p); }, signAt: K.guarantee });
    ctx.restore();
  };
  // ---- S3: every increase is not a new arrival; the same growth won't continue forever (38.1 - 44)
  const method = (t) => {
    const al = win(t, T9[0], T9[1] - 0.1); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    neq(t, 660, ['EVERY', 'INCREASE'], ['A NEW', 'ARRIVAL'], K.treat - 0.2, K.newly);
    neq(t, 900, ['THE SAME', 'GROWTH'], ['FOREVER'], K.assume - 0.2, K.indef);
    ctx.restore();
  };
  // ---- S5: interest is not a completed purchase; growth won't lift every project equally (58.5 - 63.8)
  const notEqual = (t) => {
    const al = win(t, T11[0], T11[1] - 0.1); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    neq(t, 640, ['INTEREST'], ['A COMPLETED', 'PURCHASE'], K.but2, K.purchase - 0.5);
    const e = ea(t, K.pop2 - 0.15, K.pop2 + 0.35, E.out4); if (e > 0.003) {
      ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 26); const y = 880, h = 380; glassPill(SAFE.x0, y, SAFE.w, h, 30);
      T('POPULATION GROWTH', CX, y + 66, { font: F.d(800, 30), ls: 5, color: GOLD });
      [[0.92, 'A'], [0.55, 'B'], [0.2, 'C']].forEach(([v, n], i) => { const x = SAFE.x0 + 150 + i * 260, base = y + h - 70, hh = 200 * v * ea(t, K.every2 - 0.3 + i * 0.25, K.every2 + 0.5 + i * 0.25, E.out3);
        icon('building', x - 70, base - 40, 30, { color: C.dim, w: 3 }); rr(x - 26, base - hh, 52, hh, 10); ctx.fillStyle = i === 0 ? GOLD : i === 1 ? 'rgba(233,196,124,0.55)' : 'rgba(229,72,77,0.6)'; ctx.fill();
        T('PROJECT ' + n, x, base + 44, { font: F.d(800, 24), ls: 2, color: C.dim }); });
      T('NOT EQUALLY', CX, y + 112, { font: F.d(800, 36), color: '#FFFFFF', alpha: ea(t, K.equally - 0.3, K.equally + 0.2) });
      ctx.restore(); }
    ctx.restore();
  };
  // ---- S6: what to watch (63.8 - 68)
  const watch = (t) => {
    const al = win(t, T12[0], T12[1] - 0.1); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    const items = [['ACTUAL SALES', 'tag', K.sales - 0.25], ['RENTS', 'house', K.rents - 0.2], ['BUSINESS', 'briefcase', K.bizexp - 0.2, 'EXPANSION'], ['COMPLETED', 'building', K.supply - 0.45, 'SUPPLY']], gap = 24, w = (SAFE.w - gap) / 2, h = 250;
    items.forEach(([txt, ic, a, l2], i) => { const e = ea(t, a - 0.1, a + 0.4, E.back); if (e <= 0.003) return; const x = SAFE.x0 + (i % 2) * (w + gap), y = 660 + Math.floor(i / 2) * (h + gap);
      ctx.save(); ctx.globalAlpha *= clamp(e); ctx.translate(x + w / 2, y + h / 2); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); glassPill(-w / 2, -h / 2, w, h, 28); rr(-w / 2, -h / 2, w, h, 28); ctx.strokeStyle = 'rgba(233,196,124,0.6)'; ctx.lineWidth = 2.5; ctx.stroke();
      dot(0, -42, 40, C.goldSoft); icon(ic, 0, -42, 22, { p: ea(t, a, a + 0.5), color: GOLD, w: 3.5 });
      const f = F.d(800, 42); T(txt, 0, l2 ? 52 : 70, { font: f, color: '#FFFFFF', sx: fit(txt, f, w - 40) }); if (l2) T(l2, 0, 102, { font: f, color: '#FFFFFF', sx: fit(l2, f, w - 40) });
      ctx.restore(); });
    ctx.restore();
  };
  // ---- S7: stress-test the deal (70.2 - 77.6)
  const stress = (t) => {
    const al = win(t, T13[0], T13[1] - 0.1); if (al <= 0.003) return; ctx.save(); ctx.globalAlpha *= al;
    const e = ea(t, K.check - 0.2, K.check + 0.3, E.out4); if (e > 0.003) { ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 20); T('DOES THE PROPERTY', CX, 690, { font: F.d(800, 44), color: '#FFFFFF' }); T('STILL WORK IF…', CX, 748, { font: F.d(800, 44), color: GOLD }); ctx.restore(); }
    [['RENTS SOFTEN', K.rents2, 'drop'], ['HANDOVER IS DELAYED', K.handover, 'building'], ['SELLING TAKES LONGER', K.selling, 'tag']].forEach(([txt, a, ic], i) =>
      row(t, 812 + i * 140, 120, a - 0.1, txt, { icon: ic, size: 40, sign: (x, y, p) => { dot(x, y, 30, 'rgba(233,196,124,0.18)'); icon('check', x, y + 2, 15, { p, color: GOLD, w: 5 }); }, signAt: a + 0.6 }));
    ctx.restore();
  };

  const overlay = (t) => {
    const F0 = faceF(t); if (F0 > 0.999 && t < VEND - 0.05) return;
    ctx.save(); ctx.globalAlpha *= 1 - F0;
    hudTitle(t, 'THE QUESTION', 'IRAN ATTACKS ON THE GULF', 'A DUBAI PROPERTY CRASH?', T1[0] + 0.1, T1[1] - 0.15, RED2);
    hudTitle(t, 'THE CRASH CASE', 'WHAT WOULD HAVE TO HAPPEN', '', T2[0], T2[1] - 0.2, RED2);
    hudTitle(t, 'GLOBAL INVESTMENT FIRMS', 'STILL EXPANDING', 'DESPITE THE CONFLICT', T3[0] + 0.1, T3[1] - 0.15, TEAL);
    hudTitle(t, 'OTHERS', 'MORE CAUTIOUS', 'WAITING OR DELAYING', T4[0], T4[1] - 0.15, GOLD);
    hudTitle(t, 'WHAT IT MEANS', 'BUSINESS ≠ PRICES', '', T5[0], T5[1] - 0.15, GOLD);
    hudTitle(t, 'DUBAI · END OF 2025', '4.58 MILLION RESIDENTS', '+332,000 IN ONE YEAR', T6[0] + 0.1, T6[1] - 0.15, GOLD);
    hudTitle(t, 'SEPTEMBER 2026', 'ABOUT 4.8 MILLION', 'REPORTED POPULATION', T7[0], T7[1] - 0.15, GOLD);
    hudTitle(t, 'READ IT CAREFULLY', 'THE COUNT CHANGED', 'A NEW COUNTING METHOD', T8[0], T9[1] - 0.15, GOLD);
    hudTitle(t, 'APRIL SURVEY · 689 INVESTORS', 'UAE: 56% SERIOUSLY INTERESTED', 'AHEAD OF THE US (54%) AND UK (41%)', T10[0] + 0.1, T10[1] - 0.15, GOLD);
    hudTitle(t, 'BUT', 'INTEREST IS NOT A SALE', '', T11[0], T11[1] - 0.15, RED2);
    hudTitle(t, 'WHAT TO WATCH', 'THE REAL NUMBERS', '', T12[0], T12[1] - 0.15, GOLD);
    hudTitle(t, 'BEFORE YOU BUY', 'STRESS-TEST THE DEAL', '', T13[0], T13[1] - 0.15, GOLD);
    srcChip(t, 'THE NATIONAL · 2 SEP 2026', T1[0] + 0.2, T1[1] - 0.15); srcChip(t, 'THE NATIONAL · 6 APR 2026', T3[0] + 0.3, T3[1] - 0.15); srcChip(t, 'THE NATIONAL · 20 OCT 2026', T4[0] + 0.1, T4[1] - 0.15);
    srcChip(t, 'WAM · DIGITAL DUBAI · 30 JUL 2026', T6[0] + 0.3, T6[1] - 0.15); srcChip(t, 'GULF NEWS · 29 SEP 2026', T7[0] + 0.2, T7[1] - 0.15); srcChip(t, 'WAM · DIGITAL DUBAI · 30 JUL 2026', T8[0] + 0.1, T8[1] - 0.15);
    srcChip(t, 'ARADA · PENTA GROUP SURVEY · JUN 2026', T10[0] + 0.3, T10[1] - 0.15);
    crashCase(t); presence(t); method(t); notEqual(t); watch(t); stress(t);
    ctx.restore();
    // end card: his name after the last line
    const ce = ea(t, VEND - 0.1, VEND + 0.5, E.out3);
    if (ce > 0.003) { ctx.save(); ctx.globalAlpha *= ce; ctx.fillStyle = 'rgba(8,8,10,0.92)'; ctx.fillRect(0, 0, W, H); T('ABDULLAH AHLI', CX, 900, { font: F.d(800, 66), ls: 2, color: C.ink }); T('PORTFOLIO STRATEGIST', CX, 958, { font: F.d(700, 34), ls: 6, color: C.gold });
      rr(CX - 60, 1000, 120 * ea(t, VEND + 0.2, VEND + 0.9, E.out4), 6, 3); ctx.fillStyle = GOLD; ctx.fill(); ctx.restore(); }
  };
  OVERLAYS.push(overlay);

  [T1[0], T2[0], T3[0], T4[0], T5[0], T6[0], T7[0], T8[0], T9[0], T10[0], T11[0], T12[0], T13[0]].forEach(x => cues.push({ k: 'wh', t: x - 0.2, d: 0.5 }));
  [K.n458, K.n48, K.n56, K.pressure].forEach(x => cues.push({ k: 'pin', t: x }));
  return { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues, IMAGES, BUBBLE: null, FOOT_MAX: TL.frames - 1, NO_CAPTIONS: false, CAP_UNTIL: VEND, STATIC_FACE: false };
}
