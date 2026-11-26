#!/usr/bin/env python3
"""《星尘》 v3 score — an analog-synthesizer score (Vangelis / Jóhannsson lineage), every sample computed here.
Usage (run from films/next-frame): python3 audio/score.py [out.wav]"""
import numpy as np, os, sys, json, subprocess, shutil
from scipy.signal import butter, sosfilt, fftconvolve, lfilter
from scipy.io import wavfile
import pyloudnorm as pyln

SR = 48000
DUR = 293.0
N = int(SR * DUR)
rng = np.random.default_rng(3)
BUS = {k: [np.zeros((2, N)) for _ in range(3)] for k in 'AB'}   # A before the cut into the drop, B after
CUT_AB = 171.95

# ---------------------------------------------------------------- helpers
NN = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def midi(s):
    b = NN[s[0]]; i = 1
    if s[i] == 'b': b -= 1; i += 1
    elif s[i] == '#': b += 1; i += 1
    return 12 * (int(s[i:]) + 1) + b
def hz(s): return s if not isinstance(s, str) else 440.0 * 2 ** ((midi(s) - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR * .45), 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, min(b, SR * .45)], 'band', fs=SR, output='sos'), x)
def adsr(n, a, d, s, r, total=None):
    total = total if total is not None else n / SR
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1.0)
    dec = np.clip((t - a) / max(d, 1e-4), 0, 1); e = np.where(t > a, 1 - (1 - s) * dec, e)
    rel = np.clip((total - t) / max(r, 1e-4), 0, 1)
    return e * np.minimum(1, rel)

def _add(sig, t0, pan=0.0, gain=1.0, send=0.25, cath=0.0):
    i0 = int(t0 * SR)
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        sig = np.vstack([sig * l, sig * r]) * np.sqrt(2)
    if i0 < 0: sig = sig[:, -i0:]; i0 = 0
    n = min(sig.shape[1], N - i0)
    if n <= 0: return
    s = sig[:, :n] * gain
    dry, wet, cat = BUS['A' if t0 < CUT_AB else 'B']
    dry[:, i0:i0 + n] += s; wet[:, i0:i0 + n] += s * send; cat[:, i0:i0 + n] += s * cath
def M3(t):
    if t < 28: return None          # v3 pencil + opening chat: gone
    if t < 191: return t - 14       # singularity .. night planet
    if t < 211: return None         # v3 drop: gone
    if t < 250: return t + 11       # return, new star
    if t < 274: return None         # v3 closing chat: gone
    return t - 1                    # reveal
def M4(T):   # forge trimmed by 5s at 93..98
    if T < 93: return T
    if T < 98: return T - 5 if T >= 96 else None
    return T - 5
def add(sig, t0, *a, **k):
    m = M3(t0)
    if m is not None: m = M4(m)
    if m is not None: _add(sig, m, *a, **k)

# ---------------------------------------------------------------- oscillators & filters
def blep(ph, dt):
    r = np.zeros_like(ph)
    m = ph < dt; x = ph[m] / dt[m]; r[m] = x + x - x * x - 1
    m2 = ph > 1 - dt; x = (ph[m2] - 1) / dt[m2]; r[m2] = x * x + x + x + 1
    return r
def saw_f(freq_arr, ph0=0.0):
    dt = freq_arr / SR
    ph = np.mod(np.cumsum(dt) + ph0, 1.0)
    return 2 * ph - 1 - blep(ph, dt)
def square_f(freq_arr, ph0=0.0, pw=0.5):
    a = saw_f(freq_arr, ph0); b = saw_f(freq_arr, ph0 + pw)
    return (a - b) * 0.5

def rbj_lp(fc, Q):
    w = 2 * np.pi * fc / SR; al = np.sin(w) / (2 * Q); c = np.cos(w)
    b = np.array([(1 - c) / 2, 1 - c, (1 - c) / 2]); a = np.array([1 + al, -2 * c, 1 - al])
    return b / a[0], a / a[0]
def varlp(x, cut, Q=0.9, block=256):
    """time-varying resonant low-pass; cut is an array (Hz) the length of x"""
    y = np.zeros_like(x); zi = np.zeros(2)
    for i in range(0, len(x), block):
        fc = float(np.clip(cut[min(i, len(cut) - 1)], 30, SR * .45))
        b, a = rbj_lp(fc, Q)
        y[i:i + block], zi = lfilter(b, a, x[i:i + block], zi=zi)
    return y

def detune(c): return 2 ** (c / 1200)

# ---------------------------------------------------------------- voices
def supersaw(notes, d, amp=1.0, att=2.0, rel=3.0, cut0=600, cut1=2400, lfo=0.07, spread=14, voices=7, Q=0.8):
    t = tt(d); out = np.zeros((2, len(t)))
    for nm in notes:
        f = hz(nm)
        for v in range(voices):
            c = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
            drift = 1 + 0.0008 * np.sin(2 * np.pi * (0.11 + v * .037) * t + v)
            out[v % 2] += saw_f(np.full(len(t), f * detune(c)) * drift, rng.random())
    sweep = cut0 + (cut1 - cut0) * np.clip(t / max(att * 1.5, .1), 0, 1) ** 1.5
    cut = sweep * (1 + 0.25 * np.sin(2 * np.pi * lfo * t))
    out = np.vstack([varlp(out[0], cut, Q), varlp(out[1], cut * 1.03, Q)])
    return out * adsr(len(t), att, .5, .9, rel, d) * amp / (len(notes) * voices) * 2.2

