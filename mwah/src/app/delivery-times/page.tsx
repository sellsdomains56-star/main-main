import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/store";
import { COUNTRY_LIST } from "@/lib/countries";
import { totalDays } from "@/lib/delivery";
import { DeliveryTable, type Row } from "./DeliveryTable";

export const metadata: Metadata = { title: "Delivery times worldwide", description: "Estimated delivery time and shipping cost from the UAE to every country we ship to." };

export default async function DeliveryTimes() {
  const s = await getSettings();
  const rows: Row[] = COUNTRY_LIST.map((c) => {
    const zone = s.zones.find((z) => z.countries.includes(c.code));
    const blocked = s.blockedCountries.includes(c.code);
    if (!zone) return { code: c.code, name: c.name, zone: "—", blocked: true, days: [0, 0], rate: 0 };
    const [lo, hi] = totalDays(s, zone);
    return { code: c.code, name: c.name, zone: zone.name, blocked, days: [lo, hi], rate: zone.rate, freeOver: zone.freeOver };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-5xl font-extrabold md:text-6xl">Delivery times worldwide</h1>
      <p className="mt-4 max-w-2xl text-lg">Every order is prepared in {s.processingMinDays}–{s.processingMaxDays} business days and sent from the UAE by express courier with tracking. Times below are <b>door to door</b>, counted in business days (Mon–Fri).</p>
      <ul className="mt-5 max-w-2xl list-disc space-y-1 pl-5 text-sm">
        <li>These are estimates, not guarantees. Weather, public holidays, courier delays and customs inspection can add days.</li>
        <li>Outside the UAE you are responsible for any import duty, tax or customs fee your country charges. They are not included in our prices. See the <Link href="/shipping" className="font-bold underline">Shipping Policy</Link>.</li>
        <li>Your exact estimated delivery date is shown at checkout before you pay.</li>
      </ul>
      <DeliveryTable rows={rows} />
    </div>
  );
}
