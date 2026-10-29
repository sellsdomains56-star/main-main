import type { Metadata } from "next";
import Link from "next/link";
import { allProducts, getSettings } from "@/lib/store";
import { fmt } from "@/lib/money";
import { ProductImage } from "@/components/ProductImage";
import { adjustStock } from "../../actions";
export const metadata: Metadata = { title: "Products", robots: { index: false } };

export default async function Products() {
  const [products, s] = await Promise.all([allProducts(), getSettings()]);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-4xl font-extrabold">Products</h1><Link href="/admin/products/new" className="btn btn-pink px-5 py-2.5">+ Add product</Link></div>
      <div className="card divide-y divide-blush">
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
            <ProductImage p={p} className="h-16 w-16 rounded-2xl" />
            <div className="min-w-40 flex-1"><Link href={`/admin/products/${p.id}`} className="font-extrabold hover:text-pink">{p.name}</Link><p className="text-sm">{fmt(p.price)} · {p.status}{p.featured && " · ⭐ featured"}</p></div>
            <form action={adjustStock.bind(null, p.id)} className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`s${p.id}`}>Stock for {p.name}</label>
              <input id={`s${p.id}`} name="stock" type="number" min="0" defaultValue={p.stock} className={`input w-24 py-2 ${p.stock <= s.lowStockAt ? "border-cherry" : ""}`} />
              <button className="btn btn-ghost px-3 py-1.5 text-sm">Update</button></form>
          </div>
        ))}
      </div>
    </div>
  );
}
