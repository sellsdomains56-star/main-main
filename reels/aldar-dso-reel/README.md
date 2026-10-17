# Aldar's new Dubai community near Silicon Oasis - map reel (reel 10)

101.4 s vertical reel (1080x1920, 30 fps) plus a 3 s end card, from Abdullah Ahli's own recording (WeTransfer, 17 Oct 2026, 1080x1920 25 fps, English, one continuous take, voice and picture unedited). Same look as `../dubai-ideal-time`: one continuous real satellite journey (Esri World Imagery) over east Dubai, his **live face as a small round bubble** top-left (gold ring, pulses while he speaks), a HUD title next to it, frosted checklist panels that grow row by row, real pages as proof cards with marker highlights, frosted-glass captions, whoosh-only sound at a very low level, everything inside the Instagram Reels safe zone. Call to action: "comment green" (typed into a comment field, answered "Sending you the information").

Script as spoken: `script.txt` (editor markup). The recording is NOT the reworded script from `../aldar-dso-townhouses/script_from_study/`; it is a different text that names the project "Greenwoods".

| Time | What he says | On screen |
|------|--------------|-----------|
| 0 - 7.7 | Aldar is preparing to launch one of its largest communities in Dubai, 3-bedroom townhouses expected from 3 million dirhams | HUD NEW COMMUNITY, then DH 3 MILLION counter; The National headline card with markers on "launch major Dubai villa and townhouse project" |
| 7.7 - 12.1 | "Greenwoods", with Dubai Holding | HUD GREENWOODS / ALDAR x DUBAI HOLDING; pin on Dubai Silicon Oasis; The National CEO quote, marker on "partnership with Dubai Holding" |
| 12.2 - 20.3 | ~43 million sq ft, ~8,000 homes: apartments, villas, townhouses | HUD counters (43 MILLION SQ FT, 8,000 NEW HOMES), checklist panel "THE COMMUNITY · AS REPORTED" |
| 20.4 - 31.5 | 3-bed townhouse ~2,227 sq ft, 3 million start = ~1,350 per sq ft | HUD 2,227 SQ FT, DH 3 MILLION, DH 1,350 / SQ FT; panel "THE MATHS · EXPECTED" |
| 31.7 - 36 | potentially 15% below some nearby competing communities | HUD 15% BELOW; index bars 100 vs 85 with the dashed -15% gap |
| 36.2 - 42 | close to Dubai Silicon Oasis and Academic City, connected to Sheikh Mohammed bin Zayed Road | real OSM outlines of both districts fill in, panel THE LOCATION |
| 42 - 52.7 | AED 12.8 bn expansion of Silicon Oasis into a tech and AI hub, 70,000+ jobs | Dubai Media Office release (22 Jan 2026), markers on "AED12.8 billion" and "70,000 direct and indirect jobs"; HUD counters |
| 52.7 - 57.3 | Academic City keeps expanding its educational institutions | Academic City island, panel |
| 57.3 - 64.5 | Blue Line by 2029 connects both to the metro network | the real Blue Line alignment (OSM) draws on, station dots, RTA release card with markers on "9.9.2029" and "connects the Red and Green Lines" |
| 64.8 - 72.8 | Haven, Athlon, The Wilds showed strong demand at launch | panel with the three launches (Aldar announcements) and "3,552 homes, AED 17.9bn on the DLD record" (from our study) |
| 72.8 - 81.4 | Haven reportedly 8.8% return on repeat sales, median prices +20% in 13 months | HUD 8.8% / UP 20%+, panel marked REPORTED |
| 81.5 - 91.3 | major Aldar development, entry price expected below some neighbours, near billions of investment | panel THE BIG PICTURE |
| 91.4 - 96.7 | depends on final pricing, payment plan, future supply | panel THE POTENTIAL DEPENDS ON |
| 96.8 - 104.4 | comment "green" and I'll send the information | map dims, bubble grows, ABDULLAH AHLI / PORTFOLIO STRATEGIST, "green" typed, sent, answered |

## Facts and sources (what is verified and what is only his claim)
Verified (primary pages shown on screen):
- The National, 14 Oct 2026 (Aldar to launch major Dubai villa and townhouse project by end of year): the new project, value not disclosed, "will be built near Dubai Silicon Oasis" (CEO Jonathan Emery); Aldar's fourth Dubai project after Haven, Athlon and The Wilds; "another partnership with Dubai Holding ... sits above the Blue Line extension".
- Dubai Media Office / WAM, 22 Jan 2026: Sheikh Mohammed bin Rashid launched expansion projects at Dubai Silicon Oasis with investments totalling AED12.8 billion; District IO "will create more than 70,000 direct and indirect jobs over ten years".
- RTA release via Dubai Media Office, 9 Nov 2025: Blue Line opening targeted for 9.9.2029; "connects the Red and Green Lines of the Dubai Metro". The OSM alignment runs through Dubai Silicon Oasis and Academic City stations (station positions indicative).
- Aldar launch facts on the panel (Haven 1 Nov 2023, 786 homes; Athlon 9 May 2024, 1,000+ homes; The Wilds 5 Mar 2025, 734 villas; 3,552 homes / AED 17.9bn registered by DLD): our study `../aldar-dso-townhouses/study/` (the three launches table, page 5). These figures are not in his script.

His own claims (not confirmed by Aldar; the screen marks them REPORTED / EXPECTED / AS REPORTED): the name "Greenwoods" (only broker listings use it), about 43 million sq ft and 8,000 homes, three-bedroom townhouse of about 2,227 sq ft, a starting price of AED 3 million, about AED 1,350 per sq ft (3,000,000 / 2,227 = 1,347), "potentially 15% below some nearby competing communities", Haven 8.8% return on repeat sales (our study measures +8.7% resale vs launch) and "median prices up more than 20% over 13 months". The study's base case for the new community is AED 1,400-1,650 per sq ft, so the 1,350 and the 15% are more optimistic than the study.

## Check before posting
- Property-advertising rules (RERA / DLD ad permit number and disclaimers) for an unlaunched project; the reel says "expected / reported" but a price and size of an unlaunched, unnamed project should be cleared.
- The project name is not announced by Aldar; consider "Aldar's new community near Silicon Oasis" in the caption.
- Real pages are captures (not committed, `assets/`); imagery (c) Esri, Maxar, Earthstar Geographics; outlines and the Blue Line (c) OpenStreetMap contributors (ODbL).

## Rebuild
```bash
python3 -I prep_cut.py cut.json                      # voice + footage frames (paths in cut.json point at the WeTransfer download)
python3 -I asr_words.py build/voice48k.wav build/words_raw.json "Aldar, Greenwoods, Dubai Holding, Dubai Silicon Oasis, Academic City, Sheikh Mohammed bin Zayed Road, Haven, Athlon, The Wilds"
# merge two-token numbers in build/words_raw.json (8 + ,000 -> 8,000; 12 + .8; 15 + %; three + -bedroom ...), then:
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs          # build/tiles is a symlink to ../dubai-ideal-time/build/tiles
node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5 --skip
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=22 MAXRATE=2.2M BUFSIZE=4.4M bash encode.sh aldar-dso-reel
```
Page captures (full page, narrow viewport so lines are short and the text is large): `node shot.mjs <url> assets/national.png --w 700 --dpr 2 --full`, Media Office `--w 480 --dpr 2 --full`; RTA page reused from `../dubai-ideal-time/assets/rta.png`.
