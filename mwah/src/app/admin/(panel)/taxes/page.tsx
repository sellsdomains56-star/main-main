import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { COUNTRY_LIST } from "@/lib/countries";
import { saveTaxes } from "../../actions";
import { TaxFilter } from "./TaxFilter";
export const metadata: Metadata = { title: "Taxes by country", robots: { index: false } };

export default async function Taxes() {
  const s = await getSettings();
  const rows = COUNTRY_LIST.map((c) => ({ ...c, t: s.tax[c.code], blocked: s.blockedCountries.includes(c.code) })).sort((a, b) => a.name.localeCompare(b.name));
  const collecting = rows.filter((r) => r.t.collect).length;
  return (
    <form action={saveTaxes} className="space-y-5">
      <div><h1 className="text-4xl font-extrabold">Taxes by country</h1>
        <p className="mt-2 max-w-3xl text-sm">UAE deliveries include {s.vatPct}% VAT in the price. For every other country there are two ways to handle the destination&apos;s own VAT/GST and duty:</p>
        <ul className="mt-2 max-w-3xl list-disc space-y-1 pl-5 text-sm">
          <li><b>Customer pays at import</b> (default, nothing ticked). The customer pays their country&apos;s tax to customs on delivery. Checkout shows an <i>estimate</i> and does not charge it.</li>
          <li><b>Collect at checkout</b> (tick it). The tax is added to the order and shown as its own line. <b>You must be registered in that country (or use your courier&apos;s duties-paid service) and pay the tax over.</b> Typical cases: EU (IOSS, parcels up to €150), UK (up to £135), Australia and New Zealand (up to 1,000 AUD/NZD), Norway (VOEC). Tick only after registering.</li>
        </ul>
        <p className="mt-2 max-w-3xl text-xs">Rates are reference standard rates and may be out of date. Check each country you sell to with your accountant. A blank rate means &quot;varies, no estimate shown&quot;. {collecting} {collecting === 1 ? "country is" : "countries are"} set to collect at checkout.</p></div>
      <TaxFilter />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm" id="taxtable">
          <thead><tr className="border-b-2 border-blush"><th className="p-3">Country</th><th>Tax name</th><th>Rate %</th><th>Duty % (optional)</th><th>Collect at checkout</th><th className="pr-3">Your registration no.</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.code} data-name={`${r.name} ${r.code}`.toLowerCase()} className="border-b border-blush/60">
              <td className="p-3 font-bold">{r.name} <span className="text-xs font-normal">{r.code}{r.blocked && " · not shipped"}</span></td>
              <td><label className="sr-only" htmlFor={`name_${r.code}`}>Tax name for {r.name}</label><input id={`name_${r.code}`} name={`name_${r.code}`} defaultValue={r.t.name} className="input w-28 py-1.5" /></td>
              <td><label className="sr-only" htmlFor={`rate_${r.code}`}>Rate for {r.name}</label><input id={`rate_${r.code}`} name={`rate_${r.code}`} type="number" step="0.01" min="0" max="100" defaultValue={r.t.rate ?? ""} className="input w-24 py-1.5" /></td>
              <td><label className="sr-only" htmlFor={`duty_${r.code}`}>Duty for {r.name}</label><input id={`duty_${r.code}`} name={`duty_${r.code}`} type="number" step="0.01" min="0" max="100" defaultValue={r.t.duty ?? ""} className="input w-24 py-1.5" /></td>
              <td><label className="sr-only" htmlFor={`collect_${r.code}`}>Collect at checkout for {r.name}</label><input id={`collect_${r.code}`} name={`collect_${r.code}`} type="checkbox" defaultChecked={r.t.collect} className="h-5 w-5 accent-pink-500" /></td>
              <td className="pr-3"><label className="sr-only" htmlFor={`reg_${r.code}`}>Registration number for {r.name}</label><input id={`reg_${r.code}`} name={`reg_${r.code}`} defaultValue={r.t.regNo ?? ""} placeholder="e.g. IOSS number" className="input w-40 py-1.5" /></td>
            </tr>))}</tbody>
        </table>
      </div>
      <button className="btn btn-pink">Save taxes</button>
    </form>
  );
}
