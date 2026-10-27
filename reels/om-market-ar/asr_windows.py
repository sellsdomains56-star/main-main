"""Word timings window by window (faster-whisper large-v3, English forced) - use it when the one-pass asr_words.py skips a stretch or drifts into another language.
   python3 -I asr_windows.py <voice.wav> <out_words_raw.json> 0-26,25-32,32.5-41 [prompt]
   Overlap the windows by ~1 s; words that start before the previous window's last kept word are dropped, so the join is clean."""
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
wav, out, spec = sys.argv[1:4]; prompt = sys.argv[4] if len(sys.argv) > 4 else None
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32); SR = 16000
wm = WhisperModel('large-v3', device='cpu', compute_type='int8'); res = []
for w in spec.split(','):
    a, b = map(float, w.split('-'))
    segs, _ = wm.transcribe(x[int(a * SR):int(b * SR)], word_timestamps=True, beam_size=5, language='en', condition_on_previous_text=False, vad_filter=False,
                            no_speech_threshold=0.9, compression_ratio_threshold=3.0, log_prob_threshold=-2.0, initial_prompt=prompt)
    ws = [{'w': t.word.strip(), 's': round(t.start + a, 3), 'e': round(t.end + a, 3)} for s in segs for t in (s.words or [])]
    last = res[-1]['e'] if res else -1
    res += [t for t in ws if t['s'] >= last - 0.05]; print(f'{a}-{b}:', ' '.join(t['w'] for t in ws), flush=True)
json.dump(res, open(out, 'w'), indent=0); print(len(res), 'words')
