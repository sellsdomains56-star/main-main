// Adapted screenshot tool. node shot2.mjs <url> <out.png> [--w 1080] [--h 1500] [--wait 4000] [--dpr 2] [--full]
//   [--sel "css"]  clip to the bounding box of the first match (plus --pad N css px)
//   [--hide "css1,css2"]  display:none these (overlays, cookie bars, ads)
//   [--css "raw css"]   inject extra CSS
//   [--js "code"]  evaluate in page after load (e.g. remove elements, scroll)
//   [--clip x,y,w,h]  clip rectangle in CSS px (page coordinates)
//   [--html out.html]  also dump rendered HTML text for verification
//   [--text out.txt] also dump visible text
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');
const [url, out, ...rest] = process.argv.slice(2);
const opt = k => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : null; };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:38175' }, args: ['--no-sandbox', '--disable-gpu', '--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ viewport: { width: +(opt('w') || 1080), height: +(opt('h') || 1500) }, deviceScaleFactor: +(opt('dpr') || 2), userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'en-US', timezoneId: opt('tz') || 'UTC' });
const page = await ctx.newPage();
try {
  const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 50000 }); console.log('status', r && r.status(), 'final', page.url());
  await page.waitForTimeout(+(opt('wait') || 4000));
  for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Accept all")', 'button:has-text("Accept")', 'button:has-text("I agree")', 'button:has-text("Agree")', 'button:has-text("Got it")', 'button:has-text("No thanks")', '[aria-label="Close"]', 'button:has-text("Close")']) { try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 300 })) { await b.click({ timeout: 800 }); await page.waitForTimeout(300); } } catch (e) {} }
  if (opt('hide')) await page.addStyleTag({ content: opt('hide').split('|').map(s => s + '{display:none !important}').join('\n') });
  if (opt('css')) await page.addStyleTag({ content: opt('css') });
  if (opt('js')) { try { await page.evaluate(opt('js')); } catch (e) { console.log('js err', e.message.split('\n')[0]); } }
  await page.waitForTimeout(+(opt('after') || 1000));
  console.log('title:', await page.title());
  if (opt('text')) fs.writeFileSync(opt('text'), await page.evaluate(() => document.body.innerText));
  if (opt('html')) fs.writeFileSync(opt('html'), await page.content());
  const o = { path: out, fullPage: rest.includes('--full') };
  if (opt('sel')) {
    const loc = page.locator(opt('sel')).first();
    await loc.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    const bb = await loc.boundingBox();
    if (!bb) throw new Error('selector has no box');
    const pad = +(opt('pad') || 0);
    const sy = await page.evaluate(() => window.scrollY), sx = await page.evaluate(() => window.scrollX);
    o.clip = { x: Math.max(0, bb.x + sx - pad), y: Math.max(0, bb.y + sy - pad), width: bb.width + 2 * pad, height: bb.height + 2 * pad };
    o.fullPage = true;
    console.log('clip', JSON.stringify(o.clip));
  } else if (opt('clip')) {
    const [x, y, w, h] = opt('clip').split(',').map(Number); o.clip = { x, y, width: w, height: h }; o.fullPage = true;
  }
  // --find "str1||str2": measure text bounding boxes (page CSS px) -> write file-pixel boxes relative to clip origin into --bbox json
  if (opt('find')) {
    const dpr = +(opt('dpr') || 2);
    const res = await page.evaluate((strs) => {
      const norm = t => t.replace(/[\s\u00a0]+/g, ' ');
      const out = {};
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => { const p = n.parentElement; if (!p) return NodeFilter.FILTER_REJECT; const tag = p.tagName; if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(tag)) return NodeFilter.FILTER_REJECT; const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden') return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; } });
      const chars = []; let n; let prevSpace = true;
      while ((n = walker.nextNode())) { const t = n.nodeValue; for (let i = 0; i < t.length; i++) { const c = t[i]; const sp = /[\s\u00a0]/.test(c); if (sp) { if (prevSpace) continue; chars.push({ c: ' ', n, i }); prevSpace = true; } else { chars.push({ c, n, i }); prevSpace = false; } } }
      const hay = chars.map(x => x.c).join('');
      for (const s of strs) {
        const needle = norm(s).trim(); const idx = hay.indexOf(needle);
        if (idx < 0) { out[s] = null; continue; }
        const a = chars[idx], b = chars[idx + needle.length - 1];
        const r = document.createRange(); r.setStart(a.n, a.i); r.setEnd(b.n, b.i + 1);
        const rects = [...r.getClientRects()].map(q => ({ x: q.x + scrollX, y: q.y + scrollY, w: q.width, h: q.height }));
        const x1 = Math.min(...rects.map(q => q.x)), y1 = Math.min(...rects.map(q => q.y)), x2 = Math.max(...rects.map(q => q.x + q.w)), y2 = Math.max(...rects.map(q => q.y + q.h));
        out[s] = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
      }
      return out;
    }, opt('find').split('||'));
    const ox = o.clip ? o.clip.x : 0, oy = o.clip ? o.clip.y : 0;
    const conv = {};
    for (const [k, v] of Object.entries(res)) conv[k] = v ? [Math.round((v.x - ox) * dpr), Math.round((v.y - oy) * dpr), Math.round(v.w * dpr), Math.round(v.h * dpr)] : null;
    console.log('bbox', JSON.stringify(conv));
    if (opt('bbox')) fs.writeFileSync(opt('bbox'), JSON.stringify(conv, null, 1));
  }
  await page.screenshot(o);
} catch (e) { console.log('ERR', String(e.message).split('\n')[0]); }
await browser.close();
