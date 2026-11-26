"""MiniMax TTS (国内站): python tts_minimax.py lines.json out_dir
Writes out_dir/<id>.wav (24 kHz mono, silence trimmed) and out_dir/dur.json, like core/tts/tts_zh.py.
Key from MINIMAX_API_KEY or ~/.minimax_key. mp3s cached in out_dir/.cache by text+voice+speed+tone."""
import sys, os, json, hashlib, binascii, subprocess, io, time, urllib.request
import numpy as np, soundfile as sf

SR = 24000
VOICE = 'Chinese (Mandarin)_Reliable_Executive'   # 沉稳中年 / 沉稳高管
SPEED = 0.92


def key():
    k = os.environ.get('MINIMAX_API_KEY')
    if not k:
        p = os.path.expanduser('~/.minimax_key')
        if os.path.exists(p): k = open(p).read().strip()
    if not k: sys.exit('no MiniMax key (MINIMAX_API_KEY or ~/.minimax_key)')
    return k


def fetch(text, tone, path):
    body = {"model": "speech-02-hd", "text": text, "stream": False,
            "voice_setting": {"voice_id": VOICE, "speed": SPEED, "vol": 1, "pitch": 0},
            "audio_setting": {"sample_rate": 32000, "bitrate": 128000, "format": "mp3", "channel": 1}}
    if tone: body["pronunciation_dict"] = {"tone": tone}
    last = None
    for attempt in range(4):
        try:
            r = urllib.request.Request('https://api.minimaxi.com/v1/t2a_v2', data=json.dumps(body).encode(),
                                       headers={'Authorization': 'Bearer ' + key(), 'Content-Type': 'application/json'})
            d = json.load(urllib.request.urlopen(r, timeout=90))
            if d.get('data') and d['data'].get('audio'):
                open(path + '.part', 'wb').write(binascii.unhexlify(d['data']['audio'])); os.replace(path + '.part', path); return
            last = d.get('base_resp')
        except Exception as e: last = e
        time.sleep(2 * (attempt + 1))
    sys.exit(f'MiniMax failed: {last}')


def decode(mp3):
    r = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ar', str(SR), '-ac', '1', '-f', 'wav', '-'], capture_output=True, check=True)
    a, _ = sf.read(io.BytesIO(r.stdout), dtype='float32'); return a


def trim(a, thr=0.004, pad=0.12):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx): return a
    i0 = max(0, idx[0] - int(pad * SR)); i1 = min(len(a), idx[-1] + int(pad * SR))
    return a[i0:i1]


def main():
    lines = json.load(open(sys.argv[1])); out = sys.argv[2]
    os.makedirs(os.path.join(out, '.cache'), exist_ok=True)
    dur = {}
    for L in lines:
        text = L.get('say', L['text']); tone = L.get('tone', [])
        h = hashlib.sha1(json.dumps([text, VOICE, SPEED, tone], ensure_ascii=False).encode()).hexdigest()[:16]
        mp3 = os.path.join(out, '.cache', h + '.mp3')
        if not os.path.exists(mp3): fetch(text, tone, mp3); print('fetched', L['id'], flush=True)
        a = trim(decode(mp3))
        sf.write(os.path.join(out, L['id'] + '.wav'), a, SR)
        dur[L['id']] = round(len(a) / SR, 3)
    json.dump(dur, open(os.path.join(out, 'dur.json'), 'w'), indent=1)
    print('total', round(sum(dur.values()), 1), 's')


main()
