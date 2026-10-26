import type { Express, Request } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { hashPassword, requireAuth } from "../auth.js";
import { bookingView } from "../bookings.js";
import { busy } from "../busy.js";
import { returnPerks } from "../club.js";
import { barberView, findService, fromApp, HttpError, parse, reviewNewBarbers } from "../common.js";
import { config } from "../config.js";
import { db, newId, save } from "../db.js";
import { bookingCancelled, bookingCompleted, notify, waitlistOpened } from "../notify.js";
import { refund } from "../payments.js";
import { DEFAULT_BARBER_SHARE } from "../pro.js";
import { onCompleted } from "../rewards.js";
import { getShop, shopCurrency, shopTimeZone } from "../shops.js";
import { zonedTime } from "../slots.js";
import type { Barber, Booking, Shop, ShopRole } from "../types.js";

const DAY = 86_400_000;
const ACTIVE = new Set<Booking["status"]>(["confirmed", "on_the_way", "completed"]);
const Day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const RANK: Record<ShopRole, number> = { front_desk: 0, manager: 1, owner: 2 };
export const shopRole = (u: { shopRole?: ShopRole }): ShopRole => u.shopRole ?? "owner";

/**
 * The barbershop the signed-in person runs. Owners of several branches pick one with the X-Shop header.
 * `need` is the least role allowed: front desk < manager < owner.
 */
export function myShop(req: Request, need: ShopRole = "front_desk"): Shop {
  const user = req.user!;
  if (!user.manages) throw new HttpError(403, "Only barbershop owners and managers can open the shop panel.");
  if (RANK[shopRole(user)] < RANK[need]) throw new HttpError(403, need === "owner" ? "Only the shop's owner can do this." : "Ask your manager — front desk accounts can't change this.");
  const wanted = req.header("x-shop");
  const mine = [user.manages, ...(user.branches ?? [])];
  return getShop(wanted && mine.includes(wanted) ? wanted : user.manages);
}

/** Everyone on the shop's team, including barbers switched off or waiting for approval. */
export const teamOf = (shop: Shop) => db.barbers.filter((b) => b.shopId === shop.id);

function teamBarber(shop: Shop, id: string) {
  const b = teamOf(shop).find((x) => x.id === id);
  if (!b) throw new HttpError(404, "That barber isn't on your team.");
  return b;
}

function shopBooking(shop: Shop, id: string) {
  const team = new Set(teamOf(shop).map((b) => b.id));
  const b = db.bookings.find((x) => x.id === id && team.has(x.barberId));
  if (!b) throw new HttpError(404, "Booking not found.");
  return b;
}

const localDate = (iso: string | number, tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(iso));
const today = (shop: Shop) => localDate(Date.now(), shopTimeZone(shop));
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const dayStart = (shop: Shop, date: string) => zonedTime(date, 0, 0, shopTimeZone(shop)).getTime();

/** Is the barber free from start to end? Bookings, blocked time and private hires all count; `ignore` skips a booking being moved. */
function isFree(barberId: string, start: number, end: number, ignore?: string) {
  return !busy().some((x) => x.barberId === barberId && x.status !== "cancelled" && (x as { id?: string }).id !== ignore && start < Date.parse(x.endsAt) && end > Date.parse(x.startsAt));
}

const isWorking = (b: Barber, date: string) => !b.offline && b.workingDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay()) && !b.timeOff?.includes(date);

