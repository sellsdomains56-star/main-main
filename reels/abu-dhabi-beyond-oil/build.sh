#!/usr/bin/env bash
# One-command build for the footage edit:
#   ./build.sh /path/to/interview-footage.mp4 [out.mp4]
# Needs: ffmpeg, node + playwright (Chromium), python3 with numpy Pillow opencv-contrib-python onnxruntime shapely osmium,
#        the Inter font installed (Instrument Serif ships in fonts/).
# Steps: logos -> footage frames + audio -> speaker cutout (RMBG-1.4 matte) -> OpenStreetMap vector map -> sound design ->
#        frame render (2x supersampled) -> encode (H.264 + AAC, -14 LUFS).
set -euo pipefail
cd "$(dirname "$0")"
FOOT="${1:?usage: ./build.sh interview-footage.mp4 [out.mp4]}"; OUT="${2:-abu-dhabi-beyond-oil-final-edit.mp4}"
mkdir -p build/footage build/map build/matte_raw build/matte
python3 -I prep_logos.py
# 1) footage -> 30 fps frames (1620x2880) + its own audio
[ -f build/footage/f_00000.jpg ] || ffmpeg -y -v error -i "$FOOT" -vf "fps=30,scale=1620:2880:flags=lanczos" -q:v 3 -start_number 0 build/footage/f_%05d.jpg
ffmpeg -y -v error -i "$FOOT" -vn -ac 2 -ar 48000 build/voice48k.wav
# 2) cut him out of his background
[ -f build/rmbg14.onnx ] || curl -L -o build/rmbg14.onnx https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model.onnx
python3 -I matte_raw.py 120 1399 && python3 -I matte_post.py 120 1399
# 3) map (OpenStreetMap data, (c) OpenStreetMap contributors, ODbL)
[ -f build/map/uae.osm.pbf ] || curl -L -o build/map/uae.osm.pbf https://download.openstreetmap.fr/extracts/asia/united_arab_emirates-latest.osm.pbf
[ -f build/map/map.json ] || python3 -I map_extract.py build/map/uae.osm.pbf build/map/map.json
# 4) voice envelope (drives the gold rim light) + sound design (footage audio, effects shifted 0.04 s to match the graphics timing)
python3 -I - <<'PY'
import numpy as np, subprocess, json
x = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','build/voice48k.wav','-ac','1','-ar','16000','-f','f32le','-'], capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)
n = len(x)//160; e = np.sqrt((x[:n*160].reshape(n,160)**2).mean(1)); k = np.hanning(9); e = np.convolve(e, k/k.sum(), mode='same')
json.dump([round(float(v),3) for v in np.clip(e/np.percentile(e,95),0,1)], open('build/voice_env.json','w'))
PY
python3 -I audio.py build/voice48k.wav build/mix.wav --offset 0.04
# 5) render + encode
[ -d build/frames ] || node render.mjs --out build/frames --workers "${WORKERS:-4}" --ss 1.5
ffmpeg -y -v error -framerate 30 -i build/frames/f_%05d.png -i build/mix.wav \
  -vf "scale=1080:1920:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.2 -maxrate 14M -bufsize 28M -r 30 \
  -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 224k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "done -> $OUT"
