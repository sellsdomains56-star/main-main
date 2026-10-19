#!/usr/bin/env python3
"""OSM highway geometry (from data/nominatim_roads.py runs in data/osm/*.json) -> ../roads.json: one ordered, simplified line per carriageway for
E11 (Sheikh Zayed Road), E311 (Sheikh Mohammed Bin Zayed Road) and E611 (Emirates Road).  Ways are joined end-to-end where they share a node
(gaps under 400 m are bridged); the longest chains are kept.  python3 -I build_roads.py"""
import json, math
ROADS = {'E11': ('شارع الشيخ زايد', ['e11.json', 'e611.json', 'e611b.json']),
         'E311': ('شارع الشيخ محمد بن زايد', ['e311.json', 'e311b.json', 'e11.json']),
         'E611': ('شارع الإمارات', ['e611.json', 'e611b.json'])}
BBOX = (54.88, 24.72, 55.62, 25.40)                                   # Dubai (+ the first km into Abu Dhabi / Sharjah)
R = 6371000.0
def m(a, b):                                                       # metres between two lon/lat points
    x = math.radians(b[0] - a[0]) * math.cos(math.radians((a[1] + b[1]) / 2)); y = math.radians(b[1] - a[1]); return R * math.hypot(x, y)
def lines(name, files):
    seen, out = set(), []
    for f in files:
        for x in json.load(open('osm/' + f)):
            if x['name'] != name or x['type'] not in ('motorway', 'trunk') or x['osm_id'] in seen: continue
            seen.add(x['osm_id']); g = x['geom']
            for l in ([g['coordinates']] if g['type'] == 'LineString' else g['coordinates']):
                l = [p for p in l if BBOX[0] <= p[0] <= BBOX[2] and BBOX[1] <= p[1] <= BBOX[3]]
                if len(l) >= 2: out.append(l)
    return out
def heading(p, q): return math.atan2(q[1] - p[1], (q[0] - p[0]) * math.cos(math.radians(p[1])))
def same_way(a, b):                                                 # b continues a in the same direction (not the opposite carriageway)
    ha = heading(a[max(0, len(a) - 4)], a[-1]); hb = heading(b[0], b[min(len(b) - 1, 3)])
    return abs((ha - hb + math.pi) % (2 * math.pi) - math.pi) < math.radians(50)
def chain(ls):
    ls = [list(l) for l in ls]; key = lambda p: (round(p[0], 7), round(p[1], 7))
    while True:                                                      # join exact shared endpoints (way end == next way start)
        starts = {}
        for i, l in enumerate(ls): starts.setdefault(key(l[0]), []).append(i)
        merged = False
        for i, l in enumerate(ls):
            if l is None: continue
            nxt = [j for j in starts.get(key(l[-1]), []) if j != i and ls[j] is not None]
            if len(nxt) == 1:
                j = nxt[0]; ls[i] = l + ls[j][1:]; ls[j] = None; merged = True; break
        ls = [l for l in ls if l is not None]
        if not merged: break
    while True:                                                      # bridge small gaps (a way Nominatim did not return)
        best = None
        for i, a in enumerate(ls):
            for j, b in enumerate(ls):
                if i == j: continue
                d = m(a[-1], b[0])
                if d < 400 and same_way(a, b) and (best is None or d < best[0]): best = (d, i, j)
        if not best: break
        _, i, j = best; ls[i] = ls[i] + ls[j]; ls.pop(j)
    return sorted(ls, key=lambda l: -sum(m(l[k], l[k + 1]) for k in range(len(l) - 1)))
def simplify(pts, tol):                                             # Douglas-Peucker in metres
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]; ab = m(a, b)
        d = m(a, p) if ab == 0 else abs((m(a, p) ** 2 - ((m(a, p) ** 2 + ab ** 2 - m(b, p) ** 2) / (2 * ab)) ** 2)) ** 0.5
        if d > dmax: dmax, idx = d, i
    if dmax <= tol: return [a, b]
    return simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)
out = {}
for ref, (name, files) in ROADS.items():
    ch = chain(lines(name, files)); L = lambda l: sum(m(l[k], l[k + 1]) for k in range(len(l) - 1))
    keep = [l for l in ch if L(l) > 3000][:2]
    keep = [l if l[0][0] < l[-1][0] else l[::-1] for l in keep]          # every line runs south-west -> north-east (the drawing direction)
    print(ref, len(ch), 'chains; kept', [round(L(l) / 1000, 1) for l in keep], 'km')
    out[ref] = [[[round(p[0], 6), round(p[1], 6)] for p in simplify(l, 12)] for l in keep]
json.dump(out, open('../roads.json', 'w'), separators=(',', ':'))
print({k: [len(l) for l in v] for k, v in out.items()})
