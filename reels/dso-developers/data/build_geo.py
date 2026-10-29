#!/usr/bin/env python3
"""Geography for the Silicon Oasis developers reel -> ../outlines.json, ../roads.json, ../geo_extra.json   (all (c) OpenStreetMap contributors, ODbL)
  osm/lookup.json (Nominatim lookup by id): Dubai Silicon Oasis (way 364819827), Dubai Academic City (relation 18471831), Al Ruwayyah 1 (relation 18471643),
  Nadd Al Sheba 3 / 4 (relations 18471747 / 18471836); roads E311 / E611 from ../../dubai-five-zones.   python3 -I build_geo.py"""
import json
L = json.load(open('osm/lookup.json')); by = {(x['osm_type'][0], x['osm_id']): x for x in L}
def ring(t, i):
    g = by[(t, i)]['geojson']; return g['coordinates'][0] if g['type'] == 'Polygon' else max((p[0] for p in g['coordinates']), key=len)
rd = lambda r: [[round(a, 6), round(b, 6)] for a, b in r]
cen = lambda r: [round(sum(p[0] for p in r) / len(r), 5), round(sum(p[1] for p in r) / len(r), 5)]
outl = {'dso': rd(ring('w', 364819827)), 'academic': rd(ring('r', 18471831)), 'ruwayyah1': rd(ring('r', 18471643)), 'nas3': rd(ring('r', 18471747)), 'nas4': rd(ring('r', 18471836))}
json.dump(outl, open('../outlines.json', 'w'), separators=(',', ':'))
roads = json.load(open('../../dubai-five-zones/roads.json')); json.dump({k: roads[k] for k in ('E311', 'E611')}, open('../roads.json', 'w'), separators=(',', ':'))
pts = {k: cen(v) for k, v in outl.items()}
json.dump({'outlines': {}, 'points': pts}, open('../geo_extra.json', 'w'), indent=1)
print('outlines', {k: len(v) for k, v in outl.items()}, '\npoints', pts)
