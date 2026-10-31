import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { activeProducts, discountByCode, finalizePaid, getSettings, influencerByCode, nextOrderNumber, saveOrder } from "@/lib/store";
import { quote } from "@/lib/pricing";
import { r2 } from "@/lib/money";
import { uid } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { estimateWindow } from "@/lib/delivery";
import { POLICY_VERSION } from "@/lib/legal";
import type { Order } from "@/lib/types";

const clean = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  const b = await req.json();
  const email = clean(b.email).toLowerCase(), name = clean(b.name), phone = clean(b.phone, 40);
  const a = b.address ?? {};
  const address = { line1: clean(a.line1), line2: clean(a.line2), city: clean(a.city, 80), state: clean(a.state, 80), postcode: clean(a.postcode, 20), country: clean(a.country, 2).toUpperCase() };
  if (!/^\S+@\S+\.\S+$/.test(email) || !name || !phone || !address.line1 || !address.city || !address.country)
    return NextResponse.json({ error: "Please fill in all the required fields." }, { status: 400 });

  if (b.acceptTerms !== true) return NextResponse.json({ error: "Please accept the Terms of Sale, Privacy Policy and Shipping & Returns policies to continue." }, { status: 400 });

  const [products, settings] = await Promise.all([activeProducts(), getSettings()]);
  const typed = clean(b.code, 40);
  const discount = await discountByCode(typed);
  const refCode = typed && !discount ? typed : (await cookies()).get("mwah_ref")?.value;
  let influencer = await influencerByCode(refCode);
  if (influencer && influencer.email === email) influencer = null; // no self-referrals

  const q = quote({ products, lines: b.lines ?? [], country: address.country, settings, discount, influencer });
  if (q.blocked) return NextResponse.json({ error: "Sorry, we can't ship to that country at the moment." }, { status: 400 });
  if (stripe && q.total < 2) return NextResponse.json({ error: "The minimum order total is AED 2." }, { status: 400 });
  if (!q.items.length) return NextResponse.json({ error: "Your bag is empty or items are out of stock." }, { status: 400 });

  const productValue = r2(q.subtotal - q.discount);
  const order: Order = {
    id: uid(), number: await nextOrderNumber(), email, name, phone, address, items: q.items,
    subtotal: q.subtotal, discount: q.discount, shipping: q.shipping, vat: q.vat, total: q.total, currency: "AED",
    discountCode: discount && q.discountLabel === discount.code ? discount.code : undefined,
    influencerId: influencer?.id,
    referralCode: influencer?.code,
    commission: influencer ? r2(productValue * influencer.commissionPct / 100) : 0,
    destTax: q.destTax ? { label: q.destTax.label, amount: q.destTax.amount, regNo: q.destTax.regNo } : undefined, uaeVat: q.vat,
    status: "pending", notes: [], refunded: 0, testMode: !stripe, createdAt: new Date().toISOString(),
    estimatedDelivery: (() => { const w = estimateWindow(settings, q.zone); return { from: w.from.toISOString(), to: w.to.toISOString() }; })(),
    terms: { version: POLICY_VERSION, acceptedAt: new Date().toISOString(), ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() },
  };

  if (!stripe) { // no Stripe keys yet: test mode, no real charge
    await saveOrder(order);
    await finalizePaid(order.id);
    return NextResponse.json({ url: `/order/${order.id}` });
  }

  const origin = process.env.SITE_URL ?? req.headers.get("origin") ?? new URL(req.url).origin;
  const goodsTotal = r2(q.total - q.shipping - (q.destTax?.amount ?? 0));
  const ratio = q.subtotal ? goodsTotal / q.subtotal : 1; // spreads discount / export-VAT over the lines
  const line_items = q.items.map((i) => ({
    quantity: i.qty,
    price_data: { currency: "aed", unit_amount: Math.round(i.price * ratio * 100), product_data: { name: `Mwah ${i.name}` } },
  }));
  if (q.shipping) line_items.push({ quantity: 1, price_data: { currency: "aed", unit_amount: Math.round(q.shipping * 100), product_data: { name: `Shipping to ${q.zone.name}` } } });
  if (q.destTax) line_items.push({ quantity: 1, price_data: { currency: "aed", unit_amount: Math.round(q.destTax.amount * 100), product_data: { name: `Import tax prepaid: ${q.destTax.label}` } } });
  const session = await stripe.checkout.sessions.create({
    mode: "payment", customer_email: email, line_items, locale: "auto", billing_address_collection: "auto",
    metadata: { orderId: order.id, orderNumber: String(order.number) },
    payment_intent_data: { description: `Mwah order #${order.number}`, metadata: { orderId: order.id, orderNumber: String(order.number) } },
    success_url: `${origin}/order/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
  }, { idempotencyKey: `checkout-${order.id}` });
  order.stripeSessionId = session.id;
  await saveOrder(order);
  return NextResponse.json({ url: session.url });
}
