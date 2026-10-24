#!/usr/bin/env python3
"""Nominatim polygons/points (data (c) OpenStreetMap contributors, ODbL) -> osm/nom.json.  python3 -I nominatim_dubai.py"""
import json, time, urllib.request, urllib.parse, sys
UA = {'User-Agent': 'dubai-reel-research/1.0 (contact: sellsdomains56@gmail.com)'}
Q = sys.argv[1:] or ['Mira Oasis', 'Mira Oasis 1', 'Reem, Dubai', 'Al Yalayis 1', 'اليلايس 1', 'Mira, Reem', 'Dubai Silicon Oasis', 'Dubai International Academic City', 'Academic City, Dubai', 'Arabian Ranches 3', 'Dubai International Financial Centre', 'Burj Khalifa', 'Business Bay']
out = {}
for q in Q:
    u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'jsonv2', 'polygon_geojson': 1, 'limit': 5, 'viewbox': '55.0,25.35,55.6,24.85', 'bounded': 1})
    try: r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40))
    except Exception as e: r = []; print('ERR', q, e)
    out[q] = r
    for x in r: print(q, '|', x['osm_type'], x['osm_id'], x.get('type'), x['geojson']['type'], round(float(x['lon']), 4), round(float(x['lat']), 4), x['display_name'][:60])
    time.sleep(1.2)
json.dump(out, open('osm/nom.json', 'w'))
