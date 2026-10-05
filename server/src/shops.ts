import { busy } from "./busy.js";
import { barberView, findCountry, HttpError } from "./common.js";
import { db } from "./db.js";
import { PRODUCTS, SHIPPING } from "./products.js";
import { SHOPS } from "./seed.js";
import { availableSlots, zonedTime } from "./slots.js";
import type { Barber, Shop } from "./types.js";

export const HIRE_NOTICE_HOURS = 24; // private hire needs a day's notice so the shop can clear the books

export function getShop(id: string): Shop {
  const shop = SHOPS.find((s) => s.id === id);
  if (!shop) throw new HttpError(404, "Barbershop not found.");
  return shop;
}

export const shopTimeZone = (shop: Shop) => findCountry(shop.countryCode)!.cities.find((c) => c.name === shop.city)!.timeZone;
export const shopCurrency = (shop: Shop) => findCountry(shop.countryCode)!.currency;
export const shopTeam = (shop: Shop): Barber[] => db.barbers.filter((b) => b.shopId === shop.id);

/** Services as one menu for "any barber": grouped by name, priced from the cheapest barber. */
export function shopMenu(shop: Shop) {
  const menu = new Map<string, { key: string; name: string; durationMin: number; fromPrice: number; barbers: number }>();
  for (const b of shopTeam(shop)) {
    for (const s of b.services) {
      const key = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const item = menu.get(key);
      if (!item) menu.set(key, { key, name: s.name, durationMin: s.durationMin, fromPrice: s.price, barbers: 1 });
      else {
        item.fromPrice = Math.min(item.fromPrice, s.price);
        item.durationMin = Math.max(item.durationMin, s.durationMin);
        item.barbers += 1;
      }
    }
  }
  return [...menu.values()].sort((a, b) => a.fromPrice - b.fromPrice);
}

/** The service a barber offers under a menu key. */
const serviceFor = (b: Barber, key: string) => b.services.find((s) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === key);

/** Start times when at least one barber in the shop is free for this service. */
export function shopSlots(shop: Shop, date: string, key: string, now = new Date()): string[] {
  const tz = shopTimeZone(shop);
  const taken = busy();
  const all = new Set<string>();
  for (const b of shopTeam(shop)) {
    const s = serviceFor(b, key);
    if (s) for (const slot of availableSlots(b, tz, date, s.durationMin, taken, now)) all.add(slot);
  }
  return [...all].sort();
}

/** The best-rated barber who is free at `startsAt` for this service, with their version of it. */
export function pickBarber(shop: Shop, key: string, startsAt: string) {
  const tz = shopTimeZone(shop);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(startsAt));
  const iso = new Date(startsAt).toISOString();
  const taken = busy();
  const free = shopTeam(shop)
    .map((b) => ({ barber: b, service: serviceFor(b, key) }))
    .filter((x) => x.service && availableSlots(x.barber, tz, date, x.service.durationMin, taken).includes(iso))
    .sort((x, y) => y.barber.ratingSum / (y.barber.ratingCount || 1) - x.barber.ratingSum / (x.barber.ratingCount || 1));
  return free[0] as { barber: Barber; service: NonNullable<ReturnType<typeof serviceFor>> } | undefined;
}

/** Start times (on the hour) when the whole shop is free for `hours`: no bookings for anyone on the team, no other hire. */
export function hireSlots(shop: Shop, date: string, hours: number, now = new Date()): string[] {
  if (!shop.privateHire) return [];
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (!shop.workingDays.includes(weekday)) return [];
  const tz = shopTimeZone(shop);
  const team = new Set(shopTeam(shop).map((b) => b.id));
  const blocked = [
    ...db.bookings.filter((b) => team.has(b.barberId) && b.status !== "cancelled"),
    ...db.hires.filter((h) => h.shopId === shop.id && h.status !== "cancelled"),
  ].map((x) => [Date.parse(x.startsAt), Date.parse(x.endsAt)] as const);
  const slots: string[] = [];
  for (let h = shop.openHour; h + hours <= shop.closeHour; h++) {
    const start = zonedTime(date, h, 0, tz).getTime();
    const end = start + hours * 3_600_000;
    if (start < now.getTime() + HIRE_NOTICE_HOURS * 3_600_000) continue;
    if (blocked.some(([s, e]) => start < e && end > s)) continue;
    slots.push(new Date(start).toISOString());
  }
  return slots;
}

function productsFor(shop: Shop) {
  const currency = shopCurrency(shop);
  return PRODUCTS.filter((p) => shop.productIds.includes(p.id)).map((p) => ({
    id: p.id, name: p.name, category: p.category, emoji: p.emoji, description: p.description, price: p.prices[currency] ?? p.prices.eur, currency,
  }));
}

/** List entry. */
export function shopSummary(shop: Shop) {
  const team = shopTeam(shop);
  const ratingCount = team.reduce((n, b) => n + b.ratingCount, 0);
  const ratingSum = team.reduce((n, b) => n + b.ratingSum, 0);
  const menu = shopMenu(shop);
  return {
    id: shop.id,
    name: shop.name,
    about: shop.about,
    photoUrl: shop.photoUrl,
    countryCode: shop.countryCode,
    city: shop.city,
    address: shop.address,
    lat: shop.lat,
    lng: shop.lng,
    currency: shopCurrency(shop),
    rating: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
    ratingCount,
    teamSize: team.length,
    startingPrice: menu.length ? menu[0].fromPrice : null,
    offersPrivateHire: !!shop.privateHire,
    offersDelivery: !!shop.delivery && shop.productIds.length > 0,
  };
}

/** Shop page. */
export function shopDetail(shop: Shop) {
  return {
    ...shopSummary(shop),
    phone: shop.phone,
    timeZone: shopTimeZone(shop),
    workingDays: shop.workingDays,
    openHour: shop.openHour,
    closeHour: shop.closeHour,
    menu: shopMenu(shop).map(({ barbers: _b, ...m }) => m),
    team: shopTeam(shop).map(barberView),
    privateHire: shop.privateHire,
    delivery: shop.delivery,
    products: productsFor(shop),
  };
}

/** Delivery fee for a subtotal, using the shop's terms (falls back to the country's shipping table). */
export function deliveryFee(shop: Shop, subtotal: number) {
  const d = shop.delivery ?? { fee: SHIPPING[shopCurrency(shop)]?.fee ?? 0, freeFrom: Infinity };
  return subtotal >= d.freeFrom ? 0 : d.fee;
}
