"""Builds guidelines.html, the HAVA brand guidelines (A4 landscape). print.js turns it into the PDF.
Run from this folder after logos.py and render.js:  python3 guidelines.py && node print.js
Copy comes from the website (js/i18n.js); logo, colours and artwork from the brand book."""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
RIDGE_ICE = '../brochure/img/ridge-ice.png'


def logo(name, cls='logo', style=''):
    """Inline a logo from logo/svg, coloured by the surrounding text colour."""
    svg = open(os.path.join(HERE, 'logo', 'svg', f'hava-{name}-white.svg')).read()
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
    body = re.search(r'<g fill="#FFFFFF">(.*)</g>', svg, re.S).group(1).replace('#FFFFFF', 'currentColor')
    st = f' style="{style}"' if style else ''
    return f'<svg class="{cls}" viewBox="{vb}" aria-label="HAVA"{st}>{body}</svg>'


def cmyk(hexc):
    r, g, b = (int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5))
    k = 1 - max(r, g, b)
    if k == 1:
        return '0 0 0 100'
    c, m, y = ((1 - v - k) / (1 - k) for v in (r, g, b))
    return ' '.join(str(round(v * 100)) for v in (c, m, y, k))


def rgb(hexc):
    return ' '.join(str(int(hexc[i:i + 2], 16)) for i in (1, 3, 5))


pages = []


def page(cls, body, num=None, sect=None, folio=True, ridge=None):
    n = len(pages) + 1
    head = f'<div class="head"><span class="num">{num}</span><span class="sect">{sect}</span></div>' if num else ''
    foot = (f'<footer class="folio">{logo("wordmark")}<span>Brand guidelines</span><span class="pn">{n:02d}</span></footer>'
            if folio else '')
    mountains = f'<img class="ridge" src="{ridge}" alt="">' if ridge else ''
    pages.append(f'<section class="page {cls}">{mountains}{head}{body}{foot}</section>')


def photo(src, pos='50% 50%', cls='photo', style=''):
    return f'<div class="{cls}" style="{style}"><img src="img/{src}" style="object-position:{pos}" alt=""></div>'


# 1. Cover
page('dark cover', f'''
  <div class="top"><span>Brand guidelines</span><span>2026</span></div>
  <div>{logo("wordmark-tagline", "logo brandmark")}<p class="sub">Water from Sweden</p></div>''', folio=False, ridge=RIDGE_ICE)

# 2. Contents
toc = [('01', 'The brand', 'Who HAVA is'), ('02', 'Logo', 'Versions, space, colours, misuse'), ('03', 'Colour', 'The HAVA palette'),
       ('04', 'Typography', 'Typefaces and how to use them'), ('05', 'Mountains', 'Artwork and pattern'),
       ('06', 'Photography', 'Light, nature, glass'), ('07', 'Film', 'Motion without sound'), ('08', 'The range', 'Still, sparkling, nine flavours'),
       ('09', 'Applications', 'Website, print, social'), ('10', 'Voice', 'How HAVA speaks')]
page('', f'''
  <div class="contents">
    {photo("still-interior.jpg", "66% 50%")}
    <div class="list">
      <div class="head"><span class="num">00</span><span class="sect">Contents</span></div>
      <h1 class="display">How HAVA <em>looks</em> and speaks</h1>
      <p class="lead">Everything you need to present HAVA the same way everywhere: on the table, in print, on screen and on social media.</p>
      <ol class="toc">{"".join(f"<li><span>{n}</span><b>{t}</b><span>{d}</span></li>" for n, t, d in toc)}</ol>
    </div>
  </div>''', folio=False)

