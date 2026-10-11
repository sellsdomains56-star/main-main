'use strict';
// ---------------------------------------------------------------------------
// Compositor.  Two looks:
//   FACE     he is full-screen with big bold captions and punch-in / zoom-out moves (only the opening question and the
//            "much bigger than oil" line)
//   GRAPHICS no person: one calm hero per beat - clean type/number scenes, real satellite flyovers (satmap.js) and the developers' own renders
// window.prepare(t) loads the footage frame, window.draw(t) renders one frame.
// ---------------------------------------------------------------------------
let OUTLINES_RAW = null, GRID = null, NOISE = null, NOISE_PAT = null, PL = null;
const GRID_STEP = 60;

const OFFSET = 0.04;                      // footage audio sits one frame after the voiceover file the graphics were timed on
// edit decision list (graphics time): [start, end, 1 = FACE | 0 = GRAPHICS]
const SEG = [[0, 5.62, 1], [5.62, 37.90, 0], [37.90, 42.20, 1], [42.20, 99, 0]];
const TR_A = 0.14, TR_B = 0.34;           // a layout change starts just before the cut and settles just after
const HERO_Y = 700, HERO_H = 1000, HERO_MAX = 1.08;   // a text scene's content box is centred at HERO_Y and scaled to fit HERO_H (captions sit below)
let FOOT = null, FOOT_K = -1, ENV = null;

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
  [37.9, 1.27], [41.3, 1.02], [42.2, 1.0]];
function zface(tg) {
  if (tg <= FZ[0][0]) return FZ[0][1];
  for (let i = 0; i < FZ.length - 1; i++) if (tg <= FZ[i + 1][0]) return lerp(FZ[i][1], FZ[i + 1][1], E.inOut2(prog(tg, FZ[i][0], FZ[i + 1][0])));
  return FZ[FZ.length - 1][1];
}
const PHOTO = {}, OUTLINES = {};
async function prepare(t) {
  const tg = Math.max(0, t - OFFSET), load = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const jobs = [];
  const k = clamp(Math.round(t * FPS), 0, 1399);
  if (faceF(tg) > 0.001 && !(k === FOOT_K && FOOT)) jobs.push(load(`build/footage/f_${String(k).padStart(5, '0')}.jpg`).then(im => { FOOT = im; FOOT_K = k; }));
  for (const sc of SCENES) if (sc.kind === 'sat' && tg >= sc.a - 0.2 && tg <= sc.b + 0.5) jobs.push(satEnsure(SAT_SCENES[sc.sat], tg));
  await Promise.all(jobs);
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
}

function drawBG(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#202226'); g.addColorStop(0.5, '#17181B'); g.addColorStop(1, '#101113');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glow(CX, 560, 900, '190,196,206', 0.07 + 0.012 * Math.sin(t * 0.5));                  // one soft cool light, barely moving
  const v = ctx.createRadialGradient(CX, 900, 420, CX, 900, 1300); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// him: the full frame, only in the FACE beats (fades through the cut into / out of the graphics)
function drawPerson(t, tg, F) {
  if (F <= 0.002 || !FOOT) return;
  const S = zface(tg), ay = 770, bv = E.inOut2(F);
  ctx.save(); ctx.globalAlpha *= bv; ctx.translate(CX, ay); ctx.scale(S, S); ctx.translate(-CX, -ay); ctx.drawImage(FOOT, 0, 0, W, H); ctx.restore();
  const g = bv * bv;
  ctx.save(); ctx.globalAlpha = 0.5 * g; ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H); ctx.restore();   // a little less saturated: calmer, more neutral
  const vg = ctx.createRadialGradient(CX, 800, 300, CX, 800, 1100); vg.addColorStop(0, 'rgba(12,13,15,0)'); vg.addColorStop(1, `rgba(12,13,15,${0.55 * g})`);
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg1 = ctx.createLinearGradient(0, 0, 0, 330); tg1.addColorStop(0, `rgba(12,13,15,${0.5 * g})`); tg1.addColorStop(1, 'rgba(12,13,15,0)');
  ctx.fillStyle = tg1; ctx.fillRect(0, 0, W, 330);
  // bottom scrim under the captions
  const y0 = 900, y1 = 1260, sg = ctx.createLinearGradient(0, y0, 0, H);
  sg.addColorStop(0, 'rgba(12,13,15,0)'); sg.addColorStop(clamp((y1 - y0) / (H - y0)), `rgba(12,13,15,${0.84 * g})`); sg.addColorStop(1, `rgba(12,13,15,${0.94 * g})`);
  ctx.fillStyle = sg; ctx.fillRect(0, y0, W, H - y0);
}

function runScene(sc, t) {
  if (sc.kind === 'sat') return runSat(sc, t);
  const { a, b } = sc;
  if (t < a - 0.1 || t > b + 0.3) return;
  const inA = ea(t, a - 0.08, a + 0.2, E.out2), inD = (1 - ea(t, a - 0.08, a + 0.55, E.out4)) * 56;
  const outA = sc.last ? 0 : prog(t, b - 0.16, b + 0.1), outD = sc.last ? 0 : E.in3(prog(t, b - 0.16, b + 0.25)) * 46;
  const alpha = inA * (1 - outA);
  if (alpha <= 0.002) return;
  const mid = (sc.box[0] + sc.box[1]) / 2, fit = Math.min(HERO_MAX, HERO_H / (sc.box[1] - sc.box[0])), z = fit * (1 + 0.02 * prog(t, a, b));
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.translate(CX, HERO_Y + inD - outD); ctx.scale(z, z); ctx.translate(-CX, -mid);
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
  // graphics beats: one hero per beat
  const A = Math.pow(1 - F, 1.3);
  ctx.save(); ctx.globalAlpha *= Math.min(1, A * 1.6);
  for (const sc of SCENES) runScene(sc, tg);
  ctx.restore();
  // face beats
  drawPerson(t, tg, F);
  ovOutdated(tg); ovBigger(tg);
  drawCaptions(tg, F);
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
  await loadLogos();
  OUTLINES_RAW = await (await fetch('outlines.json')).json(); Object.assign(OUTLINES, OUTLINES_RAW);
  for (const [k, f] of [['talay', 'talay.jpg'], ['yasriva', 'yasriva.jpg'], ['hudayriyat', 'hudayriyat.jpg']]) PHOTO[k] = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.src = `build/photos/${f}`; });
  initAssets();
  window.draw = draw; window.prepare = prepare; window.READY = true;
  if (q.get('t')) { await prepare(+q.get('t')); draw(+q.get('t')); }
}
boot();