def brass(notes, d, amp=1.0, att=.14, rel=1.6, bright=2800, vib=True, bend=-45):
    """CS-80 style: two detuned saws per note, pitch swell, delayed vibrato, filter envelope."""
    t = tt(d); out = np.zeros((2, len(t)))
    bendc = bend * np.exp(-t / .12)
    vibc = (12 * np.sin(2 * np.pi * 5.4 * t) * np.clip((t - .55) / .8, 0, 1)) if vib else 0
    for k, nm in enumerate(notes):
        f = hz(nm)
        for c, dt_ in enumerate((-7, 7)):
            fr = f * detune(dt_ + bendc + vibc)
            out[c] += saw_f(fr, rng.random()) + .35 * square_f(fr * .5, rng.random())
    fenv = np.clip(t / att, 0, 1) * (1 - .45 * np.clip((t - att) / .9, 0, 1))
    cut = 280 + bright * fenv
    out = np.vstack([varlp(out[0], cut, 1.15), varlp(out[1], cut * 1.02, 1.15)])
    return np.tanh(out * .9) * adsr(len(t), att * .7, .4, .85, rel, d) * amp / len(notes) * .6

def pluck(nm, d=.6, amp=1.0, cut=4200, dec=.18):
    f = hz(nm); t = tt(d)
    s = saw_f(np.full(len(t), f), rng.random()) * .7 + square_f(np.full(len(t), f * detune(5)), rng.random()) * .5
    c = 220 + cut * np.exp(-t / dec)
    return varlp(s, c, 1.6) * np.exp(-t / (dec * 2.2)) * amp * .5

def bell(nm, d=6.0, amp=1.0, ratio=3.5, idx=2.2, bright=1.0):
    f = hz(nm); t = tt(d)
    I = idx * bright * np.exp(-t * 2.2)
    s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t)) * np.exp(-t * .9)
    s += .4 * np.sin(2 * np.pi * f * 2 * t + .5 * np.exp(-t * 3) * np.sin(2 * np.pi * f * t)) * np.exp(-t * 1.6)
    s *= np.minimum(1, t / .002)
    return s * amp * .35

def organ(notes, d, amp=1.0, att=1.2, rel=3.0):
    t = tt(d); out = np.zeros((2, len(t)))
    parts = [(.5, .45), (1, 1), (2, .6), (3, .28), (4, .3), (6, .12), (8, .14)]
    lfo = 1 + .0018 * np.sin(2 * np.pi * .8 * t)
    for nm in notes:
        f = hz(nm)
        for p, a in parts:
            for c, dt_ in enumerate((-1.5, 1.5)):
                out[c] += a * np.sin(2 * np.pi * np.cumsum(np.full(len(t), f * p * detune(dt_)) * lfo) / SR + rng.random() * 6)
    return out * adsr(len(t), att, .3, 1, rel, d) * amp / (len(notes) * 3)

def vox(notes, d, amp=1.0, att=2.5, rel=3.0):
    F = [(700, 1.0, 90), (1100, .5, 100), (2650, .2, 140)]
    t = tt(d); src = np.zeros((2, len(t)))
    for nm in notes:
        f = hz(nm)
        for v in range(8):
            lf = 1 + .005 * np.sin(2 * np.pi * (4.6 + v * .27) * t + v * 1.7)
            src[v % 2] += saw_f(f * detune((v - 3.5) * 4) * lf, rng.random())
    out = np.zeros_like(src)
    for fc, g, bw in F:
        for c in range(2): out[c] += g * bp(src[c], fc - bw, fc + bw, 2)
    return out * adsr(len(t), att, .5, 1, rel, d) * amp * 2.6 / (len(notes) * 8)

def sub(nm, d, amp=1.0, att=.02, rel=1.0):
    f = hz(nm); t = tt(d)
    s = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 2 * f * t)
    return np.tanh(s * 1.3) * adsr(len(t), att, .2, .9, rel, d) * amp * .6

def drone(nm, d, amp=1.0):
    f = hz(nm); t = tt(d)
    s = sum(a * np.sin(2 * np.pi * f * h * detune(c) * t + rng.random() * 6) for h, a, c in ((1, 1, 0), (1, .6, 6), (2, .4, -4), (3, .2, 3), (4, .1, 0)))
    s = s * (1 + .15 * np.sin(2 * np.pi * .13 * t))
    return s * adsr(len(t), min(4, d / 3), .1, 1, min(4, d / 3), d) * amp * .5

def taiko(d=2.5, amp=1.0, f0=95, f1=48):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.0)
    s += lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 30) * .5
    return np.tanh(s * 1.6) * amp

def kick(amp=1.0):
    t = tt(.6); f = 42 + 120 * np.exp(-t * 35)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) + hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 120) * .15
    return np.tanh(s * 1.4) * amp

def impact(d=7.0, amp=1.0):
    t = tt(d)
    s1 = np.sin(2 * np.pi * np.cumsum(26 + 60 * np.exp(-t * 2.5)) / SR) * np.exp(-t * .8)
    nz = lp(rng.standard_normal(len(t)), 2400) * np.exp(-t * 5) * .6
    crack = hp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 35) * .35
    return np.tanh((s1 * 1.4 + nz + crack) * 1.2) * amp

def riser(d, amp=1.0, f0=200, f1=6000):
    t = tt(d); n = rng.standard_normal(len(t)); cut = f0 * (f1 / f0) ** (t / d)
    y = varlp(n, cut, 2.5)
    return y * (t / d) ** 2.2 * amp * 1.5

