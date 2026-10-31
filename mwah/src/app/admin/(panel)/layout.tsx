import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminLogout } from "../actions";
import { usingSupabase } from "@/lib/db";
import { stripe, stripeMode } from "@/lib/stripe";
import { launchChecks } from "@/lib/launch";

const NAV = [["/admin", "Dashboard", "📊"], ["/admin/orders", "Orders", "📦"], ["/admin/products", "Products", "💄"], ["/admin/discounts", "Discounts", "🏷️"], ["/admin/customers", "Customers", "👥"], ["/admin/influencers", "Creators", "🤳"], ["/admin/taxes", "Taxes by country", "🧾"], ["/admin/currencies", "Currencies", "💱"], ["/admin/launch", "Launch checklist", "🚀"], ["/admin/settings", "Settings", "⚙️"]];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const open = (await launchChecks()).filter((c) => !c.ok).length;
  return (
    <>
    <div className="border-b-2 border-blush bg-white"><div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4"><span className="font-display text-2xl font-extrabold text-pink">mwah<span className="text-ink"> admin</span></span><Link href="/" target="_blank" className="text-sm font-bold underline">View shop ↗</Link></div></div>
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <aside className="lg:sticky lg:top-24 lg:h-fit lg:w-56 lg:shrink-0">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
          {NAV.map(([href, label, icon]) => <Link key={href} href={href} className="whitespace-nowrap rounded-2xl px-4 py-2.5 font-bold hover:bg-blush">{icon} {label}{href === "/admin/launch" && open > 0 && <span className="ml-2 rounded-full bg-pink px-2 py-0.5 text-xs text-white">{open}</span>}</Link>)}
          <form action={adminLogout}><button className="w-full rounded-2xl px-4 py-2.5 text-left font-bold hover:bg-blush">🚪 Log out</button></form>
        </nav>
        <div className="mt-4 hidden space-y-1 text-xs lg:block">
          <p className={usingSupabase ? "text-green-700" : "text-cherry"}>● Database: {usingSupabase ? "Supabase" : "local demo file"}</p>
          <p className={stripeMode === "live" ? "text-green-700" : "text-cherry"}>● Payments: {stripe ? `Stripe ${stripeMode}` : "test mode (no charge)"}</p>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
    </>
  );
}
