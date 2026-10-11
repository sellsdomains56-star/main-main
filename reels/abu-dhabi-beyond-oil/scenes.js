'use strict';
// ---------------------------------------------------------------------------
// Scenes. Every function takes absolute time `t` (seconds) and draws ONE calm hero visual in its own
// coordinates; main.js centres the box on the screen and the live map + captions sit below it.
// ---------------------------------------------------------------------------
const enter = (t, a, d = 0.55, dist = 36) => ({ a: ea(t, a, a + d * 0.75, E.out2), dy: (1 - ea(t, a, a + d, E.out4)) * dist });

function label(s, x, y, t, a, o = {}) {
  const e = enter(t, a, 0.5, 18);
  T(s, x, y + e.dy, { font: F.t(600, o.size || 22), ls: o.ls ?? 12, color: o.color || C.dim, alpha: e.a * (o.alpha ?? 1), align: o.align || 'center' });
}

// a row of words that light in sequentially, centered
function wordRow(words, times, y, t, o = {}) {
  const font = F.t(600, o.size || 26), ls = o.ls ?? 12;
  const ws = words.map(w => M(w, font, ls)); const gap = o.gap ?? 34;
  const k = times.map(tm => ea(t, tm, tm + 0.55, E.out4));      // reveal factor per word
  const total = ws.reduce((a, w, i) => a + (w + gap) * k[i], 0) - gap * Math.max(...k);
  let x = (o.cx ?? CX) - total / 2;
  words.forEach((w, i) => {
    const e = enter(t, times[i], 0.45, 14);
    const col = (o.colors && o.colors[i]) || C.dim;
    T(w, x + ws[i] / 2, y + e.dy, { font, ls, color: col, alpha: e.a });
    x += (ws[i] + gap) * k[i];
  });
}

// ------------------------------------------------------------- 2. "OUTDATED"
function sceneOutdated(t) {
  // decades: a single line with a travelling dot
  const tl = ea(t, 5.85, 8.55, E.inOut2), tla = ea(t, 5.85, 6.4), ly = 500;
  line(90, ly, 990, ly, { color: C.faint, w: 1.5, alpha: tla });
  if (tl > 0) {
    const L = 900 * tl;
    line(90, ly, 90 + L, ly, { color: C.ink, w: 2.5, alpha: tla * 0.9 });
    glow(90 + L, ly, 60, '233,196,124', 0.35 * tla); dot(90 + L, ly, 8, C.gold, tla);
  }
  label('DECADES', 90, 450, t, 6.8, { align: 'left', ls: 16, color: C.gold, size: 24 });
  // lockup
  const f1 = F.d(300, 118); const wB = M('Building', f1, -3), wW = M('wealth', F.d(600, 118), -3), sp = M(' ', f1);
  const tot = wB + sp + wW; let x = CX - tot / 2;
  const eB = enter(t, 7.27, 0.6, 46), eW = enter(t, 7.65, 0.6, 46);
  T('Building', x + wB / 2, 700 + eB.dy, { font: f1, ls: -3, alpha: eB.a });
  T('wealth', x + wB + sp + wW / 2, 700 + eW.dy, { font: F.d(600, 118), ls: -3, alpha: eW.a });
  const fb = F.i(200); const wby = M('beyond', fb), wo = M('oil.', fb), spb = M(' ', fb);
  const tot2 = wby + spb + wo; const s2 = Math.min(1, 900 / tot2); const xb = CX - (tot2 * s2) / 2;
  const eY = enter(t, 8.13, 0.7, 60);
  T('beyond', xb + (wby * s2) / 2, 915 + eY.dy, { font: fb, color: C.gold, alpha: eY.a, sx: s2 });
  const eO = ea(t, 8.59, 8.95, E.out5), oa = ea(t, 8.59, 8.75, E.out2);
  T('oil.', xb + (wby + spb) * s2 + (wo * s2) / 2, 915, { font: fb, color: C.ink, alpha: oa, sx: s2 * lerp(1.35, 1, eO), sy: s2 * lerp(1.35, 1, eO) });
}

