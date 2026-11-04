// Lists every satellite tile the map scenes need (same camera maths as satmap.js) and downloads them from Esri World Imagery
// into build/tiles/{z}/{x}/{y}.jpg.   node fetch_tiles.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import { execFileSync, spawnSync } from 'node:child_process';
const src = fs.readFileSync(new URL('./satmap.js', import.meta.url), 'utf8').split('// ---- browser side')[0];
const ctx = { Math, console }; vm.createContext(ctx); vm.runInContext(src, ctx);
const get = n => vm.runInContext(n, ctx), SAT_SCENES = JSON.parse(fs.readFileSync('sat_scenes.json', 'utf8')), satTiles = get('satTiles'), satCam = get('satCam');
const need = new Set();
for (const sc of Object.values(SAT_SCENES)) for (let t = sc.a - 0.1; t <= sc.b + 0.6; t += 1 / 30) for (const tile of satTiles(satCam(sc, t))) need.add(`${tile.z}/${tile.x}/${tile.y}`);
const list = [...need].filter(k => !fs.existsSync(`build/tiles/${k}.jpg`));
console.log(`${need.size} tiles needed, ${list.length} to download`);
fs.writeFileSync('build/tiles_todo.txt', list.join('\n'));
if (list.length) {
  const r = spawnSync('bash', ['-c', `cat build/tiles_todo.txt | xargs -P 16 -I{} sh -c 'mkdir -p build/tiles/$(dirname {}); curl -sS -f -m 40 --retry 2 -o build/tiles/{}.jpg "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/$(echo {} | awk -F/ "{print \\$1\\"/\\"\\$3\\"/\\"\\$2}")" || rm -f build/tiles/{}.jpg'`], { stdio: 'inherit' });
}
// tiles over open sea can be blank (no imagery at that zoom): fetch their parents so the renderer can fall back to a softer tile
const blank = JSON.parse(execFileSync('python3', ['-I', '-c', `
import sys, json
from PIL import Image, ImageStat
out = []
for k in sys.argv[1:]:
    try:
        im = Image.open(f'build/tiles/{k}.jpg').convert('L').resize((16, 16))
        st = ImageStat.Stat(im)
        if st.mean[0] < 45 and st.stddev[0] < 6: out.append(k)        # solid dark tile = no imagery at this zoom
    except Exception: out.append(k)
print(json.dumps(out))`, ...need]).toString());
const anc = new Set();
for (const k of blank) { let [z, x, y] = k.split('/').map(Number); for (let i = 0; i < 5 && z > 6; i++) { z--; x >>= 1; y >>= 1; const a = `${z}/${x}/${y}`; if (!fs.existsSync(`build/tiles/${a}.jpg`)) anc.add(a); } }
console.log(`${blank.length} blank tiles, ${anc.size} ancestors to fetch`);
if (anc.size) {
  fs.writeFileSync('build/tiles_todo2.txt', [...anc].join('\n'));
  spawnSync('bash', ['-c', `cat build/tiles_todo2.txt | xargs -P 16 -I{} sh -c 'mkdir -p build/tiles/$(dirname {}); curl -sS -f -m 40 --retry 2 -o build/tiles/{}.jpg "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/$(echo {} | awk -F/ "{print \\$1\\"/\\"\\$3\\"/\\"\\$2}")" || rm -f build/tiles/{}.jpg'`], { stdio: 'inherit' });
}
const missing = [...need].filter(k => !fs.existsSync(`build/tiles/${k}.jpg`));
console.log(missing.length ? `MISSING ${missing.length}: ${missing.slice(0, 5).join(' ')}` : 'all tiles present');
