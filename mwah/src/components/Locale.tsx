"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/tax";

type Ctx = { country: string; currency: string; setCountry: (c: string) => void; setCurrency: (c: string) => void; fmt: (aed: number) => string; rate: (c: string) => number };
const C = createContext<Ctx>(null!);
export const useLocale = () => useContext(C);
export const useMoney = () => useContext(C).fmt;

const KEY = "mwah_locale"; // browser storage, not a cookie: remembers ship-to country and display currency on this device

/** Remembers where the shopper is shipping to and which currency to show prices in. Charging is always in AED. */
export function LocaleProvider({ rates, allowed, children }: { rates: Record<string, number>; allowed: string[]; children: ReactNode }) {
  const [country, setC] = useState("AE");
  const [currency, setCur] = useState("AED");
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (saved?.country && allowed.includes(saved.country)) { setC(saved.country); setCur(saved.currency in CURRENCIES ? saved.currency : "AED"); return; }
    } catch {}
    const region = (navigator.language.split("-")[1] ?? "").toUpperCase(); // e.g. en-SA -> SA
    if (region && allowed.includes(region)) { setC(region); setCur(DEFAULT_CURRENCY[region] ?? "AED"); }
  }, [allowed]);
  const persist = (c: string, cur: string) => { try { localStorage.setItem(KEY, JSON.stringify({ country: c, currency: cur })); } catch {} };
  const setCountry = (c: string) => { const cur = DEFAULT_CURRENCY[c] ?? currency; setC(c); setCur(cur); persist(c, cur); };
  const setCurrency = (cur: string) => { setCur(cur); persist(country, cur); };
  const rate = (c: string) => rates[c] ?? CURRENCIES[c]?.rate ?? 1;
  const fmt = (aed: number) => {
    if (currency === "AED") return `AED ${aed.toLocaleString("en-AE", { minimumFractionDigits: aed % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
    const d = CURRENCIES[currency]?.decimals ?? 2;
    return `≈ ${currency} ${(aed * rate(currency)).toLocaleString("en", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  };
  return <C.Provider value={{ country, currency, setCountry, setCurrency, fmt, rate }}>{children}</C.Provider>;
}

export function Price({ aed, className = "" }: { aed: number; className?: string }) {
  const { fmt, currency } = useLocale();
  return <span className={className} title={currency === "AED" ? undefined : `Approximate. You are charged AED ${aed}.`}>{fmt(aed)}</span>;
}