// ----------------------------------------------------------------- 3. MUBADALA
function counterGroup(t, o) {
  // o: {prefix, prefixT, val, dec, fin, suffix, a0, a1, y}
  const font = F.d(300, 300);
  const nW = numberWidth(o.fin, font, -6);
  const fs = F.i(170), sW = M(o.suffix, fs); const gap = 14;
  const tot = nW + gap + sW; const x0 = -tot / 2;
  const v = o.val * ea(t, o.a0, o.a1, E.out3);
  const na = ea(t, o.a0 - 0.05, o.a0 + 0.3);
  const counting = t > o.a0 && t < o.a1 + 0.1;
  if (counting) glow(0, -40, 380, '233,196,124', 0.10);
  drawNumber(numberStr(v, o.dec), o.fin, x0, 95, { font, alpha: na, ls: -6 });
  const done = prog(t, o.a1 - 0.1, o.a1 + 0.35);
  const eS = ea(t, o.a1 - 0.2, o.a1 + 0.3, E.out5);
  T(o.suffix, x0 + nW + gap + sW / 2, 95, { font: fs, color: C.gold, alpha: na * ea(t, o.a0, o.a0 + 0.3), sx: lerp(0.9, 1, eS), sy: lerp(0.9, 1, eS) });
  return { x0, nW, tot };
}

function sceneMubadala(t) {
  const lp = ea(t, 8.95, 9.6, E.out4);
  logo('mubadala', CX, 440, 84, { alpha: ea(t, 8.95, 9.2), reveal: lp, shine: prog(t, 9.55, 10.5) });
  ctx.save(); ctx.translate(CX, 880);
  const e0 = enter(t, 9.78, 0.5, 20);
  T('AED', 0, -215 + e0.dy, { font: F.t(600, 40), ls: 20, color: C.gold, alpha: e0.a });
  counterGroup(t, { val: 1.4, dec: 1, fin: '1.4', suffix: 'T', a0: 9.78, a1: 10.98 });
  // TRILLION / IN ASSETS
  const f = F.t(600, 30), l1 = M('TRILLION', f, 16), l2 = M('IN ASSETS', f, 16), g = 36, tt = l1 + g + l2;
  const eT = enter(t, 10.46, 0.5, 18), eA = enter(t, 11.12, 0.5, 18), kk = ea(t, 11.12, 11.7, E.out4);
  const tx = -((l2 + g) / 2) * kk;                                 // TRILLION centre
  T('TRILLION', tx, 190 + eT.dy, { font: f, ls: 16, color: C.ink, alpha: eT.a * 0.92 });
  T('IN ASSETS', tx + l1 / 2 + g + l2 / 2, 190 + eA.dy, { font: f, ls: 16, color: C.gold, alpha: eA.a });
  ctx.restore();
}

