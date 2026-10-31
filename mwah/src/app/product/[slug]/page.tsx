import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { activeProducts, getSettings, productBySlug } from "@/lib/store";
import { ProductImage } from "@/components/ProductImage";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import { DeliveryCheck } from "@/components/DeliveryCheck";
import { Price } from "@/components/Locale";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await productBySlug((await params).slug);
  if (!p) return {};
  const desc = `${p.tagline} ${p.flavourNotes ? `${p.flavourNotes}. ` : ""}${p.size}. Shipping from the UAE to the GCC and worldwide.`;
  return { title: p.name, description: desc, alternates: { canonical: `/product/${p.slug}` }, openGraph: { title: `${p.name} · Mwah`, description: desc, type: "website", ...(p.images[0] && { images: [p.images[0]] }) } };
}

export default async function ProductPage({ params }: Props) {
  const p = await productBySlug((await params).slug);
  if (!p) notFound();
  const [all, s] = await Promise.all([activeProducts(), getSettings()]);
  const more = all.filter((x) => x.id !== p.id).slice(0, 4);
  const site = process.env.SITE_URL ?? "http://localhost:3000";
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description.replace(/\n+/g, " "), sku: p.id, brand: { "@type": "Brand", name: "Mwah" },
    ...(p.images.length && { image: p.images }),
    offers: { "@type": "Offer", url: `${site}/product/${p.slug}`, priceCurrency: "AED", price: p.price.toFixed(2), availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", itemCondition: "https://schema.org/NewCondition" },
  };
  const details: [string, string][] = ([["Flavour notes", p.flavourNotes], ["Finish", p.finish], ["Size", p.size], ["Shelf life", p.shelfLife]] as [string, string][]).filter(([, v]) => v);
  const paras = p.description.split(/\n\s*\n/);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-8 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm"><Link href="/" className="underline">Home</Link> / <Link href="/shop" className="underline">Shop</Link> / <span className="font-bold">{p.name}</span></nav>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3 md:sticky md:top-28 md:h-fit">
          <ProductImage p={p} className="aspect-square w-full rounded-[2rem]" />
          {p.images.length > 1 && <div className="grid grid-cols-4 gap-3">{p.images.slice(1).map((src) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={src} src={src} alt="" className="aspect-square rounded-2xl object-cover" />)}</div>}
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-5xl font-extrabold md:text-6xl">{p.name}</h1>
            <p className="mt-2 text-xl">{p.tagline}</p>
            <p className="mt-5 text-3xl font-extrabold"><Price aed={p.price} /> <span className="text-sm font-normal">{p.size} · {s.vatPct}% UAE VAT included on UAE orders</span></p>
            <p className={`mt-1 text-sm font-bold ${p.stock > 0 ? "text-green-700" : "text-cherry"}`}>{p.stock <= 0 ? "Sold out" : p.stock <= s.lowStockAt ? `Only ${p.stock} left` : "In stock, ships within 1–2 business days"}</p>
          </div>
          <div id="buy"><AddToCart p={p} big /></div>
          <DeliveryCheck productId={p.id} />
          <ul className="grid gap-2 rounded-3xl bg-blush p-5 text-sm font-medium sm:grid-cols-2">
            <li>🔒 Secure checkout with Stripe</li><li>📦 Tracked express delivery</li><li>↩️ Unopened balms returnable in 14 days</li><li>💬 Replies within one working day</li>
          </ul>

          <div className="space-y-3 pt-2">
            <h2 className="text-2xl font-extrabold">About {p.name}</h2>
            {paras.map((t, i) => <p key={i} className="leading-relaxed">{t}</p>)}
          </div>
          {p.highlights.length > 0 && (
            <div><h2 className="text-2xl font-extrabold">Why you&apos;ll love it</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">{p.highlights.map((h) => <li key={h} className="flex gap-2 rounded-2xl border-2 border-blush bg-white p-3 text-sm"><span aria-hidden className="text-pink">✦</span>{h}</li>)}</ul></div>)}
          {details.length > 0 && (
            <div><h2 className="text-2xl font-extrabold">Details</h2>
              <dl className="mt-3 divide-y divide-blush rounded-2xl border-2 border-blush bg-white text-sm">{details.map(([k, v]) => <div key={k} className="grid grid-cols-3 gap-3 p-3"><dt className="font-bold">{k}</dt><dd className="col-span-2">{v}</dd></div>)}</dl></div>)}
          <div className="space-y-3">
            {p.howToUse && <details className="rounded-2xl border-2 border-blush bg-white p-4" open><summary className="cursor-pointer font-bold">How to use</summary><p className="mt-2 text-sm leading-relaxed">{p.howToUse}</p></details>}
            <details className="rounded-2xl border-2 border-blush bg-white p-4"><summary className="cursor-pointer font-bold">Ingredients</summary><p className="mt-2 text-sm leading-relaxed">{p.ingredients}</p><p className="mt-2 text-xs">Always check the pack. If you have allergies or sensitivities, test a small amount first.</p></details>
            <details className="rounded-2xl border-2 border-blush bg-white p-4"><summary className="cursor-pointer font-bold">Safety &amp; use</summary><p className="mt-2 text-sm leading-relaxed">Cosmetic product for external use on the lips only. Stop using it and see a doctor if irritation occurs. Keep out of reach of young children. Store in a cool place away from heat and sunlight. <Link href="/terms" className="underline">Terms of Sale</Link></p></details>
            <details className="rounded-2xl border-2 border-blush bg-white p-4"><summary className="cursor-pointer font-bold">Shipping &amp; returns</summary><p className="mt-2 text-sm leading-relaxed">We prepare orders in {s.processingMinDays}–{s.processingMaxDays} business days and ship by tracked express courier from the UAE. See <Link href="/delivery-times" className="underline">delivery times for every country</Link>, the <Link href="/shipping" className="underline">Shipping Policy</Link> and <Link href="/returns" className="underline">Returns &amp; Refunds</Link>.</p></details>
          </div>
        </div>
      </div>
      <h2 className="mb-6 mt-20 text-3xl font-extrabold">You might also kiss</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{more.map((x) => <ProductCard key={x.id} p={x} />)}</div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-blush bg-cream/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3"><div><p className="font-extrabold">{p.name}</p><p className="text-sm"><Price aed={p.price} /></p></div><a href="#buy" className="btn btn-pink px-6 py-2.5">Add to bag</a></div>
      </div>
    </div>
  );
}
