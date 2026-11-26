"""Narration with MiniMax T2A v2 (api.minimaxi.com). Same outputs as the library's tts.py: <id>.wav (24 kHz mono, trimmed) + dur.json.
Key: env MINIMAX_API_KEY or ~/.minimax_key (never stored in the project). Cache: out_dir/.cache/<hash>.mp3
usage: python tools/tts_minimax.py lines.json voices/ [--voice ID] [--speed 0.92] [--only L03,L07]
"""
import json, os, sys, hashlib, subprocess, urllib.request, binascii, time

args = sys.argv[1:]
def opt(name, default):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
VOICE = opt('--voice', 'Chinese (Mandarin)_Reliable_Executive')
SPEED = float(opt('--speed', '0.92'))
ONLY = opt('--only', '')
lines_path, out = args[0], args[1]
os.makedirs(os.path.join(out, '.cache'), exist_ok=True)
def api_key():   # read only when a line is not in the cache: rebuilding from voices/.cache needs no key
    k = os.environ.get('MINIMAX_API_KEY')
    if k: return k
    p = os.path.expanduser('~/.minimax_key')
    if os.path.exists(p): return open(p).read().strip()
    sys.exit('MiniMax key needed (a line is not in voices/.cache): set MINIMAX_API_KEY or ~/.minimax_key')
# readings the model might get wrong in classical lines
PRON = {"tone": ["处此/(chu3)(ci3)", "俟/(si4)", "格竹子/(ge2)(zhu2)(zi5)", "驿丞/(yi4)(cheng2)", "廷杖/(ting2)(zhang4)", "瘴气/(zhang4)(qi4)", "刘瑾/(liu2)(jin3)"]}

def synth(text, cache):
    if os.path.exists(cache) and os.path.getsize(cache) > 1000: return
    body = {"model": "speech-02-hd", "text": text, "stream": False, "language_boost": "Chinese",
            "voice_setting": {"voice_id": VOICE, "speed": SPEED, "vol": 1, "pitch": 0},
            "pronunciation_dict": PRON,
            "audio_setting": {"sample_rate": 32000, "bitrate": 128000, "format": "mp3", "channel": 1}}
    for attempt in range(4):
        try:
            r = urllib.request.Request('https://api.minimaxi.com/v1/t2a_v2', data=json.dumps(body).encode(),
                                       headers={'Authorization': 'Bearer ' + api_key(), 'Content-Type': 'application/json'})
            d = json.load(urllib.request.urlopen(r, timeout=90))
            if d.get('data') and d['data'].get('audio'):
                open(cache, 'wb').write(binascii.unhexlify(d['data']['audio'])); return
            print('  minimax:', d.get('base_resp'), file=sys.stderr)
        except Exception as e:
            print('  retry:', e, file=sys.stderr)
        time.sleep(2 + attempt * 3)
    sys.exit(f'failed: {text[:20]}')

lines = json.load(open(lines_path))
dur_path = os.path.join(out, 'dur.json')
dur = json.load(open(dur_path)) if os.path.exists(dur_path) else {}
for L in lines:
    if ONLY and L['id'] not in ONLY.split(','): continue
    say = L.get('say') or L['text']
    h = hashlib.sha1(f"{VOICE}|{SPEED}|{say}|{json.dumps(PRON, ensure_ascii=False)}".encode()).hexdigest()[:16]
    cache = os.path.join(out, '.cache', h + '.mp3')
    synth(say, cache)
    wav = os.path.join(out, L['id'] + '.wav')
    # 24 kHz mono, silence trimmed at both ends (keeps 40 ms)
    af = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse"
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', cache, '-af', af, '-ar', '24000', '-ac', '1', wav], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], capture_output=True, text=True).stdout)
    dur[L['id']] = round(d, 3)
    print(L['id'], dur[L['id']])
json.dump(dur, open(dur_path, 'w'), indent=1)
print('total', round(sum(dur.values()), 1), 's')
