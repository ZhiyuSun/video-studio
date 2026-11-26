"""Original score for 龙场 (≈326 s). Guqin = core/audio/pluck.py guqin (open strings, stopped notes with slides, yin vibrato, harmonics, sweep);
xiao = sampled flute, low register, low-passed, with breath noise; drums = gran_cassa / timpani / frame_drum; small gong for the seals.
Mode: D shang (商) on the C pentatonic set (C D E G A), tonic D; all melodies original.
Timing comes from story.json and events.json (run tools/timeline.py and core/render/events.mjs first).
usage (from the library root): .venv/bin/python <project>/music/score.py  → music/score.wav (48 kHz stereo float), music/score.json"""
import sys, os, json
HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
from core.audio import sampler as S, pluck as P
from core.audio.sfx import SR, add

ST = json.load(open(f'{PROJ}/story.json')); EV = json.load(open(f'{PROJ}/events.json'))['ev']
DUR = ST['dur']; N = int(DUR * SR) + SR
M = ST['marks']; SH = {s['id']: s for s in ST['shots']}; VO = {v['id']: v for v in ST['vo']}
S.seed(17); rng = np.random.default_rng(23)
st = {k: np.zeros((N, 2), np.float32) for k in ('guqin', 'xiao', 'drums', 'pad')}

def G(t, pitch, dur=None, vel=.6, pan=0., gain=1., **kw): add(st['guqin'], P.pluck('guqin', pitch, dur, vel, **kw), t, gain, pan)
def H(t, pitch, vel=.5, pan=0., gain=1., dur=1.4, **kw): G(t, pitch, dur, vel, pan, gain, harmonic=True, **kw)
def xiao(t, pitch, dur, vel=.5, pan=-.15, gain=1., att=.5):
    x = S.note('flute', pitch, dur, vel, release=.7, attack=att).astype(np.float64)
    x = sosfilt(butter(2, 2500, 'low', fs=SR, output='sos'), x)
    env = np.convolve(np.abs(x), np.ones(960) / 960, 'same')
    nz = sosfilt(butter(2, [800, 3000], 'band', fs=SR, output='sos'), rng.standard_normal(len(x)))
    add(st['xiao'], (x + nz * env * 1.5).astype(np.float32), t, gain, pan)
def D(t, inst, var, vel=.8, gain=1., pan=0., dur=None):
    add(st['drums'], S.hit(inst, var, vel, dur).astype(np.float32), t, gain, pan)
def phrase(t0, notes, beat, vel=.5, gain=.9, pan=.05, until=None):
    """notes: [(pitch|None, beats, kw)] played on the guqin from t0"""
    t = t0
    for n in notes:
        p, b = n[0], n[1]; kw = n[2] if len(n) > 2 else {}
        if until and t >= until: break
        if p: G(t, p, b * beat * 1.4, vel, pan, gain, **kw)
        t += b * beat
    return t
def xphrase(t0, notes, beat, vel=.45, gain=.8, att=.3):
    t = t0
    for p, b in notes:
        if p: xiao(t, p, b * beat * .95, vel, -.2, gain, att)
        t += b * beat
    return t
marks = {}
def mark(k, t): marks[k] = round(t, 3)
SLD = lambda a: [(0, a), (.3, 0)]          # slide into the note from a semitones away
DROP = lambda a: [(0, 0), (.5, 0), (1.2, a)]

# ---------- A · s1 万山 (sanban) ----------
s = SH['s1']
G(.4, 'D2', None, .85, 0, 1.2); mark('A_open', .4)
xiao(2.4, 'A3', 4.2, .45, -.2, .75, att=1.5)
H(5.2, 'D5', .45, .2, .8); H(6.0, 'A5', .4, -.1, .7)
G(8.6, 'G2', 2.0, .4, .05, .8, bend=DROP(-2))
# ---------- B · s2 title ----------
T = M['title']
H(T + 1.4, 'A4', .5, .15, .9); H(T + 2.3, 'D5', .5, -.1, .9); mark('B_title', T + 1.4)
G(T + 3.5, 'D2', None, .55, 0, .9); H(T + 3.5, 'D4', .55, 0, .9, dur=3); D(T + 3.5, 'gong2', 'small', .3, .35, .1); mark('B_seal', T + 3.5)
G(VO['L03']['t'] + 1.5, 'E3', 1.6, .35, .1, .7, vib=(4.2, .18, .35)); G(VO['L03']['t'] + 4.5, 'D3', 2.2, .35, -.1, .7)
# ---------- C · s3 格竹: 60 BPM theme, sparse under narration; seven day-ticks; silence at the fall ----------
s = SH['s3']; b = 1.0
phrase(s['t0'] + .2, [('A3', 2, {'bend': SLD(-2)}), ('C4', 1, {'vib': (4.5, .2, .3)}), ('D4', 1), ('C4', 1), ('A3', 3), ('G3', 2), ('A3', 2), ('E3', 4, {'bend': DROP(-1)}), (None, 2),
                       ('D3', 2), ('E3', 1), ('G3', 1), ('A3', 4), (None, 4), ('G3', 2), ('E3', 2), ('D3', 4)], b, .38, .8, until=M['fall'] - .4)
