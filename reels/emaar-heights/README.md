# The Heights Country Club & Wellness (HeyGen 729947af)

51.8 s vertical video (1080x1920, **60 fps**; 49.8 s of voice + 2 s end) from HeyGen take 729947af. The royal-family roadmap style with the map where the place matters, real pages with a marker on the exact words, his face **small the whole time**.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 5.6 | OUTDOOR SPACE + AN ACTIVE DAILY ROUTINE -> Emaar card "THE HEIGHTS COUNTRY CLUB & WELLNESS · on your comparison list" |
| 5.6 - 9.5 | PAGE Emaar press release, 29 Feb 2024: "an exclusive 81 million square feet development valued at AED 55 billion." |
| 9.5 - 14.3 | PAGE Emaar press release, 21 May 2024: "In addition to its chic townhouses and semi-attached villas, the development features a thoughtfully designed wellness centre, parks, ponds, lush greenways" |
| 14.3 - 18.5 | WELLNESS, OUTDOOR ACTIVITY, TIME BEYOND YOUR HOME; "PARKS · PONDS · CYCLING TRACKS" |
| 18.5 - 28.9 | "THE PHASE YOU'RE BUYING": WHERE IS YOUR HOME? (relative to parks & facilities), WHICH AMENITIES? (arrive with your phase), STILL UNDER CONSTRUCTION? |
| 28.9 - 33.0 | MAP: south of the city, Downtown Dubai for scale, Emirates Rd (E611) and Expo Rd (E77) draw, "THE HEIGHTS · at E611 × E77 · approximate pin" |
| 33.0 - 37.2 | MAP zooms out, routes from the junction with Emaar's drive times: DOWNTOWN 30 MIN, DUBAI HILLS 20 MIN, EXPO CITY 10 MIN, DWC AIRPORT 10 MIN; "TEST THE DRIVE at the hours you travel" |
| 37.2 - 43.0 | FOR INVESTORS: WHO IS THE LIKELY TENANT? -> RENT THEY CAN AFFORD vs YOUR TOTAL OWNERSHIP COST (price · fees · service charges · finance) |
| 43.0 - end | Comment box types "HEIGHTS", chips "YOUR BUDGET", "BEDROOMS", reply "Homes · written offers · payment terms" |

## Facts to check before posting
- 81 million sq ft and AED 55 billion: Emaar, 29 Feb 2024 (then called "The Heights Country Club"; "& Wellness" was added at the 20 May 2024 launch).
- Villas and townhouses: the 21 May 2024 release says "townhouses and semi-attached villas". Emaar's current community page lists only villas (3-5 bedrooms, "Prices from AED 6,000,000"), so townhouses may not be on sale now.
- Location: Emaar's community page says "at the junction of E611 and E77"; the pin is the interchange from OpenStreetMap, not a published boundary. Listing sites call the area Al Yalayis 5. "Southern Dubai" is his wording; Emaar does not use it.
- Drive times are **Emaar's own figures** (10 min to Expo City Dubai and Al Maktoum International Airport, 20 min to Dubai Hills Estate, 30 min to Downtown Dubai), labelled as such; the routes on the map are illustrative, not road routes.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
(cd data && python3 -I build_geo.py)        # E11/E311/E611 from ../office-launches; E77 = OSM "Expo Road" trunk ways (Nominatim), centreline rebuilt
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URLs in pagedata.js
#   the community page's FAQ (E611/E77, drive times) stays collapsed in the capture, so it is not shown as a page
python3 -I make_pagedata.py
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh emaar-heights
```
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
