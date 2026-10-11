"""Lay out the reel: his real on-camera hook + closer, the cloned narration lines, the CTA -> timeline.json
   python3 -I build_timeline.py [--no-asr]      (needs build/lines/*.wav from the voice clone; word times via faster-whisper)"""
import json, os, re, sys, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LINES = f'{HERE}/build/lines'
ASR = '--no-asr' not in sys.argv
TR = json.load(open(f'{HERE}/build/transcript.json'))
tw = {w['w'].strip().lower(): w for seg in TR for w in seg['words']}                        # not used directly; segments are indexed below
take1 = TR[0]['words']; take2 = TR[1]['words']

SCRIPT = [("L1", "Because this is Manchester City, Yas Residences, by Ohana.", "S1", False),
          ("L2", "The world's first Manchester City inspired residential destination, right on Yas Canal.", "S2", False),
          ("L3", "You're minutes from Ferrari World and Yas Marina Circuit, and the airport is {10–15|ten to fifteen} minutes away.", "S3", False),
          ("L4", "Townhouses, duplexes and villas, from {2|two} to {5|five} bedrooms, across {170|one hundred and seventy} hectares.", "S4", False),
          ("L5", "More than half of it is open space, with a crystal lagoon, a Manchester City training academy, and a canal promenade.", "S5", False),
          # price per sq ft (Phase 2 investment study, p4): AED 1,852 vs Orchids townhouse 2,470 (-25%), Yas luxury apartments avg 2,393
          ("L7", "Price per square foot starts at just {1,852|one thousand eight hundred and fifty-two} dirhams, which is {25%|twenty-five percent} below the latest Orchids townhouses.", "P1", False),
          ("L8", "That's even below the average Yas luxury apartment, for the first Manchester City-branded waterfront project.", "P2", True),
          ("L9", "And family townhouses at this level are scarce across recent Abu Dhabi launches.", "P3", False),
          ("L6", "That is what the investors saw.", "S6", False)]
CTA = ("CTA", "Comment CITY, and I will send you the {PHASE 2|phase two} details.")
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

def parse_script(text):
    """script words; {display|spoken} marks a figure that is spoken as words (e.g. {1,852|eighteen fifty-two})"""
    out = []
    for m in re.finditer(r"\{([^|}]+)\|([^}]+)\}|(\S+)", text):
        if m.group(1): out.append({'disp': m.group(1), 'num': bool(re.search(r'\d', m.group(1))), 'chars': len(m.group(2)) + 1})
        else: out.append({'disp': m.group(3).upper(), 'num': False, 'chars': len(m.group(3)) + 1})
    return out

def timed_words(text, asr, a, b):
    """(display, start, end) per script word: anchored on the ASR words that match, spread by length in between"""
    import difflib
    sw = parse_script(text); n = len(sw); T0 = [None] * n; T1 = [None] * n
    if asr:
        ns = ['#' if w['num'] else re.sub(r"[^a-z0-9']", '', w['disp'].lower()) for w in sw]
        na = [(('#' if re.search(r'\d', x[0]) else re.sub(r"[^a-z0-9']", '', x[0].lower())), x) for x in asr]; na = [q for q in na if q[0]]
        for blk in difflib.SequenceMatcher(None, ns, [q[0] for q in na], autojunk=False).get_matching_blocks():
            for k in range(blk.size): T0[blk.a + k], T1[blk.a + k] = max(a, na[blk.b + k][1][1]), na[blk.b + k][1][2]   # whisper often starts the first word at 0.0
    i = 0
    while i < n:
        if T0[i] is not None: i += 1; continue
        j = i
        while j < n and T0[j] is None: j += 1
        lo = T1[i - 1] if i > 0 else a; hi = T0[j] if j < n else b
        if hi - lo < 0.06 * (j - i): hi = lo + 0.06 * (j - i)
        ch = np.array([sw[k]['chars'] for k in range(i, j)], float); cum = np.concatenate([[0], np.cumsum(ch)]) / ch.sum()
        for k in range(i, j): T0[k], T1[k] = lo + (hi - lo) * cum[k - i], lo + (hi - lo) * cum[k - i + 1]
        i = j
    return [(sw[k]['disp'], T0[k], max(T1[k], T0[k] + 0.05)) for k in range(n)]

