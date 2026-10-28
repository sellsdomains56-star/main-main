import type { Express, Request, Response } from "express";
import { z } from "zod";
import { logActivity } from "../activity.js";
import { adminRole, optionalAuth, requireAdminRole, requireAuth } from "../auth.js";
import { barberView, bookingFee, cityOf, findService, fromApp, getBarber, HttpError, isLive, parse, platformFee } from "../common.js";
import { config } from "../config.js";
import { db, newId, save } from "../db.js";
import { notify, onNotification } from "../notify.js";
import { partnerCommission } from "../partners.js";
import { stripe } from "../payments.js";
import { levelOf } from "../pro.js";
import { rateLimit } from "../security.js";
import type { AdminRole, Barber, Booking, Chat, Partner } from "../types.js";

const DAY = 86_400_000;
const PAID = new Set<Booking["status"]>(["confirmed", "on_the_way", "completed"]);
const Month = z.string().regex(/^\d{4}-\d{2}$/, "Month as YYYY-MM");

const monthOf = (iso: string) => iso.slice(0, 7);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const lastMonth = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
};
const monthLabel = (m: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-15T00:00:00Z`));

/** Sums per currency, largest first. */
function byCurrency(items: { currency: string; amount: number }[]) {
  const sums = new Map<string, number>();
  for (const i of items) sums.set(i.currency, (sums.get(i.currency) ?? 0) + i.amount);
  return [...sums].map(([currency, amount]) => ({ currency, amount })).sort((a, b) => b.amount - a.amount);
}

/** VAT inside a VAT-inclusive AED amount (UAE), when the company is registered. */
const vatIn = (amount: number, currency: string) => (config.vatTrn && currency === "aed" ? Math.round((amount * config.vatPercent) / (100 + config.vatPercent)) : 0);

// ---------- Awards: the city's top 10 each month ----------

const awardCache = new Map<string, { at: number; list: { barber: Barber; cuts: number; rating: number; score: number }[] }>();

/** Top 10 barbers of a city in a month: finished cuts that month, weighted by rating (reviews break ties early on). */
export function awards(countryCode: string, city: string, month: string) {
  const key = `${countryCode}:${city}:${month}`;
  const hit = awardCache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.list;
  const cuts = new Map<string, number>();
  for (const b of db.bookings) if (b.status === "completed" && monthOf(b.startsAt) === month && b.serviceId !== "consultation") cuts.set(b.barberId, (cuts.get(b.barberId) ?? 0) + 1);
  const list = db.barbers
    .filter((b) => isLive(b) && b.countryCode === countryCode && b.city.toLowerCase() === city.toLowerCase() && b.ratingCount > 0)
    .map((b) => {
      const rating = b.ratingSum / b.ratingCount;
      const n = cuts.get(b.id) ?? 0;
      return { barber: b, cuts: n, rating, score: (n * 2 + Math.min(b.ratingCount, 200) / 10) * rating };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  awardCache.set(key, { at: Date.now(), list });
  return list;
}

/** "Top 10 in Dubai · September" for a barber, from last month's awards. */
export function awardOf(b: Barber) {
  const m = lastMonth();
  const i = awards(b.countryCode, b.city, m).findIndex((x) => x.barber.id === b.id);
  return i >= 0 ? { rank: i + 1, month: m, label: `Top 10 in ${b.city} · ${monthLabel(m).split(" ")[0]}` } : null;
}

// ---------- Live updates (server-sent events) ----------

const streams = new Map<string, Set<Response>>();
onNotification((userId, item) => {
  for (const res of streams.get(userId) ?? []) res.write(`event: notification\ndata: ${JSON.stringify(item)}\n\n`);
});
function push(userId: string, event: string, data: unknown) {
  for (const res of streams.get(userId) ?? []) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ---------- Chat ----------

const chatSide = (req: Request, c: Chat): "customer" | "barber" | null => (c.customerId === req.user!.id ? "customer" : req.user!.barberId === c.barberId ? "barber" : null);
function chatView(c: Chat, side: "customer" | "barber") {
  const barber = getBarber(c.barberId);
  const customer = db.users.find((u) => u.id === c.customerId);
  const readAt = side === "customer" ? c.customerReadAt : c.barberReadAt;
  const other = side === "customer" ? "barber" : "customer";
  return {
    id: c.id,
    with: side === "customer" ? { id: barber.id, name: barber.name, photoUrl: barber.photoUrl } : { id: c.customerId, name: customer?.name ?? "Client", photoUrl: customer?.photoUrl ?? "" },
    last: c.messages.at(-1) ?? null,
    unread: c.messages.filter((m) => m.from === other && (!readAt || m.at > readAt)).length,
    updatedAt: c.updatedAt,
  };
}

/**
 * Platform: the team (roles and the activity log), analytics, finance with VAT and a CSV, hotel and company partners,
 * monthly awards, recommendations, tax invoices, chat between customers and barbers, live updates and barbers' payouts.
 */
export function registerPlatformRoutes(app: Express) {
  // ---------- The team ----------
  app.get("/admin/team", requireAdminRole(), (_req, res) => {
    const owners = config.adminEmails.map((email) => ({ email, role: "owner" as AdminRole, fixed: true }));
    const added = Object.entries(db.settings.team ?? {}).map(([email, role]) => ({ email, role, fixed: false }));
    res.json([...owners, ...added].map((m) => ({ ...m, name: db.users.find((u) => u.email === m.email)?.name ?? null })));
  });
  app.put("/admin/team", requireAdminRole(), (req, res) => {
    const { email, role } = parse(z.object({ email: z.string().trim().toLowerCase().email(), role: z.enum(["owner", "operations", "support", "finance"]).nullable() }), req.body);
    if (config.adminEmails.includes(email)) throw new HttpError(400, "That person is an owner set on the server (ADMIN_EMAILS).");
    if (role && !db.users.some((u) => u.email === email && !u.deletedAt)) throw new HttpError(404, "No account with that email yet — ask them to sign up in the app first.");
    const team = { ...db.settings.team };
    if (role) team[email] = role;
    else delete team[email];
    db.settings.team = team;
    logActivity(req, role ? "team.role_set" : "team.removed", email, role ?? undefined);
    const user = db.users.find((u) => u.email === email);
    if (user && role) notify(user.id, { kind: "account", title: "You're on the JB team", body: `You can open the admin panel from Account (${role}).` });
    save();
    res.json({ email, role });
  });
  app.get("/admin/activity", requireAdminRole("operations"), (req, res) => {
    const { q } = parse(z.object({ q: z.string().optional() }), req.query);
    const text = (q ?? "").trim().toLowerCase();
    res.json(db.activity.filter((a) => !text || `${a.action} ${a.target} ${a.by.name} ${a.by.email} ${a.detail ?? ""}`.toLowerCase().includes(text)).slice(-300).reverse());
  });

  // ---------- Analytics ----------
  app.get("/admin/analytics", requireAdminRole("operations", "finance"), (req, res) => {
    const { days } = parse(z.object({ days: z.coerce.number().int().min(7).max(365).default(30) }), req.query);
    const from = Date.now() - days * DAY;
    const made = db.bookings.filter((b) => fromApp(b) && Date.parse(b.createdAt) >= from);
    const paid = made.filter((b) => PAID.has(b.status));
    const cancelled = made.filter((b) => b.status === "cancelled");
    const customers = new Map<string, number>();
    for (const b of db.bookings.filter((x) => fromApp(x) && PAID.has(x.status))) customers.set(b.customerId, (customers.get(b.customerId) ?? 0) + 1);
    const active = new Set(paid.map((b) => b.customerId));
    const newUsers = db.users.filter((u) => u.role === "customer" && u.createdAt && Date.parse(u.createdAt) >= from).length;
    const firstTime = [...active].filter((id) => db.bookings.filter((b) => b.customerId === id && fromApp(b) && PAID.has(b.status) && Date.parse(b.createdAt) < from).length === 0).length;
    const lead = paid.map((b) => (Date.parse(b.startsAt) - Date.parse(b.createdAt)) / 3_600_000).filter((h) => h >= 0).sort((a, b) => a - b);
    const cityRows = new Map<string, { bookings: number; revenue: { currency: string; amount: number }[] }>();
    const serviceRows = new Map<string, number>();
    const byHour = Array.from({ length: 24 }, () => 0);
    const byWeekday = Array.from({ length: 7 }, () => 0);
    for (const b of paid) {
      const barber = db.barbers.find((x) => x.id === b.barberId);
      if (!barber) continue;
      const row = cityRows.get(barber.city) ?? { bookings: 0, revenue: [] };
      row.bookings += 1;
      row.revenue.push({ currency: b.currency, amount: b.amount });
      cityRows.set(barber.city, row);
      const name = findService(barber, b.serviceId)?.name ?? "Consultation";
      serviceRows.set(name, (serviceRows.get(name) ?? 0) + 1);
      const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: cityOf(barber).timeZone, weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date(b.startsAt)).map((x) => [x.type, x.value]));
      byHour[Number(p.hour) % 24]! += 1;
      byWeekday[["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday!)]! += 1;
    }
    const topBarbers = new Map<string, number>();
    for (const b of paid) topBarbers.set(b.barberId, (topBarbers.get(b.barberId) ?? 0) + 1);
    res.json({
      days,
      bookings: { made: made.length, paid: paid.length, cancelled: cancelled.length, cancelRate: made.length ? Math.round((cancelled.length / made.length) * 100) : 0, conversion: made.length ? Math.round((paid.length / made.length) * 100) : 0 },
      customers: { active: active.size, firstTime, returning: active.size - firstTime, newAccounts: newUsers, repeatRate: customers.size ? Math.round(([...customers.values()].filter((n) => n >= 2).length / customers.size) * 100) : 0 },
      averageBooking: byCurrency(paid.map((b) => ({ currency: b.currency, amount: b.amount }))).map((c) => ({ currency: c.currency, amount: Math.round(c.amount / paid.filter((b) => b.currency === c.currency).length) })),
      leadTimeHours: lead.length ? Math.round(lead[Math.floor(lead.length / 2)]!) : 0,
      byCity: [...cityRows].map(([city, r]) => ({ city, bookings: r.bookings, revenue: byCurrency(r.revenue) })).sort((a, b) => b.bookings - a.bookings).slice(0, 12),
      byService: [...serviceRows].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8),
      byHour, byWeekday,
      topBarbers: [...topBarbers].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, count]) => {
        const b = db.barbers.find((x) => x.id === id);
        return { id, name: b?.name ?? "Barber", photoUrl: b?.photoUrl ?? "", city: b?.city ?? "", bookings: count };
      }),
    });
  });

  // ---------- Finance: a month's money by currency, VAT on JB's fees, and a CSV for the accountant ----------
  function financeRows(month: string) {
    const rows: { date: string; type: string; ref: string; customer: string; barber: string; currency: string; amount: number; jbFee: number; vat: number }[] = [];
    const who = (id: string) => db.users.find((u) => u.id === id)?.name ?? "";
    const barberName = (id: string) => db.barbers.find((b) => b.id === id)?.name ?? "";
    for (const b of db.bookings) {
      if (!fromApp(b) || monthOf(b.startsAt) !== month) continue;
      if (PAID.has(b.status)) {
        const fee = bookingFee(b);
        rows.push({ date: b.startsAt, type: "booking", ref: b.id, customer: b.guest?.name ?? who(b.customerId), barber: barberName(b.barberId), currency: b.currency, amount: b.amount, jbFee: fee, vat: vatIn(fee, b.currency) });
        if (b.tip) rows.push({ date: b.startsAt, type: "tip", ref: b.id, customer: who(b.customerId), barber: barberName(b.barberId), currency: b.currency, amount: b.tip, jbFee: 0, vat: 0 });
      } else if (b.status === "cancelled" && b.lateFee) {
        const fee = platformFee(b.lateFee);
        rows.push({ date: b.startsAt, type: "late_cancellation", ref: b.id, customer: who(b.customerId), barber: barberName(b.barberId), currency: b.currency, amount: b.lateFee, jbFee: fee, vat: vatIn(fee, b.currency) });
      }
    }
    for (const o of db.orders) {
      if (["pending_payment", "cancelled"].includes(o.status) || monthOf(o.createdAt) !== month) continue;
      rows.push({ date: o.createdAt, type: "products", ref: o.id, customer: who(o.customerId), barber: "", currency: o.currency, amount: o.amount, jbFee: o.amount, vat: vatIn(o.amount, o.currency) });
    }
    for (const h of db.hires) {
      if (["pending_payment", "cancelled"].includes(h.status) || monthOf(h.startsAt) !== month) continue;
      const fee = platformFee(h.amount);
      rows.push({ date: h.startsAt, type: "private_hire", ref: h.id, customer: who(h.customerId), barber: "", currency: h.currency, amount: h.amount, jbFee: fee, vat: vatIn(fee, h.currency) });
    }
    for (const p of db.purchases) {
      if (p.status !== "paid" || monthOf(p.createdAt ?? "") !== month || p.kind === "tip") continue;
      rows.push({ date: p.createdAt ?? "", type: p.kind, ref: p.id, customer: who(p.userId), barber: "", currency: p.currency, amount: p.amount, jbFee: p.amount, vat: vatIn(p.amount, p.currency) });
    }
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }
  app.get("/admin/finance", requireAdminRole("finance"), (req, res) => {
    const { month } = parse(z.object({ month: Month.default(thisMonth()) }), req.query);
    const rows = financeRows(month);
    const sum = (type: string | null, k: "amount" | "jbFee" | "vat") => byCurrency(rows.filter((r) => type === null || r.type === type).map((r) => ({ currency: r.currency, amount: r[k] })));
    const refunds = byCurrency(db.bookings.filter((b) => fromApp(b) && b.status === "cancelled" && b.paymentIntentId && monthOf(b.startsAt) === month).map((b) => ({ currency: b.currency, amount: b.amount + (b.tip ?? 0) - (b.lateFee ?? 0) })));
    const commissions = byCurrency(db.bookings.filter((b) => b.partnerId && PAID.has(b.status) && monthOf(b.startsAt) === month).map((b) => ({ currency: b.currency, amount: partnerCommission(b) })));
    res.json({
      month, label: monthLabel(month), vatRegistered: !!config.vatTrn, vatPercent: config.vatPercent,
      lines: [
        { key: "bookings", label: "Bookings paid in the app", amounts: sum("booking", "amount") },
        { key: "fees", label: "JB fees on bookings", amounts: sum("booking", "jbFee") },
        { key: "late", label: "Late-cancellation fees kept", amounts: sum("late_cancellation", "amount") },
        { key: "tips", label: "Tips (passed to barbers)", amounts: sum("tip", "amount") },
        { key: "products", label: "JB's Fresh products", amounts: sum("products", "amount") },
        { key: "hires", label: "Private hires", amounts: sum("private_hire", "amount") },
        { key: "club", label: "The Club and gift cards", amounts: byCurrency(rows.filter((r) => r.type === "membership" || r.type === "gift").map((r) => ({ currency: r.currency, amount: r.amount }))) },
        { key: "refunds", label: "Refunded to customers", amounts: refunds },
        { key: "partners", label: "Owed to hotel partners", amounts: commissions },
        { key: "vat", label: config.vatTrn ? `VAT in JB's income (${config.vatPercent}%)` : "VAT (add VAT_TRN once registered)", amounts: sum(null, "vat") },
      ],
      transactions: rows.length,
    });
  });
  app.get("/admin/finance.csv", requireAdminRole("finance"), (req, res) => {
    const { month } = parse(z.object({ month: Month.default(thisMonth()) }), req.query);
    const cell = (v: string | number) => (typeof v === "number" ? (v / 100).toFixed(2) : `"${v.replace(/"/g, '""')}"`);
    const lines = ["date,type,reference,customer,barber,currency,amount,jb_fee,vat", ...financeRows(month).map((r) => [cell(r.date.slice(0, 10)), cell(r.type), cell(r.ref), cell(r.customer), cell(r.barber), cell(r.currency.toUpperCase()), cell(r.amount), cell(r.jbFee), cell(r.vat)].join(","))];
    res.setHeader("content-type", "text/csv; charset=utf-8");
    res.setHeader("content-disposition", `attachment; filename="jb-finance-${month}.csv"`);
    res.send(lines.join("\n"));
  });

  // ---------- Hotel and company partners ----------
  const partnerView = (p: Partner) => {
    const mine = db.bookings.filter((b) => b.partnerId === p.id && PAID.has(b.status));
    const month = mine.filter((b) => monthOf(b.startsAt) === thisMonth());
    return {
      ...p, link: `${config.appUrl}/p/${p.code}`, bookings: mine.length, bookingsThisMonth: month.length,
      revenueThisMonth: byCurrency(month.map((b) => ({ currency: b.currency, amount: b.amount }))),
      owedThisMonth: byCurrency(month.map((b) => ({ currency: b.currency, amount: partnerCommission(b) }))),
      discountsThisMonth: byCurrency(month.map((b) => ({ currency: b.currency, amount: b.partnerDiscount ?? 0 }))),
    };
  };
  const PartnerInput = z.object({
    kind: z.enum(["hotel", "corporate"]), name: z.string().trim().min(2).max(80),
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,20}$/, "Code: 3–20 letters, numbers or dashes"),
    discountPercent: z.number().int().min(0).max(50).default(0), commissionPercent: z.number().int().min(0).max(30).default(0),
    emailDomain: z.string().trim().toLowerCase().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, "Email domain like company.com").optional().or(z.literal("")),
    contactEmail: z.string().trim().toLowerCase().email(), active: z.boolean().default(true),
  });
  app.get("/admin/partners", requireAdminRole("operations", "finance"), (_req, res) => {
    res.json(db.partners.map(partnerView).sort((a, b) => b.bookings - a.bookings));
  });
  app.post("/admin/partners", requireAdminRole("operations"), (req, res) => {
    const body = parse(PartnerInput, req.body);
    if (db.partners.some((p) => p.code === body.code)) throw new HttpError(409, "That code is taken.");
    const p: Partner = { id: newId(), ...body, emailDomain: body.emailDomain || undefined, createdAt: new Date().toISOString() };
    db.partners.push(p);
    logActivity(req, "partner.added", p.name, `${p.kind} · ${p.code}`);
    save();
    res.status(201).json(partnerView(p));
  });
  app.patch("/admin/partners/:id", requireAdminRole("operations"), (req, res) => {
    const p = db.partners.find((x) => x.id === req.params.id);
    if (!p) throw new HttpError(404, "Partner not found.");
    const body = parse(PartnerInput.partial(), req.body);
    if (body.code && db.partners.some((x) => x.code === body.code && x.id !== p.id)) throw new HttpError(409, "That code is taken.");
    Object.assign(p, body, body.emailDomain !== undefined ? { emailDomain: body.emailDomain || undefined } : {});
    logActivity(req, "partner.changed", p.name, Object.keys(body).join(", "));
    save();
    res.json(partnerView(p));
  });
  // The welcome a guest sees after scanning a hotel's QR code (or typing a company code).
  app.get("/partners/:code", (req, res) => {
    const p = db.partners.find((x) => x.code === String(req.params.code).toUpperCase() && x.active);
    if (!p) throw new HttpError(404, "That code isn't valid.");
    res.json({ code: p.code, name: p.name, kind: p.kind, discountPercent: p.kind === "corporate" ? p.discountPercent : 0 });
  });

  // ---------- Awards and recommendations ----------
  app.get("/awards", (req, res) => {
    const f = parse(z.object({ country: z.string().length(2).default("AE"), city: z.string().default("Dubai"), month: Month.optional() }), req.query);
    const month = f.month ?? lastMonth();
    res.json({
      month, label: monthLabel(month), city: f.city,
      list: awards(f.country, f.city, month).map((x, i) => ({ rank: i + 1, cuts: x.cuts, barber: barberView(x.barber) })),
    });
  });
  app.get("/me/recommendations", requireAuth, (req, res) => {
    const u = req.user!;
    const mine = db.bookings.filter((b) => b.customerId === u.id && b.status !== "pending_payment");
    const booked = new Set(mine.map((b) => b.barberId));
    const liked = [...booked, ...(u.favourites ?? [])].map((id) => db.barbers.find((b) => b.id === id)).filter((b): b is Barber => !!b);
    const tastes = new Map<string, number>();
    for (const b of liked) for (const s of b.specialties) tastes.set(s, (tastes.get(s) ?? 0) + 1);
    const city = liked[0]?.city ?? u.city ?? "Dubai";
    const country = liked[0]?.countryCode ?? u.countryCode ?? "AE";
    const LEVEL_BONUS = { new: 0, rising: 0.2, pro: 0.5, elite: 0.8 };
    const scored = db.barbers
      .filter((b) => isLive(b) && !booked.has(b.id) && !(u.favourites ?? []).includes(b.id) && b.countryCode === country && b.city.toLowerCase() === city.toLowerCase())
      .map((b) => {
        const overlap = b.specialties.filter((s) => tastes.has(s));
        const rating = b.ratingCount ? b.ratingSum / b.ratingCount : 4;
        const top = [...overlap].sort((a, c) => (tastes.get(c) ?? 0) - (tastes.get(a) ?? 0))[0];
        return { b, score: overlap.length * 1.5 + rating + LEVEL_BONUS[levelOf(b)], reason: top ? `Because you like ${top}` : `Top rated in ${b.city}` };
      })
      .sort((a, c) => c.score - a.score)
      .slice(0, 8);
    res.json(scored.map(({ b, reason }) => ({ ...barberView(b), reason })));
  });

  // ---------- Tax invoice / receipt ----------
  app.get("/bookings/:id/invoice", requireAuth, (req, res) => {
    const b = db.bookings.find((x) => x.id === req.params.id && (x.customerId === req.user!.id || req.user!.barberId === x.barberId || adminRole(req.user)));
    if (!b) throw new HttpError(404, "Booking not found.");
    if (!PAID.has(b.status) && !b.lateFee) throw new HttpError(400, "There's no invoice until the booking is paid.");
    const barber = getBarber(b.barberId);
    const service = findService(barber, b.serviceId);
    const customer = db.users.find((u) => u.id === b.customerId);
    const extras = (b.extras ?? []).map((id) => barber.services.find((s) => s.id === id)).filter((s) => !!s);
    const charged = b.status === "cancelled" ? b.lateFee ?? 0 : b.amount;
    const lines = b.status === "cancelled"
      ? [{ description: `Late cancellation — ${service?.name ?? "appointment"} with ${barber.name}`, amount: charged }]
      : [
        { description: `${service?.name ?? "Appointment"} with ${barber.name}`, amount: b.amount - extras.reduce((t, s) => t + s!.price, 0) - (b.locationType === "home" ? barber.homeVisitFee : 0) - (b.travelFee ?? 0) },
        ...extras.map((s) => ({ description: s!.name, amount: s!.price })),
        ...(b.locationType === "home" ? [{ description: "Home visit travel", amount: barber.homeVisitFee }] : []),
        ...(b.travelFee ? [{ description: `Extra travel (about ${b.distanceKm} km)`, amount: b.travelFee }] : []),
      ].filter((l) => l.amount > 0);
    const vat = vatIn(charged, b.currency);
    res.json({
      number: `JB-${b.startsAt.slice(0, 7).replace("-", "")}-${b.id.slice(0, 6).toUpperCase()}`,
      title: config.vatTrn && b.currency === "aed" ? "Tax invoice" : "Receipt",
      issuedAt: b.createdAt, serviceDate: b.startsAt, timeZone: cityOf(barber).timeZone,
      seller: { name: config.companyName, address: config.companyAddress, trn: config.vatTrn ?? null, onBehalfOf: barber.name },
      customer: { name: b.guest?.name ?? customer?.name ?? "Customer", email: customer?.email ?? "" },
      lines, currency: b.currency,
      discounts: [...(b.creditUsed ? [{ description: "Gift credit", amount: b.creditUsed }] : []), ...(b.partnerDiscount ? [{ description: "Company discount", amount: b.partnerDiscount }] : [])],
      total: charged, vat: vat ? { percent: config.vatPercent, amount: vat } : null,
      tip: b.status === "cancelled" ? 0 : b.tip ?? 0,
      note: b.coveredBy === "membership" ? "Service included in your Club membership." : vat ? `Prices include VAT at ${config.vatPercent}%.` : "",
    });
  });

  // ---------- Chat between customers and barbers ----------
  app.get("/chats", requireAuth, (req, res) => {
    const u = req.user!;
    res.json(db.chats.filter((c) => c.customerId === u.id || (u.barberId && c.barberId === u.barberId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((c) => chatView(c, c.customerId === u.id ? "customer" : "barber")));
  });
  app.post("/chats", requireAuth, (req, res) => {
    const { barberId } = parse(z.object({ barberId: z.string() }), req.body);
    const u = req.user!;
    const barber = getBarber(barberId);
    // Only after a booking, so barbers aren't spammed.
    if (!db.bookings.some((b) => b.customerId === u.id && b.barberId === barber.id && b.status !== "pending_payment")) throw new HttpError(403, `Book ${barber.name.split(" ")[0]} first, then you can message them.`);
    let chat = db.chats.find((c) => c.customerId === u.id && c.barberId === barber.id);
    if (!chat) {
      chat = { id: newId(), customerId: u.id, barberId: barber.id, messages: [], updatedAt: new Date().toISOString() };
      db.chats.push(chat);
      save();
    }
    res.json(chatView(chat, "customer"));
  });
  app.get("/chats/:id", requireAuth, (req, res) => {
    const c = db.chats.find((x) => x.id === req.params.id);
    const side = c && chatSide(req, c);
    if (!c || !side) throw new HttpError(404, "Conversation not found.");
    if (side === "customer") c.customerReadAt = new Date().toISOString();
    else c.barberReadAt = new Date().toISOString();
    save();
    res.json({ ...chatView(c, side), side, messages: c.messages.slice(-200) });
  });
  app.post("/chats/:id/messages", requireAuth, rateLimit("chat", 40, 60_000, "You're sending messages too fast."), (req, res) => {
    const { text } = parse(z.object({ text: z.string().trim().min(1, "Write a message").max(1000) }), req.body);
    const c = db.chats.find((x) => x.id === req.params.id);
    const side = c && chatSide(req, c);
    if (!c || !side) throw new HttpError(404, "Conversation not found.");
    const msg = { id: newId(), from: side, text, at: new Date().toISOString() };
    c.messages.push(msg);
    if (c.messages.length > 500) c.messages.splice(0, c.messages.length - 500);
    c.updatedAt = msg.at;
    if (side === "customer") c.customerReadAt = msg.at;
    else c.barberReadAt = msg.at;
    const barber = getBarber(c.barberId);
    const to = side === "customer" ? db.users.find((u) => u.role === "barber" && u.barberId === c.barberId)?.id : c.customerId;
    if (to) {
      notify(to, { kind: "chat", title: side === "customer" ? `Message from ${req.user!.name.split(" ")[0]}` : `${barber.name.split(" ")[0]} replied`, body: text.slice(0, 160) });
      push(to, "chat", { chatId: c.id, message: msg });
    }
    save();
    res.status(201).json(msg);
  });

  // ---------- Live updates: alerts and chat messages arrive as they happen (web; phones also get push) ----------
  app.get("/events", (req, res) => {
    const token = String(req.query.token ?? "");
    const userId = token ? db.sessions[token] : undefined;
    if (!userId) throw new HttpError(401, "Please sign in.");
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", connection: "keep-alive", "x-accel-buffering": "no" });
    res.write(`event: ready\ndata: {}\n\n`);
    const set = streams.get(userId) ?? new Set<Response>();
    set.add(res);
    streams.set(userId, set);
    const ping = setInterval(() => res.write(`: ping\n\n`), 25_000);
    req.on("close", () => {
      clearInterval(ping);
      set.delete(res);
      if (!set.size) streams.delete(userId);
    });
  });

  // ---------- Barbers' payouts (Stripe Connect Express) ----------
  app.get("/barbers/me/payouts", requireAuth, async (req, res) => {
    const u = req.user!;
    if (!u.barberId) throw new HttpError(403, "Only barbers can do this.");
    const b = getBarber(u.barberId);
    if (!stripe) return res.json({ available: false, connected: false, payoutsEnabled: false, note: "Payouts switch on when JB connects Stripe. Until then JB pays you by bank transfer every week." });
    if (!b.stripeAccountId) return res.json({ available: true, connected: false, payoutsEnabled: false });
    const acct = await stripe.accounts.retrieve(b.stripeAccountId);
    b.payoutsEnabled = !!acct.payouts_enabled && !!acct.charges_enabled;
    save();
    res.json({ available: true, connected: true, payoutsEnabled: b.payoutsEnabled, missing: acct.requirements?.currently_due ?? [] });
  });
  app.post("/barbers/me/payouts", requireAuth, async (req, res) => {
    const u = req.user!;
    if (!u.barberId) throw new HttpError(403, "Only barbers can do this.");
    if (!stripe) throw new HttpError(503, "Payouts aren't switched on yet. JB pays you by bank transfer every week until then.");
    const b = getBarber(u.barberId);
    if (!b.stripeAccountId) {
      const acct = await stripe.accounts.create({ type: "express", country: b.countryCode, email: u.email, business_type: "individual", capabilities: { card_payments: { requested: true }, transfers: { requested: true } }, metadata: { barberId: b.id } });
      b.stripeAccountId = acct.id;
      save();
    }
    const link = await stripe.accountLinks.create({ account: b.stripeAccountId, refresh_url: `${config.appUrl}/business/payouts`, return_url: `${config.appUrl}/business/payouts?done=1`, type: "account_onboarding" });
    res.json({ url: link.url });
  });
}
