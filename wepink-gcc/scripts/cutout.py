#!/usr/bin/env python3
"""Cut product photos out of their white studio backdrop so the store can
stage them on its own scenes (satin, glow, shadow and reflection in CSS).

  python3 scripts/cutout.py            # every product in data/catalog-source.json
  python3 scripts/cutout.py ID [ID…]   # just these products
  python3 scripts/cutout.py ID@1       # …using the product's first photo
  python3 scripts/cutout.py --prune    # re-check existing cut-outs

For each product it cuts out both downloaded photos and keeps the cleaner,
bottle-forward one (the narrower silhouette, which is usually the bottle on its
own rather than bottle plus box). Output: assets/products/cutout/<id>.webp.

The backdrop is found by flood-filling near-white, near-grey pixels from the
image edges, so the bottle's own highlights (which don't touch the edge) stay.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "products")
OUT = os.path.join(SRC, "cutout")
SOURCE = os.path.join(ROOT, "data", "catalog-source.json")


def cut(path, tol=24):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    light = (a.min(axis=2) > 255 - tol * 2) & ((a.max(axis=2) - a.min(axis=2)) < tol)
    mask = Image.fromarray(np.where(light, 255, 0).astype(np.uint8)).copy()  # writable copy for floodfill
    border = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    for xy in border:
        if mask.getpixel(xy) == 255:
            ImageDraw.floodfill(mask, xy, 128, thresh=0)
    bg = np.asarray(mask) == 128
    # Drop specks: an opening removes thin leftovers of the floor reflection.
    fg = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8))
    fg = fg.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))
    alpha = fg.filter(ImageFilter.GaussianBlur(0.9))
    rgba = im.convert("RGBA")
    rgba.putalpha(alpha)
    box = alpha.point(lambda v: 255 if v > 24 else 0).getbbox()
    if not box:
        return None
    pad = 6
    rgba = rgba.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(w, box[2] + pad), min(h, box[3] + pad)))
    # Soften what's left of the floor reflection along the bottom edge.
    cw, ch = rgba.size
    fade = max(1, int(ch * 0.06))
    al = np.asarray(rgba.getchannel("A")).astype(np.float32)
    al[ch - fade:, :] *= np.linspace(1, 0, fade)[:, None]
    rgba.putalpha(Image.fromarray(al.astype(np.uint8)))
    coverage = float((al > 128).mean())
    return rgba, cw / ch, coverage


# Very pale or clear packaging can melt into the white backdrop; those cut-outs
# are hollow in the middle, so they're rejected and the store falls back to the
# studio photo. A few borderline ones are listed by hand.
REJECT = {"colonia-divine-100-ml", "cream-perfect-pear-200-ml"}


def solid_enough(rgba):
    a = np.asarray(rgba.getchannel("A")).astype(np.float32) / 255
    h, w = a.shape
    centre = float((a[int(h * 0.25):int(h * 0.75), int(w * 0.25):int(w * 0.75)] > 0.5).mean())
    overall = float((a > 0.5).mean())
    return not (centre < 0.42 or (centre < 0.62 and overall < 0.31))


def best_cutout(pid, files, force=None):
    picks = []
    if force is not None:
        files = [files[force]] if force < len(files) else files
    for f in files:
        path = os.path.join(SRC, f)
        if os.path.exists(path):
            r = cut(path)
            # A cut-out that kept almost nothing (or almost everything) failed.
            if r and 0.18 < r[2] < 0.97 and solid_enough(r[0]):
                picks.append(r)
    if not picks or pid in REJECT:
        return None
    rgba = min(picks, key=lambda r: r[1])[0]
    rgba.thumbnail((560, 560))
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, pid + ".webp")
    rgba.save(out, "WEBP", quality=82, method=6)
    return out


def prune():
    """Re-check existing cut-outs with the quality rules and drop failures."""
    for name in sorted(os.listdir(OUT)):
        pid = name[:-5]
        if pid in REJECT or not solid_enough(Image.open(os.path.join(OUT, name))):
            os.remove(os.path.join(OUT, name))
            print("dropped", pid)


if __name__ == "__main__":
    if sys.argv[1:] == ["--prune"]:
        prune()
        sys.exit()
    src = json.load(open(SOURCE))
    # ID or ID@N (N = 1-based photo number, to choose the shot by hand).
    want = dict((a.split("@")[0], int(a.split("@")[1]) - 1 if "@" in a else None) for a in sys.argv[1:])
    done = 0
    for p in src:
        if want and p["id"] not in want:
            continue
        files = [os.path.basename(x) for x in p.get("images", [])]
        if best_cutout(p["id"], files, want.get(p["id"])):
            done += 1
        else:
            print("no clean cut-out:", p["id"])
    print(f"{done} cut-outs -> {OUT}")
