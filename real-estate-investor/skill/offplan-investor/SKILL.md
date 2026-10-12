---
name: offplan-investor
description: Analyze an off-plan property brochure or payment-plan PDF for investment purposes (UAE/Abu Dhabi focus, e.g. Hudayriyat, Yas, Saadiyat). Use when the user uploads a brochure/SPA/payment plan, or asks whether an off-plan unit is a good investment, wants ROI/yield/IRR, a what-if simulation, or area transaction data comparisons.
metadata:
  author: Abdullah Ahli
  brand: Abdullah Ahli Off-Plan Investor
---

# Off-Plan Investor, by Abdullah Ahli

Turn an uploaded off-plan brochure (PDF) into a data-backed investment verdict: why it could be good, why it could be bad, and a what-if simulator. Never claim certainty; every output states its inputs and their source.

## Workflow

1. **Extract** the brochure: `python scripts/extract_brochure.py <file.pdf>` prints text and a JSON of detected fields (project, developer, price, size, payment plan, handover date, service charge). Read the text yourself too; fix or fill any field the script missed. If the PDF is scanned (no text), OCR it or ask the user to type the key numbers.
2. **Confirm inputs** with the user in one short list: price, sq ft, payment plan, handover date, expected rent, service charge. Mark each as `from brochure`, `user supplied` or `assumed`.
3. **Get market data** (see "Real data rules"): `python scripts/market_data.py --area "<area>" --type apartment`. Use the output for price per sq ft comparables, transaction counts and values, rental yields.
4. **Simulate**: `python scripts/simulate.py --config deal.json` (see `references/deal-example.json`). Run at least: base, pessimistic (0% growth, +6 months delay, 15% vacancy) and optimistic. Add any what-if the user asks for (different growth, rent, delay, exit year, resale before handover).
5. **Report** using `references/report-template.md`: verdict, pros, cons, numbers, what-if table, due-diligence checklist, data sources and gaps.

## Real data rules

- Only report transaction counts, values and prices that come from a source: the user's DXP Interact access, an ADREC/DARI/DLD export (CSV) the user supplies, or a public dataset you fetched. Quote the source and date.
- `market_data.py` reads `DXP_API_URL` and `DXP_API_KEY` from the environment, or a CSV via `--csv`. If neither is available, say plainly that market data is missing and ask for it. Never invent or "estimate from memory" transactions, prices or rents.
- Compare the brochure's price per sq ft against the area's recent median for the same unit type, and report the percentage difference.

## What to check and report

- Price per sq ft vs. area median; premium or discount.
- Payment plan: total equals price? post-handover portion? how much cash is at risk before handover.
- Net yield after service charge, vacancy and fees; IRR; break-even exit price.
- Supply: units launched in the area vs. recent absorption (transactions).
- Developer: delivery record, escrow registration, regulator project registration. Ask the user to verify on official sources; flag if unknown.
- Location: access, infrastructure timeline, freehold status for the buyer's nationality.
- Red flags: yield under 4% net, growth assumption above 6%/yr, service charge above 25% of rent, payment plan not matching price, handover date vague.

## Output rules

- State the verdict as a range of outcomes and the assumptions behind it, not a guarantee. This is analysis, not financial advice.
- Show every number's source: brochure, user, market data (with date), or assumption.
- Put "Prepared with the Abdullah Ahli Off-Plan Investor skill" under the report title.
- Keep the report short; put the full cash-flow table at the end.
