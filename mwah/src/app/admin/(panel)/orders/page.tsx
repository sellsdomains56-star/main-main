import type { Metadata } from "next";
import Link from "next/link";
import { allOrders } from "@/lib/store";
import { fmt } from "@/lib/money";
import { StatusBadge } from "@/components/StatusBadge";
import type { OrderStatus } from "@/lib/types";
export const metadata: Metadata = { title: "Orders", robots: { index: false } };
const TABS: (OrderStatus | "all")[] = ["all", "paid", "packed", "shipped", "delivered", "pending", "cancelled", "refunded"];

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  let orders = await allOrders();
  if (status !== "all") orders = orders.filter((o) => o.status === status);
  if (q) orders = orders.filter((o) => `${o.number} ${o.name} ${o.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-extrabold">Orders</h1>
      <div className="flex flex-wrap gap-2">{TABS.map((t) => <Link key={t} href={`/admin/orders?status=${t}`} className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize ${status === t ? "bg-ink text-white" : "bg-blush"}`}>{t}</Link>)}</div>
      <form className="flex gap-2"><input type="hidden" name="status" value={status} /><input name="q" defaultValue={q} placeholder="Search order #, name, email" className="input max-w-sm" aria-label="Search orders" /><button className="btn btn-ink">Search</button></form>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm"><thead><tr className="border-b-2 border-blush"><th className="p-3">Order</th><th>Date</th><th>Customer</th><th>Status</th><th>Creator</th><th className="pr-3 text-right">Total</th></tr></thead>
          <tbody>{orders.map((o) => <tr key={o.id} className="border-b border-blush/60 hover:bg-cream"><td className="p-3 font-bold"><Link href={`/admin/orders/${o.id}`} className="hover:text-pink">#{o.number}</Link></td><td>{new Date(o.createdAt).toLocaleDateString("en", { day: "numeric", month: "short" })}</td><td>{o.name}<br /><span className="text-xs">{o.address.country}</span></td><td><StatusBadge s={o.status} /></td><td>{o.referralCode ?? "—"}</td><td className="pr-3 text-right font-bold">{fmt(o.total)}</td></tr>)}</tbody></table>
        {orders.length === 0 && <p className="p-6 text-center">No orders found.</p>}
      </div>
    </div>
  );
}
