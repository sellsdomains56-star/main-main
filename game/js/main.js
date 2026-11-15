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
import { BR, initBR, startBR, stopBR, updateBR, spawnLoot } from './br.js';

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

const NAMES = ['REYES', 'HAYES', 'TANAKA', 'MERCER', 'VOLKOV', 'OKAFOR', 'LINDQVIST', 'DUARTE', 'KOWALSKI', 'NAKAMURA', 'BAUER', 'SILVA', 'PETROV', 'ADEYEMI', 'MORALES', 'JENSEN', 'COSTA', 'IVANOV', 'KHAN', 'ROSSI',
  'DUBOIS', 'NOVAK', 'YILMAZ', 'HERRERA', 'OLSEN', 'FISCHER', 'MENDES', 'SATO', 'KRUGER', 'VARGA', 'LEMOINE', 'ORTEGA', 'HOLT', 'BRANDT', 'ZHOU', 'MALIK', 'STONE', 'VEGA', 'RAHMAN'];
const allBots = NAMES.map((n, i) => new Bot(i, n, i < 4 ? 0 : 1));
G.bots = allBots; G.actors = [player, ...allBots]; G.mode = 'br';
player.avatar = new Bot(-1, 'YOU', 0, { puppet: true });
initBR(scene);
G.onKill = (victim) => { if (G.mode === 'br' && !victim.isPlayer && Math.random() < 0.85) spawnLoot(victim.pos.x + rnd(-0.6, 0.6), victim.pos.z + rnd(-0.6, 0.6)); };

G.spawnCenter = (team) => {
  if (G.mode === 'br') return { x: BR.zone.x, z: BR.zone.z };
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
const keys = {}, mouse = { fire: false, ads: false, firedThisPress: false }, btn = { l: false, r: false, adsToggle: false };
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
  else if (e.code === 'KeyV') { player.tpv = !player.tpv; HUD.message(player.tpv ? 'THIRD PERSON' : 'FIRST PERSON', 900); }
  else if (e.code === 'KeyE') btn.adsToggle = !btn.adsToggle;
  else if (e.code === 'KeyH') player.heal();
  else if (e.code === 'Tab') HUD.showScoreboard(true);
  else if (e.code === 'KeyM') { G.audio.muted = !G.audio.muted; HUD.message(G.audio.muted ? 'SOUND OFF' : 'SOUND ON', 900); }
  else if (e.code === 'F3') showFps = !showFps;
  HUD.hideHint();
});
addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (e.code === 'Tab') HUD.showScoreboard(false);
});
addEventListener('blur', () => { for (const k in keys) keys[k] = false; btn.l = btn.r = btn.adsToggle = false; HUD.showScoreboard(false); });
renderer.domElement.addEventListener('mousedown', (e) => {
  if (G.state !== 'playing') return;
  if (!locked && !G.debug) { requestLock(); return; }
  if (e.button === 0) btn.l = true;
  if (e.button === 2) btn.r = true;
  G.audio.resume();
});
addEventListener('mouseup', (e) => { if (e.button === 0) btn.l = false; if (e.button === 2) btn.r = false; });
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
    G.state = 'paused'; $('pause').classList.add('on'); btn.l = btn.r = false;
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
seg('mode', (v) => { G.mode = v; $('modeLine').textContent = v === 'br' ? 'BATTLE ROYALE · 40 PLAYERS · LAST ONE STANDING' : 'TEAM DEATHMATCH · 5 vs 5 · FIRST TO 40'; });
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
  clearGrenades(); stopBR();
  G.scores = [0, 0]; G.matchTime = 0; G.time = 0; G.shake = 0; btn.adsToggle = false;
  player.kills = player.deaths = player.score = player.streak = 0; player.phase = 'ground'; player.team = 0;
  for (const b of allBots) { b.kills = b.deaths = b.score = 0; b.alive = false; b.inPlane = false; b.dropping = false; b.chute.visible = false; b.model.visible = false; if (b.tag) b.tag.visible = false; }
  const br = G.mode === 'br';
  G.bots = br ? allBots : allBots.slice(0, 9);
  G.actors = [player, ...G.bots];
  G.bots.forEach((b, i) => b.setLook(br ? i + 1 : i < 4 ? 0 : 1, br));
  if (br) {
    player.respawn({ x: 0, z: 0 }, 0);
    startBR();
    $('respawnT').textContent = '';
  } else {
    G.zone = { x: world.plaza.x, z: world.plaza.z, r: world.plaza.r };
    const used = [0, 0];
    for (const a of G.actors) {
      const list = world.spawns[a.team], sp = list[used[a.team]++ % list.length];
      const en = G.spawnCenter(1 - a.team), p = { x: sp.x, z: sp.z };
      if (a.isPlayer) a.respawn(p, Math.atan2(-(en.x - p.x), -(en.z - p.z)));
      else a.spawnAt(p);
    }
    HUD.message('ELIMINATE THE HOSTILES', 2200);
  }
  document.body.className = '';
  $('menu').classList.remove('on'); $('end').classList.remove('on'); $('pause').classList.remove('on');
  if (!br) HUD.showDeath('', false);
  document.getElementById('hint').style.opacity = 1;
  G.state = 'playing';
  if (!G.debug) requestLock();
}
G.endMatch = (info) => {
  if (G.state !== 'playing') return;
  G.state = 'ended';
  if (document.pointerLockElement) document.exitPointerLock();
  btn.l = btn.r = false;
  document.body.className = 'ended';
  HUD.showDeath('', false);
  if (G.mode === 'br') {
    const win = info && info.place === 1;
    $('endTitle').textContent = win ? 'VICTORY' : 'ELIMINATED';
    $('endTitle').className = win ? 'win' : 'lose';
    $('endStats').innerHTML = `${win ? 'LAST ONE STANDING' : 'YOU PLACED'} <b>#${info ? info.place : '?'}</b> OF <b>${G.actors.length}</b><br>KILLS <b>${player.kills}</b> · SCORE <b>${player.score}</b>`;
  } else {
    const win = G.scores[0] > G.scores[1], draw = G.scores[0] === G.scores[1];
    $('endTitle').textContent = draw ? 'DRAW' : win ? 'VICTORY' : 'DEFEAT';
    $('endTitle').className = win ? 'win' : 'lose';
    const kd = (player.kills / Math.max(1, player.deaths)).toFixed(2);
    $('endStats').innerHTML = `ALLIES <b>${G.scores[0]}</b> — <b>${G.scores[1]}</b> HOSTILES<br>YOUR KILLS <b>${player.kills}</b> · DEATHS <b>${player.deaths}</b> · K/D <b>${kd}</b> · SCORE <b>${player.score}</b>`;
  }
  setTimeout(() => $('end').classList.add('on'), 900);
};
$('deploy').addEventListener('click', startMatch);
$('again').addEventListener('click', startMatch);
$('resume').addEventListener('click', () => requestLock());
$('pause').addEventListener('click', (e) => { if (e.target.id === 'pause') requestLock(); });
$('quit').addEventListener('click', () => {
  G.state = 'menu'; document.body.className = 'menu'; stopBR();
  $('pause').classList.remove('on'); $('menu').classList.add('on');
});

