// Print the study HTML to PDF. Usage: NODE_PATH=$(npm root -g) node print_pdf.mjs <in.html> <out.pdf>
import { createRequire } from 'module'; import path from 'path';
const require = createRequire((process.env.NODE_PATH || '.') + '/x.js');
const { chromium } = require('playwright');
const [i, o] = process.argv.slice(2);
const b = await chromium.launch(); const pg = await b.newPage();
await pg.goto('file://' + path.resolve(i)); await pg.waitForTimeout(800);
await pg.pdf({ path: o, width: '210mm', height: '297mm', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await b.close();
