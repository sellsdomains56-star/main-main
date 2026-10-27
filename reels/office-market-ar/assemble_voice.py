"""Join pieces of several voice notes into one voiceover - his voice untouched: no stretch, no filters, only a plain gain per note (so every note sits at the same
speech level), cuts placed in the quietest spot near each boundary, 12 ms fades at the joins, a short pause between pieces, and long pauses inside a piece shortened.
   python3 -I assemble_voice.py edl.json      ->  build/voice48k.wav  build/cutmap.json (fps, dur, pieces)
edl.json: {"notes": {"n1": "<path>", ...}, "pieces": [["n5", 0.0, 53.1], ...], "gap": 0.42, "max_pause": 0.3}"""
import json, subprocess, sys, os
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
cfg = json.load(open(sys.argv[1])); SR, FPS = 48000, 30
def load(p):                                                   # mono float, 48 kHz (a stereo note is averaged; nothing else is changed)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
notes = {k: load(v) for k, v in cfg['notes'].items()}
def env_db(x, hop=480):                                        # 10 ms frames, dBFS
    n = len(x) // hop; return 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
# one plain gain per note: its loud (speech) frames brought to the same level
lvl = {k: np.percentile(env_db(x)[env_db(x) > -50], 75) for k, x in notes.items()}; target = float(np.median(list(lvl.values())))
gain = {k: 10 ** ((target - v) / 20) for k, v in lvl.items()}
def quietest(x, t, span=0.35):                                 # cut point: the middle of the longest silence within +-span of t (never inside a word)
    e = env_db(x); thr = np.percentile(e[e > -60], 90) - 30; i0, i1 = max(0, int((t - span) * 100)), min(len(e) - 1, int((t + span) * 100))
    best, i = (0, int(t * 100)), i0
    while i <= i1:
        if e[i] < thr:
            j = i
            while j <= i1 and e[j] < thr: j += 1
            if j - i > best[0]: best = (j - i, (i + j) // 2)
            i = j
        else: i += 1
    if best[0] < 3: print(f'  warning: no clear pause near {t:.2f}s'); 
    return best[1] / 100
def tighten(seg, max_pause):                                   # pauses longer than max_pause inside a piece -> max_pause (cut in the middle of the silence)
    e = env_db(seg); thr = np.percentile(e[e > -60], 90) - 30; q = e < thr; keep = np.ones(len(seg), bool); i = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if (j - i) / 100 > max_pause and i > 0 and j < len(q):
                a = int((i / 100 + max_pause / 2) * SR); b = int((j / 100 - max_pause / 2) * SR); keep[a:b] = False
            i = j
        else: i += 1
    return seg[keep]
def fade(s, k):                                               # short fade in / out at both ends of a piece: no clicks at the joins
    s = s.copy(); s[:k] *= np.linspace(0, 1, k); s[-k:] *= np.linspace(1, 0, k); return s
out, pieces, t = [], [], 0.0
gap = np.zeros(int(cfg.get('gap', 0.42) * SR))
for i, (k, a, b) in enumerate(cfg['pieces']):
    x = notes[k]; a2 = 0.0 if a <= 0.05 else quietest(x, a); b2 = len(x) / SR if b >= len(x) / SR - 0.05 else quietest(x, b)
    seg = x[int(a2 * SR): int(b2 * SR)] * gain[k]
    seg = tighten(seg, cfg.get('max_pause', 0.3)); seg = fade(seg, int(0.012 * SR))
    if i: out.append(gap); t += len(gap) / SR
    out.append(seg); pieces.append({'note': k, 'src_a': round(a2, 3), 'src_b': round(b2, 3), 'out_a': round(t, 3), 'out_b': round(t + len(seg) / SR, 3), 'gain_db': round(20 * np.log10(gain[k]), 2)}); t += len(seg) / SR
y = np.concatenate(out); pk = np.abs(y).max()
if pk > 0.97: y *= 0.97 / pk                                   # only if the matched gains would clip (a plain overall gain, no limiter)
n = int(np.ceil(len(y) / SR * FPS)); y = np.pad(y, (0, n * (SR // FPS) - len(y)))
st = np.stack([y, y], 1)
import wave
with wave.open('build/voice48k.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
json.dump({'fps': FPS, 'dur': round(n / FPS, 4), 'pieces': pieces, 'speech_level_dbfs': round(target, 1)}, open('build/cutmap.json', 'w'), indent=1)
for p in pieces: print(p)
print('voice', round(n / FPS, 2), 's; note gains (dB):', {k: round(20 * np.log10(g), 1) for k, g in gain.items()})
