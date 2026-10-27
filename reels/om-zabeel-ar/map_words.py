"""Source-note word times -> times in build/voice48k.wav (assemble_voice.py's cutmap.json: piece starts + the pauses it shortened), so no second ASR pass is needed.
   python3 -I map_words.py <note words.json> -> build/words_raw.json  ([{w, s, e}] like asr_words.py)"""
import json, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
cm = json.load(open('build/cutmap.json')); src = json.load(open(sys.argv[1])); src = src['words'] if isinstance(src, dict) else src
def m(t):
    for p in cm['pieces']:
        if p['src_a'] - 1e-6 <= t <= p['src_b'] + 1e-6:
            gone = sum(min(t, b) - a for a, b in p['cuts'] if t > a)
            return round(p['out_a'] + (t - p['src_a']) - gone, 3)
    return None
out = []
for w in src:
    s, e = w.get('s', w.get('start')), w.get('e', w.get('end')); ms, me = m(s), m(e)
    if ms is None or me is None: continue
    out.append({'w': w.get('w', w.get('word', '')).strip(), 's': ms, 'e': max(me, ms + 0.05)})
json.dump(out, open('build/words_raw.json', 'w'), indent=0); print(len(out), 'words mapped;', ' '.join(x['w'] for x in out)[:300])
