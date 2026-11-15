import * as THREE from 'three';
import { G, rnd, clamp } from './state.js';
import * as FX from './effects.js';
import * as HUD from './hud.js';
import { A } from './assets.js';

const _o = new THREE.Vector3(), _d = new THREE.Vector3(), _p = new THREE.Vector3(), _n = new THREE.Vector3(), _m = new THREE.Vector3();

/* ---------- ray vs actor hit volumes ---------- */
function raySphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, r, maxT) {
  const lx = ox - cx, ly = oy - cy, lz = oz - cz;
  const b = lx * dx + ly * dy + lz * dz, c = lx * lx + ly * ly + lz * lz - r * r;
  const disc = b * b - c;
  if (disc < 0) return -1;
  const sq = Math.sqrt(disc);
  let t = -b - sq;
  if (t < 0) t = -b + sq;
  return t >= 0 && t <= maxT ? t : -1;
}
function rayCylY(ox, oy, oz, dx, dy, dz, cx, cz, r, y0, y1, maxT) {
  const a = dx * dx + dz * dz;
  if (a < 1e-9) return -1;
  const ex = ox - cx, ez = oz - cz;
  const b = 2 * (ex * dx + ez * dz), c = ex * ex + ez * ez - r * r;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return -1;
  const sq = Math.sqrt(disc);
  let t = (-b - sq) / (2 * a);
  if (t < 0) t = (-b + sq) / (2 * a);
  if (t < 0 || t > maxT) return -1;
  const y = oy + dy * t;
  return y < y0 || y > y1 ? -1 : t;
}

export const hit = { type: 'none', t: 0, actor: null, head: false, nx: 0, ny: 1, nz: 0 };

export function castRay(ox, oy, oz, dx, dy, dz, maxT, owner) {
  const W = G.world;
  let tw = W.rayWorld(ox, oy, oz, dx, dy, dz, maxT);
  hit.type = 'none'; hit.t = maxT; hit.actor = null; hit.head = false;
  if (tw >= 0) {
    hit.type = 'world'; hit.t = tw;
    hit.nx = W.rayNormal.x; hit.ny = W.rayNormal.y; hit.nz = W.rayNormal.z;
  }
  const limit = tw >= 0 ? tw : maxT;
  let bestT = limit, best = null, bestHead = false;
  for (const a of G.actors) {
    if (!a.alive || a === owner || (owner && a.team === owner.team)) continue;
    const px = a.pos.x, py = a.pos.y, pz = a.pos.z;
    // quick reject: closest-approach distance of ray to actor centre
    const mx = px - ox, mz = pz - oz, tp = mx * dx + mz * dz;
    if (tp < -1) continue;
    const hy = a.headY();
    let th = raySphere(ox, oy, oz, dx, dy, dz, px, py + hy, pz, 0.21, bestT);
    if (th >= 0 && th < bestT) { bestT = th; best = a; bestHead = true; }
    const tb = rayCylY(ox, oy, oz, dx, dy, dz, px, pz, 0.36, py, py + hy - 0.16, bestT);
    if (tb >= 0 && tb < bestT) { bestT = tb; best = a; bestHead = false; }
  }
  if (best) { hit.type = 'actor'; hit.t = bestT; hit.actor = best; hit.head = bestHead; }
  return hit;
}

export function falloff(def, dist) {
  if (dist <= def.fStart) return 1;
  if (dist >= def.fEnd) return def.fMin;
  return 1 - (1 - def.fMin) * ((dist - def.fStart) / (def.fEnd - def.fStart));
}

