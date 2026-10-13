// Packs the second campaign photos (assets/products/hero/<id>-2.webp) for the
// single-file preview, which can't hold one file per photo: up to 24 photos per
// pack, grouped by category, plus index.json naming each product's pack.
//   node scripts/build-photo-packs.mjs [out-dir]   (default: dist/assets/products/hero2)
// Publish the folder next to the preview page as assets/products/hero2/.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] || join(root, "dist", "assets", "products", "hero2");
const catalog = readFileSync(join(root, "assets/js/catalog.js"), "utf8");
const products = JSON.parse(catalog.slice(catalog.indexOf("["), catalog.lastIndexOf("]") + 1));

const byCat = {};
for (const p of products) (byCat[p.cat] = byCat[p.cat] || []).push(p.id);
mkdirSync(out, { recursive: true });
const index = {};
let packs = 0;
for (const cat of Object.keys(byCat).sort()) {
  const ids = byCat[cat].sort();
  for (let k = 0; k < ids.length; k += 24) {
    const name = `${cat}-${k / 24 + 1}`;
    const pack = {};
    for (const id of ids.slice(k, k + 24)) {
      const file = join(root, "assets/products/hero", `${id}-2.webp`);
      if (!existsSync(file)) continue;
      pack[id] = "data:image/webp;base64," + readFileSync(file).toString("base64");
      index[id] = name;
    }
    writeFileSync(join(out, `${name}.json`), JSON.stringify(pack));
    packs++;
  }
}
writeFileSync(join(out, "index.json"), JSON.stringify(index));
console.log(`${Object.keys(index).length} photos in ${packs} packs -> ${out}`);
