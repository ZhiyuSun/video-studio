"""Mix for 龙场: narration + music/score.wav + foley synthesised by material (paper, ink, wood, stone, earth, water, fire) + ambience beds.
usage (from the library root): .venv/bin/python <project>/mix.py → <project>/mix.wav (48 kHz stereo; mux.sh brings it to −14 LUFS)"""
import sys, os, json, numpy as np, soundfile as sf, soxr
D = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar'); sys.path.insert(0, LIB)
from core.audio.sfx import SR, t_, noise, bp, lp, hp, brown, compress, limit, add
from scipy.ndimage import uniform_filter1d
ev = json.load(open(f'{D}/events.json')); DUR = ev['dur']; E = ev['ev']; N = int(DUR * SR)
rng = np.random.default_rng(5)

# ---------- foley ----------
def drip(v=1.):
    d = .35; t = t_(d); f = 1300 * np.exp(-t / .02) + 380
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .045) * .6 + lp(noise(d), 900) * np.exp(-t / .03) * .5) * v
def brush(d=.4, v=1.):          # brush on rice paper: band-passed bristle noise, soft swell
    t = t_(d); x = bp(noise(d), 900, 5000)
    grain = (rng.random(len(t)) < .015) * rng.standard_normal(len(t)) * 2
    return (x + bp(grain, 1500, 7000) * .35) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5 * v * .4
def feibai(v=1.):               # one fast dry stroke across the night: a tearing paper-and-bristle rush
    d = 1.0; t = t_(d)
    rush = bp(noise(d), 600, 8000) * np.exp(-((t - .18) / .14) ** 2) * 1.2
    tail = bp(noise(d), 2500, 9000) * np.exp(-t / .25) * (t > .2) * .4
    return (rush + tail) * v
def step(v=1.):                 # straw sandal on wet earth
    d = .25; t = t_(d)
    return (lp(noise(d), 700) * np.exp(-t / .03) + bp(noise(d), 1500, 4000) * np.exp(-t / .015) * .25) * v * .6
def chop(v=1.):                 # axe into wood: a hard knock + a split crack
    d = .6; t = t_(d)
    knock = np.sin(2 * np.pi * (180 + 300 * np.exp(-t / .006)) * t) * np.exp(-t / .05)
    crack = bp(noise(d), 1200, 6000) * np.exp(-t / .02) * .8
    wood = bp(noise(d), 300, 1200) * np.exp(-t / .09) * .4
    return (knock + crack + wood) * v
def fall(v=1.):                 # a body slumping: cloth + soft thud
    d = .9; t = t_(d)
    return (bp(noise(d), 300, 2500) * np.sin(np.pi * np.clip(t / .5, 0, 1)) * .4 + np.sin(2 * np.pi * 70 * t) * np.exp(-t / .12) * (t > .35)) * v
def seal(v=1.):
    d = .6; t = t_(d)
    return (np.sin(2 * np.pi * (110 + 80 * np.exp(-t / .01)) * t) * np.exp(-t / .08) + bp(noise(d), 600, 2400) * np.exp(-t / .012) * .6 + bp(noise(d), 3000, 9000) * np.exp(-t / .05) * .12) * v
def bloom(v=1.):                # ink spreading: a soft wet swell, no whoosh
    d = 1.2; t = t_(d)
    return lp(bp(noise(d), 200, 1800), 1500) * np.sin(np.pi * t / d) ** 2 * v * .5
def write(d=3., v=1.):          # pen on paper (today)
    t = t_(d); x = bp(noise(d), 2000, 7000) * (.5 + .5 * (np.sin(2 * np.pi * 3.1 * t) > 0))
    return x * np.sin(np.pi * t / d) * v * .2
def pour(v=1.):
    d = 2.2; t = t_(d)
    gl = sum(np.sin(2 * np.pi * (500 + 900 * t / d + 80 * k) * t + k) for k in range(3)) * .05
    return (bp(noise(d), 400, 3000) * .5 + gl) * np.sin(np.pi * t / d) * v
