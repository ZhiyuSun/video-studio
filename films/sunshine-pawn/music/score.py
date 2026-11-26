# -*- coding: utf-8 -*-
"""《典当》SUNSHINE PAWN — original score, synthesised from scratch with numpy + numba.
Instrument kernels adapted from the lemo-opuscar cel-anime-80s demo (FM e-piano, slap bass, gated snare, synth brass, pad, FM bell).

92 BPM, 4/4, 24 bars = 62.61 s. One timeline with story.js (bar n starts at n * BAR):
  bar 0–2    cold open: low pad on Bm9, sparse FM e-piano
  bar 2–5    descent: pad + e-piano 16th arpeggio, kick from bar 4
  bar 5–6    shop: near silence (room hum in the mix)
  bar 6–11   "the memory song" from the little CRT: lead + slap bass + e-piano + light drums, band-passed 380–2800 Hz
  bar 11+1b  impact: one brass hit full range, the song is cut; tail out by 12.5
  bar 12.5–13  true silence
  bar 13–15.5  street: one low pad, very quiet; stops at 15.5 (near silence)
  bar 16–19  the song opens to full range, a semitone up (E♭): swell, then groove with the hook
  bar 19–20.5  the hand: drums drop out, only e-piano + the hook, close and small
  bar 20.5–22  the faces: full band, louder, crash
  bar 22     title: brass hit, then e-piano + bells, final maj9 rings to the end
Run: $LIB/.venv/bin/python music/score.py  →  music/score.wav (48 kHz stereo)
"""
import os, numpy as np, soundfile as sf
from numba import njit
from scipy.signal import butter, sosfilt, fftconvolve

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
BPM = 92
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 24 * BAR
N = int(round(DUR * SR))
rng = np.random.default_rng(2077)
def T(bar, beat=0.0): return (bar * 4 + beat) * BEAT

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def ts(n): return np.arange(n) / SR
def noise(n): return rng.standard_normal(n)


def _sos(kind, f, o): return butter(o, f, kind, fs=SR, output='sos')
def lp(x, f, o=2): return sosfilt(_sos('low', f, o), x, axis=0)
def hp(x, f, o=2): return sosfilt(_sos('high', f, o), x, axis=0)
def bp(x, lo, hi, o=2): return sosfilt(_sos('band', [lo, hi], o), x, axis=0)


# ───────────────────────── DSP kernels (numba) ─────────────────────────
@njit(cache=True)
def svf(x, fc, res, mode):
    """TPT state-variable filter, per-sample cutoff. mode 0=low-pass 1=band-pass 2=high-pass"""
    n = x.shape[0]; y = np.empty(n); ic1 = 0.0; ic2 = 0.0; k = 1.0 / res
    for i in range(n):
        f = fc[i]
        if f > 20000.0: f = 20000.0
        if f < 20.0: f = 20.0
        g = np.tan(np.pi * f / 48000.0)
        a1 = 1.0 / (1.0 + g * (g + k)); a2 = g * a1; a3 = g * a2
        v3 = x[i] - ic2; v1 = a1 * ic1 + a2 * v3; v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2
        if mode == 0: y[i] = v2
        elif mode == 1: y[i] = v1
        else: y[i] = x[i] - k * v1 - v2
    return y


@njit(cache=True)
def ks_loop(exc, L, P, damp, bright):
    """Karplus-Strong: loop of delay P + averaging filter with adjustable brightness"""
    y = np.zeros(L)
    for i in range(L):
        v = exc[i] if i < exc.shape[0] else 0.0
        if i > P:
            v += damp * (bright * y[i - P] + (1 - bright) * 0.5 * (y[i - P] + y[i - P - 1]))
        elif i == P:
            v += damp * y[0]
        y[i] = v
    return y


@njit(cache=True)
def env_follow(x, att, rel):
    n = x.shape[0]; e = np.empty(n); s = 0.0
    a = np.exp(-1.0 / (att * 48000.0)); r = np.exp(-1.0 / (rel * 48000.0))
    for i in range(n):
        v = x[i]
        if v > s: s = a * s + (1 - a) * v
        else: s = r * s + (1 - r) * v
        e[i] = s
    return e


