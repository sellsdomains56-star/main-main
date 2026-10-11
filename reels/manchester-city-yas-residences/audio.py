"""Sound for the Manchester City Yas Residences reel: his real on-camera audio (hook + closer), the cloned narration lines
   level-matched to it, and glitch-style SFX cut to the animation cues. No music.
   python3 -I audio.py <footage.mp4> <out_mix.wav> [--clean] [--sfx-only] [--offset s]
   Everything except the voices is synthesised with numpy (no samples), so it is fully reproducible."""
import sys, subprocess, json, re, os
import numpy as np

SR = 48000
SFX_OFFSET = 0.0                       # --offset 0.04 : shift every effect later (graphics were timed on the voiceover file, not the footage audio)
if '--offset' in sys.argv:
    _i = sys.argv.index('--offset'); SFX_OFFSET = float(sys.argv[_i + 1]); del sys.argv[_i:_i + 2]
GLITCH = '--clean' not in sys.argv            # swap the clean effects for digital-glitch ones (bit-crush, stutter, static, tape-stop)
SFX_ONLY = '--sfx-only' in sys.argv    # write just the sound effects (no voice, no music) as they sit in the reel mix
WITH_MUSIC = '--music' in sys.argv      # ambient pad + bell plucks; off by default (voice + SFX only)
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(f'{HERE}/timeline.json'))
DUR = TL['dur']
N = int((DUR + 1.5) * SR)
rng = np.random.default_rng(11)

# ------------------------------------------------------------------ primitives
def tarr(n): return np.arange(n) / SR
def exp_env(n, tau): return np.exp(-tarr(n) / tau)
def fade(x, a=0.004, b=0.01):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
def sine(f, n, ph=0.0): return np.sin(2 * np.pi * f * tarr(n) + ph)
def chirp(f0, f1, n):
    T = n / SR; t = tarr(n); k = np.log(f1 / f0) / T
    return np.sin(2 * np.pi * f0 * (np.exp(k * t) - 1) / k)
def white(n): return rng.standard_normal(n)

def shaped_noise(n, fc0, fc1, oct_w=1.2):
    """band-limited noise whose centre frequency glides fc0 -> fc1 (STFT shaping)."""
    fr, hop = 2048, 512
    x = np.pad(white(n), (fr, fr)); out = np.zeros_like(x)
    win = np.hanning(fr); freqs = np.fft.rfftfreq(fr, 1 / SR)[1:]
    nfr = (len(x) - fr) // hop
    for i in range(nfr):
        pos = i * hop; u = np.clip((pos - fr) / max(1, n), 0, 1)
        fc = fc0 * (fc1 / fc0) ** u
        g = np.exp(-0.5 * (np.log2(freqs / fc) / (oct_w / 2)) ** 2)
        spec = np.fft.rfft(x[pos:pos + fr] * win); spec[1:] *= g; spec[0] = 0
        out[pos:pos + fr] += np.fft.irfft(spec) * win
    y = out[fr:fr + n]; return y / (np.abs(y).max() + 1e-9)

def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo: g *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi: g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, len(x))

# ------------------------------------------------------------------ SFX library (mono arrays)
def thump(f=58, dur=0.7):
    n = int(dur * SR); fenv = 1 + 1.6 * np.exp(-tarr(n) / 0.035)
    ph = 2 * np.pi * np.cumsum(f * fenv) / SR
    return fade(np.sin(ph) * exp_env(n, 0.22), 0.002, 0.05)
def click(f=3200, dur=0.03):
    n = int(dur * SR); return fade(fft_filter(white(n), lo=2000) * exp_env(n, 0.004) * 0.7 + sine(f, n) * exp_env(n, 0.006) * 0.3, 0, 0.004)
def tick(f=1500):
    n = int(0.05 * SR); return fade(sine(f, n) * exp_env(n, 0.009) * 0.6 + fft_filter(white(n), lo=3000) * exp_env(n, 0.003) * 0.4, 0.0005, 0.01)
def pop(f=640, dur=0.16):
    n = int(dur * SR); fe = f * (1 + 0.5 * (1 - np.exp(-tarr(n) / 0.02)))
    return fade(np.sin(2 * np.pi * np.cumsum(fe) / SR) * exp_env(n, 0.05), 0.001, 0.02)
