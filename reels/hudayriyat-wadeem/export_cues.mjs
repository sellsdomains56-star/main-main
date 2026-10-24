// Evaluates scenes.js against timeline.json and writes cues.json (sound cues) and sat_scenes.json (camera paths for the map scenes).
import fs from 'node:fs';
import vm from 'node:vm';
const ctx = { Math, console, JSON }; vm.createContext(ctx);
for (const f of ['lib.js', 'captions.js', 'satmap.js', 'scenes_lib.js', 'mapfx.js', 'scenes.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
vm.runInContext("TL = " + fs.readFileSync('timeline.json', 'utf8') + "; DUR = TL.dur;", ctx);
if (fs.existsSync('geo_extra.json')) vm.runInContext("GEO.roads = " + fs.readFileSync('roads.json', 'utf8') + "; GEO.x = " + fs.readFileSync('geo_extra.json', 'utf8') + ";", ctx);
const cfg = vm.runInContext('(() => { const c = buildScenes(); return { cues: c.cues, sat: SAT_SCENES }; })()', ctx);
fs.writeFileSync('cues.json', JSON.stringify(cfg.cues.sort((a, b) => a.t - b.t), null, 0)); fs.writeFileSync('sat_scenes.json', JSON.stringify(cfg.sat));
console.log(cfg.cues.length, 'cues,', Object.keys(cfg.sat).length, 'map scenes');
