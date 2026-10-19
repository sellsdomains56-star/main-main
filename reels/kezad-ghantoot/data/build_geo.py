#!/usr/bin/env python3
"""Geography for the KEZAD / Ghantoot reel -> ../outlines.json, ../roads.json, ../geo_extra.json   (all (c) OpenStreetMap contributors, ODbL)
  outlines: JAFZA (Jebel Ali Free Zone North, OSM relation 18471647), Discovery Gardens, Al Furjan, Jebel Ali Village, Dubai Investments Park,
            Khalifa Port, KEZAD = the Khalifa Industrial district (OSM relation 13251383) and Al Ma'mourah (relation 13251377, Khalifa Port side), Al Taweelah, Al Samha, Al Rahba (Nominatim polygons, osm/nom_kezad.json),
            Al Maktoum Intl Airport + Expo City (from ../dubai-five-zones/outlines.json)
  roads:    E11 Dubai - Abu Dhabi (OSM route relation 19308049, osm/e11_full.json), joined per carriageway, 15 m simplification
  points:   Ghantoot, Jebel Ali Port, Dubai South (Nominatim), city labels
python3 -I build_geo.py"""
import json, math
N = json.load(open('osm/nom_kezad.json'))
def poly(q, osm_id):
    for x in N.get(q, []):
        if x['osm_id'] == osm_id:
            g = x['geojson']; ring = g['coordinates'][0] if g['type'] == 'Polygon' else max((p[0] for p in g['coordinates']), key=len)
            return ring
    raise SystemExit(f'missing {q} {osm_id}')
R = 6371000.0
def m(a, b): x = math.radians(b[0] - a[0]) * math.cos(math.radians((a[1] + b[1]) / 2)); y = math.radians(b[1] - a[1]); return R * math.hypot(x, y)
def simplify(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dmax, idx = 0, 0; ab = m(a, b)
    for i in range(1, len(pts) - 1):
        p = pts[i]; ap, bp = m(a, p), m(b, p)
        d = ap if ab == 0 else abs(ap ** 2 - ((ap ** 2 + ab ** 2 - bp ** 2) / (2 * ab)) ** 2) ** 0.5
        if d > dmax: dmax, idx = d, i
    return [a, b] if dmax <= tol else simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)
rd = lambda r, tol=12: [[round(p[0], 6), round(p[1], 6)] for p in simplify(r, tol)]
F5 = json.load(open('../../dubai-five-zones/outlines.json'))
outl = {'jafza': rd(poly('Jebel Ali Free Zone North', 18471647)), 'dgardens': rd(poly('Discovery Gardens', 213900204)), 'furjan': rd(poly('Al Furjan', 666334271)),
        'javillage': rd(poly('Jebel Ali Village', 1018273191)), 'dip': rd(poly('Dubai Investments Park', 874795301)), 'kport': rd(poly('Khalifa Port', 1303931592)),
        'kezad': rd(poly('خليفة الصناعية', 13251383), 25), 'maamoura': rd(poly('المعمورة', 13251377), 25), 'taweelah': rd(poly('Al Taweelah', 13251376), 25), 'samha': rd(poly('Al Samha', 873221038)), 'rahba': rd(poly('Al Rahba', 873221039)),
        'dwc': F5['airport'], 'expo': F5['expo']}
json.dump(outl, open('../outlines.json', 'w'), separators=(',', ':'))
# E11 from the route relation: member ways in order, joined end to end, split into the two carriageways by direction
E = json.load(open('osm/e11_full.json'))['elements']; nodes = {e['id']: (e['lon'], e['lat']) for e in E if e['type'] == 'node'}; ways = {e['id']: e for e in E if e['type'] == 'way'}
rel = [e for e in E if e['type'] == 'relation' and e['id'] == 19308049][0]
BB = (54.30, 24.25, 55.35, 25.25)
segs = []
for mb in rel['members']:
    if mb['type'] != 'way' or mb['ref'] not in ways: continue
    pts = [nodes[n] for n in ways[mb['ref']]['nodes'] if n in nodes]
    pts = [p for p in pts if BB[0] <= p[0] <= BB[2] and BB[1] <= p[1] <= BB[3]]
    if len(pts) >= 2: segs.append([list(p) for p in pts])
key = lambda p: (round(p[0], 7), round(p[1], 7))
def heading(p, q): return math.atan2(q[1] - p[1], (q[0] - p[0]) * math.cos(math.radians(p[1])))
def same_way(a, b):
    ha = heading(a[max(0, len(a) - 4)], a[-1]); hb = heading(b[0], b[min(len(b) - 1, 3)]); return abs((ha - hb + math.pi) % (2 * math.pi) - math.pi) < math.radians(50)
ls = segs
while True:
    starts = {}
    for i, l in enumerate(ls): starts.setdefault(key(l[0]), []).append(i)
    merged = False
    for i, l in enumerate(ls):
        nxt = [j for j in starts.get(key(l[-1]), []) if j != i]
        if len(nxt) == 1: j = nxt[0]; ls[i] = l + ls[j][1:]; ls.pop(j); merged = True; break
    if not merged: break
while True:
    best = None
    for i, a in enumerate(ls):
        for j, b in enumerate(ls):
            if i != j:
                d = m(a[-1], b[0])
                if d < 600 and same_way(a, b) and (best is None or d < best[0]): best = (d, i, j)
    if not best: break
    _, i, j = best; ls[i] = ls[i] + ls[j]; ls.pop(j)
L = lambda l: sum(m(l[k], l[k + 1]) for k in range(len(l) - 1))
ls = sorted(ls, key=lambda l: -L(l))[:2]
ls = [l if l[0][0] > l[-1][0] else l[::-1] for l in ls]            # Dubai (east) -> Abu Dhabi (west): the drawing direction of this reel
print('E11 chains', [round(L(l) / 1000, 1) for l in ls], 'km; ends', ls[0][0], ls[0][-1])
json.dump({'E11': [rd(l, 15) for l in ls]}, open('../roads.json', 'w'), separators=(',', ':'))
pts = {'ghantoot': [54.9008, 24.8647], 'jebel_ali_port': [55.0599, 24.9805], 'dubai_south': [55.16151, 24.91443], 'abu_dhabi': [54.3774, 24.4538], 'dubai': [55.2708, 25.2048]}
json.dump({'points': pts, 'bands': {}, 'outlines': {}, 'metro_red1': [], 'stations': []}, open('../geo_extra.json', 'w'), separators=(',', ':'))
for k, v in outl.items():
    c = (sum(p[0] for p in v) / len(v), sum(p[1] for p in v) / len(v)); xs = [p[0] for p in v]; ys = [p[1] for p in v]
    print(f'{k:10s} {len(v):4d} pts centroid {c[0]:.4f},{c[1]:.4f} size {m((min(xs), min(ys)), (max(xs), min(ys))) / 1000:.1f} x {m((min(xs), min(ys)), (min(xs), max(ys))) / 1000:.1f} km')
g = pts['ghantoot']; cen = lambda k: (sum(p[0] for p in outl[k]) / len(outl[k]), sum(p[1] for p in outl[k]) / len(outl[k]))
for k in ('jafza', 'kport', 'kezad', 'dwc', 'samha'): print(f'Ghantoot -> {k}: {m(g, cen(k)) / 1000:.1f} km')
print('Jebel Ali Port -> Khalifa Port', round(m(pts['jebel_ali_port'], cen('kport')) / 1000, 1), 'km')
