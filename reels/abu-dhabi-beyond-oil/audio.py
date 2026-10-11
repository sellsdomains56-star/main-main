"""Sound design for the reel: processed voiceover + SFX cut to the animation cues (+ optional ambient music bed).
   python3 -I audio.py <voice.wav 48k> <out_mix.wav> [--music] [--sfx-only]
   Everything is synthesised with numpy (no samples), so it is fully reproducible."""
import sys, subprocess
import numpy as np

SR = 48000
SFX_OFFSET = 0.0                       # --offset 0.04 : shift every effect later (graphics were timed on the voiceover file, not the footage audio)
if '--offset' in sys.argv:
    _i = sys.argv.index('--offset'); SFX_OFFSET = float(sys.argv[_i + 1]); del sys.argv[_i:_i + 2]
GLITCH = '--clean' not in sys.argv            # swap the clean effects for digital-glitch ones (bit-crush, stutter, static, tape-stop)
SFX_ONLY = '--sfx-only' in sys.argv    # write just the sound effects (no voice, no music) as they sit in the reel mix
WITH_MUSIC = '--music' in sys.argv      # ambient pad + bell plucks; off by default (voice + SFX only)
DUR = 46.72
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

# ------------------------------------------------------------------ cue sheet (seconds, from the animation)
def build_sfx():
    buf = np.zeros((N, 2))
    # scene changes: whoosh in, soft thump
    for i, t in enumerate([5.62, 8.95, 11.77, 13.86, 16.21, 21.91, 24.46, 26.26, 28.19, 31.30, 37.90, 42.20]):
        place(buf, t - 0.28, whoosh(0.62, up=(i % 2 == 0)), 0.30, pan=(-0.25 if i % 2 else 0.25))
        place(buf, t + 0.02, thump(70, 0.35), 0.13)
    # opening (him): punch-in on "collapsed", the OUTDATED stamp
    place(buf, 1.45, swipe(0.25), 0.30)
    place(buf, 4.70, swipe(0.3), 0.36); place(buf, 4.88, thump(78, 0.5), 0.55); place(buf, 4.88, click(), 0.35)
    # building wealth beyond oil
    place(buf, 7.27, pop(520), 0.16); place(buf, 7.65, pop(620), 0.16); place(buf, 8.13, swipe(0.4), 0.26)
    place(buf, 8.59, boom(1.6), 0.45); place(buf, 8.59, shimmer(), 0.18)
    # Mubadala
    place(buf, 8.95, thump(62, 0.9), 0.45); place(buf, 9.55, shimmer(1.6), 0.22)
    count_ticks(buf, 9.78, 10.98, 14); place(buf, 11.12, pop(700), 0.12)
    # vs Portugal
    place(buf, 11.95, swipe(0.5), 0.24); place(buf, 12.25, swipe(0.5), 0.2); place(buf, 13.15, ping(1175, 1.4), 0.2)
    # ADIA
    place(buf, 13.86, thump(58, 0.9), 0.45); place(buf, 14.3, shimmer(1.6), 0.22)
    count_ticks(buf, 15.19, 16.05, 10, f0=1400)
    # AI / technology / infrastructure / businesses -> companies, jobs, housing demand
    for t, f in [(16.84, 740), (17.32, 830), (17.78, 740), (18.33, 880)]: place(buf, t, pop(f), 0.26)
    place(buf, 18.84, riser(0.4), 0.16); place(buf, 18.88, ping(1046, 1.2), 0.20)
    for t, f in [(19.13, 523), (20.11, 587)]: place(buf, t, pop(f, 0.22), 0.30); place(buf, t, thump(90, 0.3), 0.12)
    place(buf, 20.87, pop(784, 0.25), 0.30); place(buf, 21.1, ping(1568, 1.3), 0.22); place(buf, 21.1, shimmer(), 0.16)
    # Aldar -> Talay, Yas Riva Reserve
    place(buf, 22.29, thump(66, 0.8), 0.42); place(buf, 22.9, shimmer(1.4), 0.2)
    place(buf, 22.85, click(), 0.4); place(buf, 22.85, pop(420, 0.2), 0.2); place(buf, 23.36, click(), 0.4); place(buf, 23.36, pop(500, 0.2), 0.2)
    # AED 5B+
    count_ticks(buf, 24.72, 25.40, 7, f0=1300); place(buf, 25.45, tick(1800), 0.1); place(buf, 25.85, pop(660), 0.14)
    # Modon -> Hudayriyat
    place(buf, 26.43, thump(62, 0.9), 0.45); place(buf, 27.05, shimmer(1.4), 0.2)
    place(buf, 26.90, click(), 0.4); place(buf, 26.90, pop(440, 0.2), 0.2)
    # AED 13B+ within days
    count_ticks(buf, 28.19, 28.95, 13, f0=1350, gain=0.17); place(buf, 29.28, pop(600), 0.14); place(buf, 30.40, ping(1568, 1.3), 0.22)
    # what to look for
    for t, f in [(33.47, 587), (34.92, 659), (36.22, 740)]:
        place(buf, t, pop(f, 0.22), 0.30); place(buf, t, thump(88, 0.3), 0.12); place(buf, t + 0.4, ping(1760, 0.9), 0.16)
    # bigger than oil (him): the dot, then the ring grows past it
    place(buf, 38.57, ping(988, 1.4), 0.18)
    place(buf, 39.13, riser(0.9), 0.4); place(buf, 40.0, boom(2.2), 0.5); place(buf, 40.0, shimmer(1.8), 0.2)
    place(buf, 41.43, ping(1175, 1.2), 0.18)
    # DM me
    for k in range(4): place(buf, 42.94 + k * 0.22, tick(1600 + k * 120), 0.10)
    for k in range(4): place(buf, 44.10 + k * 0.16, ping(1568 + k * 130, 0.7), 0.12)
    for k in range(9): place(buf, 45.06 + k * 0.047, click(rng.uniform(2400, 3600)), 0.2)
    place(buf, 45.53, whoosh(0.5, True, 1.2), 0.36); place(buf, 45.53, pop(900, 0.2), 0.32)
    place(buf, 46.05, bell(1175, 2.0), 0.2); place(buf, 46.18, bell(1568, 2.0), 0.18); place(buf, 46.3, bell(1760, 2.0), 0.16)
    return buf

