import * as THREE from 'three';
import { G, clamp, lerp, damp, rnd } from './state.js';
import * as FX from './effects.js';
import * as HUD from './hud.js';
import { WEAPONS, WEAPON_ORDER, buildGunMesh, getHip, getAds } from './weapons.js';
import { fireBullet, makeNoise, throwGrenade, registerKill } from './combat.js';

const DEG = Math.PI / 180;
const _dir = new THREE.Vector3(), _org = new THREE.Vector3(), _mz = new THREE.Vector3(), _v = new THREE.Vector3(), _e = new THREE.Euler(0, 0, 0, 'YXZ');

export class Player {
  constructor(vmScene, vmCamera) {
    this.isPlayer = true; this.name = 'YOU'; this.team = 0;
    this.vmScene = vmScene; this.vmCam = vmCamera;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3();
    this.yaw = 0; this.pitch = 0; this.recoilKick = 0;
    this.alive = false; this.hp = 100; this.kills = 0; this.deaths = 0; this.score = 0; this.streak = 0;
    this.onGround = true; this.crouch = 0; this.sprinting = false; this.radius = 0.38;
    this.dmgFlash = 0; this.lastHit = -99; this.deadT = 0; this.killer = null;
    this.bob = 0; this.stepT = 0; this.sway = new THREE.Vector2(); this.landKick = 0;
    this.input = { mx: 0, my: 0 };
    this.fireCd = 0; this.reloading = false; this.reloadT = 0; this.switchT = 0; this.adsT = 0; this.spreadDeg = 1; this.heat = 0;
    this.nades = 3; this.nadeCd = 0; this.vmKick = 0; this.boltT = 0; this.cur = 0; this.last = 1;
    this.ws = {};
    this.fov = 78;
    this.vmRoot = new THREE.Group(); vmScene.add(this.vmRoot);
    this.guns = {};
    for (const id of WEAPON_ORDER) {
      const gm = buildGunMesh(id, true); gm.root.visible = false; this.vmRoot.add(gm.root); this.guns[id] = gm;
      gm.flash = FX.makeFlashSprite(); gm.flash.visible = false; gm.muzzle.add(gm.flash);
    }
    this.flashLight = new THREE.PointLight(0xffb060, 0, 3, 2); vmScene.add(this.flashLight);
    this.flashT = 0; this.flashSize = 1;
    this.resetLoadout();
  }

  resetLoadout() {
    for (const id of WEAPON_ORDER) { const w = WEAPONS[id]; this.ws[id] = { ammo: w.mag, reserve: w.reserve }; }
    this.nades = 3; this.cur = 0; this.last = 1; this.weapon = WEAPONS[WEAPON_ORDER[0]];
    this.showGun(this.weapon.id);
  }
  showGun(id) {
    for (const k of WEAPON_ORDER) this.guns[k].root.visible = k === id;
    this.gun = this.guns[id];
  }
  setMuzzleFlashTexture(tex) { /* flash drawn through world pool for simplicity */ }

  eyeH() { return lerp(1.62, 1.08, this.crouch); }
  headY() { return this.eyeH() + 0.02; }
  height() { return lerp(1.8, 1.3, this.crouch); }
  scoped() { return this.weapon.scope && this.adsT > 0.85 && !this.reloading && this.switchT <= 0; }

  respawn(p, yaw) {
    this.pos.set(p.x, 0, p.z); this.vel.set(0, 0, 0); this.yaw = yaw; this.pitch = 0; this.hp = 100; this.alive = true;
    this.crouch = 0; this.reloading = false; this.switchT = 0; this.adsT = 0; this.fireCd = 0.4; this.dmgFlash = 0; this.heat = 0; this.recoilKick = 0;
    this.resetLoadout(); this.killTimes = []; this.deadT = 0;
    HUD.showDeath('', false);
  }

  takeDamage(dmg, attacker, head, weapon, from) {
    if (!this.alive || G.state !== 'playing') return;
    this.hp -= dmg; this.lastHit = G.time; this.dmgFlash = Math.min(1, this.dmgFlash + dmg / 45);
    G.audio && G.audio.hurt();
    G.shake = Math.max(G.shake, Math.min(0.6, dmg / 60));
    if (from && attacker !== this) HUD.damageIndicator(attacker.pos.x, attacker.pos.z);
    if (this.hp <= 0) {
      this.hp = 0; this.alive = false; this.deadT = 0; this.killer = attacker; this.vel.multiplyScalar(0.2);
      registerKill(this, attacker, weapon, head);
      HUD.showDeath(attacker && attacker !== this ? attacker.name : 'YOURSELF', true);
      this.alive = false;
    }
  }

