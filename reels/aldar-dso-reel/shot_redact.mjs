// node shot_redact.mjs <url> <out.png> <w> <dpr> "name1" "name2" ...  -> full-page screenshot with a dark bar over every occurrence of the names (all text nodes)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let chromium;
for (const m of [process.env.PLAYWRIGHT_PATH, '/opt/node22/lib/node_modules/playwright', 'playwright'].filter(Boolean)) { try { ({ chromium } = require(m)); break; } catch (e) {} }
const CHROME = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const [url, out, w, dpr, ...names] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: CHROME, proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:38175' }, args: ['--no-sandbox', '--disable-gpu', '--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: 1700 }, deviceScaleFactor: +dpr, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'en-US' });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); await page.waitForTimeout(5000);
for (const sel of ['button:has-text("Accept")', 'button:has-text("I agree")', 'button:has-text("Got it")', '#onetrust-accept-btn-handler']) { try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 300 })) { await b.click({ timeout: 800 }); } } catch (e) {} }
await page.waitForTimeout(800);
const n = await page.evaluate((names) => {
  let count = 0; const bars = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const nodes = []; let nd; while ((nd = walker.nextNode())) nodes.push(nd);
  for (const node of nodes) for (const nm of names) { let i = -1; while ((i = node.nodeValue.indexOf(nm, i + 1)) >= 0) { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + nm.length); for (const q of r.getClientRects()) if (q.width > 1) bars.push([q.left + scrollX, q.top + scrollY, q.width, q.height]); count++; } }
  for (const [x, y, w, h] of bars) { const d = document.createElement('div'); d.style.cssText = `position:absolute;left:${x - 2}px;top:${y}px;width:${w + 4}px;height:${h}px;background:#121216;border-radius:3px;z-index:99999`; document.body.appendChild(d); }
  return count;
}, names);
console.log('covered', n);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
