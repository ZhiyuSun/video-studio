#!/bin/sh
# Fetch the film's fonts (all OFL) from the Google Fonts CSS API as subsets. Chinese: only the characters the film uses.
set -e
cd "$(dirname "$0")"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
CHARS=$(cat ../*.js | python3 -c "import sys,re,urllib.parse; s=sys.stdin.read(); c=sorted(set(re.findall(r'[㐀-鿿＀-￯·¥]', s))); print(urllib.parse.quote(''.join(c)+'¥·'))")
get() {  # $1 css query, $2 output file
  url=$(curl -sS -A "$UA" "https://fonts.googleapis.com/css2?$1" | sed -n 's/.*src: url(\([^)]*\)).*/\1/p' | head -1)
  curl -sS -o "$2" "$url"; echo "$2 $(wc -c < "$2") bytes"
}
get "family=Noto+Sans+SC:wght@900&text=$CHARS" NotoSansSC-Black-subset.woff2
get "family=Share+Tech+Mono&text=0123456789%3A%C2%A5%20." ShareTechMono-subset.woff2
get "family=Kanit:ital,wght@1,900&text=SUNSHINEPAWBRCFHOTLVIDKYGMXZ24" Kanit-BlackItalic-subset.woff2
get "family=Kanit:ital,wght@1,800&text=SUNSHINEPAWBRCFHOTLVIDKYGMXZ24" Kanit-ExtraBoldItalic-subset.woff2
get "family=Noto+Sans+SC:wght@300&text=$CHARS" NotoSansSC-Light-subset.woff2
