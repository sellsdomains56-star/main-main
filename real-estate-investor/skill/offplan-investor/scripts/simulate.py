#!/usr/bin/env python3
"""What-if simulator for an off-plan deal. usage: simulate.py --config deal.json"""
import argparse, json

def irr(cf):
    npv = lambda r: sum(a / (1 + r) ** (m / 12) for m, a in cf)
    lo, hi = -0.9, 5.0
    if npv(lo) * npv(hi) > 0: return None
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (lo, mid) if npv(lo) * npv(mid) <= 0 else (mid, hi)
    return (lo + hi) / 2

def run(d, delay=0, growth=None, vacancy=None, rent=None, hold=None):
    P, S = d["price"], d["sqft"]
    growth = d["growth_pct"] if growth is None else growth
    vacancy = d["vacancy_pct"] if vacancy is None else vacancy
    rent = d["annual_rent"] if rent is None else rent
    hold = d["hold_years"] if hold is None else hold
    H = d["handover_month"] + delay
    plan = [(m + (delay if m >= d["handover_month"] else 0), a) for m, a in d["plan"]]
    fees = P * d["fees_pct"] / 100
    cf = [(m, -a) for m, a in plan]
    cf[0] = (cf[0][0], cf[0][1] - fees)
    net = rent * (1 - vacancy / 100) - d["service_charge_psf"] * S
    cf += [(H + 12 * y, net) for y in range(1, hold + 1)]
    exit_v = P * (1 + growth / 100) ** (H / 12 + hold) * (1 - d["selling_cost_pct"] / 100)
    cf.append((H + 12 * hold, exit_v))
    r = irr(cf)
    return {"irr_pct": None if r is None else round(r * 100, 1),
            "profit_aed": round(sum(a for _, a in cf)),
            "net_yield_pct": round(net / (P + fees) * 100, 1),
            "exit_value_aed": round(exit_v),
            "plan_total_matches_price": abs(sum(a for _, a in plan) - P) < 1}

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--config", required=True)
    d = json.load(open(ap.parse_args().config))
    scen = {"base": {}, "pessimistic": {"delay": 6, "growth": 0, "vacancy": 15},
            "optimistic": {"growth": d["growth_pct"] + 3, "vacancy": 5}}
    scen.update(d.get("what_if", {}))
    print(json.dumps({k: run(d, **v) for k, v in scen.items()}, indent=2))
