import * as THREE from 'three';
import { G, rnd, lerp } from './state.js';
import * as HUD from './hud.js';
import { A } from './assets.js';

/* Battle royale: transport plane, parachute drop, loot, shrinking safe zone, last one standing. */
export const BR = {
  active: false, zone: { x: 0, z: 0, r: 400 }, next: { x: 0, z: 0, r: 200 }, stage: 0, timer: 0, shrinking: false,
  loot: [], plane: null, alive: 0, ended: false, endT: 0, dmgAcc: 0,
};
const STAGES = [
  { r: 200, wait: 60, shrink: 35, dmg: 1 }, { r: 130, wait: 45, shrink: 30, dmg: 3 }, { r: 80, wait: 40, shrink: 28, dmg: 5 },
  { r: 45, wait: 35, shrink: 25, dmg: 8 }, { r: 18, wait: 30, shrink: 22, dmg: 12 }, { r: 1, wait: 25, shrink: 25, dmg: 18 },
];
const LOOT = [['ar', 14], ['smg', 14], ['shotgun', 10], ['sniper', 8], ['ammo', 22], ['medkit', 16], ['armor', 12], ['nade', 8]];
const COLORS = { ar: 0xff9d2e, smg: 0xff9d2e, shotgun: 0xff9d2e, sniper: 0xc86bff, ammo: 0xd9d06a, medkit: 0xff4a4a, armor: 0x4aa8ff, nade: 0x7bd66a };

let planeMesh, zoneMesh, lootRoot, beamGeo, boxGeo;

function buildPlane() {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x8b9096, roughness: 0.5, metalness: 0.6 }), dark = new THREE.MeshStandardMaterial({ color: 0x2b2f34, roughness: 0.6, metalness: 0.5 });
  const add = (geo, mat, x, y, z, rx = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); return m; };
  add(new THREE.CylinderGeometry(2.3, 2.3, 26, 16), body, 0, 0, 0, Math.PI / 2);
  add(new THREE.ConeGeometry(2.3, 5, 16), body, 0, 0, -15.5, -Math.PI / 2);
  add(new THREE.ConeGeometry(2.3, 9, 16), body, 0, 0.6, 17.4, Math.PI / 2);
  add(new THREE.BoxGeometry(40, 0.5, 5), body, 0, 2.2, -1);
  add(new THREE.BoxGeometry(14, 0.35, 3.2), body, 0, 1.6, 19.5);
  add(new THREE.BoxGeometry(0.4, 6.5, 4.5), body, 0, 4.2, 19.5);
  for (const x of [-13, -6.5, 6.5, 13]) { add(new THREE.CylinderGeometry(0.75, 0.75, 4.2, 10), dark, x, 1.5, -2.6, Math.PI / 2); add(new THREE.CylinderGeometry(2.1, 2.1, 0.08, 16), new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.25 }), x, 1.5, -4.9, Math.PI / 2); }
  add(new THREE.BoxGeometry(1.6, 0.7, 2.4), dark, 0, 1.0, -13.6);
  g.visible = false;
  return g;
}

export function initBR(scene) {
  planeMesh = buildPlane(); scene.add(planeMesh);
  zoneMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 96, 1, true), new THREE.MeshBasicMaterial({ color: 0x4ab4ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, fog: false }));
  zoneMesh.visible = false; zoneMesh.renderOrder = 5; scene.add(zoneMesh);
  lootRoot = new THREE.Group(); scene.add(lootRoot);
  beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6, 1, true); beamGeo.translate(0, 1.9, 0);
  boxGeo = new THREE.BoxGeometry(0.5, 0.32, 0.36);
}

