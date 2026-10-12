#!/usr/bin/env python3
"""Summarize real transaction data for an area. Sources: DXP Interact API (env) or a CSV export.

CSV columns (case-insensitive): date, area, type, price_aed, size_sqft  [rent_aed optional]
API: GET $DXP_API_URL/transactions?area=...&type=... with header Authorization: Bearer $DXP_API_KEY,
returning a JSON list with the same keys. Adjust fetch_api() once the API docs are known.
"""
import argparse, csv, json, os, statistics, sys, urllib.parse, urllib.request

def fetch_api(area, typ):
    base, key = os.environ.get("DXP_API_URL"), os.environ.get("DXP_API_KEY")
    if not base or not key:
        return None
    url = f"{base.rstrip('/')}/transactions?" + urllib.parse.urlencode({"area": area, "type": typ})
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

# Column aliases so DLD (Dubai), ADREC/DARI (Abu Dhabi) and portal exports all load.
ALIASES = {
    "date": ["date", "instance_date", "transaction_date", "trans_date"],
    "area": ["area", "area_name_en", "community", "district", "location"],
    "type": ["type", "property_type_en", "prop_type", "unit_type"],
    "price_aed": ["price_aed", "actual_worth", "trans_value", "price", "amount"],
    "size_sqft": ["size_sqft", "procedure_area", "area_sqft", "size"],
}

def normalize(row):
    row = {k.strip().lower(): v for k, v in row.items() if k}
    out = {}
    for key, names in ALIASES.items():
        for n in names:
            if row.get(n) not in (None, ""):
                out[key] = row[n]; break
    # DLD publishes procedure_area in sq metres
    if "procedure_area" in row and "size_sqft" not in out and row.get("procedure_area"):
        try: out["size_sqft"] = float(row["procedure_area"]) * 10.7639
        except ValueError: pass
    return out

def read_csv(path):
    with open(path, newline="", encoding="utf-8-sig") as fh:
        return [normalize(r) for r in csv.DictReader(fh)]

def summarize(rows, area, typ):
    rows = [r for r in rows if area.lower() in str(r.get("area", "")).lower()
            and (not typ or typ.lower() in str(r.get("type", "")).lower())]
    psf, vals = [], []
    for r in rows:
        try:
            p, s = float(r["price_aed"]), float(r["size_sqft"])
            vals.append(p)
            if s > 0: psf.append(p / s)
        except (KeyError, ValueError):
            continue
    if not vals:
        return {"error": "no matching transactions", "area": area}
    dates = sorted(str(r.get("date", "")) for r in rows if r.get("date"))
    return {"area": area, "type": typ, "transactions": len(vals),
            "total_value_aed": round(sum(vals)),
            "median_price_aed": round(statistics.median(vals)),
            "median_psf_aed": round(statistics.median(psf)) if psf else None,
            "date_range": [dates[0], dates[-1]] if dates else None}

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--area", required=True); ap.add_argument("--type", default="")
    ap.add_argument("--csv", nargs="+", help="one or more exports (Dubai DLD, Abu Dhabi ADREC, ...)"); a = ap.parse_args()
    rows = [r for c in a.csv for r in read_csv(c)] if a.csv else fetch_api(a.area, a.type)
    if rows is None:
        sys.exit("NO MARKET DATA: set DXP_API_URL and DXP_API_KEY, or pass --csv <ADREC/DLD export>. Do not estimate.")
    print(json.dumps(summarize(rows, a.area, a.type), indent=2))
