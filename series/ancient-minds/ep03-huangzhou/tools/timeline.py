"""Build story.json (the single timeline) from the voice durations: shots, voice start times, subtitle chunks.
python3 tools/timeline.py"""
import json, re, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dur = json.load(open(f'{HERE}/voices/dur.json'))
lines = {l['id']: l for l in json.load(open(f'{HERE}/lines.json'))}
words = {}
try: words = json.load(open(f'{HERE}/voices/words.json'))
except Exception: pass

L = lambda a, b: [f'L{i:02d}' for i in range(a, b + 1)]
# shot id, line ids, head (s before first line), tail (s after last), gap between lines, [fixed length if no voice], transition into this shot
SHOTS = [
    ('rainwide', L(1, 1),   4.0, 1.0, .6, None, 'open'),
    ('rainwalk', L(2, 3),   .6, 1.0, .6, None, 'cut'),
    ('puddle',   L(4, 5),   .8, 1.8, .5, None, 'cut'),
    ('small',    L(6, 7),   1.0, .9, .7, None, 'cut'),
    ('drop',     [],        0, 0, 0, 3.2, 'hard'),
    ('title',    [],        0, 0, 0, 5.2, 'cut'),
    ('prison',   L(8, 10),  1.4, 1.2, .6, None, 'bloom'),
    ('river',    L(11, 12), 1.0, 1.4, .6, None, 'bloom'),
    ('temple',   L(13, 14), 1.0, 1.0, .6, None, 'bloom'),
    ('goose',    L(15, 16), .8, 2.4, .7, None, 'cut'),
    ('hut',      L(17, 21), 1.4, 1.0, .6, None, 'bloom'),
    ('despair',  L(22, 27), .8, .8, .7, None, 'cut'),
    ('hush',     [],        0, 0, 0, 4.0, 'cut'),
    ('lift',     L(28, 30), .6, 1.2, .8, None, 'cut'),
    ('paper',    L(31, 35), 1.0, 1.0, .6, None, 'bloom'),
    ('sit',      L(36, 37), .8, 1.4, .6, None, 'bloom'),
    ('coins',    L(38, 40), 1.0, 1.0, .6, None, 'bloom'),
    ('farm',     L(41, 44), .8, 1.2, .6, None, 'bloom'),
    ('acts',     L(45, 47), .8, 1.4, .6, None, 'bloom'),
    ('chibi',    L(48, 53), 1.4, 1.0, .6, None, 'bloom'),
    ('reply',    L(54, 55), .6, 1.4, .8, None, 'cut'),
    ('pull',     L(56, 60), .8, 1.4, .6, None, 'cut'),
    ('dawn',     L(61, 61), 1.0, 1.6, .6, None, 'bloom'),
    ('rainback', L(62, 65), 1.4, 1.2, .7, None, 'bloom'),
    ('prints',   L(66, 68), 1.4, 7.0, .9, None, 'cut'),
]
PUN = '，。：；？！、“”《》（）——·'

def chunks(text):
    """split a line into subtitle chunks at sentence ends / long commas, ≤ ~22 chars per chunk"""
    parts = re.split(r'(?<=[。？！；])|(?<=——)', text)
    out = []
    for p in parts:
        p = p.strip()
        if not p: continue
        while len(p) > 24:
            cut = [m.end() for m in re.finditer('[，；、：]', p) if 6 <= m.end() <= 24]
            k = cut[-1] if cut else 22
            out.append(p[:k]); p = p[k:].strip()
        if p: out.append(p)
    merged = []
    for c in out:
        n = len(re.sub(f'[{PUN}]', '', c))
        if merged and n < 7 and len(merged[-1]) + len(c) <= 26: merged[-1] += c
        else: merged.append(c)
    return merged

def clean(c):   # what is shown: drop trailing commas / dashes, keep ？！
    c = c.strip()
    c = re.sub('[，、：；——]+$', '', c)
    c = re.sub('。$', '', c)
    return c

t = 0.0
shots, vo, subs = [], [], []
for sid, ids, head, tail, gap, fixed, tr in SHOTS:
    t0 = t
    if not ids:
        t += fixed
    else:
        t += head
        for i, lid in enumerate(ids):
            d = dur[lid]; ln = lines[lid]
            vo.append({'id': lid, 't': round(t, 3), 'd': d, 'shot': sid, 'quote': ln.get('quote', 0)})
            cs = chunks(ln['text'])
            n = [max(1, len(re.sub(f'[{PUN}]', '', c))) for c in cs]
            tot = sum(n); acc = 0
            for c, k in zip(cs, n):
                a = t + d * acc / tot; acc += k; b = t + d * acc / tot
                subs.append({'t0': round(a - .1, 3), 't1': round(b + .25, 3), 'text': clean(c), 'id': lid, 'shot': sid, 'quote': ln.get('quote', 0)})
            t += d + (gap if i < len(ids) - 1 else 0)
        t += tail
    shots.append({'id': sid, 't0': round(t0, 3), 't1': round(t, 3), 'tr': tr})
# subtitles: hold ≥ max(1.8 s, …) but never overlap the next one
for i, s in enumerate(subs):
    nxt = subs[i + 1]['t0'] - .05 if i + 1 < len(subs) else s['t1'] + 2
    s['t1'] = round(min(max(s['t1'], s['t0'] + 1.8), nxt), 3)
story = {'dur': round(t, 3), 'shots': shots, 'vo': vo, 'subs': subs}
json.dump(story, open(f'{HERE}/story.json', 'w'), ensure_ascii=False, indent=1)
print('dur', round(t, 1))
for s in shots: print(f"{s['id']:10s} {s['t0']:7.2f} {s['t1']:7.2f} {s['t1']-s['t0']:6.2f}")
print('subs', len(subs), 'longest', max(len(s['text']) for s in subs))
