import type { Metadata } from "next";
import { allOrders } from "@/lib/store";
import { fmt, r2 } from "@/lib/money";
export const metadata: Metadata = { title: "Customers", robots: { index: false } };

export default async function Customers() {
  const orders = (await allOrders()).filter((o) => !["pending", "cancelled", "refunded"].includes(o.status));
  const map = new Map<string, { name: string; email: string; country: string; orders: number; spent: number; last: string }>();
  for (const o of orders) {
    const c = map.get(o.email) ?? { name: o.name, email: o.email, country: o.address.country, orders: 0, spent: 0, last: o.createdAt };
    c.orders++; c.spent = r2(c.spent + o.total); if (o.createdAt > c.last) c.last = o.createdAt; map.set(o.email, c);
  }
  const list = [...map.values()].sort((a, b) => b.spent - a.spent);
  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-extrabold">Customers</h1>
      <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b-2 border-blush"><th className="p-3">Name</th><th>Email</th><th>Country</th><th>Orders</th><th>Last order</th><th className="pr-3 text-right">Spent</th></tr></thead>
        <tbody>{list.map((c) => <tr key={c.email} className="border-b border-blush/60"><td className="p-3 font-bold">{c.name}{c.orders > 1 && <span className="sticker ml-2">repeat</span>}</td><td>{c.email}</td><td>{c.country}</td><td>{c.orders}</td><td>{new Date(c.last).toLocaleDateString("en")}</td><td className="pr-3 text-right font-bold">{fmt(c.spent)}</td></tr>)}</tbody></table>
        {list.length === 0 && <p className="p-6 text-center">Customers appear after their first paid order.</p>}</div>
    </div>
  );
}
