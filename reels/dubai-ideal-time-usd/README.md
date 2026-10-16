# "Ideal time to invest in Dubai" - USD cut (reel 09b)

Same reel as `../dubai-ideal-time` (map style, small live face bubble, proof cards, whoosh-only sound), rebuilt for Abdullah's **re-recorded take (WeTransfer, 16 Oct 2026) in which he says dollars instead of dirhams**. Same footage and script otherwise; only the four currency phrases changed:

| He says | = source figure (AED, Dubai Media Office 13 Oct 2026, at the 3.6725 peg) |
|---|---|
| 571.8 billion dollars (projects under way) | AED 2.1 trillion |
| 299.5 billion dollars (real estate through 2030) | AED 1.1 trillion |
| 34.9 billion dollars (Al Maktoum Airport) | AED 128 billion |
| 27.2 billion dollars (roads, Blue and Gold lines) | AED 100 billion |

The conversions are correct (the new take is not "2.1 trillion dollars"). On screen the headline numbers are dollars with the AED source figure as a small second line, and the Media Office page card carries the chip "FIGURES IN AED".

Changes vs the dirham reel: `script.txt` (4 phrases), `scenes.js` (K anchors `571.8 / 299.5 / 34.9 / 27.2`, HUD/panel/bar text, chip), `cut.json` (new source, 71.96 s). Timing lesson: Whisper writes "billion dollars" as "$571.8 billion" and drops the word "dollars", which shifts every following word label by one word (captions and highlights early by 0.2-0.3 s). Fix used: re-transcribe with a spoken-form prompt (`asr_words.py ... "…billion dollars…"`), splice the "dollars" tokens into `build/words_raw.json`, merge each two-token number into one token, then `make_timeline.py` + `snap_onsets.py`.

## Rebuild
```bash
python3 -I prep_cut.py cut.json          # paths in cut.json point at the WeTransfer download
# build/words_raw.json: ASR + the "dollars" splice described above
python3 -I make_timeline.py 3.0 && python3 -I snap_onsets.py
node export_cues.mjs && node fetch_tiles.mjs      # build/tiles is a symlink to ../dubai-ideal-time/build/tiles
node render.mjs --out build/frames --fmt jpg --workers 4 --ss 1.5 --skip
python3 -I audio.py build/voice48k.wav build/mix.wav
CRF=22 MAXRATE=2.2M BUFSIZE=4.4M bash encode.sh dubai-ideal-time-usd
```
