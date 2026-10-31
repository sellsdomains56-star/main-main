# Palm Springs vs The Springs & The Meadows (HeyGen 3bf6cf04)

52.1 s vertical video (1080x1920, **60 fps**; 50.1 s of voice + 2 s end) from HeyGen take 3bf6cf04 (version vc6c5390f). Same project as `../palm-springs` (map + roadmap + real pages), his face **small the whole time**.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 4.4 | MAP: Dubai's west side, Palm Springs (reported area, "proposed") vs The Springs & The Meadows |
| 4.4 - 9.3 | Two cards: EMIRATES LIVING (Emaar, established 2003) and PALM SPRINGS (Nakheel, proposed) -> "DIFFERENT LOCATIONS · DIFFERENT STAGES" |
| 9.3 - 15.0 | PAGE Emaar, Emirates Living: "Established in 2003, this residential hub covers over 52 million square feet of greenery." |
| 15.0 - 20.3 | MAP: Palm Springs, proposed, near Palm Jebel Ali (approximate area, "plot not published") |
| 20.3 - 25.7 | Its appeal depends on: LAUNCH PRICE, HOME DESIGN, PLOT SIZES, THE AREA AROUND IT |
| 25.7 - 32.0 | NEWER CONSTRUCTION ✓ a possible plus; WAITING TIME ? until handover; ONGOING CONSTRUCTION ? possibly around you |
| 32.0 - 39.0 | PRICE PER SQ FT, same measurement: PLOT AREA ≠ BUILT-UP AREA, "not interchangeable" |
| 39.0 - 44.4 | Like with like: BEDROOMS, LAYOUTS, CONDITION, LOCATION IN THE COMMUNITY |
| 44.4 - end | DM: types "PALM", chips "YOUR BUDGET", "A HOME NOW", "CAN WAIT"; reply "Let's compare both properly" |

## Facts to check before posting
- **Palm Springs is reported only by broker / channel-partner listings** (see `../palm-springs` and `../dh-villa-pja`): Nakheel, Hessyan First / Jebel Ali; no plot, price, payment plan or handover published. On screen it is "proposed", the area is approximate and no price is shown.
- Emirates Living (Emaar): "Established in 2003 … over 52 million square feet of greenery"; the same page lists villas "across Emirates Hills, The Springs, The Meadows, The Lakes, and Hattan" (that line sits in a collapsed FAQ on the phone page, so it is not marked).
- Map pins: The Springs 25.0600 N, 55.1824 E; The Meadows 25.0671 N, 55.1568 E (OpenStreetMap).

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URLs in pagedata.js
python3 -I make_pagedata.py
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh ps-vs-springs
```
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
