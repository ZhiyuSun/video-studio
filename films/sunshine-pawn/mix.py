# 《典当》 mix: score (music/score.wav) + ambience beds + event foley (events.json, exported from the page) → out/mix.wav
# Usage: $LIB/.venv/bin/python mix.py   (LIB = the lemo-opuscar library, for core/audio/sfx.py)
import sys, os, json, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import *

E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR))
tt = np.arange(N) / SR
rng = np.random.default_rng(2077)
BPM = 92; BEAT = 60 / BPM; BAR = 4 * BEAT
bar = lambda n: n * BAR

def curve(keys):
    k = np.array(keys, float); return np.interp(tt, k[:, 0], k[:, 1])
def st(x, pan=0.0):
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l * 1.414, x * r * 1.414], 1)
def full(d): x = noise(DUR); return x

# —— ambience ——
T_SHOP0, T_IMPACT, T_HUSH, T_DOOR, T_HUSH2, T_POWER, T_TITLE = bar(5), bar(11) + BEAT, bar(12.5), bar(13), bar(15.5), bar(16), bar(22)
# rain: outdoors full, indoors muffled, silent in the hush, far away in the brown-out
rain_out = curve([(0, .55), (bar(2), .5), (bar(5) - .1, .5), (bar(5), 0), (T_DOOR - .45, 0), (T_DOOR, .6), (T_HUSH2, .55), (T_HUSH2 + .3, .12), (T_POWER, .12),
                  (T_POWER + .6, .32), (T_TITLE, .32), (T_TITLE + .5, .4), (DUR - .6, .35), (DUR, 0)])
rain_in = curve([(0, 0), (bar(5) - .1, 0), (bar(5), .5), (T_HUSH - .05, .5), (T_HUSH, 0), (DUR, 0)])
rn = hp(lp(noise(DUR), 7500), 250) * .16
drops = np.zeros(N); idx = rng.integers(0, N, 7000); drops[idx] = rng.uniform(.2, 1, len(idx)); drops = bp(drops, 1800, 9000) * 1.4
plastic = np.zeros(N); idx = rng.integers(0, int(bar(2) * SR), 300); plastic[idx] = rng.uniform(.3, 1, len(idx)); plastic = bp(plastic, 900, 4000) * 2.2   # rain on the coat
rain = (rn + drops) * rain_out
rain_m = lp(rn + drops, 700) * 1.6 * rain_in
amb = st(rain * .8, -.3) + st(np.roll(rain, 4801) * .8, .3) + st(rain_m) + st(plastic * curve([(0, .4), (bar(2), .4), (bar(2) + .1, 0), (DUR, 0)]))
city = lp(brown(DUR), 300) * .14 * curve([(0, .3), (bar(2), .5), (bar(5), .4), (bar(5) + .1, 0), (T_DOOR, 0), (T_DOOR + .3, .35), (T_HUSH2, .35), (T_HUSH2 + .4, .05), (T_POWER, .05), (T_POWER + 1, .25), (DUR, .15)])
wind = bp(noise(DUR), 300, 1500) * (.6 + .4 * np.sin(2 * np.pi * .3 * tt)) * .3 * curve([(0, 0), (bar(2), .1), (bar(2) + .4, .6), (bar(4), .5), (bar(5), 0), (DUR, 0)])
# the shop's electric hum: taken away at the impact
hum = (np.sin(2 * np.pi * 50 * tt) * .5 + np.sin(2 * np.pi * 100 * tt) * .3 + bp(noise(DUR), 2000, 4000) * .05) * .05 * curve([(0, 0), (bar(5), 0), (bar(5) + .1, 1), (T_IMPACT, 1), (T_IMPACT + .02, 0), (DUR, 0)])
# crowd murmur under the screen
mur = sum(bp(noise(DUR), f * .8, f * 1.2) * (.5 + .5 * np.sin(2 * np.pi * (1.3 + k * .7) * tt + k)) for k, f in enumerate([300, 520, 800, 1300]))
mur = mur * .09 * curve([(0, 0), (T_POWER + .8, 0), (T_POWER + 2.5, .7), (bar(19), .5), (bar(19) + .5, .25), (bar(20.5), .25), (bar(20.5) + .5, .8), (T_TITLE, .7), (T_TITLE + .6, 0), (DUR, 0)])
amb += st(city) + st(wind, -.4) + st(np.roll(wind, 7001), .4) + st(hum) + st(mur, -.2) + st(np.roll(mur, 12001), .2)

