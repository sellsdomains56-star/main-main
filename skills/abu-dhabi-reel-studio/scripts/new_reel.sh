#!/usr/bin/env bash
# Scaffold a new reel folder from the engine.   bash new_reel.sh <path/to/reels/my-reel>
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; DEST="$1"; mkdir -p "$DEST/assets" "$DEST/build"
cp -r "$HERE/engine/." "$DEST/"; mv "$DEST/gitignore.txt" "$DEST/.gitignore"
cp "$HERE/asr_words.py" "$HERE/asr_windows.py" "$HERE/snap_onsets.py" "$HERE/prep_hook_voice.py" "$HERE/prep_cut.py" "$HERE/edl_tools.py" "$HERE/outline_from_osm.py" "$HERE/safe_scan.py" "$HERE/encode.sh" "$HERE/textlines.py" "$HERE/shot.mjs" "$DEST/"
cp "$HERE/../assets/scenes.template.js" "$DEST/scenes.js"; [ -f "$DEST/script.txt" ] || echo "Write the spoken script here ({6|six} for figures: display|spoken)" > "$DEST/script.txt"
echo "reel folder ready: $DEST   (next: references/pipeline.md step 2)"
