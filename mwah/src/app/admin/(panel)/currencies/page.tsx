import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { CURRENCIES } from "@/lib/tax";
import { saveCurrencies } from "../../actions";
export const metadata: Metadata = { title: "Currencies", robots: { index: false } };

export default async function Currencies() {
  const s = await getSettings();
  return (
    <form action={saveCurrencies} className="space-y-5">
      <div><h1 className="text-4xl font-extrabold">Display currencies</h1>
        <p className="mt-2 max-w-3xl text-sm">Shoppers can browse in their own currency, shown as an approximation (&quot;≈&quot;). <b>They are always charged in AED</b> and their bank converts it. Keep the floating currencies (euro, pound, Kuwaiti dinar) up to date here. The pegged ones (riyal, dirham, dinar, rial, dollar) rarely move.</p>
        {s.currenciesUpdated && <p className="mt-1 text-xs">Last updated {new Date(s.currenciesUpdated).toLocaleDateString("en")}</p>}</div>
      <div className="card divide-y divide-blush">
        {Object.entries(CURRENCIES).map(([k, c]) => (
          <div key={k} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div><p className="font-extrabold">{k} <span className="font-normal">{c.name}</span></p><p className="text-xs">{c.peg ? "Pegged, changes rarely" : "Floating, check regularly"}</p></div>
            <div className="flex items-center gap-2"><label htmlFor={`fx_${k}`} className="text-sm">1 AED =</label>
              <input id={`fx_${k}`} name={`fx_${k}`} type="number" step="0.0001" min="0.0001" defaultValue={s.currencies[k]} disabled={k === "AED"} className="input w-32 py-2" /> <span className="text-sm font-bold">{k}</span></div>
          </div>))}
      </div>
      <button className="btn btn-pink">Save rates</button>
    </form>
  );
}
