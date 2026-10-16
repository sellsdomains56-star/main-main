"""Charts for the study. Usage: python3 -I charts.py <data_dir> <charts_dir> [tile_cache_dir]
Palette = dataviz reference instance, light mode, validated: blue #2a78d6 / orange #eb6834 / aqua #1baf7a / violet #6250d6 (adjacent-pair CVD dE 9.2, normal dE 27.6).
Every series is also direct-labelled (aqua is below 3:1 on the surface, so labels are mandatory)."""
import sys, os, json, math, io, time, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, pandas as pd
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.lines import Line2D
from load import LABEL

data, outd = sys.argv[1], sys.argv[2]
cache = sys.argv[3] if len(sys.argv) > 3 else '/tmp/tilecache'
os.makedirs(outd, exist_ok=True); os.makedirs(cache, exist_ok=True)
for f in fm.findSystemFonts():
    if 'Inter' in os.path.basename(f) and 'Display' not in f: fm.fontManager.addfont(f)
plt.rcParams.update({'font.family': 'Inter', 'svg.fonttype': 'none', 'font.size': 8.6, 'axes.edgecolor': '#c9c8c3', 'axes.linewidth': .8,
                     'axes.labelcolor': '#52514e', 'xtick.color': '#52514e', 'ytick.color': '#52514e', 'text.color': '#0b0b0b',
                     'figure.facecolor': '#fcfcfb', 'axes.facecolor': '#fcfcfb', 'savefig.facecolor': '#fcfcfb', 'axes.spines.top': False, 'axes.spines.right': False})
INK, INK2, MUTED, GRID = '#0b0b0b', '#52514e', '#85847e', '#e6e5e0'
COL = {'Aldar': '#2a78d6', 'Emaar': '#eb6834', 'Damac': '#1baf7a', 'Majid Al Futtaim': '#6250d6', 'mixed': '#85847e', 'mixed (older stock)': '#85847e'}
M = json.load(open(f'{data}/metrics.json'))
hy = pd.read_csv(f'{data}/psf_halfyear.csv'); qq = pd.read_csv(f'{data}/quarterly.csv'); band = pd.DataFrame(M['band'])
def lab(k): return LABEL[k][0]
def dev(k): return LABEL[k][1]
def save(fig, name): fig.savefig(f'{outd}/{name}.svg', bbox_inches='tight', pad_inches=.08); plt.close(fig)
def fmt(x): return f'{x:,.0f}'

# ---------- 1. price per sq ft today: range = p25-p75, dot = median
b = band[band.n >= 20].copy(); b['lab'] = [f'{lab(k)}  ·  {"new sale" if m == "Primary" else "resale"}' for k, m in zip(b.key, b.mkt)]
b = b.sort_values('psf')
fig, ax = plt.subplots(figsize=(6.9, .34 * len(b) + .9))
for i, (_, r) in enumerate(b.iterrows()):
    c = COL[dev(r.key)]
    ax.plot([r.p25, r.p75], [i, i], color=c, lw=5, solid_capstyle='round', alpha=.35, zorder=2)
    ax.scatter([r.psf], [i], s=62, zorder=3, facecolor=c if r.mkt == 'Primary' else '#fcfcfb', edgecolor=c, linewidth=2)
    ax.text(r.p75 + 22, i, f'{fmt(r.psf)}   ({fmt(r.price / 1e6 * 1e3)}k median price · n={int(r.n)})'.replace(f'{fmt(r.price / 1e6 * 1e3)}k', f'AED {r.price / 1e6:.2f}m'), va='center', fontsize=8, color=INK2)
ax.set_yticks(range(len(b))); ax.set_yticklabels(b.lab, fontsize=8.6)
for t, (_, r) in zip(ax.get_yticklabels(), b.iterrows()): t.set_color(INK)
ax.set_xlim(500, 2900); ax.set_xlabel('AED per sq ft of built-up area (median, bar = middle 50% of deals)')
ax.grid(axis='x', color=GRID, lw=.8); ax.set_axisbelow(True); ax.spines['left'].set_visible(False); ax.tick_params(axis='y', length=0)
h = [Line2D([], [], marker='o', ls='', color=INK2, markerfacecolor=INK2, ms=7, label='new sale (developer to buyer)'), Line2D([], [], marker='o', ls='', color=INK2, markerfacecolor='#fcfcfb', mew=2, ms=7, label='resale')]
h += [Line2D([], [], marker='s', ls='', color=COL[d_], ms=7, label=d_) for d_ in ('Aldar', 'Emaar', 'Damac', 'Majid Al Futtaim')]
ax.legend(handles=h, loc='lower center', bbox_to_anchor=(.5, 1.0), ncol=3, frameon=False, fontsize=8, handletextpad=.3, columnspacing=1.2)
save(fig, 'fig_psf_now')

