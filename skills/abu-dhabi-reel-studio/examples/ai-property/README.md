# AI -> SI and Abu Dhabi property (reel 04)

57.6 s vertical reel (1080x1920, 30 fps), Abu Dhabi look + real material, **whoosh-only sound at a very low level**, all graphics inside the Instagram Reels safe zone (content y 330-1270 / x 120-960, captions ~y 1372).
Source: the already-edited video; picture + voice kept in order (`cut.json`), voice cleaned (`prep_cut.py`), word times from faster-whisper large-v3 (the 6-30 s stretch re-transcribed separately because the full pass skipped it) aligned to `script.txt`.

| Time | Look | What happens |
|------|------|--------------|
| 0 - 5.9 | **FACE** | hook "AI -> SI" (AI slides in, the arrow draws, SI slams into a gold box); Donald Trump's portrait pops in on his name |
| 5.9 - 9.0 | post | Trump's Truth Social post (21 Sep 2026) "SUPER INTELLIGENCE vs. SUPERIOR INTELLIGENCE?" with marker; AI turns into **SI** |
| 9.0 - 12.4 | official | the White House page for Executive Order 14434 + the order's text, marker on "the terms Super Intelligence and SI in place of Artificial Intelligence and AI" |
| 12.4 - 15.6 | type | SI doesn't automatically increase property prices |
| 15.6 - 19.4 | page | Microsoft's own post "$15.2 billion USD investment in the UAE" (marker) + count-up **US$ 15.2 billion** |
| 19.4 - 21.9 | page | ...including its partnership with Abu Dhabi's **G42** (marker on G42 in Microsoft's post) |
| 21.9 - 27.9 | page | Microsoft Source release: Global Engineering Development Center in Abu Dhabi (marker), attracting top tech talent |
| 27.9 - 32.8 | pills | companies expand -> engineers / executives / skilled professionals |
| 32.8 - 36.8 | type | somewhere to live -> potential **rental demand** |
| 36.8 - 43.9 | satellite | Reem Island + Al Maryah Island outlined and pinned |
| 43.9 - 47.4 | **FACE** | "buy at the right entry price, focus on actual rental demand" (stamps) |
| 47.4 - 50.7 | pills | rental income + capital appreciation (growth line) |
| 50.7 - 57.6 | chat | "Want my shortlist?" typed on "message me", sent, answered |

Notes: "US$" is on the 15.2 billion because Microsoft's post says "$15.2 billion USD" (cumulative 2023-2029); the SI statements are his, backed by the sources shown.
The Truth Social posts are captured from the public archive mirror trumpstruth.org (truthsocial.com blocks automated access). The Trump portrait is the public-domain 2025 official portrait (Wikimedia Commons).

## Real material (not committed - third-party; manifest with URLs, dates and licences in `../_assets/ai/assets.json`)
- Truth Social posts via trumpstruth.org: statuses 41829 (21 Sep 2026), 42026 (29 Sep 2026), 42201 (8 Oct 2026)
- White House, EO 14434: https://www.whitehouse.gov/presidential-actions/2026/09/inaugurating-the-era-of-super-intelligence/
- Microsoft On the Issues, 3 Nov 2025: https://blogs.microsoft.com/on-the-issues/2025/11/03/microsofts-15-2-billion-usd-investment-in-the-uae/
- Microsoft Source, 24 Sep 2024: https://news.microsoft.com/source/2024/09/24/microsoft-expands-its-global-engineering-development-centers-footprint-to-the-uaes-capital-abu-dhabi/
Imagery (c) Esri, Maxar, Earthstar Geographics (on screen); island outlines from OpenStreetMap (ODbL).

## Rebuild
```bash
python3 -I prep_cut.py cut.json
python3 -I ../asr_words.py build/voice48k.wav build/words_raw.json      # then re-transcribe 6-30 s if a stretch is skipped
python3 -I make_timeline.py 1.8
python3 -I extract_outlines.py ../abu-dhabi-beyond-oil/build/map/map.json
node export_cues.mjs && node fetch_tiles.mjs
node render.mjs --out build/frames --workers 4 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav
```
Then ffmpeg (H.264 crf 17, maxrate 5.5M, loudnorm -14 LUFS / -1.5 dBTP, AAC 192k). Captures go in `assets/` (names in `scenes.js` IMAGES).
