// SVG / PNG logos -> trimmed PNGs on a transparent background (Chromium renders the SVG exactly as a browser would).
//   node data/raster_logos.mjs <out_dir> <file> [<file> ...]        each output: <out_dir>/<basename>.png, about 900 px on the long side
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const [out, ...files] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
for (const f of files) {
  const ext = path.extname(f).toLowerCase(), mime = ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : 'image/jpeg';
  const src = `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;
  await p.setContent(`<html><body style="margin:0;background:transparent"><img id="i" src="${src}" style="max-width:900px;max-height:900px;width:900px;height:auto;object-fit:contain"></body></html>`);
  await p.waitForFunction(() => document.getElementById('i').complete);
  const box = await p.$eval('#i', el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: Math.ceil(r.width), height: Math.ceil(r.height) }; });
  const o = path.join(out, path.basename(f).replace(/\.[^.]+$/, '') + '.png');
  await p.screenshot({ path: o, clip: box, omitBackground: true }); console.log(o, box.width + 'x' + box.height);
}
await b.close();
