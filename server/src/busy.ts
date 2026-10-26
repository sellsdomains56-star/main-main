import { db } from "./db.js";
import type { Busy } from "./slots.js";

/**
 * Everything that holds barbers' time: their bookings, time their barbershop blocked, and every
 * private hire of their barbershop (the whole team works the party, so no one else can book them then).
 */
export function busy(): Busy[] {
  const hires = db.hires.filter((h) => h.status !== "cancelled");
  const blocks: Busy[] = db.blocks.map((b) => ({ barberId: b.barberId, status: "confirmed", startsAt: b.startsAt, endsAt: b.endsAt })); // time the shop blocked
  if (!hires.length && !blocks.length) return db.bookings;
  for (const h of hires) {
    for (const b of db.barbers) if (b.shopId === h.shopId) blocks.push({ barberId: b.id, status: "confirmed", startsAt: h.startsAt, endsAt: h.endsAt });
  }
  return [...db.bookings, ...blocks];
}
