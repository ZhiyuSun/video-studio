"""Original score for 定风波 (苏轼在黄州): guqin (physical model) + xiao (low-passed flute samples, with breath),
frame drum, bass drum, timpani, small gong. Yu-mode pentatonic on A. Written to the shot times in story.json.
Run: $LIB/.venv/bin/python music/score.py  → music/score.wav (48 kHz stereo)"""
import sys, os, json, numpy as np, soundfile as sf
LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, LIB)
from core.audio import sampler as S, pluck as P
from core.audio.sfx import SR, lp, hp, noise, bp
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
st = json.load(open(f'{D}/story.json')); DUR = st['dur']
SH = {s['id']: s for s in st['shots']}; VO = {v['id']: v for v in st['vo']}
N = int((DUR + 4) * SR); out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(5)

def put(y, t, g=1., pan=0.):
    if y is None or t < 0: return
    a = int(t * SR); b = min(N, a + len(y)); y = y[:b - a] * g
    out[a:b, 0] += y * np.sqrt(.5 * (1 - pan)); out[a:b, 1] += y * np.sqrt(.5 * (1 + pan))

SC = ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5']
def qin(deg, t, g=1., harm=False, vel=.7, pan=-.15, **kw):
    put(P.pluck('guqin', SC[deg], vel=vel, harmonic=harm, **kw), t, g, pan)
def xiao(pitch, t, d, g=1., pan=.2):
    y = S.note('flute', pitch, d, vel=.55, attack=.25, release=.9)
    y = lp(y, 2600) + lp(hp(noise(len(y) / SR), 1500), 5000) * .012 * np.minimum(1, np.arange(len(y)) / (SR * .3))
    put(y.astype(np.float32), t, g * .9, pan)
def drum(kind, t, g=1., pan=0.): put(S.hit('frame_drum', kind, vel=.7), t, g, pan)
def gong(t, g=1.): put(S.hit('gong2', 'small', vel=.6), t, g, .1)
T0 = lambda k: SH[k]['t0']; T1 = lambda k: SH[k]['t1']; V = lambda k: VO[k]['t']

# ---------- 1 rain: scattered guqin, a harmonic when he walks on unhurried ----------
rainA = [(0, 8), (1.1, 7), (2.4, 5), (4.2, 8), (5.0, 9), (6.6, 7)]          # (beat offset s, degree)
for start in [1.0, 9.5, 19.0, 30.5]:
    for dt, dg in rainA: qin(dg, start + dt, .8, vel=.55 + .1 * rng.random())
qin(10, T0('rainwalk') + 7.6, 1, harm=True)
qin(13, V('L05') + .2, .9, harm=True); qin(10, V('L05') + 4.6, .8, harm=True)
for dt in [0, 1.6, 3.4]: qin(5 - int(dt), T0('small') + 1 + dt * 1.6, .7, vel=.5)
gong(T0('drop') + .55, .9)
put(P.strum('guqin', ['A2', 'E3', 'A3', 'E4'], 6, vel=.6, spread=.08), T0('title') + .3, .9)
qin(15, T0('title') + 3.4, .7, harm=True)

