#!/usr/bin/env python3
"""Dubai: renting + investing vs buying a home, monthly, Jan 2003 - Sep 2026.
Inputs are in raw/ (see ../README.md for sources). Output: series.json (+ prints a summary).
Run: python3 -I build_series.py"""
import json, csv, math, datetime as dt

# ---------------------------------------------------------------- months
def mkey(y, m): return f"{y:04d}-{m:02d}"
MONTHS = [mkey(y, m) for y in range(2003, 2027) for m in range(1, 13) if mkey(y, m) <= "2026-09"]
IDX = {k: i for i, k in enumerate(MONTHS)}
def mnum(k): y, m = k.split("-"); return int(y) * 12 + int(m) - 1

def interp_log(anchors, k):
    """log-linear interpolation between (month, value) anchors."""
    n = mnum(k)
    for (k0, v0), (k1, v1) in zip(anchors, anchors[1:]):
        if mnum(k0) <= n <= mnum(k1):
            t = 0 if mnum(k1) == mnum(k0) else (n - mnum(k0)) / (mnum(k1) - mnum(k0))
            return math.exp(math.log(v0) * (1 - t) + math.log(v1) * t)
    raise KeyError(k)

# ---------------------------------------------------------------- 1) Dubai sales price index
# (a) 2003-01 .. 2011-03: REIDIN Dubai Residential Property Price Index (Jan 2003 = 100), published points only:
#     Jan 2003 = 100 (base) | peak ~240 in Q3 2008 (Lahbash & Huston, ERES 2015; JLL/REIDIN put the peak in Q3 2008)
#     Q2 2010 = 174.74 and -0.84% y/y  ->  mid-2009 level ~170 | Jul 2010 = 167.77, Aug 2010 = 164.45 (REIDIN monthly releases)
#     Dec 2010 = 156.19 (Lahbash & Huston).  Path BETWEEN these points is log-linear (estimated).
PRE = [("2003-01", 100.0), ("2008-08", 240.0), ("2009-06", 170.0), ("2010-07", 167.77),
       ("2010-08", 164.45), ("2010-12", 156.19), ("2011-03", 156.19)]
# (b) 2011-03 .. 2022-11: Dubai Land Department Mo'asher sales price index, monthly, all residential (Jan 2012 = 1.000)
dld = {r["monthDate"][:7]: r["index"] for r in json.load(open("raw/dld_mosher_sales_index_all_monthly.json"))}
# (c) 2022-11 on: REIDIN UAE Residential Property Price Report, Dubai residential sales price index (Jan 2014 = 100),
#     read from the monthly editions Jan 2023 ... Sep 2026 (6-month charts + the "from A to B" lines)
REI_SALES = {"2022-08": 88.81, "2022-09": 89.82, "2022-10": 90.98, "2022-11": 91.92, "2022-12": 92.49, "2023-01": 94.68,
             "2023-02": 95.89, "2023-03": 97.65, "2023-04": 99.40, "2023-05": 101.17, "2023-06": 102.36, "2023-07": 104.42,
             "2023-08": 106.24, "2023-09": 107.41, "2023-10": 108.38, "2023-11": 109.32, "2023-12": 111.12, "2024-01": 112.86,
             "2024-02": 115.38, "2024-03": 117.87, "2024-04": 120.00, "2024-05": 121.53, "2024-06": 124.11, "2024-07": 125.39,
             "2024-08": 127.85, "2024-09": 128.27, "2024-10": 129.92, "2024-11": 130.60, "2024-12": 131.15, "2025-01": 133.43,
             "2025-02": 135.58, "2025-03": 137.34, "2025-04": 138.66, "2025-05": 140.50, "2025-06": 141.10, "2025-07": 142.02,
             "2025-08": 143.81, "2025-09": 144.89,
             "2026-04": 147.10, "2026-05": 145.53, "2026-06": 143.73, "2026-07": 142.80, "2026-08": 142.69, "2026-09": 143.05}
REI_RENT = {"2022-08": 86.65, "2022-09": 88.79, "2022-10": 90.57, "2022-11": 92.12, "2022-12": 93.83, "2023-01": 96.88,
            "2023-02": 98.32, "2023-03": 99.68, "2023-04": 101.40, "2023-05": 102.36, "2023-06": 103.38, "2023-07": 104.47,
            "2023-08": 105.43, "2023-09": 107.12, "2023-10": 108.40, "2023-11": 109.82, "2023-12": 111.59, "2024-01": 115.28,
            "2024-02": 118.36, "2024-03": 120.82, "2024-04": 122.44, "2024-05": 123.93, "2024-06": 125.20, "2024-07": 125.51,
            "2024-08": 126.06, "2024-09": 126.76, "2024-10": 127.09, "2024-11": 128.32, "2024-12": 129.08, "2025-01": 131.72,
            "2025-02": 132.69, "2025-03": 133.85, "2025-04": 134.39, "2025-05": 134.46, "2025-06": 134.16, "2025-07": 133.59,
            "2025-08": 133.41, "2025-09": 133.94,
            "2026-04": 136.46, "2026-05": 133.62, "2026-06": 130.74, "2026-07": 128.30, "2026-08": 126.68, "2026-09": 124.82}