def ping(f=1568, dur=1.1):
    n = int(dur * SR); return fade((sine(f, n) + 0.35 * sine(f * 2.01, n) + 0.12 * sine(f * 3.02, n)) * exp_env(n, 0.22), 0.001, 0.05)
def bell(f=880, dur=2.2):
    n = int(dur * SR); t = tarr(n)
    m = 2.2 * np.exp(-t / 0.25) * np.sin(2 * np.pi * f * 3.5 * t)
    return fade(np.sin(2 * np.pi * f * t + m) * exp_env(n, 0.55), 0.002, 0.1)
def whoosh(dur=0.6, up=True, band=1.6):
    n = int(dur * SR); y = shaped_noise(n, 250 if up else 5200, 5200 if up else 250, band)
    env = np.sin(np.pi * np.clip(tarr(n) / dur, 0, 1)) ** (1.6 if up else 1.2)
    return y * env
def swipe(dur=0.3): return whoosh(dur, True, 1.0) * 0.8
def riser(dur=0.9):
    n = int(dur * SR); t = tarr(n) / dur
    y = shaped_noise(n, 180, 9000, 1.8) * (t ** 2.2) * 0.8 + chirp(160, 1400, n) * (t ** 3) * 0.25
    return fade(y, 0.005, 0.03)
def boom(dur=1.6):
    n = int(dur * SR)
    return fade(thump(44, dur) * 1.0 + fft_filter(white(n), hi=500) * exp_env(n, 0.25) * 0.6, 0.002, 0.2)
def crash(dur=1.0):
    n = int(dur * SR); t = tarr(n)
    return fade(chirp(900, 50, n) * np.exp(-t / 0.4) * 0.8 + fft_filter(white(n), hi=1800) * np.exp(-t / 0.18) * 0.7 + thump(52, dur) * 0.9, 0.001, 0.12)
def swell(dur=1.2):
    n = int(dur * SR); t = tarr(n) / dur
    y = sum(sine(f, n) * a for f, a in [(73.4, 0.6), (110, 0.4), (146.8, 0.35), (220, 0.18)])
    return fade(y * (np.sin(np.pi * t) ** 2) * 0.7, 0.01, 0.1)
def shimmer(dur=1.4):
    n = int(dur * SR); y = sum(sine(f, n, rng.uniform(0, 6)) * a for f, a in [(2093, 0.5), (3136, 0.35), (4186, 0.25), (5274, 0.12)])
    return fade(y * exp_env(n, 0.45) * 0.5, 0.004, 0.1)


# ------------------------------------------------------------------ glitch effects (same names/signatures as the clean ones)
def crush(x, bits=6, down=4):
    """bit-depth + sample-rate reduction: the classic digital-corruption sound"""
    y = np.repeat(x[::down], down)[: len(x)] if down > 1 else x.copy()
    q = 2 ** (bits - 1); return np.round(np.clip(y, -1, 1) * q) / q
def gate(x, rate=30.0, duty=0.55, seed=None):
    """random stutter gate: chops the signal into 1/rate slices and drops some of them"""
    r = np.random.default_rng(seed); n = len(x); seg = max(8, int(SR / rate)); g = np.ones(n)
    for i in range(0, n, seg):
        if r.random() > duty: g[i:i + seg] = 0
    return x * g
def repeat_slice(x, at, seg, reps):
    """buffer-repeat glitch: freeze a short slice and loop it"""
    a = int(at * SR); l = int(seg * SR); sl = x[a:a + l]
    if len(sl) < 10: return x
    y = x.copy(); end = min(len(y), a + l * reps); y[a:end] = np.tile(sl, reps + 1)[: end - a]; return y
def norm(x, pk=0.9): return x / (np.abs(x).max() + 1e-9) * pk

def g_whoosh(dur=0.6, up=True, band=1.6):
    y = whoosh_clean(dur, up, band); n = len(y)
    return norm(gate(crush(y, 5, 5), 36, 0.72)) * np.sin(np.pi * np.clip(tarr(n) / dur, 0, 1)) ** 0.8
