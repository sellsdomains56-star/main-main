export const COUNTRIES: [string, string][] = [
  ["AE","United Arab Emirates"],["SA","Saudi Arabia"],["KW","Kuwait"],["QA","Qatar"],["BH","Bahrain"],["OM","Oman"],
  ["US","United States"],["GB","United Kingdom"],["CA","Canada"],["AU","Australia"],["NZ","New Zealand"],["IE","Ireland"],
  ["DE","Germany"],["FR","France"],["ES","Spain"],["IT","Italy"],["NL","Netherlands"],["BE","Belgium"],["CH","Switzerland"],
  ["AT","Austria"],["SE","Sweden"],["NO","Norway"],["DK","Denmark"],["FI","Finland"],["PT","Portugal"],["PL","Poland"],
  ["GR","Greece"],["TR","Türkiye"],["EG","Egypt"],["JO","Jordan"],["LB","Lebanon"],["IQ","Iraq"],["MA","Morocco"],
  ["ZA","South Africa"],["NG","Nigeria"],["KE","Kenya"],["IN","India"],["PK","Pakistan"],["BD","Bangladesh"],["LK","Sri Lanka"],
  ["PH","Philippines"],["ID","Indonesia"],["MY","Malaysia"],["SG","Singapore"],["TH","Thailand"],["VN","Vietnam"],
  ["CN","China"],["HK","Hong Kong"],["JP","Japan"],["KR","South Korea"],["TW","Taiwan"],["BR","Brazil"],["MX","Mexico"],
  ["AR","Argentina"],["CL","Chile"],["CO","Colombia"],["RU","Russia"],["UA","Ukraine"],["IL","Israel"],["CZ","Czechia"],
  ["RO","Romania"],["HU","Hungary"],
];
export const countryName = (c: string) => COUNTRIES.find(([k]) => k === c)?.[1] ?? c;
