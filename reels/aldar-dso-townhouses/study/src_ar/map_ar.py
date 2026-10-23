"""Arabic locator map for the study (same map as charts.py section 7, Arabic labels).
   python3 -I src_ar/map_ar.py <data_dir> <out_dir> <tile_cache> <plex_arabic_ttf>"""
import sys, os, json, math, time, urllib.request
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src'))
import numpy as np
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from load import LABEL

data, outd, cache, ttf = sys.argv[1:5]
os.makedirs(outd, exist_ok=True); os.makedirs(cache, exist_ok=True)
for f in fm.findSystemFonts():
    if 'Inter' in os.path.basename(f) and 'Display' not in f: fm.fontManager.addfont(f)
fm.fontManager.addfont(ttf)
plt.rcParams.update({'font.family': ['IBM Plex Sans Arabic', 'Inter'], 'font.size': 8.6})
COL = {'Aldar': '#2a78d6', 'Emaar': '#eb6834', 'Damac': '#1baf7a', 'Majid Al Futtaim': '#6250d6', 'mixed': '#85847e'}
M = json.load(open(f'{data}/metrics.json'))
AR = {'Haven': 'هافن', 'Athlon': 'أثلون', 'The Wilds': 'ذا وايلدز', 'Arabian Ranches 3': 'المرابع العربية 3', 'The Valley': 'ذا فالي',
      'Damac Lagoons': 'داماك لاجونز', 'Tilal Al Ghaf': 'تلال الغاف', 'Damac Hills 2': 'داماك هيلز 2'}
def A(s): return s                                                  # matplotlib >= 3.11 shapes and orders Arabic itself (libraqm); older versions need arabic_reshaper + bidi

def tile(z, x, y):
    p = f'{cache}/{z}_{x}_{y}.jpg'
    if not os.path.exists(p):
        u = f'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        for attempt in range(6):
            try: d_ = urllib.request.urlopen(req, timeout=40).read(); open(p, 'wb').write(d_); break
            except Exception:
                if attempt == 5: raise
                time.sleep(1.5 * (attempt + 1))
    return plt.imread(p, format='jpg')
def px(lon, lat, z):
    n = 2 ** z; x = (lon + 180) / 360 * n; y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n; return x, y
Z = 12; lon0, lon1, lat0, lat1 = 55.12, 55.52, 24.96, 25.225
x0, y0 = px(lon0, lat1, Z); x1, y1 = px(lon1, lat0, Z)
tx0, tx1, ty0, ty1 = int(x0), int(x1), int(y0), int(y1)
canvas = np.zeros(((ty1 - ty0 + 1) * 256, (tx1 - tx0 + 1) * 256, 3), dtype=np.uint8)
for tx in range(tx0, tx1 + 1):
    for ty in range(ty0, ty1 + 1):
        t = tile(Z, tx, ty); canvas[(ty - ty0) * 256:(ty - ty0 + 1) * 256, (tx - tx0) * 256:(tx - tx0 + 1) * 256] = t[:, :, :3]
ox, oy = tx0 * 256, ty0 * 256
cx0, cy0, cx1, cy1 = (x0 * 256 - ox), (y0 * 256 - oy), (x1 * 256 - ox), (y1 * 256 - oy)
crop = canvas[int(cy0):int(cy1), int(cx0):int(cx1)]
W, H = crop.shape[1], crop.shape[0]
fig = plt.figure(figsize=(6.9, 6.9 * H / W)); ax = fig.add_axes([0, 0, 1, 1])
ax.imshow(crop, extent=[0, W, H, 0]); ax.set_xlim(0, W); ax.set_ylim(H, 0); ax.axis('off')
def P(lon, lat): X, Y = px(lon, lat, Z); return X * 256 - ox - cx0, Y * 256 - oy - cy0
bl = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'bluline.json')))
X, Y = P(55.3946, 25.1272)
kmpx = (2 ** Z * 256 / 360) / (111.32 * math.cos(math.radians(25.127)))
for r_, lb in ((5, '5 كم'), (10, '10 كم')):
    th = np.linspace(0, 2 * np.pi, 200); ax.plot(X + r_ * kmpx * np.cos(th), Y + r_ * kmpx * np.sin(th), color='white', lw=1.1, ls=(0, (4, 3)), alpha=.85, zorder=2)
    ax.text(X + r_ * kmpx * .72 + 4, Y - r_ * kmpx * .72 - 4, A(lb), color='white', fontsize=7.6, fontweight='bold', zorder=3)
for seg in bl.values():
    xy = np.array([P(a, b_) for a, b_ in seg]); ax.plot(xy[:, 0], xy[:, 1], color='#ffffff', lw=5.2, solid_capstyle='round', zorder=3); ax.plot(xy[:, 0], xy[:, 1], color='#2a78d6', lw=3, solid_capstyle='round', zorder=4)
bx, by = P(55.343, 25.215)
ax.text(bx - 14, by + 8, A('الخط الأزرق لمترو دبي\n(الافتتاح المستهدف 2029)'), color='white', fontsize=8.2, fontweight='bold', va='center', ha='right', zorder=6, bbox=dict(boxstyle='round,pad=.3', fc=(0, 0, 0, .6), ec='none'))
dd = {'Haven by Aldar|3': (16, -2, 'l'), 'Athlon by Aldar|3': (-16, 6, 'r'), 'The Wilds|3': (-16, -4, 'r'), 'Arabian Ranches 3|16': (16, 6, 'l'), 'The Valley|16': (-16, 0, 'r'),
      'DAMAC Lagoons|16': (16, 6, 'l'), 'Tilal Al Ghaf|16': (16, -6, 'l'), 'DAMAC Hills 2|16': (16, 0, 'l')}
for k, (ox_, oy_, side) in dd.items():
    L = M['loc'][k]; X1, Y1 = P(L['lon'], L['lat'])
    c = COL[LABEL[k][1]]; ax.scatter([X1], [Y1], s=95, color=c, edgecolor='white', linewidth=2, zorder=7)
    ax.text(X1 + ox_, Y1 + oy_, A(AR[LABEL[k][0]]), color='white', fontsize=8.6, fontweight='bold', ha='left' if side == 'l' else 'right', va='center', zorder=8, bbox=dict(boxstyle='round,pad=.25', fc=(0, 0, 0, .6), ec='none'))
ax.scatter([X], [Y], s=340, marker='*', color='#E9C47C', edgecolor='#08080A', linewidth=1.4, zorder=9)
ax.text(X - 20, Y - 6, A('واحة دبي للسيليكون\nمشروع الدار الرابع في دبي: «بالقرب» من هنا'), color='#08080A', fontsize=8.6, fontweight='bold', va='center', ha='right', zorder=9, linespacing=1.3, bbox=dict(boxstyle='round,pad=.3', fc='#E9C47C', ec='none'))
ax.plot([30, 30 + 5 * kmpx], [H - 30, H - 30], color='white', lw=3, zorder=9); ax.text(30 + 2.5 * kmpx, H - 42, A('5 كم'), color='white', fontsize=7.6, fontweight='bold', ha='center', zorder=9)
ax.text(W - 6, H - 8, 'Imagery © Esri, Maxar, Earthstar Geographics · Blue Line alignment © OpenStreetMap contributors (ODbL)', color='white', fontsize=6.4, ha='right', va='bottom', zorder=9, bbox=dict(boxstyle='round,pad=.2', fc=(0, 0, 0, .5), ec='none'))
fig.savefig(f'{outd}/fig_map.jpg', dpi=190, format='jpg', pil_kwargs={'quality': 88}); plt.close(fig)
print('map ok')