def saw(freq, phase0=0.0):
    """PolyBLEP band-limited sawtooth; freq may be a per-sample array"""
    dt = np.asarray(freq, dtype=float) / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m = ph < dt; x = ph[m] / dt[m]; y[m] -= x + x - x * x - 1
    m = ph > 1 - dt; x = (ph[m] - 1) / dt[m]; y[m] -= x * x + x + x + 1
    return y


def adsr(dur, a, d, s, r):
    n = int((dur + r) * SR); t = ts(n)
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    ig = min(int(dur * SR), n - 1); v = e[ig]
    return np.where(t < dur, e, v * np.exp(-(t - dur) / (r / 4.6)))


def make_ir(dur, rt60, predelay=0.02, damp=3500, seed=1, early=True):
    n = int(dur * SR); t = ts(n); r = np.random.default_rng(seed)
    dec = np.exp(-6.9 * t / rt60); out = []
    for c in range(2):
        x = r.standard_normal(n) * dec
        dark = lp(x, damp, 1); w = np.clip(t / (rt60 * .45), 0, 1)
        x = x * (1 - w) * .6 + dark * w
        x[:int(.003 * SR)] *= np.linspace(0, 1, int(.003 * SR))
        if early:
            for k in range(6):
                d = int((0.007 + 0.011 * k + r.random() * .006) * SR); x[d] += (0.5 - k * .06) * (1 if r.random() > .5 else -1) * 8
        out.append(np.concatenate([np.zeros(int(predelay * SR)), x]))
    ir = np.stack(out, 1); return ir / np.sqrt((ir ** 2).sum(0).mean())


IR_HALL = make_ir(2.6, 1.9, .024, 3800, 11)
IR_PLATE = make_ir(1.1, 0.9, .006, 6500, 12, early=False)

# ───────────────────────── instruments ─────────────────────────


def epiano(m, dur, vel=0.7):
    """DX7-style FM electric piano: 1:1 carrier pair (body of the tone, modulation index decays over time) + 14:1 bell transient"""
    f = mtof(m); rel = 0.22; n = int((dur + rel) * SR); t = ts(n)
    tau = 1.2 * (262 / f) ** .5 + .35
    rel_env = np.where(t < dur, 1.0, np.exp(-(t - dur) / .06))
    amp = np.exp(-t / tau) * rel_env * np.minimum(1, t / .0015)
    I1 = vel * 1.5 * np.exp(-t / .5) + .3 * vel
    ph = 2 * np.pi * f * t; ph2 = 2 * np.pi * f * 1.0015 * t
    body = .62 * np.sin(ph + I1 * np.sin(ph)) + .38 * np.sin(ph2 + .7 * I1 * np.sin(ph2))
    tine = np.sin(ph + 2.2 * vel * np.exp(-t / .016) * np.sin(14 * ph)) * np.exp(-t / .11) * .3 * vel * rel_env
    return (body * amp + tine) * vel


def bass(m, dur, vel=.8, kind='T'):
    """Additive slap bass: higher harmonics decay faster (the natural filtering of a plucked string) + pitch drop on attack + string-slap noise"""
    f0 = mtof(m); rel = .025; n = int((dur + rel) * SR); t = ts(n)
    P = dict(T=(1.1, .30, 1.0, .03, .5), P=(.8, .12, .8, .045, .9), D=(.045, .9, 1.5, 0, .7), F=(1.8, .7, 1.5, .01, .1))[kind]
    base_tau, kk, tilt, drop, click = P
    ph = 2 * np.pi * np.cumsum(f0 * (1 + drop * np.exp(-t / .009))) / SR
    y = np.zeros(n); nh = int(min(46, 9000 / f0))
    for k in range(1, nh + 1):
        y += np.sin(k * ph + .37 * k) / k ** tilt * np.exp(-t / (base_tau / (1 + kk * k ** 1.15)))
    y /= 2.2
    cl = hp(noise(n), 2500) * np.exp(-t / .0022) * click
    env = np.minimum(1, t / .0012) * np.where(t < dur, 1, np.exp(-(t - dur) / .01))
    return np.tanh(1.5 * (y + cl) * env) * vel


def kick(vel=1.0):
    n = int(.42 * SR); t = ts(n)
    f = 50 + 85 * np.exp(-t / .028) + 380 * np.exp(-t / .0025)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .15) + hp(noise(n), 3000) * np.exp(-t / .004) * .22
    return np.tanh(1.4 * y) * vel


