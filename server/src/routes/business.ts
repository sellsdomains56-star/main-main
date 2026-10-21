import type { Express, Request } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { bookingView } from "../bookings.js";
import { barberView, cityOf, findCountry, getBarber, HttpError, parse, platformFee, platformFeePercent } from "../common.js";
import { db, newId, save } from "../db.js";
import { zonedTime } from "../slots.js";
import type { Barber, Booking } from "../types.js";

const PAID = new Set<Booking["status"]>(["confirmed", "on_the_way", "completed"]);

function myBarber(req: Request) {
  const user = req.user!;
  if (user.role !== "barber" || !user.barberId) throw new HttpError(403, "Only barbers can do this.");
  return getBarber(user.barberId);
}

/** What a barber still needs to do for a profile that gets booked. */
export function profileChecklist(b: Barber) {
  const reels = db.reels.filter((r) => r.barberId === b.id).length;
  return [
    { key: "photo", label: "Add a profile photo", done: !!b.photoUrl },
    { key: "bio", label: "Write a short bio", done: b.bio.trim().length >= 20 },
    { key: "services", label: "Set your services and prices", done: b.services.length >= 2 },
    { key: "work", label: "Show at least 3 photos or before-and-afters", done: b.gallery.length + b.transformations.length >= 3 },
    { key: "pin", label: "Put your exact pin on the map", done: !!b.pinSetAt || !b.joinedAt },
    { key: "reel", label: "Post your first reel", done: reels > 0 },
  ];
}

/** Totals of paid bookings (and tips) starting from `since`, before the platform fee and after it. */
function earnings(list: Booking[], since: number, until = Infinity) {
  const inRange = list.filter((b) => PAID.has(b.status) && Date.parse(b.startsAt) >= since && Date.parse(b.startsAt) < until);
  const gross = inRange.reduce((s, b) => s + b.amount, 0);
  const tips = inRange.reduce((s, b) => s + (b.tip ?? 0), 0);
  const fee = inRange.reduce((s, b) => s + platformFee(b.amount), 0);
  return { count: inRange.length, gross, fee, tips, net: gross - fee + tips };
}

/** Start of the local day, week (Monday) and month in a time zone, as UTC milliseconds. */
function localStarts(timeZone: string, now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(now).map((x) => [x.type, x.value]));
  const today = `${p.year}-${p.month}-${p.day}`;
  const sinceMonday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(p.weekday);
  const monday = new Date(Date.parse(`${today}T12:00:00Z`) - Math.max(0, sinceMonday) * 86_400_000).toISOString().slice(0, 10);
  return {
    today,
    day: zonedTime(today, 0, 0, timeZone).getTime(),
    week: zonedTime(monday, 0, 0, timeZone).getTime(),
    month: zonedTime(`${p.year}-${p.month}-01`, 0, 0, timeZone).getTime(),
  };
}

const ServiceInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Give every service a name").max(60),
  durationMin: z.number().int().min(10).max(480),
  price: z.number().int().min(0).max(100_000_000), // minor units
});

/** The barber's business side: dashboard numbers, services and prices. */
export function registerBusinessRoutes(app: Express) {
  app.get("/barbers/me/business", requireAuth, (req, res) => {
    const barber = myBarber(req);
    const tz = cityOf(barber).timeZone;
    const now = Date.now();
    const starts = localStarts(tz);
    const mine = db.bookings.filter((b) => b.barberId === barber.id);
    const active = mine.filter((b) => PAID.has(b.status));
    const today = active.filter((b) => Date.parse(b.startsAt) >= starts.day && Date.parse(b.startsAt) < starts.day + 86_400_000).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const upcoming = active.filter((b) => b.status !== "completed" && Date.parse(b.endsAt) > now).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    // Bookings per day for the next 7 days, for the week strip.
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    const days = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(now + i * 86_400_000)));
    const week = days.map((date) => ({
      date,
      count: upcoming.filter((b) => fmt.format(new Date(b.startsAt)) === date).length,
      working: barber.workingDays.includes(new Date(`${date}T12:00:00Z`).getUTCDay()) && !barber.timeOff?.includes(date),
    }));
    const reviews = db.reviews.filter((r) => r.barberId === barber.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3).map(({ customerId: _c, ...r }) => r);
    res.json({
      barber: barberView(barber),
      status: barber.status ?? "live",
      verified: !!barber.verified,
      currency: findCountry(barber.countryCode)!.currency,
      feePercent: platformFeePercent(),
      today: today.map(bookingView),
      next: upcoming[0] ? bookingView(upcoming[0]) : null,
      upcomingCount: upcoming.length,
      week,
      earnings: { today: earnings(mine, starts.day, starts.day + 86_400_000), week: earnings(mine, starts.week), month: earnings(mine, starts.month) },
      completedThisMonth: mine.filter((b) => b.status === "completed" && Date.parse(b.startsAt) >= starts.month).length,
      cancelledThisMonth: mine.filter((b) => b.status === "cancelled" && Date.parse(b.startsAt) >= starts.month).length,
      reviews,
      checklist: profileChecklist(barber),
      hours: { workingDays: barber.workingDays, openHour: barber.openHour, closeHour: barber.closeHour, timeOff: barber.timeOff ?? [] },
    });
  });

  // Replace the service list. Services with upcoming bookings can't be removed until those are done.
  app.put("/barbers/me/services", requireAuth, (req, res) => {
    const barber = myBarber(req);
    const { services } = parse(z.object({ services: z.array(ServiceInput).min(1, "Keep at least one service").max(25) }), req.body);
    const keep = new Set(services.map((s) => s.id).filter(Boolean));
    const now = Date.now();
    for (const old of barber.services) {
      if (keep.has(old.id)) continue;
      const booked = db.bookings.some((b) => b.barberId === barber.id && b.serviceId === old.id && PAID.has(b.status) && b.status !== "completed" && Date.parse(b.endsAt) > now);
      if (booked) throw new HttpError(409, `You have upcoming bookings for "${old.name}" — keep it until they're done.`);
    }
    barber.services = services.map((s) => ({ id: s.id && barber.services.some((o) => o.id === s.id) ? s.id : `${barber.id}-${newId().slice(0, 8)}`, name: s.name, durationMin: s.durationMin, price: s.price }));
    save();
    res.json(barberView(barber));
  });
}
