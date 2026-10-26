import type { Express, Request } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { findService, fromApp, getBarber, HttpError, parse } from "../common.js";
import { config } from "../config.js";
import { db, newId, save } from "../db.js";
import { notify } from "../notify.js";
import { levelOf, LEVEL_LABEL } from "../pro.js";
import type { Barber, Booking } from "../types.js";

const DAY = 86_400_000;
const PAID = new Set<Booking["status"]>(["confirmed", "on_the_way", "completed"]);

function myBarber(req: Request) {
  const user = req.user!;
  if (user.role !== "barber" || !user.barberId) throw new HttpError(403, "Only barbers can do this.");
  return getBarber(user.barberId);
}

const Rule = z.object({
  percent: z.number().int().min(5, "At least 5%").max(30, "At most 30%"),
  days: z.array(z.number().int().min(0).max(6)).min(1, "Pick at least one day").max(7),
  fromHour: z.number().int().min(0).max(23),
  toHour: z.number().int().min(1).max(24),
}).refine((r) => r.toHour > r.fromHour, "The end time must be after the start time.");

/** A client of the barber: an app customer (their id) or a walk-in/guest (by name). */
const clientKey = (b: Booking) => (b.guest ? `guest:${b.guest.name.trim().toLowerCase()}` : b.customerId);

/** Everyone the barber has had in the chair, with visits, spend, notes and when they were last in. */
export function clientsOf(barber: Barber) {
  const mine = db.bookings.filter((b) => b.barberId === barber.id && PAID.has(b.status) && b.serviceId !== "consultation");
  const groups = new Map<string, Booking[]>();
  for (const b of mine) groups.set(clientKey(b), [...(groups.get(clientKey(b)) ?? []), b]);
  const now = Date.now();
  return [...groups].map(([key, list]) => {
    list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const past = list.filter((b) => Date.parse(b.startsAt) <= now);
    const next = list.find((b) => Date.parse(b.startsAt) > now);
    const last = past.at(-1);
    const user = key.startsWith("guest:") ? undefined : db.users.find((u) => u.id === key);
    const lastWithNotes = [...past].reverse().find((b) => b.cutNotes);
    return {
      key,
      name: list.at(-1)!.guest?.name ?? user?.name ?? "Client",
      photoUrl: user?.photoUrl ?? null,
      visits: past.length,
      lastVisit: last?.startsAt ?? null,
      nextVisit: next?.startsAt ?? null,
      spend: list.filter(fromApp).reduce((s, b) => s + b.amount + (b.tip ?? 0), 0) + list.filter((b) => !fromApp(b)).reduce((s, b) => s + b.amount, 0),
      currency: list[0]!.currency,
      lastService: last ? findService(barber, last.serviceId)?.name ?? null : null,
      cutNotes: lastWithNotes?.cutNotes ?? null,
      preferences: user?.preferences ?? null,
      note: barber.clientNotes?.[key] ?? "",
      fromApp: !!user && !user.deletedAt,
      lastMessagedAt: barber.nudgedAt?.[key] ?? null,
      phone: list.at(-1)!.guest?.phone || "",
    };
  }).sort((a, b) => (b.lastVisit ?? b.nextVisit ?? "").localeCompare(a.lastVisit ?? a.nextVisit ?? ""));
}

/** Sends one message to clients in the app; skips anyone messaged in the past week or who turned offers off. */
export function messageClients(from: { name: string; nudgedAt?: Record<string, string> }, keys: string[], text: string, bookingLink?: string) {
  let sent = 0;
  let skipped = 0;
  const now = Date.now();
  from.nudgedAt ??= {};
  for (const key of new Set(keys)) {
    const user = key.startsWith("guest:") ? undefined : db.users.find((u) => u.id === key && !u.deletedAt);
    const recent = from.nudgedAt[key] && now - Date.parse(from.nudgedAt[key]!) < 7 * DAY;
    if (!user || recent || user.alerts?.offers === false) {
      skipped++;
      continue;
    }
    notify(user.id, { kind: "message", title: `Message from ${from.name}`, body: `${text}${bookingLink ? `\n\nBook: ${bookingLink}` : ""}` });
    from.nudgedAt[key] = new Date(now).toISOString();
    sent++;
  }
  return { sent, skipped };
}

/**
 * The barber's own tools: block a few hours, booking rules (late cancellations, off-peak and peak prices),
 * the client book with private notes and "we miss you" messages, and their personal booking link.
 */
