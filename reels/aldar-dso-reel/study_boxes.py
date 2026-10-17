"""Study PDF -> page images + highlight boxes (px at 300 dpi).
   python3 -I study_boxes.py render 4 5 7            # assets/study_p04.png ... with the developers' names (Aldar, Dubai Holding, Greenwoods, Haven, Athlon, The Wilds) covered by dark bars
   python3 -I study_boxes.py render --plain 4 5 7    # the same pages with the names visible
   python3 -I study_boxes.py lines 13                # text lines of page 13 with word x-ranges (px)
   python3 -I study_boxes.py find 13 "AED 2.9–3.2m"  # bbox [x, y, w, h] (px) of the first match of the phrase (list of boxes if it wraps)"""
import sys, subprocess, os, logging, warnings
logging.disable(logging.CRITICAL); warnings.filterwarnings('ignore')
import pdfplumber
PDF = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'aldar-dso-townhouses', 'study', 'Aldar_Dubai_Townhouse_Study.pdf'); K = 300 / 72.0
def words(pn):
    with pdfplumber.open(PDF) as pdf: return pdf.pages[pn - 1].extract_words(use_text_flow=False, keep_blank_chars=False, extra_attrs=[])
def box(ws, pad=3): x0 = min(w['x0'] for w in ws) * K - pad; x1 = max(w['x1'] for w in ws) * K + pad; y0 = min(w['top'] for w in ws) * K - pad; y1 = max(w['bottom'] for w in ws) * K + pad; return [round(x0), round(y0), round(x1 - x0), round(y1 - y0)]
cmd = sys.argv[1]
NAMES = {'aldar', "aldar's", 'haven', "haven's", 'athlon', "athlon's", 'greenwoods', 'wilds', "wilds'", 'wilds.', 'wilds,', 'aldar,', 'aldar.', 'haven,', 'athlon,', 'haven.', 'athlon.'}
def name_boxes(pn):                                              # boxes (px) of every developer / project name on the page
    ws = sorted(words(pn), key=lambda w: (round(w['top'] / 2.5), w['x0'])); out = []; i = 0
    while i < len(ws):
        t = ws[i]['text'].lower().strip('()[]"\u201c\u201d·')
        nxt = ws[i + 1]['text'].lower() if i + 1 < len(ws) else ''
        same_line = i + 1 < len(ws) and abs(ws[i + 1]['top'] - ws[i]['top']) < 2.5
        if t == 'dubai' and nxt.startswith('holding') and same_line: out.append(box([ws[i], ws[i + 1]], 4)); i += 2; continue
        if t == 'the' and nxt.startswith('wilds') and same_line: out.append(box([ws[i], ws[i + 1]], 4)); i += 2; continue
        if t in NAMES: out.append(box([ws[i]], 4))
        i += 1
    return out
if cmd == 'render':
    from PIL import Image, ImageDraw
    os.makedirs('assets', exist_ok=True); plain = '--plain' in sys.argv; pages = [a for a in sys.argv[2:] if a != '--plain']
    for p in pages:
        out = 'assets/study_p%02d' % int(p); subprocess.run(['pdftoppm', '-f', p, '-l', p, '-r', '300', '-png', '-singlefile', PDF, out], check=True, stderr=subprocess.DEVNULL)
        if plain: continue
        im = Image.open(out + '.png').convert('RGB'); d = ImageDraw.Draw(im); bx = name_boxes(int(p))
        for x, y, w, h in bx: d.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=(18, 18, 22))
        im.save(out + '.png'); print('page', p, ':', len(bx), 'names covered')
elif cmd == 'lines':
    ws = sorted(words(int(sys.argv[2])), key=lambda w: (round(w['top']), w['x0'])); cur = []; ytop = None
    def flush():
        if cur: print('y=%4d-%4d | %s' % (min(w['top'] for w in cur) * K, max(w['bottom'] for w in cur) * K, ' '.join('%s[%d]' % (w['text'], w['x0'] * K) for w in cur)))
    for w in ws:
        if ytop is None or abs(w['top'] - ytop) > 2.5: flush(); cur = []; ytop = w['top']
        cur.append(w)
    flush()
elif cmd == 'find':
    ws = sorted(words(int(sys.argv[2])), key=lambda w: (round(w['top'] / 2.5), w['x0'])); toks = sys.argv[3].split(); n = len(toks)
    for i in range(len(ws) - n + 1):
        if [w['text'] for w in ws[i:i + n]] == toks:
            seg = ws[i:i + n]; lines = {}
            for w in seg: lines.setdefault(round(w['top'] / 2.5), []).append(w)
            print([box(v) for v in lines.values()]); break
    else: print('not found')
