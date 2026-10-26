// Builds dist/dizz-lab-demo.html: the whole app in one file, running on an
// in-page demo backend with scripted replies. Open it in any browser.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = await esbuild.build({
  entryPoints: [path.join(root, "web/demo.ts")],
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
const js = result.outputFiles.find((f) => f.path.endsWith(".js")).text.replace(/<\/script/gi, "<\\/script");
const css = result.outputFiles.find((f) => f.path.endsWith(".css")).text;
const icon = fs.readFileSync(path.join(root, "web/public/icon.svg"), "utf8");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>Dizz Lab</title>
<meta name="description" content="Dizz Lab demo: a private AI agent. Runs in your browser with scripted replies.">
<meta name="theme-color" content="#0b0b0c">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(icon.trim())}">
<style>${css}</style>
</head>
<body>
<div id="app"></div>
<script type="module">${js}</script>
</body>
</html>
`;
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
const out = path.join(root, "dist/dizz-lab-demo.html");
fs.writeFileSync(out, html);
console.log(`Built ${path.relative(process.cwd(), out)} (${(html.length / 1024).toFixed(0)} KB)`);
