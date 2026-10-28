import type { Express } from "express";
import { z } from "zod";
import { publicUser, requireAdmin, requireAdminRole } from "../auth.js";
import { logActivity } from "../activity.js";
import { CAMPAIGNS } from "../campaigns.js";
import { activeMembership, returnPerks } from "../club.js";
import { barberView, bookingFee, findService, fromApp, getBarber, HttpError, parse, platformFeePercent, reviewNewBarbers, CONSULTATION } from "../common.js";
import { db, save } from "../db.js";
import { notify, waitlistOpened } from "../notify.js";
import { refund } from "../payments.js";
import { SHOPS } from "../seed.js";
import { travelSettings } from "../travel.js";
import type { Barber, Booking, User } from "../types.js";
import { applicationOf, applicationStatus, applicationView, needsApplication } from "./applications.js";
import { profileChecklist } from "./business.js";

const DAY = 86_400_000;
const PAID = new Set<Booking["status"]>(["confirmed", "on_the_way", "completed"]);
const since = (days: number) => Date.now() - days * DAY;
const q = (s: string | undefined) => (s ?? "").trim().toLowerCase();

/** Sums amounts per currency, largest first: [{ currency, amount }]. */
function byCurrency(items: { currency: string; amount: number }[]) {
  const sums = new Map<string, number>();
  for (const i of items) sums.set(i.currency, (sums.get(i.currency) ?? 0) + i.amount);
  return [...sums].map(([currency, amount]) => ({ currency, amount })).sort((a, b) => b.amount - a.amount);
}

const barberUser = (barberId: string) => db.users.find((u) => u.barberId === barberId);

function bookingRow(b: Booking) {
  const barber = db.barbers.find((x) => x.id === b.barberId);
  const customer = db.users.find((u) => u.id === b.customerId);
  const service = barber ? findService(barber, b.serviceId) ?? (b.serviceId === CONSULTATION.id ? CONSULTATION : undefined) : undefined;
  return {
    id: b.id, startsAt: b.startsAt, createdAt: b.createdAt, status: b.status, amount: b.amount, currency: b.currency, locationType: b.locationType,
    fee: PAID.has(b.status) && fromApp(b) ? bookingFee(b) : 0,
    service: service?.name ?? "Service",
    barber: barber ? { id: barber.id, name: barber.name, photoUrl: barber.photoUrl, city: barber.city } : null,
    customer: customer ? { id: customer.id, name: b.guest?.name ?? customer.name, email: customer.email } : null,
    coveredBy: b.coveredBy ?? null,
  };
}

function barberRow(b: Barber) {
  const mine = db.bookings.filter((x) => x.barberId === b.id);
  const paid = mine.filter((x) => PAID.has(x.status));
  const user = barberUser(b.id);
  const shop = b.shopId ? SHOPS.find((s) => s.id === b.shopId) : undefined;
  return {
    id: b.id, name: b.name, photoUrl: b.photoUrl, city: b.city, countryCode: b.countryCode,
    status: b.status ?? "live", verified: !!b.verified, joinedAt: b.joinedAt ?? null, application: applicationStatus(b),
    rating: b.ratingCount ? Math.round((b.ratingSum / b.ratingCount) * 10) / 10 : null, ratingCount: b.ratingCount,
    bookings: paid.length,
    revenue30: byCurrency(paid.filter((x) => Date.parse(x.startsAt) >= since(30))),
    email: user?.email ?? null,
    shop: shop ? { id: shop.id, name: shop.name } : null,
    profileDone: profileChecklist(b).filter((c) => c.done).length,
    profileTotal: profileChecklist(b).length,
  };
}

function ticketRow(t: (typeof db.tickets)[number]) {
  const reel = t.reelId ? db.reels.find((r) => r.id === t.reelId) : undefined;
  const reelBarber = reel ? db.barbers.find((b) => b.id === reel.barberId) : undefined;
  return {
    ...t,
    reel: reel ? { id: reel.id, caption: reel.caption, posterUrl: reel.posterUrl ?? null, videoUrl: reel.videoUrl, barber: reelBarber ? { id: reelBarber.id, name: reelBarber.name } : null } : null,
    reelRemoved: !!t.reelId && !reel,
  };
}

/**
 * The admin panel's API: the JB Always Fresh team (ADMIN_EMAILS) approves and suspends barbers,
 * sees every booking and refunds, moderates reported reels, answers tickets and changes settings.
 */