// ------------------------------------------------------- 3b. MUBADALA vs PORTUGAL'S GDP
function sceneBars(t) {
  const BX0 = 120, BW = 840, by1 = 560, by2 = 790, bh = 34;
  const e1 = enter(t, 11.88, 0.5, 20), e2 = enter(t, 12.2, 0.5, 20);
  T('MUBADALA', BX0, by1 - 34 + e1.dy, { font: F.t(700, 28), ls: 10, color: C.ink, align: 'left', alpha: e1.a });
  T('AED 1.4T', BX0 + BW, by1 - 34 + e1.dy, { font: F.t(700, 28), ls: 10, color: C.gold, align: 'right', alpha: e1.a });
  T('PORTUGAL · ANNUAL GDP', BX0, by2 - 34 + e2.dy, { font: F.t(700, 28), ls: 10, color: C.ink, align: 'left', alpha: e2.a });
  rr(BX0, by1, BW, bh, bh / 2); ctx.save(); ctx.globalAlpha *= e1.a; ctx.fillStyle = 'rgba(243,239,230,0.14)'; ctx.fill(); ctx.restore();
  rr(BX0, by2, BW, bh, bh / 2); ctx.save(); ctx.globalAlpha *= e2.a; ctx.fillStyle = 'rgba(243,239,230,0.14)'; ctx.fill(); ctx.restore();
  const b1 = ea(t, 11.95, 12.65, E.out4), b2 = ea(t, 12.25, 13.0, E.out4), pw = 0.78;
  if (b1 > 0.002) { rr(BX0, by1, BW * b1, bh, bh / 2); ctx.fillStyle = C.gold; ctx.fill(); glow(BX0 + BW * b1, by1 + bh / 2, 70, '233,196,124', 0.25); }
  if (b2 > 0.002) { rr(BX0, by2, BW * pw * b2, bh, bh / 2); ctx.save(); ctx.fillStyle = 'rgba(243,239,230,0.78)'; ctx.fill(); ctx.restore(); }
  const bk = ea(t, 13.15, 13.7, E.out4), xm = BX0 + BW * pw;
  if (bk > 0) {
    line(xm, by1 - 14, xm, by2 + bh + 30, { color: C.gold, w: 2.5, dash: [5, 6], alpha: bk });
    T('MORE THAN', xm + 12 + (BX0 + BW - xm - 12) / 2, by2 + bh + 62, { font: F.t(700, 28), ls: 12, color: C.gold, alpha: bk });
  }
}

// -------------------------------------------------------------------- 4. ADIA
function sceneAdia(t) {
  const lp = ea(t, 13.86, 14.5, E.out4);
  logo('adia', CX, 440, 104, { alpha: ea(t, 13.86, 14.1), reveal: lp, shine: prog(t, 14.3, 15.2) });
  label('ESTIMATED', CX, 560, t, 14.65, { ls: 18, color: C.dim, size: 24 });
  const cy = 830, R = 200;
  const ra = ea(t, 14.35, 15.2, E.out3), fill = ea(t, 15.19, 16.1, E.out3);
  ring(CX, cy, R, { color: C.faint, w: 2, alpha: ra, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * ra });
  if (fill > 0.001) {
    ring(CX, cy, R, { color: C.gold, w: 6, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * fill });
    const ha = -Math.PI / 2 + Math.PI * 2 * fill; glow(CX + Math.cos(ha) * R, cy + Math.sin(ha) * R, 90, '233,196,124', 0.4); dot(CX + Math.cos(ha) * R, cy + Math.sin(ha) * R, 9, C.gold);
  }
  ctx.save(); ctx.translate(CX, cy + 30); ctx.scale(0.6, 0.6);
  const e0 = enter(t, 15.19, 0.45, 18);
  T('US$', 0, -185 + e0.dy, { font: F.t(600, 40), ls: 20, color: C.gold, alpha: e0.a });
  counterGroup(t, { val: 1.1, dec: 1, fin: '1.1', suffix: 'T', a0: 15.19, a1: 16.05 });
  const eT = enter(t, 15.8, 0.45, 18);
  T('TRILLION', 0, 190 + eT.dy, { font: F.t(600, 30), ls: 16, color: C.ink, alpha: eT.a * 0.92 });
  ctx.restore();
}

