"""Word timings for a cleaned voice track (faster-whisper large-v3).   python3 -I asr_words.py <wav> <out.json> [prompt]"""
import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
wav, out = sys.argv[1], sys.argv[2]; prompt = sys.argv[3] if len(sys.argv) > 3 else None
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
wm = WhisperModel('large-v3', device='cpu', compute_type='int8')
segs, _ = wm.transcribe(x, word_timestamps=True, beam_size=5, language=__import__('os').environ.get('ASR_LANG','en'), condition_on_previous_text=False, initial_prompt=prompt)
res = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in (s.words or [])]
json.dump(res, open(out, 'w'), indent=0); print(len(res), 'words'); print(' '.join(r['w'] for r in res))
