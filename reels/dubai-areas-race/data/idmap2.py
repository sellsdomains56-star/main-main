import re, json, sys, urllib.request, time
from concurrent.futures import ThreadPoolExecutor
H = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124'}
CAND = {
 'City Walk': ['city-walk', 'dubai-city-walk', 'city-walk-al-wasl', 'al-wasl/city-walk', 'jumeirah/city-walk'],
 'Meydan': ['meydan', 'meydan-city', 'meydan-heights', 'meydan-gated-community', 'nad-al-sheba/meydan'],
 'La Mer': ['la-mer', 'jumeirah/la-mer', 'la-mer-jumeirah', 'port-de-la-mer'],
 'Jumeirah Bay Islands': ['jumeirah-bay-islands', 'jumeirah-bay-island', 'jumeirah-bay', 'bulgari-resort-and-residences', 'jumeirah/jumeirah-bay-island'],
 'Jumeirah Garden City': ['jumeirah-garden-city', 'al-satwa/jumeirah-garden-city'],
 'Madinat Jumeirah Living': ['madinat-jumeirah-living', 'madinat-jumeirah', 'mjl', 'umm-suqeim/madinat-jumeirah-living'],
 'Dubai Investments Park (DIP)': ['dubai-investment-park-dip', 'dubai-investments-park', 'dubai-investment-park', 'dip', 'dubai-investments-park-1', 'dubai-investments-park-2'],
 'Dubai World Trade Centre (DWTC)': ['dubai-world-trade-centre', 'world-trade-centre', 'trade-centre', 'dubai-world-trade-center', 'difc'],
 'Grand Polo Club & Resort': ['grand-polo-club-and-resort', 'grand-polo-club-resort', 'grand-polo-club', 'dubailand/grand-polo-club-and-resort'],
 'Nad Al Sheba Gardens': ['nad-al-sheba-gardens', 'nad-al-sheba/nad-al-sheba-gardens'],
 'Al Khail Heights': ['al-khail-heights', 'al-quoz/al-khail-heights'], 'Barsha South': ['barsha-south', 'dubailand/barsha-south', 'al-barsha-south'],
 'Dubai Healthcare City': ['dubai-healthcare-city', 'dubai-health-care-city'], 'Dubai Water Canal': ['dubai-water-canal', 'business-bay/dubai-water-canal'],
 'DAMAC Islands': ['damac-islands'], 'DAMAC Riverside': ['damac-riverside', 'dubai-land/damac-riverside'], 'Villanova': ['villanova', 'dubailand/villanova', 'la-quinta'],
}
def get(u):
    for k in range(2):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=40).read().decode('utf8', 'replace')
        except Exception as e:
            if getattr(e, 'code', 0) == 404: return None
            time.sleep(1.5)
def try_(item):
    n, sl = item
    for s in sl:
        for cat in ('apartments', 'villas', 'townhouses'):
            t = get(f'https://www.bayut.com/property-market-analysis/transactions/sale/{cat}/dubai/{s}/')
            if not t: continue
            i = t.find('"location.slug":{"type":"objectRefinement"'); j = t.find('"externalID":"', i)
            if i < 0 or j < 0: continue
            ext = re.match(r'"externalID":"(\d+)"', t[j:]).group(1); seg = t[i:i + 6000]
            hier = re.findall(r'"externalID":"(\d+)","id":\d+,"level":(\d+),"name_l0":"([^"]+)"', seg)
            lvl = [h for h in hier if h[0] == ext]
            return dict(name=n, slug=s, id=ext, level=lvl[0][1] if lvl else None, page_name=lvl[0][2] if lvl else None)
    return dict(name=n, id=None)
with ThreadPoolExecutor(6) as ex: res = list(ex.map(try_, CAND.items()))
for r in res: print(r)
json.dump(res, open('areas2.json', 'w'), indent=1)