// ---------------------------------------------------- 5. INVESTMENT ECOSYSTEM
function pill(txt, cx, cy, w, h, t, a0, o = {}) {
  const e = ea(t, a0, a0 + 0.5, E.back), al = ea(t, a0, a0 + 0.3);
  if (al <= 0.003) return;
  const flash = 1 - ea(t, a0 + 0.1, a0 + 0.9);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(lerp(0.86, 1, e), lerp(0.86, 1, e)); ctx.globalAlpha *= al;
  rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(243,239,230,0.04)'; ctx.fill();
  ctx.strokeStyle = flash > 0.01 ? `rgba(233,196,124,${0.35 + 0.65 * flash})` : 'rgba(243,239,230,0.34)'; ctx.lineWidth = 2; ctx.stroke();
  T(txt, 0, 11, { font: F.t(600, o.size || 30), ls: o.ls ?? 9, color: flash > 0.3 ? C.gold : C.ink });
  ctx.restore();
  if (flash > 0.01) glow(cx, cy, 200, '233,196,124', 0.12 * flash);
}

function sceneEcosystem(t) {
  label('INVESTING IN', CX, 400, t, 16.21, { ls: 20, size: 24 });
  const W4 = [['AI', 16.84], ['TECHNOLOGY', 17.32], ['INFRASTRUCTURE', 17.78], ['BUSINESSES', 18.33]];
  const dim = 1 - 0.62 * ea(t, 18.84, 19.3);                       // the list recedes when the outcomes arrive
  W4.forEach(([w, a], i) => {
    const e = enter(t, a, 0.5, 30), y = 520 + i * 96;
    T(w, CX, y + e.dy, { font: F.d(600, 70), ls: w.length > 11 ? 6 : 12, color: C.ink, alpha: e.a * dim });
  });
  const hy = 905, ha = ea(t, 18.84, 19.4, E.out4);                 // arrow down
  if (ha > 0.003) { line(CX, hy - 34, CX, hy + 6, { color: C.gold, w: 3, alpha: ha }); icon('up', CX, hy + 6, 14, { p: 1, color: C.gold, w: 3.4, rot: Math.PI, alpha: ha }); }
  const O = [['COMPANIES', 'building', 19.13, 20.05], ['JOBS', 'briefcase', 20.11, 20.83], ['HOUSING DEMAND', 'house', 20.87, 99]];
  O.forEach(([w, ic, a, b], i) => {
    const e = ea(t, a, a + 0.5, E.out4), o = i < 2 ? 1 - ea(t, b, b + 0.28) : 1; if (e * o <= 0.003) return;
    const isH = i === 2, y = 1040;
    ctx.save(); ctx.globalAlpha *= e * o; ctx.translate(0, (1 - e) * 26);
    icon(ic, CX, y - 100, 34, { p: ea(t, a + 0.1, a + 0.7, E.out3), color: isH ? C.gold : C.ink, w: 3.4 });
    T(w, CX, y + 20, { font: F.d(700, 92), ls: 8, color: isH ? C.gold : C.ink });
    ctx.restore();
  });
}