def heartbeat(amp=1.0):
    t = tt(.9); s = np.zeros(len(t))
    for o, a in ((0, 1), (.22, .65)):
        x = np.clip(t - o, 0, None)
        s += a * (t >= o) * np.sin(2 * np.pi * (40 + 32 * np.exp(-x * 30)) * x) * np.exp(-x * 13)
    return lp(s, 180) * amp

def key(amp=1.0):
    t = tt(.08)
    c = bp(rng.standard_normal(len(t)), 1800 + rng.random() * 1500, 6500) * np.exp(-t * 300)
    b = np.sin(2 * np.pi * (180 + rng.random() * 60) * t) * np.exp(-t * 90) * .5
    return (c + b) * amp * (0.6 + rng.random() * .5)

def chime(amp=1.0, f=1568):
    t = tt(1.6); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + .4 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t * 8)) * amp

def noise_bed(d, amp, lo, hi):
    t = tt(d); return bp(rng.standard_normal(len(t)), lo, hi) * adsr(len(t), min(2, d / 3), .1, 1, min(2, d / 3), d) * amp

def shimmer(notes, d, amp=1.0):
    t = tt(d); out = np.zeros((2, len(t)))
    for k, nm in enumerate(notes):
        f = hz(nm)
        for c in range(2):
            out[c] += np.sin(2 * np.pi * f * detune((c - .5) * 6) * t + k) * (.55 + .45 * np.sin(2 * np.pi * (.6 + k * .31) * t + c))
    return out * adsr(len(t), d * .3, .1, 1, d * .4, d) * amp / len(notes)

def tape_delay(x, time, fb=.45, n=6, cut=3500, pingpong=True):
    """stereo feedback delay with darkening repeats"""
    if x.ndim == 1: x = np.vstack([x, x]) * .7
    D = int(time * SR); out = x.copy(); rep = x.copy()
    for k in range(1, n + 1):
        rep = np.vstack([lp(rep[0], cut), lp(rep[1], cut)]) * fb
        sh = np.zeros_like(x); sh[:, D * k:] = rep[:, :x.shape[1] - D * k] if D * k < x.shape[1] else 0
        if pingpong and k % 2: sh = sh[::-1]
        out = out + sh
    return out
def pad_len(sig, extra):  # extend for delay tails
    return np.hstack([sig, np.zeros((sig.shape[0], int(extra * SR)))]) if sig.ndim == 2 else np.hstack([sig, np.zeros(int(extra * SR))])

# ---------------------------------------------------------------- timeline data
shutil.copy('src/shots.js', '/tmp/shots.mjs')
J = json.loads(subprocess.check_output(['node', '-e', "import('/tmp/shots.mjs').then(m=>console.log(JSON.stringify(m)))"]))
CARDS = J['CARDS']; CHAT_OPEN = []; CHAT_CLOSE = []; HUMAN = J['HUMAN']; TOKENS = J['TOKENS']
KID_CPS, AI_CPS = 8.0, 22.0

def kid_keys(mm, t0):
    chars = len(mm['zh'])
    if 'typo' in mm:
        i = mm['typo'][0]
        times = [(k + 1) / KID_CPS for k in range(i)] + [(i + 1) / KID_CPS, (i + 3.2) / KID_CPS] + [(i + 5.2 + k) / KID_CPS for k in range(chars - i)]
    else: times = [(k + 1) / KID_CPS for k in range(chars)]
    for x in times: _add(key(.26), t0 + mm['t'] + x + rng.random() * .02, rng.uniform(-.25, .25), 1, .1)
def ai_keys(mm, t0):
    _add(chime(.045, 1318), t0 + mm['t'], .1, 1, .5)
    for k in range(len(mm['zh'])): _add(key(.06), t0 + mm['t'] + (k + 1) / AI_CPS, .2, 1, .1)

# ================================================================ THE SCORE
# --- S00 cold open (0–10): paper, pencil, the dot, the push into graphite
scr = rng.standard_normal(int(4.0 * SR)); tsc = tt(4.0)
speed = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 1.3 * tsc))
grain = (rng.random(len(tsc)) < 0.004).astype(float) * rng.random(len(tsc))
scratch = (bp(scr, 2500, 7500) * .5 + lp(grain, 4000) * 3) * speed * adsr(len(tsc), .15, .1, 1, .3, 4.0)
add(scratch, 0.8, -.1, .12, .05)
add(key(.5) * 1.5, 5.02, -.05, 1, .15)
add(noise_bed(10, .006, 60, 600), 0.1, 0, 1, 0)
add(riser(2.4, .06, 150, 1500), 5.3, 0, 1, .4)
add(supersaw(['D3', 'A3', 'E4'], 4.0, .18, att=1.2, rel=1.6, cut0=300, cut1=900), 7.4, 0, 1, .5, .3)
add(bell('A5', 4, .22), 8.6, .1, 1, .6, .4)

# --- S01 conversation (10–28)
add(noise_bed(18, .006, 60, 900), 10, 0, 1, 0)
for msg in CHAT_OPEN: (kid_keys if msg['w'] == 'k' else ai_keys)(msg, 10.0)
add(drone('D2', 12, .05), 16.0, 0, 1, .3)
add(supersaw(['D3', 'F3', 'A3', 'E4'], 8, .10, att=4, rel=2, cut0=250, cut1=700), 20.0, 0, 1, .5, .3)