def _gate(n, hold, fall=.018):
    t = ts(n); return np.where(t < hold, 1.0, np.clip(1 - (t - hold) / fall, 0, 1))


def snare(vel=1.0, gate=.26):
    """Gated-reverb snare: dry + plate reverb, the reverb tail is cut by a hard gate at ~260 ms"""
    n = int(.6 * SR); t = ts(n)
    tone = np.sin(2 * np.pi * np.cumsum(190 * (1 + .12 * np.exp(-t / .01))) / SR) * np.exp(-t / .05) * .6 \
        + np.sin(2 * np.pi * 335 * t) * np.exp(-t / .03) * .3
    nz = bp(noise(n), 1200, 9000) * np.exp(-t / .1) * .9 + hp(noise(n), 5500) * np.exp(-t / .03) * .3
    dry = tone + nz
    wet = np.stack([fftconvolve(dry, IR_PLATE[:, c])[:n] for c in range(2)], 1)
    g = _gate(n, gate)[:, None]
    return (dry[:, None] * .8 + wet * 1.1 * g) * vel


def tom(f, vel=1.0):
    n = int(.55 * SR); t = ts(n)
    dry = np.sin(2 * np.pi * np.cumsum(f * (1 + .6 * np.exp(-t / .018))) / SR) * np.exp(-t / .22) + bp(noise(n), 300, 4000) * np.exp(-t / .03) * .3
    wet = np.stack([fftconvolve(dry, IR_PLATE[:, c])[:n] for c in range(2)], 1)
    return (dry[:, None] * .9 + wet * .9 * _gate(n, .24)[:, None]) * vel


HAT_F = np.array([205.3, 304.4, 369.6, 522.7, 540.0, 800.0]) * 2.1


def hat(vel=1.0, open_=False):
    n = int((.5 if open_ else .09) * SR); t = ts(n)
    x = sum(np.sign(np.sin(2 * np.pi * f * t + i)) for i, f in enumerate(HAT_F)) / 6
    x = hp(bp(x, 6000, 16000) + hp(noise(n), 8000) * .5, 6000)
    return x * np.exp(-t / (.13 if open_ else .017)) * vel


def crash(vel=1.0, dur=2.6):
    n = int(dur * SR); t = ts(n); out = []
    for c in range(2):
        x = hp(noise(n), 3500) + .5 * bp(sum(np.sign(np.sin(2 * np.pi * f * 1.37 * t + c)) for f in HAT_F), 3000, 12000)
        out.append(x * np.exp(-t / 1.1) * np.minimum(1, t / .002))
    return np.stack(out, 1) * vel * .5


def clap(vel=1.0):
    n = int(.3 * SR); t = ts(n); e = np.zeros(n)
    for k, d in enumerate([0, .009, .018, .03]):
        s = int(d * SR); e[s:] += np.exp(-(t[:n - s]) / (.006 if k < 3 else .09))
    return bp(noise(n), 900, 3500) * e * vel * .6


def tamb(vel=1.0):
    n = int(.12 * SR); t = ts(n)
    x = hp(noise(n), 7000) + .4 * sum(np.sin(2 * np.pi * f * t) for f in (5200, 6900, 8300))
    return x * np.exp(-t / .045) * vel


def boom(vel=1.0):
    n = int(.9 * SR); t = ts(n)
    return np.sin(2 * np.pi * np.cumsum(38 + 45 * np.exp(-t / .12)) / SR) * np.exp(-t / .35) * np.minimum(1, t / .004) * vel


def brass(m, dur, vel=.8, bright=1.0, att=.012):
    """Synth brass: 3 detuned PolyBLEP saws + pitch drop on attack (scoop) + filter-envelope swell + delayed vibrato"""
    f = mtof(m); rel = .14; n = int((dur + rel) * SR); t = ts(n)
    scoop = 2 ** ((-.3 * np.exp(-t / .035)) / 12)
    vib = 1 + .0035 * np.sin(2 * np.pi * 5.3 * t) * np.clip((t - .35) / .3, 0, 1)
    y = sum(saw(f * 2 ** (d / 1200) * scoop * vib, rng.random()) for d in (-8, 0, 7)) / 3
    fe = np.where(t < att + .03, np.minimum(1, t / (att + .03)), .5 + .5 * np.exp(-(t - att - .03) / .25))
    fe = np.where(t < dur, fe, fe[min(int(dur * SR), n - 1)] * np.exp(-(t - dur) / .05))
    fc = f * 1.3 + (1200 + 5.5 * f) * bright * (.35 + .65 * vel) * fe
    y = svf(y, fc, .85, 0)
    return y * adsr(dur, att, .3, .78, rel)[:n] * vel


