import * as THREE from 'three';
import { A } from './assets.js';

/* Weapon stats. Angles in degrees, rates in rounds per minute. */
export const WEAPONS = {
  ar: {
    id: 'ar', name: 'M4A1 CARBINE', type: 'ASSAULT RIFLE', auto: true, rpm: 760, dmg: 27, head: 2.0,
    mag: 30, reserve: 150, reload: 2.2, range: 160, fStart: 35, fEnd: 100, fMin: 0.6,
    spread: 1.0, adsSpread: 0.12, moveSpread: 1.1, jumpSpread: 3.0,
    recoilP: 0.62, recoilY: 0.28, kick: 0.035, adsFov: 52, adsSpeed: 0.78, adsTime: 0.13, pellets: 1, sound: 'ar', flash: 1.0, moveSpeed: 1.0,
  },
  smg: {
    id: 'smg', name: 'MP9 VECTOR', type: 'SUBMACHINE GUN', auto: true, rpm: 980, dmg: 20, head: 1.8,
    mag: 40, reserve: 200, reload: 1.8, range: 110, fStart: 18, fEnd: 60, fMin: 0.5,
    spread: 1.4, adsSpread: 0.25, moveSpread: 0.6, jumpSpread: 2.4,
    recoilP: 0.42, recoilY: 0.3, kick: 0.025, adsFov: 58, adsSpeed: 0.9, adsTime: 0.1, pellets: 1, sound: 'smg', flash: 0.8, moveSpeed: 1.08,
  },
  shotgun: {
    id: 'shotgun', name: 'S12 BREACHER', type: 'SHOTGUN', auto: false, rpm: 75, dmg: 13, head: 1.5,
    mag: 8, reserve: 40, reload: 0.55, shell: true, range: 40, fStart: 7, fEnd: 24, fMin: 0.15,
    spread: 3.6, adsSpread: 2.6, moveSpread: 1.0, jumpSpread: 2.5,
    recoilP: 3.6, recoilY: 0.6, kick: 0.1, adsFov: 62, adsSpeed: 0.9, adsTime: 0.14, pellets: 9, sound: 'shotgun', flash: 1.7, moveSpeed: 1.0,
  },
  sniper: {
    id: 'sniper', name: 'KAR-98 MARKSMAN', type: 'BOLT-ACTION RIFLE', auto: false, rpm: 48, dmg: 105, head: 2.0,
    mag: 5, reserve: 25, reload: 3.2, range: 400, fStart: 200, fEnd: 400, fMin: 0.9,
    spread: 6.0, adsSpread: 0.0, moveSpread: 5, jumpSpread: 8,
    recoilP: 4.2, recoilY: 0.5, kick: 0.12, adsFov: 13, adsSpeed: 0.55, adsTime: 0.24, pellets: 1, sound: 'sniper', flash: 2.0, scope: true, moveSpeed: 0.92,
  },
  pistol: {
    id: 'pistol', name: 'M1911 SERVICE', type: 'PISTOL', auto: false, rpm: 380, dmg: 36, head: 2.2,
    mag: 12, reserve: 72, reload: 1.5, range: 90, fStart: 22, fEnd: 60, fMin: 0.55,
    spread: 1.0, adsSpread: 0.1, moveSpread: 1.2, jumpSpread: 2.6,
    recoilP: 1.5, recoilY: 0.35, kick: 0.05, adsFov: 62, adsSpeed: 0.95, adsTime: 0.09, pellets: 1, sound: 'pistol', flash: 0.9, moveSpeed: 1.1,
  },
};
export const WEAPON_ORDER = ['ar', 'smg', 'shotgun', 'sniper', 'pistol'];

/* ---- viewmodel construction ---- */
let M = null;
function mats() {
  if (M) return M;
  M = {
    metal: new THREE.MeshStandardMaterial({ color: 0x2a2e34, metalness: 0.85, roughness: 0.35 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x121417, metalness: 0.3, roughness: 0.65 }),
    poly: new THREE.MeshStandardMaterial({ color: 0x1d2024, metalness: 0.15, roughness: 0.7 }),
    tan: new THREE.MeshStandardMaterial({ color: 0x8b7551, metalness: 0.1, roughness: 0.7 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x8c9199, metalness: 0.9, roughness: 0.3 }),
    glove: new THREE.MeshStandardMaterial({ color: 0x17191c, metalness: 0.0, roughness: 0.85 }),
    sleeve: new THREE.MeshStandardMaterial({ color: 0x3a4630, metalness: 0.0, roughness: 0.95 }),
    dot: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff2a1a, emissiveIntensity: 3 }),
    lens: new THREE.MeshStandardMaterial({ color: 0x223a4a, metalness: 1, roughness: 0.05, emissive: 0x0a1a24 }),
  };
  return M;
}