# ---------- 2. price paths: Aldar new-sale ladder (left) and resale paths (right)
fig, (a1, a2) = plt.subplots(1, 2, figsize=(6.9, 3.15), gridspec_kw={'wspace': .32})
hs = ['2021-H2', '2022-H1', '2022-H2', '2023-H1', '2023-H2', '2024-H1', '2024-H2', '2025-H1', '2025-H2', '2026-H1', '2026-H2']
xi = {h_: i for i, h_ in enumerate(hs)}
def line(ax, key, mkt, color, ls='-', label=None, dx=.12, dy=0, marker='o'):
    g = hy[(hy.key == key) & (hy.mkt == mkt)].copy(); g = g[g.h.isin(xi)]
    g = g[g.h != '2026-H2']
    x = [xi[v] for v in g.h]; ax.plot(x, g.psf, color=color, lw=2, ls=ls, marker=marker, ms=4.5, mfc=color, mec='#fcfcfb', mew=1)
    if label and len(g): ax.text(x[-1] + dx, g.psf.iloc[-1] + dy, label, color=INK, fontsize=8, va='center', fontweight='bold')
def endlab(ax, key, mkt, text, ytxt, dx=.14, leader=False):
    g = hy[(hy.key == key) & (hy.mkt == mkt) & (hy.h != '2026-H2')]; g = g[g.h.isin(xi)]
    xe, ye = xi[g.h.iloc[-1]], g.psf.iloc[-1]
    if leader: ax.plot([xe + .08, xe + dx - .06], [ye, ytxt], color=MUTED, lw=.7, zorder=1)
    ax.text(xe + dx, ytxt, text, fontsize=7.9, va='center', fontweight='bold')
for k, c_ in (('Haven by Aldar|3', '#9ec3ee'), ('Athlon by Aldar|3', '#5b9be3'), ('The Wilds|3', '#1b4f93')):
    line(a1, k, 'Primary', c_)
    g = hy[(hy.key == k) & (hy.mkt == 'Primary') & (hy.h != '2026-H2')]
    endlab(a1, k, 'Primary', f"{lab(k)}\n{g.psf.iloc[0]:,.0f} → {g.psf.iloc[-1]:,.0f}", g.psf.iloc[-1] + (-38 if 'Haven' in k else 0))
a1.set_title('Aldar new-sale price per sq ft', loc='left', fontsize=9, fontweight='bold')
a1.set_ylim(1000, 2100)
LY = {'Tilal Al Ghaf|16': 1902, 'Arabian Ranches 3|16': 1630, 'The Valley|16': 1545, 'Athlon by Aldar|3': 1460, 'Haven by Aldar|3': 1375, 'DAMAC Lagoons|16': 1176}
for k, c_, ls in (('Arabian Ranches 3|16', COL['Emaar'], '-'), ('The Valley|16', COL['Emaar'], (0, (4, 2))), ('DAMAC Lagoons|16', COL['Damac'], '-'),
                  ('Tilal Al Ghaf|16', COL['Majid Al Futtaim'], '-'), ('Haven by Aldar|3', COL['Aldar'], '-'), ('Athlon by Aldar|3', COL['Aldar'], (0, (4, 2)))):
    line(a2, k, 'Resale', c_, ls); endlab(a2, k, 'Resale', lab(k), LY[k], dx=.45, leader=True)
a2.set_title('Resale price per sq ft (units 1,800–3,400 sq ft)', loc='left', fontsize=9, fontweight='bold'); a2.set_xlim(-.2, 13.4); a2.set_ylim(700, 2000)
for a in (a1, a2):
    a.set_xticks([0, 2, 4, 6, 8]) if a is a2 else None; a.set_xticklabels(['2021\nH2', '2022\nH2', '2023\nH2', '2024\nH2', '2025\nH2'] if a is a2 else [], fontsize=7.8) if a is a2 else None
    a.grid(axis='y', color=GRID, lw=.8); a.set_axisbelow(True); a.set_ylabel('AED / sq ft' if a is a1 else '')
