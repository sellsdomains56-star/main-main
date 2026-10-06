import type { Express } from "express";
import { z } from "zod";
import { publicUser, requireAuth } from "../auth.js";
import { clubCurrency, fulfil, GIFT_AMOUNTS, giftView, getPlan, membershipView, newGiftCode, newPurchase, PLANS } from "../club.js";
import { cityOf, getBarber, HttpError, parse } from "../common.js";
import { db, newId, save } from "../db.js";
import { notify } from "../notify.js";
import { clientSecretFor, createPaymentIntent, demoPayments, paymentSucceeded } from "../payments.js";
import type { Purchase } from "../types.js";

const purchaseView = (p: Purchase) => ({ ...p, paymentIntentId: undefined });

async function startPayment(p: Purchase) {
  const intent = await createPaymentIntent(`${p.kind}-${p.id}`, p.amount, p.currency, { kind: p.kind, purchaseId: p.id, ref: p.ref });
  p.paymentIntentId = intent?.id;
  save();
  return { purchase: purchaseView(p), clientSecret: intent?.clientSecret ?? null, demoPayments };
}

/** The Club (memberships), gift cards, tips, "My chair" preferences, cut notes and the waitlist. */
export function registerClubRoutes(app: Express) {
  // ---------- The Club ----------
  app.get("/club/plans", (req, res) => {
    const { country } = parse(z.object({ country: z.string().optional() }), req.query);
    const currency = clubCurrency(country);
    res.json({ currency, plans: PLANS.map(({ prices, ...p }) => ({ ...p, price: prices[currency] })) });
  });

  app.get("/club/me", requireAuth, (req, res) => {
    res.json({ membership: membershipView(req.user!), credit: req.user!.credit ?? {} });
  });

  app.post("/club/join", requireAuth, async (req, res) => {
    const body = parse(z.object({ plan: z.enum(["fresh", "regular", "black"]), countryCode: z.string().length(2).optional() }), req.body);
    const plan = getPlan(body.plan)!;
    const currency = req.user!.membership?.currency ?? clubCurrency(body.countryCode ?? req.user!.countryCode);
    const p = newPurchase(req.user!.id, "membership", plan.id, `The Club — ${plan.name}, 30 days`, plan.prices[currency], currency);
    res.status(201).json(await startPayment(p));
  });

  // ---------- Gift cards ----------
  app.get("/gifts/amounts", (req, res) => {
    const { country } = parse(z.object({ country: z.string().optional() }), req.query);
    const currency = clubCurrency(country);
    res.json({ currency, amounts: GIFT_AMOUNTS[currency] });
  });

  app.post("/gifts", requireAuth, async (req, res) => {
    const body = parse(
      z.object({
        amount: z.number().int().positive(),
        countryCode: z.string().length(2).optional(),
        toName: z.string().trim().min(1, "Who is it for?").max(60),
        toEmail: z.string().trim().toLowerCase().email("Enter their email so we can send it"),
        message: z.string().trim().max(300).default(""),
        design: z.enum(["noir", "ivory"]).default("noir"),
      }),
      req.body,
    );
    const currency = clubCurrency(body.countryCode ?? req.user!.countryCode);
    if (!GIFT_AMOUNTS[currency].includes(body.amount)) throw new HttpError(400, "Pick one of the gift card amounts.");
    const g = {
      id: newId(), code: newGiftCode(), amount: body.amount, currency, buyerId: req.user!.id, toName: body.toName, toEmail: body.toEmail,
      message: body.message, design: body.design, status: "pending_payment" as const, createdAt: new Date().toISOString(),
    };
    db.giftCards.push(g);
    const p = newPurchase(req.user!.id, "gift", g.id, `Gift card for ${g.toName}`, g.amount, currency);
    res.status(201).json({ ...(await startPayment(p)), gift: giftView(g, req.user!.id) });
  });

  app.get("/gifts", requireAuth, (req, res) => {
    const me = req.user!.id;
    res.json(db.giftCards.filter((g) => g.buyerId === me && g.status !== "pending_payment").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((g) => giftView(g, me)));
  });

  app.post("/gifts/redeem", requireAuth, (req, res) => {
    const { code } = parse(z.object({ code: z.string().trim().toUpperCase() }), req.body);
    const g = db.giftCards.find((x) => x.code === code.replace(/\s+/g, ""));
    if (!g || g.status === "pending_payment") throw new HttpError(404, "That code isn't valid. Check it and try again.");
    if (g.status === "redeemed") throw new HttpError(409, "This gift card has already been used.");
    const user = req.user!;
    g.status = "redeemed";
    g.redeemedBy = user.id;
    user.credit = { ...user.credit, [g.currency]: (user.credit?.[g.currency] ?? 0) + g.amount };
    save();
    if (g.buyerId !== user.id) notify(g.buyerId, { kind: "gift", title: "Your gift was redeemed", body: `${g.toName} added your gift card to their account.` });
    res.json({ credit: user.credit, amount: g.amount, currency: g.currency });
  });

  // ---------- Purchases (Club, gifts, tips) ----------
  app.get("/purchases/:id/payment", requireAuth, async (req, res) => {
    const p = db.purchases.find((x) => x.id === req.params.id && x.userId === req.user!.id);
    if (!p) throw new HttpError(404, "Payment not found.");
    const clientSecret = p.status === "pending_payment" && p.paymentIntentId ? await clientSecretFor(p.paymentIntentId) : null;
    res.json({ purchase: purchaseView(p), clientSecret, demoPayments });
  });

  app.post("/purchases/:id/confirm-payment", requireAuth, async (req, res) => {
    const p = db.purchases.find((x) => x.id === req.params.id && x.userId === req.user!.id);
    if (!p) throw new HttpError(404, "Payment not found.");
    if (p.status === "pending_payment") {
      const paid = demoPayments || (p.paymentIntentId ? await paymentSucceeded(p.paymentIntentId) : false);
      if (!paid) throw new HttpError(402, "Payment hasn't gone through yet.");
      fulfil(p);
    }
    const gift = p.kind === "gift" ? db.giftCards.find((g) => g.id === p.ref) : undefined;
    res.json({ purchase: purchaseView(p), gift: gift ? giftView(gift, req.user!.id) : null, membership: membershipView(req.user!) });
  });

  // ---------- Tips ----------
  app.post("/bookings/:id/tip", requireAuth, async (req, res) => {
    const { amount } = parse(z.object({ amount: z.number().int().positive().max(100_000) }), req.body);
    const b = db.bookings.find((x) => x.id === req.params.id && x.customerId === req.user!.id);
    if (!b) throw new HttpError(404, "Booking not found.");
    if (b.status !== "completed") throw new HttpError(400, "You can tip once the appointment is done.");
    const p = newPurchase(req.user!.id, "tip", b.id, `Tip for ${getBarber(b.barberId).name}`, amount, b.currency);
    res.status(201).json(await startPayment(p));
  });

  // ---------- "My chair" preferences ----------
  app.patch("/me/preferences", requireAuth, (req, res) => {
    const body = parse(
      z.object({
        conversation: z.enum(["quiet", "chatty", "either"]).optional(),
        drink: z.string().trim().max(40).optional(),
        music: z.string().trim().max(60).optional(),
        fragrance: z.enum(["none", "light", "classic"]).optional(),
        allergies: z.string().trim().max(200).optional(),
        standingCut: z.string().trim().max(300).optional(),
      }),
      req.body,
    );
    req.user!.preferences = { ...req.user!.preferences, ...body };
    save();
    res.json(publicUser(req.user!));
  });

  // ---------- Cut notes: the barber's record for next time ----------
  app.post("/bookings/:id/notes", requireAuth, (req, res) => {
    const { cutNotes } = parse(z.object({ cutNotes: z.string().trim().max(500) }), req.body);
    const b = db.bookings.find((x) => x.id === req.params.id);
    if (!b || req.user!.role !== "barber" || b.barberId !== req.user!.barberId) throw new HttpError(404, "Booking not found.");
    b.cutNotes = cutNotes;
    save();
    res.json({ ok: true, cutNotes });
  });

  // ---------- Waitlist ----------
  app.post("/waitlist", requireAuth, (req, res) => {
    const body = parse(z.object({ barberId: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }), req.body);
    const barber = getBarber(body.barberId);
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: cityOf(barber).timeZone }).format(new Date());
    if (body.date < today) throw new HttpError(400, "That day has passed.");
    let entry = db.waitlist.find((w) => w.userId === req.user!.id && w.barberId === barber.id && w.date === body.date && !w.notified);
    if (!entry) {
      entry = { id: newId(), userId: req.user!.id, barberId: barber.id, date: body.date, notified: false, createdAt: new Date().toISOString() };
      db.waitlist.push(entry);
      save();
    }
    res.status(201).json(entry);
  });

  app.get("/waitlist", requireAuth, (req, res) => {
    res.json(db.waitlist.filter((w) => w.userId === req.user!.id && !w.notified).map((w) => ({ ...w, barberName: getBarber(w.barberId).name })));
  });

  app.delete("/waitlist/:id", requireAuth, (req, res) => {
    db.waitlist = db.waitlist.filter((w) => !(w.id === req.params.id && w.userId === req.user!.id));
    save();
    res.status(204).end();
  });
}
