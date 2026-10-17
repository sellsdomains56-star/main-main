#!/usr/bin/env python3
"""cache2.json (pull_areas.py full) -> ../chart_data.json.
Per community and calendar quarter (Q4 2016 .. Q3 2026), over a rolling 6-month window (that quarter + the one before; the first quarter has only itself): weighted median of the sampled sales' price per sq ft (apartments + villas + townhouses pooled; every
sampled sale weighs K = how many pages one sampled page stands for, so the pooled sample is position-uniform and the home-type mix is the real one).
A window needs >= MIN_S sampled sales and an estimated >= MIN_N sales, else the quarter is left empty.
python3 -I build_series.py"""
import json, re
from collections import defaultdict
import sys
W = int(sys.argv[2]) if len(sys.argv) > 2 else 2                              # rolling window in quarters (2 = 6 months, 4 = 12 months)
PASSES = int(sys.argv[1]) if len(sys.argv) > 1 else 0                       # number of 1-2-1 smoothing passes across quarters (after bridging gaps)
MIN_N, MIN_S = 25, 10                                  # per quarter in the window (scaled below by the number of quarters the window really holds)                      # a rolling 6-month window (this quarter + the one before) needs about 50 sales, 20 of them sampled
cache = json.load(open('cache2.json'))
areas = {a['id']: a for f in ('areas.json', 'areas2.json') for a in json.load(open(f)) if a.get('id')}
hits = defaultdict(list)
for k, v in cache.items():
    if k.startswith('smp|'):
        aid = k.split('|')[1]; hits[aid] += [(d, p, w) for d, p, w in v['s']]
def wmedian(pairs):
    pairs = sorted(pairs); tot = sum(w for _, w in pairs); c = 0
    for v, w in pairs:
        c += w
        if c >= tot / 2: return v
def qidx(d): return (int(d[:4]) - 2016) * 4 + (int(d[5:7]) - 1) // 3 - 3        # Q4 2016 = 0
def qlabel(qi): return f'Q{(qi + 3) % 4 + 1} {2016 + (qi + 3) // 4}'
SHORT = {'Jumeirah Village Circle (JVC)': 'JVC', 'Jumeirah Village Triangle (JVT)': 'JVT', 'Jumeirah Beach Residence (JBR)': 'JBR', 'Jumeirah Lake Towers (JLT)': 'JLT', 'Mohammed Bin Rashid City (MBR City)': 'MBR City',
         'Dubai Silicon Oasis (DSO)': 'Silicon Oasis', 'Dubai Hills Estate': 'Dubai Hills', 'The Valley by Emaar': 'The Valley', 'DAMAC Hills 2 (Akoya by DAMAC)': 'Damac Hills 2', 'Downtown Dubai': 'Downtown Dubai',
         'Dubai Land Residence Complex (DLRC)': 'Dubai Land Res.', 'Dubai Production City (IMPZ)': 'Production City', 'Barsha Heights (Tecom)': 'Barsha Heights', 'Dubai Investments Park (DIP)': 'Investments Park',
         'Dubai World Trade Centre (DWTC)': 'World Trade Centre', 'Dubai Design District (D3)': 'Design District', 'Jumeirah Bay Islands': 'Jumeirah Bay', 'Madinat Jumeirah Living': 'Madinat Jumeirah', 'Dubai Creek Harbour': 'Creek Harbour',
         'Grand Polo Club & Resort': 'Grand Polo Club', 'Dubai Sports City': 'Sports City', 'DAMAC Hills': 'Damac Hills', 'DAMAC Lagoons': 'Damac Lagoons', 'DAMAC Islands': 'Damac Islands', 'Bluewaters Island': 'Bluewaters'}
def smooth(vals):
    out = []
    for i, v in enumerate(vals):
        if v is None: out.append(None); continue
        num, den = 2 * v, 2
        for j in (i - 1, i + 1):
            if 0 <= j < len(vals) and vals[j] is not None: num += vals[j]; den += 1
        out.append(num / den)
    return out
data = []
for aid, hs in hits.items():
    b = defaultdict(list)
    for d, p, w in hs:
        qi = qidx(d)
        if 0 <= qi < 40: b[qi].append((p, w))
    raw = []; nn = []
    for qi in range(40):
        pr = [x for j in range(max(0, qi - W + 1), qi + 1) for x in b.get(j, [])]; n = sum(w for _, w in pr); nn.append(round(n))
        wq = min(qi + 1, W); raw.append(wmedian(pr) if len(pr) >= MIN_S * wq and n >= MIN_N * wq else None)
    if sum(1 for x in raw if x) < 3: continue
    filled = [False] * 40; i = 0                                  # a gap of 1-2 quarters between two valid windows (too few sales for a median) is bridged by a straight line
    while i < 40:
        if raw[i] is None and i > 0 and raw[i - 1] is not None:
            j = i
            while j < 40 and raw[j] is None: j += 1
            if j < 40 and j - i <= 2:
                for k in range(i, j): raw[k] = raw[i - 1] + (raw[j] - raw[i - 1]) * (k - i + 1) / (j - i + 1); filled[k] = True
            i = j
        else: i += 1
    sm = raw
    for _ in range(PASSES): sm = smooth(sm)
    name = areas[aid]['name']; short = SHORT.get(name) or re.sub(r'\s*\(.*?\)', '', name).strip()
    data.append(dict(id=aid, name=name, short=short, v=[None if x is None else round(x) for x in sm], raw=[None if x is None else round(x) for x in raw], n=nn, filled=filled))
out = dict(quarters=[qlabel(i) for i in range(40)], areas=data)
json.dump(out, open('../chart_data.json', 'w'), separators=(',', ':'))
print(len(data), 'areas with data')
for qi in (0, 6, 12, 18, 24, 30, 36, 39):
    top = sorted([(d['v'][qi], d['short'], d['n'][qi]) for d in data if d['v'][qi]], reverse=True)[:10]
    print(out['quarters'][qi], [(s, v, n) for v, s, n in top])
