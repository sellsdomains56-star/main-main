# om-adgm-ar - one Arabic video from voice note n2 (03:41:30), 27 Oct 2026

The five voice notes of 27 Oct 2026 were first joined into one video (`../office-market-ar`); he asked for **one video per note, each keeping its own call to action**, so this folder is the whole of note n2 on its own: ADGM: about 50,000 workers (+34%), Grade A occupancy ~99%, rents +32%, Al Maryah (luxury) and Al Reem (wider choice), housing demand. Call to action: **ADGM (اكتب لي في التعليقات ADGM وبطرش لك تقرير الاستثمار كامل)**.

- His voice: the whole note **untouched** (no stretch, no filter, no compressor, no loudnorm): the same plain gain per note as in the combined video (n1 -7.9, n2 -0.6, n3 0, n4 +4.5, n5 +5.9 dB, so the five videos sit at the same level), pauses longer than 0.3 s shortened (`assemble_voice.py edl.json`; all five notes are listed in edl.json only so the gains match). Every word in sync (audio cross-correlation 0 ms).
- On screen: everything in Arabic, right to left; every beat is a real page with a marker on the exact words, or the satellite map; no face; captions on the opening line only; end card with the comment animation.
- Word times: the ASR of the original note (`vn_0340/n2_words.json`, scratchpad) mapped through the shortened pauses (`map_words.py`), then `make_timeline.py 3.0` with `script.txt` (spellings corrected).
- Scenes: generated from the combined video's beats, re-timed with `OFFS` (`A()` = the combined video's times, `B()` = this video's), plus this note's own beats (generator: `../office-market-ar/omgen/gen.py`, which writes the five scenes.js files from the combined scenes).

## Facts to check
Abu Dhabi Media Office 8 Sep 2026 (49,027, +34%); Cushman & Wakefield Core H1 2026 (99% Prime and Grade A occupancy, +32% city-wide rents; English page, the Arabic one does not load). Other firms publish different figures (CBRE about +20%, 96.4%).

## Build
```
python3 -I assemble_voice.py edl.json && python3 -I map_words.py <scratchpad>/vn_0340/n2_words.json
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs && node render.mjs --out build/frames --fmt jpg --workers 3 --ss 1.5
python3 -I audio.py build/voice48k.wav build/mix.wav && AF=anull ABR=192k CRF=22 MAXRATE=1.8M BUFSIZE=3.6M bash encode.sh om-adgm-ar
```
Pages: `assets/` (copies of ../office-market-ar/assets; om-rockefeller-ar adds the Arabic Wikipedia captures wiki_family, wiki_so, wiki_rc). Map tiles: build/tiles -> ../../office-market-ar/build/tiles. Geography (c) OpenStreetMap contributors (ODbL); imagery (c) Esri, Maxar, Earthstar Geographics.
