"""script.txt (the spoken words, {display|spoken} for figures) + words_raw.json (ASR of the cleaned voice) + cutmap.json -> timeline.json.
   python3 -I make_timeline.py [extra_seconds]     (extra = silent end card appended after the voice)"""
import json, re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
extra = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
cm = json.load(open('build/cutmap.json')); raw = json.load(open('build/words_raw.json')); script = open('script.txt').read().strip()
import difflib
def parse_script(text):
    out = []
    for m in re.finditer(r"\{([^|}]+)\|([^}]+)\}|(\S+)", text):
        if m.group(1): out.append({'disp': m.group(1), 'num': True, 'chars': len(m.group(2)) + 1})
        else:
            tok = m.group(3); out.append({'disp': tok, 'num': bool(re.search(r'\d', tok)), 'chars': len(tok) + 1})
    return out
sw = parse_script(script); n = len(sw); T0 = [None] * n; T1 = [None] * n
ns = ['#' if w['num'] else re.sub(r"[^a-z']", '', w['disp'].lower()) for w in sw]
na = [(('#' if re.search(r'\d', r['w']) else re.sub(r"[^a-z']", '', r['w'].lower())), r) for r in raw]; na = [q for q in na if q[0]]
for blk in difflib.SequenceMatcher(None, ns, [q[0] for q in na], autojunk=False).get_matching_blocks():
    for k in range(blk.size): T0[blk.a + k], T1[blk.a + k] = na[blk.b + k][1]['s'], na[blk.b + k][1]['e']
i = 0
while i < n:
    if T0[i] is not None: i += 1; continue
    j = i
    while j < n and T0[j] is None: j += 1
    lo = T1[i - 1] if i > 0 else raw[0]['s']; hi = T0[j] if j < n else raw[-1]['e']
    if hi - lo < 0.06 * (j - i): hi = lo + 0.06 * (j - i)
    ch = [sw[k]['chars'] for k in range(i, j)]; tot = float(sum(ch)); acc = 0
    for k in range(i, j): T0[k] = lo + (hi - lo) * acc / tot; acc += sw[k]['chars']; T1[k] = lo + (hi - lo) * acc / tot
    i = j
words = [{'t': round(T0[k], 3), 'e': round(max(T1[k], T0[k] + 0.05), 3), 'text': sw[k]['disp']} for k in range(n)]
print('matched', sum(1 for blk in difflib.SequenceMatcher(None, ns, [q[0] for q in na], autojunk=False).get_matching_blocks() for _ in range(blk.size)), 'of', n, 'script words')
chunk, c, nch = 0, 0, 0
for i, w in enumerate(words):
    if i > 0 and (c >= 3 or nch + len(w['text']) > 21 or re.search(r'[,.?!:]$', words[i - 1]['text'])): chunk += 1; c = 0; nch = 0
    w['chunk'] = chunk; c += 1; nch += len(w['text']) + 1
json.dump({'fps': 30, 'frames': round(cm['dur'] * 30), 'voice_dur': cm['dur'], 'dur': round(cm['dur'] + extra, 3), 'words': words}, open('timeline.json', 'w'), indent=0)
print(len(words), 'words |', round(cm['dur'] + extra, 2), 's')