function lootVisual(type) {
  const g = new THREE.Group(), col = COLORS[type];
  const src = { ar: 'm4a1', smg: 'smg', shotgun: 'shotgun', sniper: 'rifle', nade: 'grenade' }[type];
  if (src) {
    const m = A.models[src].scene.clone(true), holder = new THREE.Group(); holder.add(m);
    const bb = new THREE.Box3().setFromObject(m), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
    const target = { ar: 0.85, smg: 0.55, shotgun: 0.95, sniper: 1.2, nade: 0.38 }[type], k = target / Math.max(sz.x, sz.y, sz.z);
    m.position.sub(c); holder.scale.setScalar(k * 1.25); holder.position.y = 0.55; g.add(holder); g.userData.spin = holder;
  } else {
    const m = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, metalness: 0.3, emissive: col, emissiveIntensity: 0.25 }));
    m.position.y = 0.4; g.add(m); g.userData.spin = m;
  }
  g.add(new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })));
  return g;
}
function rollLoot() { let t = 0; for (const l of LOOT) t += l[1]; let r = Math.random() * t; for (const l of LOOT) { r -= l[1]; if (r <= 0) return l[0]; } return 'ammo'; }
export function spawnLoot(x, z, type = rollLoot()) {
  const m = lootVisual(type); m.position.set(x, G.world.groundHeight(x, z, 0.3, 3), z); lootRoot.add(m);
  BR.loot.push({ x, z, y: m.position.y, type, m });
}
function clearLoot() { for (const l of BR.loot) lootRoot.remove(l.m); BR.loot.length = 0; }

function pickNext() {
  const st = STAGES[Math.min(BR.stage, STAGES.length - 1)], z = BR.zone, lim = G.world.half - 20;
  const maxOff = Math.max(0, Math.min(z.r, 330) - st.r) * 0.8, a = rnd(0, 6.283), d = Math.sqrt(Math.random()) * maxOff;
  BR.next = { x: Math.max(-lim, Math.min(lim, z.x + Math.cos(a) * d)), z: Math.max(-lim, Math.min(lim, z.z + Math.sin(a) * d)), r: st.r };
}

export function startBR() {
  const W = G.world, H = W.half, P = G.player;
  BR.active = true; BR.ended = false; BR.endT = 0; BR.stage = 0; BR.shrinking = false; BR.dmgAcc = 0;
  BR.zone.x = 0; BR.zone.z = 0; BR.zone.r = H * 1.5; G.zone = BR.zone;
  BR.timer = STAGES[0].wait; pickNext();
  clearLoot();
  for (let i = 0; i < 130; i++) { const p = W.randomFreePoint(); spawnLoot(p.x, p.z); }
  // flight path straight across the map
  const a = rnd(0, 6.283), dx = Math.cos(a), dz = Math.sin(a), L = H + 70;
  BR.plane = { x: -dx * L, z: -dz * L, dx, dz, y: 235, speed: 52, len: L * 2, s: 0, gone: false };
  planeMesh.visible = true; planeMesh.rotation.y = Math.atan2(-dx, -dz);
  for (const b of G.bots) { b.inPlane = true; b.alive = false; b.dropFrac = rnd(0.14, 0.9); b.model.visible = false; let t = W.randomFreePoint(); for (let k = 0; k < 12 && Math.hypot(t.x, t.z) > 185; k++) t = W.randomFreePoint(); b.dropTarget0 = t; }
  P.phase = 'plane'; P.yaw = Math.atan2(-dx, -dz); P.pitch = -0.12; P.pos.set(BR.plane.x, BR.plane.y - 12, BR.plane.z);
  zoneMesh.visible = true;
  HUD.message('PRESS F OR SPACE TO JUMP', 60000);
}
export function stopBR() { BR.active = false; if (planeMesh) planeMesh.visible = false; if (zoneMesh) zoneMesh.visible = false; clearLoot(); }

