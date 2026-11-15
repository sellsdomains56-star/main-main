import * as THREE from 'three';
import { G, clamp, rnd } from './state.js';
import { buildWorld } from './dubai.js';
import { loadAssets } from './assets.js';
import { AudioEngine } from './audio.js';
import * as FX from './effects.js';
import * as HUD from './hud.js';
import { Player } from './player.js';
import { Bot } from './bots.js';
import { updateGrenades, clearGrenades } from './combat.js';
import { WEAPON_ORDER } from './weapons.js';

(async () => {
const $ = (id) => document.getElementById(id);
G.debug = new URLSearchParams(location.search).has('debug');

/* ------------------------------------------------------------------ renderer / scenes */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
let basePR = Math.min(window.devicePixelRatio || 1, 1.5), curPR = basePR;
renderer.setPixelRatio(curPR);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.autoClear = false;
$('game').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xd9c9ae, 90, 620);
const camera = new THREE.PerspectiveCamera(78, innerWidth / innerHeight, 0.05, 3500);
scene.add(camera);
const vmScene = new THREE.Scene();
const vmCam = new THREE.PerspectiveCamera(56, innerWidth / innerHeight, 0.07, 6);
G.scene = scene; G.camera = camera; G.renderer = renderer;

await loadAssets((p) => { const l = document.getElementById('loading'); if (l) l.textContent = 'LOADING ' + Math.round(p * 100) + '%'; });
const world = buildWorld(scene);
G.world = world;

// lighting
const hemi = new THREE.HemisphereLight(0xbcd4f0, 0xc9b08a, 1.45);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d6, 3.4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -58; sun.shadow.camera.right = 58; sun.shadow.camera.top = 58; sun.shadow.camera.bottom = -58;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 400;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);
const sunDir = world.sunLight.dir;

// image based lighting from the sky
const pm = new THREE.PMREMGenerator(renderer);
const env = pm.fromEquirectangular(world.skyT).texture;
scene.environment = env; vmScene.environment = env;

vmScene.add(new THREE.HemisphereLight(0xbfd0f0, 0x4a3a2c, 1.4));
const vmSun = new THREE.DirectionalLight(0xffd2a0, 2.6); vmSun.position.set(-0.4, 1, 0.6); vmScene.add(vmSun);

/* ------------------------------------------------------------------ systems */
G.audio = new AudioEngine();
FX.initEffects(scene);
HUD.init();
const player = new Player(vmScene, vmCam);
G.player = player;
vmScene.traverse((o) => { if (o.material && o.material.isMeshStandardMaterial) o.material.envMapIntensity = 0.9; });

const ALLY_NAMES = ['REYES', 'HAYES', 'TANAKA', 'MERCER'];
const ENEMY_NAMES = ['VOLKOV', 'OKAFOR', 'LINDQVIST', 'DUARTE', 'KOWALSKI'];
G.bots = [];
for (let i = 0; i < 4; i++) G.bots.push(new Bot(i, ALLY_NAMES[i], 0));
for (let i = 0; i < 5; i++) G.bots.push(new Bot(10 + i, ENEMY_NAMES[i], 1));
G.actors = [player, ...G.bots];

G.spawnCenter = (team) => {
  const l = world.spawns[team]; let x = 0, z = 0;
  for (const s of l) { x += s.x; z += s.z; }
  return { x: x / l.length, z: z / l.length };
};
function pickSpawn(a) {
  const list = world.spawns[a.team]; let best = list[0], bs = -1e9;
  for (const s of list) {
    let md = 1e9;
    for (const o of G.actors) {
      if (!o.alive || o === a) continue;
      const d = Math.hypot(o.pos.x - s.x, o.pos.z - s.z);
      md = Math.min(md, o.team !== a.team ? d : d * 2.5);
    }
    const score = md + rnd(0, 10);
    if (score > bs) { bs = score; best = s; }
  }
  return { x: best.x + rnd(-1, 1), z: best.z + rnd(-1, 1) };
}
G.respawnActor = (a) => {
  const p = pickSpawn(a), en = G.spawnCenter(1 - a.team);
  if (a.isPlayer) a.respawn(p, Math.atan2(-(en.x - p.x), -(en.z - p.z)));
  else a.spawnAt(p);
};

/* ------------------------------------------------------------------ input */
const keys = {}, mouse = { fire: false, ads: false, firedThisPress: false };
window.__keys = keys; window.__mouse = mouse; window.__G = G;
let locked = false;

