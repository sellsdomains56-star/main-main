# Palm Springs by Nakheel (HeyGen cfdcf947)

55.6 s vertical video (1080x1920, **60 fps**; 53.6 s of voice + 2 s end) from HeyGen take cfdcf947. Same project as `../dh-villa-pja` (same map data and verified pages), his face **small the whole time**.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`; the take is -26.4 LUFS). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 4.7 | MAP fly-in over Dubai's west side, E11 draws, the reported area pulses: "LOOK AT THE LOCATION · before you judge the price" |
| 4.7 - 8.3 | Nakheel card "PALM SPRINGS · by Nakheel · proposed" -> VILLAS / TOWNHOUSES |
| 8.3 - 12.0 | MAP: Palm Jebel Ali, Sheikh Zayed Road, the reported area (Hessyan 1, "plot not published") |
| 12.0 - 20.7 | Rows: CONTEMPORARY HOMES ?, GREEN SURROUNDINGS ?, SPACIOUS LAYOUTS ? ("early marketing"), SPECS AND PRICES ✕ "not officially confirmed" |
| 20.7 - 26.1 | MAP: Palm Jebel Ali "developing coast", JAFZA "employment hub" |
| 26.1 - 30.8 | PAGE Dubai Media Office, 28 Apr 2024: "Set to be built at a cost of AED128 billion, the new terminal will ultimately enable the airport to handle a passenger capacity of 260 million annually." |
| 30.8 - 34.0 | MAP: Al Maktoum International Airport, 13 km to the terminal |
| 34.0 - 38.6 | VILLA BUYERS / TOWNHOUSE BUYERS -> "A LAUNCH WORTH FOLLOWING" |
| 38.6 - 47.3 | PRICE PER SQ FT, PLOT SIZE, PAYMENT PLAN, HANDOVER DATE; "CHEAPER THAN WATERFRONT? ✕ not the right test on its own" |
| 47.3 - end | Comment box types "SPRINGS", chip "OR DM YOUR BUDGET", reply "Launch details when confirmed" |

## Facts to check before posting
- **Palm Springs is reported only by broker / channel-partner listings** (28-29 Oct 2026). Nothing is on the Nakheel or Dubai Holding press pages, and no major outlet has covered it. The listings place it in Hessyan First / Jebel Ali, with access via Sheikh Zayed Road and D53. No plot, price, payment plan or handover is published (broker prices disagree), so the map pin is approximate and no price is shown. His script says "proposed" and "still need official confirmation", which fits.
- "Contemporary homes, green surroundings, spacious layouts" comes from the early marketing material and is labelled as such on screen.
- AED 128 billion is the planned cost of the new terminal (Dubai Media Office, 28 Apr 2024). The 13 km is a straight line from the approximate pin.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
(cd data && python3 -I build_geo.py)        # as ../dh-villa-pja
python3 -I make_pagedata.py                 # dmo_dwc / jafza / dmo_pja: the captures from ../dh-villa-pja
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh palm-springs
```
The face footage has 3214 frames, one fewer than `timeline.json` counts, so `FOOT_MAX` is clamped to the last real frame. Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
