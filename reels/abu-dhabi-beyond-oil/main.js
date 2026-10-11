'use strict';
// ---------------------------------------------------------------------------
// Compositor: background, HUD, scene transitions, grain, fades.
// window.draw(t) renders one frame; window.READY flips true once assets load.
// ---------------------------------------------------------------------------
let GRID = null, NOISE = null, NOISE_PAT = null;
const GRID_STEP = 60;

function initAssets() {
  GRID = document.createElement('canvas'); GRID.width = W * SS; GRID.height = (H + GRID_STEP) * SS;
  const g = GRID.getContext('2d'); g.scale(SS, SS); g.fillStyle = 'rgba(243,239,230,1)';
  for (let y = 0; y < H + GRID_STEP; y += GRID_STEP) for (let x = GRID_STEP / 2; x < W; x += GRID_STEP) { g.beginPath(); g.arc(x, y, 1.5, 0, Math.PI * 2); g.fill(); }
  NOISE = document.createElement('canvas'); NOISE.width = NOISE.height = 256;
  const n = NOISE.getContext('2d'), id = n.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = (r() * 255) | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  n.putImageData(id, 0, 0);
  NOISE_PAT = ctx.createPattern(NOISE, 'repeat');
}

function drawBG(t) {
  // soft moving glows
  glow(180 + 70 * Math.sin(t * 0.21), 520 + 40 * Math.cos(t * 0.17), 820, '233,196,124', 0.055);
  glow(900 + 60 * Math.cos(t * 0.19), 1250 + 50 * Math.sin(t * 0.23), 900, '233,196,124', 0.04);
  // drifting dot grid
  ctx.save(); ctx.globalAlpha = 0.085; ctx.drawImage(GRID, 0, -((t * 7) % GRID_STEP), W, H + GRID_STEP); ctx.restore();
  // vignette
  const v = ctx.createRadialGradient(CX, 900, 360, CX, 900, 1250);
  v.addColorStop(0, 'rgba(8,8,10,0)'); v.addColorStop(1, 'rgba(8,8,10,0.92)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

function drawHUD(t) {
  const a = ea(t, 0.0, 0.5);
  T('01', 84, 312, { font: F.i(58), color: C.gold, align: 'left', alpha: a });
  T('ABU DHABI — BEYOND OIL', 150, 306, { font: F.t(600, 19), ls: 9, color: C.dim, align: 'left', alpha: a });
  // speaker chip
  const sw = ea(t, 4.45, 4.75, E.inOut2);
  const pulse = 0.65 + 0.35 * Math.sin(t * 5);
  const chip = (txt, al) => {
    if (al <= 0.003) return;
    const w = M(txt, F.t(600, 19), 9);
    T(txt, 996, 306, { font: F.t(600, 19), ls: 9, color: C.ink, align: 'right', alpha: al * 0.9 });
    dot(996 - w - 22, 298, 6, C.gold, al * pulse);
  };
  chip('INTERVIEWER', a * (1 - sw)); chip('ABDULLAH', a * sw);
  // progress hairline
  const p = clamp(t / DUR);
  line(84, 350, 996, 350, { color: C.faint, w: 2, alpha: a });
  line(84, 350, 84 + 912 * p, 350, { color: C.ink, w: 2, alpha: a * 0.85 });
  dot(84 + 912 * p, 350, 4, C.gold, a);
}

function runScene(sc, t) {
  const { a, b } = sc;
  if (t < a - 0.1 || t > b + 0.3) return;
  const inA = sc.first ? 1 : ea(t, a - 0.08, a + 0.2, E.out2);
  const inD = sc.first ? 0 : (1 - ea(t, a - 0.08, a + 0.55, E.out4)) * 64;
  const outA = sc.last ? 0 : prog(t, b - 0.16, b + 0.1);
  const outD = sc.last ? 0 : E.in3(prog(t, b - 0.16, b + 0.25)) * 54;
  const alpha = inA * (1 - outA);
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(0, 40 + inD - outD);
  const z = 1 + 0.028 * prog(t, a, b);
  ctx.translate(CX, 800); ctx.scale(z, z); ctx.translate(-CX, -800);
  sc.fn(t);
  ctx.restore();
}

function drawGrain(frame) {
  const r = rng(frame * 2654435761 % 4294967296), ox = (r() * 256) | 0, oy = (r() * 256) | 0;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'overlay';
  ctx.translate(-ox, -oy); ctx.fillStyle = NOISE_PAT; ctx.fillRect(0, 0, W * SS + 256, H * SS + 256);
  ctx.restore();
}

function draw(t) {
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  drawBG(t);
  for (const sc of SCENES) runScene(sc, t);
  drawHUD(t);
  drawCaptions(t);
  drawGrain(Math.round(t * FPS));
  // global fades (in/out)
  const fa = 1 - ea(t, 0, 0.1, E.out2), fb = ea(t, DUR - 0.22, DUR - 0.02, E.in2);
  const k = Math.max(fa, fb);
  if (k > 0.002) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W * SS, H * SS); ctx.restore(); }
}

async function boot() {
  const q = new URLSearchParams(location.search);
  const ss = +q.get('ss') || 1;
  const cv = document.getElementById('c');
  cv.width = W * ss; cv.height = H * ss; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  setCtx(cv.getContext('2d'), ss);
  const txt = await (await fetch('timing.txt')).text(); parseTiming(txt);
  await Promise.all([
    document.fonts.load('italic 400 100px "Instrument Serif"'), document.fonts.load('400 100px "Instrument Serif"'),
    ...[300, 400, 500, 600, 700].flatMap(w => [document.fonts.load(`${w} 40px "Inter Display"`), document.fonts.load(`${w} 40px "Inter"`)]),
  ]);
  await loadLogos();
  initAssets();
  window.draw = draw; window.READY = true;
  if (q.get('t')) draw(+q.get('t'));
}
boot();
