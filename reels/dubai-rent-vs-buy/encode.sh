#!/usr/bin/env bash
# Frames + mix -> mp4 (H.264, AAC). No loudnorm: the sound is meant to stay very quiet.   bash encode.sh <slug>
set -euo pipefail
SLUG="${1:-dubai-rent-vs-buy}"; N=$(python3 -c "import json;t=json.load(open('timeline.json'));print(round(t['dur']*30))")
HAVE=$(ls build/frames | wc -l); [ "$HAVE" -eq "$N" ] || { echo "expected $N frames, found $HAVE"; exit 1; }
EXT=$(ls build/frames | sed -n 1p | sed 's/.*\.//')
ffmpeg -v error -y -framerate 30 -i build/frames/f_%05d.$EXT -i build/mix.wav \
  -vf "scale=1080:1920:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf ${CRF:-20} -maxrate ${MAXRATE:-6M} -bufsize ${BUFSIZE:-12M} -r 30 \
  -c:a aac -b:a 160k -ar 48000 -movflags +faststart -shortest "build/$SLUG.mp4"
ls -l "build/$SLUG.mp4"; ffprobe -v error -show_entries format=duration,size -of default=nw=1 "build/$SLUG.mp4"
SZ=$(stat -c %s "build/$SLUG.mp4"); [ "$SZ" -lt 31457280 ] || echo "WARNING: over 30 MB"
