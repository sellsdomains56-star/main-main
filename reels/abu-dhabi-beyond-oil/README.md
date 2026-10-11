# Abu Dhabi — Beyond Oil (reel 01)

46.7 s vertical reel (1080×1920, 30 fps) edited from the interview footage + voiceover. Everything — cuts, zooms, captions,
graphics, map, cutout, sound — is generated from code, so any beat can be retimed and the reel re-rendered.

## The edit

The reel alternates two looks, with a punch-zoom move at every cut (edit list = `SEG` in `main.js`):

| Time | Look | What happens |
|------|------|--------------|
| 0.0 – 5.6 | **FACE** | He listens while the question is asked; oil-price line crashes on "collapsed" (punch-in + shake), gold **?**; **OUTDATED** stamp slams in on the word |
| 5.6 – 11.8 | **SPLIT** | Live map of Abu Dhabi behind; "decades → *beyond oil.*"; Mubadala logo + **AED 1.4T** count-up; map flies to Al Maryah Island |
| 11.8 – 13.9 | **FACE** | Mubadala vs Portugal's GDP bars over his face |
| 13.9 – 24.5 | **SPLIT** | ADIA (Corniche) gauge → **US$ 1.1T**; AI · Technology · Infrastructure · Businesses → companies · jobs · housing demand (arcs spread from Al Maryah); Aldar → Talay (Saadiyat) + Yas Riva Reserve (Yas Island) |
| 24.5 – 26.3 | **FACE** | **AED 5B+** combined sales |
| 26.3 – 28.2 | **SPLIT** | Modon → Hudayriyat Island pin |
| 28.2 – 31.3 | **FACE** | **AED 13B+**, "within days" bar fills |
| 31.3 – 37.9 | **SPLIT** | Entry prices · rental demand · long-term appreciation, map pulses |
| 37.9 – 42.2 | **FACE** | OIL is a dot; the economy rings out around him (zoom-out) |
| 42.2 – 46.7 | **SPLIT** | Shortlist card, DM typed, **SENT** |

* **SPLIT**: he is lifted out of his background (RMBG-1.4 matte, edge-refined) and stands smaller in the lower half, in front of the
  map, with a gold rim light that pulses with his voice. Graphics + map in the upper half.
* **Captions**: bold all-caps, outlined, each word pops on the beat, the spoken word lights up, keywords in gold.
* **Map**: real OpenStreetMap coastline/islands/roads (© OpenStreetMap contributors, ODbL) drawn in the reel's style; a fly-to camera
  glides between the places he names (`CAM` in `map.js`), pins ripple in on the word.
* **Sound**: his own footage audio + synthesised effects (whooshes on cuts, count ticks, stamp, pings). Music bed is **off**
  (`audio.py … --music` turns it on). Mix normalised to −14 LUFS / −1.5 dBTP.

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
