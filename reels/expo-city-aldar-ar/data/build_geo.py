#!/usr/bin/env python3
"""Geography for the Expo City reel -> ../outlines.json, ../roads.json, ../geo_extra.json   (all (c) OpenStreetMap contributors, ODbL)
  outlines: Expo 2020 district = Expo City Dubai (way 499367597), Dubai Exhibition Centre north / south halls (ways 750115631 / 750115632),
            Al Maktoum International Airport (aerodrome way 214188740) - osm/nom.json from nominatim_expo.py
  points:   centroids of those, and the DWC passenger terminal (way 170139991)
python3 -I build_geo.py"""
import json, math
N = json.load(open('osm/nom.json'))
def ring(q, oid):
    x = [x for x in N[q] if x['osm_id'] == oid][0]['geojson']; return x['coordinates'][0] if x['type'] == 'Polygon' else max((p[0] for p in x['coordinates']), key=len)
rd = lambda r: [[round(a, 6), round(b, 6)] for a, b in r]
cen = lambda r: [round(sum(p[0] for p in r) / len(r), 5), round(sum(p[1] for p in r) / len(r), 5)]
outl = {'expo': rd(ring('Expo 2020 Dubai', 499367597)), 'dec_n': rd(ring('Dubai Exhibition Centre', 750115631)), 'dec_s': rd(ring('Dubai Exhibition Centre', 750115632)), 'dwc': rd(ring('Al Maktoum International Airport', 214188740))}
term = ring('Al Maktoum International Airport', 170139991)
json.dump(outl, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump({}, open('../roads.json', 'w'))
P = {'expo': cen(outl['expo']), 'dec': cen(outl['dec_n'] + outl['dec_s']), 'dwc': cen(outl['dwc']), 'dwc_term': cen(term)}
km = lambda a, b: math.hypot((a[0] - b[0]) * 101.0, (a[1] - b[1]) * 111.2)
print({k: v for k, v in P.items()}, 'expo->dwc centroid km', round(km(P['expo'], P['dwc']), 1), 'expo->terminal km', round(km(P['expo'], P['dwc_term']), 1))
json.dump({'outlines': {}, 'points': P}, open('../geo_extra.json', 'w'), indent=1)
