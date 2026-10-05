import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { z } from "zod";
import { mkdirSync, writeFileSync } from "node:fs";
import { createSession, hashPassword, optionalAuth, publicUser, requireAuth, verifyPassword } from "./auth.js";
import { config } from "./config.js";
import { db, newId, save, UPLOADS_DIR } from "./db.js";
import { clientSecretFor, createPaymentIntent, demoPayments, paymentSucceeded, refund, stripe } from "./payments.js";
import { PRODUCTS, SHIPPING } from "./products.js";
import { COUNTRIES } from "./seed.js";
import { allSpecialties, searchBarbers } from "./search.js";
import { registerAssistantRoutes } from "./routes/assistant.js";
import { registerPortfolioRoutes } from "./routes/portfolio.js";
import { registerSupportRoutes } from "./routes/support.js";
import { registerTryOnRoutes } from "./routes/tryon.js";
import { barberView, cityOf, CONSULTATION, findCountry, findService, getBarber, HttpError, parse } from "./common.js";
import { availableSlots } from "./slots.js";
import { upsertSocialUser, verifyIdentityToken } from "./social.js";
import { adviseHaircut, StylistUnavailableError } from "./stylist.js";
import type { Barber, Booking, Order, Product, Reel } from "./types.js";

function bookingView(b: Booking) {
  const barber = getBarber(b.barberId);
  const customer = db.users.find((u) => u.id === b.customerId);
  return {
    ...b,
    paymentIntentId: undefined,
    barber: { id: barber.id, name: barber.name, photoUrl: barber.photoUrl, city: barber.city, timeZone: cityOf(barber).timeZone },
    customerName: customer?.name ?? "Customer",
    service: findService(barber, b.serviceId) ?? (b.serviceId === CONSULTATION.id ? CONSULTATION : undefined),
    // Video consultations: the barber's Google Meet link, once the booking is confirmed.
    videoLink: b.locationType === "video" && ["confirmed", "on_the_way"].includes(b.status) ? barber.videoLink ?? null : null,
  };
}

function reelView(r: Reel, viewerId?: string) {
  const b = getBarber(r.barberId);
  const v = barberView(b);
  return {
    id: r.id,
    videoUrl: r.videoUrl,
    posterUrl: r.posterUrl ?? null,
    caption: r.caption,
    likes: r.likedBy.length,
    likedByMe: !!viewerId && r.likedBy.includes(viewerId),
    createdAt: r.createdAt,
    barber: { id: v.id, name: v.name, photoUrl: v.photoUrl, city: v.city, rating: v.rating, ratingCount: v.ratingCount, startingPrice: v.startingPrice, currency: v.currency, offersHomeVisits: v.offersHomeVisits },
  };
}

function canAccess(userId: string, booking: Booking) {
  const user = db.users.find((u) => u.id === userId);
  return booking.customerId === userId || (user?.role === "barber" && user.barberId === booking.barberId);
}