def disp(w):                                                   # on-screen form
    w = w.strip().upper()
    return re.sub(r'^\$?(\d{1,3}(?:,\d{3})+|\d{4})(?=\D*$)', lambda m: f"{int(m.group(1).replace(',', '')):,}", w)

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
for key, text, sid, cont in SCRIPT:
    p = f'{LINES}/{key}.wav'
    info = wav_info(p) if os.path.exists(p) else {'dur': len(text) / 14.0 + 0.4, 'a': 0.0, 'b': len(text) / 14.0 + 0.4, 'sr': 24000}
    sp = info['b'] - info['a']
    ws = timed_words(text, asr_words(p) if (ASR and os.path.exists(p)) else None, info['a'], info['b'])
    segs.append({'id': sid, 'type': 'shot', 'line': key, **({'cont': True} if cont else {}), 'a': round(t, 3), 'b': round(t + sp, 3), 'audio': {'file': p, 'start': info['a'], 'end': info['b'], 'at': round(t, 3)}})
    for (w, s, e) in ws: words.append({'t': round(t + (s - info['a']), 3), 'e': round(t + (e - info['a']), 3), 'text': disp(w), 'seg': segs[-1]['id']})
    t += sp + GAP
# 3) closer: his real take 2, "and phase two is dropping now"
C_SRC0, C0, C1 = 8.35, 10.60, 12.38
cl_words = [(w['w'].strip(), w['s'] - C0, w['e'] - C0) for w in take2 if C0 - 0.02 <= w['s'] < C1 - 0.05]
segs.append({'id': 'closer', 'type': 'cam', 'clip': 'closer', 'a': round(t, 3), 'b': round(t + (C1 - C0), 3), 'c0': round(C0 - C_SRC0, 3), 'src_a': C0, 'src_b': C1})
for (w, s, e) in cl_words: words.append({'t': round(t + max(0.0, s), 3), 'e': round(t + min(e, C1 - C0), 3), 'text': disp(w), 'seg': 'closer'})
t += (C1 - C0) + 0.10
# 4) CTA (cloned)
key, text = CTA; p = f'{LINES}/{key}.wav'
info = wav_info(p) if os.path.exists(p) else {'dur': 4.0, 'a': 0.0, 'b': 3.8, 'sr': 24000}; sp = info['b'] - info['a']
ws = timed_words(text, asr_words(p) if (ASR and os.path.exists(p)) else None, info['a'], info['b'])
segs.append({'id': 'END', 'type': 'shot', 'line': key, 'a': round(t, 3), 'b': round(t + sp + 1.1, 3), 'audio': {'file': p, 'start': info['a'], 'end': info['b'], 'at': round(t, 3)}})
for (w, s, e) in ws: words.append({'t': round(t + (s - info['a']), 3), 'e': round(t + (e - info['a']), 3), 'text': disp(w), 'seg': 'END'})
dur = segs[-1]['b'] + 0.25

# captions: group into short chunks (<=3 words, break on punctuation)
chunk, n, nch = 0, 0, 0
for i, w in enumerate(words):
    if i > 0 and (words[i - 1]['seg'] != w['seg'] or n >= 3 or nch + len(w['text']) > 21 or re.search(r'[,.?!]$', words[i - 1]['text'])): chunk += 1; n = 0; nch = 0
    w['chunk'] = chunk; n += 1; nch += len(w['text']) + 1
json.dump({'dur': round(dur, 3), 'fps': 30, 'segs': segs, 'words': words}, open(f'{HERE}/timeline.json', 'w'), indent=1)
print('timeline', round(dur, 2), 's |', ', '.join(f"{s['id']} {s['a']:.2f}-{s['b']:.2f}" for s in segs))