L5 = VO['L05']
for i in range(7):
    tt = L5['t'] + i * (L5['dur'] * .55 / 7) + .05
    H(tt, ['D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6'][i], .32 + i * .03, (i - 3) * .08, .65, dur=.6); mark(f'C_day{i}', tt)
G(M['fall'] + .1, 'D2', 1.0, .6, 0, .9, bend=DROP(-3)); mark('C_fall', M['fall'] + .1)
H(M['fall'] + 2.25, 'A4', .45, 0, .8, dur=2.4)
G(VO['L06']['t'] + 1.0, 'G2', 2.4, .4, 0, .7, bend=DROP(-2))
# ---------- D · s4 handscroll: bell, then a walking pulse (frame drum on steps), xiao melody ----------
s = SH['s4']
D(s['t0'] + .2, 'gong2', 0, .55, .7, -.1); G(s['t0'] + .2, 'D2', None, .5, 0, .8); mark('D_bell', s['t0'] + .2)
b = .8
t = s['t0'] + 2.0
while t < s['t1'] - 1.5:
    G(t, ['D2', 'A2', 'D3', 'A2'][int((t - s['t0']) / b) % 4], b * 1.2, .28, -.2, .6); t += b
xphrase(s['t0'] + 3.0, [('D4', 3), ('E4', 1), ('G4', 2), ('A4', 2), ('G4', 2), ('E4', 2), ('D4', 4), (None, 2), ('A3', 2), ('C4', 2), ('D4', 3), ('E4', 1), ('D4', 6)], b, .42, .6)
G(s['t1'] - 1.4, 'A2', 1.6, .45, 0, .8, bend=DROP(-2))
# ---------- E · s5 cave: low slides, drips answered by harmonics, silence before the cut ----------
s = SH['s5']
G(s['t0'] + .3, 'D2', 3.5, .55, 0, .9, bend=[(0, 0), (1.5, 0), (3.2, -2)])
G(s['t0'] + 4.6, 'F2', 2.6, .35, .1, .7, bend=DROP(-1))
H(VO['L10']['t'] + 2.4, 'D5', .35, .2, .6, dur=2.6)
G(VO['L11']['t'] + .6, 'C3', 2.8, .35, -.1, .7, vib=(3.6, .25, .4))
# ---------- F · s6 chop (72 BPM) + s7 night song ----------
s = SH['s6']; b = 60 / 72
chops = [e['t'] for e in EV if e['type'] == 'chop']
for tc in [c for c in chops if c < SH['s7']['t0']]:
    D(tc, 'frame_drum', 'small_muted', .55, .55, .05); mark(f'F_chop_{round(tc, 2)}', tc)
t = s['t0'] + .3; i = 0
seq = ['D3', 'A3', 'D4', 'A3', 'G3', 'D4', 'E4', 'D4']
while t < s['t1'] - .4:
    G(t, seq[i % 8], b * .6, .3, (.3 if i % 2 else -.3) * .4, .6); t += b / 2; i += 1
s = SH['s7']; b = 1.0
xphrase(s['t0'] + .4, [('A4', 1.5), ('G4', .5), ('E4', 1), ('D4', 1), ('E4', 2), (None, .5), ('G4', 1), ('A4', 1), ('G4', 2)], b, .38, .7, att=.35)
G(s['t0'] + .4, 'D2', 4, .35, 0, .6); G(s['t0'] + 4.4, 'A1', 3, .3, 0, .55)
# ---------- G · s8 question → s9 night → the stroke → 心 ----------
s = SH['s8']; L14 = VO['L14']
for k in range(8):   # one plucked note per written character
    tt = L14['t'] + 2.5 + k * (2.8 / 8)
    G(tt, ['D4', 'E4', 'G4', 'A4', 'C5', 'A4', 'G4', 'D4'][k], .7, .42, (k - 3.5) * .07, .7); mark(f'G_char{k}', tt)
