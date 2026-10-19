# Five Dubai zones before you invest - map reel (reel 11)

95 s vertical reel (1080x1920, 30 fps; 92 s voice + 3 s end card) from the **HeyGen avatar video** `055eb7dfb62e4d8ca2ce6350b69322b9`, **version v25f8c4c5 (19 Oct 2026, new voice**, 720x1280 25 fps, 91.9 s, English; the same link held the 90 s take vae6ecf02 with the old voice before, and a 105 s take before that, see `../aldar-dso-reel`). Always re-fetch the share page: HeyGen replaces the video behind the same link. Same look and engine as `../aldar-dso-reel`: **one background per beat**, real Esri satellite flights with 3D tilt, OSM outlines of every community he names (filled in the zone colour as he says the name), his live face as the small round gold-ring bubble top-left, frosted checklist panels, frosted-glass captions, whoosh-only sound at a very low level, everything inside the Reels safe zone.

Script as spoken: `script.txt` (editor markup). Nothing is added on screen that he does not say: the zone numbers, the roads (E11 / E311 / E611), the communities and the price ranges are his.

| Time | What he says | Background (one per beat) |
|------|--------------|-----------|
| 0 - 5.3 | stop investing without understanding these five zones | MAP: wide Dubai, five numbered zone badges drop in; HUD 5 ZONES |
| 5.3 - 20.4 | Zone 1, Sheikh Zayed Road and the coastline: Marina, JBR, Palm Jumeirah, Downtown, Business Bay; prime, luxury, strong rental demand; AED 2,000 - 4,500 per sq ft | MAP flight along the coast, coral outlines; checklist; price panel counts up |
| 20.4 - 34.9 | Zone 2, between E11 and E311: Dubai Hills, Tilal Al Ghaf, Arjan, Motor City; family, stable rent, growth; AED 1,200 - 1,800 | MAP, amber |
| 34.9 - 50.2 | Zone 3, between E311 and E611: The Valley, Arabian Ranches 3, DAMAC Hills 2, Dubai Land; villas, townhouses; AED 900 - 1,400 | MAP, teal; Dubai Land has no OSM outline: pulse + pin |
| 50.2 - 63.8 | Zone 4, the affordable frontier: Majan, Liwan, emerging Dubai Land; AED 700 - 1,100; lower entry prices, future infrastructure | MAP, indigo |
| 63.8 - 80.6 | Zone 5, Dubai South and the airport corridor: Expo City, Al Maktoum Airport, Palm Jebel Ali corridor; AED 1,100 - 1,500 | MAP, blue; dashed corridor to Palm Jebel Ali |
| 80.6 - 85.7 | ask which zone makes sense for your budget | DARK: the five ranges on one scale |
| 85.7 - 94.9 | comment CONSULTATION | dark: bubble grows, "consultation" typed, sent, answered "Sending you the details" |

## Map layer v2 (19 Oct 2026) - accurate roads, bands, callouts
Feedback: the map animation must be accurate and more professional, highlight more, draw more lines. Rebuilt in `mapfx.js` (loaded after `scenes_lib.js`):
- **The real highways** E11 (Sheikh Zayed Road), E311 (Sheikh Mohammed Bin Zayed Road), E611 (Emirates Road): every named motorway segment from OpenStreetMap (`data/nominatim_roads.py` -> `data/osm/*.json`), joined end to end per carriageway and simplified to 12 m (`data/build_roads.py` -> `roads.json`: 54 / 79 / 87 km). They draw themselves south-west -> north-east with a UAE-style route shield (one per road per view) and the road name.
- **Zone bands** between the highways (`data/build_bands.py` -> `geo_extra.json` bands): zone 2 = E11-E311, zone 3 = E311-E611, swept in with a tinted, hatched fill.
- **Communities**: each OSM outline traces itself, fills in the zone colours and gets a callout (leader + plate) while he says it, then stays on the map with a small name tag.
- **Orientation**: Dubai Metro Red Line Centrepoint -> Expo City Dubai with its 30 stations (OSM relation 420297, `data/build_extra.py`), landmarks (Burj Khalifa, Burj Al Arab, Jebel Ali Port, Dubai South, DWC), "ARABIAN GULF", a scale bar + north arrow, and measured straight-line distances (Dubai Hills -> Burj Khalifa 10.5 km, DAMAC Hills 2 -> Burj Khalifa 25.7 km, Majan -> Burj Khalifa 12.2 km, DWC -> Palm Jebel Ali 21.2 km, DWC -> DXB 44.4 km).
- Lighter veil (`veil: 'map'`): the ground stays clear, dark only behind the HUD and the captions.
- QA overlay over the raw imagery: `python3 -I data/check_map.py OUT.png 11` (roads, bands, outlines, metro, landmarks).

**What the accurate map shows about the script** (point-in-zone test against the road lines): of zone 2 ("between E11 and E311") only Dubai Hills and Arjan are actually there - Tilal Al Ghaf and Motor City lie between E311 and E611; of zone 3 ("between E311 and E611") Arabian Ranches 3 and Dubai Land are there - The Valley and DAMAC Hills 2 lie beyond E611. `script_v2.txt` is a corrected script for a new HeyGen take (also fixes the "4,000, 5,000" stumble).

