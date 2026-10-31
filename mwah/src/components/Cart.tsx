"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Price } from "./Locale";

export type Line = { productId: string; slug: string; name: string; price: number; color: string; color2: string; image?: string; qty: number; stock: number };
type Ctx = { lines: Line[]; count: number; subtotal: number; open: boolean; setOpen: (v: boolean) => void; add: (l: Omit<Line, "qty">, qty?: number) => void; setQty: (id: string, q: number) => void; clear: () => void };
const C = createContext<Ctx>(null!);
export const useCart = () => useContext(C);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { setLines(JSON.parse(localStorage.getItem("mwah_cart") ?? "[]")); } catch {} }, []);
  const save = (l: Line[]) => { setLines(l); try { localStorage.setItem("mwah_cart", JSON.stringify(l)); } catch {} };
  const add: Ctx["add"] = (l, qty = 1) => {
    const ex = lines.find((x) => x.productId === l.productId);
    save(ex ? lines.map((x) => x.productId === l.productId ? { ...x, qty: Math.min(x.qty + qty, l.stock, 20) } : x) : [...lines, { ...l, qty: Math.min(qty, l.stock) }]);
    setOpen(true);
  };
  const setQty = (id: string, q: number) => save(q <= 0 ? lines.filter((x) => x.productId !== id) : lines.map((x) => x.productId === id ? { ...x, qty: Math.min(q, x.stock, 20) } : x));
  const subtotal = lines.reduce((t, l) => t + l.price * l.qty, 0);
  return (
    <C.Provider value={{ lines, count: lines.reduce((t, l) => t + l.qty, 0), subtotal, open, setOpen, add, setQty, clear: () => save([]) }}>
      {children}<Drawer />
    </C.Provider>
  );
}

function Drawer() {
  const { lines, open, setOpen, setQty, subtotal } = useCart();
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <aside role="dialog" aria-label="Your bag" className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream transition-transform duration-300 ${open ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b-2 border-blush p-5">
          <h2 className="text-2xl font-extrabold">Your bag 💋</h2>
          <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-blush" aria-label="Close bag">✕</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {lines.length === 0 && <p className="mt-16 text-center text-lg">Your bag is empty.<br />Your lips are waiting.</p>}
          {lines.map((l) => (
            <div key={l.productId} className="card flex items-center gap-4 p-3">
              <div className="grid h-20 w-20 place-items-center rounded-2xl" style={{ background: l.color2 }}>
                <svg viewBox="0 0 120 260" className="h-16"><rect x="30" y="6" width="60" height="60" rx="10" fill="#2a1320" /><rect x="30" y="66" width="60" height="180" rx="10" fill={l.color} /></svg>
              </div>
              <div className="flex-1">
                <p className="font-bold">{l.name}</p><p className="text-sm"><Price aed={l.price} /></p>
                <div className="mt-1 inline-flex items-center rounded-full border-2 border-blush">
                  <button className="h-8 w-8" onClick={() => setQty(l.productId, l.qty - 1)} aria-label="Less">−</button>
                  <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                  <button className="h-8 w-8" onClick={() => setQty(l.productId, l.qty + 1)} aria-label="More">+</button>
                </div>
              </div>
              <p className="font-bold"><Price aed={l.price * l.qty} /></p>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div className="space-y-3 border-t-2 border-blush p-5">
            <div className="flex justify-between text-lg font-bold"><span>Subtotal</span><Price aed={subtotal} /></div>
            <p className="text-xs">Shipping, taxes and discount codes are worked out at checkout. You are charged in AED.</p>
            <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-pink w-full">Checkout</Link>
          </div>
        )}
      </aside>
    </div>
  );
}
