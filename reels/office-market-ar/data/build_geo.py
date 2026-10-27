#!/usr/bin/env python3
"""Geography for the office-market reel -> ../outlines.json, ../roads.json, ../geo_extra.json   (all (c) OpenStreetMap contributors, ODbL)
  reused: DIFC / Downtown / Business Bay + E11 + the Rockefeller tower point (../../rockefeller-tower), Expo City / DEC / Al Maktoum airport (../../expo-city-aldar-ar),
          Al Maryah / Al Reem islands + ADGM point (../../hudayriyat-wadeem)
  new (osm/nom.json from nominatim_office.py): Za'abeel (administrative relation 18471721), Arabian Ranches (way 874795223)
python3 -I build_geo.py"""
import json
L = lambda r, f: json.load(open(f'../../{r}/{f}'))
N = json.load(open('osm/nom.json'))
def ring(q, oid):
    x = [x for x in N[q] if x['osm_id'] == oid][0]['geojson']; return x['coordinates'][0] if x['type'] == 'Polygon' else max((p[0] for p in x['coordinates']), key=len)
rd = lambda r: [[round(a, 6), round(b, 6)] for a, b in r]
cen = lambda r: [round(sum(p[0] for p in r) / len(r), 5), round(sum(p[1] for p in r) / len(r), 5)]
ro, ex, hu = L('rockefeller-tower', 'outlines.json'), L('expo-city-aldar-ar', 'outlines.json'), L('hudayriyat-wadeem', 'outlines.json')
outl = {k: ro[k] for k in ('downtown', 'bbay', 'difc')}
outl.update({k: ex[k] for k in ('expo', 'dec_n', 'dec_s', 'dwc')}); outl.update({k: hu[k] for k in ('maryah', 'reem')})
outl['zabeel'] = rd(ring('Zabeel', 18471721)); outl['ranches'] = rd(ring('Arabian Ranches', 874795223))
json.dump(outl, open('../outlines.json', 'w'), separators=(',', ':'))
json.dump({'E11': L('rockefeller-tower', 'roads.json')['E11']}, open('../roads.json', 'w'), separators=(',', ':'))
pts = {**L('rockefeller-tower', 'geo_extra.json')['points'], **L('expo-city-aldar-ar', 'geo_extra.json')['points'], 'adgm': L('hudayriyat-wadeem', 'geo_extra.json')['points']['adgm']}
for k in ('difc', 'zabeel', 'ranches', 'maryah', 'reem', 'downtown', 'bbay'): pts[k] = cen(outl[k])
json.dump({'outlines': {}, 'points': pts}, open('../geo_extra.json', 'w'), indent=1)
print('outlines', list(outl), '\npoints', pts)
