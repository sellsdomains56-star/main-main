'use strict';
// ---------------------------------------------------------------------------
// Compositor.  The reel alternates between two looks, with a punchy zoom move between them:
//   FACE   he is full-screen, big bold captions, punch-in / zoom-out moves, stat overlays on top
//   SPLIT  half-and-half: graphics + the live Abu Dhabi map on top, he sits smaller below, lifted out of his
//          background (RMBG matte) so he stands in front of the map
// window.prepare(t) loads the footage frame (+ matte), window.draw(t) renders one frame.
// ---------------------------------------------------------------------------
let GRID = null, NOISE = null, NOISE_PAT = null, PL = null;
const GRID_STEP = 60;

const OFFSET = 0.04;                      // footage audio sits one frame after the voiceover file the graphics were timed on
// edit decision list (graphics time): [start, end, 1 = FACE | 0 = SPLIT]
const SEG = [[0, 5.62, 1], [5.62, 11.77, 0], [11.77, 13.86, 1], [13.86, 24.46, 0], [24.46, 26.26, 1],
  [26.26, 28.19, 0], [28.19, 31.30, 1], [31.30, 37.90, 0], [37.90, 42.20, 1], [42.20, 99, 0]];
const TR_A = 0.14, TR_B = 0.34;           // a layout change starts just before the cut and settles just after
const ZONE_T = 262, ZONE_B = 1040, ZONE_C = (ZONE_T + ZONE_B) / 2, GS = 0.9;   // upper half-and-half zone for the graphics
const SPLIT_S = 0.64;                     // his scale when sitting in the lower half
let FOOT = null, FOOT_M = null, FOOT_K = -1, ENV = null;

function faceF(tg) {
  let f = SEG[0][2];
  for (let i = 1; i < SEG.length; i++) {
    const b = SEG[i][0]; if (tg < b - TR_A) break;
    f = lerp(SEG[i - 1][2], SEG[i][2], ea(tg, b - TR_A, b + TR_B, E.inOut3));
  }
  return f;
}
// zoom moves on the full-face shots: [time, zoom]. Punch-ins land on the word; slow pushes and zoom-outs between.
const FZ = [[0, 1.0], [1.28, 1.045], [1.52, 1.17], [2.9, 1.11], [4.3, 1.07], [4.74, 1.08], [4.92, 1.22], [5.62, 1.16],
  [11.77, 1.17], [12.5, 1.08], [13.86, 1.15], [24.46, 1.1], [26.26, 1.03], [28.19, 1.04], [29.5, 1.09], [29.68, 1.16], [31.3, 1.1],
  [37.9, 1.27], [41.3, 1.02], [42.2, 1.0]];
function zface(tg) {
  if (tg <= FZ[0][0]) return FZ[0][1];
  for (let i = 0; i < FZ.length - 1; i++) if (tg <= FZ[i + 1][0]) return lerp(FZ[i][1], FZ[i + 1][1], E.inOut2(prog(tg, FZ[i][0], FZ[i + 1][0])));
  return FZ[FZ.length - 1][1];
}
// small "breathing" pulses on his lower-half size, on key words
const PULSES = [[6.80, .035], [8.13, .04], [8.95, .045], [10.46, .05], [13.86, .045], [14.65, .035], [16.21, .04], [19.13, .04], [20.11, .04],
  [21.91, .04], [22.85, .035], [23.36, .035], [26.43, .045], [26.90, .04], [31.36, .04], [33.47, .04], [34.92, .04], [36.22, .04], [42.94, .03], [45.06, .04], [45.53, .055]];
const splitS = tg => SPLIT_S * (1 + PULSES.reduce((a, [t0, am]) => a + (tg > t0 ? am * Math.exp(-(tg - t0) * 7) * (1 - Math.exp(-(tg - t0) * 45)) : 0), 0));

