# Renting + investing vs buying a home - Dubai, January 2003 to September 2026

31 s vertical reel (1080x1920, 30 fps), same format as the reference video (dark background, title + subtitle, two lines racing with a running date, end values, closing frame) but in our colours: green = Rent + Invest, violet = Home Equity (not the reference blue/orange), gold accents. Branding is only Abdullah Ahli's picture as the round gold-ring bubble we use in every reel (top left, then large in the middle for the closing frame); no handle, no logo. Quiet whoosh-only sound (`make_audio.py`, -26 dBFS peak).

Result at Sep 2026 (AED, same start cash of AED 260,000):
- **Rent + Invest** (S&P 500 total return): **3.47 M**
- **Home Equity** (value minus remaining loan): **3.24 M**
- Lead changes: home equity ahead from Jul 2003, S&P ahead from Aug 2020, equity ahead again May 2022, S&P ahead again May 2026.

## The model (`data/build_series.py`, monthly)
- A AED 1,000,000 home bought in Jan 2003; 20% down (AED 200K) + 6% fees (4% DLD transfer fee + 2% agent = AED 60K). The renter invests the same AED 260K in the S&P 500 (total return).
- Mortgage 80%, 25 years, variable: max(3.5%, US 3-month T-bill + 2.5%) (AED is pegged to USD, EIBOR follows US rates; US Treasury daily yield curve CSV, monthly average).
- Buyer pays mortgage + 1% of the home value per year for service charges/upkeep; renter pays rent = gross yield x current home value. Whoever pays less each month would invest the difference. **In Dubai the buyer is always the cheaper one, so the renter never adds money; the buyer's saved rent (about AED 9.7K a month by 2026: rent 17.0K vs mortgage + upkeep 7.3K) is NOT in the orange line.** The reel says so in the fine print ("Equity only"). Counting it would put buying far ahead (equity + invested savings about AED 9.7M by Sep 2026).
- No selling costs, no tax (UAE has no property tax).

## Where each number comes from
| Piece | Period | Source | Quality |
|-------|--------|--------|---------|
| Dubai sales price index | 2003-01 .. 2011-03 | REIDIN Dubai Residential Property Price Index (Jan 2003 = 100). Published points: peak about 240 in 2008 / Q3 2008 (Lahbash & Huston, ERES 2015, https://eres.scix.net/paper/eres2015_39; JLL via REIDIN), Q2 2010 174.74 and -0.84% y/y (so mid-2009 about 170), Jul 2010 167.77, Aug 2010 164.45 (REIDIN monthly releases), Dec 2010 156.19 (same paper) | **Only these points are published; the path between them is log-linear = ESTIMATED** (drawn dashed) |
| Dubai sales price index | 2011-03 .. 2022-11 | Dubai Land Department Mo'asher, monthly, all residential (`https://dubailand.gov.ae/umbraco/surface/indexes/getData?contentId=20409&indexType=monthly&group=all`; Jan 2012 = 1.000), scaled to the REIDIN Dec 2010 level at Mar 2011 | official monthly data |
| Dubai sales + rent price index | 2022-08 .. 2026-09 | REIDIN UAE Residential Property Price Report, monthly editions Jan 2023 - Sep 2026 (`reidin.com/wp-content/uploads/...`; Dubai, Jan 2014 = 100), growth chained from Nov 2022 | published monthly; **Oct 2025 - Mar 2026 editions were not on REIDIN's site: log-linear fill between Sep 2025 and Apr 2026** (+1.5% sales, +1.9% rent over the gap) |
| Rent | 2003 .. Jul 2022 | gross yield 6.9% of the home value (no public Dubai rent index before 2022) | **ASSUMPTION**, calibrated so the model reproduces REIDIN's published Dubai gross yield (7.20% Dec 2022, 6.17% Sep 2026); REIDIN's net yields for 2015-2025 are 6.0-6.4% (apartments) / 5.2-5.5% (villas) |
| Rent | Aug 2022 .. Sep 2026 | yield moves with REIDIN's rent index / sales index ratio | published |
| S&P 500 | 2003-01 .. 2026-09 | Shiller-style monthly series (github.com/datasets/s-and-p-500): price + dividends/12; after Jun 2023 (last dividend value) a flat 1.58% yield | real data, dividend yield after Jun 2023 assumed |
| T-bill | 2003 .. 2026 | US Treasury daily par yield curve, 3-month, monthly average | real |

Why it starts in January 2003 and not 2002: Dubai only opened freehold to foreign buyers in 2002 and the first month of the REIDIN price index is Jan 2003; nothing earlier is published. Why REIDIN and not Mo'asher after 2022: the Mo'asher endpoint stops at Nov 2022. REIDIN's and Mo'asher's levels differ from 2018 on (different methods: REIDIN median price per sqm, Mo'asher hedonic); the two are only joined by growth rates at Nov 2022 (overlap Aug-Nov 2022: REIDIN +3.5%, Mo'asher +2.9%).

Not found / not used: BIS and FRED have no usable UAE series any more, Bayut/DLD transaction records only start in late 2016, Dubai Statistics Center and Ejari rent history are not reachable. If REIDIN or DLD can supply the monthly 2003-2010 index and a Dubai rent index since 2003, drop them into `data/build_series.py` (PRE, Y0) and rebuild.

## Check before posting
- It is an illustrative investor model, not advice; the caption should say "illustrative, based on REIDIN and Dubai Land Department data" and carry the RERA/DLD advertising wording your permit needs.
- The orange line before Mar 2011 is estimated between REIDIN's published points (dashed on screen, noted in the fine print).

## Rebuild
```bash
python3 -I data/build_series.py                 # series.json (the model)
python3 -I make_chart_data.py                       # (run inside data/) series.json -> ../chart_data.json
node render.mjs --out build/stills --stills 3,12,24.6,29.5          # QA stills
node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5  # 930 frames, about 1 min
python3 -I make_audio.py build/mix.wav
bash encode.sh dubai-rent-vs-buy                                    # build/dubai-rent-vs-buy.mp4 (2.7 MB)
```
