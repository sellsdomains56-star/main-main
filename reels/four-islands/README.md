# 4 islands in Abu Dhabi (reel 07)

126 s vertical reel (1080x1920, 30 fps), Abu Dhabi look + real material, whoosh-only sound at a very low level, frosted-glass captions, all graphics inside the Instagram Reels safe zone.
Source: Abdullah Ahli's own 123 s podcast-style take (WeTransfer, 1080x1920 25 fps, English). Picture and voice are kept in sync and unedited (`cut.json` = one segment); word times from faster-whisper large-v3 + `snap_onsets.py`, aligned to `script.txt`.

| Time | Look | What happens |
|------|------|--------------|
| 0 - 6.2 | **FACE** | hook: "4 ISLANDS / IN ABU DHABI" boxes slam in as he says them |
| 6.2 - 10.3 | satellite | **Saadiyat** outlined + pinned ("luxury is heading") |
| 10.3 - 17.6 | cards | Louvre Abu Dhabi and Guggenheim Abu Dhabi (Wikipedia, markers), pills: beachfront communities / exclusive properties |
| 17.6 - 26.5 | type | wealthy international buyers: privacy, luxury, long-term value; high-end market -> worth considering |
| 26.5 - 31.3 | satellite | **Yas** outlined + pinned |
| 31.3 - 38 | pills | Ferrari World / Warner Bros / Formula One circuit / attractions all year |
| 38 - 44.8 | type | "tourist destination" struck -> growing residential community |
| 44.8 - 49.6 | pills | rental income / holiday homes / potential appreciation |
| 49.6 - 53.3 | satellite | **Al Reem** outlined + pinned |
| 53.3 - 62.4 | card | ADGM integration of Al Reem (Finance Middle East, markers on ADGM and Al Reem Island) |
| 62.4 - 67.7 | pills | more companies -> more professionals -> need places to live |
| 67.7 - 76.7 | type + pills | stronger demand; rental income / business districts; worth exploring |
| 76.8 - 82.5 | satellite | **Hudayriyat** outlined + pinned |
| 82.5 - 90.0 | card + pills | Khaleej Times on Hudayriyat (markers: villas, beaches), sporting facilities / master plans |
| 90.0 - 100.8 | graphic | still taking shape: growth line, longer investment horizon |
| 100.8 - 103.6 | **FACE** | "which of these four would I choose?" (WHICH ONE? stamp) |
| 103.6 - 116.8 | pills + type | depends on budget, goals, exit strategy; where / what / how much / how easily you sell |
| 116.8 - 119.7 | **FACE** | name: ABDULLAH AHLI |
| 119.7 - 126.1 | chat | "Send me a message" typed, sent, answered |

Content: only what he says is shown on screen (no extra figures). Pictures/pages are real captures; the pin positions are island centres (outlines from OpenStreetMap, ODbL).
Real material (not committed): Wikipedia (Louvre Abu Dhabi, Guggenheim Abu Dhabi), Finance Middle East (ADGM completes Al Reem Island integration, 24 Feb 2025), Khaleej Times (Hudayriyat, villas on green hills / beaches). Imagery (c) Esri, Maxar, Earthstar Geographics.
Claims he makes that were not re-verified here: "wealthy international buyers", "growing residential community", "stronger demand for apartments" (opinions); Guggenheim Abu Dhabi is shown as "planned / under construction" per Wikipedia.

## Rebuild
```bash
python3 -I prep_cut.py cut.json             # one segment; frames at native 1080x1920
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs
node render.mjs --out build/frames --fmt jpg --workers 4 --ss 1.5 --skip
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=21 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh four-islands
```
