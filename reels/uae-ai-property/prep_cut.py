"""Clean cut of the raw footage: keep only the good takes (EDL in cut.json), drop pauses / retakes / asides, clean the voice,
   and extract the matching video frames (30 fps, 1620x2880) so the reel renderer can use them.
   python3 -I prep_cut.py cut.json        ->  build/voice48k.wav  build/footage/f_%05d.jpg  build/cutmap.json"""
import json, subprocess, sys, os, wave
import numpy as np
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
cfg = json.load(open(sys.argv[1])); FPS, SR = 30, 48000; SPF = SR // FPS
os.makedirs('build/footage', exist_ok=True)
w = wave.open(cfg['audio48']); assert w.getframerate() == SR
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768
segs, chunks, out_audio, f0 = [], [], [], 0
for a, b in cfg['segments']:
    n = max(1, round((b - a) * FPS)); i0 = int(round(a * SR)); seg = x[i0:i0 + n * SPF].copy()
    if len(seg) < n * SPF: seg = np.pad(seg, ((0, n * SPF - len(seg)), (0, 0)))
    k = int(0.006 * SR); seg[:k] *= np.linspace(0, 1, k)[:, None]; seg[-k:] *= np.linspace(1, 0, k)[:, None]       # 6 ms edge fades: no clicks at the joins
    out_audio.append(seg); segs.append({'src_a': a, 'src_b': round(a + n / FPS, 4), 'out_a': round(f0 / FPS, 4), 'out_b': round((f0 + n) / FPS, 4), 'f0': f0, 'n': n})
    for c in range(0, n, 240): chunks.append((a + c / FPS, min(240, n - c), f0 + c))
    f0 += n
audio = np.concatenate(out_audio); raw_wav = 'build/voice_raw.wav'
with wave.open(raw_wav, 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(audio, -1, 1) * 32767).astype('<i2').tobytes())
# voice clean-up: rumble out, gentle denoise, even out the level, a little presence
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw_wav, '-af', cfg.get('chain', 'highpass=f=80,afftdn=nr=9:nf=-48:tn=1,acompressor=threshold=0.09:ratio=3:attack=6:release=140:makeup=2.2,equalizer=f=3000:t=q:w=1.1:g=1.8,alimiter=limit=0.9'), '-ar', str(SR), '-ac', '2', 'build/voice48k.wav'], check=True)
json.dump({'fps': FPS, 'dur': f0 / FPS, 'segs': segs}, open('build/cutmap.json', 'w'), indent=1)
print('cut', round(f0 / FPS, 2), 's from', len(segs), 'pieces;', len(chunks), 'frame jobs')
def job(c):
    t, n, s0 = c
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.4f}', '-i', cfg['src'], '-frames:v', str(n), '-vf', f'fps={FPS},scale=1620:2880:flags=lanczos', '-q:v', '3', '-start_number', str(s0), 'build/footage/f_%05d.jpg'], check=True)
with ThreadPoolExecutor(4) as ex: list(ex.map(job, chunks))
print('frames', len(os.listdir('build/footage')))
