---
name: abu-dhabi-reel-studio
description: Make Instagram Reels / short vertical videos for UAE real estate and market commentary in two phases - first the CONTENT (hook, fact-checked conversational script, beat plan, asset shopping list), then the EDIT in the "Abu Dhabi look" (near-black + ivory + gold, bold type, small black-on-white captions, real satellite flyovers, real article/post/photo cards with marker highlights, price bars, gauges, chat call-to-action, very quiet whoosh-only sound, all inside the Instagram Reels safe zone). Use this whenever the user wants a reel, short, TikTok or Shorts script, wants to turn a recorded voice-over or a raw talking-head clip into an animated reel, mentions a project/developer/market topic they want to post about, says "same style as before / the Abu Dhabi style", asks for a map of where a project is, real news pages animated on screen, captions with the right timing, or a hook plus voice-over edit - even if they do not say "skill", "reel" or "animation".
---

# Abu Dhabi Reel Studio

Two jobs in one workflow: **(1) create the content** (what to say, with verified facts and a visual plan), then **(2) edit it into a finished 1080x1920 reel** in one fixed, recognisable look. The look is a deterministic canvas engine (bundled in `scripts/engine/`), rendered frame by frame with headless Chromium and encoded with ffmpeg - so every reel comes out identical in style and every change is a text edit.

The person using this is usually an Emirati / UAE real-estate creator who records the voice (or a short on-camera hook) himself or herself, speaks to camera like talking to a friend, and wants the result fast. They have strong opinions about style (see `references/style-guide.md`) and are impatient: show progress in short plain messages, deliver the file when it is done, do not narrate internals.

## Where to start - find out what they already have

| They have... | Do this |
|---|---|
| only an idea / a project / a source document | Phase 1 (content), then ask them to record, then Phase 2 |
| a script they wrote | tighten it with `references/content-playbook.md`, then record, then Phase 2 |
| a recorded voice-over (+ maybe a hook take) | skip to Phase 2 (`prep_hook_voice.py`) |
| a long raw talking-head clip with retakes / asides | Phase 2 with a clean cut (`prep_cut.py`, `edl_tools.py`) |
| an edited video they want "in the style" | extract the voice, treat it as a voice-over, Phase 2 |

Ask at most 2-3 questions, and only the ones you cannot answer from what they sent: topic/project, the audience's one question, and which sentence is the hook. Everything else has a default below.

## Phase 1 - Content (read `references/content-playbook.md`)

1. **Fact base first.** Get the real numbers from a real source (price list, study page, official announcement, news). Verify each figure, its currency/period and what it is exactly; keep a source line for the screen. Never invent a figure; flag what you could not verify.
2. **Hook = one spoken sentence with a concrete number or tension** ("Why did investors put 6 billion into this project in just 72 hours?"). It is the only part where he is on camera, ~4 s.
3. **Script = a conversation, not an advert.** Straight to the point, one idea per sentence, no transition words ("now", "so now", "moreover"), numbers and currency written the way they are spoken ("one thousand eight hundred and fifty-two dirhams per square foot", never "AED"). 45-60 s, about 110-140 words, ends with "message me <one keyword>".
4. **Beat plan**: map every sentence to one visual (table in the playbook). One calm hero per beat.
5. **Asset list**: which real pictures / pages / posts / map places to fetch (`references/real-material.md`).
Deliver: the speaker script (plain, readable), the on-screen figures with sources, the beat plan. Then wait for the recording.

## Phase 2 - Edit (read `references/pipeline.md`; API in `references/scene-api.md`)

```
bash <skill>/scripts/new_reel.sh reels/<slug>            # scaffold: engine + helpers + scenes.js template
cd reels/<slug>
python3 -I prep_hook_voice.py --voice voice.mp4 [--hook take.mp4 --hook-start S --hook-end E]   # or prep_cut.py for a raw talk
python3 -I asr_words.py build/voice48k.wav build/words_raw.json "Names, Places"   # word times (faster-whisper large-v3)
# write script.txt:  display|spoken markup for figures, e.g. {1,852|one thousand eight hundred and fifty-two}
python3 -I make_timeline.py 2.0                          # -> timeline.json (captions: <=3 words, <=21 chars per chunk)
# fetch real material into assets/, write scenes.js from assets/scenes.template.js
node export_cues.mjs && node fetch_tiles.mjs             # sound cues + Esri satellite tiles for the map beats
node render.mjs --out build/stills --stills 2,6,10 --workers 2        # stills first: look at them, fix, repeat
node render.mjs --out build/frames --workers 3 --ss 1.5 --skip       # the full render (~2 fps); re-run with --skip after any crash
python3 -I audio.py build/voice48k.wav build/mix.wav    # voice + very quiet whooshes
python3 -I safe_scan.py build/frames 3 --skip 0-4.7     # nothing in the app-UI margins
bash encode.sh <slug>                                    # -> build/<slug>.mp4 (<= 30 MB, loudnorm -14 LUFS)
```
Then look at 3-4 frames of the final mp4, send it, write a short `README.md` (beats table, sources, credits), commit the code (never the third-party assets or build/).

## The look in six rules (details: `references/style-guide.md`)
1. Palette `#08080A` / `#F3EFE6` / `#E9C47C`; **all type bold** (Inter Display 700-800); gold box (`hl`) marks the key word.
2. **Safe zone**: everything inside x 130-950, y 330-1270; captions (58 px bold black on white, one phrase at a time) at y~1372. The top 220, bottom 450 and right 100 px belong to the Instagram UI.
3. **One calm hero per beat**, a cut every 3-6 s; he is on screen only for short face beats (hook), otherwise graphics.
4. **Real material beats stock**: real satellite imagery with a drawn outline and pin, real articles/posts/photos as animated cards with marker highlights on the exact line.
5. **Sound = voice + very quiet air whooshes** (about -48 dBFS vs voice -22). No music, chimes, glitch, pops.
6. Readable for a 65-year-old: big type, few words, not busy.

## Quality gate before sending
- Stills reviewed for every beat; marker boxes sit on the right words; no text clipped; no beat busier than "one hero".
- `safe_scan.py` clean (slide-ins of 1-2 frames are fine); no blank/white frames (`encode.sh` refuses them); duration matches `timeline.json` (frames = dur x 30).
- Figures on screen = figures in the script = figures in the source. "Currency not spoken" and "indicative pin" style caveats go to the user in the final message, not on screen.
- File <= 30 MB (`encode.sh` warns), 1080x1920, 30 fps, AAC.

## Pitfalls that cost hours (full list in `references/pipeline.md`)
- Disk full => Chromium "Target crashed" and blank frames. Keep >= 8 GB free (a reel's frames are ~3.5 GB); delete `build/frames` of delivered reels.
- Never `pkill -f` a pattern from inside the session; use PID files. No foreground `sleep`; wait with a background `until` loop.
- Whisper skips stretches / drifts into Arabic on mixed-language raw takes: use `asr_windows.py`, cut at energy minima (`edl_tools.py`), and verify each cut end by listening/ASR.
- Screenshot pages one at a time; parallel Chromium launches hang when the CPU is saturated.
- Do not publish third-party assets or people's portraits without credit/licence notes; list sources in the README.
