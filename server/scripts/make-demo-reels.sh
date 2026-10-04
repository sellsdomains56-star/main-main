#!/usr/bin/env bash
# Generates the placeholder reel clips in media/demo/ (needs ffmpeg with drawtext).
# Real barbers replace these by uploading their own videos from the app.
set -euo pipefail
cd "$(dirname "$0")/../media/demo"
BOLD=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
REG=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
make() { # id title subtitle color1 color2
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "gradients=s=540x960:c0=0x$4:c1=0x$5:c2=0x0F1A14:n=3:speed=0.015:d=6:r=30" \
    -vf "drawtext=fontfile=$BOLD:text='$2':fontcolor=white:fontsize=64:x=(w-tw)/2:y=h*0.40,drawtext=fontfile=$REG:text='$3':fontcolor=white@0.85:fontsize=30:x=(w-tw)/2:y=h*0.40+88" \
    -c:v libx264 -pix_fmt yuv420p -crf 32 -preset veryfast -movflags +faststart "$1.mp4"
  ffmpeg -hide_banner -loglevel error -y -ss 2 -i "$1.mp4" -frames:v 1 -q:v 6 "$1.jpg"
}
make r1  "SKIN FADE"     "Malik Fresh · Berlin"        0BA360 04301C
make r2  "BEARD SCULPT"  "Malik Fresh · Berlin"        14B8A6 064E3B
make r3  "TEXTURED CROP" "Jonas Klinge · Berlin"       F59E0B 78350F
make r4  "HOT TOWEL"     "Emre Usta · Hamburg"         EF4444 7F1D1D
make r5  "MODERN MULLET" "Lukas Bauer · Munich"        8B5CF6 3B0764
make r6  "360 WAVES"     "Dre Clipz · London"          3B82F6 1E3A8A
make r7  "HAIR DESIGN"   "Dre Clipz · London"          EC4899 831843
make r8  "SIDE PART"     "Oliver Shaw · London"        A3A3A3 262626
make r9  "FRENCH CROP"   "Sem de Vries · Amsterdam"    F97316 7C2D12
make r10 "LUXURY FADE"   "Omar Al Hashimi · Dubai"     EAB308 713F12
make r11 "TAPER + WAVES" "Marcus Lee · New York"       22C55E 14532D
make r12 "POMPADOUR"     "Diego Ramirez · Los Angeles" 06B6D4 164E63
