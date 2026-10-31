# Abu Dhabi: eight islands, eight different buyers (HeyGen bd365965)

62.6 s vertical video (1080x1920, **60 fps**; 60.6 s of voice + 2 s end) from HeyGen take bd365965. The map carries it: an overview with the eight islands numbered, then the camera lands on each island as he names it (real OpenStreetMap outlines), one official page with a marker on the exact words, his face **small the whole time**.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`). No stretch, no filters, no loudnorm (`AF=anull`). The take itself says "Yas brings brings together"; nothing is cut.

## On screen
| Time | On screen |
|------|-----------|
| 0 - 4.8 | MAP: Abu Dhabi overview, the eight islands numbered 1-8 at "eight islands" |
| 4.8 - 10.6 | PAGE Abu Dhabi Media Office, 20 Feb 2026: "recording total real estate transactions valued at a record AED142 billion from 42,814 transactions", then "AED99.4 billion generated from sales and purchases from 25,604 transactions, while mortgage activity contributed AED42.7 billion" |
| 10.6 - 13.7 | MAP: all eight outlines trace in: "NOT SPREAD EVENLY · each island, its own market" |
| 13.7 - 47.3 | MAP tour, one island per line, outline + number + label: 1 AL REEM (established apartments · waterfront towers), 2 AL MARYAH (home of ADGM), 3 SAADIYAT (culture · beaches · premium homes), 4 YAS (entertainment · tourism · homes), 5 HUDAYRIYAT (villas · sport · outdoor living), 6 AL JUBAIL (lower-density homes · mangroves), 7 RAMHAN (waterfront villa living), 8 FAHID (Aldar · first move-ins targeted Q1 2029) |
| 47.3 - 55.0 | ✕ "ITS NAME IS TRENDING · not a reason on its own"; compare: BUYER PROFILE, EXISTING SERVICES, ACCESS, COMPETING HOMES DUE FOR DELIVERY |
| 55.0 - end | Comment box types "PLAYBOOK", chips "YOUR BUDGET", "APARTMENT", "VILLA"; reply "The islands that fit you" |

## Facts to check before posting
- AED 142 billion is the whole emirate's 2025 total and includes mortgages (sales AED 99.4 bn + mortgages AED 42.7 bn); the page calls it a record.
- ADGM: its jurisdiction covers Al Maryah **and** Al Reem (Al Reem added 24 Apr 2023). "Home of ADGM" for Al Maryah is true (Abu Dhabi Media Office: "home to Abu Dhabi Global Market"), but ADGM isn't Al Maryah only.
- Fahid Island is **Aldar's** (acquired Jan 2023), not Modon's (Modon develops Hudayriyat). All three releases are off-plan; first move-ins targeted Q1 2029 (The National, 2 Jun 2025). The island's area differs between sources (3.4 vs 2.7 million sqm), so none is shown.
- Ramhan Island is Eagle Hills'. A seven-bridge link to the E12 for Ramhan and Jubail is due in 2027 (Abu Dhabi Media Office, 27 Oct 2026); not shown.
- Island one-liners are his; the official descriptions are in the research notes (Abu Dhabi Media Office topic pages).
- Outlines: Al Reem, Al Maryah, Saadiyat, Yas, Hudayriyat from `../hudayriyat-wadeem` (the Hudayriyat relation is 48.9 km² in OSM and includes some water); Al Jubail (relation 13013622), Ramhan (way 64625960), Fahid (way 24293925, the island polygon, not the admin boundary).

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
(cd data && python3 -I build_geo.py)
node shot_hl.mjs "<url>" assets/admo_142.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URL in pagedata.js
python3 -I make_pagedata.py
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh ad-eight-islands
```
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
