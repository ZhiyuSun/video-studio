"""Builds story.json — the single source of truth for timing: shots, voice starts, subtitles, key moments.
Read by src/film.js (picture), music/score.py (score) and mix.py (mix). Re-run after any voice change.
usage: python tools/timeline.py
"""
import json, re, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dur = json.load(open(f'{HERE}/voices/dur.json'))
words = json.load(open(f'{HERE}/voices/words.json'))
lines = {l['id']: l for l in json.load(open(f'{HERE}/lines.json'))}

# Each shot: list of steps. ('pad', s) | ('L', id, gap_after) | ('mark', name) at the current time
SHOTS = [
    ('s1', [('pad', 3.0), ('L', 'L01', 1.2)]),
    ('s2', [('pad', .8), ('mark', 'title'), ('L', 'L02', .9), ('L', 'L03', 1.6)]),
    ('s3', [('pad', 1.2), ('L', 'L04', .7), ('L', 'L05', .2), ('mark', 'fall'), ('pad', 2.4), ('L', 'L06', 1.6)]),
    ('s4', [('pad', 1.6), ('L', 'L07', .7), ('L', 'L08', .7), ('L', 'L09', 1.4)]),
    ('s5', [('pad', 1.2), ('L', 'L10', .9), ('L', 'L11', .4), ('mark', 'hush5'), ('pad', 1.4)]),
    ('s6', [('pad', 1.0), ('L', 'L12', 1.6)]),
    ('s7', [('pad', .6), ('L', 'L13', 1.8)]),
    ('s8', [('pad', 1.0), ('L', 'L14', 1.6)]),
    ('s9', [('pad', 1.0), ('L', 'L15', .5), ('mark', 'hush'), ('pad', 2.2), ('mark', 'stroke'), ('pad', .5), ('mark', 'xin'), ('pad', 3.0)]),
    ('s10', [('L', 'L16', 1.0), ('mark', 'bamboo'), ('pad', .6), ('L', 'L17', .7), ('L', 'L18', 1.4), ('mark', 'poem'), ('pad', .5), ('L', 'L19', 2.0)]),
    ('s11', [('pad', 1.0), ('L', 'L20', .8), ('L', 'L21', 1.8)]),
    ('s12', [('pad', 1.0), ('L', 'L22', .8), ('mark', 'lab'), ('pad', .6), ('L', 'L23', .8), ('L', 'L24', .8), ('L', 'L25', .8), ('mark', 'rise'), ('L', 'L26', 1.6)]),
    ('s13', [('pad', .8), ('L', 'L27', 1.8)]),
    ('s14', [('pad', .6), ('L', 'L28', .8), ('mark', 'tea'), ('pad', .6), ('L', 'L29', .8), ('L', 'L30', 1.8)]),
    ('s15', [('pad', 1.2), ('L', 'L31', .8), ('L', 'L32', .8), ('L', 'L33', 1.2), ('L', 'L34', 1.6), ('L', 'L35', 1.0), ('mark', 'end'), ('pad', 7.5)]),
]

t = 0.0; shots = []; vo = []; marks = {}
for sid, steps in SHOTS:
    t0 = t
    for st in steps:
        if st[0] == 'pad': t += st[1]
        elif st[0] == 'mark': marks[st[1]] = round(t, 3)
        else:
            _, lid, gap = st
            vo.append({'id': lid, 't': round(t, 3), 'dur': dur[lid], 'shot': sid})
            t += dur[lid] + gap
    shots.append({'id': sid, 't0': round(t0, 3), 't1': round(t, 3)})
DUR = round(t, 3)

# ---- subtitles: split each line at punctuation into chunks (≤ 2 rows of ≤ 17 chars), timed by whisper's word timings
PUN = '，。？！；：、'
def chunks(text):
    parts = re.findall(r'[^。？！；：]+[。？！；：]?', text)
    out = []
    for p in parts:
        if len(p) <= 34: out.append(p); continue
        sub = re.findall(r'[^，]+，?', p); cur = ''
        for s in sub:
            if len(cur) + len(s) > 30 and cur: out.append(cur); cur = s
            else: cur += s
        if cur: out.append(cur)
    merged = []
    for c in out:
        if merged and len(re.sub(f'[{PUN}]', '', c)) < 6 and len(merged[-1]) + len(c) <= 34: merged[-1] += c
        else: merged.append(c)
    i = 0   # a short sentence joins the one after it (so no subtitle flashes by)
    while i < len(merged) - 1:
        if len(re.sub(f'[{PUN}]', '', merged[i])) < 9 and len(merged[i]) + len(merged[i + 1]) <= 34:
            merged[i:i + 2] = [merged[i] + merged[i + 1]]
        else: i += 1
    return merged
def wrap(c):
    c = c.rstrip('，。；：、')
    if len(c) <= 17: return c
    cut = [i for i, ch in enumerate(c) if ch in '，：？！' and 5 <= i <= len(c) - 4]
    i = min(cut, key=lambda i: abs(i - len(c) / 2)) + 1 if cut else len(c) // 2
    return c[:i] + '\n' + c[i:]
def ncj(s): return len(re.sub(r'[\s' + PUN + r'"“”？！]', '', s))

subs = []
for v in vo:
    L = lines[v['id']]; text = L['text']; cs = chunks(text)
    W = words.get(v['id']) or []
    total_heard = sum(ncj(w[0]) for w in W) or 1
    total_text = sum(ncj(c) for c in cs)
    # cumulative char → time using whisper words (scaled to our char count)
    def time_at(frac):
        target = frac * total_heard; acc = 0
        for w, a, b in W:
            n = ncj(w)
            if acc + n >= target and n: return max(0, a + (b - a) * (target - acc) / n)
            acc += n
        return v['dur']
    acc = 0
    for i, c in enumerate(cs):
        a = time_at(acc / total_text) if i else 0
        acc += ncj(c)
        b = time_at(acc / total_text) if i < len(cs) - 1 else v['dur']
        subs.append({'t0': round(v['t'] + a - .05, 3), 't1': round(v['t'] + b + .35, 3), 'text': wrap(c), 'id': v['id'], 'shot': v['shot']})
# no overlaps; hold ≥ max(1.8, …) by extending into the following gap where possible
for i, s in enumerate(subs):
    nxt = subs[i + 1]['t0'] - .04 if i + 1 < len(subs) else DUR
    s['t1'] = round(min(max(s['t1'], s['t0'] + 1.8), nxt), 3)

json.dump({'dur': DUR, 'shots': shots, 'vo': vo, 'marks': marks, 'subs': subs}, open(f'{HERE}/story.json', 'w'), ensure_ascii=False, indent=1)
print('DUR', DUR, 'subs', len(subs))
for s in shots: print(s['id'], s['t0'], s['t1'], round(s['t1'] - s['t0'], 1))
print(marks)
short = [s for s in subs if s['t1'] - s['t0'] < 1.8]
print('short subs:', [(s['text'], round(s['t1'] - s['t0'], 2)) for s in short])
