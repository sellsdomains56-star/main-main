import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { activeProducts, discountByCode, finalizePaid, getSettings, influencerByCode, nextOrderNumber, saveOrder } from "@/lib/store";
import { quote } from "@/lib/pricing";
import { r2 } from "@/lib/money";
import { uid } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type { Order } from "@/lib/types";

const clean = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  const b = await req.json();
  const email = clean(b.email).toLowerCase(), name = clean(b.name), phone = clean(b.phone, 40);
  const a = b.address ?? {};
  const address = { line1: clean(a.line1), line2: clean(a.line2), city: clean(a.city, 80), state: clean(a.state, 80), postcode: clean(a.postcode, 20), country: clean(a.country, 2).toUpperCase() };
  if (!/^\S+@\S+\.\S+$/.test(email) || !name || !phone || !address.line1 || !address.city || !address.country)
    return NextResponse.json({ error: "Please fill in all the required fields." }, { status: 400 });

  const [products, settings] = await Promise.all([activeProducts(), getSettings()]);
  const typed = clean(b.code, 40);
  const discount = await discountByCode(typed);
  const refCode = typed && !discount ? typed : (await cookies()).get("mwah_ref")?.value;
  let influencer = await influencerByCode(refCode);
  if (influencer && influencer.email === email) influencer = null; // no self-referrals

  const q = quote({ products, lines: b.lines ?? [], country: address.country, settings, discount, influencer });
  if (!q.items.length) return NextResponse.json({ error: "Your bag is empty or items are out of stock." }, { status: 400 });

  const productValue = r2(q.subtotal - q.discount);
  const order: Order = {
    id: uid(), number: await nextOrderNumber(), email, name, phone, address, items: q.items,
    subtotal: q.subtotal, discount: q.discount, shipping: q.shipping, vat: q.vat, total: q.total, currency: "AED",
    discountCode: discount && q.discountLabel === discount.code ? discount.code : undefined,
    influencerId: influencer?.id,
    referralCode: influencer?.code,
    commission: influencer ? r2(productValue * influencer.commissionPct / 100) : 0,
    status: "pending", notes: [], testMode: !stripe, createdAt: new Date().toISOString(),
  };

  if (!stripe) { // no Stripe keys yet: test mode, no real charge
    await saveOrder(order);
    await finalizePaid(order.id);
    return NextResponse.json({ url: `/order/${order.id}` });
  }

  const origin = process.env.SITE_URL ?? req.headers.get("origin") ?? new URL(req.url).origin;
  const ratio = q.subtotal ? (q.total - q.shipping) / q.subtotal : 1; // spreads discount / export-VAT over the lines
  const line_items = q.items.map((i) => ({
    quantity: i.qty,
    price_data: { currency: "aed", unit_amount: Math.round(i.price * ratio * 100), product_data: { name: `Mwah ${i.name}` } },
  }));
  if (q.shipping) line_items.push({ quantity: 1, price_data: { currency: "aed", unit_amount: Math.round(q.shipping * 100), product_data: { name: `Shipping to ${q.zone.name}` } } });
  const session = await stripe.checkout.sessions.create({
    mode: "payment", customer_email: email, line_items,
    metadata: { orderId: order.id },
    success_url: `${origin}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  });
  order.stripeSessionId = session.id;
  await saveOrder(order);
  return NextResponse.json({ url: session.url });
}
