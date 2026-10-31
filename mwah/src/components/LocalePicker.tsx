"use client";
import { useState } from "react";
import { useLocale } from "./Locale";
import { CURRENCIES } from "@/lib/tax";

export function LocalePicker({ countries }: { countries: [string, string][] }) {
  const { country, currency, setCountry, setCurrency } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="dialog" className="rounded-full border-2 border-ink px-3 py-1.5 text-xs font-bold hover:bg-ink hover:text-white">
        <span className="sr-only">Shipping country and currency: </span>{country} · {currency}
      </button>
      {open && (
        <div role="dialog" aria-label="Country and currency" className="absolute right-0 top-full z-50 mt-2 w-72 space-y-3 rounded-3xl border-2 border-ink bg-white p-4 shadow-xl">
          <div><label className="label" htmlFor="shipto">Ship to</label>
            <select id="shipto" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>{countries.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></div>
          <div><label className="label" htmlFor="curr">Show prices in</label>
            <select id="curr" className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>{Object.entries(CURRENCIES).map(([k, v]) => <option key={k} value={k}>{k} · {v.name}</option>)}</select></div>
          <p className="text-xs">Other currencies are approximate. You are always charged in AED, and your bank converts it.</p>
          <button onClick={() => setOpen(false)} className="btn btn-ink w-full py-2 text-sm">Done</button>
        </div>)}
    </div>
  );
}
