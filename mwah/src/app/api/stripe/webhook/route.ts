import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { finalizePaid } from "@/lib/store";

// Stripe -> Dashboard -> Webhooks -> endpoint: https://YOUR-SITE/api/stripe/webhook, event: checkout.session.completed
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch { return NextResponse.json({ error: "Bad signature" }, { status: 400 }); }
  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    if (s.payment_status === "paid" && s.metadata?.orderId) await finalizePaid(s.metadata.orderId);
  }
  return NextResponse.json({ received: true });
}