def pad(m, dur, vel=.5):
    f = mtof(m); rel = .9; n = int((dur + rel) * SR); t = ts(n)
    y = sum(saw(f * 2 ** (d / 1200) * (1 + .0015 * np.sin(2 * np.pi * .31 * t + d)), rng.random()) for d in (-12, -4, 4, 12)) / 4
    y = lp(y, 2400, 2)
    return y * adsr(dur, .45, .6, .85, rel)[:n] * vel


def gtr(m, dur, vel=.7, mute=False):
    """Karplus-Strong electric guitar: pick-noise excitation, high damping for muted strums"""
    f = mtof(m); P = int(round(SR / f - .5)); L = int((dur + .06) * SR)
    exc = lp(noise(P), 2500 + 3500 * vel, 1) * vel
    y = ks_loop(exc, L, P, .975 if mute else .9965, .15 if mute else .35)
    t = ts(L); env = np.where(t < dur, 1, np.exp(-(t - dur) / .012))
    if mute: y = lp(y, 2200, 1)
    return y * env


def bell(m, dur=2.8, vel=.5):
    f = mtof(m); n = int(dur * SR); t = ts(n)
    I = 2.6 * vel * np.exp(-t / .3) + .25
    y = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * 3.5 * f * t)) * np.exp(-t / .95) \
        + .25 * np.sin(2 * np.pi * 2.001 * f * t) * np.exp(-t / .4)
    return y * np.minimum(1, t / .002) * vel


def riser(dur, vel=1.0, f0=250, f1=7000):
    n = int(dur * SR); t = ts(n); u = t / dur
    fc = f0 * (f1 / f0) ** (u ** 1.6)
    y = svf(noise(n), fc, 2.2, 1) * (u ** 2.2)
    return y * vel



# ───────────────────────── score ─────────────────────────
STEMS = ['drums', 'bass', 'keys', 'pad', 'lead', 'brass', 'fx']
BUS = {k: np.zeros((N, 2)) for k in STEMS}
SEND = {k: np.zeros(N) for k in STEMS}
SEND_AMT = dict(drums=.05, bass=0, keys=.22, pad=.35, lead=.3, brass=.22, fx=.5)

