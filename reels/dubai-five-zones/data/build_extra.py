#!/usr/bin/env python3
"""Extra OSM geometry for the map beats -> ../geo_extra.json
  metro_red1: Dubai Metro Red Line (Centrepoint -> Expo City Dubai), OSM relation 420297, member ways joined in route order, + its stations
  outlines:   Dubai Land (OSM way 1147909867, place=suburb), Dubai International Airport (OSM way 1429712446, aerodrome)
  points:     landmark positions from Nominatim (Burj Khalifa, Burj Al Arab, Jebel Ali Port, Dubai South, Palm Jebel Ali = Bayut community centre)
python3 -I build_extra.py"""
import json, math
R = json.load(open('osm/red1_full.json'))['elements']
nodes = {e['id']: e for e in R if e['type'] == 'node'}; ways = {e['id']: e for e in R if e['type'] == 'way'}
rel = [e for e in R if e['type'] == 'relation' and e['id'] == 420297][0]
track = []
for m in rel['members']:
    if m['type'] != 'way' or m['role'] not in ('', 'route'): continue
    pts = [[nodes[n]['lon'], nodes[n]['lat']] for n in ways[m['ref']]['nodes'] if n in nodes]
    if not pts: continue
    if track:
        d = lambda a, b: math.hypot(a[0] - b[0], a[1] - b[1])
        if d(track[-1], pts[-1]) < d(track[-1], pts[0]): pts = pts[::-1]                 # orient each way to continue the line
        if not track or d(track[-1], pts[0]) < 1e-9: pts = pts[1:]
    track += pts
stations = []
for m in rel['members']:
    if m['type'] == 'node' and m['role'].startswith('stop') and m['ref'] in nodes:
        n = nodes[m['ref']]; t = n.get('tags', {}); stations.append({'name': t.get('name:en') or t.get('name'), 'lon': n['lon'], 'lat': n['lat']})
X = json.load(open('osm/extra_polys.json'))
outl = {}
for x in X:
    g = x['geojson']; ring = g['coordinates'][0] if g['type'] == 'Polygon' else max((p[0] for p in g['coordinates']), key=len)
    key = {1147909867: 'dland', 1429712446: 'dxb'}[x['osm_id']]; outl[key] = [[round(p[0], 6), round(p[1], 6)] for p in ring]
points = {'burj_khalifa': [55.27413, 25.19703], 'burj_al_arab': [55.18539, 25.14132], 'jebel_ali_port': [55.05988, 24.98045], 'dubai_south': [55.16151, 24.91443], 'palm_jebel_ali': [54.988, 25.0]}
json.dump({'metro_red1': [[round(p[0], 6), round(p[1], 6)] for p in track], 'stations': stations, 'outlines': outl, 'points': points}, open('../geo_extra.json', 'w'), separators=(',', ':'))
print('red1', len(track), 'pts; first', track[0], 'last', track[-1], '; stations', len(stations), [s['name'] for s in stations][:4], '...', [s['name'] for s in stations][-3:])
print({k: len(v) for k, v in outl.items()})
