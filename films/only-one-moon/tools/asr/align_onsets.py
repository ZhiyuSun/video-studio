"""How data/lyric_times.json was produced (re-run only if the song changes).

1. Transcribe with Whisper large-v3 (tools/asr/run.py) -> per-line start times. Whisper segments are
   contiguous, so a line's start is often the previous line's end: it is EARLY by 0.3-1.5 s.
2. Separate the vocals:  python3 -m demucs --two-stems=vocals -n htdemucs -o sep song.wav
   then:                 ffmpeg -i sep/htdemucs/song/vocals.wav -ac 1 -ar 16000 -f f32le vox16.raw
3. For each Whisper start t0, look in the isolated-vocal RMS envelope for the first real onset
   (a voiced run preceded by >=80 ms of silence) in [t0-0.8, t0+3.0]. Accept the correction only if
   it is between -0.7 and +1.5 s (bigger jumps were breaths inside a line). Subtract 0.1 s lead.
4. Choruses are strictly 2 bars per line (106 BPM -> 4.528 s). Their lines were re-placed on that grid
   from the measured first-line onset, then snapped to the nearest vocal gap within [-0.7, +0.3] s.
   (Not applied to the final chorus "fin", whose lyrics differ.) NOTE: the first-line onsets used as grid bases
   were checked by hand: c1=72.85, c2=129.45, c3=201.5 s. data/lyric_times.json is the authoritative result.

Usage: python3 align_onsets.py whisper.json vox16.raw > lyric_times.json   (needs numpy)
The mapping from Whisper segments to lyric lines (M below) is specific to this song's transcript.
"""
import json, sys
import numpy as np

seg = json.load(open(sys.argv[1]))
x = np.fromfile(sys.argv[2], dtype=np.float32)
hop = 160  # 10 ms at 16 kHz
n = len(x) // hop
rms = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)); rms = np.convolve(rms, np.ones(5) / 5, 'same')
thr = .12 * np.percentile(rms, 95); voiced = rms > thr; quiet = ~voiced

def st(k):  # k = 1-based line number in the Whisper log (line 1 is a header)
    s = seg[k - 2]; w = [a for a in s['words'] if a[2].strip()]
    return w[0][0] if w else s['s']

M = {'v1': [2, 3, 4, 6, 8, 10, 12, 14], 'pre1': [15, 16, 17, 18], 'c1': list(range(19, 27)), 'v2': list(range(27, 35)), 'c2': list(range(35, 43)),
     'v3': list(range(43, 49)), 'pre2': list(range(49, 55)), 'c3': list(range(55, 63)), 'v4': [63, 64, 65, 66, 67, 68, 70, 71, 73, 75],
     'br': [77, 78, 79, 80, 81, 83, 84, 85, 86, 87, 88, 89], 'fin': [90, 91, 92, 93, 94, 95, 96, 98], 'out': [99, 100, 101]}
out = {}
for k, idx in M.items():
    arr = [st(i) for i in idx]; res = []
    for i, t0 in enumerate(arr):
        nxt = arr[i + 1] if i + 1 < len(arr) else t0 + 4
        on = None
        for f in range(max(int((t0 - .8) * 100), 1), int(min(t0 + 3.0, nxt - .3) * 100)):
            if voiced[f] and voiced[f:f + 15].sum() >= 12 and not voiced[max(f - 8, 0):f].any():
                on = f / 100; break
        e = on if on is not None else t0
        res.append(round((e if -.7 <= e - t0 <= 1.5 else t0) - .1, 2))
    out[k] = res
BAR2 = 60 / 106 * 8
for k in ['c1', 'c2', 'c3']:
    base = out[k][0] + .1; new = [round(base - .1, 2)]
    for i in range(1, 8):
        tg = base + i * BAR2; best = None
        for f in range(int((tg - .7) * 100), int((tg + .3) * 100)):
            if not quiet[f] and quiet[f - 6:f].all() and (best is None or abs(f / 100 - tg) < abs(best - tg)): best = f / 100
        new.append(round((best if best else tg - .15) - .1, 2))
    out[k] = new
print(json.dumps(out))