# --- S02 singularity (28–40): heartbeats accelerating, filter-swell cluster, the suck into the bang
BEATS = [0.8, 2.88, 4.8, 6.48, 7.92, 9.12, 10.04, 10.72, 11.2, 11.56]
for i, b in enumerate(BEATS): add(heartbeat(.95 + i * .05), 28 + b, 0, 1, .15)
add(supersaw(['D2', 'A2', 'Eb3', 'D4', 'E4'], 12.2, .5, att=10, rel=.15, cut0=150, cut1=3200, Q=1.6), 28, 0, 1, .4, .3)
add(drone('D1', 12, .14), 28, 0, 1, .1)
add(riser(3.4, .3, 300, 12000), 36.6, 0, 1, .3)

# --- S03 BANG (40–58)
add(impact(9, 1.0), 40.0, 0, 1, .5, .5)
add(brass(['D2', 'A2', 'D3', 'A3', 'D4'], 6.5, 1.0, att=.05, rel=4, bright=4200, vib=False, bend=-90), 40.0, 0, 1, .4, .4)
add(sub('D1', 7, .9, rel=5), 40.0, 0, 1, 0)
add(taiko(3, .9), 40.0, 0, 1, .4)
add(noise_bed(12, .045, 300, 5000), 40.2, 0, 1, .3)
CH = [(44.5, ['D3', 'F3', 'A3', 'D4']), (49.0, ['Bb2', 'F3', 'A3', 'D4']), (53.5, ['F2', 'C3', 'A3', 'F4'])]
for t0, ch in CH: add(supersaw(ch, 5.2, .55, att=1.0, rel=1.2, cut0=500, cut1=2600), t0, 0, 1, .45, .3)
ARP = {'Dm': ['D4', 'A4', 'F4', 'A4', 'D5', 'A4', 'F4', 'E4'], 'Bb': ['Bb3', 'F4', 'D4', 'F4', 'Bb4', 'F4', 'D4', 'C4'],
       'F': ['F4', 'C5', 'A4', 'C5', 'F5', 'C5', 'A4', 'G4'], 'C': ['C4', 'G4', 'E4', 'G4', 'C5', 'G4', 'E4', 'D4'],
       'Gm': ['G3', 'D4', 'Bb3', 'D4', 'G4', 'D4', 'Bb3', 'A3'], 'D': ['D4', 'A4', 'F#4', 'A4', 'D5', 'A4', 'F#4', 'E4']}
def arp(chord, t0, t1, step, amp, cut=3800, pan=.25, ramp=(1, 1)):
    n = int((t1 - t0) / step); seq = ARP[chord]
    for i in range(n):
        k = i / max(1, n - 1); a = amp * (ramp[0] + (ramp[1] - ramp[0]) * k)
        add(pluck(seq[i % 8], .5, a, cut * (0.6 + 0.4 * k)), t0 + i * step, pan * (1 if i % 2 else -1), 1, .35)
arp('Dm', 46.0, 49.0, .25, .25, ramp=(.3, 1)); arp('Bb', 49.0, 53.5, .25, .3); arp('F', 53.5, 58.0, .25, .3, ramp=(1, .4))

# --- S04 the web (58–73): hush, the motif on bells through tape echoes
add(supersaw(['D3', 'A3', 'C4', 'E4', 'F4'], 15.5, .28, att=3, rel=3, cut0=400, cut1=1100), 57.8, 0, 1, .55, .4)
motif = [('D5', 0), ('A5', .75), ('F5', 1.5), ('E5', 2.25)]
mot = np.zeros(int(9 * SR))
for nm, o in motif: b = bell(nm, 5, .9); i0 = int(o * SR); mot[i0:i0 + len(b)] += b[:len(mot) - i0]
add(tape_delay(mot, .375, .42, 7, 3000), 64.0, 0, 1, .45, .35)
mot2 = np.zeros(int(8 * SR))
for nm, o in motif: b = bell(nm[:-1] + '4', 5, .7, ratio=1.0, idx=1.2); i0 = int(o * 1.3 * SR); mot2[i0:i0 + len(b)] += b[:len(mot2) - i0]
add(tape_delay(mot2, .5, .35, 5, 2500), 68.6, 0, 1, .5, .4)
add(shimmer(['A5', 'D6', 'E6'], 9, .015), 63.5, 0, 1, .7)

# --- S05 collapse (73–91): arpeggio returns and accelerates; ignition at 85.6; we rush into the star
add(sub('D1', 12.6, .35, att=4, rel=.3), 73, 0, 1, 0)
arp('Dm', 74.0, 79.0, .25, .18, ramp=(.3, .8)); arp('Bb', 79.0, 83.0, .25, .26); arp('Gm', 83.0, 85.6, .125, .3, ramp=(.7, 1.2))
add(supersaw(['D3', 'A3', 'Bb3', 'F4'], 12.8, .4, att=9, rel=.2, cut0=300, cut1=4000, Q=1.4), 73, 0, 1, .45)
add(riser(4.0, .25, 200, 9000), 81.6, 0, 1, .3)
add(impact(6, .7), 85.6, 0, 1, .5, .4); add(taiko(3, .7), 85.6, 0, 1, .4)
add(brass(['Bb2', 'F3', 'D4', 'F4', 'Bb4'], 5.6, .9, att=.25, rel=2.5, bright=3400), 85.6, 0, 1, .5, .5)
add(organ(['Bb1', 'Bb2', 'F3', 'D4'], 5.6, .35, att=.4, rel=2.5), 85.6, 0, 1, .5, .5)
add(riser(2.0, .3, 400, 14000), 89.0, 0, 1, .3)          # the rush into the star

# --- S06 the forge (91–112): Vangelis brass theme over organ; fusion at 97.6
for i in range(int(21 / .625)):
    tb = 91 + i * .625
    if i % 4 == 0: add(taiko(2, .5), tb, -.2, 1, .35)
    if i % 4 == 2: add(taiko(2, .3, 110, 60), tb, .2, 1, .35)
