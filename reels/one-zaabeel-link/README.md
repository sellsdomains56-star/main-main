# How do you lift 8,500 tons 100 m into the air? The Link at One Za'abeel (reel)

58 s vertical reel (1080x1920, 30 fps; 55.6 s voice + 2 s end card) from the **HeyGen avatar video** `de4c494d6926484ba4fc636ee8294e0a` (version v551867ee, 27 Oct 2026, English). His face full screen on the hook (no small bubble); a real photo (Wikimedia Commons, EditQ, CC0); real pages with a marker on the exact words; an **illustrated side view** of the two towers (approximate scale: The Link 230 m long, first section 192 m, 100 m up, cantilever ~67 m beyond the main tower, towers ~300 m and ~235 m) in which the first section rises 100 m with a day counter (12 days), the final section joins, then the camera moves to the cantilever (no columns underneath, the load path back into the supports); the map (One Za'abeel, DIFC, Dubai World Trade Centre); his call to action "ZA'ABEEL". Captions throughout. Voice: a plain +8.5 dB gain, no filters, no loudnorm.

| Time | He says | On screen |
|------|---------|-----------|
| 0 - 4.4 | How do you lift 8,500 tons of steel 100 m into the air? | FACE |
| 4.4 - 7.1 | ... to build The Link at One Za'abeel | PHOTO (Commons, CC0) |
| 7.1 - 11.2 | 230 metres across the two towers | PAGE Khaleej Times 26 Mar 2024: "The Link stretches an impressive 230 metres in length" |
| 11.2 - 13.2 | not in one go | ILLUSTRATION: towers, section 1 and the final section on the ground |
| 13.2 - 16.5 | the first section alone weighed around 8,500 tons | PAGE Khaleej Times: "where the steel structure weighing over 8,500 tonnes was lifted into place over 12 days" |
| 16.5 - 34.8 | 12 days; the second lift; ~67 m beyond the tower, no columns; the weight carried back; a cantilever | ILLUSTRATION: lift 1 (day counter, 100 M), lift 2 ("FINAL SECTION · 900+ T · 4 DAYS"), "THE LINK · COMPLETE", ≈67 M, NO COLUMNS, load path, CANTILEVER |
| 34.8 - 41.0 | March 2024, Guinness World Records, longest cantilevered building | PAGE Guinness World Records: "The longest cantilevered building is 67.227 m (220ft 8.7in) and was achieved by One Za'abeel (UAE) in Dubai, UAE, on 1 March 2024." |
| 41.0 - 49.5 | around One Za'abeel, DIFC or Dubai World Trade Centre: properties, rental demand, prices | MAP + three pills |
| 49.5 - end | Comment Za'abeel, send your budget and goal; we'll help you compare | comment animation, two replies, end card |

## Facts and caveats (research 27 Oct 2026)
- 8,500 t and 12 days are the developer's figures (Ithra Dubai 2020, repeated in 2024). Other accounts differ: Mace (lift manager) "over 14 days", the steel contractor "three days"; weights in print 7,700 - 9,500 t.
- 230 m is the 2024 figure and includes the cantilever; every 2020 official source gives 226 m. "230 m across the two towers" overstates the span between them; the screen says "230 METRES LONG".
- The cantilever: Guinness 67.227 m; the developer and the press 67.277 m. "No columns underneath" and "the weight is carried back into its supports" are a general description of a cantilever (no source states them for The Link); the illustration shows them as a diagram.
- Second lift: the final ~900 t section over four days, completed 24 Oct 2020 (announced 27 Oct 2020).
- Photo: File:Sheikh_Zayed_Road_10.jpg (EditQ, CC0). The UAE has no freedom of panorama; the official lift videos are not licensed for reuse, so none are used.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
node shot_hl.mjs "<khaleej times url>" assets/kt_link.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --noempty --find "The Link stretches an impressive 230 metres in length" --find "where the steel structure weighing over 8,500 tonnes was lifted into place over 12 days" --find "Phase two saw the 900+ ton cantilevered structure lifted into place over four days" --find "its record-breaking cantilever extends 67.277 metres beyond the development's main tower"
node shot_hl.mjs "https://www.guinnessworldrecords.com/world-records/617033-longest-cantilevered-building" assets/gwr_link.png --w 430 --dpr 2.5 --wait 9000 --pad 160 --noempty --find "The longest cantilevered building is 67.227 m (220ft 8.7in) and was achieved by One Za'abeel (UAE) in Dubai, UAE, on 1 March 2024."
python3 -I make_pagedata.py && node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh one-zaabeel-link
```
Map points: One Za'abeel (OSM way 388732059), Dubai World Trade Centre (OSM way 1161399237); DIFC outline from ../office-market-ar. (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
