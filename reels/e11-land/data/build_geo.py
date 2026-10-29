#!/usr/bin/env python3
"""Geography for the Sheikh Zayed Road land reel -> ../outlines.json, ../roads.json, ../geo_extra.json   ((c) OpenStreetMap contributors, ODbL)
  osm/e11_sites.geojson (research 29 Oct 2026): Jebel Ali Racecourse (way 207011276), Badrah (ways 477075454 + 435884077), Hessyan 1 (relation 18471799),
  Palm Jebel Ali (relation 18471743), Palm Cove Canal water (relation 7779043) + NE arm (way 415405239), Sheikh Zayed Road (E11, simplified centreline).
python3 -I build_geo.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
G = {f['properties']['name']: f['geometry'] for f in json.load(open('osm/e11_sites.geojson'))['features']}
def rings(name):
    g = G[name]; return [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]
big = lambda name: max(rings(name), key=len)
rd = lambda r: [[round(a, 6), round(b, 6)] for a, b in r]
cen = lambda r: [round(sum(p[0] for p in r) / len(r), 5), round(sum(p[1] for p in r) / len(r), 5)]
outl = {'race': rd(big('Jebel Ali Racecourse')), 'badrah_t': rd(big('Badrah Townhouses')), 'badrah_r': rd(big('Badrah Residence')), 'hessyan1': rd(big('Hessyan 1 (DLD: Hessyan First)')),
        'palm': rd(big('Palm Jebel Ali (OSM: Nakhlat Jabal Ali)')), 'canal': rd(big('Palm Cove Canal water body (unnamed natural=water)')), 'canal_ne': rd(big('Palm Cove Canal NE arm (water=canal)'))}
json.dump(outl, open('../outlines.json', 'w'), separators=(',', ':'))
e11 = [k for k in G if k.startswith('Sheikh Zayed Road')][0]
json.dump({'E11': [rd(G[e11]['coordinates'])]}, open('../roads.json', 'w'), separators=(',', ':'))
pts = {k: cen(v) for k, v in outl.items()}; pts['race'] = [55.18983, 25.08349]; pts['jafza'] = [55.068, 24.99]
json.dump({'outlines': {}, 'points': pts}, open('../geo_extra.json', 'w'), indent=1)
print({k: len(v) for k, v in outl.items()}, '\n', pts)
