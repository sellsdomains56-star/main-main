import sys, json, time, concurrent.futures as cf
sys.path.insert(0,'.')
from bq import q
COMM={'Haven by Aldar':(19026,'Aldar'),'Athlon by Aldar':(20112,'Aldar'),'The Wilds':(21549,'Aldar'),
 'Arabian Ranches 3':(12423,'Emaar'),'The Valley':(12790,'Emaar'),'The Oasis':(16663,'Emaar'),'Dubai Hills Estate':(8288,'Emaar (JV)'),
 'DAMAC Hills 2':(8657,'Damac'),'DAMAC Lagoons':(14852,'Damac'),'Tilal Al Ghaf':(11943,'Majid Al Futtaim'),
 'Nad Al Sheba':(5645,'Dubai Holding / Meraas'),'Mudon':(8230,'Dubai Properties'),'Sobha Hartland':(8949,'Sobha'),'Dubai South':(8881,'mixed')}
JOBS=[]
for name,(i,dev) in COMM.items():
    JOBS.append((name,i,16)) # townhouses
for name in ('Haven by Aldar','Athlon by Aldar','The Wilds','The Oasis','Tilal Al Ghaf'):
    JOBS.append((name,COMM[name][0],3)) # villas for context
JOBS.append(('Dubai Silicon Oasis (DSO)',5361,3))
def fetch(job):
    name,i,cat=job
    d=q(2,[i],cat,'60m',1,20)
    if 'hits' not in d: return job,None,d.get('error')
    n=d['nbHits']; pages=d['nbPages']; hits=list(d['hits'])
    def pg(p):
        r=q(2,[i],cat,'60m',p,20); time.sleep(0.15); return r.get('hits',[])
    with cf.ThreadPoolExecutor(3) as ex:
        for h in ex.map(pg,range(2,pages+1)): hits+=h
    return job,hits,n
out={}
for job in JOBS:
    j,hits,n=fetch(job)
    key='%s|%d'%(j[0],j[2])
    if hits is None: print('FAIL',key,n,flush=True); continue
    out[key]=hits; json.dump(out,open('raw_all.json','w'))
    print('OK',key,'nbHits',n,'got',len(hits),flush=True)
print('DONE',flush=True)
