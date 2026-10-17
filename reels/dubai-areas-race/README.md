# Dubai: price per sq ft, top 10 areas, Q4 2016 - Q3 2026

38.5 s vertical reel (1080x1920, 30 fps, 3.8 MB), bar-chart race in the style of the reference video but with our own colours: horizontal bars grow from the left, the **area name sits on the left of each bar**, rows re-rank every quarter (whoever has the higher number moves up), the number inside each bar counts up and down, big quarter label underneath. Branding = Abdullah Ahli's round gold-ring picture (top left, then big in the middle for the closing frame). Quiet whoosh-only sound (`make_audio.py`, -26 dBFS peak). 10 bars on screen (15 was tried: the text drops to about 20 px, see `build/compare_10_vs_15.png`; `node render.mjs --layout 15` renders that variant).

## What the numbers are
For every community and every quarter: the **median price per sq ft of built-up area** of the homes sold, taken over a **rolling 12-month window** (that quarter + the 3 before it), apartments + villas + townhouses pooled with their real mix. Source: the Dubai Land Department sales records as published on Bayut's public transactions page (`https://www.bayut.com/api/transactions`, no key, the same call the page itself makes).

Result: Downtown Dubai leads in Q4 2016 at AED 1,840 (10th place AED 1,243); the lead then changes 9 times (Bluewaters, Dubai Harbour, Palm Jumeirah, Jumeirah) and in Q3 2026 Bluewaters leads at AED 5,148 with Sheikh Zayed Road, Palm Jumeirah, La Mer and Dubai Harbour behind it (10th place AED 3,187). 47 communities have data, **30 of them reach the top 10** at some point. All captions in the video are computed from the data (first leader, "X takes the lead", 10th place then and now).

## Method (data/)
1. `discover.py` / `idmap.py` / `idmap2.py`: 114 community names seen in the feed (+ a few well-known premium ones added by hand) -> Bayut community ids read from the public transaction pages. 109 ids found; **no page / id found for Jumeirah Bay Islands, Grand Polo Club, Nad Al Sheba Gardens, Barsha South, Dubai Healthcare City, Dubai Water Canal, DAMAC Islands, DAMAC Riverside**, so they are not in the race (Jumeirah Bay Islands is the one that could have ranked high).
2. `pull_areas.py counts|pilot|full`. The feed returns 20 sales a page, sorted by date, **at most 500 pages deep**, and only has time windows of 1/3/6/12/36/60/120 months (120 = everything, it starts **2 Oct 2016**; that is why there is nothing for 2015). So: counts per community and home type; a pilot of 20 pages per community x type; `select_areas.py` keeps every community that is among the 18 highest-priced in any calendar year (51 kept); for those, every K-th page (K chosen so that about 120 pages are read) of everything reachable (oldest 10k, newest 10k, plus the windows starting Oct 2021 / Oct 2023 / Oct 2025). Types with more than 20k sales are split by number of bedrooms first. 111 pieces, 159,749 sampled sales out of 472,689 in those pieces. Every sampled sale carries the weight K, so pooled medians and sale counts are position-uniform estimates, not just samples.
3. **Only homes**: property types 4 (apartment), 3 (villa/townhouse) and 18 (penthouse-type unit). Hotel apartments (type 21, e.g. studios in Sky Central Hotel at AED 4,200 per sq ft, which made Barsha Heights look like the most expensive area in 2016) and plots (14) are dropped. Sales without a built-up area, under 15 sq m, or outside AED 150-30,000 per sq ft are dropped.
4. `build_series.py 0 4` -> `chart_data.json`: quarter by date of sale, weighted median over the rolling 12-month window; a window needs about 25 sales per quarter in it and 10 sampled ones, else that quarter is empty for the area (the bar fades out / in). **Gaps of 1-2 quarters between two valid windows are bridged by a straight line** (9 area-quarters of 1,880; 4 of the 400 top-10 slots). Oct 2026 (Q4, 16 days) is not shown.
5. `chart.js` ranks by value at every quarter; in each 0.8 s step all bars move to their new value and row together for 0.4 s, then rest.
6. **Areas that did not exist yet / have no data yet stay empty, then grow from zero**: over the 3 quarters before an area's first valid data point its bar and number climb from 0 and land exactly on the real value (e.g. Bluewaters, Dubai Harbour, La Mer, Palm Jebel Ali). The numbers shown during that climb are animation, not data; from the first data point on every number is real. After an area's last data point its bar shrinks to 0 within one step, so no area is ever shown with a number it does not have.

## Why not 2010
The sales feed starts on 2 Oct 2016. For 2010-2016 no free area-by-area prices are reachable: the official DLD open-data set on Dubai Pulse needs a permission request (up to 14 days) and the transaction portal sits behind a captcha; REIDIN only publishes city-wide indices (and only back to 2023 on its site); the broker reports found are asking prices or a handful of areas. Back-casting areas from a city index would make up the ranking, so it is not done. If you get the DLD open-data transactions CSV (Dubai Pulse, "DLD transactions") or any area-level export for 2010-2016, `build_series.py` only needs a new reader to extend the race.

## Caveats (say so if asked)
- **Sampled, not complete**: medians come from about a third of the sales (every K-th page), so a bar can be off by a few per cent; small areas (Bluewaters, La Mer, Jumeirah, Emirates Hills have only 100-300 sales in 12 months) move more than big ones. Rankings between neighbours that are within about 2-3% are not meaningful.
- Price per sq ft is the registered sale price over the built-up area, off-plan primary sales included; areas where new luxury towers launch (Bluewaters, Dubai Harbour, Palm Jebel Ali) rise because of the new product, not only because the same flats got dearer.
- "Jumeirah" is the whole Jumeirah 1-3 villa district; "Sheikh Zayed Road" includes its branded towers.
- Plausibility-checked, not audited against DLD's own dashboards.
- It is an illustration of recorded sales, not advice; post it with the RERA/DLD advertising wording your permit needs ("Source: Dubai Land Department transaction records").
- Bayut's page is a third-party view of public DLD data: check its terms before re-publishing the raw data. The page config also carries third-party keys; none are used or stored here.

## Rebuild
```bash
cd data
python3 -I discover.py && python3 -I idmap.py && python3 -I idmap2.py     # communities + ids (about 3 min)
python3 -I pull_areas.py counts && python3 -I pull_areas.py pilot && python3 -I select_areas.py && python3 -I pull_areas.py full   # about 12 min, resumable (cache2.json)
python3 -I build_series.py 0 4                                             # -> ../chart_data.json
cd .. && node render.mjs --out build/stills --stills 2,12,25,33.8 --ss 1  # QA stills
node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5          # 1155 frames, about 1 min
python3 -I make_audio.py build/mix.wav && bash encode.sh dubai-areas-race
```
