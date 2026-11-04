"""assets/*.json (shot_hl.mjs) -> pagedata.js: PAGES = {name: {h, url, boxes: [rects of each quoted phrase, in search order], phrases}}.   python3 -I make_pagedata.py"""
import json, glob, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
P = {}
for f in sorted(glob.glob('assets/*.json')):
    d = json.load(open(f)); k = os.path.basename(f)[:-5]
    if 'boxes' not in d or not os.path.exists(f'assets/{k}.png'): continue
    P[k] = {'h': d['h'], 'url': d['url'], 'boxes': [b['bbox'] for b in d['boxes']], 'phrases': [b['phrase'] for b in d['boxes']]}
    for b in d['boxes']:
        if not b['bbox']: print('  NOT FOUND on', k, ':', b['phrase'])
open('pagedata.js', 'w').write("'use strict';\n// the captured pages (shot_hl.mjs): image height, url and the exact boxes (image px) of each quoted phrase, in the order they were searched for\nconst PAGES = " + json.dumps(P, separators=(',', ':')) + ';\n')
print(len(P), 'pages:', ', '.join(f"{k} ({len(v['boxes'])})" for k, v in P.items()))
