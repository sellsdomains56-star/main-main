import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { saveSettings } from "../../actions";
export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function Settings() {
  const s = await getSettings();
  const f = (name: string, label: string, v: string | number | undefined, type = "text", extra = {}) => (
    <div><label className="label" htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={v} className="input" {...extra} /></div>
  );
  return (
    <form action={saveSettings} className="space-y-5">
      <h1 className="text-4xl font-extrabold">Settings</h1>
      <section className="card space-y-4 p-5"><h2 className="text-lg font-extrabold">Store & tax</h2>
        <div className="grid gap-4 sm:grid-cols-3">{f("storeName", "Store name", s.storeName)}{f("vatPct", "VAT %", s.vatPct, "number", { step: "0.1" })}{f("lowStockAt", "Low-stock alert at", s.lowStockAt, "number")}</div>
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="exportsZeroRated" defaultChecked={s.exportsZeroRated} className="h-5 w-5 accent-pink-500" /> Remove VAT on orders shipped outside the UAE (export)</label>
        <p className="text-xs">Please confirm your VAT treatment with your accountant.</p></section>
      <section className="card space-y-4 p-5"><h2 className="text-lg font-extrabold">Shipping zones</h2>
        {s.zones.map((z) => <div key={z.id} className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-5"><p className="self-center font-extrabold">{z.name}</p>
          {f(`rate_${z.id}`, "Rate (AED)", z.rate, "number", { step: "0.01", min: 0 })}{f(`free_${z.id}`, "Free over (AED)", z.freeOver, "number", { min: 0 })}{f(`days_${z.id}`, "Delivery time", z.days)}
          {z.id === "world" ? <p className="self-center text-xs">Every other country</p> : f(`countries_${z.id}`, "Country codes", z.countries.join(", "))}</div>)}</section>
      <section className="card space-y-4 p-5"><h2 className="text-lg font-extrabold">Creator programme defaults</h2>
        <div className="grid gap-4 sm:grid-cols-2">{f("defaultCommissionPct", "Commission %", s.defaultCommissionPct, "number", { step: "0.5" })}{f("defaultCustomerDiscountPct", "Fan discount %", s.defaultCustomerDiscountPct, "number", { step: "0.5" })}</div>
        <p className="text-xs">Applies to new applications. Change an individual creator on the Creators page.</p></section>
      <button className="btn btn-pink">Save settings</button>
    </form>
  );
}
