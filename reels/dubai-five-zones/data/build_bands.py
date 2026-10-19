#!/usr/bin/env python3
"""Zone bands from the real highway lines (../roads.json) -> added to ../geo_extra.json as 'bands':
  band2 = the land between E11 and E311 (zone 2), band3 = between E311 and E611 (zone 3).  Each band is the stretch of the inner road that runs
  alongside the outer one (cut where the inner road ends / meets the cut line), closed by straight cross-cuts.  Also prints community centroids.
python3 -I build_bands.py"""
import json, math
roads = json.load(open('../roads.json')); G = json.load(open('../geo_extra.json')); O = json.load(open('../outlines.json'))
k = math.cos(math.radians(25))
def d(a, b): return math.hypot((a[0] - b[0]) * k, a[1] - b[1]) * 111.2
def nearest(line, p): return min(range(len(line)), key=lambda i: d(line[i], p))
E11, E311, E611 = roads['E11'][0], roads['E311'][0], roads['E611'][0]
# band2: E11 from the point abreast of E311's south-west start up to E11's north-east end; E311 from abreast of E11's NE end back to its start
i0 = nearest(E11, E311[0]); j1 = nearest(E311, E11[-1])
band2 = E11[i0:] + E311[:j1 + 1][::-1]
# band3: E311 from its start to the point abreast of a cut at the Dubai-Sharjah edge (Al Khawaneej side), E611 alongside
CUT = [55.47, 25.235]
j0, j1b = 0, nearest(E311, CUT); k0 = nearest(E611, E311[0]); k1 = nearest(E611, E311[j1b])
band3 = E311[j0:j1b + 1] + E611[k0:k1 + 1][::-1]
G['bands'] = {'band2': band2, 'band3': band3}
json.dump(G, open('../geo_extra.json', 'w'), separators=(',', ':'))
print('band2', len(band2), 'pts; band3', len(band3), 'pts')
for name, pts in list(O.items()) + [('dland', G['outlines']['dland']), ('dxb', G['outlines']['dxb'])]:
    lo = sum(p[0] for p in pts) / len(pts); la = sum(p[1] for p in pts) / len(pts); xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    print(f'{name:9s} centroid {lo:.4f} {la:.4f}  bbox {min(xs):.3f}-{max(xs):.3f} {min(ys):.3f}-{max(ys):.3f}  size {d((min(xs),min(ys)),(max(xs),min(ys))):.1f}x{d((min(xs),min(ys)),(min(xs),max(ys))):.1f} km')
bk = G['points']['burj_khalifa']
for name in ('dhills', 'tilal', 'arjan', 'motor', 'valley', 'ar3', 'damac2', 'majan', 'liwan', 'expo'):
    pts = O[name]; c = (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)); print(f'{name} -> Burj Khalifa {d(c, bk):.1f} km')
apt = (sum(p[0] for p in O['airport']) / len(O['airport']), sum(p[1] for p in O['airport']) / len(O['airport'])); dxb = G['outlines']['dxb']; dx = (sum(p[0] for p in dxb) / len(dxb), sum(p[1] for p in dxb) / len(dxb))
print('DWC -> DXB', round(d(apt, dx), 1), 'km; DWC -> Palm Jebel Ali', round(d(apt, G['points']['palm_jebel_ali']), 1), 'km; Expo -> DWC', round(d(apt, (sum(p[0] for p in O['expo'])/len(O['expo']), sum(p[1] for p in O['expo'])/len(O['expo']))), 1))
