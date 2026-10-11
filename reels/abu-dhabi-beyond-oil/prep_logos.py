"""Turn the supplied brand artwork (logos/source/*) into transparent PNGs for the reel.
   python3 -I prep_logos.py
   Mono marks (Modon, ADIA, Mubadala text) become the reel's warm white; Mubadala's globe keeps its teal;
   Talay keeps its terracotta; Yas keeps its brush colours. Everything is upscaled before keying so edges stay crisp."""
import numpy as np
from PIL import Image, ImageFilter
import os
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'logos', 'source'); OUT = os.path.join(HERE, 'logos')
INK = np.array([243, 239, 230], np.float32)

def load(name, scale):
    im = Image.open(os.path.join(SRC, name)).convert('RGBA')
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im)   # transparent -> white
    im = bg.convert('RGB')
    return im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def crop_alpha(rgba, pad=0):
    a = rgba[..., 3]; ys, xs = np.where(a > 8)
    y0, y1, x0, x1 = max(0, ys.min() - pad), ys.max() + pad + 1, max(0, xs.min() - pad), xs.max() + pad + 1
    return rgba[y0:y1, x0:x1]
def save(rgba, name):
    Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, name)); print(name, rgba.shape[1], 'x', rgba.shape[0])

def mono(name, out, scale=3, lo=0.20, hi=0.80):
    arr = np.asarray(load(name, scale), np.float32) / 255
    lum = arr @ np.array([0.299, 0.587, 0.114], np.float32)
    a = 1 - smooth(lum, lo, hi)
    rgba = np.dstack([np.broadcast_to(INK, a.shape + (3,)), a * 255]); save(crop_alpha(rgba, 4), out)

def colour_to_alpha(arr):          # un-mix a colour from a white background (GIMP "color to alpha")
    a = 1 - arr.min(-1)
    a = smooth(a, 0.10, 0.55)       # kill paper haze, keep solid ink
    safe = np.maximum(a, 1e-3)[..., None]
    rgb = (arr - (1 - a)[..., None]) / safe
    return np.clip(rgb, 0, 1), a

# --- Modon / ADIA: black marks -> warm white
mono('modon.jpg', 'modon.png'); mono('adia.png', 'adia.png', scale=4)

# --- Mubadala: navy wordmark -> warm white, teal globe stays teal
arr = np.asarray(load('mubadala.png', 5), np.float32) / 255
rgb, a = colour_to_alpha(arr)
teal = (arr[..., 1] - arr[..., 0] > 0.22) & (arr[..., 2] - arr[..., 0] > 0.18)   # greenish/blue-cyan, low red
teal = np.asarray(Image.fromarray((teal * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
out = np.where(teal[..., None], rgb * 255, INK)
save(crop_alpha(np.dstack([out, a * 255]), 4), 'mubadala.png')

# --- Talay: terracotta marks on green card
im = load('talay.jpg', 3); arr = np.asarray(im, np.float32) / 255
r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
a = smooth(r - g * 0.55 - 0.05, 0.22, 0.45)            # salmon is red-dominant; the green card is not
a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
col = np.array([232, 160, 128], np.float32)
save(crop_alpha(np.dstack([np.broadcast_to(col, a.shape + (3,)), a * 255]), 4), 'talay.png')

# --- Yas: vivid brush on a pale gradient
arr = np.asarray(load('yas.png', 3), np.float32) / 255
rgb, a = colour_to_alpha(arr)
save(crop_alpha(np.dstack([rgb * 255, a * 255]), 4), 'yas.png')
