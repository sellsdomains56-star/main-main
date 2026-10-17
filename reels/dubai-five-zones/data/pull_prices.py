#!/usr/bin/env python3
"""Sale prices per sq ft by community from Bayut's DLD transaction feed, last 12 months. python3 -I pull_prices.py  ->  prices.json"""
import json, statistics as S, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '.'); import bq
loc = json.load(open('locations.json')); CATS = {'apartments': 1, 'villas': 3, 'townhouses': 16}
SQM2SQFT = 10.7639
def pull(job):
    name, cat = job; rows = []; nb = 0
    for page in range(1, 8):
        d = bq.q(2, [loc[name]['id']], CATS[cat], '12m', page, 100)
        if d.get('error') or not d.get('hits'): break
        nb = d.get('nbHits', nb)
        for h in d['hits']:
            try: rows.append((float(h['transaction_per_sqm_amount']) / SQM2SQFT, float(h['transaction_amount']), float(h['builtup_area_sqm']) * SQM2SQFT, h['date_transaction_nk'][:10]))
            except Exception: pass
        if len(rows) >= nb: break
    return name, cat, nb, rows
jobs = [(n, c) for n in loc for c in CATS]
out = {}
with ThreadPoolExecutor(6) as ex:
    for name, cat, nb, rows in ex.map(pull, jobs):
        if not rows: continue
        p = sorted(r[0] for r in rows); q = lambda f: p[min(len(p) - 1, int(f * len(p)))]
        out.setdefault(name, {})[cat] = dict(n_total=nb, n_used=len(rows), median_psf=round(S.median(p)), p25_psf=round(q(0.25)), p75_psf=round(q(0.75)),
                                           median_price=round(S.median(r[1] for r in rows)), median_size=round(S.median(r[2] for r in rows)), newest=max(r[3] for r in rows), oldest=min(r[3] for r in rows))
json.dump(out, open('prices.json', 'w'), indent=1)
for n, v in out.items(): print(n, {c: (d['n_total'], d['median_psf'], d['p25_psf'], d['p75_psf']) for c, d in v.items()})
