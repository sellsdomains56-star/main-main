#!/bin/bash
# Rebuild the study: analyse -> charts -> HTML -> PDF.  Usage: bash build.sh <raw_all.json> [tile_cache]
set -e
cd "$(dirname "$0")"
RAW=${1:?raw_all.json from pull_all.py}; TILES=${2:-/tmp/tilecache}
python3 -I analyze.py "$RAW" ../data
python3 -I charts.py ../data ../charts "$TILES"
python3 -I report.py ../data charts ../study.html
NODE_PATH=${NODE_PATH:-$(npm root -g)} node print_pdf.mjs ../study.html ../Aldar_Dubai_Townhouse_Study.pdf