// ------------------------------------------------- 6/7. DEVELOPERS (Aldar, Modon)
function projectCard(key, cx, cy, w, h, t, a0, o = {}) {
  const e = ea(t, a0, a0 + 0.55, E.out4), al = ea(t, a0, a0 + 0.35);
  if (al <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= al * (o.dim ?? 1); ctx.translate(cx, cy + (1 - e) * 40);
  rr(-w / 2, -h / 2, w, h, 22); ctx.fillStyle = 'rgba(243,239,230,0.04)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.22)'; ctx.lineWidth = 2; ctx.stroke();
  // gold corner tick
  line(-w / 2 + 28, -h / 2, -w / 2 + 28 + 54 * e, -h / 2, { color: C.gold, w: 3 });
  if (o.icon) icon(o.icon, -w / 2 + 78, 0, 28, { p: ea(t, a0 + 0.1, a0 + 0.7), color: C.gold, w: 3 });
  const lx = o.icon ? 50 : 0;
  logo(key, lx, 0, o.size || 50, { reveal: ea(t, a0 + 0.1, a0 + 0.8, E.out3) });
  ctx.restore();
}
function projectTile(cx, cy, w, h, t, a0, draw, o = {}) {
  const e = ea(t, a0, a0 + 0.55, E.out4), al = ea(t, a0, a0 + 0.35);
  if (al <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= al * (o.dim ?? 1); ctx.translate(cx, cy + (1 - e) * 40);
  rr(-w / 2, -h / 2, w, h, 22); ctx.fillStyle = 'rgba(243,239,230,0.04)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.22)'; ctx.lineWidth = 2; ctx.stroke();
  line(-w / 2 + 28, -h / 2, -w / 2 + 28 + 54 * e, -h / 2, { color: C.gold, w: 3 });
  draw(ea(t, a0 + 0.1, a0 + 0.9, E.out3));
  ctx.restore();
}
function branch(t, a0, a1, x, y0, y1, ymid) {
  const p = ea(t, a0, a1, E.out3); strokePoly([[CX, y0], [CX, ymid], [x, ymid], [x, y1]], p, { color: C.mute, w: 2 });
}
function bigNumber(t, o) {
  // o: {overT, aed, val, dec, fin, suffix, a0, a1, y}
  const sc = o.sc || 0.8;
  ctx.save(); ctx.translate(CX, o.y); ctx.scale(sc, sc);
  const e0 = enter(t, o.overT, 0.5, 18);
  const f = F.t(600, 38), wo = M('OVER', f, 18), wa = M(o.aed, f, 18), g = 30, tt = wo + g + wa;
  T('OVER', -tt / 2 + wo / 2, -205 + e0.dy, { font: f, ls: 18, color: C.ink, alpha: e0.a * 0.9 });
  const e1 = enter(t, o.aedT, 0.5, 18);
  T(o.aed, -tt / 2 + wo + g + wa / 2, -205 + e1.dy, { font: f, ls: 18, color: C.gold, alpha: e1.a });
  counterGroup(t, { val: o.val, dec: o.dec, fin: o.fin, suffix: o.suffix, a0: o.a0, a1: o.a1 });
  ctx.restore();
}

function sceneAldar(t) {
  logo('aldar', CX, 435, 96, { alpha: ea(t, 22.29, 22.5), reveal: ea(t, 22.29, 22.95, E.out4), shine: prog(t, 22.9, 23.8) });
  const dim = 1;
  projectTile(300, 700, 440, 240, t, 22.85, r => { logo('talay', 0, 4, 0, { fitH: 196, reveal: r }); }, { dim });
  projectTile(780, 700, 440, 240, t, 23.36, r => {
    logo('yas', 0, -28, 0, { fitH: 122, reveal: r });
    T('RIVA RESERVE', 0, 78, { font: F.d(600, 27), ls: 15, color: C.ink, alpha: ea(t, 23.6, 24.1) });
  }, { dim });
}

function sceneModon(t) {
  logo('modon', CX, 435, 96, { alpha: ea(t, 26.43, 26.6), reveal: ea(t, 26.43, 27.05, E.out4), shine: prog(t, 27.05, 27.95) });
  const dim = 1;
  projectCard('hudayriyat', 540, 670, 760, 130, t, 26.9, { size: 46, dim, icon: 'flag' });
}

// -------------------------------------------------------------- 7b. THE TWO SALES FIGURES
function sceneStat5(t) {
  bigNumber(t, { aed: 'AED', overT: 24.46, aedT: 24.62, val: 5, dec: 0, fin: '5', suffix: 'B+', a0: 24.72, a1: 25.4, y: 640, sc: 0.95 });
  wordRow(['IN SALES', 'COMBINED'], [25.45, 25.85], 830, t, { colors: [C.ink, C.gold], ls: 14, size: 30 });
}
function sceneStat13(t) {
  bigNumber(t, { aed: 'AED', overT: 27.94, aedT: 28.05, val: 13, dec: 0, fin: '13', suffix: 'B+', a0: 28.19, a1: 28.95, y: 640, sc: 0.95 });
  wordRow(['IN SALES', 'WITHIN DAYS', 'OF LAUNCH'], [28.9, 29.28, 29.95], 830, t, { colors: [C.ink, C.gold, C.ink], ls: 12, size: 28, gap: 26 });
}

// ------------------------------------------------------------ 8. WHAT TO LOOK FOR
function sceneCriteria(t) {
  label('WHAT TO LOOK FOR', CX, 440, t, 31.4, { ls: 18, size: 24 });
  const eh = enter(t, 32.74, 0.6, 30);
  T('properties with', CX, 540 + eh.dy, { font: F.i(104), color: C.ink, alpha: eh.a });
  const rows = [
    ['tag', 'Competitive', 'entry prices', 33.47],
    ['house', 'Strong', 'rental demand', 34.92],
    ['chart', 'Long-term', 'appreciation', 36.22],
  ];
  rows.forEach(([ic, a, b, t0], i) => {
    const y = 720 + i * 165, nextT = rows[i + 1] ? rows[i + 1][3] : 99;
    const act = ea(t, t0, t0 + 0.6, E.out4), old = ea(t, nextT, nextT + 0.5), op = lerp(1, 0.5, old);
    if (act <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= op;
    icon(ic, 150, y, 34, { p: ea(t, t0 + 0.1, t0 + 0.7), color: C.gold, w: 3.4 });
    ctx.save(); ctx.beginPath(); ctx.rect(240, y - 90, 760 * act, 190); ctx.clip();
    const dy = (1 - act) * 22;
    T(a, 252, y + 4 + dy, { font: F.d(500, 70), ls: -2, align: 'left', color: C.ink });
    T(b, 252, y + 66 + dy, { font: F.i(64), align: 'left', color: C.gold });
    ctx.restore(); ctx.restore();
  });
}

// ---------------------------------------------------------------- 10. CTA
function sceneCTA(t) {
  const send = 45.53;
  const sh = ea(t, send, send + 0.8, E.inOut3);
  const ce = ea(t, 42.3, 43.0, E.out4);
  const cw = 700, ch = 440;
  // shortlist card: stays as the hero, tucks up a little once the DM goes out
  ctx.save();
  ctx.translate(CX, lerp(660, 630, sh)); const sc = lerp(1, 0.94, sh); ctx.scale(sc, sc);
  ctx.globalAlpha *= ce; ctx.translate(0, (1 - ce) * 50);
  glow(0, 0, 520, '233,196,124', 0.10 * sh);
  rr(-cw / 2, -ch / 2, cw, ch, 34); ctx.fillStyle = 'rgba(243,239,230,0.045)'; ctx.fill();
  ctx.strokeStyle = sh > 0.01 ? `rgba(233,196,124,${0.24 + 0.5 * sh})` : 'rgba(243,239,230,0.24)'; ctx.lineWidth = 2; ctx.stroke();
  T('SHORTLIST', -cw / 2 + 48, -ch / 2 + 86, { font: F.d(700, 34), ls: 16, color: C.gold, align: 'left' });
  line(-cw / 2 + 48, -ch / 2 + 118, cw / 2 - 48, -ch / 2 + 118, { color: C.faint, w: 1.5 });
  const widths = [0.78, 0.62, 0.7, 0.5];
  for (let i = 0; i < 4; i++) {
    const y = -ch / 2 + 150 + i * 74, a0 = 42.94 + i * 0.22, e = ea(t, a0, a0 + 0.45, E.out4);
    ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 16);
    rr(-cw / 2 + 48, y - 21, 42, 42, 12); ctx.strokeStyle = C.mute; ctx.lineWidth = 2; ctx.stroke();
    const g = ctx.createLinearGradient(-cw / 2 + 120, 0, cw / 2 - 48, 0); g.addColorStop(0, 'rgba(243,239,230,0.5)'); g.addColorStop(1, 'rgba(243,239,230,0.06)');
    rr(-cw / 2 + 120, y - 11, (cw - 168) * widths[i], 22, 11); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    const ct = 44.1 + i * 0.16, cf = ea(t, ct, ct + 0.3, E.out3);
    if (cf > 0) { rr(-cw / 2 + 48, y - 21, 42, 42, 12); ctx.save(); ctx.globalAlpha *= cf; ctx.fillStyle = C.goldSoft; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
      icon('check', -cw / 2 + 69, y, 11, { p: ea(t, ct + 0.05, ct + 0.35), color: C.gold, w: 3.4 }); }
  }
  ctx.restore();
  // chat
  const iy = 1190, ia = ea(t, 44.9, 45.4, E.out4);
  ctx.save(); ctx.globalAlpha *= ia; ctx.translate(0, (1 - ia) * 30);
  rr(CX - 400, iy - 52, 800, 104, 52); ctx.fillStyle = 'rgba(243,239,230,0.05)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.22)'; ctx.lineWidth = 2; ctx.stroke();
  const msg = 'Shortlist'; const typed = Math.floor(msg.length * ea(t, 45.06, 45.5, E.lin) + 0.0001);
  const sent = ea(t, send, send + 0.35);
  T(msg.slice(0, typed), CX - 350, iy + 13, { font: F.t(500, 36), color: C.ink, align: 'left', alpha: 1 - sent });
  if (t < send) { const cur = (Math.floor(t * 2.4) % 2 === 0) ? 1 : 0.15; const cw2 = M(msg.slice(0, typed), F.t(500, 36)); line(CX - 350 + cw2 + 6, iy - 22, CX - 350 + cw2 + 6, iy + 22, { color: C.gold, w: 3, alpha: cur }); }
  T('Message…', CX - 350, iy + 13, { font: F.t(500, 36), color: C.mute, align: 'left', alpha: (1 - ea(t, 45.06, 45.12)) * 0.9 * (1 - sent) });
  dot(CX + 340, iy, 38, C.gold, 1); icon('plane', CX + 340, iy, 17, { p: 1, color: '#0A0A0B', w: 3.4, rot: -0.5 + 0.5 * sent });
  const rp = prog(t, send, send + 0.8); ring(CX + 340, iy, 38 + 110 * E.out3(rp), { color: C.gold, w: 3, alpha: rp > 0 ? (1 - rp) * 0.9 : 0 });
  ctx.restore();
  // bubbles
  const b1 = ea(t, send, send + 0.5, E.out4);
  if (b1 > 0.002) {
    ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 40);
    rr(740, 905, 250, 78, 39); ctx.fillStyle = C.gold; ctx.fill();
    T('Shortlist', 865, 956, { font: F.t(600, 32), color: '#0A0A0B' });
    ctx.restore();
  }
  const b2 = ea(t, send + 0.55, send + 1.05, E.out4);
  if (b2 > 0.002) {
    ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 40);
    rr(90, 1002, 560, 100, 34); ctx.fillStyle = 'rgba(243,239,230,0.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.22)'; ctx.lineWidth = 2; ctx.stroke();
    icon('check', 150, 1052, 18, { p: ea(t, send + 0.8, send + 1.2), color: C.gold, w: 3.4 });
    T('My shortlist', 195, 1064, { font: F.t(600, 34), color: C.ink, align: 'left' });
    ctx.restore();
  }
}