# 3. The brand
page('', f'''
  <div class="split">
    <div>
      <h1 class="display">Sweden, <em>in a bottle.</em></h1>
      <p class="lead">Still and sparkling water from Sweden, made for the moments that matter.</p>
      <p class="small" style="margin-top:5mm;max-width:118mm">HAVA began with a simple idea: water this pure deserves a bottle as beautiful as the place it comes from. Heavy glass, a brushed gold cap and four letters, drawn as clean as the Swedish landscape.</p>
      <p class="small" style="max-width:118mm">Sweden is a land of ancient granite, deep pine forest and around 100,000 lakes. Rain and snowmelt sink slowly through the stone and come back up cold and clear.</p>
      <ul class="values">
        <li><h3>Pure</h3><p>Clear water, clear glass, clear words. Nothing added that doesn&rsquo;t need to be there.</p></li>
        <li><h3>Calm</h3><p>Space, slow light and quiet confidence. HAVA never shouts.</p></li>
        <li><h3>Swedish</h3><p>Lakes, forest, stone and ice. The landscape is in everything we show.</p></li>
        <li><h3>Made for the moment</h3><p>Long dinners, slow mornings, the aperitif and everything in between.</p></li>
      </ul>
      <ul class="lines">
        <li><span class="label">Descriptor</span><q>Water from Sweden</q></li>
        <li><span class="label">Tagline</span><q>The essence of Sweden.</q></li>
        <li><span class="label">Campaign line</span><q>Own the moment.</q></li>
      </ul>
    </div>
    {photo("bottle-waterfall.jpg", "50% 60%", style="height:175mm")}
  </div>''', '01', 'The brand')

# 4. Logo
page('', f'''
  <h1 class="display">The <em>wordmark</em></h1>
  <div class="hero-logo">{logo("wordmark")}</div>
  <ul class="notes">
    <li><h3>Four letters, one line weight</h3><p>HAVA is drawn in clean, even strokes. The A is a peak with no crossbar; the V is the same peak turned over.</p></li>
    <li><h3>The line belongs to the logo</h3><p>The line under the letters runs their full width. Keep it in every version except the plain wordmark.</p></li>
    <li><h3>Never retype it</h3><p>The logo is drawn, not typed. Always use the supplied files (SVG, PNG or PDF) and never rebuild it from a font.</p></li>
  </ul>''', '02', 'Logo')

# 5. Versions
versions = [
    ('wordmark', 't-fog', 'Primary wordmark', 'For almost everything: website, print, signage.', 'hava-wordmark', '78%'),
    ('wordmark-tagline', 't-deep', 'With tagline', 'Covers, campaigns and brand moments.', 'hava-wordmark-tagline', '80%'),
    ('wordmark-vertical', 't-gold', 'Vertical', 'Bottles, cans and tall formats.', 'hava-wordmark-vertical', '30%'),
    ('icon', 't-fog', 'Icon', 'Social profiles, seals, app and favicon.', 'hava-icon', '78%'),
    ('monogram', 't-deep', 'Monogram', 'Stationery, stamps and embossing.', 'hava-monogram', '78%'),
]
page('', f'''
  <h1 class="display">Logo <em>versions</em></h1>
  <div class="versions" style="margin-top:7mm">{"".join(
      f'<div class="ver"><div class="tile {t}">{logo(n, style=f"width:{w}")}</div><h3>{h}</h3><p>{p}</p><span class="file">{fn}-*.svg / .png / .pdf</span></div>'
      for n, t, h, p, fn, w in versions)}</div>
  <p class="small" style="margin-top:6mm">Every version comes in four colours: <b>deepwater</b> (for light backgrounds), <b>white</b> (for Deep Water and dark photos), <b>gold</b> (packaging, on Deep Water) and <b>ink</b> (one-colour print).</p>''', '02', 'Logo')

