#!/usr/bin/env node
/**
 * Builds one self-contained HTML page of the website for a no-install demo
 * (published as a claude.ai Artifact). Everything is inlined — app code, fonts,
 * icons, demo media and seed data — because the page host only loads its own HTML.
 * In the page, an in-browser demo server (src/lib/demo/server.ts) stands in for the API.
 *
 *   node scripts/build-demo-page.mjs [out.html]
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] ?? join(app, "dist-demo.html");
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"], maxBuffer: 256 * 1024 * 1024, env: { ...process.env, CI: "1" } }).toString();

console.error("Building the website…");
run("npx expo export --platform web", app);

console.error("Exporting demo data…");
const data = run("npx tsx scripts/export-demo-data.ts", join(app, "../server"));

const jsDir = join(app, "dist/_expo/static/js/web");
const entry = readdirSync(jsDir).find((f) => f.startsWith("entry-") && f.endsWith(".js"));
let js = readFileSync(join(jsDir, entry), "utf8");

// Inline the assets the app actually uses (images and the fonts it loads) as data: URIs.
const USED_FONTS = /\/(Inter_(400Regular|500Medium|600SemiBold|700Bold|800ExtraBold)|PlayfairDisplay_700Bold|Ionicons)\./; // the faces src/app/_layout.tsx loads
const MIME = { png: "image/png", jpg: "image/jpeg", ttf: "font/ttf" };
let inlined = 0;
js = js.replace(/"(\/assets\/[^"]+\.(png|jpg|ttf))"/g, (whole, path, ext) => {
  if (ext === "ttf" && !USED_FONTS.test(path)) return whole;
  const file = join(app, "dist", path);
  if (!existsSync(file)) return whole;
  inlined++;
  return JSON.stringify(`data:${MIME[ext]};base64,${readFileSync(file).toString("base64")}`);
});

// Nothing inlined may close the <script> element early.
const safe = (s) => s.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");

const page = `<title>JB Always Fresh</title>
<style>
  :root { --bg: #FAF8F4; }
  html, body { height: 100%; }
  body { overflow: hidden; background: var(--bg); }
  #root { display: flex; height: 100%; flex: 1; }
</style>
<div id="root"></div>
<script>
  window.__AF_DEMO__ = ${safe(data)};
  // The app routes by URL path; start it at its home screen wherever the page is served.
  try { if (location.pathname !== "/") history.replaceState(null, "", "/"); } catch (e) {}
</script>
<script>${safe(js)}</script>
`;
writeFileSync(out, page);
console.error(`Wrote ${out} (${(page.length / 1024 / 1024).toFixed(1)} MB, ${inlined} assets inlined)`);
