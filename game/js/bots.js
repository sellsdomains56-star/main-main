import * as THREE from '../lib/three.module.js';
import { G, rnd, clamp, damp, angDiff } from './state.js';
import * as FX from './effects.js';
import { fireBullet, makeNoise, throwGrenade, registerKill } from './combat.js';
import { buildGunMesh } from './weapons.js';

const SKILL = [
  { name: 'RECRUIT', react: 0.75, spread: 4.6, dmg: 8, turn: 3.6, head: 0.06, view: 60, burst: [2, 4], pause: [0.5, 1.1], grenade: 0.5 },
  { name: 'REGULAR', react: 0.42, spread: 2.7, dmg: 11, turn: 6, head: 0.16, view: 75, burst: [3, 6], pause: [0.3, 0.8], grenade: 1 },
  { name: 'VETERAN', react: 0.2, spread: 1.5, dmg: 14, turn: 9.5, head: 0.3, view: 90, burst: [4, 8], pause: [0.15, 0.5], grenade: 1.6 },
];

const teamMats = {};
function mats(team) {
  if (teamMats[team]) return teamMats[team];
  const vest = team === 0 ? 0x2c5f94 : 0x9c3427, glow = team === 0 ? 0x4cc3ff : 0xff4a2a;
  teamMats[team] = {
    vest: new THREE.MeshStandardMaterial({ color: vest, roughness: 0.75 }),
    cloth: new THREE.MeshStandardMaterial({ color: team === 0 ? 0x2c3238 : 0x2e2a28, roughness: 0.9 }),
    pants: new THREE.MeshStandardMaterial({ color: 0x23272b, roughness: 0.9 }),
    skin: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.8 }),
    helmet: new THREE.MeshStandardMaterial({ color: team === 0 ? 0x3a4a3c : 0x3b3433, roughness: 0.6, metalness: 0.2 }),
    visor: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: glow, emissiveIntensity: 3.5 }),
    glow: new THREE.MeshBasicMaterial({ color: glow }),
  };
  return teamMats[team];
}

function nameSprite(name, team) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = '700 30px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(name.toUpperCase(), 129, 25);
  g.fillStyle = team === 0 ? '#6fd0ff' : '#ff6a4a'; g.fillText(name.toUpperCase(), 128, 24);
  g.beginPath(); g.moveTo(112, 48); g.lineTo(144, 48); g.lineTo(128, 62); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, depthWrite: false, transparent: true, fog: false }));
  s.scale.set(1.5, 0.375, 1); s.renderOrder = 20;
  return s;
}

const _eye = new THREE.Vector3(), _dir = new THREE.Vector3(), _mz = new THREE.Vector3(), _aim = new THREE.Vector3();

export class Bot {
  constructor(id, name, team) {
    this.id = id; this.name = name; this.team = team; this.isPlayer = false;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.yaw = 0; this.alive = false; this.hp = 100; this.kills = 0; this.deaths = 0; this.score = 0;
    this.target = null; this.visible = false; this.seenT = 0; this.lostT = 99; this.lastKnown = null;
    this.path = []; this.pathIdx = 0; this.repathT = 0; this.goal = null;
    this.fireCd = 0; this.mag = 30; this.reloadT = 0; this.burstLeft = 4; this.pauseT = 0; this.grenCd = rnd(5, 14);
    this.strafe = 1; this.strafeT = 1; this.senseT = rnd(0, 0.2); this.walk = 0; this.deadT = 0;
    this.lastHit = -99; this.revealT = 0; this.stuckT = 0; this.lastCheck = new THREE.Vector3(); this.investT = 0;
    this.retreatT = 0; this.aimHead = false; this.kick = 0; this.lastFired = -99;
    this.def = { name: 'M4-X CARBINE', dmg: 11, head: 2.0, range: 130, fStart: 35, fEnd: 100, fMin: 0.55 };
    this.build();
  }