# 6. Clear space and minimum size
W = 110.0
x = W * 412 / 1619 / 2
page('', f'''
  <h1 class="display">Space and <em>size</em></h1>
  <div class="space" style="margin-top:7mm">
    <div>
      <div class="tile"><div class="box" style="--x:{x:.1f}mm">{logo("wordmark", style=f"width:{W}mm")}
        <span class="x" style="left:{x / 2 - 1:.1f}mm;top:50%">x</span><span class="x" style="right:{x / 2 - 1:.1f}mm;top:50%">x</span>
        <span class="x" style="top:{x / 2 - 2:.1f}mm;left:50%">x</span><span class="x" style="bottom:{x / 2 - 2:.1f}mm;left:50%">x</span></div></div>
      <p class="small cap">Clear space: keep at least <b>x</b> free on every side, where x is half the height of the letters. Nothing else (text, edges, other logos) enters this area.</p>
    </div>
    <div>
      <div class="tile"><div class="box" style="--x:9mm">{logo("icon", style="width:36mm")}</div></div>
      <p class="small cap">For the icon and monogram, keep a quarter of the circle&rsquo;s width free on every side.</p>
    </div>
  </div>
  <ul class="min">
    <li><b>Primary wordmark</b><span>min. 25 mm wide</span><span>min. 100 px wide</span></li>
    <li><b>Wordmark with tagline</b><span>min. 45 mm wide</span><span>min. 180 px wide</span></li>
    <li><b>Icon and monogram</b><span>min. 8 mm wide</span><span>min. 32 px (below 48 px use the favicon files)</span></li>
  </ul>''', '02', 'Logo')

# 7. Colourways
page('', f'''
  <h1 class="display">Logo <em>colours</em></h1>
  <div class="colourways" style="margin-top:7mm">
    <div class="cw t-fog">{logo("wordmark")}<span class="label">Deep Water on white or Fog</span></div>
    <div class="cw t-deep">{logo("wordmark")}<span class="label">White on Deep Water</span></div>
    <div class="cw t-gold">{logo("wordmark")}<span class="label">Gold on Deep Water: packaging</span></div>
    <div class="cw t-ice">{logo("wordmark")}<span class="label">Deep Water on Glacial Ice</span></div>
    <div class="cw on-photo" style="color:#fff"><img class="bleed" src="img/hero-underwater.jpg" alt="">{logo("wordmark")}<span class="label">White on dark, calm photos</span></div>
    <div class="cw t-ink">{logo("wordmark", style="color:var(--ink)")}<span class="label">Ink: one-colour print</span></div>
  </div>''', '02', 'Logo')

# 8. Misuse
bars = ''.join(f'<rect x="{c - 118}" y="262" width="236" height="38" fill="currentColor"/>' for c in (623.2, 1409.9))
wm_vb = re.search(r'viewBox="([^"]+)"', open(os.path.join(HERE, 'logo/svg/hava-wordmark-white.svg')).read()).group(1)
wm_d = re.search(r'<path d="([^"]+)"', open(os.path.join(HERE, 'logo/svg/hava-wordmark-white.svg')).read()).group(1)
donts = [
    (f'<svg class="logo" viewBox="{wm_vb}" preserveAspectRatio="none" style="width:92%;height:16mm"><path d="{wm_d}"/></svg>', 'Don&rsquo;t stretch or squash it.'),
    (f'<svg class="logo" viewBox="{wm_vb}"><path d="{wm_d}"/>{bars}</svg>', 'Don&rsquo;t add crossbars to the A.'),
    (logo('wordmark', style='color:#2BB673'), 'Don&rsquo;t use colours outside the palette.'),
    (f'<svg class="logo" viewBox="{wm_vb}" style="fill:none;stroke:var(--deep);stroke-width:7"><path d="{wm_d}"/></svg>', 'Don&rsquo;t outline it or add shadows and effects.'),
    (logo('wordmark', style='transform:rotate(-14deg)'), 'Don&rsquo;t rotate it.'),
    (logo('wordmark-plain'), 'Don&rsquo;t remove the line from the primary logo.'),
    ('<img class="bleed" src="img/flavour-berries.jpg" alt="">' + logo('wordmark', style='color:var(--deep)'), 'Don&rsquo;t place it on busy or low-contrast images.'),
    ('<span style="font:800 30pt var(--head);letter-spacing:.06em;color:var(--deep)">HAVA</span>', 'Don&rsquo;t retype it in a font.'),
]
page('', f'''
  <h1 class="display">Please <em>don&rsquo;t</em></h1>
  <div class="donts" style="margin-top:7mm">{"".join(f'<div class="dont"><div class="tile">{t}</div><p>{p}</p></div>' for t, p in donts)}</div>''', '02', 'Logo')

