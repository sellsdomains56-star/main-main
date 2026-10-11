"""Island outlines for the places the video names -> outlines.json (animated lines over the satellite imagery).
   Land polygons come from the OpenStreetMap coast extract of the Abu Dhabi reel (ODbL, (c) OpenStreetMap contributors).
   python3 -I extract_outlines.py ../abu-dhabi-beyond-oil/build/map/map.json"""
import json, sys
from shapely.geometry import Polygon, Point
d = json.load(open(sys.argv[1]))
want = {'mubadala': (54.3902, 24.5021, 0.0), 'reem': (54.4047, 24.4977, 0.00003)}       # key -> lon, lat, simplify tolerance (deg)
out = {}
for k, (lon, lat, tol) in want.items():
    pt = Point(lon, lat); best = None
    for poly in d['fine']:
        ring = poly[0]
        if len(ring) < 4: continue
        pg = Polygon(ring)
        if pg.is_valid and pg.contains(pt): best = pg
    if best is None: print('no polygon for', k); continue
    pg = best.simplify(tol) if tol else best
    out[k] = [[round(x, 6), round(y, 6)] for x, y in pg.exterior.coords]; print(k, len(out[k]), 'vertices', [round(v, 4) for v in pg.bounds])
json.dump(out, open('outlines.json', 'w'))
