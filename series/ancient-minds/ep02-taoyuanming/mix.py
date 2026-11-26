"""Mix for 归去来: narration + score (music/score.wav) + foley synthesised per material + ambience beds, driven by events.json.
Run: $LIB/.venv/bin/python mix.py  → mix.wav (48k stereo, not normalised; mux.sh does −14 LUFS)"""
import sys, os, json, numpy as np, soundfile as sf, soxr
LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, LIB)
from core.audio.sfx import SR, t_, noise, bp, lp, hp, brown, whoosh, compress, limit, add
from scipy.ndimage import uniform_filter1d
D = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(D, 'events.json'))); DUR = ev['dur']; E = ev['ev']
N = int(DUR * SR); rng = np.random.default_rng(11)

# ---------- foley, by material ----------
def oar(v=1.):        # a wooden pole in water: a soft push + small swirl
    d = .9; t = t_(d); return (bp(noise(d), 250, 1600) * np.sin(np.pi * np.clip(t / .7, 0, 1)) ** 2 * .6 + lp(brown(d), 300) * np.exp(-t / .3) * .5) * v
def brush(v=1., d=.5):  # brush on rice paper: band-passed air with bristle grain
    t = t_(d); x = bp(noise(d), 1200, 6500); g = (rng.random(len(t)) < .02) * rng.standard_normal(len(t)) * 2
    return (x + bp(g, 2000, 8000) * .4) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5 * v * .4
def seal(v=1.):       # wooden seal on paper
    d = .6; t = t_(d)
    return (np.sin(2 * np.pi * (110 + 80 * np.exp(-t / .01)) * t) * np.exp(-t / .08) + bp(noise(d), 600, 2400) * np.exp(-t / .012) * .6 + bp(noise(d), 3000, 9000) * np.exp(-t / .05) * .12) * v
def thud(v=1.):       # a heavy seal set down on a wooden desk
    d = 1.0; t = t_(d)
    return (np.sin(2 * np.pi * (70 + 90 * np.exp(-t / .012)) * t) * np.exp(-t / .16) * 1.2 + bp(noise(d), 300, 1800) * np.exp(-t / .02) * .5) * v
def jar(v=1.):        # an empty pottery jar: hollow knock with a ring
    d = 1.2; t = t_(d)
    return (sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in [(310, .6, .25), (640, .3, .15), (1180, .15, .08)]) + bp(noise(d), 800, 3000) * np.exp(-t / .01) * .4) * v
def lift(v=1.):       # ink lifting off paper: a long soft paper breath
    d = 3.0; t = t_(d); return bp(noise(d), 1500, 7000) * np.sin(np.pi * t / d) ** 2 * v * .35
def hoe(v=1.):        # iron into soil
    d = .5; t = t_(d); return (lp(brown(d), 600) * np.exp(-t / .06) * 2 + bp(noise(d), 1500, 5000) * np.exp(-t / .015) * .4) * v
def step(v=1.):       # footstep on earth / floor
    d = .25; t = t_(d); return (lp(noise(d), 700) * np.exp(-t / .03) + bp(noise(d), 1200, 4000) * np.exp(-t / .01) * .2) * v * .7
def collapse(v=1.):   # roof falling in: low rumble + crackle
    d = 3.0; t = t_(d); cr = (rng.random(len(t)) < .004) * rng.standard_normal(len(t))
    return (lp(brown(d), 600) * 2.2 * np.exp(-t / 1.2) * (1 - np.exp(-t / .08)) + bp(cr, 1500, 7000) * 3 * np.exp(-t / 1.4)) * v
def cup(v=1.):        # pottery cups
    d = .5; t = t_(d); return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in [(1850, .4, .09), (2760, .25, .06), (4100, .12, .04)]) * v
def tick(v=1.):
    d = .06; t = t_(d); return bp(noise(d), 2500, 7000) * np.exp(-t / .006) * v
def pen(v=1., d=1.):  # pen on paper: scratchy grains in bursts (one per character)
    t = t_(d); x = bp(noise(d), 2500, 9000) * (.4 + .6 * (np.sin(2 * np.pi * 3.5 * t) > 0)); return x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** .5 * v * .25
def pour(v=1., d=1.2):  # pouring water
    t = t_(d); x = bp(noise(d), 600, 3500) * (.7 + .3 * np.sin(2 * np.pi * 9 * t)); return x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** .4 * v * .3
