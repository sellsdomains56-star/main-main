'use strict';
// ---------------------------------------------------------------------------
// Compositor (the Abu Dhabi look). Two kinds of beat, crossfaded:
//   FACE      he is full-screen (4K source, reframed), warm grade, punch-in / zoom-out moves, small black-on-white captions
//   GRAPHICS  no person: one calm hero per beat - type / number scenes, real satellite flyovers (satmap.js)
// scenes.js defines buildScenes(): { FACE_SEGS, PUNCHES, SCENES, OVERLAYS, cues }.   window.prepare(t) loads what a frame needs, window.draw(t) renders it.
// ---------------------------------------------------------------------------
let TL = null, GRID = null, NOISE_PAT = null, FOOT = null, FOOT_K = -1, CFG = null;
const OUTLINES = {};
const GRID_STEP = 60, PIV = [430, 760];                     // zoom pivot: his face stays in frame when punching in
const HERO_Y = 800, HERO_H = 940, HERO_MAX = 1.0;          // a scene's content box is centred at HERO_Y and scaled to fit HERO_H: that is y 330-1270, inside the Reels safe zone (captions sit at ~1372)
const pad5 = n => String(n).padStart(5, '0');

function faceF(t) {                                          // 1 on the face beats, 0 on the graphics beats
  let f = 0;
  for (const [a, b] of CFG.FACE_SEGS) f += (a <= 0.001 ? 1 : E.inOut3(prog(t, a - 0.12, a + 0.28))) - E.inOut3(prog(t, b - 0.12, b + 0.28));
  return clamp(f);
}
function faceZoom(t) {                                       // a slow push over each face beat + a quick punch on key words
  let z = 1.05;
  for (const [a, b] of CFG.FACE_SEGS) if (t >= a - 0.4 && t <= b + 0.4) z = lerp(1.05, 1.13, prog(t, a, b));
  for (const [t0, am] of CFG.PUNCHES) if (t > t0) z += am * Math.exp(-(t - t0) * 6) * (1 - Math.exp(-(t - t0) * 40));
  return z;
}
function initAssets() {
  GRID = document.createElement('canvas'); GRID.width = W * SS; GRID.height = (H + GRID_STEP) * SS;
  const g = GRID.getContext('2d'); g.scale(SS, SS); g.fillStyle = 'rgba(243,239,230,1)';
  for (let y = 0; y < H + GRID_STEP; y += GRID_STEP) for (let x = GRID_STEP / 2; x < W; x += GRID_STEP) { g.beginPath(); g.arc(x, y, 1.5, 0, Math.PI * 2); g.fill(); }
  const n = document.createElement('canvas'); n.width = n.height = 256;
  const nc = n.getContext('2d'), id = nc.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = (r() * 255) | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  nc.putImageData(id, 0, 0); NOISE_PAT = ctx.createPattern(n, 'repeat');
}
let DUST = null;
function drawDust(t) {                                           // a few slow motes of light, parallax by size: keeps the black alive without adding clutter
  if (!DUST) { const r = rng(21); DUST = Array.from({ length: 26 }, () => ({ x: r() * W, y: r() * H, s: 1.2 + r() * 2.6, v: 6 + r() * 16, ph: r() * 6.28, a: 0.10 + r() * 0.22 })); }
  ctx.save(); for (const d of DUST) { const y = ((d.y - t * d.v) % H + H) % H, x = d.x + Math.sin(t * 0.3 + d.ph) * 22; ctx.globalAlpha = d.a * (0.7 + 0.3 * Math.sin(t * 1.3 + d.ph)); ctx.fillStyle = d.s > 2.4 ? '#E9C47C' : '#F3EFE6'; ctx.beginPath(); ctx.arc(x, y, d.s, 0, 7); ctx.fill(); } ctx.restore();
}
function drawCutSweep(t) {                                       // a quick gold light sweep across the screen on every beat change
  for (const tc of CFG.CUTS || []) {
    const p = prog(t, tc - 0.2, tc + 0.32); if (p <= 0 || p >= 1) continue;
    const y = lerp(-300, H + 300, E.inOut2(p)), a = Math.sin(Math.PI * p) * 0.34, g = ctx.createLinearGradient(0, y - 260, 0, y + 260);
    g.addColorStop(0, 'rgba(233,196,124,0)'); g.addColorStop(0.5, `rgba(255,236,190,${a})`); g.addColorStop(1, 'rgba(233,196,124,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, y - 260, W, 520); ctx.restore();
  }
}
function drawBG(t) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  glow(180 + 70 * Math.sin(t * 0.21), 700 + 40 * Math.cos(t * 0.17), 820, '233,196,124', 0.05);
  glow(900 + 60 * Math.cos(t * 0.19), 1400 + 50 * Math.sin(t * 0.23), 900, '233,196,124', 0.035);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.drawImage(GRID, 0, -((t * 7) % GRID_STEP), W, H + GRID_STEP); ctx.restore();
  const v = ctx.createRadialGradient(CX, 1000, 360, CX, 1000, 1250); v.addColorStop(0, 'rgba(8,8,10,0)'); v.addColorStop(1, 'rgba(8,8,10,0.92)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  drawDust(t);
}
// him: the full frame, only in the FACE beats (fades through the cut into / out of the graphics)
function drawPerson(t, F) {
  if (F <= 0.002 || !FOOT) return;
  const S = faceZoom(t), bv = E.inOut2(F), g = bv * bv;
  const PV = CFG.PIV || PIV; ctx.save(); ctx.globalAlpha *= bv; ctx.translate(PV[0], PV[1]); ctx.scale(S, S); ctx.translate(-PV[0], -PV[1]); ctx.drawImage(FOOT, 0, 0, W, H); ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.24 * g; ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = '#E9C47C'; ctx.fillRect(0, 0, W, H); ctx.restore();   // warm grade
  const vg = ctx.createRadialGradient(CX, 800, 300, CX, 800, 1100); vg.addColorStop(0, 'rgba(8,8,10,0)'); vg.addColorStop(1, `rgba(8,8,10,${0.5 * g})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg1 = ctx.createLinearGradient(0, 0, 0, 300); tg1.addColorStop(0, `rgba(8,8,10,${0.45 * g})`); tg1.addColorStop(1, 'rgba(8,8,10,0)'); ctx.fillStyle = tg1; ctx.fillRect(0, 0, W, 300);
  const y0 = 1050, y1 = 1400, sg = ctx.createLinearGradient(0, y0, 0, H);                  // bottom scrim under the captions
  sg.addColorStop(0, 'rgba(8,8,10,0)'); sg.addColorStop(clamp((y1 - y0) / (H - y0)), `rgba(8,8,10,${0.8 * g})`); sg.addColorStop(1, `rgba(8,8,10,${0.92 * g})`);
  ctx.fillStyle = sg; ctx.fillRect(0, y0, W, H - y0);
}
function runScene(sc, t) {
  if (sc.kind === 'sat') return runSat(sc, t);
  if (sc.kind === 'page') return runPage(sc, t);
  const { a, b } = sc;
  if (t < a - 0.1 || t > b + 0.3) return;
  const inA = ea(t, a - 0.08, a + 0.18, E.out2), inD = (1 - ea(t, a - 0.08, a + 0.5, E.out5)) * 96;
  const outA = sc.last ? 0 : prog(t, b - 0.16, b + 0.1), outD = sc.last ? 0 : E.in3(prog(t, b - 0.16, b + 0.25)) * 46;
  const alpha = inA * (1 - outA); if (alpha <= 0.002) return;
  const mid = (sc.box[0] + sc.box[1]) / 2, fit = Math.min(HERO_MAX, HERO_H / (sc.box[1] - sc.box[0])), z = fit * (1 + 0.03 * prog(t, a, b)) * lerp(0.94, 1, ea(t, a - 0.08, a + 0.5, E.out5));
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(CX, HERO_Y + inD - outD); ctx.scale(z, z); ctx.translate(-CX, -mid); sc.fn(t); ctx.restore();
}
function drawGrain(frame) {
  const r = rng(frame * 2654435761 % 4294967296), ox = (r() * 256) | 0, oy = (r() * 256) | 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'overlay';
  ctx.translate(-ox, -oy); ctx.fillStyle = NOISE_PAT; ctx.fillRect(0, 0, W * SS + 256, H * SS + 256); ctx.restore();
}
// him as a small round "live video" bubble that stays on screen. CFG.BUBBLE = { t0, keys: [{t, cx, cy, r}], src: {cx, cy, size} (crop of the 1080x1920 footage frame) }:
// the bubble glides between keys (eased) and its ring glows while he speaks.
function bubbleAt(t) {
  const ks = CFG.BUBBLE.keys; let i = 0; while (i < ks.length - 2 && t > ks[i + 1].t) i++;
  const A = ks[i], B = ks[Math.min(i + 1, ks.length - 1)], u = B.t > A.t ? E.inOut3(prog(t, A.t, B.t)) : 1;
  return { cx: lerp(A.cx, B.cx, u), cy: lerp(A.cy, B.cy, u), r: lerp(A.r, B.r, u) };
}
function speakingAt(t) { for (const w of WORDS) if (t >= w.t - 0.05 && t <= w.end + 0.1) return 1; return 0; }
function drawBubble(t) {
  const B = CFG.BUBBLE, PH = B.img ? IMG[B.img] : null; if (!PH && !FOOT) return;                    // B.img = a still portrait (IMAGES id) instead of the live footage
  const { cx, cy, r } = bubbleAt(t), S = B.src || {}, sp = Math.max(speakingAt(t), 0.55 * speakingAt(t - 0.12), 0.3 * speakingAt(t - 0.25)), a = ea(t, B.t0 ?? 0, (B.t0 ?? 0) + 0.5, E.out4), s0 = lerp(0.6, 1, a);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(cx, cy); ctx.scale(s0, s0);
  glow(0, 0, r * 1.9, '233,196,124', 0.10 + 0.22 * sp);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30 * SS; ctx.shadowOffsetY = 10 * SS; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = '#111'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r - 3, 0, 7); ctx.clip();
  if (PH) ctx.drawImage(PH, -r, -r, 2 * r, 2 * r);
  else { const sz = S.size, sx = clamp(S.cx - sz / 2, 0, 1080 - sz), sy = clamp(S.cy - sz / 2, 0, 1920 - sz), kx = FOOT.naturalWidth / 1080, ky = FOOT.naturalHeight / 1920; ctx.drawImage(FOOT, sx * kx, sy * ky, sz * kx, sz * ky, -r, -r, 2 * r, 2 * r); }
  const g = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r); g.addColorStop(0, 'rgba(8,8,10,0)'); g.addColorStop(1, 'rgba(8,8,10,0.38)'); ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r);   // soft vignette
  ctx.restore();
  ring(0, 0, r - 1, { color: C.gold, w: 5 });
  ring(0, 0, r + 10 + 6 * sp, { color: C.gold, w: 2.5, alpha: 0.22 + 0.5 * sp });                                    // speaking pulse
  ctx.restore();
}
function draw(t) {
  const F = faceF(t);
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px';
  drawBG(t);
  const A = Math.pow(1 - F, 1.3);
  ctx.save(); ctx.globalAlpha *= Math.min(1, A * 1.6); for (const sc of CFG.SCENES) runScene(sc, t); ctx.restore();
  drawPerson(t, F);
  for (const ov of CFG.OVERLAYS) ov(t);
  if (CFG.BUBBLE) drawBubble(t);
  drawCutSweep(t);
  drawCaptions(t, F);
  drawGrain(Math.round(t * FPS));
  const fa = 1 - ea(t, 0, 0.1, E.out2), fb = ea(t, DUR - 0.22, DUR - 0.02, E.in2), k = Math.max(fa, fb);
  if (k > 0.002) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W * SS, H * SS); ctx.restore(); }
}
async function prepare(t) {
  const load = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const jobs = [], k = clamp(Math.round(t * FPS), 0, Math.min(TL.frames - 1, CFG.FOOT_MAX ?? 1e9));
  if ((faceF(t) > 0.001 || (CFG.BUBBLE && !CFG.BUBBLE.img)) && !(k === FOOT_K && FOOT)) jobs.push(load(`build/footage/f_${pad5(k)}.jpg`).then(im => { FOOT = im; FOOT_K = k; }));
  for (const sc of CFG.SCENES) if (sc.kind === 'sat' && t >= sc.a - 0.2 && t <= sc.b + 0.5) jobs.push(satEnsure(SAT_SCENES[sc.id], t));
  await Promise.all(jobs);
}
async function boot() {
  const q = new URLSearchParams(location.search), ss = +q.get('ss') || 1, cv = document.getElementById('c');
  cv.width = Math.round(W * ss); cv.height = Math.round(H * ss); cv.style.width = W + 'px'; cv.style.height = H + 'px'; setCtx(cv.getContext('2d'), ss);
  TL = await (await fetch('timeline.json')).json(); DUR = TL.dur; parseTimeline(TL);
  try { Object.assign(OUTLINES, await (await fetch('outlines.json')).json()); } catch (e) { /* no island outlines in this reel */ }
  await Promise.all([700, 800].flatMap(w => [document.fonts.load(`${w} 40px "Inter Display"`), document.fonts.load(`${w} 40px "Inter"`)]));
  await loadLogos();
  CFG = buildScenes();
  await Promise.all(Object.entries(CFG.IMAGES || {}).map(([id, src]) => new Promise(res => { const im = new Image(); im.onload = () => { IMG[id] = im; res(); }; im.onerror = () => { console.error('image missing: ' + src); res(); }; im.src = src; })));
  initAssets();
  window.draw = draw; window.prepare = prepare; window.READY = true;
  if (q.get('t')) { await prepare(+q.get('t')); draw(+q.get('t')); }
}
boot();
