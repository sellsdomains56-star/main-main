#!/usr/bin/env python3
"""Nominatim lookups for the rail reel -> osm/nom_rail.json (data (c) OpenStreetMap contributors, ODbL).  python3 -I nominatim_rail.py"""
import json, time, urllib.request, urllib.parse
UA = {'User-Agent': 'dubai-reel-research/1.0 (contact: sellsdomains56@gmail.com)'}
Q = ['Al Yalayis Station', 'Etihad Rail Dubai Station', 'Mohamed bin Zayed City Station', 'Etihad Rail station Abu Dhabi', 'Etihad Rail', 'قطار الاتحاد', 'Jumeirah Golf Estates', 'Mohamed Bin Zayed City', 'Al Jaddaf', 'Al Faya station', 'Etihad Rail passenger station']
out = {}
for q in Q:
    u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'jsonv2', 'polygon_geojson': 1, 'limit': 8, 'viewbox': '54.2,25.4,55.6,24.2', 'bounded': 1, 'dedupe': 0})
    try: r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40))
    except Exception as e: r = []; print('ERR', q, e)
    out[q] = r
    for x in r: print(q, '|', x['osm_type'], x['osm_id'], x.get('category'), x.get('type'), x['geojson']['type'], round(float(x['lon']), 4), round(float(x['lat']), 4), x['display_name'][:70])
    time.sleep(1.2)
json.dump(out, open('osm/nom_rail.json', 'w'))
