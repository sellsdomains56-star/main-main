'use strict';
// ---------------------------------------------------------------------------
// Compositor. Two layouts, one continuous move between them:
//   FULL  (0 -> 4.4 s)   the speaker full-screen while the interviewer asks; graphic overlaid on the footage
//   SPLIT (5.0 s -> end) the footage tucks into a rounded top panel (gold rim that pulses with his voice),
//                        the graphic scenes play in the lower zone at ~85 %.
// window.prepare(t) loads the footage frame, window.draw(t) renders one frame; READY flips when assets load.
// ---------------------------------------------------------------------------
let GRID = null, NOISE = null, NOISE_PAT = null;
const GRID_STEP = 60;

const OFFSET = 0.04;                  // footage audio sits one frame after the voiceover the graphics were timed on
const SPLIT_A = 4.40, SPLIT_B = 5.05; // full -> split transition (graphics time)
const PB = 760;                       // bottom edge of the face panel in split mode
const FOOT_SHIFT = -310;              // footage slides up this much so the face clears the IG top bar
const ZONE_T = 826, ZONE_B = 1552, ZONE_C = (ZONE_T + ZONE_B) / 2, GS = 0.85;
let FOOT = null, FOOT_K = -1, ENV = null;

async function prepare(t) {
  const k = clamp(Math.round(t * FPS), 0, 1399);
  if (k === FOOT_K && FOOT) return;
  const img = new Image(); img.src = `build/footage/f_${String(k).padStart(5, '0')}.jpg`;
  await img.decode(); FOOT = img; FOOT_K = k;
}
const envAt = t => (ENV ? ENV[clamp(Math.round(t * 100), 0, ENV.length - 1)] : 0.4);
const splitP = tg => E.inOut3(prog(tg, SPLIT_A, SPLIT_B));

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
  glow(180 + 70 * Math.sin(t * 0.21), 1100 + 40 * Math.cos(t * 0.17), 820, '233,196,124', 0.055);
  glow(900 + 60 * Math.cos(t * 0.19), 1400 + 50 * Math.sin(t * 0.23), 900, '233,196,124', 0.04);
  ctx.save(); ctx.globalAlpha = 0.085; ctx.drawImage(GRID, 0, -((t * 7) % GRID_STEP), W, H + GRID_STEP); ctx.restore();
  const v = ctx.createRadialGradient(CX, 1150, 360, CX, 1150, 1250);
  v.addColorStop(0, 'rgba(8,8,10,0)'); v.addColorStop(1, 'rgba(8,8,10,0.92)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// bottom outline of the face panel (rounded corners), used for the rim light + progress bar
function seamPath(pb, r) { ctx.beginPath(); ctx.moveTo(0, pb - r); ctx.arcTo(0, pb, r, pb, r); ctx.lineTo(W - r, pb); ctx.arcTo(W, pb, W, pb - r, r); }

function drawFootage(t, tg, P, jolt) {
  const pb = lerp(H, PB, P), r = 58 * P, env = envAt(t);
  ctx.save();
  ctx.beginPath(); ctx.roundRect(0, -120, W, pb + 120, [0, 0, r, r]); ctx.clip();
  ctx.fillStyle = '#0b0b0d'; ctx.fillRect(0, 0, W, pb);
  // slow push-in anchored on the face, with a jolt on the oil crash
  const z = 1 + 0.045 * prog(tg, 0, DUR) + 0.03 * jolt, ay = lerp(770, 460, P), fy = lerp(0, FOOT_SHIFT, P);
  ctx.save(); ctx.translate(CX, ay); ctx.scale(z, z); ctx.translate(-CX, -ay);
  if (FOOT) ctx.drawImage(FOOT, 0, fy, W, H);
  ctx.restore();
  // grade: warm gold cast on the highlights, soft vignette, scrims for the HUD and captions
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(233,196,124,0.24)'; ctx.fillRect(0, 0, W, pb); ctx.restore();
  const vg = ctx.createRadialGradient(CX, ay, 300, CX, ay, 980); vg.addColorStop(0, 'rgba(8,8,10,0)'); vg.addColorStop(1, 'rgba(8,8,10,0.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, pb);
  const tg1 = ctx.createLinearGradient(0, 0, 0, 330); tg1.addColorStop(0, 'rgba(8,8,10,0.62)'); tg1.addColorStop(1, 'rgba(8,8,10,0)');
  ctx.fillStyle = tg1; ctx.fillRect(0, 0, W, 330);
  const bh = lerp(840, 330, P), bg1 = ctx.createLinearGradient(0, pb - bh, 0, pb); bg1.addColorStop(0, 'rgba(8,8,10,0)'); bg1.addColorStop(1, `rgba(8,8,10,${lerp(0.92, 0.84, P)})`);
  ctx.fillStyle = bg1; ctx.fillRect(0, pb - bh, W, bh);
  ctx.restore();
  if (P < 0.01) return;
  // rim light + progress along the panel edge, pulsing with the voice
  ctx.save(); ctx.globalAlpha *= P;
  const gl = ctx.createLinearGradient(0, pb, 0, pb + 100); gl.addColorStop(0, `rgba(233,196,124,${0.10 + 0.16 * env})`); gl.addColorStop(1, 'rgba(233,196,124,0)');
  ctx.fillStyle = gl; ctx.fillRect(0, pb, W, 100);
  seamPath(pb, r); ctx.strokeStyle = 'rgba(243,239,230,0.2)'; ctx.lineWidth = 2; ctx.stroke();
  const px = W * clamp(t / DUR);
  ctx.save(); ctx.beginPath(); ctx.rect(0, pb - 90, px, 180); ctx.clip();
  seamPath(pb, r); ctx.strokeStyle = C.gold; ctx.lineWidth = 3.5; ctx.shadowColor = 'rgba(233,196,124,0.95)'; ctx.shadowBlur = 14 + 34 * env; ctx.stroke(); ctx.restore();
  glow(px, pb, 70, '233,196,124', 0.45 + 0.4 * env); dot(px, pb, 5.5, '#FFF3D0', 1);
  ctx.restore();
}

// full-screen HUD (question beat)
function drawHUDFull(t, tg, A) {
  if (A <= 0.003) return;
  const a = ea(t, 0.0, 0.5) * A;
  T('01', 84, 312, { font: F.i(58), color: C.gold, align: 'left', alpha: a });
  T('ABU DHABI — BEYOND OIL', 150, 306, { font: F.t(600, 19), ls: 9, color: C.ink, align: 'left', alpha: a * 0.7 });
  const pulse = 0.65 + 0.35 * Math.sin(t * 5), w = M('INTERVIEWER', F.t(600, 19), 9);
  T('INTERVIEWER', 996, 306, { font: F.t(600, 19), ls: 9, color: C.ink, align: 'right', alpha: a * 0.95 });
  dot(996 - w - 22, 298, 6, C.gold, a * pulse);
  const p = clamp(t / DUR);
  line(84, 350, 996, 350, { color: 'rgba(243,239,230,0.25)', w: 2, alpha: a });
  line(84, 350, 84 + 912 * p, 350, { color: C.ink, w: 2, alpha: a * 0.9 });
  dot(84 + 912 * p, 350, 4, C.gold, a);
}
// split HUD: one slim row between the face panel and the graphics
function drawHUDSeam(t, P) {
  if (P <= 0.003) return;
  const y = lerp(H, PB, P) + 50, A = P * P;          // the row rides the panel edge while it slides up
  const pulse = 0.65 + 0.35 * Math.sin(t * 5), w = M('ABDULLAH', F.t(600, 17), 8);
  T('01', 56, y + 6, { font: F.i(44), color: C.gold, align: 'left', alpha: A });
  T('ABU DHABI — BEYOND OIL', 104, y, { font: F.t(600, 17), ls: 8, color: C.ink, align: 'left', alpha: A * 0.68 });
  T('ABDULLAH', 1024, y, { font: F.t(600, 17), ls: 8, color: C.ink, align: 'right', alpha: A * 0.95 });
  dot(1024 - w - 20, y - 7, 5, C.gold, A * pulse);
}

function runScene(sc, t) {
  const { a, b } = sc;
  if (t < a - 0.1 || t > b + 0.3) return;
  const inA = ea(t, a - 0.08, a + 0.2, E.out2), inD = (1 - ea(t, a - 0.08, a + 0.55, E.out4)) * 56;
  const outA = sc.last ? 0 : prog(t, b - 0.16, b + 0.1), outD = sc.last ? 0 : E.in3(prog(t, b - 0.16, b + 0.25)) * 46;
  const alpha = inA * (1 - outA);
  if (alpha <= 0.002) return;
  const mid = (sc.box[0] + sc.box[1]) / 2, z = 1 + 0.02 * prog(t, a, b);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(CX, ZONE_C + inD - outD); ctx.scale(GS * z, GS * z); ctx.translate(-CX, -mid);
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
  const tg = Math.max(0, t - OFFSET), P = splitP(tg);
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  drawBG(tg);
  const jolt = tg > 1.38 && tg < 2.2 ? Math.exp(-(tg - 1.38) * 8) : 0;
  ctx.save(); ctx.translate(Math.sin(tg * 93) * 10 * jolt, Math.cos(tg * 71) * 8 * jolt);
  // lower graphics zone (clipped); the footage panel is drawn over it and retracts to reveal it
  ctx.save(); ctx.beginPath(); ctx.rect(0, ZONE_T - 10, W, ZONE_B - ZONE_T + 10); ctx.clip();
  for (const sc of SCENES) runScene(sc, tg);
  ctx.restore();
  drawFootage(t, tg, P, jolt);
  questionOverlay(tg, 1 - prog(tg, 4.2, 4.65));
  drawHUDFull(t, tg, 1 - P); drawHUDSeam(t, P);
  CAP.y = lerp(1376, 724, P);
  drawCaptions(tg);
  ctx.restore();
  if (jolt > 0.01 && tg < 1.5) { ctx.save(); ctx.globalAlpha = 0.2 * Math.exp(-(tg - 1.38) * 16); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  drawGrain(Math.round(t * FPS));
  const fa = 1 - ea(t, 0, 0.1, E.out2), fb = ea(t, DUR - 0.22, DUR - 0.02, E.in2), k = Math.max(fa, fb);
  if (k > 0.002) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W * SS, H * SS); ctx.restore(); }
}

async function boot() {
  const q = new URLSearchParams(location.search);
  const ss = +q.get('ss') || 1;
  const cv = document.getElementById('c');
  cv.width = Math.round(W * ss); cv.height = Math.round(H * ss); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  setCtx(cv.getContext('2d'), ss);
  const txt = await (await fetch('timing.txt')).text(); parseTiming(txt);
  try { ENV = await (await fetch('build/voice_env.json')).json(); } catch (e) { ENV = null; }
  await Promise.all([
    document.fonts.load('italic 400 100px "Instrument Serif"'), document.fonts.load('400 100px "Instrument Serif"'),
    ...[300, 400, 500, 600, 700].flatMap(w => [document.fonts.load(`${w} 40px "Inter Display"`), document.fonts.load(`${w} 40px "Inter"`)]),
  ]);
  await loadLogos();
  initAssets();
  window.draw = draw; window.prepare = prepare; window.READY = true;
  if (q.get('t')) { await prepare(+q.get('t')); draw(+q.get('t')); }
}
boot();
