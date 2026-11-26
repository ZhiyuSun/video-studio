#!/bin/sh
# Master: mux picture + mix, two-pass loudnorm to −14 LUFS / −1.5 dBTP, light grain in ffmpeg.
# Works on ffmpeg 6 (the library's mux.sh wants 7+): the audio is padded/trimmed to the picture's exact length first.
# Usage: sh master.sh out/video.mp4 out/mix.wav sunshine-pawn.mp4
set -e
V=$1; A=$2; OUT=$3
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
J=$(ffmpeg -hide_banner -i "$A" -af "apad,atrim=0:$D,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | sed -n "s/.*\"$1\" : \"\([^\"]*\)\".*/\1/p"; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,alimiter=limit=0.82:level=false"
TMP="$OUT.part.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$V" -i "$A" -map 0:v -map 1:a \
  -vf "noise=c0s=2:allf=t" -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p -r 24 \
  -af "apad,atrim=0:$D,$LN,aresample=48000" -c:a aac -b:a 192k -t "$D" -movflags +faststart "$TMP"
mv "$TMP" "$OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
echo "picture $(ffprobe -v error -select_streams v -show_entries stream=duration -of csv=p=0 "$OUT") s, audio $(ffprobe -v error -select_streams a -show_entries stream=duration -of csv=p=0 "$OUT") s → $OUT"
