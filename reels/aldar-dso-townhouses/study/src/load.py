"""Load the Bayut/DLD transaction pull (raw_all.json) into one clean DataFrame."""
import json, os, pandas as pd, numpy as np
SQM = 10.7639
LABEL = {  # key -> (short label, developer, product line)
 'Haven by Aldar|3': ('Haven', 'Aldar', 'villas & townhouses'),
 'Athlon by Aldar|3': ('Athlon', 'Aldar', 'villas & townhouses'),
 'The Wilds|3': ('The Wilds', 'Aldar', 'villas'),
 'Arabian Ranches 3|16': ('Arabian Ranches 3', 'Emaar', 'townhouses'),
 'The Valley|16': ('The Valley', 'Emaar', 'townhouses'),
 'DAMAC Lagoons|16': ('Damac Lagoons', 'Damac', 'townhouses'),
 'DAMAC Hills 2|16': ('Damac Hills 2', 'Damac', 'townhouses'),
 'Tilal Al Ghaf|16': ('Tilal Al Ghaf', 'Majid Al Futtaim', 'townhouses'),
 'Dubai South|16': ('Dubai South', 'mixed', 'townhouses'),
 'Dubai Silicon Oasis (DSO)|3': ('Dubai Silicon Oasis', 'mixed (older stock)', 'villas'),
}
def load(path):
    d = json.load(open(path)); rows = []
    for key, hits in d.items():
        comm, cat = key.split('|')
        for h in hits:
            rows.append(dict(key=key, id=h['transaction_hash_id'], date=h['date_transaction_nk'][:10],
              price=float(h['transaction_amount'] or 0), bua=float(h['builtup_area_sqm'] or 0) * SQM,
              beds=h['beds'], status=h['property_completion_status_sk'], mkt='Primary' if h['sale_market_name'].startswith('Primary') else 'Resale',
              prev=h['date_previous_sale_transaction_nk'],
              lat=float(h['bayut_latitude'] or 0), lon=float(h['bayut_longitude'] or 0)))
    df = pd.DataFrame(rows).drop_duplicates(['key', 'id'])
    df['date'] = pd.to_datetime(df['date']); df['q'] = df['date'].dt.to_period('Q')
    df['h'] = df['date'].dt.year.astype(str) + '-H' + ((df['date'].dt.month > 6) + 1).astype(str)
    df = df[(df.bua > 0) & (df.price > 0)].copy()
    df['psf'] = df['price'] / df['bua']
    med = df.groupby('key').psf.transform('median')          # drop bundle / data-entry outliers
    df = df[(df.psf > 0.4 * med) & (df.psf < 2.5 * med)].copy()
    return df
