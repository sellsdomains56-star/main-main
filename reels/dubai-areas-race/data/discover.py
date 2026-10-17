#!/usr/bin/env python3
"""Step 1: which communities exist in the DLD sales feed? Samples 3 pages per quarter per category and counts the community name (l3) of each hit.
python3 -I discover.py  ->  communities.json {name: sampled_hits}"""
import json, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
sys.path.insert(0, '.'); import bq
CATS = {'apartments': 1, 'villas': 3, 'townhouses': 16}
def call(cat, win, order, page):
    body = {"transactionIDs": None, "purpose": "for-sale", "locationLevels": None, "locationExternalIDs": None, "categoryExternalID": str(cat), "completionStatus": "any", "timeSinceCreation": win, "beds": None, "contractRenewalStatus": "All", "showCurrentMonth": None, "areaRange": None, "plotAreaRange": None, "priceRange": None, "page": page, "sortByFieldName": "date_transaction_nk", "sortByFieldOrder": order, "hitsPerPage": 20, "sellerType": None, "transactionPaymentMethod": None, "contractDuration": None, "pricePerUnitMeasureRange": None, "floorNumberRange": None, "unitNumber": None, "transactionDeveloperNames": None, "v": "5"}
    for k in range(4):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(bq.URL, data=json.dumps(body).encode(), headers=bq.H, method='POST'), timeout=60))
        except Exception: time.sleep(1.5 * (k + 1))
    return None
jobs = [(c, f'{3 * q}m', p) for c in CATS.values() for q in range(1, 41) for p in (1, 40, 120)]
def run(j):
    r = call(j[0], j[1], 'asc', j[2]); return [h.get('bayut_location_l3_name_en', '') for h in (r or {}).get('hits', [])]
cnt = Counter()
with ThreadPoolExecutor(8) as ex:
    for names in ex.map(run, jobs): cnt.update(n for n in names if n)
json.dump(dict(cnt.most_common()), open('communities.json', 'w'), indent=1)
print(len(cnt), 'communities;', cnt.most_common(40))