def build_bed():
    buf = np.zeros((N, 2))
    chords = [  # D minor colour: Dm9, Bbmaj7, Gm9, Asus4
        [146.83, 174.61, 220.0, 261.63, 329.63], [116.54, 146.83, 174.61, 220.0], [98.0, 116.54, 146.83, 174.61, 220.0], [110.0, 146.83, 164.81, 196.0],
    ]
    seg = 4.672
    for s in range(11):
        t0 = s * seg - 0.9; ch = chords[s % 4]; n = int((seg + 2.4) * SR)
        env = np.minimum(1, tarr(n) / 1.6) * np.minimum(1, (n / SR - tarr(n)) / 1.8)
        env = np.clip(env, 0, 1) ** 1.3
        y = np.zeros(n)
        for j, f in enumerate(ch):
            for det, pan in [(-3, -0.3), (3, 0.3)]:
                ff = f * 2 ** (det / 1200)
                v = sum(sine(ff * h, n, rng.uniform(0, 6.28)) / h ** 1.5 for h in range(1, 7))
                v *= 1 + 0.12 * np.sin(2 * np.pi * (0.12 + 0.03 * j) * tarr(n) + j)
                place_buf = np.zeros((n + 1, 2)); l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
                i = max(0, int(round(t0 * SR))); seg_sig = v * env * 0.020
                if t0 < 0: seg_sig = seg_sig[int(-t0 * SR):]
                m = min(len(seg_sig), len(buf) - i)
                if m > 0: buf[i:i + m, 0] += seg_sig[:m] * l; buf[i:i + m, 1] += seg_sig[:m] * r
        # sub bass on the root
        sub = sine(ch[0] / 2, n) * env * 0.085; i = max(0, int(round(t0 * SR))); sub = sub[int(-t0 * SR):] if t0 < 0 else sub
        m = min(len(sub), len(buf) - i)
        if m > 0: buf[i:i + m, :] += sub[:m, None]
    # sparse bell plucks on a 0.6 s grid (100 bpm)
    notes = [587.33, 698.46, 880.0, 1046.5, 783.99]
    pat = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0]
    for k in range(int(DUR / 0.6)):
        if pat[k % len(pat)]:
            place(buf, k * 0.6, bell(notes[(k * 3) % len(notes)], 2.4), 0.040, pan=((k % 5) - 2) * 0.22)
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
    k = max(1, int(ms / 1000 * SR))
    y = np.abs(x)
    for _ in range(2):
        c = np.cumsum(np.concatenate([[0.0], y])); idx = np.arange(len(y))
        lo = np.clip(idx - k, 0, len(y)); hi = np.clip(idx + k + 1, 0, len(y))
        y = (c[hi] - c[lo]) / np.maximum(1, hi - lo)
    return y

