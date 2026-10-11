'use strict';
// ---------------------------------------------------------------------------
// Manchester City Yas Residences by Ohana - reel renderer, in the same look as the Abu Dhabi reel:
// near-black + warm ivory + gold, Inter bold only, small black-on-white captions, dark gold-edged labels.
//   cam  segments: his real on-camera moments (hook / closer), cut out and set on the black background
//   shot segments: brochure imagery with Ken Burns moves, a real satellite flyover of Yas Island with routes drawn on it, stats, the CTA
// window.prepare(t) loads camera frames, window.draw(t) renders one frame.
// ---------------------------------------------------------------------------
let TL = null, IMG = {}, PL = null, TMP = null, NOISE_PAT = null;
let CAMF = null, CAMM = null, CAMK = '';

const IMG_SRC = {
  silk: 'assets/silk_bg.jpg', logo: 'assets/logo_lockup_white.png',
  p10: 'assets/pg-010.jpg', p11: 'assets/pg-011.jpg', p19: 'assets/pg-019.jpg', p21: 'assets/pg-021.jpg',
  p26: 'assets/pg-026.jpg', p47: 'assets/pg-047.jpg', p61: 'assets/pg-061.jpg', p63: 'assets/pg-063.jpg', p64: 'assets/pg-064.jpg', p70: 'assets/pg-070.jpg',
  p85: 'assets/pg-085.jpg', p86: 'assets/pg-086.jpg', p87: 'assets/pg-087.jpg', p102: 'assets/pg-102.jpg', p108: 'assets/pg-108.jpg',
  lagoon: 'assets/lagoon.jpg', ferrari: 'assets/ferrari.jpg', circuit: 'assets/circuit.jpg',
};
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('missing ' + src)); im.src = src; });
const pad5 = n => String(n).padStart(5, '0');

// ---- timeline helpers --------------------------------------------------------------------------
const segAt = t => { let s = TL.segs[0]; for (const g of TL.segs) if (t >= g.a - 1e-6) s = g; return s; };
const segById = id => TL.segs.find(s => s.id === id);
// time of the n-th word of a segment matching a regex (falls back to a fraction of the segment)
function wt(id, re, n = 0, fb = 0.5) {
  const s = segById(id), ws = TL.words.filter(w => w.seg === id && re.test(w.text));
  return ws[n] ? ws[n].t : s.a + (s.b - s.a) * fb;
}
const clampT = (t, s) => clamp(t, s.a, s.b);

// ---- drawing helpers ---------------------------------------------------------------------------
// draw `img` to cover the rect (dx,dy,dw,dh); zoom >= 1 and focal point (fx,fy in 0..1 of the usable region)
function cover(img, o = {}) {
  const { zoom = 1, fx = 0.5, fy = 0.5, dx = 0, dy = 0, dw = W, dh = H, region = [0, 0, 1, 1], alpha = 1 } = o;
  const rx = img.width * region[0], ry = img.height * region[1], rw = img.width * region[2], rh = img.height * region[3];
  const s = Math.max(dw / rw, dh / rh) * zoom, sw = dw / s, sh = dh / s;
  const sx = clamp(rx + fx * rw - sw / 2, rx, rx + rw - sw), sy = clamp(ry + fy * rh - sh / 2, ry, ry + rh - sh);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh); ctx.restore();
  return { s, sx, sy, dx, dy };                       // image px -> screen:  (px - sx) * s + dx
}
const kbPath = (lt, d, a, b, f = E.inOut2) => { const e = f(prog(lt, 0, d)); return { zoom: lerp(a.zoom, b.zoom, e), fx: lerp(a.fx, b.fx, e), fy: lerp(a.fy, b.fy, e) }; };

