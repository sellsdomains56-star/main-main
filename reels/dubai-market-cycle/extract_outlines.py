"""Outline of Palm Jumeirah (Dubai) for the closing flyover -> outlines.json.
   Coast ways come from an OpenStreetMap extract (ODbL, (c) OpenStreetMap contributors).
   python3 -I extract_outlines.py ../abu-dhabi-beyond-oil/build/map/uae.osm.pbf"""
import sys, json
import osmium
from shapely.geometry import LineString, Point, box
from shapely.ops import linemerge, polygonize, unary_union
BOX = box(55.08, 25.08, 55.22, 25.20); lines = []
class H(osmium.SimpleHandler):
    def way(self, w):
        if w.tags.get('natural') != 'coastline': return
        try: pts = [(n.lon, n.lat) for n in w.nodes if n.location.valid()]
        except Exception: return
        if len(pts) > 1:
            ls = LineString(pts)
            if ls.intersects(BOX): lines.append(ls)
H().apply_file(sys.argv[1], locations=True)
print(len(lines), 'coast ways near the Palm')
merged = linemerge(unary_union(lines)); parts = list(merged.geoms) if merged.geom_type == 'MultiLineString' else [merged]
polys = [p for p in polygonize(unary_union(parts))]
pt = Point(55.1385, 25.1124); best = None
for pg in polys:
    if pg.contains(pt) or pg.distance(pt) < 0.002: best = pg if (best is None or pg.area < best.area) else best
if best is None: sys.exit('no Palm polygon (polys: %d)' % len(polys))
pg = best.simplify(0.00004)
print('Palm polygon', len(pg.exterior.coords), 'vertices', [round(v, 4) for v in pg.bounds], 'area', round(pg.area, 6))
json.dump({'palm': [[round(x, 6), round(y, 6)] for x, y in pg.exterior.coords]}, open('outlines.json', 'w'))