# 9. Colour
COLS = [
    ('Deep Water', '#0D2B45', '#F4F2ED', 'The HAVA blue. Backgrounds, the logo, headlines.'),
    ('Glacial Ice', '#C9DDE4', '#0D2B45', 'Light backgrounds, the mountains, quiet panels.'),
    ('Fog', '#F4F2ED', '#0D2B45', 'Paper, pages and space to breathe.'),
    ('Steel', '#B8BCC0', '#0D2B45', 'Lines, captions and fine details.'),
    ('Ink', '#1A1A1A', '#F4F2ED', 'Body text and one-colour print.'),
    ('Gold', '#C9A66B', '#1A1A1A', 'The cap and lettering. An accent, used sparingly.'),
]
sw = ''.join(f'''<div class="sw"><div class="chip" style="background:{h};color:{t}"><b>{n}</b></div>
  <dl><dt>HEX</dt><dd>{h}</dd><dt>RGB</dt><dd>{rgb(h)}</dd><dt>CMYK</dt><dd>{cmyk(h)}</dd></dl><p>{d}</p></div>''' for n, h, t, d in COLS)
page('', f'''
  <h1 class="display">The <em>palette</em></h1>
  <div class="swatches" style="margin-top:7mm">{sw}</div>
  <div class="balance"><i style="flex:42;background:#0D2B45"></i><i style="flex:24;background:#F4F2ED"></i><i style="flex:16;background:#C9DDE4"></i><i style="flex:8;background:#B8BCC0"></i><i style="flex:6;background:#1A1A1A"></i><i style="flex:4;background:#C9A66B"></i></div>
  <div class="web"><span class="label">Suggested balance, left to right</span><span class="small">CMYK values are a starting point; always approve colour from a printed proof.</span></div>
  <div class="web"><span class="label">On the website</span><span><i style="background:#03141C"></i>Night #03141C</span><span><i style="background:#0A3A4C"></i>Deep #0A3A4C</span><span><i style="background:#0D4A60"></i>River #0D4A60</span><span><i style="background:#EAF2F6"></i>Pale ice #EAF2F6</span><span><i style="background:#C9A66B"></i>Gold #C9A66B</span></div>''', '03', 'Colour')

# 10. Typography
page('', f'''
  <h1 class="display">Type<em>faces</em></h1>
  <div class="types" style="margin-top:7mm">
    <div class="type"><span class="label">Headlines · Archivo, Extra Bold, Expanded, capitals</span><div class="spec s-archivo">Water from Sweden</div><div class="abc s-archivo" style="font-size:11pt;text-transform:none">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz 0123456789</div><p>Short, wide and confident. Tight line spacing. Website, catalogue and campaigns.</p></div>
    <div class="type"><span class="label">Accent · Bodoni Moda, Italic</span><div class="spec s-bodoni">the essence of Sweden</div><div class="abc s-bodoni" style="font-size:14pt">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz 0123456789</div><p>One or two words inside a headline, in gold or Deep Water. Never for whole paragraphs.</p></div>
    <div class="type"><span class="label">Text · Archivo, Regular</span><div class="spec s-body">Heavy clear glass with a brushed gold cap, made to stand on the table. Three sizes, from long dinners to a bottle for the day.</div><div class="abc ">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz 0123456789</div><p>Body copy, 9 to 11 pt in print and 16 to 18 px on screen.</p></div>
    <div class="type"><span class="label">Tagline and labels · Montserrat, Regular, wide spacing</span><div class="spec s-mont">The essence of Sweden.</div><div class="abc " style="font-family:var(--label);letter-spacing:.12em">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz 0123456789</div><p>The tagline in the logo files is set in Montserrat. Use it for small labels in capitals, letter-spaced.</p></div>
  </div>
  <p class="small" style="margin-top:6mm">All three are free Google Fonts, licensed for print and web (SIL Open Font License).</p>''', '04', 'Typography')