  build() {
    const m = mats(this.team);
    const g = (this.model = new THREE.Group());
    const add = (geo, mat, x, y, z, parent = g) => { const me = new THREE.Mesh(geo, mat); me.position.set(x, y, z); me.castShadow = true; parent.add(me); return me; };
    this.legL = new THREE.Group(); this.legR = new THREE.Group();
    this.legL.position.set(-0.11, 0.84, 0); this.legR.position.set(0.11, 0.84, 0); g.add(this.legL, this.legR);
    for (const L of [this.legL, this.legR]) {
      add(new THREE.BoxGeometry(0.17, 0.5, 0.21), m.pants, 0, -0.25, 0, L);
      add(new THREE.BoxGeometry(0.15, 0.36, 0.2), m.cloth, 0, -0.62, 0, L);
      add(new THREE.BoxGeometry(0.17, 0.08, 0.28), m.skin, 0, -0.8, -0.03, L);
    }
    this.torso = new THREE.Group(); this.torso.position.y = 0; g.add(this.torso);
    add(new THREE.BoxGeometry(0.44, 0.3, 0.25), m.cloth, 0, 0.96, 0, this.torso);
    add(new THREE.BoxGeometry(0.5, 0.46, 0.3), m.vest, 0, 1.2, 0, this.torso);
    add(new THREE.BoxGeometry(0.4, 0.12, 0.08), m.cloth, 0, 1.12, -0.17, this.torso);
    add(new THREE.BoxGeometry(0.14, 0.08, 0.1), m.cloth, 0, 1.5, 0, this.torso);
    add(new THREE.BoxGeometry(0.2, 0.22, 0.21), m.skin, 0, 1.58, 0, this.torso);
    add(new THREE.BoxGeometry(0.27, 0.13, 0.29), m.helmet, 0, 1.7, 0.01, this.torso);
    add(new THREE.BoxGeometry(0.2, 0.045, 0.02), m.visor, 0, 1.61, -0.108, this.torso);
    add(new THREE.BoxGeometry(0.1, 0.03, 0.02), m.glow, 0, 1.36, -0.16, this.torso);
    const gun = (this.gun = buildGunMesh('ar', false));
    gun.root.position.set(0.14, 1.2, -0.26); gun.root.scale.setScalar(0.95);
    this.torso.add(gun.root);
    add(new THREE.BoxGeometry(0.1, 0.1, 0.46), m.cloth, 0.2, 1.22, -0.14, this.torso).rotation.y = 0.12;
    add(new THREE.BoxGeometry(0.1, 0.1, 0.56), m.cloth, -0.22, 1.24, -0.28, this.torso).rotation.y = -0.32;
    add(new THREE.BoxGeometry(0.09, 0.09, 0.09), m.skin, 0.16, 1.22, -0.4, this.torso);
    add(new THREE.BoxGeometry(0.09, 0.09, 0.09), m.skin, -0.06, 1.24, -0.54, this.torso);
    g.visible = false;
    G.scene.add(g);
    if (this.team === 0) { this.tag = nameSprite(this.name, 0); this.tag.visible = false; G.scene.add(this.tag); }
  }

  get skill() { return SKILL[G.settings.diff]; }
  headY() { return 1.58; }
  eyeH() { return 1.6; }
  eye(out) { return out.set(this.pos.x, this.pos.y + 1.6, this.pos.z); }

  spawnAt(p) {
    this.pos.set(p.x, 0, p.z); this.vel.set(0, 0, 0); this.hp = 100; this.alive = true; this.deadT = 0;
    this.mag = 30; this.reloadT = 0; this.target = null; this.visible = false; this.lastKnown = null; this.path = []; this.goal = null;
    this.retreatT = 0; this.investT = 0; this.fireCd = 0.5; this.grenCd = rnd(6, 14);
    const enemy = G.spawnCenter(1 - this.team);
    this.yaw = Math.atan2(-(enemy.x - p.x), -(enemy.z - p.z));
    this.model.visible = true; this.model.rotation.set(0, this.yaw, 0); this.model.position.set(p.x, 0, p.z); this.torso.rotation.set(0, 0, 0);
    this.model.scale.set(1, 1, 1); this.legL.rotation.x = this.legR.rotation.x = 0;
    this.model.position.y = 0;
    if (this.tag) this.tag.visible = true;
  }

  takeDamage(dmg, attacker, head, weapon, from) {
    if (!this.alive) return;
    this.hp -= dmg; this.lastHit = G.time;
    if (attacker && attacker.alive && attacker.team !== this.team) {
      if (!this.visible) { this.lastKnown = { x: attacker.pos.x, z: attacker.pos.z }; this.investT = 8; this.path = []; }
      if (!this.target) { this.target = attacker; this.seenT = this.skill.react * 0.5; }
    }
    if (this.hp < 38 && Math.random() < 0.35) this.retreatT = rnd(2.5, 4.5);
    if (this.hp <= 0) {
      this.hp = 0; this.alive = false; this.deadT = 0;
      this.fallDir = Math.random() < 0.5 ? 1 : -1;
      if (this.tag) this.tag.visible = false;
      registerKill(this, attacker, weapon, head);
      this.alive = false;
    }
  }

