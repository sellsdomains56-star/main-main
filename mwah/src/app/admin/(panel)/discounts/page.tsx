import type { Metadata } from "next";
import { allDiscounts } from "@/lib/store";
import { fmt } from "@/lib/money";
import { createDiscount, removeDiscount, toggleDiscount } from "../../actions";
export const metadata: Metadata = { title: "Discounts", robots: { index: false } };

export default async function Discounts() {
  const list = await allDiscounts();
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-extrabold">Discount codes</h1>
      <form action={createDiscount} className="card grid gap-3 p-5 sm:grid-cols-6">
        <div className="sm:col-span-2"><label className="label" htmlFor="code">Code</label><input id="code" name="code" required placeholder="SUMMER15" className="input uppercase" /></div>
        <div><label className="label" htmlFor="type">Type</label><select id="type" name="type" className="input"><option value="percent">% off</option><option value="fixed">AED off</option></select></div>
        <div><label className="label" htmlFor="value">Value</label><input id="value" name="value" type="number" step="0.01" min="0" required className="input" /></div>
        <div><label className="label" htmlFor="minSubtotal">Min. spend</label><input id="minSubtotal" name="minSubtotal" type="number" min="0" defaultValue="0" className="input" /></div>
        <div><label className="label" htmlFor="maxUses">Max uses (0 = ∞)</label><input id="maxUses" name="maxUses" type="number" min="0" defaultValue="0" className="input" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="expiresAt">Expires (optional)</label><input id="expiresAt" name="expiresAt" type="date" className="input" /></div>
        <div className="flex items-end sm:col-span-4"><button className="btn btn-pink">Create code</button></div>
      </form>
      <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b-2 border-blush"><th className="p-3">Code</th><th>Discount</th><th>Min. spend</th><th>Used</th><th>Expires</th><th /></tr></thead>
        <tbody>{list.map((d) => <tr key={d.id} className="border-b border-blush/60"><td className="p-3 font-extrabold">{d.code}{!d.active && <span className="ml-2 text-xs font-normal">(off)</span>}</td><td>{d.type === "percent" ? `${d.value}%` : fmt(d.value)}</td><td>{d.minSubtotal ? fmt(d.minSubtotal) : "—"}</td><td>{d.uses}{d.maxUses ? ` / ${d.maxUses}` : ""}</td><td>{d.expiresAt ?? "—"}</td>
          <td className="space-x-2 pr-3 text-right"><form className="inline" action={toggleDiscount.bind(null, d.id)}><button className="font-bold underline">{d.active ? "Disable" : "Enable"}</button></form><form className="inline" action={removeDiscount.bind(null, d.id)}><button className="font-bold text-cherry underline">Delete</button></form></td></tr>)}</tbody></table></div>
    </div>
  );
}