a1.set_xticks([5, 6, 7, 8, 9]); a1.set_xticklabels(['2024\nH1', '2024\nH2', '2025\nH1', '2025\nH2', '2026\nH1'], fontsize=7.8); a1.set_xlim(4.8, 10.6)
save(fig, 'fig_paths')

# ---------- 3. cumulative registered primary sales since the announcement
fig, ax = plt.subplots(figsize=(6.9, 3.2))
shade = {'Haven by Aldar|3': '#9ec3ee', 'Athlon by Aldar|3': '#5b9be3', 'The Wilds|3': '#1b4f93'}
for k, v in M['aldar'].items():
    cur = np.array(v['curve']); x = np.r_[0, cur[:, 0]]; y = np.r_[0, cur[:, 1]]
    ax.step(x, y, where='post', color=shade[k], lw=2.4, clip_on=False)
    ax.scatter([0], [v['units']], marker='D', s=40, color=shade[k], zorder=5, edgecolor='#fcfcfb', clip_on=False)
    a12 = v['at12']; ax.scatter([12], [a12['n']], s=36, color=shade[k], zorder=5, edgecolor='#fcfcfb')
    ax.text(x[-1] + .7, y[-1], f"{lab(k)}  {int(y[-1]):,} units · AED {v['bn_all']:.1f}bn", fontsize=8.2, fontweight='bold', va='center', color=INK)
ax.axvline(12, color=GRID, lw=1, zorder=0); ax.text(12.4, 80, '12 months after the announcement', fontsize=7.6, color=INK2, ha='left', va='center')
ax.text(21, 470, '◆  units Aldar said it sold at the launch event\n●  registered 12 months after the announcement', fontsize=7.8, color=INK2, va='center', linespacing=1.5)
ax.set_xlim(0, 50); ax.set_ylim(0, 1600); ax.set_xticks(range(0, 37, 6)); ax.set_xlabel('months since Aldar announced the sell-out')
ax.set_ylabel('new sales registered with\nDubai Land Department (units)'); ax.grid(axis='y', color=GRID, lw=.8); ax.set_axisbelow(True)
save(fig, 'fig_cumulative')

# ---------- 4. quarterly transactions (Aldar, shared y) and peers (own y)
def qplot(ax, key, ymax=None, title=None, start='2024Q1'):
    g = qq[qq.key == key]; qs = [f'{y}Q{q}' for y in (2023, 2024, 2025, 2026) for q in (1, 2, 3, 4)]
    qs = qs[qs.index(start):qs.index('2026Q3') + 1]
    p = np.array([g[(g.q == s) & (g.mkt == 'Primary')].n.sum() for s in qs]); r = np.array([g[(g.q == s) & (g.mkt == 'Resale')].n.sum() for s in qs])
    x = np.arange(len(qs)); c = COL[dev(key)]
    ax.bar(x, p, color=c, width=.74); ax.bar(x, r, bottom=p, color=c, alpha=.38, width=.74, hatch='///', edgecolor='#fcfcfb', linewidth=0)
    ticks = [i for i, s in enumerate(qs) if s.endswith('Q1')]
    ax.set_xticks(ticks); ax.set_xticklabels([qs[i][:4] for i in ticks], fontsize=7.8)
    ax.set_title(title or lab(key), loc='left', fontsize=9, fontweight='bold', pad=8); ax.grid(axis='y', color=GRID, lw=.8); ax.set_axisbelow(True)
    tot = p + r; top = ymax or tot.max() * 1.22; ax.set_ylim(0, top)
    i = int(np.argmax(tot)); ax.text(i, tot[i] + top * .02, f'{int(tot[i]):,}', ha='center', fontsize=7.8, fontweight='bold')
    ax.tick_params(axis='y', labelsize=7.8)
