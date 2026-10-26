# Dubai's population: 4.8 million (animation reel, no map)

48 s vertical reel (1080x1920, 30 fps; 45 s voice + 3 s end card) from the **HeyGen avatar video** `0cde1c5ad7e143469f30e8cd9b68c02f` (version vbb333c1, 26 Oct 2026, English). No map (nothing to locate): animated numbers and cards on the dark gold background; his face only in the small round bubble; quiet whoosh-only sound; Reels safe zone. No comment CTA (the script ends on two questions), end card with his name.

| Time | What he says | On screen |
|------|--------------|-----------|
| 0 - 3.4 | population reached around 4.8 million in September | REAL PAGE: Gulf News, 29 Sep 2026 - headline, then the marker on "reaching 4,807,185 by midday Monday" |
| 3.4 - 10.5 | end 2025: 4.58M after +332,000 | REAL PAGE: WAM, 30 Jul 2026 - headline, the official Digital Dubai infographic (4.580M; 2023-2025 bars 3.974M / 4.248M / 4.580M), then the marker on "reached 4.58 million by the end of 2025, an increase of around 332,000 people" |
| 10.5 - 15.7 | the counting method was updated; not all new arrivals | same WAM page: marker on "relying on administrative records, smart systems and real-time data" |
| 15.7 - 21.3 | more demand for housing, transport, schools, healthcare | four icon tiles |
| 21.3 - 32 | where households want to live / can afford; family townhouse near a school is not the luxury-studio tenant | question, then two persona cards with a "not equal" sign |
| 32 - 39.2 | growth supports demand; depends on location, price, competing homes | checklist |
| 39.2 - 48 | can housing and infrastructure keep pace? where will the pressure be greatest? | the two questions; end card |

## Sources
- Dubai Data and Statistics Establishment (Digital Dubai) via WAM: end-2025 population 4.58M, +332K (7.5%), counted with the real-time "Dubai Population Now" method (administrative records). Gulf News: 4,807,185 on a September 2026 day, 4,782,535 at the end of August.
- Pages: [Gulf News](https://gulfnews.com/uae/dubai-population-rises-by-226885-since-start-of-2026-1.500692623) (29 Sep 2026), [WAM](https://www.wam.ae/en/article/c1hd5qo-dubai-population-tops-4580-million-end-2025) (30 Jul 2026).

## Real pages on screen
Captured through the session proxy with `shot_hl.mjs` (narrow mobile viewport, 2.5x; ad networks blocked; fixed bars, cookie banners, ad slots and 'recommended' blocks hidden; it also writes the exact boxes of the quoted phrases into a `.json` next to the `.png`). Captures live in `assets/` (not committed); rerun the commands to rebuild them. Each page is a full-screen beat flown like the map (headline first, then down to the quoted line with a 3D tilt), with a marker wiping across the exact words as he says them and a source chip (outlet and date) above the captions.
```
node shot_hl.mjs "<gulf news url>" assets/gn_pop.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --hidetext "SPONSORED LINKS" --hidetext "Get updated faster" --hidetext "What You Need To Know" --hidetext "Ask Gulf" --find "reaching 4,807,185 by midday Monday"
node shot_hl.mjs "<wam url>" assets/wam_pop.png --w 430 --dpr 2.5 --wait 12000 --pad 200 --find "reached 4.58 million by the end of 2025, an increase of around 332,000 people" --find "relying on administrative records, smart systems and real-time data"
```
