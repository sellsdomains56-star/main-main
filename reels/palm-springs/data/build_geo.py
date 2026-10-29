#!/usr/bin/env python3
"""Geography for the Dubai Holding villa reel -> ../outlines.json, ../roads.json, ../geo_extra.json   ((c) OpenStreetMap contributors, ODbL)
  osm/e11_sites.geojson (from ../e11-land): Palm Jebel Ali (relation 18471743), Badrah, Hessyan 1 (relation 18471799).
  osm/palm_jumeirah.geojson: Palm Jumeirah (relation 1297972, place=island; Nominatim, 29 Oct 2026).
  osm/kezad_jafza_dwc.json (from ../kezad-ghantoot): JAFZA = Jebel Ali Free Zone North (relation 18471647), Al Maktoum International Airport (DWC).
  osm/kezad_roads.json (from ../kezad-ghantoot): E11 (route relation 19308049), both carriageways.
python3 -I build_geo.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
G = {f['properties']['name']: f['geometry'] for f in json.load(open('osm/e11_sites.geojson'))['features']}
def rings(g): return [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]
big = lambda g: max(rings(g), key=len)
rd = lambda r: [[round(a, 6), round(b, 6)] for a, b in r]
cen = lambda r: [round(sum(p[0] for p in r) / len(r), 5), round(sum(p[1] for p in r) / len(r), 5)]
PJ = json.load(open('osm/palm_jumeirah.geojson'))['features'][0]['geometry']
KZ = json.load(open('osm/kezad_jafza_dwc.json'))
outl = {'palm': rd(big(G['Palm Jebel Ali (OSM: Nakhlat Jabal Ali)'])), 'hessyan1': rd(big(G['Hessyan 1 (DLD: Hessyan First)'])),
        'badrah_t': rd(big(G['Badrah Townhouses'])), 'badrah_r': rd(big(G['Badrah Residence'])), 'jafza': KZ['jafza'], 'dwc': KZ['dwc']}
for i, r in enumerate(rings(PJ)): outl[f'pj{i}'] = rd(r)
json.dump(outl, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump(json.load(open('osm/kezad_roads.json')), open('../roads.json', 'w'), separators=(',', ':'))
pts = {k: cen(v) for k, v in outl.items()}; pts['pj'] = [55.1316, 25.1167]; pts['dwc_t'] = [55.1640, 24.8960]
json.dump({'outlines': {}, 'points': pts}, open('../geo_extra.json', 'w'), indent=1)
print({k: len(v) for k, v in outl.items()}, '\n', pts)
