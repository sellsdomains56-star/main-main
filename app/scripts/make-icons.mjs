// Renders the JB monogram (assets/brand/monogram.json) into the app icon, Android adaptive
// icon layers, splash icon and favicon. Needs Playwright's Chromium:
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/make-icons.mjs
import { readFileSync } from "node:fs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const root = new URL("../", import.meta.url);
const mono = JSON.parse(readFileSync(new URL("assets/brand/monogram.json", root), "utf8"));
const INK = "#0B0B0B";
const PAPER = "#F4F2EE";

/** An SVG of `size` px: optional background (square or circle), monogram scaled to `scale` of the canvas height. */
function svg({ size, bg, circle, color, scale, stroke = 3 }) {
  const [cx, cy] = mono.center;
  const k = (scale * 100) / 84; // the monogram is ~84 units tall; this makes it `scale` of the canvas
  const back = !bg ? "" : circle ? `<circle cx="50" cy="50" r="50" fill="${bg}"/>` : `<rect width="100" height="100" fill="${bg}"/>`;
  const paths = mono.paths.map((d) => `<path d="${d}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${back}<g transform="translate(50 50) scale(${k}) translate(${-cx} ${-cy})" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="square">${paths}</g></svg>`;
}

const outputs = [
  ["assets/icon.png", { size: 1024, bg: INK, color: PAPER, scale: 0.62 }],
  ["assets/android-icon-foreground.png", { size: 512, color: PAPER, scale: 0.46 }],
  ["assets/android-icon-background.png", { size: 512, bg: INK, color: INK, scale: 0 }],
  ["assets/android-icon-monochrome.png", { size: 432, color: "#FFFFFF", scale: 0.46 }],
  ["assets/splash-icon.png", { size: 1024, color: INK, scale: 0.5 }],
  ["assets/favicon.png", { size: 48, bg: INK, circle: true, color: PAPER, scale: 0.62, stroke: 4.2 }],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, opts] of outputs) {
  await page.setViewportSize({ width: opts.size, height: opts.size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(opts)}</body></html>`);
  await page.locator("svg").screenshot({ path: new URL(file, root).pathname, omitBackground: true });
  console.log("wrote", file);
}
await browser.close();
