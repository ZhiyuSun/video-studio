"""Mix for 定风波: narration + score (music/score.wav) + synthesised foley and ambience beds, driven by events.json.
Run: $LIB/.venv/bin/python mix.py  → mix.wav (48k stereo, not normalised; mux.sh does −14 LUFS)"""
import sys, os, json, numpy as np, soundfile as sf, soxr
LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, LIB)
from core.audio.sfx import SR, t_, noise, bp, lp, hp, brown, thump, clack, creak, click, compress, limit, add
from scipy.ndimage import uniform_filter1d
D = os.path.dirname(os.path.abspath(__file__))
ev = json.load(open(os.path.join(D, 'events.json'))); DUR = ev['dur']; E = ev['ev']
N = int(DUR * SR); rng = np.random.default_rng(11)
rms = lambda x: np.sqrt(np.mean(np.square(x)) + 1e-12)
fx = np.zeros((N, 2)); amb = np.zeros((N, 2))

def env(n, a=.4, r=.6):
    e = np.ones(n); A = min(n // 2, int(a * SR)); R = min(n // 2, int(r * SR))
    e[:A] = np.linspace(0, 1, A); e[n - R:] = np.linspace(1, 0, R); return e
_brown, _noise, _t = brown, noise, t_
def bed(kind, d):
    n = int(d * SR); L = []
    fit = lambda x: np.pad(x, (0, max(0, n - len(x))))[:n]
    brown = lambda d: fit(_brown(d)); noise = lambda d: fit(_noise(d)); t_ = lambda d: fit(_t(d))
    for ch in range(2):
        if kind == 'rain':
            x = bp(noise(d), 700, 7000) * .05 + lp(brown(d), 400) * .02
            drops = np.zeros(n); idx = rng.integers(0, n, int(d * 60)); drops[idx] = rng.uniform(.2, 1, len(idx))
            x += hp(np.convolve(drops, np.exp(-np.arange(200) / 30), 'same'), 2000) * .05
        elif kind == 'water':
            x = lp(brown(d), 500) * .06 * (.7 + .3 * np.sin(2 * np.pi * .23 * t_(d)[:n] + ch))
            x += bp(noise(d), 300, 1400) * .006 * (.5 + .5 * np.sin(2 * np.pi * .41 * t_(d)[:n] + 1.3 * ch)) ** 4
        elif kind == 'night':
            x = lp(brown(d), 300) * .03
            ck = np.zeros(n)
            for s in rng.uniform(0, d, int(d / 2.5)):
                a = int(s * SR); m = min(n - a, int(.18 * SR)); tt = np.arange(m) / SR
                ck[a:a + m] += np.sin(2 * np.pi * 4300 * tt) * (np.sin(2 * np.pi * 38 * tt) > 0) * np.exp(-tt * 9) * .006
            x += ck
        elif kind == 'field':
            x = lp(brown(d), 600) * .025
            for s in rng.uniform(0, d, int(d / 7)):
                a = int(s * SR); m = min(n - a, int(.12 * SR)); tt = np.arange(m) / SR
                x[a:a + m] += np.sin(2 * np.pi * (2600 + 1600 * tt / .12) * tt) * np.exp(-tt * 30) * .012
        elif kind == 'fire':
            x = lp(brown(d), 300) * .02; pops = np.zeros(n); idx = rng.integers(0, n, int(d * 9)); pops[idx] = rng.uniform(.3, 1, len(idx))
            x += bp(np.convolve(pops, np.exp(-np.arange(300) / 40) * rng.standard_normal(300), 'same'), 900, 6000) * .05
        L.append(fit(x))
    return np.stack(L, 1)

def M(*xs):   # sum arrays of different lengths
    n = max(len(x) for x in xs); y = np.zeros(n)
    for x in xs: y[:len(x)] += x
    return y
def burst(x, d, k): n = int(d * SR); x = np.pad(x, (0, max(0, n - len(x))))[:n]; return x * np.exp(-np.arange(n) / SR * k)
def one(kind, g):
    if kind == 'staff': return M(thump(.6, 90) * .6, burst(hp(noise(.12), 1500), .12, 40) * .08)
    if kind == 'splash': return burst(bp(noise(.18), 800, 6000), .18, 25) * .12
    if kind == 'drip':
        tt = np.arange(int(1.2 * SR)) / SR; return np.sin(2 * np.pi * (1500 - 500 * np.minimum(tt, .05) / .05) * tt) * np.exp(-tt * 7) * .25
    if kind == 'seal': return M(thump(.8, 60) * .9, burst(bp(noise(.2), 300, 3000), .2, 20) * .08)
    if kind == 'clank':
        tt = np.arange(int(2 * SR)) / SR; y = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * k) for f, k in [(220, 2), (587, 3), (933, 4)]) * .06
        c = clack(.8); y[:len(c)] += c * .5; return y
    if kind == 'door': y = np.zeros(int(1.6 * SR)); c = creak(.8); y[:len(c)] += c * .5; th = thump(.7, 80); y[-len(th):] += th * .7; return y
    if kind == 'crow':
        tt = np.arange(int(.7 * SR)) / SR; car = np.sin(2 * np.pi * (650 + 120 * np.sin(2 * np.pi * 7 * tt)) * tt)
        e = (np.exp(-((tt - .12) / .07) ** 2) + np.exp(-((tt - .45) / .08) ** 2))
        return bp(car * (1 + rng.standard_normal(len(tt)) * .6), 500, 2500) * e * .18
    if kind == 'brush': n = int(.35 * SR); return hp(rng.standard_normal(n), 2500) * np.sin(np.pi * np.arange(n) / n) ** 2 * .05
    if kind == 'coins':
        y = np.zeros(int(.8 * SR))
        for k in range(6): c = click(1.8 + rng.random(), .6); a = int(rng.uniform(0, .5) * SR); y[a:a + len(c)] += c[:len(y) - a] * .4
        return y
    if kind == 'hoe': return M(thump(.6, 70) * .5, burst(lp(noise(.25), 1200), .25, 18) * .1)
    return None

