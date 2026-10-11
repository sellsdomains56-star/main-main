// Render an SVG to a transparent PNG of a given width using Chromium.  node render_svg.mjs in.svg out.png [width=1200]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');
const [inp, out, w = '1200'] = process.argv.slice(2);
const svg = fs.readFileSync(inp);
const b64 = svg.toString('base64');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: +w, height: 400 }, deviceScaleFactor: 1 });
await page.setContent(`<html><body style="margin:0;background:transparent"><img id="i" style="display:block;width:${w}px;height:auto" src="data:image/svg+xml;base64,${b64}"></body></html>`);
await page.waitForFunction(() => document.getElementById('i').complete && document.getElementById('i').naturalWidth > 0);
const el = await page.$('#i');
const box = await el.boundingBox();
console.log('box', box);
await page.setViewportSize({ width: +w, height: Math.ceil(box.height) + 2 });
await el.screenshot({ path: out, omitBackground: true });
await browser.close();