// part spec: [kind, a, b, c, x, y, z, mat, opts]; kind 'b' box(w,h,d) or 'c' cylinder along z (r,len)
const DEFS = {
  ar: {
    parts: [], model: { name: 'm4a1', ry: Math.PI, off: [0, -0.02, 0.0], s: 1.0 },
    muzzle: [0, 0.03, -0.66], handL: [0.005, -0.04, -0.3], handR: [0, -0.1, 0.03],
    hip: [0.2, -0.2, -0.38], ads: [0, -0.15, -0.24],
  },
  smg: {
    parts: [], model: { name: 'smg', auto: 0.56, flip: false, off: [0, -0.02, -0.12] },
    muzzle: [0, 0.02, -0.42], handL: [0, -0.07, -0.26], handR: [0, -0.1, 0.02],
    hip: [0.2, -0.2, -0.36], ads: [0, -0.1, -0.24],
  },
  shotgun: {
    parts: [], model: { name: 'shotgun', auto: 0.98, flip: false, off: [0, -0.02, -0.3] },
    muzzle: [0, 0.03, -0.8], handL: [0, -0.06, -0.48], handR: [0, -0.105, 0.02],
    hip: [0.2, -0.21, -0.38], ads: [0, -0.085, -0.25],
  },
  sniper: {
    parts: [], model: { name: 'rifle', ry: Math.PI / 2, off: [0, 0.0, -0.294], s: 1.0 },
    muzzle: [0, 0.02, -0.9], handL: [0.0, -0.045, -0.46], handR: [0, -0.1, 0.02],
    hip: [0.2, -0.2, -0.42], ads: [0, -0.115, -0.3],
  },
  pistol: {
    parts: [], model: { name: 'pistol', ry: Math.PI / 2, off: [0, -0.02, 0.02], s: 1.2 },
    muzzle: [0, 0.03, -0.17], handL: [0.0, -0.075, 0.05], handR: [0, -0.07, 0.05],
    hip: [0.15, -0.13, -0.3], ads: [0, -0.075, -0.22],
  },
};

const VM_SCALE = 0.78;
export function buildGunMesh(id, withHands = true) {
  const m = mats(), def = DEFS[id];
  const root = new THREE.Group();
  const gun = new THREE.Group();
  if (withHands) gun.scale.setScalar(VM_SCALE);
  root.add(gun);
  const named = {};
  for (const p of def.parts) {
    let mesh, o;
    if (p[0] === 'b') {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(p[1], p[2], p[3]), m[p[7]]);
      mesh.position.set(p[4], p[5], p[6]); o = p[8];
    } else {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(p[1], p[1], p[2], 12), m[p[6]]);
      mesh.rotation.x = Math.PI / 2; mesh.position.set(p[3], p[4], p[5]); o = p[7];
    }
    if (o) { if (o.rx) mesh.rotation.x += o.rx; if (o.name) { mesh.name = o.name; named[o.name] = mesh; mesh.userData.home = mesh.position.clone(); } }
    gun.add(mesh);
  }
  if (def.model) {
    const mo = A.models[def.model.name].scene.clone(true);
    const holder = new THREE.Group(); holder.add(mo);
    if (def.model.auto) { // FBX of unknown size/orientation: longest axis becomes the barrel
      const sz = A.models[def.model.name].size, len = Math.max(sz.x, sz.y, sz.z);
      mo.scale.setScalar(def.model.auto / len);
      mo.rotation.y = sz.x >= sz.z ? (def.model.flip ? -Math.PI / 2 : Math.PI / 2) : (def.model.flip ? 0 : Math.PI);
      mo.position.set(...def.model.off);
    } else { mo.rotation.y = def.model.ry; mo.position.set(...def.model.off); mo.scale.setScalar(def.model.s); }
    mo.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.frustumCulled = false; } });
    gun.add(holder); named.model = holder;
  }
  const muzzle = new THREE.Object3D(); muzzle.position.set(...def.muzzle); gun.add(muzzle);
  if (withHands) {
    const mk = (pos, flip) => {
      const g = new THREE.Group();
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.07, 0.1), m.glove); g.add(hand);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.3), m.sleeve);
      arm.position.set(flip * 0.05, -0.075, 0.2); arm.rotation.set(0.28, flip * -0.2, 0); g.add(arm);
      const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.05), m.dark); cuff.position.set(flip * 0.012, -0.03, 0.07); cuff.rotation.set(0.28, flip * -0.2, 0); g.add(cuff);
      g.position.set(...pos); gun.add(g);
      return g;
    };
    mk(def.handL, -1);
    mk(def.handR, 1);
  }
  return { root, gun, muzzle, named, def };
}

export function getHip(id) { const h = DEFS[id].hip; return [h[0] * 0.9, h[1] + 0.005, h[2] - 0.1]; }
export function getAds(id) { const a = DEFS[id].ads; return [a[0], a[1] * VM_SCALE, a[2] - 0.02]; }
