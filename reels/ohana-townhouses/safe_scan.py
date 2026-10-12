"""Safe-zone scan: graphics beats (no face, no satellite) must keep every bright pixel inside the Reels safe zone
(left/right 100 px, top 220 px, bottom 450 px).   python3 -I safe_scan.py build/frames [step]"""
import sys, glob, json
import numpy as np
from PIL import Image
d = sys.argv[1]; step = int(sys.argv[2]) if len(sys.argv) > 2 else 5
tl = json.load(open('timeline.json')); fps = 30
FACE_END, MAP = 4.7, (4.17, 7.4)               # face + map beats may legitimately reach the edges
files = sorted(glob.glob(f'{d}/f_*.png'))[::step]
bad = 0
for f in files:
    k = int(f.split('_')[-1].split('.')[0]); t = k / fps
    if t < MAP[1] or t > tl['dur'] - 0.4: continue
    a = np.asarray(Image.open(f).convert('L').resize((540, 960))).astype(int)
    mask = a > 70
    zones = {'left': mask[:, :50], 'right': mask[:, 480:], 'top': mask[:110, :], 'bottom': mask[1010 // 2 + 0:, :] if False else mask[800:, :]}
    # bottom: captions live at y~1300-1380 (px 650-690 in the half-res frame); everything below the caption zone (y > 1430) must be empty
    zones['bottom'] = mask[715:, :]
    hit = {z: int(m.sum()) for z, m in zones.items() if m.sum() > 12}
    if hit: bad += 1; print(f'{t:6.2f}s', hit)
print('scanned', len(files), 'frames,', bad, 'with content in the unsafe margins')
