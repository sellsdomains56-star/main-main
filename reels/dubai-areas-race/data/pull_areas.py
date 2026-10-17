#!/usr/bin/env python3
"""Price per sq ft per community from the DLD sales feed (Bayut /api/transactions, Oct 2016 - Oct 2026).  Resumable (cache2.json).
The feed pages 20 sales at a time, sorted by date, at most 500 pages deep per query, with time windows of only 1/3/6/12/36/60/120 months.  So:
  counts  : number of sales per community x home type in the 120/60/36/12-month windows
  pilot   : 20 pages per community x type (10 oldest-first, 10 newest-first) -> which communities can ever reach the top 10 (select_areas.py)
  full    : for the kept communities, every K-th page (K so that about 120 pages are read) of everything reachable (oldest 10k, newest 10k, and from the
            Oct 2021 / Oct 2023 / Oct 2025 window starts); communities with more than 20k sales of a type are split by number of bedrooms first.
Every sampled sale is stored with weight K (so a sample is position-uniform and counts are estimated by sum of weights).
python3 -I pull_areas.py counts|pilot|full"""
import json, os, sys, time, math, threading, urllib.request
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '.'); import bq
SQM = 10.7639; HOMES = {'3', '4', '18'}; CATS = {'apartments': 1, 'villas': 3, 'townhouses': 16}; BEDS = [0, 1, 2, 3, 4, 5, 6]
areas = {}
for f in ('areas.json', 'areas2.json'):
    for a in json.load(open(f)):
        if a.get('id') and a.get('level') in ('2', None): areas.setdefault(a['id'], a)
CACHE = 'cache2.json'; cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}; lock = threading.Lock(); t0 = time.time(); ndone = [0]
def save():
    with lock:
        snap = cache.copy()                                           # atomic copy: worker threads keep adding keys while we write
        json.dump(snap, open(CACHE + '.tmp', 'w')); os.replace(CACHE + '.tmp', CACHE)
def call(aid, cat, win, order='asc', page=1, beds=None):
    body = {"transactionIDs": None, "purpose": "for-sale", "locationLevels": [2], "locationExternalIDs": [str(aid)], "categoryExternalID": str(cat), "completionStatus": "any", "timeSinceCreation": win, "beds": ([beds] if beds is not None else None), "contractRenewalStatus": "All", "showCurrentMonth": None, "areaRange": None, "plotAreaRange": None, "priceRange": None, "page": page, "sortByFieldName": "date_transaction_nk", "sortByFieldOrder": order, "hitsPerPage": 20, "sellerType": None, "transactionPaymentMethod": None, "contractDuration": None, "pricePerUnitMeasureRange": None, "floorNumberRange": None, "unitNumber": None, "transactionDeveloperNames": None, "v": "5"}
    for k in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(bq.URL, data=json.dumps(body).encode(), headers=bq.H, method='POST'), timeout=45))
        except Exception: time.sleep(1.2 * (k + 1))
    return None
def rows(r):
    out = []
    for h in (r or {}).get('hits', []):
        try:
            if h.get('bayut_property_type_id') not in HOMES: continue          # 4 apartment, 3 villa / townhouse, 18 penthouse-type unit; hotel apartments (21) and plots (14) are not homes
            sq = float(h['builtup_area_sqm']); amt = float(h['transaction_amount']); pp = amt / (sq * SQM)
            if sq >= 15 and 150 <= pp <= 30000: out.append([h['date_transaction_nk'][:10], round(pp, 1)])
        except Exception: pass
    return out
def tick(msg):
    ndone[0] += 1
    if ndone[0] % 10 == 0: save(); print(ndone[0], msg, round(time.time() - t0), 's', flush=True)
# ---------------------------------------------------------------- counts
def counts(job):
    aid, cn, beds = job; key = f'cnt|{aid}|{cn}|{beds}'
    if key in cache: return
    c = {}
    for w in ('120m', '60m', '36m', '12m'):
        r = call(aid, CATS[cn], w, 'asc', 1, beds); c[w] = None if r is None else r.get('nbHits', 0)
        if w == '120m' and (c[w] or 0) < 30: break
    if None in c.values(): print('count fail', aid, cn, beds, flush=True); return
    cache[key] = c; tick(f'count {areas[aid]["name"]} {cn} {beds} {c}')
