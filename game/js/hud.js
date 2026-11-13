import { G, clamp } from './state.js';

const $ = (id) => document.getElementById(id);
let el = {};
const cache = {};
let radarCtx = null;
const RADAR = 168, RANGE = 38;

export function init() {
  for (const id of ['scoreA', 'scoreB', 'timer', 'killfeed', 'hp', 'hpfill', 'wname', 'wtype', 'ammoCur', 'ammoRes', 'nades', 'slots', 'msg', 'death', 'deathBy', 'respawnT',
    'scoreboard', 'sbA', 'sbB', 'fps', 'indicators', 'scope', 'vignette', 'lowhp', 'crosshair', 'hitmarker', 'banner', 'points', 'radar', 'hint', 'reloadbar', 'reloadfill', 'dot']) el[id] = $(id);
  radarCtx = el.radar.getContext('2d');
  el.radar.width = RADAR * 2; el.radar.height = RADAR * 2;
  radarCtx.scale(2, 2);
}
function set(id, v) { if (cache[id] !== v) { cache[id] = v; el[id].textContent = v; } }

export function killfeed(k, v, weapon, head) {
  const d = document.createElement('div');
  d.className = 'kf' + (k.isPlayer ? ' me' : '') + (v.isPlayer ? ' died' : '');
  const kc = k.team === 0 ? 'ally' : 'enemy', vc = v.team === 0 ? 'ally' : 'enemy';
  d.innerHTML = `<b class="${kc}">${k === v ? '' : k.name}</b><i>${k === v ? 'SELF' : weapon.toUpperCase()}${head ? ' ◉' : ''}</i><b class="${vc}">${v.name}</b>`;
  el.killfeed.prepend(d);
  while (el.killfeed.children.length > 6) el.killfeed.lastChild.remove();
  setTimeout(() => d.classList.add('out'), 5200);
  setTimeout(() => d.remove(), 5800);
}
export function points(txt) {
  const d = document.createElement('div'); d.textContent = txt; el.points.appendChild(d);
  setTimeout(() => d.remove(), 1400);
}
let bannerT = 0;
export function banner(txt, cls = '') {
  el.banner.className = ''; void el.banner.offsetWidth;
  el.banner.className = 'show ' + cls; el.banner.textContent = txt;
  clearTimeout(bannerT); bannerT = setTimeout(() => (el.banner.className = ''), 2200);
}
let hmT = 0;
export function hitmarker(kill, head) {
  el.hitmarker.className = ''; void el.hitmarker.offsetWidth;
  el.hitmarker.className = 'show' + (kill ? ' kill' : head ? ' head' : '');
  clearTimeout(hmT); hmT = setTimeout(() => (el.hitmarker.className = ''), kill ? 380 : 160);
}
export function damageIndicator(fromX, fromZ) {
  const p = G.player; if (!p) return;
  const dx = fromX - p.pos.x, dz = fromZ - p.pos.z;
  // angle of attacker relative to where the player looks (0 = ahead, clockwise positive)
  const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
  const ang = Math.atan2(dx * rx + dz * rz, dx * fx + dz * fz);
  const d = document.createElement('div'); d.className = 'ind';
  d.style.transform = `rotate(${ang}rad)`;
  el.indicators.appendChild(d);
  setTimeout(() => d.classList.add('out'), 700);
  setTimeout(() => d.remove(), 1500);
}
let msgT = 0;
export function message(txt, ms = 1400) {
  el.msg.textContent = txt; el.msg.style.opacity = 1;
  clearTimeout(msgT); msgT = setTimeout(() => (el.msg.style.opacity = 0), ms);
}
export function showDeath(by, show) {
  el.death.style.display = show ? 'flex' : 'none';
  if (show) el.deathBy.textContent = by;
}
export function setRespawn(t) { set('respawnT', t > 0 ? `RESPAWN IN ${Math.ceil(t)}` : 'DEPLOYING'); }
export function showScope(on) { if (cache.scope !== on) { cache.scope = on; el.scope.style.display = on ? 'block' : 'none'; } }
export function showScoreboard(on) { el.scoreboard.style.display = on ? 'flex' : 'none'; if (on) buildScoreboard(); }
export function hideHint() { el.hint.style.opacity = 0; }

function buildScoreboard() {
  const row = (a) => `<tr class="${a.isPlayer ? 'me' : ''}${a.alive ? '' : ' dead'}"><td>${a.name}</td><td>${a.kills}</td><td>${a.deaths}</td><td>${a.score}</td></tr>`;
  const list = (t) => G.actors.filter((a) => a.team === t).sort((x, y) => y.score - x.score).map(row).join('');
  el.sbA.innerHTML = list(0); el.sbB.innerHTML = list(1);
}

export function fmtTime(s) { s = Math.max(0, Math.ceil(s)); return `${(s / 60) | 0}:${String(s % 60).padStart(2, '0')}`; }