// Graphics-only beats (the full-face beats use the overlays below).
// box = [top, bottom] of the content in its own coordinates; main.js centres it on the screen.
const SCENES = [
  { id: 'outdated', a: 5.62, b: 8.95, fn: sceneOutdated, box: [420, 980] },
  { id: 'mubadala', a: 8.95, b: 11.77, fn: sceneMubadala, box: [380, 1100] },
  { id: 'bars', a: 11.77, b: 13.86, fn: sceneBars, box: [490, 900] },
  { id: 'adia', a: 13.86, b: 16.21, fn: sceneAdia, box: [380, 1090] },
  { id: 'ecosystem', a: 16.21, b: 21.91, fn: sceneEcosystem, box: [380, 1160] },
  { id: 'aldar', a: 21.91, b: 24.46, fn: sceneAldar, box: [385, 830] },
  { id: 'stat5', a: 24.46, b: 26.26, fn: sceneStat5, box: [420, 880] },
  { id: 'modon', a: 26.26, b: 28.19, fn: sceneModon, box: [380, 740] },
  { id: 'stat13', a: 28.19, b: 31.3, fn: sceneStat13, box: [420, 880] },
  { id: 'criteria', a: 31.3, b: 37.9, fn: sceneCriteria, box: [410, 1130] },
  { id: 'cta', a: 42.2, b: 46.72, fn: sceneCTA, box: [420, 1250], last: true },
];

