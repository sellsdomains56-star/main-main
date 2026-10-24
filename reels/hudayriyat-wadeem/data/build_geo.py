#!/usr/bin/env python3
"""Geography for the Hudayriyat / Wadeem Gardens reel -> ../outlines.json, ../roads.json, ../geo_extra.json   (all (c) OpenStreetMap contributors, ODbL)
  outlines (Nominatim polygons in osm/nom_islands.json): Hudayriyat Island (relation 12743928, 48.9 km2 in OSM; Modon's masterplan = 51 km2),
            Yas Island (relation 2535665), Saadiyat Island (relation 9518900, main island), Al Reem Island (way 873221106), Al Maryah Island (way 873221062),
            Al Bateen (administrative relation 13251348; Wadeem sits "opposite Abu Dhabi's Al Bateen area", WAM 1 Jul 2025),
            Palm Jumeirah (from ../dubai-five-zones/outlines.json, used only as a small silhouette icon, not to scale)
  points:   ADGM (Abu Dhabi Global Market building, way 218681130), Yas Island centre, Hudayriyat bridge landing
python3 -I build_geo.py"""
import json, math
N = json.load(open('osm/nom_islands.json'))
def ring(q, osm_id):
    for x in N.get(q, []):
        if x['osm_id'] == osm_id:
            g = x['geojson']; return g['coordinates'][0] if g['type'] == 'Polygon' else max((p[0] for p in g['coordinates']), key=len)
    raise SystemExit(f'missing {q} {osm_id}')
R = 6371000.0
def m(a, b): x = math.radians(b[0] - a[0]) * math.cos(math.radians((a[1] + b[1]) / 2)); y = math.radians(b[1] - a[1]); return R * math.hypot(x, y)
def simplify(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dmax, idx = 0, 0; ab = m(a, b)
    for i in range(1, len(pts) - 1):
        p = pts[i]; ap, bp = m(a, p), m(b, p)
        d = ap if ab == 0 else abs(ap ** 2 - ((ap ** 2 + ab ** 2 - bp ** 2) / (2 * ab)) ** 2) ** 0.5
        if d > dmax: dmax, idx = d, i
    return [a, b] if dmax <= tol else simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)
def rd(r, tol=15):
    if r[0] == r[-1]: h = len(r) // 2; s = simplify(r[:h + 1], tol)[:-1] + simplify(r[h:], tol)   # closed ring: simplify the two halves
    else: s = simplify(r, tol)
    return [[round(p[0], 6), round(p[1], 6)] for p in s]
F5 = json.load(open('../../dubai-five-zones/outlines.json'))
outl = {'hud': rd(ring('جزيرة الحديريات', 12743928)), 'yas': rd(ring('Yas Island', 2535665)), 'saadiyat': rd(ring('Saadiyat Island', 9518900)),
        'reem': rd(ring('Al Reem Island', 873221106)), 'maryah': rd(ring('Al Maryah Island', 873221062)), 'bateen': rd(ring('Al Bateen, Abu Dhabi', 13251348)), 'palm': F5['palm']}
json.dump(outl, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump({}, open('../roads.json', 'w'))
pts = {'adgm': [54.3885, 24.5013], 'yas_c': [54.603, 24.488], 'bridge': [54.354, 24.4245], 'wadeem': [54.352, 24.428], 'abu_dhabi': [54.37, 24.47], 'dubai_dir': [54.62, 24.62]}
json.dump({'points': pts, 'outlines': {}}, open('../geo_extra.json', 'w'), indent=1)
print({k: len(v) for k, v in outl.items()})
