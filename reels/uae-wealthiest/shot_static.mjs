// Capture a SAVED copy of a page (its own scripts off) for a PAGE beat, when the live page blanks itself in a headless browser.
//   node shot_static.mjs <file.html> <out.png> --url <real url> --find "phrase" [--find ...] [--w 430] [--dpr 2.5] [--pad 200]
// The saved file carries <base href="real url">, so its own stylesheets and images load.  Writes <out.png> (page top -> last phrase + pad) and
// <out>.json in shot_hl.mjs's format: { url, title, w, h, boxes: [{ phrase, bbox: [[x, y, w, h], ...] (image px, one per line) }] }.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let chromium;
for (const m of [process.env.PLAYWRIGHT_PATH, '/opt/node22/lib/node_modules/playwright', 'playwright'].filter(Boolean)) { try { ({ chromium } = require(m)); break; } catch (e) { /* next */ } }
const [file, out, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : d; };
const finds = rest.flatMap((a, i) => (a === '--find' ? [rest[i + 1]] : []));
const VW = +opt('w', 430), DPR = +opt('dpr', 2.5), PAD = +opt('pad', 200);
const b = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined, proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined, args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: VW, height: 1400 }, deviceScaleFactor: DPR, javaScriptEnabled: false });
const page = await ctx.newPage();
await page.goto('file://' + fs.realpathSync(file), { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(2500);
const res = await page.evaluate((finds) => {
  const map = [], walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, s = '';
  while ((n = walk.nextNode())) { const el = n.parentElement; if (!el || !el.offsetParent || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) continue; for (let i = 0; i < n.nodeValue.length; i++) if (!/\s/.test(n.nodeValue[i])) { s += n.nodeValue[i]; map.push([n, i]); } }
  return finds.map(ph => { const q = ph.replace(/\s+/g, ''), k = s.indexOf(q); if (k < 0) return { phrase: ph, bbox: [] };
    const r = document.createRange(), [a, ai] = map[k], [z, zi] = map[k + q.length - 1]; r.setStart(a, ai); r.setEnd(z, zi + 1);
    const L = []; for (const c of r.getClientRects()) { if (c.width < 1) continue; const y = c.top + scrollY, l = L.find(o => Math.abs(o.y - y) < 6); if (l) { l.x0 = Math.min(l.x0, c.left); l.x1 = Math.max(l.x1, c.right); l.h = Math.max(l.h, c.height); } else L.push({ x0: c.left, x1: c.right, y, h: c.height }); }
    return { phrase: ph, bbox: L.sort((p, q2) => p.y - q2.y).map(o => [o.x0, o.y, o.x1 - o.x0, o.h]) }; });
}, finds);
const bottom = Math.max(...res.flatMap(r => r.bbox.map(q => q[1] + q[3])), 600) + PAD, H = Math.min(bottom, await page.evaluate(() => document.body.scrollHeight));
await page.screenshot({ path: out, fullPage: true, clip: { x: 0, y: 0, width: VW, height: H } });
const sc = v => Math.round(v * DPR);
for (const r of res) { r.bbox = r.bbox.map(q => q.map(sc)); console.log(r.bbox.length ? 'found  ' : 'MISSING', r.phrase, JSON.stringify(r.bbox)); }
fs.writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify({ url: opt('url', file), title: await page.title(), w: sc(VW), h: sc(H), boxes: res }, null, 1));
await b.close();
