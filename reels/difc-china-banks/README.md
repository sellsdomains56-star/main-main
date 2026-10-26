# China's biggest banks in DIFC (animation reel + one DIFC map)

71 s vertical reel (1080x1920, 30 fps; 68.5 s voice + 3 s end card) from the **HeyGen avatar video** `4a30e26b15594227b76fbd3f5ab8446d` (version v62200a16, 26 Oct 2026, English). Animation on the dark gold background plus two REAL PAGES (WAM / DIFC figures and the Dubai Media Office) with marker highlights; one map (DIFC, Downtown, Business Bay) only where he talks about property around DIFC; his face only in the small round bubble; quiet whoosh-only sound.

| Time | What he says | On screen |
|------|--------------|-----------|
| 0 - 3.8 | China's five biggest banks hold over 30% of DIFC's banking & capital markets assets | ring 0 -> 30%+, the five banks (ICBC, Bank of China, Bank of Communications, China Construction Bank, Agricultural Bank of China) |
| 3.8 - 8.6 | ... according to figures published in 2024 | REAL PAGE: WAM, 10 Dec 2024 - headline, then the marker on "the largest five banks, which collectively contribute over 30% of the Centre's total Banking and Capital Markets Assets" |
| 8.6 - 19.4 | not thousands of bankers buying apartments; finance, trade, raise capital, arrange deals; small team, billions | crossed-out card, four function tiles, small team -> billions |
| 19.4 - 27 | CICC opened its DIFC branch in May 2025, joining Chinese institutions already there | REAL PAGE: Dubai Media Office, 15 May 2025 - headline, marker on "officially launches its branch in Dubai, International Financial Centre", then on "The biggest names in the Chinese banking and financial services industry have made their presence in DIFC" |
| 27 - 39 | firms need lawyers, accountants, advisors, offices; expand -> space; hire -> homes | chain tiles |
| 39 - 46.4 | you need to see the expansion; a licence doesn't tell headcount or space | licence card with the two questions |
| 46.4 - 66.5 | around DIFC check firms expanding, real rents, new supply; right price; the full study | MAP: DIFC / Downtown / Business Bay, checklist, study card |
| 66.5 - 71.5 | comment CHINA | dark: bubble grows, "CHINA" typed and sent |

## Sources
- DIFC via [WAM, 10 Dec 2024](https://www.wam.ae/en/article/b6meb5c-difc-consolidates-position-uae%E2%80%99s-top-destination): the largest five Chinese banks in DIFC "collectively contribute over 30 per cent of the Centre's total Banking and Capital Markets Assets". The five shown are China's five largest state banks named in DIFC's cluster list.
- CICC DIFC branch: [Dubai Media Office, 15 May 2025](https://mediaoffice.ae/en/news/2025/may/15-05/cicc-expands-its-global-footprint-with-official-launch-of-difc-branch) (CICC (DIFC Branch), DFSA Category 4).

## Real pages on screen
Captured through the session proxy with `shot_hl.mjs` (narrow mobile viewport, 2.5x; ad networks blocked; fixed bars, cookie banners, ad slots and 'recommended' blocks hidden; it also writes the exact boxes of the quoted phrases into a `.json` next to the `.png`). Captures live in `assets/` (not committed); rerun the commands to rebuild them. Each page is a full-screen beat flown like the map (headline first, then down to the quoted line with a 3D tilt), with a marker wiping across the exact words as he says them and a source chip (outlet and date) above the captions.
```
node shot_hl.mjs "<wam url>" assets/wam_difc.png --w 430 --dpr 2.5 --wait 12000 --pad 160 --find "the largest five banks, which collectively contribute over 30% of the Centre's total Banking and Capital Markets Assets"
node shot_hl.mjs "<media office url>" assets/dmo_cicc.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --find "officially launches its branch in Dubai, International Financial Centre" --find "The biggest names in the Chinese banking and financial services industry have made their presence in DIFC"
```
- Geometry: DIFC (OSM relation 18471688), Downtown / Business Bay / E11 (../dubai-five-zones). (c) OpenStreetMap contributors, ODbL.