add(drone('D1', 21, .12), 91, 0, 1, .2)
add(organ(['D2', 'A2', 'D3', 'F3'], 7, .35, att=1.5, rel=1), 91, 0, 1, .5, .5)
add(vox(['D3', 'A3', 'D4', 'F4'], 7, .4, att=3, rel=1), 91, 0, 1, .5, .4)
add(riser(2.4, .25, 400, 10000), 95.2, 0, 1, .3)
add(impact(6, .8), 97.6, 0, 1, .5, .5); add(sub('D1', 4, .6, rel=3), 97.6, 0, 1, 0)
add(organ(['D2', 'A2', 'D3', 'F3', 'A3', 'D4'], 14, .5, att=.2, rel=3), 97.6, 0, 1, .5, .6)
add(vox(['F4', 'A4', 'D5'], 13, .4, att=1.2, rel=3), 98.2, 0, 1, .6, .5)
theme_f = [('D4', 98.4, 1.4), ('A4', 99.8, 1.4), ('F4', 101.2, 1.4), ('E4', 102.6, 2.4), ('D4', 105.2, 1.2), ('C5', 106.4, 1.5), ('A4', 107.9, 2.6)]
for nm, t0, d in theme_f: add(brass([nm], d + .6, .75, att=.12, rel=.8, bright=2600), t0, -.05, 1, .5, .55)
add(riser(1.8, .25, 300, 14000), 110.2, 0, 1, .3)

# --- S07 the giant (112–125.8): slowing heartbeat, filter closing; implosion; then silence
for b in [0.6, 2.4, 4.5, 7.0, 9.9, 12.6]: add(heartbeat(1.0), 112 + b, 0, 1, .2)
tr = supersaw(['D2', 'A2', 'Eb3'], 13.8, .45, att=1, rel=.6, cut0=1400, cut1=1400)
tr *= 0.6 + 0.4 * np.sin(2 * np.pi * 6.5 * tt(13.8))
tr = np.vstack([varlp(tr[0], np.linspace(1400, 200, tr.shape[1])), varlp(tr[1], np.linspace(1400, 200, tr.shape[1]))])
add(tr, 112, 0, 1, .4)
inv = riser(1.1, .35, 4000, 100)
add(inv, 124.6, 0, 1, .2)

# --- S08 SUPERNOVA (128.4–138)
add(impact(11, 1.0), 128.4, 0, 1, .6, .7)
add(brass(['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'], 8, 1.0, att=.05, rel=5, bright=4800, vib=False, bend=-120), 128.4, 0, 1, .5, .6)
add(sub('D1', 8, 1.0, rel=6), 128.4, 0, 1, 0)
add(taiko(3, 1.0, 120, 40), 128.4, 0, 1, .5)
for o, pan, fc in ((.6, -.6, 900), (1.2, .6, 1400)):
    t = tt(3.4); w = bp(rng.standard_normal(len(t)), fc * .5, fc * 3) * np.sin(np.pi * t / 3.4) ** 2 * .35
    add(w, 128.4 + o, pan, 1, .3)
add(supersaw(['D5', 'F#5', 'A5', 'D6'], 9.6, .28, att=2.5, rel=4, cut0=1500, cut1=5000), 130.0, 0, 1, .7, .6)
add(shimmer(['D6', 'A6', 'E7', 'F#6'], 9, .03), 130.5, 0, 1, .8, .5)

# --- S09 drift (138–153): bells and echoes over a slow pad; a new sun kindles
add(supersaw(['D3', 'A3', 'C4', 'E4'], 8, .22, att=4, rel=3, cut0=300, cut1=900), 138, 0, 1, .7, .5)
add(supersaw(['Bb2', 'F3', 'A3', 'D4'], 8.5, .22, att=3, rel=3, cut0=300, cut1=1100), 145, 0, 1, .7, .5)
solo = [('D5', 0), ('A5', .9), ('F5', 1.8), ('E5', 2.7), ('D5', 4.4), ('C6', 5.6), ('A5', 6.5), ('G5', 7.4), ('F5', 9.2), ('E5', 10.0), ('A4', 10.8)]
sl = np.zeros(int(16 * SR))
for nm, o in solo: b = bell(nm, 5, .7, bright=.7); i0 = int(o * SR); sl[i0:i0 + len(b)] += b[:len(sl) - i0]
add(tape_delay(sl, .45, .5, 8, 2600), 139.2, 0, 1, .55, .5)
add(drone('D2', 15, .05), 138, 0, 1, .3)
add(riser(5, .06, 1000, 9000), 146.5, 0, 1, .6)

# --- S10 sunrise (153–169): swell to D major as the sun crests (~160)
add(supersaw(['Bb2', 'F3', 'D4', 'F4'], 7.2, .35, att=5, rel=1.2, cut0=400, cut1=2000), 153, 0, 1, .5, .4)
add(brass(['D3', 'A3', 'D4', 'F#4', 'A4'], 9.5, .7, att=1.4, rel=3.5, bright=3200), 159.8, 0, 1, .55, .6)
add(organ(['D2', 'A2', 'D3', 'F#3'], 9, .32, att=2), 159.8, 0, 1, .5, .5)
add(vox(['F#4', 'A4', 'D5'], 9, .35, att=2.5, rel=3), 160.2, 0, 1, .6, .5)
add(shimmer(['F#6', 'A6', 'D7'], 8, .025), 160.5, 0, 1, .8)

