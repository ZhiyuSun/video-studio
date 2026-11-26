"""MiniMax TTS (国内站): python tts_minimax.py lines.json out_dir
Writes out_dir/<id>.wav (24 kHz mono, silence trimmed) and out_dir/dur.json, like core/tts/tts_zh.py.
Per line: text, say (spoken text if different), speed, tone (MiniMax pronunciation_dict entries).
Key from MINIMAX_API_KEY or ~/.minimax_key. mp3s cached in out_dir/.cache by text+voice+speed+tone."""
import sys, os, json, hashlib, subprocess, time, io
import urllib.request
import numpy as np, soundfile as sf

VOICE = 'Chinese (Mandarin)_Reliable_Executive'   # 沉稳中年
MODEL = 'speech-02-hd'
SR = 24000

def key():
    k = os.environ.get('MINIMAX_API_KEY')
    if not k: k = open(os.path.expanduser('~/.minimax_key')).read().strip()
    return k

def synth(text, speed, tone, path):
    body = {'model': MODEL, 'text': text, 'stream': False,
            'voice_setting': {'voice_id': VOICE, 'speed': speed, 'vol': 1, 'pitch': 0},
            'audio_setting': {'sample_rate': 32000, 'bitrate': 128000, 'format': 'mp3', 'channel': 1}}
    if tone: body['pronunciation_dict'] = {'tone': tone}
    req = urllib.request.Request('https://api.minimaxi.com/v1/t2a_v2', data=json.dumps(body).encode(),
                                 headers={'Authorization': f'Bearer {key()}', 'Content-Type': 'application/json'})
    for attempt in range(4):
        try:
            r = json.load(urllib.request.urlopen(req, timeout=120))
            st = r.get('base_resp', {})
            if st.get('status_code', 0) != 0: raise RuntimeError(f"MiniMax: {st}")
            open(path, 'wb').write(bytes.fromhex(r['data']['audio'])); return
        except Exception as e:
            print('  retry', attempt, e, file=sys.stderr); time.sleep(3 + attempt * 4)
    raise SystemExit(f'MiniMax failed for: {text}')

def main():
    lines = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]
    os.makedirs(f'{out}/.cache', exist_ok=True); dur = {}
    for L in lines:
        say = L.get('say', L['text']); speed = L.get('speed', .95); tone = L.get('tone', [])
        h = hashlib.sha1(json.dumps([say, VOICE, MODEL, speed, tone], ensure_ascii=False).encode()).hexdigest()[:16]
        mp3 = f'{out}/.cache/{h}.mp3'
        if not os.path.exists(mp3): synth(say, speed, tone, mp3)
        raw = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp3, '-ar', str(SR), '-ac', '1', '-f', 'wav', '-'],
                             capture_output=True, check=True).stdout
        y, sr = sf.read(io.BytesIO(raw), dtype='float32')
        nz = np.where(np.abs(y) > .01)[0]
        if len(nz): y = y[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.12 * sr)]
        sf.write(f"{out}/{L['id']}.wav", y, sr); dur[L['id']] = round(len(y) / sr, 3)
        print(L['id'], dur[L['id']], L['text'][:30])
    json.dump(dur, open(f'{out}/dur.json', 'w'), indent=1)

if __name__ == '__main__': main()
