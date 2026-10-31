import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { saveSettings } from "../../actions";
import { totalDays } from "@/lib/delivery";
export const metadata: Metadata = { title: "Settings", robots: { index: false } };

export default async function Settings() {
  const s = await getSettings();
  const f = (name: string, label: string, v: string | number | undefined, type = "text", extra = {}) => (
    <div><label className="label" htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={v} className="input" {...extra} /></div>
  );
  return (
    <form action={saveSettings} className="space-y-5">
      <h1 className="text-4xl font-extrabold">Settings</h1>

      <section className="card space-y-4 p-5"><h2 className="text-lg font-extrabold">Business details (shown in your policies and footer)</h2>
        <p className="text-sm">These must be your real, registered details. Your policies and the launch checklist use them. Nothing here is filled in for you.</p>
        <div className="grid gap-4 sm:grid-cols-2">{f("legalName", "Registered company name", s.legal.legalName)}{f("tradeLicenceNo", "Trade licence number", s.legal.tradeLicenceNo)}{f("licensingAuthority", "Licensing authority (e.g. DED, free zone)", s.legal.licensingAuthority)}{f("vatTrn", "VAT registration number (TRN)", s.legal.vatTrn)}</div>
        {f("address", "Registered address", s.legal.address)}
        <div className="grid gap-4 sm:grid-cols-3">{f("email", "Customer support email", s.legal.email, "email")}{f("phone", "Phone / WhatsApp", s.legal.phone)}{f("jurisdiction", "Emirate for legal disputes", s.legal.jurisdiction)}</div></section>

      <section className="card space-y-4 p-5"><h2 className="text-lg font-extrabold">Store & tax</h2>
        <div className="grid gap-4 sm:grid-cols-3">{f("storeName", "Store name", s.storeName)}{f("vatPct", "VAT %", s.vatPct, "number", { step: "0.1" })}{f("lowStockAt", "Low-stock alert at", s.lowStockAt, "number")}</div>
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="exportsZeroRated" defaultChecked={s.exportsZeroRated} className="h-5 w-5 accent-pink-500" /> Remove VAT on orders shipped outside the UAE (export)</label>
        <p className="text-xs">Please confirm your VAT treatment with your accountant.</p></section>

      <section className="card space-y-4 p-5"><h2 className="text-lg font-extrabold">Shipping zones & delivery times</h2>
        <p className="text-sm">Customers see an estimated delivery window of <b>processing time + courier time</b>, counted in business days (Mon–Fri). Check every figure against a real quote from your courier. The defaults are planning estimates.</p>
        <div className="grid gap-4 sm:grid-cols-4">{f("processingMinDays", "Processing: fastest (days)", s.processingMinDays, "number", { min: 0 })}{f("processingMaxDays", "Processing: slowest (days)", s.processingMaxDays, "number", { min: 0 })}</div>
        {s.zones.map((z) => { const [lo, hi] = totalDays(s, z); return (
          <div key={z.id} className="space-y-3 rounded-2xl bg-cream p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-extrabold">{z.name}</p><p className="text-xs">Customer sees {lo}–{hi} business days · {z.countries.length} countries</p></div>
            <div className="grid gap-3 sm:grid-cols-5">{f(`rate_${z.id}`, "Rate (AED)", z.rate, "number", { step: "0.01", min: 0 })}{f(`free_${z.id}`, "Free over (AED)", z.freeOver, "number", { min: 0 })}{f(`min_${z.id}`, "Courier min days", z.minDays, "number", { min: 0 })}{f(`max_${z.id}`, "Courier max days", z.maxDays, "number", { min: 0 })}</div>
            <div><label className="label" htmlFor={`countries_${z.id}`}>Country codes in this zone</label><textarea id={`countries_${z.id}`} name={`countries_${z.id}`} rows={2} defaultValue={z.countries.join(", ")} className="input font-mono text-xs" /></div>
          </div>); })}
        <div><label className="label" htmlFor="blockedCountries">Countries we do NOT ship to (codes)</label><textarea id="blockedCountries" name="blockedCountries" rows={2} defaultValue={s.blockedCountries.join(", ")} className="input font-mono text-xs" />
          <p className="mt-1 text-xs">Default: Cuba, Iran, North Korea, Syria (comprehensively sanctioned) plus Russia and Belarus (courier and payment restrictions). Stripe and most couriers refuse sanctioned destinations even if UAE law does not. Check before removing any.</p></div></section>

      <section className="card space-y-4 p-5"><h2 className="text-lg font-extrabold">Creator programme</h2>
        <div className="grid gap-4 sm:grid-cols-3">{f("defaultCommissionPct", "Default commission %", s.defaultCommissionPct, "number", { step: "0.5" })}{f("defaultCustomerDiscountPct", "Default fan discount %", s.defaultCustomerDiscountPct, "number", { step: "0.5" })}{f("minPayout", "Minimum payout (AED)", s.minPayout, "number", { min: 0 })}</div>
        <p className="text-xs">Defaults apply to new applications and are quoted in the Creator Terms. Change an individual creator on the Creators page.</p></section>
      <button className="btn btn-pink">Save settings</button>
    </form>
  );
}
