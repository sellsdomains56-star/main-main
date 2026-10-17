// One PDF with only the HAVA logo: each version centred on its own A4 landscape page, as vectors.
// Run from this folder after `python3 logos.py <font>`.
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const DEEP = '#0D2B45';
const PAGES = [
  ['wordmark', 'deepwater', '#FFFFFF', '150mm'], ['wordmark', 'white', DEEP, '150mm'], ['wordmark', 'gold', DEEP, '150mm'],
  ['wordmark-tagline', 'deepwater', '#FFFFFF', '160mm'], ['wordmark-tagline', 'white', DEEP, '160mm'],
  ['wordmark-vertical', 'deepwater', '#FFFFFF', '34mm'], ['wordmark-vertical', 'gold', DEEP, '34mm'],
  ['icon', 'deepwater', '#FFFFFF', '90mm'], ['icon', 'white', DEEP, '90mm'],
  ['monogram', 'deepwater', '#FFFFFF', '90mm'], ['monogram', 'white', DEEP, '90mm'],
];

(async () => {
  const body = PAGES.map(([d, c, bg, w]) => {
    const svg = fs.readFileSync(path.join(__dirname, 'logo/svg', `hava-${d}-${c}.svg`), 'utf8').replace(/ width="[^"]+" height="[^"]+"/, '');
    return `<section style="background:${bg}"><div style="width:${w}">${svg}</div></section>`;
  }).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>@page{size:297mm 210mm;margin:0}*{margin:0}
    section{width:297mm;height:210mm;display:grid;place-items:center;break-after:page;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    section:last-child{break-after:auto} svg{display:block;width:100%;height:auto}</style>${body}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: path.join(__dirname, 'HAVA-Logo.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('HAVA-Logo.pdf written');
})();
