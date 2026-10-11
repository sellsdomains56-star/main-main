#!/usr/bin/env bash
# One-command build:  ./build.sh /path/to/voiceover.(mp4|wav|m4a)  [out.mp4]
# 1) prepares logos  2) renders 1402 frames (2x supersampled)  3) designs the audio  4) encodes the reel
set -euo pipefail
cd "$(dirname "$0")"
VOICE="${1:?usage: ./build.sh voiceover.mp4 [out.mp4]}"; OUT="${2:-abu-dhabi-beyond-oil.mp4}"
WORK="${WORK:-build}"; mkdir -p "$WORK"
python3 -I prep_logos.py
ffmpeg -y -v error -i "$VOICE" -ac 2 -ar 48000 "$WORK/voice48k.wav"
python3 -I audio.py "$WORK/voice48k.wav" "$WORK/mix.wav"
[ -d "$WORK/frames" ] || node render.mjs --out "$WORK/frames" --workers "${WORKERS:-4}" --ss 2
# 2160x3840 supersampled frames -> 1080x1920 (lanczos), H.264 high profile, AAC, -14 LUFS
ffmpeg -y -v error -framerate 30 -i "$WORK/frames/f_%05d.png" -i "$WORK/mix.wav" \
  -vf "scale=1080:1920:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.2 -maxrate 14M -bufsize 28M -r 30 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 224k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "done -> $OUT"
