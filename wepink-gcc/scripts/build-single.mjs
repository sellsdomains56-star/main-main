// Builds the whole storefront as one self-contained HTML file that opens
// straight from disk (double-click) or can be sent as an attachment, and the
// admin panel as a second one next to it. Store pages switch with the URL
// hash instead of separate files.
//
//   node wepink-gcc/scripts/build-single.mjs [out.html]
//   → dist/wepink-gulf.html and dist/wepink-admin.html
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(process.argv[2] || join(root, "dist", "wepink-gulf.html"));
const read = (p) => readFileSync(join(root, p), "utf8");
const dataUri = (p) => "data:image/svg+xml;base64," + Buffer.from(read(p)).toString("base64");

const brand = ["logo.svg", "logo-white.svg", "favicon.svg"];
const inlineBrand = (text) => brand.reduce((t, f) => t.split(`assets/brand/${f}`).join(dataUri(`assets/brand/${f}`)), text);
const script = (text) => `<script>\n${inlineBrand(text).replace(/<\/script/gi, "<\\/script")}\n</script>`;

// Campaign photos and packshots referenced in data.js are inlined too.
const inlinePhotos = (text) =>
  text.replace(/"(assets\/(?:photos|products)\/[^"]+\.(jpe?g|png|webp))"/g, (m, path, ext) => {
    if (!existsSync(join(root, path))) return m;
    const type = ext === "jpg" ? "jpeg" : ext;
    return `"data:image/${type};base64,${readFileSync(join(root, path)).toString("base64")}"`;
  });

// The home page film travels inside the one-file build: its 720p file plays at every width
// there (the 1080p file would make the page too big to share).
const inlineFilm = (text) =>
  text.replace(/film: \{ src: "[^"]*", srcMobile: "([^"]+)"/, (m, mobile) =>
    existsSync(join(root, mobile)) ? `film: { src: "data:video/mp4;base64,${readFileSync(join(root, mobile)).toString("base64")}", srcMobile: ""` : m
  );

// Studio photos load from the brand's CDN in the one-file build (the cut-outs
// and campaign photos are inlined), which keeps the file small enough to share.
const catalogJs = (() => {
  const text = read("assets/js/catalog.js");
  const rows = JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1));
  for (const p of rows) {
    const remote = p.remote || [];
    if (p.image && remote[0]) p.image = remote[0];
    if (p.images) p.images = p.images.map((src, i) => remote[i] || src);
  }
  return "window.WP_CATALOG = " + JSON.stringify(rows) + ";";
})();

const css = read("assets/css/styles.css");
// Full product details (product pages) ride along inline, in their own marked tag.
const details = existsSync(join(root, "assets/js/details.js")) ? `<script id="wp-details">\n${read("assets/js/details.js").replace(/<\/script/gi, "<\\/script")}\n</script>` : "";
const js = [catalogJs, ...["data.js", "sync.js", "i18n.js", "art.js", "silk.js", "app.js", "brain.js", "assistant.js", "pages.js"].map((f) => read(`assets/js/${f}`))].map((text) => script(inlinePhotos(inlineFilm(text))));
const head = read("index.html").match(/<head>([\s\S]*?)<\/head>/)[1];
const meta = head
  .split("\n")
  .filter((l) => /<meta|<title|fonts\.g/.test(l))
  .join("\n");

const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
${meta}
  <link rel="icon" href="${dataUri("assets/brand/favicon.svg")}" type="image/svg+xml">
  <style>
${css}
  </style>
  <script>
    window.WP_SINGLE = true;
    (function () {
      try {
        var q = new URLSearchParams((location.hash.split("?")[1] || "")).get("lang");
        var l = q || JSON.parse(localStorage.getItem("wpg.lang") || "null") || ((navigator.language || "").toLowerCase().indexOf("ar") === 0 ? "ar" : "en");
        if (l === "ar") { document.documentElement.lang = "ar"; document.documentElement.dir = "rtl"; }
      } catch (e) {}
      try {
        var tone = JSON.parse(localStorage.getItem("wpg.tone") || "null");
      } catch (e) {}
      if (tone !== "noir" && tone !== "blanc") tone = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "noir" : "blanc";
      document.documentElement.setAttribute("data-tone", tone);
    })();
  </script>
</head>
<body data-page="home">
  <div id="app-header"></div>
  <main id="main" tabindex="-1"></main>
  <div id="app-footer"></div>
  <noscript><p style="padding:24px;text-align:center">Please enable JavaScript to shop wepink Gulf. · يرجى تفعيل JavaScript للتسوق.</p></noscript>
${js.join("\n")}
${details}
</body>
</html>
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`${out} (${Math.round(html.length / 1024)} KB)`);

// Admin panel: the catalogue's original photos come from the brand's CDN
// (thumbnails only), and "Open the store" points at the store file beside it.
const adminCatalog = (() => {
  const text = read("assets/js/catalog.js");
  const rows = JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1));
  for (const p of rows) {
    const remote = p.remote || [];
    if (remote[0]) Object.assign(p, { cutout: "", image: remote[0], images: remote.slice(0, 3) });
    delete p.remote;
  }
  return "window.WP_CATALOG = " + JSON.stringify(rows) + ";";
})();
const adminHead = read("admin.html").match(/<head>([\s\S]*?)<\/head>/)[1];
const adminMeta = adminHead
  .split("\n")
  .filter((l) => /<meta|<title|fonts\.g/.test(l))
  .join("\n");
const supabaseJs = adminHead.match(/<script defer src="(https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[^"]+)"/)[1];
const adminHtml = `<!doctype html>
<html lang="en" dir="ltr">
<head>
${adminMeta}
  <link rel="icon" href="${dataUri("assets/brand/favicon.svg")}" type="image/svg+xml">
  <style>
${read("assets/css/admin.css")}
  </style>
</head>
<body>
  <div id="app"><p class="boot">Loading…</p></div>
  <noscript><p class="boot">The admin panel needs JavaScript.</p></noscript>
  <script src="${supabaseJs}"></script>
  <script>window.WP_STORE_URL = ${JSON.stringify(basename(out))};</script>
${[adminCatalog, read("assets/js/data.js"), read("assets/js/admin.js")].map((text) => script(inlinePhotos(text))).join("\n")}
</body>
</html>
`;
const adminOut = join(dirname(out), "wepink-admin.html");
writeFileSync(adminOut, adminHtml);
console.log(`${adminOut} (${Math.round(adminHtml.length / 1024)} KB)`);