/* ------------------------------------------------------------------ main loop */
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  vmCam.aspect = innerWidth / innerHeight; vmCam.updateProjectionMatrix();
});

let tdmOut = 0;
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
    if (G.mode === 'tdm' && G.matchTime >= G.matchLimit && G.state === 'playing') G.endMatch();
    mouse.fire = btn.l || !!keys.KeyF; mouse.ads = btn.r || btn.adsToggle;
    if (G.mode === 'br') updateBR(dt, keys);
    else if (player.alive && Math.hypot(player.pos.x - G.zone.x, player.pos.z - G.zone.z) > G.zone.r) { tdmOut += dt; if (tdmOut > 0.5) { tdmOut = 0; player.takeDamage(6, null, false, 'OUT OF BOUNDS', null); HUD.message('RETURN TO THE COMBAT ZONE', 800); } }
    player.update(dt, keys, mouse);
    for (const b of G.bots) b.update(dt);
    updateGrenades(dt);
    G.shake = Math.max(0, G.shake - dt * 2.2);
    HUD.update(dt, showFps ? fps : 0);
  } else if (G.state === 'menu' || G.state === 'ended' || G.state === 'paused') {
    if (G.state === 'menu' || G.state === 'ended') {
      G.time += dt; const a = G.time * 0.08;
      camera.position.set(world.plaza.x + Math.cos(a) * 170, 40 + Math.sin(a * 1.7) * 6, world.plaza.z + Math.sin(a) * 170);
      camera.lookAt(world.plaza.x, 60, world.plaza.z); camera.fov = 62; camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
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