fig, axs = plt.subplots(1, 3, figsize=(6.9, 2.1), sharey=True, gridspec_kw={'wspace': .08})
for ax, k in zip(axs, ('Haven by Aldar|3', 'Athlon by Aldar|3', 'The Wilds|3')): qplot(ax, k, 960)
axs[0].set_ylabel('registered sales per quarter')
h = [plt.Rectangle((0, 0), 1, 1, fc=COL['Aldar']), plt.Rectangle((0, 0), 1, 1, fc=COL['Aldar'], alpha=.38, hatch='///', ec='#fcfcfb')]
fig.legend(h, ['new sales', 'resale'], frameon=False, fontsize=8, loc='upper left', ncol=2, bbox_to_anchor=(.0, 1.16))
save(fig, 'fig_q_aldar')
fig, axs = plt.subplots(2, 3, figsize=(6.9, 3.55), gridspec_kw={'wspace': .3, 'hspace': .55})
for ax, k in zip(axs.flat, ('DAMAC Lagoons|16', 'The Valley|16', 'Arabian Ranches 3|16', 'Tilal Al Ghaf|16', 'DAMAC Hills 2|16', 'Dubai South|16')):
    qplot(ax, k, None, f'{lab(k)}  ({dev(k).replace("Majid Al Futtaim", "MAF")})', start='2023Q3' if not k.startswith('Dubai South') else '2024Q1')
hn = [plt.Rectangle((0, 0), 1, 1, fc=INK2), plt.Rectangle((0, 0), 1, 1, fc=INK2, alpha=.35, hatch='///', ec='#fcfcfb')]
fig.legend(hn, ['new sales (solid)', 'resale (hatched)'], frameon=False, fontsize=8, loc='upper left', ncol=2, bbox_to_anchor=(.0, 1.08))
save(fig, 'fig_q_peers')

# ---------- 5. resale momentum bars
mom = pd.DataFrame(M['mom']); mm = mom[(mom.mkt == 'Resale') & (mom.n_l >= 20) & (mom.n_p >= 20)].copy().sort_values('yoy_psf')
fig, ax = plt.subplots(figsize=(6.9, .29 * len(mm) + .65))
y = range(len(mm)); ax.barh(y, mm.yoy_psf, color=[COL[dev(k)] for k in mm.key], height=.58)
for i, (_, r) in enumerate(mm.iterrows()):
    ax.text(r.yoy_psf + .25, i, f'{r.yoy_psf:+.1f}%   ({fmt(r.psf_p)} → {fmt(r.psf_l)} AED/sq ft · n={int(r.n_p)} / {int(r.n_l)})', va='center', fontsize=8, color=INK2)
ax.set_yticks(list(y)); ax.set_yticklabels([lab(k) for k in mm.key], fontsize=8.8); ax.set_xlim(0, 33); ax.spines['left'].set_visible(False); ax.tick_params(axis='y', length=0)
ax.set_xlabel('change in median resale AED/sq ft, last 12 months vs the 12 months before'); ax.grid(axis='x', color=GRID, lw=.8); ax.set_axisbelow(True)
save(fig, 'fig_yoy')

# ---------- 6. scenarios for the DSO project
A = M['anchors']; S = M['scenarios']
fig, ax = plt.subplots(figsize=(6.9, 2.75))
cols = ['#9ec3ee', '#2a78d6', '#1b4f93']
refs = [('Haven new sales', A['haven_primary']), ('Damac Lagoons new', A['lagoons_primary']), ('Athlon new sales', A['athlon_primary']), ('The Valley resale', A['valley_resale']),
        ('Ranches 3 resale', A['ara3_resale']), ('The Wilds new sales', A['wilds_primary'])]
for j, (nme, v) in enumerate(refs):
    ax.plot([v, v], [-.5, 2.62], color=MUTED, lw=.8, ls=(0, (3, 3)), zorder=1)
    ax.text(v, 2.7, f'{nme}  {v:,.0f}', fontsize=7.4, color=INK2, ha='center', va='bottom', rotation=90)
for i, s in enumerate(S):
    y = 2 - i
    ax.barh(y, s['hi'] - s['lo'], left=s['lo'], height=.55, color=cols[i], zorder=3)
    ax.text(s['hi'] + 16, y, f"{s['lo']:,} – {s['hi']:,}", color=INK, ha='left', va='center', fontsize=9.4, fontweight='bold', zorder=5, bbox=dict(boxstyle='round,pad=.25', fc='#fcfcfb', ec='none'))
    ax.text(s['lo'] - 16, y, s['name'], fontsize=9, fontweight='bold', ha='right', va='center', zorder=5, bbox=dict(boxstyle='round,pad=.2', fc='#fcfcfb', ec='none'))
ax.set_xlim(1000, 2050); ax.set_ylim(-.5, 3.9); ax.set_yticks([]); ax.spines['left'].set_visible(False)
ax.set_xlabel('expected launch price, AED per sq ft of built-up area (analyst estimate, not an Aldar price)'); ax.grid(axis='x', color=GRID, lw=.8); ax.set_axisbelow(True)
save(fig, 'fig_scenarios')

