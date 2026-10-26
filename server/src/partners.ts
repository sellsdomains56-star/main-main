import { db } from "./db.js";
import type { Booking, Partner, User } from "./types.js";

/** The partner a booking counts for: the code the customer came with, or their company's email domain. */
export function partnerFor(code: string | undefined, customer: User | undefined): Partner | undefined {
  const active = db.partners.filter((p) => p.active);
  if (code) {
    const byCode = active.find((p) => p.code === code.toUpperCase());
    if (byCode) return byCode;
  }
  const domain = customer?.email.split("@")[1]?.toLowerCase();
  return domain ? active.find((p) => p.kind === "corporate" && p.emailDomain && p.emailDomain.toLowerCase() === domain) : undefined;
}

/** What JB owes a hotel for a booking made through its QR code (minor units). */
export function partnerCommission(b: Pick<Booking, "partnerId" | "amount">) {
  const p = b.partnerId ? db.partners.find((x) => x.id === b.partnerId) : undefined;
  return p && p.kind === "hotel" ? Math.round((b.amount * p.commissionPercent) / 100) : 0;
}
