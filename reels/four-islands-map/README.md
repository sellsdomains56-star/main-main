# 4 islands in Abu Dhabi - map version (reel 08)

126 s vertical reel (1080x1920, 30 fps), same footage and voice as reel 07 (`../four-islands`, Abdullah Ahli's own take, unedited), but built differently: **his face is only a small round bubble** (gold ring, pulses while he speaks) and **the whole picture behind it is one continuous real satellite journey** over Abu Dhabi. Each island is "fully broken down" on the map while he talks about it: the camera flies there, the island is outlined, call-outs are pinned on the real places he names, and a checklist panel ticks off every point as he says it. Whoosh-only sound at a very low level, frosted-glass captions, everything inside the Instagram Reels safe zone (top 220 / bottom 450 / right 100 px).

| Time | Map | Bubble | What is broken down |
|------|-----|--------|---------------------|
| 0 - 7 | overview, 4 islands numbered | top right | "THE 4 KEY ISLANDS", name chip ABDULLAH AHLI |
| 7 - 27 | **Saadiyat**: z12.5 -> Cultural District -> beach | top right | Louvre Abu Dhabi + Guggenheim Abu Dhabi pins; Wikipedia cards with markers; panel "museums & beach / who buys" |
| 27.6 - 50 | **Yas**: z12.5 -> Ferrari World / Warner Bros -> circuit | top right | Ferrari World, Warner Bros, Yas Marina Circuit, Seaworld, Waterworld, Yas Mall pins; panel visitors / investors; "tourist destination -> residential community" |
| 50.6 - 77 | **Al Reem** + Al Maryah | top right | ADGM pin + flow line Al Maryah -> Al Reem; Finance Middle East card with markers; panel "why it works" (companies -> professionals -> homes -> demand -> rental income) |
| 77.5 - 101 | **Hudayriyat** | top right | beach + Surf Abu Dhabi pins; Khaleej Times card (villas, beaches); west-to-east hatching "still taking shape" |
| 101 - 117 | overview again, islands re-numbered | top right | "WHICH ONE? -> IT DEPENDS" panel (budget / goals / exit strategy), "making money is also about" panel |
| 117 - 126.1 | dimmed map | grows to centre | name, then "Hi Abdullah" typed, sent and answered "Right opportunity" |

Content: only what he says is shown (no extra figures). Pictures/pages are real captures (not committed, `assets/`): Wikipedia (Louvre Abu Dhabi, Guggenheim Abu Dhabi), Finance Middle East (ADGM / Al Reem, Feb 2025), Khaleej Times (Hudayriyat). Island outlines (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
Pin positions of landmarks come from OpenStreetMap / Wikipedia coordinates and are indicative; the Guggenheim is shown as "planned museum" (Wikipedia). "Wealthy international buyers", "growing residential community" and "stronger demand for apartments" are his opinions, not verified here.

## Engine additions (also in `skills/abu-dhabi-reel-studio/scripts/engine/`)
- `main.js`: `BUBBLE` config (`src` crop of the footage, keyed `cx/cy/r` path) -> `drawBubble(t)`; no `FACE_SEGS` needed.
- `scenes_lib.js`: `camKey`, `mapTag`, `mapOutline`, `mapPulse`, `mapFlow`, `mapBuild`, `hudTitle`, `breakdown` (frosted checklist panel), `islandBadge`.
- `captions.js`: `glassPill(x, y, w, h, rad)` with optional corner radius.

## Rebuild
`build/footage` and `build/tiles` are shared with `../four-islands` (symlinks).
```bash
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs
node render.mjs --out build/frames --fmt jpg --workers 4 --ss 1.5 --skip
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=21 MAXRATE=2.4M BUFSIZE=4.8M bash encode.sh four-islands-map
python3 -I safe_scan.py build/frames 3 --skip 0-1
```
