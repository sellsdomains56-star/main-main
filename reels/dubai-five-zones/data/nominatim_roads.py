import json, sys, time, urllib.request, urllib.parse
UA = {'User-Agent': 'dubai-reel-research/1.0 (contact: sellsdomains56@gmail.com)'}
def road(q, out, maxpages=12):
    seen = []; feats = []
    for p in range(maxpages):
        u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'jsonv2', 'limit': 50, 'dedupe': 0, 'polygon_geojson': 1, 'viewbox': '54.85,25.45,55.65,24.70', 'bounded': 1, 'exclude_place_ids': ','.join(map(str, seen))})
        r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60)); time.sleep(1.2)
        new = [x for x in r if x['place_id'] not in seen]
        if not new: break
        for x in new:
            seen.append(x['place_id'])
            if x.get('category') == 'highway' and x['geojson']['type'] in ('LineString', 'MultiLineString'):
                feats.append({'osm_id': x['osm_id'], 'type': x['type'], 'name': x.get('name'), 'geom': x['geojson']})
        print(q, 'page', p, len(new), 'new;', len(feats), 'highway lines', flush=True)
    json.dump(feats, open(out, 'w')); return feats
if __name__ == '__main__':
    road(sys.argv[1], sys.argv[2])
