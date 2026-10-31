import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { allOrders, finalizePaid, orderById, saveOrder, setStatus } from "@/lib/store";

// Stripe → Developers → Webhooks → endpoint https://YOUR-SITE/api/stripe/webhook
// Events: checkout.session.completed, charge.refunded
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch { return NextResponse.json({ error: "Bad signature" }, { status: 400 }); }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    if (s.payment_status === "paid" && s.metadata?.orderId) {
      const o = await orderById(s.metadata.orderId);
      if (o) {
        if (s.payment_intent) { o.stripePaymentIntent = String(s.payment_intent); if (s.amount_total) o.total = s.amount_total / 100; await saveOrder(o); }
        await finalizePaid(o.id);
      }
    }
  }
  if (event.type === "charge.refunded") { // refund issued from the Stripe dashboard: keep the shop in step
    const c = event.data.object;
    const pi = c.payment_intent ? String(c.payment_intent) : "";
    const o = pi ? (await allOrders()).find((x) => x.stripePaymentIntent === pi) : null;
    if (o) {
      o.refunded = c.amount_refunded / 100;
      await saveOrder(o);
      if (c.refunded && o.status !== "refunded") await setStatus(o.id, "refunded");
    }
  }
  return NextResponse.json({ received: true });
}