let GRIDP = null;
function drawBG(t) {                                                // same background as the Abu Dhabi reel
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  glow(180 + 70 * Math.sin(t * 0.21), 700 + 40 * Math.cos(t * 0.17), 820, '233,196,124', 0.05);
  glow(900 + 60 * Math.cos(t * 0.19), 1400 + 50 * Math.sin(t * 0.23), 900, '233,196,124', 0.035);
  if (GRIDP) { ctx.save(); ctx.globalAlpha = 0.07; ctx.translate(0, -((t * 7) % 60)); ctx.fillStyle = GRIDP; ctx.fillRect(0, 0, W, H + 60); ctx.restore(); }
  const v = ctx.createRadialGradient(CX, 1000, 360, CX, 1000, 1250); v.addColorStop(0, 'rgba(8,8,10,0)'); v.addColorStop(1, 'rgba(8,8,10,0.92)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
// grade on photos: a little warmth, dark top and a dark floor for the captions
function grade(top = 0.0, bottom = 0.72) {
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.22; ctx.fillStyle = '#E9C47C'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgba(8,8,10,${top + 0.4})`); g.addColorStop(0.2, `rgba(8,8,10,${top})`); g.addColorStop(0.52, 'rgba(8,8,10,0)'); g.addColorStop(0.88, `rgba(8,8,10,${bottom})`); g.addColorStop(1, `rgba(8,8,10,${bottom + 0.15})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function chip(txt, x, y, t, a0, o = {}) {                            // label pill: dark with a gold edge; o.fill given = gold fill, dark text
  const { size = 46, ls = 3, align = 'center', fill = '#FFFFFF' } = o, hot = fill !== '#FFFFFF';
  const e = ea(t, a0, a0 + 0.4, E.back), al = ea(t, a0, a0 + 0.18) * (o.end != null ? 1 - ea(t, o.end, o.end + 0.15) : 1); if (al <= 0.004) return;
  const f = F.c(800, size), w = M(txt, f, ls) + 60, h = size * 1.55, lx = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(lx + w / 2, y); ctx.scale(lerp(0.8, 1, e), lerp(0.8, 1, e));
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = hot ? C.gold : 'rgba(8,8,10,0.88)'; ctx.fill(); ctx.shadowColor = 'transparent';
  if (!hot) { ctx.strokeStyle = 'rgba(233,196,124,0.75)'; ctx.lineWidth = 2.5; ctx.stroke(); }
  T(txt, 0, size * 0.35, { font: f, ls, color: hot ? '#0A0A0B' : C.ink }); ctx.restore();
}
function label(txt, x, y, t, a0, o = {}) {                           // plain bold caps label, no pill
  const e = ea(t, a0, a0 + 0.4, E.out3); if (e <= 0.004) return;
  T(txt, x, y + (1 - e) * 14, { font: F.a(700, o.size || 40), ls: o.ls ?? 8, color: o.color || C.ink, alpha: e * (o.alpha ?? 1), align: o.align || 'center' });
}
function bigStat(txt, suffix, y, t, a0, d, o = {}) {                 // giant number counting up
  const e = ea(t, a0, a0 + d, E.out3), al = ea(t, a0 - 0.05, a0 + 0.2); if (al <= 0.004) return;
  const v = Math.round(o.val * e), s = (o.dec ? (o.val * e).toFixed(o.dec) : String(v));
  const f = F.c(800, o.size || 340), fs = F.c(800, (o.size || 340) * 0.4), w1 = M(s, f, 0), w2 = suffix ? M(suffix, fs, 0) + 14 : 0, x0 = CX - (w1 + w2) / 2;
  ctx.save(); ctx.globalAlpha *= al; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40;
  ctx.lineJoin = 'round'; ctx.font = f; ctx.textAlign = 'left'; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(8,8,10,0.55)'; ctx.strokeText(s, x0, y);
  ctx.shadowColor = 'transparent'; ctx.fillStyle = C.ink; ctx.fillText(s, x0, y);
  if (suffix) { ctx.font = fs; ctx.lineWidth = 10; ctx.strokeText(suffix, x0 + w1 + 14, y); ctx.fillStyle = C.gold; ctx.fillText(suffix, x0 + w1 + 14, y); }
  ctx.restore();
  if (o.label) {
    const la = al * ea(t, a0 + 0.3, a0 + 0.7), lf = F.c(800, 56), lw = M(o.label, lf, 12) + 80, ly = y + (o.size || 340) * 0.22;
    ctx.save(); ctx.globalAlpha *= la; rr(CX - lw / 2, ly - 62, lw, 90, 45); ctx.fillStyle = 'rgba(8,8,10,0.8)'; ctx.fill(); ctx.strokeStyle = 'rgba(233,196,124,0.7)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore();
    T(o.label, CX, ly, { font: lf, ls: 12, color: C.gold, alpha: la });
  }
}
// quick "page turn": zoom-out settle + white flash on a cut
function cutFx(lt, o = {}) { return { z: lerp(o.z0 ?? 1.16, 1, E.out4(prog(lt, 0, 0.5))), flash: Math.exp(-lt * 14) * (o.flash ?? 0.45) * 0.3 }; }
function flash(a) { if (a > 0.01) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#FFE9B8'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
// ---- captions: small, bold condensed caps, black on a white box; one short phrase at a time --------------------------------------
const CAP = { size: 58, maxW: 860, lh: 82, padX: 26, boxH: 74, r: 16, y: 1540 };
const CHUNKS = {};
function chunkLayout(id) {
  if (CHUNKS[id]) return CHUNKS[id];
  const ws = TL.words.filter(w => w.chunk === id), font = F.c(800, CAP.size), sp = M(' ', font, 0);
  const items = ws.map(w => ({ w, wd: M(w.text, font, 0) }));
  const total = items.reduce((a, b) => a + b.wd, 0) + sp * (items.length - 1);
  let lines = [items];
  if (total > CAP.maxW) { let best = 1, bd = 1e9; for (let k = 1; k < items.length; k++) { const a = items.slice(0, k).reduce((s, x) => s + x.wd, 0) + sp * (k - 1), b = items.slice(k).reduce((s, x) => s + x.wd, 0) + sp * (items.length - k - 1); if (Math.abs(a - b) < bd) { bd = Math.abs(a - b); best = k; } } lines = [items.slice(0, best), items.slice(best)]; }
  return (CHUNKS[id] = { font, lines: lines.map(L => ({ txt: L.map(x => x.w.text).join(' '), w: L.reduce((s, x) => s + x.wd, 0) + sp * (L.length - 1) })), a: ws[0].t, b: ws[ws.length - 1].e });
}
function drawCaptions(t, yBase = CAP.y) {
  const cur = TL.words.filter(w => t >= w.t - 0.01 && t <= w.e + 0.45); if (!cur.length) return;
  const id = cur[cur.length - 1].chunk, c = chunkLayout(id);
  if (t > c.b + 0.4) return;
  const inP = ea(t, c.a - 0.03, c.a + 0.05, E.out3), fade = inP * (1 - ea(t, c.b + 0.15, c.b + 0.4));
  if (fade <= 0.003) return;
  ctx.save(); ctx.globalAlpha *= fade; ctx.translate(0, (1 - inP) * 12); ctx.font = c.font; ctx.letterSpacing = '0px'; ctx.textAlign = 'center';
  const nL = c.lines.length, y0 = yBase - (nL - 1) * CAP.lh * 0.5;
  c.lines.forEach((ln, li) => {
    const y = y0 + li * CAP.lh, bw = ln.w + CAP.padX * 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 16 * SS; ctx.shadowOffsetY = 4 * SS;
    rr(CX - bw / 2, y - CAP.size * 0.76 - (CAP.boxH - CAP.size) / 2 + 6, bw, CAP.boxH, CAP.r); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    ctx.fillStyle = '#0A0A0B'; ctx.fillText(ln.txt, CX, y);
  });
  ctx.restore();
}

// ---- cam segments: him, cut out, on the brochure water -------------------------------------------------------------------
const PUNCH = { hook: [[/^6$/, 0.075], [/^72$/, 0.085], [/HOURS/, 0.04]], closer: [[/PHASE/, 0.08], [/DROPPING/, 0.06], [/NOW/, 0.09]] };
function camPunch(seg, t) {
  let z = 1.06 + 0.04 * prog(t, seg.a, seg.b);
  for (const [re, am] of (PUNCH[seg.id] || [])) for (const w of TL.words.filter(w => w.seg === seg.id && re.test(w.text))) { const u = t - w.t; if (u > 0) z += am * Math.exp(-u * 6) * (1 - Math.exp(-u * 40)); }
  return z;
}
function giantText(lines, t, seg) {       // big bold words BEHIND him, swapping on the spoken words
  for (const L of lines) {
    const t0 = L.t, t1 = L.until ?? 1e9; if (t < t0 || t > t1 + 0.2) continue;
    const e = ea(t, t0, t0 + 0.32, E.out4), out = 1 - ea(t, t1, t1 + 0.2);
    let size = 330; const w = M(L.text, F.c(800, size), 0); size = Math.min(size, size * 940 / w);
    ctx.save(); ctx.globalAlpha *= e * out; ctx.translate(CX, L.y + (1 - e) * 60); ctx.scale(lerp(1.1, 1, e), lerp(1.1, 1, e));
    ctx.font = F.c(800, size); ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.letterSpacing = '0px';
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(8,8,10,0.5)'; ctx.strokeText(L.text, 0, 0);
    ctx.shadowColor = 'transparent'; ctx.fillStyle = L.color || C.ink; ctx.fillText(L.text, 0, 0); ctx.restore();
  }
}
function drawCam(t, seg) {
  const lt = t - seg.a;
  drawBG(t);
  if (seg.id === 'hook') giantText([{ text: '6 BILLION', t: wt('hook', /^6$/, 0, 0.35) - 0.05, until: wt('hook', /^72$/, 0, 0.7) - 0.05, y: 640 }, { text: '72 HOURS', t: wt('hook', /^72$/, 0, 0.7) - 0.05, y: 640 }], t, seg);
  else giantText([{ text: 'PHASE 2', t: wt('closer', /PHASE/, 0, 0.3) - 0.05, until: wt('closer', /DROPPING/, 0, 0.6) - 0.02, y: 640, color: C.gold }, { text: 'DROPPING NOW', t: wt('closer', /DROPPING/, 0, 0.6) - 0.02, y: 640, color: C.gold }], t, seg);
  if (!CAMF) return;
  const z = camPunch(seg, t), o = PL.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, PL.width, PL.height);
  o.setTransform(SS, 0, 0, SS, 0, 0); o.save(); o.translate(CX, 820); o.scale(z, z); o.translate(-CX, -820);
  o.drawImage(CAMF, 0, 0, W, H);
  if (CAMM) { o.globalCompositeOperation = 'destination-in'; o.drawImage(CAMM, 0, 0, W, H); }
  o.restore();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.shadowColor = 'rgba(233,196,124,0.32)'; ctx.shadowBlur = 40 * SS; ctx.drawImage(PL, 0, 0); ctx.restore();
  // soft dark floor under the captions
  const g = ctx.createLinearGradient(0, 1150, 0, H); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(1, 'rgba(8,8,10,0.7)'); ctx.fillStyle = g; ctx.fillRect(0, 1150, W, H - 1150);
}

// ---- shots -------------------------------------------------------------------------------------------------------------------------
function shotS1(t, seg) {
  const lt = t - seg.a; drawBG(t);
  const e = ea(lt, 0.0, 0.8, E.out4), lw = 880, lh = lw * IMG.logo.height / IMG.logo.width;
  ctx.save(); ctx.globalAlpha *= e; ctx.translate(CX, 800); ctx.scale(lerp(0.84, 1, e), lerp(0.84, 1, e));
  ctx.shadowColor = 'rgba(233,196,124,0.3)'; ctx.shadowBlur = 50; ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); ctx.restore();
  const tt = wt('S1', /^OHANA/, 0, 0.85);
  label('YAS CANAL  ·  YAS ISLAND  ·  ABU DHABI', CX, 1180, t, tt - 0.25, { size: 38, ls: 6, color: C.gold });
  const sw = ea(t, tt - 0.2, tt + 0.5, E.inOut2); line(CX - 260 * sw, 1225, CX + 260 * sw, 1225, { color: C.gold, w: 3, alpha: 0.9 });
}
function shotS2(t, seg) {
  const lt = t - seg.a, d = seg.b - seg.a, fx = cutFx(lt, { z0: 1.0, flash: 0.0 });
  const kb = kbPath(lt, d, { zoom: 1.05, fx: 0.2, fy: 0.66 }, { zoom: 1.7, fx: 0.215, fy: 0.62 });
  cover(IMG.p11, { ...kb, region: [0, 0, 0.55, 1] }); grade(0.0, 0.74);
  const tCan = wt('S2', /^CANAL/, 0, 0.9) - 0.1;
  chip('MAN CITY-INSPIRED COMMUNITY', CX, 1190, t, wt('S2', /^FIRST/, 0, 0.3) - 0.1, { size: 50, end: tCan });
  chip('YAS CANAL  ·  YAS ISLAND', CX, 1190, t, tCan, { size: 54, fill: C.gold });
  // the first chip yields to the second
}
function shotS3(t, seg) {
  const sc = yasScene(seg.a, seg.b), cam = satDraw(sc, t);
  const tF = wt('S3', /^FERRARI/, 0, 0.45), tC = wt('S3', /^CIRCUIT/, 0, 0.6), tA = wt('S3', /^AIRPORT/, 0, 0.8), tM = wt('S3', /^(10|TEN)/, 0, 0.88), tS = seg.a + 0.35;
  const P = YAS_PLACES, at = k => satProj(cam, P[k][0], P[k][1]);
  // routes first (under the pins)
  satRoute(cam, P.site, P.ferrari, ea(t, tF - 0.2, tF + 0.7, E.inOut2), { bend: 0.12 });
  satRoute(cam, P.site, P.circuit, ea(t, tC - 0.2, tC + 0.7, E.inOut2), { bend: -0.12 });
  const mid = satRoute(cam, P.site, P.airport, ea(t, tA - 0.1, tA + 1.0, E.inOut2), { bend: 0.14 });
  satPin(...at('site'), t, tS, 'THE SITE', { main: true, side: 'right', size: 54 });
  satPin(...at('ferrari'), t, tF - 0.05, 'FERRARI WORLD', { side: 'above', size: 50 });
  satPin(...at('circuit'), t, tC - 0.05, 'YAS MARINA CIRCUIT', { side: 'below', size: 50 });
  satPin(...at('airport'), t, tA - 0.05, 'ABU DHABI AIRPORT', { side: 'above', size: 50 });
  if (mid) chip('10–15 MIN', mid[0], mid[1], t, tM - 0.15, { size: 62, fill: C.gold });
  T('Imagery © Esri, Maxar, Earthstar Geographics', CX, 1884, { font: F.a(700, 26), color: 'rgba(243,239,230,0.6)' });
}
function shotS4(t, seg) {
  const d = seg.b - seg.a, tT = seg.a, tD = wt('S4', /^DUPLEXES/, 0, 0.3), tV = wt('S4', /^VILLAS/, 0, 0.45), tB = wt('S4', /^BEDROOMS/, 0, 0.6), tH = wt('S4', /^(170|ONE|HUNDRED)/, 0, 0.78);
  const frames = [[tT, 'p26', { fx: 0.5, fy: 0.5 }, '2–3 BEDROOMS', null], [tD, 'p47', { fx: 0.5, fy: 0.55 }, '3 BEDROOMS', null], [tV, 'p61', { fx: 0.5, fy: 0.5 }, '4–5 BEDROOMS', null]];
  let cur = frames[0]; for (const f of frames) if (t >= f[0] - 1e-6) cur = f;
  if (t >= tH - 0.02) {                                     // masterplan + 170 ha
    const lt = t - (tH - 0.02), fx = cutFx(lt, { z0: 1.0, flash: 0.5 });
    cover(IMG.p19, { zoom: 1.0 + 0.08 * prog(lt, 0, 2), fx: 0.74, fy: 0.5, region: [0.38, 0.03, 0.62, 0.94] }); grade(0.05, 0.75); flash(fx.flash);
    bigStat('170', 'HA', 900, t, tH + 0.05, 0.9, { val: 170, size: 420, label: 'HECTARES' });
    return;
  }
  const lt = t - cur[0], fx = cutFx(lt);
  ctx.save(); ctx.translate(CX, H / 2); ctx.scale(fx.z, fx.z); ctx.translate(-CX, -H / 2);
  cover(IMG[cur[1]], { zoom: 1.0 + 0.1 * prog(lt, 0, 2.2), fx: cur[2].fx, fy: cur[2].fy }); ctx.restore(); grade(0.0, 0.7); flash(fx.flash);
  chip(cur[3], CX, 1180, t, cur[0] + 0.1, { size: 66 });
}
function shotS5(t, seg) {
  const tL = wt('S5', /^CRYSTAL/, 0, 0.45), tA = wt('S5', /^TRAINING/, 0, 0.62), tP = wt('S5', /^PROMENADE|^CANAL/, 0, 0.8), tO = wt('S5', /^(HALF|OPEN)/, 0, 0.18);
  const frames = [[seg.a, 'p85', { fx: 0.5, fy: 0.5 }, null], [tL - 0.05, 'lagoon', { fx: 0.5, fy: 0.5 }, null], [tA - 0.28, 'p102', { fx: 0.5, fy: 0.5 }, null], [tP - 0.1, 'p108', { fx: 0.55, fy: 0.5 }, null]];
  let cur = frames[0]; for (const f of frames) if (t >= f[0] - 1e-6) cur = f;
  const lt = t - cur[0], fx = cutFx(lt, { z0: cur === frames[0] ? 1.0 : 1.16 });
  ctx.save(); ctx.translate(CX, H / 2); ctx.scale(fx.z, fx.z); ctx.translate(-CX, -H / 2);
  cover(IMG[cur[1]], { zoom: 1.0 + 0.1 * prog(lt, 0, 2.4), fx: cur[2].fx, fy: cur[2].fy, region: cur[1] === 'lagoon' ? [0.12, 0.14, 0.76, 0.86] : [0, 0, 1, 1] }); ctx.restore(); grade(0.04, 0.72); flash(fx.flash);
  if (cur === frames[0]) { bigStat('55', '%', 870, t, tO - 0.05, 1.0, { val: 55, size: 440, label: 'OPEN SPACE' }); }
}
function shotS6(t, seg) {
  const lt = t - seg.a, imgs = ['p63', 'p86', 'p102', 'p108', 'p64'], i = Math.min(imgs.length - 1, Math.floor(lt / 0.2)), tt = seg.a + 0.62;
  if (t < tt) { const f = cutFx(lt - i * 0.2, { z0: 1.12, flash: 0.35 }); ctx.save(); ctx.translate(CX, H / 2); ctx.scale(f.z, f.z); ctx.translate(-CX, -H / 2); cover(IMG[imgs[i]], { zoom: 1.05, fx: 0.5, fy: 0.5 }); ctx.restore(); grade(0.1, 0.5); flash(f.flash); }
  else {
    drawBG(t); const e = ea(t, tt, tt + 0.3, E.out4);
    for (const [txt, y, a, col] of [['6 BILLION', 800, 0, C.ink], ['IN 72 HOURS', 1060, 0.12, C.gold]]) {
      const ee = ea(t, tt + a, tt + a + 0.3, E.out4); let size = 300; const w = M(txt, F.c(800, size), 0); size = Math.min(size, size * 940 / w);
      ctx.save(); ctx.globalAlpha *= ee; ctx.translate(CX, y + (1 - ee) * 50); ctx.scale(lerp(1.12, 1, ee), lerp(1.12, 1, ee)); ctx.font = F.c(800, size); ctx.textAlign = 'center'; ctx.letterSpacing = '0px'; ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(8,8,10,0.5)'; ctx.strokeText(txt, 0, 0); ctx.shadowColor = 'transparent'; ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore();
    }
  }
}
function shotEND(t, seg) {
  const lt = t - seg.a; drawBG(t);
  const e0 = ea(lt, 0, 0.6, E.out4), lw = 560, lh = lw * IMG.logo.height / IMG.logo.width;
  ctx.save(); ctx.globalAlpha *= e0; ctx.translate(CX, 540); ctx.scale(lerp(0.9, 1, e0), lerp(0.9, 1, e0)); ctx.shadowColor = 'rgba(233,196,124,0.3)'; ctx.shadowBlur = 40; ctx.drawImage(IMG.logo, -lw / 2, -lh / 2, lw, lh); ctx.restore();
  const tC = wt('END', /^COMMENT/, 0, 0.0), tY = wt('END', /^CITY/, 0, 0.3), tP = wt('END', /^PHASE/, 0, 0.62);
  // "COMMENT" + a chat bubble that types CITY
  const eb = ea(t, tC - 0.05, tC + 0.5, E.back);
  chip('COMMENT', CX, 885, t, tC - 0.05, { size: 70 });
  if (eb > 0.003) {
    ctx.save(); ctx.translate(CX, 1110); ctx.scale(lerp(0.8, 1, eb), lerp(0.8, 1, eb)); ctx.globalAlpha *= ea(t, tC, tC + 0.3);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.fillStyle = C.panel; rr(-400, -150, 800, 300, 80); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-300, 148); ctx.lineTo(-340, 230); ctx.lineTo(-220, 150); ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(233,196,124,0.55)'; ctx.lineWidth = 3; rr(-400, -150, 800, 300, 80); ctx.stroke();
    const typed = 'CITY'.slice(0, Math.floor(4 * ea(t, tY - 0.1, tY + 0.38, E.lin) + 0.001)); const cur = (Math.floor(t * 2.6) % 2 === 0) || typed.length < 4 ? 1 : 0.2;
    ctx.font = F.c(800, 190); ctx.textAlign = 'center'; ctx.fillStyle = C.gold; ctx.fillText(typed, 0, 68);
    const wtyped = M(typed, F.c(800, 190), 0); if (typed.length < 4 || t < tY + 0.9) line(wtyped / 2 + 16, -80, wtyped / 2 + 16, 92, { color: C.ink, w: 7, alpha: cur });
    ctx.restore();
  }
  chip('FOR PHASE 2 DETAILS', CX, 1420, t, tP - 0.1, { size: 54, fill: C.gold });
}
// ---- price per sq ft (Phase 2 investment study p.4, AED per sq ft of built-up area) -------------------------------------------
// MC Yas townhouses 1,852 / 1,908 vs Orchids townhouse 2,470 (-25%) and Yas luxury apartments avg 2,393.
const PR = { orch: { name: 'ORCHIDS TOWNHOUSE  ·  JUN 2026', v: 2470, mc: false }, apt: { name: 'YAS LUXURY APARTMENTS  ·  AVERAGE', v: 2393, mc: false },
             mc3: { name: 'MC YAS  ·  3BR TOWNHOUSE', v: 1908, mc: true }, mc2: { name: 'MC YAS  ·  2BR TOWNHOUSE', v: 1852, mc: true } };
const PX0 = 90, PXK = 900 / 2470, PBH = 104;
const fmtN = n => Math.round(n).toLocaleString('en-US');
function priceBar(r, y, g, t) {                                // r: row, y: bar centre line, g: growth 0..1
  if (g <= 0.003) return;
  const w = Math.max(PBH, PXK * r.v * g), e = ea(g, 0, 0.25);
  ctx.save(); ctx.globalAlpha *= e;
  T(r.name, PX0 + 6, y - PBH / 2 - 16, { font: F.c(800, 36), ls: 1, color: C.ink, align: 'left', alpha: 1 });
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = r.mc ? 30 : 14; rr(PX0, y - PBH / 2, w, PBH, 28);
  ctx.fillStyle = r.mc ? C.gold : 'rgba(243,239,230,0.14)'; ctx.fill(); ctx.shadowColor = 'transparent';
  if (!r.mc) { ctx.strokeStyle = 'rgba(243,239,230,0.3)'; ctx.lineWidth = 2; ctx.stroke(); }
  T(fmtN(r.v * g), PX0 + w - 26, y + 27, { font: F.c(800, 78), ls: 0, color: r.mc ? '#0A0A0B' : C.ink, align: 'right', alpha: ea(g, 0.3, 0.6) });
  ctx.restore();
}
function shotPrice(t, seg) {
  const P1 = segById('P1'), P2 = segById('P2'), lt = t - P1.a; drawBG(t);
  const u = ea(t, P2.a, P2.a + 0.55, E.inOut3);
  const yOrch = lerp(520, 470, u), yMc2 = lerp(1060, 1060, u), yApt = 665, yMc3 = 860;
  const tMc = wt('P1', /^1,?852/, 0, 0.5) - 0.1, tOr = wt('P1', /^(TWENTY|25)/, 0, 0.6) - 0.05, tSt = Math.max(tOr + 0.5, wt('P1', /PERCENT|%/, 0, 0.72) - 0.05);
  const tApt = wt('P2', /^AVERAGE/, 0, 0.35) - 0.1, tM3 = P2.a + 0.28, tFirst = wt('P2', /^FIRST/, 0, 0.62) - 0.1;
  // title block
  const te = ea(t, P1.a, P1.a + 0.45, E.out4);
  T('SOURCES: OHANA · METROPOLITAN · CHRISTIE\'S H1 2026', CX, 130, { font: F.a(700, 26), ls: 1, color: C.dim, alpha: te });
  ctx.save(); ctx.globalAlpha *= te; ctx.translate(CX, 262 + (1 - te) * 30); ctx.font = F.c(800, 110); ctx.textAlign = 'center'; ctx.letterSpacing = '0px'; ctx.lineJoin = 'round';
  const kw = Math.min(1, 940 / M('PRICE PER SQ FT', ctx.font, 0)); ctx.scale(kw, kw); ctx.fillStyle = C.ink; ctx.fillText('PRICE PER SQ FT', 0, 0); ctx.restore();
  T('BUILT-UP AREA  ·  AED', CX, 330, { font: F.c(800, 42), ls: 5, color: C.gold, alpha: te });
  // rows
  const gOr = ea(t, tOr, tOr + 0.85, E.out4), gMc2 = ea(t, tMc, tMc + 1.35, E.out4), gApt = ea(t, tApt, tApt + 0.8, E.out4), gM3 = ea(t, tM3, tM3 + 0.8, E.out4);
  priceBar(PR.orch, yOrch, gOr, t);
  priceBar({ ...PR.apt }, yApt, gApt, t);
  priceBar(PR.mc3, yMc3, gM3, t);
  priceBar(PR.mc2, yMc2, gMc2, t);
  // the gap to Orchids: dashed ghost bar on the 2BR row + guide line
  const xOr = PX0 + PXK * PR.orch.v, xMc = PX0 + PXK * PR.mc2.v, gg = ea(t, tSt - 0.05, tSt + 0.5, E.out3);
  if (gg > 0.004) {
    line(xOr, yOrch + PBH / 2 + 4, xOr, yMc2 - PBH / 2 - 4, { color: C.gold, w: 2.5, alpha: 0.6 * gg, dash: [10, 9] });
    ctx.save(); ctx.globalAlpha *= gg; ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.strokeStyle = C.gold; rr(xMc + 8, yMc2 - PBH / 2, (xOr - xMc) - 8, PBH, 24); ctx.fillStyle = 'rgba(233,196,124,0.12)'; ctx.fill(); ctx.stroke(); ctx.restore();
    T('−25%', (xMc + xOr) / 2 + 4, yMc2 + 25, { font: F.c(800, 66), ls: 0, color: C.gold, alpha: gg * ea(t, P2.a + 0.2, P2.a + 0.6) });
    // big stamp between the two rows, folds into the ghost bar when the chart fills out
    const big = gg * (1 - ea(t, P2.a - 0.05, P2.a + 0.4)), bs = lerp(1.18, 1, ea(t, tSt - 0.05, tSt + 0.35, E.out4));
    if (big > 0.004) {
      ctx.save(); ctx.globalAlpha *= big; ctx.translate(CX, 850); ctx.scale(bs, bs); ctx.font = F.c(800, 300); ctx.textAlign = 'center'; ctx.letterSpacing = '0px'; ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 44; ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(8,8,10,0.5)'; ctx.strokeText('−25%', 0, 0); ctx.shadowColor = 'transparent'; ctx.fillStyle = C.gold; ctx.fillText('−25%', 0, 0); ctx.restore();
      ctx.save(); ctx.globalAlpha *= big; chip('PER SQ FT', CX, 928, t, tSt + 0.1, { size: 44, fill: C.gold }); ctx.restore();
    }
  }
  chip('FIRST MAN CITY-BRANDED WATERFRONT', CX, 1205, t, tFirst, { size: 40 });
}
function shotP3(t, seg) {
  const lt = t - seg.a, d = seg.b - seg.a, fx = cutFx(lt, { z0: 1.12, flash: 0.0 });
  ctx.save(); ctx.translate(CX, H / 2); ctx.scale(fx.z, fx.z); ctx.translate(-CX, -H / 2);
  cover(IMG.p26, { zoom: 1.02 + 0.1 * prog(lt, 0, d), fx: 0.5, fy: 0.5 }); ctx.restore(); grade(0.1, 0.74);
  ctx.fillStyle = 'rgba(8,8,10,0.5)'; ctx.fillRect(0, 0, W, H);
  const t0 = seg.a + 0.1, e = ea(t, t0, t0 + 1.0, E.out3), al = ea(t, t0 - 0.04, t0 + 0.22);
  if (al > 0.004) {
    label('AED', CX, 610, t, t0, { size: 48, ls: 20, color: C.gold });
    const txt = `${(3.7 * e).toFixed(1)}–${(5.3 * e).toFixed(1)}M`; let size = 250; const w = M(txt, F.c(800, size), 0); size = Math.min(size, size * 940 / w);
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(CX, 840); ctx.scale(lerp(1.12, 1, ea(t, t0, t0 + 0.3, E.out4)), lerp(1.12, 1, ea(t, t0, t0 + 0.3, E.out4)));
    ctx.font = F.c(800, size); ctx.textAlign = 'center'; ctx.letterSpacing = '0px'; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(8,8,10,0.55)'; ctx.strokeText(txt, 0, 0);
    ctx.shadowColor = 'transparent'; ctx.fillStyle = C.ink; ctx.fillText(txt, 0, 0); ctx.restore();
  }
  chip('FAMILY TOWNHOUSES', CX, 980, t, t0 + 0.4, { size: 56 });
  chip('IN SHORT SUPPLY', CX, 1090, t, wt('P3', /^SCARCE/, 0, 0.5) - 0.1, { size: 48, fill: C.gold });
}
const SHOTS = { S1: shotS1, S2: shotS2, S3: shotS3, S4: shotS4, S5: shotS5, P1: shotPrice, P2: shotPrice, P3: shotP3, S6: shotS6, END: shotEND };

// ---- frame --------------------------------------------------------------------------------------------------------------------------
function drawGrain(frame) {
  const r = rng(frame * 2654435761 % 4294967296), ox = (r() * 256) | 0, oy = (r() * 256) | 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.03; ctx.globalCompositeOperation = 'overlay'; ctx.translate(-ox, -oy); ctx.fillStyle = NOISE_PAT; ctx.fillRect(0, 0, W * SS + 256, H * SS + 256); ctx.restore();
}
function draw(t) {
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const seg = segAt(t), lt = t - seg.a;
  // little punch on every cut + on the stat words
  let z = seg.cont ? 1 : 1 + 0.035 * Math.exp(-lt * 9);
  ctx.save(); ctx.translate(CX, H / 2); ctx.scale(z, z); ctx.translate(-CX, -H / 2);
  if (seg.type === 'cam') drawCam(t, seg); else (SHOTS[seg.id] || shotS1)(t, seg);
  ctx.restore();
  drawCaptions(t, seg.id === 'END' ? 1640 : CAP.y);
  if (seg !== TL.segs[0] && !seg.cont) flash(Math.exp(-lt * 12) * 0.14);
  drawGrain(Math.round(t * FPS));
  const fa = 1 - ea(t, 0, 0.1), fb = ea(t, TL.dur - 0.3, TL.dur - 0.02, E.in2), k = Math.max(fa, fb);
  if (k > 0.002) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W * SS, H * SS); ctx.restore(); }
}

