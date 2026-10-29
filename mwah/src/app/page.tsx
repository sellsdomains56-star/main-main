import Link from "next/link";
import { activeProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { BalmTube } from "@/components/BalmTube";
import { cookies } from "next/headers";
import { influencerByCode } from "@/lib/store";

export default async function Home() {
  const products = (await activeProducts()).filter((p) => p.featured).slice(0, 4);
  const ref = await influencerByCode((await cookies()).get("mwah_ref")?.value);
  const tubes = [["#ff5d8f", "#ffb3c7", -8], ["#d6124a", "#ff6b8e", 6], ["#f5d6a1", "#fff1d6", -3]] as const;
  return (
    <>
      {ref && (
        <div className="bg-butter py-2 text-center text-sm font-bold">
          You&apos;re shopping with {ref.name}&apos;s link, so {ref.customerDiscountPct}% off is applied at checkout 💋
        </div>
      )}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-24">
          <div>
            <span className="sticker">New: Rose Petal 🌹</span>
            <h1 className="mt-5 text-6xl font-extrabold leading-[0.95] md:text-8xl">Lips that go <span className="text-pink">mwah.</span></h1>
            <p className="mt-6 max-w-md text-lg">Glossy, hydrating balms in flavours you&apos;ll actually want to wear. Non-sticky, all-day soft, made in the UAE.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-pink text-lg">Shop the balms</Link>
              <Link href="/product/mwah-set" className="btn btn-ghost text-lg">The Mwah Set · AED 99</Link>
            </div>
            <p className="mt-6 text-sm font-bold">Free UAE shipping over AED 150 · Ships worldwide</p>
          </div>
          <div className="relative mx-auto flex h-[420px] w-full max-w-md items-end justify-center">
            <div className="absolute inset-6 rounded-full bg-blush" />
            {tubes.map(([c, c2, r], i) => (
              <BalmTube key={i} color={c} color2={c2} className="float relative h-[340px] -mx-5 drop-shadow-2xl" />
            )).map((el, i) => <div key={i} style={{ ["--r" as string]: `${tubes[i][2]}deg`, transform: `rotate(${tubes[i][2]}deg)`, animationDelay: `${i * 0.6}s` }} className="float relative z-10">{el}</div>)}
          </div>
        </div>
      </section>

      <div className="overflow-hidden bg-pink py-3 text-white" aria-hidden>
        <div className="marquee font-display text-xl font-extrabold">
          {Array.from({ length: 16 }).map((_, i) => <span key={i}>{["Hydrating", "Non-sticky", "Glossy finish", "Made in the UAE", "Ships worldwide"][i % 5]} ✦</span>)}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="mb-8 flex items-end justify-between"><h2 className="text-4xl font-extrabold md:text-5xl">Fan favourites</h2><Link href="/shop" className="font-bold underline decoration-pink decoration-4 underline-offset-4">See all →</Link></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        {[["💧", "All-day hydration", "Shea butter, jojoba oil and vitamin E for soft, plump lips."], ["✨", "Glossy, never sticky", "A weightless, cushiony finish that feels like nothing."], ["🌍", "Ships worldwide", "Express from Dubai to your door, with tracking."]].map(([e, t, d]) => (
          <div key={t} className="card p-6"><p className="text-4xl">{e}</p><h3 className="mt-3 text-2xl font-extrabold">{t}</h3><p className="mt-1">{d}</p></div>
        ))}
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
