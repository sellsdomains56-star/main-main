"""Island outlines (from the OpenStreetMap coast polygons in build/map/map.json) for the places the video names -> outlines.json.
   They are drawn as animated lines over the satellite imagery.   python3 -I extract_outlines.py"""
import json
from shapely.geometry import Polygon, Point
d = json.load(open('build/map/map.json')); P = json.load(open('places.json'))
want = {'mubadala': 0.0, 'talay': 0.00003, 'yas': 0.00003, 'hudayriyat': 0.00003}      # key -> simplify tolerance (deg)
out = {}
for k, tol in want.items():
    pt = Point(P[k]['lon'], P[k]['lat']); best = None
    for poly in d['fine']:
        ring = poly[0]
        if len(ring) < 4: continue
        pg = Polygon(ring)
        if pg.is_valid and pg.contains(pt): best = pg
    if best is None: print('no polygon for', k); continue
    pg = best.simplify(tol) if tol else best
    pts = [[round(x, 6), round(y, 6)] for x, y in pg.exterior.coords]
    out[k] = pts; print(k, len(pts), 'vertices', [round(v, 4) for v in pg.bounds])
json.dump(out, open('outlines.json', 'w'))
