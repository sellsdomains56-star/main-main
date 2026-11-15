import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

/* Loads real 3D models + PBR textures. In the single-file build the files are embedded as base64
   in window.__ASSETS; otherwise they are fetched from /assets. */
export const A = { models: {}, tex: {}, landmarks: null };

const MODELS = ['soldier', 'rifle', 'pistol', 'grenade', 'crate', 'barrel', 'barrier'];
const TEXS = ['large_sandstone_blocks_01', 'white_sandstone_bricks_03', 'beige_wall_002', 'asphalt_05', 'rectangular_paving', 'marble_tiles', 'dense_sand', 'plastered_wall_04', 'concrete_wall_007'];

async function bytes(path) {
  const emb = window.__ASSETS && window.__ASSETS[path];
  if (emb) {
    const bin = atob(emb), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }
  const r = await fetch('assets/' + path);
  if (!r.ok) throw new Error('missing asset ' + path);
  return r.arrayBuffer();
}

async function tex(path, srgb) {
  const buf = await bytes(path);
  const bmp = await createImageBitmap(new Blob([buf], { type: 'image/jpeg' }), { imageOrientation: 'flipY' });
  const t = new THREE.Texture(bmp);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8; t.needsUpdate = true;
  return t;
}

export async function loadAssets(progress) {
  const total = MODELS.length + TEXS.length * 2 + 3;
  let done = 0;
  const tick = () => progress && progress(++done / total);
  const loader = new GLTFLoader();
  await Promise.all([
    ...MODELS.map(async (m) => {
      const buf = await bytes(`models/${m}.glb`);
      A.models[m] = await loader.parseAsync(buf, '');
      tick();
    }),
    ...TEXS.flatMap((t) => [
      tex(`tex/${t}_d.jpg`, true).then((x) => { (A.tex[t] ||= {}).map = x; tick(); }),
      tex(`tex/${t}_n.jpg`, false).then((x) => { (A.tex[t] ||= {}).normal = x; tick(); }),
    ]),
    (async () => {
      const [buf, map] = await Promise.all([bytes('models/m4a1.fbx'), tex('tex/m4a1_d.jpg', true)]);
      const mgr = new THREE.LoadingManager(); mgr.setURLModifier(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
      const g = new FBXLoader(mgr).parse(buf, '');
      const mat = new THREE.MeshStandardMaterial({ map, roughness: 0.5, metalness: 0.55, envMapIntensity: 1.0 });
      g.traverse((o) => { if (o.isMesh) o.material = mat; });
      A.models.m4a1 = { scene: g, animations: [] }; tick(); tick();
    })(),
    bytes('osm/landmarks.json').then((b) => { A.landmarks = JSON.parse(new TextDecoder().decode(b)); tick(); }),
  ]);
  // Poly Haven files ship LOD copies, spare parts and loose ammo: keep only the real thing.
  const prune = (name, re) => { const rm = []; A.models[name].scene.traverse((o) => { if (re.test(o.name)) rm.push(o); }); rm.forEach((o) => o.parent && o.parent.remove(o)); };
  prune('pistol', /_b$|magazine_empty|bullet/); A.models.pistol.scene.traverse((o) => { if (/magazine_loaded/.test(o.name)) o.position.set(0, 0, 0); }); prune('rifle', /bullet/); prune('crate', /_b$|cloth/);
}