addEventListener('keydown', (e) => {
  if (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
  if (e.repeat) return;
  keys[e.code] = true;
  if (G.state !== 'playing') return;
  if (e.code.startsWith('Digit')) { const n = +e.code.slice(5) - 1; if (n >= 0 && n < WEAPON_ORDER.length) player.switchTo(n); }
  else if (e.code === 'KeyR') player.startReload();
  else if (e.code === 'KeyG') player.throwNade();
  else if (e.code === 'KeyQ') player.switchTo(player.last);
  else if (e.code === 'Tab') HUD.showScoreboard(true);
  else if (e.code === 'KeyM') { G.audio.muted = !G.audio.muted; HUD.message(G.audio.muted ? 'SOUND OFF' : 'SOUND ON', 900); }
  else if (e.code === 'F3') showFps = !showFps;
  HUD.hideHint();
});
addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (e.code === 'Tab') HUD.showScoreboard(false);
});
addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouse.fire = mouse.ads = false; HUD.showScoreboard(false); });
renderer.domElement.addEventListener('mousedown', (e) => {
  if (G.state !== 'playing') return;
  if (!locked && !G.debug) { requestLock(); return; }
  if (e.button === 0) mouse.fire = true;
  if (e.button === 2) mouse.ads = true;
  G.audio.resume();
});
addEventListener('mouseup', (e) => { if (e.button === 0) mouse.fire = false; if (e.button === 2) mouse.ads = false; });
addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('mousemove', (e) => {
  if (G.state !== 'playing' || !(locked || G.debug) || !player.alive) return;
  const mx = clamp(e.movementX || 0, -250, 250), my = clamp(e.movementY || 0, -250, 250);
  player.look(mx, my);
});
addEventListener('wheel', (e) => { if (G.state === 'playing' && player.alive) player.cycle(e.deltaY > 0 ? 1 : -1); }, { passive: true });

function requestLock() {
  const c = renderer.domElement;
  try { const p = c.requestPointerLock({ unadjustedMovement: true }); if (p && p.catch) p.catch(() => { try { c.requestPointerLock(); } catch (_) {} }); }
  catch (_) { try { c.requestPointerLock(); } catch (__) {} }
}
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === renderer.domElement;
  if (locked) {
    if (G.state === 'paused') { G.state = 'playing'; $('pause').classList.remove('on'); }
  } else if (G.state === 'playing' && !G.debug) {
    G.state = 'paused'; $('pause').classList.add('on'); mouse.fire = mouse.ads = false;
  }
});

/* ------------------------------------------------------------------ menu / match flow */
function seg(id, cb) {
  const root = $(id);
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    root.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    cb(b.dataset.v);
  });
}
seg('diff', (v) => (G.settings.diff = +v));
seg('qual', (v) => applyQuality(v));
$('sens').addEventListener('input', (e) => { G.settings.sens = +e.target.value; $('sensV').textContent = (+e.target.value).toFixed(1); });
$('fov').addEventListener('input', (e) => { G.settings.fov = +e.target.value; $('fovV').textContent = e.target.value; });

function applyQuality(q) {
  G.settings.quality = q;
  const low = q === 'low';
  sun.castShadow = !low;
  basePR = low ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  curPR = basePR; renderer.setPixelRatio(curPR); renderer.setSize(innerWidth, innerHeight);
}

