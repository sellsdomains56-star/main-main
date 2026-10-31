#!/usr/bin/env python3
"""Geography for The Heights reel -> ../roads.json, ../geo_extra.json   ((c) OpenStreetMap contributors, ODbL)
  osm/roads_e11_e311_e611.json (from ../office-launches): E11, E311, E611, both carriageways.
  osm/expo_road_nominatim.json: every OSM way named "Expo Road" (Nominatim search, 31 Oct 2026); the trunk ways are E77.  They are short pieces of
  both carriageways, so the centreline is rebuilt by averaging their points in 0.0025-degree longitude bins (the road runs west -> east).
python3 -I build_geo.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
R = json.load(open('osm/roads_e11_e311_e611.json'))
pts = []
for x in json.load(open('osm/expo_road_nominatim.json')):
    if x['type'] != 'trunk': continue
    g = x['geom']; parts = [g['coordinates']] if g['type'] == 'LineString' else g['coordinates']
    pts += [p for part in parts for p in part if 55.0 < p[0] < 55.5 and 24.85 < p[1] < 25.1]
B = {}
for lo, la in pts: B.setdefault(int((lo - 55.0) / 0.0025), []).append((lo, la))
line = [[sum(p[0] for p in v) / len(v), sum(p[1] for p in v) / len(v)] for k, v in sorted(B.items())]
sm = [line[0]] + [[(line[i - 1][j] + line[i][j] + line[i + 1][j]) / 3 for j in (0, 1)] for i in range(1, len(line) - 1)] + [line[-1]]
R['E77'] = [[[round(a, 6), round(b, 6)] for a, b in sm]]
json.dump(R, open('../roads.json', 'w'), separators=(',', ':'))
P = {'site': [55.234, 24.954],                       # E611 x E77 interchange (OSM geometry); the community sits at this junction, its boundary is not published
     'expo': [55.1488, 24.9626], 'dwc_t': [55.1592, 24.8864], 'hills': [55.2393, 25.1023], 'downtown': [55.2744, 25.1972]}
json.dump({'outlines': {}, 'points': P}, open('../geo_extra.json', 'w'), indent=1)
print('E77', len(sm), 'points', sm[0], sm[-1])