G(s['t1'] - 2.2, 'D2', 3, .4, 0, .7, bend=DROP(-2))
s = SH['s9']
# low drone under the night line, rising tension, then the full silence
bass = S.note('contrabass', 'D1', M['hush'] - s['t0'] - .1, .35, release=.25, attack=1.5).astype(np.float32)
add(st['pad'], bass, s['t0'] + .1, .5, 0)
mark('G_stroke', M['stroke'])
D(M['stroke'], 'gran_cassa', 'hit', .95, 1.25); D(M['stroke'], 'timpani', 'drum2', .9, .9)
add(st['guqin'], P.strum('guqin', ['C2', 'D2', 'E2', 'G2', 'A2', 'C3', 'D3'], 3.2, .95, spread=.012), M['stroke'] + .02, 1.25, 0)
add(st['pad'], S.note('contrabass', 'D1', 3.4, .55, release=.8, attack=.03).astype(np.float32), M['stroke'] + .03, .6, 0)
for i, (d, p) in enumerate(zip([0, .62, 1.7, 2.3], ['A4', 'D5', 'E5', 'A5'])):
    H(M['xin'] + d, p, .55, (i - 1.5) * .15, .9, dur=1.6); mark(f'G_xin{i}', M['xin'] + d)
G(M['xin'] + 3.4, 'D3', 3.0, .45, 0, .85, vib=(4.0, .2, .4))
# ---------- H · s10: what he understood — calm theme, bamboo recall, the poem with xiao ----------
b = 1.0
phrase(VO['L16']['t'] + 4.0, [('A3', 2), ('D4', 2), ('E4', 1), ('D4', 1), ('A3', 4), (None, 2), ('G3', 2), ('A3', 2), ('D3', 4)], b, .34, .7, until=M['bamboo'])
phrase(M['bamboo'] + .3, [('D4', 2, {'bend': SLD(-2)}), ('C4', 2), ('A3', 4), (None, 2), ('G3', 1), ('A3', 1), ('C4', 2), ('D4', 4), (None, 2), ('E4', 2), ('D4', 2), ('A3', 4)], b, .32, .7, until=M['poem'] - .3)
xphrase(M['poem'] + .4, [('D4', 3), ('E4', 1), ('G4', 3), ('A4', 1), ('G4', 2), ('E4', 2), ('D4', 6), (None, 2), ('A3', 2), ('D4', 6)], 1.0, .4, .7, att=.5)
G(M['poem'] + .4, 'D2', 6, .35, 0, .6); G(M['poem'] + 12.4, 'A1', 6, .3, 0, .55)
# ---------- I · s11 书院: warmer, guqin + xiao in dialogue ----------
s = SH['s11']; b = .9
phrase(s['t0'] + .2, [('D3', 1), ('A3', 1), ('D4', 2), ('E4', 1), ('G4', 1), ('A4', 2), ('G4', 2), ('E4', 2), ('D4', 4), (None, 1), ('A3', 1), ('C4', 1), ('D4', 1), ('E4', 2), ('D4', 2), ('A3', 4)], b, .36, .75)
xphrase(s['t0'] + 7.4, [('A4', 2), ('G4', 1), ('E4', 1), ('D4', 4), (None, 2), ('E4', 2), ('D4', 6)], b, .38, .6)
H(VO['L20']['t'] + 1.8, 'D5', .45, .1, .7, dur=2)
# ---------- J · s12 today: sparse harmonics; at "rise" a rising harmonic line ----------
s = SH['s12']
G(s['t0'] + .2, 'D2', None, .4, 0, .7)
for k, tt in enumerate(np.arange(s['t0'] + 3, M['rise'] - 1, 4.0)):
    H(tt, ['A4', 'D5', 'E5', 'D5', 'A4', 'G4'][k % 6], .3, ((k % 3) - 1) * .2, .55, dur=1.8)
for k, p in enumerate(['D4', 'E4', 'G4', 'A4', 'D5', 'E5', 'A5']):
    H(M['rise'] + .2 + k * .45, p, .42, (k - 3) * .1, .75, dur=1.6)
