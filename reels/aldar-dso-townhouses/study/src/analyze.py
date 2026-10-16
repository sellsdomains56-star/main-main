"""Compute every number used in the study. Usage: python3 -I analyze.py <raw_all.json> <out_dir>
Writes metrics.json plus small summary CSVs (no raw transaction rows)."""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, pandas as pd
from load import load, LABEL

raw, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
df_all = json.load(open(raw)); n_raw = sum(len(v) for v in df_all.values())
df = load(raw)
KEYS = list(LABEL)
d = df[df.key.isin(KEYS)].copy()
TODAY = pd.Timestamp('2026-10-16')
M = {'n_raw_rows': n_raw, 'n_clean': int(len(df)), 'n_peer_set': int(len(d)),
     'date_min': str(d.date.min().date()), 'date_max': str(d.date.max().date())}

def hav(lat1, lon1, lat2, lon2):
    R = 6371.0; p = math.pi / 180
    a = math.sin((lat2 - lat1) * p / 2) ** 2 + math.cos(lat1 * p) * math.cos(lat2 * p) * math.sin((lon2 - lon1) * p / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))

# --- location: distance to DSO centre and to the Blue Line alignment (OSM geometry from the Dubai reel)
DSO = (25.1272, 55.3946)
ol = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bluline.json')))
pts = []
for seg in ol.values():
    for (x0, y0), (x1, y1) in zip(seg[:-1], seg[1:]):
        for t in np.linspace(0, 1, 12): pts.append((y0 + (y1 - y0) * t, x0 + (x1 - x0) * t))
cent = d.groupby('key').agg(lat=('lat', 'median'), lon=('lon', 'median'))
loc = {}
for k, r in cent.iterrows():
    loc[k] = dict(lat=r.lat, lon=r.lon, km_dso=hav(r.lat, r.lon, *DSO), km_blue=min(hav(r.lat, r.lon, a, b) for a, b in pts))
M['loc'] = loc

# --- price per sq ft today: size-banded (1,800-3,400 sq ft built-up), last 24 months
LO, HI, SINCE = 1800, 3400, pd.Timestamp('2024-10-17')
b = d[(d.bua >= LO) & (d.bua <= HI) & (d.date >= SINCE)]
rows = []
for (k, m), g in b.groupby(['key', 'mkt']):
    rows.append(dict(key=k, mkt=m, n=len(g), psf=g.psf.median(), p25=g.psf.quantile(.25), p75=g.psf.quantile(.75), price=g.price.median(), bua=g.bua.median()))
band = pd.DataFrame(rows); band.to_csv(f'{out}/psf_band_24m.csv', index=False, float_format='%.0f')
M['band'] = band.to_dict('records')

# --- half-year medians (n >= 10), same size band as above so unit-size mix does not move the line
hy = d[(d.bua >= LO) & (d.bua <= HI)].groupby(['key', 'mkt', 'h']).agg(n=('id', 'count'), psf=('psf', 'median'), price=('price', 'median')).reset_index()
hy = hy[hy.n >= 10]; hy.to_csv(f'{out}/psf_halfyear.csv', index=False, float_format='%.0f'); M['hy'] = hy.to_dict('records')

# --- quarterly registered transactions and value
qq = d.groupby(['key', 'mkt', 'q']).agg(n=('id', 'count'), value=('price', 'sum')).reset_index(); qq['q'] = qq.q.astype(str)
qq.to_csv(f'{out}/quarterly.csv', index=False, float_format='%.0f'); M['q'] = qq.to_dict('records')

# --- trailing-12m vs prior-12m
Lw = d[(d.date >= '2025-10-17') & (d.date < '2026-10-17')]; Pw = d[(d.date >= '2024-10-17') & (d.date < '2025-10-17')]
mom = []
for k in KEYS:
    for m in ('Primary', 'Resale'):
        a = Lw[(Lw.key == k) & (Lw.mkt == m)]; p = Pw[(Pw.key == k) & (Pw.mkt == m)]
        mom.append(dict(key=k, mkt=m, n_l=len(a), n_p=len(p), psf_l=a.psf.median() if len(a) else None, psf_p=p.psf.median() if len(p) else None,
                        val_l=a.price.sum() / 1e9, val_p=p.price.sum() / 1e9))
mom = pd.DataFrame(mom); mom['yoy_psf'] = (mom.psf_l / mom.psf_p - 1) * 100
mom.to_csv(f'{out}/momentum_12m.csv', index=False, float_format='%.2f'); M['mom'] = mom.replace({np.nan: None}).to_dict('records')

# --- resale behaviour: share, holding period
beh = []
for k in KEYS:
    g = d[d.key == k]; r = g[g.mkt == 'Resale'].copy()
    r['prev'] = pd.to_datetime(r.prev, errors='coerce'); r = r[r.prev > '2015-01-01']; hold = (r.date - r.prev).dt.days
    beh.append(dict(key=k, n=len(g), n_primary=int((g.mkt == 'Primary').sum()), n_resale=int((g.mkt == 'Resale').sum()),
                    resale_share=(g.mkt == 'Resale').mean() * 100, hold_med=hold.median() if len(hold) else None, hold_n=int(len(hold)),
                    val_primary=g[g.mkt == 'Primary'].price.sum() / 1e9, val_resale=g[g.mkt == 'Resale'].price.sum() / 1e9,
                    first_primary=str(g[g.mkt == 'Primary'].date.min().date()) if (g.mkt == 'Primary').any() else None,
                    last_primary=str(g[g.mkt == 'Primary'].date.max().date()) if (g.mkt == 'Primary').any() else None))