for e in E:
    if e['type'] == 'amb':
        d = e['t1'] - e['t0']; b = bed(e['kind'], d) * env(int(d * SR), 1.2, 1.5)[:, None] * e.get('gain', 1)
        a = int(e['t0'] * SR); m = min(N - a, len(b)); amb[a:a + m] += b[:m]
    elif e['type'] not in ('vo', 'silence'):
        y = one(e['type'], e.get('gain', 1))
        if y is not None: add(fx, y * e.get('gain', 1), e['t'], 1.0, rng.uniform(-.3, .3))

# narration
vo = np.zeros(N)
for e in E:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(D, 'voices', e['id'] + '.wav'), dtype='float32')
    if y.ndim > 1: y = y.mean(1)
    if sr != SR: y = soxr.resample(y, sr, SR)
    a = int(e['t'] * SR); m = min(N - a, len(y)); vo[a:a + m] += y[:m]
vo = compress(vo, .3, 2.5) * (.2 / max(rms(vo[np.abs(vo) > .01]), 1e-6))

mus, sr = sf.read(os.path.join(D, 'music', 'score.wav'), dtype='float32')
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
# duck music and beds under the voice (~8 dB)
vmask = uniform_filter1d((np.abs(vo) > .02).astype(float), int(.5 * SR)) > .05
duck = uniform_filter1d(np.where(vmask, .4, 1.0), int(.3 * SR))
mus = mus * 1.6 * duck[:, None]; amb = amb * (.55 + .45 * duck)[:, None]
mix = mus + amb + fx * .9 + np.stack([vo, vo], 1)
for e in E:
    if e['type'] == 'silence':
        a, b = int(e['t0'] * SR), int(e['t1'] * SR); f = int(.25 * SR)
        mix[a - f:a] *= np.linspace(1, 0, f)[:, None]; keep = fx[a:b].copy(); mix[a:b] = keep * .9
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
sf.write(os.path.join(D, 'mix.wav'), mix.astype(np.float32), SR)
db = lambda x: round(20 * np.log10(rms(x) + 1e-9), 1)
print('mix.wav', mix.shape, 'peak', round(20 * np.log10(np.abs(mix).max()), 2), '| vo', db(vo[vmask]), '| music under vo', db(mus[vmask]), '| music alone', db(mus[~vmask]))
