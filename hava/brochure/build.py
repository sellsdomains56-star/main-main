"""Builds the HAVA client catalogue: catalogue.html, then print it to HAVA-Catalogue-2026.pdf with print.js.

    python3 build.py && node print.js

Contact details for the back page and the order form are set in CONTACT below. Leave a value empty and
that line prints as a blank line to fill in by hand.
"""
from html import escape

CONTACT = {
    'Email': '',
    'Phone': '',
    'Web': '',
}

FLAVOURS = [  # key, colour, name, line
    ('lime', '#9ACD32', 'Lime', 'Zesty and cool, with a squeeze of fresh lime.'),
    ('strawberry', '#D7263D', 'Strawberry', 'Sweet and summery, like the first strawberries of June.'),
    ('blueberry', '#5B4BB7', 'Blueberry', 'Deep and soft, like wild berries from the Swedish forest.'),
    ('raspberry', '#C2185B', 'Raspberry', 'Bright and juicy, with a gentle tartness.'),
    ('watermelon', '#F0566B', 'Watermelon', 'Light and fresh, for the hottest days of the year.'),
    ('apple', '#4E9A3E', 'Apple', 'Crisp and clean, like an apple straight from the orchard.'),
    ('peach', '#F2A07B', 'Peach', 'Soft and golden, with the gentle sweetness of ripe peach.'),
    ('orange', '#F28C1E', 'Orange', 'Sunny and bright, with a twist of orange peel.'),
    ('berries', '#7D2E68', 'Mixed berries', 'Raspberry, blueberry and blackberry, picked together.'),
]

RANGE = [  # product, size, material, photo
    ('HAVA <em>Still</em>', '1000 ml', 'Glass', 'img/p/ice-still-1000.jpg'),
    ('HAVA <em>Still</em>', '700 ml', 'Glass', 'img/p/ice-still-700.jpg'),
    ('HAVA <em>Still</em>', '500 ml', 'Bottle', 'img/p/ice-still-500.jpg'),
    ('HAVA <em>Sparkling</em>', '700 ml', 'Glass', 'img/p/ice-sparkling-700.jpg'),
    ('Sparkling <em>flavours</em>', '330 ml', 'Can · 9 flavours', 'img/p/flavours-blueberry.jpg'),
]

WORDMARK = ('<svg class="wordmark" viewBox="0 0 264 84" aria-label="HAVA"><g fill="none" stroke="currentColor" stroke-width="4.2">'
            '<path d="M4 8V64M44 8V64M4 36H44M70 64L95 8L120 64M140 8L165 64L190 8M210 64L235 8L260 64"/>'
            '<path d="M4 79H260" stroke-width="2.4"/></g></svg>')
MARK = ('<svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.3"/>'
        '<path d="M13.5 26.5L20 12.5L26.5 26.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>')

pages = []
def page(cls, body, folio=True, ridge=None):
    n = len(pages) + 1
    foot = (f'<footer class="folio">{WORDMARK}<span>Water from Sweden</span><span class="num">{n:02d}</span></footer>' if folio else '')
    mountains = f'<img class="ridge" src="img/ridge-{ridge}.png" alt="">' if ridge else ''
    pages.append(f'<section class="page {cls}">{mountains}{body}{foot}</section>')

def label(text):
    return f'<span class="eyebrow">{text}</span>'

# 1 · Cover
page('cover', f'''
  <img class="bleed" src="img/cover-waterfall.jpg" alt="">
  <div class="cover-shade"></div>
  <div class="cover-top">{WORDMARK}<span>Catalogue 2026</span></div>
  <div class="cover-word" aria-hidden="true">
    <span><svg viewBox="0 0 48 64"><path d="M4 2V62M44 2V62M4 32H44"/></svg><svg viewBox="0 0 60 64"><path d="M2 62L30 2L58 62"/></svg></span>
    <span><svg viewBox="0 0 60 64"><path d="M2 2L30 62L58 2"/></svg><svg viewBox="0 0 60 64"><path d="M2 62L30 2L58 62"/></svg></span>
  </div>
  <div class="cover-foot">
    <p class="cover-sub">Water from Sweden</p>
    <p class="cover-note">Still &amp; sparkling water · Nine sparkling flavours</p>
  </div>''', folio=False)

# 2 · Who is HAVA?
page('light split who', f'''
  <div class="copy">
    {label('Who is HAVA?')}
    <h1 class="display">Sweden, in a <em>bottle.</em></h1>
    <p class="big">HAVA began with a simple idea: water this pure deserves a bottle as beautiful as the place it comes from.</p>
    <p>HAVA is still and sparkling water from Sweden, a land of ancient granite, deep pine forest and around 100,000 lakes. We bottle it in heavy clear glass with a brushed gold cap and four letters, drawn as clean as the Swedish landscape. For the dinner table, the hotel room, the bar and the day.</p>
    <ul class="pillars">
      <li><b>Still &amp; sparkling</b><span>Soft and quiet, or with fine, lively bubbles.</span></li>
      <li><b>Glass &amp; gold</b><span>Heavy clear glass, brushed gold caps, made for the table.</span></li>
      <li><b>Nine flavours</b><span>Sparkling cans with natural fruit flavours and no preservatives.</span></li>
    </ul>
  </div>
  <div class="photo"><img src="img/p/still-interior.jpg" style="object-position:66% 50%" alt=""></div>''', ridge='ink')

