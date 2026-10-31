#!/usr/bin/env python3
"""Geography for the Palm Jumeirah five-addresses reel -> ../outlines.json, ../roads.json, ../geo_extra.json   ((c) OpenStreetMap contributors, ODbL)
  osm/palm_jumeirah.geojson (from ../dh-villa-pja): Palm Jumeirah (relation 1297972, place=island), all rings.
  points: Atlantis The Royal (OSM way 1465036747), Serenia Living (way 682208134), Six Senses Residences (way 1112508838), AVA (way 1112521297),
  Atlantis The Palm (reference).  ORLA is not in OSM; listing pins fall inside Serenia's footprint, so its pin is set a little towards the crescent
  apex (approximate, labelled as such on screen).
python3 -I build_geo.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
g = json.load(open('osm/palm_jumeirah.geojson'))['features'][0]['geometry']
rings = [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]
json.dump({f'pj{i}': [[round(a, 6), round(b, 6)] for a, b in r] for i, r in enumerate(rings)}, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump({}, open('../roads.json', 'w'))
P = {'royal': [55.1273, 25.1378], 'serenia': [55.1123, 25.1241], 'orla': [55.1148, 25.1266], 'sixsenses': [55.1166, 25.1012], 'ava': [55.1508, 25.1032], 'atlantis': [55.1171, 25.1304]}
json.dump({'outlines': {}, 'points': P}, open('../geo_extra.json', 'w'), indent=1)
print(len(rings), 'rings', [len(r) for r in rings])