# ---------- 2 the fall: drum roll, slow low pulse, xiao for the lone goose ----------
put(S.hit('gran_cassa', 'roll', vel=.6), T0('prison') - .4, .7)
for k in range(5): put(S.hit('timpani', 0, vel=.5), T0('prison') + 2 + k * 3.4, .6)
for k in range(int((T1('river') - T0('river')) / 2.2)):
    qin(0 if k % 2 == 0 else 3, T0('river') + k * 2.2, .7, vel=.5, pan=-.3)
    if k % 2 == 1: qin([8, 7, 5, 7, 9, 8][(k // 2) % 6], T0('river') + k * 2.2 + 1.1, .55, vel=.45)
for p, t, d in [('E4', T0('temple') + 1.5, 4.5), ('D4', T0('temple') + 6.5, 4), ('A4', T0('goose') + .5, 3.8), ('G4', T0('goose') + 4.5, 2.6), ('E4', T0('goose') + 7.2, 4.5)]: xiao(p, t, d, .8)

# ---------- 3 the Cold Food poems: fewer and fewer notes, then nothing ----------
for k, (dt, dg) in enumerate([(1, 5), (5, 3), (9.5, 4), (15, 2), (21, 1)]): qin(dg, T0('hut') + dt, .7 - k * .07, vel=.45)
for dt, dg in [(1, 2), (9, 1), (17, 0)]: qin(dg, T0('despair') + dt, .6, vel=.4)
# (hush: whole bus silent — handled in mix.py)

# ---------- 4 the ink is lifted: a sweep, then light harmonics ----------
put(P.strum('guqin', ['A2', 'D3', 'E3', 'A3', 'D4', 'E4', 'A4'], 7, vel=.65, spread=.11), T0('lift') + .4, .9)
for dt, dg in [(7, 12), (11, 10), (15, 13)]: qin(dg, T0('lift') + dt, .6, harm=True)

# ---------- 5 the three things: a steady pulse that builds (♩=60) ----------
mel = [8, 7, 5, 7, 8, 10, 9, 8, 7, 5, 4, 5, 7, 8, 7, 5]
t = T0('paper') + .5; i = 0
while t < T0('chibi') - 1:
    sec = 'paper' if t < T0('sit') else 'sit' if t < T0('coins') else 'coins' if t < T0('farm') else 'farm' if t < T0('acts') else 'acts'
    lvl = {'paper': .5, 'sit': .45, 'coins': .6, 'farm': .75, 'acts': .8}[sec]
    if i % 2 == 0: qin(0 if (i // 8) % 2 == 0 else 2, t, .7 * lvl + .2, vel=.5, pan=-.35)
    if sec != 'sit' or i % 4 == 0:
        if i % 2 == 1 or sec in ('farm', 'acts'): qin(mel[i % 16], t + (.5 if sec in ('farm', 'acts') and i % 2 == 0 else 0), .55 * lvl + .15, vel=.45 + .2 * lvl)
    if sec in ('farm', 'acts'): drum('small' if i % 2 else 'large_muted', t, .35 * lvl, .1)
    if sec == 'coins' and i % 4 == 2: drum('small_muted', t, .25)
    t += 1.0; i += 1
qin(13, T0('acts') + .4, .7, harm=True)
for k in range(4): qin([12, 10, 13, 15][k], V('L47') + k * 2.2, .7, harm=True)

# ---------- 6 the Red Cliff: xiao (the guest) and guqin harmonics (Su) answering ----------
for p, dt, d in [('A4', 1.5, 3.5), ('G4', 5.2, 2.2), ('E4', 7.6, 4.5), ('D4', 12.5, 3), ('E4', 15.8, 5)]: xiao(p, T0('chibi') + dt, d, .75)
g = V('L50')
for p, dt, d in [('C5', 0, 2), ('A4', 2.1, 1.6), ('G4', 3.8, 3), ('E4', 7.2, 4.5)]: xiao(p, g + dt, d, .9)
for k, dg in enumerate([10, 12, 13, 10, 12, 15]): qin(dg, T0('reply') + .6 + k * 3.4, .7, harm=True, pan=.3)
for k in range(10): qin([0, 3, 5, 3][k % 4], T0('pull') + k * 3.2, .55, vel=.45, pan=-.3)
put(P.strum('guqin', ['A2', 'E3', 'A3', 'C4', 'E4', 'A4', 'C5'], 8, vel=.7, spread=.13), V('L59') + 3.4, 1.0)
for dt, dg in [(1, 13), (4.5, 12), (7.5, 10)]: qin(dg, T0('dawn') + dt, .65, harm=True)

# ---------- 7 back in the rain: the rain motif, then one long harmonic when it stops ----------
for start in [T0('rainback') + 1, T0('rainback') + 10]:
    for dt, dg in rainA: qin(dg, start + dt, .75, vel=.55)
q = V('L63'); qd = VO['L63']['d']
xiao('A4', q + qd * .55, 6, .7)
qin(15, q + qd * .62, .9, harm=True)
for dt, dg in [(3, 8), (6, 7), (10, 5)]: qin(dg, T0('prints') + dt, .6, vel=.45)
end = VO['L68']['t'] + VO['L68']['d']
qin(10, end + 1.0, 1, harm=True); qin(5, end + 3.8, .6, harm=True)

y = S.room(out, size=.7, mix=.28)
y = y[:N] if len(y) >= N else np.pad(y, ((0, N - len(y)), (0, 0)))
pk = np.abs(y).max(); y = y * (.8 / pk)
sf.write(f'{D}/music/score.wav', y.astype(np.float32), SR)
print('score.wav', round(len(y) / SR, 1), 's')