async function prepare(t) {
  const k = clamp(Math.round(t * FPS), 0, 1399), tg = Math.max(0, t - OFFSET), needM = faceF(tg) < 0.999 && k >= 120;
  if (k === FOOT_K && FOOT && (!needM || FOOT_M)) return;
  const load = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const pad = String(k).padStart(5, '0');
  const [f, m] = await Promise.all([load(`build/footage/f_${pad}.jpg`), needM ? load(`build/matte/m_${pad}.png`) : Promise.resolve(null)]);
  FOOT = f; FOOT_M = m; FOOT_K = k;
}
const envAt = t => (ENV ? ENV[clamp(Math.round(t * 100), 0, ENV.length - 1)] : 0.4);

function initAssets() {
  GRID = document.createElement('canvas'); GRID.width = W * SS; GRID.height = (H + GRID_STEP) * SS;
  const g = GRID.getContext('2d'); g.scale(SS, SS); g.fillStyle = 'rgba(243,239,230,1)';
  for (let y = 0; y < H + GRID_STEP; y += GRID_STEP) for (let x = GRID_STEP / 2; x < W; x += GRID_STEP) { g.beginPath(); g.arc(x, y, 1.5, 0, Math.PI * 2); g.fill(); }
  NOISE = document.createElement('canvas'); NOISE.width = NOISE.height = 256;
  const n = NOISE.getContext('2d'), id = n.createImageData(256, 256), r = rng(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = (r() * 255) | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  n.putImageData(id, 0, 0);
  NOISE_PAT = ctx.createPattern(NOISE, 'repeat');
  PL = document.createElement('canvas'); PL.width = ctx.canvas.width; PL.height = ctx.canvas.height;
}

function drawBG(t) {
  glow(180 + 70 * Math.sin(t * 0.21), 700 + 40 * Math.cos(t * 0.17), 820, '233,196,124', 0.05);
  glow(900 + 60 * Math.cos(t * 0.19), 1400 + 50 * Math.sin(t * 0.23), 900, '233,196,124', 0.035);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.drawImage(GRID, 0, -((t * 7) % GRID_STEP), W, H + GRID_STEP); ctx.restore();
  const v = ctx.createRadialGradient(CX, 1000, 360, CX, 1000, 1250);
  v.addColorStop(0, 'rgba(8,8,10,0)'); v.addColorStop(1, 'rgba(8,8,10,0.92)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// him: the full frame (with his room) in FACE shots, the matte cutout in SPLIT shots, blended through the move
function drawPerson(t, tg, F) {
  if (!FOOT) return;
  const env = envAt(t), S = lerp(splitS(tg), zface(tg), F), ay = lerp(H, 770, F), bv = E.inOut2(F);
  const place = c => { c.translate(CX, ay); c.scale(S, S); c.translate(-CX, -ay); };
  if (F < 0.999 && FOOT_M) {
    const o = PL.getContext('2d');
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, PL.width, PL.height);
    o.setTransform(SS, 0, 0, SS, 0, 0); o.save(); place(o);
    o.drawImage(FOOT, 0, 0, W, H);
    o.globalCompositeOperation = 'destination-in'; o.drawImage(FOOT_M, 0, 0, W, H);          // keep only him
    o.globalCompositeOperation = 'destination-out';                                            // melt the table away
    const tf = o.createLinearGradient(0, 1600, 0, 1765); tf.addColorStop(0, 'rgba(0,0,0,0)'); tf.addColorStop(1, 'rgba(0,0,0,1)');
    o.fillStyle = tf; o.fillRect(0, 1585, W, H - 1585); o.restore();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.shadowColor = `rgba(233,196,124,${0.22 + 0.3 * env})`; ctx.shadowBlur = 40 * SS;       // gold rim that breathes with his voice
    ctx.drawImage(PL, 0, 0); ctx.restore();
  }
  if (bv > 0.002) {
    ctx.save(); ctx.globalAlpha *= bv; place(ctx); ctx.drawImage(FOOT, 0, 0, W, H); ctx.restore();
    const g = bv * bv;
    ctx.save(); ctx.globalAlpha = 0.24 * g; ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = '#E9C47C'; ctx.fillRect(0, 0, W, H); ctx.restore();   // warm grade
    const vg = ctx.createRadialGradient(CX, 800, 300, CX, 800, 1100); vg.addColorStop(0, 'rgba(8,8,10,0)'); vg.addColorStop(1, `rgba(8,8,10,${0.55 * g})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const tg1 = ctx.createLinearGradient(0, 0, 0, 330); tg1.addColorStop(0, `rgba(8,8,10,${0.5 * g})`); tg1.addColorStop(1, 'rgba(8,8,10,0)');
    ctx.fillStyle = tg1; ctx.fillRect(0, 0, W, 330);
  }
  // bottom scrim: melts his torso into black under the captions (taller on face shots, where stats sit over his chest)
  const y0 = lerp(1380, 900, F), y1 = lerp(1700, 1260, F), sg = ctx.createLinearGradient(0, y0, 0, H);
  sg.addColorStop(0, 'rgba(8,8,10,0)'); sg.addColorStop(clamp((y1 - y0) / (H - y0)), 'rgba(8,8,10,0.84)'); sg.addColorStop(1, 'rgba(8,8,10,0.94)');
  ctx.fillStyle = sg; ctx.fillRect(0, y0, W, H - y0);
}

function runScene(sc, t) {
  const { a, b } = sc;
  if (t < a - 0.1 || t > b + 0.3) return;
  const inA = ea(t, a - 0.08, a + 0.2, E.out2), inD = (1 - ea(t, a - 0.08, a + 0.55, E.out4)) * 56;
  const outA = sc.last ? 0 : prog(t, b - 0.16, b + 0.1), outD = sc.last ? 0 : E.in3(prog(t, b - 0.16, b + 0.25)) * 46;
  const alpha = inA * (1 - outA);
  if (alpha <= 0.002) return;
  const mid = (sc.box[0] + sc.box[1]) / 2, z = 1 + 0.02 * prog(t, a, b);
  ctx.save(); ctx.globalAlpha *= alpha;
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
  const tg = Math.max(0, t - OFFSET), F = faceF(tg);
  ctx.setTransform(SS, 0, 0, SS, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px';
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  drawBG(tg);
  const jolt = tg > 1.38 && tg < 2.2 ? Math.exp(-(tg - 1.38) * 8) : 0;
  ctx.save(); ctx.translate(Math.sin(tg * 93) * 10 * jolt, Math.cos(tg * 71) * 8 * jolt);
  // upper half: the live map and the graphics scenes
  const A = Math.pow(1 - F, 1.3);
  mapAt(t, tg, A);
  ctx.save(); ctx.beginPath(); ctx.rect(0, ZONE_T - 24, W, ZONE_B - ZONE_T + 50); ctx.clip();
  ctx.globalAlpha *= Math.min(1, A * 1.6);
  for (const sc of SCENES) runScene(sc, tg);
  ctx.restore();
  mapLabels(tg, A);
  // him
  drawPerson(t, tg, F);
  // full-face overlays
  questionOverlay(tg, 1 - prog(tg, 4.2, 4.65));
  ovOutdated(tg); ovBars(tg); ovStat5(tg); ovStat13(tg); ovBigger(tg);
  drawCaptions(tg, F);
  // cut flash
  for (const s of SEG) { const b = s[0]; if (b > 0 && b < 60 && tg > b - 0.02 && tg < b + 0.35) { ctx.save(); ctx.globalAlpha = 0.16 * Math.exp(-(tg - b) * 12); ctx.fillStyle = '#FFE9B8'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
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
    ...[300, 400, 500, 600, 700, 800].flatMap(w => [document.fonts.load(`${w} 40px "Inter Display"`), document.fonts.load(`${w} 40px "Inter"`)]),
  ]);
  await loadLogos(); await loadMap();
  initAssets();
  window.draw = draw; window.prepare = prepare; window.READY = true;
  if (q.get('t')) { await prepare(+q.get('t')); draw(+q.get('t')); }
}
boot();