FX = dict(drip=drip, step=step, chop=chop, fall=fall, seal=seal, feibai=feibai, bloom=bloom, pour=pour)
PAN = dict(chop=-.25, seal=-.15, drip=.2)
fx = np.zeros((N, 2), np.float32); amb = np.zeros((N, 2), np.float32)
for e in E:
    k = e['type']; g = e.get('gain', 1)
    if k in FX: add(fx, FX[k](g).astype(np.float32), e['t'], .5, PAN.get(k, 0))
    elif k == 'brush': add(fx, brush(e.get('dur', .4) + .15, g).astype(np.float32), e['t'], .5, .1)
    elif k == 'write': add(fx, write(e.get('dur', 3), g).astype(np.float32), e['t'], .5, 0)
    elif k == 'amb':
        t0, t1 = e['t0'], e['t1']; d = t1 - t0; t = t_(d); kind = e['kind']
        if kind == 'rain': x = bp(noise(d), 1500, 9000) * .1 + lp(brown(d), 300) * .3
        elif kind == 'wind': x = lp(brown(d), 500) * (.6 + .4 * np.sin(2 * np.pi * t / 7.3)) * .5
        elif kind == 'leaves': x = bp(noise(d), 2500, 8000) * (.3 + .7 * np.clip(np.sin(2 * np.pi * t / 5.1), 0, 1) ** 2) * .07
        elif kind == 'water': x = bp(noise(d), 200, 1400) * (.5 + .5 * np.abs(np.sin(2 * np.pi * t / 2.9))) * .12
        elif kind == 'forest':
            x = lp(brown(d), 400) * .4
            for b_ in np.arange(.5, d - .5, 1.7): s = int(b_ * SR); L = int(.12 * SR); tt = np.arange(L) / SR; x[s:s + L] += np.sin(2 * np.pi * (2600 + 900 * np.sin(tt * 40)) * tt) * np.exp(-tt / .04) * .05
        elif kind == 'cave': x = lp(brown(d), 200) * .6
        elif kind == 'fire':
            x = lp(brown(d), 250) * .35
            for _ in range(int(d * 6)): s = int(rng.random() * (d - .05) * SR); L = int(.01 * SR); x[s:s + L] += bp(rng.standard_normal(L), 1500, 6000) * np.exp(-np.arange(L) / SR / .002) * (.2 + rng.random() * .5)
        elif kind == 'night':
            x = lp(brown(d), 200) * .2
            ch = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > .6) * (np.sin(2 * np.pi * .9 * t) > 0) * .02
            x = x + ch
        elif kind == 'city': x = lp(brown(d), 350) * .5 + bp(noise(d), 1800, 7000) * .03
        else: x = lp(brown(d), 300) * .4
        f = int(min(.8, d / 3) * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        add(amb, x.astype(np.float32), t0, .35, 0)

# ---------- narration ----------
vo = np.zeros((N, 2), np.float32); vmask = np.zeros(N)
for e in E:
    if e['type'] != 'vo': continue
    y, sr = sf.read(f"{D}/voices/{e['id']}.wav"); y = soxr.resample(y, sr, SR).astype(np.float32)
    y = y / np.abs(y).max() * .8; y = compress(y, thr=.22, ratio=3.2)
    add(vo, y, e['t'], 1.0, 0); s = int(e['t'] * SR); vmask[s:s + len(y)] = 1

# ---------- score ----------
mu, sr = sf.read(f'{D}/music/score.wav')
if sr != SR: mu = soxr.resample(mu, sr, SR)
mus = np.zeros((N, 2), np.float32); L = min(N, len(mu)); mus[:L] = mu[:L]
duck = 1 - .5 * np.clip(uniform_filter1d(vmask, int(.5 * SR)) * 1.6, 0, 1)
mus *= duck[:, None]; amb *= (1 - .6 * (1 - duck) / .5)[:, None]

def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
vo *= .16 / rms(vo[vmask > 0])
mus *= .085 / rms(mus[vmask == 0])          # music ≈ 9–10 dB under the voice where nobody speaks, ducked further under speech
mix = vo + mus + fx * .9 + amb * .8
for e in E:
    if e['type'] != 'silence': continue
    a, b = int(e['t0'] * SR), int(e['t1'] * SR); f = int(.02 * SR)
    mix[a - f:a] *= np.linspace(1, 0, f)[:, None]; mix[a:b] = 0
    # one sound may live in the silence: a drip
    for e2 in E:
        if e2['type'] == 'drip' and e['t0'] < e2['t'] < e['t1']: add(mix, (drip(e2.get('gain', 1)) * .5).astype(np.float32), e2['t'], 1, .2)
for c in range(2): mix[:, c] = limit(mix[:, c], .95)
sf.write(f'{D}/mix.wav', mix.astype(np.float32), SR)
db = lambda x: round(float(20 * np.log10(rms(x) + 1e-9)), 1)
print('mix.wav', mix.shape, 'peak', round(20 * np.log10(np.abs(mix).max()), 2), 'dBFS')
print('voice rms', db(vo[vmask > 0]), '| music under voice', db(mus[vmask > 0]), '| music alone', db(mus[vmask == 0]), '| amb', db(amb), '| fx', db(fx))