// ===================================================================================
// Full-face overlays (drawn in screen coordinates over the footage)
// ===================================================================================
const segA = (t, a, b, i = 0.25, o = 0.25) => ea(t, a, a + i) * (1 - ea(t, b - o, b));

function ovOutdated(t) {                      // "...an OUTDATED argument."  stamp slams in on the word
  const A = segA(t, 4.6, 5.7, 0.2, 0.25); if (A <= 0.003) return;
  const p = ea(t, 4.86, 5.16, E.out5), a = ea(t, 4.86, 5.0, E.out2);
  ctx.save(); ctx.globalAlpha *= A * a; ctx.translate(CX, 1120); ctx.rotate(-0.07); ctx.scale(lerp(1.9, 1, p), lerp(1.9, 1, p));
  const f = F.d(800, 78), sw = M('OUTDATED', f, 14) + 80;
  ctx.fillStyle = 'rgba(8,8,10,0.62)'; rr(-sw / 2, -68, sw, 136, 16); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 6; rr(-sw / 2, -68, sw, 136, 16); ctx.stroke();
  ctx.lineWidth = 2; rr(-sw / 2 + 12, -56, sw - 24, 112, 10); ctx.stroke();
  T('OUTDATED', 0, 28, { font: f, ls: 14, color: C.gold });
  ctx.restore();
  const rp = prog(t, 4.86, 5.5); if (rp > 0 && rp < 1) ring(CX, 1120, 40 + 520 * E.out3(rp), { color: C.gold, w: 4, alpha: (1 - rp) * 0.7 * A });
}

