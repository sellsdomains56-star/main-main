# Three areas of land on Dubai's Sheikh Zayed Road corridor (roadmap reel, 60 fps, small face)

71 s vertical reel (1080x1920, **60 fps**; 68.6 s voice + 2 s end card) from the **HeyGen avatar video** `0b2a8cc99035456fbf19c738cf37216a` (version v1d5a6820, 29 Oct 2026, English). Same look as `../dso-developers`: maps where the place matters, roadmap branches (logo -> project -> status rows), real pages with a marker on the exact words, his face **always small** (bubble top-left), captions throughout. Voice: plain +8.5 dB gain, no filters, no loudnorm.

| Time | He says | On screen |
|------|---------|-----------|
| 0 - 6.7 | three areas of land along Sheikh Zayed Road; one has a confirmed master plan | MAP: E11 from Jebel Ali to Emirates Hills, pins 1-2-3, "MASTER PLAN ✓" on 3 |
| 6.7 - 10.2 | 1: the canal area on the mainland near Palm Jebel Ali | MAP: the Palm Cove Canal (OSM) and Palm Jebel Ali |
| 10.2 - 16.0 | Nakheel commissioned excavation in 2007, part of the wider Dubai Waterfront | PAGE Wikipedia "Dubai Waterfront": "Palm Cove Canal, which runs parallel to the coastline, began in February 2007", "Waterfront was being developed by Nakheel" |
| 16.0 - 23.4 | worth following as Palm Jebel Ali develops; a marina-style community still needs confirmation | Nakheel -> Palm Cove Canal (satellite) -> PALM JEBEL ALI ✓ / NEW MARINA-STYLE COMMUNITY ? |
| 23.4 - 28.6 | 2: Badrah in Hessyan First, the wider Jebel Ali area | MAP: Hessyan 1 and Badrah (OSM) |
| 28.6 - 32.1 | close to employment centres and the waterfront | PAGE Gulf News 5 Nov 2018: "people working at the nearby Jebel Ali Free Zone" |
| 32.1 - 37.8 | watch for an official announcement of a new Dubai Holding community | Dubai Holding -> two "?" rows |
| 37.8 - 41.1 | 3: the land around Jebel Ali Racecourse | MAP: the racecourse (OSM) by Emirates Hills |
| 41.1 - 46.0 | A.R.M. Holding: 5 km2 master plan with Bjarke Ingels Group | A.R.M. -> racecourse (satellite) "MASTER PLAN · 5 SQ KM" -> DESIGNED WITH BIG |
| 46.0 - 53.1 | eight mixed-use neighbourhoods, homes, public spaces, central park, in phases | PAGE A.R.M. Holding 5 May 2025: "Spanning five square kilometers", "eight mixed-use neighborhoods", "Construction begins in 2026, with phased development" |
| 53.1 - 62.6 | new communities; launch prices, infrastructure, delivery schedules decide | overview: Sheikh Zayed Road -> the three sites -> the three tests |
| 62.6 - end | Comment E11 ... | comment animation "E11", reply, end card |

## Facts and caveats (research 29 Oct 2026)
- The canal is the **Palm Cove Canal** (Nakheel's Dubai Waterfront; not the Arabian Canal); contractor Jan De Nul from 2007 (their page renders blank in the capture browser, so Wikipedia is shown). It has held water since 2008 and the project was then suspended. No marina-community launch in Nakheel / Dubai Holding releases up to Oct 2026 - his caveat holds. Canal length differs by source (6 - 8 km), so none is shown.
- **Badrah** is an existing Nakheel community (Nakheel is part of Dubai Holding Real Estate) in Hessyan 1, near the Jebel Ali Free Zone and Palm Jebel Ali; no Dubai Holding launch there (the Aldar x Dubai Holding Palm Jebel Ali plot is a different site).
- **Jebel Ali Racecourse**: A.R.M. Holding with BIG (5 May 2025): 5 km2, central park, eight mixed-use neighbourhoods, construction from 2026 in phases; WSP hired for the detailed master plan in Jan 2026. The racecourse is next to Emirates Hills / The Greens, about 2.7 km off Sheikh Zayed Road and ~25 km from the other two sites.
- **The call to action**: both speech models hear "Comment E11 inches"; the comment animation types **E11**.
- Logos only to identify the companies; no master-plan render (BIG / A.R.M. grant no re-use rights); satellite crops (c) Esri, Maxar.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json && python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
python3 -I data/build_geo.py                                   # data/osm/e11_sites.geojson (OSM ids in the script header)
bash build/shots.sh; node shot_hl.mjs "https://en.m.wikipedia.org/wiki/Dubai_Waterfront" assets/wiki_dw.png --w 430 --dpr 2.5 --wait 6000 --pad 160 --noempty --eval "document.querySelectorAll('section[hidden], .collapsible-block[hidden], [hidden=until-found]').forEach(e => { e.removeAttribute('hidden'); e.style.display = 'block'; }); document.querySelectorAll('.collapsible-heading').forEach(h => h.classList.add('open-block'))" --find "Waterfront was being developed by Nakheel" --find "Palm Cove Canal, which runs parallel to the coastline, began in February 2007"
python3 -I make_pagedata.py && node data/raster_logos.mjs assets/img <logos> && node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh e11-land
```
(c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
