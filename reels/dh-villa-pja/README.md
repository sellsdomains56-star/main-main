# Dubai Holding villas near Palm Jebel Ali (HeyGen f2b407a1, new version)

57.6 s vertical video (1080x1920, **60 fps**; 55.6 s of voice + 2 s end) from HeyGen f2b407a1, **version v74dfb58f** (29 Oct 2026). The same link earlier held the German "Europe Plan B" take (version v556622f2, now `../europe-planb-de`); the link was re-used for this new English script. Same look as `../e11-land` (the royal-family roadmap style, with the map where the place matters), his face **small the whole time**.

## The voice
The HeyGen audio is untouched apart from one plain gain (`volume=8.5dB`; the take is -26.0 LUFS). No stretch, no filters, no loudnorm (`AF=anull`).

## On screen
| Time | On screen |
|------|-----------|
| 0 - 3.9 | Dubai Holding card -> VILLAS / TOWNHOUSES -> "REPORTED · NO OFFICIAL LAUNCH YET" |
| 3.9 - 7.7 | MAP: E11 (Sheikh Zayed Road), the reported area (Hessyan 1, pulsing; "plot not published"), Palm Jebel Ali |
| 7.7 - 10.6 | MAP: Al Maktoum International Airport outline, "13 km to the terminal" (straight line from the reported area) |
| 10.6 - 23.8 | PAGE Dubai Media Office, 28 Apr 2024: "Set to be built at a cost of AED128 billion, the new terminal will ultimately enable the airport to handle a passenger capacity of 260 million annually.", then "As we build an entire city around the airport in Dubai South, demand for housing for a million people will follow." |
| 23.8 - 25.5 | MAP: JAFZA (Jebel Ali Free Zone North) outline |
| 25.5 - 31.8 | PAGE jafza.ae: "Jafza is home to 11,000+ businesses contributing significantly to the GDP of Dubai" |
| 31.8 - 35.3 | MAP: Palm Jebel Ali (gold, "13.4 km² · twice the size") and Palm Jumeirah (white), both real outlines in their real places |
| 35.3 - 38.6 | PAGE Dubai Media Office, 31 May 2023: "Spanning an area of 13.4 square kilometres and occupying an area twice the size of Palm Jumeirah", "Palm Jebel Ali will feature over 80 hotels and resorts, and a wide choice of entertainment and leisure facilities" |
| 38.6 - 43.8 | MAP: the corridor: routes from the reported area to EMPLOYMENT (JAFZA), AIRPORT EXPANSION (DWC terminal), COASTLINE (Palm Jebel Ali) |
| 43.8 - 50.0 | LAUNCH PRICE ?, PAYMENT PLAN ?, HANDOVER TIMELINE ? (not announced yet) |
| 50.0 - end | DM: types "VILLA", chip "YOUR BUDGET", reply "Launch details when confirmed" |

## Facts to check before posting
- **The community itself is only reported by broker listings** (28-29 Oct 2026): said to be by Nakheel (part of Dubai Holding Real Estate), in Hessyan First / Jebel Ali, reached via Sheikh Zayed Road and D53; names seen: "Palm Springs" / "Palm Spring". There is nothing on the Dubai Holding or Nakheel press pages (newest item 26 Oct 2026) and no story in Gulf News, Khaleej Times, Arabian Business, The National, Zawya or WAM. Broker prices disagree (AED 3.2m-9m "indicative" vs "from AED 3.8m"), so no price is shown. The map pin is approximate (Hessyan 1 beside D53); the "13 km" is a straight line from that pin to the passenger terminal.
- Not the same project as the Aldar x Dubai Holding villas near Dubai Silicon Oasis (The National, 14 Oct 2026).
- AED 128 billion is the planned cost of the new terminal; 260 million passengers a year is the ultimate capacity (operations from 2032 per a Dubai Media Office update, 15 Jun 2026).
- The "housing for a million people" is Sheikh Mohammed's statement about the city around the airport **in Dubai South**, not Jebel Ali.
- JAFZA: jafza.ae says 11,000+ businesses; DP World (20 May 2026) says 12,000. "More than 11,000" is safe.
- Palm Jebel Ali's masterplan was approved on 31 May 2023 (13.4 km², twice the size of Palm Jumeirah, 80+ hotels and resorts, about 35,000 families).

## Build
```
python3 -I prep_cut.py cut.json && ASR_LANG=en python3 -I asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0 && python3 -I snap_onsets.py
(cd data && python3 -I build_geo.py)        # Palm Jebel Ali, Hessyan 1 (../e11-land), Palm Jumeirah (relation 1297972), JAFZA + DWC + E11 (../kezad-ghantoot)
node shot_hl.mjs "<url>" assets/<name>.png --w 430 --dpr 2.5 --wait 10000 --pad 200 --noempty --find "<exact phrase>" ...   # URLs in pagedata.js
python3 -I make_pagedata.py
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=2.8M BUFSIZE=5.6M bash encode.sh dh-villa-pja
```
Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
