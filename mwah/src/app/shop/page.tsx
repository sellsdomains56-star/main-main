import type { Metadata } from "next";
import Link from "next/link";
import { activeProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop all balms" };
const SORTS: Record<string, string> = { featured: "Featured", "price-asc": "Price: low to high", "price-desc": "Price: high to low", new: "Newest" };

export default async function Shop({ searchParams }: { searchParams: Promise<{ sort?: string; q?: string }> }) {
  const { sort = "featured", q = "" } = await searchParams;
  let items = await activeProducts();
  if (q) items = items.filter((p) => `${p.name} ${p.tagline}`.toLowerCase().includes(q.toLowerCase()));
  items.sort((a, b) =>
    sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price :
    sort === "new" ? b.createdAt.localeCompare(a.createdAt) : Number(b.featured) - Number(a.featured));
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-5xl font-extrabold md:text-6xl">All balms</h1>
      <form className="mt-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Search flavours…" className="input max-w-xs" aria-label="Search" />
        <select name="sort" defaultValue={sort} className="input max-w-xs" aria-label="Sort">{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="btn btn-ink">Apply</button>
      </form>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      {items.length === 0 && <p className="mt-10 text-lg">Nothing matches “{q}”. <Link href="/shop" className="font-bold underline">Clear search</Link></p>}
    </div>
  );
}