export function calendarBooking(b: Booking) {
  const v = bookingView(b);
  return {
    id: b.id, barberId: b.barberId, startsAt: b.startsAt, endsAt: b.endsAt, status: b.status, noShow: !!b.noShow,
    source: b.source ?? "app", client: v.customerName, phone: b.guest?.phone || b.phone || "",
    service: `${v.service?.name ?? "Appointment"}${v.extras.length ? ` + ${v.extras.map((x) => x.name.toLowerCase()).join(", ")}` : ""}`, durationMin: Math.round((Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000),
    amount: b.amount, currency: b.currency, paid: fromApp(b) ? "app" : "at the shop", locationType: b.locationType, address: b.address, notes: b.notes,
  };
}

function memberView(b: Barber, date: string) {
  const user = db.users.find((u) => u.role === "barber" && u.barberId === b.id);
  return {
    ...barberView(b),
    status: b.status ?? "live", offline: !!b.offline, email: user?.email ?? null, sharePercent: b.sharePercent ?? null,
    hours: { workingDays: b.workingDays, openHour: b.openHour, closeHour: b.closeHour, timeOff: b.timeOff ?? [] },
    workingToday: isWorking(b, date),
  };
}

/** Today, this week (Monday to Sunday) or this month in the shop's time zone: local dates and UTC bounds. */
export function periodRange(shop: Shop, period: "today" | "week" | "month") {
  const now = today(shop);
  const first = period === "today" ? now : period === "week" ? addDays(now, -((new Date(`${now}T12:00:00Z`).getUTCDay() + 6) % 7)) : `${now.slice(0, 8)}01`;
  const end = period === "today" ? now : period === "week" ? addDays(first, 6) : addDays(`${addDays(`${now.slice(0, 8)}28`, 4).slice(0, 8)}01`, -1);
  const days = Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${first}T12:00:00Z`)) / DAY) + 1;
  return { now, first, end, days, from: dayStart(shop, first), to: dayStart(shop, addDays(end, 1)) };
}

/** Same name → same service: a menu change keeps ids (and so the bookings that use them). */
const nameKey = (s: string) => s.trim().toLowerCase();

const ServiceInput = z.object({
  name: z.string().trim().min(2, "Give every service a name").max(60), durationMin: z.number().int().min(10).max(480), price: z.number().int().min(0).max(100_000_000),
  category: z.enum(["hair", "beard", "face", "colour", "kids", "packages", "extras"]).optional(), description: z.string().trim().max(200).optional(),
});

/**
 * The shop panel: a barbershop's owner or manager runs the shop's day — the calendar of every barber,
 * walk-ins and phone bookings, breaks and blocked time, hours and days off, services and prices, and reports.
 * Everything here changes what customers can book in the app.
 */
export function registerManageRoutes(app: Express) {
  app.get("/manage", requireAuth, (req, res) => {
    const shop = myShop(req);
    const date = today(shop);
    res.json({
      shop: {
        id: shop.id, name: shop.name, address: shop.address, city: shop.city, phone: shop.phone, about: shop.about, photoUrl: shop.photoUrl,
        timeZone: shopTimeZone(shop), currency: shopCurrency(shop), workingDays: shop.workingDays, openHour: shop.openHour, closeHour: shop.closeHour,
        barberSharePercent: shop.barberSharePercent ?? DEFAULT_BARBER_SHARE,
      },
      role: shopRole(req.user!),
      branches: [req.user!.manages!, ...(req.user!.branches ?? [])].map((id) => getShop(id)).map((s) => ({ id: s.id, name: s.name, city: s.city })),
      links: { page: `${config.appUrl}/barbershop/${shop.id}`, queue: `${config.appUrl}/barbershop/${shop.id}/queue` },
      today: date,
      team: teamOf(shop).map((b) => memberView(b, date)),
    });
  });

  // One day: every barber's bookings, blocked time and the shop's hours.
  app.get("/manage/calendar", requireAuth, (req, res) => {
    const shop = myShop(req);
    const date = parse(z.object({ date: Day.optional() }), req.query).date ?? today(shop);
    const from = dayStart(shop, date);
    const to = dayStart(shop, addDays(date, 1));
    const team = teamOf(shop);
    const ids = new Set(team.map((b) => b.id));
    const within = (x: { startsAt: string; endsAt: string }) => Date.parse(x.startsAt) < to && Date.parse(x.endsAt) > from;
    const bookings = db.bookings.filter((b) => ids.has(b.barberId) && b.status !== "pending_payment" && within(b)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const hires = db.hires.filter((h) => h.shopId === shop.id && h.status !== "cancelled" && h.status !== "pending_payment" && within(h));
    const active = bookings.filter((b) => b.status !== "cancelled");
    res.json({
      date, timeZone: shopTimeZone(shop), currency: shopCurrency(shop),
      openHour: Math.min(shop.openHour, ...team.map((b) => b.openHour)), closeHour: Math.max(shop.closeHour, ...team.map((b) => b.closeHour)),
      barbers: team.map((b) => ({ ...memberView(b, date), working: isWorking(b, date), dayOff: !!b.timeOff?.includes(date) })),
      bookings: bookings.map(calendarBooking),
      blocks: db.blocks.filter((k) => ids.has(k.barberId) && within(k)),
      hires: hires.map((h) => ({ id: h.id, startsAt: h.startsAt, endsAt: h.endsAt, occasion: h.occasion, guests: h.guests })),
      summary: {
        bookings: active.length,
        done: active.filter((b) => b.status === "completed").length,
        walkIns: active.filter((b) => !fromApp(b)).length,
        cancelled: bookings.filter((b) => b.status === "cancelled" && !b.noShow).length,
        noShows: bookings.filter((b) => b.noShow).length,
        takings: active.reduce((s, b) => s + b.amount, 0),
      },
    });
  });

  // A walk-in or a phone booking, added by the shop. Paid at the shop; the app won't offer that time to anyone else.
  app.post("/manage/bookings", requireAuth, (req, res) => {
    const shop = myShop(req);
    const body = parse(z.object({
      barberId: z.string(), serviceId: z.string(), startsAt: z.string().datetime(),
      name: z.string().trim().min(1, "Add the client's name").max(60), phone: z.string().trim().max(30).default(""), notes: z.string().trim().max(500).default(""),
    }), req.body);
    const barber = teamBarber(shop, body.barberId);
    const service = findService(barber, body.serviceId);
    if (!service || service.id === "consultation") throw new HttpError(404, "Pick one of this barber's services.");
    const start = Date.parse(body.startsAt);
    const end = start + service.durationMin * 60_000;
    if (end < Date.now() - 60 * 60_000) throw new HttpError(400, "That time has already passed.");
    if (!isFree(barber.id, start, end)) throw new HttpError(409, `${barber.name.split(" ")[0]} is busy then — pick another time or barber.`);
    const booking: Booking = {
      id: newId(), customerId: req.user!.id, barberId: barber.id, serviceId: service.id,
      startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), locationType: "shop", address: shop.address,
      notes: body.notes, amount: service.price, currency: shopCurrency(shop), status: "confirmed", reviewed: true,
      remindedDay: true, remindedHour: true, guest: { name: body.name, phone: body.phone }, source: "shop", createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    const barberUser = db.users.find((u) => u.role === "barber" && u.barberId === barber.id);
    if (barberUser) {
      const when = new Intl.DateTimeFormat("en-GB", { timeZone: shopTimeZone(shop), weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(start));
      notify(barberUser.id, { kind: "new_booking", title: "New booking from the shop", body: `${body.name}: ${service.name}, ${when}.`, bookingId: booking.id });
    }
    save();
    res.status(201).json(calendarBooking(booking));
  });

  // Done, no-show or cancel.
  app.post("/manage/bookings/:id", requireAuth, async (req, res) => {
    const shop = myShop(req);
    const { action, reason } = parse(z.object({ action: z.enum(["done", "no_show", "cancel"]), reason: z.string().trim().max(300).default("") }), req.body);
    const b = shopBooking(shop, String(req.params.id));
    if (b.status === "cancelled") throw new HttpError(400, "This booking is already cancelled.");
    const app = fromApp(b);
    if (action === "done") {
      if (b.status === "completed") throw new HttpError(400, "Already marked done.");
      b.status = "completed";
      if (app) {
        bookingCompleted(b);
        onCompleted(b);
      }
    } else if (action === "no_show") {
      if (Date.parse(b.startsAt) > Date.now()) throw new HttpError(400, "You can mark a no-show once the appointment time has started.");
      if (b.status === "completed") throw new HttpError(400, "This one is already done.");
      b.status = "cancelled";
      b.noShow = true; // no refund: the client didn't come
      if (app) notify(b.customerId, { kind: "cancelled", title: "Marked as no-show", body: `${shop.name} marked your appointment as missed. Contact support if this is a mistake.`, bookingId: b.id });
    } else {
      if (b.status === "completed") throw new HttpError(400, "A finished booking can't be cancelled.");
      if (app && b.paymentIntentId) await refund(b.paymentIntentId);
      b.status = "cancelled";
      if (app) {
        returnPerks(b);
        bookingCancelled(b, true, req.user!.id);
        if (reason) notify(b.customerId, { kind: "cancelled", title: `Message from ${shop.name}`, body: reason, bookingId: b.id });
        waitlistOpened(b);
      }
    }
    save();
    res.json(calendarBooking(b));
  });

  // Move a booking to another time or another barber on the team.
  app.post("/manage/bookings/:id/move", requireAuth, (req, res) => {
    const shop = myShop(req);
    const body = parse(z.object({ barberId: z.string(), startsAt: z.string().datetime() }), req.body);
    const b = shopBooking(shop, String(req.params.id));
    if (b.status === "cancelled" || b.status === "completed") throw new HttpError(400, "Only upcoming bookings can be moved.");
    const from = teamBarber(shop, b.barberId);
    const to = teamBarber(shop, body.barberId);
    const service = findService(from, b.serviceId);
    const target = to.id === from.id ? service : to.services.find((s) => service && nameKey(s.name) === nameKey(service.name));
    if (!target) throw new HttpError(400, `${to.name.split(" ")[0]} doesn't offer ${service?.name ?? "this service"}. Add it in Services first.`);
    const start = Date.parse(body.startsAt);
    const extraMin = Math.max(0, (Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000 - (service?.durationMin ?? 0)); // extras keep their time
    const end = start + (target.durationMin + extraMin) * 60_000;
    if (!isFree(to.id, start, end, b.id)) throw new HttpError(409, `${to.name.split(" ")[0]} is busy then.`);
    Object.assign(b, { barberId: to.id, serviceId: target.id, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), remindedDay: !fromApp(b), remindedHour: !fromApp(b) });
    if (fromApp(b)) {
      const when = new Intl.DateTimeFormat("en-GB", { timeZone: shopTimeZone(shop), weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(start));
      notify(b.customerId, { kind: "booking_confirmed", title: "Your booking moved", body: `${shop.name} moved your ${target.name.toLowerCase()} to ${when} (${shop.city} time) with ${to.name}.`, bookingId: b.id });
    }
    save();
    res.json(calendarBooking(b));
  });

  // Breaks, training, a barber off for the afternoon: blocked time can't be booked in the app.
  app.post("/manage/blocks", requireAuth, (req, res) => {
    const shop = myShop(req);
    const body = parse(z.object({ barberIds: z.array(z.string()).min(1, "Pick at least one barber"), startsAt: z.string().datetime(), endsAt: z.string().datetime(), reason: z.string().trim().max(80).default("Blocked") }), req.body);
    const start = Date.parse(body.startsAt);
    const end = Date.parse(body.endsAt);
    if (end - start < 10 * 60_000) throw new HttpError(400, "Block at least 10 minutes.");
    if (end - start > 14 * DAY) throw new HttpError(400, "For longer than two weeks, use days off instead.");
    const created = body.barberIds.map((id) => {
      teamBarber(shop, id);
      const block = { id: newId(), shopId: shop.id, barberId: id, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), reason: body.reason || "Blocked", createdAt: new Date().toISOString() };
      db.blocks.push(block);
      return block;
    });
    save();
    res.status(201).json(created);
  });

  app.delete("/manage/blocks/:id", requireAuth, (req, res) => {
    const shop = myShop(req);
    const block = db.blocks.find((k) => k.id === req.params.id && k.shopId === shop.id);
    if (!block) throw new HttpError(404, "Not found.");
    db.blocks = db.blocks.filter((k) => k !== block);
    save();
    res.status(204).end();
  });

  // A barber's week: working days, hours, days off, and whether the app takes bookings for them.
  app.patch("/manage/barbers/:id", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const b = teamBarber(shop, String(req.params.id));
    const body = parse(z.object({
      workingDays: z.array(z.number().int().min(0).max(6)).min(1, "Pick at least one working day").max(7).optional(),
      openHour: z.number().int().min(0).max(23).optional(),
      closeHour: z.number().int().min(1).max(24).optional(),
      timeOff: z.array(Day).max(120).optional(),
      offline: z.boolean().optional(),
      sharePercent: z.number().int().min(0).max(100).nullable().optional(), // null = the shop's default
    }), req.body);
    if ((body.closeHour ?? b.closeHour) - (body.openHour ?? b.openHour) < 1) throw new HttpError(400, "Closing time must be after opening time.");
    if (body.sharePercent !== undefined && shopRole(req.user!) !== "owner") throw new HttpError(403, "Only the shop's owner can change the money split.");
    if (body.sharePercent === null) delete b.sharePercent;
    else if (body.sharePercent !== undefined) b.sharePercent = body.sharePercent;
    if (body.workingDays) b.workingDays = [...new Set(body.workingDays)].sort();
    if (body.openHour !== undefined) b.openHour = body.openHour;
    if (body.closeHour !== undefined) b.closeHour = body.closeHour;
    if (body.timeOff) b.timeOff = [...new Set(body.timeOff)].sort();
    if (body.offline !== undefined) b.offline = body.offline;
    save();
    res.json(memberView(b, today(shop)));
  });

  // Services, times and prices for the whole team, or for chosen barbers.
  app.put("/manage/services", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const body = parse(z.object({ services: z.array(ServiceInput).min(1, "Keep at least one service").max(40), barberIds: z.array(z.string()).optional() }), req.body);
    const names = body.services.map((s) => nameKey(s.name));
    if (new Set(names).size !== names.length) throw new HttpError(400, "Two services have the same name.");
    const targets = body.barberIds?.length ? body.barberIds.map((id) => teamBarber(shop, id)) : teamOf(shop);
    for (const b of targets) {
      for (const old of b.services) {
        if (names.includes(nameKey(old.name))) continue;
        const booked = db.bookings.some((k) => k.barberId === b.id && k.serviceId === old.id && ["confirmed", "on_the_way"].includes(k.status) && Date.parse(k.endsAt) > Date.now());
        if (booked) throw new HttpError(409, `${b.name.split(" ")[0]} has upcoming bookings for "${old.name}" — keep it until they're done.`);
      }
    }
    for (const b of targets) {
      b.services = body.services.map((s) => {
        const old = b.services.find((o) => nameKey(o.name) === nameKey(s.name));
        return { id: old?.id ?? `${b.id}-${newId().slice(0, 8)}`, name: s.name, durationMin: s.durationMin, price: s.price, category: s.category ?? old?.category, description: s.description ?? old?.description };
      });
    }
    save();
    res.json(teamOf(shop).map((b) => memberView(b, today(shop))));
  });

  // Add a barber to the team: their app account is created, with a first password to hand over.
  app.post("/manage/barbers", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const body = parse(z.object({ name: z.string().trim().min(2).max(60), email: z.string().trim().toLowerCase().email() }), req.body);
    if (db.users.some((u) => u.email === body.email)) throw new HttpError(409, "There's already an account with that email.");
    const team = teamOf(shop);
    const id = newId();
    const template = team[0]?.services ?? [{ id: "", name: "Classic haircut", durationMin: 30, price: 8000 }];
    const barber: Barber = {
      id, name: body.name, bio: "", photoUrl: "", countryCode: shop.countryCode, city: shop.city, shopAddress: shop.address, shopId: shop.id,
      lat: shop.lat, lng: shop.lng, specialties: [], services: template.map((s) => ({ ...s, id: `${id}-${newId().slice(0, 8)}` })),
      offersHomeVisits: false, homeVisitFee: 0, yearsExperience: 0, languages: [], gallery: [], transformations: [],
      workingDays: [...shop.workingDays], openHour: shop.openHour, closeHour: shop.closeHour, ratingSum: 0, ratingCount: 0,
      status: reviewNewBarbers() ? "pending" : "live", joinedAt: new Date().toISOString(),
    };
    db.barbers.push(barber);
    const password = randomBytes(6).toString("base64url");
    db.users.push({ id: newId(), name: body.name, email: body.email, passwordHash: hashPassword(password), role: "barber", barberId: id, countryCode: shop.countryCode, city: shop.city, createdAt: new Date().toISOString() });
    save();
    res.status(201).json({ barber: memberView(barber, today(shop)), login: { email: body.email, password } });
  });

  // How the shop is doing — today, this week (Monday to Sunday) or this month, including what's already booked.
  app.get("/manage/reports", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const { period } = parse(z.object({ period: z.enum(["today", "week", "month"]).default("week") }), req.query);
    const { now, first, end, days, from, to } = periodRange(shop, period);
    const team = teamOf(shop);
    const inRange = db.bookings.filter((b) => team.some((t) => t.id === b.barberId) && b.status !== "pending_payment" && Date.parse(b.startsAt) >= from && Date.parse(b.startsAt) < to);
    const active = inRange.filter((b) => ACTIVE.has(b.status));
    const dates = Array.from({ length: days }, (_, i) => addDays(first, i));
    const byBarber = team.map((t) => {
      const mine = active.filter((b) => b.barberId === t.id);
      const bookedMin = mine.reduce((m, b) => m + (Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000, 0);
      const workMin = dates.filter((d) => isWorking(t, d)).length * (t.closeHour - t.openHour) * 60;
      return {
        id: t.id, name: t.name, photoUrl: t.photoUrl, bookings: mine.length, completed: mine.filter((b) => b.status === "completed").length,
        walkIns: mine.filter((b) => !fromApp(b)).length, noShows: inRange.filter((b) => b.barberId === t.id && b.noShow).length,
        takings: mine.reduce((s, b) => s + b.amount, 0), busyPercent: workMin ? Math.min(100, Math.round((bookedMin / workMin) * 100)) : 0,
      };
    }).sort((a, b) => b.takings - a.takings);
    const services = new Map<string, number>();
    for (const b of active) {
      const name = findService(team.find((t) => t.id === b.barberId)!, b.serviceId)?.name ?? "Other";
      services.set(name, (services.get(name) ?? 0) + 1);
    }
    res.json({
      period, from: first, to: end, today: now, currency: shopCurrency(shop),
      totals: {
        bookings: active.length, completed: active.filter((b) => b.status === "completed").length,
        fromApp: active.filter(fromApp).length, walkIns: active.filter((b) => !fromApp(b)).length,
        noShows: inRange.filter((b) => b.noShow).length, cancelled: inRange.filter((b) => b.status === "cancelled" && !b.noShow).length,
        takings: active.reduce((s, b) => s + b.amount, 0), appTakings: active.filter(fromApp).reduce((s, b) => s + b.amount, 0),
      },
      byBarber,
      topServices: [...services].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6),
      perDay: dates.map((d) => ({ date: d, count: active.filter((b) => localDate(b.startsAt, shopTimeZone(shop)) === d).length })),
    });
  });

  // The shop's own details and opening hours.
  app.patch("/manage/settings", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const body = parse(z.object({
      about: z.string().trim().max(400).optional(), phone: z.string().trim().max(30).optional(),
      workingDays: z.array(z.number().int().min(0).max(6)).min(1).max(7).optional(),
      openHour: z.number().int().min(0).max(23).optional(), closeHour: z.number().int().min(1).max(24).optional(),
      barberSharePercent: z.number().int().min(0).max(100).optional(),
    }), req.body);
    if ((body.closeHour ?? shop.closeHour) - (body.openHour ?? shop.openHour) < 1) throw new HttpError(400, "Closing time must be after opening time.");
    if (body.barberSharePercent !== undefined && shopRole(req.user!) !== "owner") throw new HttpError(403, "Only the shop's owner can change the money split.");
    db.shopSettings[shop.id] = { ...db.shopSettings[shop.id], ...body };
    save();
    const s = getShop(shop.id);
    res.json({ about: s.about, phone: s.phone, workingDays: s.workingDays, openHour: s.openHour, closeHour: s.closeHour, barberSharePercent: s.barberSharePercent ?? DEFAULT_BARBER_SHARE });
  });
}