/* One bullet. `def` carries dmg/head/range/falloff; muzzle is where the tracer visually starts. */
export function fireBullet(owner, origin, dir, def, muzzle, tracerColor = 0xffd9a0) {
  const r = castRay(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z, def.range, owner);
  const t = r.t;
  _p.set(origin.x + dir.x * t, origin.y + dir.y * t, origin.z + dir.z * t);
  if (muzzle) {
    _m.copy(muzzle);
    FX.tracer(_m, _p, tracerColor, owner.isPlayer ? 380 : 320, owner.isPlayer ? 5 : 7);
  }
  let result = null;
  if (r.type === 'actor') {
    const a = r.actor;
    let dmg = def.dmg * falloff(def, t) * (r.head ? def.head : 1);
    _n.set(-dir.x, -dir.y, -dir.z);
    FX.blood(_p, r.head ? 9 : 5, _n.multiplyScalar(0.4));
    a.takeDamage(dmg, owner, r.head, def.name, origin);
    result = { actor: a, head: r.head, dmg };
  } else if (r.type === 'world') {
    _n.set(r.nx, r.ny, r.nz);
    FX.impact(_p, _n, 'world');
  }
  // near-miss feedback for the player
  if (!owner.isPlayer && G.player && G.player.alive && (!result || result.actor !== G.player) && owner.team !== G.player.team) {
    const pl = G.player, hx = pl.pos.x, hy = pl.pos.y + pl.eyeH(), hz = pl.pos.z;
    const vx = hx - origin.x, vy = hy - origin.y, vz = hz - origin.z;
    const tt = vx * dir.x + vy * dir.y + vz * dir.z;
    if (tt > 0 && tt < t) {
      const cx = origin.x + dir.x * tt - hx, cy = origin.y + dir.y * tt - hy, cz = origin.z + dir.z * tt - hz;
      const dist = Math.hypot(cx, cy, cz);
      if (dist < 1.8) { G.audio && G.audio.whiz(_p.set(hx + cx, hy + cy, hz + cz)); G.shake = Math.max(G.shake, 0.25); }
    }
  }
  return result;
}

/* ---------- noise: lets bots hear gunfire ---------- */
export function makeNoise(pos, radius, team) {
  for (const b of G.bots) {
    if (!b.alive || b.team === team) continue;
    const d = Math.hypot(b.pos.x - pos.x, b.pos.z - pos.z);
    if (d < radius) b.hear(pos, d / radius);
  }
}

/* ---------- grenades ---------- */
const nades = [];
let nadeGeo, nadeMat, pinMat;
export function throwGrenade(owner, from, vel) {
  if (!nadeGeo) {
    nadeGeo = new THREE.SphereGeometry(0.07, 10, 8);
    nadeMat = new THREE.MeshStandardMaterial({ color: 0x3c4a2a, roughness: 0.6, metalness: 0.4 });
    pinMat = new THREE.MeshBasicMaterial({ color: 0xff3020 });
  }
  const m = new THREE.Group(); const gm = A.models.grenade.scene.clone(true); gm.scale.setScalar(1.15);
  gm.traverse((o) => { if (o.isMesh) o.castShadow = true; }); m.add(gm);
  G.scene.add(m);
  nades.push({ m, owner, pos: from.clone(), vel: vel.clone(), fuse: 2.6, bounces: 0 });
  m.position.copy(from);
}

export function explode(pos, owner) {
  FX.explosion(pos);
  G.audio && G.audio.explosion(pos);
  const R = 8.5;
  for (const a of G.actors) {
    if (!a.alive) continue;
    if (a !== owner && owner && a.team === owner.team) continue;
    const cy = a.pos.y + 1.0, dx = a.pos.x - pos.x, dy = cy - pos.y, dz = a.pos.z - pos.z;
    const d = Math.hypot(dx, dy, dz);
    if (d > R) continue;
    if (d > 0.8 && !G.world.hasLOS(pos.x, pos.y + 0.3, pos.z, a.pos.x, cy, a.pos.z)) continue;
    let dmg = 190 * Math.pow(1 - d / R, 1.3);
    if (a === owner) dmg *= 0.55;
    if (dmg < 5) continue;
    a.takeDamage(dmg, owner, false, 'FRAG GRENADE', pos);
  }
  const pl = G.player;
  if (pl) { const d = Math.hypot(pl.pos.x - pos.x, pl.pos.z - pos.z); G.shake = Math.max(G.shake, clamp(1.5 - d / 18, 0, 1.5)); }
  // scorch mark on the floor
  const gnd = _m.set(pos.x, 0, pos.z);
  FX.decal(gnd, _d.set(0, 1, 0), 3.2, true);
}

