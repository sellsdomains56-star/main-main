#!/usr/bin/env python3
"""Nominatim polygons/points (data (c) OpenStreetMap contributors, ODbL) -> osm/nom.json.  python3 -I nominatim_dubai.py"""
import json, time, urllib.request, urllib.parse, sys
UA = {'User-Agent': 'dubai-reel-research/1.0 (contact: sellsdomains56@gmail.com)'}
Q = sys.argv[1:] or ['Expo City Dubai', 'Dubai Exhibition Centre', 'Al Maktoum International Airport', 'Dubai World Central', 'Expo 2020 Dubai']
out = {}
for q in Q:
    u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'jsonv2', 'polygon_geojson': 1, 'limit': 5, 'viewbox': '54.95,25.1,55.35,24.75', 'bounded': 1})
    try: r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40))
    except Exception as e: r = []; print('ERR', q, e)
    out[q] = r
    for x in r: print(q, '|', x['osm_type'], x['osm_id'], x.get('type'), x['geojson']['type'], round(float(x['lon']), 4), round(float(x['lat']), 4), x['display_name'][:60])
    time.sleep(1.2)
json.dump(out, open('osm/nom.json', 'w'))