  /* ---------------- input helpers ---------------- */
  look(dx, dy) {
    const sens = 0.0022 * G.settings.sens * (this.adsT > 0.1 ? lerp(1, this.weapon.adsFov / this.fov, this.adsT) : 1);
    this.yaw -= dx * sens;
    this.pitch = clamp(this.pitch - dy * sens, -1.5, 1.5);
    this.sway.x += dx * 0.00018; this.sway.y += dy * 0.00018;
  }

  switchTo(i) {
    if (i === this.cur || i < 0 || i >= WEAPON_ORDER.length || this.switchT > 0 || !this.alive) return;
    this.last = this.cur; this.pendingSwitch = i; this.switchT = 0.5; this.reloading = false;
    G.audio && G.audio.click('switch', null, 0.5);
  }
  cycle(dir) { this.switchTo((this.cur + dir + WEAPON_ORDER.length) % WEAPON_ORDER.length); }

  startReload() {
    const w = this.weapon, st = this.ws[w.id];
    if (this.reloading || this.switchT > 0 || st.ammo >= w.mag || st.reserve <= 0) return;
    this.reloading = true; this.reloadT = 0; this.adsHold = false;
    this.reloadShellT = 0.35;
    G.audio && G.audio.click(w.shell ? 'shell' : 'magout', null, 0.5);
  }
  reloadProgress() { return clamp(this.reloadT / this.weapon.reload, 0, 1); }

