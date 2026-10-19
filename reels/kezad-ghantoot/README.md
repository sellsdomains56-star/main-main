# KEZAD: what Abu Dhabi is building on the other side - map reel

58 s vertical reel (1080x1920, 30 fps; 55.3 s voice + 3 s end card) from the **HeyGen avatar video** `5829259df07d48d1af092ed9d26dd67e` (take of 19 Oct 2026, version v64e45086, 720x1280 25 fps, English; the link earlier held a different take). Engine = the dubai-five-zones reel with the **map layer v2** (`mapfx.js`): **no full-screen face** (v2, at the owner's request): the map runs from the first frame, one accurate map per beat, his live face only as the small round gold-ring bubble top-left; frosted panels; frosted-glass captions; quiet whoosh-only sound (`audio.py` default, sfx about -55 dBFS); everything inside the Reels safe zone.

| Time | What he says | On screen |
|------|--------------|-----------|
| 0 - 5.9 | Fewer people are watching what Abu Dhabi is building on the other side. It's called KEZAD. Think about what JAFZA did for Dubai | MAP opens on Dubai and pans to Abu Dhabi while the E11 draws between them; name chip under the bubble; KEZAD (Khalifa Industrial district) and JAFZA outlined with callouts |
| 5.9 - 16.4 | Businesses moved close to Jebel Ali Port ... jobs ... homes in surrounding areas ... employment shaped where people live | MAP Jebel Ali: JAFZA, Jebel Ali Port, the chain PORT -> BUSINESSES -> JOBS -> HOMES, flow lines to Discovery Gardens / Al Furjan / Jebel Ali Village, measured Jebel Ali Port -> Al Furjan 10.0 km |
| 16.4 - 28.5 | the corridor around Khalifa Port; KEZAD = Khalifa Economic Zones Abu Dhabi, part of AD Ports Group; manufacturing, logistics, food processing, other industries | MAP Khalifa Port: Khalifa Port, Al Ma'mourah, KEZAD outlines; checklist of the industries |
| 28.5 - 34.6 | the employers behind warehouses, factories, supply chains; employees need somewhere to live | MAP KEZAD + Al Samha / Al Rahba (nearest residential districts, flow lines) ; checklist |
| 34.9 - 39.9 | For property investors, the question is where that employment could support residential demand | MAP both job hubs: JAFZA and KEZAD outlined (JOBS), flow lines from both converge on Ghantoot; THE QUESTION / WHERE WILL THE WORKERS LIVE? |
| 39.9 - 51.5 | Look at Ghantoot, between the Jebel Ali / Dubai South corridor and Abu Dhabi's industrial growth corridor; project, price, commute still matter | MAP: Ghantoot pin, Dubai corridor (JAFZA, DWC, Expo) and Abu Dhabi corridor (Khalifa Port, Al Ma'mourah, KEZAD) outlined in two colours, Ghantoot -> Jebel Ali Port 21 km, Ghantoot -> Khalifa Port 26 km (straight lines); checklist PROJECT / PRICE / EVERYDAY COMMUTE |
| 51.5 - 58.3 | Comment AREA and I'll send you the detailed report | dark: bubble grows, "AREA" typed and sent, "Sending you the full report" |

## Geography (all OpenStreetMap, ODbL; `data/build_geo.py` -> outlines.json, roads.json, geo_extra.json; QA: `python3 -I data/check_map.py OUT.png 11`)
- E11 Dubai - Abu Dhabi: OSM route relation 19308049 via the OSM API, joined per carriageway (151.7 km), drawn Dubai -> Abu Dhabi.
- JAFZA = Jebel Ali Free Zone North (OSM relation 18471647); Jebel Ali Port, Ghantoot (village node), Dubai South: Nominatim positions.
- Discovery Gardens, Al Furjan, Jebel Ali Village, Dubai Investments Park, Khalifa Port, Al Samha, Al Rahba: OSM polygons (Nominatim).
- KEZAD: the OSM polygon literally named "KEZAD" is a 0.6 km plot, so the reel uses the **Khalifa Industrial district** (OSM relation 13251383, where KEZAD's Khalifa Industrial Zone sits) and **Al Ma'mourah** (relation 13251377, Khalifa Port side). They are administrative districts, close to but not identical with KEZAD's legal zone boundaries.
- Al Samha / Al Rahba are added as the nearest residential districts to KEZAD (he does not name them); Discovery Gardens / Al Furjan / Jebel Ali Village likewise for "homes in surrounding areas" around JAFZA.
- Distances are straight lines between the points (not driving distance).
- Imagery (c) Esri, Maxar, Earthstar Geographics.

## Check before posting
- He presents Ghantoot as "a location worth studying" and invites comments for a project report: RERA / DLD (and ADREC for Abu Dhabi) advertising rules apply; the reel shows no prices or returns.
- No AD Ports / KEZAD / JAFZA logos are used (names only).

## Rebuild
```bash
python3 -I prep_cut.py cut.json                      # cut.json -> the HeyGen download in the scratchpad (in14/take.mp4, a48.wav)
# words: faster-whisper (asr_words.py) on the voice, names fixed (KEZAD, JAFZA, Jebel Ali, AD Ports, Ghantoot, AREA) -> build/words_raw.json
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
(cd data && python3 -I build_geo.py)
node export_cues.mjs && node fetch_tiles.mjs          # build/tiles -> ../dubai-ideal-time/build/tiles (shared Esri cache)
node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=22 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh kezad-ghantoot
```
