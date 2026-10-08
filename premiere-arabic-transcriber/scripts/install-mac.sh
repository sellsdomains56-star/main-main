#!/bin/bash
# Installs the Arabic Transcriber panel for the current user and lets Premiere
# Pro load it without a signed .zxp package.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/Library/Application Support/Adobe/CEP/extensions/com.arabictranscriber.panel"

for v in 9 10 11 12 13; do
  defaults write "com.adobe.CSXS.$v" PlayerDebugMode 1
done

rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$SRC/." "$DEST/"
rm -rf "$DEST/.git" "$DEST/test" "$DEST/scripts"

echo "Installed to: $DEST"
echo "Restart Premiere Pro, then open Window > Extensions > Arabic Transcriber."
