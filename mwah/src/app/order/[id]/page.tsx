import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { finalizePaid, orderById, saveOrder } from "@/lib/store";
import { stripe } from "@/lib/stripe";
import { fmt } from "@/lib/money";
import { countryName } from "@/lib/countries";

export const metadata: Metadata = { title: "Thank you" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ session_id?: string }> }) {
  const { id } = await params; const { session_id } = await searchParams;
  let o = await orderById(id);
  if (!o) notFound();
  // Back-up for the webhook: confirm payment with Stripe directly when the customer lands here.
  if (o.status === "pending" && session_id && stripe && o.stripeSessionId === session_id) {
    const s = await stripe.checkout.sessions.retrieve(session_id);
    if (s.payment_status === "paid") {
      if (s.amount_total) { o.total = s.amount_total / 100; await saveOrder(o); }
      o = (await finalizePaid(o.id)) ?? o;
    }
  }
  const steps = ["paid", "packed", "shipped", "delivered"];
  const at = steps.indexOf(o.status);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-6xl">💋</p>
      <h1 className="mt-3 text-5xl font-extrabold">{o.status === "pending" ? "Waiting for payment…" : `Thank you, ${o.name.split(" ")[0]}!`}</h1>
      <p className="mt-2 text-lg">Order #{o.number} · a confirmation goes to {o.email}.</p>
      {o.testMode && <p className="mt-4 rounded-2xl bg-butter p-3 text-sm font-bold">Test mode: this order was not charged. Add Stripe keys to take real payments.</p>}
      {at >= 0 && <ol className="mt-8 grid grid-cols-4 gap-2 text-center text-xs font-bold">{steps.map((s, i) => <li key={s} className={`rounded-full py-2 capitalize ${i <= at ? "bg-pink text-white" : "bg-blush"}`}>{s === "paid" ? "Confirmed" : s}</li>)}</ol>}
      {o.tracking && <p className="mt-4 font-bold">Tracking: {o.carrier} {o.tracking}</p>}
      <div className="card mt-8 space-y-2 p-6 text-sm">
        {o.items.map((i) => <div key={i.productId} className="flex justify-between"><span>{i.qty} × {i.name}</span><span>{fmt(i.price * i.qty)}</span></div>)}
        <div className="flex justify-between border-t-2 border-blush pt-2 text-lg font-extrabold"><span>Total</span><span>{fmt(o.total)}</span></div>
        <p className="pt-2">Shipping to {o.address.line1}, {o.address.city}, {countryName(o.address.country)}</p>
      </div>
      <Link href="/shop" className="btn btn-ghost mt-8">Keep shopping</Link>
    </div>
  );
}
