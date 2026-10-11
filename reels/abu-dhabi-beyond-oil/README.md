# Abu Dhabi — Beyond Oil (reel 01)

46.7 s vertical reel (1080×1920, 30 fps) cut to the supplied voiceover. Minimal, dark, one gold accent.
Everything is generated from code, so any beat can be retimed or restyled and the reel re-rendered.

## What's in it

| Time | Beat | Visual |
|------|------|--------|
| 0.0 | The question | Oil-price line draws, **crashes on "collapsed"** (screen shake, ripple, ghosted OIL drops), giant gold **?** |
| 4.5 | "Outdated argument" | "An oil economy" struck through, OUTDATED stamp, decades timeline, **beyond oil.** ring burst |
| 9.0 | Mubadala | Logo wipe + shine, **AED 1.4T** count-up, bar comparison vs Portugal's GDP |
| 13.9 | ADIA | Logo, tick-ring gauge fills to **US$ 1.1T** |
| 16.2 | The flywheel | AI · Technology · Infrastructure · Businesses → companies · jobs · housing demand |
| 21.9 | Aldar | Talay + Yas Riva Reserve tiles, **AED 5B+** combined sales |
| 26.3 | Modon | Hudayriyat Golf Estates, **AED 13B+** with a "within days" tick bar |
| 31.3 | What to look for | Entry prices · rental demand · long-term appreciation (check-marks draw on) |
| 37.9 | Bigger than oil | A single OIL dot inside an expanding economy ring |
| 42.2 | CTA | Shortlist card ticks off, DM typed, **SENT** |

Karaoke captions light up on the exact spoken word (keywords in gold). Sound design: whooshes on every cut, count-up ticks, logo hits, check-mark pings — all synthesised in `audio.py` (no samples).
Final mix is normalised to −14 LUFS / −1.5 dBTP.

## Rebuild

```bash
./build.sh /path/to/voiceover.mp4 abu-dhabi-beyond-oil.mp4
```

Needs: `ffmpeg`, `node` + `playwright` (Chromium), `python3` with `numpy` and `Pillow`, and the **Inter** font installed
(Instrument Serif ships in `fonts/`). Preview any moment: `node render.mjs --out stills --stills 3.4,9.9,26.9`.

## Files

- `timing.txt` — word-by-word timings (voiceover ASR + the script, hand-tuned). `|` lines start a new caption chunk.
- `scenes.js` — the ten hero scenes; `captions.js` — karaoke captions; `main.js` — background, HUD, transitions, grain.
- `lib.js` — easing, text, icons, logo drawing. `audio.py` — sound design + mix. `render.mjs` — frame renderer.
- `logos/source/*` — the logo artwork supplied; `prep_logos.py` keys them to transparent PNGs in `logos/`.
  **Aldar** and **Hudayriyat** logos were not supplied, so they are typographic marks. Drop `logos/aldar.png` /
  `logos/hudayriyat.png` (transparent background) and they are picked up automatically.
