// Render each chart SVG to a PNG so it can be inspected. Usage: NODE_PATH=$(npm root -g) node shot_svgs.mjs <charts_dir> <out_dir>
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path';
const require = createRequire((process.env.NODE_PATH || '.') + '/x.js');
const { chromium } = require('playwright');
const [d, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const pg = await b.newPage({ deviceScaleFactor: 2, viewport: { width: 760, height: 800 } });
for (const f of fs.readdirSync(d).filter(f => f.endsWith('.svg'))) {
  const html = path.join(out, f.replace('.svg', '.html'));
  fs.writeFileSync(html, `<body style="margin:0;background:#fcfcfb"><img src="file://${path.resolve(d, f)}" style="width:720px;display:block;margin:10px"></body>`);
  await pg.goto('file://' + path.resolve(html)); await pg.waitForTimeout(300);
  await pg.screenshot({ path: path.join(out, f.replace('.svg', '.png')), fullPage: true });
}
await b.close();
