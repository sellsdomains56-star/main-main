# Abu Dhabi — Beyond Oil (reel 01)

46.7 s vertical reel (1080×1920, 30 fps) edited from the interview footage + voiceover. Everything — cuts, zooms, captions,
graphics, map, cutout, sound — is generated from code, so any beat can be retimed and the reel re-rendered.

## The edit

Calm cut: he is on screen in only two beats (full-screen face, punch-in / zoom-out moves, bold captions); everything else is one
hero graphic per beat on top of the live Abu Dhabi map, with his voice carrying on underneath (edit list = `SEG` in `main.js`).

| Time | Look | What happens |
|------|------|--------------|
| 0.0 – 5.6 | **FACE** | The question; **OUTDATED** stamp on the word |
| 5.6 – 8.95 | graphics | decades line → "Building wealth *beyond oil.*" |
| 8.95 – 11.8 | graphics | Mubadala logo + **AED 1.4T** count-up, map flies to Al Maryah |
| 11.8 – 13.9 | graphics | Mubadala vs Portugal's GDP bars |
| 13.9 – 16.2 | graphics | ADIA (Corniche) ring → **US$ 1.1T** |
| 16.2 – 21.9 | graphics | AI · Technology · Infrastructure · Businesses → companies · jobs · housing demand |
| 21.9 – 26.3 | graphics | Aldar → Talay + Yas Riva Reserve; **AED 5B+** |
| 26.3 – 31.3 | graphics | Modon → Hudayriyat; **AED 13B+** within days |
| 31.3 – 37.9 | graphics | entry prices · rental demand · long-term appreciation |
| 37.9 – 42.2 | **FACE** | OIL is a dot; the economy ring grows past it |
| 42.2 – 46.7 | graphics | shortlist card, DM typed, sent |

* **Captions**: bold all-caps, outlined, each word pops on the beat, the spoken word lights up, keywords in gold.
* **Map**: real OpenStreetMap coastline/islands/roads (© OpenStreetMap contributors, ODbL) drawn in the reel's style; a fly-to camera
  glides between the places he names (`CAM` in `map.js`), pins ripple in on the word.
* **Sound**: his own footage audio + synthesised glitch-style effects (`audio.py … --clean` for the clean set). Music bed is **off**
  (`--music` turns it on). Mix normalised to −14 LUFS / −1.5 dBTP.

## Rebuild

```bash
./build.sh /path/to/interview-footage.mp4 abu-dhabi-beyond-oil-final-edit.mp4
```

Needs `ffmpeg`, `node` + `playwright` (Chromium), Python 3 with `numpy Pillow opencv-contrib-python onnxruntime shapely osmium`,
and the **Inter** font installed (Instrument Serif ships in `fonts/`). Preview any moment:
`node render.mjs --out stills --ss 1 --stills 3.4,9.9,26.9` (after the footage / matte / map steps in `build.sh` have run).

## Files

- `timing.txt` — word timings (voiceover ASR + the script, hand-tuned); `|` starts a caption chunk.
- `main.js` — compositor: edit list, footage + cutout layer, zoom moves, layering. `scenes.js` — half-and-half scenes and face overlays.
  `captions.js` — captions. `map.js` — map camera, pins, arcs. `lib.js` — easing, text, icons, logos.
- `matte_raw.py` / `matte_post.py` — speaker cutout. `map_extract.py` — OSM → vector map. `places.json` — pin coordinates.
- `audio.py` — sound design + mix. `render.mjs` — frame renderer. `prep_logos.py` + `logos/` — supplied logo artwork keyed to transparent PNGs.
  **Aldar** and **Hudayriyat** logos were not supplied, so they are typographic marks; drop `logos/aldar.png` / `logos/hudayriyat.png`
  (transparent background) and they are picked up automatically.
