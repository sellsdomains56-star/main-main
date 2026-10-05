#!/usr/bin/env bash
# Generates the placeholder reel clips in media/demo/ (needs ffmpeg with drawtext).
# Real barbers replace these by uploading their own videos from the app.
set -euo pipefail
cd "$(dirname "$0")/../media/demo"
FONTS=../../../app/node_modules/@expo-google-fonts/inter
BOLD=$FONTS/700Bold/Inter_700Bold.ttf
REG=$FONTS/500Medium/Inter_500Medium.ttf
make() { # id title subtitle color1 color2
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "gradients=s=540x960:c0=0x$4:c1=0x$5:c2=0x161616:n=3:speed=0.015:d=6:r=30" \
    -vf "drawtext=fontfile=$BOLD:text='$2':fontcolor=0xF4F2EE:fontsize=62:x=(w-tw)/2:y=h*0.40,drawtext=fontfile=$REG:text='$3':fontcolor=white@0.85:fontsize=30:x=(w-tw)/2:y=h*0.40+88" \
    -c:v libx264 -pix_fmt yuv420p -crf 32 -preset veryfast -movflags +faststart "$1.mp4"
  ffmpeg -hide_banner -loglevel error -y -ss 2 -i "$1.mp4" -frames:v 1 -q:v 6 "$1.jpg"
}
make r1 "SKIN FADE" "Malik Fresh · Berlin" 3A3A3A 0B0B0B
make r2 "BEARD SCULPT" "Malik Fresh · Berlin" 2B2B2B 0B0B0B
make r3 "TEXTURED CROP" "Jonas Klinge · Berlin" 4A4A4A 0B0B0B
make r4 "HOT TOWEL" "Emre Usta · Hamburg" 222222 0B0B0B
make r5 "MODERN MULLET" "Lukas Bauer · Munich" 3D3D3D 0B0B0B
make r6 "360 WAVES" "Dre Clipz · London" 2E2E2E 0B0B0B
make r7 "HAIR DESIGN" "Dre Clipz · London" 474747 0B0B0B
make r8 "SIDE PART" "Oliver Shaw · London" 262626 0B0B0B
make r9 "FRENCH CROP" "Sem de Vries · Amsterdam" 404040 0B0B0B
make r10 "LUXURY FADE" "Omar Al Hashimi · Dubai" 4B4B4B 0B0B0B
make r11 "TAPER + WAVES" "Marcus Lee · New York" 303030 0B0B0B
make r12 "POMPADOUR" "Diego Ramirez · Los Angeles" 383838 0B0B0B