## Check before posting - his price ranges against the Dubai Land Department record
The reel shows his numbers. I also pulled the DLD sale transactions (Bayut transaction feed, last 12 months to 16 Oct 2026, median of up to 700 most recent sales per community, AED per sq ft of built-up area; `data/pull_prices.py`, `data/prices.json`). Several communities sit **above** the range he gives for their zone:

| Zone | Stated by him (AED / sq ft) | Community | DLD median, last 12 months (AED / sq ft) | sales in 12 months |
|---|---|---|---|---|
| 1 The coast (Sheikh Zayed Road) | 2,000 - 4,500 | JBR | apartments 1,612 | 529 |
| 1  |  | Dubai Marina | apartments 1,954 | 2,427 |
| 1  |  | Business Bay | apartments 2,223 | 6,752 |
| 1  |  | Downtown Dubai | apartments 2,978 | 2,755 |
| 1  |  | Palm Jumeirah | apartments 3,225; villas 4,870 | 1,384 |
| 2 E11 - E311 | 1,200 - 1,800 | Motor City | apartments 1,487; villas 1,559 | 4,068 |
| 2  |  | Arjan | apartments 1,518 | 3,879 |
| 2  |  | Tilal Al Ghaf | apartments 2,147; villas 2,169; townhouses 2,432 | 790 |
| 2  |  | Dubai Hills | apartments 2,298; villas 2,242 | 3,061 |
| 3 E311 - E611 | 900 - 1,400 | Damac Hills 2 | apartments 1,088; villas 1,076; townhouses 1,057 | 2,560 |
| 3  |  | The Valley | apartments 1,340; villas 1,366; townhouses 1,253 | 2,852 |
| 3  |  | Arabian Ranches 3 | apartments 1,669; villas 1,576; townhouses 1,792 | 886 |
| 3  |  | Dubailand | apartments 2,351; villas 2,357 | 367 |
| 4 Affordable frontier | 700 - 1,100 | Liwan | apartments 1,081; villas 873 | 1,077 |
| 4  |  | Majan | apartments 1,403 | 6,295 |
| 5 Dubai South / airport corridor | 1,100 - 1,500 | Dubai South | apartments 1,602; villas 1,352; townhouses 1,393 | 16,138 |
| 5  |  | Expo City | apartments 2,162; villas 2,268 | 1,519 |
| 5  |  | Palm Jebel Ali | apartments 3,392; villas 3,019 | 1,002 |

- Zone 1: his range is at the top of the real apartment medians (JBR 1,612, Marina 1,954); Palm Jumeirah villas are above 5,000 (4,870).
- Zone 2: Dubai Hills (about 2,300) and Tilal Al Ghaf (about 2,150 - 2,430) are well above 1,200 - 1,800; Arjan / Motor City (about 1,500) fit.
- Zone 3: DAMAC Hills 2 (about 1,080) and The Valley (about 1,250 - 1,370) fit; Arabian Ranches 3 (about 1,580 - 1,790) is above; "Dubailand" (about 2,350) is a different, small market.
- Zone 4: Liwan (about 1,080) fits; Majan (about 1,400) is above 1,100.
- Zone 5: Dubai South (about 1,350 - 1,600) is slightly above 1,500 for apartments; Expo City (about 2,160) and Palm Jebel Ali (about 3,000 - 3,400) are far above.
- His Zone 1 price: the new-voice take says "2,000 to 4,500" and the screen shows 2,000 - 4,500 (the old take said "2,000 to 4,000, 5,000").
Consider correcting the script (or adding "selected properties") before posting; DLD / RERA advertising rules apply to price claims. A `DLD median` overlay (pin labels) can be added to the map beats if wanted.

## Data and credits
- Imagery (c) Esri, Maxar, Earthstar Geographics; outlines (c) OpenStreetMap contributors (ODbL) via Nominatim (`outlines.json`: Dubai Marina, JBR, Palm Jumeirah, Downtown, Business Bay, Dubai Hills, Tilal Al Ghaf, Arjan, Motor City, The Valley, Arabian Ranches 3, DAMAC Hills 2, Majan, Liwan, Expo City, Al Maktoum Airport). Dubai Land, Dubai South and Palm Jebel Ali have no usable OSM polygon: pulse + pin at the Bayut community centre (`data/locations.json`). The E11 / E311 / E611 road lines are drawn from OSM since map layer v2 (Nominatim + OSM API; Overpass was unreachable).
- Prices on screen are his; the DLD table above is from the Bayut transaction feed (DLD records).

## Rebuild
```bash
python3 -I prep_cut.py cut.json                      # needs a STEREO 48 kHz a48.wav (ffmpeg -ac 2 -ar 48000); cut.json points at the HeyGen download in the scratchpad
python3 -I asr_words.py build/voice48k.wav build/words_raw.json "Dubai, Zone, Sheikh Zayed Road, ..."
# merge two-token numbers in build/words_raw.json ("$2" + ",000" -> "2,000"), "aid" -> "AED", then:
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs          # build/tiles is a symlink to ../dubai-ideal-time/build/tiles (shared Esri cache)
node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5 --skip
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=24 MAXRATE=1.7M BUFSIZE=3.4M bash encode.sh dubai-five-zones
```
