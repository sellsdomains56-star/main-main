#!/usr/bin/env bash
# Frames + mix -> the delivery mp4 (H.264 crf 17 (CRF=19 bash encode.sh ... for a smaller file), <=5 Mbit/s, loudnorm -14 LUFS / -1.5 dBTP, AAC 192k).   bash encode.sh <slug>    (run inside the reel folder)
set -euo pipefail
SLUG="${1:-reel}"; N=$(python3 -c "import json;t=json.load(open('timeline.json'));print(round(t['dur']*30))")
[ -d build/frames ] || { echo "no build/frames - render first (node render.mjs --out build/frames ...)"; exit 1; }
EXT=$(ls build/frames | sed -n 1p | sed "s/.*\.//"); [ "$EXT" = jpg ] && MINK=60 || MINK=150
LAST=$(ls build/frames | tail -1)
HAVE=$(ls build/frames | wc -l)
[ "$HAVE" -eq "$N" ] || { echo "expected $N frames, found $HAVE - render is not complete"; exit 1; }
SMALL=$(find build/frames -size -${MINK}k -name "f_*.$EXT" ! -name "f_00000.$EXT" ! -name "$LAST" | wc -l)
[ "$SMALL" -eq 0 ] || { echo "$SMALL blank/truncated frames (disk full or a browser crash?):"; find build/frames -size -${MINK}k -name "f_*.$EXT" ! -name "f_00000.$EXT" ! -name "$LAST" | head; exit 1; }
ffmpeg -v error -y -framerate 30 -i build/frames/f_%05d.$EXT -i build/mix.wav \
  -vf "scale=1080:1920:flags=lanczos,format=yuv420p" -c:v libx264 -preset medium -crf ${CRF:-17} -maxrate 5M -bufsize 10M -r 30 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "build/$SLUG.mp4"
ls -l "build/$SLUG.mp4"; ffprobe -v error -show_entries format=duration,size -of default=nw=1 "build/$SLUG.mp4"
SZ=$(stat -c %s "build/$SLUG.mp4"); [ "$SZ" -lt 31457280 ] || echo "WARNING: over 30 MB - raise crf (e.g. 19) or lower maxrate before sending"
