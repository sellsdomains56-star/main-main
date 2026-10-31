// Destination tax reference data. Client-safe.
// These are REFERENCE standard VAT/GST rates, not legal advice: they change, and low-value consignment rules differ by
// country. Review every country you sell to under Admin -> Taxes before switching on "collect at checkout".
export type TaxRule = { name: string; rate: number | null; duty: number | null; collect: boolean; regNo?: string };

const R: Record<string, [number | null, string?]> = {
  // GCC (UAE VAT is handled separately because it is included in prices)
  AE: [5], SA: [15], BH: [10], OM: [5], QA: [0], KW: [0],
  // Middle East & North Africa
  JO: [16, "GST"], LB: [11], IQ: [0], IL: [18], PS: [16], EG: [14], LY: [0], TN: [19], DZ: [19], MA: [20], TR: [20],
  // Europe (EU standard rates), EFTA and neighbours
  AT: [20], BE: [21], BG: [20], HR: [25], CY: [19], CZ: [21], DK: [25], EE: [24], FI: [25.5], FR: [20], DE: [19], GR: [24], HU: [27],
  IE: [23], IT: [22], LV: [21], LT: [21], LU: [17], MT: [18], NL: [21], PL: [23], PT: [23], RO: [21], SK: [23], SI: [22], ES: [21], SE: [25],
  IS: [24], LI: [8.1], NO: [25], CH: [8.1], AD: [4.5], MC: [20], GI: [0],
  GB: [20], JE: [5, "GST"], GG: [0], IM: [20],
  // Americas
  US: [0, "Sales tax"], CA: [5, "GST"], BM: [null],
  MX: [16], GT: [12], BZ: [12.5, "GST"], SV: [13], HN: [15], NI: [15], CR: [13], PA: [7], CO: [19], VE: [16], EC: [15], PE: [18], BO: [13],
  PY: [10], UY: [22], AR: [21], CL: [19], BR: [null], GY: [14], SR: [10], DO: [18], HT: [10], JM: [15, "GCT"], BS: [10], BB: [17.5], TT: [12.5],
  // Asia
  IN: [18, "GST"], PK: [18, "GST"], BD: [15], LK: [18], NP: [13], BT: [null], MV: [null],
  CN: [13], HK: [0], MO: [0], TW: [5], JP: [10, "Consumption tax"], KR: [10], SG: [9, "GST"], MY: [10, "Sales tax"], TH: [7], VN: [10],
  KH: [10], LA: [10], MM: [5, "Commercial tax"], PH: [12], ID: [11], BN: [0], TL: [null],
  AU: [10, "GST"], NZ: [15, "GST"],
  UA: [20], MD: [20], GE: [18], AM: [20], AZ: [18], KZ: [null], UZ: [12], KG: [12], TJ: [14], TM: [15], MN: [10],
  AL: [20], BA: [17], ME: [21], MK: [18], RS: [20], XK: [18],
  // Sub-Saharan Africa
  ZA: [15], NG: [7.5], KE: [16], GH: [15], ET: [15], TZ: [18], UG: [18], RW: [18], SN: [18], CI: [18], CM: [19.25], AO: [14], MZ: [16], ZM: [16],
  ZW: [null], NA: [15], BW: [14], MU: [15], MG: [20], BJ: [18], BF: [18], BI: [18], CV: [15], CF: [null], TD: [18], KM: [null], CG: [null],
  CD: [16], DJ: [null], GQ: [null], ER: [null], SZ: [15], GA: [18], GM: [15], GN: [18], GW: [null], LS: [15], LR: [null], MW: [null], ML: [18],
  MR: [null], NE: [19], SC: [15], SL: [null], SO: [null], SS: [null], SD: [null], ST: [null], TG: [18],
  FO: [25],
};

export const defaultTax = (code: string): TaxRule => {
  const [rate, name] = R[code] ?? [null];
  return { name: name ?? "VAT", rate, duty: null, collect: false };
};

/** Currencies shown to shoppers as an approximation. Charging is always in AED. Rates are units per 1 AED. */
export const CURRENCIES: Record<string, { name: string; decimals: number; rate: number; peg?: boolean }> = {
  AED: { name: "UAE dirham", decimals: 2, rate: 1, peg: true },
  SAR: { name: "Saudi riyal", decimals: 2, rate: 1.0211, peg: true },
  QAR: { name: "Qatari riyal", decimals: 2, rate: 0.9911, peg: true },
  BHD: { name: "Bahraini dinar", decimals: 3, rate: 0.1024, peg: true },
  OMR: { name: "Omani rial", decimals: 3, rate: 0.1047, peg: true },
  KWD: { name: "Kuwaiti dinar", decimals: 3, rate: 0.0836 },
  USD: { name: "US dollar", decimals: 2, rate: 0.2723, peg: true },
  EUR: { name: "Euro", decimals: 2, rate: 0.2525 },
  GBP: { name: "British pound", decimals: 2, rate: 0.2145 },
};

/** Default display currency for a destination, so a customer in Riyadh sees riyals without choosing. */
export const DEFAULT_CURRENCY: Record<string, string> = { AE: "AED", SA: "SAR", QA: "QAR", BH: "BHD", OM: "OMR", KW: "KWD", US: "USD", GB: "GBP", JE: "GBP", GG: "GBP", IM: "GBP",
  AT: "EUR", BE: "EUR", HR: "EUR", CY: "EUR", EE: "EUR", FI: "EUR", FR: "EUR", DE: "EUR", GR: "EUR", IE: "EUR", IT: "EUR", LV: "EUR", LT: "EUR", LU: "EUR", MT: "EUR", NL: "EUR", PT: "EUR", SK: "EUR", SI: "EUR", ES: "EUR" };
