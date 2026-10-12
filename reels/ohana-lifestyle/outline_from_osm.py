"""Add an animated outline (island / district / plot) for the satellite scenes: a polygon from OpenStreetMap (Nominatim), simplified, appended to ./outlines.json.
   python3 -I outline_from_osm.py yas "Yas Island, Abu Dhabi" [tolerance_deg=0.00004]
   Use it in scenes.js as  outlines: [{ key: 'yas', t0, t1 }]   (OUTLINES.yas is loaded by main.js).   Data (c) OpenStreetMap contributors, ODbL - credit it in the README."""
import sys, json, os, urllib.request, urllib.parse
key, q = sys.argv[1], sys.argv[2]; tol = float(sys.argv[3]) if len(sys.argv) > 3 else 0.00004
url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'json', 'polygon_geojson': 1, 'limit': 5, 'polygon_threshold': 0.00002})
res = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'reel-studio/1.0'}), timeout=40))
def dp(pts, eps):                                                   # Douglas-Peucker
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]; dx, dy = x2 - x1, y2 - y1; n = (dx * dx + dy * dy) ** 0.5 or 1e-12
    d, i = max(((abs(dy * (p[0] - x1) - dx * (p[1] - y1)) / n), i) for i, p in enumerate(pts[1:-1], 1))
    return dp(pts[:i + 1], eps)[:-1] + dp(pts[i:], eps) if d > eps else [pts[0], pts[-1]]
best = None
for r in res:
    g = r.get('geojson')
    if g and g['type'] in ('Polygon', 'MultiPolygon'):
        polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        ring = max((p[0] for p in polys), key=len); print('candidate:', r['display_name'][:80], len(ring), 'vertices')
        if best is None: best = ring
if best is None: sys.exit('no polygon found for ' + q + ' (try a more specific query)')
pts = [tuple(p) for p in best]
if pts[0] == pts[-1]:                                              # a closed ring: simplify the two halves separately (a zero-length chord breaks Douglas-Peucker)
    m = len(pts) // 2; pts = dp(pts[:m + 1], tol)[:-1] + dp(pts[m:], tol)
else: pts = dp(pts, tol)
ring = [[round(x, 6), round(y, 6)] for x, y in pts]
out = json.load(open('outlines.json')) if os.path.exists('outlines.json') else {}
out[key] = ring; json.dump(out, open('outlines.json', 'w')); print('outlines.json:', key, len(ring), 'vertices')