# —— foley ——
def tone(f, d, tau, v=1.0): return np.sin(2 * np.pi * f * t_(d)) * env_exp(d, tau) * v
def beep(v=1.0): d = .08; return (tone(2400, d, .03) + tone(4800, d, .01) * .3) * np.minimum(1, t_(d) / .002) * v
def crton(v=1.0):
    d = 1.2; x = lp(noise(.08), 400) * env_exp(.08, .02)
    wh = np.sin(2 * np.pi * 15600 * t_(d)) * .05 * np.minimum(1, t_(d) / .3) * env_exp(d, .9)
    out = wh.copy(); out[:len(x)] += x * 1.2; return out * v
def crtoff(v=1.0):
    d = .5; f = 3000 * np.exp(-t_(d) / .08) + 80
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .15) * .5 + np.pad(lp(noise(.05), 600) * env_exp(.05, .01), (0, int(.45 * SR)))[:int(d * SR)]) * v
def flyby(v=1.0):
    d = 1.6; u = t_(d) / d; f = 900 * (1.25 - .5 * u)
    x = bp(noise(d), 400, 3000) * .6 + np.sin(2 * np.pi * np.cumsum(f) / SR) * .3
    return norm(x * np.sin(np.pi * u) ** 3) * v
def neon(d, v=1.0):
    x = np.sign(np.sin(2 * np.pi * 120 * t_(d))) * .2 + bp(noise(d), 3000, 8000) * .3
    pat = np.array([1, 0, 1, 1, 0, 0, 1, 1, 1]); fl = pat[np.minimum(len(pat) - 1, (t_(d) * 12).astype(int))]
    cr = np.zeros_like(x); ii = rng.integers(0, len(x), 30); cr[ii] = 1; cr = hp(cr, 2000) * 3
    return lp(x * fl + cr, 6000) * v * .6
def door(v=1.0, bell_=False):
    x = creak(.5)[:int(.5 * SR)] * .5
    x = np.pad(x, (0, int(.9 * SR)))
    if bell_:
        for k, (f, at) in enumerate([(1320, .05), (1760, .2)]):
            b = tone(f, .9, .3) + tone(f * 2.7, .9, .08) * .3; s = int(at * SR); x[s:s + len(b)] += b[:len(x) - s] * .5
    return x * v
def rustle(d=.4, v=1.0): return norm(bp(noise(d), 800, 5000) * np.sin(np.pi * t_(d) / d) ** 2 * (1 + .5 * np.sin(2 * np.pi * 31 * t_(d)))) * v
def plug(v=1.0): return norm(click(.6) + np.pad(tone(5200, .05, .01), (int(.012 * SR), 0))[:len(click(.6))] * .4) * v
def static(d, v=1.0): return hp(noise(d), 1500) * .5 * v
def lens(v=1.0):
    d = .35; f = 1400 + 2200 * t_(d) / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 * np.sin(np.pi * t_(d) / d) * (1 + .5 * np.sign(np.sin(2 * np.pi * 40 * t_(d)))) * v
def waves(d, lofi=0, v=1.0):
    x = lp(brown(d), 1100) * (.4 + .6 * np.sin(2 * np.pi * .16 * t_(d) + 1) ** 2) + hp(noise(d), 3000) * .08 * np.sin(2 * np.pi * .16 * t_(d) + 1) ** 4
    x *= np.minimum(1, t_(d) / .6) * np.minimum(1, (d - t_(d)) / .4)
    if lofi: x = bp(x, 380, 2800) * 1.8
    return x * .5 * v
def roll(d, v=1.0):
    x = np.zeros(int(d * SR));
    for k in range(int(d / .045)): s = int(k * .045 * SR); c = tone(3200 + (k % 3) * 400, .02, .004); x[s:s + len(c)] += c[:len(x) - s]
    return x * .4 * v
def ding2(v=1.0): return np.concatenate([tone(1568, .14, .06), tone(2093, .7, .2)]) * .5 * v
def impact(v=1.0): return norm(thump(1, 55) + np.pad(hp(noise(.04), 1500) * env_exp(.04, .008), (0, len(thump(1, 55)) - int(.04 * SR)))) * v
def flash(v=1.0): d = .6; return hp(noise(d), 4000) * env_exp(d, .15) * .5 * v
def drain(d, v=1.0):
    f = 1400 * np.exp(-t_(d) / (d * .35)) + 60
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .4 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * .2
    nz = np.concatenate([bp(noise(d / 4), 300 + 1500 * (1 - k / 4), 600 + 3000 * (1 - k / 4)) for k in range(4)])[:len(x)]
    nz = np.pad(nz, (0, len(x) - len(nz)))
    return (x + nz * .5) * np.minimum(1, t_(d) / .05) * (1 - t_(d) / d) * v
