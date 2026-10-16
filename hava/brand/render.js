// Turns the HAVA logo SVGs into transparent PNGs and vector PDFs, and makes the mountain artwork,
// the peak pattern, social images, favicons and the colour swatches. Run after `python3 logos.py <font>`.
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const HERE = __dirname;
const DEEP = '#0D2B45', ICE = '#C9DDE4', FOG = '#F4F2ED', INK = '#1A1A1A', STEEL = '#B8BCC0', GOLD = '#C9A66B';
const mk = d => fs.mkdirSync(path.join(HERE, d), { recursive: true });
['logo/png', 'logo/pdf', 'pattern', 'social', 'colours'].forEach(mk);

const manifest = JSON.parse(fs.readFileSync(path.join(HERE, 'logo/manifest.json'), 'utf8'));
const svgOf = name => fs.readFileSync(path.join(HERE, 'logo/svg', name + '.svg'), 'utf8');
const inner = svg => svg.replace(/^[\s\S]*?<g /, '<g ').replace(/<\/svg>\s*$/, '');
const viewBox = svg => svg.match(/viewBox="([^"]+)"/)[1];

// Mountain artwork: the brand-book line drawing, traced once for the website (js/ridges.js).
const ridges = fs.readFileSync(path.join(HERE, '../js/ridges.js'), 'utf8');
const ART = ridges.match(/const ART = '([^']+)'/)[1];
const [ART_W, ART_H] = ridges.match(/const ART_W = (\d+), ART_H = (\d+)/).slice(1).map(Number);
const mountains = (fill, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ART_W} ${ART_H}" width="${ART_W}" height="${ART_H}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}<path fill="${fill}" fill-rule="evenodd" d="${ART}"/></svg>\n`;

// The peak pattern from the brand book: rows of the HAVA peak.
function peaks(fill, bg, cols = 11, rows = 4) {
  const p = svgOf('hava-icon-white').match(/<path d="([^"]+)"/)[1];
  const cell = 120, s = 0.22;
  let g = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    g += `<path transform="translate(${c * cell + cell / 2 - 343.5 * s} ${r * cell + cell / 2 - 340.25 * s}) scale(${s})" d="${p}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * cell} ${rows * cell}" width="${cols * cell}" height="${rows * cell}">${bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ''}<g fill="${fill}">${g}</g></svg>\n`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  async function png(svg, file, w, h, bg = 'transparent') {
    await page.setViewportSize({ width: Math.round(w), height: Math.round(h) });
    await page.setContent(`<style>html,body{margin:0;background:${bg};overflow:hidden}body>svg{display:block;width:100vw;height:100vh}</style>${svg}`);
    await page.screenshot({ path: path.join(HERE, file), omitBackground: bg === 'transparent' });
  }
  async function pdf(svg, file, wmm) {
    const [, , vw, vh] = viewBox(svg).split(' ').map(Number);
    const hmm = wmm * vh / vw;
    await page.setContent(`<style>@page{size:${wmm}mm ${hmm}mm;margin:0}html,body{margin:0}svg{display:block;width:${wmm}mm;height:${hmm}mm}</style>${svg}`);
    await page.pdf({ path: path.join(HERE, file), width: `${wmm}mm`, height: `${hmm}mm`, printBackground: false, pageRanges: '1' });
  }

  // 1. Logos: PNG (3000 px on the long side, 2000 px for the round marks) and vector PDF.
  for (const m of manifest) {
    const svg = svgOf(m.file);
    const long = /icon|monogram/.test(m.design) ? 2000 : 3000;
    const k = long / Math.max(m.w, m.h);
    await png(svg, `logo/png/${m.file}.png`, m.w * k, m.h * k);
    const wmm = /icon|monogram/.test(m.design) ? 60 : m.design === 'wordmark-vertical' ? 40 : 160;
    await pdf(svg, `logo/pdf/${m.file}.pdf`, wmm);
  }

  // 2. Mountains and peak pattern (SVG + PNG).
  for (const [name, fill, bg] of [['white', '#FFFFFF'], ['deepwater', DEEP], ['ice', ICE], ['on-deepwater', ICE, DEEP]]) {
    const svg = mountains(fill, bg);
    fs.writeFileSync(path.join(HERE, `pattern/hava-mountains-${name}.svg`), svg);
    await png(svg, `pattern/hava-mountains-${name}.png`, 4800, 4800 * ART_H / ART_W, bg || 'transparent');
  }
  for (const [name, fill, bg] of [['white', '#FFFFFF'], ['deepwater', DEEP], ['on-deepwater', '#FFFFFF', DEEP]]) {
    const svg = peaks(fill, bg);
    fs.writeFileSync(path.join(HERE, `pattern/hava-peaks-${name}.svg`), svg);
    await png(svg, `pattern/hava-peaks-${name}.png`, 2640, 960, bg || 'transparent');
  }

  // 3. Social and app images.
  const icon = svgOf('hava-icon-white'), mono = svgOf('hava-monogram-white');
  const square = (svg, size, scale, bg = DEEP) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="${bg}"/><svg x="${size * (1 - scale) / 2}" y="${size * (1 - scale) / 2}" width="${size * scale}" height="${size * scale}" viewBox="${viewBox(icon)}">${inner(svg)}</svg></svg>`;
  await png(square(icon, 1080, 0.62), 'social/hava-profile-icon-1080.png', 1080, 1080);
  await png(square(mono, 1080, 0.62), 'social/hava-profile-monogram-1080.png', 1080, 1080);
  await png(square(icon, 1024, 0.62), 'social/hava-app-icon-1024.png', 1024, 1024);
  // Small sizes: a heavier ring so it stays visible.
  const bold = icon.replace(/stroke-width="[^"]+"/, 'stroke-width="34"').replace(/r="([\d.]+)"/, 'r="326"');
  for (const s of [32, 180, 512]) await png(square(bold, s, 0.86), `social/hava-favicon-${s}.png`, s, s);
  fs.writeFileSync(path.join(HERE, 'social/hava-favicon.svg'), square(bold, 64, 0.86).replace('<svg ', '<svg width="64" height="64" '));

  const wm = svgOf('hava-wordmark-tagline-white');
  const cover = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${DEEP}"/>
    <svg x="0" y="${h * 0.64}" width="${w}" height="${h * 0.36}" viewBox="0 0 ${ART_W} ${ART_H}" preserveAspectRatio="xMidYMax slice"><path fill="${ICE}" opacity=".42" fill-rule="evenodd" d="${ART}"/></svg>
    <svg x="${w / 2 - h * 0.45}" y="${h * 0.15}" width="${h * 0.9}" height="${h * 0.43}" viewBox="${viewBox(wm)}">${inner(wm)}</svg></svg>`;
  await png(cover(1584, 396), 'social/hava-cover-linkedin-1584x396.png', 1584, 396);
  await png(cover(1500, 500), 'social/hava-cover-x-1500x500.png', 1500, 500);
  await png(cover(1640, 624), 'social/hava-cover-facebook-1640x624.png', 1640, 624);
  const story = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920"><rect width="100%" height="100%" fill="${DEEP}"/>
    <svg x="0" y="1500" width="1080" height="420" viewBox="0 0 ${ART_W} ${ART_H}" preserveAspectRatio="xMidYMax slice"><path fill="${ICE}" opacity=".55" fill-rule="evenodd" d="${ART}"/></svg>
    <svg x="430" y="400" width="220" height="${220 * 2386.3 / 597}" viewBox="${viewBox(svgOf('hava-wordmark-vertical-white'))}">${inner(svgOf('hava-wordmark-vertical-white'))}</svg></svg>`;
  await png(story, 'social/hava-story-1080x1920.png', 1080, 1920);

  // 4. Colour swatches.
  const COLS = [['Deep Water', DEEP, '#FFFFFF'], ['Ink', INK, '#FFFFFF'], ['Fog', FOG, INK], ['Glacial Ice', ICE, INK], ['Steel', STEEL, INK], ['Gold', GOLD, INK]];
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const sw = COLS.map(([n, h, t], i) => `<g transform="translate(${60 + i * 330} 60)"><rect width="300" height="420" rx="18" fill="${h}" stroke="rgba(0,0,0,.08)"/>
    <text x="28" y="350" fill="${t}" font-family="Menlo,monospace" font-size="24" letter-spacing="2">${n.toUpperCase()}</text>
    <text x="28" y="384" fill="${t}" font-family="Menlo,monospace" font-size="22" opacity=".8">${h} · ${rgb(h).join(' ')}</text></g>`).join('');
  await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2040 540"><rect width="100%" height="100%" fill="#FFFFFF"/>${sw}</svg>`, 'colours/hava-colours.png', 2040, 540);

  await browser.close();
  console.log('logos, patterns, social images and swatches written');
})();
