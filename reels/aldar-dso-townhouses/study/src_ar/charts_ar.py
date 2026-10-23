"""Arabic copies of the study's SVG charts: translates every <text> label, keeps numbers, makes Arabic labels right-to-left.
   python3 -I src_ar/charts_ar.py <charts_dir> <charts_ar_dir>
   Arabic labels get direction:rtl and a mirrored text-anchor (start <-> end), so each label keeps the edge matplotlib aligned it on."""
import sys, os, re, html, glob
src, out = sys.argv[1:3]; os.makedirs(out, exist_ok=True)
NAME = {'Haven': 'هافن', 'Athlon': 'أثلون', 'The Wilds': 'ذا وايلدز', 'Arabian Ranches 3': 'المرابع العربية 3', 'Ranches 3': 'المرابع 3', 'The Valley': 'ذا فالي',
        'Damac Lagoons': 'داماك لاجونز', 'Damac Hills 2': 'داماك هيلز 2', 'Tilal Al Ghaf': 'تلال الغاف', 'Dubai South': 'دبي الجنوب', 'Dubai Silicon Oasis': 'واحة دبي للسيليكون',
        'Aldar': 'الدار', 'Emaar': 'إعمار', 'Damac': 'داماك', 'Majid Al Futtaim': 'ماجد الفطيم', 'MAF': 'ماجد الفطيم', 'mixed': 'مطورون متعددون'}
FIX = {
    'months since Aldar announced the sell-out': 'الأشهر منذ إعلان الدار بيع كامل المعروض',
    'new sales registered with': 'المبيعات الجديدة المسجلة لدى', 'Dubai Land Department (units)': 'دائرة الأراضي والأملاك (وحدات)',
    '12 months after the announcement': '12 شهراً بعد الإعلان',
    '◆  units Aldar said it sold at the launch event': '◆  الوحدات التي أعلنت الدار بيعها في حدث الإطلاق',
    '●  registered 12 months after the announcement': '●  المسجّل بعد 12 شهراً من الإعلان',
    'H1': 'ن1', 'H2': 'ن2', 'AED / sq ft': 'درهم / قدم²',
    'Aldar new-sale price per sq ft': 'سعر القدم المربعة في المبيعات الجديدة للدار',
    'Resale price per sq ft (units 1,800–3,400 sq ft)': 'سعر إعادة البيع للقدم المربعة (وحدات 1,800–3,400 قدم)',
    'AED per sq ft of built-up area (median, bar = middle 50% of deals)': 'درهم للقدم المربعة من المساحة المبنية (الوسيط، الشريط = الـ50% الوسطى من الصفقات)',
    'new sale (developer to buyer)': 'بيع جديد (من المطور إلى المشتري)', 'resale': 'إعادة بيع',
    'registered sales per quarter': 'المبيعات المسجلة لكل ربع', 'new sales': 'مبيعات جديدة',
    'new sales (solid)': 'مبيعات جديدة (مصمت)', 'resale (hatched)': 'إعادة بيع (مخطط)',
    'expected launch price, AED per sq ft of built-up area (analyst estimate, not an Aldar price)': 'سعر الإطلاق المتوقع، درهم للقدم المربعة من المساحة المبنية (تقدير تحليلي، وليس سعراً من الدار)',
    'Conservative': 'المتحفظ', 'Base case': 'الأساسي', 'Stretch': 'المتفائل',
    'change in median resale AED/sq ft, last 12 months vs the 12 months before': 'التغير في وسيط سعر إعادة البيع (درهم/قدم²)، آخر 12 شهراً مقارنة بالـ12 شهراً السابقة',
}
RULES = [  # (regex, replacement function) for the labels that carry numbers
    (r'^(.+?)  (\d[\d,]*) units · AED ([\d.]+)bn$', lambda m: f'{NAME[m[1]]}  {m[2]} وحدة · {m[3]} مليار درهم'),
    (r'^(.+?)  ·  resale$', lambda m: f'{NAME[m[1]]}  ·  إعادة بيع'),
    (r'^(.+?)  ·  new sale$', lambda m: f'{NAME[m[1]]}  ·  بيع جديد'),
    (r'^([\d,]+)   \(AED ([\d.]+)m median price · n=(\d+)\)$', lambda m: f'{m[1]}   (وسيط السعر {m[2]} مليون درهم · n={m[3]})'),
    (r'^(.+?) new sales  ([\d,]+)$', lambda m: f'{NAME[m[1]]} مبيعات جديدة  {m[2]}'),
    (r'^(.+?) new  ([\d,]+)$', lambda m: f'{NAME[m[1]]} بيع جديد  {m[2]}'),
    (r'^(.+?) resale  ([\d,]+)$', lambda m: f'{NAME[m[1]]} إعادة بيع  {m[2]}'),
    (r'^([+-][\d.]+%)   \(([\d,]+) → ([\d,]+) AED/sq ft · n=(\d+) / (\d+)\)$', lambda m: f'{m[1]}   ({m[2]} → {m[3]} درهم للقدم · n={m[4]} / {m[5]})'),
    (r'^([A-Z][A-Za-z0-9 ]+?)  \(([A-Za-z ]+)\)$', lambda m: f'{NAME[m[1]]}  ({NAME[m[2]]})'),
]
AR = re.compile('[؀-ۿ]')
NUMX = re.compile(r'(?:n=)?[+\-−]?\d[\d,.]*%?(?:\s*[–→/-]\s*[+\-−]?\d[\d,.]*%?)*')
def iso(t):   # keep signed numbers, ranges and number chains left-to-right inside right-to-left labels (LRI ... PDI)
    return NUMX.sub(lambda m: '⁦' + m[0] + '⁩' if re.search(r'[+\-−–→/%=]', m[0]) else m[0], t)
def tr(t):
    if t in FIX: return FIX[t]
    if t in NAME: return NAME[t]
    for rx, fn in RULES:
        m = re.match(rx, t)
        if m: return fn(m)
    if re.search('[A-Za-z]', t) and t not in ('n',): raise SystemExit(f'untranslated label: {t!r}')
    return t
def fix_text(m):
    attrs, inner = m.group(1), m.group(2)
    t = html.unescape(inner).strip(); a = tr(t)
    if AR.search(a):
        a = iso(a)
        attrs = attrs.replace("font-family: 'Inter'", "font-family: 'Inter', 'IBM Plex Sans Arabic'")
        anc = re.search(r'text-anchor: (start|middle|end)', attrs)
        flip = {'start': 'end', 'end': 'start', 'middle': 'middle'}[anc.group(1) if anc else 'start']
        attrs = re.sub(r'text-anchor: (start|middle|end)', f'text-anchor: {flip}', attrs) if anc else attrs.replace('style="', f'style="text-anchor: {flip}; ', 1)
        attrs = attrs.replace('style="', 'style="direction: rtl; unicode-bidi: embed; ', 1)
    return f'<text{attrs}>{html.escape(a, quote=False)}</text>'
for f in sorted(glob.glob(f'{src}/*.svg')):
    s = open(f).read(); n = len(re.findall('<text', s))
    s2 = re.sub(r'<text([^>]*)>(.*?)</text>', fix_text, s, flags=re.S)
    open(os.path.join(out, os.path.basename(f)), 'w').write(s2); print(os.path.basename(f), n, 'labels')
