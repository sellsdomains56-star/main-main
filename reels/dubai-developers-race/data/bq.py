import json, urllib.request, time, sys
URL='https://www.bayut.com/api/transactions'
H={'Content-Type':'application/json','User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36','Origin':'https://www.bayut.com','Referer':'https://www.bayut.com/property-market-analysis/transactions/sale/townhouses/dubai/'}
def q(level,ids,cat,window,page=1,hpp=20,devs=None,status='any',order='desc'):
    body={"transactionIDs":None,"purpose":"for-sale","locationLevels":[level],"locationExternalIDs":[str(i) for i in ids],"categoryExternalID":str(cat),"completionStatus":status,"timeSinceCreation":window,"beds":None,"contractRenewalStatus":"All","showCurrentMonth":None,"areaRange":None,"plotAreaRange":None,"priceRange":None,"page":page,"sortByFieldName":"date_transaction_nk","sortByFieldOrder":order,"hitsPerPage":hpp,"sellerType":None,"transactionPaymentMethod":None,"contractDuration":None,"pricePerUnitMeasureRange":None,"floorNumberRange":None,"unitNumber":None,"transactionDeveloperNames":devs,"v":"5"}
    for k in range(3):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(URL,data=json.dumps(body).encode(),headers=H,method='POST'),timeout=60))
        except Exception as e: time.sleep(2); err=e
    return {'error':str(err)}
if __name__=='__main__':
    d=q(2,[5361],16,'60m'); print('DSO townhouses 60m nbHits',d.get('nbHits')); 
    if d.get('hits'): print(json.dumps(d['hits'][0],indent=0)[:2500])
    for lvl,i in [(1,5459),(1,1),(1,2),(1,5460)]:
        r=q(lvl,[i],16,'12m'); print('level',lvl,'id',i,'->',r.get('nbHits'),r.get('error'))
