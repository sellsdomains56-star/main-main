#!/usr/bin/env python3
"""From the pilot sample: keep every community whose median price per sq ft is among the 18 highest in any calendar year (>= 10 sampled sales that year).
-> kept_areas.json (ids).  python3 -I select_areas.py"""
import json, statistics as st
from collections import defaultdict
cache = json.load(open('cache2.json'))
areas = {a['id']: a for f in ('areas.json', 'areas2.json') for a in json.load(open(f)) if a.get('id')}
by = defaultdict(lambda: defaultdict(list))
for k, v in cache.items():
    if k.startswith('pil|'):
        _, aid, cn = k.split('|')
        for d, p in v: by[aid][d[:4]].append(p)
med = defaultdict(dict)
for aid, ys in by.items():
    for y, ps in ys.items():
        if len(ps) >= 10: med[y][aid] = st.median(ps)
keep = set(); 
for y in sorted(med):
    rank = sorted(med[y].items(), key=lambda x: -x[1])
    print(y, [(areas[a]['name'][:18], round(v)) for a, v in rank[:12]])
    keep |= {a for a, _ in rank[:18]}
json.dump(sorted(keep), open('kept_areas.json', 'w'))
print(len(keep), 'kept:', sorted(areas[a]['name'] for a in keep))
