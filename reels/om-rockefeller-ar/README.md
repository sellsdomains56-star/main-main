# om-rockefeller-ar - one Arabic video from voice note n4 (03:41:54), 27 Oct 2026

The five voice notes of 27 Oct 2026 were first joined into one video (`../office-market-ar`); he asked for **one video per note, each keeping its own call to action**, so this folder is the whole of note n4 on its own: the tower on Sheikh Zayed Road, the name's background (Rockefeller family, Standard Oil, Rockefeller Center - Arabic Wikipedia), Christian Rockefeller (sixth generation) with LMD, his first branded project, his view on the brand, five amenity floors, hospitality-inspired facilities, the options (one office, half floor, full floor), the prices and 50/50 plan, the three points (location, office specs, price vs alternatives), the benchmark. Call to action: **report (اكتب report وبطرش لك المقارنة كاملة)**.

- His voice: the whole note **untouched** (no stretch, no filter, no compressor, no loudnorm): the same plain gain per note as in the combined video (n1 -7.9, n2 -0.6, n3 0, n4 +4.5, n5 +5.9 dB, so the five videos sit at the same level), pauses longer than 0.3 s shortened (`assemble_voice.py edl.json`; all five notes are listed in edl.json only so the gains match). Every word in sync (audio cross-correlation 0 ms).
- On screen: everything in Arabic, right to left; every beat is a real page with a marker on the exact words, or the satellite map; no face; captions on the opening line only; end card with the comment animation.
- Word times: the ASR of the original note (`vn_0340/n4_words.json`, scratchpad) mapped through the shortened pauses (`map_words.py`), then `make_timeline.py 3.0` with `script.txt` (spellings corrected).
- Scenes: generated from the combined video's beats, re-timed with `OFFS` (`A()` = the combined video's times, `B()` = this video's), plus this note's own beats (generator: `../office-market-ar/omgen/gen.py`, which writes the five scenes.js files from the combined scenes).

## Facts to check
Wikipedia: Standard Oil founded 10 Jan 1870 by John D. Rockefeller and partners; Arabic Wikipedia says Rockefeller Center was built (1939) by the Rockefeller *family* - English sources credit John D. Rockefeller Jr. (his son), as he says. Masdarak / Al Bayan 22 Oct 2026 for Christian A. Rockefeller, LMD, Grade A, five amenity floors, hospitality. The prices and the 50/50 plan are not in any reputable report (broker listings); shown under 'بحسب التسعير الأولي المتاح' as he says.

## Build
```
python3 -I assemble_voice.py edl.json && python3 -I map_words.py <scratchpad>/vn_0340/n4_words.json
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=1.8M BUFSIZE=3.6M bash encode.sh om-rockefeller-ar
```
Pages: `assets/` (copies of ../office-market-ar/assets; om-rockefeller-ar adds the Arabic Wikipedia captures wiki_family, wiki_so, wiki_rc). Map tiles: build/tiles -> ../../office-market-ar/build/tiles. Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
