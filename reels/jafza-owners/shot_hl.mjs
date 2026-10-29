// Capture a real article for a PAGE beat: screenshot from the headline down to the last quoted phrase, plus the exact boxes of those phrases (for the marker).
//   node shot_hl.mjs <url> <out.png> --find "phrase" [--find "phrase 2" ...] [--hidetext "text a block starts with"] [--noempty] [--desktop] [--w 540] [--dpr 2] [--pad 260] [--wait 5000] [--top h1]
// Writes <out.png> and <out>.json { url, title, w, h, boxes: [{ phrase, bbox: [x, y, w, h] (image px) }, ...], head: [x, y, w, h] }.
// Fixed / sticky bars, cookie banners and ad slots are hidden before the shot, so only the article itself is on the picture.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let chromium;
for (const m of [process.env.PLAYWRIGHT_PATH, '/opt/node22/lib/node_modules/playwright', 'playwright'].filter(Boolean)) { try { ({ chromium } = require(m)); break; } catch (e) { /* try the next */ } }
if (!chromium) throw new Error('playwright not found');
const CHROME = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const [url, out, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf('--' + k); return i >= 0 ? rest[i + 1] : d; };
const finds = rest.flatMap((a, i) => (a === '--find' ? [rest[i + 1]] : []));
const hides = rest.flatMap((a, i) => (a === '--hidetext' ? [rest[i + 1]] : []));          // blocks to remove, by the text they start with ("RECOMMENDED FOR YOU", "SPONSORED LINKS")
const VW = +opt('w', 540), DPR = +opt('dpr', 2), PAD = +opt('pad', 260), TOP = opt('top', 'h1');
const browser = await chromium.launch({ executablePath: CHROME, proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined, args: ['--no-sandbox', '--disable-gpu', '--disable-blink-features=AutomationControlled'] });
const MOBILE = !rest.includes('--desktop');                                       // --desktop: no phone emulation (pages that only lay out as a desktop document, e.g. the Dubai Legislation Portal)
const ctx = await browser.newContext({ viewport: { width: VW, height: 1400 }, deviceScaleFactor: DPR, ...(MOBILE ? { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' } : {}), locale: 'en-US', isMobile: MOBILE, hasTouch: MOBILE });
const page = await ctx.newPage();
const ADS = /doubleclick|googlesyndication|googletagservices|adservice|adnxs|taboola|outbrain|criteo|amazon-adsystem|pubmatic|rubiconproject|teads|mgid|projectagora|adsrvr|smartadserver|openx|yieldmo|33across|sharethrough|media\.net|revcontent|zergnet|onesignal/;   // ad networks: never loaded
await page.route('**/*', r => (ADS.test(r.request().url()) ? r.abort() : r.continue()));
try {
  const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); console.log('status', r && r.status());
  await page.waitForTimeout(+opt('wait', 5000));
  for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Accept All")', 'button:has-text("Accept")', 'button:has-text("I agree")', 'button:has-text("Agree")', 'button:has-text("Got it")', 'button:has-text("No thanks")', '[aria-label="Close"]', 'button:has-text("Close")']) {
    try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 300 })) { await b.click({ timeout: 800 }); await page.waitForTimeout(400); } } catch (e) { /* not there */ }
  }
  for (let y = 0; y < 6000; y += 700) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(250); }   // wake lazy images
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
  if (opt('eval', '')) { await page.evaluate(opt('eval', '')); await page.waitForTimeout(800); }   // --eval "js": e.g. open the collapsed sections of a mobile Wikipedia page
  const res = await page.evaluate(({ finds, TOP, hides, EMPTY }) => {
    const hide = el => el.style.setProperty('display', 'none', 'important');
    const st = document.createElement('style');                               // finish fade-in / scroll-reveal animations so the text is at full contrast
    st.textContent = '*,*::before,*::after{animation-delay:0s!important;animation-duration:0s!important;transition:none!important}[data-aos],.aos-init,.wow,[class*="fade"],[class*="reveal"]{opacity:1!important;transform:none!important;visibility:visible!important}';
    document.head.appendChild(st);
    for (const ht of hides) {                                                  // the block that starts with this text: climb while the parent still starts with it and is not much taller
      const H = ht.toUpperCase();
      for (const el of [...document.querySelectorAll('body *')].filter(e => (e.innerText || '').trim().toUpperCase().startsWith(H))) {
        let b = el; while (b.parentElement && (b.parentElement.innerText || '').trim().toUpperCase().startsWith(H) && b.parentElement.getBoundingClientRect().height < Math.max(900, 1.6 * b.getBoundingClientRect().height)) b = b.parentElement;
        hide(b);
      }
    }
    document.querySelectorAll('iframe, ins, [id^="google_ads"], [id*="div-gpt"], [class*="advert"], [class*="Advert"], [class*="ad-slot"], [class*="adslot"], [class*="dfp"], [id*="taboola"], [class*="taboola"], [id*="onetrust"], [class*="cookie"], [class*="consent"], [class*="newsletter"], [class*="popup"], [class*="modal"]').forEach(hide);
    for (const el of document.querySelectorAll('body *')) { const p = getComputedStyle(el).position; if (p === 'fixed' || p === 'sticky') hide(el); }
    if (EMPTY) for (const el of [...document.querySelectorAll('main *, article *, body div')]) { if (el.offsetHeight > 120 && !(el.innerText || '').trim() && !el.querySelector('img, picture, video, svg, canvas') && !/^(IMG|VIDEO|PICTURE|SVG|CANVAS)$/.test(el.tagName) && getComputedStyle(el).backgroundImage === 'none') hide(el); }   // --noempty: drop empty ad placeholders that keep their height
    const norm = s => s.replace(/[ \s]+/g, ' ').replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
    const nodes = [], walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let all = '', n;
    while ((n = walk.nextNode())) { const el = n.parentElement; if (!el || !el.offsetParent && getComputedStyle(el).position !== 'fixed') continue; const s = norm(n.nodeValue); if (!s) continue; nodes.push([n, all.length, s]); all += s; }
    // map an index in the normalised text back to (node, offset)
    const at = i => { for (const [nd, st, s] of nodes) if (i < st + s.length) { const raw = nd.nodeValue; let k = 0, c = 0; while (c < i - st && k < raw.length) { const m = raw.slice(k).match(/^[ \s]+/); if (m) { k += m[0].length; c += 1; } else { k++; c++; } } return [nd, k]; } const l = nodes[nodes.length - 1]; return [l[0], l[0].nodeValue.length]; };
    const sy = window.scrollY, boxes = [];
    for (const ph of finds) {
      const i = all.indexOf(norm(ph)); if (i < 0) { boxes.push({ phrase: ph, miss: true }); continue; }
      const [n0, o0] = at(i), [n1, o1] = at(i + norm(ph).length - 1), rg = document.createRange(); rg.setStart(n0, o0); rg.setEnd(n1, o1 + 1);
      const rects = [...rg.getClientRects()].filter(r => r.width > 2).map(r => [r.left, r.top + sy, r.width, r.height]);
      boxes.push({ phrase: ph, rects });
    }
    const h = document.querySelector(TOP), hr = h ? h.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    return { title: document.title, head: [hr.left, hr.top + sy, hr.width, hr.height], boxes, H: document.documentElement.scrollHeight };
  }, { finds, TOP, hides, EMPTY: rest.includes('--noempty') });
  const y0 = Math.max(0, res.head[1] - 70), last = Math.max(res.head[1] + res.head[3], ...res.boxes.flatMap(b => (b.rects || []).map(r => r[1] + r[3]))), y1 = Math.min(res.H, last + PAD);
  await page.screenshot({ path: out, fullPage: true, clip: { x: 0, y: y0, width: VW, height: y1 - y0 } });
  const px = r => [Math.round(r[0] * DPR), Math.round((r[1] - y0) * DPR), Math.round(r[2] * DPR), Math.round(r[3] * DPR)];
  const meta = { url, title: res.title, w: VW * DPR, h: Math.round((y1 - y0) * DPR), head: px(res.head), boxes: res.boxes.map(b => (b.miss ? b : { phrase: b.phrase, bbox: b.rects.map(px) })) };
  fs.writeFileSync(out.replace(/\.png$/, '') + '.json', JSON.stringify(meta, null, 1));
  console.log('title:', res.title); for (const b of meta.boxes) console.log(b.miss ? 'MISSING  ' + b.phrase : 'found    ' + b.phrase + '  ' + JSON.stringify(b.bbox));
} catch (e) { console.log('ERR', String(e.message).split('\n')[0]); }
await browser.close();