export function updateGrenades(dt) {
  const W = G.world;
  for (let i = nades.length - 1; i >= 0; i--) {
    const n = nades[i];
    n.fuse -= dt;
    n.vel.y -= 17 * dt;
    const sp = n.vel.length();
    const move = sp * dt;
    if (move > 0.0001) {
      const dx = n.vel.x / sp, dy = n.vel.y / sp, dz = n.vel.z / sp;
      const t = W.rayWorld(n.pos.x, n.pos.y, n.pos.z, dx, dy, dz, move + 0.1);
      if (t >= 0 && t < move + 0.08) {
        const nx = W.rayNormal.x, ny = W.rayNormal.y, nz = W.rayNormal.z;
        n.pos.x += dx * Math.max(0, t - 0.08); n.pos.y += dy * Math.max(0, t - 0.08); n.pos.z += dz * Math.max(0, t - 0.08);
        const vn = n.vel.x * nx + n.vel.y * ny + n.vel.z * nz;
        n.vel.x -= 1.6 * vn * nx; n.vel.y -= 1.6 * vn * ny; n.vel.z -= 1.6 * vn * nz;
        const f = ny > 0.5 ? 0.62 : 0.8;
        n.vel.x *= f; n.vel.z *= f; if (ny > 0.5) n.vel.y *= 0.6;
        if (ny > 0.5 && Math.abs(n.vel.y) < 1.2) n.vel.y = 0;
        n.bounces++;
        if (n.bounces < 6 && sp > 2) G.audio && G.audio.thud(n.pos);
      } else n.pos.addScaledVector(n.vel, dt);
    }
    n.m.position.copy(n.pos);
    n.m.rotation.x += dt * 8; n.m.rotation.z += dt * 5;
    if (n.fuse <= 0) {
      explode(n.pos, n.owner);
      G.scene.remove(n.m); nades.splice(i, 1);
    }
  }
}
export function clearGrenades() { for (const n of nades) G.scene.remove(n.m); nades.length = 0; }

/* ---------- kills & scoring ---------- */
const streakNames = ['', '', 'DOUBLE KILL', 'TRIPLE KILL', 'MULTI KILL', 'MEGA KILL', 'ULTRA KILL', 'MONSTER KILL'];
export function registerKill(victim, killer, weapon, head) {
  victim.alive = false; victim.deaths++;
  const k = killer || victim;
  if (killer && killer !== victim) { killer.kills++; G.scores[killer.team]++; }
  else if (killer === victim) { /* suicide: no team point, +1 to the enemy */ G.scores[1 - victim.team]++; }
  HUD.killfeed(k, victim, weapon, head);
  if (killer && killer.isPlayer && killer !== victim) {
    const now = G.time;
    killer.killTimes = (killer.killTimes || []).filter((t) => now - t < 4.5);
    killer.killTimes.push(now);
    killer.streak = (killer.streak || 0) + 1;
    const pts = 100 + (head ? 50 : 0);
    killer.score += pts;
    HUD.points(`+${pts}${head ? ' HEADSHOT' : ''}`);
    const mk = killer.killTimes.length;
    if (mk >= 2) { HUD.banner(streakNames[Math.min(mk, 7)], 'multi'); G.audio && G.audio.streak(); }
    else if (killer.streak === 5) HUD.banner('KILLSTREAK · 5', 'streak');
    else if (killer.streak === 10) HUD.banner('UNSTOPPABLE · 10', 'streak');
    HUD.hitmarker(true, head);
    G.audio && G.audio.kill(head);
  } else if (killer) killer.score += 100;
  if (victim.isPlayer) victim.streak = 0;
  if (G.scores[0] >= G.scoreLimit || G.scores[1] >= G.scoreLimit) G.endMatch && G.endMatch();
}
