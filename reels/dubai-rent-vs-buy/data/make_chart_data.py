import json
d=json.load(open('series.json')); m=d['months']
out=dict(months=[r['m'] for r in m], equity=[r['equity'] for r in m], renter=[r['renter'] for r in m],
         buy_cost_m=[r['buy_cost_m'] for r in m], rent_m=[r['rent_m'] for r in m], gross_yield=[r['gross_yield'] for r in m],
         est_until='2011-03', assumptions=d['assumptions'])
json.dump(out,open('../chart_data.json','w'),separators=(',',':'))
