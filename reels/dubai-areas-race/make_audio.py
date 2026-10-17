#!/usr/bin/env python3
"""Very quiet whoosh-only sound for the chart reel (no music, no voice). Two soft whooshes: title in (0.25 s) and his picture gliding to the middle (34.9 s).
python3 -I make_audio.py build/mix.wav"""
import sys, wave, numpy as np
SR = 48000; DUR = 38.5
rng = np.random.default_rng(7)
def whoosh(dur, f0, f1, peak):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # band-pass sweep by moving-average difference (cheap, deterministic): centre frequency glides f0 -> f1
    out = np.zeros(n); fc = np.linspace(f0, f1, n)
    ph = 2 * np.pi * np.cumsum(fc) / SR
    out = noise * (0.55 + 0.45 * np.sin(ph))                       # amplitude-modulated noise = airy "swish"
    k = int(SR / 3000); out = np.convolve(out, np.ones(k) / k, mode='same')   # take the harsh top off
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2.2             # soft in, soft out
    out = out * env; out = out / (np.abs(out).max() + 1e-9) * peak
    return out
mix = np.zeros(int(DUR * SR))
for t0, d, a, b, pk in [(0.25, 0.9, 500, 2600, 0.060), (34.9, 1.1, 900, 400, 0.055)]:
    w = whoosh(d, a, b, pk); i = int(t0 * SR); mix[i:i + len(w)] += w
mix = np.convolve(mix, np.ones(8) / 8, mode='same')
pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())
print('wrote', sys.argv[1], 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 1))