GAP = ("2025-09", "2026-04")                     # no REIDIN edition in the library for Oct 2025 .. Mar 2026: log-linear fill
def rei_full(d):
    out = dict(d)
    for k in MONTHS:
        if mnum(GAP[0]) < mnum(k) < mnum(GAP[1]):
            out[k] = interp_log([(GAP[0], d[GAP[0]]), (GAP[1], d[GAP[1]])], k)
    return out
REI_SALES, REI_RENT = rei_full(REI_SALES), rei_full(REI_RENT)

P = {}                                           # Dubai price index, Jan 2003 = 100
for k in MONTHS:
    if k < "2011-03":   P[k] = interp_log(PRE, k)
    elif k <= "2022-11": P[k] = dld[k] * (156.19 / dld["2011-03"])
    else:               P[k] = P["2022-11"] * REI_SALES[k] / REI_SALES["2022-11"]

# ---------------------------------------------------------------- 2) rent: gross yield on current value
Y0 = 0.069   # gross yield before Aug 2022. Calibrated so the model reproduces REIDIN's published Dubai gross yield
             # (Dec 2022 7.20 %, Sep 2026 6.17 %) when the REIDIN rent/sales index ratio is applied from Aug 2022.
RATIO0 = REI_RENT["2022-08"] / REI_SALES["2022-08"]
YIELD = {k: Y0 * ((REI_RENT[k] / REI_SALES[k]) / RATIO0 if k >= "2022-08" else 1.0) for k in MONTHS}

# ---------------------------------------------------------------- 3) investing: S&P 500 total return (USD = AED peg)
sp = {r["Date"][:7]: (float(r["SP500"]), float(r["Dividend"])) for r in csv.DictReader(open("raw/sp500_monthly_shiller_style.csv"))}
last_div_yield = max(((d / p) for k, (p, d) in sp.items() if d > 0 and k >= "2023-01"), default=0.0158)
last_div_yield = [d / p for k, (p, d) in sorted(sp.items()) if d > 0][-1]       # Jun 2023 (last month with a dividend figure)
def sp_tr(k, prev):
    p, d = sp[k]; pp = sp[prev][0]
    if d <= 0: d = last_div_yield * p
    return (p + d / 12.0) / pp - 1.0

# ---------------------------------------------------------------- 4) mortgage rate
tb = json.load(open("raw/us_tbill_3m_monthly_avg.json"))
def mort_rate(k): return max(0.035, tb[k] / 100.0 + 0.025)

# ---------------------------------------------------------------- 5) simulation
H0 = 1_000_000.0; DOWN = 0.20; CLOSING = 0.06; TERM = 300; UPKEEP = 0.010
loan = H0 * (1 - DOWN); renter = H0 * DOWN + H0 * CLOSING; buyer_inv = 0.0
rows = []
for i, k in enumerate(MONTHS):
    H = H0 * P[k] / 100.0
    if i > 0:
        tr = sp_tr(k, MONTHS[i - 1]); renter *= 1 + tr; buyer_inv *= 1 + tr
    r = mort_rate(k) / 12.0; n_left = TERM - i
    pay = loan * r / (1 - (1 + r) ** -n_left) if n_left > 0 and loan > 0 else 0.0
    interest = loan * r
    upkeep = UPKEEP * H / 12.0
    buy_cost = pay + upkeep
    rent = YIELD[k] * H / 12.0
    if i > 0:      # contributions at month end of the month just paid
        diff = buy_cost - rent
        if diff > 0: renter += diff
        else:        buyer_inv += -diff
    loan = loan - (pay - interest)
    equity = H - loan
    rows.append(dict(m=k, price_idx=round(P[k], 3), home=round(H), loan=round(loan), equity=round(equity),
                     rent_m=round(rent), buy_cost_m=round(buy_cost), mort_rate=round(mort_rate(k) * 100, 2), gross_yield=round(YIELD[k] * 100, 2),
                     renter=round(renter), buyer_inv=round(buyer_inv), buyer_nw=round(equity + buyer_inv)))
json.dump(dict(assumptions=dict(home_price_aed=H0, down=DOWN, closing=CLOSING, term_months=TERM, upkeep=UPKEEP, gross_yield_pre_2022_08=Y0,
                               mortgage="max(3.5%, US 3M T-bill + 2.5%)", sp500_div_yield_after_2023_06=last_div_yield), months=rows),
          open("series.json", "w"), indent=0)
if __name__ == "__main__":
    for k in ["2003-01", "2005-01", "2008-08", "2010-12", "2011-03", "2014-09", "2018-01", "2020-06", "2022-11", "2023-06", "2025-09", "2026-09"]:
        r = rows[IDX[k]]; print(k, "P", r["price_idx"], "home", r["home"], "equity", r["equity"], "renter", r["renter"], "buyerNW", r["buyer_nw"], "buy_m", r["buy_cost_m"], "rent_m", r["rent_m"], "yld", r["gross_yield"], "rate", r["mort_rate"])
    print("last_div_yield", round(last_div_yield, 4))