async function prepare(t) {
  const seg = segAt(t); let key = '';
  if (seg.id === 'S3') await satEnsure(yasScene(seg.a, seg.b), t);              // satellite tiles for the Yas Island flyover
  if (seg.type === 'cam') {
    const nf = seg.clip === 'hook' ? 137 : 126, k = clamp(Math.round((clamp(t, seg.a, seg.b) - seg.a + seg.c0) * FPS), 0, nf - 1);
    key = seg.clip + k;
    if (key !== CAMK) { [CAMF, CAMM] = await Promise.all([loadImg(`build/cam/${seg.clip}_${pad5(k + 1)}.jpg`), loadImg(`build/cam/m_${seg.clip}_${pad5(k)}.png`).catch(() => null)]); CAMK = key; }
  }
}
async function boot() {
  const q = new URLSearchParams(location.search), ss = +q.get('ss') || 1, cv = document.getElementById('c');
  cv.width = Math.round(W * ss); cv.height = Math.round(H * ss); cv.style.width = W + 'px'; cv.style.height = H + 'px'; setCtx(cv.getContext('2d'), ss);
  TL = await (await fetch('timeline.json')).json();
  await Promise.all([700, 800].flatMap(w => [document.fonts.load(`${w} 40px "Inter Display"`), document.fonts.load(`${w} 40px "Inter"`)]));
  { const g = document.createElement('canvas'); g.width = g.height = 60; const gc = g.getContext('2d'); gc.fillStyle = 'rgba(243,239,230,1)'; gc.beginPath(); gc.arc(30, 30, 1.5, 0, 7); gc.fill(); GRIDP = ctx.createPattern(g, 'repeat'); }
  await Promise.all(Object.entries(IMG_SRC).map(async ([k, s]) => { IMG[k] = await loadImg(s); }));
  const n = document.createElement('canvas'); n.width = n.height = 256; const nc = n.getContext('2d'), id = nc.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = (r() * 255) | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } nc.putImageData(id, 0, 0); NOISE_PAT = ctx.createPattern(n, 'repeat');
  PL = document.createElement('canvas'); PL.width = ctx.canvas.width; PL.height = ctx.canvas.height; TMP = document.createElement('canvas'); TMP.width = ctx.canvas.width; TMP.height = ctx.canvas.height;
  window.draw = draw; window.prepare = prepare; window.TLDUR = TL.dur; window.READY = true;
  if (q.get('t')) { await prepare(+q.get('t')); draw(+q.get('t')); }
}
boot();