mark('J_rise', M['rise'] + .2)
G(M['rise'] + 4, 'D3', 3, .35, 0, .7, vib=(4.0, .2, .4))
# ---------- K · s13 desk + the respected one ----------
s = SH['s13']
G(s['t0'] + .3, 'A2', 3, .35, 0, .7)
xiao(VO['L27']['t'] + 6.4, 'D4', 5.5, .42, -.2, .7, att=1.4); mark('K_ghost', VO['L27']['t'] + 6.5)
H(VO['L27']['t'] + 9.0, 'A4', .4, .2, .6)
# ---------- L · s14 chop recall + tea ----------
s = SH['s14']
for tc in [c for c in chops if c > SH['s14']['t0']]: D(tc, 'frame_drum', 'small_muted', .5, .5, .05)
t = s['t0'] + .3; i = 0; b = 60 / 72
while t < M['tea'] - .3:
    G(t, seq[i % 8], b * .6, .28, (.3 if i % 2 else -.3) * .4, .55); t += b / 2; i += 1
b = 1.0
phrase(M['tea'] + .6, [('D4', 2), ('E4', 1), ('G4', 1), ('A4', 3), ('G4', 1), ('E4', 2), ('D4', 2), (None, 2), ('A3', 2), ('C4', 2), ('D4', 4), (None, 2), ('G3', 2), ('A3', 2), ('D4', 6)], b, .34, .72)
G(M['tea'] + .6, 'D2', 8, .3, 0, .55)
# ---------- M · s15 the range again: the theme, broader; title, seal, last tonic ----------
s = SH['s15']; b = 1.0
G(s['t0'] + .2, 'D2', None, .5, 0, .85)
phrase(s['t0'] + 1.2, [('A3', 2, {'bend': SLD(-2)}), ('C4', 1, {'vib': (4.5, .2, .3)}), ('D4', 1), ('C4', 1), ('A3', 3), ('G3', 2), ('A3', 2), ('D3', 4), (None, 2),
                       ('D3', 2), ('E3', 1), ('G3', 1), ('A3', 4), (None, 2), ('C4', 2), ('D4', 2), ('E4', 2), ('D4', 6), (None, 2), ('A3', 2), ('G3', 2), ('A3', 4), ('D3', 6)], b, .36, .78, until=M['end'] - .5)
xphrase(VO['L35']['t'] - 1.0, [('A3', 2), ('D4', 3), ('E4', 1), ('D4', 6)], 1.0, .45, .8, att=.6)
E = M['end']
for k, p in enumerate(['D5', 'A5']): H(E + .4 + k * .9, p, .45, (k - .5) * .3, .8, dur=2)
G(E + 2.6, 'D2', None, .55, 0, .9); H(E + 2.6, 'D4', .55, 0, .9, dur=4, release=1.5); D(E + 2.6, 'gong2', 'small', .32, .35, .1); mark('M_seal', E + 2.6)

# ---------- reverb, silences, bus ----------
st['guqin'] = S.room(st['guqin'], size=.5, mix=.2); st['xiao'] = S.room(st['xiao'], size=.62, mix=.3)
st['drums'] = S.room(st['drums'], size=.55, mix=.16); st['pad'] = S.room(st['pad'], size=.5, mix=.15)
zones = [(e['t0'], e['t1']) for e in EV if e['type'] == 'silence']
for k in st:
    for a, b2 in zones:
        ia, ib, nf = int(a * SR), int(b2 * SR), int(.02 * SR)
        st[k][ia - nf:ia] *= np.linspace(1, 0, nf, dtype=np.float32)[:, None]; st[k][ia:ib] = 0
st = {k: v[:int(DUR * SR)] for k, v in st.items()}
for k in st: st[k][-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR), dtype=np.float32)[:, None]
BUS = {'guqin': 1.0, 'xiao': 2.0, 'drums': .9, 'pad': .7}
mix = sum(st[k] * g for k, g in BUS.items())
pk = np.abs(mix).max(); tgt = 10 ** (-1.2 / 20); sc = tgt / pk if pk > tgt else 1.0
mix *= sc
sf.write(f'{HERE}/score.wav', mix.astype(np.float32), SR, subtype='FLOAT')
def rms_db(a, b2):
    s_ = mix[int(a * SR):int(b2 * SR)]; return round(float(20 * np.log10(np.sqrt(np.mean(s_ ** 2)) + 1e-12)), 1)
rep = {'dur': len(mix) / SR, 'peak_dbfs': round(float(20 * np.log10(np.abs(mix).max())), 2),
       'rms_by_shot': {s_['id']: rms_db(s_['t0'], s_['t1']) for s_ in ST['shots']},
       'silence_max_abs': {f'{a:.2f}-{b2:.2f}': float(np.abs(mix[int(a * SR):int(b2 * SR)]).max()) for a, b2 in zones}}
json.dump({'mode': 'D shang (C D E G A), tonic D', 'marks': marks, 'selfcheck': rep}, open(f'{HERE}/score.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(rep, indent=1))
