import type { Express } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { bookingView, placeBooking } from "../bookings.js";
import { HttpError, parse } from "../common.js";
import { config } from "../config.js";
import { db, newId, save } from "../db.js";
import { hireCancelled, hireConfirmed } from "../notify.js";
import { clientSecretFor, createPaymentIntent, demoPayments, paymentSucceeded, refund } from "../payments.js";
import { SHOPS } from "../seed.js";
import { getShop, hireSlots, pickBarber, shopCurrency, shopDetail, shopSlots, shopSummary, shopTimeZone } from "../shops.js";
import type { Hire, User } from "../types.js";

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function hireView(h: Hire) {
  const shop = getShop(h.shopId);
  const customer = db.users.find((u) => u.id === h.customerId);
  return {
    ...h,
    status: h.status === "confirmed" && Date.parse(h.endsAt) < Date.now() ? "completed" : h.status,
    paymentIntentId: undefined,
    shop: { id: shop.id, name: shop.name, address: shop.address, city: shop.city, photoUrl: shop.photoUrl, timeZone: shopTimeZone(shop) },
    customerName: customer?.name ?? "Customer",
  };
}

/** The customer who made it, or anyone who works at the shop. */
function canSeeHire(user: User, h: Hire) {
  if (h.customerId === user.id) return true;
  const barber = user.role === "barber" && user.barberId ? db.barbers.find((b) => b.id === user.barberId) : undefined;
  return !!barber && barber.shopId === h.shopId;
}

export function registerShopRoutes(app: Express) {
  app.get("/shops", (req, res) => {
    const q = parse(z.object({ country: z.string().optional(), city: z.string().optional() }), req.query);
    const list = SHOPS.filter((s) => (!q.country || s.countryCode === q.country) && (!q.city || s.city === q.city)).map(shopSummary);
    res.json(list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)));
  });

  app.get("/shops/:id", (req, res) => {
    res.json(shopDetail(getShop(String(req.params.id))));
  });

  // "Any barber": times when someone in the shop is free for this service.
  app.get("/shops/:id/availability", (req, res) => {
    const shop = getShop(String(req.params.id));
    const q = parse(z.object({ date: DATE, service: z.string() }), req.query);
    res.json({ timeZone: shopTimeZone(shop), slots: shopSlots(shop, q.date, q.service) });
  });

  app.post("/shops/:id/bookings", requireAuth, async (req, res) => {
    const shop = getShop(String(req.params.id));
    const body = parse(z.object({ service: z.string(), startsAt: z.string().datetime(), notes: z.string().max(1000).default("") }), req.body);
    const pick = pickBarber(shop, body.service, body.startsAt);
    if (!pick) throw new HttpError(409, "That time was just taken — please pick another slot.");
    const { booking, clientSecret } = await placeBooking(req.user!.id, {
      barberId: pick.barber.id, serviceId: pick.service.id, startsAt: body.startsAt, locationType: "shop", address: "", phone: "", notes: body.notes,
    });
    res.status(201).json({ booking: bookingView(booking), clientSecret, demoPayments });
  });

  // ---------- Private hire ----------
  app.get("/shops/:id/hire-availability", (req, res) => {
    const shop = getShop(String(req.params.id));
    const q = parse(z.object({ date: DATE, hours: z.coerce.number().int().min(1).max(12) }), req.query);
    res.json({ timeZone: shopTimeZone(shop), slots: hireSlots(shop, q.date, q.hours) });
  });

  app.post("/hires", requireAuth, async (req, res) => {
    const body = parse(
      z.object({
        shopId: z.string(),
        startsAt: z.string().datetime(),
        hours: z.number().int().min(1).max(12),
        guests: z.number().int().min(1).max(100),
        occasion: z.string().trim().max(80).default(""),
        notes: z.string().max(1000).default(""),
      }),
      req.body,
    );
    const shop = getShop(body.shopId);
    const terms = shop.privateHire;
    if (!terms) throw new HttpError(400, `${shop.name} doesn't do private hire.`);
    if (body.hours < terms.minHours || body.hours > terms.maxHours) throw new HttpError(400, `Private hire is ${terms.minHours}–${terms.maxHours} hours.`);
    if (body.guests > terms.maxGuests) throw new HttpError(400, `${shop.name} fits up to ${terms.maxGuests} guests.`);
    const start = new Date(body.startsAt);
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: shopTimeZone(shop) }).format(start);
    if (!hireSlots(shop, date, body.hours).includes(start.toISOString())) throw new HttpError(409, "The shop isn't free for that whole time — please pick another start.");
    const hire: Hire = {
      id: newId(), customerId: req.user!.id, shopId: shop.id,
      startsAt: start.toISOString(), endsAt: new Date(start.getTime() + body.hours * 3_600_000).toISOString(),
      hours: body.hours, guests: body.guests, occasion: body.occasion, notes: body.notes,
      amount: terms.pricePerHour * body.hours, currency: shopCurrency(shop), status: "pending_payment", createdAt: new Date().toISOString(),
    };
    const intent = await createPaymentIntent(`hire-${hire.id}`, hire.amount, hire.currency, {
      kind: "hire", hireId: hire.id, shopId: shop.id, platformFee: String(Math.round((hire.amount * config.platformFeePercent) / 100)),
    });
    hire.paymentIntentId = intent?.id;
    db.hires.push(hire);
    save();
    res.status(201).json({ hire: hireView(hire), clientSecret: intent?.clientSecret ?? null, demoPayments });
  });

  app.get("/hires", requireAuth, (req, res) => {
    const mine = db.hires.filter((h) => canSeeHire(req.user!, h));
    res.json(mine.sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map(hireView));
  });

  app.get("/hires/:id/payment", requireAuth, async (req, res) => {
    const hire = db.hires.find((h) => h.id === req.params.id && h.customerId === req.user!.id);
    if (!hire) throw new HttpError(404, "Booking not found.");
    const clientSecret = hire.status === "pending_payment" && hire.paymentIntentId ? await clientSecretFor(hire.paymentIntentId) : null;
    res.json({ hire: hireView(hire), clientSecret, demoPayments });
  });

  app.post("/hires/:id/confirm-payment", requireAuth, async (req, res) => {
    const hire = db.hires.find((h) => h.id === req.params.id && h.customerId === req.user!.id);
    if (!hire) throw new HttpError(404, "Booking not found.");
    if (hire.status === "pending_payment") {
      const paid = demoPayments || (hire.paymentIntentId ? await paymentSucceeded(hire.paymentIntentId) : false);
      if (!paid) throw new HttpError(402, "Payment hasn't gone through yet.");
      hire.status = "confirmed";
      hireConfirmed(hire);
      save();
    }
    res.json(hireView(hire));
  });

  app.post("/hires/:id/cancel", requireAuth, async (req, res) => {
    const hire = db.hires.find((h) => h.id === req.params.id && h.customerId === req.user!.id);
    if (!hire) throw new HttpError(404, "Booking not found.");
    if (hire.status === "completed" || hire.status === "cancelled") throw new HttpError(400, "This booking can't be cancelled.");
    if (Date.parse(hire.startsAt) <= Date.now()) throw new HttpError(400, "This private hire has already started.");
    const wasConfirmed = hire.status === "confirmed";
    if (wasConfirmed && hire.paymentIntentId) await refund(hire.paymentIntentId);
    hire.status = "cancelled";
    hireCancelled(hire, wasConfirmed);
    save();
    res.json(hireView(hire));
  });
}