export function createApp() {
  const app = express();
  const origins = config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((o) => o.trim());
  app.use(cors({ origin: origins }));

  // Stripe webhook needs the raw body for signature verification, so it is registered before express.json().
  app.post("/webhooks/stripe", express.raw({ type: "application/json" }), (req, res) => {
    if (!stripe || !config.stripeWebhookSecret) {
      res.status(400).send("Stripe webhooks not configured");
      return;
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, req.header("stripe-signature") ?? "", config.stripeWebhookSecret);
    } catch {
      res.status(400).send("Invalid signature");
      return;
    }
    if (event.type === "payment_intent.succeeded") {
      const booking = db.bookings.find((b) => b.paymentIntentId === event.data.object.id);
      if (booking && booking.status === "pending_payment") booking.status = "confirmed";
      const order = db.orders.find((o) => o.paymentIntentId === event.data.object.id);
      if (order && order.status === "pending_payment") order.status = "paid";
      save();
    }
    res.json({ received: true });
  });

  // Reel uploads arrive as a raw video body, so this route also sits before express.json().
  app.post("/reels", requireAuth, express.raw({ type: ["video/*", "application/octet-stream"], limit: "100mb" }), (req, res) => {
    const user = req.user!;
    if (user.role !== "barber" || !user.barberId) throw new HttpError(403, "Only barbers can post reels.");
    if (!Buffer.isBuffer(req.body) || req.body.length < 1000) throw new HttpError(400, "Please attach a video.");
    const type = req.header("content-type") ?? "";
    const ext = type.includes("quicktime") ? "mov" : type.includes("webm") ? "webm" : "mp4";
    const id = newId();
    mkdirSync(UPLOADS_DIR, { recursive: true });
    writeFileSync(new URL(`${id}.${ext}`, UPLOADS_DIR), req.body);
    const caption = String(req.query.caption ?? "").slice(0, 300);
    const reel: Reel = { id, barberId: user.barberId, videoUrl: `/uploads/${id}.${ext}`, caption, likedBy: [], createdAt: new Date().toISOString() };
    db.reels.push(reel);
    save();
    res.status(201).json(reelView(reel, user.id));
  });

  app.use("/media", express.static(new URL("../media", import.meta.url).pathname, { maxAge: "7d" }));
  app.use("/uploads", express.static(UPLOADS_DIR.pathname, { maxAge: "7d" }));
  app.use(express.json({ limit: "12mb" })); // head photos arrive as base64

  app.get("/health", (_req, res) => {
    res.json({
      ok: true, demoPayments, aiStylist: config.anthropicConfigured, assistant: config.anthropicConfigured, tryOn: config.openaiConfigured,
      appleSignIn: config.appleAudiences.length > 0, googleSignIn: config.googleClientIds.length > 0,
    });
  });

  // ---------- Locations ----------
  app.get("/locations", (_req, res) => {
    res.json(
      COUNTRIES.map((c) => ({
        code: c.code,
        name: c.name,
        currency: c.currency,
        cities: c.cities.map((city) => ({
          name: city.name,
          barberCount: db.barbers.filter((b) => b.countryCode === c.code && b.city === city.name).length,
        })),
      })),
    );
  });

  // ---------- Auth ----------
  const Register = z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    countryCode: z.string().length(2).optional(),
    city: z.string().optional(),
  });

  app.post("/auth/register", (req, res) => {
    const body = parse(Register, req.body);
    if (db.users.some((u) => u.email === body.email)) throw new HttpError(409, "An account with this email already exists.");
    const user = { id: newId(), role: "customer" as const, passwordHash: hashPassword(body.password), ...body };
    delete (user as { password?: string }).password;
    db.users.push(user);
    save();
    res.status(201).json({ token: createSession(user.id), user: publicUser(user) });
  });

  app.post("/auth/login", (req, res) => {
    const body = parse(z.object({ email: z.string().trim().toLowerCase(), password: z.string() }), req.body);
    const user = db.users.find((u) => u.email === body.email);
    if (!user || !verifyPassword(body.password, user.passwordHash)) throw new HttpError(401, "Wrong email or password.");
    res.json({ token: createSession(user.id), user: publicUser(user) });
  });

  // Sign in with Apple / Google: the app sends the identity token it got from the provider.
  app.post(["/auth/apple", "/auth/google"], async (req, res) => {
    const provider = req.path.endsWith("/apple") ? "apple" : "google";
    const body = parse(z.object({ idToken: z.string().min(20), name: z.string().max(100).optional() }), req.body);
    let identity;
    try {
      identity = await verifyIdentityToken(provider, body.idToken, provider === "apple" ? config.appleAudiences : config.googleClientIds);
    } catch (err) {
      throw new HttpError(401, `${provider === "apple" ? "Apple" : "Google"} sign-in failed: ${(err as Error).message}`);
    }
    let user;
    try {
      user = upsertSocialUser(identity, body.name);
    } catch (err) {
      throw new HttpError(400, (err as Error).message);
    }
    res.json({ token: createSession(user.id), user: publicUser(user) });
  });

  app.post("/auth/logout", requireAuth, (req, res) => {
    const token = req.header("authorization")!.replace(/^Bearer\s+/i, "");
    delete db.sessions[token];
    save();
    res.status(204).end();
  });

  app.get("/me", requireAuth, (req, res) => {
    res.json(publicUser(req.user!));
  });

  app.patch("/me", requireAuth, (req, res) => {
    const body = parse(z.object({ name: z.string().trim().min(1).optional(), countryCode: z.string().length(2).optional(), city: z.string().optional() }), req.body);
    Object.assign(req.user!, body);
    save();
    res.json(publicUser(req.user!));
  });

  // Barbers sign up through this endpoint and get a listing in their city.
  app.post("/auth/register-barber", (req, res) => {
    const body = parse(
      Register.extend({
        countryCode: z.string().length(2),
        city: z.string().min(1),
        bio: z.string().default(""),
        shopAddress: z.string().min(1),
        specialties: z.array(z.string()).default([]),
        offersHomeVisits: z.boolean().default(true),
        haircutPrice: z.number().int().positive(),
        yearsExperience: z.number().int().min(0).max(70).default(0),
        languages: z.array(z.string()).default([]),
      }),
      req.body,
    );
    const country = findCountry(body.countryCode);
    if (!country?.cities.some((c) => c.name === body.city)) throw new HttpError(400, "We don't operate in that city yet.");
    if (db.users.some((u) => u.email === body.email)) throw new HttpError(409, "An account with this email already exists.");
    const barberId = newId();
    const p = body.haircutPrice;
    db.barbers.push({
      id: barberId, name: body.name, bio: body.bio, photoUrl: "", // shows initials until the barber uploads a photo
      countryCode: body.countryCode, city: body.city, shopAddress: body.shopAddress, specialties: body.specialties,
      services: [
        { id: `${barberId}-cut`, name: "Classic haircut", durationMin: 30, price: p },
        { id: `${barberId}-fade`, name: "Skin fade", durationMin: 45, price: Math.round(p * 1.2) },
        { id: `${barberId}-beard`, name: "Beard trim & line-up", durationMin: 20, price: Math.round(p * 0.6) },
        { id: `${barberId}-combo`, name: "Haircut + beard", durationMin: 60, price: Math.round(p * 1.5) },
      ],
      offersHomeVisits: body.offersHomeVisits, homeVisitFee: body.offersHomeVisits ? Math.round(p * 0.5) : 0,
      yearsExperience: body.yearsExperience, languages: body.languages, gallery: [], transformations: [],
      workingDays: [1, 2, 3, 4, 5, 6], openHour: 9, closeHour: 19, ratingSum: 0, ratingCount: 0,
    });
    const user = { id: newId(), name: body.name, email: body.email, role: "barber" as const, barberId, countryCode: body.countryCode, city: body.city, passwordHash: hashPassword(body.password) };
    db.users.push(user);
    save();
    res.status(201).json({ token: createSession(user.id), user: publicUser(user) });
  });

  registerPortfolioRoutes(app);
  registerSupportRoutes(app);
  registerAssistantRoutes(app);
  registerTryOnRoutes(app);

  // ---------- Barbers ----------
  app.get("/barbers", (req, res) => {
    const q = parse(
      z.object({
        country: z.string().optional(),
        city: z.string().optional(),
        search: z.string().optional(),
        specialty: z.string().optional(), // comma-separated, matches any
        minRating: z.coerce.number().min(0).max(5).optional(),
        maxPrice: z.coerce.number().int().positive().optional(),
        availableToday: z.enum(["true", "false"]).optional(),
        availableOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        homeVisits: z.enum(["true", "false"]).optional(),
        sort: z.enum(["rating", "price", "soonest", "experience"]).default("rating"),
      }),
      req.query,
    );
    res.json(
      searchBarbers({
        country: q.country,
        city: q.city,
        q: q.search?.trim() || undefined,
        specialties: q.specialty?.split(",").map((s) => s.trim()).filter(Boolean),
        minRating: q.minRating,
        maxPrice: q.maxPrice,
        availableToday: q.availableToday === "true",
        availableOn: q.availableOn,
        homeVisits: q.homeVisits === "true",
        sort: q.sort,
      }),
    );
  });

  app.get("/specialties", (_req, res) => {
    res.json(allSpecialties());
  });

  app.get("/barbers/:id", (req, res) => {
    const barber = getBarber(req.params.id);
    const reviews = db.reviews
      .filter((r) => r.barberId === barber.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 30)
      .map(({ customerId: _c, ...r }) => r);
    res.json({ ...barberView(barber), reviews });
  });

  app.get("/barbers/:id/availability", (req, res) => {
    const barber = getBarber(req.params.id);
    const q = parse(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), serviceId: z.string() }), req.query);
    const service = findService(barber, q.serviceId);
    if (!service) throw new HttpError(404, "Service not found.");
    res.json({ timeZone: cityOf(barber).timeZone, slots: availableSlots(barber, cityOf(barber).timeZone, q.date, service.durationMin, db.bookings) });
  });

  // ---------- Bookings & payments ----------
  app.post("/bookings", requireAuth, async (req, res) => {
    const body = parse(
      z.object({
        barberId: z.string(),
        serviceId: z.string(),
        startsAt: z.string().datetime(),
        locationType: z.enum(["shop", "home", "video", "phone"]),
        address: z.string().default(""),
        phone: z.string().trim().max(30).default(""),
        notes: z.string().max(1000).default(""),
      }),
      req.body,
    );
    const barber = getBarber(body.barberId);
    const service = findService(barber, body.serviceId);
    if (!service) throw new HttpError(404, "Service not found.");
    const consultation = service.id === CONSULTATION.id;
    const remote = body.locationType === "video" || body.locationType === "phone";
    if (consultation !== remote) {
      throw new HttpError(400, consultation ? "Consultations are by video call or phone." : "Choose the shop or your place for this service.");
    }
    if (body.locationType === "home" && !barber.offersHomeVisits) throw new HttpError(400, "This barber doesn't do home visits.");
    if (body.locationType === "home" && !body.address.trim()) throw new HttpError(400, "Please enter the address the barber should come to.");
    if (body.locationType === "phone" && body.phone.replace(/[^\d]/g, "").length < 6) throw new HttpError(400, "Please enter the phone number your barber should call.");

    const tz = cityOf(barber).timeZone;
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(body.startsAt));
    const free = availableSlots(barber, tz, date, service.durationMin, db.bookings);
    if (!free.includes(new Date(body.startsAt).toISOString())) throw new HttpError(409, "That time was just taken — please pick another slot.");

    const start = new Date(body.startsAt);
    const booking: Booking = {
      id: newId(),
      customerId: req.user!.id,
      barberId: barber.id,
      serviceId: service.id,
      startsAt: start.toISOString(),
      endsAt: new Date(start.getTime() + service.durationMin * 60_000).toISOString(),
      locationType: body.locationType,
      address: body.locationType === "home" ? body.address.trim() : body.locationType === "shop" ? barber.shopAddress : body.locationType === "video" ? "Video call · Google Meet" : "Phone call",
      phone: body.locationType === "phone" ? body.phone : undefined,
      notes: body.notes,
      amount: service.price + (body.locationType === "home" ? barber.homeVisitFee : 0),
      currency: findCountry(barber.countryCode)!.currency,
      status: "pending_payment",
      reviewed: false,
      createdAt: new Date().toISOString(),
    };
    // Free bookings (consultations) are confirmed straight away — nothing to pay.
    if (booking.amount === 0) {
      booking.status = "confirmed";
      db.bookings.push(booking);
      save();
      res.status(201).json({ booking: bookingView(booking), clientSecret: null, demoPayments });
      return;
    }
    const intent = await createPaymentIntent(`booking-${booking.id}`, booking.amount, booking.currency, {
      kind: "booking",
      bookingId: booking.id,
      barberId: booking.barberId,
      platformFee: String(Math.round((booking.amount * config.platformFeePercent) / 100)),
    });
    booking.paymentIntentId = intent?.id;
    db.bookings.push(booking);
    save();
    res.status(201).json({ booking: bookingView(booking), clientSecret: intent?.clientSecret ?? null, demoPayments });
  });

  app.get("/bookings", requireAuth, (req, res) => {
    const user = req.user!;
    const mine = db.bookings.filter((b) => b.customerId === user.id || (user.role === "barber" && b.barberId === user.barberId));
    res.json(mine.sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map(bookingView));
  });

  app.get("/bookings/:id", requireAuth, (req, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.id);
    if (!booking || !canAccess(req.user!.id, booking)) throw new HttpError(404, "Booking not found.");
    res.json(bookingView(booking));
  });

  app.get("/bookings/:id/payment", requireAuth, async (req, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.id && b.customerId === req.user!.id);
    if (!booking) throw new HttpError(404, "Booking not found.");
    const clientSecret = booking.status === "pending_payment" && booking.paymentIntentId ? await clientSecretFor(booking.paymentIntentId) : null;
    res.json({ booking: bookingView(booking), clientSecret, demoPayments });
  });

  // Called by the app after the payment sheet completes. The server re-checks with Stripe,
  // so a client can't mark a booking paid without paying. In demo mode it simply confirms.
  app.post("/bookings/:id/confirm-payment", requireAuth, async (req, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.id && b.customerId === req.user!.id);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (booking.status === "pending_payment") {
      const paid = demoPayments || (booking.paymentIntentId ? await paymentSucceeded(booking.paymentIntentId) : false);
      if (!paid) throw new HttpError(402, "Payment hasn't gone through yet.");
      booking.status = "confirmed";
      save();
    }
    res.json(bookingView(booking));
  });

  app.post("/bookings/:id/cancel", requireAuth, async (req, res) => {
    const booking = db.bookings.find((b) => b.id === req.params.id);
    if (!booking || !canAccess(req.user!.id, booking)) throw new HttpError(404, "Booking not found.");
    if (booking.status === "completed" || booking.status === "cancelled") throw new HttpError(400, "This booking can't be cancelled.");
    if (booking.status !== "pending_payment" && booking.paymentIntentId) await refund(booking.paymentIntentId);
    booking.status = "cancelled";
    save();
    res.json(bookingView(booking));
  });

  // Barber updates: on the way -> completed.
  app.post("/bookings/:id/status", requireAuth, (req, res) => {
    const { status } = parse(z.object({ status: z.enum(["on_the_way", "completed"]) }), req.body);
    const user = req.user!;
    const booking = db.bookings.find((b) => b.id === req.params.id);
    if (!booking || user.role !== "barber" || booking.barberId !== user.barberId) throw new HttpError(404, "Booking not found.");
    if (!["confirmed", "on_the_way"].includes(booking.status)) throw new HttpError(400, "Only paid bookings can be updated.");
    booking.status = status;
    save();
    res.json(bookingView(booking));
  });

  // ---------- Ratings ----------
  app.post("/bookings/:id/review", requireAuth, (req, res) => {
    const body = parse(z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(2000).default("") }), req.body);
    const booking = db.bookings.find((b) => b.id === req.params.id && b.customerId === req.user!.id);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (booking.status !== "completed") throw new HttpError(400, "You can rate your barber once the appointment is completed.");
    if (booking.serviceId === CONSULTATION.id) throw new HttpError(400, "Consultations can't be rated — rate your barber after your cut.");
    if (booking.reviewed) throw new HttpError(409, "You already rated this appointment.");
    const barber = getBarber(booking.barberId);
    db.reviews.push({
      id: newId(), barberId: barber.id, customerId: req.user!.id, customerName: req.user!.name.split(" ")[0],
      bookingId: booking.id, rating: body.rating, comment: body.comment.trim(), createdAt: new Date().toISOString(),
    });
    barber.ratingSum += body.rating;
    barber.ratingCount += 1;
    booking.reviewed = true;
    save();
    res.status(201).json(barberView(barber));
  });

  // ---------- Reels ----------
  app.get("/reels", optionalAuth, (req, res) => {
    const q = parse(z.object({ country: z.string().optional(), city: z.string().optional(), barberId: z.string().optional() }), req.query);
    const barbersById = new Map(db.barbers.map((b) => [b.id, b]));
    const list = db.reels.filter((r) => {
      const b = barbersById.get(r.barberId);
      return b && (!q.barberId || b.id === q.barberId) && (!q.country || b.countryCode === q.country) && (!q.city || b.city === q.city);
    });
    // Newest first, with a boost for popular reels.
    const score = (r: Reel) => Date.parse(r.createdAt) / 3_600_000 + Math.log1p(r.likedBy.length) * 24;
    res.json(list.sort((a, b) => score(b) - score(a)).map((r) => reelView(r, req.user?.id)));
  });

  app.post("/reels/:id/like", requireAuth, (req, res) => {
    const reel = db.reels.find((r) => r.id === req.params.id);
    if (!reel) throw new HttpError(404, "Reel not found.");
    const me = req.user!.id;
    reel.likedBy = reel.likedBy.includes(me) ? reel.likedBy.filter((id) => id !== me) : [...reel.likedBy, me];
    save();
    res.json(reelView(reel, me));
  });

  app.delete("/reels/:id", requireAuth, (req, res) => {
    const reel = db.reels.find((r) => r.id === req.params.id);
    if (!reel || reel.barberId !== req.user!.barberId) throw new HttpError(404, "Reel not found.");
    db.reels = db.reels.filter((r) => r !== reel);
    save();
    res.status(204).end();
  });

  // ---------- Shop: JB's Fresh products ----------
  const currencyFor = (country?: string) => {
    const currency = (country && findCountry(country)?.currency) || "eur";
    return SHIPPING[currency] ? currency : "eur";
  };
  const productView = (p: Product, currency: string) => ({
    id: p.id, name: p.name, category: p.category, emoji: p.emoji, description: p.description,
    price: p.prices[currency], currency,
  });

  app.get("/products", (req, res) => {
    const { country } = parse(z.object({ country: z.string().optional() }), req.query);
    const currency = currencyFor(country);
    res.json({ currency, shipping: SHIPPING[currency], products: PRODUCTS.map((p) => productView(p, currency)) });
  });

  app.post("/orders", requireAuth, async (req, res) => {
    const body = parse(
      z.object({
        countryCode: z.string().length(2),
        items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(20) })).min(1),
        shippingName: z.string().trim().min(1, "Please enter a name for delivery"),
        shippingAddress: z.string().trim().min(5, "Please enter your delivery address"),
      }),
      req.body,
    );
    if (!findCountry(body.countryCode)) throw new HttpError(400, "We don't ship to that country yet.");
    const currency = currencyFor(body.countryCode);
    const items = body.items.map((i) => {
      const product = PRODUCTS.find((p) => p.id === i.productId);
      if (!product) throw new HttpError(404, "One of the products is no longer available.");
      return { productId: product.id, name: product.name, quantity: i.quantity, unitPrice: product.prices[currency] };
    });
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shipping = subtotal >= SHIPPING[currency].freeFrom ? 0 : SHIPPING[currency].fee;
    const order: Order = {
      id: newId(), customerId: req.user!.id, items, subtotal, shipping, amount: subtotal + shipping, currency,
      shippingName: body.shippingName, shippingAddress: body.shippingAddress, countryCode: body.countryCode,
      status: "pending_payment", createdAt: new Date().toISOString(),
    };
    const intent = await createPaymentIntent(`order-${order.id}`, order.amount, currency, { kind: "order", orderId: order.id });
    order.paymentIntentId = intent?.id;
    db.orders.push(order);
    save();
    res.status(201).json({ order: { ...order, paymentIntentId: undefined }, clientSecret: intent?.clientSecret ?? null, demoPayments });
  });

  app.get("/orders", requireAuth, (req, res) => {
    res.json(
      db.orders
        .filter((o) => o.customerId === req.user!.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((o) => ({ ...o, paymentIntentId: undefined })),
    );
  });

  app.get("/orders/:id/payment", requireAuth, async (req, res) => {
    const order = db.orders.find((o) => o.id === req.params.id && o.customerId === req.user!.id);
    if (!order) throw new HttpError(404, "Order not found.");
    const clientSecret = order.status === "pending_payment" && order.paymentIntentId ? await clientSecretFor(order.paymentIntentId) : null;
    res.json({ order: { ...order, paymentIntentId: undefined }, clientSecret, demoPayments });
  });

  app.post("/orders/:id/confirm-payment", requireAuth, async (req, res) => {
    const order = db.orders.find((o) => o.id === req.params.id && o.customerId === req.user!.id);
    if (!order) throw new HttpError(404, "Order not found.");
    if (order.status === "pending_payment") {
      const paid = demoPayments || (order.paymentIntentId ? await paymentSucceeded(order.paymentIntentId) : false);
      if (!paid) throw new HttpError(402, "Payment hasn't gone through yet.");
      order.status = "paid";
      save();
    }
    res.json({ ...order, paymentIntentId: undefined });
  });

  // ---------- AI stylist ----------
  app.post("/ai/haircut-advice", requireAuth, async (req, res) => {
    const body = parse(
      z.object({
        imageBase64: z.string().min(100),
        mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
        preferences: z.object({ length: z.string().optional(), maintenance: z.string().optional(), vibe: z.string().optional(), notes: z.string().max(500).optional() }).default({}),
        country: z.string().optional(),
        city: z.string().optional(),
      }),
      req.body,
    );
    if (!config.anthropicConfigured) throw new HttpError(503, "The AI stylist isn't configured on this server yet.");
    const specialties = [...new Set(db.barbers.flatMap((b) => b.specialties))].sort();
    let advice;
    try {
      advice = await adviseHaircut({ data: body.imageBase64.replace(/^data:[^,]+,/, ""), mediaType: body.mediaType }, body.preferences, specialties);
    } catch (err) {
      if (err instanceof StylistUnavailableError) throw new HttpError(422, err.message);
      throw err;
    }
    // Suggest barbers nearby who are good at the recommended cuts.
    const wanted = new Set(advice.recommendations.flatMap((r) => r.specialtyTags));
    const barbers = db.barbers
      .filter((b) => (!body.country || b.countryCode === body.country) && (!body.city || b.city === body.city))
      .map((b) => ({ b, score: b.specialties.filter((s) => wanted.has(s)).length }))
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score || y.b.ratingSum / (y.b.ratingCount || 1) - x.b.ratingSum / (x.b.ratingCount || 1))
      .slice(0, 5)
      .map((x) => barberView(x.b));
    res.json({ advice, barbers });
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  };
  app.use(onError);

  return app;
}
