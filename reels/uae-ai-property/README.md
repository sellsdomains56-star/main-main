# AI → SI and Abu Dhabi property (reel 04)

57.6 s vertical reel (1080×1920, 30 fps) in the same look as the Abu Dhabi "Beyond Oil" reel: near-black + ivory + gold, bold type only,
small black-on-white captions, him on screen in two beats only, one calm hero per beat, a real satellite flight over Reem Island and
Al Maryah Island with drawn outlines, glitch-style sound effects, no music.

Source: the already-edited video (WeTransfer clip). Its picture and voice are kept in order (`cut.json`), the voice is cleaned (`prep_cut.py`),
word times come from faster-whisper large-v3 (`../asr_words.py`; the 6–30 s stretch was re-transcribed separately because the full-length pass skipped it)
aligned to `script.txt` → `timeline.json`.

| Time | Look | What happens |
|------|------|--------------|
| 0 – 5.9 | **FACE** | the question; **AI → SI** stamp on the word |
| 5.9 – 12.4 | text | AI turns into **SI** (superintelligence), the official term in the US executive branch |
| 12.4 – 15.7 | text | SI doesn't automatically increase property prices |
| 15.7 – 19.2 | number | Microsoft investing around **US$ 15.2 billion** |
| 19.2 – 21.9 | text | …including its partnership with Abu Dhabi's **G42** |
| 21.9 – 25.7 | text | engineering development center in Abu Dhabi |
| 25.7 – 27.9 | text | attracting international technology talent |
| 27.9 – 32.8 | text | companies expand → engineers · executives · skilled professionals |
| 32.8 – 36.8 | text | somewhere to live → potential **rental demand** |
| 36.8 – 43.9 | **satellite** | residential communities near growing business districts: Reem Island and Al Maryah Island outlined and pinned |
| 43.9 – 47.4 | **FACE** | "buy at the right entry price, focus on actual rental demand" |
| 47.4 – 50.7 | text | rental income · capital appreciation |
| 50.7 – 57.6 | chat | "Want my shortlist?" typed on "message me", sent, answered (1.8 s silent tail so the reply lands) |

Notes: "US$" is added to the 15.2 billion (he says only "15.2 billion"; Microsoft's announced UAE figure is in US dollars) — remove it in `scenes.js` if you prefer to show it as spoken.
The SI / US-executive-branch statements are his, not independently checked. Imagery © Esri, Maxar, Earthstar Geographics (on screen); island outlines from OpenStreetMap (ODbL).

## Rebuild
```bash
python3 -I prep_cut.py <edited-video.mp4>
python3 -I ../asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 1.8
python3 -I extract_outlines.py ../abu-dhabi-beyond-oil/build/map/map.json   # Reem + Al Maryah outlines from the OSM land polygons
node export_cues.mjs && node fetch_tiles.mjs
node render.mjs --out build/frames --workers 4 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav
```
Then encode with ffmpeg (H.264, loudnorm −14 LUFS / −1.5 dBTP, AAC 192k). Needs `ffmpeg`, `node` + `playwright` (Chromium), Python 3 with `numpy Pillow shapely osmium faster-whisper`, and the **Inter** font installed.
