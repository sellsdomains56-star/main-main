"""Packs the re-shot product photos after each product's first one
(assets/products/r/<id>-2.webp, -3…) for the single-file preview, which can't hold
one file per photo: photos grouped by category, about 4 MB per pack, plus index.json
naming each photo's pack. The preview's copies are a little smaller (960 px wide).
Each product's first photo is published as its own file next to the page.

    python3 scripts/build_render_packs.py [out-dir]   (default: dist/assets/products/r/packs)

Publish the folder next to the preview page as assets/products/r/packs/.
"""
import base64, io, json, os, re, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist", "assets", "products", "r", "packs")
PACK_BYTES = 4 * 1024 * 1024

text = open(os.path.join(ROOT, "assets/js/catalog.js"), encoding="utf-8").read()
products = json.loads(text[text.index("["):text.rindex("]") + 1])

def shrink(path):
    im = Image.open(path).convert("RGB").resize((960, 1192), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=78, method=4)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()

by_cat = {}
for p in products:
    for k in range(2, (p.get("renders") or 0) + 1):
        by_cat.setdefault(p["cat"], []).append(f"{p['id']}-{k}")

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(".json"):
        os.remove(os.path.join(OUT, f))
index, packs, total = {}, 0, 0
for cat in sorted(by_cat):
    n, pack, size = 1, {}, 0
    for key in sorted(by_cat[cat]):
        data = shrink(os.path.join(ROOT, "assets/products/r", key + ".webp"))
        if pack and size + len(data) > PACK_BYTES:
            json.dump(pack, open(os.path.join(OUT, f"{cat}-{n}.json"), "w"))
            packs, total, n, pack, size = packs + 1, total + size, n + 1, {}, 0
        pack[key] = data
        size += len(data)
        index[key] = f"{cat}-{n}"
    if pack:
        json.dump(pack, open(os.path.join(OUT, f"{cat}-{n}.json"), "w"))
        packs, total = packs + 1, total + size
json.dump(index, open(os.path.join(OUT, "index.json"), "w"))
print(f"{len(index)} photos in {packs} packs ({total // 1024 // 1024} MB) -> {OUT}")
