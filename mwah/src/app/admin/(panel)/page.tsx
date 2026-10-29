import type { Metadata } from "next";
import Link from "next/link";
import { dashboard } from "@/lib/store";
import { fmt } from "@/lib/money";
import { StatusBadge } from "@/components/StatusBadge";
export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function Dash() {
  const d = await dashboard();
  const max = Math.max(1, ...d.days.map((x) => x.revenue));
  const tiles: [string, string, string][] = [["Revenue (all time)", fmt(d.totalRev), "💰"], ["This month", fmt(d.monthRev), "📈"], ["Paid orders", String(d.orderCount), "🧾"], ["Avg. order", fmt(d.aov), "🛍️"], ["To ship", String(d.toShip), "📦"]];
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{tiles.map(([k, v, e]) => <div key={k} className="card p-4"><p className="text-xs font-bold">{e} {k}</p><p className="mt-1 text-2xl font-extrabold">{v}</p></div>)}</div>
      <section className="card p-5"><h2 className="text-lg font-extrabold">Revenue, last 14 days</h2>
        <div className="mt-4 flex h-44 items-end gap-1.5" role="img" aria-label="Revenue per day for the last 14 days">
          {d.days.map((x) => <div key={x.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${x.label}: ${fmt(x.revenue)}`}>
            <div className="min-h-1 w-full rounded-t-lg bg-pink transition group-hover:bg-cherry" style={{ height: `calc(${Math.max(2, (x.revenue / max) * 100)}% - 1.25rem)`, opacity: x.revenue ? 1 : 0.2 }} />
            <span className="text-[10px]">{x.label.split(" ")[0]}</span></div>)}
        </div></section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><div className="flex justify-between"><h2 className="text-lg font-extrabold">Recent orders</h2><Link href="/admin/orders" className="text-sm font-bold underline">All</Link></div>
          {d.recent.length === 0 ? <p className="mt-3 text-sm">No orders yet.</p> : <ul className="mt-3 divide-y divide-blush">{d.recent.map((o) => <li key={o.id}><Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-2 py-2.5 text-sm hover:text-pink"><span>#{o.number} · {o.name}</span><span className="flex items-center gap-2"><StatusBadge s={o.status} /><b>{fmt(o.total)}</b></span></Link></li>)}</ul>}</section>
        <section className="space-y-6">
          <div className="card p-5"><h2 className="text-lg font-extrabold">⚠️ Low stock</h2>{d.low.length === 0 ? <p className="mt-2 text-sm">All good.</p> : <ul className="mt-2 space-y-1 text-sm">{d.low.map((p) => <li key={p.id} className="flex justify-between"><Link href={`/admin/products/${p.id}`} className="font-bold hover:text-pink">{p.name}</Link><span className={p.stock === 0 ? "font-bold text-cherry" : ""}>{p.stock} left</span></li>)}</ul>}</div>
          <div className="card p-5"><h2 className="text-lg font-extrabold">🏆 Best sellers</h2>{d.top.length === 0 ? <p className="mt-2 text-sm">Sell something first!</p> : <ul className="mt-2 space-y-1 text-sm">{d.top.map(([n, q]) => <li key={n} className="flex justify-between"><span>{n}</span><b>{q} sold</b></li>)}</ul>}</div>
        </section>
      </div>
    </div>
  );
}
