"""Assemble the Arabic study: python3 -I src_ar/build_ar.py <study.html (English)> <pages_ar_dir> <out.html>
   pages_ar_dir holds pages_ar_1..4.html (the translated <section> pages, tags identical to the English ones).
   RTL layout, IBM Plex Sans Arabic (fonts_ar/) for Arabic with Inter for digits/Latin, charts_ar/ SVGs inlined so they use the page fonts."""
import sys, os, re
en, pdir, out = sys.argv[1:4]
s = open(en).read()
head = s[:s.index('<body>')]
pages = ''.join(open(os.path.join(pdir, f'pages_ar_{i}.html')).read() if os.path.exists(os.path.join(pdir, f'pages_ar_{i}.html')) else '' for i in range(1, 5))
head = head.replace('<html lang="en">', '<html lang="ar" dir="rtl">').replace('<title>Aldar Dubai townhouse study</title>', '<title>دراسة التاون هاوس - الدار في دبي</title>')
flips = [("th { text-align: left;", "th { text-align: right;"), ("ul.bul, ol.find, ol.chk, ul.src { padding-left: 4.2mm }", "ul.bul, ol.find, ol.chk, ul.src { padding-right: 4.2mm }"),
         ("border-left: 3px solid #E9C47C", "border-right: 3px solid #E9C47C"), (".tl i { position: absolute; top: -4.6px; left: 0;", ".tl i { position: absolute; top: -4.6px; right: 0;"),
         ("border-radius: 3mm; margin-right: 1mm;", "border-radius: 3mm; margin-left: 1mm;"), ("body { font-family: 'Inter', sans-serif;", "body { font-family: 'Inter', 'IBM Plex Sans Arabic', sans-serif;")]
for a, b in flips:
    assert a in head, a; head = head.replace(a, b)
ff = ''.join(f"@font-face {{ font-family: 'IBM Plex Sans Arabic'; font-weight: {w}; src: url('fonts_ar/plex-arabic-{w}.woff2') format('woff2'); unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F }}\n" for w in (400, 500, 600, 700))
extra = """* { letter-spacing: normal !important }                 /* letter-spacing breaks Arabic joining */
body { line-height: 1.55 } h2 { line-height: 1.3 } .cover h1 { line-height: 1.25 } .lead { line-height: 1.45 }
bdi { white-space: nowrap } div.fig { margin: 1.5mm 0 2mm } div.fig svg { display: block; width: 100%; height: auto; direction: ltr; overflow: visible }
"""
head = head.replace('</style>', ff + extra + '</style>')
# numbers inside right-to-left text: signed values, ranges and chains ("−38%", "+9.5%", "1,400–1,650", "1,214 → 1,277") stay left-to-right;
# an arrow between words points right-to-left
NUMX = re.compile(r'(?:n=)?[+\-−]?\d[\d,.]*%?(?:\s*[–→/-]\s*[+\-−]?\d[\d,.]*%?)*')
def fix_txt(p):
    p = NUMX.sub(lambda m: f'<bdi dir="ltr">{m[0]}</bdi>' if re.search(r'[+\-−–→/%=]', m[0]) else m[0], p)
    p = re.sub(r"[A-Z][A-Za-z0-9&'.]*(?: [A-Za-z0-9&'.]+)+", lambda m: f'<bdi dir="ltr">{m[0]}</bdi>' if len(m[0]) <= 28 else m[0], p)   # short English names stay on one line
    return p.replace(' → ', ' ← ')
parts = re.split(r'(<[^>]+>)', pages); pages = ''.join(p if p.startswith('<') else fix_txt(p) for p in parts)
# charts: inline the Arabic SVGs (ids prefixed so the inlined charts do not collide); the map is the Arabic JPEG
def inline(m):
    cls, src = m.group(1), m.group(2)
    if src.endswith('.jpg'): return f'<img class="{cls}" src="charts_ar/{os.path.basename(src)}" alt="">'
    name = os.path.splitext(os.path.basename(src))[0]; v = open(os.path.join(os.path.dirname(out), 'charts_ar', name + '.svg')).read()
    v = v[v.index('<svg'):]; v = re.sub(r'<metadata>.*?</metadata>', '', v, flags=re.S)
    v = re.sub(r'id="([^"]+)"', lambda k: f'id="{name}-{k[1]}"', v); v = re.sub(r'url\(#([^)]+)\)', lambda k: f'url(#{name}-{k[1]})', v); v = re.sub(r'href="#([^"]+)"', lambda k: f'href="#{name}-{k[1]}"', v)
    v = re.sub(r'<svg([^>]*?) width="[^"]+" height="[^"]+"', r'<svg\1 width="100%"', v, count=1)
    return f'<div class="{cls.strip()}">{v}</div>'
pages = re.sub(r'<img class="([^"]*)" src="(charts/[^"]+)"[^>]*>', inline, pages)
open(out, 'w').write(head + '<body>' + pages + '</body></html>'); print('wrote', out, len(pages))
