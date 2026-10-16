# Aldar's next Dubai townhouse community: analytical study (16 Oct 2026)

`Aldar_Dubai_Townhouse_Study.pdf` (16 pages, A4, ~1.8 MB) is the deliverable. It compares Aldar's three Dubai launches (Haven, Athlon, The Wilds) and the unnamed fourth project near Dubai Silicon Oasis with tier-one townhouse communities (Emaar: The Valley, Arabian Ranches 3; Damac: Lagoons, Hills 2; MAF: Tilal Al Ghaf), using Dubai Land Department sale records.

**Headline (analyst estimate, not an Aldar price):** base case AED 1,400-1,650 per sq ft built-up (conservative 1,250-1,400, stretch 1,650-1,900) = AED 3.2-3.8m for a ~2,290 sq ft 3-bed. Aldar has registered AED 17.9bn / 3,552 new sales in Dubai; launch price per sq ft +11% then +38% launch to launch; resale growth +3-4% vs +9-13% at Emaar/Damac/MAF peers; first handover (Haven) due 2027.

## Rebuild
```bash
cd src
python3 -I pull_all.py                 # Bayut/DLD transactions -> raw_all.json (not committed, ~20 MB); needs bq.py
bash build.sh raw_all.json /tmp/tiles  # analyze -> charts -> HTML -> PDF (Playwright Chromium, Inter font)
NODE_PATH=$(npm root -g) node src/check_overflow.mjs study.html   # every page must report ok
```
- `src/analyze.py` writes `data/metrics.json` and the summary CSVs (price/sq ft bands, half-year medians, quarterly counts, 12-month momentum, resale behaviour, unit mix). No raw transaction rows are committed.
- `src/charts.py` makes the SVG charts and the Esri satellite locator map. Palette: dataviz reference instance, blue/orange/aqua/violet validated (adjacent pairs pass CVD and normal-vision floors); every series is also direct-labelled.
- `src/report.py` + `src/study.css` assemble the pages; `src/bluline.json` is the OpenStreetMap Blue Line alignment (from `../../dubai-ideal-time/outlines.json`).

## Method and caveats (also in the PDF)
- Size band 1,800-3,400 sq ft built-up, last 24 months, medians with the middle 50% of deals; 12-month momentum compares 17 Oct 2025-16 Oct 2026 with the 12 months before (>=20 deals).
- The project's name, size, price, payment plan and handover are NOT public (The National, 14 Oct 2026). "Greenwoods", ~8,000 homes and "under AED 3m" on third-party sites are unconfirmed and flagged as such.
- DLD registrations lag launches by 3-4 months. Aldar's announced figures are first-phase sell-outs; the register includes later phases.
- Haven/Athlon unit counts and buyer shares come from news-agency copies of Aldar's releases; The Wilds figures are from Aldar's own release PDF (5 Mar 2025).
- Sobha Hartland, Mudon, Nad Al Sheba, Dubai Hills Estate record under other categories and are not in the data set. Emaar's luxury The Oasis is context only.
- Not investment advice; check advertising rules (permit number, disclaimers) before using any of this publicly.