# ---------- 7. satellite locator map (Esri World Imagery) with Blue Line + communities
def tile(z, x, y):
    p = f'{cache}/{z}_{x}_{y}.jpg'
    if not os.path.exists(p):
        u = f'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        for attempt in range(6):
            try: data_ = urllib.request.urlopen(req, timeout=40).read(); open(p, 'wb').write(data_); break
            except Exception as e:
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
bl = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bluline.json')))
X, Y = P(55.3946, 25.1272)
kmpx = (2 ** Z * 256 / 360) / (111.32 * math.cos(math.radians(25.127)))   # pixels per km at this zoom and latitude
for r_, lb in ((5, '5 km'), (10, '10 km')):
    th = np.linspace(0, 2 * np.pi, 200); ax.plot(X + r_ * kmpx * np.cos(th), Y + r_ * kmpx * np.sin(th), color='white', lw=1.1, ls=(0, (4, 3)), alpha=.85, zorder=2)
    ax.text(X + r_ * kmpx * .72 + 4, Y - r_ * kmpx * .72 - 4, lb, color='white', fontsize=7.6, fontweight='bold', zorder=3)
for seg in bl.values():
    xy = np.array([P(a, b_) for a, b_ in seg]); ax.plot(xy[:, 0], xy[:, 1], color='#ffffff', lw=5.2, solid_capstyle='round', zorder=3); ax.plot(xy[:, 0], xy[:, 1], color='#2a78d6', lw=3, solid_capstyle='round', zorder=4)
bx, by = P(55.343, 25.215)
ax.text(bx - 14, by + 8, 'Metro Blue Line\n(opening targeted 2029)', color='white', fontsize=8.2, fontweight='bold', va='center', ha='right', zorder=6, bbox=dict(boxstyle='round,pad=.3', fc=(0, 0, 0, .6), ec='none'))
dd = {'Haven by Aldar|3': (16, -2, 'l'), 'Athlon by Aldar|3': (-16, 6, 'r'), 'The Wilds|3': (-16, -4, 'r'), 'Arabian Ranches 3|16': (16, 6, 'l'), 'The Valley|16': (-16, 0, 'r'),
      'DAMAC Lagoons|16': (16, 6, 'l'), 'Tilal Al Ghaf|16': (16, -6, 'l'), 'DAMAC Hills 2|16': (16, 0, 'l')}
for k, (ox_, oy_, side) in dd.items():
    L = M['loc'][k]; X1, Y1 = P(L['lon'], L['lat'])
    c = COL[dev(k)]; ax.scatter([X1], [Y1], s=95, color=c, edgecolor='white', linewidth=2, zorder=7)
    ax.text(X1 + ox_, Y1 + oy_, lab(k), color='white', fontsize=8.2, fontweight='bold', ha='left' if side == 'l' else 'right', va='center', zorder=8, bbox=dict(boxstyle='round,pad=.25', fc=(0, 0, 0, .6), ec='none'))
ax.scatter([X], [Y], s=340, marker='*', color='#E9C47C', edgecolor='#08080A', linewidth=1.4, zorder=9)
ax.text(X - 20, Y - 6, "Dubai Silicon Oasis\nAldar's 4th Dubai project: 'near' here", color='#08080A', fontsize=8.2, fontweight='bold', va='center', ha='right', zorder=9, linespacing=1.3, bbox=dict(boxstyle='round,pad=.3', fc='#E9C47C', ec='none'))
ax.plot([30, 30 + 5 * kmpx], [H - 30, H - 30], color='white', lw=3, zorder=9); ax.text(30 + 2.5 * kmpx, H - 42, '5 km', color='white', fontsize=7.6, fontweight='bold', ha='center', zorder=9)
ax.text(W - 6, H - 8, 'Imagery © Esri, Maxar, Earthstar Geographics · Blue Line alignment © OpenStreetMap contributors (ODbL)', color='white', fontsize=6.4, ha='right', va='bottom', zorder=9, bbox=dict(boxstyle='round,pad=.2', fc=(0, 0, 0, .5), ec='none'))
fig.savefig(f'{outd}/fig_map.jpg', dpi=190, format='jpg', pil_kwargs={'quality': 88}); plt.close(fig)
print('charts ok', sorted(os.listdir(outd)))
