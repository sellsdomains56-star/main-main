"""Build the voice + hook footage for the Ohana townhouse reel.
   hook  = his on-camera take (IMG_5838.MP4, source 0.30 -> 4.80): "Why did investors put 6 billion into this project in just 72 hours?"
   voice = the supplied recording of the townhouse script (147d7c51-3333.mp4, audio only)
   python3 -I prep_ohana.py <hook.mp4> <voice.mp4>   ->  build/voice48k.wav  build/footage/f_%05d.jpg  build/cutmap.json"""
import json, subprocess, sys, os, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
HOOK, VOICE = sys.argv[1], sys.argv[2]; H0, H1, GAP, SR, FPS = 0.62, 4.80, 0.30, 48000, 30
os.makedirs('build/footage', exist_ok=True)
def pcm(src, a=None, b=None):
    cmd = ['ffmpeg', '-v', 'error'] + (['-ss', str(a), '-to', str(b)] if a is not None else []) + ['-i', src, '-vn', '-ac', '2', '-ar', str(SR), '-f', 's16le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.int16).reshape(-1, 2).astype(np.float32) / 32768
n_hook = round((H1 - H0) * FPS); hook = pcm(HOOK, H0, H0 + n_hook / FPS); voice = pcm(VOICE)
def fade(x, ms=6):
    k = int(ms / 1000 * SR); x = x.copy(); x[:k] *= np.linspace(0, 1, k)[:, None]; x[-k:] *= np.linspace(1, 0, k)[:, None]; return x
parts = [fade(hook), np.zeros((int(GAP * SR), 2), np.float32), fade(voice)]
audio = np.concatenate(parts); raw = 'build/voice_raw.wav'
with wave.open(raw, 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(audio, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', 'highpass=f=80,afftdn=nr=9:nf=-48:tn=1,acompressor=threshold=0.09:ratio=3:attack=6:release=140:makeup=2.2,equalizer=f=3000:t=q:w=1.1:g=1.8,alimiter=limit=0.9', '-ar', str(SR), '-ac', '2', 'build/voice48k.wav'], check=True)
dur = len(audio) / SR; hook_end = n_hook / FPS; voice_start = hook_end + GAP
json.dump({'fps': FPS, 'dur': round(dur, 4), 'hook_end': hook_end, 'voice_start': voice_start, 'hook_src': [H0, H1]}, open('build/cutmap.json', 'w'), indent=1)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{H0:.4f}', '-i', HOOK, '-frames:v', str(n_hook), '-vf', f'fps={FPS},scale=1620:2880:flags=lanczos', '-q:v', '3', '-start_number', '0', 'build/footage/f_%05d.jpg'], check=True)
print('voice', round(dur, 2), 's; hook', round(hook_end, 2), 's; voice starts', round(voice_start, 2), '; frames', len(os.listdir('build/footage')))
