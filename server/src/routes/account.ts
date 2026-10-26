import { createHash, randomBytes } from "node:crypto";
import type { Express, Request } from "express";
import { z } from "zod";
import { createSession, hashPassword, publicUser, requireAuth } from "../auth.js";
import { bookingView } from "../bookings.js";
import { HttpError, parse } from "../common.js";
import { config } from "../config.js";
import { db, save } from "../db.js";
import { letter, sendEmail } from "../email.js";
import { bookingCancelled, notify } from "../notify.js";
import { refund } from "../payments.js";
import type { User } from "../types.js";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const HOUR = 3_600_000;

// ---------- Too many tries ----------

const tries = new Map<string, { count: number; first: number }>();

/** Counts attempts per key (email + address) and refuses after `max` within `windowMs`. */
export function limit(key: string, max: number, windowMs: number, message: string) {
  const now = Date.now();
  const t = tries.get(key);
  if (!t || now - t.first > windowMs) {
    tries.set(key, { count: 1, first: now });
    return;
  }
  t.count += 1;
  if (t.count > max) throw new HttpError(429, message);
}
export const clearTries = (key: string) => tries.delete(key);
export const loginKey = (req: Request, email: string) => `login:${email}:${req.ip}`;

/** Everything a person has with us, as one file (UAE data protection: their right to a copy). */
function exportFor(user: User) {
  const mine = <T extends { customerId?: string; userId?: string }>(list: T[]) => list.filter((x) => x.customerId === user.id || x.userId === user.id);
  return {
    exportedAt: new Date().toISOString(),
    account: publicUser(user),
    bookings: db.bookings.filter((b) => b.customerId === user.id).map(bookingView),
    reviews: db.reviews.filter((r) => r.customerId === user.id).map(({ customerId: _c, ...r }) => r),
    orders: mine(db.orders),
    privateHires: mine(db.hires),
    purchases: mine(db.purchases),
    giftCardsBought: db.giftCards.filter((g) => g.buyerId === user.id),
    supportMessages: mine(db.tickets),
    conversationsWithConcierge: db.conversations.filter((c) => c.ownerKey === user.id).map((c) => ({ id: c.id, createdAt: c.createdAt, messages: c.display })),
    alerts: db.notifications.filter((n) => n.userId === user.id),
    savedReels: db.reels.filter((r) => r.savedBy?.includes(user.id)).map((r) => r.id),
  };
}

