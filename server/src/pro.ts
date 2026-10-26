import { cityOf } from "./common.js";
import { db } from "./db.js";
import type { Barber, Booking, Order, PriceRule } from "./types.js";

/** Local weekday and hour of an instant in the barber's city. */
function localDayHour(b: Barber, iso: string | number) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: cityOf(b).timeZone, weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday!), hour: Number(p.hour) };
}

const applies = (r: PriceRule | null | undefined, day: number, hour: number) => !!r && r.days.includes(day) && hour >= r.fromHour && hour < r.toHour;

/** The off-peak discount (< 0) or peak premium (> 0) in percent for a start time, or 0. */
export function priceRuleAt(b: Barber, iso: string | number) {
  const { day, hour } = localDayHour(b, iso);
  if (applies(b.offPeak, day, hour)) return -Math.abs(b.offPeak!.percent);
  if (applies(b.peak, day, hour)) return Math.abs(b.peak!.percent);
  return 0;
}

/** A service price with the rule applied, rounded to whole units of money. */
export const adjustedPrice = (price: number, percent: number) => (percent ? Math.max(0, Math.round((price * (100 + percent)) / 100 / 100) * 100) : price);

/** What a customer gets back if they cancel now: everything, or everything but the late fee. */
export function cancelTerms(b: Booking, now = Date.now()) {
  const barber = db.barbers.find((x) => x.id === b.barberId);
  const policy = barber?.cancelPolicy;
  const late = !!policy && policy.freeHours > 0 && policy.lateFeePercent > 0 && Date.parse(b.startsAt) - now < policy.freeHours * 3_600_000 && b.status === "confirmed";
  const fee = late ? Math.round((b.amount * policy!.lateFeePercent) / 100) : 0;
  return { freeUntil: policy?.freeHours ? new Date(Date.parse(b.startsAt) - policy.freeHours * 3_600_000).toISOString() : null, lateFeePercent: policy?.lateFeePercent ?? 0, fee };
}

export type Level = "new" | "rising" | "pro" | "elite";
export const LEVEL_LABEL: Record<Level, string> = { new: "New", rising: "Rising", pro: "Pro", elite: "Elite" };

/** Barber levels, from finished cuts and rating: Rising after 5, Pro after 25 at 4.5+, Elite after 60 at 4.8+. */
export function levelOf(b: Barber): Level {
  const done = db.bookings.filter((x) => x.barberId === b.id && x.status === "completed").length;
  const cuts = Math.max(done, b.ratingCount);
  const rating = b.ratingCount ? b.ratingSum / b.ratingCount : 0;
  if (cuts >= 60 && rating >= 4.8) return "elite";
  if (cuts >= 25 && rating >= 4.5) return "pro";
  if (cuts >= 5) return "rising";
  return "new";
}

/** A barbershop's cut of product sales it delivers. */
export const PRODUCT_COMMISSION_PERCENT = 15;
/** The barber's share of service takings when the shop hasn't set one. */
export const DEFAULT_BARBER_SHARE = 50;

/** In stock at a shop? Products nobody counted are always available. */
export const inStock = (shopId: string, productId: string) => (db.stock[shopId]?.[productId] ?? 1) > 0;

/** A paid delivery takes its products off the shop's shelf. */
export function takeStock(order: Order) {
  const shelf = order.shopId ? db.stock[order.shopId] : undefined;
  if (!shelf) return;
  for (const i of order.items) if (shelf[i.productId] !== undefined) shelf[i.productId] = Math.max(0, shelf[i.productId]! - i.quantity);
}
