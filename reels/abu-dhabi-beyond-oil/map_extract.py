"""Build the reel's vector map from an OpenStreetMap extract (ODbL, (c) OpenStreetMap contributors).
   python3 -I map_extract.py build/map/uae.osm.pbf      -> build/map/map.json
   * land polygons (coastline polygonised; OSM coastline has land on its left)  -> two levels of detail
   * main roads (motorway/trunk/primary) for the city area"""
import sys, json, math, time
import osmium
from shapely.geometry import LineString, Polygon, MultiPolygon, Point, box
from shapely.ops import unary_union, polygonize
from shapely.strtree import STRtree

PBF = sys.argv[1]; OUT = sys.argv[2] if len(sys.argv) > 2 else 'build/map/map.json'
WIDE = box(52.2, 22.4, 56.0, 26.4)           # Abu Dhabi emirate view
CITY = box(54.08, 24.22, 54.86, 24.72)       # city + islands, full detail
coast, roads = [], []
ROAD = {'motorway', 'trunk', 'primary', 'motorway_link', 'trunk_link'}

class H(osmium.SimpleHandler):
    def way(self, w):
        t = w.tags; nat = t.get('natural'); hw = t.get('highway')
        if nat == 'coastline' or hw in ROAD:
            try: pts = [(n.lon, n.lat) for n in w.nodes if n.location.valid()]
            except Exception: return
            if len(pts) < 2: return
            ls = LineString(pts)
            if nat == 'coastline':
                if ls.intersects(WIDE): coast.append(ls)
            elif ls.intersects(CITY): roads.append((hw, ls))
t0 = time.time(); H().apply_file(PBF, locations=True); print('read', len(coast), 'coastline ways,', len(roads), 'roads in', round(time.time() - t0, 1), 's', flush=True)

# --- polygonise: clip coastline to the region, node it with the region border, classify faces by the "land on the left" rule
pieces = []
for ls in coast:
    g = ls.intersection(WIDE)
    for p in ([g] if g.geom_type == 'LineString' else list(getattr(g, 'geoms', []))):
        if p.geom_type == 'LineString' and p.length > 0: pieces.append(p)
noded = unary_union(pieces + [WIDE.boundary])
faces = list(polygonize(noded)); print('faces', len(faces), flush=True)
tree = STRtree(faces); land_votes = [0] * len(faces); water_votes = [0] * len(faces)
EPS = 2e-5
for p in pieces:
    c = list(p.coords)
    step = max(1, len(c) // 12)
    for i in range(0, len(c) - 1, step):
        (x1, y1), (x2, y2) = c[i], c[i + 1]
        dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy)
        if L == 0: continue
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2; nx, ny = -dy / L, dx / L      # left normal
        for sign, votes in ((1, land_votes), (-1, water_votes)):
            pt = Point(mx + sign * nx * EPS, my + sign * ny * EPS)
            for idx in tree.query(pt):
                if faces[idx].contains(pt): votes[idx] += 1; break
land = [f for i, f in enumerate(faces) if land_votes[i] > water_votes[i]]
print('land faces', len(land), 'of', len(faces), flush=True)
land_u = unary_union(land)

def polys(g):
    if g.is_empty: return []
    return [g] if g.geom_type == 'Polygon' else [p for p in g.geoms if p.geom_type == 'Polygon']
def ring(r, nd=5): return [[round(x, nd), round(y, nd)] for x, y in r.coords]
def export(g, tol, minarea, nd=5):
    out = []
    for p in polys(g.simplify(tol, preserve_topology=True)):
        if p.area < minarea: continue
        out.append([ring(p.exterior, nd)] + [ring(h, nd) for h in p.interiors if Polygon(h).area > minarea])
    return out
coarse = export(land_u, 0.0015, 2e-6, 4)                          # whole emirate, ~150 m detail
fine = export(land_u.intersection(CITY), 0.00005, 1.2e-6, 5)       # the city, ~5 m detail; tiny flats/mangroves dropped
road_out = {}
for hw, ls in roads:
    g = ls.intersection(CITY)
    for p in ([g] if g.geom_type == 'LineString' else list(getattr(g, 'geoms', []))):
        if p.geom_type == 'LineString' and p.length > 0:
            key = 'major' if hw in ('motorway', 'trunk', 'motorway_link', 'trunk_link') else 'minor'
            road_out.setdefault(key, []).append([[round(x, 5), round(y, 5)] for x, y in p.simplify(0.00006).coords])
json.dump({'coarse': coarse, 'fine': fine, 'roads': road_out}, open(OUT, 'w'), separators=(',', ':'))
npts = lambda ps: sum(len(r) for p in ps for r in p)
print('wrote', OUT, '| coarse polys', len(coarse), npts(coarse), 'pts | fine polys', len(fine), npts(fine), 'pts | roads', {k: len(v) for k, v in road_out.items()})
