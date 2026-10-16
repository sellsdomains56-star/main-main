// Prints guidelines.html to HAVA-Brand-Guidelines.pdf with headless Chromium (Playwright).
// Run from this folder after `python3 guidelines.py`.
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'guidelines.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.pdf({ path: path.join(__dirname, 'HAVA-Brand-Guidelines.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('HAVA-Brand-Guidelines.pdf written');
})();
