#!/usr/bin/env node
/**
 * Uploads the tester site (from build-netlify.mjs) to Netlify with an access token,
 * for when the site isn't connected to the GitHub repository.
 *
 *   NETLIFY_AUTH_TOKEN=… [NETLIFY_SITE_ID=…] node scripts/deploy-netlify.mjs [dir]
 *
 * Without NETLIFY_SITE_ID it creates a site named "jb-always-fresh" (or the next free name)
 * and prints its ID — set NETLIFY_SITE_ID to it so later uploads update the same link.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = process.argv[2] ?? join(app, "dist-netlify");
const token = process.env.NETLIFY_AUTH_TOKEN;
if (!token) {
  console.error("Set NETLIFY_AUTH_TOKEN (Netlify → User settings → Applications → Personal access tokens).");
  process.exit(1);
}
const API = "https://api.netlify.com/api/v1";
async function call(path, init = {}) {
  const res = await fetch(API + path, { ...init, headers: { authorization: `Bearer ${token}`, ...init.headers } });
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = Object.fromEntries(walk(dir).map((f) => ["/" + relative(dir, f).split("\\").join("/"), f]));
const digests = Object.fromEntries(Object.entries(files).map(([p, f]) => [p, createHash("sha1").update(readFileSync(f)).digest("hex")]));

let siteId = process.env.NETLIFY_SITE_ID;
if (!siteId) {
  for (const name of ["jb-always-fresh", "jb-always-fresh-demo", `jb-always-fresh-${Date.now().toString(36)}`]) {
    try {
      siteId = (await call("/sites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) })).id;
      break;
    } catch (e) {
      if (!String(e.message).includes("422")) throw e; // 422: the name is taken
    }
  }
  console.error(`Created site ${siteId} — set NETLIFY_SITE_ID=${siteId} to update it next time.`);
}

const deploy = await call(`/sites/${siteId}/deploys`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ files: digests }) });
const needed = new Set(deploy.required ?? []);
for (const [path, file] of Object.entries(files)) {
  if (!needed.has(digests[path])) continue;
  await call(`/deploys/${deploy.id}/files${encodeURI(path)}`, { method: "PUT", headers: { "content-type": "application/octet-stream" }, body: readFileSync(file) });
  console.error(`Uploaded ${path}`);
}
let state = deploy;
for (let i = 0; i < 60 && !["ready", "error"].includes(state.state); i++) {
  await new Promise((r) => setTimeout(r, 2000));
  state = await call(`/deploys/${deploy.id}`);
}
if (state.state !== "ready") throw new Error(`Deploy ended as "${state.state}": ${state.error_message ?? ""}`);
console.log(state.ssl_url || state.url);
