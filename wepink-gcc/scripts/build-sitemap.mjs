// Writes sitemap.xml and robots.txt for search engines: every page and every
// product, each with its English, Arabic and Portuguese address.
//   node scripts/build-sitemap.mjs            (address from config.siteUrl in data.js)
//   SITE_URL=https://shop.example.com/ node scripts/build-sitemap.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");

const configured = (read("assets/js/data.js").match(/siteUrl:\s*"([^"]+)"/) || [])[1];
const base = (process.env.SITE_URL || configured || "").replace(/\/?$/, "/");
if (!/^https?:\/\//.test(base)) throw new Error("Set config.siteUrl in assets/js/data.js or SITE_URL");

const catalog = read("assets/js/catalog.js");
const products = JSON.parse(catalog.slice(catalog.indexOf("["), catalog.lastIndexOf("]") + 1));
const categories = [...new Set(products.map((p) => p.cat))];
const today = new Date().toISOString().slice(0, 10);

const pages = [
  ["", "1.0", "daily"],
  ["shop.html", "0.9", "daily"],
  ...categories.map((c) => [`shop.html?c=${c}`, "0.8", "weekly"]),
  ...products.map((p) => [`product.html?id=${encodeURIComponent(p.id)}`, p.badge === "bestseller" ? "0.8" : "0.7", "weekly"]),
  ["earn.html", "0.6", "monthly"],
  ["campaign.html", "0.6", "monthly"],
  ["stores.html", "0.5", "monthly"],
  ["about.html", "0.5", "monthly"],
  ["help.html", "0.5", "monthly"],
];
const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const withLang = (path, lang) => base + path + (path.includes("?") ? "&" : "?") + "lang=" + lang;

const urls = pages.map(([path, priority, freq]) => {
  const en = base + path;
  return `  <url>
    <loc>${xml(en)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${xml(en)}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${xml(withLang(path, "ar"))}"/>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${xml(withLang(path, "pt"))}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(en)}"/>
  </url>`;
});

writeFileSync(
  join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`
);
writeFileSync(
  join(root, "robots.txt"),
  `User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /checkout.html
Disallow: /dist/

Sitemap: ${base}sitemap.xml
`
);
console.log(`sitemap.xml: ${pages.length} pages for ${base}`);
