"""Lay out the reel: his real on-camera hook + closer, the cloned narration lines, the CTA -> timeline.json
   python3 -I build_timeline.py [--no-asr]      (needs build/lines/*.wav from the voice clone; word times via faster-whisper)"""
import json, os, re, sys, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LINES = f'{HERE}/build/lines'
ASR = '--no-asr' not in sys.argv
TR = json.load(open(f'{HERE}/build/transcript.json'))
tw = {w['w'].strip().lower(): w for seg in TR for w in seg['words']}                        # not used directly; segments are indexed below
take1 = TR[0]['words']; take2 = TR[1]['words']

SCRIPT = [("L1", "Because this is Manchester City Yas Residences, by Ohana."),
          ("L2", "The world's first Manchester City inspired residential destination, right on Yas Canal."),
          ("L3", "You're minutes from Ferrari World and Yas Marina Circuit, and the airport is ten to fifteen minutes away."),
          ("L4", "Townhouses, duplexes and villas, from two to five bedrooms, across one hundred and seventy hectares."),
          ("L5", "More than half of it is open space, with a crystal lagoon, a Manchester City training academy, and a canal promenade."),
          ("L6", "That's what investors saw.")]
CTA = ("CTA", "Comment CITY, and I'll send you the phase two details.")
GAP = 0.16

def wav_info(path):
    """duration and the speech span (leading/trailing silence trimmed) of a generated line"""
    w = wave.open(path); sr = w.getframerate(); n = w.getnframes(); ch = w.getnchannels(); x = np.frombuffer(w.readframes(n), np.int16).astype(np.float32) / 32768
    x = x.reshape(-1, ch).mean(1) if ch > 1 else x; env = np.abs(x); k = int(0.01 * sr); env = np.convolve(env, np.ones(k) / k, 'same')
    idx = np.where(env > max(0.012, env.max() * 0.04))[0]; a = max(0, idx[0] - int(0.03 * sr)) / sr; b = min(n, idx[-1] + int(0.06 * sr)) / sr
    return {'sr': sr, 'dur': n / sr, 'a': a, 'b': b}

def asr_words(path):
    from faster_whisper import WhisperModel
    global _wm
    try: _wm
    except NameError: _wm = WhisperModel('small', device='cpu', compute_type='int8')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    segs, _ = _wm.transcribe(np.frombuffer(raw, np.float32), word_timestamps=True, beam_size=5, language='en')
    return [(w.word.strip(), w.start, w.end) for s in segs for w in (s.words or [])]

def fake_words(text, a, b):                                    # provisional timing: spread words by character count
    ws = text.split(); ch = np.array([len(w) + 1 for w in ws], float); cum = np.concatenate([[0], np.cumsum(ch)]) / ch.sum()
    return [(w, a + (b - a) * cum[i], a + (b - a) * cum[i + 1]) for i, w in enumerate(ws)]

def disp(w):                                                   # on-screen form
    w = w.strip(); lw = re.sub(r"[^a-z0-9']", '', w.lower())
    return w.upper()

segs, words, cues = [], [], {}
t = 0.0
# 1) hook: his real take 1, source 0.30 -> 4.85  (question only; the "keep watching" tail is cut)
H0, H1 = 0.30, 4.80
hook_words = [(w['w'].strip(), max(0.05, w['s'] - H0), w['e'] - H0) for w in take1 if H0 - 0.05 <= w['s'] < H1 - 0.1]
hook_txt = {'6': '6', '72': '72'}
segs.append({'id': 'hook', 'type': 'cam', 'clip': 'hook', 'a': 0.0, 'b': H1 - H0, 'c0': 0.0, 'src_a': H0, 'src_b': H1})
for (w, s, e) in hook_words: words.append({'t': round(s, 3), 'e': round(min(e, H1 - H0), 3), 'text': disp(w), 'seg': 'hook'})
t = H1 - H0 + 0.10
# 2) cloned narration lines
for key, text in SCRIPT:
    p = f'{LINES}/{key}.wav'
    info = wav_info(p) if os.path.exists(p) else {'dur': len(text) / 14.0 + 0.4, 'a': 0.0, 'b': len(text) / 14.0 + 0.4, 'sr': 24000}
    sp = info['b'] - info['a']
    ws = asr_words(p) if (ASR and os.path.exists(p)) else fake_words(text, info['a'], info['b'])
    segs.append({'id': {'L1': 'S1', 'L2': 'S2', 'L3': 'S3', 'L4': 'S4', 'L5': 'S5', 'L6': 'S6'}[key], 'type': 'shot', 'line': key, 'a': round(t, 3), 'b': round(t + sp, 3), 'audio': {'file': p, 'start': info['a'], 'end': info['b'], 'at': round(t, 3)}})
    for (w, s, e) in ws: words.append({'t': round(t + (s - info['a']), 3), 'e': round(t + (e - info['a']), 3), 'text': disp(w), 'seg': segs[-1]['id']})
    t += sp + GAP
# 3) closer: his real take 2, "and phase two is dropping now"
C_SRC0, C0, C1 = 8.35, 10.45, 12.38
cl_words = [(w['w'].strip(), w['s'] - C0, w['e'] - C0) for w in take2 if C0 - 0.02 <= w['s'] < C1 - 0.05]
segs.append({'id': 'closer', 'type': 'cam', 'clip': 'closer', 'a': round(t, 3), 'b': round(t + (C1 - C0), 3), 'c0': round(C0 - C_SRC0, 3), 'src_a': C0, 'src_b': C1})
for (w, s, e) in cl_words: words.append({'t': round(t + max(0.0, s), 3), 'e': round(t + min(e, C1 - C0), 3), 'text': disp(w), 'seg': 'closer'})
t += (C1 - C0) + 0.10
# 4) CTA (cloned)
key, text = CTA; p = f'{LINES}/{key}.wav'
info = wav_info(p) if os.path.exists(p) else {'dur': 4.0, 'a': 0.0, 'b': 3.8, 'sr': 24000}; sp = info['b'] - info['a']
ws = asr_words(p) if (ASR and os.path.exists(p)) else fake_words(text, info['a'], info['b'])
segs.append({'id': 'END', 'type': 'shot', 'line': key, 'a': round(t, 3), 'b': round(t + sp + 1.1, 3), 'audio': {'file': p, 'start': info['a'], 'end': info['b'], 'at': round(t, 3)}})
for (w, s, e) in ws: words.append({'t': round(t + (s - info['a']), 3), 'e': round(t + (e - info['a']), 3), 'text': disp(w), 'seg': 'END'})
dur = segs[-1]['b'] + 0.25

# captions: group into short chunks (<=3 words, break on punctuation)
chunk, n = 0, 0
for i, w in enumerate(words):
    if i > 0 and (words[i - 1]['seg'] != w['seg'] or n >= 3 or re.search(r'[,.?!]$', words[i - 1]['text'])): chunk += 1; n = 0
    w['chunk'] = chunk; n += 1
json.dump({'dur': round(dur, 3), 'fps': 30, 'segs': segs, 'words': words}, open(f'{HERE}/timeline.json', 'w'), indent=1)
print('timeline', round(dur, 2), 's |', ', '.join(f"{s['id']} {s['a']:.2f}-{s['b']:.2f}" for s in segs))
