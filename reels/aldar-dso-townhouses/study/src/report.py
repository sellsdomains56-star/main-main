"""Assemble the study HTML from metrics.json + charts. Usage: python3 -I report.py <data_dir> <charts_dir> <out_html>"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
from load import LABEL

data, charts, out = sys.argv[1:4]
M = json.load(open(f'{data}/metrics.json'))
band = pd.DataFrame(M['band']); mom = pd.DataFrame(M['mom']); beh = pd.DataFrame(M['beh']).set_index('key'); hy = pd.read_csv(f'{data}/psf_halfyear.csv')
AL = M['aldar']; A = M['anchors']; SC = M['scenarios']; SZ = M['ref_sizes']; LOC = M['loc']; RD = M['ready']
H, AT, WI = 'Haven by Aldar|3', 'Athlon by Aldar|3', 'The Wilds|3'
ARA, VAL, LAG, TIL, HI2, DS, DSO = 'Arabian Ranches 3|16', 'The Valley|16', 'DAMAC Lagoons|16', 'Tilal Al Ghaf|16', 'DAMAC Hills 2|16', 'Dubai South|16', 'Dubai Silicon Oasis (DSO)|3'
def B(k, m): return band[(band.key == k) & (band.mkt == m)].iloc[0]
def MO(k, m): return mom[(mom.key == k) & (mom.mkt == m)].iloc[0]
def HYV(k, m, h): r = hy[(hy.key == k) & (hy.mkt == m) & (hy.h == h)]; return float(r.psf.iloc[0]) if len(r) else None
f0 = lambda x: f'{x:,.0f}'
pc = lambda a, b: (a / b - 1) * 100
lab = lambda k: LABEL[k][0]
def img(name, alt, cls=''): return f'<img class="fig {cls}" src="{charts}/{name}" alt="{alt}">'
def tbl(head, rows, cls='', widths=None):
    ths = ''.join(f'<th{" style=width:%s" % widths[i] if widths else ""}>{h}</th>' for i, h in enumerate(head))
    trs = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    return f'<table class="{cls}"><thead><tr>{ths}</tr></thead><tbody>{trs}</tbody></table>'
PAGES = []
def page(title, body, kicker='', dark=False):
    n = len(PAGES) + 1
    PAGES.append(f'<section class="page{" dark" if dark else ""}"><header><span>ALDAR · DUBAI TOWNHOUSE STUDY</span><span>{kicker}</span></header><h2>{title}</h2>{body}<footer><span>Analyst study · 16 October 2026 · not investment advice</span><span>{n + 1}</span></footer></section>')

# ---------------- numbers used in the text
ladder1, ladder2 = pc(A['athlon_primary'], A['haven_primary']), pc(A['wilds_primary'], A['athlon_primary'])
yoy = {k: MO(k, 'Resale').yoy_psf for k in (H, AT, ARA, VAL, LAG, TIL, DSO)}
tot_u, tot_bn = M['totals']['aldar_units'], M['totals']['aldar_bn']
t3_lo, t3_hi = SC[1]['lo'] * SZ['3'] / 1e6, SC[1]['hi'] * SZ['3'] / 1e6
sz3, sz4, sz5 = round(SZ['3'], -1), round(SZ['4'], -1), round(SZ['5'], -1)
hold = {k: beh.loc[k, 'hold_med'] for k in beh.index}
mo = lambda d: d / 30.44
aL = sum(MO(k, m).n_l for k in (H, AT, WI) for m in ('Primary', 'Resale')); aP = sum(MO(k, m).n_p for k in (H, AT, WI) for m in ('Primary', 'Resale'))
aVL = sum(MO(k, m).val_l for k in (H, AT, WI) for m in ('Primary', 'Resale')); aVP = sum(MO(k, m).val_p for k in (H, AT, WI) for m in ('Primary', 'Resale'))
def tot12(k): a = mom[mom.key == k]; return a.n_l.sum(), a.n_p.sum(), a.val_l.sum(), a.val_p.sum()

# ================= PAGE: executive summary
stats = f'''<div class="stats">
<div class="stat gold"><b>AED {SC[1]['lo']:,}–{SC[1]['hi']:,}</b><span>base-case launch price per sq ft<br>(analyst estimate, not an Aldar price)</span></div>
<div class="stat"><b>AED {tot_bn:.1f}bn</b><span>new sales Aldar has registered in Dubai: {tot_u:,} homes in 3 launches</span></div>
<div class="stat"><b>+{yoy[H]:.0f}% / +{yoy[AT]:.0f}%</b><span>12-month resale price growth, Haven / Athlon, against +{min(yoy[TIL], yoy[LAG]):.0f}% to +{yoy[VAL]:.0f}% at Emaar, Damac and MAF communities</span></div>
<div class="stat"><b>−38%</b><span>Dubai home-sale transactions, Q3 2026 vs Q3 2025 (value −47%)</span></div></div>'''
exec_body = stats + f'''
<ol class="find">
<li><b>The project.</b> Aldar and Dubai Holding plan a "very large" villa and townhouse community "above the Blue Line extension", near Dubai Silicon Oasis, to launch by end-2026. It is Aldar's fourth Dubai project. Name, size, prices, payment plan and handover date are <u>not disclosed</u>.</li>
<li><b>Expected price.</b> We expect <b>AED {SC[1]['lo']:,}–{SC[1]['hi']:,} per sq ft</b> of built-up area: about <b>AED {t3_lo:.1f}–{t3_hi:.1f}m</b> for a typical 3-bedroom townhouse of ~{sz3:,.0f} sq ft. Anchors: Aldar's own ladder of launch prices (Haven {f0(A['haven_primary'])}, Athlon {f0(A['athlon_primary'])}, The Wilds {f0(A['wilds_primary'])}) and what two- to three-year-old Emaar townhouses resell for today ({f0(A['valley_resale'])}–{f0(A['ara3_resale'])}).</li>
<li><b>Aldar raises its prices at every launch and still sells out.</b> Launch price per sq ft rose {ladder1:.0f}% from Haven to Athlon and {ladder2:.0f}% from Athlon to The Wilds. The three launches produced {tot_u:,} registered sales worth AED {tot_bn:.1f}bn.</li>
<li><b>Sales are launch-driven.</b> {AL[WI]['at12']['n']:,}–{AL[AT]['at12']['n']:,} homes (AED {AL[H]['at12']['bn']:.1f}–{AL[WI]['at12']['bn']:.1f}bn) were registered within 12 months of each announcement, most of it between months 3 and 9. After that the pace drops to 20–50 homes a quarter per community.</li>
<li><b>The after-market is the soft spot.</b> Resale prices at Haven and Athlon grew +{yoy[H]:.1f}% and +{yoy[AT]:.1f}% in 12 months; Emaar, Damac and MAF peers grew +{yoy[TIL]:.1f}% to +{yoy[VAL]:.1f}%. Aldar buyers also resell sooner (median {hold[H]:.0f} and {hold[AT]:.0f} days after buying, against {hold[VAL]:.0f}–{hold[ARA]:.0f} days for the peers).</li>
<li><b>The edge is location and brand.</b> Aldar's CEO places the project "above the Blue Line extension" (Metro Blue Line: 30 km, 14 stations, opening targeted for September 2029). Haven, Aldar's closest community, is {LOC[H]['km_dso']:.1f} km from Dubai Silicon Oasis. No townhouse sale has been recorded in Silicon Oasis in five years, so a large townhouse community there would be new supply for the area.</li>
<li><b>The gap is delivery.</b> Aldar has no completed home in Dubai yet; the first handover (Haven) is due in 2027. Emaar, Damac and MAF townhouse communities already trade as completed stock.</li></ol>
<div class="verdict"><b>View.</b> At <b>or below ~AED 1,650 per sq ft</b> the launch should clear quickly on Aldar's record, at a price not far above what Emaar townhouses resell for (1,389–1,430). At Wilds-style pricing (AED 1,800+), the resale data say the buyer's upside is thin and the sales pace would be tested by a market that is cooling. This is a data-based view of an unlaunched project, not investment advice.</div>'''
page('Executive summary', exec_body, 'THE ANSWER FIRST')

# ================= PAGE: what is known
know = tbl(['Item', 'What is public', 'Source'], [
    ['Developer', 'Aldar Properties with Dubai Holding. Fourth Dubai project after Haven, Athlon and The Wilds.', 'The National, 14 Oct 2026'],
    ['Product', '"A very large villa community [with] townhouses", "above the Blue Line extension".', 'Aldar Development CEO Jonathan Emery'],
    ['Location', 'Near Dubai Silicon Oasis (the same article\'s summary bullet says "near Dubai Internet City", which does not fit the Blue Line remark). Re-check on Aldar\'s launch release.', 'The National'],
    ['Launch', 'Planned by the end of 2026.', 'The National'],
    ['Name', '<b>Not disclosed.</b> Third-party sites call it "Greenwoods by Aldar"; Aldar has not confirmed this.', '—'],
    ['Size and unit mix', '<b>Not disclosed.</b> A figure of about 8,000 homes on third-party sites is unconfirmed.', '—'],
    ['Price, payment plan, handover', '<b>Not disclosed.</b> This study estimates the price; everything else must wait for Aldar.', '—'],
    ['Related land deal', 'Feb 2026: Aldar and Dubai Holding added two Dubai plots with almost 14,000 homes and a gross development value above Dh38bn (one of 4 million sq m opposite Nad Al Sheba, one on Palm Jebel Ali). The article does not say either plot is this project.', 'The National'],
], widths=['19%', '57%', '24%'])
tl = '''<div class="tl">
<div><i></i><b>1 Nov 2023</b><span>Haven: first two phases sold out, 786 homes, AED 3.1bn</span></div>
<div><i></i><b>9 May 2024</b><span>Athlon: 1,000+ homes, AED 4.1bn in 48 hours</span></div>
<div><i></i><b>5 Mar 2025</b><span>The Wilds: phase 1, 734 villas, AED 5bn</span></div>
<div><i></i><b>Feb 2026</b><span>Two more plots, ~14,000 homes, GDV above Dh38bn</span></div>
<div class="now"><i></i><b>By end-2026</b><span>Fourth Dubai project launches near Silicon Oasis</span></div></div>'''
page('What is known, and what is not', know + '<h3>Aldar in Dubai: the sequence</h3>' + tl +
     '<p class="note">Aldar figures are from its own press releases (Haven 1 Nov 2023, Athlon 9 May 2024, The Wilds 5 Mar 2025). The Haven and Athlon unit counts are as reported by news agencies carrying the releases. A property-advertising permit, escrow registration and Dubai Land Department project registration are separate facts to confirm at launch.</p>', 'THE PROJECT')

# ================= PAGE: location
rows = []
order = [DSO, H, WI, AT, ARA, VAL, TIL, LAG, HI2, DS]
for k in order:
    L = LOC[k]; rows.append([lab(k), LABEL[k][1].replace(' (older stock)', '').replace('Majid Al Futtaim', 'MAF'), f"{L['km_dso']:.1f}", f"{L['km_blue']:.1f}"])
loc_body = img('fig_map.jpg', 'Map of Dubai Silicon Oasis, the Blue Line and the comparison communities', 'map') + '<div class="two"><div>' + tbl(['Community', 'Developer', 'km to Silicon Oasis', 'km to Blue Line'], rows, 'small', ['34%', '30%', '18%', '18%']) + f'''</div><div class="txt">
<p><b>Haven is the nearest comparable</b>: {LOC[H]['km_dso']:.1f} km from Silicon Oasis and {LOC[H]['km_blue']:.1f} km from the planned alignment. Athlon and The Wilds are about {LOC[AT]['km_dso']:.0f} km away, Emaar's Arabian Ranches 3 about {LOC[ARA]['km_dso']:.0f} km. Damac Lagoons and Tilal Al Ghaf are {LOC[LAG]['km_dso']:.0f} km away.</p>
<p><b>Silicon Oasis has no townhouse sales yet.</b> The Dubai Land Department records show zero townhouse transactions there in five years. Its {beh.loc[DSO, 'n']} villa deals are {beh.loc[DSO, 'resale_share']:.0f}% resale of older stock (median size about 3,900 sq ft), selling at AED {f0(MO(DSO, 'Resale').psf_l)} per sq ft over the last 12 months, +{yoy[DSO]:.1f}% on the year before.</p>
<p><b>The Blue Line is the differentiator.</b> 30 km, 14 stations, opening targeted for 9 September 2029 (RTA via Dubai Media Office). None of the Aldar, Emaar or Damac comparison communities sits within 3 km of the alignment.</p></div></div>
<p class="note">Distances are straight-line from the median coordinates of each community's transactions to the Dubai Silicon Oasis centre and to the nearest point of the OpenStreetMap Blue Line alignment. The new site\'s exact position is not public, so treat all distances as indicative.</p>'''
page('Location: Silicon Oasis and the Blue Line', loc_body, 'LOCATION')

# ================= PAGE: Aldar track record
def lrow(k, ann_txt, buyers):
    L = AL[k]; r = beh.loc[k]
    return [f'<b>{lab(k)}</b>', ann_txt, f"{L['n_all']:,} · AED {L['bn_all']:.1f}bn", f"{L['at12']['n']:,} · AED {L['at12']['bn']:.1f}bn", f"{L['first_reg_month']:.1f} mo", f0(B(k, 'Primary').psf), buyers]
tr = tbl(['Community', 'Aldar announcement', 'Registered new sales to date', 'Registered by month 12', 'Lag to first registration', 'New-sale AED/sq ft', 'Expat + overseas buyers'], [
    lrow(H, '1 Nov 2023 · 786 homes · AED 3.1bn', '77%'), lrow(AT, '9 May 2024 · 1,000+ homes · AED 4.1bn in 48 h', '81%'), lrow(WI, '5 Mar 2025 · 734 villas · AED 5bn', '92%')], 'small', ['11%', '24%', '15%', '15%', '10%', '11%', '14%'])
rec_body = tr + img('fig_cumulative.svg', 'Cumulative registered new sales since announcement') + f'''<ul class="bul">
<li><b>{tot_u:,} homes and AED {tot_bn:.1f}bn</b> of new sales are on the Dubai Land Department record for the three launches, over 2.6 years. The Wilds raised AED {AL[WI]['bn_all']:.1f}bn from only {AL[WI]['n_all']:,} homes because it is priced highest; Athlon raised AED {AL[AT]['bn_all']:.1f}bn from {AL[AT]['n_all']:,}.</li>
<li><b>The land register lags the launch by {min(AL[k]['first_reg_month'] for k in AL):.0f} to {max(AL[k]['first_reg_month'] for k in AL):.0f} months.</b> Sales announced at the event appear on the record only when contracts are registered, so DLD data show a launch late. Expect the new project's numbers to show up in spring 2027, not at launch.</li>
<li><b>Most of the volume comes in months 3 to 9,</b> then a tail. Month-12 totals ({AL[WI]['at12']['n']}–{AL[AT]['at12']['n']:,} homes, AED {AL[H]['at12']['bn']:.1f}–{AL[WI]['at12']['bn']:.1f}bn) are the best yardstick for a first-year target.</li>
<li><b>International demand is the engine</b> (77–92% of buyers are expatriates or overseas, per Aldar). Aldar's CEO told The National that "the international side… slowed a little bit" while "the customers are still there for the right product".</li>
<li><b>Cross-check of the data:</b> Gulf News reported three-bedroom villas at The Wilds from Dh5.1m at launch; the register's median three-bedroom price there is AED {M['unit_mix'][7]['price'] / 1e6:.1f}m.</li></ul>
<p class="note">Aldar's announced figures cover the sell-out of the first phases; the register also includes later phases, so it exceeds the announced totals.</p>'''
page("Aldar's Dubai record: three launches", rec_body, 'TRACK RECORD')

# ================= PAGE: peers and method
peer_rows = [
    ['Aldar (with Dubai Holding)', 'Haven · Athlon · The Wilds', 'villas and townhouses, 3–5 bed', f"{M['totals']['aldar_units'] + sum(beh.loc[k, 'n_resale'] for k in (H, AT, WI)):,}", 'new + resale, from 2024'],
    ['Emaar', 'The Valley · Arabian Ranches 3', 'townhouses, 3–5 bed', f"{beh.loc[VAL, 'n'] + beh.loc[ARA, 'n']:,}", 'new 2021–24, resale to now'],
    ['Damac', 'Damac Lagoons · Damac Hills 2', 'townhouses, 3–5 bed', f"{beh.loc[LAG, 'n'] + beh.loc[HI2, 'n']:,}", 'new to Apr 2026, resale to now'],
    ['Majid Al Futtaim', 'Tilal Al Ghaf', 'townhouses, 3–4 bed', f"{beh.loc[TIL, 'n']:,}", 'mostly resale'],
    ['Context', 'Dubai South · Dubai Silicon Oasis', 'townhouses · older villas', f"{beh.loc[DS, 'n'] + beh.loc[DSO, 'n']:,}", 'location comparison'],
]
peers = tbl(['Developer', 'Communities', 'Product', 'Sales records', 'Window'], peer_rows, '', ['20%', '28%', '24%', '12%', '16%'])
meth = f'''<ul class="bul">
<li><b>Data.</b> {M['n_raw_rows']:,} Dubai Land Department sale records (via the Bayut transactions service) were pulled on 16 October 2026; {M['n_peer_set']:,} form the comparison set after dropping {M['n_raw_rows'] - M['n_clean']} records with implausible price per sq ft and the records of communities kept for context only. Window: October 2021 to 14 October 2026.</li>
<li><b>Price per sq ft</b> = registered price divided by built-up area. To avoid mixing unit sizes, the headline comparison uses homes of 1,800–3,400 sq ft (the size of a 3- to 4-bedroom townhouse) sold in the last 24 months, and reports medians with the middle 50% of deals.</li>
<li><b>New sale vs resale.</b> "New sale" is the developer's first sale (off-plan); "resale" is any later sale, including off-plan contract assignments.</li>
<li><b>Momentum</b> compares the last 12 months (17 Oct 2025 – 16 Oct 2026) with the 12 months before. Medians need at least 20 deals per window to be shown.</li>
<li><b>Why these peers.</b> They are the tier-one master-developer townhouse and villa communities in the Dubailand and Dubai South corridor, where Aldar has built so far. Emaar's luxury The Oasis (median deal AED {M['oasis']['median_price'] / 1e6:.0f}m, {M['oasis']['n_primary']:,} new sales worth AED {M['oasis']['bn_primary']:.1f}bn) is a different price tier and is shown for scale only. Sobha Hartland, Mudon and Nad Al Sheba record their homes under other categories and are not included.</li></ul>'''
samp = tbl(['Community', 'New sales', 'Resale', 'First and last new-sale registration', 'Median size (sq ft)'], [[f'<b>{lab(k)}</b>', f"{int(beh.loc[k, 'n_primary']):,}", f"{int(beh.loc[k, 'n_resale']):,}", f"{beh.loc[k, 'first_primary'] or '–'} to {beh.loc[k, 'last_primary'] or '–'}", f0(M['unit_size'][k])] for k in (H, AT, WI, ARA, VAL, LAG, HI2, TIL, DS, DSO)], 'small', ['24%', '13%', '13%', '34%', '16%'])
page('Who we compare, and how', '<p class="lead">Aldar is compared with the tier-one developers whose townhouse communities compete for the same buyer.</p>' + peers + '<h3>Method in brief</h3>' + meth, 'PEER SET AND METHOD')

# ================= PAGE: price per sq ft today
fb = lambda k, m: B(k, m)
p7 = img('fig_psf_now.svg', 'Price per sq ft today by community') + f'''<ul class="bul">
<li><b>Aldar launches have been priced at or just under Emaar resale.</b> Athlon\'s new sales ({f0(A['athlon_primary'])}) sit {abs(pc(A['athlon_primary'], A['valley_resale'])):.0f}% below The Valley\'s resale ({f0(A['valley_resale'])}) and {abs(pc(A['athlon_primary'], A['ara3_resale'])):.0f}% below Arabian Ranches 3 ({f0(A['ara3_resale'])}); Haven ({f0(A['haven_primary'])}) sat {abs(pc(A['haven_primary'], A['valley_resale'])):.0f}% below. A buyer paid roughly what an Emaar townhouse costs on the resale market (a mix of completed homes and off-plan contracts) for a home delivered years later.</li>
<li><b>The Wilds broke the pattern:</b> {f0(A['wilds_primary'])} per sq ft for the size band (about AED {B(WI, 'Primary').price / 1e6:.1f}m median), level with MAF's mature Tilal Al Ghaf resale ({f0(A['tilal_resale'])}).</li>
<li><b>Resale premium over the launch price is modest:</b> Haven resells {pc(A['haven_resale'], A['haven_primary']):+.0f}% above its new-sale median, Athlon {pc(A['athlon_resale'], A['athlon_primary']):+.0f}%. Compare Damac Lagoons, where resale ({f0(A['lagoons_resale'])}) sits {abs(pc(A['lagoons_resale'], A['lagoons_primary'])):.0f}% <u>below</u> the newest developer prices ({f0(A['lagoons_primary'])}): many sellers, little premium.</li>
<li><b>Ticket size follows the product:</b> Athlon\'s median new sale is AED {B(AT, 'Primary').price / 1e6:.2f}m, Haven\'s AED {B(H, 'Primary').price / 1e6:.2f}m, The Wilds AED {B(WI, 'Primary').price / 1e6:.2f}m; Emaar and Damac townhouses clear at AED {B(VAL, 'Resale').price / 1e6:.2f}–{B(LAG, 'Primary').price / 1e6:.2f}m.</li></ul>
<p class="note">Sizes 1,800–3,400 sq ft, sold 17 Oct 2024 – 16 Oct 2026. Dots are medians, bars the middle 50% of deals. Built-up area as recorded by the Dubai Land Department; developers may quote on a different (sellable) area.</p>'''
page('Price per sq ft today', p7, 'PRICE LEVEL')

# ================= PAGE: price paths and momentum
a_first = lambda k, m: hy[(hy.key == k) & (hy.mkt == m)].sort_values('h').iloc[0]
def gain(k):
    g = hy[(hy.key == k) & (hy.mkt == 'Resale') & (hy.h != '2026-H2')].sort_values('h'); return g.iloc[0].h, g.iloc[0].psf, g.iloc[-1].psf, pc(g.iloc[-1].psf, g.iloc[0].psf)
gt, gv, gl = gain(TIL), gain(VAL), gain(ARA)
p8 = img('fig_paths.svg', 'Price per sq ft over time') + img('fig_yoy.svg', 'Resale price growth over the last 12 months') + f'''<ul class="bul">
<li><b>Aldar's new-sale prices rise in steps.</b> Within a community they creep up (Haven {HYV(H, 'Primary', '2024-H1'):,.0f} → {HYV(H, 'Primary', '2025-H1'):,.0f} over a year; Athlon {HYV(AT, 'Primary', '2024-H2'):,.0f} → {HYV(AT, 'Primary', '2026-H1'):,.0f}); between launches they jump (+{ladder1:.0f}%, then +{ladder2:.0f}%). The Wilds moved from {HYV(WI, 'Primary', '2025-H1'):,.0f} to {HYV(WI, 'Primary', '2026-H1'):,.0f} in a year as later phases launched.</li>
<li><b>Emaar and MAF resale prices have compounded.</b> Tilal Al Ghaf {gt[1]:,.0f} → {gt[2]:,.0f} ({gt[3]:+.0f}% since {gt[0]}), The Valley {gv[1]:,.0f} → {gv[2]:,.0f} ({gv[3]:+.0f}% since {gv[0]}), Arabian Ranches 3 {gl[1]:,.0f} → {gl[2]:,.0f} ({gl[3]:+.0f}% since {gl[0]}).</li>
<li><b>Aldar's resale growth lags.</b> +{yoy[H]:.1f}% (Haven) and +{yoy[AT]:.1f}% (Athlon) against +{yoy[TIL]:.1f}% to +{yoy[VAL]:.1f}% for the four tier-one peers. The likely reason is timing: off-plan contracts trade near the launch price until a community is built and lived in. Aldar's first Dubai handover (2027) is the test.</li>
<li><b>Even the leaders flattened late:</b> resale prices at Valley, Lagoons and Tilal dipped slightly since 1 July 2026 (small samples), so do not extrapolate +10% a year.</li></ul>
<p class="note">Half-year medians, 1,800–3,400 sq ft homes, at least 10 deals; the part-period since 1 July 2026 is left out of the lines.</p>'''
page('Price momentum', p8, 'PRICE MOMENTUM')

# ================= PAGE: sales momentum and volume
tw = tbl(['Community', 'Deals, last 12 months', 'Deals, 12 months before', 'Change', 'Value, last 12m', 'Value, prior 12m'], [
    [f'<b>{lab(k)}</b>', f'{tot12(k)[0]:,}', f'{tot12(k)[1]:,}', f'{pc(tot12(k)[0], tot12(k)[1]):+.0f}%', f'AED {tot12(k)[2]:.2f}bn', f'AED {tot12(k)[3]:.2f}bn'] for k in (H, AT, WI, LAG, VAL, ARA, TIL)] +
    [['<b>Aldar, three communities</b>', f'<b>{aL:,}</b>', f'<b>{aP:,}</b>', f'<b>{pc(aL, aP):+.0f}%</b>', f'<b>AED {aVL:.2f}bn</b>', f'<b>AED {aVP:.2f}bn</b>']], 'small', ['24%', '14%', '16%', '10%', '18%', '18%'])
p9 = '<h3>Aldar: a spike at each launch, then a tail</h3>' + img('fig_q_aldar.svg', 'Quarterly registered transactions, Aldar communities') + '<h3>Peers: steadier, and mostly resale now</h3>' + img('fig_q_peers.svg', 'Quarterly registered transactions, peer communities') + f'''<ul class="bul">
<li><b>Launch quarter:</b> Haven {max(r['n'] for r in M['q'] if r['key'] == H and r['q'] == '2024Q2' and r['mkt'] == 'Primary'):,} registered new sales in 2024 Q2, Athlon {max(r['n'] for r in M['q'] if r['key'] == AT and r['q'] == '2024Q3' and r['mkt'] == 'Primary'):,} in 2024 Q3, The Wilds {max(r['n'] for r in M['q'] if r['key'] == WI and r['q'] == '2025Q3' and r['mkt'] == 'Primary'):,} in 2025 Q3; then 20–50 a quarter. Each spike appears on the land register 3–4 months after the sales event.</li>
<li><b>Damac Lagoons is the volume benchmark:</b> {beh.loc[LAG, 'n']:,} deals and AED {beh.loc[LAG, 'val_primary'] + beh.loc[LAG, 'val_resale']:.1f}bn since December 2021, still 165–325 a quarter, and almost all of it resale now ({MO(LAG, 'Resale').n_l / tot12(LAG)[0] * 100:.0f}% of the last 12 months). Emaar's and MAF's older communities trade 20–80 a quarter.</li></ul>
<p class="note">Registered transactions per quarter to mid-October 2026 (last bar is a part-quarter). Aldar panels share one scale; peer panels do not.</p>'''
page('Sales momentum', p9, 'SALES MOMENTUM')

# ================= PAGE: liquidity
liq_rows = []
for k in (H, AT, WI, ARA, VAL, LAG, TIL):
    r = beh.loc[k]
    try: prem = f"{pc(B(k, 'Resale').psf, B(k, 'Primary').psf):+.0f}%" if B(k, 'Resale').n >= 20 and B(k, 'Primary').n >= 20 else 'n/a'
    except Exception: prem = 'n/a'
    ready = RD[k]['n_ready'] / RD[k]['n'] * 100
    liq_rows.append([f'<b>{lab(k)}</b> <small>{LABEL[k][1]}</small>', f"{r['n']:,}", f"{r['resale_share']:.0f}%", f"{r['hold_med']:.0f} days ({mo(r['hold_med']):.0f} mo)", prem, f'{ready:.0f}%'])
p10v = '<h3>Volume: the last 12 months against the 12 before</h3>' + tw + f'''<ul class="bul">
<li><b>Aldar's three communities registered {aL:,} deals in the last 12 months against {aP:,} in the 12 before ({pc(aL, aP):+.0f}%)</b>, because each launch burst has passed. Damac Lagoons ({pc(tot12(LAG)[0], tot12(LAG)[1]):+.0f}%), Arabian Ranches 3 ({pc(tot12(ARA)[0], tot12(ARA)[1]):+.0f}%) and Tilal Al Ghaf ({pc(tot12(TIL)[0], tot12(TIL)[1]):+.0f}%) cooled; The Valley is flat ({pc(tot12(VAL)[0], tot12(VAL)[1]):+.0f}%).</li>
<li><b>Emaar's volume has moved to The Oasis:</b> {M['oasis']['n_primary']:,} new sales worth AED {M['oasis']['bn_primary']:.1f}bn in the register (median deal AED {M['oasis']['median_price'] / 1e6:.0f}m). Reidin ranks it the top off-plan villa location of Q1 2026 by value (AED 9.71bn in one quarter).</li>
</ul><h3>Liquidity: who sells, and how soon</h3>'''
p10 = p10v + tbl(['Community', 'Deals', 'Resale share', 'Median time from purchase to resale', 'Resale vs new-sale price', 'Completed homes among deals'], liq_rows, 'small', ['25%', '9%', '12%', '24%', '16%', '14%']) + f'''
<ul class="bul">
<li><b>Aldar buyers sell early, into a thinner market.</b> The median resale comes {hold[H]:.0f} days (about {mo(hold[H]):.0f} months) after purchase at Haven and {hold[AT]:.0f} days at Athlon; Emaar and Damac buyers hold {mo(hold[VAL]):.0f}–{mo(hold[ARA]):.0f} months. Early resales are mostly off-plan assignments: a sign of investor-heavy buying, and resale is only {beh.loc[H, 'resale_share']:.0f}% / {beh.loc[AT, 'resale_share']:.0f}% of deals, against {beh.loc[ARA, 'resale_share']:.0f}% at Arabian Ranches 3.</li>
<li><b>Completed stock is the missing proof point.</b> No Aldar Dubai deal is a completed home; {RD[ARA]['n_ready'] / RD[ARA]['n'] * 100:.0f}% of Arabian Ranches 3, {RD[TIL]['n_ready'] / RD[TIL]['n'] * 100:.0f}% of Tilal Al Ghaf and {RD[LAG]['n_ready'] / RD[LAG]['n'] * 100:.0f}% of Damac Lagoons deals are. Reidin lists 3,802 Damac Lagoons handovers announced for Q2 2026.</li>
<li><b>For the new project:</b> expect an investor-heavy first phase and assignments about 12–14 months after launch, at a modest resale premium ({pc(A['athlon_resale'], A['athlon_primary']):+.0f}% to {pc(A['haven_resale'], A['haven_primary']):+.0f}%) if priced near Athlon.</li></ul>'''
page('Volume, liquidity and investor behaviour', p10, 'VOLUME AND LIQUIDITY')

# ================= PAGE: developer scorecard
def tag(t, c): return f'<span class="tag {c}">{t}</span>'
sc = tbl(['', 'Aldar', 'Emaar', 'Damac', 'Majid Al Futtaim'], [
    ['<b>Dubai townhouse / villa launches in the data</b>', f'Three, 2023–25, AED {tot_bn:.1f}bn registered', f'The Valley, Arabian Ranches 3, plus The Oasis (AED {M["oasis"]["bn_primary"]:.0f}bn, luxury)', f'Lagoons: {beh.loc[LAG, "val_primary"]:.1f}bn new sales; Hills 2 small', f'Tilal Al Ghaf: AED {beh.loc[TIL, "val_primary"] + beh.loc[TIL, "val_resale"]:.1f}bn, mostly resale'],
    ['<b>Launch pricing (AED/sq ft)</b>', f'{f0(A["haven_primary"])} → {f0(A["athlon_primary"])} → {f0(A["wilds_primary"])}', f'Resale {f0(A["valley_resale"])}–{f0(A["ara3_resale"])}', f'New {f0(A["lagoons_primary"])}, resale {f0(A["lagoons_resale"])}', f'Resale {f0(A["tilal_resale"])}'],
    ['<b>Price momentum (resale, 12 months)</b>', f'{tag("Weaker", "amber")} +{yoy[H]:.1f}% / +{yoy[AT]:.1f}%', f'{tag("Strong", "green")} +{yoy[ARA]:.1f}% / +{yoy[VAL]:.1f}%', f'{tag("Strong", "green")} +{yoy[LAG]:.1f}%', f'{tag("Good", "green")} +{yoy[TIL]:.1f}%'],
    ['<b>Launch velocity</b>', f'{tag("Strong", "green")} {AL[WI]["at12"]["n"]}–{AL[AT]["at12"]["n"]:,} homes in 12 months; sell-outs in days', f'{tag("Strong", "green")} The Oasis AED 9.7bn in Q1 2026 alone (Reidin)', f'{tag("Strong", "green")} 165–325 deals a quarter, sustained', f'{tag("Slower", "amber")} 18–45 a quarter'],
    ['<b>Exit liquidity</b>', f'{tag("Thin", "amber")} {beh.loc[H, "resale_share"]:.0f}% / {beh.loc[AT, "resale_share"]:.0f}% resale share; sells at ~13 months', f'{tag("Deep", "green")} {beh.loc[ARA, "resale_share"]:.0f}% / {beh.loc[VAL, "resale_share"]:.0f}% resale share', f'{tag("Crowded", "amber")} resale below new-sale prices', f'{tag("Deep", "green")} {beh.loc[TIL, "resale_share"]:.0f}% resale share'],
    ['<b>Dubai delivery record</b>', f'{tag("None yet", "red")} first handover (Haven) due 2027', f'{tag("Proven", "green")} completed homes trading', f'{tag("Proven", "green")} completed homes trading; 3,802 handovers announced Q2 2026', f'{tag("Proven", "green")} completed homes trading'],
    ['<b>Location of the compared project</b>', f'{tag("Best", "green")} on the Blue Line at Silicon Oasis (new project)', f'{tag("Remote", "amber")} {LOC[ARA]["km_blue"]:.0f}–{LOC[VAL]["km_blue"]:.0f} km from the alignment', f'{tag("Remote", "amber")} {LOC[HI2]["km_blue"]:.0f}–{LOC[LAG]["km_blue"]:.0f} km', f'{tag("Remote", "amber")} {LOC[TIL]["km_blue"]:.0f} km'],
], 'score', ['17%', '23%', '22%', '21%', '17%'])
p11 = sc + f'''<h3>Reading across</h3><ul class="bul">
<li><b>Where Aldar wins:</b> pricing power at launch, sell-out speed, and (for this project) a transit location the peers cannot match.</li>
<li><b>Where Aldar trails:</b> after-market price growth, depth of resale, and a Dubai delivery track record. These are the three things a buyer pays for after the launch event.</li>
<li><b>Tier-one is not one price.</b> Within a 3- to 4-bedroom size band the spread between Damac's resale ({f0(A['lagoons_resale'])}) and MAF's ({f0(A['tilal_resale'])}) is {pc(A['tilal_resale'], A['lagoons_resale']):.0f}%: location and community maturity matter more than the developer's name.</li></ul>
<p class="note">Tags are the analyst's reading of the numbers in this study, not ratings. Emaar's Dubai Hills Estate, Sobha Hartland and Nakheel's Palm Jebel Ali are outside the data set.</p>'''
page('Aldar against the tier-one developers', p11, 'DEVELOPER COMPARISON')

# ================= PAGE: expected price
anchors = tbl(['Evidence', 'AED per sq ft', 'What it tells us'], [
    ['Aldar launch ladder, new sales', f"{f0(A['haven_primary'])} · {f0(A['athlon_primary'])} · {f0(A['wilds_primary'])}", f'Each launch priced {ladder1:.0f}% then {ladder2:.0f}% above the last. The new site is closer to Haven and Athlon in product and location than to The Wilds.'],
    ['Aldar resale today', f"Haven {f0(A['haven_resale'])} · Athlon {f0(A['athlon_resale'])}", 'The market price of Aldar\'s own off-plan product: a new launch cannot sit far above this without a reason.'],
    ['Emaar townhouses, resale', f"The Valley {f0(A['valley_resale'])} · Ranches 3 {f0(A['ara3_resale'])}", 'What a buyer compares against: an Emaar townhouse on the resale market (completed homes and off-plan contracts).'],
    ['Silicon Oasis villas, resale (older stock)', f"{f0(MO(DSO, 'Resale').psf_l)} (last 12 months)", 'The neighbourhood already trades above Haven\'s launch price: location support.'],
    ['Market direction', 'Dubai Q3 2026: transactions −38%, value −47%', 'Pushes a launch toward the lower half of the base case unless the product is exceptional.'],
], 'small', ['26%', '25%', '49%'])
p12 = '<p class="lead">We expect the launch price for homes of 1,800–3,400 sq ft to land in a base case of <b>AED 1,400–1,650 per sq ft</b>.</p>' + img('fig_scenarios.svg', 'Expected launch price per sq ft, three scenarios') + anchors + f'''
<ul class="bul">
<li><b>Conservative ({SC[0]['lo']:,}–{SC[0]['hi']:,}).</b> Aldar prices like Haven and Athlon to protect the sales pace in a soft market. Floor: Haven's {f0(A['haven_primary'])}; cap: The Valley's resale ({f0(A['valley_resale'])}).</li>
<li><b>Base case ({SC[1]['lo']:,}–{SC[1]['hi']:,}).</b> A step above Athlon for the Blue Line and a newer phase, up to about the latest Arabian Ranches 3 resale levels ({f0(HYV(ARA, 'Resale', '2026-H1'))} in 2026 H1, {f0(HYV(ARA, 'Resale', '2026-H2'))} since July).</li>
<li><b>Stretch ({SC[2]['lo']:,}–{SC[2]['hi']:,}).</b> Wilds-style premium (The Wilds' newest sales reached {f0(A['wilds_latest'])}). Needs a landmark product and a strong event.</li></ul>
<p class="note">An analyst estimate from public transaction data, not an Aldar price or a promise; Aldar has said nothing about pricing. Built-up area as recorded by the DLD; Aldar may quote on another basis.</p>'''
page('Expected price per sq ft', p12, 'THE ESTIMATE')

# ================= PAGE: tickets and volume
def money(psf, size): return f'{psf * size / 1e6:.1f}'
trows = []
for nm, sz in (('3-bedroom townhouse', SZ['3']), ('4-bedroom townhouse or villa', SZ['4']), ('5-bedroom villa', SZ['5'])):
    trows.append([f'<b>{nm}</b><br><small>~{round(sz, -1):,.0f} sq ft</small>'] + [f"AED {money(s['lo'], sz)}–{money(s['hi'], sz)}m" for s in SC])
tk = tbl(['Unit (reference size)', f"Conservative {SC[0]['lo']:,}–{SC[0]['hi']:,}", f"Base case {SC[1]['lo']:,}–{SC[1]['hi']:,}", f"Stretch {SC[2]['lo']:,}–{SC[2]['hi']:,}"], trows, 'score', ['28%', '24%', '24%', '24%'])
vol = tbl(['Milestone', 'Reference from Aldar\'s record', 'What to expect'], [
    ['Launch event', '734–1,000+ homes sold in days (Aldar)', 'First release sells out if priced inside the base case.'],
    ['Months 0–3', 'Almost nothing on the land register', 'Do not read a quiet DLD record as weak sales.'],
    ['Months 3–9', f"Bulk of registrations ({AL[H]['at12']['n']:,}, {AL[AT]['at12']['n']:,} and {AL[WI]['at12']['n']:,} by month 12)", 'AED 4–6bn registered in the first year for a first release of similar size.'],
    ['Months 9–24', '20–50 homes a quarter per community', 'Later phases drive any new spike; prices step up with each.'],
    ['Month 12–14', f"Median first resale {min(hold[H], hold[AT]):.0f}–{max(hold[H], hold[AT]):.0f} days after purchase", 'Assignments begin; a resale premium of only ~3–9% over launch.'],
], 'small', ['16%', '42%', '42%'])
p13 = '<h3>What it means in dirhams</h3>' + tk + f'''<p class="note">Reference sizes are the median built-up areas of 3-, 4- and 5-bedroom new sales at Haven and Athlon in the register. The new project\'s unit sizes are unknown; scale by actual area.</p>
<h3>Cross-checks</h3><ul class="bul">
<li><b>Blended value per home.</b> Aldar and Dubai Holding's Feb 2026 land deal: gross development value above Dh38bn for almost 14,000 homes, about AED 2.7m a home including apartments. Villas and townhouses sit above that average, which fits a base-case 3-bedroom at AED {t3_lo:.1f}–{t3_hi:.1f}m. (We do not know that either plot is this project.)</li>
<li><b>"Under AED 3 million"</b> appears on third-party sites. It would be consistent with the conservative band for the smallest units only ({money(SC[0]['lo'], SZ['3'])}–{money(SC[0]['hi'], SZ['3'])}m for a 3-bedroom). It is not an Aldar statement.</li>
<li><b>Aldar's own price history.</b> A 3-bedroom at Haven registered at a median of AED {M['unit_mix'][0]['price'] / 1e6:.2f}m, at Athlon AED {M['unit_mix'][4]['price'] / 1e6:.2f}m; the base case is {pc(SC[1]['lo'] * SZ['3'], M['unit_mix'][4]['price']):+.0f}% to {pc(SC[1]['hi'] * SZ['3'], M['unit_mix'][4]['price']):+.0f}% on Athlon.</li></ul>
<h3>How the sales would unfold</h3>''' + vol
page('What it means in dirhams, and how sales may unfold', p13, 'TICKETS AND VOLUME')

# ================= PAGE: risks and checklist
risks = tbl(['Risk', 'Evidence', 'Effect on the estimate'], [
    ['Cooling market', 'Dubai Q3 2026 transactions −38%, value −47% year on year (Cavendish Maxwell).', 'Lower half of the base case; slower tail.'],
    ['International demand', '77–92% of Aldar buyers are expatriates or overseas; the CEO says that side "slowed a little bit".', 'Fewer buyers at the same price; incentives more likely.'],
    ['Supply', 'About 14,000 more Aldar / Dubai Holding homes planned; 3,802 Damac Lagoons handovers announced for Q2 2026 (Reidin).', 'More resale competition from 2027.'],
    ['Delivery', 'No completed Aldar home in Dubai; first handover due 2027.', 'Buyers may want a discount to Emaar or a firm date.'],
    ['Transit date', 'Blue Line opening is a target (9 Sept 2029), not a guarantee.', 'Location premium is partly a bet on that date.'],
    ['Data', 'The register lags launches by 3–4 months; areas are built-up, not sellable; the site is unconfirmed.', 'Estimate band is wide on purpose.'],
], 'small', ['18%', '50%', '32%'])
chk = '''<ol class="chk">
<li>Price per sq ft <u>and</u> the area basis (built-up or sellable, plot size) for each home type.</li>
<li>Payment plan, including the share due before handover and any post-handover period.</li>
<li>Handover date per phase, escrow account and Dubai Land Department project registration.</li>
<li>How many homes the first release holds, and how many are held back for later phases.</li>
<li>Service charges, walking distance to the Blue Line station, and rules for assigning your contract before handover.</li>
<li>The project's advertising permit number (rules differ by emirate; check before promoting).</li></ol>'''
tr_ = '''<div class="two"><div><h3>What would move the view</h3><ul class="bul">
<li><b>Price at or under ~1,400:</b> sell-out in days is very likely; resale upside improves.</li>
<li><b>Price 1,650–1,900:</b> premium launch; expect a slower first phase and a thin resale premium.</li>
<li><b>A named handover earlier than 2029:</b> supports the higher end.</li>
<li><b>More Dubai Q4 weakness:</b> pushes toward the conservative band.</li></ul></div><div><h3>Questions to put to Aldar at launch</h3>''' + chk + '</div></div>'
outc = tbl(['If Aldar launches at (AED per sq ft)', 'Likely sales pace', 'Resale outlook for early buyers', 'Our read'], [
    [f"<b>Up to {SC[0]['hi']:,}</b> (conservative)", 'Sell-out in days; deepest demand', f"Reasonable: Haven resells {pc(A['haven_resale'], A['haven_primary']):+.0f}% over launch", 'At or near Emaar townhouse resale prices'],
    [f"<b>{SC[1]['lo']:,}–{SC[1]['hi']:,}</b> (base case)", 'Sell-out in days to weeks', f"Modest: Athlon resells {pc(A['athlon_resale'], A['athlon_primary']):+.0f}% over launch", 'Fair for a Blue Line location; needs a delivery date'],
    [f"<b>{SC[2]['lo']:,}–{SC[2]['hi']:,}</b> (stretch)", 'Slower first phase; incentives likely', 'Thin: The Wilds shows almost no resale premium', 'Priced like Tilal Al Ghaf, a mature community']], 'small', ['26%', '24%', '27%', '23%'])
page('Risks, and what to ask at launch', risks + '<h3>How the launch price maps to the outcome</h3>' + outc + '<p class="note">Analyst judgement from the patterns in this study; resale premiums are medians for the last 24 months.</p>' + tr_, 'RISKS')

# ================= PAGE: sources
src = '''<ul class="src">
<li><b>The National</b>, 14 Oct 2026, "Aldar to launch major Dubai villa and townhouse project by end of year" (interview with Aldar Development CEO Jonathan Emery); also source for Cavendish Maxwell Q3 2026 market figures and the Feb 2026 land deal.</li>
<li><b>Aldar Properties</b> press releases: first two phases of Haven, 1 Nov 2023 (AED 3.1bn); Athlon, 9 May 2024 (AED 4.1bn); The Wilds phase 1, 5 Mar 2025 (734 villas, AED 5bn, 92% expatriate and overseas buyers). Haven and Athlon unit counts and buyer shares as reported by Zawya, Al Bawaba and AGBI.</li>
<li><b>Dubai Land Department sale records</b> via the Bayut transactions service (bayut.com/property-market-analysis), pulled 16 Oct 2026: 23,600 records, of which 18,542 are in the comparison set (Aldar: Haven, Athlon, The Wilds; Emaar: The Valley, Arabian Ranches 3, The Oasis; Damac: Lagoons, Hills 2; MAF: Tilal Al Ghaf; location comparisons: Dubai South, Dubai Silicon Oasis).</li>
<li><b>Reidin</b>, Dubai Residential Real Estate Q1 2026 Market Overview (villa value, top off-plan villa locations, announced handovers).</li>
<li><b>Gulf News</b>, "Aldar launches The Wilds" (3-bedroom villas from Dh5.1m).</li>
<li><b>RTA via Dubai Media Office</b> (Blue Line: 30 km, 14 stations, target 9 Sept 2029); alignment © OpenStreetMap contributors (ODbL). Imagery © Esri, Maxar, Earthstar Geographics.</li></ul>'''
lim = '''<h3>Limits of this study</h3><ul class="bul">
<li>The project's name, size, location, price and handover are not public. Every price here is an estimate, not an Aldar figure.</li>
<li>Prices are registered contract values, not asking prices. Off-plan contracts record the developer's price at sale, with payment-plan terms not shown.</li>
<li>Built-up area from the Dubai Land Department may differ from the developer's brochure area.</li>
<li>The Bayut service groups Aldar's, and some other developers', townhouses and villas under different categories. The peers shown are the ones with a usable record; others (Sobha Hartland, Mudon, Nad Al Sheba, Dubai Hills Estate) are not included.</li>
<li>Small samples (under 20 deals) are not shown as headline figures.</li></ul>
<h3>Disclaimer</h3><p class="note big">This is an independent analytical study for information only. It is not investment, legal or tax advice and not an offer to sell property. Aldar, Dubai Holding, Emaar, Damac and Majid Al Futtaim have not reviewed or endorsed it. Past price and sales patterns do not guarantee future results. Verify all project details with the developer and the Dubai Land Department, and follow the Real Estate Regulatory Agency's rules before marketing any off-plan project.</p>'''
page('Sources, limits and disclaimer', '<h3>Sources</h3>' + src + lim, 'SOURCES')

gl = tbl(['Term', 'Meaning in this study'], [
    ['New sale (primary)', "The developer's first sale of a home, usually off-plan, registered with the Dubai Land Department (DLD)."],
    ['Resale (secondary)', 'Any later sale of the same home, including assignment of an off-plan contract before handover.'],
    ['Off-plan / completed', 'Off-plan: not yet built or handed over. Completed ("ready"): built and handed over.'],
    ['AED per sq ft', 'Registered price divided by built-up area, as recorded by the DLD. Not the plot area.'],
    ['Size band', 'Homes of 1,800–3,400 sq ft built-up, the range of a 3- to 4-bedroom townhouse; keeps unit size from distorting prices.'],
    ['Registration lag', 'Months between a sales event and the contracts appearing on the DLD record (3–4 for Aldar launches).'],
    ['GDV', 'Gross development value: the expected total sales value of a project.'],
    ['Base, conservative, stretch', "Analyst scenarios for the launch price per sq ft of the unnamed project; not Aldar's figures."]], 'small', ['24%', '76%'])
page('Appendix: the data and the terms', '<h3>The sample, community by community</h3>' + samp + '<p class="note">Counts are after removing price-per-sq-ft outliers. Median size is of all deals in the community. "First and last new-sale registration" are DLD registration dates, not launch dates.</p><h3>Terms used</h3>' + gl, 'APPENDIX')

# ================= cover + assemble
cover = f'''<section class="page cover"><div class="cv-top"><span>ANALYST STUDY</span><span>16 OCTOBER 2026</span></div>
<div class="cv-mid"><p class="cv-k">DUBAI TOWNHOUSES · TIER-ONE DEVELOPERS</p>
<h1>Aldar's next Dubai townhouse community</h1>
<p class="cv-s">Expected price per sq ft, sales momentum and volume, and how Aldar compares with Emaar, Damac and Majid Al Futtaim</p>
<div class="cv-n"><div><b>AED {SC[1]['lo']:,}–{SC[1]['hi']:,}</b><span>base-case price per sq ft</span></div><div><b>{M['n_peer_set']:,}</b><span>Dubai Land Department sales analysed</span></div><div><b>10</b><span>communities compared across four developers</span></div></div></div>
<div class="cv-bot">Based on public Dubai Land Department records and Aldar's own announcements. The project is not yet named or priced: all prices are analyst estimates.</div></section>'''
css = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'study.css')).read()
open(out, 'w').write(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Aldar Dubai townhouse study</title><style>{css}</style></head><body>{cover}{"".join(PAGES)}</body></html>')
print('pages', len(PAGES) + 1)
