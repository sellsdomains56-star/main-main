#!/usr/bin/env bash
# Generates placeholder portfolio photos and before/after pairs in media/demo/.
# Real barbers replace these by uploading their own photos in the app.
set -euo pipefail
cd "$(dirname "$0")/../media/demo"
FONTS=../../../app/node_modules/@expo-google-fonts/inter
BOLD=$FONTS/700Bold/Inter_700Bold.ttf
REG=$FONTS/500Medium/Inter_500Medium.ttf
img() { # file c0 c1 title subtitle titlecolor
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "gradients=s=720x720:c0=0x$2:c1=0x$3:n=2:x0=0:y0=0:x1=720:y1=720:d=1:r=1" -frames:v 1 \
    -vf "drawtext=fontfile=$BOLD:text='$4':fontcolor=0x$6:fontsize=54:x=(w-tw)/2:y=h*0.44,drawtext=fontfile=$REG:text='$5':fontcolor=white@0.75:fontsize=26:x=(w-tw)/2:y=h*0.44+76" \
    -q:v 5 "$1.jpg"
}
# Portfolio photos
i=1
for style in "SKIN FADE" "TEXTURED CROP" "BEARD SCULPT" "TAPER + WAVES" "SIDE PART" "BRAIDS" "MODERN MULLET" "HOT TOWEL SHAVE" "BUZZ CUT" "LOCS"; do
  img "g$i" 0F0F0F 333333 "$style" "Portfolio photo" F4F2EE; i=$((i+1))
done
# Before / after pairs
i=1
for style in "SKIN FADE" "BEARD SCULPT" "TEXTURED CROP" "TAPER + WAVES" "SIDE PART" "BRAIDS"; do
  img "t${i}-before" 8A8782 4A4846 "BEFORE" "$style" FFFFFF
  img "t${i}-after" 0F0F0F 3A3A3A "AFTER" "$style" F4F2EE
  i=$((i+1))
done
