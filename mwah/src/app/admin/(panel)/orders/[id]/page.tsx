import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { orderById } from "@/lib/store";
import { fmt } from "@/lib/money";
import { countryName } from "@/lib/countries";
import { StatusBadge } from "@/components/StatusBadge";
import { addNote, saveShipment, updateOrderStatus } from "../../../actions";
import type { OrderStatus } from "@/lib/types";
export const metadata: Metadata = { title: "Order", robots: { index: false } };
const FLOW: OrderStatus[] = ["paid", "packed", "shipped", "delivered"];

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await orderById(id); if (!o) notFound();
  const next = FLOW[FLOW.indexOf(o.status) + 1];
  return (
    <div className="space-y-5">
      <Link href="/admin/orders" className="text-sm font-bold underline">← Orders</Link>
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-4xl font-extrabold">Order #{o.number}</h1><StatusBadge s={o.status} />{o.testMode && <span className="sticker">test</span>}</div>
      <div className="flex flex-wrap gap-2">
        {next && <form action={updateOrderStatus.bind(null, o.id, next)}><button className="btn btn-pink px-4 py-2 text-sm capitalize">Mark {next}</button></form>}
        {!["cancelled", "refunded", "delivered", "pending"].includes(o.status) && <>
          <form action={updateOrderStatus.bind(null, o.id, "cancelled")}><button className="btn btn-ghost px-4 py-2 text-sm">Cancel</button></form>
          <form action={updateOrderStatus.bind(null, o.id, "refunded")}><button className="btn btn-ghost px-4 py-2 text-sm">Mark refunded</button></form></>}
      </div>
      {o.status === "refunded" && <p className="rounded-2xl bg-butter p-3 text-sm font-bold">Refunds are issued in your Stripe dashboard. This only marks the order and restocks.</p>}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card space-y-2 p-5 lg:col-span-2"><h2 className="text-lg font-extrabold">Items</h2>
          {o.items.map((i) => <div key={i.productId} className="flex justify-between text-sm"><span>{i.qty} × {i.name}</span><span>{fmt(i.price * i.qty)}</span></div>)}
          <dl className="space-y-1 border-t-2 border-blush pt-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{fmt(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between"><dt>Discount {o.discountCode ?? (o.referralCode && `(creator ${o.referralCode})`)}</dt><dd>−{fmt(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{fmt(o.shipping)}</dd></div>
            <div className="flex justify-between"><dt>VAT included</dt><dd>{fmt(o.vat)}</dd></div>
            <div className="flex justify-between text-lg font-extrabold"><dt>Total</dt><dd>{fmt(o.total)}</dd></div>
            {o.influencerId && <div className="flex justify-between text-cherry"><dt>Creator commission ({o.referralCode})</dt><dd>{fmt(o.commission)}</dd></div>}
          </dl></section>
        <section className="card space-y-1 p-5 text-sm"><h2 className="text-lg font-extrabold">Customer</h2>
          <p className="font-bold">{o.name}</p><p>{o.email}</p><p>{o.phone}</p>
          <p className="pt-2">{o.address.line1}<br />{o.address.line2 && <>{o.address.line2}<br /></>}{o.address.city} {o.address.state} {o.address.postcode}<br />{countryName(o.address.country)}</p></section>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5"><h2 className="text-lg font-extrabold">Shipment</h2>
          <form action={saveShipment.bind(null, o.id)} className="mt-3 space-y-3">
            <div><label className="label" htmlFor="carrier">Carrier</label><input id="carrier" name="carrier" defaultValue={o.carrier} placeholder="Aramex, DHL…" className="input" /></div>
            <div><label className="label" htmlFor="tracking">Tracking number</label><input id="tracking" name="tracking" defaultValue={o.tracking} className="input" /></div>
            <button className="btn btn-ink px-4 py-2 text-sm">Save & mark shipped</button></form></section>
        <section className="card p-5"><h2 className="text-lg font-extrabold">Notes</h2>
          <ul className="mt-2 space-y-1 text-sm">{o.notes.map((n, i) => <li key={i}><span className="text-xs">{new Date(n.at).toLocaleString("en")}</span> · {n.text}</li>)}</ul>
          <form action={addNote.bind(null, o.id)} className="mt-3 flex gap-2"><input name="text" placeholder="Add internal note" className="input" aria-label="Note" /><button className="btn btn-ink px-4">Add</button></form></section>
      </div>
    </div>
  );
}