export function updateBR(dt, keys) {
  if (!BR.active) return;
  const P = G.player, pl = BR.plane;
  /* plane + drops */
  if (!pl.gone) {
    pl.s += pl.speed * dt; const f = pl.s / pl.len;
    const x = pl.x + pl.dx * pl.s, z = pl.z + pl.dz * pl.s;
    planeMesh.position.set(x, pl.y, z);
    for (const b of G.bots) if (b.inPlane && f >= b.dropFrac) { b.inPlane = false; b.startDrop({ x, y: pl.y - 4, z }, b.dropTarget0); }
    if (P.phase === 'plane') {
      P.pos.set(x, pl.y - 12, z);
      if ((f > 0.1 && (keys.KeyF || keys.Space)) || f > 0.9) { P.phase = 'fall'; P.vel.set(pl.dx * 25, -4, pl.dz * 25); P.spaceHeld = true; HUD.message('WASD TO STEER · SPACE TO OPEN PARACHUTE', 4000); G.audio && G.audio.thud(null); }
    }
    if (f > 1.25) { pl.gone = true; planeMesh.visible = false; }
  }
  /* zone */
  const Z = BR.zone, st = STAGES[Math.min(BR.stage, STAGES.length - 1)];
  BR.timer -= dt;
  if (!BR.shrinking && BR.timer <= 0) { BR.shrinking = true; BR.timer = st.shrink; BR.from = { x: Z.x, z: Z.z, r: Z.r }; HUD.banner('THE ZONE IS CLOSING', 'streak'); G.audio && G.audio.beep(); }
  else if (BR.shrinking) {
    const k = 1 - Math.max(0, BR.timer) / st.shrink;
    Z.x = lerp(BR.from.x, BR.next.x, k); Z.z = lerp(BR.from.z, BR.next.z, k); Z.r = lerp(BR.from.r, BR.next.r, k);
    if (BR.timer <= 0) { BR.shrinking = false; BR.stage++; BR.timer = STAGES[Math.min(BR.stage, STAGES.length - 1)].wait; pickNext(); }
  }
  zoneMesh.position.set(Z.x, 150, Z.z); zoneMesh.scale.set(Z.r, 320, Z.r);
  BR.dmgAcc += dt;
  if (BR.dmgAcc >= 0.5) {
    const dmg = STAGES[Math.max(0, Math.min(BR.stage - (BR.shrinking ? 0 : 1), STAGES.length - 1))].dmg * BR.dmgAcc; BR.dmgAcc = 0;
    if (BR.stage > 0 || BR.shrinking) for (const a of G.actors) {
      if (!a.alive || a.dropping || (a.isPlayer && a.phase !== 'ground')) continue;
      if (Math.hypot(a.pos.x - Z.x, a.pos.z - Z.z) > Z.r) a.takeDamage(dmg, null, false, 'THE ZONE', null);
    }
  }
  /* loot */
  const cam = G.camera.position, canPick = P.alive && P.phase === 'ground';
  for (let i = BR.loot.length - 1; i >= 0; i--) {
    const l = BR.loot[i], dc = Math.abs(l.x - cam.x) + Math.abs(l.z - cam.z);
    l.m.visible = dc < 110;
    if (!l.m.visible) continue;
    l.m.userData.spin.rotation.y += dt * 1.6;
    if (canPick && Math.abs(l.x - P.pos.x) < 1.5 && Math.abs(l.z - P.pos.z) < 1.5 && Math.abs(l.y - P.pos.y) < 2) {
      const label = P.give(l.type);
      if (label) { lootRoot.remove(l.m); BR.loot.splice(i, 1); HUD.points('+ ' + label); G.audio && G.audio.click('magin', null, 0.7); }
    }
  }
  /* alive count + end of match */
  let n = P.alive ? 1 : 0; for (const b of G.bots) if (b.alive || b.inPlane) n++;
  BR.alive = n;
  if (!BR.ended) {
    if (!P.alive) { BR.endT += dt; if (BR.endT > 2.6) { BR.ended = true; G.endMatch({ place: n + 1 }); } }
    else if (n === 1) { BR.ended = true; G.endMatch({ place: 1 }); }
  }
}
