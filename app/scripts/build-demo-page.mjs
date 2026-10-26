#!/usr/bin/env node
/**
 * Builds one self-contained HTML page of the website for a no-install demo.
 * Everything is inlined — app code, fonts, icons, demo media and seed data — so the
 * page works from any host, even one that only serves a single file.
 * In the page, an in-browser demo server (src/lib/demo/server.ts) stands in for the API.
 *
 *   node scripts/build-demo-page.mjs [out.html] [--start barber|shop|admin] [--reuse-build] [--keep-path]
 *
 * --start makes a page for one side: it opens signed in to that side's sample account, on its
 * panel (the barber's dashboard, the barbershop panel or the team's admin panel).
 * --reuse-build skips the web export when app/dist is already built from the current code.
 * --keep-path keeps the address the page opens at (for hosts that send every app route to the page,
 * like the tester site), so shared links such as /p/ATLANTIS or /visits/… open their screen.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const out = args[0] && !args[0].startsWith("--") ? args[0] : join(app, "dist-demo.html");
const START = { barber: "JB Barber Dashboard", shop: "JB Shop Panel", admin: "JB Admin Panel" };
const start = flag("--start");
if (start && !START[start]) throw new Error(`--start must be one of: ${Object.keys(START).join(", ")}`);
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"], maxBuffer: 256 * 1024 * 1024, env: { ...process.env, CI: "1" } }).toString();

if (args.includes("--reuse-build") && existsSync(join(app, "dist/_expo/static/js/web"))) console.error("Using the existing website build…");
else {
  console.error("Building the website…");
  run("npx expo export --platform web", app);
}

console.error("Exporting demo data…");
const data = run("npx tsx scripts/export-demo-data.ts", join(app, "../server"));

const jsDir = join(app, "dist/_expo/static/js/web");
const entry = readdirSync(jsDir).find((f) => f.startsWith("entry-") && f.endsWith(".js"));
let js = readFileSync(join(jsDir, entry), "utf8");

// Browsers don't let a page opened from a file (file://) change its address, and the app's screens
// are addresses. So the app reads the address through __AF_LOC__: the real location on a website,
// or one kept in memory when the page is opened from a file (set up in the page below).
js = js
  .replace(/\{location:([\w$]+)\}=window(?![\w$.])/g, "{location:$1}={location:__AF_LOC__}")
  .replace(/window\.location=(?!=)/g, "__AF_LOC__.href=")
  .replace(/window\.location(?![\w$])/g, "__AF_LOC__")
  .replace(/(?<![.\w$])location(?=\.)/g, "__AF_LOC__");

// Inline the assets the app actually uses (images and the fonts it loads) as data: URIs.
const USED_FONTS = /\/(Inter_(400Regular|500Medium|600SemiBold|700Bold|800ExtraBold)|Ionicons|MaterialCommunityIcons)\./; // the faces src/app/_layout.tsx loads
const MIME = { png: "image/png", jpg: "image/jpeg", ttf: "font/ttf" };
let inlined = 0;
js = js.replace(/"(\/assets\/[^"]+\.(png|jpg|ttf))"/g, (whole, path, ext) => {
  if (ext === "ttf" && !USED_FONTS.test(path)) return whole;
  const file = join(app, "dist", path);
  if (!existsSync(file)) return whole;
  inlined++;
  return JSON.stringify(`data:${MIME[ext]};base64,${readFileSync(file).toString("base64")}`);
});

// Opened from a file, the address lives in memory (and in sessionStorage, so a reload stays on the
// same screen): history entries carry it, and links the app makes point at the tester site.
const FILE_LOCATION = `  var __AF_LOC__ = location;
  if (location.protocol === "file:") (function () {
    var KEY = "af_file_path", real = location, push = history.pushState.bind(history), swap = history.replaceState.bind(history);
    var cur = new URL("/", "https://jb-always-fresh.netlify.app");
    function set(u) { cur = new URL(u, cur); try { sessionStorage.setItem(KEY, cur.pathname + cur.search + cur.hash); } catch (e) {} }
    try { set(sessionStorage.getItem(KEY) || "/"); } catch (e) {}
    function go(u) { var next = new URL(u, cur); if (next.origin !== cur.origin) { real.href = next.href; return; } set(next.href); real.reload(); }
    function tag(state) { var o = state && typeof state === "object" ? Object.assign({}, state) : {}; o.__afUrl = cur.href; return o; }
    __AF_LOC__ = {
      get href() { return cur.href; }, set href(u) { go(u); },
      get pathname() { return cur.pathname; }, get search() { return cur.search; }, get hash() { return cur.hash; },
      get origin() { return cur.origin; }, get protocol() { return cur.protocol; }, get host() { return cur.host; },
      get hostname() { return cur.hostname; }, get port() { return cur.port; },
      assign: go, replace: go, reload: function () { real.reload(); }, toString: function () { return cur.href; }
    };
    history.pushState = function (state, title, url) { if (url != null) set(url); push(tag(state), title); };
    history.replaceState = function (state, title, url) { if (url != null) set(url); swap(tag(state), title); };
    addEventListener("popstate", function (e) { if (e.state && e.state.__afUrl) set(e.state.__afUrl); }, true);
    swap(tag(history.state), "");
  })();
`;

// Nothing inlined may close the <script> element early.
const safe = (s) => s.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");

const page = `<meta charset="utf-8">
<title>${start ? START[start] : "JB Always Fresh"}</title>
<style>
  :root { --bg: #FAF8F4; }
  html, body { height: 100%; }
  body { overflow: hidden; background: var(--bg); }
  #root { display: flex; height: 100%; flex: 1; }
</style>
<div id="root"></div>
<script>
  window.__AF_DEMO__ = ${safe(data)};${start ? `\n  window.__AF_DEMO_START__ = ${JSON.stringify(start)};` : ""}
${args.includes("--keep-path") ? "" : `  // The app routes by URL path; start it at its home screen wherever the page is served.
  if (location.protocol !== "file:") try { if (location.pathname !== "/") history.replaceState(null, "", "/"); } catch (e) {}
`}${FILE_LOCATION}</script>
<script>${safe(js)}</script>
`;
writeFileSync(out, page);
console.error(`Wrote ${out} (${(page.length / 1024 / 1024).toFixed(1)} MB, ${inlined} assets inlined)`);
