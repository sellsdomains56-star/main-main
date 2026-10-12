# The Abu Dhabi look - style guide

Everything here is already implemented in `scripts/engine/` (lib.js, main.js, captions.js, satmap.js, scenes_lib.js, audio.py). Read this to know *why* it looks like this and what must not change; read `scene-api.md` for how to use the pieces.

## 1. Look
| Thing | Value |
|---|---|
| canvas | 1080 x 1920, 30 fps, rendered at 1.5x supersampling (`--ss 1.5`) |
| background | near-black `#08080A`, two faint warm glows, a very faint dot grid scrolling up, 26 slow dust motes, film grain 4.5% overlay, vignette |
| ink | warm ivory `#F3EFE6`; dim ivory `rgba(243,239,230,.62)` for secondary lines |
| accent | gold `#E9C47C` (key words, bars for "ours", rings, pins, outlines) |
| type | **bold only**: Inter Display 700-800 for display, Inter 700 for small text; no light weights, no italics. Kinetic type slides up out of a mask (`bw`); the key word sits in a gold box with black text (`hl`) |
| captions | 58 px, 800 weight, **white bold text on a frosted-glass pill** (the scene behind is copied, blurred and darkened - backdrop blur - with a hairline border and faint sheen), one short phrase at a time (<= 3 words, <= 21 chars), pill centre y 1352, text centred by CAP HEIGHT so it sits exactly in the middle of the pill, fade in/out with the voice. `CAP.style = 'bar'` gives the old black-on-white box (first reels); the user asked for the glass look: "remove the white bar, blurry nice effect, clean, readable, comfortable for the eye" |
| cards | real pictures/pages on a rounded ivory card with shadow, slight rotation (+-2 deg), slide in from the side, slow push, a black chip with a gold dot naming the source above the top-left corner |
| marker | `hl`: a yellow multiply-blend highlighter that wipes across the exact words |
| face beat | him full-screen from the 4K source reframed, warm grade (gold soft-light 24%), vignette, bottom scrim under the captions, a slow push plus a small punch on key words, gold/ivory boxed title words slam in as he says them |
| cuts | a quick gold light sweep across the screen on every beat change (`CFG.CUTS` is filled from the scene starts) |
| map | real Esri World Imagery (c) Esri, Maxar, Earthstar Geographics, slightly desaturated and darkened, camera flies in with ease; an animated gold OSM outline traces the place; white/gold pin with one pulse and a big plain label |

## 2. Instagram Reels safe zone (non-negotiable - the user sent the diagram)
Instagram's UI covers the **top 220 px, bottom 450 px and the right 100 px** (and about 70 px on the left to be safe).
- Content (text, cards, bars, pins, labels): x 130-950, y 330-1270.
- Captions: pill centre y 1352 (pill ~1310-1394; two-line phrases stack with a 94 px pitch). Esri credit line y 1440.
- Full-bleed things (face video, satellite imagery, backgrounds) may run to the edges; **text and graphics may not**.
- Scenes are drawn in a box centred at y 800 and scaled to fit at most 1.0 (never up-scale a scene: that is how earlier versions leaked to x 1005). Cards: x 140, w 800 (+5% push still stays < 980). Chips: keep the text short - a long source chip ran to x 1046 once.
- `safe_scan.py` checks the rendered frames: slide-ins of 1-2 frames and the cut sweep are fine; anything that stays is a bug.

## 3. Motion rules
- **One calm hero per beat.** One thing is the star; everything else is small. If a beat feels busy, split it or delete.
- A beat lasts 3-6 s and starts a hair *before* the first word of its sentence (a = word start - 0.05..0.1 s); things appear on the word they illustrate (`wt()` anchors).
- Everything moves with ease-out (`E.out3/out4/out5`, `E.back` for pops); nothing linear except counters of numbers (out3) and typing.
- Enter: slide/mask-up 20-60 px + fade (0.5 s). Exit: 0.25 s fade + small slide. Scene crossfade: 0.1 s overlap. Cards float +-4 px.
- Counters count up over ~1 s and settle before the number is finished being spoken.
- The face fades into/out of graphics over 0.4 s (not a hard cut).
- Never more than ~7 words of kinetic type on a beat apart from the captions.

## 4. Sound (changed after the first complaint: "too annoying")
- Voice (cleaned: high-pass 80 Hz, light denoise, compressor, +1.8 dB presence) at about -22 dBFS RMS in the mix; loudnorm to -14 LUFS / -1.5 dBTP in the encode.
- Effects are **soft air whooshes only**, synthesised (numpy) at about -48 dBFS RMS: "barely felt". Cue kinds in scenes.js: `cut` (auto at each scene start), `wh` (whoosh with duration `d`, gain `g`, `up` direction), `stamp`, `pin`, `send`. Keep cues sparse.
- No music, chimes, glitch, bit-crush, pops or "meow" sounds. (`--glitch`, `--clean`, `--soft`, `--music` flags exist for the old sets: do not use unless asked.)

## 5. Readability
- Written for a 65-year-old viewer on a phone: big type (>= 50 px on screen for anything that matters), high contrast, few words, a source line in small caps only as a credit.
- Spoken numbers appear as digits on screen, with the unit spelled ("DIRHAMS PER SQ FT"). Never "AED" in the voice; on screen, "DIRHAMS" is preferred too.
- Names of people/places/brands: caps in graphics, exact spelling from the source.

## 6. Feedback the user gave (keep honouring it)
1. Use the safe areas for graphics **and** text **and** everything.
2. The raw-talk edit must be *clean*: remove other-language asides, repeated phrases, false starts, director chat; cut at energy minima between phrases; verify cut ends.
3. Sound effects: far quieter, whooshes rather than "weird sounds".
4. Better animation: more of it, precise, modern, same style as the Abu Dhabi reel; real satellite flyovers with outlines; real pictures, screenshots of posts/articles ("take a screenshot of the Twitter/Truth Social post", "show the news article and animate it"), "just put Donald Trump as a picture".
5. Script: conversation, no transition words, dirhams not AED, numbers spoken, catchy, shorter.
6. They want the finished file quickly; do not stop to ask what you can decide.
7. Instagram bottom 450 px: nothing there but the Esri credit.

## 7. Palette / tokens quick reference (lib.js)
`C.bg #08080A, C.ink #F3EFE6, C.dim, C.mute, C.faint, C.gold #E9C47C, C.goldSoft, C.panel #141417`; `SAFE = {x0:130, x1:950, y0:300, y1:1420, w:820}`; fonts `F.d(weight,size)` display, `F.t` small text, `F.i(size)` extra-bold display.
