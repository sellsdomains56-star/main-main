// Frame renderer: drives headless Chromium through window.draw(t) and saves PNGs.
//   node render.mjs --out frames --workers 4 [--ss 1] [--from 0 --to 1401]
//   node render.mjs --out stills --stills 0.5,3.2,9.4 [--ss 1]
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, DUR = 46.72, N = Math.round(DUR * FPS);
const ss = +(args.ss || 1), workers = +(args.workers || 4), outDir = path.resolve(args.out || 'frames');
fs.mkdirSync(outDir, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.txt': 'text/plain', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const p = path.join(here, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!p.startsWith(here) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/index.html?ss=${ss}`;

let jobs;
if (args.stills) jobs = String(args.stills).split(',').map(s => ({ t: +s, name: `still_${(+s).toFixed(2).padStart(5, '0')}.png` }));
else { const a = +(args.from ?? 0), b = +(args.to ?? N - 1); jobs = []; for (let f = a; f <= b; f++) jobs.push({ t: f / FPS, name: `f_${String(f).padStart(5, '0')}.png` }); }

async function worker(id, list) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: ss });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()); });
  await page.goto(base); await page.waitForFunction('window.READY === true', null, { timeout: 30000 });
  let done = 0;
  for (const j of list) {
    await page.evaluate(async t => { await window.prepare(t); window.draw(t); }, j.t);
    await page.screenshot({ path: path.join(outDir, j.name), type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    if (++done % 50 === 0) console.log(`worker ${id}: ${done}/${list.length}`);
  }
  await browser.close();
}
const lists = Array.from({ length: Math.min(workers, jobs.length) }, () => []);
jobs.forEach((j, i) => lists[i % lists.length].push(j));
const t0 = Date.now();
await Promise.all(lists.map((l, i) => worker(i, l)));
server.close();
console.log(`rendered ${jobs.length} frame(s) in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${outDir}`);
