"""Whisper often starts the first word after a pause too early (it uses the end of the previous word). This moves such word starts to the real speech onset
   (first 5 ms frame above -42 dBFS after the pause), so captions and graphics land ON the word, not before it.
   python3 -I snap_onsets.py [voice48k.wav] [timeline.json]      run after make_timeline.py; idempotent"""
import sys, json, wave
import numpy as np
wav = sys.argv[1] if len(sys.argv) > 1 else 'build/voice48k.wav'; tlp = sys.argv[2] if len(sys.argv) > 2 else 'timeline.json'
w = wave.open(wav); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels()).astype(np.float32).mean(1) / 32768
hop = int(0.005 * sr); n = int(0.010 * sr); env = 20 * np.log10(np.array([np.sqrt((x[i:i + n] ** 2).mean() + 1e-12) for i in range(0, len(x) - n, hop)]) + 1e-9)
tl = json.load(open(tlp)); words = tl['words']; moved = 0
for i, wd in enumerate(words):
    prev_e = words[i - 1]['e'] if i else 0.0
    if wd['t'] - prev_e < 0.12 and i: continue                      # no pause before this word: the ASR start is fine
    lo = max(prev_e - 0.3, 0.0); hi = wd['t'] + 1.0
    seg = env[int(lo / 0.005):int(hi / 0.005)]; quiet = np.convolve((seg < -50).astype(int), np.ones(10, int), 'valid') >= 10      # >= 50 ms below -50 dBFS = a real pause
    q = np.where(quiet)[0]
    if not len(q): continue
    after = np.where(seg[q[0] + 10:] > -42)[0]                      # first speech frame after that pause
    if not len(after): continue
    on = round(lo + (q[0] + 10 + after[0]) * 0.005 - 0.02, 3)       # 20 ms lead-in: the caption appears a hair before the sound
    if on > wd['t'] + 0.06 and on < wd['e'] + 0.5:
        print('%-14s %.2f -> %.2f' % (wd['text'], wd['t'], on)); wd['t'] = on; moved += 1
        if wd['e'] < on + 0.05: wd['e'] = round(on + 0.12, 3)
json.dump(tl, open(tlp, 'w'), indent=0); print('moved', moved, 'word starts')
