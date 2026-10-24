#!/usr/bin/env python3
"""Geography for the Ellington vs Aldar reel -> ../outlines.json, ../roads.json, ../geo_extra.json   (all (c) OpenStreetMap contributors, ODbL)
  roads:    E311 / E611 (../dubai-five-zones/roads.json)
  outlines: Mira Oasis (way 566134543), Al Yalayis 1 (administrative relation 18471697) - osm/nom.json;
            Dubai Silicon Oasis, Academic City and the Metro Blue Line alignment (../aldar-dso-reel/outlines.json, built from OSM there)
  points:   Ellington = "near Mira Oasis, off E611" (Al Yalayis 1; no published boundary), Aldar = between DSO and Academic City ("opposite Academic City")
python3 -I build_geo.py"""
import json, math
N = json.load(open('osm/nom.json')); A = json.load(open('../../aldar-dso-reel/outlines.json')); R5 = json.load(open('../../dubai-five-zones/roads.json'))
def ring(q, oid):
    x = [x for x in N[q] if x['osm_id'] == oid][0]['geojson']; return x['coordinates'][0] if x['type'] == 'Polygon' else max((p[0] for p in x['coordinates']), key=len)
rd = lambda r: [[round(a, 6), round(b, 6)] for a, b in r]
outl = {'mira': rd(ring('Mira Oasis', 566134543)), 'yalayis1': rd(ring('Al Yalayis 1', 18471697)), 'dso': A['dso'], 'academic': A['academic'], 'blue_main': A['blue_main'], 'blue_branch': A['blue_branch']}
json.dump(outl, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump({'E311': R5['E311'], 'E611': R5['E611']}, open('../roads.json', 'w'), separators=(',', ':'))
cen = lambda r: [sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r)]
# where E611 passes Mira Oasis (nearest E611 vertex to the Mira centroid)
mc = cen(outl['mira']); e611 = [p for run in (R5['E611'] if isinstance(R5['E611'][0][0], list) else [R5['E611']]) for p in run]
near = min(e611, key=lambda p: (p[0] - mc[0]) ** 2 + (p[1] - mc[1]) ** 2)
print('mira centroid', [round(v, 4) for v in mc], 'nearest E611 point', [round(v, 4) for v in near], 'km', round(math.hypot((near[0] - mc[0]) * 101, (near[1] - mc[1]) * 111), 2))
json.dump({'outlines': {}, 'points': {'ellington': [round(mc[0], 5), round(mc[1], 5)], 'aldar': [55.401, 25.122], 'e611_mira': [round(near[0], 5), round(near[1], 5)]}}, open('../geo_extra.json', 'w'), indent=1)
