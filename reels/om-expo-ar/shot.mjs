// Screenshot a web page (real article / post) through the session proxy.   node shot.mjs <url> <out.png> [--w 1080] [--h 1700] [--wait 4000] [--full]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let chromium;                                                      // playwright: PLAYWRIGHT_PATH, the usual global location, or a local install
for (const m of [process.env.PLAYWRIGHT_PATH, '/opt/node22/lib/node_modules/playwright', 'playwright'].filter(Boolean)) { try { ({ chromium } = require(m)); break; } catch (e) { /* try the next */ } }
if (!chromium) throw new Error('playwright not found: npm i -g playwright && npx playwright install chromium (or set PLAYWRIGHT_PATH)');
const CHROME = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);   // undefined = playwright's own download
const [url, out, ...rest] = process.argv.slice(2);
const opt = k => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : null; };
const browser = await chromium.launch({ executablePath: CHROME, proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:38175' }, args: ['--no-sandbox', '--disable-gpu', '--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ viewport: { width: +(opt('w') || 1080), height: +(opt('h') || 1700) }, deviceScaleFactor: +(opt('dpr') || 2), userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'en-US' });
const page = await ctx.newPage();
try {
  const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); console.log('status', r && r.status());
  await page.waitForTimeout(+(opt('wait') || 4000));
  for (const sel of ['button:has-text("Accept")', 'button:has-text("I agree")', 'button:has-text("Agree")', 'button:has-text("Got it")', 'button:has-text("Close")', '[aria-label="Close"]', '#onetrust-accept-btn-handler']) { try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 300 })) { await b.click({ timeout: 800 }); await page.waitForTimeout(300); } } catch (e) {} }
  await page.waitForTimeout(800);
  console.log('title:', await page.title());
  await page.screenshot({ path: out, fullPage: rest.includes('--full') });
} catch (e) { console.log('ERR', String(e.message).split('\n')[0]); }
await browser.close();
