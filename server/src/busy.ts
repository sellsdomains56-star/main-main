import { db } from "./db.js";
import type { Busy } from "./slots.js";

/**
 * Everything that holds barbers' time: their bookings, plus every private hire of their
 * barbershop (the whole team works the party, so no one else can book them then).
 */
export function busy(): Busy[] {
  const hires = db.hires.filter((h) => h.status !== "cancelled");
  if (!hires.length) return db.bookings;
  const blocks: Busy[] = [];
  for (const h of hires) {
    for (const b of db.barbers) if (b.shopId === h.shopId) blocks.push({ barberId: b.id, status: "confirmed", startsAt: h.startsAt, endsAt: h.endsAt });
  }
  return [...db.bookings, ...blocks];
}
