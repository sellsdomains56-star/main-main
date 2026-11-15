import * as THREE from 'three';
import { G, rnd, clamp, damp, angDiff } from './state.js';
import * as FX from './effects.js';
import { fireBullet, makeNoise, throwGrenade, registerKill } from './combat.js';
import { buildGunMesh } from './weapons.js';

const SKILL = [
  { name: 'RECRUIT', react: 0.75, spread: 4.6, dmg: 8, turn: 3.6, head: 0.06, view: 60, burst: [2, 4], pause: [0.5, 1.1], grenade: 0.5 },
  { name: 'REGULAR', react: 0.42, spread: 2.7, dmg: 11, turn: 6, head: 0.16, view: 75, burst: [3, 6], pause: [0.3, 0.8], grenade: 1 },
  { name: 'VETERAN', react: 0.2, spread: 1.5, dmg: 14, turn: 9.5, head: 0.3, view: 90, burst: [4, 8], pause: [0.15, 0.5], grenade: 1.6 },
];

import { A } from './assets.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

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

const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _hp = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _off = new THREE.Vector3();
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
    this.def = { name: 'M4A1 CARBINE', dmg: 11, head: 2.0, range: 130, fStart: 35, fEnd: 100, fMin: 0.55 };
    this.build();
  }

  build() {
    const src = A.models.soldier;
    const root = SkeletonUtils.clone(src.scene);
    const g = (this.model = new THREE.Group());
    g.add(root);
    // normalise to a 1.82 m soldier standing on y = 0
    g.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root);
    const k = 1.82 / Math.max(0.01, bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k);
    g.updateMatrixWorld(true);
    const bb2 = new THREE.Box3().setFromObject(root);
    root.position.y -= bb2.min.y;
    const tint = this.team === 0 ? new THREE.Color(0.55, 0.78, 1.25) : new THREE.Color(1.3, 0.58, 0.5);
    const glow = this.team === 0 ? 0x38b6ff : 0xff3a1c;
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true; o.frustumCulled = false;
      o.material = o.material.clone();
      if (/visor/i.test(o.material.name) || /visor/i.test(o.name)) { o.material.color.set(0x000000); o.material.emissive = new THREE.Color(glow); o.material.emissiveIntensity = 2.5; }
      else { o.material.color.copy(tint); o.material.envMapIntensity = 0.5; }
    });
    // animation
    this.mixer = new THREE.AnimationMixer(root);
    const clip = (n) => src.animations.find((a) => a.name === n);
    this.act = {};
    for (const n of ['Idle', 'Walk', 'Run']) { const a = this.mixer.clipAction(clip(n)); a.play(); a.setEffectiveWeight(n === 'Idle' ? 1 : 0); this.act[n] = a; }
    this.wts = { Idle: 1, Walk: 0, Run: 0 };
    this.mixer.update(Math.random() * 2);
    // find bones
    this.bones = {};
    root.traverse((o) => { if (o.isBone) { const n = o.name.replace(/^mixamorig:?/, ''); this.bones[n] = o; } });
    // weapon in the right hand
    const gun = (this.gun = buildGunMesh('ar', false));
    this.gunHolder = new THREE.Group(); g.add(this.gunHolder); this.gunHolder.add(gun.root);
    gun.root.scale.setScalar(0.95);
    g.visible = false;
    G.scene.add(g);
    if (this.team === 0) { this.tag = nameSprite(this.name, 0); this.tag.visible = false; G.scene.add(this.tag); }
    this.poseK = 0; this.pitch = 0;
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
    this.model.visible = true; this.model.rotation.set(0, this.yaw, 0); this.model.position.set(p.x, 0, p.z);
    for (const a of Object.values(this.act)) a.paused = false;
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

    // animation: blend idle / walk / run by speed, aim the rifle
    const sp = Math.hypot(this.vel.x, this.vel.z);
    if (sp > 2 && G.audio && G.player && Math.abs(this.pos.x - G.player.pos.x) < 30 && Math.abs(this.pos.z - G.player.pos.z) < 30) {
      this.stepAcc = (this.stepAcc || 0) + sp * dt;
      if (this.stepAcc > (sp > 4.6 ? 2.6 : 1.9)) { this.stepAcc = 0; G.audio.step(this.pos, sp > 4.6 ? 0.34 : 0.22); }
    }
    const tIdle = sp < 0.4 ? 1 : 0, tRun = sp > 3.4 ? 1 : 0, tWalk = sp >= 0.4 && sp <= 3.4 ? 1 : 0;
    const bl = 1 - Math.exp(-10 * dt);
    this.wts.Idle += (tIdle - this.wts.Idle) * bl; this.wts.Walk += (tWalk - this.wts.Walk) * bl; this.wts.Run += (tRun - this.wts.Run) * bl;
    for (const n of ['Idle', 'Walk', 'Run']) this.act[n].setEffectiveWeight(this.wts[n]);
    this.act.Walk.timeScale = clamp(sp / 1.5, 0.6, 2.2); this.act.Run.timeScale = clamp(sp / 4.2, 0.7, 1.5);
    this.mixer.update(dt);
    this.model.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.model.rotation.y = this.yaw;
    this.applyAim(dt, engaged || this.kick > 0 || G.time - this.lastFired < 1.2);
    if (this.tag) this.tag.position.set(this.pos.x, this.pos.y + 2.25, this.pos.z);
  }

  // raise both arms into a rifle stance, point the weapon at the target
  applyAim(dt, aiming) {
    this.poseK += ((aiming ? 1 : 0.55) - this.poseK) * (1 - Math.exp(-8 * dt));
    const B = this.bones, k = this.poseK;
    const tgt = this.target && this.target.alive ? this.target : null;
    let pitch = 0;
    if (tgt) { const dx = tgt.pos.x - this.pos.x, dz = tgt.pos.z - this.pos.z, dy = tgt.pos.y + 1.1 - (this.pos.y + 1.45); pitch = Math.atan2(dy, Math.hypot(dx, dz)); }
    this.pitch += (pitch - this.pitch) * (1 - Math.exp(-10 * dt));
    const rot = (bone, x, y, z) => { if (!bone) return; _q.setFromEuler(_e.set(x, y, z)); bone.quaternion.multiply(_q); };
    // bring the arms up in front of the chest (angles tuned for the Mixamo rig)
    rot(B.Spine1, -this.pitch * 0.35, 0, 0); rot(B.Spine2, -this.pitch * 0.35, 0, 0);
    rot(B.RightArm, -1.12 * k, 0.12 * k, 0); rot(B.LeftArm, -1.25 * k, -0.08 * k, 0);
    rot(B.RightForeArm, 0, -0.18 * k, 0); rot(B.LeftForeArm, 0, 0.22 * k, 0);
    // weapon follows the right hand but is aimed along the body forward + pitch
    const hand = B.RightHand;
    if (hand) {
      this.model.updateMatrixWorld(true);
      hand.getWorldPosition(_hp);
      this.gunHolder.position.copy(_hp).sub(this.model.position).applyAxisAngle(_up, -this.yaw);
      this.gunHolder.rotation.set(this.pitch, 0, 0);
      this.gunHolder.position.add(_off.set(0.0, 0.06, -0.02));
    }
  }

  updateDead(dt) {
    this.deadT += dt;
    const k = clamp(this.deadT / 0.55, 0, 1), e = 1 - Math.pow(1 - k, 3);
    this.model.rotation.set(e * 1.5, this.yaw, e * 0.3 * this.fallDir, 'YXZ');
    this.model.position.y = this.pos.y - (this.deadT > 3.5 ? (this.deadT - 3.5) * 1.2 : 0);
    this.model.position.x = this.pos.x; this.model.position.z = this.pos.z;
    this.model.position.y += e * 0.12;
    if (this.deadT > 4.8) this.model.visible = false;
    if (this.deadT > 5.2 && G.state === 'playing') G.respawnActor(this);
  }
}