def wetstep(v=1.0): return norm(step(1) * .6 + np.pad(bp(noise(.12), 500, 3000) * env_exp(.12, .03), (0, 0))[:len(step(1))]) * v
def brownout(d, v=1.0):
    f = 120 * np.exp(-t_(d) / d)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 * (1 - t_(d) / d)
    cr = np.zeros_like(x); ii = rng.integers(0, len(x), 40); cr[ii] = 1; cr = hp(cr, 1500) * 3
    return lp(x + cr, 5000) * v
def powerup(v=1.0):
    d = 2.2; f = 40 + 80 * np.minimum(1, t_(d) / .9)
    hm = (np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.minimum(1, t_(d) / .3) * np.exp(-np.maximum(0, t_(d) - .8) / .6)
    th = np.pad(thump(1, 45), (int(.6 * SR), 0))[:int(d * SR)]
    th = np.pad(th, (0, int(d * SR) - len(th)))
    wh = np.sin(2 * np.pi * 14800 * t_(d)) * .04 * (t_(d) > .6)
    return (hm * .5 + th * .8 + wh) * v
def glint(v=1.0): return (tone(3520, 1.2, .3) + tone(5274, 1.2, .2) * .5 + tone(7040, 1.2, .1) * .3) * .3 * v

fx = np.zeros((N, 2))
for ev in E['ev']:
    ty, t, v, d = ev['type'], ev['t'], ev.get('v', 1.0), ev.get('d', 1.0)
    if ty == 'beep': add(fx, beep(v), t, .25, .1)
    elif ty == 'crton': add(fx, crton(), t, .5)
    elif ty == 'crtoff': add(fx, crtoff(), t, .45)
    elif ty == 'whoosh': add(fx, whoosh(.8, 1), t, .3 * v)
    elif ty == 'flyby': add(fx, flyby(v), t, .35, -.6 if t < 8 else .6)
    elif ty == 'neon': add(fx, neon(d), t, .35, -.3)
    elif ty == 'door': add(fx, door(1, ev.get('bell', 0)), t, .45 * v)
    elif ty == 'cable': add(fx, rustle(.5), t, .3)
    elif ty == 'click': add(fx, plug(), t, .6, .3)
    elif ty == 'static': add(fx, static(d), t, .25)
    elif ty == 'lens': add(fx, lens(), t, .35, -.4)
    elif ty == 'waves': add(fx, waves(d, ev.get('lofi', 0), v), t, .35 if ev.get('lofi') else .45)
    elif ty == 'roll': add(fx, roll(d), t, .4, -.4)
    elif ty == 'ding': add(fx, ding(1), t, .3, -.4)
    elif ty == 'impact': add(fx, impact(), t, .8)
    elif ty == 'flash': add(fx, flash(), t, .5)
    elif ty == 'drain': add(fx, drain(d), t, .45)
    elif ty == 'ding2': add(fx, ding2(), t, .35)
    elif ty == 'step': add(fx, wetstep(v), t, .35, (rng.random() - .5) * .2)
    elif ty == 'brownout': add(fx, brownout(d), t, .4)
    elif ty == 'powerup': add(fx, powerup(), t, .7)
    elif ty == 'cloth': add(fx, rustle(.45, v), t, .35, .2)
    elif ty == 'glint': add(fx, glint(), t, .5, .3)

score, sr = sf.read(os.path.join(HERE, 'music/score.wav'), always_2d=True)
assert sr == SR
score = np.pad(score, ((0, max(0, N - len(score))), (0, 0)))[:N]
# ambience ducked ~3 dB under the full score sections
duck = curve([(0, 1), (T_POWER + .4, 1), (T_POWER + 1, .7), (T_TITLE + 2, .7), (DUR, .9)])
mixd = score * .62 + amb * duck[:, None] + fx * .9
# true silence in the hush, apart from nothing
mixd[(tt >= T_HUSH) & (tt < T_DOOR - .45)] = 0
mixd = np.stack([limit(compress(mixd[:, c], .5, 2.0), .95) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out/mix.wav'), mixd.astype(np.float32), SR, subtype='FLOAT')
print('mix.wav', round(DUR, 3), 's, peak', round(float(np.abs(mixd).max()), 3))
