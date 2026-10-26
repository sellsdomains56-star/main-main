#!/usr/bin/env python3
"""Geography for the DIFC China banks reel -> ../outlines.json, ../roads.json, ../geo_extra.json   (all (c) OpenStreetMap contributors, ODbL)
  roads:    E11 / Sheikh Zayed Road (from ../dubai-five-zones/roads.json, built from OSM there)
  outlines: Downtown Dubai, Business Bay (../dubai-five-zones/outlines.json), DIFC (administrative relation 18471688, osm/nom_dubai.json)
  points:   Burj Khalifa, Dubai Metro Red Line + stations (five-zones)
python3 -I build_geo.py"""
import json
F5o = json.load(open('../../dubai-five-zones/outlines.json')); F5r = json.load(open('../../dubai-five-zones/roads.json')); F5x = json.load(open('../../dubai-five-zones/geo_extra.json'))
N = json.load(open('osm/nom_dubai.json'))
difc = [x for x in N['Dubai International Financial Centre'] if x['osm_id'] == 18471688][0]['geojson']['coordinates'][0]
json.dump({'downtown': F5o['downtown'], 'bbay': F5o['bbay'], 'difc': [[round(a, 6), round(b, 6)] for a, b in difc]}, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump({'E11': F5r['E11']}, open('../roads.json', 'w'), separators=(',', ':'))
json.dump({'metro_red1': F5x['metro_red1'], 'stations': F5x['stations'], 'outlines': {}, 'points': {'difc_gate': [55.2817, 25.2133], 'burj_khalifa': F5x['points']['burj_khalifa']}}, open('../geo_extra.json', 'w'), separators=(',', ':'))
print('ok', len(difc))
