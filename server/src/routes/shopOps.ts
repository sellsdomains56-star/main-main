import { randomBytes } from "node:crypto";
import type { Express } from "express";
import { z } from "zod";
import { hashPassword, optionalAuth, requireAuth } from "../auth.js";
import { bookingFee, fromApp, HttpError, parse, platformFee } from "../common.js";
import { config } from "../config.js";
import { db, newId, save } from "../db.js";
import { notify, orderUpdate } from "../notify.js";
import { DEFAULT_BARBER_SHARE, PRODUCT_COMMISSION_PERCENT } from "../pro.js";
import { PRODUCTS } from "../products.js";
import { openNow } from "../search.js";
import { getShop, shopCurrency, shopTimeZone } from "../shops.js";
import type { Booking, QueueEntry, Shop } from "../types.js";
import { messageClients } from "./pro.js";
import { calendarBooking, myShop, periodRange, shopRole, teamOf } from "./manage.js";

const DAY = 86_400_000;
const ACTIVE = new Set<Booking["status"]>(["confirmed", "on_the_way", "completed"]);
const OPEN_QUEUE = new Set<QueueEntry["status"]>(["waiting", "called", "serving"]);
const AVERAGE_CUT_MIN = 30;

/** Open right now by the shop's own hours (local time). */
function shopOpen(shop: Shop, now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: shopTimeZone(shop), weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(now).map((x) => [x.type, x.value]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday!);
  const hour = Number(p.hour);
  return shop.workingDays.includes(day) && hour >= shop.openHour && hour < shop.closeHour;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** Today's queue at a shop, oldest first, with each person's place and an estimated wait. */
function queueOf(shop: Shop) {
  const since = Date.now() - DAY / 2;
  const list = db.queue.filter((q) => q.shopId === shop.id && Date.parse(q.joinedAt) > since).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  const chairs = Math.max(1, teamOf(shop).filter((b) => (b.status ?? "live") === "live" && openNow(b)).length);
  const waiting = list.filter((q) => q.status === "waiting");
  const estimate = (i: number) => Math.ceil(((i + 1) * AVERAGE_CUT_MIN) / chairs / 5) * 5;
  return { list, waiting, chairs, estimate };
}

function queueView(q: QueueEntry, position: number | null, estimateMin: number | null) {
  const barber = q.barberId ? db.barbers.find((b) => b.id === q.barberId) : undefined;
  return { id: q.id, name: q.name, phone: q.phone, service: q.service, status: q.status, joinedAt: q.joinedAt, calledAt: q.calledAt ?? null, fromApp: !!q.userId, barber: barber ? { id: barber.id, name: barber.name } : null, position, estimateMin };
}

function orderRow(o: (typeof db.orders)[number]) {
  const customer = db.users.find((u) => u.id === o.customerId);
  return {
    id: o.id, status: o.status, createdAt: o.createdAt, name: o.shippingName || customer?.name || "Customer", address: o.shippingAddress,
    items: o.items.map((i) => ({ name: i.name, quantity: i.quantity })), subtotal: o.subtotal, amount: o.amount, currency: o.currency,
    commission: Math.round((o.subtotal * PRODUCT_COMMISSION_PERCENT) / 100),
  };
}

/**
 * Running the shop floor: the walk-in queue (from the desk or the app), tablet check-in for bookings,
 * the TV queue screen, delivery orders and stock, private hires, staff accounts and roles,
 * the money split and payroll, and messages to clients who haven't been in for a while.
 */
export function registerShopOpsRoutes(app: Express) {
  // ---------- The virtual queue ----------
  // Customers: how long is the wait, and where am I?
  app.get("/shops/:id/queue", optionalAuth, (req, res) => {
    const shop = getShop(String(req.params.id));
    const { list, waiting, estimate } = queueOf(shop);
    const mine = req.user ? list.find((q) => q.userId === req.user!.id && OPEN_QUEUE.has(q.status)) : undefined;
    const pos = mine ? waiting.indexOf(mine) : -1;
    res.json({
      open: shopOpen(shop), waiting: waiting.length, estimateMin: waiting.length ? estimate(waiting.length - 1) : 0,
      nowServing: list.filter((q) => q.status === "called" || q.status === "serving").map((q) => firstName(q.name)),
      mine: mine ? queueView(mine, pos >= 0 ? pos + 1 : null, pos >= 0 ? estimate(pos) : 0) : null,
    });
  });
  app.post("/shops/:id/queue", requireAuth, (req, res) => {
    const shop = getShop(String(req.params.id));
    const { service } = parse(z.object({ service: z.string().trim().max(60).default("Haircut") }), req.body);
    if (!shopOpen(shop)) throw new HttpError(400, `${shop.name} is closed right now. Book a time instead.`);
    const { list } = queueOf(shop);
    if (list.some((q) => q.userId === req.user!.id && OPEN_QUEUE.has(q.status))) throw new HttpError(409, "You're already in the queue.");
    if (list.filter((q) => q.status === "waiting").length >= 30) throw new HttpError(409, "The queue is full right now. Book a time instead.");
    const entry: QueueEntry = { id: newId(), shopId: shop.id, name: req.user!.name, phone: req.user!.phone ?? "", userId: req.user!.id, service, status: "waiting", joinedAt: new Date().toISOString() };
    db.queue.push(entry);
    save();
    res.status(201).json(queueView(entry, null, null));
  });
  app.delete("/shops/:id/queue/mine", requireAuth, (req, res) => {
    const entry = db.queue.find((q) => q.shopId === req.params.id && q.userId === req.user!.id && OPEN_QUEUE.has(q.status));
    if (entry) {
      entry.status = "left";
      save();
    }
    res.status(204).end();
  });

  // The desk: everyone waiting, the chairs, and the TV screen's data.
  app.get("/manage/queue", requireAuth, (req, res) => {
    const shop = myShop(req);
    const { list, waiting, chairs, estimate } = queueOf(shop);
    res.json({
      open: shopOpen(shop), chairs,
      waiting: waiting.map((q, i) => queueView(q, i + 1, estimate(i))),
      inChair: list.filter((q) => q.status === "called" || q.status === "serving").map((q) => queueView(q, null, null)),
      doneToday: list.filter((q) => q.status === "done").length,
      team: teamOf(shop).filter((b) => (b.status ?? "live") === "live").map((b) => ({ id: b.id, name: b.name, photoUrl: b.photoUrl, working: openNow(b) })),
    });
  });
  app.post("/manage/queue", requireAuth, (req, res) => {
    const shop = myShop(req);
    const body = parse(z.object({ name: z.string().trim().min(1, "Add a name").max(60), phone: z.string().trim().max(30).default(""), service: z.string().trim().max(60).default("Haircut") }), req.body);
    const entry: QueueEntry = { id: newId(), shopId: shop.id, ...body, status: "waiting", joinedAt: new Date().toISOString() };
    db.queue.push(entry);
    save();
    res.status(201).json(queueView(entry, null, null));
  });
  app.post("/manage/queue/:id", requireAuth, (req, res) => {
    const shop = myShop(req);
    const { action, barberId } = parse(z.object({ action: z.enum(["call", "serve", "done", "remove"]), barberId: z.string().optional() }), req.body);
    const q = db.queue.find((x) => x.id === req.params.id && x.shopId === shop.id);
    if (!q) throw new HttpError(404, "Not in the queue.");
    if (barberId && !teamOf(shop).some((b) => b.id === barberId)) throw new HttpError(404, "That barber isn't on your team.");
    if (action === "call") {
      q.status = "called";
      q.calledAt = new Date().toISOString();
      if (barberId) q.barberId = barberId;
      const who = q.barberId ? db.barbers.find((b) => b.id === q.barberId)?.name.split(" ")[0] : null;
      if (q.userId) notify(q.userId, { kind: "queue", title: "It's your turn", body: `${who ? `${who} is ready for you` : "Your chair is ready"} at ${shop.name}. Head to the desk.` });
    } else if (action === "serve") {
      q.status = "serving";
      if (barberId) q.barberId = barberId;
    } else if (action === "done") {
      q.status = "done";
      q.doneAt = new Date().toISOString();
    } else q.status = "left";
    save();
    res.json(queueView(q, null, null));
  });

  // ---------- Tablet check-in ----------
  app.get("/manage/check-in", requireAuth, (req, res) => {
    const shop = myShop(req);
    const tz = shopTimeZone(shop);
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
    const team = new Map(teamOf(shop).map((b) => [b.id, b]));
    res.json(db.bookings
      .filter((b) => team.has(b.barberId) && ["confirmed", "on_the_way", "completed"].includes(b.status) && b.locationType === "shop" && new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(b.startsAt)) === day)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((b) => {
        const v = calendarBooking(b);
        return { id: b.id, firstName: firstName(v.client), startsAt: b.startsAt, barber: team.get(b.barberId)!.name, service: v.service, checkedIn: !!b.checkedInAt, done: b.status === "completed" };
      }));
  });
  app.post("/manage/check-in/:id", requireAuth, (req, res) => {
    const shop = myShop(req);
    const team = new Set(teamOf(shop).map((b) => b.id));
    const b = db.bookings.find((x) => x.id === req.params.id && team.has(x.barberId));
    if (!b) throw new HttpError(404, "Booking not found.");
    if (!b.checkedInAt) {
      b.checkedInAt = new Date().toISOString();
      const barberUser = db.users.find((u) => u.role === "barber" && u.barberId === b.barberId);
      if (barberUser) notify(barberUser.id, { kind: "new_booking", title: `${firstName(calendarBooking(b).client)} has arrived`, body: `Checked in at the desk for ${calendarBooking(b).service}.`, bookingId: b.id });
      save();
    }
    res.json({ id: b.id, checkedIn: true });
  });

  // ---------- Delivery orders, stock and private hires ----------
  app.get("/manage/orders", requireAuth, (req, res) => {
    const shop = myShop(req);
    const orders = db.orders.filter((o) => o.shopId === shop.id && o.status !== "pending_payment").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const { from } = periodRange(shop, "month");
    const month = orders.filter((o) => o.status !== "cancelled" && Date.parse(o.createdAt) >= from);
    res.json({
      commissionPercent: PRODUCT_COMMISSION_PERCENT, currency: shopCurrency(shop),
      month: { orders: month.length, sales: month.reduce((s, o) => s + o.subtotal, 0), commission: month.reduce((s, o) => s + orderRow(o).commission, 0) },
      orders: orders.slice(0, 100).map(orderRow),
    });
  });
  app.post("/manage/orders/:id", requireAuth, (req, res) => {
    const shop = myShop(req);
    const { status } = parse(z.object({ status: z.enum(["out_for_delivery", "delivered"]) }), req.body);
    const order = db.orders.find((o) => o.id === req.params.id && o.shopId === shop.id);
    if (!order) throw new HttpError(404, "Order not found.");
    if (!["paid", "out_for_delivery"].includes(order.status)) throw new HttpError(400, "Only paid orders can be updated.");
    if (order.status !== status) {
      order.status = status;
      orderUpdate(order);
      save();
    }
    res.json(orderRow(order));
  });
  app.get("/manage/stock", requireAuth, (req, res) => {
    const shop = myShop(req);
    const shelf = db.stock[shop.id] ?? {};
    const cur = shopCurrency(shop);
    res.json(PRODUCTS.filter((p) => shop.productIds.includes(p.id)).map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, price: p.prices[cur] ?? p.prices.eur, currency: cur, count: shelf[p.id] ?? null, low: shelf[p.id] !== undefined && shelf[p.id]! <= 3 })));
  });
  app.put("/manage/stock", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const { counts } = parse(z.object({ counts: z.record(z.string(), z.number().int().min(0).max(9999).nullable()) }), req.body);
    const shelf = (db.stock[shop.id] ??= {});
    for (const [id, n] of Object.entries(counts)) {
      if (!shop.productIds.includes(id)) throw new HttpError(400, "That product isn't stocked here.");
      if (n === null) delete shelf[id];
      else shelf[id] = n;
    }
    save();
    res.json({ ok: true });
  });
  app.get("/manage/hires", requireAuth, (req, res) => {
    const shop = myShop(req);
    res.json(db.hires.filter((h) => h.shopId === shop.id && h.status !== "pending_payment").sort((a, b) => b.startsAt.localeCompare(a.startsAt)).slice(0, 60).map((h) => ({
      id: h.id, startsAt: h.startsAt, endsAt: h.endsAt, hours: h.hours, guests: h.guests, occasion: h.occasion, notes: h.notes, amount: h.amount, currency: h.currency, status: h.status,
      customer: db.users.find((u) => u.id === h.customerId)?.name ?? "Customer",
    })));
  });

  // ---------- Staff and roles (owner only) ----------
  app.get("/manage/staff", requireAuth, (req, res) => {
    const shop = myShop(req, "owner");
    res.json(db.users.filter((u) => !u.deletedAt && (u.manages === shop.id || u.branches?.includes(shop.id))).map((u) => ({ id: u.id, name: u.name, email: u.email, role: shopRole(u), you: u.id === req.user!.id })));
  });
  app.post("/manage/staff", requireAuth, (req, res) => {
    const shop = myShop(req, "owner");
    const body = parse(z.object({ name: z.string().trim().min(2).max(60), email: z.string().trim().toLowerCase().email(), role: z.enum(["manager", "front_desk"]) }), req.body);
    if (db.users.some((u) => u.email === body.email)) throw new HttpError(409, "There's already an account with that email.");
    const password = randomBytes(6).toString("base64url");
    const user = { id: newId(), name: body.name, email: body.email, passwordHash: hashPassword(password), role: "customer" as const, manages: shop.id, shopRole: body.role, countryCode: shop.countryCode, city: shop.city, createdAt: new Date().toISOString() };
    db.users.push(user);
    save();
    res.status(201).json({ staff: { id: user.id, name: user.name, email: user.email, role: body.role, you: false }, login: { email: body.email, password } });
  });
  app.patch("/manage/staff/:id", requireAuth, (req, res) => {
    const shop = myShop(req, "owner");
    const { role } = parse(z.object({ role: z.enum(["manager", "front_desk"]) }), req.body);
    const u = db.users.find((x) => x.id === req.params.id && x.manages === shop.id);
    if (!u || u.id === req.user!.id || shopRole(u) === "owner") throw new HttpError(404, "Staff member not found.");
    u.shopRole = role;
    save();
    res.json({ id: u.id, name: u.name, email: u.email, role, you: false });
  });
  app.delete("/manage/staff/:id", requireAuth, (req, res) => {
    const shop = myShop(req, "owner");
    const u = db.users.find((x) => x.id === req.params.id && x.manages === shop.id);
    if (!u || u.id === req.user!.id || shopRole(u) === "owner") throw new HttpError(404, "Staff member not found.");
    delete u.manages;
    delete u.shopRole;
    for (const [t, id] of Object.entries(db.sessions)) if (id === u.id) delete db.sessions[t]; // signed out of the panel
    save();
    res.status(204).end();
  });

  // ---------- Money split and payroll ----------
  app.get("/manage/payroll", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const { period } = parse(z.object({ period: z.enum(["today", "week", "month"]).default("month") }), req.query);
    const { first, end, from, to } = periodRange(shop, period);
    const shopDefault = shop.barberSharePercent ?? DEFAULT_BARBER_SHARE;
    const inRange = (b: Booking) => Date.parse(b.startsAt) >= from && Date.parse(b.startsAt) < to;
    const rows = teamOf(shop).map((t) => {
      const mine = db.bookings.filter((b) => b.barberId === t.id && inRange(b));
      const done = mine.filter((b) => ACTIVE.has(b.status));
      const services = done.reduce((s, b) => s + b.amount, 0);
      const lateFees = mine.filter((b) => b.status === "cancelled" && b.lateFee).reduce((s, b) => s + b.lateFee!, 0);
      const tips = done.filter(fromApp).reduce((s, b) => s + (b.tip ?? 0), 0);
      const jbFee = done.filter(fromApp).reduce((s, b) => s + bookingFee(b), 0) + platformFee(lateFees);
      const share = t.sharePercent ?? shopDefault;
      const net = services + lateFees - jbFee;
      const barberPay = Math.round((net * share) / 100) + tips;
      return {
        id: t.id, name: t.name, photoUrl: t.photoUrl, sharePercent: share, customShare: t.sharePercent !== undefined,
        appointments: done.length, walkIns: done.filter((b) => !fromApp(b)).length, services, lateFees, tips, jbFee, barberPay, shopKeeps: net - (barberPay - tips),
      };
    }).sort((a, b) => b.services - a.services);
    const products = db.orders.filter((o) => o.shopId === shop.id && !["pending_payment", "cancelled"].includes(o.status) && Date.parse(o.createdAt) >= from && Date.parse(o.createdAt) < to);
    const productCommission = products.reduce((s, o) => s + Math.round((o.subtotal * PRODUCT_COMMISSION_PERCENT) / 100), 0);
    const sum = (k: "services" | "lateFees" | "tips" | "jbFee" | "barberPay" | "shopKeeps") => rows.reduce((s, r) => s + r[k], 0);
    res.json({
      period, from: first, to: end, currency: shopCurrency(shop), defaultSharePercent: shopDefault, canEditSplit: shopRole(req.user!) === "owner",
      rows,
      totals: { services: sum("services"), lateFees: sum("lateFees"), tips: sum("tips"), jbFee: sum("jbFee"), barberPay: sum("barberPay"), shopKeeps: sum("shopKeeps") + productCommission, productCommission },
      note: "Walk-ins are paid at the shop and carry no Always Fresh fee. Tips go to the barber in full. App money is paid out by Always Fresh; walk-in money is already in the shop's till.",
    });
  });

  // ---------- Messages to clients who haven't been in for a while ----------
  function lapsedClients(shop: Shop, weeks: number) {
    const team = new Set(teamOf(shop).map((b) => b.id));
    const mine = db.bookings.filter((b) => team.has(b.barberId) && fromApp(b) && ACTIVE.has(b.status) && !b.guest);
    const last = new Map<string, number>();
    const upcoming = new Set<string>();
    for (const b of mine) {
      const t = Date.parse(b.startsAt);
      if (t > Date.now()) upcoming.add(b.customerId);
      else last.set(b.customerId, Math.max(last.get(b.customerId) ?? 0, t));
    }
    const cutoff = Date.now() - weeks * 7 * DAY;
    return { all: last.size, lapsed: [...last].filter(([id, t]) => t < cutoff && !upcoming.has(id)).map(([id]) => id) };
  }
  app.get("/manage/clients", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const { weeks } = parse(z.object({ weeks: z.coerce.number().int().min(2).max(52).default(6) }), req.query);
    const { all, lapsed } = lapsedClients(shop, weeks);
    res.json({ clients: all, lapsed: lapsed.length, weeks });
  });
  app.post("/manage/clients/message", requireAuth, (req, res) => {
    const shop = myShop(req, "manager");
    const body = parse(z.object({ weeks: z.number().int().min(2).max(52), text: z.string().trim().min(5, "Write a short message").max(400) }), req.body);
    const from = { name: shop.name, nudgedAt: (db.shopNudges[shop.id] ??= {}) };
    const result = messageClients(from, lapsedClients(shop, body.weeks).lapsed, body.text, `${config.appUrl}/barbershop/${shop.id}`);
    save();
    res.json(result);
  });

}
