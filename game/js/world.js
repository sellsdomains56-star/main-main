import * as THREE from '../lib/three.module.js';
import { rnd } from './state.js';

export const HALF = 50;
export const STEP = 0.5;

/* ------------------------------------------------------------------ textures */
function mkCanvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function toTex(c, aniso = 8) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
}
function speckle(g, w, h, amt) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amt;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}
function blotches(g, s, n, maxA = 0.12, dark = true) {
  for (let i = 0; i < n; i++) {
    const x = rnd(0, s), y = rnd(0, s), r = rnd(10, s * 0.25);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const c = dark ? '0,0,0' : '255,255,255';
    gr.addColorStop(0, `rgba(${c},${rnd(0.03, maxA)})`);
    gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function concreteTex(base = '#8e8b84') {
  const s = 256, c = mkCanvas(s), g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, s, s);
  blotches(g, s, 70, 0.14);
  blotches(g, s, 25, 0.07, false);
  speckle(g, s, s, 30);
  g.strokeStyle = 'rgba(25,25,25,.5)'; g.lineWidth = 3; g.strokeRect(0, 0, s, s);
  g.strokeStyle = 'rgba(20,20,20,.35)'; g.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    let x = rnd(0, s), y = rnd(0, s);
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += rnd(-14, 14); y += rnd(4, 18); g.lineTo(x, y); }
    g.stroke();
  }
  return toTex(c);
}
function brickTex() {
  const s = 256, c = mkCanvas(s), g = c.getContext('2d');
  g.fillStyle = '#5d5650'; g.fillRect(0, 0, s, s);
  const pal = ['#8a4a36', '#7c4232', '#94533c', '#6e3b2c', '#9c5b43', '#85483a'];
  const bh = 32, bw = 64;
  for (let r = 0; r < s / bh; r++) {
    const off = (r % 2) * (bw / 2);
    for (let x = -bw; x < s + bw; x += bw) {
      g.fillStyle = pal[(Math.random() * pal.length) | 0];
      g.fillRect(x + off + 2, r * bh + 2, bw - 4, bh - 4);
    }
  }
  blotches(g, s, 40, 0.18);
  speckle(g, s, s, 38);
  return toTex(c);
}
function crateTex() {
  const s = 256, c = mkCanvas(s), g = c.getContext('2d');
  g.fillStyle = '#a07040'; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 6; i++) {
    const y = i * (s / 6);
    g.fillStyle = `rgba(${60 + rnd(-10, 10)},${35},${15},.35)`;
    g.fillRect(0, y, s, 3);
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = `rgba(60,35,15,${rnd(0.08, 0.25)})`;
      g.beginPath(); const yy = y + rnd(4, s / 6 - 4); g.moveTo(rnd(0, s), yy); g.lineTo(rnd(0, s), yy + rnd(-2, 2)); g.stroke();
    }
  }
  g.strokeStyle = '#5a3a1c'; g.lineWidth = 16; g.strokeRect(8, 8, s - 16, s - 16);
  g.lineWidth = 12; g.beginPath(); g.moveTo(14, 14); g.lineTo(s - 14, s - 14); g.moveTo(s - 14, 14); g.lineTo(14, s - 14); g.stroke();
  g.fillStyle = '#2a2a2a';
  for (const [x, y] of [[14, 14], [s - 14, 14], [14, s - 14], [s - 14, s - 14], [s / 2, s / 2]]) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); }
  speckle(g, s, s, 24);
  return toTex(c);
}
function containerTex(color) {
  const s = 256, c = mkCanvas(s), g = c.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 16) {
    const gr = g.createLinearGradient(x, 0, x + 16, 0);
    gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(0.5, 'rgba(0,0,0,.0)'); gr.addColorStop(1, 'rgba(0,0,0,.28)');
    g.fillStyle = gr; g.fillRect(x, 0, 16, s);
  }
  // rust streaks
  for (let i = 0; i < 26; i++) {
    const x = rnd(0, s), y = rnd(0, s * 0.4), l = rnd(30, 140);
    const gr = g.createLinearGradient(0, y, 0, y + l);
    gr.addColorStop(0, 'rgba(110,50,20,.0)'); gr.addColorStop(0.3, `rgba(110,50,20,${rnd(0.1, 0.3)})`); gr.addColorStop(1, 'rgba(110,50,20,0)');
    g.fillStyle = gr; g.fillRect(x, y, rnd(2, 6), l);
  }
  blotches(g, s, 40, 0.2);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, s, 6); g.fillRect(0, s - 6, s, 6);
  speckle(g, s, s, 26);
  return toTex(c);
}
function roofTex() {
  const s = 256, c = mkCanvas(s), g = c.getContext('2d');
  g.fillStyle = '#4d5156'; g.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 32) {
    const gr = g.createLinearGradient(x, 0, x + 32, 0);
    gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(0.5, 'rgba(0,0,0,.1)'); gr.addColorStop(1, 'rgba(0,0,0,.3)');
    g.fillStyle = gr; g.fillRect(x, 0, 32, s);
  }
  blotches(g, s, 40, 0.2); speckle(g, s, s, 22);
  return toTex(c);
}
function groundTex() {
  const s = 512, c = mkCanvas(s), g = c.getContext('2d');
  g.fillStyle = '#6a665e'; g.fillRect(0, 0, s, s);
  blotches(g, s, 120, 0.16);
  blotches(g, s, 60, 0.07, false);
  speckle(g, s, s, 44);
  g.strokeStyle = 'rgba(20,20,20,.4)';
  for (let i = 0; i < 9; i++) {
    g.lineWidth = rnd(0.8, 2);
    g.beginPath(); let x = rnd(0, s), y = rnd(0, s); g.moveTo(x, y);
    for (let k = 0; k < 10; k++) { x += rnd(-22, 22); y += rnd(-22, 22); g.lineTo(x, y); }
    g.stroke();
  }
  return toTex(c);
}
function windowsTex() {
  const w = 128, h = 256, c = mkCanvas(w, h), g = c.getContext('2d');
  g.fillStyle = '#20252e'; g.fillRect(0, 0, w, h);
  for (let y = 6; y < h - 6; y += 14) for (let x = 6; x < w - 6; x += 14) {
    const lit = Math.random();
    g.fillStyle = lit < 0.28 ? `rgba(255,${190 + rnd(0, 50) | 0},${110 + rnd(0, 60) | 0},${rnd(0.65, 1)})` : `rgba(${50 + rnd(0, 25) | 0},${60 + rnd(0, 25) | 0},${78 + rnd(0, 25) | 0},1)`;
    g.fillRect(x, y, 8, 9);
  }
  const t = toTex(c, 4);
  return t;
}
function skyTex() {
  const w = 1024, h = 512, c = mkCanvas(w, h), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0.0, '#1e2f5a');
  gr.addColorStop(0.28, '#4b5f93');
  gr.addColorStop(0.42, '#b98a94');
  gr.addColorStop(0.49, '#f0a56b');
  gr.addColorStop(0.52, '#d9a27c');
  gr.addColorStop(1.0, '#a07a62');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // soft clouds
  for (let i = 0; i < 90; i++) {
    const x = rnd(0, w), y = rnd(h * 0.22, h * 0.47), rx = rnd(40, 160), ry = rnd(4, 14);
    const cg = g.createRadialGradient(x, y, 0, x, y, rx);
    const warm = y > h * 0.4;
    cg.addColorStop(0, warm ? 'rgba(255,190,140,.20)' : 'rgba(210,190,220,.14)');
    cg.addColorStop(1, 'rgba(255,200,160,0)');
    g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y);
    g.fillStyle = cg; g.fillRect(x - rx, y - rx, rx * 2, rx * 2); g.restore();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function glowTex() {
  const s = 128, c = mkCanvas(s), g = c.getContext('2d');
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, 'rgba(255,245,220,1)'); gr.addColorStop(0.12, 'rgba(255,220,160,.9)');
  gr.addColorStop(0.4, 'rgba(255,170,90,.28)'); gr.addColorStop(1, 'rgba(255,150,70,0)');
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ------------------------------------------------------------------ world */
export function buildWorld(scene) {
  const boxes = [];           // collision AABBs
  const groups = new Map();   // matKey -> merged geometry arrays

  const mats = {
    concrete: new THREE.MeshStandardMaterial({ map: concreteTex(), roughness: 0.95 }),
    barrier: new THREE.MeshStandardMaterial({ map: concreteTex('#a9a59a'), roughness: 0.95 }),
    brick: new THREE.MeshStandardMaterial({ map: brickTex(), roughness: 0.92 }),
    crate: new THREE.MeshStandardMaterial({ map: crateTex(), roughness: 0.85 }),
    contRed: new THREE.MeshStandardMaterial({ map: containerTex('#8c2f27'), roughness: 0.6, metalness: 0.35 }),
    contBlue: new THREE.MeshStandardMaterial({ map: containerTex('#2c4f7a'), roughness: 0.6, metalness: 0.35 }),
    contGreen: new THREE.MeshStandardMaterial({ map: containerTex('#3d6049'), roughness: 0.6, metalness: 0.35 }),
    contOrange: new THREE.MeshStandardMaterial({ map: containerTex('#b8691f'), roughness: 0.6, metalness: 0.35 }),
    roof: new THREE.MeshStandardMaterial({ map: roofTex(), roughness: 0.7, metalness: 0.4 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.5, metalness: 0.7 }),
    barrelRed: new THREE.MeshStandardMaterial({ color: 0x9c2a22, roughness: 0.55, metalness: 0.5 }),
    barrelBlue: new THREE.MeshStandardMaterial({ color: 0x24508c, roughness: 0.55, metalness: 0.5 }),
    barrelYellow: new THREE.MeshStandardMaterial({ color: 0xc79a1c, roughness: 0.55, metalness: 0.5 }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xffe2a8 }),
    paint: new THREE.MeshStandardMaterial({ color: 0xe8c14a, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    paintWhite: new THREE.MeshStandardMaterial({ color: 0xdcd8cc, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  };

  function group(key) {
    let g = groups.get(key);
    if (!g) { g = { pos: [], nor: [], uv: [], idx: [], n: 0 }; groups.set(key, g); }
    return g;
  }
  function push(key, geom) {
    const g = group(key);
    const p = geom.attributes.position, n = geom.attributes.normal, u = geom.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      g.pos.push(p.getX(i), p.getY(i), p.getZ(i));
      g.nor.push(n.getX(i), n.getY(i), n.getZ(i));
      g.uv.push(u.getX(i), u.getY(i));
    }
    const idx = geom.index;
    for (let i = 0; i < idx.count; i++) g.idx.push(idx.getX(i) + g.n);
    g.n += p.count;
    geom.dispose();
  }

  // axis-aligned box with texture density control; solid -> collides
  function box(cx, cz, w, d, h, key, o = {}) {
    const y0 = o.y0 || 0, tile = o.tile || 3, solid = o.solid !== false;
    const geo = new THREE.BoxGeometry(w, h, d);
    const uv = geo.attributes.uv;
    const ox = rnd(0, 1), oy = rnd(0, 1);
    for (let f = 0; f < 6; f++) {
      const su = f < 2 ? d : w, sv = f < 2 ? h : f < 4 ? d : h;
      for (let k = 0; k < 4; k++) {
        const i = f * 4 + k;
        uv.setXY(i, uv.getX(i) * su / tile + ox, uv.getY(i) * sv / tile + oy);
      }
    }
    geo.translate(cx, y0 + h / 2, cz);
    push(key, geo);
    if (solid) boxes.push({ x0: cx - w / 2, x1: cx + w / 2, y0, y1: y0 + h, z0: cz - d / 2, z1: cz + d / 2 });
  }
  function cyl(cx, cz, r, h, key, solid = true, y0 = 0) {
    const geo = new THREE.CylinderGeometry(r, r, h, 14);
    geo.translate(cx, y0 + h / 2, cz);
    push(key, geo);
    if (solid) boxes.push({ x0: cx - r * 0.85, x1: cx + r * 0.85, y0, y1: y0 + h, z0: cz - r * 0.85, z1: cz + r * 0.85 });
  }
  // flat paint marking
  function paint(cx, cz, w, d, key = 'paint') {
    box(cx, cz, w, d, 0.02, key, { solid: false, tile: 5 });
  }

  // wall segment helpers ---------------------------------------------------
  function seg(axis, fixed, a0, a1, y0, y1, t, key) {
    if (a1 - a0 < 0.05 || y1 - y0 < 0.05) return;
    if (axis === 'x') box((a0 + a1) / 2, fixed, a1 - a0, t, y1 - y0, key, { y0, tile: 3 });
    else box(fixed, (a0 + a1) / 2, t, a1 - a0, y1 - y0, key, { y0, tile: 3 });
  }
  // openings: [{at, w, kind: 'door'|'win'}] positions are offsets from the wall centre
  function wall(axis, fixed, c0, c1, h, t, ops, key) {
    const list = [...(ops || [])].sort((a, b) => a.at - b.at);
    const mid = (c0 + c1) / 2;
    let cur = c0;
    for (const o of list) {
      const a = mid + o.at - o.w / 2, b = mid + o.at + o.w / 2;
      seg(axis, fixed, cur, a, 0, h, t, key);
      if (o.kind === 'win') { seg(axis, fixed, a, b, 0, 1.0, t, key); seg(axis, fixed, a, b, 2.2, h, t, key); }
      else seg(axis, fixed, a, b, 2.7, h, t, key);
      cur = b;
    }
    seg(axis, fixed, cur, c1, 0, h, t, key);
  }
  function building(cx, cz, w, d, h, o) {
    const t = 0.6, key = o.key || 'brick';
    wall('x', cz - d / 2, cx - w / 2 - t / 2, cx + w / 2 + t / 2, h, t, o.n, key);
    wall('x', cz + d / 2, cx - w / 2 - t / 2, cx + w / 2 + t / 2, h, t, o.s, key);
    wall('z', cx - w / 2, cz - d / 2 + t / 2, cz + d / 2 - t / 2, h, t, o.w, key);
    wall('z', cx + w / 2, cz - d / 2 + t / 2, cz + d / 2 - t / 2, h, t, o.e, key);
    if (o.roof) box(cx, cz, w + 1.2, d + 1.2, 0.4, 'roof', { y0: h, tile: 4 });
  }
  const D = (at, w = 3.2) => ({ at, w, kind: 'door' });
  const W = (at, w = 2.4) => ({ at, w, kind: 'win' });

  /* ---------------- perimeter ---------------- */
  const P = HALF + 1.5;
  box(0, -P, HALF * 2 + 6, 3, 8, 'concrete', { tile: 4 });
  box(0, P, HALF * 2 + 6, 3, 8, 'concrete', { tile: 4 });
  box(-P, 0, 3, HALF * 2 + 6, 8, 'concrete', { tile: 4 });
  box(P, 0, 3, HALF * 2 + 6, 8, 'concrete', { tile: 4 });

  /* ---------------- central compound ---------------- */
  building(0, 0, 22, 16, 4.2, {
    n: [D(-5), W(5)], s: [D(5), W(-5)], w: [D(0), W(-5), W(5)], e: [D(0), W(-5), W(5)],
  });
  // interior partitions
  seg('z', -4, -8 + 0.3, -2.4, 0, 4.2, 0.4, 'concrete');
  seg('z', -4, 2.4, 8 - 0.3, 0, 4.2, 0.4, 'concrete');
  seg('z', 4.2, -8 + 0.3, -3.4, 0, 4.2, 0.4, 'concrete');
  seg('z', 4.2, 1.2, 8 - 0.3, 0, 4.2, 0.4, 'concrete');
  box(-7, -4.5, 1.2, 1.2, 1.2, 'crate', { tile: 1.2 });
  box(7, 5, 1.2, 1.2, 1.2, 'crate', { tile: 1.2 });
  box(7, 4.6, 1.2, 1.2, 1.2, 'crate', { tile: 1.2, y0: 1.2 });

  /* ---------------- warehouses ---------------- */
  building(-31, -22, 20, 11, 5.2, {
    key: 'concrete', roof: true,
    n: [W(-6), W(6)], s: [D(-5, 3.6), D(5, 3.6)], w: [D(0, 4)], e: [D(0, 4)],
  });
  box(-34, -22, 6, 2.4, 2.4, 'contGreen', { tile: 3 });
  box(-27, -24, 1.2, 1.2, 1.2, 'crate', { tile: 1.2 });
  building(31, 22, 20, 11, 5.2, {
    key: 'concrete', roof: true,
    n: [D(-5, 3.6), D(5, 3.6)], s: [W(-6), W(6)], w: [D(0, 4)], e: [D(0, 4)],
  });
  box(34, 22, 6, 2.4, 2.4, 'contBlue', { tile: 3 });
  box(27, 24, 1.2, 1.2, 1.2, 'crate', { tile: 1.2 });

  /* ---------------- guard huts ---------------- */
  building(30, -30, 6.5, 6.5, 3.4, { key: 'brick', roof: true, s: [D(0, 2.6)], w: [W(0, 2)] });
  building(-30, 30, 6.5, 6.5, 3.4, { key: 'brick', roof: true, n: [D(0, 2.6)], e: [W(0, 2)] });

  /* ---------------- loading docks with stairs (sniper perches) ---------------- */
  function dock(cx, cz, dir) {
    box(cx, cz, 10, 5, 1.6, 'concrete', { tile: 3 });
    for (let i = 0; i < 4; i++) box(cx + dir * (5.45 + (3 - i) * 0.9), cz, 0.9, 3, 0.4 * (i + 1), 'concrete', { tile: 2 });
    box(cx - dir * 3, cz - 1.6, 3, 0.5, 0.9, 'barrier', { y0: 1.6, tile: 2 });
    box(cx + dir * 0.5, cz + 1.8, 0.8, 0.8, 0.9, 'crate', { y0: 1.6, tile: 0.9 });
  }
  dock(-9, -34, 1);
  dock(9, 34, -1);

  /* ---------------- containers ---------------- */
  const C = (x, z, w, d, k, y0 = 0) => box(x, z, w, d, 2.6, k, { y0, tile: 2.6 });
  C(-18, 9, 6, 2.4, 'contRed'); C(-18, 14, 6, 2.4, 'contBlue');
  C(18, -9, 6, 2.4, 'contGreen'); C(18, -14, 6, 2.4, 'contOrange');
  C(-40, 0, 2.4, 8, 'contBlue'); C(40, 0, 2.4, 8, 'contRed');
  C(0, -26, 8, 2.4, 'contGreen'); C(0, 26, 8, 2.4, 'contOrange');
  C(14, 13, 6, 2.4, 'contRed'); C(14, 13, 6, 2.4, 'contBlue', 2.6);
  C(-14, -13, 6, 2.4, 'contOrange'); C(-14, -13, 6, 2.4, 'contGreen', 2.6);
  C(-38, 18, 8, 2.4, 'contGreen'); C(38, -18, 8, 2.4, 'contRed');
  C(26, -10, 2.4, 6, 'contBlue'); C(-26, 10, 2.4, 6, 'contOrange');

  /* ---------------- crates ---------------- */
  const crate = (x, z, s = 1.2, y0 = 0) => box(x, z, s, s, s, 'crate', { y0, tile: s });
  for (const [x, z] of [[-6, -15], [-7.3, -15], [-6.6, -13.8], [6, 15], [7.3, 15], [6.6, 13.8], [-45, -40], [-43.7, -40], [45, 40], [43.7, 40], [-22, 32], [22, -32], [-3, 17], [3, -17]]) crate(x, z);
  crate(-6.65, -15, 1.2, 1.2); crate(6.65, 15, 1.2, 1.2);
  crate(-22, 32, 1.2, 1.2); crate(22, -32, 1.2, 1.2);
  crate(-45, 0.2 + 12, 1.6); crate(45, -12, 1.6);

  /* ---------------- jersey barriers (low cover) ---------------- */
  const barrier = (x, z, alongX = true) => box(x, z, alongX ? 3 : 0.7, alongX ? 0.7 : 3, 0.95, 'barrier', { tile: 1.5 });
  for (const [x, z, a] of [[-24, 4, false], [-24, -4, false], [24, 4, false], [24, -4, false], [8, -20, true], [-8, 20, true],
    [-20, -34, true], [20, 34, true], [-34, 8, true], [34, -8, true], [0, -12, true], [0, 12, true], [12, -34, false], [-12, 34, false],
    [-42, -20, false], [42, 20, false], [-16, 24, true], [16, -24, true]]) barrier(x, z, a);

  /* ---------------- barrels & columns ---------------- */
  const barrels = [[-11, 3, 'barrelRed'], [-11.8, 3.8, 'barrelBlue'], [-10.9, 4.7, 'barrelRed'],
    [11, -3, 'barrelYellow'], [11.8, -3.8, 'barrelRed'], [10.9, -4.7, 'barrelBlue'],
    [-24, -24, 'barrelRed'], [-24.9, -23.4, 'barrelYellow'], [24, 24, 'barrelRed'], [24.9, 23.4, 'barrelYellow'],
    [-44, 30, 'barrelBlue'], [44, -30, 'barrelBlue']];
  for (const [x, z, k] of barrels) cyl(x, z, 0.38, 1.0, k);
  for (const [x, z] of [[-6, -20], [6, 20], [-20, 20], [20, -20], [-34, -8], [34, 8]]) box(x, z, 1.0, 1.0, 4.2, 'concrete', { tile: 2 });

  /* ---------------- street lamps ---------------- */
  for (const [x, z] of [[-12, -30], [12, 30], [-30, 12], [30, -12], [-44, -44], [44, 44], [44, -44], [-44, 44]]) {
    box(x, z, 0.28, 0.28, 7.0, 'metal', { tile: 2 });
    box(x + 0.5, z, 1.3, 0.3, 0.18, 'metal', { y0: 6.9, solid: false, tile: 2 });
    box(x + 1.0, z, 0.5, 0.26, 0.1, 'lamp', { y0: 6.76, solid: false, tile: 2 });
  }

  /* ---------------- painted road markings ---------------- */
  for (let z = -46; z < -12; z += 4) paint(0, z, 0.2, 2);
  for (let z = 14; z < 46; z += 4) paint(0, z, 0.2, 2);
  for (let x = -46; x < -14; x += 4) paint(x, -8, 2, 0.2, 'paintWhite');
  for (let x = 14; x < 46; x += 4) paint(x, 8, 2, 0.2, 'paintWhite');
  for (let i = 0; i < 6; i++) { paint(-46 + i * 3, 42.5, 0.15, 5); paint(46 - i * 3, -42.5, 0.15, 5); }

  /* ---------------- build merged meshes ---------------- */
  for (const [key, g] of groups) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(g.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.uv, 2));
    geo.setIndex(g.n > 65535 ? new THREE.Uint32BufferAttribute(g.idx, 1) : new THREE.Uint16BufferAttribute(g.idx, 1));
    geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mats[key]);
    const isPaint = key.startsWith('paint');
    m.castShadow = key !== 'lamp' && !isPaint;
    m.receiveShadow = key !== 'lamp';
    scene.add(m);
  }

  /* ---------------- ground ---------------- */
  const gt = groundTex(); gt.repeat.set(32, 32);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), new THREE.MeshStandardMaterial({ map: gt, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);

  /* ---------------- sky, sun, skyline ---------------- */
  const skyT = skyTex();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -10; scene.add(sky);
  const az = 2.35, el = 0.3;
  const sunDir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
  glow.position.copy(sunDir).multiplyScalar(450); glow.scale.set(260, 260, 1); scene.add(glow);

  const wt = windowsTex(); wt.repeat.set(2, 3);
  const skyMat = new THREE.MeshBasicMaterial({ map: wt, color: 0xb8a8a0 });
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + rnd(-0.05, 0.05), r = rnd(78, 118);
    const w = rnd(12, 26), d = rnd(12, 26), h = rnd(18, 62);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), skyMat);
    m.position.set(Math.cos(a) * r, h / 2 - 1, Math.sin(a) * r);
    m.rotation.y = rnd(0, 1.5);
    scene.add(m);
  }

  /* ---------------- navigation grid ---------------- */
  const CELL = 1.5, N = Math.ceil((HALF * 2) / CELL);
  const blocked = new Uint8Array(N * N);
  const INFL = 0.6;
  for (const b of boxes) {
    if (!(b.y0 < 1.8 && b.y1 > 0.45)) continue;
    const i0 = Math.max(0, Math.floor((b.x0 - INFL + HALF) / CELL)), i1 = Math.min(N - 1, Math.floor((b.x1 + INFL + HALF) / CELL));
    const j0 = Math.max(0, Math.floor((b.z0 - INFL + HALF) / CELL)), j1 = Math.min(N - 1, Math.floor((b.z1 + INFL + HALF) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const cx = -HALF + (i + 0.5) * CELL, cz = -HALF + (j + 0.5) * CELL;
      if (cx > b.x0 - INFL && cx < b.x1 + INFL && cz > b.z0 - INFL && cz < b.z1 + INFL) blocked[j * N + i] = 1;
    }
  }
  // outer ring is always blocked
  for (let k = 0; k < N; k++) { blocked[k] = 1; blocked[(N - 1) * N + k] = 1; blocked[k * N] = 1; blocked[k * N + N - 1] = 1; }

  const cellI = (x) => Math.max(0, Math.min(N - 1, Math.floor((x + HALF) / CELL)));
  const isBlocked = (x, z) => blocked[cellI(z) * N + cellI(x)] === 1;

  function nearestFree(i, j) {
    if (!blocked[j * N + i]) return [i, j];
    for (let r = 1; r < 12; r++) {
      for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue;
        if (!blocked[jj * N + ii]) return [ii, jj];
      }
    }
    return null;
  }
  function walkable(x0, z0, x1, z1) {
    const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
    const n = Math.ceil(len / 0.5);
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      if (isBlocked(x0 + dx * t, z0 + dz * t)) return false;
    }
    return true;
  }
  const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [-1, 1, 1.4142], [1, -1, 1.4142], [-1, -1, 1.4142]];
  function findPath(sx, sz, ex, ez) {
    const s = nearestFree(cellI(sx), cellI(sz)), e = nearestFree(cellI(ex), cellI(ez));
    if (!s || !e) return [];
    const total = N * N;
    const g = new Float32Array(total).fill(1e9), came = new Int32Array(total).fill(-1), closed = new Uint8Array(total);
    const heap = []; // [f, idx]
    const hpush = (f, i) => { heap.push([f, i]); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
    const hpop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { let l = c * 2 + 1, r = l + 1, m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
    const si = s[1] * N + s[0], ei = e[1] * N + e[0];
    const h = (i) => { const dx = Math.abs((i % N) - e[0]), dz = Math.abs(((i / N) | 0) - e[1]); return (dx + dz) + (1.4142 - 2) * Math.min(dx, dz); };
    g[si] = 0; hpush(h(si), si);
    let found = false, guard = 0;
    while (heap.length && guard++ < 6000) {
      const [, cur] = hpop();
      if (closed[cur]) continue;
      closed[cur] = 1;
      if (cur === ei) { found = true; break; }
      const ci = cur % N, cj = (cur / N) | 0;
      for (const [di, dj, cost] of NB) {
        const ni = ci + di, nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue;
        const nIdx = nj * N + ni;
        if (blocked[nIdx] || closed[nIdx]) continue;
        if (di !== 0 && dj !== 0 && (blocked[cj * N + ni] || blocked[nj * N + ci])) continue;
        const ng = g[cur] + cost;
        if (ng < g[nIdx]) { g[nIdx] = ng; came[nIdx] = cur; hpush(ng + h(nIdx), nIdx); }
      }
    }
    if (!found) return [];
    const cells = [];
    for (let c = ei; c !== -1; c = came[c]) cells.push(c);
    cells.reverse();
    const pts = cells.map((c) => ({ x: -HALF + ((c % N) + 0.5) * CELL, z: -HALF + (((c / N) | 0) + 0.5) * CELL }));
    // string-pull smoothing
    const out = [];
    let anchor = { x: sx, z: sz }, k = 0;
    while (k < pts.length) {
      let far = k;
      for (let m = pts.length - 1; m > k; m--) if (walkable(anchor.x, anchor.z, pts[m].x, pts[m].z)) { far = m; break; }
      out.push(pts[far]); anchor = pts[far]; k = far + 1;
    }
    return out;
  }
  function randomFreePoint(x0 = -HALF + 3, x1 = HALF - 3, z0 = -HALF + 3, z1 = HALF - 3) {
    for (let i = 0; i < 60; i++) {
      const x = rnd(x0, x1), z = rnd(z0, z1);
      if (!isBlocked(x, z)) return { x, z };
    }
    return { x: 0, z: 0 };
  }

  /* ---------------- physics helpers ---------------- */
  function groundHeight(x, z, r, feet) {
    let gy = 0;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (x + r > b.x0 && x - r < b.x1 && z + r > b.z0 && z - r < b.z1 && b.y1 <= feet + STEP + 0.001 && b.y1 > gy) gy = b.y1;
    }
    return gy;
  }
  function resolveCircle(p, r, feet, h) {
    let hit = false;
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i];
        if (b.y1 <= feet + STEP || b.y0 >= feet + h) continue;
        const cx = p.x < b.x0 ? b.x0 : p.x > b.x1 ? b.x1 : p.x;
        const cz = p.z < b.z0 ? b.z0 : p.z > b.z1 ? b.z1 : p.z;
        const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        hit = true;
        if (d2 > 1e-8) { const d = Math.sqrt(d2), push = r - d; p.x += (dx / d) * push; p.z += (dz / d) * push; }
        else {
          const l = p.x - b.x0, rr = b.x1 - p.x, t = p.z - b.z0, bt = b.z1 - p.z, m = Math.min(l, rr, t, bt);
          if (m === l) p.x = b.x0 - r; else if (m === rr) p.x = b.x1 + r; else if (m === t) p.z = b.z0 - r; else p.z = b.z1 + r;
        }
      }
    }
    return hit;
  }
  // ray vs world boxes. returns t or -1; fills out normal
  const nrm = { x: 0, y: 0, z: 0 };
  function rayWorld(ox, oy, oz, dx, dy, dz, maxT) {
    let best = maxT, bn = -1, bs = 0;
    const idx = 1e-12;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      let tn = -Infinity, tf = Infinity, axis = -1, sgn = 0, miss = false;
      // x
      if (Math.abs(dx) < idx) { if (ox < b.x0 || ox > b.x1) continue; }
      else { let t1 = (b.x0 - ox) / dx, t2 = (b.x1 - ox) / dx, s = -1; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; } if (t1 > tn) { tn = t1; axis = 0; sgn = s; } if (t2 < tf) tf = t2; }
      if (Math.abs(dy) < idx) { if (oy < b.y0 || oy > b.y1) continue; }
      else { let t1 = (b.y0 - oy) / dy, t2 = (b.y1 - oy) / dy, s = -1; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; } if (t1 > tn) { tn = t1; axis = 1; sgn = s; } if (t2 < tf) tf = t2; }
      if (Math.abs(dz) < idx) { if (oz < b.z0 || oz > b.z1) continue; }
      else { let t1 = (b.z0 - oz) / dz, t2 = (b.z1 - oz) / dz, s = -1; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; } if (t1 > tn) { tn = t1; axis = 2; sgn = s; } if (t2 < tf) tf = t2; }
      if (miss || tn > tf || tf < 0 || tn < 0) continue;
      if (tn < best) { best = tn; bn = axis; bs = sgn; }
    }
    // ground plane
    if (dy < -1e-9) { const t = -oy / dy; if (t > 0 && t < best) { best = t; bn = 1; bs = 1; } }
    if (bn < 0) return -1;
    nrm.x = bn === 0 ? bs : 0; nrm.y = bn === 1 ? bs : 0; nrm.z = bn === 2 ? bs : 0;
    return best;
  }
  function hasLOS(ax, ay, az, bx, by, bz) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, len = Math.hypot(dx, dy, dz);
    if (len < 0.01) return true;
    return rayWorld(ax, ay, az, dx / len, dy / len, dz / len, len - 0.05) < 0;
  }

  /* ---------------- spawns ---------------- */
  const spawns = [
    [{ x: -42, z: 42 }, { x: -36, z: 44 }, { x: -44, z: 36 }, { x: -30, z: 40 }, { x: -40, z: 28 }, { x: -24, z: 44 }],
    [{ x: 42, z: -42 }, { x: 36, z: -44 }, { x: 44, z: -36 }, { x: 30, z: -40 }, { x: 40, z: -28 }, { x: 24, z: -44 }],
  ];
  for (const team of spawns) for (const s of team) {
    const f = nearestFree(cellI(s.x), cellI(s.z));
    if (f) { s.x = -HALF + (f[0] + 0.5) * CELL; s.z = -HALF + (f[1] + 0.5) * CELL; }
  }
  // points of interest bots like to visit
  const pois = [
    { x: 0, z: 0 }, { x: -12, z: 0 }, { x: 12, z: 0 }, { x: 0, z: -12 }, { x: 0, z: 12 }, { x: -31, z: -14 }, { x: 31, z: 14 },
    { x: -22, z: -22 }, { x: 22, z: 22 }, { x: -22, z: 22 }, { x: 22, z: -22 }, { x: 30, z: -24 }, { x: -30, z: 24 },
    { x: -9, z: -28 }, { x: 9, z: 28 }, { x: -34, z: 0 }, { x: 34, z: 0 }, { x: 0, z: -34 }, { x: 0, z: 34 },
    { x: -14, z: 18 }, { x: 14, z: -18 }, { x: -44, z: -10 }, { x: 44, z: 10 },
  ].map((p) => { const f = nearestFree(cellI(p.x), cellI(p.z)); return f ? { x: -HALF + (f[0] + 0.5) * CELL, z: -HALF + (f[1] + 0.5) * CELL } : p; });

  const sunLight = { dir: sunDir };
  return {
    boxes, spawns, pois, sunLight, mats, skyT,
    groundHeight, resolveCircle, rayWorld, hasLOS, rayNormal: nrm,
    findPath, randomFreePoint, isBlocked, walkable,
  };
}
