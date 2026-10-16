// Report any page whose content runs into the footer. Usage: NODE_PATH=$(npm root -g) node check_overflow.mjs <study.html>
import { createRequire } from 'module'; import path from 'path';
const require = createRequire((process.env.NODE_PATH || '.') + '/x.js');
const { chromium } = require('playwright');
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 794, height: 1123 } });
await pg.goto('file://' + path.resolve(process.argv[2])); await pg.waitForTimeout(600);
const res = await pg.evaluate(() => [...document.querySelectorAll('section.page')].map((s, i) => {
  const f = s.querySelector('footer'); if (!f) return { i: i + 1, ok: true };
  const top = f.getBoundingClientRect().top; const kids = [...s.children].filter(c => c !== f);
  const bottom = Math.max(...kids.map(k => k.getBoundingClientRect().bottom)); return { i: i + 1, gap_px: Math.round(top - bottom), ok: bottom <= top - 4 };
}));
console.log(res.map(r => `p${r.i}:${r.ok ? 'ok' : 'OVERFLOW'}${r.gap_px !== undefined ? ' gap ' + r.gap_px : ''}`).join('  '));
await b.close();