function ovBigger(t) {                        // oil is a dot; the economy is the ring that grows past it
  const A = segA(t, 37.9, 42.2, 0.25, 0.3); if (A <= 0.003) return;
  const cy = 1030;
  ctx.save(); ctx.globalAlpha *= A;
  const gr = ea(t, 40.0, 41.9, E.out4), R2 = 50 + 760 * gr, ga = ea(t, 39.95, 40.3) * (1 - 0.6 * prog(R2, 480, 800));
  if (ga > 0.002) ring(CX, cy, R2, { color: C.gold, w: 4, alpha: ga });
  const oa = ea(t, 37.96, 38.5, E.out4), pulse = 1 + 0.35 * Math.sin(Math.PI * clamp((t - 38.57) / 0.5)) + 0.4 * Math.sin(Math.PI * clamp((t - 41.43) / 0.5));
  ctx.fillStyle = 'rgba(8,8,10,0.55)'; ctx.beginPath(); ctx.arc(CX, cy, 74, 0, 7); ctx.globalAlpha *= oa; ctx.fill(); ctx.globalAlpha /= Math.max(oa, 1e-3);
  ring(CX, cy, 44, { color: C.ink, w: 3, alpha: 0.95 * oa, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * oa });
  dot(CX, cy, 13 * pulse, C.ink, oa);
  T('OIL', CX, cy + 112, { font: F.t(700, 26), ls: 16, color: C.ink, alpha: oa });
  ctx.restore();
}
