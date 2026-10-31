"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "./Locale";
import { fmt } from "@/lib/money";
import { fmtDay } from "@/lib/delivery";

type E = { countryName: string; blocked: boolean; zone: string; from: string; to: string; shipping: number; freeOver: number | null; uaeVatPct: number;
  destTax: { label: string; amount: number } | null; importEstimate: { amount: number; name: string; vatPct: number | null; unknown: boolean } | null };

/** Live delivery date range, shipping cost and tax note for the shopper's chosen country. */
export function DeliveryCheck({ productId }: { productId: string }) {
  const { country } = useLocale();
  const [e, setE] = useState<E | null>(null);
  useEffect(() => {
    let live = true;
    fetch(`/api/estimate?country=${country}&productId=${productId}`).then((r) => r.json()).then((d) => live && setE(d)).catch(() => {});
    return () => { live = false; };
  }, [country, productId]);
  if (!e) return <div className="h-28 animate-pulse rounded-3xl bg-blush/60" aria-hidden />;
  return (
    <section aria-label="Delivery" className="space-y-2 rounded-3xl border-2 border-blush bg-white p-5 text-sm">
      <h2 className="text-base font-extrabold">Delivery to {e.countryName}</h2>
      {e.blocked ? <p className="font-bold text-cherry">Sorry, we can&apos;t ship to {e.countryName} at the moment.</p> : <>
        <p>📦 <b>Estimated arrival {fmtDay(e.from)} – {fmtDay(e.to)}</b> <span className="text-xs">(tracked express, {e.zone})</span></p>
        <p>🚚 Shipping {e.shipping ? fmt(e.shipping) : "free"}{e.freeOver ? `, free over ${fmt(e.freeOver)}` : ""}</p>
        {e.uaeVatPct > 0 && <p>🧾 Price includes {e.uaeVatPct}% UAE VAT</p>}
        {e.destTax && <p>🧾 {e.destTax.label} is added at checkout (≈ {fmt(e.destTax.amount)}) and prepaid, so there is nothing to pay on delivery.</p>}
        {e.importEstimate && <p>🧾 {e.importEstimate.unknown ? "Import tax or duty may be charged by your country on delivery." : e.importEstimate.amount === 0 ? "No import VAT in your country. Customs duty or courier fees may still apply on delivery." : <>Import {e.importEstimate.name} is paid on delivery: about {fmt(e.importEstimate.amount)}{e.importEstimate.vatPct ? ` (${e.importEstimate.vatPct}%)` : ""} for this item. An estimate.</>}</p>}
        <p className="text-xs">An estimate, not a guarantee. <Link href="/delivery-times" className="font-bold underline">All countries</Link> · <Link href="/shipping" className="font-bold underline">Shipping policy</Link></p></>}
    </section>
  );
}
