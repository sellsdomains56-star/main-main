import Link from "next/link";
export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-5xl font-extrabold text-pink">mwah.</p>
          <p className="mt-3 max-w-sm">Lip balm that feels as good as it looks. Made in the UAE, shipped worldwide.</p>
        </div>
        <div className="space-y-2 text-sm"><p className="font-bold">Shop</p><Link className="block hover:text-pink" href="/shop">All balms</Link><Link className="block hover:text-pink" href="/product/mwah-set">The Mwah Set</Link></div>
        <div className="space-y-2 text-sm"><p className="font-bold">Mwah</p><Link className="block hover:text-pink" href="/about">Our story</Link><Link className="block hover:text-pink" href="/faq">Shipping & returns</Link><Link className="block hover:text-pink" href="/influencers">Creator programme</Link><Link className="block hover:text-pink" href="/influencer">Creator login</Link></div>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} Mwah. All prices in AED, VAT included.</p>
    </footer>
  );
}
