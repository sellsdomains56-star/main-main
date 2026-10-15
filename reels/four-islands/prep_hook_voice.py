"""Build the voice track (and the face footage, if any) for a reel made of an optional on-camera HOOK clip + a recorded VOICE-OVER.
   Run it inside the reel folder (it writes ./build/).
     python3 -I prep_hook_voice.py --voice voice.mp4                                   voice-over only (no face beat)
     python3 -I prep_hook_voice.py --voice voice.mp4 --hook take.mp4 --hook-start 0.62 --hook-end 4.80 [--gap 0.30]
   ->  build/voice48k.wav   build/cutmap.json {dur, hook_end, voice_start}   build/footage/f_%05d.jpg (30 fps, 1620x2880; the hook only)
   Pick --hook-start / --hook-end at the silences around the hook sentence (scripts/edl_tools.py env ... shows the energy): start a hair before the first
   word, end after the last word has fully decayed. Then FACE_SEGS = [[0, hook_end]] and FOOT_MAX = frames-1 in scenes.js."""
import argparse, json, subprocess, os, wave
import numpy as np
ap = argparse.ArgumentParser()
ap.add_argument('--voice', required=True); ap.add_argument('--hook'); ap.add_argument('--hook-start', type=float, default=0.0); ap.add_argument('--hook-end', type=float, default=4.0)
ap.add_argument('--gap', type=float, default=0.30)
ap.add_argument('--chain', default='highpass=f=80,afftdn=nr=9:nf=-48:tn=1,acompressor=threshold=0.09:ratio=3:attack=6:release=140:makeup=2.2,equalizer=f=3000:t=q:w=1.1:g=1.8,alimiter=limit=0.9')
a = ap.parse_args(); SR, FPS = 48000, 30
os.makedirs('build/footage', exist_ok=True)
def pcm(src, t0=None, t1=None):
    cmd = ['ffmpeg', '-v', 'error'] + (['-ss', str(t0), '-to', str(t1)] if t0 is not None else []) + ['-i', src, '-vn', '-ac', '2', '-ar', str(SR), '-f', 's16le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.int16).reshape(-1, 2).astype(np.float32) / 32768
def fade(x, ms=6):                                                  # 6 ms edge fades: no clicks at the joins
    k = int(ms / 1000 * SR); x = x.copy(); x[:k] *= np.linspace(0, 1, k)[:, None]; x[-k:] *= np.linspace(1, 0, k)[:, None]; return x
voice = pcm(a.voice); parts, hook_end, voice_start, n_hook = [], 0.0, 0.0, 0
if a.hook:
    n_hook = round((a.hook_end - a.hook_start) * FPS); hook = pcm(a.hook, a.hook_start, a.hook_start + n_hook / FPS)
    parts += [fade(hook), np.zeros((int(a.gap * SR), 2), np.float32)]; hook_end = n_hook / FPS; voice_start = hook_end + a.gap
parts.append(fade(voice)); audio = np.concatenate(parts); raw = 'build/voice_raw.wav'
with wave.open(raw, 'wb') as o: o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(audio, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', a.chain, '-ar', str(SR), '-ac', '2', 'build/voice48k.wav'], check=True)
json.dump({'fps': FPS, 'dur': round(len(audio) / SR, 4), 'hook_end': hook_end, 'voice_start': voice_start, 'hook_src': [a.hook_start, a.hook_end] if a.hook else None}, open('build/cutmap.json', 'w'), indent=1)
if a.hook:
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{a.hook_start:.4f}', '-i', a.hook, '-frames:v', str(n_hook), '-vf', f'fps={FPS},scale=1620:2880:flags=lanczos', '-q:v', '3', '-start_number', '0', 'build/footage/f_%05d.jpg'], check=True)
print('voice track', round(len(audio) / SR, 2), 's | hook', round(hook_end, 2), 's | voice starts', round(voice_start, 2), '| footage frames', len(os.listdir('build/footage')))
