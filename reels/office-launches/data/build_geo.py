#!/usr/bin/env python3
"""Geography for the five office launches reel -> ../outlines.json, ../roads.json, ../geo_extra.json   ((c) OpenStreetMap contributors, ODbL)
  osm/from_five_zones.json + osm/roads_five_zones.json (from ../dubai-five-zones and ../office-market-ar): Business Bay, Downtown, Motor City, DIFC, E11, E311, E611.
  The five sites (research 31 Oct 2026, research_offices.md; approximate): Rockefeller tower 25.1964,55.2651 (+-600 m); Berkeley Tower 25.1908,55.2615;
  AHS Twin Towers (the Shangri-La building) 25.2081,55.2720; DAWN / O1NE District 25.046,55.231 (+-1 km); The Yards Plaza 25.083,55.325 (+-1 km).
python3 -I build_geo.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
F = json.load(open('osm/from_five_zones.json'))
json.dump({k: F[k] for k in ('bbay', 'downtown', 'motor', 'difc')}, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump(json.load(open('osm/roads_five_zones.json')), open('../roads.json', 'w'), separators=(',', ':'))
pts = {'rock': [55.2651, 25.1964], 'berk': [55.2615, 25.1908], 'ahs': [55.2720, 25.2081], 'dawn': [55.231, 25.046], 'yards': [55.325, 25.083]}
json.dump({'outlines': {}, 'points': pts}, open('../geo_extra.json', 'w'), indent=1); print(pts)
