#!/usr/bin/env python3
"""QA image: roads.json + outlines.json drawn over the Esri imagery (zoom Z) so the geometry can be checked by eye. python3 -I check_map.py OUT.png [Z] [lon0 lat0 lon1 lat1]"""
import json, math, os, sys, subprocess
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; Z = int(sys.argv[2]) if len(sys.argv) > 2 else 11
lon0, lat0, lon1, lat1 = (float(v) for v in sys.argv[3:7]) if len(sys.argv) > 6 else (54.55, 24.55, 55.25, 25.10)
def px(lon, lat): s = 256 * 2 ** Z; return (lon + 180) / 360 * s, (1 - math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) / math.pi) / 2 * s
x0, y1 = px(lon0, lat0); x1, y0 = px(lon1, lat1)
tx0, tx1, ty0, ty1 = int(x0 // 256), int(x1 // 256), int(y0 // 256), int(y1 // 256)
W, H = (tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256; img = Image.new('RGB', (W, H), (20, 20, 20))
for tx in range(tx0, tx1 + 1):
    for ty in range(ty0, ty1 + 1):
        f = f'../build/tiles/{Z}/{tx}/{ty}.jpg'
        if not os.path.exists(f):
            os.makedirs(os.path.dirname(f), exist_ok=True)
            subprocess.run(['curl', '-sS', '-f', '-m', '40', '-o', f, f'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{Z}/{ty}/{tx}'])
        if os.path.exists(f): img.paste(Image.open(f).convert('RGB'), ((tx - tx0) * 256, (ty - ty0) * 256))
d = ImageDraw.Draw(img, 'RGBA'); P = lambda p: (px(*p)[0] - tx0 * 256, px(*p)[1] - ty0 * 256)
font = ImageFont.truetype('../fonts/Inter-Bold.otf', 22) if os.path.exists('../fonts/Inter-Bold.otf') else None
col = {'E11': (255, 90, 90), 'E311': (255, 200, 60), 'E611': (90, 200, 255)}
for ref, ls in json.load(open('../roads.json')).items():
    for l in ls: d.line([P(p) for p in l], fill=col[ref] + (255,), width=3)
    d.text(P(ls[0][len(ls[0]) // 2]), ref, fill=col[ref], font=font)
for name, o in json.load(open('../outlines.json')).items():
    rings = o if isinstance(o, list) else o.get('rings') or o.get('coords') or []
    try:
        for r in (rings if rings and isinstance(rings[0][0], list) else [rings]): d.line([P(p) for p in r] + [P(r[0])], fill=(255, 255, 255, 230), width=2)
        c = rings[0][0] if isinstance(rings[0][0], list) else rings[0]; d.text(P(c), name, fill=(255, 255, 255), font=font)
    except Exception as e: print('outline', name, e)
G = json.load(open('../geo_extra.json'))
for k, c in (('band2', (255, 176, 32, 70)), ('band3', (47, 216, 181, 70))):
    if k in G.get('bands', {}): d.polygon([P(p) for p in G['bands'][k]], fill=c)
d.line([P(p) for p in G['metro_red1']], fill=(230, 40, 90, 255), width=3)
for st in G['stations']: x, y = P((st['lon'], st['lat'])); d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(255, 255, 255, 255))
for k, r in G['outlines'].items(): d.line([P(p) for p in r] + [P(r[0])], fill=(120, 255, 160, 230), width=2); d.text(P(r[0]), k, fill=(120, 255, 160), font=font)
for k, p in G['points'].items(): x, y = P(p); d.ellipse((x - 6, y - 6, x + 6, y + 6), outline=(255, 255, 0, 255), width=3); d.text((x + 8, y - 8), k, fill=(255, 255, 0), font=font)
img.crop((int(x0 - tx0 * 256), int(y0 - ty0 * 256), int(x1 - tx0 * 256), int(y1 - ty0 * 256))).save(out); print(out, img.size)
