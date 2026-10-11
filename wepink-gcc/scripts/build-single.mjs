// Builds the whole storefront as one self-contained HTML file that opens
// straight from disk (double-click) or can be sent as an attachment.
// Pages switch with the URL hash instead of separate files.
//
//   node wepink-gcc/scripts/build-single.mjs [out.html]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(process.argv[2] || join(root, "dist", "wepink-gulf.html"));
const read = (p) => readFileSync(join(root, p), "utf8");
const dataUri = (p) => "data:image/svg+xml;base64," + Buffer.from(read(p)).toString("base64");

const brand = ["logo.svg", "logo-white.svg", "favicon.svg"];
const inlineBrand = (text) => brand.reduce((t, f) => t.split(`assets/brand/${f}`).join(dataUri(`assets/brand/${f}`)), text);
const script = (text) => `<script>\n${inlineBrand(text).replace(/<\/script/gi, "<\\/script")}\n</script>`;

const css = read("assets/css/styles.css");
const js = ["data.js", "i18n.js", "art.js", "app.js", "pages.js"].map((f) => script(read(`assets/js/${f}`)));
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
    })();
  </script>
</head>
<body data-page="home">
  <div id="app-header"></div>
  <main id="main" tabindex="-1"></main>
  <div id="app-footer"></div>
  <noscript><p style="padding:24px;text-align:center">Please enable JavaScript to shop wepink Gulf. · يرجى تفعيل JavaScript للتسوق.</p></noscript>
${js.join("\n")}
</body>
</html>
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`${out} (${Math.round(html.length / 1024)} KB)`);
