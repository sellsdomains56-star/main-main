"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/Cart";
import { fmt } from "@/lib/money";

type Q = { subtotal: number; discount: number; shipping: number; vat: number; total: number; free: boolean; discountLabel?: string; codeOk: boolean; creator: string | null; zone: { name: string; days: string; freeOver?: number } };

export function Checkout({ countries }: { countries: [string, string][] }) {
  const { lines, clear } = useCart();
  const [f, setF] = useState({ email: "", name: "", phone: "", line1: "", line2: "", city: "", state: "", postcode: "", country: "AE", code: "" });
  const [q, setQ] = useState<Q | null>(null);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (!lines.length) { setQ(null); return; }
    const t = setTimeout(async () => {
      const r = await fetch("/api/quote", { method: "POST", body: JSON.stringify({ lines: lines.map((l) => ({ productId: l.productId, qty: l.qty })), country: f.country, code: f.code, email: f.email }) });
      setQ(await r.json());
    }, 250);
    return () => clearTimeout(t);
  }, [lines, f.country, f.code, f.email]);

  async function pay(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ lines: lines.map((l) => ({ productId: l.productId, qty: l.qty })), email: f.email, name: f.name, phone: f.phone, code: f.code, address: { line1: f.line1, line2: f.line2, city: f.city, state: f.state, postcode: f.postcode, country: f.country } }) });
    const d = await r.json();
    if (!r.ok || !d.url) { setErr(d.error ?? "Something went wrong. Please try again."); setBusy(false); return; }
    clear(); window.location.href = d.url;
  }

  if (!lines.length) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-4xl font-extrabold">Your bag is empty</h1><Link href="/shop" className="btn btn-pink mt-6">Shop the balms</Link></div>;
  const field = (k: keyof typeof f, label: string, opts: { type?: string; req?: boolean; auto?: string } = {}) => (
    <div><label className="label" htmlFor={k}>{label}</label><input id={k} className="input" type={opts.type ?? "text"} required={opts.req} autoComplete={opts.auto} value={f[k]} onChange={set(k)} /></div>
  );
  return (
    <form onSubmit={pay} className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1fr_420px]">
      <div className="space-y-8">
        <h1 className="text-5xl font-extrabold">Checkout</h1>
        <section className="space-y-4"><h2 className="text-2xl font-extrabold">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">{field("email", "Email", { type: "email", req: true, auto: "email" })}{field("phone", "Phone", { type: "tel", req: true, auto: "tel" })}</div></section>
        <section className="space-y-4"><h2 className="text-2xl font-extrabold">Delivery</h2>
          {field("name", "Full name", { req: true, auto: "name" })}
          <div><label className="label" htmlFor="country">Country</label><select id="country" className="input" value={f.country} onChange={set("country")} autoComplete="country">{countries.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></div>
          {field("line1", "Address", { req: true, auto: "address-line1" })}{field("line2", "Apartment, suite, etc. (optional)", { auto: "address-line2" })}
          <div className="grid gap-4 sm:grid-cols-3">{field("city", "City", { req: true, auto: "address-level2" })}{field("state", "Emirate / State", { auto: "address-level1" })}{field("postcode", "Postcode", { auto: "postal-code" })}</div>
          {q && <p className="rounded-2xl bg-blush p-3 text-sm font-medium">📦 {q.zone.name}: {q.zone.days}. {q.free ? "Free shipping unlocked 🎉" : q.zone.freeOver ? `Free shipping over ${fmt(q.zone.freeOver)}.` : ""}</p>}
        </section>
      </div>
      <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <h2 className="text-2xl font-extrabold">Order summary</h2>
        {lines.map((l) => <div key={l.productId} className="flex justify-between text-sm"><span>{l.qty} × {l.name}</span><span className="font-bold">{fmt(l.price * l.qty)}</span></div>)}
        <div><label className="label" htmlFor="code">Discount or creator code</label><input id="code" className="input uppercase" value={f.code} onChange={set("code")} placeholder="WELCOME10" />
          {f.code && q && <p className={`mt-1 text-xs font-bold ${q.codeOk ? "text-green-700" : "text-cherry"}`}>{q.codeOk ? (q.creator ? `Applied: ${q.creator}'s creator code` : "Code applied") : "Code not valid for this order"}</p>}
          {q?.creator && !f.code && <p className="mt-1 text-xs font-bold text-green-700">Creator discount from {q.creator} applied</p>}</div>
        {q && <dl className="space-y-1 border-t-2 border-blush pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{fmt(q.subtotal)}</dd></div>
          {q.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount {q.discountLabel && `(${q.discountLabel})`}</dt><dd>−{fmt(q.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{q.shipping ? fmt(q.shipping) : "Free"}</dd></div>
          <div className="flex justify-between"><dt>{q.vat ? "VAT (included)" : "VAT"}</dt><dd>{q.vat ? fmt(q.vat) : "0 (export)"}</dd></div>
          <div className="flex justify-between border-t-2 border-blush pt-2 text-xl font-extrabold"><dt>Total</dt><dd>{fmt(q.total)}</dd></div>
        </dl>}
        {err && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm font-bold text-red-800">{err}</p>}
        <button disabled={busy || !q} className="btn btn-pink w-full text-lg">{busy ? "One moment…" : "Pay securely"}</button>
        <p className="text-center text-xs">Card, Apple Pay & Google Pay via Stripe. Orders outside the UAE may incur import duties set by your country.</p>
      </aside>
    </form>
  );
}
