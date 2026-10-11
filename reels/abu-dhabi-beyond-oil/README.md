# Abu Dhabi — Beyond Oil (reel 01)

46.7 s vertical reel (1080×1920, 30 fps) edited from the interview footage + voiceover. Everything — cuts, zooms, captions,
graphics, map, cutout, sound — is generated from code, so any beat can be retimed and the reel re-rendered.

## The edit

Clean cut for easy reading (big type, one hero per beat, charcoal + ivory + muted champagne). He is on screen in only two beats
(full-screen face, punch-in / zoom-out moves, bold captions); the rest are graphics, real satellite flyovers and the developers' own
renders, with his voice carrying on underneath (edit list = `SEG` in `main.js`, scene list = `SCENES` in `scenes.js`).

| Time | Look | What happens |
|------|------|--------------|
| 0.0 – 5.6 | **FACE** | The question; **OUTDATED** stamp on the word |
| 5.6 – 8.95 | text | a thin line draws across (decades) → "Building wealth *beyond oil.*" |
| 8.95 – 11.8 | **satellite** | fly-in to Al Maryah Island, island traced with a drawn outline, Mubadala logo |
| 11.8 – 13.9 | text | Mubadala vs Portugal's GDP bars |
| 13.9 – 16.2 | text | ADIA logo, ring fills → **US$ 1.1T** |
| 16.2 – 21.9 | text | AI · Technology · Infrastructure · Businesses → companies · jobs · housing demand |
| 21.9 – 24.5 | **satellite** | Aldar: Saadiyat (Talay) → fly across → Yas (Yas Riva Reserve), islands outlined, pins |
| 24.5 – 26.3 | photos + number | Talay + Yas Riva Reserve renders, **AED 5B+** combined |
| 26.3 – 28.2 | **satellite** | Modon: Hudayriyat Island outlined, pin |
| 28.2 – 31.3 | photo + number | Hudayriyat Golf Estates, **AED 13B+** within days |
| 31.3 – 37.9 | text | entry prices · rental demand · long-term appreciation |
| 37.9 – 42.2 | **FACE** | OIL is a dot; the economy ring grows past it |
| 42.2 – 46.7 | text | "Want my shortlist?" - DM typed, sent |

* **Captions**: very large, bold all-caps, each word pops on the beat; the spoken word sits in a champagne pill.
* **Satellite**: Esri World Imagery tiles (`fetch_tiles.mjs` downloads exactly the tiles the camera needs into `build/tiles/`), flown by the
  deterministic camera in `satmap.js`; island outlines from OpenStreetMap (`extract_outlines.py` → `outlines.json`) are drawn on top.
  Imagery © Esri, Maxar, Earthstar Geographics (shown on screen).
* **Real images**: the developers' own press renders - Talay and Yas Riva Reserve (Aldar press releases on Zawya), Hudayriyat Golf Estates
  (modon.com). They are not committed (copyrighted); `build/photos/{talay,yasriva,hudayriyat}.jpg`.
* **Sound**: his own footage audio + a handful of very soft effects (airy whooshes on scene changes, low thuds, gentle chimes), no music.
  `audio.py … --clean` / `--glitch` give the older, louder sets. Mix normalised to −14 LUFS / −1.5 dBTP.

## Rebuild

```bash
./build.sh /path/to/interview-footage.mp4 abu-dhabi-beyond-oil-final-edit.mp4
```

Needs `ffmpeg`, `node` + `playwright` (Chromium), `curl`, Python 3 with `numpy Pillow shapely osmium`,
and the **Inter** font installed (Instrument Serif ships in `fonts/`). Preview any moment:
`node render.mjs --out stills --ss 1 --stills 3.4,9.9,26.9` (after the footage / matte / map steps in `build.sh` have run).

## Files

- `timing.txt` — word timings (voiceover ASR + the script, hand-tuned); `|` starts a caption chunk.
- `main.js` — compositor: edit list, footage + cutout layer, zoom moves, layering. `scenes.js` — half-and-half scenes and face overlays.
  `captions.js` — captions. `map.js` — map camera, pins, arcs. `lib.js` — easing, text, icons, logos.
- `satmap.js` — satellite layer + camera, `fetch_tiles.mjs` — tile download, `extract_outlines.py` / `outlines.json` — island outlines, `places.json` — pin coordinates.
  (`matte_raw.py` / `matte_post.py` / `map_extract.py` are from the earlier cut: speaker cutout and the drawn vector map; `map_extract.py` still produces the OSM polygons the outlines come from.)
- `audio.py` — sound design + mix. `render.mjs` — frame renderer. `prep_logos.py` + `logos/` — supplied logo artwork keyed to transparent PNGs.
  **Aldar** and **Hudayriyat** logos were not supplied, so they are typographic marks; drop `logos/aldar.png` / `logos/hudayriyat.png`
  (transparent background) and they are picked up automatically.
