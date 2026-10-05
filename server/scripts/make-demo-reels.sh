#!/usr/bin/env bash
# Generates the placeholder reel clips in media/demo/ (needs ffmpeg with drawtext).
# Real barbers replace these by uploading their own videos from the app.
set -euo pipefail
cd "$(dirname "$0")/../media/demo"
BOLD=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
REG=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
make() { # id title subtitle color1 color2
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "gradients=s=540x960:c0=0x$4:c1=0x$5:c2=0x151517:n=3:speed=0.015:d=6:r=30" \
    -vf "drawtext=fontfile=$BOLD:text='$2':fontcolor=0xF2B53A:fontsize=64:x=(w-tw)/2:y=h*0.40,drawtext=fontfile=$REG:text='$3':fontcolor=white@0.85:fontsize=30:x=(w-tw)/2:y=h*0.40+88" \
    -c:v libx264 -pix_fmt yuv420p -crf 32 -preset veryfast -movflags +faststart "$1.mp4"
  ffmpeg -hide_banner -loglevel error -y -ss 2 -i "$1.mp4" -frames:v 1 -q:v 6 "$1.jpg"
}
make r1 "SKIN FADE" "Malik Fresh · Berlin" 3A2A0E 0A0A0B
make r2 "BEARD SCULPT" "Malik Fresh · Berlin" 2B2416 0A0A0B
make r3 "TEXTURED CROP" "Jonas Klinge · Berlin" 4A3410 0A0A0B
make r4 "HOT TOWEL" "Emre Usta · Hamburg" 1F1A12 0A0A0B
make r5 "MODERN MULLET" "Lukas Bauer · Munich" 3D2B12 0A0A0B
make r6 "360 WAVES" "Dre Clipz · London" 2A2015 0A0A0B
make r7 "HAIR DESIGN" "Dre Clipz · London" 4C3A1A 0A0A0B
make r8 "SIDE PART" "Oliver Shaw · London" 262018 0A0A0B
make r9 "FRENCH CROP" "Sem de Vries · Amsterdam" 3F2E10 0A0A0B
make r10 "LUXURY FADE" "Omar Al Hashimi · Dubai" 4A3613 0A0A0B
make r11 "TAPER + WAVES" "Marcus Lee · New York" 2E2414 0A0A0B
make r12 "POMPADOUR" "Diego Ramirez · Los Angeles" 3A2C14 0A0A0B
