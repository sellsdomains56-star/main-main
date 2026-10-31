import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings, orderById } from "@/lib/store";
import { fmt, r2 } from "@/lib/money";
import { countryName } from "@/lib/countries";
import { PrintButton } from "./PrintButton";
import { V } from "@/components/Policy";

export const metadata: Metadata = { title: "Tax invoice", robots: { index: false } };

/** Printable tax invoice / receipt. The unguessable order id in the address is the customer's access key. */
export default async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const o = await orderById((await params).id);
  if (!o || o.status === "pending") notFound();
  const { legal: l, vatPct } = await getSettings();
  const uae = o.address.country === "AE";
  const date = new Date(o.paidAt ?? o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const goodsNet = r2(o.total - o.shipping - (o.destTax?.amount ?? 0));            // goods as charged
  const vatRemoved = uae ? 0 : Math.max(0, r2(o.subtotal - o.discount - goodsNet));  // UAE VAT not charged because it is an export
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="card space-y-6 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-4xl font-extrabold">{uae ? "Tax invoice" : "Invoice"}</h1><p className="text-sm">Invoice no. MW-{o.number} · {date}</p></div>
          <div className="text-sm sm:text-right"><p className="font-extrabold"><V v={l.legalName} label="company name" /></p><p><V v={l.address} label="address" /></p><p>TRN <V v={l.vatTrn} label="TRN" /></p><p>Trade licence <V v={l.tradeLicenceNo} label="licence no." /></p></div>
        </div>
        <div className="text-sm"><p className="font-bold">Billed and shipped to</p><p>{o.name}</p><p>{o.address.line1}{o.address.line2 && `, ${o.address.line2}`}</p><p>{o.address.city} {o.address.state} {o.address.postcode}</p><p>{countryName(o.address.country)}</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[28rem] text-left text-sm">
          <thead><tr className="border-b-2 border-ink"><th className="py-2">Description</th><th>Qty</th><th>Unit price</th><th className="text-right">Amount</th></tr></thead>
          <tbody>{o.items.map((i) => <tr key={i.productId} className="border-b border-blush"><td className="py-2">{i.name}</td><td>{i.qty}</td><td>{fmt(i.price)}</td><td className="text-right">{fmt(i.price * i.qty)}</td></tr>)}</tbody></table></div>
        <dl className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal (prices as listed)</dt><dd>{fmt(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{fmt(o.discount)}</dd></div>}
          {vatRemoved > 0 && <div className="flex justify-between"><dt>UAE VAT not charged (export, zero-rated)</dt><dd>−{fmt(vatRemoved)}</dd></div>}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{o.shipping ? fmt(o.shipping) : "Free"}</dd></div>
          {uae && <div className="flex justify-between"><dt>Total includes UAE VAT at {vatPct}%</dt><dd>{fmt(o.uaeVat ?? 0)}</dd></div>}
          {o.destTax && <div className="flex justify-between"><dt>{o.destTax.label}{o.destTax.regNo && ` · reg. ${o.destTax.regNo}`}</dt><dd>{fmt(o.destTax.amount)}</dd></div>}
          <div className="flex justify-between border-t-2 border-ink pt-2 text-lg font-extrabold"><dt>Total paid (AED)</dt><dd>{fmt(o.total)}</dd></div>
          {o.refunded > 0 && <div className="flex justify-between text-cherry"><dt>Refunded</dt><dd>−{fmt(o.refunded)}</dd></div>}
        </dl>
        <p className="text-xs">{uae ? "Amounts are in UAE dirhams (AED). The supply is of goods delivered within the UAE and is subject to VAT at the standard rate." : "Amounts are in UAE dirhams (AED). This is an export of goods from the UAE and is zero-rated for UAE VAT. Any import VAT, duty or fees charged in the destination country are separate and are paid by the recipient unless shown above as prepaid."}</p>
        <PrintButton />
      </div>
    </div>
  );
}
