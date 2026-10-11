'use strict';
// ---------------------------------------------------------------------------
// Scenes. Every function takes absolute time `t` (seconds) and draws a single
// hero visual in the 380..1180 px band; captions live below it.
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

// ---------------------------------------------------------------- 1. QUESTION (overlay on full-screen footage)
const CHART_BR = 0.52;
function chartPt(u) {
  const x = lerp(90, 990, u);
  const wob = k => 34 * Math.sin(k * 34) + 22 * Math.sin(k * 71 + 1.3) + 12 * Math.sin(k * 13);
  if (u <= CHART_BR) return [x, 770 - 80 * (u / CHART_BR) + wob(u)];
  const y0 = 770 - 80 + wob(CHART_BR), v = (u - CHART_BR) / (1 - CHART_BR);
  const drop = 1 - Math.pow(1 - v, 2.6);
  return [x, y0 + (1110 - y0) * drop - (v > 0.5 ? 26 * Math.sin((v - 0.5) * 18) * Math.pow(1 - v, 2) : 0)];
}
const CHART = Array.from({ length: 481 }, (_, i) => chartPt(i / 480));
const qmap = ([x, y]) => [x, 975 + (y - 680) * 0.7];       // squeeze the chart into the band over the table
function questionOverlay(t, A) {
  if (A <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= A;
  const ia = ea(t, 0.1, 0.7), dimQ = 1 - 0.8 * ea(t, 2.5, 3.1);
  icon('drop', 112, 925, 22, { p: ea(t, 0.1, 0.8, E.out2), w: 3, alpha: ia * dimQ });
  T('OIL PRICE', 150, 934, { font: F.t(600, 21), ls: 8, color: C.ink, align: 'left', alpha: ia * dimQ * 0.85 });
  for (let k = 0; k < 4; k++) line(90, 990 + k * 75, 990, 990 + k * 75, { color: 'rgba(243,239,230,0.16)', w: 1, dash: [2, 10], alpha: ia * dimQ });
  const u = t < 1.38 ? CHART_BR * ea(t, 0.12, 1.38, E.lin) : CHART_BR + (1 - CHART_BR) * ea(t, 1.38, 2.15, E.out3);
  const n = Math.floor(u * 480), pts = CHART.slice(0, n + 1).map(qmap); pts.push(qmap(chartPt(u)));
  if (pts.length > 1) {
    const crash = t > 1.38;
    glowLine(pts, dimQ);
    strokePoly(pts, 1, { color: C.ink, w: 6, alpha: dimQ });
    const hd = pts[pts.length - 1];
    glow(hd[0], hd[1], 90, '243,239,230', 0.25 * dimQ);
    dot(hd[0], hd[1], 9, crash ? C.gold : C.ink, dimQ);
    if (crash) {
      const bp = qmap(chartPt(CHART_BR)), rp = prog(t, 1.38, 2.0);
      ring(bp[0], bp[1], 20 + 190 * E.out3(rp), { color: C.gold, w: 3, alpha: (1 - rp) * 0.85 });
      ring(bp[0], bp[1], 20 + 110 * E.out3(clamp(rp * 1.3)), { color: C.ink, w: 2, alpha: (1 - rp) * 0.5 });
    }
  }
  label('TOMORROW', 905, 1262, t, 1.74, { ls: 12, size: 20, color: C.ink, alpha: dimQ * 0.7 });
  // the question mark: a gold outline that fills in, over his chest
  const qa = ea(t, 2.55, 3.3, E.out3), qs = lerp(0.86, 1, ea(t, 2.55, 3.6, E.out5)), pulse = 1 + 0.012 * Math.sin(t * 2.4);
  if (qa > 0.003) {
    glow(CX, 1130, 380, '233,196,124', 0.14 * qa);
    ctx.save(); ctx.translate(CX + 6, 1250); ctx.scale(qs * pulse, qs * pulse); ctx.font = F.i(430); ctx.textAlign = 'center';
    ctx.globalAlpha *= qa; ctx.fillStyle = 'rgba(233,196,124,0.16)'; ctx.fillText('?', 0, 0);
    ctx.lineWidth = 4; ctx.strokeStyle = C.gold; ctx.lineJoin = 'round'; ctx.strokeText('?', 0, 0); ctx.restore();
  }
  ctx.restore();
}
function glowLine(pts, a) {   // soft halo under the price line so it reads over the footage
  if (a <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= 0.28 * a; strokePoly(pts, 1, { color: C.ink, w: 16 }); ctx.restore();
}

// ------------------------------------------------------------- 2. "OUTDATED"
function sceneOutdated(t) {
  const o1 = ea(t, 4.55, 5.05, E.out4), x1 = ea(t, 5.5, 5.95, E.inOut2);
  const a1 = o1 * (1 - x1);
  if (a1 > 0.002) {
    const ty = 760 - x1 * 60 + (1 - o1) * 30;
    T('THE OLD ARGUMENT', CX, 570 + (1 - o1) * 20 - x1 * 30, { font: F.t(600, 22), ls: 14, color: C.dim, alpha: a1 });
    const dimK = 1 - 0.5 * ea(t, 5.25, 5.55);
    const w = M('An oil economy', F.i(176));
    T('An oil economy', CX, ty, { font: F.i(176), color: C.ink, alpha: a1 * dimK });
    const sp = ea(t, 4.86, 5.2, E.out4);
    line(CX - w / 2 - 24, ty - 56, CX - w / 2 - 24 + (w + 48) * sp, ty - 56, { color: C.gold, w: 8, alpha: a1 });
    // stamp on "argument"
    const sA = ea(t, 5.2, 5.38, E.out2), sK = lerp(1.7, 1, ea(t, 5.2, 5.5, E.out5));
    ctx.save(); ctx.translate(CX + 150, ty + 150 - x1 * 20); ctx.rotate(-0.06); ctx.scale(sK, sK);
    ctx.globalAlpha *= sA * a1;
    const sw = M('OUTDATED', F.d(700, 54), 12) + 56;
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; rr(-sw / 2, -50, sw, 100, 10); ctx.stroke();
    ctx.lineWidth = 1.5; rr(-sw / 2 + 9, -41, sw - 18, 82, 6); ctx.stroke();
    T('OUTDATED', 0, 19, { font: F.d(700, 54), ls: 12, color: C.gold });
    ctx.restore();
  }
  // decades timeline
  const tl = ea(t, 5.85, 8.55, E.inOut2), tla = ea(t, 5.85, 6.4);
  const ly = 585;
  line(90, ly, 990, ly, { color: C.faint, w: 1.5, alpha: tla });
  if (tl > 0) {
    const L = 900 * tl;
    line(90, ly, 90 + L, ly, { color: C.ink, w: 2.5, alpha: tla * 0.9 });
    for (let i = 0; i <= 30; i++) {
      const x = 90 + i * 30; if (x > 90 + L) break;
      const big = i % 5 === 0, tp = ea(t, 5.85 + i * 0.09, 5.85 + i * 0.09 + 0.3, E.out3);
      line(x, ly, x, ly - (big ? 30 : 14) * tp, { color: big ? C.ink : C.mute, w: big ? 2.5 : 1.5, alpha: tla });
    }
    glow(90 + L, ly, 60, '233,196,124', 0.35 * tla); dot(90 + L, ly, 8, C.gold, tla);
  }
  label('DECADES', 90, 520, t, 6.8, { align: 'left', ls: 16, color: C.gold, size: 24 });
  // lockup
  const f1 = F.d(300, 118); const wB = M('Building', f1, -3), wW = M('wealth', F.d(600, 118), -3), sp = M(' ', f1);
  const tot = wB + sp + wW; let x = CX - tot / 2;
  const eB = enter(t, 7.27, 0.6, 46), eW = enter(t, 7.65, 0.6, 46);
  T('Building', x + wB / 2, 805 + eB.dy, { font: f1, ls: -3, alpha: eB.a });
  T('wealth', x + wB + sp + wW / 2, 805 + eW.dy, { font: F.d(600, 118), ls: -3, alpha: eW.a });
  const fb = F.i(200); const wby = M('beyond', fb), wo = M('oil.', fb), spb = M(' ', fb);
  const tot2 = wby + spb + wo; const s2 = Math.min(1, 900 / tot2); const xb = CX - (tot2 * s2) / 2;
  const eY = enter(t, 8.13, 0.7, 60);
  T('beyond', xb + (wby * s2) / 2, 1020 + eY.dy, { font: fb, color: C.gold, alpha: eY.a, sx: s2 });
  const eO = ea(t, 8.59, 8.95, E.out5), oa = ea(t, 8.59, 8.75, E.out2);
  T('oil.', xb + (wby + spb) * s2 + (wo * s2) / 2, 1020, { font: fb, color: C.ink, alpha: oa, sx: s2 * lerp(1.35, 1, eO), sy: s2 * lerp(1.35, 1, eO) });
  for (let k = 0; k < 3; k++) {
    const rp = prog(t, 8.59 + k * 0.1, 9.35 + k * 0.1);
    ring(xb + (wby + spb) * s2 + (wo * s2) / 2, 975, 40 + 520 * E.out3(rp), { color: C.gold, w: 2.5, alpha: (1 - rp) * 0.6 * (rp > 0 ? 1 : 0) });
  }
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
  const hw = 460 * ea(t, 9.25, 9.95, E.out4); line(CX - hw / 2, 540, CX + hw / 2, 540, { color: C.mute, w: 1.5 });
  const sh = ea(t, 11.77, 12.5, E.inOut3);
  ctx.save(); ctx.translate(CX, lerp(880, 735, sh)); const sc = lerp(1, 0.6, sh); ctx.scale(sc, sc);
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
  // comparison bars
  const BX0 = 90, BW = 900, by1 = 1030, by2 = 1150;
  const e1 = enter(t, 11.88, 0.5, 20), e2 = enter(t, 12.2, 0.5, 20);
  T('MUBADALA', BX0, by1 - 30 + e1.dy, { font: F.t(600, 22), ls: 10, color: C.dim, align: 'left', alpha: e1.a });
  T('AED 1.4T', BX0 + BW, by1 - 30 + e1.dy, { font: F.t(600, 22), ls: 10, color: C.gold, align: 'right', alpha: e1.a });
  T('PORTUGAL · ANNUAL GDP', BX0, by2 - 30 + e2.dy, { font: F.t(600, 22), ls: 10, color: C.dim, align: 'left', alpha: e2.a });
  rr(BX0, by1, BW, 16, 8); ctx.save(); ctx.globalAlpha *= e1.a; ctx.fillStyle = C.faint; ctx.fill(); ctx.restore();
  rr(BX0, by2, BW, 16, 8); ctx.save(); ctx.globalAlpha *= e2.a; ctx.fillStyle = C.faint; ctx.fill(); ctx.restore();
  const b1 = ea(t, 11.95, 12.65, E.out4), b2 = ea(t, 12.25, 13.0, E.out4), pw = 0.78;
  if (b1 > 0.002) { rr(BX0, by1, BW * b1, 16, 8); ctx.fillStyle = C.gold; ctx.fill(); glow(BX0 + BW * b1, by1 + 8, 70, '233,196,124', 0.25); }
  if (b2 > 0.002) { rr(BX0, by2, BW * pw * b2, 16, 8); ctx.save(); ctx.fillStyle = 'rgba(243,239,230,0.7)'; ctx.fill(); ctx.restore(); }
  // "more than" bracket
  const bk = ea(t, 13.15, 13.7, E.out4), xm = BX0 + BW * pw;
  if (bk > 0) {
    line(xm, by1 - 14, xm, by2 + 30, { color: C.gold, w: 2, dash: [5, 6], alpha: bk });
    T('MORE THAN', xm + 12 + (BX0 + BW - xm - 12) / 2, by2 + 54, { font: F.t(600, 21), ls: 12, color: C.gold, alpha: bk });
  }
}

// -------------------------------------------------------------------- 4. ADIA
function sceneAdia(t) {
  const lp = ea(t, 13.86, 14.5, E.out4);
  logo('adia', CX, 435, 104, { alpha: ea(t, 13.86, 14.1), reveal: lp, shine: prog(t, 14.3, 15.2) });
  const hw = 520 * ea(t, 14.1, 14.8, E.out4); line(CX - hw / 2, 560, CX + hw / 2, 560, { color: C.mute, w: 1.5 });
  label('ESTIMATED', CX, 618, t, 14.65, { ls: 18, color: C.dim, size: 22 });
  const cy = 945, R = 222;
  const ra = ea(t, 14.35, 15.2, E.out3);
  const fill = ea(t, 15.19, 16.1, E.out3);
  ring(CX, cy, R, { color: C.faint, w: 2, alpha: ra, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * ra });
  for (let i = 0; i < 72; i++) {
    const a = -Math.PI / 2 + (i / 72) * Math.PI * 2, lit = (i / 72) < fill;
    const tp = ea(t, 14.5 + i * 0.006, 14.9 + i * 0.006, E.out3);
    ctx.save(); ctx.strokeStyle = lit ? C.gold : C.mute; ctx.globalAlpha *= tp * (lit ? 1 : 0.6); ctx.lineWidth = lit ? 3 : 1.5;
    ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * (R + 26), cy + Math.sin(a) * (R + 26)); ctx.lineTo(CX + Math.cos(a) * (R + (i % 6 === 0 ? 50 : 42)), cy + Math.sin(a) * (R + (i % 6 === 0 ? 50 : 42))); ctx.stroke(); ctx.restore();
  }
  if (fill > 0.001) {
    ring(CX, cy, R, { color: C.gold, w: 6, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * fill });
    const ha = -Math.PI / 2 + Math.PI * 2 * fill; glow(CX + Math.cos(ha) * R, cy + Math.sin(ha) * R, 90, '233,196,124', 0.4); dot(CX + Math.cos(ha) * R, cy + Math.sin(ha) * R, 9, C.gold);
  }
  ctx.save(); ctx.translate(CX, cy + 36); ctx.scale(0.66, 0.66);
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
  label('INVESTING IN', CX, 455, t, 16.21, { ls: 20, size: 22 });
  const P = [['AI', 305, 560, 16.84], ['TECHNOLOGY', 775, 560, 17.32], ['INFRASTRUCTURE', 305, 685, 17.78], ['BUSINESSES', 775, 685, 18.33]];
  const NODE = [CX, 835];
  P.forEach(([s, x, y, a], i) => {   // skeleton outlines first, then each fills as its word is spoken
    const g = ea(t, 16.3 + i * 0.1, 16.75 + i * 0.1) * (1 - ea(t, a, a + 0.25));
    if (g > 0.003) { ctx.save(); ctx.globalAlpha *= g * 0.5; rr(x - 225, y - 46, 450, 92, 46); ctx.strokeStyle = C.mute; ctx.lineWidth = 2; ctx.setLineDash([3, 9]); ctx.stroke(); ctx.restore(); }
    pill(s, x, y, 450, 92, t, a, { size: s.length > 11 ? 27 : 30, ls: s.length > 11 ? 7 : 10 });
  });
  // converge lines + travelling pulses
  P.forEach(([s, x, y, a], i) => {
    const path = [[x, y + 46], [x, 765], [NODE[0], NODE[1] - 20]];
    const lp = ea(t, 18.84 + i * 0.06, 19.4 + i * 0.06, E.out3);
    strokePoly(path, lp, { color: C.mute, w: 2 });
    if (t > 19.3) {
      const u = ((t - 19.3) * 0.7 + i * 0.25) % 1; const L = polyLen(path); let d = u * L, p0 = path[0];
      for (let k = 1; k < path.length; k++) { const sg = Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]); if (d <= sg) { const f = d / sg; dot(lerp(path[k - 1][0], path[k][0], f), lerp(path[k - 1][1], path[k][1], f), 5, C.gold, 0.9 * Math.sin(Math.PI * u)); break; } d -= sg; }
    }
  });
  const na = ea(t, 18.84, 19.3, E.back);
  glow(NODE[0], NODE[1], 150, '233,196,124', 0.28 * na * (0.8 + 0.2 * Math.sin(t * 4)));
  ring(NODE[0], NODE[1], 24 * na, { color: C.gold, w: 3 }); dot(NODE[0], NODE[1], 8 * na, C.gold);
  // outputs
  const O = [['COMPANIES', 'building', 195, 19.13], ['JOBS', 'briefcase', 540, 20.11], ['HOUSING|DEMAND', 'house', 885, 20.87]];
  O.forEach(([s, ic, x, a], i) => {
    const path = [[NODE[0], NODE[1] + 22], [NODE[0], 905], [x, 905], [x, 960]];
    const lp = ea(t, a - 0.45, a + 0.05, E.out3);
    strokePoly(path, lp, { color: C.mute, w: 2 });
    const e = ea(t, a, a + 0.6, E.out4), isH = i === 2;
    const cy = 1040, hot = isH ? ea(t, a + 0.3, a + 0.8) : 0;
    ring(x, cy, 70, { color: isH ? C.gold : C.ink, w: 2.5, alpha: 0.9, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * e });
    if (isH) glow(x, cy, 190, '233,196,124', 0.22 * hot);
    icon(ic, x, cy, 30, { p: ea(t, a + 0.1, a + 0.7, E.out3), color: isH ? C.gold : C.ink, w: 3.2 });
    const parts = s.split('|'); const ee = enter(t, a + 0.2, 0.5, 14);
    parts.forEach((pt, k) => T(pt, x, 1158 + k * 30 + ee.dy, { font: F.t(600, 22), ls: 9, color: isH ? C.gold : C.dim, alpha: ee.a }));
    if (isH) { // demand badge: gold dot with an up arrow
      const g = ea(t, a + 0.5, a + 1.0, E.back);
      ctx.save(); ctx.translate(x + 56, cy - 56); ctx.scale(g, g);
      dot(0, 0, 25, C.gold); icon('up', 0, 0, 11, { p: 1, color: '#0A0A0B', w: 3.4 }); ctx.restore();
    }
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
  ctx.save(); ctx.translate(CX, o.y); ctx.scale(0.8, 0.8);
  const e0 = enter(t, o.overT, 0.5, 18);
  const f = F.t(600, 38), wo = M('OVER', f, 18), wa = M(o.aed, f, 18), g = 30, tt = wo + g + wa;
  T('OVER', -tt / 2 + wo / 2, -205 + e0.dy, { font: f, ls: 18, color: C.dim, alpha: e0.a });
  const e1 = enter(t, o.aedT, 0.5, 18);
  T(o.aed, -tt / 2 + wo + g + wa / 2, -205 + e1.dy, { font: f, ls: 18, color: C.gold, alpha: e1.a });
  counterGroup(t, { val: o.val, dec: o.dec, fin: o.fin, suffix: o.suffix, a0: o.a0, a1: o.a1 });
  ctx.restore();
}

function sceneAldar(t) {
  logo('aldar', CX, 435, 96, { alpha: ea(t, 22.29, 22.5), reveal: ea(t, 22.29, 22.95, E.out4), shine: prog(t, 22.9, 23.8) });
  const hw = 420 * ea(t, 22.5, 23.1, E.out4); line(CX - hw / 2, 545, CX + hw / 2, 545, { color: C.mute, w: 1.5 });
  const dim = 1 - 0.45 * ea(t, 24.46, 24.9);
  branch(t, 22.55, 22.9, 300, 565, 580, 572); branch(t, 23.05, 23.4, 780, 565, 580, 572);
  projectTile(300, 700, 440, 240, t, 22.85, r => { logo('talay', 0, 4, 0, { fitH: 196, reveal: r }); }, { dim });
  projectTile(780, 700, 440, 240, t, 23.36, r => {
    logo('yas', 0, -28, 0, { fitH: 122, reveal: r });
    T('RIVA RESERVE', 0, 78, { font: F.d(600, 27), ls: 15, color: C.ink, alpha: ea(t, 23.6, 24.1) });
  }, { dim });
  bigNumber(t, { aed: 'AED', overT: 24.46, aedT: 24.62, val: 5, dec: 0, fin: '5', suffix: 'B+', a0: 24.72, a1: 25.4, y: 1042 });
  wordRow(['IN SALES', 'COMBINED'], [25.45, 25.85], 1190, t, { colors: [C.dim, C.gold], ls: 14, size: 24 });
}

function sceneModon(t) {
  logo('modon', CX, 435, 96, { alpha: ea(t, 26.43, 26.6), reveal: ea(t, 26.43, 27.05, E.out4), shine: prog(t, 27.05, 27.95) });
  const hw = 420 * ea(t, 26.6, 27.2, E.out4); line(CX - hw / 2, 545, CX + hw / 2, 545, { color: C.mute, w: 1.5 });
  const dim = 1 - 0.45 * ea(t, 27.94, 28.4);
  branch(t, 26.65, 27.0, 540, 565, 605, 585);
  projectCard('hudayriyat', 540, 670, 760, 130, t, 26.9, { size: 46, dim, icon: 'flag' });
  bigNumber(t, { aed: 'AED', overT: 27.94, aedT: 28.05, val: 13, dec: 0, fin: '13', suffix: 'B+', a0: 28.19, a1: 28.95, y: 1000 });
  wordRow(['IN SALES', 'WITHIN DAYS', 'OF LAUNCH'], [28.9, 29.28, 29.95], 1140, t, { colors: [C.dim, C.gold, C.dim], ls: 12, size: 22, gap: 26 });
  // days ticks fill fast
  const n = 9, sz = 34, gp = 16, rw = n * sz + (n - 1) * gp; const x0 = CX - rw / 2, ty = 1192;
  for (let i = 0; i < n; i++) {
    const a = ea(t, 29.2 + i * 0.03, 29.5 + i * 0.03), f = ea(t, 29.58 + i * 0.085, 29.58 + i * 0.085 + 0.2, E.out2);
    ctx.save(); ctx.globalAlpha *= a; rr(x0 + i * (sz + gp), ty, sz, sz, 8); ctx.strokeStyle = C.mute; ctx.lineWidth = 2; ctx.stroke();
    if (f > 0) { ctx.globalAlpha *= f; ctx.fillStyle = C.gold; rr(x0 + i * (sz + gp) + 5, ty + 5, sz - 10, sz - 10, 5); ctx.fill(); }
    ctx.restore();
  }
}

// ------------------------------------------------------------ 8. WHAT TO LOOK FOR
function sceneCriteria(t) {
  label('WHAT TO LOOK FOR', CX, 440, t, 31.4, { ls: 18, size: 22 });
  const eh = enter(t, 32.74, 0.6, 30);
  T('properties with', CX, 556 + eh.dy, { font: F.i(104), color: C.ink, alpha: eh.a });
  const rows = [
    ['tag', 'Competitive', 'entry prices', 33.47, 33.55],
    ['house', 'Strong', 'rental demand', 34.92, 35.05],
    ['chart', 'Long-term', 'appreciation', 36.22, 36.35],
  ];
  rows.forEach(([ic, a, b, t0, tc], i) => {
    const y = 735 + i * 190, nextT = rows[i + 1] ? rows[i + 1][3] : 99;
    const act = ea(t, t0, t0 + 0.6, E.out4), ghost = ea(t, 31.55 + i * 0.22, 32.1 + i * 0.22);
    const old = ea(t, nextT, nextT + 0.5), op = lerp(1, 0.5, old);
    ring(170, y, 56, { color: C.mute, w: 2, alpha: ghost * (1 - act) * 0.7 });
    T('0' + (i + 1), 262, y + 12, { font: F.i(46), color: C.mute, align: 'left', alpha: ghost * (1 - act) });
    ctx.save(); ctx.globalAlpha *= op;
    ring(170, y, 56, { color: C.gold, w: 3, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * act, alpha: 1 });
    if (act > 0) { glow(170, y, 140, '233,196,124', 0.16 * act * (1 - old)); }
    icon(ic, 170, y, 27, { p: ea(t, t0 + 0.1, t0 + 0.7), color: C.gold, w: 3.2 });
    // text with a clip wipe
    if (act > 0.01) {
    ctx.save(); ctx.beginPath(); ctx.rect(260, y - 90, 640 * act, 190); ctx.clip();
    const dy = (1 - act) * 22;
    T(a, 262, y + 4 + dy, { font: F.d(500, 70), ls: -2, align: 'left', color: C.ink });
    T(b, 262, y + 66 + dy, { font: F.i(64), align: 'left', color: C.gold });
    ctx.restore(); }
    // tick
    const tk = ea(t, tc + 0.35, tc + 0.9, E.out3);
    ring(944, y, 32, { color: C.gold, w: 2.5, alpha: 0.9, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * tk });
    icon('check', 944, y, 16, { p: ea(t, tc + 0.55, tc + 1.0), color: C.gold, w: 3.6 });
    ctx.restore();
  });
}

// ---------------------------------------------------- 9. BIGGER THAN OIL
function sceneBigger(t) {
  const cy = 800;
  const oa = ea(t, 37.96, 38.5, E.out4);
  // ripples from "but"
  for (let k = 0; k < 5; k++) {
    const rp = prog(t, 39.13 + k * 0.2, 39.13 + k * 0.2 + 2.6);
    ring(CX, cy, 50 + 1100 * E.out3(rp), { color: C.ink, w: 1.5, alpha: rp > 0 ? 0.32 * (1 - rp) : 0 });
  }
  // the big economy ring
  const gr = ea(t, 40.0, 41.9, E.out4), R2 = 50 + 760 * gr, ga = ea(t, 39.95, 40.3) * (1 - 0.75 * prog(R2, 480, 800));
  if (ga > 0.002) {
    glow(CX, cy, R2 * 1.25, '233,196,124', 0.2 * ga);
    ring(CX, cy, R2, { color: C.gold, w: 3, alpha: ga });
    ring(CX, cy, R2 * 0.72, { color: C.gold, w: 1.5, alpha: ga * 0.35 });
    ring(CX, cy, R2 * 0.46, { color: C.gold, w: 1.5, alpha: ga * 0.25 });
  }
  // the oil dot
  const pulse = 1 + 0.35 * Math.sin(Math.PI * clamp((t - 38.57) / 0.5)) + 0.4 * Math.sin(Math.PI * clamp((t - 41.43) / 0.5));
  ring(CX, cy, 44, { color: C.ink, w: 2.5, alpha: 0.9, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * oa });
  dot(CX, cy, 13 * pulse, C.ink, oa);
  T('OIL', CX, cy + 100, { font: F.t(600, 24), ls: 16, color: C.ink, alpha: oa * 0.85 });
  label('ABU DHABI ECONOMY', CX, 520, t, 40.0, { ls: 18, color: C.gold, size: 24 });
  label('TODAY', CX, cy + 150, t, 41.77, { ls: 22, color: C.gold, size: 22 });
}

// ---------------------------------------------------------------- 10. CTA
function sceneCTA(t) {
  const send = 45.53;
  const sh = ea(t, send, send + 0.8, E.inOut3);
  const ce = ea(t, 42.3, 43.0, E.out4);
  const cw = 700, ch = 480;
  // shortlist card: stays as the hero, tucks up a little once the DM goes out
  ctx.save();
  ctx.translate(CX, lerp(690, 640, sh)); const sc = lerp(1, 0.92, sh); ctx.scale(sc, sc);
  ctx.globalAlpha *= ce; ctx.translate(0, (1 - ce) * 50);
  glow(0, 0, 520, '233,196,124', 0.10 * sh);
  rr(-cw / 2, -ch / 2, cw, ch, 34); ctx.fillStyle = 'rgba(243,239,230,0.045)'; ctx.fill();
  ctx.strokeStyle = sh > 0.01 ? `rgba(233,196,124,${0.24 + 0.5 * sh})` : 'rgba(243,239,230,0.24)'; ctx.lineWidth = 2; ctx.stroke();
  T('SHORTLIST', -cw / 2 + 48, -ch / 2 + 86, { font: F.d(700, 34), ls: 16, color: C.gold, align: 'left' });
  T('ABU DHABI', cw / 2 - 48, -ch / 2 + 86, { font: F.t(600, 20), ls: 12, color: C.dim, align: 'right' });
  line(-cw / 2 + 48, -ch / 2 + 118, cw / 2 - 48, -ch / 2 + 118, { color: C.faint, w: 1.5 });
  const widths = [0.78, 0.62, 0.7, 0.5];
  for (let i = 0; i < 4; i++) {
    const y = -ch / 2 + 182 + i * 82, a0 = 42.94 + i * 0.22, e = ea(t, a0, a0 + 0.45, E.out4);
    ctx.save(); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 16);
    rr(-cw / 2 + 48, y - 21, 42, 42, 12); ctx.strokeStyle = C.mute; ctx.lineWidth = 2; ctx.stroke();
    const g = ctx.createLinearGradient(-cw / 2 + 120, 0, cw / 2 - 48, 0); g.addColorStop(0, 'rgba(243,239,230,0.5)'); g.addColorStop(1, 'rgba(243,239,230,0.06)');
    rr(-cw / 2 + 120, y - 11, (cw - 168) * widths[i], 22, 11); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    const ct = 44.1 + i * 0.16, cf = ea(t, ct, ct + 0.3, E.out3);
    if (cf > 0) { rr(-cw / 2 + 48, y - 21, 42, 42, 12); ctx.save(); ctx.globalAlpha *= cf; ctx.fillStyle = C.goldSoft; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
      icon('check', -cw / 2 + 69, y, 11, { p: ea(t, ct + 0.05, ct + 0.35), color: C.gold, w: 3.4 }); }
  }
  // SENT stamp
  const st = ea(t, send + 0.55, send + 0.85, E.out5);
  if (st > 0.003) {
    ctx.save(); ctx.translate(cw / 2 - 118, ch / 2 - 22); ctx.rotate(-0.07); ctx.scale(lerp(1.5, 1, st), lerp(1.5, 1, st)); ctx.globalAlpha *= ea(t, send + 0.55, send + 0.7);
    const sw = M('SENT', F.d(700, 34), 10) + 70; rr(-sw / 2, -30, sw, 60, 10); ctx.fillStyle = 'rgba(8,8,10,0.85)'; ctx.fill(); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.stroke();
    T('SENT', 18, 12, { font: F.d(700, 34), ls: 10, color: C.gold });
    icon('check', -sw / 2 + 36, 0, 13, { p: ea(t, send + 0.65, send + 0.95), color: C.gold, w: 3.6 });
    ctx.restore();
  }
  ctx.restore();
  // chat
  const iy = 1170, ia = ea(t, 44.9, 45.4, E.out4);
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
    rr(740, 930, 250, 78, 39); ctx.fillStyle = C.gold; ctx.fill();
    T('Shortlist', 865, 981, { font: F.t(600, 32), color: '#0A0A0B' });
    ctx.restore();
  }
  const b2 = ea(t, send + 0.55, send + 1.05, E.out4);
  if (b2 > 0.002) {
    ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 40);
    rr(90, 1028, 560, 100, 34); ctx.fillStyle = 'rgba(243,239,230,0.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(243,239,230,0.22)'; ctx.lineWidth = 2; ctx.stroke();
    icon('check', 150, 1078, 18, { p: ea(t, send + 0.8, send + 1.2), color: C.gold, w: 3.4 });
    T('My shortlist', 195, 1090, { font: F.t(600, 34), color: C.ink, align: 'left' });
    ctx.restore();
  }
}

// box = [top, bottom] of each scene's content in its own coordinates; main.js centres it in the lower zone
const SCENES = [
  { id: 'outdated', a: 4.55, b: 8.95, fn: sceneOutdated, box: [500, 1075] },
  { id: 'mubadala', a: 8.95, b: 13.85, fn: sceneMubadala, box: [380, 1218] },
  { id: 'adia', a: 13.85, b: 16.21, fn: sceneAdia, box: [365, 1222] },
  { id: 'ecosystem', a: 16.21, b: 21.91, fn: sceneEcosystem, box: [440, 1205] },
  { id: 'aldar', a: 21.91, b: 26.26, fn: sceneAldar, box: [385, 1205] },
  { id: 'modon', a: 26.26, b: 31.3, fn: sceneModon, box: [380, 1238] },
  { id: 'criteria', a: 31.3, b: 37.9, fn: sceneCriteria, box: [425, 1200] },
  { id: 'bigger', a: 37.9, b: 42.2, fn: sceneBigger, box: [470, 1010] },
  { id: 'cta', a: 42.2, b: 46.72, fn: sceneCTA, box: [440, 1232], last: true },
];
