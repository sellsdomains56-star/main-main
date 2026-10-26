import { randomInt } from "node:crypto";
import { busy } from "./busy.js";
import { cityOf, findCountry, findService, getBarber, isLive } from "./common.js";
import { config } from "./config.js";
import { db, save } from "./db.js";
import { notify } from "./notify.js";
import { availableSlots } from "./slots.js";
import type { Booking, User } from "./types.js";

/** What a referral or birthday is worth, in minor units of the person's currency. */
const GIFT: Record<string, { referral: number; birthday: number }> = {
  aed: { referral: 2500, birthday: 2000 },
  eur: { referral: 1000, birthday: 500 },
  gbp: { referral: 1000, birthday: 500 },
  usd: { referral: 1000, birthday: 500 },
};
export const giftFor = (currency: string) => GIFT[currency] ?? GIFT.eur!;
export const currencyOf = (u: User) => (u.countryCode && findCountry(u.countryCode)?.currency) || "aed";

const credit = (u: User, currency: string, amount: number) => {
  u.credit = { ...u.credit, [currency]: (u.credit?.[currency] ?? 0) + amount };
};

const CODE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
/** A person's own invite code, made the first time they ask for it. */
export function referralCode(u: User) {
  if (!u.referralCode) {
    let code = "";
    do code = `FRESH-${Array.from({ length: 5 }, () => CODE[randomInt(CODE.length)]).join("")}`;
    while (db.users.some((x) => x.referralCode === code));
    u.referralCode = code;
    save();
  }
  return u.referralCode;
}

/** After a cut: the invite reward (first completed booking) and the next "time for a fresh cut" reminder. */
export function onCompleted(b: Booking) {
  const customer = db.users.find((u) => u.id === b.customerId);
  if (!customer || customer.deletedAt) return;
  if (customer.referredBy && !customer.referralRewarded) {
    const friend = db.users.find((u) => u.id === customer.referredBy && !u.deletedAt);
    customer.referralRewarded = true;
    const cur = b.currency;
    const amount = giftFor(cur).referral;
    credit(customer, cur, amount);
    notify(customer.id, { kind: "gift", title: "Your welcome credit is in", body: "Thanks for your first cut with JB. Your invite credit is ready for the next one." });
    if (friend) {
      credit(friend, cur, amount);
      notify(friend.id, { kind: "gift", title: `${customer.name.split(" ")[0]} had their first cut`, body: "You both got credit for your next booking. Thanks for spreading the word." });
    }
  }
  if (customer.rebook && customer.rebook.barberId === b.barberId) {
    customer.rebook.nextAt = new Date(Date.parse(b.startsAt) + (customer.rebook.everyWeeks * 7 - 2) * 86_400_000).toISOString();
  }
  save();
}

/** Runs every minute: "time for your next cut" reminders and birthday treats. */
export function runPerks(now = new Date()) {
  let changed = false;
  for (const u of db.users) {
    if (u.deletedAt) continue;
    // Time for the next cut: offer the soonest free time with their barber.
    if (u.rebook && Date.parse(u.rebook.nextAt) <= now.getTime()) {
      const r = u.rebook;
      r.nextAt = new Date(now.getTime() + r.everyWeeks * 7 * 86_400_000).toISOString();
      changed = true;
      const hasUpcoming = db.bookings.some((b) => b.customerId === u.id && ["confirmed", "pending_payment"].includes(b.status) && Date.parse(b.startsAt) > now.getTime());
      const barber = db.barbers.find((b) => b.id === r.barberId);
      if (hasUpcoming || !barber || !isLive(barber)) continue;
      const service = findService(barber, r.serviceId) ?? barber.services[0];
      if (!service) continue;
      const tz = cityOf(barber).timeZone;
      let next: string | undefined;
      for (let i = 0; i < 10 && !next; i++) {
        const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(now.getTime() + i * 86_400_000));
        next = availableSlots(barber, tz, date, service.durationMin, busy(), now)[0];
      }
      const when = next ? new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(next)) : null;
      notify(u.id, { kind: "reminder", title: "Time for a fresh cut", body: when ? `It's been ${r.everyWeeks} weeks. ${barber.name.split(" ")[0]} is free ${when} — tap to book your usual.` : `It's been ${r.everyWeeks} weeks. Book your next ${service.name.toLowerCase()} with ${barber.name.split(" ")[0]}.` });
    }
    // Birthday: a little credit, once a year.
    if (u.birthday && u.birthdayGiftYear !== now.getUTCFullYear()) {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", month: "2-digit", day: "2-digit" }).format(now);
      if (today === u.birthday) {
        u.birthdayGiftYear = now.getUTCFullYear();
        const cur = currencyOf(u);
        credit(u, cur, giftFor(cur).birthday);
        notify(u.id, { kind: "gift", title: `Happy birthday, ${u.name.split(" ")[0]}`, body: "A birthday treat from JB is in your account. Use it on your next cut or our products." });
        changed = true;
      }
    }
  }
  if (changed) save();
}

export function startPerksLoop() {
  if (process.env.NODE_ENV === "test") return;
  runPerks();
  setInterval(() => runPerks(), 60_000);
}

/** The read-only view a friend sees through "share my visit". */
export function visitView(b: Booking) {
  const barber = getBarber(b.barberId);
  const tz = cityOf(barber).timeZone;
  const customer = db.users.find((u) => u.id === b.customerId);
  return {
    barber: { name: barber.name, photoUrl: barber.photoUrl, verified: !!barber.verified, phoneSafety: "999" },
    customerFirstName: (b.guest?.name ?? customer?.name ?? "").split(" ")[0],
    status: b.status === "confirmed" && Date.parse(b.endsAt) < Date.now() ? "completed" : b.status,
    startsAt: b.startsAt, endsAt: b.endsAt, timeZone: tz,
    service: findService(barber, b.serviceId)?.name ?? "Appointment",
    area: b.locationType === "home" ? (b.address.split(",").slice(-2).join(",").trim() || barber.city) : barber.shopAddress,
    venue: b.venue?.kind ?? null,
    appUrl: config.appUrl,
  };
}
