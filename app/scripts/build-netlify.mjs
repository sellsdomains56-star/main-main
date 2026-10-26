#!/usr/bin/env node
/**
 * Builds the demo as a website for testers (Netlify, or any static host): the self-contained
 * demo page plus what makes it install like an app on a phone — a web manifest, home-screen
 * icons and full-screen mode — and a rewrite so every app route loads the page.
 *
 *   node scripts/build-netlify.mjs [outDir] [--reuse-build]     (default: dist-netlify)
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const out = args[0] && !args[0].startsWith("--") ? args[0] : join(app, "dist-netlify");
mkdirSync(out, { recursive: true });

execFileSync(process.execPath, [join(app, "scripts/build-demo-page.mjs"), join(out, "index.html"), "--keep-path", ...args.filter((a) => a === "--reuse-build")], { stdio: "inherit" });

// Home-screen icons from the app icon.
const icon = join(app, "assets/icon.png");
const sizes = [180, 192, 512];
try {
  const Jimp = createRequire(import.meta.url)("jimp-compact"); // ships with Expo's image tools
  for (const size of sizes) {
    const img = await Jimp.read(icon);
    await img.resize(size, size).writeAsync(join(out, `icon-${size}.png`));
  }
} catch {
  for (const size of sizes) copyFileSync(icon, join(out, `icon-${size}.png`)); // full size still works
}
copyFileSync(join(app, "assets/favicon.png"), join(out, "favicon.png"));

writeFileSync(join(out, "manifest.webmanifest"), JSON.stringify({
  name: "JB Always Fresh",
  short_name: "JB Fresh",
  description: "Book the best barbers — demo for testers.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#EEECE8",
  theme_color: "#0B0B0B",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2));

// Opens full screen from the home screen, with the app's name and icon.
const head = `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#EEECE8">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="JB Fresh">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icon-180.png">
<link rel="icon" type="image/png" href="/favicon.png">
`;
const page = readFileSync(join(out, "index.html"), "utf8").replace('<meta charset="utf-8">\n', `<meta charset="utf-8">\n${head}`);
writeFileSync(join(out, "index.html"), page);

// Every app route (/business, /admin, /barber/…) loads the one page.
writeFileSync(join(out, "_redirects"), "/*  /index.html  200\n");
console.error(`Tester site ready in ${out}`);