/** Password reset, deleting an account, a copy of your data and which alerts you get. */
export function registerAccountRoutes(app: Express) {
  // "Forgot password": always answers the same, so it never reveals who has an account.
  app.post("/auth/forgot", async (req, res) => {
    const { email } = parse(z.object({ email: z.string().trim().toLowerCase().email("Enter your email") }), req.body);
    limit(`forgot:${email}`, 5, HOUR, "We've sent a few links already. Check your inbox and spam, or try again in an hour.");
    const user = db.users.find((u) => u.email === email && !u.deletedAt);
    if (user) {
      const token = randomBytes(32).toString("hex");
      db.resetTokens = db.resetTokens.filter((t) => t.userId !== user.id && Date.parse(t.expires) > Date.now());
      db.resetTokens.push({ hash: sha(token), userId: user.id, expires: new Date(Date.now() + HOUR).toISOString() });
      save();
      await sendEmail({
        to: user.email,
        subject: "Reset your JB Always Fresh password",
        text: letter(user.name, [
          "Someone (hopefully you) asked to reset your password. Choose a new one here:",
          `${config.appUrl}/reset-password?token=${token}`,
          "",
          "The link works for one hour. If you didn't ask, ignore this email — your password stays the same.",
        ]),
      });
    }
    res.status(204).end();
  });

  app.post("/auth/reset", (req, res) => {
    const body = parse(z.object({ token: z.string().min(20), password: z.string().min(8, "Password must be at least 8 characters") }), req.body);
    const entry = db.resetTokens.find((t) => t.hash === sha(body.token));
    if (!entry || Date.parse(entry.expires) < Date.now()) throw new HttpError(400, "This link has expired. Ask for a new one.");
    const user = db.users.find((u) => u.id === entry.userId && !u.deletedAt);
    if (!user) throw new HttpError(400, "This link has expired. Ask for a new one.");
    user.passwordHash = hashPassword(body.password);
    db.resetTokens = db.resetTokens.filter((t) => t !== entry);
    // Signed out everywhere else: a reset usually means the old password wasn't safe.
    for (const [token, id] of Object.entries(db.sessions)) if (id === user.id) delete db.sessions[token];
    clearTries(`forgot:${user.email}`);
    save();
    notify(user.id, { kind: "account", title: "Password changed", body: "Your password was changed and other devices were signed out. Contact support if this wasn't you." });
    res.json({ token: createSession(user.id), user: publicUser(user) });
  });

  // Which alerts reach the phone (bookings, payments and account messages always do).
  app.patch("/me/alerts", requireAuth, (req, res) => {
    const body = parse(z.object({ reminders: z.boolean().optional(), offers: z.boolean().optional(), social: z.boolean().optional(), tips: z.boolean().optional() }), req.body);
    req.user!.alerts = { ...req.user!.alerts, ...body };
    save();
    res.json(publicUser(req.user!));
  });

  // A copy of everything: shown in the app, or emailed as a file.
  app.get("/me/export", requireAuth, (req, res) => {
    res.json(exportFor(req.user!));
  });
  app.post("/me/export", requireAuth, async (req, res) => {
    const user = req.user!;
    limit(`export:${user.id}`, 3, 24 * HOUR, "We've emailed your data a few times today. Try again tomorrow.");
    const data = JSON.stringify(exportFor(user), null, 2);
    await sendEmail({
      to: user.email,
      subject: "Your JB Always Fresh data",
      text: letter(user.name, ["Here's a copy of everything we hold about you, attached as a file.", "Questions? Reply to this email or open Account → Help centre."]),
      attachments: [{ filename: "jb-always-fresh-my-data.json", content: Buffer.from(data).toString("base64") }],
    });
    res.status(202).json({ sentTo: user.email });
  });

  // Delete the account: upcoming bookings are cancelled and refunded, personal details are removed.
  // Past bookings stay (without the name) because barbers and the tax rules need them.
  app.delete("/me", requireAuth, async (req, res) => {
    const user = req.user!;
    parse(z.object({ confirm: z.literal(true, { message: "Confirm to delete your account." }) }), req.body);
    const now = Date.now();
    const upcoming = db.bookings.filter((b) => (b.customerId === user.id || (user.barberId && b.barberId === user.barberId)) && ["pending_payment", "confirmed", "on_the_way"].includes(b.status) && Date.parse(b.startsAt) > now);
    for (const b of upcoming) {
      const wasPaid = b.status !== "pending_payment";
      if (wasPaid && b.paymentIntentId) await refund(b.paymentIntentId).catch(() => {});
      b.status = "cancelled";
      if (wasPaid) bookingCancelled(b, true, user.id);
    }
    if (user.barberId) {
      const barber = db.barbers.find((b) => b.id === user.barberId);
      if (barber) Object.assign(barber, { status: "suspended", offline: true });
    }
    const email = user.email;
    const name = user.name;
    Object.assign(user, {
      name: "Deleted account", email: `deleted+${user.id}@deleted.jbalwaysfresh.invalid`, passwordHash: hashPassword(randomBytes(24).toString("hex")),
      deletedAt: new Date().toISOString(),
    });
    for (const k of ["appleSub", "googleSub", "pushTokens", "preferences", "credit", "manages", "alerts", "countryCode", "city", "membership"] as const) delete user[k];
    for (const r of db.reviews) if (r.customerId === user.id) r.customerName = "Former customer";
    db.conversations = db.conversations.filter((c) => c.ownerKey !== user.id);
    db.notifications = db.notifications.filter((n) => n.userId !== user.id);
    db.waitlist = db.waitlist.filter((w) => w.userId !== user.id);
    db.resetTokens = db.resetTokens.filter((t) => t.userId !== user.id);
    for (const [token, id] of Object.entries(db.sessions)) if (id === user.id) delete db.sessions[token];
    save();
    void sendEmail({ to: email, subject: "Your JB Always Fresh account is deleted", text: letter(name, ["Your account and personal details are deleted, and any upcoming bookings were cancelled and refunded.", "We're sorry to see you go — you're always welcome back."]) });
    res.status(204).end();
  });
}
