#!/usr/bin/env python3
"""Nominatim polygons for the Hudayriyat reel -> osm/nom_islands.json  (data (c) OpenStreetMap contributors, ODbL)
python3 -I nominatim_islands.py"""
import json, time, urllib.request, urllib.parse
UA = {'User-Agent': 'dubai-reel-research/1.0 (contact: sellsdomains56@gmail.com)'}
Q = ['Hudayriyat Island', 'جزيرة الحديريات', 'Yas Island', 'Saadiyat Island', 'Al Reem Island', 'Al Maryah Island', 'Abu Dhabi Global Market', 'Wadeem', 'Al Bateen, Abu Dhabi',
     'Hudayriyat Bridge', 'Surf Abu Dhabi', 'Velodrome Abu Dhabi', 'Marsana', 'Bab Al Nojoum Hudayriyat', 'Abu Dhabi Island', 'Al Maryah Island ADGM Square']
out = {}
for q in Q:
    u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'jsonv2', 'polygon_geojson': 1, 'limit': 6, 'viewbox': '54.20,24.75,54.75,24.25', 'bounded': 1})
    try: r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40))
    except Exception as e: r = []; print('ERR', q, e)
    out[q] = r
    for x in r: print(q, '|', x['osm_type'], x['osm_id'], x.get('category'), x.get('type'), x['geojson']['type'], round(float(x['lon']), 4), round(float(x['lat']), 4), x['display_name'][:70])
    time.sleep(1.2)
json.dump(out, open('osm/nom_islands.json', 'w'))
