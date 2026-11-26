#!/bin/sh
# One command from source to film: events → score → mix → picture → master.
# LIB = the lemo-opuscar library (https://github.com/lemomo-ai/lemo-opuscar), installed with its setup.sh deps + deps music.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar library folder"; exit 1; }
[ -f "$HERE/fonts/NotoSansSC-Black-subset.woff2" ] || sh "$HERE/fonts/get.sh"
cd "$LIB"
node core/render/events.mjs "$HERE"
"$LIB/.venv/bin/python" "$HERE/music/score.py"
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"   # on Linux without a GPU: LEMO_ANGLE=swiftshader
cd "$HERE" && sh master.sh out/video.mp4 out/mix.wav sunshine-pawn.mp4
