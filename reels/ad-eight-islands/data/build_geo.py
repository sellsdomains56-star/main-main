#!/usr/bin/env python3
"""Geography for the eight-islands reel -> ../outlines.json, ../roads.json, ../geo_extra.json   ((c) OpenStreetMap contributors, ODbL)
  osm/outlines_hudayriyat_wadeem.json (from ../hudayriyat-wadeem): Al Reem, Al Maryah, Saadiyat, Yas, Hudayriyat.
  osm/jubail_ramhan_fahid.json (Nominatim lookup, 31 Oct 2026): Al Jubail Island (relation 13013622, main ring), Ramhan Island (way 64625960),
  Fahid Island (way 24293925, place=island "Bisrat Fahid Island"; the admin relation 13251328 is not used).
  points: island centres from Nominatim (research_macro.md).
python3 -I build_geo.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
O = json.load(open('osm/outlines_hudayriyat_wadeem.json'))
out = {k: O[k] for k in ('reem', 'maryah', 'saadiyat', 'yas', 'hud')}
for x in json.load(open('osm/jubail_ramhan_fahid.json')):
    g = x['geojson']; rings = [g['coordinates'][0]] if g['type'] == 'Polygon' else [p[0] for p in g['coordinates']]; r = max(rings, key=len)
    if len(r) > 400: r = r[::4] + [r[0]]
    key = {13013622: 'jubail', 64625960: 'ramhan', 24293925: 'fahid'}.get(x['osm_id'])
    if key: out[key] = [[round(a, 6), round(b, 6)] for a, b in r]
json.dump(out, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump({}, open('../roads.json', 'w'))
P = {'reem': [54.4109, 24.4867], 'maryah': [54.3902, 24.5022], 'saadiyat': [54.4437, 24.5460], 'yas': [54.6091, 24.4864], 'hud': [54.3476, 24.4209],
     'jubail': [54.4953, 24.5253], 'ramhan': [54.5259, 24.5357], 'fahid': [54.5485, 24.5091]}
json.dump({'outlines': {}, 'points': P}, open('../geo_extra.json', 'w'), indent=1)
print({k: len(v) for k, v in out.items()})
