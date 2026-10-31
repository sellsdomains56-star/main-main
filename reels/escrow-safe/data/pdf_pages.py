"""Law No. (8) of 2007 (Dubai Legislation Portal PDF) -> assets/law8_p<N>.png + .json in shot_hl's format: each page cropped to its text column (x 76-520 pt) and rendered 1075 px wide,
with the exact boxes (image px, one per line) of each quoted phrase.   python3 -I data/pdf_pages.py <law8_2007.pdf>"""
import json, re, sys, os
import pdfplumber
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
URL = 'https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(8)%20of%202007.pdf'
WANT = {2: ['The financial or banking institution accredited by the Department to manage an Escrow Account.'],
        3: ['Any Developer who wishes to sell Units off-plan must submit to the Department a request to open an Escrow Account.'],
        4: ['will be dedicated exclusively to the construction of that Real Estate Development project.',
            'No attachment may be imposed on the payments deposited in this account for the benefit of the creditors of the Developer.'],
        5: ['An Escrow Agent must retain five percent (5%) of the total value of each Escrow Account once the Developer obtains the completion certificate.',
            'The retained amount will be released to the Developer one (1) year from the registration of Units in the name of purchasers.',
            'ensure that the Real Estate Development project is completed, or depositors are refunded their payments.']}
norm = lambda s: re.sub(r'[^a-z0-9%()]', '', s.lower())
pdf = pdfplumber.open(sys.argv[1])
for pn, phrases in WANT.items():
    X0, X1 = 76, 520; full = pdf.pages[pn - 1]; pg = full.crop((X0, 0, X1, full.height)); sc = 1075 / (X1 - X0)
    im = pg.to_image(resolution=72 * sc).original.convert('RGB'); name = f'law8_p{pn}'; im.save(f'assets/{name}.png')
    words = pg.extract_words(keep_blank_chars=False, use_text_flow=True)
    toks = [(norm(w['text']), w) for w in words]; out = []
    for ph in phrases:
        target = norm(ph); found = None
        for i in range(len(toks)):
            acc = ''; j = i
            while j < len(toks) and len(acc) < len(target) and target.startswith(acc + toks[j][0]): acc += toks[j][0]; j += 1
            if acc == target: found = [w for _, w in toks[i:j]]; break
        lines = {}
        for w in found or []:
            k = round(w['top'] / 3); l = lines.setdefault(k, [w['x0'], w['top'], w['x1'], w['bottom']])
            l[0], l[1], l[2], l[3] = min(l[0], w['x0']), min(l[1], w['top']), max(l[2], w['x1']), max(l[3], w['bottom'])
        bb = [[round((a - X0) * sc), round((b - 2) * sc), round((c - a) * sc), round((d - b + 4) * sc)] for a, b, c, d in sorted(lines.values(), key=lambda v: v[1])]
        print(name, 'FOUND' if found else 'MISSING', ph[:60], bb); out.append({'phrase': ph, 'bbox': bb})
    json.dump({'url': URL + f'#page={pn}', 'title': 'Law No. (8) of 2007 Concerning Escrow Accounts', 'w': im.size[0], 'h': im.size[1], 'boxes': out}, open(f'assets/{name}.json', 'w'), indent=1)
