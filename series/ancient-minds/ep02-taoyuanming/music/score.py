"""Original score for 归去来 (guqin + xiao + frame drum / big drum / timpani / small gong), written against the film's own timeline.
Run from anywhere: $LIB/.venv/bin/python music/score.py   (needs events.json from core/render/events.mjs)
F gong / D yu pentatonic (F G A C D). Output music/score.wav (48k stereo, peak ≤ −1.2 dBFS) and music/score.json (marks + self-check)."""
import sys, os, json
LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from core.audio import sampler as S, pluck as P
from core.audio.sfx import SR, add

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
ev = json.load(open(os.path.join(ROOT, 'events.json'))); E = ev['ev']; DUR = ev['dur']
st_ = json.load(open(os.path.join(ROOT, 'story.json')))
V = {v['id']: v for v in st_['vo']}
SCN = {e['id']: e['t'] for e in E if e['type'] == 'scene'}
order = sorted(SCN, key=SCN.get); END = {k: (SCN[order[i + 1]] if i + 1 < len(order) else DUR) for i, k in enumerate(order)}
N = int((DUR + 1) * SR)
S.seed(7); np.random.seed(7); rng = np.random.default_rng(11)
st = {k: np.zeros((N, 2), np.float32) for k in ('guqin', 'xiao', 'drums', 'pad')}
marks = {}
def mark(k, t): marks[k] = round(t, 3)
def G(t, pitch, dur=None, vel=.6, pan=0., gain=1., **kw): add(st['guqin'], P.pluck('guqin', pitch, dur, vel, **kw), t, gain, pan)
def H(t, pitch, vel=.5, pan=0., gain=1., dur=1.2, **kw): G(t, pitch, dur, vel, pan, gain, harmonic=True, **kw)
def xiao(t, pitch, dur, vel=.5, pan=-.15, gain=1., att=.5):
    x = S.note('flute', pitch, dur, vel, release=.6, attack=att).astype(np.float64)
    x = sosfilt(butter(2, 2600, 'low', fs=SR, output='sos'), x)
    env = np.abs(x); env = np.convolve(env, np.ones(960) / 960, 'same')
    nz = sosfilt(butter(2, [800, 3000], 'band', fs=SR, output='sos'), rng.standard_normal(len(x)))
    add(st['xiao'], (x + nz * env * 1.6).astype(np.float32), t, gain, pan)
def D(t, inst, var, vel=.8, gain=1., pan=0., dur=None, env=None):
    x = S.hit(inst, var, vel, dur).astype(np.float64)
    if env is not None: x = x[:len(env)] * env[:len(x)]
    add(st['drums'], x.astype(np.float32), t, gain, pan)
def vo_at(t):   # is the narrator speaking at t?
    return any(v['t'] - .2 <= t <= v['t'] + v['dur'] + .1 for v in st_['vo'])
def soft(t, g): return g * (.55 if vo_at(t) else 1.)

# ---- 1 river · title: free tempo, emptiness ----
G(.4, 'F2', None, .8, 0, 1.1); mark('open_F2', .4)
xiao(1.8, 'C4', 5.0, .45, -.2, .7, att=1.6)
for tt, p in [(6.2, 'A3'), (9.6, 'D3'), (12.4, 'C3')]: G(tt, p, 1.6, .38, .1, .7, bend=[(0, 0), (.8, 0), (1.5, -2)])
T0 = SCN['title']
for tt, p in [(T0 + .8, 'C5'), (T0 + 1.5, 'F5'), (T0 + 2.2, 'A5')]: H(tt, p, .45, (tt - T0 - 1.5) * .3, .8)
H(T0 + 3.4, 'F4', .6, 0, .9, dur=2.4); D(T0 + 3.4, 'gong2', 'small', .3, .3, .1); mark('title_seal', T0 + 3.4)
G(T0 + 5.2, 'D3', 1.4, .4, -.1, .7)

# ---- 2 songshu: the official story, low and formal; hard cut to the seal ----
t = SCN['songshu']
for k, p in enumerate(['A2', 'C3', 'D3', 'C3', 'A2', 'G2']):
    G(t + .3 + k * 1.8, p, 1.6, .42, (-.2, .2)[k % 2], .75); D(t + .3 + k * 1.8, 'frame_drum', 'small_muted', .3, .3, .1)
