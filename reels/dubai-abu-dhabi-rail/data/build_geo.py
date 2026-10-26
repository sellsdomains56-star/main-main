#!/usr/bin/env python3
"""Geography for the Dubai - Abu Dhabi rail reel -> ../outlines.json, ../roads.json, ../geo_extra.json   (all (c) OpenStreetMap contributors, ODbL)
  rail:     the passenger route relation 21493966 "Etihad Rail: Dubai -> Abu Dhabi" (route=train, osm/rel_21493966.xml): its track ways chained in member order
  stations: Dubai station (node 13158470705, Al Yalayis Street by Jumeirah Golf Estates), Abu Dhabi station (node 14111303896, Mohamed Bin Zayed City)
  roads:    E11 (../kezad-ghantoot/roads.json, Dubai - Abu Dhabi) for orientation
python3 -I build_geo.py"""
import json, math, xml.etree.ElementTree as ET
x = ET.parse('osm/rel_21493966.xml').getroot()
nodes = {n.get('id'): (float(n.get('lon')), float(n.get('lat'))) for n in x.findall('node')}
ways = {w.get('id'): [nd.get('ref') for nd in w.findall('nd')] for w in x.findall('way')}
rel = [r for r in x.findall('relation') if r.get('id') == '21493966'][0]
segs = []
for m in rel.findall('member'):
    if m.get('type') == 'way' and m.get('role') in ('', 'forward', 'backward') and m.get('ref') in ways:
        segs.append([nodes[i] for i in ways[m.get('ref')] if i in nodes])
# chain in order, flipping segments so they connect
line = list(segs[0])
for s in segs[1:]:
    if not s: continue
    d = lambda a, b: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
    opts = [(d(line[-1], s[0]), 0), (d(line[-1], s[-1]), 1), (d(line[0], s[0]), 2), (d(line[0], s[-1]), 3)]
    best = min(opts)[1]
    if best == 0: line += s[1:]
    elif best == 1: line += s[::-1][1:]
    elif best == 2: line = s[::-1] + line[1:]
    else: line = s + line[1:]
R = 6371000.0
def m(a, b): xx = math.radians(b[0] - a[0]) * math.cos(math.radians((a[1] + b[1]) / 2)); yy = math.radians(b[1] - a[1]); return R * math.hypot(xx, yy)
def simplify(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dmax, idx = 0, 0; ab = m(a, b)
    for i in range(1, len(pts) - 1):
        p = pts[i]; ap, bp = m(a, p), m(b, p)
        dd = ap if ab == 0 else abs(ap ** 2 - ((ap ** 2 + ab ** 2 - bp ** 2) / (2 * ab)) ** 2) ** 0.5
        if dd > dmax: dmax, idx = dd, i
    return [a, b] if dmax <= tol else simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)
DXB, AUH = (55.1678, 25.0171), (54.5297, 24.3339)
if m(line[0], DXB) > m(line[-1], DXB): line = line[::-1]                     # Dubai first
L = sum(m(a, b) for a, b in zip(line, line[1:]))
rail = [[round(p[0], 6), round(p[1], 6)] for p in simplify(line, 15)]
print('segments', len(segs), 'points', len(line), '->', len(rail), 'length km', round(L / 1000, 1), 'ends', [round(v, 4) for v in line[0]], [round(v, 4) for v in line[-1]])
print('gap to stations km', round(m(line[0], DXB) / 1000, 2), round(m(line[-1], AUH) / 1000, 2))
E11 = json.load(open('../../kezad-ghantoot/roads.json'))['E11']
json.dump({'E11': E11}, open('../roads.json', 'w'), separators=(',', ':'))
json.dump({}, open('../outlines.json', 'w'))
json.dump({'outlines': {}, 'rail': rail, 'points': {'st_dxb': list(DXB), 'st_auh': list(AUH), 'dubai': [55.27, 25.20], 'abu_dhabi': [54.37, 24.47], 'difc': [55.281, 25.2135], 'adgm': [54.3885, 24.5013]}}, open('../geo_extra.json', 'w'), separators=(',', ':'))
