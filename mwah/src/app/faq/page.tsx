import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/store";
import { V } from "@/components/Policy";
export const metadata: Metadata = { title: "Help" };

export default async function FAQ() {
  const s = await getSettings();
  const qa: [string, React.ReactNode][] = [
    ["Where do you ship, and how long does it take?", <>We ship from the UAE to most countries by tracked express courier. Orders are prepared in {s.processingMinDays}–{s.processingMaxDays} business days. Find your country on <Link href="/delivery-times" className="font-bold underline">Delivery times worldwide</Link> and see the full <Link href="/shipping" className="font-bold underline">Shipping Policy</Link>.</>],
    ["Will I pay customs or import tax?", "Orders outside the UAE may be charged import VAT/GST or duty by your country. We can't see these in advance. They aren't included in our prices and are paid by you to the courier or customs."],
    ["Is VAT included?", `Prices include ${s.vatPct}% UAE VAT for deliveries within the UAE. Deliveries abroad are exports and normally zero-rated for UAE VAT.`],
    ["Can I return a balm?", <>Unopened, sealed balms can be returned within 14 days of delivery. Faulty or damaged items are always replaced or refunded. Details in our <Link href="/returns" className="font-bold underline">Returns & Refunds Policy</Link>.</>],
    ["My parcel hasn't arrived", <>Check the tracking link in your email. If it is more than 10 business days past your estimated window, email us with your order number. We'll trace it and replace or refund it if it is lost.</>],
    ["Which payment methods can I use?", "Cards, Apple Pay and Google Pay, processed securely by Stripe. We never see your card details."],
    ["I have allergies. What's in your balms?", "Each product page lists its ingredients. If you are allergic to beeswax, plant oils or flavouring, check the list first and test a small amount. Stop using it if you get irritation."],
    ["How do I contact you?", <>Email <b><V v={s.legal.email} label="support email" /></b>. We reply within one working day.</>],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-6xl font-extrabold">Help</h1>
      <div className="mt-8 space-y-3">{qa.map(([q, a]) => <details key={q} className="card p-5"><summary className="cursor-pointer text-lg font-bold">{q}</summary><p className="mt-2">{a}</p></details>)}</div>
    </div>
  );
}
