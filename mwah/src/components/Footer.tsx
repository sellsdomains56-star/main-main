import Link from "next/link";
import { getSettings } from "@/lib/store";

export async function Footer() {
  const { legal: l } = await getSettings();
  const fine = [l.legalName, l.tradeLicenceNo && `Trade licence ${l.tradeLicenceNo}`, l.vatTrn && `TRN ${l.vatTrn}`, l.address].filter(Boolean).join(" · ");
  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-5xl font-extrabold text-pink">mwah.</p>
          <p className="mt-3 max-w-sm">Lip balm that feels as good as it looks. Shipped from the UAE to the GCC and worldwide.</p>
          {l.email && <p className="mt-3 text-sm">{l.email}{l.phone && ` · ${l.phone}`}</p>}
        </div>
        <div className="space-y-2 text-sm"><p className="font-bold">Shop</p><Link className="block hover:text-pink" href="/shop">All balms</Link><Link className="block hover:text-pink" href="/product/mwah-set">The Mwah Set</Link><Link className="block hover:text-pink" href="/delivery-times">Delivery times</Link><Link className="block hover:text-pink" href="/faq">Help</Link></div>
        <div className="space-y-2 text-sm"><p className="font-bold">Policies</p>
          <Link className="block hover:text-pink" href="/terms">Terms of Sale</Link><Link className="block hover:text-pink" href="/shipping">Shipping</Link><Link className="block hover:text-pink" href="/returns">Returns & Refunds</Link>
          <Link className="block hover:text-pink" href="/privacy">Privacy</Link><Link className="block hover:text-pink" href="/cookies">Cookies</Link></div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs">
          <p>© {new Date().getFullYear()} Mwah. Prices in AED, UAE VAT included on UAE deliveries.{fine && <span className="block opacity-70">{fine}</span>}</p>
          <p className="space-x-4"><Link className="hover:text-pink" href="/about">Our story</Link><Link className="hover:text-pink" href="/influencers">Creator programme</Link><Link className="hover:text-pink" href="/creator-terms">Creator terms</Link><Link className="hover:text-pink" href="/influencer">Creator login</Link></p>
        </div>
      </div>
    </footer>
  );
}
