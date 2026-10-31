import Link from "next/link";
import type { Product } from "@/lib/types";
import { Price } from "./Locale";
import { ProductImage } from "./ProductImage";
import { AddToCart } from "./AddToCart";

export function ProductCard({ p }: { p: Product }) {
  return (
    <div className="group card overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/product/${p.slug}`} className="relative block">
        <ProductImage p={p} className="aspect-square w-full transition duration-500 group-hover:scale-[1.03]" />
        {p.stock <= 0 ? <span className="sticker absolute left-3 top-3 bg-white">Sold out</span>
          : p.stock <= 15 ? <span className="sticker absolute left-3 top-3">Only {p.stock} left</span> : null}
      </Link>
      <div className="flex items-end justify-between gap-2 p-4">
        <Link href={`/product/${p.slug}`}><h3 className="text-lg font-extrabold leading-tight">{p.name}</h3><p className="text-sm"><Price aed={p.price} /></p></Link>
        <AddToCart p={p} />
      </div>
    </div>
  );
}