def place(bus, sig, t, gain=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N: return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        st = np.stack([sig * l, sig * r], 1)
    else: st = sig
    st = st[:N - i] * gain
    BUS[bus][i:i + len(st)] += st
    SEND[bus][i:i + len(st)] += st.mean(1) * SEND_AMT[bus]

hum = lambda: rng.normal(0, .004)
# chords in D: IVM7 – V7 – iii7 – vi7 (one per bar), as (root midi for bass, chord tones for keys)
PROG = [(43, [59, 62, 66, 69]), (45, [61, 64, 67, 71]), (42, [57, 61, 64, 69]), (47, [57, 62, 66, 69])]   # GM7 A7 F#m7 Bm7
COLD = (47, [57, 61, 62, 66])   # Bm9-ish
HOOK = [  # (beat, midi, beats) per bar of the 4-bar phrase
  [(0, 69, 1), (1, 71, .5), (1.5, 74, 1.5), (3, 71, .5), (3.5, 69, .5)],
  [(0, 73, 1.5), (1.5, 71, .5), (2, 69, 1), (3, 66, 1)],
  [(0, 69, 1), (1, 66, .5), (1.5, 64, 1), (2.5, 66, .5), (3, 69, 1)],
  [(0, 71, 2.5), (3, 69, .5), (3.5, 66, .5)],
]
HOOK_END = [(0, 74, 3.5)]

def keys_bar(b, ch, up=0, vel=.45):
    for bt, d in [(0, 1.4), (2.5, 1.4)]:
        for k, m in enumerate(ch): place('keys', epiano(m + up, d * BEAT, vel * (.9 + .1 * k)), T(b, bt) + hum() + k * .006, .5, (k - 1.5) * .25)
def bass_bar(b, root, up=0, vel=.7):
    for bt, m, kind, d in [(0, root, 'T', .9), (1.5, root + 12, 'P', .4), (2, root, 'T', .45), (3, root + 7, 'T', .45), (3.5, root + 12, 'P', .4)]:
        place('bass', bass(m + up, d * BEAT, vel, kind), T(b, bt) + hum(), .6, 0)
def drums_bar(b, vel=1.0, hats=True, kick_only=False):
    for bt in (0, 2.5): place('drums', kick(vel), T(b, bt), .8)
    if kick_only: return
    for bt in (1, 3): place('drums', snare(vel * .8), T(b, bt) + hum(), .55)
    if hats:
        for k in range(8): place('drums', hat(vel * (.5 if k % 2 else .8)), T(b, k * .5) + hum(), .35, .3)
def hook_bar(b, phrase, up=0, vel=.7, bright=.55):
    for bt, m, d in phrase: place('lead', brass(m + up, d * BEAT * .95, vel, bright=bright, att=.03), T(b, bt) + hum(), .5, -.1)
def arp_bar(b, ch, up=0, vel=.3):
    tones = sorted(ch) + [sorted(ch)[1] + 12]
    for k in range(16): place('keys', epiano(tones[k % len(tones)] + 12 + up, .22, vel * (1 if k % 4 == 0 else .7)), T(b, k * .25), .35, ((k % 4) - 1.5) * .3)

# A · cold open
place('pad', np.stack([sum(pad(m, 2 * BAR + .5, .35) for m in [47, 54, 57, 61])] * 2, 1), T(0), .55)
for bt, m in [(0.5, 66), (3, 69), (5.5, 73), (7, 71)]: place('keys', epiano(m, 1.6, .35), T(0, bt), .4, .2)
# B · descent
for b in range(2, 5):
    r, ch = [(43, [59, 62, 66, 69]), (40, [55, 59, 62, 66]), (45, [57, 61, 64, 67])][b - 2]
    place('pad', np.stack([sum(pad(m, BAR + .3, .32) for m in ch)] * 2, 1), T(b), .5)
    arp_bar(b, ch, vel=.22 + .06 * (b - 2))
    place('bass', bass(r, BAR * .9, .5, 'D'), T(b), .45)
    if b == 4: drums_bar(4, .7, hats=False, kick_only=True)
# C · the memory song on the shop CRT (bars 6–11, band-passed below)
for b in range(6, 11):
    r, ch = PROG[(b - 6) % 4]
    keys_bar(b, ch); bass_bar(b, r); drums_bar(b, .8)
    if b >= 7: hook_bar(b, HOOK[(b - 7) % 4] if b < 10 else HOOK[2])
r, ch = PROG[1]; keys_bar(11, ch); bass_bar(11, r)
# D · impact: brass hit full range
IMPACT = T(11, 1)
for m in [62, 66, 69, 74]: place('brass', brass(m, .9, 1.0, 1.4, .006), IMPACT, .5)
place('drums', boom(1.0), IMPACT, .9); place('drums', crash(.8), IMPACT, .7)
# E · street: one low pad, very quiet, stops at 15.5
place('pad', np.stack([sum(pad(m, 2.5 * BAR, .22) for m in [47, 54, 59]), sum(pad(m, 2.5 * BAR, .22) for m in [47, 54, 62])], 1), T(13), .4)
# F · the reveal: a semitone up
UP = 1
place('pad', np.stack([sum(pad(m + UP, BAR * 1.5, .4) for m in [55, 59, 62, 66])] * 2, 1), T(16), .6)
for k, m in enumerate([74, 78, 81, 86]): place('fx', bell(m + UP, 2.4, .35), T(16, 1 + k * .5), .35, (k - 1.5) * .4)
for b in range(16, 19):
    r, ch = PROG[(b - 16) % 4]
    keys_bar(b, ch, UP, .5); bass_bar(b, r, UP, .75)
    if b >= 17: drums_bar(b, .9); hook_bar(b, HOOK[(b - 17) % 4], UP, .78, .75)
    else: drums_bar(b, .7, hats=False, kick_only=True)
# the hand (bars 19–20.5): drums out, e-piano + hook only
for b in (19, 20):
    r, ch = PROG[(b - 16) % 4]
    keys_bar(b, ch, UP, .4)
    place('bass', bass(r + UP, BAR * .9, .45, 'D'), T(b), .4)
hook_bar(19, HOOK[3], UP, .6, .45); hook_bar(20, [(0, 69, 1.5)], UP, .55, .4)
# the faces (bars 20.5–22): full band back, louder
place('drums', crash(1.0), T(20, 2), .8)
for k in range(4): place('drums', tom(140 - k * 18, .9), T(20, 1 + k * .25), .6)
r, ch = PROG[0]
for bt in (2, 2.5): place('drums', kick(1.0), T(20, bt), .8)
for b in (21,):
    r, ch = PROG[(b - 21) % 4]
    keys_bar(b, ch, UP, .55); bass_bar(b, r, UP, .85); drums_bar(b, 1.0)
    hook_bar(b, HOOK[0], UP, .9, .95)
hook_bar(20, [(2, 69, .5), (2.5, 71, .5), (3, 74, 1)], UP, .85, .9)
for m in [62, 66, 69, 73]: place('brass', brass(m + UP, BAR * .9, .55, .8), T(21), .35)
# G · title: brass hit, then the final chord rings
for m in [62, 66, 69, 74, 78]: place('brass', brass(m + UP, 1.1, 1.0, 1.3, .006), T(22), .45)
place('drums', crash(.9, 3.0), T(22), .7); place('drums', boom(.9), T(22), .8)
FIN = [50, 57, 61, 64, 66, 69]   # DM9 (+1 → E♭M9)
for k, m in enumerate(FIN): place('keys', epiano(m + UP, 4.6, .5), T(22, 1.5) + k * .03, .5, (k - 2.5) * .2)
place('pad', np.stack([sum(pad(m + UP, 4.0, .35) for m in [50, 57, 61, 66])] * 2, 1), T(22, 1.5), .5)
for k, m in enumerate([81, 78, 74, 69, 74]): place('fx', bell(m + UP, 2.6, .32), T(22, 3 + k * .75), .3, (k - 2) * .35)

# ───────── master: reverb, the CRT band-pass, the cut, the silences ─────────
mix = sum(BUS[k] for k in STEMS)
send = sum(SEND[k] for k in STEMS)
rev = np.stack([fftconvolve(send, IR_HALL[:, c])[:N] for c in range(2)], 1) * .35
full = mix + rev
tt = np.arange(N) / SR
def seg(a, b): return np.clip((tt - a) / (b - a), 0, 1)
# bars 5.9–11+1b: the song comes out of the CRT's little speaker
lofi = np.stack([bp(full[:, c], 380, 2800, 2) for c in range(2)], 1)
lofi = np.tanh(lofi.mean(1, keepdims=True) * 1.8).repeat(2, 1) * .9
inC = ((tt >= T(5, 3)) & (tt < IMPACT))[:, None]
out = np.where(inC, lofi, full)
# the cut at the impact: everything before it stops dead; the brass hit + crash ring out to 12.5
hit = BUS['brass'] + BUS['drums']
hit_rev = np.stack([fftconvolve(SEND['brass'] + SEND['drums'], IR_HALL[:, c])[:N] for c in range(2)], 1) * .35
after = (tt >= IMPACT) & (tt < T(13))
out[after] = (hit + hit_rev)[after] * (1 - seg(T(12), T(12.5)))[after][:, None]
# true silence 12.5–13, the street pad stops at 15.5 (near silence until the screen)
out[(tt >= T(12.5)) & (tt < T(13))] = 0
fade = 1 - seg(T(15.25), T(15.5))
streetz = (tt >= T(13)) & (tt < T(16))
out[streetz] *= fade[streetz][:, None]
# end: ring out, fade the last half second
out *= (1 - seg(DUR - .6, DUR))[:, None]
out /= np.abs(out).max() / .89
sf.write(os.path.join(HERE, 'score.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('score.wav', round(DUR, 3), 's, peak', round(float(np.abs(out).max()), 3))
