"""Safe-zone scan: every bright pixel of the graphics beats must sit inside the Reels safe zone (right 100 px, top 220 px, bottom 450 px; left taken as 70 px).
   python3 -I safe_scan.py build/frames [step] [--skip 0-4.7,4.2-7.4]     (--skip: face / satellite beats, which may run edge to edge)
   Slide-ins of one or two frames at a scene start and the gold cut sweep are fine; anything that sits for a while is a bug (shrink the card / text)."""
import sys, glob, json
import numpy as np
from PIL import Image
SKIP = []
if '--skip' in sys.argv:
    i = sys.argv.index('--skip'); SKIP = [tuple(map(float, r.split('-'))) for r in sys.argv[i + 1].split(',')]; del sys.argv[i:i + 2]
d = sys.argv[1]; step = int(sys.argv[2]) if len(sys.argv) > 2 else 5
tl = json.load(open('timeline.json')); fps = 30
files = sorted(glob.glob(f'{d}/f_*.png'))[::step]
bad = 0
for f in files:
    k = int(f.split('_')[-1].split('.')[0]); t = k / fps
    if t > tl['dur'] - 0.4 or any(a <= t <= b for a, b in SKIP): continue
    a = np.asarray(Image.open(f).convert('L').resize((540, 960))).astype(int)
    mask = a > 70
    zones = {'left': mask[:, :35], 'right': mask[:, 490:], 'top': mask[:110, :], 'bottom': mask[800:, :]}      # the user's zone: right 100 px, top 220 px, bottom 450 px (left taken as 70 px)
    # bottom: captions live at y~1300-1380 (px 650-690 in the half-res frame); everything below the caption zone (y > 1430) must be empty
    zones['bottom'] = mask[735:, :]
    hit = {z: int(m.sum()) for z, m in zones.items() if m.sum() > 12}
    if hit: bad += 1; print(f'{t:6.2f}s', hit)
print('scanned', len(files), 'frames,', bad, 'with content in the unsafe margins')
