# "Ideal time to invest in Dubai" - map version (reel 09)

74.8 s vertical reel (1080x1920, 30 fps) from Abdullah Ahli's own 71.8 s recording (WeTransfer, 1080x1920 25 fps, English; voice and picture unedited, one segment). Same look as `../four-islands-map`: one continuous real satellite journey over Dubai (Esri World Imagery), his **live face as a small round bubble** top-left (gold ring, pulses while he speaks; `FACE = 'video'` in `scenes.js`, `'photo'` or `'none'` also work), a HUD title block next to it, frosted checklist panels that grow row by row, real pages as proof cards with marker highlights, frosted-glass captions, whoosh-only sound at a very low level, everything inside the Instagram Reels safe zone.

Peg: Sheikh Mohammed bin Rashid Al Maktoum, 13 October 2026, Mohammed bin Rashid Leadership Forum (Dubai World Trade Centre). Script as spoken: `script.txt` (editor markup); `speaker.txt` / `script.draft.txt` = the drafted version he adapted.

| Time | Words | On screen |
|------|-------|-----------|
| 0 - 3.5 | hook: "Why did Sheikh Mohammed bin Rashid just say it's the ideal time to invest in Dubai?" | HUD "IDEAL TIME TO INVEST?", Dubai Media Office page, marker on "the ideal time to invest in Dubai and its infrastructure" |
| 3.5 - 8 | "over 2.1 trillion dirhams of projects underway" | HUD counter DH 2.1 TRILLION, same page, marker on "AED2.1 trillion in active projects underway" |
| 8 - 13 | "more than half ... 1.1 trillion ... real estate through 2030" | HUD DH 1.1 TRILLION, bar panel (1.1 of 2.1) |
| 13 - 17.6 | "approximately 350,000 new homes being planned" | HUD + counter panel with 9 house icons |
| 17.6 - 27.3 | Al Maktoum International Airport, 128 billion, 260 million passengers | camera flies to the airport, pin + pulse + tag, panel (investment / capacity) |
| 27.4 - 33.7 | another 100 billion: roads and metro, Blue and Gold lines | HUD DH 100 BILLION, panel rows |
| 33.7 - 40.2 | Blue Line 30 km, 14 stations, September 2029 | camera to east Dubai, 4 district pins (Mirdif, Creek Harbour, International City, Silicon Oasis), RTA release card with markers |
| 40.2 - 46.6 | more projects coming; "a city within a city" | Dubai Media Office page, markers on "more to be announced in the coming phase", "building a city within a city" |
| 46.6 - 51.7 | more infrastructure, businesses, room to live and work | panel |
| 51.7 - 62.4 | not every property is a good investment; 350,000 homes = more competition / supply | HUD + panels |
| 62.4 - 66.4 | right location, right developer matter more than ever | panel |
| 66.4 - 74.8 | CTA: "send me a message with the word Dubai" | map dims, bubble grows to the centre, name ABDULLAH AHLI / PORTFOLIO STRATEGIST (from his Instagram bio), "Dubai" typed, sent, answered |

## Facts and sources (checked against the primary release)
- Dubai Media Office, 13 Oct 2026 (primary): AED2.1 trillion active projects ("nearly AED2.1 trillion" in the release text, "AED2.1 trillion" in the quote); AED1.1 trillion for real estate through 2030; ~350,000 residential units planned (no date); AED128 billion Al Maktoum International, up to 260 million passengers annually over the next decade; AED100 billion for road upgrades and the Dubai Metro Blue and Gold lines; "more to be announced in the coming phase"; "Dubai is building a city within a city"; "the ideal time to invest in Dubai and its infrastructure". Corroborated by The National and Gulf News (13 Oct 2026).
- RTA release via Dubai Media Office, 9 Nov 2025: Blue Line = 30-km project, 14 stations, opening targeted for 9.9.2029.
- District pins: Mirdif, Dubai Creek Harbour (The National, 9 Jul 2026), International City, Dubai Silicon Oasis - **area centres from OpenStreetMap, indicative, not station positions**. Airport pin from OSM.

## Real-life photos and the Blue Line route (added in the second pass)
Photos pop in on the map band, each with a credit chip; they are not committed (`assets/`):
| Where | Photo | Source / licence |
|---|---|---|
| hook | portrait of Sheikh Mohammed bin Rashid (round badge) | Wikipedia infobox image "Mohammed bin Rashid Al Maktoum (15-02-2021).jpg" (Wikimedia Commons) - **check the licence line on the file page before posting** (the API was rate-limited when I tried) |
| 2.1 trillion; "city within a city" | Dubai Creek Harbour with the skyline | Wikimedia Commons "Dubai Creek Harbour.jpg", CC BY-SA 4.0, CoolP1x4rt |
| 350,000 homes; "more supply" | Dubai Marina towers | Wikimedia Commons "Dubai Marina Skyline.jpg" (licence line to be confirmed on the file page) |
| Al Maktoum Airport | terminal front | Wikimedia Commons "Dubai-World Central - Al Maktoum International Airport.jpg", CC0, Marlin Le |
| roads and metro | Dubai Metro train on Sheikh Zayed Road | Wikimedia Commons "Dubai Metro (29129193311).jpg", CC BY 2.0, Stefan Wisselink |
| Blue Line | RTA site visit in front of the Blue Line plan board | RTA / Dubai Media Office release of 9 Nov 2025 (press photo - check usage rights) |
Blue Line route: the real alignment from OpenStreetMap (via Wikidata Q16335308 geometry, (c) OpenStreetMap contributors, ODbL), two branches that meet at International City: Creek -> Academic City (20.1 km) and Centrepoint -> International City (9.8 km) = 29.9 km, matching the RTA's 30 km. Stations shown are the named areas (Creek, Dubai Creek Harbour, International City, Dubai Silicon Oasis, Academic City, Centrepoint); positions are indicative. The alignment is as mapped in OSM while under construction. Photo credits to add to the caption if you want them visible: see the table.

## Check before posting
- He says "over 2.1 trillion"; the release says "nearly AED2.1 trillion". The screen says only "DH 2.1 TRILLION".
- "capacity to handle 260 million passengers every year" = design capacity "over the next decade".
- The balance lines (more competition and supply, location and developer) are his own view, not Sheikh Mohammed's. No return or price claim is made.
- Check UAE/Dubai property-advertising rules (permit numbers, disclaimers) before posting.
- Real pages are captures (not committed, `assets/`); imagery (c) Esri, Maxar, Earthstar Geographics; outlines (c) OpenStreetMap contributors.

## Rebuild
```bash
python3 -I prep_cut.py cut.json                      # voice + footage frames (paths in cut.json point at the WeTransfer download)
python3 -I asr_words.py build/voice48k.wav build/words_raw.json "Sheikh Mohammed bin Rashid, Dubai, Al Maktoum"
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs
node render.mjs --out build/frames --fmt jpg --workers 4 --ss 1.5 --skip
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=22 MAXRATE=2.2M BUFSIZE=4.4M bash encode.sh dubai-ideal-time
```