# 3 · Why Sweden
STATS = [
    ('100,000', 'Lakes', 'Sweden has nearly 100,000 lakes larger than one hectare.', '1'),
    ('69%', 'Forest', "Around 69 percent of Sweden's land is covered by forest.", '2'),
    ('2', 'Billion years', "Most of Sweden's bedrock is between 1.65 and 2 billion years old.", '3'),
    ('Top 10', 'In the world', "Sweden ranks in the world's top 10 for safe drinking water and sanitation.", '4'),
]
stats = ''.join(f'<div class="stat"><span class="n">{n}<sup>{s}</sup></span><span class="u">{u}</span><p>{escape(t)}</p></div>' for n, u, t, s in STATS)
page('dark why', f'''
  <img class="bleed" src="img/lake-sunrise-dark.jpg" alt="">
  <div class="why-shade"></div>
  <div class="why-head">
    {label('Why Sweden')}
    <h2 class="display">Where HAVA <em>begins.</em></h2>
    <p class="lead">Sweden is a land of ancient granite, deep pine forest and around 100,000 lakes. Rain and snowmelt sink slowly through the stone and come back up cold and clear.</p>
  </div>
  <div class="stats">{stats}</div>
  <p class="sources">1 SMHI, Sveriges sjöar · 2 Swedish National Forest Inventory, via Statistics Sweden · 3 Geological Survey of Sweden (SGU) · 4 Yale Environmental Performance Index 2024, Sanitation &amp; Drinking Water (10th, score 98.5)</p>''', ridge='ice')

# 4 · From sky to bottle
CHAPTERS = [
    ('Rain and snow', 'Rain and winter snow fall on a quiet northern land of forest, lakes and open sky.', 'img/p/lake.jpg'),
    ('The forest', 'Moss, roots and pine needles slow the water down on its way into the ground.', 'img/p/bottle-forest.jpg'),
    ('The stone', 'Granite and gneiss, some of the oldest rock in Europe, give little to the water. It stays soft and light.', 'img/p/range-flatlay.jpg'),
    ('The ice', 'The last ice sheet left long ridges of sand and gravel, eskers, that water passes through slowly and comes out clear.', 'img/p/bottle-waterfall.jpg'),
    ('The care', 'In Sweden, drinking water is regulated as a food by the Swedish Food Agency.', 'img/p/still-arches.jpg'),
]
chapters = ''.join(f'<article><div class="ph"><img src="{img}" alt=""></div><span class="num">0{i + 1}</span><h3>{t}</h3><p>{escape(p)}</p></article>'
                   for i, (t, p, img) in enumerate(CHAPTERS))
page('light sky', f'''
  <div class="head">
    {label('The source')}
    <h2 class="display">From sky to <em>bottle.</em></h2>
  </div>
  <div class="chapters">{chapters}</div>''', ridge='ink')

# 5 · The collection
cards = ''.join(f'<article class="lc"><div class="ph"><img src="{img}" alt=""></div><span class="num">0{i + 1}</span><h3>{name}</h3><span class="size">{size} · {mat}</span></article>'
                for i, (name, size, mat, img) in enumerate(RANGE))
page('light collection', f'''
  <div class="head row">
    <div>{label('The collection')}<h2 class="display">Five ways to drink <em>HAVA.</em></h2></div>
    <p class="lead">Glass bottles for the table, a light bottle for the day and a can for everywhere else.</p>
  </div>
  <div class="lineup">{cards}</div>''', ridge='ink')

# 6 · HAVA Still
def sizes(items):
    return ''.join(f'<li><b>{n}</b><span>ml · {m}</span></li>' for n, m in items)
page('light product', f'''
  <div class="photo"><img src="img/p/ice-still-1000.jpg" alt=""></div>
  <div class="copy">
    {label('01 · Still water')}
    <h2 class="name">HAVA <em>Still</em></h2>
    <p class="big">Soft and quiet, for long dinners and slow mornings.</p>
    <p>In heavy clear glass with a brushed gold cap, made to stand on the table. Three sizes, from the dining room to a bottle for the day.</p>
    <ul class="sizecards">{sizes([('1000', 'Glass'), ('700', 'Glass'), ('500', 'Bottle')])}</ul>
    <div class="thumbs"><img src="img/p/ice-still-1000.jpg" alt=""><img src="img/p/ice-still-700.jpg" alt=""><img src="img/p/ice-still-500.jpg" alt=""></div>
  </div>''', ridge='ink')