  throwNade() {
    if (this.nades <= 0 || this.nadeCd > 0 || !this.alive || this.switchT > 0) return;
    this.nades--; this.nadeCd = 1.0; this.reloading = false;
    const dir = _dir.set(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch));
    const org = _org.set(this.pos.x, this.pos.y + this.eyeH() - 0.1, this.pos.z).addScaledVector(dir, 0.5);
    const v = dir.clone().multiplyScalar(17).add(new THREE.Vector3(this.vel.x * 0.5, 2.2 + 0.0, this.vel.z * 0.5));
    throwGrenade(this, org, v);
    G.audio && G.audio.click('pin', null, 0.7);
    this.vmKick = 0.5;
  }

  /* ---------------- shooting ---------------- */
  canFire() {
    return this.alive && this.fireCd <= 0 && this.switchT <= 0 && !this.sprinting && (!this.reloading || (this.weapon.shell && this.ws[this.weapon.id].ammo > 0));
  }
  fire() {
    const w = this.weapon, st = this.ws[w.id];
    if (st.ammo <= 0) {
      this.fireCd = 0.25; G.audio && G.audio.click('empty', null, 0.5);
      if (st.reserve > 0) this.startReload();
      return;
    }
    if (this.reloading) this.reloading = false; // shotgun interrupt
    st.ammo--;
    this.fireCd = 60 / w.rpm;
    this.heat = Math.min(1, this.heat + 0.12);
    // origin & muzzle
    const eyeY = this.pos.y + this.eyeH();
    _org.set(this.pos.x, eyeY, this.pos.z);
    const cp = Math.cos(this.pitch), baseDir = new THREE.Vector3(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const up = new THREE.Vector3().crossVectors(right, baseDir).normalize();
    // tracer origin: project the viewmodel muzzle through the main camera so tracers leave the barrel
    this.vmRoot.updateMatrixWorld(true);
    this.gun.muzzle.getWorldPosition(_mz);
    const ndc = _v.copy(_mz).project(this.vmCam);
    const ray = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(G.camera).sub(G.camera.position).normalize();
    const k = -_mz.z / Math.max(0.2, ray.dot(baseDir));
    const wm = G.camera.position.clone().addScaledVector(ray, k);
    const spread = this.currentSpread() * DEG;
    for (let i = 0; i < w.pellets; i++) {
      const r = spread * Math.sqrt(Math.random()), th = rnd(0, 6.283);
      _dir.copy(baseDir).addScaledVector(right, Math.cos(th) * r).addScaledVector(up, Math.sin(th) * r).normalize();
      const res = fireBullet(this, _org, _dir, w, wm, 0xffe3a8);
      if (res) {
        HUD.hitmarker(false, res.head); G.audio && G.audio.hit(res.head);
      }
    }
    G.audio && G.audio.shot(w.sound, null, 1);
    makeNoise(this.pos, 70, this.team);
    // recoil
    const adsMul = lerp(1, 0.6, this.adsT);
    this.pitch += w.recoilP * DEG * adsMul * (0.85 + Math.random() * 0.3);
    this.yaw += (Math.random() - 0.5) * 2 * w.recoilY * DEG * adsMul;
    this.vmKick = Math.min(1.4, this.vmKick + w.kick * 18);
    G.shake = Math.max(G.shake, w.id === 'shotgun' ? 0.35 : w.id === 'sniper' ? 0.5 : 0.1);
    this.flashT = 0.05; this.flashSize = w.flash;
    this.flashLight.intensity = 4 * w.flash;
    this.boltT = w.id === 'sniper' || w.id === 'shotgun' ? 1 : 0;
    this.lastFire = G.time;
    if (st.ammo === 0 && st.reserve > 0 && !w.shell) this.autoReload = 0.35;
  }
  currentSpread() {
    const w = this.weapon, spd = Math.hypot(this.vel.x, this.vel.z);
    let s = lerp(w.spread, w.adsSpread, this.adsT);
    s += (spd / 6) * w.moveSpread * (1 - this.adsT * 0.6);
    if (!this.onGround) s += w.jumpSpread;
    if (this.crouch > 0.5) s *= 0.75;
    return s + this.heat * (w.auto ? 1.4 : 0.4);
  }

  /* ---------------- per-frame ---------------- */
  update(dt, keys, mouse) {
    const W = G.world;
    this.dmgFlash = Math.max(0, this.dmgFlash - dt * 1.2);
    if (!this.alive) { this.updateDead(dt); return; }
    if (G.time - this.lastHit > 5 && this.hp < 100) this.hp = Math.min(100, this.hp + 28 * dt);
    this.fireCd -= dt; this.nadeCd -= dt;
    this.heat = Math.max(0, this.heat - dt * 1.6);
    if (this.autoReload > 0) { this.autoReload -= dt; if (this.autoReload <= 0 && !this.reloading) this.startReload(); }

    /* movement */
    const fwd = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), strafe = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    const wantCrouch = keys.KeyC || keys.ControlLeft;
    this.crouch = damp(this.crouch, wantCrouch ? 1 : 0, 12, dt);
    const canSprint = keys.ShiftLeft && fwd > 0 && !wantCrouch && !mouse.ads;
    this.sprinting = canSprint && (this.onGround || this.sprinting);
    if (mouse.fire && this.weapon.id !== 'sniper') this.sprinting = false;
    let speed = this.sprinting ? 8.2 : 5.4;
    if (wantCrouch) speed = 2.8;
    speed *= this.weapon.moveSpeed * lerp(1, this.weapon.adsSpeed, this.adsT);
    let wx = 0, wz = 0;
    if (fwd || strafe) {
      const l = Math.hypot(fwd, strafe);
      const f = fwd / l, s = strafe / l;
      wx = (-Math.sin(this.yaw) * f + Math.cos(this.yaw) * s) * speed;
      wz = (-Math.cos(this.yaw) * f - Math.sin(this.yaw) * s) * speed;
    }
    const accel = this.onGround ? 11 : 2.2;
    this.vel.x = damp(this.vel.x, wx, accel, dt); this.vel.z = damp(this.vel.z, wz, accel, dt);
    if (keys.Space && this.onGround) { this.vel.y = 7.4; this.onGround = false; this.sprinting = this.sprinting; }
    this.vel.y -= 24 * dt;
    // integrate: horizontal then vertical
    this.pos.x += this.vel.x * dt; this.pos.z += this.vel.z * dt;
    W.resolveCircle(this.pos, this.radius, this.pos.y, this.height());
    const gy = W.groundHeight(this.pos.x, this.pos.z, this.radius * 0.8, this.pos.y);
    this.pos.y += this.vel.y * dt;
    if (this.pos.y <= gy) {
      if (!this.onGround && this.vel.y < -6) { this.landKick = clamp(-this.vel.y / 20, 0, 0.5); G.audio && G.audio.step(null, 0.5); }
      this.pos.y = gy; this.vel.y = 0; this.onGround = true;
    } else if (this.pos.y > gy + 0.05) this.onGround = false;
    // clamp inside map
    const lim = W.half - 1.2; this.pos.x = clamp(this.pos.x, -lim, lim); this.pos.z = clamp(this.pos.z, -lim, lim);

    /* footsteps + bob */
    const spd = Math.hypot(this.vel.x, this.vel.z);
    if (this.onGround && spd > 1) {
      this.bob += dt * spd * 1.55;
      this.stepT -= dt * spd;
      if (this.stepT <= 0) { this.stepT = this.sprinting ? 3.4 : 2.7; if (!wantCrouch) G.audio && G.audio.step(null, 0.18); }
    }

    /* ADS */
    const wantAds = mouse.ads && !this.sprinting && this.switchT <= 0 && (!this.reloading || this.weapon.shell);
    const adsRate = 1 / this.weapon.adsTime;
    this.adsT = clamp(this.adsT + (wantAds ? 1 : -1) * adsRate * dt, 0, 1);

    /* weapon switching */
    if (this.switchT > 0) {
      const before = this.switchT;
      this.switchT -= dt;
      if (before > 0.25 && this.switchT <= 0.25) {
        this.cur = this.pendingSwitch; this.weapon = WEAPONS[WEAPON_ORDER[this.cur]]; this.showGun(this.weapon.id); this.adsT = 0;
      }
    }

    /* reload */
    if (this.reloading) {
      const w = this.weapon, st = this.ws[w.id];
      if (w.shell) {
        this.reloadShellT -= dt;
        if (this.reloadShellT <= 0) {
          this.reloadShellT = w.reload;
          if (st.ammo < w.mag && st.reserve > 0) { st.ammo++; st.reserve--; G.audio && G.audio.click('shell', null, 0.6); }
          if (st.ammo >= w.mag || st.reserve <= 0) { this.reloading = false; G.audio && G.audio.click('bolt', null, 0.5); }
        }
        this.reloadT = (this.reloadT + dt) % 1;
      } else {
        const before = this.reloadT;
        this.reloadT += dt;
        if (before < w.reload * 0.55 && this.reloadT >= w.reload * 0.55) G.audio && G.audio.click('magin', null, 0.6);
        if (this.reloadT >= w.reload) {
          const take = Math.min(w.mag - st.ammo, st.reserve);
          st.ammo += take; st.reserve -= take; this.reloading = false; this.reloadT = 0;
          G.audio && G.audio.click('bolt', null, 0.4);
        }
      }
    }

    /* fire */
    if (mouse.fire && this.canFire() && (this.weapon.auto || !mouse.firedThisPress)) {
      this.fire();
      mouse.firedThisPress = true;
    }
    if (!mouse.fire) mouse.firedThisPress = false;

    // recoil recovery (pitch drifts back down a little so sprays are controllable)
    this.spreadDeg = this.currentSpread();
    this.updateCamera(dt, spd);
    this.updateViewmodel(dt, spd);
  }

  updateCamera(dt, spd) {
    const cam = G.camera;
    this.landKick = damp(this.landKick, 0, 9, dt);
    const bobAmt = this.onGround ? Math.min(1, spd / 6) * (this.sprinting ? 1.4 : 1) * (1 - this.adsT * 0.7) : 0;
    const by = Math.sin(this.bob * 2) * 0.022 * bobAmt, bx = Math.cos(this.bob) * 0.015 * bobAmt;
    cam.position.set(this.pos.x, this.pos.y + this.eyeH() + by - this.landKick * 0.25, this.pos.z);
    const sh = G.shake;
    const ex = (Math.random() - 0.5) * sh * 0.012, ey = (Math.random() - 0.5) * sh * 0.012;
    cam.rotation.set(this.pitch + ex, this.yaw + ey, bx * 0.5 + (keysTilt(this)) , 'YXZ');
    const targetFov = lerp(G.settings.fov, this.weapon.adsFov, this.adsT * (this.scoped() || !this.weapon.scope ? 1 : 1)) + (this.sprinting ? 5 : 0);
    this.fov = damp(this.fov, targetFov, 18, dt);
    if (Math.abs(cam.fov - this.fov) > 0.01) { cam.fov = this.fov; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld(true);
  }

  updateViewmodel(dt, spd) {
    const w = this.weapon, g = this.gun, root = this.vmRoot;
    const hip = getHip(w.id), ads = getAds(w.id);
    this.vmKick = damp(this.vmKick, 0, 14, dt);
    this.sway.x = damp(this.sway.x, 0, 8, dt); this.sway.y = damp(this.sway.y, 0, 8, dt);
    const t = this.adsT, e = t * t * (3 - 2 * t);
    let x = lerp(hip[0], ads[0], e), y = lerp(hip[1], ads[1], e), z = lerp(hip[2], ads[2], e);
    let rx = 0, ry = 0, rz = 0;
    const bobAmt = this.onGround ? Math.min(1, spd / 6) * (1 - e * 0.85) : 0;
    x += Math.cos(this.bob) * 0.006 * bobAmt - this.sway.x * (1 - e * 0.7);
    y += Math.abs(Math.sin(this.bob)) * -0.008 * bobAmt + this.sway.y * (1 - e * 0.7) - this.landKick * 0.1;
    // idle breathing
    y += Math.sin(G.time * 1.6) * 0.0014; x += Math.cos(G.time * 1.1) * 0.001;
    if (!this.onGround) y -= 0.01;
    // recoil
    z += this.vmKick * 0.05; rx += this.vmKick * 0.07 * (1 - e * 0.4);
    // sprint pose
    this.sprintT = damp(this.sprintT || 0, this.sprinting ? 1 : 0, 10, dt);
    x -= this.sprintT * 0.06; y -= this.sprintT * 0.08; z += this.sprintT * 0.04; ry += this.sprintT * 0.7; rx += this.sprintT * -0.25; rz += this.sprintT * 0.15;
    // switch pose
    if (this.switchT > 0) { const k = Math.sin(clamp(this.switchT / 0.5, 0, 1) * Math.PI); y -= k * 0.35; rx -= k * 0.6; }
    // reload pose
    if (this.reloading && !w.shell) {
      const p = this.reloadProgress(), k = Math.sin(p * Math.PI);
      y -= k * 0.1; rx -= k * 0.5; rz += k * 0.35; x -= k * 0.04;
      const mag = g.named.mag;
      if (mag) {
        const out = p < 0.2 ? p / 0.2 : p < 0.5 ? 1 : p < 0.7 ? 1 - (p - 0.5) / 0.2 : 0;
        mag.position.y = mag.userData.home.y - out * 0.2; mag.position.x = mag.userData.home.x - out * 0.03;
      }
    } else if (g.named.mag) { g.named.mag.position.copy(g.named.mag.userData.home); }
    if (this.reloading && w.shell) { rx -= 0.25; y -= 0.05; }
    // pump / bolt motion
    if (this.boltT > 0) {
      this.boltT = Math.max(0, this.boltT - dt / (w.id === 'sniper' ? 0.9 : 0.6));
      const k = Math.sin(this.boltT * Math.PI);
      if (w.id === 'sniper') { rz += k * 0.25; x += k * 0.01; }
      if (g.named.pump) g.named.pump.position.z = g.named.pump.userData.home.z + k * 0.12;
      if (g.named.bolt) g.named.bolt.position.z = g.named.bolt.userData.home.z + k * 0.08;
    }
    root.position.set(x, y, z);
    root.rotation.set(rx, ry, rz);
    g.root.visible = !(this.scoped());
    // muzzle flash
    this.flashLight.intensity = Math.max(0, this.flashLight.intensity - dt * 120);
    g.muzzle.getWorldPosition(_v); this.flashLight.position.copy(_v).add(new THREE.Vector3(0, 0.04, 0.12));
    if (this.flashT > 0) {
      this.flashT -= dt;
      g.flash.visible = !this.scoped();
      g.flash.material.rotation = rnd(0, 6.28);
      const sz = 0.13 * this.flashSize * rnd(0.8, 1.15); g.flash.scale.set(sz, sz, 1);
    } else g.flash.visible = false;
  }

  updateDead(dt) {
    this.deadT += dt;
    const cam = G.camera;
    const k = clamp(this.deadT / 0.6, 0, 1);
    cam.position.set(this.pos.x, this.pos.y + lerp(this.eyeH(), 0.3, k), this.pos.z);
    cam.rotation.set(this.pitch * (1 - k) + 0.2 * k, this.yaw, k * 0.5 * (this.deadSide || (this.deadSide = Math.random() < 0.5 ? 1 : -1)), 'YXZ');
    cam.fov = damp(cam.fov, G.settings.fov, 8, dt); cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    this.adsT = 0; this.gun.root.visible = false;
    const remain = 4 - this.deadT;
    HUD.setRespawn(remain);
    if (this.deadT > 4 && G.state === 'playing') G.respawnActor(this);
  }
}

function keysTilt(p) {
  // subtle strafe lean
  const side = (p.vel.x * Math.cos(p.yaw) - p.vel.z * Math.sin(p.yaw));
  return -clamp(side / 6, -1, 1) * 0.012;
}
