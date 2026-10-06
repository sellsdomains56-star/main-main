import { randomInt } from "node:crypto";
import { CONSULTATION, findCountry } from "./common.js";
import { db, newId, save } from "./db.js";
import { notify } from "./notify.js";
import { SHIPPING } from "./products.js";
import type { Barber, Booking, GiftCard, Membership, PlanId, Purchase, Service, User } from "./types.js";

// ---------- The Club: monthly memberships ----------

const charm = (minor: number) => Math.max(99, Math.round(minor / 100) * 100 - 1);
const price = (eur: number): Record<string, number> => ({ eur, gbp: charm(eur * 0.86), usd: charm(eur * 1.1), aed: charm(eur * 4) });

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  prices: Record<string, number>; // per 30 days, minor units
  cutsPerPeriod: number | null; // null = unlimited
  productDiscount: number; // percent off JB's Fresh products
  freeHomeVisits: boolean;
  perks: string[];
}

export const PLANS: Plan[] = [
  {
    id: "fresh", name: "Fresh", tagline: "One cut a month, always on point.", prices: price(3900), cutsPerPeriod: 1, productDiscount: 10, freeHomeVisits: false,
    perks: ["1 service a month with any barber", "10% off JB's Fresh products", "Member card in the app"],
  },
  {
    id: "regular", name: "Regular", tagline: "Every two weeks. Never grown out.", prices: price(6900), cutsPerPeriod: 2, productDiscount: 15, freeHomeVisits: false,
    perks: ["2 services a month with any barber", "15% off JB's Fresh products", "Member card in the app"],
  },
  {
    id: "black", name: "Black", tagline: "Unlimited. At the shop or at your door.", prices: price(14900), cutsPerPeriod: null, productDiscount: 20, freeHomeVisits: true,
    perks: ["Unlimited services with any barber", "Home, hotel and yacht visits included", "20% off JB's Fresh products", "Black member card in the app"],
  },
];

export const PERIOD_DAYS = 30;

/** Currency for a country's Club prices and gift cards (falls back to euros). */
export function clubCurrency(countryCode?: string) {
  const c = (countryCode && findCountry(countryCode)?.currency) || "eur";
  return SHIPPING[c] ? c : "eur";
}

export const getPlan = (id: string) => PLANS.find((p) => p.id === id);

export function activeMembership(user?: User): (Membership & { plan: PlanId }) | null {
  const m = user?.membership;
  return m && Date.parse(m.paidUntil) > Date.now() ? m : null;
}

/** Club services used in the current 30-day period (counted from bookings, so cancellations give them back). */
export function cutsUsed(user: User) {
  const m = user.membership;
  if (!m) return 0;
  const end = Date.parse(m.paidUntil);
  const day = 86_400_000;
  const periods = Math.max(1, Math.ceil((end - Date.now()) / (PERIOD_DAYS * day)));
  const start = end - periods * PERIOD_DAYS * day;
  const windowStart = Math.max(start, Date.parse(m.since));
  return db.bookings.filter((b) => b.customerId === user.id && b.coveredBy === "membership" && b.status !== "cancelled" && Date.parse(b.createdAt) >= windowStart && Date.parse(b.createdAt) < windowStart + PERIOD_DAYS * day).length;
}

export function membershipView(user: User) {
  const m = user.membership;
  if (!m) return null;
  const plan = getPlan(m.plan)!;
  const active = Date.parse(m.paidUntil) > Date.now();
  return {
    plan: plan.id,
    name: plan.name,
    number: m.number,
    since: m.since,
    paidUntil: m.paidUntil,
    active,
    cutsLeft: plan.cutsPerPeriod === null ? null : Math.max(0, plan.cutsPerPeriod - cutsUsed(user)),
    productDiscount: plan.productDiscount,
    freeHomeVisits: plan.freeHomeVisits,
    perks: plan.perks,
  };
}

/** What the Club covers on a booking: the service (if the plan has a cut left) and/or the home-visit fee. */
export function clubCoverage(user: User | undefined, service: Service, locationType: Booking["locationType"]) {
  const m = activeMembership(user);
  if (!m || service.id === CONSULTATION.id) return { service: false, homeFee: false };
  const plan = getPlan(m.plan)!;
  const hasCut = plan.cutsPerPeriod === null || cutsUsed(user!) < plan.cutsPerPeriod;
  return { service: hasCut, homeFee: plan.freeHomeVisits && locationType === "home" };
}

