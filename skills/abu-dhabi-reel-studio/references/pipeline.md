# Edit pipeline (Phase 2) - step by step

Contents: 0 requirements, 1 scaffold, 2 prepare voice + footage, 3 words and timeline, 4 assets, 5 scenes, 6 QA with stills, 7 full render, 8 audio, 9 encode + scan, 10 deliver, 11 troubleshooting.

## 0. Requirements
- `ffmpeg`/`ffprobe`, Node 22 + `playwright` with Chromium (set `PLAYWRIGHT_PATH` / `CHROMIUM_PATH` if not in the usual place), Python 3 with `numpy Pillow faster-whisper` (the ASR model large-v3 downloads on first use, ~3 GB, CPU int8 is fine).
- Inter fonts are bundled in `scripts/engine/fonts/` (SIL OFL) and loaded by `index.html`.
- **Disk**: a 50 s reel is ~1500 PNG frames of ~2.4 MB = ~3.6 GB. Keep >= 8 GB free. In the cloud sandbox the writable disk is a fixed allowance: when it is spent, Chromium dies with "Target crashed" and writes blank frames. `df -h .` before rendering; delete `build/frames` of reels already delivered.
- Network: Esri tiles (`server.arcgisonline.com`), OSM Nominatim (outlines), the sites you capture. Behind a proxy use `HTTPS_PROXY` (shot.mjs reads it).

## 1. Scaffold
`bash scripts/new_reel.sh reels/<slug>` copies the engine (lib.js, captions.js, satmap.js, scenes_lib.js, main.js, index.html, render.mjs, export_cues.mjs, fetch_tiles.mjs, audio.py, make_timeline.py, fonts/), the helpers and a `scenes.js` template into the folder. Work only inside that folder; `assets/` and `build/` are git-ignored.

## 2. Prepare the voice (and the face footage)
Pick the case:

**A. Voice-over (+ optional hook take)** - the common case.
```
python3 -I prep_hook_voice.py --voice voice.mp4 --hook take.mp4 --hook-start 0.62 --hook-end 4.80
```
Writes `build/voice48k.wav` (cleaned: high-pass, denoise, compressor, EQ), `build/cutmap.json` (`dur`, `hook_end`, `voice_start`), `build/footage/f_00000.jpg...` (30 fps, 1620x2880; the hook only). In scenes.js: `FACE_SEGS = [[0, hook_end]]`, `FOOT_MAX = <frames - 1>`, `PIV` = zoom pivot so the face stays in frame. Without `--hook` there is no face beat: `FACE_SEGS = []`.
Choose `--hook-start/--hook-end` from the energy envelope: `python3 -I edl_tools.py env a48.wav 0.4 1.0` (extract the wav first: `ffmpeg -i take.mp4 -vn -ac 2 -ar 48000 -c:a pcm_s16le a48.wav`). The video of the hook is cut with the same times, so picture and voice stay in sync; there is a 0.3 s silent gap before the voice-over starts.

**B. Raw talking-head clip with retakes / asides** - make an edit list `cut.json` (see `examples/dubai-market-cycle/cut.json`): `{src, audio48, segments: [[start, end], ...]}`. Transcribe the raw voice first (step 3, windowed), decide which takes to keep, then place every cut at the **energy minimum between two phrases** (`edl_tools.py quiet`), never mid-word. Left out in the Dubai reel: another-language asides, a false start, a doubled word, every retake of the last lines. `python3 -I prep_cut.py cut.json` cuts audio + video together (6 ms edge fades) and writes the same three outputs as A. **Verify every cut end**: re-transcribe a short window around each join (English and Arabic) - leaked fragments ("yalla", "bit", "if") are the usual bug.

**C. Voice only, no face**: A without `--hook`.

## 3. Words and timeline
1. `python3 -I asr_words.py build/voice48k.wav build/words_raw.json "Proper, Names, Places"` - the prompt biases spelling of names. If the output skips a stretch or drifts into another language (it does on long or mixed-language takes), use `asr_windows.py build/voice48k.wav build/words_raw.json 0-26,25-32,32.5-41` (overlapping windows, English forced).
2. Write `script.txt` = the words as spoken, figures as `{display|spoken}` (`{6|six}`, `{1,852|one thousand eight hundred and fifty-two}`), punctuation after the closing brace stays attached. Hook words come first. It must match the *recording* word for word (difflib aligns it to the ASR words; the printed "matched N of M" should be ~97%+).
3. `python3 -I make_timeline.py 2.0` -> `timeline.json` {dur, frames, words:[{t,e,text,chunk}]}. The argument is the silent end card (s) after the voice, used for the chat reply. Caption chunks: <= 3 words, <= 21 chars, break after , . ? ! : . Display tokens with digits are timed from the ASR numerals; spelled-out numbers are slow in speech, so a figure's `e` can be 1.5 s long (that is right).
4. Spot-check: `python3 -c "import json;t=json.load(open('timeline.json'));print(' '.join('%s@%.2f'%(w['text'],w['t']) for w in t['words']))"`. These are the anchors for `wt()` in scenes.js.

