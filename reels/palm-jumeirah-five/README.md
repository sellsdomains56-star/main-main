# Palm Jumeirah: five addresses, five versions of luxury (HeyGen a6cbddda)

61.8 s vertical video (1080x1920, **60 fps**; 59.8 s of voice + 2 s end) from HeyGen take a6cbddda. The map where the place matters (Palm Jumeirah outline from OpenStreetMap, the five addresses numbered), real pages with a marker on the exact words, his face **small the whole time**.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`). No stretch, no filters, no loudnorm (`AF=anull`). The take spells the second "OMNIYAT" letter by letter; nothing is cut.

## On screen
| Time | On screen |
|------|-----------|
| 0 - 4.7 | MAP: Palm Jumeirah outline traces in, five numbered addresses |
| 4.7 - 10.2 | MAP zoom to the East Crescent: ATLANTIS THE ROYAL (residences + resort) -> photo card (EditQ, CC0) |
| 10.2 - 17.0 | PAGE Palma Development (via Albawaba), 1 Apr 2026: "Serenia Living comprises 226 residences", "The project was completed in February 2026, with handover commencing this week." |
| 17.0 - 19.4 | MAP: West Crescent, SERENIA LIVING and ORLA BY OMNIYAT ("pin approximate") |
| 19.4 - 26.1 | PAGE The National, 1 Dec 2022: "has been designed by Foster + Partners and will be managed by the hospitality brand Dorchester Collection."; then "RESIDENT-ONLY BEACH CLUB · 150 m of beach · completion by 2027" |
| 26.1 - 33.3 | PAGE Gulf News, 23 Dec 2021: "With this project, Select Group will deliver 162 residential units."; then "WELLNESS FOCUS · owners' access to Six Senses Place" |
| 33.3 - 36.1 | MAP: AVA AT PALM JUMEIRAH, by Omniyat, at the trunk entrance |
| 36.1 - 40.0 | NUMBER OF HOMES on one scale: Serenia Living 226, Six Senses Residences 162, AVA 17 (16 residences + 1 Sky Palace) |
| 40.0 - 43.8 | ✕ FEWER HOMES = BETTER INVESTMENT? not automatically |
| 43.8 - 50.4 | Compare: VIEW, LAYOUT, PRIVACY, SERVICE CHARGES, BEACH ACCESS, MANAGEMENT |
| 50.4 - 53.6 | COMPLETION STATUS ?, HANDOVER STATUS ? (for the exact property) |
| 53.6 - end | DM: types "DOORS", chips "YOUR BUDGET", "PERSONAL USE", "INVESTMENT"; reply "The addresses that fit you" |

## Facts to check before posting
- **Serenia Living:** 226 residences and completion in February 2026 are from Palma's completion statement (1 Apr 2026). Palma's own project page still says 225; it also says "With the Royal Atlantis as its sole neighbour", which is wrong (the neighbour is Atlantis The Palm) and is not shown.
- **ORLA:** Foster + Partners and Dorchester Collection (The National 2022; Omniyat's page says the same). The "private beach" is a resident-only beach club on 150 m of beach. ORLA is **not complete** ("Completed by 2027"). ORLA is not in OpenStreetMap; listing pins fall inside Serenia's footprint, so its pin is set slightly towards the crescent apex and labelled approximate.
- **Six Senses Residences:** 162 units is the 2021 launch figure (Gulf News); Select Group's page gives no count. "Access to hotel facilities" in the script: the developer's wording is owners' access to Six Senses Place, a 60,000 sq ft wellness facility, which is what the screen says. Its completion was scheduled for Q2 2026; status not confirmed.
- **AVA:** 16 residences + 1 Sky Palace (Omniyat's current page; a 2023 Omniyat news item said 17 residences + 1 sky palace). Handover not confirmed. Omniyat's pages hide this text in a headless browser, so AVA has no page on screen.
- **Atlantis The Royal:** no official page reachable from here (atlantis.com refuses the connection); the photo is EditQ on Wikimedia Commons (CC0).
- The home counts compare only the three with published totals; Atlantis The Royal and ORLA are left out of the bar.

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
(cd data && python3 -I build_geo.py)        # Palm Jumeirah relation 1297972 (from ../dh-villa-pja) + the five points
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URLs in pagedata.js
python3 -I make_pagedata.py
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh palm-jumeirah-five
```
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