beh = pd.DataFrame(beh); beh.to_csv(f'{out}/behaviour.csv', index=False, float_format='%.2f'); M['beh'] = beh.replace({np.nan: None}).to_dict('records')

# --- Aldar launches: announced vs DLD-registered
ANN = {'Haven by Aldar|3': ('2023-11-01', 786, 3.1), 'Athlon by Aldar|3': ('2024-05-09', 1000, 4.1), 'The Wilds|3': ('2025-03-05', 734, 5.0)}
L = {}
for k, (a, units, bn) in ANN.items():
    p = d[(d.key == k) & (d.mkt == 'Primary')].copy(); p['m'] = (p.date - pd.Timestamp(a)).dt.days / 30.44
    cum = [dict(m=int(m), n=int((p.m <= m).sum()), bn=float(p[p.m <= m].price.sum() / 1e9)) for m in range(0, 37, 1)]
    L[k] = dict(announce=a, units=units, bn=bn, first_reg_month=float(p.m.min()), n_all=int(len(p)), bn_all=float(p.price.sum() / 1e9), cum=cum,
                at12=next(c for c in cum if c['m'] == 12), psf_med=float(p.psf.median()), months_since=float((TODAY - pd.Timestamp(a)).days / 30.44))
    # curve for chart (daily)
    ps = p.sort_values('m'); L[k]['curve'] = [[float(m), i + 1, float(c / 1e9)] for i, (m, c) in enumerate(zip(ps.m, ps.price.cumsum()))][::4]
M['aldar'] = L

# --- typical unit by bedrooms in Aldar's Dubai communities (primary)
ub = []
for k in ('Haven by Aldar|3', 'Athlon by Aldar|3', 'The Wilds|3'):
    p = d[(d.key == k) & (d.mkt == 'Primary')]
    for bd, g in p.groupby('beds'):
        if len(g) >= 20: ub.append(dict(key=k, beds=bd, n=len(g), bua=g.bua.median(), price=g.price.median(), psf=g.psf.median()))
ub = pd.DataFrame(ub); ub.to_csv(f'{out}/unit_mix.csv', index=False, float_format='%.0f'); M['unit_mix'] = ub.to_dict('records')

# --- scenarios for the DSO project (analyst estimate; anchors come from the data above)
def bp(k, m):
    r = band[(band.key == k) & (band.mkt == m)]; return float(r.psf.iloc[0])
anch = dict(haven_primary=bp('Haven by Aldar|3', 'Primary'), athlon_primary=bp('Athlon by Aldar|3', 'Primary'), wilds_primary=bp('The Wilds|3', 'Primary'),
            haven_resale=bp('Haven by Aldar|3', 'Resale'), athlon_resale=bp('Athlon by Aldar|3', 'Resale'), valley_resale=bp('The Valley|16', 'Resale'),
            ara3_resale=bp('Arabian Ranches 3|16', 'Resale'), lagoons_primary=bp('DAMAC Lagoons|16', 'Primary'), lagoons_resale=bp('DAMAC Lagoons|16', 'Resale'),
            tilal_resale=bp('Tilal Al Ghaf|16', 'Resale'))
anch['wilds_latest'] = float(hy[(hy.key == 'The Wilds|3') & (hy.mkt == 'Primary') & (hy.h == '2026-H1')].psf.iloc[0])
M['anchors'] = anch
rnd = lambda x: int(round(x / 50.0) * 50)
SC = [dict(name='Conservative', lo=rnd(anch['haven_primary']), hi=rnd(anch['valley_resale']), why='priced like Haven and Athlon at launch; a soft market forces sharper pricing'),
      dict(name='Base case', lo=rnd(anch['valley_resale']), hi=1650, why='a step above Athlon (Blue Line access, newer phase), still capped by what 2-3 year old Emaar townhouses resell for'),
      dict(name='Stretch', lo=1650, hi=1900, why='Wilds-style premium positioning (Wilds new sales reached about 2,040 in 2026); needs a strong launch event and a landmark product')]
M['scenarios'] = SC
um = ub.set_index(['key', 'beds'])
# reference sizes: median built-up of 3- and 4-bed units across Haven + Athlon primary
sz = {}
for bd in ('3', '4', '5'):
    sub = d[(d.key.isin(['Haven by Aldar|3', 'Athlon by Aldar|3'])) & (d.mkt == 'Primary') & (d.beds == bd)]
    sz[bd] = float(sub.bua.median())
M['ref_sizes'] = sz
# --- totals, completed-stock evidence, The Oasis context (Emaar luxury villas, shown for scale only)
al = [k for k in KEYS if LABEL[k][1] == 'Aldar']
M['totals'] = dict(aldar_units=int(sum(L[k]['n_all'] for k in al)), aldar_bn=float(sum(L[k]['bn_all'] for k in al)))
M['unit_size'] = {k: float(d[d.key == k].bua.median()) for k in KEYS}
M['ready'] = {k: dict(n_ready=int((d[d.key == k].status == 'ready').sum()), n=int((d.key == k).sum())) for k in KEYS}
oa = df_all.get('The Oasis|3', [])
ps = [float(h['transaction_amount']) for h in oa if h['sale_market_name'].startswith('Primary')]
M['oasis'] = dict(n_primary=len(ps), bn_primary=sum(ps) / 1e9, median_price=float(np.median([float(h['transaction_amount']) for h in oa])) if oa else None)
json.dump(M, open(f'{out}/metrics.json', 'w'), indent=1, default=float)
print('OK', M['n_raw_rows'], M['n_clean'], M['n_peer_set'], sz, anch)