# 11. Mountains and pattern
page('', f'''
  <h1 class="display">The <em>mountains</em></h1>
  <p class="lead">A line drawing of mountains, hills and pine forest from the HAVA brand book. It sits behind sections, along footers and on packaging, always quiet and never over the logo.</p>
  <div class="band" style="margin-top:7mm"><img src="pattern/hava-mountains-on-deepwater.png" alt=""></div>
  <div class="pair">
    <div class="tile" style="background:#fff;border:1px solid var(--line)"><img src="pattern/hava-mountains-deepwater.png" style="object-position:50% 100%" alt=""></div>
    <div class="tile"><img src="pattern/hava-peaks-on-deepwater.png" alt=""></div>
  </div>
  <p class="small" style="margin-top:4mm">On the website the mountains draw themselves in, glow near the cursor and drift as you scroll. Files: pattern/hava-mountains-*.svg and hava-peaks-*.svg (the peak pattern).</p>''', '05', 'Mountains')

# 12. Photography: nature and product
page('', f'''
  <h1 class="display">Photo<em>graphy</em></h1>
  <div class="mosaic" style="margin-top:6mm">
    {photo("bottle-forest.jpg", "50% 60%")}{photo("ice-still-1000.jpg")}{photo("hero-underwater.jpg")}{photo("still-arches.jpg")}{photo("lake.jpg", "50% 40%")}
  </div>
  <ul class="rules">
    <li><h3>Nordic nature</h3><p>Forest, waterfalls, lakes, ice and stone.</p></li>
    <li><h3>Natural light</h3><p>Morning mist, low sun, light through water.</p></li>
    <li><h3>The bottle is the hero</h3><p>One bottle, centred, sharp, with space around it.</p></li>
    <li><h3>Glass and clarity</h3><p>Show the water through the glass. Droplets, reflections.</p></li>
    <li><h3>Cool, with gold</h3><p>Blues and greens, warmed only by the gold cap.</p></li>
  </ul>''', '06', 'Photography')

# 13. Photography: moments
page('', f'''
  <div class="mood">
    {photo("still-sunset.jpg")}{photo("gift-box.jpg")}{photo("range-flatlay.jpg")}{photo("still-sunset-2.jpg")}{photo("ice-sparkling-700.jpg")}
  </div>
  <p class="small" style="margin-top:4mm">Moments: the table, the terrace, the gift. Calm, uncluttered places with real light. No crowds, no clutter, no props that compete with the bottle.</p>''', '06', 'Photography')

# 14. Film
films = [('film-waterfall.jpg', 'Water from Sweden', 'Opens the home page.'), ('film-gold-h.jpg', 'Own the moment', 'Opens the products page.'),
         ('film-peach.jpg', 'Nine flavours', 'Opens the flavours page.'), ('film-globe.jpg', 'From Sweden to the world', 'Opens The source.')]
page('dark', f'''
  <h1 class="display">Film, <em>in silence</em></h1>
  <div class="films" style="margin-top:7mm">{"".join(f'<div class="film">{photo(s)}<h3>{h}</h3><p>{p}</p></div>' for s, h, p in films)}</div>
  <div class="endcard">
    {photo("film-end.jpg", style="aspect-ratio:16/9")}
    <div><h3>How HAVA moves</h3>
      <p class="small" style="margin-top:2mm">No sound: every film works muted and loops without a cut you can see. Slow camera, natural light, water, ice and gold. Product films end on the logo.</p>
      <p class="small">Use only footage HAVA owns. Anything showing a person, team or brand needs signed agreements before it is published.</p></div>
  </div>''', '07', 'Film')

# 15. Range
range_ = [('ice-still-1000.jpg', 'Still <em>1000 ml</em>', 'Glass'), ('ice-still-700.jpg', 'Still <em>700 ml</em>', 'Glass'),
          ('ice-still-500.jpg', 'Still <em>500 ml</em>', 'Bottle'), ('ice-sparkling-700.jpg', 'Sparkling <em>700 ml</em>', 'Glass')]
