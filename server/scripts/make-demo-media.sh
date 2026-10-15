#!/usr/bin/env bash
# Builds the sample photos and reels in media/demo/ from the Unsplash photos listed in
# media/photos/SOURCES.txt (downloaded on first run). Needs curl, ImageMagick and ffmpeg.
# These are demo placeholders — replace them with your barbers' own photos and videos.
set -euo pipefail
cd "$(dirname "$0")/../media"
SRC=${SRC_DIR:-photos/originals}
OUT=demo
mkdir -p "$SRC" "$OUT"

# 1. Originals (kept out of git; re-downloaded when missing)
grep -v '^#' photos/SOURCES.txt | while read -r name id; do
  [ -z "$name" ] && continue
  [ -s "$SRC/$name.jpg" ] || curl -fsS -m 60 -o "$SRC/$name.jpg" "https://images.unsplash.com/photo-$id?w=1200&q=82&fm=jpg"
done

# crop NAME OUT WxH [gravity] — cover-crop a source photo to an exact size.
crop() { convert "$SRC/$1.jpg" -resize "$3^" -gravity "${4:-center}" -extent "$3" -strip -interlace Plane -quality 74 "$OUT/$2.jpg"; }

# 2. Barber photos (square; shown as circles and tiles)
i=0
for name in fade-tattoo barber-hat scissor-beard barber-cap finish-spray beard-trim cut-busy blow-dry curls-cut hot-towel \
            razor-line fade-clipper crop-scissors neck-clipper hair-design shave-moody beard-clipper-bw kids-cut-bw comb-slick fade-finished; do
  i=$((i + 1)); crop "$name" "av$i" 320x320
done

# 3. Portfolio (4:5)
i=0
for name in fade-finished crop-scissors hair-design curls-cut comb-slick fade-clipper scissor-beard beard-trim razor-line barber-hat \
            shave-moody finish-spray fade-tattoo neck-clipper blow-dry barber-cap hot-towel cut-busy kids-cut-bw beard-clipper-bw; do
  i=$((i + 1)); crop "$name" "g$i" 480x600
done

# 4. Before & after pairs (the same cut in progress, then finished)
pair() { crop "$2" "t$1-before" 480x600 "${4:-center}"; crop "$3" "t$1-after" 480x600; }
pair 1 fade-tattoo fade-finished east
pair 2 beard-brush-bw beard-trim
pair 3 comb-slick crop-scissors
pair 4 curls-cut barber-cap
pair 5 fade-clipper finish-spray
pair 6 razor-line hair-design

# 5. Barbershops and campaign banners (wide)
for name in shop-luxury shop-brick shop-vintage-red shop-chairs-row shop-busy shop-bright shop-minimal chair-leather chair-window; do
  crop "$name" "$name" 800x500
done
crop shave-moody cmp-club 900x560
crop shop-chairs-row cmp-groom 900x560
crop pomade-comb cmp-gift 900x560
crop hot-towel cmp-home 900x560
crop products-flatlay cmp-products 900x560
crop shop-luxury cmp-dubai 900x560
crop kids-cut-bw cmp-family 900x560

# 6. Reels: three photos per clip, slow push-in with cross-fades (7–8 s, 360x640, silent)
reel() { # id photo1 photo2 photo3
  local id=$1; shift
  local args=() filters="" n=0
  for p in "$@"; do
    args+=(-i "$SRC/$p.jpg") # one still frame; zoompan turns it into 90 frames (3 s)
    filters+="[$n:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0011,1.12)':d=90:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=360x640:fps=30,setsar=1,format=yuv420p[v$n];"
    n=$((n + 1))
  done
  filters+="[v0][v1]xfade=transition=fade:duration=0.5:offset=2.5[x1];[x1][v2]xfade=transition=fade:duration=0.5:offset=5,format=yuv420p[out]"
  ffmpeg -hide_banner -loglevel error -y "${args[@]}" -filter_complex "$filters" -map "[out]" \
    -c:v libx264 -pix_fmt yuv420p -profile:v main -crf 31 -preset slow -movflags +faststart -an "$OUT/$id.mp4"
  ffmpeg -hide_banner -loglevel error -y -ss 0.2 -i "$OUT/$id.mp4" -frames:v 1 -q:v 5 "$OUT/$id.jpg"
}
reel r1 fade-tattoo fade-clipper fade-finished
reel r2 beard-brush-bw beard-trim scissor-beard
reel r3 comb-slick crop-scissors cut-busy
reel r4 hot-towel razor-line shave-moody
reel r5 barber-cap finish-spray blow-dry
reel r6 curls-cut hair-design neck-clipper
reel r7 hair-design razor-line fade-finished
reel r8 comb-slick scissor-beard barber-hat
reel r9 crop-scissors cut-busy finish-spray
reel r10 hot-towel shop-luxury shave-moody
reel r11 curls-cut fade-clipper neck-clipper
reel r12 blow-dry comb-slick finish-spray
reel r13 barber-hat fade-tattoo fade-finished
reel r14 barber-cap shop-chairs-row beard-trim
reel r15 kids-cut-bw curls-cut barber-cap
reel r16 shave-moody hot-towel beard-trim
reel r17 blow-dry shop-luxury finish-spray
reel r18 tools-stand clippers-table fade-clipper

# Old generated placeholders that are no longer used
rm -f "$OUT"/g{1..20}.png
echo "Done: $(ls "$OUT" | wc -l) files, $(du -sh "$OUT" | cut -f1)"
