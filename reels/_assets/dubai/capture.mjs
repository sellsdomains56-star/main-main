// Clean capture of a REAL live page (no editing of content; only overlays/ads/cookie bars are hidden).
// node capture.mjs <url> <out.png> [--w 1200] [--h 1600] [--wait 5000] [--dpr 2]
//   [--hide "css,sel"]       extra selectors to hide (display:none)
//   [--invis "css,sel"]     selectors to make invisible but keep layout (visibility:hidden)
//   [--top "sel"]            clip starts at the top of this element (page coords)   (default: page top)
//   [--bottom-mode top]      use the TOP edge of --bottom element (then --pad-bottom adds css px below it)
//   [--bottom "sel"]         clip ends at the bottom of this element                (default: top + --h)
//   [--pad-top N --pad-bottom N]  css px padding around the clip
//   [--x N --cw N]           horizontal clip (css px) (default: full width)
//   [--key "sel"]            element(s) whose text lines are reported as key_text_bbox (file px)
//   [--probe]                just print diagnostics (fixed elements, h1 rect, text) and exit
//   [--text "sel"]           print innerText of the first match
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');
const [url, out, ...rest] = process.argv.slice(2);
const opt = k => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : null; };
const has = k => rest.includes('--' + k);
const W = +(opt('w') || 1200), H = +(opt('h') || 1600), VH = +(opt('vh') || 3400), DPR = +(opt('dpr') || 2);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:38175' }, args: ['--no-sandbox', '--disable-gpu', '--disable-blink-features=AutomationControlled'] });
const ctx = await browser.newContext({ viewport: { width: W, height: VH }, deviceScaleFactor: DPR, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'en-US' });
const page = await ctx.newPage();
const AD = /doubleclick|googlesyndication|googletagservices|adservice|pub\.network|freestar|criteo|pubmatic|rubiconproject|openx\.net|smartadserver|onetag|taboola|outbrain|amazon-adsystem|adnxs|casalemedia|ads-twitter|facebook\.net|hotjar|optable|rlcdn|sparteo|browsiprod|bricks-co|btloader|ad-delivery|dns-finder|cdn-vitals|yahoo\.com\/ups|viously|quantserve|scorecardresearch|chartbeat|permutive/i;
const BLK = opt('block') ? new RegExp(opt('block'), 'i') : AD;
if (!has('allowads')) await ctx.route('**/*', route => BLK.test(route.request().url()) ? route.abort() : route.continue());
if (has('fontlog')) { page.on('response', r => { if (/fonts\.(googleapis|gstatic)/.test(r.url())) console.log('FONTRESP', r.status(), r.url().slice(0, 90)); }); page.on('requestfailed', r => { if (/fonts\.(googleapis|gstatic)/.test(r.url())) console.log('FONTFAIL', r.url().slice(0, 90), r.failure() && r.failure().errorText); }); }
if (has('netlog')) { page.on('requestfailed', r => console.log('REQFAIL', r.url().slice(0, 100), r.failure() && r.failure().errorText)); }
try {
  const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); console.log('status', r && r.status(), 'final url', page.url());
  await page.waitForTimeout(+(opt('wait') || 5000));
  for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Accept all")', 'button:has-text("Accept")', 'button:has-text("I agree")', 'button:has-text("Agree")', 'button:has-text("Got it")', 'button:has-text("Reject all")']) { try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 300 })) { await b.click({ timeout: 800 }); await page.waitForTimeout(300); } } catch (e) {} }
  console.log('title:', await page.title());
  // scroll through to trigger lazy images, then back to top
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < Math.min(total, 6000); y += 600) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(150); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
  const extraHide = opt('hide');
  const invis = opt('invis');
  await page.evaluate(() => document.querySelectorAll('link[rel=stylesheet][media=print]').forEach(l => { l.media = 'all'; }));
  await page.waitForTimeout(2500);
  const fontSel = (opt('key') || '').split('||').map(x => x.trim()).find(x => x && !x.startsWith('phrase:') && !x.startsWith('text:'));
  if (fontSel) {
    for (let t = 0; t < 20; t++) {
      const st = await page.evaluate(async sel => {
        const el = document.querySelector(sel); if (!el) return 'noel';
        const cs = getComputedStyle(el); const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        if (/^(arial|helvetica|sans-serif|serif|georgia|times|system-ui|-apple-system|segoe ui|roboto)/i.test(fam)) return 'ok-system:' + fam;
        try { await document.fonts.load(`${cs.fontWeight} ${cs.fontSize} "${fam}"`, el.textContent.slice(0, 20)); } catch (e) {}
        const loaded = [...document.fonts].some(f => f.family.replace(/["']/g, '') === fam && f.status === 'loaded');
        return (loaded ? 'ok:' : 'NOTLOADED:') + fam;
      }, fontSel);
      console.log('font check', st); if (!st.startsWith('NOTLOADED')) break; await page.waitForTimeout(1500);
    }
  }
  const info = await page.evaluate(({ extraHide, invis }) => {
    const css = `${invis ? invis + '{visibility:hidden !important;}\n' : ''}iframe, ins.adsbygoogle, [id*="google_ads"], body [class*="cookie" i]:not(main):not(article):not(section), body [id*="cookie" i], body [class*="consent" i]:not(main):not(article):not(section), body [id*="consent" i], #onetrust-consent-sdk, [class*="newsletter-popup" i], [class*="push-notification" i] { display:none !important; }${extraHide ? '\n' + extraHide + '{display:none !important;}' : ''}`;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const fixed = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'sticky') {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) fixed.push({ tag: el.tagName, id: el.id, cls: String(el.className).slice(0, 80), pos: cs.position, rect: [r.x, r.y, r.width, r.height].map(Math.round), txt: (el.innerText || '').slice(0, 50).replace(/\n/g, ' | ') });
      }
    }
    return fixed;
  }, { extraHide, invis });
  console.log('fixed/sticky:'); for (const f of info) console.log(' ', JSON.stringify(f));
  if (opt('text')) { const t = await page.locator(opt('text')).first().innerText().catch(() => ''); console.log('TEXT>>', t); }
  if (has('probe')) { await browser.close(); process.exit(0); }
  // Make sticky/fixed non-intrusive: sticky -> static; fixed elements not near the very top are hidden.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'sticky') el.style.position = 'static';
      else if (cs.position === 'fixed') { const r = el.getBoundingClientRect(); if (r.top > 120 || r.height > innerHeight * 0.6) el.style.setProperty('display', 'none', 'important'); }
    }
  });
  await page.waitForTimeout(1500);
  // geometry
  const pt = +(opt('pad-top') || 0), pb = +(opt('pad-bottom') || 0);
  const geo = await page.evaluate(({ top, bottom, key, H, bmode }) => {
    // selector helper: CSS, or "text:some phrase" => deepest element whose text contains the phrase
    const findAll = sel => {
      if (!sel.startsWith('text:')) return [...document.querySelectorAll(sel)];
      const needle = sel.slice(5).toLowerCase(); const out = [];
      for (const el of document.querySelectorAll('body *')) {
        if (!(el.textContent || '').toLowerCase().includes(needle)) continue;
        if ([...el.children].some(c => (c.textContent || '').toLowerCase().includes(needle))) continue;
        const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) out.push(el);
      }
      return out;
    };
    const abs = el => { const r = el.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; };
    const g = {};
    g.docH = document.documentElement.scrollHeight; g.docW = document.documentElement.scrollWidth;
    g.top = top ? abs(findAll(top)[0]).y : 0;
    g.bottom = bottom ? (() => { const a = abs(findAll(bottom)[0]); return bmode === 'top' ? a.y : a.y + a.h; })() : g.top + H;
    g.keys = [];
    const phraseRects = ph => {
      const needle = ph.toLowerCase().replace(/\s+/g, ' ');
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const nodes = []; let n;
      while ((n = w.nextNode())) { const r0 = n.parentElement && n.parentElement.getBoundingClientRect(); if (r0 && r0.width > 0 && r0.height > 0) nodes.push(n); }
      // concatenate text nodes, find phrase across node boundaries
      let full = ''; const map = [];
      for (const nd of nodes) { for (let i = 0; i < nd.data.length; i++) { map.push([nd, i]); full += nd.data[i].replace(/\s/g, ' '); } }
      const idx = full.toLowerCase().indexOf(needle); if (idx < 0) return null;
      const [sn, so] = map[idx], [en, eo] = map[idx + needle.length - 1];
      const rg = document.createRange(); rg.setStart(sn, so); rg.setEnd(en, eo + 1);
      return [...rg.getClientRects()].filter(r => r.width > 2 && r.height > 2);
    };
    if (key) for (const k of key.split('||')) {
      if (k.trim().startsWith('phrase:')) {
        const rs = phraseRects(k.trim().slice(7)); if (!rs || !rs.length) { g.keys.push({ x: 0, y: 0, w: 0, h: 0, text: 'NOT FOUND ' + k }); continue; }
        const x0 = Math.min(...rs.map(r => r.left)) + scrollX, y0 = Math.min(...rs.map(r => r.top)) + scrollY, x1 = Math.max(...rs.map(r => r.right)) + scrollX, y1 = Math.max(...rs.map(r => r.bottom)) + scrollY;
        g.keys.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, text: k.trim().slice(7) }); continue;
      }
    }
    if (key) for (const k of key.split('||').filter(k => !k.trim().startsWith('phrase:'))) for (const el of findAll(k.trim()).slice(0, 1)) {
      const rg = document.createRange(); rg.selectNodeContents(el);
      const rs = [...rg.getClientRects()].filter(r => r.width > 2 && r.height > 2);
      if (!rs.length) continue;
      const x0 = Math.min(...rs.map(r => r.left)) + scrollX, y0 = Math.min(...rs.map(r => r.top)) + scrollY, x1 = Math.max(...rs.map(r => r.right)) + scrollX, y1 = Math.max(...rs.map(r => r.bottom)) + scrollY;
      g.keys.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, text: el.innerText.slice(0, 200) });
    }
    return g;
  }, { top: opt('top'), bottom: opt('bottom'), key: opt('key'), H, bmode: opt('bottom-mode') });
  const cy = Math.max(0, geo.top - pt), ch = Math.min(geo.docH, geo.bottom + pb) - cy;
  const cx = +(opt('x') || 0), cw = +(opt('cw') || Math.min(W, geo.docW));
  console.log('geo', JSON.stringify({ docH: geo.docH, docW: geo.docW, clip: [cx, cy, cw, ch] }));
  await page.screenshot({ path: out, fullPage: cy + ch > VH, clip: { x: cx, y: cy, width: cw, height: ch } });
  const keys = geo.keys.map(k => ({ bbox_file_px: [Math.round((k.x - cx) * DPR), Math.round((k.y - cy) * DPR), Math.round(k.w * DPR), Math.round(k.h * DPR)], text: k.text }));
  console.log('KEYS', JSON.stringify(keys));
  console.log('size', cw * DPR, ch * DPR);
} catch (e) { console.log('ERR', String(e.message).split('\n')[0]); }
await browser.close();
