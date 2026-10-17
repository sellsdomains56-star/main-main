"""Study PDF -> page images + highlight boxes (px at 300 dpi).
   python3 -I study_boxes.py render 4 5 7            # assets/study_p04.png ...
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
if cmd == 'render':
    os.makedirs('assets', exist_ok=True)
    for p in sys.argv[2:]: subprocess.run(['pdftoppm', '-f', p, '-l', p, '-r', '300', '-png', '-singlefile', PDF, 'assets/study_p%02d' % int(p)], check=True, stderr=subprocess.DEVNULL)
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