FX = dict(oar=oar, brush=brush, seal=seal, thud=thud, jar=jar, lift=lift, hoe=hoe, step=step, collapse=collapse, cup=cup, tick=tick, pen=pen, pour=pour)
FXG = dict(oar=.35, brush=.5, seal=.7, thud=.9, jar=.5, lift=.6, hoe=.55, step=.3, collapse=.8, cup=.3, tick=.4, pen=.6, pour=.5)

fx = np.zeros((N, 2), np.float32); amb = np.zeros((N, 2), np.float32)
def bed(kind, d):
    t = t_(d)
    if kind == 'water': return bp(noise(d), 200, 1400) * (.5 + .5 * np.abs(np.sin(2 * np.pi * t / 2.9))) * .12
    if kind == 'wind': return lp(brown(d), 500) * (.6 + .4 * np.sin(2 * np.pi * t / 7.3)) * .5
    if kind == 'room': return lp(brown(d), 220) * .25
    if kind == 'birds':
        x = np.zeros(len(t))
        for k in range(int(d * 1.2)):
            s = int(rng.random() * (d - .5) * SR); L = int((.08 + rng.random() * .1) * SR); tt = np.arange(L) / SR; f0 = 2500 + rng.random() * 2000
            x[s:s + L] += np.sin(2 * np.pi * (f0 + 800 * np.sin(2 * np.pi * 14 * tt)) * tt) * np.sin(np.pi * tt / tt[-1]) * .05
        return x + lp(brown(d), 400) * .1
    if kind == 'insects': return bp(noise(d), 4200, 5200) * (.5 + .5 * (np.sin(2 * np.pi * 22 * t) > .3)) * .08 + lp(brown(d), 300) * .1
    if kind == 'fire': cr = (rng.random(len(t)) < .003) * rng.standard_normal(len(t)); return lp(brown(d), 400) * .6 + bp(cr, 1200, 6000) * 2.5
    if kind == 'city': return lp(brown(d), 260) * .35 + bp(noise(d), 300, 900) * .03
    if kind == 'rain': return bp(noise(d), 1500, 8000) * .12 + lp(noise(d), 600) * .05
    return np.zeros(len(t))
for e in E:
    k = e['type']
    if k in FX:
        g = e.get('gain', 1)
        if 't0' in e: x = FX[k](g, e['t1'] - e['t0']); at = e['t0']
        else: x = FX[k](g); at = e['t']
        add(fx, x.astype(np.float32), at, FXG[k], 0)
    elif k == 'amb':
        d = e['t1'] - e['t0']; x = bed(e['kind'], d) * e.get('gain', 1); f = int(min(1.0, d / 3) * SR)
        x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        add(amb, x.astype(np.float32), e['t0'], .35, 0)

# ---------- narration ----------
vo = np.zeros((N, 2), np.float32); vmask = np.zeros(N)
for e in E:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(D, 'voices', e['id'] + '.wav'))
    y = soxr.resample(y, sr, SR).astype(np.float32); y = y / np.abs(y).max() * .8
    y = compress(y, thr=.22, ratio=3.0)
    add(vo, y, e['t'], 1.0, 0); s = int(e['t'] * SR); vmask[s:s + len(y)] = 1

# ---------- score ----------
mu, sr = sf.read(os.path.join(D, 'music', 'score.wav'))
if sr != SR: mu = soxr.resample(mu, sr, SR)
mus = np.zeros((N, 2), np.float32); L = min(N, len(mu)); mus[:L] = mu[:L]
duck = 1 - .6 * np.clip(uniform_filter1d(vmask, int(.5 * SR)) * 1.6, 0, 1)
mus *= duck[:, None]; amb *= (1 - .6 * (1 - duck) / .6)[:, None]

def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
vo *= .16 / rms(vo[vmask > 0])
# music bed about 10 dB under the voice (measured where the voice is silent)
quiet = vmask[:L] == 0
mus *= (.16 / 3.2) / max(rms(mus[:L][quiet]), 1e-6)
mix = vo + mus + fx * .9 + amb * .8
for e in E:
    if e['type'] != 'silence': continue
    a, b = int(e['t0'] * SR), int(e['t1'] * SR); f = int(.02 * SR)
    mix[a - f:a] *= np.linspace(1, 0, f)[:, None]; mix[a:b] = 0
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
sf.write(os.path.join(D, 'mix.wav'), mix.astype(np.float32), SR)
db = lambda x: round(20 * np.log10(rms(x) + 1e-9), 1)
print('mix.wav', mix.shape, 'peak', round(20 * np.log10(np.abs(mix).max()), 2), 'dBFS', '| vo', db(vo[vmask > 0]), '| music under vo', db(mus[vmask > 0]), '| music alone', db(mus[:L][quiet]))