# 7 · HAVA Sparkling
page('light product flip', f'''
  <div class="copy">
    {label('02 · Sparkling water')}
    <h2 class="name">HAVA <em>Sparkling</em></h2>
    <p class="big">Fine, lively bubbles with a clean finish.</p>
    <p>The same clear glass and gold cap, with fine, lively bubbles. Made for the aperitif, the dinner table and everything in between.</p>
    <ul class="sizecards">{sizes([('700', 'Glass')])}</ul>
  </div>
  <div class="photo"><img src="img/p/ice-sparkling-700.jpg" alt=""></div>''', ridge='ink')

# 8 · Sparkling flavours
tiles = ''.join(f'<article class="ft" style="--c:{c}"><div class="ph"><img src="img/p/flavours-{k}.jpg" alt=""></div><h3>{n}</h3><p>{escape(p)}</p></article>'
                for k, c, n, p in FLAVOURS)
page('light flavours', f'''
  <div class="head row">
    <div>{label('03 · Sparkling flavours')}<h2 class="display">Nine <em>flavours.</em></h2></div>
    <div class="side">
      <p class="lead">Sparkling HAVA with natural fruit flavours and no preservatives. 330 ml cans.</p>
      <ul class="badges"><li>Natural flavours</li><li>No preservatives</li><li>Swedish water</li></ul>
    </div>
  </div>
  <div class="ftiles">{tiles}</div>''', ridge='ink')

# 9 · The range at a glance
rows = ''.join(f'<tr><td class="pn">{name}</td><td>{size}</td><td>{mat}</td></tr>' for name, size, mat, _ in RANGE[:4])
rows += '<tr><td class="pn">Sparkling <em>flavours</em></td><td>330 ml</td><td>Can</td></tr>'
flav_list = ' · '.join(n for _, _, n, _ in FLAVOURS)
page('light range', f'''
  <div class="photo"><img src="img/p/range-flatlay.jpg" alt=""></div>
  <div class="copy">
    {label('The range')}
    <h2 class="display">Every <em>size.</em></h2>
    <table class="spec"><thead><tr><th>Product</th><th>Size</th><th>Format</th></tr></thead><tbody>{rows}</tbody></table>
    <p class="note"><b>Flavours:</b> {flav_list}.</p>
  </div>''', ridge='ink')

# 10 · How to order
order_rows = ''.join(f'<tr><td class="pn">{name}</td><td>{size}</td><td>{mat}</td><td class="fill"></td></tr>' for name, size, mat, _ in RANGE[:4])
order_rows += ''.join(f'<tr><td class="pn">Sparkling <em>{n}</em></td><td>330 ml</td><td>Can</td><td class="fill"></td></tr>' for _, _, n, _ in FLAVOURS)
fields = ''.join(f'<div class="field"><span>{f}</span><i></i></div>' for f in ['Company', 'Contact name', 'Email', 'Phone', 'Delivery address', 'Delivery date'])
fields += '<div class="field wide"><span>Notes</span><i></i></div><div class="field wide"><span></span><i></i></div>'
page('light order', f'''
  <div class="steps">
    {label('Order')}
    <h2 class="display">How to <em>order.</em></h2>
    <ol>
      <li><b>Choose</b><span>Pick your products and quantities on the order form.</span></li>
      <li><b>Send</b><span>Send the form to HAVA by email, or through the contact page on our website.</span></li>
      <li><b>Receive</b><span>We reply with prices, minimum quantities and delivery dates.</span></li>
    </ol>
    <p class="for">For hotels, restaurants, shops and distributors.</p>
  </div>
  <div class="form">
    <h3>Order form</h3>
    <table class="spec orderlist"><thead><tr><th>Product</th><th>Size</th><th>Format</th><th>Quantity</th></tr></thead><tbody>{order_rows}</tbody></table>
    <div class="fields">{fields}</div>
  </div>''', ridge='ink')

# 11 · Back
contact = ''.join(f'<div class="cline"><span>{k}</span>{("<b>" + escape(v) + "</b>") if v else "<i></i>"}</div>' for k, v in CONTACT.items())
page('back', f'''
  <img class="bleed" src="img/globe-sweden.jpg" alt="">
  <div class="back-shade"></div>
  <div class="back-copy">
    {label('From Sweden to the world')}
    <h2 class="display">Own the <em>moment.</em></h2>
    <div class="contact">{contact}</div>
  </div>
  <div class="back-brand">{WORDMARK}<p>The essence of Sweden.</p>{MARK}</div>''', folio=False, ridge='ice')

CSS = open('catalogue.css').read()
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>HAVA · Catalogue 2026</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Bodoni+Moda:ital,opsz,wght@1,6..96,400..700&display=swap">
<style>
{CSS}
</style>
</head>
<body>
{chr(10).join(pages)}
</body>
</html>
'''
open('catalogue.html', 'w').write(html)
print(len(pages), 'pages')