function startMatch() {
  G.audio.init(); G.audio.resume();
  clearGrenades();
  G.scores = [0, 0]; G.matchTime = 0; G.time = 0; G.shake = 0;
  player.kills = player.deaths = player.score = player.streak = 0;
  for (const b of G.bots) { b.kills = b.deaths = b.score = 0; b.alive = false; }
  // initial spawns: unique spots per team
  const used = [0, 0];
  for (const a of G.actors) {
    const list = world.spawns[a.team], sp = list[used[a.team]++ % list.length];
    const en = G.spawnCenter(1 - a.team), p = { x: sp.x, z: sp.z };
    if (a.isPlayer) a.respawn(p, Math.atan2(-(en.x - p.x), -(en.z - p.z)));
    else a.spawnAt(p);
  }
  document.body.className = '';
  $('menu').classList.remove('on'); $('end').classList.remove('on'); $('pause').classList.remove('on');
  HUD.showDeath('', false);
  document.getElementById('hint').style.opacity = 1;
  G.state = 'playing';
  if (!G.debug) requestLock();
  HUD.message('ELIMINATE THE HOSTILES', 2200);
}
G.endMatch = () => {
  if (G.state !== 'playing') return;
  G.state = 'ended';
  if (document.pointerLockElement) document.exitPointerLock();
  mouse.fire = mouse.ads = false;
  document.body.className = 'ended';
  const win = G.scores[0] > G.scores[1], draw = G.scores[0] === G.scores[1];
  $('endTitle').textContent = draw ? 'DRAW' : win ? 'VICTORY' : 'DEFEAT';
  $('endTitle').className = win ? 'win' : 'lose';
  const kd = (player.kills / Math.max(1, player.deaths)).toFixed(2);
  $('endStats').innerHTML = `ALLIES <b>${G.scores[0]}</b> — <b>${G.scores[1]}</b> HOSTILES<br>YOUR KILLS <b>${player.kills}</b> · DEATHS <b>${player.deaths}</b> · K/D <b>${kd}</b> · SCORE <b>${player.score}</b>`;
  setTimeout(() => $('end').classList.add('on'), 900);
};
$('deploy').addEventListener('click', startMatch);
$('again').addEventListener('click', startMatch);
$('resume').addEventListener('click', () => requestLock());
$('pause').addEventListener('click', (e) => { if (e.target.id === 'pause') requestLock(); });
$('quit').addEventListener('click', () => {
  G.state = 'menu'; document.body.className = 'menu';
  $('pause').classList.remove('on'); $('menu').classList.add('on');
});

/* ------------------------------------------------------------------ main loop */
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  vmCam.aspect = innerWidth / innerHeight; vmCam.updateProjectionMatrix();
});

let last = performance.now(), frames = 0, fpsT = 0, fps = 0, showFps = false, frameAcc = 0, frameN = 0, adaptCd = 3;
const snap = new THREE.Vector3();

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 1 / 20); last = now;
  frames++; fpsT += dt; frameAcc += dt; frameN++;
  if (fpsT >= 0.5) { fps = Math.round(frames / fpsT); frames = 0; fpsT = 0; }

  // adaptive resolution keeps things smooth on weaker laptops
  adaptCd -= dt;
  if (adaptCd <= 0 && frameN > 30) {
    const avg = frameAcc / frameN;
    if (avg > 0.0215 && curPR > 0.6) { curPR = Math.max(0.6, curPR - 0.15); renderer.setPixelRatio(curPR); renderer.setSize(innerWidth, innerHeight); }
    else if (avg < 0.0135 && curPR < basePR) { curPR = Math.min(basePR, curPR + 0.1); renderer.setPixelRatio(curPR); renderer.setSize(innerWidth, innerHeight); }
    frameAcc = 0; frameN = 0; adaptCd = 2.5;
  }

  if (G.state === 'playing') {
    G.time += dt; G.matchTime += dt;
    if (G.matchTime >= G.matchLimit && G.state === 'playing') G.endMatch();
    player.update(dt, keys, mouse);
    for (const b of G.bots) b.update(dt);
    updateGrenades(dt);
    G.shake = Math.max(0, G.shake - dt * 2.2);
    HUD.update(dt, showFps ? fps : 0);
  } else if (G.state === 'menu' || G.state === 'ended' || G.state === 'paused') {
    if (G.state === 'menu' || G.state === 'ended') {
      G.time += dt; const a = G.time * 0.08;
      camera.position.set(Math.cos(a) * 150, 34 + Math.sin(a * 1.7) * 6, Math.sin(a) * 150);
      camera.lookAt(0, 60, 0); camera.fov = 62; camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
    }
  }
  FX.updateEffects(dt);

  // sun / shadow follows the camera (snapped to avoid shimmering)
  snap.set(Math.round(camera.position.x / 2) * 2, 0, Math.round(camera.position.z / 2) * 2);
  sun.target.position.copy(snap);
  sun.position.copy(snap).addScaledVector(sunDir, 200);

  renderer.clear();
  renderer.render(scene, camera);
  if (G.state !== 'menu' && player.alive && !(G.state === 'ended')) {
    renderer.clearDepth();
    HUD_scope();
    renderer.render(vmScene, vmCam);
  }
}
function HUD_scope() { HUD.showScope(player.scoped()); }

$('loading').style.opacity = 0;
setTimeout(() => $('loading').remove(), 700);
applyQuality('high');
requestAnimationFrame(frame);
if (G.debug) { window.__start = startMatch; }

})();
