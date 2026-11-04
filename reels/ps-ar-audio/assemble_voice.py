"""Edit his raw Zoom recordings into voiceovers - his voice untouched: no stretch, no filters, no compressor. Only: cuts (placed in the quietest spot near each
boundary, or exactly at a word gap when a piece is marked "x"), 12 ms fades at the joins, a short pause between pieces, pauses longer than max_pause inside a
piece shortened, and one plain overall gain to the target speech loudness (never past -1 dBFS peak; no limiter).
   python3 -I assemble_voice.py edl.json      ->  build/<name>.wav for every voiceover in the EDL, + build/<name>.json (pieces, times)
edl.json: {"notes": {"z5": "<path>", ...}, "voices": {"<name>": [["z5", a, b] | ["z6", a, b, "xa" (exact start) / "xb" (exact end) / "x" (both)], ...]},
           "gap": 0.38, "max_pause": 0.3, "lufs": -16, "trim_edges": false}"""
import json, subprocess, sys, os, re, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
cfg = json.load(open(sys.argv[1])); SR = 48000
def load(p):                                                   # mono float, 48 kHz (the stereo Zoom track is averaged; nothing else is changed)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
notes = {k: load(v) for k, v in cfg['notes'].items()}
def env_db(x, hop=480):                                        # 10 ms frames, dBFS
    n = len(x) // hop; return 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
def quietest(x, t, span=0.3):                                  # cut point: the middle of the longest silence within +-span of t (never inside a word)
    e = env_db(x); thr = np.percentile(e[e > -60], 90) - 30; i0, i1 = max(0, int((t - span) * 100)), min(len(e) - 1, int((t + span) * 100))
    best, i = (0, int(t * 100)), i0
    while i <= i1:
        if e[i] < thr:
            j = i
            while j <= i1 and e[j] < thr: j += 1
            if j - i > best[0]: best = (j - i, (i + j) // 2)
            i = j
        else: i += 1
    if best[0] < 3: print(f'  warning: no clear pause near {t:.2f}s')
    return best[1] / 100
def lowest(x, t, span=0.06):                                   # exact cut at a word gap: the quietest 5 ms within +-span of t
    h = 240; i0 = max(0, int((t - span) * SR) // h); i1 = int((t + span) * SR) // h; seg = x[i0 * h: (i1 + 1) * h]
    n = len(seg) // h; e = (seg[: n * h].reshape(n, h) ** 2).mean(1); return (i0 + int(np.argmin(e)) + 0.5) * h / SR
def note_thr(x): e = env_db(x); return np.percentile(e[e > -60], 90) - 30                     # silence threshold from the whole recording (not the piece)
def trim(seg, x, keep=0.04):                                   # drop the silence at the start and end of a piece, keep 40 ms
    e = env_db(seg); v = np.where(e >= note_thr(x))[0]
    if not len(v): return seg
    a = max(0, int((v[0] / 100 - keep) * SR)); b = min(len(seg), int(((v[-1] + 1) / 100 + keep) * SR)); return seg[a:b]
def tighten(seg, max_pause, x=None):                           # pauses longer than max_pause inside a piece -> max_pause (cut in the middle of the silence)
    e = env_db(seg); thr = note_thr(x) if x is not None else np.percentile(e[e > -60], 90) - 30; q = e < thr; keep = np.ones(len(seg), bool); i = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if (j - i) / 100 > max_pause and i > 0 and j < len(q):
                a = int((i / 100 + max_pause / 2) * SR); b = int((j / 100 - max_pause / 2) * SR); keep[a:b] = False
            i = j
        else: i += 1
    return seg[keep]
def fade(s, k): s = s.copy(); s[:k] *= np.linspace(0, 1, k); s[-k:] *= np.linspace(1, 0, k); return s
def lufs(y):                                                   # integrated loudness (ffmpeg ebur128) of a mono float signal
    p = subprocess.run(['ffmpeg', '-v', 'info', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=y.astype('<f8').tobytes(), capture_output=True).stderr.decode()
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', p)[-1])
for name, plist in cfg['voices'].items():
    out, pieces, t = [], [], 0.0; gap = np.zeros(int(cfg.get('gap', 0.38) * SR))
    for i, p in enumerate(plist):
        k, a, b = p[:3]; mode = p[3] if len(p) > 3 else ''; x = notes[k]
        a2 = lowest(x, a) if 'x' in mode and mode != 'xb' else (0.0 if a <= 0.05 else quietest(x, a))
        b2 = lowest(x, b) if 'x' in mode and mode != 'xa' else (len(x) / SR if b >= len(x) / SR - 0.05 else quietest(x, b))
        seg = x[int(a2 * SR): int(b2 * SR)]
        if cfg.get('trim_edges'): seg = trim(seg, x)                                   # no silence kept at either end of a piece: the pieces sit next to each other
        seg = tighten(seg, cfg.get('max_pause', 0.3), x); seg = fade(seg, int(0.012 * SR))
        if i: out.append(gap); t += len(gap) / SR
        out.append(seg); pieces.append({'note': k, 'src_a': round(a2, 3), 'src_b': round(b2, 3), 'out_a': round(t, 3), 'out_b': round(t + len(seg) / SR, 3)}); t += len(seg) / SR
    y = np.concatenate(out); l0 = lufs(y); g = 10 ** ((cfg.get('lufs', -16) - l0) / 20); pk = np.abs(y).max() * g
    if pk > 10 ** (-1 / 20): g *= 10 ** (-1 / 20) / pk                                    # a plain gain only: capped so the peak stays at -1 dBFS
    y = y * g; st = np.stack([y, y], 1)
    with wave.open(f'build/{name}.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
    json.dump({'dur': round(len(y) / SR, 3), 'gain_db': round(20 * np.log10(g), 2), 'lufs_in': l0, 'pieces': pieces}, open(f'build/{name}.json', 'w'), indent=1)
    print(name, round(len(y) / SR, 2), 's | gain', round(20 * np.log10(g), 1), 'dB | loudness', round(lufs(y), 1), 'LUFS | peak', round(20 * np.log10(np.abs(y).max()), 1), 'dBFS')
    for p in pieces: print('   ', p)
