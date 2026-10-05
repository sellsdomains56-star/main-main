import { config } from "./config.js";
import { cityOf, CONSULTATION, findService, getBarber } from "./common.js";
import { db, newId, save } from "./db.js";
import type { AppNotification, Booking, NotificationKind } from "./types.js";

const KEEP_PER_USER = 100;

/** Stores an alert for the user's inbox and pushes it to their phones. */
export function notify(userId: string, n: { kind: NotificationKind; title: string; body: string; bookingId?: string }): AppNotification {
  const item: AppNotification = { id: newId(), userId, ...n, read: false, createdAt: new Date().toISOString() };
  db.notifications.push(item);
  const mine = db.notifications.filter((x) => x.userId === userId);
  if (mine.length > KEEP_PER_USER) {
    const drop = new Set(mine.slice(0, mine.length - KEEP_PER_USER).map((x) => x.id));
    db.notifications = db.notifications.filter((x) => !drop.has(x.id));
  }
  save();
  void sendPush(userId, item);
  return item;
}

/** Sends through Expo's push service (works for both iOS and Android builds). */
async function sendPush(userId: string, item: AppNotification) {
  const user = db.users.find((u) => u.id === userId);
  const tokens = user?.pushTokens ?? [];
  if (!config.pushEnabled || !tokens.length) return;
  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json", ...(config.expoAccessToken ? { authorization: `Bearer ${config.expoAccessToken}` } : {}) },
      body: JSON.stringify(tokens.map((to) => ({ to, title: item.title, body: item.body, sound: "default", channelId: "default", data: { notificationId: item.id, bookingId: item.bookingId, kind: item.kind } }))),
    });
    const json = (await res.json()) as { data?: { status: string; details?: { error?: string } }[] };
    // Forget phones that uninstalled the app.
    const gone = new Set((json.data ?? []).map((t, i) => (t.status === "error" && t.details?.error === "DeviceNotRegistered" ? tokens[i] : null)).filter(Boolean));
    if (gone.size && user) {
      user.pushTokens = tokens.filter((t) => !gone.has(t));
      save();
    }
  } catch (err) {
    console.warn("Push notification failed:", (err as Error).message);
  }
}

// ---------- Booking events ----------

const first = (name: string) => name.split(" ")[0];

function details(b: Booking) {
  const barber = getBarber(b.barberId);
  const tz = cityOf(barber).timeZone;
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, ...o }).format(new Date(b.startsAt));
  const service = findService(barber, b.serviceId)?.name ?? (b.serviceId === CONSULTATION.id ? CONSULTATION.name : "Appointment");
  const customer = db.users.find((u) => u.id === b.customerId);
  const barberUser = db.users.find((u) => u.role === "barber" && u.barberId === b.barberId);
  return {
    barber,
    service,
    customerName: customer?.name ?? "A customer",
    barberUserId: barberUser?.id,
    when: `${fmt({ weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} (${barber.city} time)`,
    time: fmt({ hour: "2-digit", minute: "2-digit" }),
    consult: b.serviceId === CONSULTATION.id,
    where: { shop: `at ${barber.shopAddress}`, home: `at ${b.address}`, video: "by video call", phone: "by phone" }[b.locationType],
  };
}

/** Paid (or free) and confirmed: tell the customer, and the barber about their new booking. */
export function bookingConfirmed(b: Booking) {
  const d = details(b);
  // Booked for later today: the confirmation doubles as the "coming up" reminder.
  if (Date.parse(b.startsAt) - Date.now() < 24 * 3_600_000) b.remindedDay = true;
  notify(b.customerId, {
    kind: "booking_confirmed",
    title: d.consult ? "Consultation booked" : "You're booked",
    body: `${d.service} with ${d.barber.name}, ${d.when}, ${d.where}.`,
    bookingId: b.id,
  });
  if (d.barberUserId) {
    notify(d.barberUserId, {
      kind: "new_booking",
      title: d.consult ? "New consultation" : "New booking",
      body: `${d.customerName} booked ${d.service}, ${d.when}, ${d.where}.`,
      bookingId: b.id,
    });
  }
}

export function barberOnTheWay(b: Booking) {
  const d = details(b);
  notify(b.customerId, {
    kind: "on_the_way",
    title: `${first(d.barber.name)} is on the way`,
    body: `Heading to ${b.address} for your ${d.time} ${d.service.toLowerCase()}.`,
    bookingId: b.id,
  });
}

export function bookingCompleted(b: Booking) {
  const d = details(b);
  if (d.consult) return;
  notify(b.customerId, { kind: "completed", title: "How was your cut?", body: `Rate ${d.barber.name} — it helps others choose.`, bookingId: b.id });
}

/** Tells the other side. A booking cancelled before it was paid never reached the barber, so they aren't told. */
export function bookingCancelled(b: Booking, wasConfirmed: boolean, byUserId: string) {
  const d = details(b);
  if (byUserId === b.customerId) {
    if (wasConfirmed && d.barberUserId) notify(d.barberUserId, { kind: "cancelled", title: "Booking cancelled", body: `${d.customerName} cancelled ${d.service}, ${d.when}.`, bookingId: b.id });
  } else {
    notify(b.customerId, { kind: "cancelled", title: "Booking cancelled", body: `${d.barber.name} cancelled ${d.service}, ${d.when}.${b.amount ? " You'll get a full refund." : ""}`, bookingId: b.id });
  }
}

// ---------- Reminders ----------

/** Sends the "tomorrow" (24h) and "in an hour" reminders that are due. Runs every minute. */
export function sendDueReminders(now = new Date()) {
  let sent = false;
  for (const b of db.bookings) {
    if (b.status !== "confirmed") continue;
    const left = Date.parse(b.startsAt) - now.getTime();
    if (left <= 0) continue;
    const d = details(b);
    if (!b.remindedHour && left <= 60 * 60_000) {
      sent = true;
      b.remindedHour = true;
      b.remindedDay = true;
      const customerBody = {
        home: `${first(d.barber.name)} comes to ${b.address} at ${d.time}. We'll tell you when they're on the way.`,
        shop: `See you ${d.where} at ${d.time}.`,
        video: `Your video call with ${d.barber.name} starts at ${d.time} — join from Bookings.`,
        phone: `${first(d.barber.name)} will call you at ${d.time} on ${b.phone}.`,
      }[b.locationType];
      notify(b.customerId, { kind: "reminder", title: `${d.service} in 1 hour`, body: customerBody, bookingId: b.id });
      if (d.barberUserId) notify(d.barberUserId, { kind: "reminder", title: `${d.customerName} in 1 hour`, body: `${d.service} at ${d.time}, ${d.where}.`, bookingId: b.id });
    } else if (!b.remindedDay && left <= 24 * 3_600_000) {
      sent = true;
      b.remindedDay = true;
      notify(b.customerId, { kind: "reminder", title: "Coming up", body: `${d.service} with ${d.barber.name}, ${d.when}, ${d.where}.`, bookingId: b.id });
    }
  }
  if (sent) save();
}

export function startReminderLoop() {
  sendDueReminders();
  return setInterval(() => sendDueReminders(), 60_000);
}
