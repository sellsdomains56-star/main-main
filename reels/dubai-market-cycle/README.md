# Is Dubai heading for another 2008? (reel 03)

69.3 s vertical reel (1080x1920, 30 fps), Abu Dhabi look: near-black + ivory + gold, bold type, small black-on-white captions, him on screen in two beats, one hero per beat,
real news pages as animated cards, a satellite flight, **whoosh-only sound at a very low level** (no music), everything inside the Instagram Reels safe zone
(content y 330-1270 / x 120-960, captions ~y 1372; the top ~270 px, bottom ~480 px and the right strip are left to the app's UI).

## The edit (raw talk -> clean cut)
`cut.json` is the edit list: 8 takes cut at the **energy minima between phrases** (`edl_tools.py`), 66.3 s of the 130 s raw. Left out: the director's Arabic asides ("thabit", "anzil", "zain", "yalla",
and a 1.5 s Arabic aside in the middle of "...Dubai recovered, [aside] property prices..."), a false start, a doubled "you guys", and every retake of the last lines.
`prep_cut.py` cuts video + voice (6 ms edge fades, hum/noise clean-up, compressor, light EQ). Words: faster-whisper large-v3 (`../asr_words.py`) aligned to `script.txt` -> `timeline.json`.

| Time | Look | What happens |
|------|------|--------------|
| 0 - 7.1 | **FACE** | hook "DUBAI PROPERTY / COLLAPSE?" kinetic title, **ANOTHER 2008?** stamp |
| 7.1 - 23.5 | graphic | one price curve through the 2008 crash, 2014 peak, correction, 2020 COVID, recovery **+60%** (2022 - early 2025) |
| 23.5 - 28 | article | Khaleej Times: Fitch warned of a possible **15%** correction through 2026 (marker on "up to 15%") |
| 28 - 34.4 | article | Dubai Media Office: transactions exceeding **AED 917 billion** in 2025 |
| 34.4 - 40.7 | article | The National (Oct 2026): sales fall amid regional uncertainty; tourism / investor confidence / transactions |
| 40.7 - 48.4 | article | Dubai Media Office (May 2026): incentives total **AED 2.5 billion**; support for real estate + construction |
| 48.4 - 52.4 | **FACE** | "corrections are part of every property cycle" |
| 52.4 - 58.4 | pills | watch future supply / rental demand / entry price; where investment decisions start |
| 58.4 - 66.4 | satellite | the bubble analogy: Sheikh Mohammed portrait, Palm Jumeirah outline, a bubble that bursts, Downtown / Burj Khalifa |
| 66.4 - 69.3 | end card | silent chat call-to-action (not in the talk; `python3 -I make_timeline.py 0` drops it) |

Currency: the spoken "917 billion" and "2.5 billion" are AED in the official sources shown on screen (Dubai Media Office). The price curve is schematic, not data.

## Real material (not committed - third-party; re-capture with `../_assets/shot.mjs`, manifest in `../_assets/dubai/assets.json`)
- Khaleej Times, 29 May 2025: https://www.khaleejtimes.com/business/property/dubai-property-prices-to-drop-after-peak
- Dubai Media Office, 12 Jan 2026: https://www.mediaoffice.ae/en/news/2026/january/12-01/dubais-real-estate-market-records-new-historic-milestone
- The National, 7 Oct 2026: https://www.thenationalnews.com/business/property/2026/10/07/dubai-home-sale-transactions-fall-in-third-quarter-due-to-regional-uncertainty/
- Dubai Media Office, 21 May 2026: https://mediaoffice.ae/en/news/2026/may/21-05/hamdan-bin-mohammed
- Sheikh Mohammed bin Rashid portrait: see the manifest for author / licence.
Imagery (c) Esri, Maxar, Earthstar Geographics (on screen); Palm outline from OpenStreetMap (ODbL).

## Rebuild
```bash
python3 -I prep_cut.py cut.json                          # -> build/voice48k.wav, build/footage/, build/cutmap.json
python3 -I ../asr_words.py build/voice48k.wav build/words_raw.json "Abdullah, Dubai, Fitch, Sheikh Mohammed bin Rashid"
python3 -I make_timeline.py 3.0                          # + 3 s silent end card
node export_cues.mjs && node fetch_tiles.mjs             # sound cues + satellite tiles
node render.mjs --out build/frames --workers 4 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav     # voice + very quiet whooshes (--glitch / --clean / --soft for the old sets)
```
Then ffmpeg (H.264 crf 17, maxrate 4.6M, loudnorm -14 LUFS / -1.5 dBTP, AAC 192k). Needs ffmpeg, node + playwright (Chromium), Python 3 (numpy Pillow shapely osmium faster-whisper), the Inter font; put the captures in `assets/` (names in `scenes.js` IMAGES).
