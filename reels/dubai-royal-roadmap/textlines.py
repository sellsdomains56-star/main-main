"""Find text line bands / word boxes in a screenshot (to place highlight boxes).   python3 -I textlines.py <img> <y0> <y1> [x0 x1] [gap]"""
import sys
import numpy as np
from PIL import Image
im = Image.open(sys.argv[1]).convert('L'); a = np.array(im).astype(int)
y0, y1 = int(sys.argv[2]), int(sys.argv[3]); x0 = int(sys.argv[4]) if len(sys.argv) > 4 else 0; x1 = int(sys.argv[5]) if len(sys.argv) > 5 else a.shape[1]; gap = int(sys.argv[6]) if len(sys.argv) > 6 else 9
bg = np.median(a[y0:y1, x0:x1]); ink = np.abs(a[y0:y1, x0:x1] - bg) > 60
rows = ink.sum(1) > 0; bands = []; s = None
for i, r in enumerate(rows):
    if r and s is None: s = i
    if not r and s is not None: bands.append((s + y0, i + y0 - 1)); s = None
if s is not None: bands.append((s + y0, y1 - 1))
for b in bands:
    cols = ink[b[0] - y0:b[1] - y0 + 1].sum(0) > 0; words = []; ws = None; last = None
    for j, c in enumerate(cols):
        if c:
            if ws is None: ws = j
            last = j
        elif ws is not None and j - last > gap: words.append((ws + x0, last + x0)); ws = None
    if ws is not None: words.append((ws + x0, last + x0))
    print('line y=%d-%d (h=%d) words:' % (b[0], b[1], b[1] - b[0] + 1), words[:30])
