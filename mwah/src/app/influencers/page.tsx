import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { Apply } from "./Apply";
export const metadata: Metadata = { title: "Creator programme" };

export default async function Creators() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <span className="sticker">Creator programme</span>
      <h1 className="mt-4 max-w-3xl text-6xl font-extrabold">Share the mwah. <span className="text-pink">Earn {s.defaultCommissionPct}%.</span></h1>
      <p className="mt-4 max-w-xl text-lg">Referral links are for approved creators only. Get your own link and code, give your followers {s.defaultCustomerDiscountPct}% off, and earn a commission on every order, tracked live in your dashboard.</p>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <ol className="space-y-4">
          {[["Apply", "Tell us about your channel. We review every application."], ["Get your link & code", "Once approved, you receive a personal link and a login."], ["Share", "Post it anywhere. Anyone who clicks gets your discount automatically for 30 days."], ["Get paid", "Watch clicks, orders and earnings grow. We pay out your balance."]].map(([t, d], i) => (
            <li key={t} className="card flex gap-4 p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pink font-extrabold text-white">{i + 1}</span><div><p className="font-extrabold">{t}</p><p className="text-sm">{d}</p></div></li>
          ))}
        </ol>
        <Apply />
      </div>
    </div>
  );
}