Y = SCN['yin']; mark('yin_cut', Y)
D(Y, 'gran_cassa', 'hit', .85, 1.0); D(Y, 'timpani', 'drum2', .7, .7)
G(Y, 'C2', 2.6, .7, 0, 1.0, bend=[(0, 0), (.4, 0), (2.4, -2)])

# ---- 3 preface: his own words; the quote is written to plucks, one per character ----
t = SCN['preface']
xiao(t + .4, 'A3', 4.0, .4, -.2, .55, att=1.2)
G(t + 4.5, 'F3', 1.5, .4, .1, .7, vib=(4.3, .18, .3)); G(t + 9.5, 'D3', 1.6, .4, -.1, .7)
q = V['L09']; chars = 19; pent = ['D5', 'C5', 'A4', 'G4', 'F4', 'D4', 'C4', 'A3']
for i in range(chars):
    tt = q['t'] + q['dur'] * .95 * i / chars
    G(tt, pent[(i * 3) % len(pent)], .5, .36, (i % 2 - .5) * .4, .55)
mark('quote', q['t'])
G(V['L10']['t'], 'D2', 3.0, .5, 0, .8, bend=[(0, 0), (1.6, 0), (2.8, -2)])
G(V['L10']['t'] + 3.6, 'A2', 2.0, .4, .1, .7)

# ---- 4 desk: waiting for the harvest; slow ----
t = SCN['desk']
for k, (p, d) in enumerate([('F3', 2.2), ('A3', 1.6), ('G3', 2.2), ('D3', 2.6)]): G(t + .6 + k * 2.4, p, d, .4, .05 * k, .7)