  hear(pos, nearness) {
    if (this.visible) return;
    if (Math.random() < 0.55) {
      this.lastKnown = { x: pos.x, z: pos.z }; this.investT = 7; this.path = []; this.repathT = 0;
    }
  }

  sense() {
    const W = G.world, sk = this.skill;
    this.eye(_eye);
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    let best = null, bd = 1e9;
    for (const a of G.actors) {
      if (!a.alive || a.team === this.team) continue;
      const dx = a.pos.x - this.pos.x, dz = a.pos.z - this.pos.z, d = Math.hypot(dx, dz);
      if (d > sk.view) continue;
      const dot = (dx * fx + dz * fz) / (d || 1);
      if (dot < 0.3 && d > 6) continue;
      if (!W.hasLOS(_eye.x, _eye.y, _eye.z, a.pos.x, a.pos.y + 1.1, a.pos.z) &&
          !W.hasLOS(_eye.x, _eye.y, _eye.z, a.pos.x, a.pos.y + a.headY(), a.pos.z)) continue;
      if (d < bd) { bd = d; best = a; }
    }
    if (best) {
      if (this.target !== best) { this.target = best; this.seenT = 0; this.aimHead = Math.random() < sk.head; }
      this.visible = true; this.lostT = 0; this.lastKnown = { x: best.pos.x, z: best.pos.z };
      this.investT = 0;
    } else {
      if (this.visible) { this.visible = false; this.investT = 6; this.path = []; this.repathT = 0; }
      this.lostT += 0.15;
      if (this.lostT > 7) this.target = null;
    }
  }

  pickGoal() {
    const W = G.world;
    const en = G.spawnCenter(1 - this.team);
    let best = null, bs = 1e9;
    const tries = 3;
    for (let i = 0; i < tries; i++) {
      const p = W.pois[(Math.random() * W.pois.length) | 0];
      const sc = Math.hypot(p.x - en.x, p.z - en.z) + Math.random() * 40;
      if (sc < bs) { bs = sc; best = p; }
    }
    if (Math.random() < 0.4) best = W.pois[(Math.random() * W.pois.length) | 0];
    const jitter = { x: best.x + rnd(-3, 3), z: best.z + rnd(-3, 3) };
    return jitter;
  }

  setGoal(g) {
    this.goal = g;
    this.path = G.world.findPath(this.pos.x, this.pos.z, g.x, g.z);
    this.pathIdx = 0; this.repathT = rnd(1.2, 2.2);
  }

  followPath(dt, speed) {
    while (this.pathIdx < this.path.length) {
      const wp = this.path[this.pathIdx];
      const dx = wp.x - this.pos.x, dz = wp.z - this.pos.z, d = Math.hypot(dx, dz);
      if (d < 0.7) { this.pathIdx++; continue; }
      this.moveDir(dx / d, dz / d, speed, dt);
      return true;
    }
    return false;
  }

  moveDir(dx, dz, speed, dt) {
    let sx = 0, sz = 0;
    for (const o of G.actors) {
      if (o === this || !o.alive) continue;
      const ox = this.pos.x - o.pos.x, oz = this.pos.z - o.pos.z, d2 = ox * ox + oz * oz;
      if (d2 < 1.4 && d2 > 0.0001) { const d = Math.sqrt(d2); sx += (ox / d) * (1.2 - d); sz += (oz / d) * (1.2 - d); }
    }
    const tx = dx * speed + sx * 2.5, tz = dz * speed + sz * 2.5;
    this.vel.x = damp(this.vel.x, tx, 9, dt); this.vel.z = damp(this.vel.z, tz, 9, dt);
  }

