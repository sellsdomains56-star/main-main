"use client";
import { useState } from "react";
import { useCart } from "./Cart";
import type { Product } from "@/lib/types";

export function AddToCart({ p, big = false }: { p: Product; big?: boolean }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const out = p.stock <= 0;
  const line = { productId: p.id, slug: p.slug, name: p.name, price: p.price, color: p.color, color2: p.color2, image: p.images[0], stock: p.stock };
  if (!big) return <button disabled={out} onClick={() => add(line)} className="btn btn-ink px-4 py-2 text-sm">{out ? "Sold out" : "Add"}</button>;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-full border-2 border-ink">
        <button className="h-12 w-12 text-xl" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">−</button>
        <span className="w-8 text-center font-bold">{qty}</span>
        <button className="h-12 w-12 text-xl" onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="More">+</button>
      </div>
      <button disabled={out} onClick={() => add(line, qty)} className="btn btn-pink flex-1 text-lg">{out ? "Sold out" : "Add to bag"}</button>
    </div>
  );
}
