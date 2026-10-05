// Renders the JB logo (monogram + ALWAYS FRESH + EST. 2026) in black and white versions into
// assets/brand/logo/: transparent PNGs for print/social, previews on a background, and the
// monogram on its own as SVG. Needs Playwright's Chromium:
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/make-logos.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const root = new URL("../", import.meta.url);
const out = new URL("assets/brand/logo/", root);
mkdirSync(out, { recursive: true });
const mono = JSON.parse(readFileSync(new URL("assets/brand/monogram.json", root), "utf8"));
const font = (w) => readFileSync(new URL(`node_modules/@expo-google-fonts/inter/${w}/Inter_${w}.ttf`, root)).toString("base64");
const BLACK = "#0B0B0B";
const WHITE = "#F4F2EE";

const monogramSvg = (color, stroke = 2.4) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mono.viewBox}" width="512" height="512">${mono.paths.map((d) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="square"/>`).join("")}</svg>`;

for (const [name, color] of [["black", BLACK], ["white", WHITE]]) writeFileSync(new URL(`jb-monogram-${name}.svg`, out), monogramSvg(color) + "\n");

const lockup = (color, bg) => `<!doctype html><html><head><style>
@font-face { font-family: InterB; src: url(data:font/ttf;base64,${font("700Bold")}); }
@font-face { font-family: InterS; src: url(data:font/ttf;base64,${font("600SemiBold")}); }
body { margin: 0; background: ${bg}; }
#logo { display: inline-flex; flex-direction: column; align-items: center; padding: 120px 160px; background: ${bg}; }
#logo svg { width: 560px; height: 560px; }
.name { font: 700 108px InterB; letter-spacing: 28px; margin-right: -28px; color: ${color}; margin-top: 6px; }
.est { font: 600 52px InterS; letter-spacing: 18px; margin-right: -18px; color: ${color}; opacity: 0.7; margin-top: 22px; }
</style></head><body><div id="logo">${monogramSvg(color, 2.6).replace('width="512" height="512"', "")}<div class="name">ALWAYS FRESH</div><div class="est">EST. 2026</div></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2000, height: 1600 } });
const shots = [
  ["jb-logo-black.png", BLACK, "transparent"],
  ["jb-logo-white.png", WHITE, "transparent"],
  ["jb-logo-black-on-white.png", BLACK, "#FFFFFF"],
  ["jb-logo-white-on-black.png", WHITE, BLACK],
];
for (const [file, color, bg] of shots) {
  await page.setContent(lockup(color, bg));
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#logo").screenshot({ path: new URL(file, out).pathname, omitBackground: bg === "transparent" });
  console.log("wrote", file);
}
await browser.close();