  shoot() {
    const sk = this.skill, t = this.target;
    this.eye(_eye);
    const ay = this.aimHead ? t.headY() : 1.15;
    _aim.set(t.pos.x, t.pos.y + ay, t.pos.z);
    _dir.copy(_aim).sub(_eye);
    const dist = _dir.length(); _dir.multiplyScalar(1 / dist);
    const moving = Math.hypot(this.vel.x, this.vel.z) > 1.5 ? 1.35 : 1;
    const warm = 1 + 3.2 * Math.exp(-this.seenT * 1.6 + this.skill.react * 1.6);
    const ang = ((sk.spread * (0.55 + clamp(dist, 0, 70) / 70)) * moving * Math.min(warm, 4.5) * Math.PI) / 180;
    const r = ang * Math.sqrt(Math.random()) * 0.6, th = rnd(0, 6.283);
    // perpendicular basis
    const ux = -_dir.z, uz = _dir.x, ul = Math.hypot(ux, uz) || 1;
    _dir.x += (ux / ul) * Math.cos(th) * r; _dir.z += (uz / ul) * Math.cos(th) * r; _dir.y += Math.sin(th) * r;
    _dir.normalize();
    this.model.updateMatrixWorld(true);
    this.gun.muzzle.getWorldPosition(_mz);
    this.def.dmg = sk.dmg;
    fireBullet(this, _eye, _dir, this.def, _mz, this.team === 0 ? 0x9fd8ff : 0xffb090);
    FX.muzzleFlash(_mz, 0.5);
    G.audio && G.audio.shot('ar', _mz, 0.85);
    makeNoise(this.pos, 60, this.team);
    this.mag--; this.fireCd = 60 / 640; this.kick = 1; this.lastFired = G.time; this.revealT = 1.4;
    this.burstLeft--;
    if (this.burstLeft <= 0) { this.pauseT = rnd(sk.pause[0], sk.pause[1]); this.burstLeft = Math.round(rnd(sk.burst[0], sk.burst[1])); this.aimHead = Math.random() < sk.head; }
  }

  throwNade() {
    const t = this.target; this.eye(_eye);
    const T = 1.5, dx = t.pos.x - _eye.x + rnd(-1.5, 1.5), dz = t.pos.z - _eye.z + rnd(-1.5, 1.5), dy = t.pos.y - _eye.y;
    const v = new THREE.Vector3(dx / T, (dy + 0.5 * 17 * T * T) / T, dz / T);
    throwGrenade(this, _eye, v);
    this.grenCd = rnd(14, 24) / this.skill.grenade;
    G.audio && G.audio.click('pin', this.pos, 0.6);
  }

