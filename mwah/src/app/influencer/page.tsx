import type { Metadata } from "next";
import { headers } from "next/headers";
import { influencerId } from "@/lib/auth";
import { influencerById, influencerStats } from "@/lib/store";
import { fmt } from "@/lib/money";
import { getSettings } from "@/lib/store";
import Link from "next/link";
import { Login } from "./Login";
import { CopyButton } from "./CopyButton";
import { creatorLogout } from "./actions";

export const metadata: Metadata = { title: "Creator dashboard" };

export default async function Dashboard() {
  const id = await influencerId();
  const inf = id ? await influencerById(id) : null;
  if (!inf || inf.status !== "active") return <div className="px-4 py-20"><Login /></div>;
  const st = await influencerStats(inf);
  const { minPayout } = await getSettings();
  const h = await headers();
  const origin = process.env.SITE_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const link = `${origin}/r/${inf.code}`;
  const tiles: [string, string][] = [["Clicks", String(st.clicks)], ["Orders", String(st.orders)], ["Conversion", `${st.conversion.toFixed(1)}%`], ["Sales driven", fmt(st.revenue)], ["Total earned", fmt(st.earned)], ["Balance to be paid", fmt(st.balance)]];
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-5xl font-extrabold">Hi {inf.name.split(" ")[0]} 💋</h1><p>You earn {inf.commissionPct}% on every order · your followers get {inf.customerDiscountPct}% off</p></div>
        <form action={creatorLogout}><button className="btn btn-ghost px-4 py-2 text-sm">Log out</button></form>
      </div>
      <div className="card mt-8 space-y-4 bg-blush p-6">
        <div><p className="label">Your link</p><div className="flex flex-wrap items-center gap-3"><code className="rounded-xl bg-white px-3 py-2 text-sm font-bold break-all">{link}</code><CopyButton text={link} label="Copy link" /></div></div>
        <div><p className="label">Your code (works at checkout too)</p><div className="flex items-center gap-3"><code className="rounded-xl bg-white px-3 py-2 text-lg font-extrabold">{inf.code}</code><CopyButton text={inf.code} label="Copy code" /></div></div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">{tiles.map(([k, v]) => <div key={k} className="card p-5"><p className="text-sm font-bold">{k}</p><p className="mt-1 text-3xl font-extrabold">{v}</p></div>)}</div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="card p-5"><h2 className="text-xl font-extrabold">Recent orders</h2>
          {st.recent.length === 0 ? <p className="mt-3 text-sm">No orders yet. Share your link to get started!</p> : <ul className="mt-3 divide-y divide-blush text-sm">{st.recent.map((o) => <li key={o.id} className="flex justify-between py-2"><span>#{o.number} · {o.name.split(" ")[0]} · {new Date(o.createdAt).toLocaleDateString("en")}</span><b>+{fmt(o.commission)}</b></li>)}</ul>}</section>
        <section className="card p-5"><h2 className="text-xl font-extrabold">Payouts</h2><p className="mt-1 text-xs">Paid when your balance reaches {fmt(minPayout)}. <Link href="/creator-terms" className="underline">Creator terms</Link></p>
          {st.payouts.length === 0 ? <p className="mt-3 text-sm">No payouts yet. Paid out: {fmt(0)}.</p> : <ul className="mt-3 divide-y divide-blush text-sm">{st.payouts.map((p) => <li key={p.id} className="flex justify-between py-2"><span>{new Date(p.createdAt).toLocaleDateString("en")} · {p.note}</span><b>{fmt(p.amount)}</b></li>)}</ul>}</section>
      </div>
    </div>
  );
}
