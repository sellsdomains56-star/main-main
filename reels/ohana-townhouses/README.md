# Ohana townhouses (reel 05)

49.4 s vertical reel (1080x1920, 30 fps), Abu Dhabi look + real material, **whoosh-only sound at a very low level**, all graphics inside the Instagram Reels safe zone (content y 330-1270 / x 130-950, captions ~y 1372).
Sources: his on-camera hook (`IMG_5838.MP4`, take 1: "Why did investors put 6 billion into this project in just 72 hours?") + his recorded voice-over (`147d7c51-3333.mp4`), cleaned and joined by `prep_ohana.py`; word times from faster-whisper large-v3 aligned to `script.txt` (`{display|spoken}` markup: figures show as digits, caption timing follows what he says).

| Time | Look | What happens |
|------|------|--------------|
| 0 - 4.2 | **FACE** | his hook; "6 BILLION" / "IN 72 HOURS" slam in as he says them |
| 4.2 - 6.7 | satellite | flight over Yas Island (outlined), pin **OHANA - Yas Canal**, Ferrari World as a reference point |
| 6.7 - 11.5 | picture | brochure picture + count-up **1,852 dirhams per sq ft** (two-bedroom townhouse) |
| 11.5 - 19.0 | bars | Ohana vs The Orchids (newest townhouses, same island) **2,470**; dashed gap = **25% cheaper** |
| 19.0 - 22.8 | bars | **even cheaper** than the average luxury apartment on Yas (2,393) |
| 22.8 - 27.0 | picture | family townhouses **3.7 -> 5.3 million dirhams** |
| 27.0 - 29.1 | picture | **RARE** stamp - almost nobody is launching them |
| 29.1 - 35.4 | page | the **Emirati Broker Programme** (Construction Business News ME, 1 Oct 2026): marker on the headline, "preferential access to inventory", "booking access during project launches"; pills FIRST ACCESS / LAUNCH BOOKINGS |
| 35.4 - 39.9 | timeline | **5%** every six months, the rest at handover **2029** |
| 39.9 - 44.4 | gauges | UAE nationals **30%** before handover, everyone else **35%** |
| 44.4 - 49.4 | chat | "Price list?" - typed on "townhouses", sent, answered |

Figures (all from the Ohana Phase 2 study, page 4 / Ohana price list): 2-bed townhouse 1,852 AED/sq ft; The Orchids townhouses (Jun 2026) 2,470; Yas luxury apartments average 2,393; family townhouses 3.7M-5.3M; payment plan 5% every six months, balance at handover (2029); UAE nationals 30 / 70, non-nationals 35 / 65. Sources shown on screen: Ohana price list, The Orchids, Christie's H1 2026.
Notes: "6 billion" is shown as spoken (no currency said); the pin is an indicative position taken from the brochure's location map; The Orchids' exact position is not drawn; the Emirati programme gives priority to *brokers* (inventory access, prioritised appointments and booking at launches), not to buyers.

## Real material (not committed - third-party)
- Ohana / Manchester City Yas Residences brochure pages (townhouse renderings): `assets/th_a.jpg`, `th_b.jpg`, `th_c.jpg`
- Construction Business News ME, "Ohana Development Launches Emirati Broker Programme", 1 Oct 2026 (full-page capture, `assets/cbn.png`)
Imagery (c) Esri, Maxar, Earthstar Geographics (on screen); island outline from OpenStreetMap (ODbL, `outlines.json`).

## Rebuild
```bash
python3 -I prep_ohana.py <IMG_5838.MP4> <147d7c51-3333.mp4>              # hook + voice -> build/voice48k.wav, build/cutmap.json, build/footage/
python3 -I ../asr_words.py build/voice48k.wav build/words_raw.json
python3 -I make_timeline.py 2.0
node export_cues.mjs && node fetch_tiles.mjs
node render.mjs --out build/frames --workers 4 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav
```
Then ffmpeg (H.264 crf 17, maxrate ~5M, loudnorm -14 LUFS / -1.5 dBTP, AAC 192k). Captures go in `assets/` (names in `scenes.js` IMAGES).
