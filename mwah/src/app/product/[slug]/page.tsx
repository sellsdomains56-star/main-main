import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { activeProducts, productBySlug } from "@/lib/store";
import { fmt } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await productBySlug((await params).slug);
  return p ? { title: p.name, description: p.tagline } : {};
}

export default async function ProductPage({ params }: Props) {
  const p = await productBySlug((await params).slug);
  if (!p) notFound();
  const more = (await activeProducts()).filter((x) => x.id !== p.id).slice(0, 4);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          <ProductImage p={p} className="aspect-square w-full rounded-[2rem]" />
          {p.images.length > 1 && <div className="grid grid-cols-4 gap-3">{p.images.slice(1).map((src) => /* eslint-disable-next-line @next/next/no-img-element */ <img key={src} src={src} alt="" className="aspect-square rounded-2xl object-cover" />)}</div>}
        </div>
        <div>
          <h1 className="text-5xl font-extrabold md:text-6xl">{p.name}</h1>
          <p className="mt-2 text-xl">{p.tagline}</p>
          <p className="mt-5 text-3xl font-extrabold">{fmt(p.price)} <span className="text-sm font-normal">VAT included · {p.size}</span></p>
          <p className="mt-5">{p.description}</p>
          <div className="mt-7"><AddToCart p={p} big /></div>
          {p.stock > 0 && p.stock <= 15 && <p className="mt-3 text-sm font-bold text-cherry">Only {p.stock} left, so grab yours.</p>}
          <ul className="mt-8 space-y-2 rounded-3xl bg-blush p-5 text-sm font-medium">
            <li>🚚 Free UAE delivery over AED 150 · ships worldwide</li><li>💧 Non-sticky, all-day hydration</li><li>↩️ Unopened balms can be returned within 14 days</li>
          </ul>
          <details className="mt-5 border-t-2 border-blush pt-4"><summary className="cursor-pointer font-bold">Ingredients</summary><p className="mt-2 text-sm">{p.ingredients}</p></details>
          <details className="mt-3 border-t-2 border-blush pt-4"><summary className="cursor-pointer font-bold">Safety & use</summary><p className="mt-2 text-sm">Cosmetic product for external use on the lips only. Check the ingredients if you have allergies or sensitivities, and stop using it if irritation occurs. Keep out of reach of young children. Store in a cool place away from heat. <Link href="/terms" className="underline">Terms of Sale</Link></p></details>
        </div>
      </div>
      <h2 className="mb-6 mt-20 text-3xl font-extrabold">You might also kiss</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{more.map((x) => <ProductCard key={x.id} p={x} />)}</div>
    </div>
  );
}
