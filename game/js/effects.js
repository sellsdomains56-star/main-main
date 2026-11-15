import * as THREE from 'three';
import { G, rnd } from './state.js';

let scene;
const sprites = [];
const tracers = [];
const decals = [];
let decalIdx = 0;
let softTex, flashTex, decalTex, smokeTex;
let boomLight;
const flashes = [];

function radial(stops, size = 64) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) gr.addColorStop(o, col);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function starTex() {
  const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'); g.translate(s / 2, s / 2);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, s / 2);
  gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.25, 'rgba(255,200,90,.85)'); gr.addColorStop(1, 'rgba(255,120,30,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, s / 2, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,230,160,.9)';
  for (let i = 0; i < 6; i++) {
    g.rotate(Math.PI / 3 + rnd(-0.2, 0.2));
    g.beginPath(); g.moveTo(0, -3); g.lineTo(s * 0.48, 0); g.lineTo(0, 3); g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function makeFlashSprite() {
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
}

export function initEffects(sc) {
  scene = sc;
  softTex = radial([[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,.6)'], [1, 'rgba(255,255,255,0)']]);
  smokeTex = radial([[0, 'rgba(255,255,255,.85)'], [0.6, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]);
  flashTex = starTex();
  decalTex = radial([[0, 'rgba(0,0,0,.95)'], [0.35, 'rgba(10,10,10,.75)'], [0.7, 'rgba(10,10,10,.2)'], [1, 'rgba(0,0,0,0)']], 64);

  for (let i = 0; i < 360; i++) {
    const m = new THREE.SpriteMaterial({ map: softTex, transparent: true, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(m); s.visible = false; scene.add(s);
    sprites.push({ s, m, vel: new THREE.Vector3(), life: 0, max: 1, g: 0, drag: 0, s0: 1, s1: 1, o0: 1, rot: 0, rotv: 0, grow: false });
  }
  const tg = new THREE.BoxGeometry(1, 1, 1); tg.translate(0, 0, -0.5);
  for (let i = 0; i < 36; i++) {
    const m = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    m.visible = false; scene.add(m);
    tracers.push({ m, a: new THREE.Vector3(), b: new THREE.Vector3(), dir: new THREE.Vector3(), dist: 0, age: 0, speed: 400, len: 5, live: false });
  }
  for (let i = 0; i < 64; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: decalTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, opacity: 0.85 }));
    m.visible = false; scene.add(m); decals.push(m);
  }
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
    m.visible = false; scene.add(m); flashes.push({ m, t: 0 });
  }
  boomLight = new THREE.PointLight(0xff9a40, 0, 40, 2); scene.add(boomLight);
}

function spawn(o) {
  let sp = null;
  for (const s of sprites) if (s.life <= 0) { sp = s; break; }
  if (!sp) return null;
  sp.s.visible = true; sp.s.position.copy(o.pos);
  sp.vel.copy(o.vel || { x: 0, y: 0, z: 0 });
  sp.life = sp.max = o.life; sp.g = o.g || 0; sp.drag = o.drag || 0;
  sp.s0 = o.s0; sp.s1 = o.s1 ?? o.s0; sp.o0 = o.op ?? 1;
  sp.m.map = o.tex || softTex; sp.m.color.set(o.color ?? 0xffffff);
  sp.m.blending = o.add ? THREE.AdditiveBlending : THREE.NormalBlending;
  sp.m.opacity = sp.o0; sp.m.rotation = rnd(0, 6.28); sp.rotv = o.rotv || 0;
  sp.s.scale.set(o.s0, o.s0, 1);
  return sp;
}

const _v = new THREE.Vector3();
export function tracer(from, to, color = 0xffd9a0, speed = 420, len = 6, width = 0.02) {
  let t = null;
  for (const x of tracers) if (!x.live) { t = x; break; }
  if (!t) return;
  t.a.copy(from); t.b.copy(to); t.dir.copy(to).sub(from); t.dist = t.dir.length();
  if (t.dist < 1) return;
  t.dir.multiplyScalar(1 / t.dist); t.age = 0; t.speed = speed; t.len = len; t.live = true;
  t.m.material.color.set(color); t.m.visible = true; t.w = width;
}

export function sparks(p, n = 8, color = 0xffc070, speed = 5, n2 = null) {
  for (let i = 0; i < n; i++) {
    _v.set(rnd(-1, 1), rnd(-0.2, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(speed * 0.4, speed));
    if (n2) _v.addScaledVector(n2, speed * 0.6);
    spawn({ pos: p, vel: _v, life: rnd(0.15, 0.4), s0: 0.07, s1: 0.01, color, add: true, g: 12 });
  }
}
export function dust(p, n = 3, normal = null, color = 0xb8aa98, size = 0.7) {
  for (let i = 0; i < n; i++) {
    _v.set(rnd(-0.6, 0.6), rnd(0.2, 1), rnd(-0.6, 0.6));
    if (normal) _v.addScaledVector(normal, 1.2);
    spawn({ pos: p, vel: _v, life: rnd(0.5, 0.9), s0: size * 0.3, s1: size, color, op: 0.38, drag: 3, tex: smokeTex, rotv: rnd(-1, 1) });
  }
}
export function blood(p, n = 6, dirv = null) {
  for (let i = 0; i < n; i++) {
    _v.set(rnd(-1, 1), rnd(-0.2, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(1, 4));
    if (dirv) _v.addScaledVector(dirv, 3);
    spawn({ pos: p, vel: _v, life: rnd(0.25, 0.6), s0: 0.1, s1: 0.03, color: 0xa01010, g: 10, op: 0.95 });
  }
}
export function decal(p, n, size = 0.14, scorch = false) {
  const d = decals[decalIdx++ % decals.length];
  d.visible = true;
  d.position.copy(p).addScaledVector(n, 0.012 + Math.random() * 0.004);
  d.lookAt(_v.copy(p).add(n));
  d.rotateZ(rnd(0, 6.28));
  const s = size * rnd(0.85, 1.25);
  d.scale.set(s, s, 1);
  d.material.opacity = scorch ? 0.9 : 0.8;
}
export function muzzleFlash(pos, size = 0.45) {
  let f = null;
  for (const x of flashes) if (x.t <= 0) { f = x; break; }
  if (!f) return;
  f.t = 0.055; f.m.visible = true; f.m.position.copy(pos);
  f.size = size * rnd(0.8, 1.2); f.m.scale.set(f.size, f.size, 1); f.m.material.rotation = rnd(0, 6.28); f.m.material.opacity = 1;
}
export function impact(p, n, kind = 'world') {
  if (kind === 'actor') { blood(p, 7, n); return; }
  sparks(p, 7, 0xffb860, 5.5, n);
  dust(p, 3, n);
  decal(p, n, 0.13);
}
export function explosion(p) {
  for (let i = 0; i < 9; i++) {
    _v.set(rnd(-1, 1), rnd(0, 1), rnd(-1, 1)).multiplyScalar(rnd(2, 5));
    spawn({ pos: p, vel: _v, life: rnd(0.35, 0.6), s0: 1.2, s1: rnd(4, 7), color: 0xff8a2a, add: true, drag: 3, op: 0.95 });
  }
  for (let i = 0; i < 14; i++) {
    _v.set(rnd(-1, 1), rnd(0.2, 1.4), rnd(-1, 1)).multiplyScalar(rnd(1, 5));
    spawn({ pos: p, vel: _v, life: rnd(1.4, 2.6), s0: 2, s1: rnd(6, 10), color: 0x38342f, op: 0.7, drag: 1.8, tex: smokeTex, rotv: rnd(-0.6, 0.6) });
  }
  for (let i = 0; i < 40; i++) {
    _v.set(rnd(-1, 1), rnd(-0.1, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(6, 22));
    spawn({ pos: p, vel: _v, life: rnd(0.3, 0.9), s0: 0.14, s1: 0.02, color: 0xffb050, add: true, g: 14 });
  }
  boomLight.position.copy(p); boomLight.position.y += 1; boomLight.intensity = 260;
}

export function updateEffects(dt) {
  for (const s of sprites) {
    if (s.life <= 0) continue;
    s.life -= dt;
    if (s.life <= 0) { s.s.visible = false; continue; }
    const k = 1 - s.life / s.max;
    s.vel.y -= s.g * dt;
    if (s.drag) s.vel.multiplyScalar(Math.max(0, 1 - s.drag * dt));
    s.s.position.addScaledVector(s.vel, dt);
    if (s.s.position.y < 0.02 && s.g > 0) { s.s.position.y = 0.02; s.vel.y *= -0.3; s.vel.x *= 0.6; s.vel.z *= 0.6; }
    const sz = s.s0 + (s.s1 - s.s0) * k;
    s.s.scale.set(sz, sz, 1);
    s.m.opacity = s.o0 * (1 - k * k);
    s.m.rotation += s.rotv * dt;
  }
  for (const t of tracers) {
    if (!t.live) continue;
    t.age += dt;
    const head = t.age * t.speed;
    if (head - t.len > t.dist) { t.live = false; t.m.visible = false; continue; }
    const h = Math.min(head, t.dist), tl = Math.max(0, head - t.len), l = h - tl;
    if (l <= 0.01) { t.m.visible = false; continue; }
    t.m.visible = true;
    t.m.position.copy(t.a).addScaledVector(t.dir, h);
    t.m.lookAt(_v.copy(t.m.position).add(t.dir));
    t.m.scale.set(t.w, t.w, l);
  }
  for (const f of flashes) {
    if (f.t <= 0) continue;
    f.t -= dt;
    if (f.t <= 0) f.m.visible = false; else f.m.material.opacity = f.t / 0.055;
  }
  boomLight.intensity = Math.max(0, boomLight.intensity - dt * 520);
}