# ---------------------------------------------------------------- pilot
def pilot(job):
    aid, cn = job; key = f'pil|{aid}|{cn}'; c = cache.get(f'cnt|{aid}|{cn}|None')
    if key in cache or not c or c['120m'] < 30: return
    N = c['120m']; P = math.ceil(N / 20); m = min(P, 500); s = []
    if P <= 20: picks = [('asc', j) for j in range(1, P + 1)]
    else:
        idx = sorted({1 + round(i * (m - 1) / 9) for i in range(10)}); picks = [('asc', j) for j in idx] + ([('desc', j) for j in idx] if P > 40 else [])
    for o, j in picks: s += rows(call(aid, CATS[cn], '120m', o, j))
    cache[key] = s; tick(f'pilot {areas[aid]["name"]} {cn} N={N} samples={len(s)}')
# ---------------------------------------------------------------- full
def plan(N, n60, n36, n12):
    """sources in priority order: (window, order, abs-start, size, reach-range)"""
    src = [('120m', 'asc', 0, N), ('120m', 'desc', 0, N), ('60m', 'asc', N - n60, n60), ('36m', 'asc', N - n36, n36), ('12m', 'asc', N - n12, n12)]
    out = []; cover = []
    for w, o, st, size in src:
        if size <= 0: continue
        reach = min(size, 10000)
        lo, hi = (st, st + reach) if o == 'asc' else (N - reach, N)
        pages = []
        for j in range(1, math.ceil(reach / 20) + 1):
            mid = (st + 20 * (j - 1) + 10) if o == 'asc' else (N - 1 - (20 * (j - 1) + 10))
            if not any(a <= mid < b for a, b in cover): pages.append(j)
        out.append((w, o, pages)); cover.append((lo, hi))
    return out, sum(b - a for a, b in cover)
def full_piece(aid, cn, beds):
    key = f'smp|{aid}|{cn}|{beds}'
    if key in cache: return
    c = cache.get(f'cnt|{aid}|{cn}|{beds}')
    if not c or c['120m'] < 30: return
    N = c['120m']; src, ncov = plan(N, c['60m'], c['36m'], c['12m']); tot_pages = sum(len(p) for _, _, p in src)
    K = max(1, round(tot_pages / 120)); s = []
    for w, o, pages in src:
        for j in pages[(K // 2) % K::K] if K > 1 else pages: s += [r + [K] for r in rows(call(aid, CATS[cn], w, o, j, beds))]
    cache[key] = {'N': N, 'K': K, 'ncov': ncov, 's': s}; tick(f'full {areas[aid]["name"]} {cn} beds={beds} N={N} K={K} samples={len(s)}')
def full(job):
    aid, cn = job; c = cache.get(f'cnt|{aid}|{cn}|None')
    if not c or c['120m'] < 30: return
    if c['120m'] <= 20000: full_piece(aid, cn, None)
    else:
        for b in BEDS:
            k = f'cnt|{aid}|{cn}|{b}'
            if k not in cache: counts((aid, cn, b))
            full_piece(aid, cn, b)
if __name__ == '__main__':
    stage = sys.argv[1]
    if stage == 'counts':
        jobs = [(a, c, None) for a in areas for c in CATS]; fn = counts
    elif stage == 'pilot':
        jobs = [(a, c) for a in areas for c in CATS]; fn = pilot
    else:
        keep = json.load(open('kept_areas.json')); jobs = [(a, c) for a in keep for c in CATS]; fn = full
    print(stage, len(jobs), 'jobs', flush=True)
    with ThreadPoolExecutor(8) as ex: list(ex.map(fn, jobs))
    save(); print(stage.upper(), 'DONE', round(time.time() - t0), 's', flush=True)