# ---- 5 scroll: thirteen years back and forth: a three-note motive that changes direction every bar, 60 BPM ----
t0, t1 = SCN['scroll'], END['scroll']; b = 1.0; k = 0
while t0 + k * b < t1 - .8:
    tt = t0 + k * b; up = (k // 3) % 2 == 0
    seq = ['A3', 'C4', 'D4'] if up else ['D4', 'C4', 'A3']
    G(tt, seq[k % 3], .5, soft(tt, .42), (-.25 if up else .25), .65)
    D(tt, 'frame_drum', 'small_muted', .3, soft(tt, .34), (-.2 if up else .2))
    k += 1
for tt, p, d in [(t0 + 2, 'A4', 2.0), (t0 + 6, 'C5', 2.0), (t0 + 10, 'D5', 1.5), (V['L14']['t'] + .5, 'F5', 3.0), (t0 + 22, 'C5', 2.0), (t0 + 26, 'A4', 3.0)]:
    xiao(tt, p, d, .45, -.25, .45, att=.4)
G(t1 - .8, 'F2', 1.0, .5, 0, .8)

# ---- 6 lift: silence, the seal is put down (foley), then one sweep across all strings as the ink lifts ----
L0 = SCN['lift']; mark('lift_sweep', L0 + 2.7)
add(st['guqin'], P.strum('guqin', ['C2', 'D2', 'F2', 'G2', 'A2', 'C3', 'D3'], 3.0, .85, spread=.03), L0 + 2.7, 1.2, 0)
G(L0 + 2.7, 'F2', 4.0, .6, 0, .8)
for tt, p in [(L0 + 4.2, 'C5'), (L0 + 4.9, 'F5'), (L0 + 5.6, 'A5'), (L0 + 6.3, 'C6')]: H(tt, p, .45, (tt - L0 - 5) * .3, .75)
xiao(L0 + 4.0, 'F4', 6.0, .48, -.2, .6, att=1.0)

# ---- 7 home: the theme, in F gong ----
t = SCN['home']
for tt, p, d, kw in [(t + .5, 'A3', 1.4, dict(bend=[(0, -2), (.3, 0)])), (t + 2.0, 'C4', 1.0, dict(vib=(4.4, .2, .3))), (t + 3.2, 'D4', .9, {}), (t + 4.2, 'C4', .9, {}),
                     (t + 5.2, 'A3', 1.4, dict(vib=(4.0, .2, .35))), (t + 7.0, 'G3', .8, {}), (t + 8.0, 'A3', .8, {}), (t + 9.4, 'F3', 2.4, {})]:
    G(tt, p, d, soft(tt, .5), 0, .75, **kw)
for tt, p, d in [(t + 1.0, 'C5', 2.4), (t + 4.0, 'A4', 2.0), (t + 9.4, 'F4', 3.0)]: xiao(tt, p, d, .42, -.25, .4, att=.5)

# ---- 8 weeds: a question in harmonics ----
t = SCN['weeds']; H(t + 1.1, 'G5', .45, .2, .8, dur=2.0); H(t + 2.6, 'D5', .4, -.2, .7, dur=2.0)

# ---- 9 spring: the hoe is the pulse (one second); moon: xiao and footsteps ----
for e in [e for e in E if e['type'] == 'hoe']:
    D(e['t'], 'frame_drum', 'small_muted', .45, .5, .1); G(e['t'], ['D3', 'F3', 'G3', 'A3'][int(e['t']) % 4], .4, .45, .1, .6)
mark('hoe_first', min(e['t'] for e in E if e['type'] == 'hoe'))
t = SCN['moon']
for tt, p, d in [(t + .4, 'A4', 1.6), (t + 2.2, 'C5', 1.2), (t + 3.6, 'D5', .8), (t + 4.6, 'C5', 1.0), (t + 5.8, 'A4', 2.0)]: xiao(tt, p, d, .45, -.2, .5, att=.3)
for k in range(int((END['moon'] - t) / .5)): G(t + k * .5, ['C4', 'D4', 'F4', 'D4'][k % 4], .25, soft(t + k * .5, .38), .1, .5, pos=.12)

# ---- 10 fire: a timpani roll that grows, the big drum on the collapse, then only low strings ----
t = SCN['fire']; mark('collapse', t + 6.5)
nr = int(5.0 * SR); ramp = (np.linspace(0, 1, nr) ** 2) + .05
D(t + 1.5, 'gran_cassa', 'roll', .6, .9, 0, env=ramp)
D(t + 6.5, 'gran_cassa', 'hit', .95, 1.2); D(t + 6.5, 'timpani', 'drum2', .85, .9)
G(t + 6.5, 'C2', 3.5, .7, 0, 1.0, bend=[(0, 0), (.4, 0), (3.2, -3)])
G(t + 9.5, 'D2', 2.0, .4, 0, .6)

# ---- 11 autumn: lunzhi ostinato (72 BPM eighths), light; village: warm, sparse ----
t0, t1 = SCN['autumn'], SCN['village']; b = 60 / 72 / 2; seq = ['F2', 'C3', 'F3', 'C3', 'G2', 'D3', 'G3', 'D3']; k = 0
while t0 + .6 + k * b < t1 - .4:
    tt = t0 + .6 + k * b; G(tt, seq[k % 8], .3, soft(tt, .32), (-.3 if k % 2 else .3) * .4, .55); k += 1
t = SCN['village']
for tt, p, d in [(t + .5, 'F3', 1.8), (t + 2.4, 'A3', 1.2), (t + 4.0, 'C4', 1.4), (t + 6.0, 'D4', 1.0), (t + 7.4, 'C4', 1.2), (t + 9.2, 'A3', 2.4), (t + 12.4, 'F3', 2.4)]:
    G(tt, p, d, soft(tt, .45), .05, .65, vib=(4.2, .15, .3))

# ---- 12 today: 56 BPM single notes, low xiao; one harmonic per kept function ----
t0, t1 = SCN['rooms'], SCN['write']; b = 60 / 56; k = 0
mel = ['D3', None, 'F3', None, 'G3', 'A3', None, 'C4', None, 'A3', 'G3', None, 'F3', None, None, 'D3']
while t0 + .5 + k * b < t1 - 1:
    tt = t0 + .5 + k * b; p = mel[k % len(mel)]
    if p: G(tt, p, 1.4, soft(tt, .42), (k % 3 - 1) * .2, .6)
    k += 1
for tt, p, d in [(SCN['rooms'] + 2, 'D4', 6), (SCN['fork'] + 1, 'F4', 5), (SCN['fork'] + 12, 'A4', 6), (SCN['five'] + 2, 'G4', 6), (SCN['five'] + 20, 'F4', 8)]: xiao(tt, p, d, .4, -.25, .35, att=1.2)
for i, e in enumerate([e for e in E if e['type'] == 'word']): H(e['t'], ['C5', 'D5', 'F5', 'G5', 'A5'][i], .55, (i - 2) * .2, .95, dur=1.6)
mark('word1', [e['t'] for e in E if e['type'] == 'word'][0])

# ---- 13 two small things: the theme, gentler ----
t = SCN['write']
for tt, p, d in [(t + .6, 'A3', 1.4), (t + 3, 'C4', 1.0), (t + 5, 'D4', 1.0), (t + 7, 'C4', 1.4), (t + 10, 'A3', 1.4), (t + 13, 'G3', 2.0)]: G(tt, p, d, soft(tt, .45), 0, .65)
t = SCN['keep']
for k in range(int((SCN['tea'] - t) / 1.0)): G(t + .5 + k, ['F3', 'A3', 'C4', 'A3'][k % 4], .5, soft(t + .5 + k, .38), .1, .55)
t = SCN['tea']; xiao(t + .5, 'C5', 3.0, .4, -.2, .4, att=.6); G(t + .6, 'F3', 2.0, .4, 0, .6)
t = SCN['help']
for tt, p, d in [(t + .6, 'D3', 2.4), (t + 4, 'F3', 2.0), (t + 7.5, 'A3', 2.4), (t + 10.5, 'G3', 2.0)]: G(tt, p, d, soft(tt, .4), 0, .6)

# ---- 14 fence: the theme returns in full, cadence on F under the last line, seal ----
t = SCN['fence']
xiao(t + .3, 'C4', 4.0, .45, -.2, .55, att=1.2)
for tt, p, d, kw in [(t + 2.6, 'A3', 1.4, dict(bend=[(0, -2), (.3, 0)])), (t + 4.0, 'C4', 1.0, dict(vib=(4.4, .2, .3))), (t + 5.2, 'D4', .9, {}), (t + 6.2, 'F4', 1.2, {}),
                     (t + 7.6, 'D4', .9, {}), (t + 8.6, 'C4', 1.4, dict(vib=(4.0, .2, .35))), (t + 10.4, 'A3', 1.0, {}), (t + 11.6, 'G3', 1.0, {})]:
    G(tt, p, d, soft(tt, .5), 0, .75, **kw)
cad = V['L39']['t'] + V['L39']['dur'] + .3; mark('cadence', cad)
G(cad, 'F3', 3.0, .65, 0, .9); H(cad, 'F5', .45, .2, .6, dur=3.0); xiao(cad, 'F4', 4.0, .45, -.2, .5, att=.4)
sl = [e['t'] for e in E if e['type'] == 'seal'][-1]; mark('end_seal', sl)
H(sl, 'F3', .6, 0, 1.0, dur=3.6, release=1.2); G(sl, 'F2', None, .5, 0, .8); D(sl, 'gong2', 'small', .35, .35, .1)

# ---- reverb, silences, bus ----
for k, (size, mix) in {'guqin': (.5, .22), 'xiao': (.62, .3), 'drums': (.55, .16), 'pad': (.5, .15)}.items(): st[k] = S.room(st[k], size=size, mix=mix)
zones = [(e['t0'], e['t1']) for e in E if e['type'] == 'silence']
zones.append((SCN['fire'] + 6.9 + 1.2, SCN['fire'] + 9.4))   # after the collapse only embers (foley) are heard: music held at 0 for a moment
def gate_zero(x, a, b2, fade=.25):
    ia, ib, nf = int(a * SR), int(b2 * SR), int(fade * SR)
    x[max(0, ia - nf):ia] *= np.linspace(1, 0, ia - max(0, ia - nf), dtype=np.float32)[:, None]; x[ia:ib] = 0
for k in st:
    for a, b2 in zones: gate_zero(st[k], a, b2)
BUS = {'guqin': 1.0, 'xiao': 2.0, 'drums': .9, 'pad': .7}
mix = sum(st[k] * g for k, g in BUS.items())[:int(DUR * SR)]
mix[-int(.5 * SR):] *= np.linspace(1, 0, int(.5 * SR), dtype=np.float32)[:, None]
pk = np.abs(mix).max(); tgt = 10 ** (-1.2 / 20); mix *= tgt / pk if pk > tgt else 1.
sf.write(os.path.join(HERE, 'score.wav'), mix.astype(np.float32), SR, subtype='FLOAT')
rep = {'dur': len(mix) / SR, 'peak_dbfs': round(float(20 * np.log10(np.abs(mix).max())), 2), 'silence_max_abs': {f'{a:.2f}-{b2:.2f}': float(np.abs(mix[int(a * SR):int(b2 * SR)]).max()) for a, b2 in zones}}
json.dump({'marks': marks, 'selfcheck': rep}, open(os.path.join(HERE, 'score.json'), 'w'), indent=1)
print(json.dumps(rep, indent=1))
