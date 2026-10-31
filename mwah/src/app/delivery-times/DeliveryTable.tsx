"use client";
import { useState } from "react";
import { fmt } from "@/lib/money";

export type Row = { code: string; name: string; zone: string; blocked: boolean; days: number[]; rate: number; freeOver?: number };

export function DeliveryTable({ rows }: { rows: Row[] }) {
  const [q, setQ] = useState("");
  const list = rows.filter((r) => `${r.name} ${r.code} ${r.zone}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="mt-8">
      <label className="label" htmlFor="find">Find your country</label>
      <input id="find" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a country…" className="input max-w-sm" />
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead><tr className="border-b-2 border-blush"><th className="p-3">Country</th><th>Estimated delivery</th><th>Shipping</th><th className="pr-3">Free shipping</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.code} className="border-b border-blush/60">
                <td className="p-3 font-bold">{r.name}<span className="block text-xs font-normal">{r.zone}</span></td>
                {r.blocked ? <td colSpan={3} className="text-cherry">We can&apos;t ship here at the moment</td> : <>
                  <td className="font-bold">{r.days[0]}–{r.days[1]} business days</td><td>{fmt(r.rate)}</td><td className="pr-3">{r.freeOver ? `Over ${fmt(r.freeOver)}` : "—"}</td></>}
              </tr>))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-center">No match. If your country isn&apos;t listed, email us and we&apos;ll see what we can do.</p>}
      </div>
    </div>
  );
}
