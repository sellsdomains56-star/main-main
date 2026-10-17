#!/usr/bin/env python3
"""Step 2: Bayut community id (level 2) for every community name, read from the public transactions pages. python3 -I idmap.py -> areas.json"""
import re, json, sys, urllib.request, time
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '.'); import bq
H = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124'}
EXTRA = ['Emirates Hills', 'Bluewaters Island', 'Dubai Festival City', 'Culture Village', 'Dubai Internet City', 'Al Barsha', 'Umm Suqeim', 'Dubai Healthcare City', 'Dubai Water Canal', 'Al Khail Heights', 'Barsha South', 'Jumeirah Bay Island', 'Palm Jumeirah', 'Port de La Mer', 'Dubai Waterfront']
names = sorted(set(json.load(open('communities.json'))) | set(EXTRA))
def slugs(n):
    base = re.sub(r'[^a-z0-9]+', '-', n.lower().replace('&', 'and')).strip('-')
    noparen = re.sub(r'[^a-z0-9]+', '-', re.sub(r'\(.*?\)', '', n).lower().replace('&', 'and')).strip('-')
    inner = re.findall(r'\((.*?)\)', n); inn = re.sub(r'[^a-z0-9]+', '-', inner[0].lower()).strip('-') if inner else None
    return [s for s in dict.fromkeys([base, noparen, inn]) if s]
def page(slug, cat):
    u = f'https://www.bayut.com/property-market-analysis/transactions/sale/{cat}/dubai/{slug}/'
    for k in range(2):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=40).read().decode('utf8', 'replace')
        except Exception as e:
            if getattr(e, 'code', 0) == 404: return None
            time.sleep(1.5)
    return None
def find(n):
    for s in slugs(n):
        for cat in ('apartments', 'villas'):
            t = page(s, cat)
            if not t: continue
            i = t.find('"location.slug":{"type":"objectRefinement"'); j = t.find('"externalID":"', i)
            if i < 0 or j < 0: continue
            ext = re.match(r'"externalID":"(\d+)"', t[j:]).group(1); seg = t[i:i + 6000]
            hier = re.findall(r'"externalID":"(\d+)","id":\d+,"level":(\d+),"name_l0":"([^"]+)"', seg)
            lvl = [h for h in hier if h[0] == ext]
            return dict(name=n, slug=s, id=ext, level=lvl[0][1] if lvl else None, page_name=lvl[0][2] if lvl else None)
    return dict(name=n, id=None)
with ThreadPoolExecutor(6) as ex: res = list(ex.map(find, names))
json.dump(res, open('areas.json', 'w'), indent=1)
miss = [r['name'] for r in res if not r.get('id')]
print(len(res) - len(miss), 'ids found; missing:', miss)
print([ (r['name'], r['level'], r['page_name']) for r in res if r.get('id') and (r['level']!='2' or r['page_name'] and r['page_name'].split(' (')[0].lower()[:6]!=r['name'].lower()[:6])][:30])
