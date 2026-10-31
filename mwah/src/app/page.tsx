import Link from "next/link";
import { cookies } from "next/headers";
import { activeProducts, getSettings, influencerByCode, orderCount } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { BalmTube } from "@/components/BalmTube";
import { OrderCounter } from "@/components/OrderCounter";
import { Price } from "@/components/Locale";
import { totalDays } from "@/lib/delivery";
import { fmt } from "@/lib/money";

const HOME_ZONES = ["uae", "gcc", "europe", "uk", "na", "eastasia"]; // the regions shown on the home page

export default async function Home() {
  const [all, settings, orders] = await Promise.all([activeProducts(), getSettings(), orderCount()]);
  const set = all.find((p) => p.slug === "mwah-set");
  const flavours = all.filter((p) => p.id !== set?.id);
  const separately = ["strawberry-kiss", "vanilla-cloud", "cherry-pop", "rose-petal"].reduce((t, id) => t + (all.find((p) => p.id === id)?.price ?? 0), 0);
  const ref = await influencerByCode((await cookies()).get("mwah_ref")?.value);
  const tubes = [["#ff5d8f", "#ffb3c7", -8], ["#d6124a", "#ff6b8e", 6], ["#f5d6a1", "#fff1d6", -3]] as const;
  const zones = HOME_ZONES.map((id) => settings.zones.find((z) => z.id === id)).filter((z) => z !== undefined);
  const countries = settings.zones.reduce((t, z) => t + z.countries.filter((c) => !settings.blockedCountries.includes(c)).length, 0);
  return (
    <>
      {ref && <div className="bg-butter py-2 text-center text-sm font-bold">You&apos;re shopping with {ref.name}&apos;s link, so {ref.customerDiscountPct}% off is applied at checkout 💋</div>}

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-24">
          <div>
            <span className="sticker">New: Rose Petal 🌹</span>
            <h1 className="mt-5 text-6xl font-extrabold leading-[0.95] md:text-8xl">Lips that go <span className="text-pink">mwah.</span></h1>
            <p className="mt-6 max-w-md text-lg">Glossy, comfortable lip balms in flavours you&apos;ll actually want to wear. Shipped from the UAE to the GCC and {countries}+ countries and territories worldwide.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-pink text-lg">Shop the balms</Link>
              {set && <Link href={`/product/${set.slug}`} className="btn btn-ghost text-lg">The Mwah Set · <Price aed={set.price} /></Link>}
            </div>
            <OrderCounter initial={orders} />
            <p className="mt-2 text-sm">Free UAE shipping over {fmt(settings.zones.find((z) => z.id === "uae")?.freeOver ?? 150)} · <Link href="/delivery-times" className="font-bold underline">see delivery times</Link></p>
          </div>
          <div className="relative mx-auto flex h-[420px] w-full max-w-md items-end justify-center">
            <div className="absolute inset-6 rounded-full bg-blush" />
            {tubes.map(([c, c2, r], i) => (
              <div key={i} style={{ ["--r" as string]: `${r}deg`, transform: `rotate(${r}deg)`, animationDelay: `${i * 0.6}s` }} className="float relative z-10"><BalmTube color={c} color2={c2} className="-mx-5 h-[340px] drop-shadow-2xl" /></div>
            ))}
          </div>
        </div>
      </section>

      <div className="overflow-hidden bg-pink py-3 text-white" aria-hidden>
        <div className="marquee font-display text-xl font-extrabold">
          {Array.from({ length: 16 }).map((_, i) => <span key={i}>{["Glossy finish", "Pocket-size", "Six flavours", "Ships worldwide", "Tracked delivery"][i % 5]} ✦</span>)}
        </div>
      </div>

      <section className="mx-auto mt-16 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Why shop with us">
        {[["🔒", "Secure checkout", "Pay by card, Apple Pay or Google Pay through Stripe. We never see your card."], ["📦", "Tracked delivery", "Express courier from the UAE with a tracking number on every order."], ["🧾", "Clear prices", "Taxes and shipping shown before you pay. No surprises at checkout."], ["↩️", "Easy returns", "Unopened balms can be returned within 14 days. Damaged items always replaced."]].map(([e, t, d]) => (
          <div key={t} className="rounded-3xl border-2 border-blush bg-white p-5"><p className="text-3xl" aria-hidden>{e}</p><h3 className="mt-2 text-lg font-extrabold">{t}</h3><p className="mt-1 text-sm">{d}</p></div>))}
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4" id="flavours">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-4xl font-extrabold md:text-5xl">Find your flavour</h2><p className="mt-2 max-w-xl">Six flavours, each with its own mood. Tap one to read about the taste, the finish and how to wear it.</p></div><Link href="/shop" className="font-bold underline decoration-pink decoration-4 underline-offset-4">Shop all →</Link></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{flavours.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {set && (
        <section className="mx-auto mt-20 max-w-6xl px-4">
          <div className="grid items-center gap-8 rounded-[2rem] bg-lilac/50 p-8 md:grid-cols-2 md:p-12">
            <div><span className="sticker">Best value</span><h2 className="mt-4 text-4xl font-extrabold md:text-5xl">{set.name}</h2><p className="mt-3 max-w-md text-lg">{set.tagline} Strawberry Kiss, Vanilla Cloud, Cherry Pop and Rose Petal for <b><Price aed={set.price} /></b>, {separately > set.price ? <>instead of {fmt(separately)} separately.</> : null}</p>
              <Link href={`/product/${set.slug}`} className="btn btn-pink mt-6">See the set</Link></div>
            <div className="flex items-end justify-center gap-1">{[["#ff5d8f", "#ffb3c7"], ["#f5d6a1", "#fff1d6"], ["#d6124a", "#ff6b8e"], ["#e86aa6", "#ffc6e0"]].map(([c, c2], i) => <BalmTube key={i} color={c} color2={c2} className="h-44 drop-shadow-xl" />)}</div>
          </div>
        </section>)}

      <section className="mx-auto mt-24 max-w-6xl px-4" aria-labelledby="world">
        <h2 id="world" className="text-4xl font-extrabold md:text-5xl">From the UAE to your door</h2>
        <p className="mt-2 max-w-2xl">We ship to the whole GCC and to {countries}+ countries and territories worldwide, always tracked. Enter your country on any product page to see your exact delivery date, shipping cost and tax.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z) => { const [lo, hi] = totalDays(settings, z); return (
            <div key={z.id} className="rounded-3xl border-2 border-blush bg-white p-5"><p className="text-sm font-bold">{z.name}</p><p className="mt-1 font-display text-3xl font-extrabold">{lo}–{hi} <span className="text-base font-bold">business days</span></p><p className="mt-1 text-sm">From {fmt(z.rate)}{z.freeOver ? ` · free over ${fmt(z.freeOver)}` : ""}</p></div>); })}
        </div>
        <p className="mt-4 text-sm">UAE orders include {settings.vatPct}% VAT. Elsewhere, import VAT or duty is either shown at checkout or paid on delivery, depending on your country. <Link href="/delivery-times" className="font-bold underline">All countries and times</Link></p>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        {[["💧", "Comfort first", "A soft, cushiony balm base built around shea butter and jojoba oil."], ["✨", "Glossy, not heavy", "Sheer shine that sits comfortably alone or over lip colour."], ["👜", "Made to carry", "A pocket-size 4.5 g tube that fits every bag, every day."]].map(([e, t, d]) => (
          <div key={t} className="card p-6"><p className="text-4xl" aria-hidden>{e}</p><h3 className="mt-3 text-2xl font-extrabold">{t}</h3><p className="mt-1">{d}</p></div>))}
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-4">
        <h2 className="text-4xl font-extrabold">Quick answers</h2>
        <div className="mt-6 space-y-3">
          {[["How long will my order take?", "Orders are prepared in 1–2 business days, then travel by tracked express courier. Your exact estimated delivery date is shown on the product page and at checkout."], ["Will I pay import tax?", "UAE prices include 5% VAT. For other countries, checkout shows either the import tax prepaid or an estimate of what you may pay on delivery, depending on your country."], ["Can I return a balm?", "Unopened, sealed balms can be returned within 14 days of delivery. Damaged or faulty items are always replaced or refunded."]].map(([q, a]) => (
            <details key={q} className="card p-5"><summary className="cursor-pointer text-lg font-bold">{q}</summary><p className="mt-2">{a}</p></details>))}
        </div>
        <p className="mt-4 text-sm"><Link href="/faq" className="font-bold underline">More help</Link></p>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="rounded-[2rem] bg-ink p-10 text-cream md:p-14">
          <h2 className="max-w-xl text-4xl font-extrabold md:text-5xl">Got an audience? <span className="text-pink">Get paid</span> to share the mwah.</h2>
          <p className="mt-3 max-w-lg">Our creator programme gives your followers a discount and you a commission on every order.</p>
          <Link href="/influencers" className="btn btn-pink mt-6">Apply as a creator</Link>
        </div>
      </section>
    </>
  );
}