def g_swipe(dur=0.3): return g_whoosh(dur, True, 1.0) * 0.85
def g_thump(f=58, dur=0.7):
    y = thump_clean(f, dur); n = len(y)
    return norm(np.tanh(crush(y * 3.0, 5, 3) * 1.6)) * exp_env(n, 0.2)
def g_click(f=3200, dur=0.03):
    n = int(dur * SR); sq = np.sign(sine(rng.uniform(2200, 5200), n)); return fade(crush(sq * exp_env(n, 0.006) * 0.8 + white(n) * exp_env(n, 0.004) * 0.3, 4, 2), 0, 0.004)
def g_tick(f=1500):                              # modem-style data blip
    n = int(0.045 * SR); f1 = rng.uniform(900, 3600); sq = np.sign(sine(f1, n)) * 0.6 + np.sign(sine(f1 * 1.5, n)) * 0.25
    return fade(crush(sq * exp_env(n, 0.016), 4, 3), 0.0005, 0.008)
def g_pop(f=640, dur=0.16):                       # digital zap
    n = int(dur * SR); y = chirp(f * 3.2, f * 0.9, n) * exp_env(n, 0.05); return fade(crush(np.sign(y) * 0.6 + y * 0.4, 4, 4), 0.001, 0.02)
def g_ping(f=1568, dur=1.1):                      # glitched chime: pitch jitter + crush + stutter tail
    n = int(min(dur, 0.7) * SR); t = tarr(n); jit = np.repeat(rng.uniform(0.97, 1.03, n // 900 + 2), 900)[:n]
    y = np.sin(2 * np.pi * np.cumsum(f * jit) / SR) * exp_env(n, 0.16) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 2.01 * jit) / SR) * exp_env(n, 0.09)
    return fade(gate(crush(y, 6, 3), 22, 0.8), 0.001, 0.05)
def g_bell(f=880, dur=2.2):
    y = bell_clean(f, min(dur, 1.0)); return fade(gate(crush(y, 5, 4), 18, 0.75), 0.002, 0.08)
def g_riser(dur=0.9):                              # stutter rate accelerates as it rises
    n = int(dur * SR); t = tarr(n) / dur; y = shaped_noise(n, 180, 9000, 1.8) * t ** 2 + 0.5 * np.sign(chirp(160, 1600, n)) * t ** 2.5
    out = np.zeros(n)
    pos = 0
    while pos < n:
        u = pos / n; rate = 4 + 40 * u; seg = max(40, int(SR / rate)); keep = rng.random() < 0.55 + 0.4 * u
        if keep: out[pos:pos + seg] = y[pos:pos + seg]
        pos += seg
    return fade(norm(crush(out, 5, 3)) * (0.3 + 0.7 * t), 0.005, 0.03)
def g_boom(dur=1.6):
    n = int(dur * SR); y = thump_clean(44, dur) * 1.2 + fft_filter(white(n), hi=900) * exp_env(n, 0.3) * 0.7
    y = np.tanh(crush(y * 2.5, 5, 3)); return fade(norm(y) * exp_env(n, 0.5), 0.002, 0.2)
def g_crash(dur=1.0):                              # tape-stop + buffer repeats
    n = int(dur * SR); t = tarr(n); y = chirp(1100, 45, n) * np.exp(-t / 0.45) + fft_filter(white(n), hi=2500) * np.exp(-t / 0.2) * 0.8 + thump_clean(52, dur) * 0.8
    y = repeat_slice(y, 0.12, 0.045, 5); y = repeat_slice(y, 0.42, 0.03, 4)
    return fade(norm(crush(y, 5, 3)) , 0.001, 0.1)
def g_swell(dur=1.2):
    n = int(dur * SR); t = tarr(n) / dur; y = sum(np.sign(sine(f, n)) * a for f, a in [(73.4, .5), (110, .35), (147.5, .3), (221, .15)])
    return fade(gate(crush(y, 5, 6), 14, 0.8) * (np.sin(np.pi * t) ** 2) * 0.5, 0.01, 0.1)
