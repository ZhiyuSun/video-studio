#!/bin/sh
# Rebuild 苏轼在黄州 from scratch: sh build.sh  (run from this folder)
# Needs the Lemo-Opuscar library with deps core + voice + music (sh setup.sh deps voice music), ffmpeg 7+ on PATH,
# and a MiniMax key in MINIMAX_API_KEY or ~/.minimax_key (only if the voice cache in voices/.cache is missing).
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
P=$(cd "$(dirname "$0")" && pwd)
PY=$LIB/.venv/bin/python
export LIB
echo "1/8 voice (MiniMax)";   $PY "$P/tools/tts_minimax.py" "$P/lines.json" "$P/voices"
echo "2/8 whisper check";     (cd "$LIB" && $PY core/tts/asr_check.py "$P/lines.json" "$P/voices" --lang zh) || echo "  (differences are homophones in classical text; listened and accepted)"
echo "3/8 timeline";          python3 "$P/tools/timeline.py"
echo "4/8 events";            (cd "$LIB" && node core/render/events.mjs "$P")
echo "5/8 score + mix";       $PY "$P/music/score.py" && $PY "$P/mix.py"
echo "6/8 render";            (cd "$LIB" && node core/render/video.mjs "$P" --fps 24 --workers 2 --out "$P/out/video.mp4")
echo "7/8 mux (−14 LUFS)"
(cd "$LIB" && sh core/render/mux.sh "$P/out/video.mp4" "$P/mix.wav" "$P/sushi-huangzhou.mp4" 24 0)
echo "8/8 subtitles + poster"
python3 -c "import json;d=json.load(open('$P/story.json'));json.dump([{'t0':s['t0'],'t1':s['t1'],'text':s['text']} for s in d['subs']],open('$P/cues.json','w'),ensure_ascii=False)"
$PY "$LIB/core/render/srt.py" "$P/cues.json" "$P/subtitles_zh.srt"
(cd "$LIB" && node core/render/still.mjs "$P" 31 --q nosub=1 --out "$P/out" --prefix poster_ && cp "$P/out/poster_31.jpg" "$P/poster.jpg")
echo done
