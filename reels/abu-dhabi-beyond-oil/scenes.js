'use strict';
// ---------------------------------------------------------------------------
// Scenes. One calm hero visual per beat, big type, plenty of air.  Every function takes absolute time `t` (seconds).
//   text scenes   drawn in their own coordinates; main.js centres the box on the screen
//   map scenes    full-screen satellite flyover (satmap.js) with traced island outlines, pins and a logo
//   photo cards   the developers' own renders (Aldar, Modon) with the figure underneath
// ---------------------------------------------------------------------------
const enter = (t, a, d = 0.55, dist = 36) => ({ a: ea(t, a, a + d * 0.75, E.out2), dy: (1 - ea(t, a, a + d, E.out4)) * dist });

function label(s, x, y, t, a, o = {}) {
  const e = enter(t, a, 0.5, 18);
  T(s, x, y + e.dy, { font: o.font || F.d(600, o.size || 52), ls: o.ls ?? 12, color: o.color || C.dim, alpha: e.a * (o.alpha ?? 1), align: o.align || 'center' });
}
// a row of words that light in sequentially, centered
function wordRow(words, times, y, t, o = {}) {
  const font = o.font || F.d(600, o.size || 56), ls = o.ls ?? 6;
  const ws = words.map(w => M(w, font, ls)); const gap = o.gap ?? 34;
  const k = times.map(tm => ea(t, tm, tm + 0.55, E.out4));
  const total = ws.reduce((a, w, i) => a + (w + gap) * k[i], 0) - gap * Math.max(...k);
  let x = (o.cx ?? CX) - total / 2;
  words.forEach((w, i) => {
    const e = enter(t, times[i], 0.45, 14);
    T(w, x + ws[i] / 2, y + e.dy, { font, ls, color: (o.colors && o.colors[i]) || C.ink, alpha: e.a });
    x += (ws[i] + gap) * k[i];
  });
}
function coverImg(im, x, y, w, h, o = {}) {
  const { fx = 0.5, fy = 0.5, zoom = 1 } = o, s = Math.max(w / im.width, h / im.height) * zoom, sw = w / s, sh = h / s;
  ctx.drawImage(im, clamp(fx * im.width - sw / 2, 0, im.width - sw), clamp(fy * im.height - sh / 2, 0, im.height - sh), sw, sh, x, y, w, h);
}
// the developers' own renders in a rounded card; several parts sit side by side
function photoCard(parts, x, y, w, h, t, a0) {
  const e = ea(t, a0, a0 + 0.6, E.out4), al = ea(t, a0, a0 + 0.35); if (al <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(0, (1 - e) * 40);
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; rr(x, y, w, h, 28); ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.save(); rr(x, y, w, h, 28); ctx.clip();
  const pw = w / parts.length;
  parts.forEach((p, i) => coverImg(p.img, x + i * pw, y, pw + (i < parts.length - 1 ? 1 : 0), h, { fx: p.fx, fy: p.fy ?? 0.5, zoom: 1.03 + 0.07 * prog(t, a0, a0 + 3.2) }));
  ctx.restore();
  for (let i = 1; i < parts.length; i++) line(x + i * pw, y, x + i * pw, y + h, { color: C.bg, w: 6 });
  ctx.strokeStyle = 'rgba(245,242,236,0.24)'; ctx.lineWidth = 2; rr(x, y, w, h, 28); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------- "Abu Dhabi has spent decades building wealth beyond oil."
function sceneBeyond(t) {
  const tla = ea(t, 5.85, 6.4), tl = ea(t, 5.85, 8.55, E.inOut2);
  line(90, 560, 90 + 900 * tl, 560, { color: C.gold, w: 4, alpha: tla * 0.9 });                       // a thin line draws across: decades
  const f1 = F.d(300, 132), f2 = F.d(600, 132), wB = M('Building', f1, -3), wW = M('wealth', f2, -3), sp = M(' ', f1);
  const x = CX - (wB + sp + wW) / 2, eB = enter(t, 7.27, 0.6, 46), eW = enter(t, 7.65, 0.6, 46);
  T('Building', x + wB / 2, 750 + eB.dy, { font: f1, ls: -3, alpha: eB.a });
  T('wealth', x + wB + sp + wW / 2, 750 + eW.dy, { font: f2, ls: -3, alpha: eW.a });
  const fb = F.i(220), wby = M('beyond', fb), wo = M('oil.', fb), spb = M(' ', fb), tot2 = wby + spb + wo, s2 = Math.min(1, 940 / tot2), xb = CX - (tot2 * s2) / 2;
  const eY = enter(t, 8.13, 0.7, 60);
  T('beyond', xb + (wby * s2) / 2, 990 + eY.dy, { font: fb, color: C.gold, alpha: eY.a, sx: s2 });
  const eO = ea(t, 8.59, 8.95, E.out5), oa = ea(t, 8.59, 8.75, E.out2);
  T('oil.', xb + (wby + spb) * s2 + (wo * s2) / 2, 990, { font: fb, color: C.ink, alpha: oa, sx: s2 * lerp(1.3, 1, eO), sy: s2 * lerp(1.3, 1, eO) });
}

// ---------------------------------------------------------------- Mubadala vs Portugal's GDP
function sceneBars(t) {
  const BX0 = 120, BW = 840, by1 = 620, by2 = 880, bh = 58;
  const e1 = enter(t, 11.88, 0.5, 20), e2 = enter(t, 12.2, 0.5, 20);
  T('MUBADALA', BX0, by1 - 30 + e1.dy, { font: F.d(700, 50), ls: 4, color: C.ink, align: 'left', alpha: e1.a });
  T('AED 1.4T', BX0 + BW, by1 - 30 + e1.dy, { font: F.d(700, 50), ls: 4, color: C.gold, align: 'right', alpha: e1.a });
  T("PORTUGAL'S ANNUAL GDP", BX0, by2 - 30 + e2.dy, { font: F.d(700, 44), ls: 3, color: C.ink, align: 'left', alpha: e2.a });
  rr(BX0, by1, BW, bh, bh / 2); ctx.save(); ctx.globalAlpha *= e1.a; ctx.fillStyle = 'rgba(245,242,236,0.12)'; ctx.fill(); ctx.restore();
  rr(BX0, by2, BW, bh, bh / 2); ctx.save(); ctx.globalAlpha *= e2.a; ctx.fillStyle = 'rgba(245,242,236,0.12)'; ctx.fill(); ctx.restore();
  const b1 = ea(t, 11.95, 12.65, E.out4), b2 = ea(t, 12.25, 13.0, E.out4), pw = 0.78;
  if (b1 > 0.002) { rr(BX0, by1, BW * b1, bh, bh / 2); ctx.fillStyle = C.gold; ctx.fill(); }
  if (b2 > 0.002) { rr(BX0, by2, BW * pw * b2, bh, bh / 2); ctx.fillStyle = 'rgba(245,242,236,0.86)'; ctx.fill(); }
  const bk = ea(t, 13.15, 13.7, E.out4), xm = BX0 + BW * pw;
  if (bk > 0) {
    line(xm, by1 - 6, xm, by2 + bh + 36, { color: C.gold, w: 3, dash: [6, 7], alpha: bk });
    T('MORE THAN', xm + 14 + (BX0 + BW - xm - 14) / 2, by2 + bh + 84, { font: F.d(700, 50), ls: 4, color: C.gold, alpha: bk });
  }
}

// ----------------------------------------------------------------------------- number blocks
function counterGroup(t, o) {
  const font = F.d(300, 300), nW = numberWidth(o.fin, font, -6), fs = F.i(170), sW = M(o.suffix, fs), gap = 14, tot = nW + gap + sW, x0 = -tot / 2;
  const v = o.val * ea(t, o.a0, o.a1, E.out3), na = ea(t, o.a0 - 0.05, o.a0 + 0.3);
  drawNumber(numberStr(v, o.dec), o.fin, x0, 95, { font, alpha: na, ls: -6 });
  const eS = ea(t, o.a1 - 0.2, o.a1 + 0.3, E.out5);
  T(o.suffix, x0 + nW + gap + sW / 2, 95, { font: fs, color: C.gold, alpha: na * ea(t, o.a0, o.a0 + 0.3), sx: lerp(0.9, 1, eS), sy: lerp(0.9, 1, eS) });
}
function bigNumber(t, o) {                    // "OVER AED  5B+"
  ctx.save(); ctx.translate(CX, o.y); ctx.scale(o.sc, o.sc);
  const e0 = enter(t, o.overT, 0.5, 18), f = F.d(600, 66), wo = M('OVER', f, 12), wa = M(o.aed, f, 12), g = 30, tt = wo + g + wa;
  T('OVER', -tt / 2 + wo / 2, -205 + e0.dy, { font: f, ls: 12, color: C.ink, alpha: e0.a });
  const e1 = enter(t, o.aedT, 0.5, 18);
  T(o.aed, -tt / 2 + wo + g + wa / 2, -205 + e1.dy, { font: f, ls: 12, color: C.gold, alpha: e1.a });
  counterGroup(t, o);
  ctx.restore();
}

// -------------------------------------------------------------------- ADIA
function sceneAdia(t) {
  logo('adia', CX, 450, 120, { alpha: ea(t, 13.86, 14.1), reveal: ea(t, 13.86, 14.5, E.out4), shine: prog(t, 14.3, 15.2) });
  const cy = 900, R = 250, ra = ea(t, 14.35, 15.2, E.out3), fill = ea(t, 15.19, 16.1, E.out3);
  ring(CX, cy, R, { color: C.faint, w: 3, alpha: ra, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * ra });
  if (fill > 0.001) {
    ring(CX, cy, R, { color: C.gold, w: 8, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * fill });
    const ha = -Math.PI / 2 + Math.PI * 2 * fill; dot(CX + Math.cos(ha) * R, cy + Math.sin(ha) * R, 11, C.gold);
  }
  ctx.save(); ctx.translate(CX, cy + 30); ctx.scale(0.72, 0.72);
  const e0 = enter(t, 15.19, 0.45, 18), eT = enter(t, 15.8, 0.45, 18);
  T('US$', 0, -180 + e0.dy, { font: F.d(600, 78), ls: 10, color: C.gold, alpha: e0.a });
  counterGroup(t, { val: 1.1, dec: 1, fin: '1.1', suffix: 'T', a0: 15.19, a1: 16.05 });
  T('TRILLION', 0, 215 + eT.dy, { font: F.d(600, 78), ls: 10, color: C.ink, alpha: eT.a });
  ctx.restore();
}

// ---------------------------------------------------------- AI / technology / infrastructure / businesses -> companies, jobs, housing demand
function sceneEcosystem(t) {
  label('INVESTING IN', CX, 420, t, 16.21, { ls: 14, size: 54 });
  const W4 = [['AI', 16.84], ['TECHNOLOGY', 17.32], ['INFRASTRUCTURE', 17.78], ['BUSINESSES', 18.33]];
  const dim = 1 - 0.62 * ea(t, 18.84, 19.3);
  W4.forEach(([w, a], i) => { const e = enter(t, a, 0.5, 30); T(w, CX, 575 + i * 118 + e.dy, { font: F.d(600, 100), ls: w.length > 11 ? 3 : 10, color: C.ink, alpha: e.a * dim }); });
  const ha = ea(t, 18.84, 19.4, E.out4);
  if (ha > 0.003) { line(CX, 1000, CX, 1060, { color: C.gold, w: 5, alpha: ha }); icon('up', CX, 1066, 24, { p: 1, color: C.gold, w: 5, rot: Math.PI, alpha: ha }); }
  const O = [['COMPANIES', 'building', 19.13, 20.05], ['JOBS', 'briefcase', 20.11, 20.83], ['HOUSING DEMAND', 'house', 20.87, 99]];
  O.forEach(([w, ic, a, b], i) => {
    const e = ea(t, a, a + 0.5, E.out4), o = i < 2 ? 1 - ea(t, b, b + 0.28) : 1; if (e * o <= 0.003) return;
    const isH = i === 2;
    ctx.save(); ctx.globalAlpha *= e * o; ctx.translate(0, (1 - e) * 26);
    icon(ic, CX, 1150, 46, { p: ea(t, a + 0.1, a + 0.7, E.out3), color: isH ? C.gold : C.ink, w: 5 });
    T(w, CX, 1290, { font: F.d(700, 96), ls: 4, color: isH ? C.gold : C.ink });
    ctx.restore();
  });
}

// ------------------------------------------------- the two sales figures, each with the developers' own renders
function sceneStat5(t) {
  photoCard([{ img: PHOTO.talay, fx: 0.5 }, { img: PHOTO.yasriva, fx: 0.42 }], 60, 220, 960, 500, t, 24.46);
  const e = enter(t, 24.7, 0.5, 14);
  T('TALAY', 300, 790 + e.dy, { font: F.d(700, 48), ls: 3, color: C.ink, alpha: e.a }); T('YAS RIVA RESERVE', 780, 790 + e.dy, { font: F.d(700, 40), ls: 2, color: C.ink, alpha: e.a });
  bigNumber(t, { aed: 'AED', overT: 24.46, aedT: 24.62, val: 5, dec: 0, fin: '5', suffix: 'B+', a0: 24.72, a1: 25.4, y: 1080, sc: 0.8 });
  wordRow(['IN SALES', 'COMBINED'], [25.45, 25.85], 1245, t, { colors: [C.ink, C.gold], ls: 6, size: 58 });
}
function sceneStat13(t) {
  photoCard([{ img: PHOTO.hudayriyat, fx: 0.55 }], 60, 220, 960, 500, t, 28.19);
  const e = enter(t, 28.4, 0.5, 14);
  T('HUDAYRIYAT GOLF ESTATES', CX, 790 + e.dy, { font: F.d(700, 48), ls: 3, color: C.ink, alpha: e.a });
  bigNumber(t, { aed: 'AED', overT: 27.94, aedT: 28.05, val: 13, dec: 0, fin: '13', suffix: 'B+', a0: 28.19, a1: 28.95, y: 1080, sc: 0.8 });
  wordRow(['IN SALES', 'WITHIN DAYS', 'OF LAUNCH'], [28.9, 29.28, 29.95], 1245, t, { colors: [C.ink, C.gold, C.ink], ls: 3, size: 46, gap: 26 });
}

// ------------------------------------------------------------ what to look for
function sceneCriteria(t) {
  const eh = enter(t, 32.74, 0.6, 30);
  T('properties with', CX, 470 + eh.dy, { font: F.i(128), color: C.ink, alpha: eh.a });
  const rows = [['tag', 'Competitive', 'entry prices', 33.47], ['house', 'Strong', 'rental demand', 34.92], ['chart', 'Long-term', 'appreciation', 36.22]];
  rows.forEach(([ic, a, b, t0], i) => {
    const y = 700 + i * 195, nextT = rows[i + 1] ? rows[i + 1][3] : 99, act = ea(t, t0, t0 + 0.6, E.out4), op = lerp(1, 0.5, ea(t, nextT, nextT + 0.5));
    if (act <= 0.002) return;
    ctx.save(); ctx.globalAlpha *= op;
    icon(ic, 150, y - 10, 46, { p: ea(t, t0 + 0.1, t0 + 0.7), color: C.gold, w: 5 });
    ctx.save(); ctx.beginPath(); ctx.rect(250, y - 100, 780 * act, 220); ctx.clip();
    const dy = (1 - act) * 22;
    T(a, 252, y + dy, { font: F.d(600, 92), ls: -2, align: 'left', color: C.ink });
    T(b, 252, y + 78 + dy, { font: F.i(84), align: 'left', color: C.gold });
    ctx.restore(); ctx.restore();
  });
}

// ---------------------------------------------------------------- message me
function sceneCTA(t) {
  const send = 45.53, ce = ea(t, 42.3, 43.0, E.out4);
  ctx.save(); ctx.globalAlpha *= ce; ctx.translate(0, (1 - ce) * 40);
  T('Want my shortlist?', CX, 560, { font: F.i(120), color: C.ink });
  ctx.restore();
  const sent = ea(t, send, send + 0.35), ia = ea(t, 43.2, 43.8, E.out4), iy = 1200;
  ctx.save(); ctx.globalAlpha *= ia;
  rr(80, iy - 70, 920, 140, 70); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(245,242,236,0.28)'; ctx.lineWidth = 3; ctx.stroke();
  const msg = 'Shortlist', typed = Math.floor(msg.length * ea(t, 45.06, 45.5, E.lin) + 0.0001);
  T(msg.slice(0, typed), 140, iy + 20, { font: F.d(500, 64), color: C.ink, align: 'left', alpha: 1 - sent });
  if (t < send) { const cur = (Math.floor(t * 2.4) % 2 === 0) ? 1 : 0.15, cw2 = M(msg.slice(0, typed), F.d(500, 64)); line(140 + cw2 + 8, iy - 34, 140 + cw2 + 8, iy + 34, { color: C.gold, w: 4, alpha: cur }); }
  T('Message…', 140, iy + 20, { font: F.d(500, 64), color: C.mute, align: 'left', alpha: (1 - ea(t, 45.06, 45.12)) * (1 - sent) });
  dot(930, iy, 52, C.gold, 1); icon('plane', 930, iy, 22, { p: 1, color: '#17181B', w: 4.5, rot: -0.5 + 0.5 * sent });
  ctx.restore();
  const b1 = ea(t, send, send + 0.5, E.out4);
  if (b1 > 0.002) { ctx.save(); ctx.globalAlpha *= b1; ctx.translate(0, (1 - b1) * 40); rr(640, 770, 360, 120, 60); ctx.fillStyle = C.gold; ctx.fill(); T('Shortlist', 820, 850, { font: F.d(600, 62), color: '#17181B' }); ctx.restore(); }
  const b2 = ea(t, send + 0.55, send + 1.05, E.out4);
  if (b2 > 0.002) { ctx.save(); ctx.globalAlpha *= b2; ctx.translate(0, (1 - b2) * 40); rr(80, 925, 640, 120, 60); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = 'rgba(245,242,236,0.28)'; ctx.lineWidth = 3; ctx.stroke();
    icon('check', 150, 985, 26, { p: ea(t, send + 0.8, send + 1.2), color: C.gold, w: 5 }); T('My shortlist', 210, 1005, { font: F.d(600, 62), color: C.ink, align: 'left' }); ctx.restore(); }
}

// ------------------------------------------------------------------- satellite map scenes
const MAPS = {
  mubadala: { logo: { key: 'mubadala', size: 84, y: 250 }, outlines: [{ key: 'mubadala', t0: 9.2, t1: 10.5 }], pins: [{ lon: 54.3902, lat: 24.5021, t: 9.3, title: 'AL MARYAH ISLAND' }] },
  aldar: { logo: { key: 'aldar', size: 110, y: 250 }, outlines: [{ key: 'talay', t0: 22.15, t1: 23.2 }, { key: 'yas', t0: 23.55, t1: 24.35 }],
    pins: [{ lon: 54.441, lat: 24.5475, t: 22.85, title: 'TALAY', sub: 'SAADIYAT ISLAND' }, { lon: 54.6091, lat: 24.4864, t: 23.36, title: 'YAS RIVA RESERVE', sub: 'YAS ISLAND' }] },
  hudayriyat: { logo: { key: 'modon', size: 92, y: 250 }, outlines: [{ key: 'hudayriyat', t0: 26.55, t1: 27.8 }], pins: [{ lon: 54.3603, lat: 24.4171, t: 26.9, title: 'HUDAYRIYAT', sub: 'GOLF ESTATES' }] },
};
function runSat(sc, t) {
  if (t < sc.a - 0.15 || t > sc.b + 0.4) return;
  const alpha = ea(t, sc.a - 0.12, sc.a + 0.25, E.out2) * (1 - prog(t, sc.b - 0.12, sc.b + 0.2)); if (alpha <= 0.002) return;
  const S = SAT_SCENES[sc.sat], cfg = MAPS[sc.sat];
  ctx.save(); ctx.globalAlpha *= alpha;
  const cam = satDraw(S, t);
  for (const o of cfg.outlines) satOutline(cam, OUTLINES[o.key], ea(t, o.t0, o.t1, E.inOut2));
  for (const p of cfg.pins) { const [x, y] = satProj(cam, p.lon, p.lat); satPin(x, y, t, p.t, p.title, p.sub); }
  const L = cfg.logo; logo(L.key, CX, L.y, L.size, { alpha: ea(t, sc.a, sc.a + 0.3), reveal: ea(t, sc.a, sc.a + 0.6, E.out4) });
  T('Imagery © Esri, Maxar, Earthstar Geographics', CX, 1884, { font: F.d(500, 26), color: 'rgba(245,242,236,0.6)' });
  ctx.restore();
}

// Beats. kind 'sat' = full-screen satellite; the others are text/number scenes centred by main.js.
const SCENES = [
  { id: 'beyond', a: 5.62, b: 8.95, fn: sceneBeyond, box: [500, 1010] },
  { id: 'mubadala', kind: 'sat', sat: 'mubadala', a: 8.95, b: 11.77 },
  { id: 'bars', a: 11.77, b: 13.86, fn: sceneBars, box: [540, 1000] },
  { id: 'adia', a: 13.86, b: 16.21, fn: sceneAdia, box: [380, 1180] },
  { id: 'ecosystem', a: 16.21, b: 21.91, fn: sceneEcosystem, box: [360, 1320] },
  { id: 'aldar', kind: 'sat', sat: 'aldar', a: 21.91, b: 24.46 },
  { id: 'stat5', a: 24.46, b: 26.26, fn: sceneStat5, box: [200, 1280] },
  { id: 'modon', kind: 'sat', sat: 'hudayriyat', a: 26.26, b: 28.19 },
  { id: 'stat13', a: 28.19, b: 31.3, fn: sceneStat13, box: [200, 1280] },
  { id: 'criteria', a: 31.3, b: 37.9, fn: sceneCriteria, box: [360, 1260] },
  { id: 'cta', a: 42.2, b: 46.72, fn: sceneCTA, box: [440, 1280], last: true },
];

// ===================================================================================
// Full-face overlays (drawn in screen coordinates over the footage) - only two, both single elements
// ===================================================================================
const segA = (t, a, b, i = 0.25, o = 0.25) => ea(t, a, a + i) * (1 - ea(t, b - o, b));

function ovOutdated(t) {                      // "...an OUTDATED argument."  stamp slams in on the word
  const A = segA(t, 4.6, 5.7, 0.2, 0.25); if (A <= 0.003) return;
  const p = ea(t, 4.86, 5.16, E.out5), a = ea(t, 4.86, 5.0, E.out2);
  ctx.save(); ctx.globalAlpha *= A * a; ctx.translate(CX, 1060); ctx.rotate(-0.05); ctx.scale(lerp(1.7, 1, p), lerp(1.7, 1, p));
  const f = F.d(800, 112), sw = M('OUTDATED', f, 10) + 90;
  ctx.fillStyle = 'rgba(20,21,24,0.82)'; rr(-sw / 2, -92, sw, 184, 22); ctx.fill();
  ctx.strokeStyle = C.gold; ctx.lineWidth = 7; rr(-sw / 2, -92, sw, 184, 22); ctx.stroke();
  T('OUTDATED', 0, 38, { font: f, ls: 10, color: C.gold });
  ctx.restore();
}
function ovBigger(t) {                        // oil is a dot; the economy is the ring that grows past it
  const A = segA(t, 37.9, 42.2, 0.25, 0.3); if (A <= 0.003) return;
  const cy = 1030;
  ctx.save(); ctx.globalAlpha *= A;
  const gr = ea(t, 40.0, 41.9, E.out4), R2 = 60 + 760 * gr, ga = ea(t, 39.95, 40.3) * (1 - 0.6 * prog(R2, 480, 800));
  if (ga > 0.002) ring(CX, cy, R2, { color: C.gold, w: 6, alpha: ga });
  const oa = ea(t, 37.96, 38.5, E.out4), pulse = 1 + 0.3 * Math.sin(Math.PI * clamp((t - 38.57) / 0.5)) + 0.35 * Math.sin(Math.PI * clamp((t - 41.43) / 0.5));
  ctx.fillStyle = 'rgba(20,21,24,0.6)'; ctx.beginPath(); ctx.arc(CX, cy, 84, 0, 7); ctx.globalAlpha *= oa; ctx.fill(); ctx.globalAlpha /= Math.max(oa, 1e-3);
  ring(CX, cy, 52, { color: C.ink, w: 4, alpha: 0.95 * oa, a0: -Math.PI / 2, a1: -Math.PI / 2 + Math.PI * 2 * oa });
  dot(CX, cy, 15 * pulse, C.ink, oa);
  T('OIL', CX, cy + 140, { font: F.d(700, 56), ls: 12, color: C.ink, alpha: oa });
  ctx.restore();
}