def main(voice_path, out_path):
    # voice: gentle clean-up chain (hp, compressor, presence), decoded to float
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', voice_path, '-af',
        'highpass=f=75,acompressor=threshold=0.1:ratio=3:attack=6:release=140:makeup=2.2,equalizer=f=3000:t=q:w=1.1:g=1.8,alimiter=limit=0.9',
        '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    voice = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
    vb = np.zeros((N, 2)); vb[: min(N, len(voice))] = voice[:N]
    vmono = vb.mean(1); env = smooth_env(vmono, 60); env = env / (np.percentile(env, 95) + 1e-9)
    duck_bed = 1 - 0.58 * smooth_env(np.clip(env, 0, 1), 140).clip(0, 1)
    duck_sfx = 1 - 0.22 * smooth_env(np.clip(env, 0, 1), 90).clip(0, 1)

    if SFX_ONLY: duck_sfx[:] = 1.0      # no voice in this stem, so nothing to duck under
    bed = build_bed() if WITH_MUSIC else np.zeros((N, 2)); sfx = build_sfx()   # music bed is opt-in (--music)
    ir = make_reverb()
    bed_wet = convolve(bed, ir) * 0.55; sfx_wet = convolve(sfx, ir) * 0.30
    bed_mix = (bed * 0.8 + bed_wet) * duck_bed[:, None]
    sfx_mix = (sfx + sfx_wet) * duck_sfx[:, None] * (0.58 if GLITCH else 0.72)
    # fade the bed in/out and tail the end
    bed_mix[:, :] *= np.minimum(1, tarr(N) / 1.2)[:, None] * np.clip((DUR + 0.6 - tarr(N)) / 1.0, 0, 1)[:, None]
    mix = (sfx_mix if SFX_ONLY else vb * 1.0 + bed_mix * 1.0 + sfx_mix * 1.0)
    db = lambda x: 20 * np.log10(np.sqrt((x[: int(DUR * SR)] ** 2).mean()) + 1e-9)
    pkdb = lambda x: 20 * np.log10(np.abs(x[: int(DUR * SR)]).max() + 1e-9)
    print(f'stems  rms dBFS / peak dBFS:  voice {db(vb):.1f}/{pkdb(vb):.1f}   bed {db(bed_mix):.1f}/{pkdb(bed_mix):.1f}   sfx {db(sfx_mix):.1f}/{pkdb(sfx_mix):.1f}')
    mix = mix[: int(DUR * SR)]
    pk = np.abs(mix).max(); print('peak before norm', round(float(pk), 3))
    mix = mix / max(1.0, pk / 0.95)
    # write 32-bit float wav
    import wave, struct
    pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('wrote', out_path, round(len(mix) / SR, 2), 's')

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    main(args[0], args[1])
