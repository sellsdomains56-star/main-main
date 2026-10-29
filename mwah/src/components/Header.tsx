"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./Cart";

export function Header() {
  const { count, setOpen } = useCart();
  if (usePathname().startsWith("/admin")) return null; // the admin panel has its own chrome
  return (
    <header className="sticky top-0 z-40 border-b-2 border-blush bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-3xl font-extrabold text-pink" aria-label="Mwah home">mwah<span className="text-ink">.</span></Link>
        <nav className="hidden gap-7 text-sm font-bold md:flex">
          <Link href="/shop" className="hover:text-pink">Shop</Link>
          <Link href="/about" className="hover:text-pink">Our story</Link>
          <Link href="/influencers" className="hover:text-pink">Creators</Link>
          <Link href="/faq" className="hover:text-pink">Help</Link>
        </nav>
        <button onClick={() => setOpen(true)} className="btn btn-ink relative px-4 py-2 text-sm" aria-label={`Open bag, ${count} items`}>
          Bag <span className="grid h-6 min-w-6 place-items-center rounded-full bg-pink px-1 text-xs">{count}</span>
        </button>
      </div>
      <nav className="flex justify-center gap-6 border-t border-blush py-2 text-sm font-bold md:hidden">
        <Link href="/shop">Shop</Link><Link href="/about">Story</Link><Link href="/influencers">Creators</Link><Link href="/faq">Help</Link>
      </nav>
    </header>
  );
}
