# Finished reels (code only) - read these before writing a new scenes.js

| Folder | Reel | What it shows |
|---|---|---|
| `ohana-townhouses/` | 49 s: his hook + a recorded voice-over about a townhouse project | the newest, cleanest example: hook face beat, map flight with pin, picture + counter, bars + dashed gap, range, RARE stamp, real article card with marker highlights, payment timeline, gauges, chat CTA. `script.txt` shows the `{display|spoken}` markup. |
| `ai-property/` | 58 s: edited talk, real posts/pages as cards | many real cards with `focus` + `hl`, face beats, pills, satellite flight over two islands, growth line |
| `dubai-market-cycle/` | 69 s: a raw talk re-cut | `cut.json` = the edit list of a raw clip (cuts at energy minima), price-curve graphic, article cards, bubble that bursts |

The pictures/screenshots these scenes load (`assets/*.png|jpg`) are third-party and not included - the READMEs list where each came from. Copy the pattern, not the file: new reel = `new_reel.sh` + a scenes.js built from `assets/scenes.template.js`.
