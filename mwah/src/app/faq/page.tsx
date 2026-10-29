import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { fmt } from "@/lib/money";
export const metadata: Metadata = { title: "Shipping & returns" };

export default async function FAQ() {
  const s = await getSettings();
  const qa: [string, React.ReactNode][] = [
    ["Where do you ship?", <>Everywhere we legally can. Rates: {s.zones.map((z) => `${z.name} ${fmt(z.rate)} (${z.days})${z.freeOver ? `, free over ${fmt(z.freeOver)}` : ""}`).join(" · ")}.</>],
    ["Is VAT included?", `Prices include ${s.vatPct}% UAE VAT. Orders shipped outside the UAE are zero-rated, but your country may charge import duty or tax on arrival.`],
    ["Can I return a balm?", "Unopened balms can be returned within 14 days. If something arrives damaged, message us with a photo and we'll replace it."],
    ["How do I contact you?", "Email hello@mwah.ae and we'll reply within one working day."],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-6xl font-extrabold">Help</h1>
      <div className="mt-8 space-y-3">{qa.map(([q, a]) => <details key={q} className="card p-5"><summary className="cursor-pointer text-lg font-bold">{q}</summary><p className="mt-2">{a}</p></details>)}</div>
    </div>
  );
}