def g_shimmer(dur=1.4):                            # scattered digital sparkle
    n = int(dur * SR); y = np.zeros(n)
    for _ in range(26):
        a = rng.integers(0, int(n * 0.8)); l = int(rng.uniform(0.012, 0.05) * SR); f = rng.uniform(2500, 7000)
        y[a:a + l] += np.sign(sine(f, l)) * np.hanning(l) * rng.uniform(0.2, 0.6)
    return fade(crush(y, 4, 2) * exp_env(n, 0.5) * 0.7, 0.002, 0.1)

if GLITCH:                                         # rebind the effect library; build_sfx() picks these up by name
    whoosh_clean, thump_clean, bell_clean = whoosh, thump, bell
    whoosh, swipe, thump, click, tick, pop, ping, bell, riser, boom, crash, swell, shimmer = g_whoosh, g_swipe, g_thump, g_click, g_tick, g_pop, g_ping, g_bell, g_riser, g_boom, g_crash, g_swell, g_shimmer

# ------------------------------------------------------------------ mixing helpers
def place(buf, t0, sig, gain=1.0, pan=0.0):
    i = int(round((t0 + SFX_OFFSET) * SR));
    if i < 0 or i >= len(buf): return
    sig = sig[: len(buf) - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * gain * l; buf[i:i + len(sig), 1] += sig * gain * r

def out3_inv(p): return 1 - (1 - p) ** (1 / 3)
def count_ticks(buf, a0, a1, n=13, f0=1250, gain=0.16):
    for k in range(n):
        t = a0 + out3_inv((k + 1) / (n + 1)) * (a1 - a0)
        place(buf, t, tick(f0 + k * 55), gain, pan=rng.uniform(-0.2, 0.2))
    place(buf, a1, ping(1318), gain * 1.1); place(buf, a1, shimmer(), gain * 0.45)

# ------------------------------------------------------------------ timeline helpers (mirror of wt()/segById() in reel.js)
SEG = {s['id']: s for s in TL['segs']}
def wt(sid, pat, n=0, fb=0.5):
    s = SEG[sid]; ws = [w for w in TL['words'] if w['seg'] == sid and re.search(pat, w['text'])]
    return ws[n]['t'] if n < len(ws) else s['a'] + (s['b'] - s['a']) * fb

# ------------------------------------------------------------------ cue sheet (seconds, from the animation)
def build_sfx():
    buf = np.zeros((N, 2)); S = TL['segs']
    # every cut: whoosh in, thump + a burst of digital clicks on the frame the glitch slices hit
    for i, s in enumerate(S[1:]):
        if s.get('cont'): continue                                   # same scene continues (price chart): no cut
        a = s['a']; place(buf, a - 0.24, whoosh(0.55, up=(i % 2 == 0)), 0.30, pan=(-0.25 if i % 2 else 0.25)); place(buf, a, thump(66, 0.4), 0.30)
        for k in range(4): place(buf, a + 0.012 + k * 0.036, click(rng.uniform(2400, 4200)), 0.20)
    # hook: "6 BILLION" / "72 HOURS" slam in behind him, punch on each stat word
    t6, t72, tH = wt('hook', r'^6$', 0, 0.35) - 0.05, wt('hook', r'^72$', 0, 0.7) - 0.05, wt('hook', r'HOURS', 0, 0.85)
    place(buf, t6 - 0.05, swipe(0.22), 0.34); place(buf, t6, thump(58, 0.6), 0.55); place(buf, t6, pop(520, 0.2), 0.20); place(buf, t6 + 0.04, shimmer(1.0), 0.16)
    place(buf, t72 - 0.05, swipe(0.22), 0.34); place(buf, t72, thump(62, 0.6), 0.55); place(buf, t72, pop(660, 0.2), 0.20)
    place(buf, tH, thump(80, 0.3), 0.20)
    # S1: logo reveal, tagline rule
    a = SEG['S1']['a']; place(buf, a + 0.12, boom(1.5), 0.40); place(buf, a + 0.2, shimmer(1.4), 0.22)
    tt = wt('S1', r'^OHANA', 0, 0.85); place(buf, tt - 0.25, pop(700, 0.18), 0.16); place(buf, tt - 0.2, swipe(0.5), 0.18); place(buf, tt + 0.1, ping(1568, 1.0), 0.16)
    # S2: aerial ken-burns, the two chips
    place(buf, wt('S2', r'^FIRST', 0, 0.3) - 0.1, pop(600, 0.18), 0.22); place(buf, wt('S2', r'^CANAL', 0, 0.9) - 0.1, pop(760, 0.18), 0.24); place(buf, wt('S2', r'^CANAL', 0, 0.9) - 0.1, ping(1318, 0.9), 0.14)
    # S3: pins drop + camera moves + airport chip
    s3 = SEG['S3']['a']; tF, tC, tA, tM = wt('S3', r'^FERRARI', 0, 0.45), wt('S3', r'^CIRCUIT', 0, 0.6), wt('S3', r'^AIRPORT', 0, 0.8), wt('S3', r'^(10|TEN)', 0, 0.88)
    for tp, f in [(s3 + 0.15, 440), (tF - 0.05, 620), (tC - 0.05, 700)]: place(buf, tp, pop(f, 0.2), 0.34); place(buf, tp, thump(90, 0.3), 0.16); place(buf, tp + 0.1, ping(1760, 0.8), 0.14)
    for tp in [tF - 0.25, tC - 0.1, tA - 0.1]: place(buf, tp, swipe(0.5), 0.26)
    place(buf, tM - 0.15, pop(800, 0.2), 0.30); place(buf, tM - 0.15, ping(1318, 1.0), 0.18)
    # S4: house types (cuts) + 170 ha masterplan
    tT, tD, tV, tH4 = SEG['S4']['a'], wt('S4', r'^DUPLEXES', 0, 0.3), wt('S4', r'^VILLAS', 0, 0.45), wt('S4', r'^(170|ONE|HUNDRED)', 0, 0.78)
    for tp in [tT, tD, tV]: place(buf, tp + 0.1, pop(640, 0.2), 0.26)
    for tp in [tD, tV]: place(buf, tp - 0.12, swipe(0.28), 0.30); place(buf, tp, thump(70, 0.35), 0.26)
    place(buf, tH4 - 0.02, thump(58, 0.9), 0.45); count_ticks(buf, tH4 + 0.05, tH4 + 0.95, 12, f0=1300, gain=0.18); place(buf, tH4 + 0.97, shimmer(1.2), 0.22)
    # S5: 55 % open space, then three amenities
    tL, tAc, tP, tO = wt('S5', r'^CRYSTAL', 0, 0.45), wt('S5', r'^TRAINING', 0, 0.62), wt('S5', r'^(PROMENADE|CANAL)', 0, 0.8), wt('S5', r'^(HALF|OPEN)', 0, 0.18)
    place(buf, tO - 0.05, thump(58, 0.8), 0.40); count_ticks(buf, tO - 0.05, tO + 0.95, 12, f0=1250, gain=0.18)
    for tp in [tL - 0.05, tAc - 0.28, tP - 0.1]: place(buf, tp - 0.15, swipe(0.3), 0.28); place(buf, tp, thump(72, 0.4), 0.28); place(buf, tp + 0.12, pop(700, 0.18), 0.20)
    # price per sq ft: bars grow with count ticks, the -25% stamp, then the chart fills out and the scarcity stat
    P1, P2, P3 = SEG['P1']['a'], SEG['P2']['a'], SEG['P3']['a']
    tMc, tOr = wt('P1', r'^1,?852', 0, 0.5) - 0.1, wt('P1', r'^(TWENTY|25)', 0, 0.6) - 0.05; tSt = max(tOr + 0.5, wt('P1', r'PERCENT|%', 0, 0.72) - 0.05)
    place(buf, P1 + 0.1, swipe(0.4), 0.26); count_ticks(buf, tMc, tMc + 1.35, 14, f0=1250, gain=0.16)
    count_ticks(buf, tOr, tOr + 0.85, 10, f0=1100, gain=0.15)
    place(buf, tSt, thump(56, 0.9), 0.55); place(buf, tSt, crash(0.8), 0.25); place(buf, tSt + 0.05, shimmer(1.3), 0.22); place(buf, tSt + 0.1, pop(760, 0.2), 0.22)
    tApt, tM3, tFirst = wt('P2', r'^AVERAGE', 0, 0.35) - 0.1, P2 + 0.28, wt('P2', r'^FIRST', 0, 0.62) - 0.1
    place(buf, P2, swipe(0.5), 0.26); count_ticks(buf, tM3, tM3 + 0.8, 8, f0=1200, gain=0.14); count_ticks(buf, tApt, tApt + 0.8, 8, f0=1050, gain=0.13)
    place(buf, tFirst, pop(820, 0.2), 0.28); place(buf, tFirst, ping(1568, 1.0), 0.18)
    place(buf, P3 + 0.1, thump(58, 0.8), 0.40); count_ticks(buf, P3 + 0.1, P3 + 1.1, 12, f0=1300, gain=0.17)
    place(buf, P3 + 0.5, pop(700, 0.2), 0.24); place(buf, wt('P3', r'^SCARCE', 0, 0.5) - 0.1, pop(560, 0.2), 0.26)
    # S6: quick montage, then the stamp "6 BILLION / IN 72 HOURS"
    s6 = SEG['S6']['a']
    for k in range(3): place(buf, s6 + k * 0.2, tick(1800 + k * 200), 0.20); place(buf, s6 + k * 0.2, thump(80, 0.2), 0.18)
    place(buf, s6 + 0.12, riser(0.5), 0.40); place(buf, s6 + 0.62, boom(1.8), 0.60); place(buf, s6 + 0.62, shimmer(1.6), 0.26)
    place(buf, s6 + 0.74, thump(66, 0.5), 0.40); place(buf, s6 + 0.62, crash(1.0), 0.30)
    # closer: PHASE 2 -> DROPPING NOW
    cp, cd, cn = wt('closer', r'PHASE', 0, 0.3) - 0.05, wt('closer', r'DROPPING', 0, 0.6) - 0.02, wt('closer', r'NOW', 0, 0.9)
    place(buf, cp - 0.05, swipe(0.22), 0.34); place(buf, cp, thump(58, 0.6), 0.55); place(buf, cp, pop(520, 0.2), 0.2)
    place(buf, cd - 0.15, riser(0.3), 0.30); place(buf, cd, crash(1.0), 0.50); place(buf, cd, shimmer(1.0), 0.18)
    place(buf, cn, thump(74, 0.4), 0.35)
    # END: logo, COMMENT, CITY typed into the bubble, send, PHASE 2 chip
    e0 = SEG['END']['a']; tC, tY, tP2 = wt('END', r'^COMMENT', 0, 0.0), wt('END', r'^CITY', 0, 0.3), wt('END', r'^PHASE', 0, 0.62)
    place(buf, e0 + 0.1, shimmer(1.4), 0.22)
    place(buf, tC - 0.05, pop(760, 0.2), 0.30); place(buf, tC, swipe(0.3), 0.22)
    for k in range(4): place(buf, tY - 0.1 + k * 0.095, tick(1700 + k * 130), 0.20)
    place(buf, tY + 0.62, pop(900, 0.2), 0.30); place(buf, tY + 0.62, ping(1568, 1.0), 0.20)
    place(buf, tP2 - 0.1, pop(700, 0.2), 0.26); place(buf, tP2 - 0.1, ping(1175, 1.1), 0.16)
    te = TL['dur'] - 1.15; place(buf, te, bell(1175, 1.6), 0.20); place(buf, te + 0.12, bell(1568, 1.6), 0.18); place(buf, te + 0.24, shimmer(1.0), 0.16)
    return buf

def make_reverb(sec=2.2, tau=0.55):
    n = int(sec * SR); t = tarr(n)
    ir = np.stack([white(n) * np.exp(-t / tau), white(n) * np.exp(-t / tau)], 1)
    ir[:, 0] = fft_filter(ir[:, 0], lo=180, hi=7000); ir[:, 1] = fft_filter(ir[:, 1], lo=180, hi=7000)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(0).max())
