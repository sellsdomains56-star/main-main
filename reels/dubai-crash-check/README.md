# "Dubai property has crashed" - ask three things (HeyGen 3d9c25be)

58.2 s vertical video (1080x1920, **60 fps**; 56.2 s of voice + 2 s end) from HeyGen take 3d9c25be. The roadmap style with the real page (marker on the exact words) and two plain bars: what the AED 574 bn is made of, and the off-plan share. His face **small the whole time**. No map.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 6.3 | Message bubble "Dubai property has crashed!" -> ASK THEM THREE THINGS: WHICH AREA?, WHICH TYPE?, COMPARED WITH WHEN? |
| 6.3 - 15.4 | PAGE Emirates 24/7, 1 Oct 2026: "January to September 2026 saw 165,018 transactions worth Dh574.12 billion" |
| 15.4 - 21.8 | One stacked bar "JAN – SEP 2026 · AED 574 BN": SALES AED 379.4 BN ("below 2025 · 2nd-highest on record"), MORTGAGES AED 151.1 BN, GIFTS AED 43.6 BN -> "SEPARATE CATEGORIES" |
| 21.8 - 26.0 | MARKET ACTIVITY ✓ substantial; EVERY PROPERTY UP IN VALUE? ✕ not proven by totals |
| 26.0 - 34.8 | "ONE MARKET, MANY STORIES": PRICE CUTS (some owners), WEAKER RENTS (some buildings), STILL COMPETITIVE (other areas) |
| 34.8 - 37.1 | PAGE Emirates 24/7: "off-plan property sales reached Dh183.32 billion, through 84,090 transactions" |
| 37.1 - 43.0 | OFF-PLAN share of sales value 48%, of sales deals 68% ("calculated from the DLD-based figures above"); WHAT BUYERS ARE PURCHASING ✓; THEIR EVENTUAL RETURNS ✕ not guaranteed |
| 43.0 - 47.0 | ✕ "THE WHOLE MARKET HAS CRASHED" too broad; ✕ "A GUARANTEED OPPORTUNITY" too broad |
| 47.0 - 52.0 | COMPLETED SALES, RENTAL EVIDENCE, UPCOMING SUPPLY -> IN THE EXACT LOCATION |
| 52.0 - end | Comment box types "CRASH", chip "+ THE AREA YOU'RE WATCHING", reply "The evidence behind the headline" |

## Facts to check before posting
- **Source type:** Emirates 24/7 (1 Oct 2026) reports a survey of Dubai Land Department data; no official DLD or Dubai Media Office release for Jan-Sep 2026 was found. His "reporting based on Dubai Land Department records" fits. The captured page is the AMP version (the normal page loads its text with JavaScript).
- 379.4 + 151.13 + 43.6 = 574.13, so mortgages and gifts are separate from sales. The page calls gifts "donations".
- Sales were the second-highest on record **after 2025**: about 23% below the same nine months of 2025 (W Capital: AED 495.8 bn). The bar's note says "below 2025", so it doesn't read as a record.
- Off-plan shares are calculated: 183.32 / 379.4 = 48% of sales value; 84,090 / 123,416 = 68% of sales deals.
- Newer data: Emirates 24/7 reported AED 624.8 bn for January-October on 31 Oct 2026. The script quotes the nine-month figure; post soon or update the script.
- The page's sentence "January to the end of September last year" is a translation slip for 2026; it is not marked.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
node shot_hl.mjs "<AMP url>" assets/e247_9m.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URL in pagedata.js
python3 -I make_pagedata.py
node export_cues.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh dubai-crash-check
```
