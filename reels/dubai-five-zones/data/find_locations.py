#!/usr/bin/env python3
"""Bayut location ids + coordinates for the communities named in the script (read from the public transactions pages). python3 -I find_locations.py"""
import re, json, urllib.request
H = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124'}
CANDS = {
 'Dubai Marina': ['dubai-marina'], 'JBR': ['jumeirah-beach-residence'], 'Palm Jumeirah': ['palm-jumeirah'], 'Downtown Dubai': ['downtown-dubai'], 'Business Bay': ['business-bay'],
 'Dubai Hills': ['dubai-hills-estate'], 'Tilal Al Ghaf': ['tilal-al-ghaf'], 'Arjan': ['arjan'], 'Motor City': ['motor-city'],
 'The Valley': ['the-valley'], 'Arabian Ranches 3': ['arabian-ranches-3'], 'Damac Hills 2': ['damac-hills-2'], 'Dubailand': ['dubailand', 'dubai-land', 'dubai-land-residence-complex'],
 'Majan': ['majan'], 'Liwan': ['liwan', 'liwan-2'], 'Dubai South': ['dubai-south'], 'Expo City': ['expo-city-dubai', 'expo-city', 'expo-city-dubai-expo-2020'], 'Palm Jebel Ali': ['palm-jebel-ali'],
}
def page(slug, cat):
    u = f'https://www.bayut.com/property-market-analysis/transactions/sale/{cat}/dubai/{slug}/'
    try: return urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=40).read().decode('utf8', 'replace')
    except Exception as e: return None
out = {}
for name, slugs in CANDS.items():
    for s in slugs:
        t = None
        for cat in ('apartments', 'villas'):
            t = page(s, cat)
            if t: break
        if not t: print(name, s, 'no page'); continue
        i = t.find('"location.slug":{"type":"objectRefinement"')
        j = t.find('"externalID":"', i)
        if i < 0 or j < 0: print(name, s, 'no loc'); continue
        ext = re.match(r'"externalID":"(\d+)"', t[j:]).group(1)
        seg = t[i:i + 6000]
        ll = re.search(r'"geo_point":\[([\d.]+),([\d.]+)\]', seg)
        hier = re.findall(r'"externalID":"(\d+)","id":\d+,"level":(\d+),"name_l0":"([^"]+)"', seg)
        out[name] = dict(slug=s, id=ext, lon=float(ll.group(1)), lat=float(ll.group(2)), hierarchy=hier)
        print(name, s, ext, ll.groups(), hier[-2:] if hier else '')
        break
json.dump(out, open('locations.json', 'w'), indent=1)
