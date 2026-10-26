import { randomBytes } from "node:crypto";
import type { Express } from "express";
import { z } from "zod";
import { publicUser, requireAuth } from "../auth.js";
import { bookingView } from "../bookings.js";
import { busy } from "../busy.js";
import { barberView, cityOf, findService, getBarber, HttpError, isLive, parse } from "../common.js";
import { config } from "../config.js";
import { db, save } from "../db.js";
import { notify } from "../notify.js";
import { currencyOf, giftFor, referralCode, visitView } from "../rewards.js";
import { availableSlots } from "../slots.js";
import type { Booking } from "../types.js";

const MediaPath = z.string().regex(/^\/(uploads|media)\/[\w./-]+$/, "Upload the image first");

/** Customer extras: change a booking's time, favourites, your usual, your cuts, rebook reminders, invites, share my visit, review replies. */
export function registerCustomerRoutes(app: Express) {
  // Change the time (same barber, service and extras), up to an hour before.
  app.post("/bookings/:id/reschedule", requireAuth, (req, res) => {
    const { startsAt } = parse(z.object({ startsAt: z.string().datetime() }), req.body);
    const b = db.bookings.find((x) => x.id === req.params.id && x.customerId === req.user!.id);
    if (!b) throw new HttpError(404, "Booking not found.");
    if (!["confirmed", "pending_payment"].includes(b.status)) throw new HttpError(400, "Only upcoming bookings can be moved.");
    if (Date.parse(b.startsAt) - Date.now() < 60 * 60_000) throw new HttpError(400, "It's less than an hour away — message your barber, or cancel.");
    const barber = getBarber(b.barberId);
    const tz = cityOf(barber).timeZone;
    const minutes = (Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000;
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(startsAt));
    const others = busy().filter((x) => (x as Booking).id !== b.id);
    if (!availableSlots(barber, tz, date, minutes, others).includes(new Date(startsAt).toISOString())) throw new HttpError(409, "That time was just taken — please pick another.");
    const was = b.startsAt;
    b.startsAt = new Date(startsAt).toISOString();
    b.endsAt = new Date(Date.parse(startsAt) + minutes * 60_000).toISOString();
    b.remindedDay = Date.parse(b.startsAt) - Date.now() < 24 * 3_600_000;
    b.remindedHour = false;
    const fmt = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
    const barberUser = db.users.find((u) => u.role === "barber" && u.barberId === barber.id);
    if (barberUser && b.status === "confirmed") {
      notify(barberUser.id, { kind: "new_booking", title: "Booking moved", body: `${b.guest?.name ?? req.user!.name} moved ${findService(barber, b.serviceId)?.name ?? "their booking"} from ${fmt(was)} to ${fmt(b.startsAt)}.`, bookingId: b.id });
    }
    save();
    res.json(bookingView(b));
  });

  // Favourite barbers.
  app.post("/barbers/:id/favourite", requireAuth, (req, res) => {
    const barber = getBarber(String(req.params.id));
    const u = req.user!;
    const list = new Set(u.favourites ?? []);
    if (list.has(barber.id)) list.delete(barber.id);
    else list.add(barber.id);
    u.favourites = [...list];
    save();
    res.json({ favourite: list.has(barber.id), favourites: u.favourites });
  });
  app.get("/me/favourites", requireAuth, (req, res) => {
    res.json((req.user!.favourites ?? []).map((id) => db.barbers.find((b) => b.id === id)).filter((b) => !!b && isLive(b)).map((b) => barberView(b!)));
  });

  // "Your usual": the last service with the last barber, ready to book again.
  app.get("/me/usual", requireAuth, (req, res) => {
    const last = db.bookings
      .filter((b) => b.customerId === req.user!.id && ["completed", "confirmed", "on_the_way"].includes(b.status) && b.serviceId !== "consultation" && b.source !== "shop")
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
    if (!last) return res.json(null);
    const barber = db.barbers.find((b) => b.id === last.barberId);
    const service = barber && findService(barber, last.serviceId);
    if (!barber || !service || !isLive(barber)) return res.json(null);
    res.json({ barber: barberView(barber), service, extras: (last.extras ?? []).filter((id) => barber.services.some((s) => s.id === id)), locationType: last.locationType === "home" ? "home" : "shop", lastAt: last.startsAt });
  });

  // Your cuts: every finished cut with the barber's notes and photos.
  app.get("/me/cuts", requireAuth, (req, res) => {
    res.json(db.bookings
      .filter((b) => b.customerId === req.user!.id && b.status === "completed" && b.serviceId !== "consultation")
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
      .map((b) => ({ ...bookingView(b), cutPhotos: b.cutPhotos ?? [] })));
  });
  app.post("/bookings/:id/cut-photo", requireAuth, (req, res) => {
    const { url } = parse(z.object({ url: MediaPath }), req.body);
    const b = db.bookings.find((x) => x.id === req.params.id);
    if (!b || req.user!.role !== "barber" || b.barberId !== req.user!.barberId) throw new HttpError(404, "Booking not found.");
    b.cutPhotos = [...(b.cutPhotos ?? []), url].slice(-4);
    save();
    res.json({ cutPhotos: b.cutPhotos });
  });

  // "Remind me to rebook every N weeks" with this barber (null switches it off).
  app.patch("/me/rebook", requireAuth, (req, res) => {
    const body = parse(z.object({ everyWeeks: z.number().int().min(2).max(10).nullable(), barberId: z.string().optional(), serviceId: z.string().optional() }), req.body);
    const u = req.user!;
    if (body.everyWeeks === null) delete u.rebook;
    else {
      const barberId = body.barberId ?? u.rebook?.barberId;
      if (!barberId) throw new HttpError(400, "Pick a barber.");
      const barber = getBarber(barberId);
      const serviceId = body.serviceId ?? u.rebook?.serviceId ?? barber.services[0]!.id;
      const last = db.bookings.filter((b) => b.customerId === u.id && b.barberId === barberId && b.status !== "cancelled").sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
      const from = last ? Date.parse(last.startsAt) : Date.now();
      u.rebook = { barberId, serviceId, everyWeeks: body.everyWeeks, nextAt: new Date(Math.max(Date.now() + 86_400_000, from + (body.everyWeeks * 7 - 2) * 86_400_000)).toISOString() };
    }
    save();
    res.json(publicUser(u));
  });

  // Invite a friend: both get credit after their first cut.
  app.get("/me/referral", requireAuth, (req, res) => {
    const u = req.user!;
    const cur = currencyOf(u);
    const invited = db.users.filter((x) => x.referredBy === u.id);
    res.json({ code: referralCode(u), currency: cur, amount: giftFor(cur).referral, invited: invited.length, rewarded: invited.filter((x) => x.referralRewarded).length, link: `${config.appUrl}/login?invite=${referralCode(u)}` });
  });

  // Share my visit: a read-only link for a friend (barber, time, status) — for home, hotel and yacht visits.
  app.post("/bookings/:id/share", requireAuth, (req, res) => {
    const b = db.bookings.find((x) => x.id === req.params.id && x.customerId === req.user!.id);
    if (!b) throw new HttpError(404, "Booking not found.");
    b.shareToken ??= randomBytes(12).toString("base64url");
    save();
    res.json({ token: b.shareToken, url: `${config.appUrl}/visit/${b.shareToken}` });
  });
  app.get("/visits/:token", (req, res) => {
    const b = db.bookings.find((x) => x.shareToken && x.shareToken === req.params.token);
    if (!b) throw new HttpError(404, "This link isn't valid any more.");
    res.json(visitView(b));
  });

  // Every review of the barber, newest first, to answer them.
  app.get("/business/reviews", requireAuth, (req, res) => {
    if (req.user!.role !== "barber" || !req.user!.barberId) throw new HttpError(403, "Only barbers can do this.");
    res.json(db.reviews.filter((r) => r.barberId === req.user!.barberId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(({ customerId, ...r }) => ({ ...r, customerName: db.users.find((u) => u.id === customerId)?.name.split(" ")[0] ?? "Client" })));
  });

  // The barber answers a review (once; they can edit it).
  app.post("/reviews/:id/reply", requireAuth, (req, res) => {
    const { text } = parse(z.object({ text: z.string().trim().min(2, "Write a reply").max(500) }), req.body);
    const r = db.reviews.find((x) => x.id === req.params.id);
    if (!r || req.user!.role !== "barber" || r.barberId !== req.user!.barberId) throw new HttpError(404, "Review not found.");
    const first = !r.reply;
    r.reply = { text, at: new Date().toISOString() };
    if (first) notify(r.customerId, { kind: "account", title: `${getBarber(r.barberId).name.split(" ")[0]} replied to your review`, body: text.slice(0, 160), bookingId: r.bookingId });
    save();
    const { customerId: _c, ...view } = r;
    res.json(view);
  });
}
