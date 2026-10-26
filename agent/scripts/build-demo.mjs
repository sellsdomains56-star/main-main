// Builds the browser-only versions of the app into dist/:
// - dizz-lab-demo.html: the whole app in one file on an in-page demo backend with scripted replies. Open it in any browser.
// - dizz-lab-page.html: the same demo as page content, for hosts that supply the document skeleton.
// - dizz-lab-cloud.html: page content for claude.ai, where Claude answers through the viewer's own account.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const icon = fs.readFileSync(path.join(root, "web/public/icon.svg"), "utf8");
fs.mkdirSync(path.join(root, "dist"), { recursive: true });

async function bundle(entry) {
  const result = await esbuild.build({
    entryPoints: [path.join(root, entry)],
    bundle: true,
    format: "esm",
    target: "es2022",
    minify: true,
    legalComments: "none",
    write: false,
    outdir: "/out",
    loader: { ".css": "css" },
    logLevel: "warning",
  });
  return {
    js: result.outputFiles.find((f) => f.path.endsWith(".js")).text.replace(/<\/script/gi, "<\\/script"),
    css: result.outputFiles.find((f) => f.path.endsWith(".css")).text,
  };
}

function write(name, html) {
  const out = path.join(root, "dist", name);
  fs.writeFileSync(out, html);
  console.log(`Built ${path.relative(process.cwd(), out)} (${(html.length / 1024).toFixed(0)} KB)`);
}

const demo = await bundle("web/demo.ts");
write(
  "dizz-lab-demo.html",
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>Dizz Lab</title>
<meta name="description" content="Dizz Lab demo: a private AI agent. Runs in your browser with scripted replies.">
<meta name="theme-color" content="#0b0b0c">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon.trim())}">
<style>${demo.css}</style>
</head>
<body>
<div id="app"></div>
<script type="module">${demo.js}</script>
</body>
</html>
`,
);

// The cloud page: page content for claude.ai, where the host supplies the document skeleton and lends
// the page the viewer's Claude and a private store. dist/dizz-lab-page.html is the same app as the demo.
const page = ({ css, js }) => `<title>Dizz Lab</title>
<style>${css}</style>
<div id="app"></div>
<script type="module">${js}</script>
`;
write("dizz-lab-page.html", page(demo));
write("dizz-lab-cloud.html", page(await bundle("web/cloud.ts")));