# --- S11 life (169–191): 120 bpm arpeggio machine; chords per shot; builds to the cut at 191
B = .5
plan = [(169.0, 174.5, 'Dm', ['D3', 'F3', 'A3', 'D4']), (174.5, 180.5, 'Bb', ['Bb2', 'F3', 'Bb3', 'D4']),
        (180.5, 185.5, 'F', ['F2', 'C3', 'A3', 'F4']), (185.5, 191.0, 'C', ['C3', 'G3', 'C4', 'E4', 'G4'])]
for si, (a, b, ch, notes) in enumerate(plan):
    arp(ch, a, b, B / 4, .16 + si * .05, cut=3000 + si * 900, ramp=(.8, 1.1))
    add(supersaw(notes, b - a + .05, .32 + si * .05, att=.4, rel=.05, cut0=700, cut1=2400 + si * 600), a, 0, 1, .4, .25)
    add(sub(notes[0][:-1] + '1', b - a, .35, rel=.05), a, 0, 1, 0)
    if si >= 1:
        for k in range(int((b - a) / B)): add(kick(.55 + si * .08), a + k * B, 0, 1, .05)
    if si >= 2:
        for k in range(int((b - a) / B)):
            if k % 2: add(taiko(1.2, .25, 140, 80), a + k * B, .3, 1, .3)
add(noise_bed(5.5, .05, 2000, 9000), 169, 0, 1, .3)                          # rain
for i in range(50): add(bell(4000 + rng.random() * 3000, .1, .02), 169 + rng.random() * 5.4, rng.uniform(-.8, .8), 1, .3)
add(chime(.08, 1568), 173.6, 0, 1, .6, .4)                                     # the mote meets the sea
wing = noise_bed(5, .06, 300, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * tt(5)))
add(wing, 180.5, .2, 1, .3)
add(riser(5.4, .28, 300, 12000), 185.6, 0, 1, .2)
add(vox(['C4', 'G4', 'E5'], 5.5, .3, att=1, rel=.05), 185.5, 0, 1, .4)

# --- S12 the drop (191–211): near silence; bells; the drop lands at 204
add(bell('A5', 5, .25, bright=.5), 191.0, 0, 1, .8, .7)                       # the light becomes the mote
for nm, o in [('A4', 1.5), ('F4', 4.2), ('E4', 6.9), ('D4', 9.6)]: add(bell(nm, 7, .5, ratio=1.0, idx=1.0, bright=.6), 191 + o, 0, 1, .7, .6)
add(drone('D2', 20, .03), 192, 0, 1, .3)
add(supersaw(['D3', 'A3', 'E4'], 16, .06, att=6, rel=4, cut0=250, cut1=600), 193, 0, 1, .7, .5)
t_ = tt(1.2); tink = np.sin(2 * np.pi * 2350 * t_) * np.exp(-t_ * 9) * .25 + np.sin(2 * np.pi * np.cumsum(500 + 900 * np.exp(-t_ * 25)) / SR) * np.exp(-t_ * 12) * .3
add(tink, 204.0, 0, 1, .8, .7)
add(bell('D4', 8, .45, ratio=1.0, idx=1.0, bright=.4), 204.0, 0, 1, .7, .6)
add(shimmer(['D5', 'A5'], 7, .02), 204.2, 0, 1, .8, .5)
add(riser(2.0, .18, 300, 8000), 209.0, 0, 1, .3)

