"""Build story.json (the single timeline) from the voice durations: shots, voice start times, subtitle chunks, marks.
python3 tools/timeline.py"""
import json, re, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dur = json.load(open(f'{HERE}/voices/dur.json'))
lines = {l['id']: l for l in json.load(open(f'{HERE}/lines.json'))}

# shot id, line ids, head (s before first line), tail (s after last), gap between lines, fixed length for shots without voice
SHOTS = [
    ('river',   ['L01', 'L02'],               3.6, 1.0, .6),
    ('title',   ['L03'],                      1.6, 1.4, .6),
    ('songshu', ['L04', 'L05'],               .8, 1.2, .5),
    ('preface', ['L06', 'L07', 'L08', 'L09', 'L10'], 1.0, 1.4, .55),
    ('desk',    ['L11'],                      1.0, 1.0, .5),
    ('scroll',  ['L12', 'L13', 'L14', 'L15', 'L16'], 1.2, 1.6, .6),
    ('lift',    [],                           0, 0, 0, 8.0),
    ('home',    ['L17'],                      2.4, 1.8, .5),
    ('weeds',   ['L18'],                      1.0, 1.4, .5),
    ('spring',  ['L19', 'L20'],               .5, 1.6, .5),
    ('fire',    ['L21'],                      1.6, 1.6, .5),
    ('autumn',  ['L22', 'L23', 'L24'],        1.2, 1.8, .6),
    ('rooms',   ['L25', 'L26', 'L27'],        1.4, 1.0, .55),
    ('fork',    ['L28', 'L29', 'L30'],        .8, 1.2, .55),
    ('five',    ['L31', 'L32', 'L33', 'L34'], .8, 1.6, .55),
    ('write',   ['L35'],                      1.0, 1.4, .5),
    ('keep',    ['L36'],                      .8, 1.6, .5),
    ('help',    ['L37'],                      .8, 2.4, .5),
    ('fence',   ['L38', 'L39'],               2.0, 9.0, 1.4),
]
PUN = '，。：；？！、"“”《》（）'

def chunks(text):
    """split a line into subtitle chunks at sentence ends / long commas, ≤ ~22 chars per chunk"""
    q = []   # straight quotes → paired Chinese quotes
    for ch in text:
        if ch == '"': q.append('“' if q.count('“') == q.count('”') else '”')
        else: q.append(ch)
    text = ''.join(q)
    parts = re.split(r'(?<=[。？！：；])', text)
    out = []
    for p in parts:
        p = p.strip()
        while p.startswith('”') and out: out[-1] += '”'; p = p[1:].strip()
        if not p: continue
        while len(p) > 24:
            cut = [m.end() for m in re.finditer('[，；、]', p) if 6 <= m.end() <= 24]
            k = cut[-1] if cut else 22
            out.append(p[:k]); p = p[k:].strip()
        if p: out.append(p)
    L = lambda c: len(re.sub(f'[{PUN}]', '', c))
    merged = []
    i = 0
    while i < len(out):   # a short chunk joins the next one (or the previous, if the next is full)
        c = out[i]
        if L(c) < 7 and i + 1 < len(out) and len(c) + len(out[i + 1]) <= 26: out[i + 1] = c + out[i + 1]
        elif L(c) < 7 and merged and len(merged[-1]) + len(c) <= 26: merged[-1] += c
        else: merged.append(c)
        i += 1
    fixed = []
    for c in merged:   # close / open quotes cut by a chunk boundary
        if c.count('“') > c.count('”'): c += '”'
        if c.count('”') > c.count('“'): c = '“' + c
        fixed.append(c)
    return fixed

t = 0.0
shots, vo, subs = [], [], []
for s in SHOTS:
    sid, ids, head, tail, gap = s[:5]
    t0 = t
    if not ids:
        t += s[5]
    else:
        t += head
        for i, lid in enumerate(ids):
            d = dur[lid]
            vo.append({'id': lid, 't': round(t, 3), 'dur': d, 'shot': sid})
            cs = chunks(lines[lid]['text'])
            tot = sum(len(re.sub(f'[{PUN}]', '', c)) or 1 for c in cs); acc = 0
            for c in cs:
                n = len(re.sub(f'[{PUN}]', '', c)) or 1
                a = t + d * acc / tot; b = t + d * (acc + n) / tot; acc += n
                subs.append({'t0': round(a - .1, 3), 't1': round(b + .35, 3), 'text': c.rstrip('，、；：'), 'shot': sid, 'line': lid})
            t += d + (gap if i < len(ids) - 1 else 0)
        t += tail
    shots.append({'id': sid, 't0': round(t0, 3), 't1': round(t, 3)})
DUR = round(t, 3)
for i, s in enumerate(subs):   # hold ≥ 1.8 s where there is room, never overlap the next
    nxt = subs[i + 1]['t0'] - .05 if i + 1 < len(subs) else DUR
    s['t1'] = round(min(max(s['t1'], s['t0'] + 1.8), nxt), 3)
json.dump({'dur': DUR, 'shots': shots, 'vo': vo, 'subs': subs}, open(f'{HERE}/story.json', 'w'), ensure_ascii=False, indent=1)
print('DUR', DUR, 'subs', len(subs))
for s in shots: print(f"{s['id']:8s} {s['t0']:7.2f} {s['t1']:7.2f} {s['t1'] - s['t0']:5.1f}")
print('short:', [(s['text'], round(s['t1'] - s['t0'], 2)) for s in subs if s['t1'] - s['t0'] < 1.5])
print('long:', [s['text'] for s in subs if len(s['text']) > 24])
