# Is Dubai heading for another 2008? (reel 03)

71.8 s vertical reel (1080×1920, 30 fps) in the same look as the Abu Dhabi "Beyond Oil" reel: near-black + ivory + gold, bold type only,
small black-on-white captions (one phrase at a time), him on screen only in two beats, one calm hero graphic for every other beat,
a real satellite flight over Dubai, glitch-style sound effects, no music.

Source: the *raw, unedited* talk (WeTransfer clip). `cut.json` is the edit list (the takes that were kept, in order); `prep_cut.py` cuts
video + voice to it (6 ms edge fades, hum/noise clean-up, compressor, light EQ), extracts the frames and writes `build/cutmap.json`.
`script.txt` is the spoken script (`{60%|sixty percent}` = what is shown | what is said); `make_timeline.py` aligns it to the ASR word
times (faster-whisper large-v3, `../asr_words.py`) → `timeline.json`. Everything else is generated from code.

| Time | Look | What happens |
|------|------|--------------|
| 0 – 7.1 | **FACE** | the question; **ANOTHER 2008?** stamp on the word |
| 7.1 – 25 | text | one price curve draws through 2008 crash → 2014 peak → years of correction → 2020 COVID → recovery, **60%** (2022 – early 2025) |
| 25 – 29.9 | text | Fitch warned (2025): possible **15%** correction through 2026 |
| 29.9 – 36.2 | number | still recorded over **917 BILLION** in real-estate transactions, 2025 – 2026 |
| 36.2 – 42.8 | text | geopolitical tensions → tourism · investor confidence · property transactions |
| 42.8 – 48 | number | Dubai is responding: the government introduced **2.5 BILLION** in economic incentives |
| 48 – 50.2 | text | including support for real estate · construction |
| 50.2 – 54.6 | **FACE** | "corrections are part of every property cycle" |
| 54.6 – 60.6 | text | watch future supply · rental demand · entry price → where investment decisions start |
| 60.6 – 68.9 | **satellite** | the bubble analogy: Palm Jumeirah (outlined) → Downtown Dubai / Burj Khalifa |
| 68.9 – 71.8 | end card | silent chat call-to-action ("Questions on Dubai?") — not in the talk; drop it with `python3 -I make_timeline.py 0` |

Notes: the curve is schematic (not data). Figures are shown exactly as spoken — he does not say a currency for the 917 billion or the 2.5 billion,
so none is shown. Imagery © Esri, Maxar, Earthstar Geographics (on screen); the Palm Jumeirah outline is from OpenStreetMap (ODbL).

## Rebuild
```bash
python3 -I prep_cut.py <raw-talk.mp4>                      # edit list -> build/voice48k.wav, build/footage/, build/cutmap.json
python3 -I ../asr_words.py build/voice48k.wav build/words_raw.json "Abdullah, Dubai, Fitch, Sheikh Mohammed bin Rashid"
python3 -I make_timeline.py 3.0                            # + 3 s silent end card
node export_cues.mjs && node fetch_tiles.mjs               # sound cues + the satellite tiles the camera needs
node render.mjs --out build/frames --workers 4 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav       # voice + glitch SFX (--clean / --soft for other sets)
```
Then encode with ffmpeg (H.264, loudnorm −14 LUFS / −1.5 dBTP, AAC 192k). Needs `ffmpeg`, `node` + `playwright` (Chromium), Python 3 with
`numpy Pillow shapely osmium faster-whisper`, and the **Inter** font installed. `extract_outlines.py` rebuilds `outlines.json` (Palm Jumeirah) from an OSM extract.