# --- S13 the return (211–237): the full theme; resolves to D major at 232
add(impact(7, .6), 211, 0, 1, .5, .5)
chords = [(211, ['D2', 'A2', 'D3', 'F3', 'A3', 'D4']), (217.5, ['Bb1', 'F2', 'Bb2', 'D3', 'F3', 'D4']),
          (224, ['F2', 'C3', 'F3', 'A3', 'C4', 'F4']), (228.5, ['C2', 'G2', 'C3', 'E3', 'G3', 'E4']), (232, ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'])]
for k, (t0, ch) in enumerate(chords):
    d = (chords[k + 1][0] - t0 + .4) if k + 1 < len(chords) else 6.5
    add(organ(ch, d, .5, att=.6, rel=1.2), t0, 0, 1, .5, .6)
    add(supersaw(ch[2:], d, .45, att=.6, rel=1.2, cut0=900, cut1=3600), t0, 0, 1, .5, .4)
    add(vox(ch[3:], d, .45, att=1, rel=1.2), t0, 0, 1, .6, .5)
    add(sub(ch[0], d, .45, rel=1), t0, 0, 1, 0)
    add(taiko(3, .9), t0, 0, 1, .45)
for i in range(int(21 / .625)):
    tb = 211 + i * .625
    if tb < 232 and i % 2 == 0: add(taiko(1.6, .3, 110, 55), tb, (i % 4 - 1.5) * .2, 1, .35)
theme = [('D5', 0), ('A5', 1.6), ('F5', 3.2), ('E5', 4.8), ('D5', 6.5), ('C6', 8.6), ('A5', 10.2), ('G5', 11.6),
         ('F5', 13.0), ('E5', 14.6), ('A4', 16.0), ('F#5', 21.0), ('D5', 22.2)]
for i, (nm, o) in enumerate(theme):
    d = (theme[i + 1][1] - o + .3) if i + 1 < len(theme) else 5
    add(brass([nm], d, .8, att=.12, rel=1.0, bright=3000), 211 + o, 0, 1, .5, .55)
add(brass(['D2', 'A2', 'D3'], 5, .5, att=.05, rel=3, bright=3000, vib=False, bend=-80), 232, 0, 1, .4, .5)

# --- S14 new star (237–250)
add(shimmer(['D6', 'F#6', 'A6', 'D7'], 12, .03), 237.6, 0, 1, .9, .7)
add(supersaw(['D3', 'A3', 'D4', 'F#4', 'A4'], 13, .2, att=3, rel=4, cut0=400, cut1=1400), 237, 0, 1, .7, .6)
add(riser(1.6, .1, 2000, 14000), 237.2, 0, 1, .5)
add(bell('D5', 6, .5), 238.8, 0, 1, .8, .6); add(bell('A5', 6, .35), 240.5, .2, 1, .8, .6)

# --- S15 good night (250–274)
add(noise_bed(24, .006, 60, 900), 250, 0, 1, 0)
for msg in CHAT_CLOSE: (kid_keys if msg['w'] == 'k' else ai_keys)(msg, 250.0)
add(bell('D5', 6, .3, ratio=1.0, idx=1.0), 250 + 14.0, .1, 1, .7, .5)
add(bell('A5', 6, .25, ratio=1.0, idx=1.0), 250 + 15.8, .2, 1, .7, .5)
add(supersaw(['D3', 'A3', 'D4', 'F#4'], 7, .14, att=2, rel=4, cut0=300, cut1=900), 250 + 18.6, 0, 1, .7, .6)
add(sub('D1', 6, .25, att=.5, rel=4), 250 + 18.6, 0, 1, 0)

# --- S16 the reveal (274–299): 120 bpm pulse, filter opening, hits on each layer, final stinger ~295.5
R0, R1 = 274.0, 295.5
seqs = ['Dm', 'Dm', 'Bb', 'Bb', 'F', 'F', 'C', 'C', 'Dm', 'Dm']
for k in range(int((R1 - R0) / .5)):
    tb = R0 + k * .5; prog = k / ((R1 - R0) / .5)
    ch = seqs[min(len(seqs) - 1, int(prog * len(seqs)))]
    for j in range(4): add(pluck(ARP[ch][(k * 4 + j) % 8], .4, .12 + .14 * prog, 1500 + 4500 * prog), tb + j * .125, (j % 2 - .5) * .5, 1, .3)
    if tb >= 278: add(kick(.45 + .25 * prog), tb, 0, 1, .05)
    if tb >= 286 and k % 2: add(taiko(1.0, .2, 150, 90), tb, .3, 1, .3)
for t0, ch in [(274, ['D3', 'F3', 'A3']), (279.4, ['Bb2', 'F3', 'D4']), (284.8, ['F3', 'A3', 'C4']), (290.2, ['C3', 'G3', 'E4'])]:
    add(supersaw(ch, 5.4, .3, att=.5, rel=.2, cut0=500, cut1=3000), t0, 0, 1, .4, .2)
add(riser(3.0, .3, 300, 14000), R1 - 3.0, 0, 1, .3)
add(impact(4, .8), R1, 0, 1, .5, .6)
add(brass(['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'], 3.4, .9, att=.05, rel=2.2, bright=4000, vib=False, bend=-80), R1, 0, 1, .5, .6)
add(sub('D1', 3.4, .8, rel=2.5), R1, 0, 1, 0)

# ================================================================ v4: the AI writing, and the person
def tick(amp=1.0, f=2600):
    t = tt(.06); return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * amp
def backspace(amp=1.0):
    t = tt(.07); return (bp(rng.standard_normal(len(t)), 900, 3000) * np.exp(-t * 160) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 60) * .6) * amp
def enter_key(amp=1.0):
    t = tt(.15); return (bp(rng.standard_normal(len(t)), 500, 2500) * np.exp(-t * 80) + np.sin(2 * np.pi * 95 * t) * np.exp(-t * 35)) * amp

def token_scene(t0, mode):
    T = TOKENS[mode]; fin = mode == 'final'
    _add(noise_bed(14, .006, 60, 900), t0, 0, 1, 0)
    for i in range(len(T['prefix'])): _add(key(.18), t0 + 1.0 + (i + 1) / 5, 0, 1, .15)
    for i, f in enumerate((1318, 1568, 1760, 2093)[:len(T['cands'])]): _add(chime(.035, f), t0 + 3.2 + i * .15, (i - 1.5) * .2, 1, .5)
    settle = 7.0 if fin else 7.8
    k = 0; tt_ = 5.6
    while tt_ < settle: _add(tick(.05, 2200 + 300 * (k % 3)), t0 + tt_, (k % 2 - .5) * .4, 1, .3); tt_ += 1 / (5 if fin else 7); k += 1
    if not fin:
        _add(bell('A5', 6, .45), t0 + settle, 0, 1, .6, .5)
        _add(supersaw(['D3', 'A3', 'E4', 'F#4'], 6.5, .22, att=1.2, rel=2.5, cut0=400, cut1=1800), t0 + settle, 0, 1, .6, .5)
        _add(riser(3.2, .08, 3000, 200), t0 + 9.4, 0, 1, .4)                 # the light condenses
        _add(drone('D1', 5, .08), t0 + 9.5, 0, 1, .2)
    else:
        _add(bell('D5', 7, .45), t0 + settle, 0, 1, .7, .6)
        _add(bell('A4', 6, .3, ratio=1.0, idx=.8, bright=.4), t0 + settle + 0.02, 0, 1, .7, .6)
        _add(supersaw(['D3', 'A3', 'D4', 'F#4', 'A4'], 7.5, .25, att=1.0, rel=3, cut0=500, cut1=2200), t0 + settle, 0, 1, .7, .6)
        _add(organ(['D2', 'A2', 'D3'], 7, .2, att=1.5, rel=3), t0 + settle, 0, 1, .6, .6)
        for i in range(len(T['after'])): _add(key(.16), t0 + settle + .6 + (i + 1) / 4, 0, 1, .15)
for c in CARDS:
    if c['style'] == 'ai': _add(chime(.02, 1318), c['t0'], .1, 1, .6)
    if c['style'] == 'probs':
        for j in range(len(c['items'])): _add(bell(['A5', 'F#5', 'D5'][j % 3], 5, .22, ratio=1.0, idx=.8, bright=.4), c['t0'] + j * 1.4, (j - 1) * .3, 1, .7, .6)
token_scene(0.0, 'genesis')
token_scene(254.0, 'final')

# H01 — 03:12 AM. We hear the person type, stop, delete, type again. The AI sees only "typing…".
H0 = 172.0
_add(noise_bed(45, .007, 60, 700), H0, 0, 1, 0)
_add(drone('D2', 22, .022), H0 + 1, 0, 1, .3)
for t0, n, kind in HUMAN['keys']:
    for k in range(n):
        tt0 = H0 + t0 + k * (0.24 if kind == 0 else 0.16) + rng.random() * .05
        _add((key(.26) if kind == 0 else backspace(.24)), tt0, rng.uniform(-.2, .2), .55, .1)
_add(tick(.03, 1900), H0 + 2.6, .3, 1, .3)                               # the guess appears
ta = H0 + HUMAN['arrive']
_add(chime(.06, 1318), ta, 0, 1, .5)                                     # the message lands
_add(bell('D4', 9, .5, ratio=1.0, idx=.8, bright=.4), ta + 0.25, 0, 1, .8, .7)   # 0.3%
R = HUMAN['reply']; tr = H0 + R['t']
_add(shimmer(['A5', 'E6'], 4, .012), tr, 0, 1, .6)
t_ = tr + 4.4
for zh, en in R['lines']:
    for k in range(len(zh)): _add(key(.12), t_ + (k + 1) / 7, .2, 1, .15)
    t_ += len(zh) / 7 + 1.3
_add(bell('F#5', 8, .3, ratio=1.0, idx=.8, bright=.4), t_ - 1.0, .1, 1, .8, .7)
_add(supersaw(['D3', 'A3', 'D4', 'F#4'], 9, .14, att=4, rel=1.5, cut0=300, cut1=1200), 210.0, 0, 1, .6, .5)
_add(riser(3.0, .12, 300, 6000), 214.0, 0, 1, .4)

# ================================================================ mix
def ir(sec, decay, seed, cut=6500):
    r = np.random.default_rng(seed); n = int(sec * SR); t = np.arange(n) / SR
    e = np.exp(-t * 6.9 / decay)
    a = lp(r.standard_normal(n) * e, cut); b = lp(r.standard_normal(n) * e, cut)
    pre = int(.02 * SR); a = np.concatenate([np.zeros(pre), a])[:n]; b = np.concatenate([np.zeros(pre + 240), b])[:n]
    return a / np.sqrt(np.sum(a ** 2)), b / np.sqrt(np.sum(b ** 2))
hall = ir(3.6, 2.8, 5); cath = ir(10, 8.5, 9, 5000)
def render_bus(k):
    dry, wet, cat = BUS[k]; x = dry.copy()
    for c in range(2):
        x[c] += fftconvolve(wet[c], hall[c])[:N] * 1.0
        x[c] += fftconvolve(cat[c], cath[c])[:N] * 1.15
    return x
def gate(t0, t1, fade=.03, floor=0.0):
    i0, i1, f = int(t0 * SR), min(int(t1 * SR), N), int(fade * SR)
    g = np.ones(N); g[i0:i1] = floor
    g[max(0, i0 - f):i0] = np.linspace(1, floor, i0 - max(0, i0 - f))
    g[i1:i1 + f] = np.linspace(floor, 1, len(g[i1:i1 + f]))
    return g
A = render_bus('A') * gate(106.8, 109.4, .04) * gate(CUT_AB + .03, DUR, .02)
mix = A + render_bus('B')
mix = hp(mix, 25)
# gentle bus compression (RMS, slow) + true-ish peak limiter
def limiter(x, ceil=10 ** (-1.0 / 20), look=int(.005 * SR), rel=int(.08 * SR)):
    pk = np.max(np.abs(x), axis=0)
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    pk = maximum_filter1d(pk, look * 2 + 1)
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    g = uniform_filter1d(g, look)
    # release smoothing (one-pole on gain increases)
    out = np.empty_like(g); cur = 1.0; a = np.exp(-1 / rel)
    for i in range(0, len(g), 64):
        seg = g[i:i + 64]; m = seg.min()
        cur = m if m < cur else a ** 64 * cur + (1 - a ** 64) * m
        out[i:i + 64] = np.minimum(seg, cur)
    return x * out
meter = pyln.Meter(SR)
loud = meter.integrated_loudness(mix.T)
mix *= 10 ** ((-14.0 - loud) / 20)
mix = limiter(mix)
loud2 = meter.integrated_loudness(mix.T)
e = np.ones(N); fe = int(2.0 * SR); e[-fe:] = np.linspace(1, 0, fe) ** 2; mix *= e
out = sys.argv[1] if len(sys.argv) > 1 else "audio/score.wav"
os.makedirs(os.path.dirname(out), exist_ok=True)
wavfile.write(out, SR, (np.clip(mix, -1, 1).T * 32767).astype(np.int16))
print(f'done {out}: integrated {loud2:.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.1f} dBFS')