def convolve(x, ir):
    n = len(x) + len(ir) - 1; L = 1 << (n - 1).bit_length()
    out = np.zeros_like(x)
    for c in range(2):
        y = np.fft.irfft(np.fft.rfft(x[:, c], L) * np.fft.rfft(ir[:, c], L), L)[: len(x)]; out[:, c] = y
    return out

def smooth_env(x, ms):
    """|x| smoothed with two cascaded moving averages (~hann-like), O(N) via cumulative sums."""
    k = max(1, int(ms / 1000 * SR)); y = np.abs(x)
    for _ in range(2):
        c = np.cumsum(np.concatenate([[0.0], y])); idx = np.arange(len(y))
        lo = np.clip(idx - k, 0, len(y)); hi = np.clip(idx + k + 1, 0, len(y))
        y = (c[hi] - c[lo]) / np.maximum(1, hi - lo)
    return y

# ------------------------------------------------------------------ voices
CHAIN = 'highpass=f=75,acompressor=threshold=0.1:ratio=3:attack=6:release=140:makeup=2.2,equalizer=f=3000:t=q:w=1.1:g=1.8,alimiter=limit=0.9'
def decode(path, extra_in=(), af=CHAIN):
    raw = subprocess.run(['ffmpeg', '-v', 'error', *extra_in, '-i', path, '-af', af, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
def speech_rms(x):
    m = x.mean(1); e = smooth_env(m, 30); return float(np.sqrt((m[e > e.max() * 0.15] ** 2).mean()))
def put(buf, t0, sig, gain=1.0):
    i = int(round(t0 * SR)); sig = sig[: max(0, len(buf) - i)]; buf[i:i + len(sig)] += sig * gain

def build_voice(footage):
    vb = np.zeros((N, 2)); real = []
    for s in TL['segs']:
        if s['type'] != 'cam': continue
        x = decode(footage, ['-ss', f"{s['src_a']:.3f}", '-t', f"{s['b'] - s['a']:.3f}"])
        nf = int(0.012 * SR); x[:nf] *= np.linspace(0, 1, nf)[:, None]; x[-nf:] *= np.linspace(1, 0, nf)[:, None]
        real.append(x); put(vb, s['a'], x)
    target = np.mean([speech_rms(x) for x in real])               # cloned lines are matched to his real speech level
    for s in TL['segs']:
        a = s.get('audio')
        if not a: continue
        x = decode(a['file']); i0, i1 = int(max(0, a['start'] - 0.02) * SR), int(min(len(x) / SR, a['end'] + 0.03) * SR); x = x[i0:i1]
        x = x * (target / speech_rms(x)); nf = int(0.015 * SR); x[:nf] *= np.linspace(0, 1, nf)[:, None]; x[-nf:] *= np.linspace(1, 0, nf)[:, None]
        put(vb, a['at'] - (a['start'] - max(0, a['start'] - 0.02)), x)
    return vb

def main(footage, out_path):
    vb = build_voice(footage); vmono = vb.mean(1)
    env = smooth_env(vmono, 60); env = env / (np.percentile(env, 95) + 1e-9)
    duck_sfx = 1 - 0.22 * smooth_env(np.clip(env, 0, 1), 90).clip(0, 1)
    if SFX_ONLY: duck_sfx[:] = 1.0
    sfx = build_sfx(); ir = make_reverb(); sfx_wet = convolve(sfx, ir) * 0.30
    sfx_mix = (sfx + sfx_wet) * duck_sfx[:, None] * (0.58 if GLITCH else 0.72)
    mix = sfx_mix if SFX_ONLY else vb + sfx_mix
    db = lambda x: 20 * np.log10(np.sqrt((x[: int(DUR * SR)] ** 2).mean()) + 1e-9)
    pkdb = lambda x: 20 * np.log10(np.abs(x[: int(DUR * SR)]).max() + 1e-9)
    print(f'stems  rms dBFS / peak dBFS:  voice {db(vb):.1f}/{pkdb(vb):.1f}   sfx {db(sfx_mix):.1f}/{pkdb(sfx_mix):.1f}')
    mix = mix[: int(DUR * SR)]; pk = np.abs(mix).max(); print('peak before norm', round(float(pk), 3)); mix = mix / max(1.0, pk / 0.95)
    import wave
    pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('wrote', out_path, round(len(mix) / SR, 2), 's')

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    main(args[0], args[1])