export function registerProRoutes(app: Express) {
  // Blocking a few hours (a dentist appointment, a lunch, school pick-up): nobody can book them.
  app.get("/barbers/me/blocks", requireAuth, (req, res) => {
    const barber = myBarber(req);
    res.json(db.blocks.filter((k) => k.barberId === barber.id && Date.parse(k.endsAt) > Date.now()).sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
  });
  app.post("/barbers/me/blocks", requireAuth, (req, res) => {
    const barber = myBarber(req);
    const body = parse(z.object({ startsAt: z.string().datetime(), endsAt: z.string().datetime(), reason: z.string().trim().max(80).default("") }), req.body);
    const start = Date.parse(body.startsAt);
    const end = Date.parse(body.endsAt);
    if (end - start < 15 * 60_000) throw new HttpError(400, "Block at least 15 minutes.");
    if (end - start > 3 * DAY) throw new HttpError(400, "For whole days, use Hours & days off.");
    if (end < Date.now()) throw new HttpError(400, "That time has already passed.");
    const clash = db.bookings.find((b) => b.barberId === barber.id && ["confirmed", "on_the_way"].includes(b.status) && start < Date.parse(b.endsAt) && end > Date.parse(b.startsAt));
    if (clash) throw new HttpError(409, "You have a booking in that time. Move or cancel it first.");
    const block = { id: newId(), shopId: barber.shopId ?? "", barberId: barber.id, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString(), reason: body.reason || "Blocked", createdAt: new Date().toISOString() };
    db.blocks.push(block);
    save();
    res.status(201).json(block);
  });
  app.delete("/barbers/me/blocks/:id", requireAuth, (req, res) => {
    const barber = myBarber(req);
    const block = db.blocks.find((k) => k.id === req.params.id && k.barberId === barber.id);
    if (!block) throw new HttpError(404, "Not found.");
    db.blocks = db.blocks.filter((k) => k !== block);
    save();
    res.status(204).end();
  });

  // Booking rules: what a late cancellation costs, and quiet-hour discounts or busy-hour premiums.
  app.get("/barbers/me/rules", requireAuth, (req, res) => {
    const b = myBarber(req);
    res.json({ cancelPolicy: b.cancelPolicy ?? { freeHours: 0, lateFeePercent: 0 }, offPeak: b.offPeak ?? null, peak: b.peak ?? null });
  });
  app.put("/barbers/me/rules", requireAuth, (req, res) => {
    const b = myBarber(req);
    const body = parse(z.object({
      cancelPolicy: z.object({ freeHours: z.union([z.literal(0), z.literal(6), z.literal(12), z.literal(24), z.literal(48)]), lateFeePercent: z.union([z.literal(0), z.literal(25), z.literal(50), z.literal(100)]) }).optional(),
      offPeak: Rule.nullable().optional(),
      peak: Rule.nullable().optional(),
    }), req.body);
    if (body.offPeak && body.peak && body.offPeak.days.some((d) => body.peak!.days.includes(d)) && body.offPeak.fromHour < body.peak.toHour && body.peak.fromHour < body.offPeak.toHour) {
      throw new HttpError(400, "Off-peak and peak hours overlap. Change one of them.");
    }
    if (body.cancelPolicy) b.cancelPolicy = body.cancelPolicy;
    if (body.offPeak !== undefined) b.offPeak = body.offPeak;
    if (body.peak !== undefined) b.peak = body.peak;
    save();
    res.json({ cancelPolicy: b.cancelPolicy ?? { freeHours: 0, lateFeePercent: 0 }, offPeak: b.offPeak ?? null, peak: b.peak ?? null });
  });

  // The client book.
  app.get("/barbers/me/clients", requireAuth, (req, res) => {
    res.json(clientsOf(myBarber(req)));
  });
  app.put("/barbers/me/clients/note", requireAuth, (req, res) => {
    const b = myBarber(req);
    const { key, note } = parse(z.object({ key: z.string().min(1).max(120), note: z.string().trim().max(500) }), req.body);
    if (!clientsOf(b).some((c) => c.key === key)) throw new HttpError(404, "Client not found.");
    b.clientNotes = { ...b.clientNotes, [key]: note };
    if (!note) delete b.clientNotes[key];
    save();
    res.json({ key, note });
  });
  // "We miss you": a message to chosen clients, with the barber's booking link.
  app.post("/barbers/me/clients/message", requireAuth, (req, res) => {
    const b = myBarber(req);
    const body = parse(z.object({ keys: z.array(z.string()).min(1, "Pick at least one client").max(500), text: z.string().trim().min(5, "Write a short message").max(400) }), req.body);
    const known = new Set(clientsOf(b).map((c) => c.key));
    const result = messageClients(b, body.keys.filter((k) => known.has(k)), body.text, `${config.appUrl}/barber/${b.id}`);
    save();
    res.json(result);
  });

  // Their link and level, for the QR code on the mirror and in Instagram bios.
  app.get("/barbers/me/link", requireAuth, (req, res) => {
    const b = myBarber(req);
    const level = levelOf(b);
    res.json({ url: `${config.appUrl}/barber/${b.id}`, name: b.name, level, levelLabel: LEVEL_LABEL[level] });
  });
}