/** Prices a booking for this customer: Club coverage first, then gift-card credit. Doesn't change anything. */
export function priceBooking(user: User | undefined, barber: Barber, service: Service, locationType: Booking["locationType"], currency: string) {
  const cover = clubCoverage(user, service, locationType);
  const serviceAmount = cover.service ? 0 : service.price;
  const homeFee = locationType === "home" && !cover.homeFee ? barber.homeVisitFee : 0;
  const due = serviceAmount + homeFee;
  const credit = Math.min(user?.credit?.[currency] ?? 0, due);
  return { covered: cover.service, homeFeeCovered: cover.homeFee, creditUsed: credit, amount: due - credit };
}

/** Commits what priceBooking worked out: marks the Club cut and takes the credit. */
export function applyPerks(user: User, booking: Booking, covered: boolean, creditUsed: number) {
  if (covered) booking.coveredBy = "membership";
  if (creditUsed > 0) {
    booking.creditUsed = creditUsed;
    user.credit = { ...user.credit, [booking.currency]: (user.credit?.[booking.currency] ?? 0) - creditUsed };
  }
}

/** A cancelled booking gives back its gift-card credit (its Club cut comes back by itself — see cutsUsed). */
export function returnPerks(booking: Booking) {
  const user = db.users.find((u) => u.id === booking.customerId);
  if (!user) return;
  if (booking.creditUsed) {
    user.credit = { ...user.credit, [booking.currency]: (user.credit?.[booking.currency] ?? 0) + booking.creditUsed };
  }
}

// ---------- Gift cards ----------

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O or 1/I
const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
export const newGiftCode = () => `JBF-${block()}-${block()}`;
export const memberNumber = () => `JB-${String(randomInt(10000)).padStart(4, "0")}-${String(randomInt(1000)).padStart(3, "0")}`;

export const GIFT_AMOUNTS: Record<string, number[]> = {
  eur: [5000, 10000, 15000, 25000],
  gbp: [5000, 10000, 15000, 25000],
  usd: [5000, 10000, 15000, 25000],
  aed: [20000, 40000, 60000, 100000],
};

export const giftView = (g: GiftCard, viewerId?: string) => ({
  id: g.id,
  // The code is only shown to the buyer once paid (and never in lists for anyone else).
  code: g.status !== "pending_payment" && g.buyerId === viewerId ? g.code : null,
  amount: g.amount,
  currency: g.currency,
  toName: g.toName,
  toEmail: g.toEmail,
  message: g.message,
  design: g.design,
  status: g.status,
  createdAt: g.createdAt,
});

// ---------- Purchases: what happens once one is paid ----------

export function fulfil(p: Purchase) {
  if (p.status === "paid") return;
  p.status = "paid";
  const user = db.users.find((u) => u.id === p.userId);
  if (p.kind === "membership" && user) {
    const plan = getPlan(p.ref)!;
    const now = Date.now();
    const current = user.membership;
    // Renewing early extends from the current end date; a new or lapsed membership starts today.
    const start = current && Date.parse(current.paidUntil) > now && current.plan === plan.id ? Date.parse(current.paidUntil) : now;
    user.membership = {
      plan: plan.id,
      number: current?.number ?? memberNumber(),
      currency: p.currency,
      // A lapsed membership starts a fresh period count.
      since: current && Date.parse(current.paidUntil) > now ? current.since : new Date(now).toISOString(),
      paidUntil: new Date(start + PERIOD_DAYS * 86_400_000).toISOString(),
    };
    notify(user.id, { kind: "club", title: `Welcome to The Club — ${plan.name}`, body: `Your member card is in Account → The Club. ${plan.perks[0]}.` });
  }
  if (p.kind === "gift") {
    const g = db.giftCards.find((x) => x.id === p.ref);
    if (g && g.status === "pending_payment") {
      g.status = "active";
      notify(p.userId, { kind: "gift", title: "Your gift card is ready", body: `Send ${g.toName} the code ${g.code}. They redeem it in Account → Gift cards.` });
    }
  }
  if (p.kind === "tip") {
    const b = db.bookings.find((x) => x.id === p.ref);
    if (b) {
      b.tip = (b.tip ?? 0) + p.amount;
      const barberUser = db.users.find((u) => u.role === "barber" && u.barberId === b.barberId);
      const customer = db.users.find((u) => u.id === b.customerId);
      if (barberUser) notify(barberUser.id, { kind: "tip", title: "You got a tip", body: `${customer?.name.split(" ")[0] ?? "A customer"} left you a tip. Thank you for the great cut.`, bookingId: b.id });
    }
  }
  save();
}

export function newPurchase(userId: string, kind: Purchase["kind"], ref: string, label: string, amount: number, currency: string): Purchase {
  const p: Purchase = { id: newId(), userId, kind, ref, label, amount, currency, status: "pending_payment", createdAt: new Date().toISOString() };
  db.purchases.push(p);
  return p;
}