  update(dt) {
    const W = G.world, sk = this.skill;
    if (!this.alive) { this.updateDead(dt); return; }
    if (this.revealT > 0) this.revealT -= dt;
    this.fireCd -= dt; this.pauseT -= dt; this.grenCd -= dt; this.kick = Math.max(0, this.kick - dt * 9);
    if (G.time - this.lastHit > 5 && this.hp < 100) this.hp = Math.min(100, this.hp + 22 * dt);
    this.retreatT -= dt;
    this.senseT -= dt;
    if (this.senseT <= 0) { this.senseT = 0.15; this.sense(); }

    if (this.reloadT > 0) { this.reloadT -= dt; if (this.reloadT <= 0) this.mag = 30; }
    else if (this.mag <= 0 || (!this.visible && this.mag < 14)) { this.reloadT = 2.3; G.audio && G.audio.click('magout', this.pos, 0.4); }

    let speed = 0, desiredYaw = null;
    const t = this.target;
    const engaged = this.visible && t && t.alive;

    if (engaged) {
      this.seenT += dt;
      const dx = t.pos.x - this.pos.x, dz = t.pos.z - this.pos.z, dist = Math.hypot(dx, dz);
      desiredYaw = Math.atan2(-dx, -dz);
      const err = Math.abs(angDiff(this.yaw, desiredYaw));
      if (this.retreatT > 0) {
        // fall back toward own spawn while still shooting
        const sp = G.spawnCenter(this.team);
        const rx = sp.x - this.pos.x, rz = sp.z - this.pos.z, rd = Math.hypot(rx, rz) || 1;
        this.moveDir(rx / rd, rz / rd, 4.6, dt); speed = 4.6;
      } else if (dist > 32) {
        this.repathT -= dt;
        if (this.repathT <= 0 || !this.path.length) this.setGoal({ x: t.pos.x, z: t.pos.z });
        if (this.followPath(dt, 4.8)) speed = 4.8;
      } else {
        this.strafeT -= dt;
        if (this.strafeT <= 0) { this.strafe = Math.random() < 0.5 ? -1 : 1; this.strafeT = rnd(0.5, 1.6); }
        const fx = dx / (dist || 1), fz = dz / (dist || 1);
        const rx = -fz * this.strafe, rz = fx * this.strafe;
        let mx = rx, mz = rz;
        if (dist > 20) { mx += fx * 0.7; mz += fz * 0.7; } else if (dist < 7) { mx -= fx * 0.8; mz -= fz * 0.8; }
        const ml = Math.hypot(mx, mz) || 1;
        speed = 3.0; this.moveDir(mx / ml, mz / ml, speed, dt);
      }
      // trigger discipline
      if (this.seenT > sk.react && this.reloadT <= 0 && this.mag > 0 && this.fireCd <= 0 && this.pauseT <= 0 && err < 0.14) this.shoot();
      // grenades at mid-range targets
      if (this.grenCd <= 0 && dist > 12 && dist < 34 && this.seenT > 0.8 && Math.random() < dt * 0.5) this.throwNade();
    } else {
      this.seenT = 0;
      this.repathT -= dt;
      if (this.investT > 0 && this.lastKnown) {
        this.investT -= dt;
        if (!this.path.length || this.repathT <= 0) this.setGoal(this.lastKnown);
        if (this.followPath(dt, 5.4)) speed = 5.4;
        else this.investT = 0;
      } else {
        if (!this.goal || this.pathIdx >= this.path.length || this.repathT <= -2) this.setGoal(this.pickGoal());
        if (this.followPath(dt, 4.3)) speed = 4.3;
        else { this.goal = null; }
      }
      if (speed > 0.1) { const m = Math.hypot(this.vel.x, this.vel.z); if (m > 0.5) desiredYaw = Math.atan2(-this.vel.x, -this.vel.z); }
    }

    if (speed === 0) { this.vel.x = damp(this.vel.x, 0, 10, dt); this.vel.z = damp(this.vel.z, 0, 10, dt); }
    // look direction
    if (desiredYaw !== null) {
      const d = angDiff(this.yaw, desiredYaw), maxT = sk.turn * (engaged ? 1 : 0.75) * dt;
      this.yaw += clamp(d, -maxT, maxT);
    }
    // integrate + collide
    this.pos.x += this.vel.x * dt; this.pos.z += this.vel.z * dt;
    W.resolveCircle(this.pos, 0.38, this.pos.y, 1.8);
    const gy = W.groundHeight(this.pos.x, this.pos.z, 0.3, this.pos.y);
    this.pos.y = damp(this.pos.y, gy, 18, dt);

    // stuck detection
    this.stuckT += dt;
    if (this.stuckT > 1.2) {
      const moved = Math.hypot(this.pos.x - this.lastCheck.x, this.pos.z - this.lastCheck.z);
      if (speed > 1 && moved < 0.35) { this.path = []; this.goal = null; this.strafe *= -1; this.repathT = 0; if (!engaged) this.setGoal(this.pickGoal()); }
      this.lastCheck.copy(this.pos); this.stuckT = 0;
    }

    // animation
    const sp = Math.hypot(this.vel.x, this.vel.z);
    const prevStep = Math.floor(this.walk / Math.PI);
    this.walk += sp * dt * 2.1;
    if (sp > 2 && Math.floor(this.walk / Math.PI) !== prevStep && G.audio && G.player && Math.abs(this.pos.x - G.player.pos.x) < 30 && Math.abs(this.pos.z - G.player.pos.z) < 30) G.audio.step(this.pos, sp > 4.6 ? 0.34 : 0.22);
    const sw = Math.min(1, sp / 4) * 0.8;
    this.legL.rotation.x = Math.sin(this.walk) * sw; this.legR.rotation.x = -Math.sin(this.walk) * sw;
    this.model.position.set(this.pos.x, this.pos.y + Math.abs(Math.sin(this.walk)) * 0.03 * Math.min(1, sp / 3), this.pos.z);
    this.model.rotation.y = this.yaw;
    this.torso.rotation.x = -this.kick * 0.04;
    this.gun.root.position.z = -0.26 + this.kick * 0.04;
    if (this.tag) this.tag.position.set(this.pos.x, this.pos.y + 2.15, this.pos.z);
  }

  updateDead(dt) {
    this.deadT += dt;
    const k = clamp(this.deadT / 0.55, 0, 1), e = 1 - Math.pow(1 - k, 3);
    this.model.rotation.set(e * 1.5, this.yaw, e * 0.3 * this.fallDir, 'YXZ');
    this.model.position.y = this.pos.y - (this.deadT > 3.5 ? (this.deadT - 3.5) * 1.2 : 0);
    this.model.position.x = this.pos.x; this.model.position.z = this.pos.z;
    this.model.position.y += e * 0.12;
    this.legL.rotation.x = this.legR.rotation.x = 0;
    if (this.deadT > 4.8) this.model.visible = false;
    if (this.deadT > 5.2 && G.state === 'playing') G.respawnActor(this);
  }
}
