"""Mute spoken words in a voice track. usage: mute_words.py in.wav out.wav '[[asr_start, asr_end], ...]'  (windows are snapped to the nearest energy valleys, 8 ms fades)"""
import sys, json, subprocess, numpy as np
SR = 48000
inp, outp, spans = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
raw = subprocess.run(['ffmpeg','-v','error','-i',inp,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy(); m = x.mean(1)
fr = int(0.01 * SR); n = len(m) // fr
e = 10 * np.log10(np.array([np.mean(m[i*fr:(i+1)*fr] ** 2) for i in range(n)]) + 1e-12)
es = np.convolve(e, np.ones(2)/2, 'same')
def valley(t0, t1):
    i0, i1 = int(t0 / 0.01), int(t1 / 0.01); k = i0 + int(np.argmin(es[i0:i1+1])); return (k + .5) * 0.01
gain = np.ones(len(x))
res = []
for a, b in spans:
    s, t = (a, b) if '--exact' in sys.argv else (valley(a - 0.20, a + 0.02), valley(b - 0.06, b + 0.06))
    res.append((round(s, 3), round(t, 3)))
    i, j = int(s * SR), int(t * SR); f = int(0.008 * SR)
    gain[i:j] = 0
    gain[i - f:i] = np.minimum(gain[i - f:i], np.linspace(1, 0, f)); gain[j:j + f] = np.minimum(gain[j:j + f], np.linspace(0, 1, f))
x *= gain[:, None].astype(np.float32)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ac','2','-ar',str(SR),'-i','-','-c:a','pcm_s16le',outp],input=x.tobytes(),check=True)
print(json.dumps(res))
