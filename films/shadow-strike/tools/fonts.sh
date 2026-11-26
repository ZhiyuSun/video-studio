#!/bin/sh
# Subset Noto Serif SC (OFL) to the characters the film uses → fonts/
set -e
HERE=$(cd "$(dirname "$0")/.." && pwd)
CHARS="半拍皮影说第一二三四五六七八九十百千零夜它没有倒下原创短片署名"
[ -f "$HERE/credit.local.txt" ] && CHARS="$CHARS$(cat "$HERE/credit.local.txt")"
ENC=$(python3 -c "import sys,urllib.parse;print(urllib.parse.quote(''.join(sorted(set(sys.argv[1])))))" "$CHARS")
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
: > "$HERE/fonts/fonts.css"
for W in 600 900; do
  URL=$(curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@$W&text=$ENC" | grep -o 'https://[^)]*' | head -1)
  curl -s -o "$HERE/fonts/notoserifsc-$W.woff2" "$URL"
  printf "@font-face{font-family:'Noto Serif SC';font-weight:$W;src:url(notoserifsc-$W.woff2) format('woff2')}\n" >> "$HERE/fonts/fonts.css"
done
ls -la "$HERE/fonts"
