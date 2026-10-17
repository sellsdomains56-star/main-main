#!/usr/bin/env python3
"""Residential sales value by developer, Dubai, from the DLD transaction feed (Bayut /api/transactions), Oct 2016 - Oct 2026.
Monthly COUNTS are exact (nbHits of the 1m, 2m ... 120m windows, differenced). The average price of each 12-month slice is the mean of ~240 sampled sales
(evenly spaced pages of the date-sorted 120-month window), so the monthly value = exact count x sampled average price (about +-4%).
python3 -I pull_dld.py counts   |   python3 -I pull_dld.py prices      (resumable through cache.json)"""
import json, sys, os, time, datetime as dt, urllib.request
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '.'); import bq
DEVS = ['Emaar', 'DAMAC Properties', 'Nakheel', 'Sobha', 'Binghatti', 'Azizi Developments', 'Danube Properties', 'Meraas', 'Dubai Properties', 'Aldar', 'Samana Developers', 'Ellington Properties',
        'Select Group', 'Deyaar', 'Nshama', 'Tiger Properties', 'Imtiaz Developments', 'Wasl', 'Omniyat', 'Arada', 'Union Properties', 'Object 1']
CATS = {'apartments': 1, 'villas': 3, 'townhouses': 16}
CACHE = 'cache.json'; cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
def call(dev, cat, win, page=1):
    body = {"transactionIDs": None, "purpose": "for-sale", "locationLevels": None, "locationExternalIDs": None, "categoryExternalID": str(cat), "completionStatus": "any", "timeSinceCreation": win, "beds": None, "contractRenewalStatus": "All", "showCurrentMonth": None, "areaRange": None, "plotAreaRange": None, "priceRange": None, "page": page, "sortByFieldName": "date_transaction_nk", "sortByFieldOrder": "desc", "hitsPerPage": 20, "sellerType": None, "transactionPaymentMethod": None, "contractDuration": None, "pricePerUnitMeasureRange": None, "floorNumberRange": None, "unitNumber": None, "transactionDeveloperNames": [dev], "v": "5"}
    for k in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(bq.URL, data=json.dumps(body).encode(), headers=bq.H, method='POST'), timeout=45))
        except Exception as e: time.sleep(1.5 * (k + 1))
    return None
def save(): json.dump(cache, open(CACHE + '.tmp', 'w')); os.replace(CACHE + '.tmp', CACHE)
def counts(job):
    dev, cat = job; key = f'cnt|{dev}|{cat}'
    if key in cache: return
    cum = []
    for m in range(1, 121):
        r = call(dev, CATS[cat], f'{m}m'); cum.append(r['nbHits'] if r else None)
    cache[key] = cum
def prices(job):
    dev, cat, k = job; key = f'px|{dev}|{cat}|{k}'
    if key in cache: return
    cum = cache[f'cnt|{dev}|{cat}']; n0 = 0 if k == 1 else cum[12 * (k - 1) - 1]; n1 = cum[12 * k - 1]
    if n1 is None or n0 is None or n1 <= n0: cache[key] = {'n': 0, 'sum': 0, 'cnt': 0}; return
    p0, p1 = n0 // 20, (n1 - 1) // 20; pages = list(range(p0, p1 + 1))
    if len(pages) > 14: pages = sorted({round(p0 + (p1 - p0) * i / 13) for i in range(14)})
    amt = []; dates = []
    for p in pages:
        r = call(dev, CATS[cat], '120m', p + 1)
        if not r: continue
        for h in r['hits']:
            try: amt.append(float(h['transaction_amount'])); dates.append(h['date_transaction_nk'][:10])
            except Exception: pass
    cache[key] = {'n': n1 - n0, 'cnt': len(amt), 'sum': sum(amt), 'mean': (sum(amt) / len(amt)) if amt else None, 'dmin': min(dates) if dates else None, 'dmax': max(dates) if dates else None}
if __name__ == '__main__':
    stage = sys.argv[1] if len(sys.argv) > 1 else 'counts'
    if stage == 'counts':
        jobs = [(d, c) for d in DEVS for c in CATS]
        with ThreadPoolExecutor(8) as ex: list(ex.map(counts, jobs))
        save(); print('counts done', len(jobs))
    else:
        jobs = []
        for d in DEVS:
            for c in CATS:
                cum = cache.get(f'cnt|{d}|{c}')
                if cum and (cum[-1] or 0) > 0: jobs += [(d, c, k) for k in range(1, 11)]
        t0 = time.time(); done = 0
        def run(j):
            global done; prices(j); done += 1
            if done % 25 == 0: save(); print(done, '/', len(jobs), round(time.time() - t0), 's', flush=True)
        with ThreadPoolExecutor(8) as ex: list(ex.map(run, jobs))
        save(); print('prices done', len(jobs))