## 4. Real material
`references/real-material.md`. Put pictures/screenshots in `assets/`; register them in `IMAGES` in scenes.js. Measure highlight boxes with `textlines.py` (never guess).

## 5. Write scenes.js
Start from `assets/scenes.template.js` (or an example in `examples/`); API in `references/scene-api.md`. Each scene is anchored to words with `wt()`. Map beats: `SAT_SCENES.<id>` camera keys + `outlines`/`pins`; get the outline with `python3 -I outline_from_osm.py yas "Yas Island, Abu Dhabi"`. Then
```
node export_cues.mjs     # writes cues.json (sound) and sat_scenes.json (camera paths)
node fetch_tiles.mjs     # downloads exactly the Esri tiles those camera paths need into build/tiles
```

## 6. QA with stills (do this before the long render)
`node render.mjs --out build/stills --stills 1.4,3.6,5.3,... --workers 2` renders single frames in seconds. Look at one still per beat (make a contact sheet with PIL), check: marker boxes on the right words, nothing clipped, no overlap with the chip/caption, numbers legible, map pin visible with its label, nothing in the unsafe margins. Fix and re-render stills. Typical fixes: a headline overlapping a card chip (move up 20 px), a long chip (shorten it), a 3-digit label touching a ring, a hook title over his turban (check footage frame first).
Console `404` lines about `logos/` are harmless (typographic fallback).

## 7. Full render
```
node render.mjs --out build/frames --workers 3 --ss 1.5 --skip
```
Frames = round(timeline.dur x 30) - note `timeline.json.frames` is the *voice* length; the render uses `dur`. ~2 fps with 3-4 workers (about 12 min for 50 s). `--skip` resumes and keeps good frames; a crashed tab is reopened and the frame retried. `--from/--to` render a range - re-render only the affected range after a fix (delete those frames, run with `--skip`). Run long jobs in the background with a PID file and wait with an `until ! kill -0 $(cat pid); do sleep 10; done` loop in a background shell (no foreground `sleep`, no `pkill` patterns).

## 8. Audio
`python3 -I audio.py build/voice48k.wav build/mix.wav` -> voice + very quiet whooshes from `cues.json` (prints stem levels: voice ~ -22, sfx ~ -48 dBFS).

## 9. Encode and scan
```
python3 -I safe_scan.py build/frames 3 --skip 0-4.7,4.2-7.4     # face + map beats may touch the edges
bash encode.sh <slug>                                            # refuses if frames are missing or blank; warns above 30 MB
```
Check the duration equals `timeline.dur` (a short file means an incomplete frame set), look at 3 frames of the mp4, `ffmpeg -i build/<slug>.mp4 -af ebur128=peak=true -f null -` should read about -15..-14 LUFS, peak <= -1.4 dBFS.

## 10. Deliver
Send the mp4 (<= 30 MB per message). In the message: one line per beat is too much - give 5-7 bullets, then the caveats (currency not spoken, indicative map pin, third-party pictures, what you could not verify). Write `README.md` (beats table, sources, credits, rebuild commands), commit **code only** (`assets/`, `build/`, `*.mp4` are ignored), push to the branch you were given.

## 11. Troubleshooting (all happened)
| Symptom | Cause / fix |
|---|---|
| `Target crashed`, white 21 KB or dark 20 KB frames | disk allowance full (`df -h .`) or memory pressure: free space (delete old `build/frames`), delete the blank frames (`find build/frames -size -150k`), re-run with `--skip`, fewer workers |
| Render stops at frame N after an uncaught error | resume with `--skip`; the renderer reopens crashed tabs/browsers |
| Video 2 s too short | frames were rendered only to `timeline.frames` (voice) instead of `round(dur*30)`; render all of them |
| ASR skips a 20+ s stretch / Arabic text appears | `asr_windows.py`, English forced, overlap windows |
| `make_timeline` prints matched far below ~95% | script.txt differs from what was said; fix script.txt to the recording |
| A caption shows "2,470 ." with a stray dot | punctuation after `}` must be glued to the token (the regex in make_timeline does it; no space before the dot) |
| A word regex in scenes.js matches the wrong word | `wt(re, n, fallback)` - n is the index among matches; tokens carry their punctuation ("TOWNHOUSES.") |
| Highlight box misaligned | measure with `textlines.py`, boxes are in image pixels |
| Scene content spills past x 960 | shrink text (`maxW`), narrow cards (w 800), never up-scale scenes |
| Chromium hangs when several launches start at once | start screenshots one at a time; limit workers to CPU count - 1 |
| Cut leaks a half word of the next phrase | the cut point was not at the energy minimum; move it into the deepest valley, re-verify with a 1-2 s ASR window |
| Whoosh feels loud | it should be inaudible-ish; lower `G` in `build_sfx_air` (default 1.4) |
| Wikimedia API rate-limited / YouTube downloads blocked | use other sources; ask the user for the file if it matters |