flv = ['lime', 'strawberry', 'blueberry', 'raspberry', 'watermelon', 'apple', 'peach', 'orange', 'berries']
names = {'berries': 'Mixed berries'}
page('', f'''
  <h1 class="display">The <em>range</em></h1>
  <div class="range" style="margin-top:6mm">{"".join(f'<div>{photo(s)}<h3>{h}</h3><span class="small">{m}</span></div>' for s, h, m in range_)}</div>
  <div class="flv">{"".join(f'<div>{photo("flavour-" + f + ".jpg")}<span>{names.get(f, f.title())}</span></div>' for f in flv)}</div>
  <p class="small" style="margin-top:3mm">Sparkling flavours: nine flavours in 330 ml cans, with natural fruit flavours and no preservatives.</p>''', '08', 'The range')

# 16. Applications
page('', f'''
  <h1 class="display">In <em>use</em></h1>
  <div class="apps" style="margin-top:6mm">
    <figure class="web-big"><div class="shot"><img src="img/web-home.jpg" alt=""></div><figcaption class="label">Website · home</figcaption></figure>
    <figure class="phone"><div class="shot"><img src="img/web-phone-flavours.jpg" alt=""></div><figcaption class="label">Website · phone</figcaption></figure>
    <figure><div class="shot"><img src="img/catalogue-cover-01.jpg" alt=""></div><figcaption class="label">Client catalogue (PDF)</figcaption></figure>
    <figure><div class="shot" style="border:0;background:none"><div class="cards">
      <div class="card" style="background:var(--deep);color:var(--fog)">{logo("wordmark")}</div>
      <div class="card icon" style="background:#fff;color:var(--deep)">{logo("monogram")}</div></div></div><figcaption class="label">Business cards</figcaption></figure>
  </div>''', '09', 'Applications')

# 17. Voice
page('', f'''
  <div class="voice">
    <div>
      <h1 class="display">How HAVA <em>speaks</em></h1>
      <p class="lead">Calm, short and concrete. Like the landscape: nothing extra. We describe what is real (the water, the glass, the place) and let it speak for itself.</p>
      <div class="dodont">
        <div><span class="label">Do</span><ul><li>Short sentences. One idea each.</li><li>Concrete words: lake, stone, glass, gold.</li><li>Facts with a source (e.g. Yale EPI 2024).</li><li>Talk to the guest: &ldquo;your table&rdquo;.</li></ul></div>
        <div class="no"><span class="label">Don&rsquo;t</span><ul><li>Shout, exclaim or use capitals for emphasis.</li><li>Claims we can&rsquo;t prove (&ldquo;the purest in the world&rdquo;).</li><li>Health or medical promises.</li><li>Jargon and buzzwords.</li></ul></div>
      </div>
    </div>
    <ul class="say">
      <li><q>Water from Sweden.</q><span>Descriptor, under the logo</span></li>
      <li><q>Where HAVA begins.</q><span>The source</span></li>
      <li><q>Sweden, in a bottle.</q><span>Our story</span></li>
      <li><q>Soft and quiet, for long dinners and slow mornings.</q><span>HAVA Still</span></li>
      <li><q>Fine, lively bubbles with a clean finish.</q><span>HAVA Sparkling</span></li>
      <li><q>Own the moment.</q><span>Campaign line</span></li>
    </ul>
  </div>''', '10', 'Voice')

# 18. Back
page('dark back', f'''
  <div>{logo("icon", "logo icon")}{logo("wordmark-tagline", "logo brandmark")}<p class="sub">Brand guidelines · 2026</p></div>''', folio=False, ridge=RIDGE_ICE)

HTML = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>HAVA Brand Guidelines</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Bodoni+Moda:ital,opsz,wght@1,6..96,400..700&family=Montserrat:wght@400;500;600&family=Roboto+Mono:wght@400&display=swap">
<link rel="stylesheet" href="guidelines.css"></head>
<body>
{"".join(pages)}
</body></html>
'''
open(os.path.join(HERE, 'guidelines.html'), 'w').write(HTML)
print(f'{len(pages)} pages')