export function registerAdminRoutes(app: Express) {
  app.get("/admin/overview", requireAdmin, (_req, res) => {
    const paid = db.bookings.filter((b) => PAID.has(b.status) && fromApp(b)); // JB's numbers: bookings made and paid in the app
    const paid30 = paid.filter((b) => Date.parse(b.createdAt) >= since(30));
    const hires30 = db.hires.filter((h) => h.status === "confirmed" || h.status === "completed").filter((h) => Date.parse(h.createdAt) >= since(30));
    const orders30 = db.orders.filter((o) => !["pending_payment", "cancelled"].includes(o.status) && Date.parse(o.createdAt) >= since(30));
    const purchases30 = db.purchases.filter((p) => p.status === "paid" && Date.parse(p.createdAt) >= since(30));
    const customers = db.users.filter((u) => u.role === "customer");
    const count = (s: Barber["status"]) => db.barbers.filter((b) => (b.status ?? "live") === s).length;
    // Bookings made per day, last 14 days (UTC days).
    const days = Array.from({ length: 14 }, (_, i) => new Date(Date.now() - (13 - i) * DAY).toISOString().slice(0, 10));
    const series = days.map((date) => ({ date, count: db.bookings.filter((b) => b.status !== "pending_payment" && b.createdAt.slice(0, 10) === date).length }));
    res.json({
      feePercent: platformFeePercent(),
      bookings: {
        today: db.bookings.filter((b) => PAID.has(b.status) && b.startsAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
        last7: paid.filter((b) => Date.parse(b.createdAt) >= since(7)).length,
        last30: paid30.length,
        upcoming: paid.filter((b) => b.status !== "completed" && Date.parse(b.startsAt) > Date.now()).length,
        cancelled30: db.bookings.filter((b) => b.status === "cancelled" && Date.parse(b.createdAt) >= since(30)).length,
      },
      revenue30: {
        bookings: byCurrency(paid30),
        fees: byCurrency(paid30.map((b) => ({ currency: b.currency, amount: bookingFee(b) }))),
        hires: byCurrency(hires30),
        shop: byCurrency(orders30),
        clubAndGifts: byCurrency(purchases30),
      },
      customers: { total: customers.length, new7: customers.filter((u) => u.createdAt && Date.parse(u.createdAt) >= since(7)).length, members: customers.filter((u) => activeMembership(u)).length },
      barbers: { live: count("live"), pending: count("pending"), suspended: count("suspended"), total: db.barbers.length },
      pendingBarbers: db.barbers.filter((b) => b.status === "pending").slice(0, 6).map(barberRow),
      applications: db.applications.filter((a) => a.status === "submitted").length,
      openTickets: db.tickets.filter((t) => t.status === "open" && !t.reelId).length,
      openReports: db.tickets.filter((t) => t.status === "open" && t.reelId).length,
      ordersToShip: db.orders.filter((o) => o.status === "paid").length,
      series,
      recent: [...db.bookings].filter((b) => b.status !== "pending_payment").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8).map(bookingRow),
    });
  });

  // ---------- Barbers ----------
  app.get("/admin/barbers", requireAdminRole("operations", "support"), (req, res) => {
    const f = parse(z.object({ status: z.enum(["pending", "live", "suspended", "all"]).default("all"), q: z.string().optional() }), req.query);
    const text = q(f.q);
    const order = { pending: 0, live: 1, suspended: 2 } as const;
    const list = db.barbers
      .filter((b) => f.status === "all" || (b.status ?? "live") === f.status)
      .filter((b) => !text || `${b.name} ${b.city} ${barberUser(b.id)?.email ?? ""}`.toLowerCase().includes(text))
      .map(barberRow)
      .sort((a, b) => order[a.status] - order[b.status] || b.bookings - a.bookings || a.name.localeCompare(b.name));
    res.json(list);
  });

  app.get("/admin/barbers/:id", requireAdminRole("operations", "support"), (req, res) => {
    const barber = getBarber(String(req.params.id));
    const mine = db.bookings.filter((b) => b.barberId === barber.id);
    res.json({
      ...barberRow(barber),
      profile: barberView(barber),
      checklist: profileChecklist(barber),
      application: applicationView(barber, true),
      hours: { workingDays: barber.workingDays, openHour: barber.openHour, closeHour: barber.closeHour, timeOff: barber.timeOff ?? [] },
      stats: {
        paid: mine.filter((b) => PAID.has(b.status)).length,
        completed: mine.filter((b) => b.status === "completed").length,
        cancelled: mine.filter((b) => b.status === "cancelled").length,
        revenue: byCurrency(mine.filter((b) => PAID.has(b.status))),
        reels: db.reels.filter((r) => r.barberId === barber.id).length,
        reports: db.tickets.filter((t) => t.reelId && db.reels.find((r) => r.id === t.reelId)?.barberId === barber.id).length,
      },
      recent: mine.sort((a, b) => b.startsAt.localeCompare(a.startsAt)).slice(0, 10).map(bookingRow),
    });
  });

  app.patch("/admin/barbers/:id", requireAdminRole("operations"), (req, res) => {
    const barber = getBarber(String(req.params.id));
    const body = parse(z.object({ status: z.enum(["pending", "live", "suspended"]).optional(), verified: z.boolean().optional() }), req.body);
    const before = barber.status ?? "live";
    if (body.status === "live" && before === "pending" && needsApplication(barber) && applicationOf(barber.id)?.status !== "approved")
      throw new HttpError(400, "Check and approve their application first: ID, licence and signed agreement.");
    if (body.status) barber.status = body.status;
    if (body.verified !== undefined) barber.verified = body.verified;
    if (body.status && body.status !== before) logActivity(req, `barber.${body.status}`, barber.name);
    if (body.verified !== undefined) logActivity(req, body.verified ? "barber.verified" : "barber.unverified", barber.name);
    const user = barberUser(barber.id);
    if (user && body.status && body.status !== before) {
      if (body.status === "live") notify(user.id, { kind: "account", title: before === "pending" ? "You're live on JB Always Fresh" : "Your profile is back", body: "Clients can find and book you now. Keep your hours and prices up to date." });
      if (body.status === "suspended") notify(user.id, { kind: "account", title: "Your profile is paused", body: "Clients can't find or book you for now. Contact support to find out why." });
    }
    save();
    res.json(barberRow(barber));
  });

  // ---------- Bookings ----------
  app.get("/admin/bookings", requireAdmin, (req, res) => {
    const f = parse(z.object({ status: z.enum(["all", "upcoming", "completed", "cancelled", "pending_payment"]).default("all"), q: z.string().optional() }), req.query);
    const text = q(f.q);
    const now = Date.now();
    const list = db.bookings
      .filter((b) =>
        f.status === "all" ? b.status !== "pending_payment"
        : f.status === "upcoming" ? ["confirmed", "on_the_way"].includes(b.status) && Date.parse(b.endsAt) > now
        : b.status === f.status)
      .map(bookingRow)
      .filter((r) => !text || `${r.barber?.name ?? ""} ${r.customer?.name ?? ""} ${r.customer?.email ?? ""} ${r.service} ${r.id}`.toLowerCase().includes(text))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
      .slice(0, 300);
    res.json(list);
  });

  // The team cancels a booking: full refund, perks returned, both sides told.
  app.post("/admin/bookings/:id/cancel", requireAdminRole("operations", "support"), async (req, res) => {
    const { reason } = parse(z.object({ reason: z.string().trim().max(300).default("") }), req.body ?? {});
    const booking = db.bookings.find((b) => b.id === req.params.id);
    if (!booking) throw new HttpError(404, "Booking not found.");
    if (booking.status === "completed" || booking.status === "cancelled") throw new HttpError(400, "This booking can't be cancelled.");
    const wasPaid = booking.status !== "pending_payment";
    if (wasPaid && booking.paymentIntentId) await refund(booking.paymentIntentId);
    booking.status = "cancelled";
    returnPerks(booking);
    logActivity(req, "booking.cancelled", `Booking ${booking.id.slice(0, 8)} with ${getBarber(booking.barberId).name}`, reason || undefined);
    const why = reason ? ` Reason: ${reason}` : "";
    notify(booking.customerId, { kind: "cancelled", title: "Booking cancelled", body: `JB Always Fresh cancelled your booking.${booking.amount && wasPaid ? " You'll get a full refund." : ""}${why}`, bookingId: booking.id });
    const bu = barberUser(booking.barberId);
    if (bu) notify(bu.id, { kind: "cancelled", title: "Booking cancelled", body: `JB Always Fresh cancelled a booking with you.${why}`, bookingId: booking.id });
    if (wasPaid) waitlistOpened(booking);
    save();
    res.json(bookingRow(booking));
  });

  // ---------- Customers ----------
  app.get("/admin/customers", requireAdminRole("operations", "support"), (req, res) => {
    const text = q(parse(z.object({ q: z.string().optional() }), req.query).q);
    const list = db.users
      .filter((u) => u.role === "customer")
      .filter((u) => !text || `${u.name} ${u.email} ${u.city ?? ""}`.toLowerCase().includes(text))
      .map((u: User) => {
        const mine = db.bookings.filter((b) => b.customerId === u.id && fromApp(b));
        const member = activeMembership(u);
        return {
          ...publicUser(u), preferences: undefined, credit: undefined,
          bookings: mine.filter((b) => PAID.has(b.status)).length,
          cancelled: mine.filter((b) => b.status === "cancelled").length,
          spent: byCurrency([...mine.filter((b) => PAID.has(b.status)), ...db.orders.filter((o) => o.customerId === u.id && !["pending_payment", "cancelled"].includes(o.status)), ...db.purchases.filter((p) => p.userId === u.id && p.status === "paid")]),
          member: member ? member.plan : null,
          lastBooking: mine.map((b) => b.startsAt).sort().at(-1) ?? null,
        };
      })
      .sort((a, b) => b.bookings - a.bookings || (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 300);
    res.json(list);
  });

  // ---------- Barbershops and orders ----------
  app.get("/admin/shops", requireAdminRole("operations"), (_req, res) => {
    res.json(SHOPS.map((s) => {
      const team = db.barbers.filter((b) => b.shopId === s.id);
      const teamIds = new Set(team.map((b) => b.id));
      const hires = db.hires.filter((h) => h.shopId === s.id && h.status !== "pending_payment");
      const orders = db.orders.filter((o) => o.shopId === s.id && o.status !== "pending_payment");
      return {
        id: s.id, name: s.name, city: s.city, address: s.address, photoUrl: s.photoUrl,
        team: team.map((b) => ({ id: b.id, name: b.name, photoUrl: b.photoUrl, status: b.status ?? "live" })),
        bookings30: db.bookings.filter((b) => teamIds.has(b.barberId) && PAID.has(b.status) && Date.parse(b.startsAt) >= since(30)).length,
        hires: hires.length,
        deliveries: orders.length,
        privateHire: !!s.privateHire,
        delivery: !!s.delivery,
        managers: db.users.filter((u) => u.manages === s.id).map((u) => ({ id: u.id, name: u.name, email: u.email })),
      };
    }));
  });

  // Give a barbershop's owner or manager their shop panel (their account must exist: they sign up in the app first).
  app.post("/admin/shops/:id/managers", requireAdminRole("operations"), (req, res) => {
    const shop = SHOPS.find((s) => s.id === req.params.id);
    if (!shop) throw new HttpError(404, "Barbershop not found.");
    const { email } = parse(z.object({ email: z.string().trim().toLowerCase().email() }), req.body);
    const user = db.users.find((u) => u.email === email);
    if (!user) throw new HttpError(404, "No account with that email yet — ask them to sign up in the app first.");
    user.manages = shop.id;
    logActivity(req, "shop.manager_added", shop.name, email);
    notify(user.id, { kind: "account", title: `Your shop panel for ${shop.name} is ready`, body: "Open Account → Shop panel to see your barbers' calendar, add walk-ins and set hours." });
    save();
    res.json({ shopId: shop.id, managers: db.users.filter((u) => u.manages === shop.id).map((u) => ({ id: u.id, name: u.name, email: u.email })) });
  });

  app.delete("/admin/shops/:id/managers/:userId", requireAdminRole("operations"), (req, res) => {
    const user = db.users.find((u) => u.id === req.params.userId && u.manages === req.params.id);
    if (!user) throw new HttpError(404, "Not found.");
    delete user.manages;
    logActivity(req, "shop.manager_removed", String(req.params.id), user.email);
    save();
    res.status(204).end();
  });

  app.get("/admin/orders", requireAdminRole("operations", "finance"), (_req, res) => {
    res.json(db.orders.filter((o) => o.status !== "pending_payment").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 200).map((o) => {
      const customer = db.users.find((u) => u.id === o.customerId);
      const shop = o.shopId ? SHOPS.find((s) => s.id === o.shopId) : undefined;
      return {
        id: o.id, createdAt: o.createdAt, status: o.status, amount: o.amount, currency: o.currency, fulfilment: o.fulfilment ?? "shipping",
        items: o.items.reduce((n, i) => n + i.quantity, 0), customer: customer ? { name: customer.name, email: customer.email } : null,
        shop: shop ? { id: shop.id, name: shop.name } : null, address: o.shippingAddress,
      };
    }));
  });

  // ---------- Reported reels ----------
  app.get("/admin/reports", requireAdminRole("operations", "support"), (_req, res) => {
    res.json(db.tickets.filter((t) => t.reelId).sort((a, b) => Number(b.status === "open") - Number(a.status === "open") || b.createdAt.localeCompare(a.createdAt)).map(ticketRow));
  });

  app.post("/admin/reports/:id", requireAdminRole("operations", "support"), (req, res) => {
    const { action } = parse(z.object({ action: z.enum(["remove", "dismiss"]) }), req.body);
    const ticket = db.tickets.find((t) => t.id === req.params.id && t.reelId);
    if (!ticket) throw new HttpError(404, "Report not found.");
    if (action === "remove") {
      const reel = db.reels.find((r) => r.id === ticket.reelId);
      if (reel) {
        db.reels = db.reels.filter((r) => r !== reel);
        const bu = barberUser(reel.barberId);
        if (bu) notify(bu.id, { kind: "account", title: "A reel was removed", body: `"${reel.caption.slice(0, 60)}" broke the community rules and was taken down.` });
      }
      // Other reports about the same reel are settled too.
      for (const t of db.tickets) if (t.reelId === ticket.reelId) t.status = "closed";
    }
    ticket.status = "closed";
    logActivity(req, action === "remove" ? "reel.removed" : "report.dismissed", `Report ${ticket.id.slice(0, 8)}`);
    ticket.replies = [...(ticket.replies ?? []), { at: new Date().toISOString(), by: req.user!.name, text: action === "remove" ? "Reel removed." : "Report dismissed — the reel stays." }];
    save();
    res.json(ticketRow(ticket));
  });

  // ---------- Support tickets ----------
  app.get("/admin/tickets", requireAdminRole("operations", "support"), (req, res) => {
    const { status } = parse(z.object({ status: z.enum(["open", "closed", "all"]).default("open") }), req.query);
    res.json(db.tickets.filter((t) => !t.reelId && (status === "all" || t.status === status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(ticketRow));
  });

  app.patch("/admin/tickets/:id", requireAdminRole("operations", "support"), (req, res) => {
    const body = parse(z.object({ status: z.enum(["open", "closed"]).optional(), reply: z.string().trim().min(1).max(4000).optional() }), req.body);
    const ticket = db.tickets.find((t) => t.id === req.params.id);
    if (!ticket) throw new HttpError(404, "Ticket not found.");
    if (body.reply) {
      ticket.replies = [...(ticket.replies ?? []), { at: new Date().toISOString(), by: req.user!.name, text: body.reply }];
      // Signed-in customers see the reply in their alerts; hook your email service here for the rest.
      if (ticket.userId) notify(ticket.userId, { kind: "account", title: "Reply from JB Always Fresh support", body: body.reply.slice(0, 180) });
    }
    if (body.status) ticket.status = body.status;
    logActivity(req, body.reply ? "ticket.replied" : `ticket.${body.status ?? "updated"}`, `Ticket from ${ticket.name ?? ticket.email}`);
    save();
    res.json(ticketRow(ticket));
  });

  // ---------- Settings ----------
  const settingsView = () => ({
    platformFeePercent: platformFeePercent(),
    reviewNewBarbers: reviewNewBarbers(),
    travelIncludedKm: travelSettings().includedKm,
    travelPerKmAed: travelSettings().perKmAed,
    campaigns: CAMPAIGNS.map((c) => ({ id: c.id, eyebrow: c.eyebrow, title: c.title, photoUrl: c.photoUrl, countries: c.countries ?? null, except: c.except ?? null, hidden: (db.settings.hiddenCampaigns ?? []).includes(c.id) })),
  });

  app.get("/admin/settings", requireAdmin, (_req, res) => {
    res.json(settingsView());
  });

  app.patch("/admin/settings", requireAdminRole(), (req, res) => {
    const body = parse(z.object({
      platformFeePercent: z.number().min(0).max(50).optional(),
      reviewNewBarbers: z.boolean().optional(),
      hiddenCampaigns: z.array(z.string()).max(100).optional(),
      travelIncludedKm: z.number().int().min(0).max(100).optional(),
      travelPerKmAed: z.number().int().min(0).max(5000).optional(), // minor units
    }), req.body);
    Object.assign(db.settings, body);
    logActivity(req, "settings.changed", "Settings", Object.entries(body).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.length + " hidden" : v}`).join(", "));
    save();
    res.json(settingsView());
  });
}