let rFrame = 0;
export function update(dt, fps) {
  const p = G.player;
  set('scoreA', G.scores[0]); set('scoreB', G.scores[1]);
  set('timer', fmtTime(G.matchLimit - G.matchTime));
  if (!p) return;
  const hp = Math.ceil(p.hp);
  set('hp', hp);
  el.hpfill.style.width = clamp(p.hp, 0, 100) + '%';
  el.hpfill.style.background = p.hp < 35 ? '#ff4a3a' : '';
  const w = p.weapon, st = p.ws[w.id];
  set('wname', w.name); set('wtype', w.type);
  set('ammoCur', String(st.ammo).padStart(2, '0')); set('ammoRes', st.reserve);
  set('nades', p.nades);
  if (cache.slotsKey !== p.cur) {
    cache.slotsKey = p.cur;
    el.slots.querySelectorAll('span').forEach((s, i) => s.classList.toggle('on', i === p.cur));
  }
  el.lowhp.style.opacity = p.alive && p.hp < 35 ? 0.4 + Math.sin(G.time * 7) * 0.2 : 0;
  el.vignette.style.opacity = clamp(p.dmgFlash, 0, 1);
  // dynamic crosshair
  const scoped = p.scoped();
  const gap = 6 + p.spreadDeg * 9;
  const ch = el.crosshair;
  if (!p.adsT || p.adsT < 0.25) {
    ch.style.opacity = p.alive && !p.sprinting ? 1 : 0;
    ch.style.setProperty('--gap', gap.toFixed(1) + 'px');
    el.dot.style.opacity = 0;
  } else { ch.style.opacity = 0; el.dot.style.opacity = scoped ? 0 : 1; }
  // reload bar
  if (p.reloading && !p.weapon.shell) { el.reloadbar.style.opacity = 1; el.reloadfill.style.width = (p.reloadProgress() * 100).toFixed(0) + '%'; }
  else el.reloadbar.style.opacity = 0;
  const low = st.ammo <= Math.ceil(w.mag * 0.25) && st.ammo > 0;
  if (!p.reloading && p.alive) {
    if (st.ammo === 0 && st.reserve > 0) set('msg', 'PRESS R TO RELOAD'), (el.msg.style.opacity = 1);
    else if (st.ammo === 0) set('msg', 'NO AMMO — SWITCH WEAPON'), (el.msg.style.opacity = 1);
    else if (low && st.reserve > 0) set('msg', 'LOW AMMO'), (el.msg.style.opacity = 0.8);
    else if (cache.msg === 'PRESS R TO RELOAD' || cache.msg === 'LOW AMMO' || cache.msg === 'NO AMMO — SWITCH WEAPON') { el.msg.style.opacity = 0; cache.msg = ''; }
  }
  el.fps.textContent = fps ? fps + ' FPS' : '';
  if ((rFrame++ & 1) === 0) radar(p);
  if (el.scoreboard.style.display === 'flex' && (rFrame & 15) === 0) buildScoreboard();
}

function radar(p) {
  const c = radarCtx, W = G.world, R = RADAR / 2, k = R / RANGE;
  c.clearRect(0, 0, RADAR, RADAR);
  c.save();
  c.translate(R, R);
  c.beginPath(); c.arc(0, 0, R - 1, 0, 7); c.clip();
  c.fillStyle = 'rgba(8,14,20,.72)'; c.fillRect(-R, -R, RADAR, RADAR);
  c.rotate(p.yaw);
  c.translate(-p.pos.x * k, -p.pos.z * k);
  c.fillStyle = 'rgba(160,190,210,.28)';
  for (const b of W.boxes) {
    if (b.y0 > 2 || b.x1 - b.x0 > 90) continue;
    c.fillRect(b.x0 * k, b.z0 * k, (b.x1 - b.x0) * k, (b.z1 - b.z0) * k);
  }
  // map border
  c.strokeStyle = 'rgba(255,170,60,.5)'; c.lineWidth = 1.5; c.strokeRect(-50 * k, -50 * k, 100 * k, 100 * k);
  for (const a of G.actors) {
    if (!a.alive || a.isPlayer) continue;
    if (a.team !== 0 && !(a.revealT > 0)) continue;
    c.save(); c.translate(a.pos.x * k, a.pos.z * k); c.rotate(-a.yaw);
    c.fillStyle = a.team === 0 ? '#52c6ff' : '#ff4b36';
    c.beginPath(); c.moveTo(0, -5); c.lineTo(3.8, 4); c.lineTo(-3.8, 4); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
  // player marker + fov cone
  c.save(); c.translate(R, R);
  c.fillStyle = 'rgba(255,255,255,.09)'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R - 2, -Math.PI / 2 - 0.65, -Math.PI / 2 + 0.65); c.closePath(); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(0, -6); c.lineTo(4.5, 5); c.lineTo(0, 2.5); c.lineTo(-4.5, 5); c.closePath(); c.fill();
  c.restore();
}
