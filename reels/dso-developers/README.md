# Who's developing the land around Dubai Silicon Oasis? (roadmap reel, 60 fps, small face)

46 s vertical reel (1080x1920, **60 fps**; 44.4 s voice + 2 s end card) from the **HeyGen avatar video** `6f85e7b700bb4d3d8a40154c3b9bfa62` (version v6a81e3c5, 29 Oct 2026, English). Brief: "same as the royal family video, but he is always small". So: the look of `../dubai-royal-roadmap` (logo cards, gold / white lines that draw themselves with a running pulse, photo cards, real pages with a marker on the exact words), with his face **always in the small round bubble** top-left (never full screen). Captions throughout. Voice: plain +8.5 dB gain, no filters, no loudnorm.

| Time | He says | On screen |
|------|---------|-----------|
| 0 - 5.9 | Who's developing all that empty land around Dubai Silicon Oasis? Several major developers already have plans | MAP: Dubai Silicon Oasis outlined, then Academic City / Al Ruwayyah 1 and Nad Al Sheba 3-4 (OSM) with two callouts |
| 5.9 - 8.1 | Danube has launched Greenz near Academic City | Danube logo -> LAUNCHED -> Greenz render card -> ACADEMIC CITY |
| 8.1 - 10.4 | bringing townhouses and villas | PAGE Danube Properties (Apr 2026): "Danube Properties has unveiled Greenz By Danube, its first large-scale integrated community featuring premium townhouses and villas" |
| 10.4 - 12.3 | Binghatti's Tilal community | Binghatti logo -> Tilal Binghatti image card |
| 12.3 - 14.6 | about 10 million sq ft | PAGE Binghatti area guide: "... spans approximately 10 million square feet" |
| 14.6 - 17.9 | a new Dubai Police Academy in Al Ruwayyah First | Dubai Police logo -> academy model (WAM) -> AL RUWAYYAH 1 |
| 17.9 - 20.0 | the academy relocating from Al Sufouh | PAGE Gulf News 4 Dec 2024: "... which will be completed in 2027 in Al Ruwaya First area" and "... the current land that houses the academy in the Al Sufouh area." |
| 20.0 - 22.3 | not the police headquarters moving from Umm Suqeim | two rows: THE ACADEMY IS MOVING ✓ / NOT THE POLICE HQ ✗ |
| 22.3 - 25.6 | Aldar and Dubai Holding confirmed a joint venture | Aldar × Dubai Holding logos -> JOINT VENTURE |
| 25.6 - 31.5 | ~4 million sqm opposite Nad Al Sheba; apartments, townhouses, villas | PAGE Zawya 8 Feb 2026 (the release): "With approximately 4 million sqm of land", "The first plot, located along Dubai's eastern growth corridor opposite Nad Al Sheba, ..." |
| 31.5 - 40.1 | if you own nearby or plan to buy: housing supply, traffic, services | overview: Dubai Silicon Oasis (satellite badge) -> the four plans -> HOUSING SUPPLY / TRAFFIC / SERVICES |
| 40.1 - end | Comment Silicon | comment animation "SILICON", reply, end card |

## Facts and caveats (research 29 Oct 2026)
- Danube's project is **Greenz by Danube** (launched 1 Apr 2026); the sources put it *in* Dubai International Academic City (he says "near").
- **Tilal Binghatti**: "approximately 10 million square feet" (area guide; the project page says "over"); no official launch date found; brokers place it in Al Rowaiyah First (a few say Al Rowaiyah 3).
- Dubai Police Academy: new building in Al Ruwayyah 1 (155 ha, 2,500 cadets, due 2027), a compensation from Dubai Holding for the academy's land in Al Sufouh. **The police General HQ is in Al Twar 1 and no source says it is moving** (none mentions Umm Suqeim); the screen says only "NOT THE POLICE HQ".
- Aldar x Dubai Holding (6 Feb 2026): a plot of ~4 million sqm "opposite Nad Al Sheba" (apartments, townhouses, villas; launch targeted 2026; no name yet); the other plot is on Palm Jebel Ali. No exact plot is published, so the map labels Nad Al Sheba, not a plot.
- Images: Danube render (Danube Properties), Tilal (Binghatti), academy model (WAM via Gulf News), credited on screen; logos only to identify the companies. Dubai Silicon Oasis badge: Esri World Imagery.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json && python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
(cd data && python3 -I nominatim_dso.py && python3 -I build_geo.py)      # osm/lookup.json = Nominatim lookup of the OSM ids above
bash build/shots.sh (shot_hl.mjs captures) && python3 -I make_pagedata.py && node data/raster_logos.mjs assets/img <logos>
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh dso-developers
```
(c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
