"""Remove tall blank bands (empty ad slots) from a page capture and move the phrase boxes up with the content.
   python3 -I cut_blank.py assets/kt_rail.png [--min 90] [--keep 40]   (rewrites the .png and its .json in place)"""
import json, sys
from PIL import Image
import numpy as np
png = sys.argv[1]; arg = lambda k, d: int(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
MIN, KEEP = arg('--min', 90), arg('--keep', 40)
im = Image.open(png).convert('RGB'); a = np.asarray(im).astype(int)
row_blank = (a.max(axis=2).min(axis=1) >= 245) & ((a.max(axis=1) - a.min(axis=1)).max(axis=1) <= 6)   # every pixel of the row near-white and flat
bands, y = [], 0
while y < len(row_blank):
    if row_blank[y]:
        y0 = y
        while y < len(row_blank) and row_blank[y]: y += 1
        if y - y0 >= MIN: bands.append((y0 + KEEP // 2, y - KEEP // 2))
    else: y += 1
keep = np.ones(len(row_blank), bool)
for b0, b1 in bands: keep[b0:b1] = False
shift = np.cumsum(~keep)                                                    # rows removed above each row
Image.fromarray(a[keep].astype('uint8')).save(png)
meta = json.load(open(png[:-4] + '.json'))
for b in meta['boxes']:
    if 'bbox' in b: b['bbox'] = [[x, int(yy - shift[min(yy, len(shift) - 1)]), w, h] for x, yy, w, h in b['bbox']]
meta['h'] = int(keep.sum()); meta['cut'] = [list(map(int, b)) for b in bands]
json.dump(meta, open(png[:-4] + '.json', 'w'), indent=1)
print('cut', len(bands), 'bands', [b1 - b0 for b0, b1 in bands], '->', im.height, '->', meta['h'])
for b in meta['boxes']: print(b.get('phrase'), b.get('bbox'))
