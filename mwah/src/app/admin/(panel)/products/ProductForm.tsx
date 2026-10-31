"use client";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { saveProduct, removeProduct } from "../../actions";

export function ProductForm({ p }: { p?: Product }) {
  const [images, setImages] = useState((p?.images ?? []).join("\n"));
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true); setErr("");
    const fd = new FormData(); fd.set("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd }); const d = await r.json();
    if (d.url) setImages((v) => (v ? `${v}\n` : "") + d.url); else setErr(d.error ?? "Upload failed");
    setBusy(false); e.target.value = "";
  }
  const f = (name: string, label: string, v: string | number | undefined, type = "text", extra = {}) => (
    <div><label className="label" htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={v} className="input" {...extra} /></div>
  );
  return (
    <div className="space-y-6">
      <form action={saveProduct.bind(null, p?.id ?? null)} className="card space-y-4 p-6">
        {f("name", "Name", p?.name, "text", { required: true })}
        {f("tagline", "Tagline", p?.tagline)}
        <div><label className="label" htmlFor="description">Description (blank line = new paragraph)</label><textarea id="description" name="description" rows={7} defaultValue={p?.description} className="input" /></div>
        <div className="grid gap-4 sm:grid-cols-3">{f("price", "Price (AED, VAT incl.)", p?.price, "number", { step: "0.01", min: 0, required: true })}{f("stock", "Stock", p?.stock ?? 50, "number", { min: 0 })}{f("size", "Size", p?.size ?? "4.5 g")}</div>
        <div className="grid gap-4 sm:grid-cols-2">{f("color", "Tube colour", p?.color ?? "#ff5d8f", "color")}{f("color2", "Highlight colour", p?.color2 ?? "#ffb3c7", "color")}</div>
        <div><label className="label" htmlFor="images">Photos (one URL per line, the first is the main photo)</label><textarea id="images" name="images" rows={3} value={images} onChange={(e) => setImages(e.target.value)} className="input font-mono text-xs" />
          <label className="btn btn-ghost mt-2 cursor-pointer px-4 py-2 text-sm">{busy ? "Uploading…" : "Upload photo"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="sr-only" /></label>
          {err && <p role="alert" className="mt-1 text-sm font-bold text-cherry">{err}</p>}
          <p className="mt-1 text-xs">No photo? The shop shows an illustrated tube in your colours.</p></div>
        <div><label className="label" htmlFor="highlights">Key benefits (one per line, up to 8, shown as bullet points)</label><textarea id="highlights" name="highlights" rows={4} defaultValue={(p?.highlights ?? []).join("\n")} className="input" /></div>
        <div className="grid gap-4 sm:grid-cols-2">{f("flavourNotes", "Flavour / scent notes", p?.flavourNotes)}{f("finish", "Finish (e.g. sheer rosy gloss)", p?.finish)}</div>
        <div><label className="label" htmlFor="howToUse">How to use</label><textarea id="howToUse" name="howToUse" rows={3} defaultValue={p?.howToUse} className="input" /></div>
        <div className="grid gap-4 sm:grid-cols-2">{f("shelfLife", "Shelf life after opening", p?.shelfLife ?? "12 months after opening")}</div>
        <div><label className="label" htmlFor="ingredients">Full ingredient list (INCI, exactly as on the pack)</label><textarea id="ingredients" name="ingredients" rows={3} defaultValue={p?.ingredients} className="input" /></div>
        {f("slug", "URL slug (optional)", p?.slug)}
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="featured" defaultChecked={p?.featured} className="h-5 w-5 accent-pink-500" /> Featured on home page</label>
          <label className="flex items-center gap-2 font-bold">Status <select name="status" defaultValue={p?.status ?? "active"} className="input w-auto py-2"><option value="active">Active (visible)</option><option value="draft">Draft (hidden)</option></select></label>
        </div>
        <button className="btn btn-pink">Save product</button>
      </form>
      {p && <form action={removeProduct.bind(null, p.id)} onSubmit={(e) => { if (!confirm(`Delete ${p.name}? This can't be undone.`)) e.preventDefault(); }}><button className="btn btn-ghost text-cherry">Delete product</button></form>}
    </div>
  );
}
