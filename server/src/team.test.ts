import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

process.env.ADMIN_EMAILS = "boss@alwaysfresh.app";
const { createApp } = await import("./app.js");
const { db } = await import("./db.js");

let base = "";
const server = createApp().listen(0);
before(() => {
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

async function call(path: string, init: { method?: string; body?: unknown; token?: string } = {}) {
  const res = await fetch(base + path, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: { "content-type": "application/json", ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json: json as any, headers: res.headers }; // eslint-disable-line @typescript-eslint/no-explicit-any
}
const register = async (name: string, email: string) => (await call("/auth/register", { body: { name, email, password: "password123", countryCode: "AE", city: "Dubai" } })).json;

/** A paid booking with a Dubai barber on the next day with free times. */
async function paidBooking(token: string, barberId = "b19", extra: Record<string, unknown> = {}) {
  for (let i = 2; i < 12; i++) {
    const date = new Date(Date.now() + i * 86_400_000).toISOString().slice(0, 10);
    const { slots } = (await call(`/barbers/${barberId}/availability?date=${date}&serviceId=${barberId}-cut`)).json;
    if (!slots?.length) continue;
    const r = await call("/bookings", { token, body: { barberId, serviceId: `${barberId}-cut`, startsAt: slots[0], locationType: "shop", ...extra } });
    assert.equal(r.status, 201, JSON.stringify(r.json));
    await call(`/bookings/${r.json.booking.id}/confirm-payment`, { method: "POST", token });
    return r.json.booking;
  }
  throw new Error("no free days");
}

test("security headers and abuse limits", async () => {
  const r = await call("/health");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.equal(r.headers.get("x-powered-by"), null);
  let last = 0;
  for (let i = 0; i < 12; i++) last = (await call("/auth/forgot", { body: { email: `nobody${i}@example.com` } })).status;
  assert.equal(last, 429);
});

test("team roles: owners add people; each role sees only its part; everything is logged", async () => {
  const boss = await register("Boss Owner", "boss@alwaysfresh.app");
  const sup = await register("Sam Support", "support-person@example.com");
  const fin = await register("Fin Finance", "finance-person@example.com");
  assert.equal((await call("/me", { token: boss.token })).json.adminRole, "owner");
  assert.equal((await call("/admin/team", { method: "PUT", token: sup.token, body: { email: "x@example.com", role: "support" } })).status, 403);
  assert.equal((await call("/admin/team", { method: "PUT", token: boss.token, body: { email: "support-person@example.com", role: "support" } })).status, 200);
  assert.equal((await call("/admin/team", { method: "PUT", token: boss.token, body: { email: "finance-person@example.com", role: "finance" } })).status, 200);
  assert.equal((await call("/admin/team", { method: "PUT", token: boss.token, body: { email: "ghost@example.com", role: "support" } })).status, 404);
  assert.equal((await call("/me", { token: sup.token })).json.adminRole, "support");
  // Support: tickets and bookings, not money or settings.
  assert.equal((await call("/admin/tickets", { token: sup.token })).status, 200);
  assert.equal((await call("/admin/finance", { token: sup.token })).status, 403);
  assert.equal((await call("/admin/settings", { method: "PATCH", token: sup.token, body: { reviewNewBarbers: false } })).status, 403);
  // Finance: money, not barbers.
  assert.equal((await call("/admin/finance", { token: fin.token })).status, 200);
  assert.equal((await call("/admin/barbers/b19", { method: "PATCH", token: fin.token, body: { verified: true } })).status, 403);
  // The owner changes things; the log shows who did what.
  assert.equal((await call("/admin/barbers/b19", { method: "PATCH", token: boss.token, body: { verified: true } })).status, 200);
  const log = (await call("/admin/activity", { token: boss.token })).json as { action: string; by: { email: string } }[];
  assert.ok(log.some((a) => a.action === "barber.verified" && a.by.email === "boss@alwaysfresh.app"));
  assert.ok(log.some((a) => a.action === "team.role_set"));
  assert.equal((await call("/admin/team", { method: "PUT", token: boss.token, body: { email: "support-person@example.com", role: null } })).status, 200);
  assert.equal((await call("/admin/tickets", { token: sup.token })).status, 403, "removed from the team");
});

test("partners: a company code gives a discount; a hotel QR earns a commission", async () => {
  const boss = (await call("/auth/login", { body: { email: "boss@alwaysfresh.app", password: "password123" } })).json;
  const hotel = await call("/admin/partners", { token: boss.token, body: { kind: "hotel", name: "Atlantis The Royal", code: "atlantis", commissionPercent: 10, contactEmail: "concierge@atlantis.example" } });
  assert.equal(hotel.status, 201);
  assert.match(hotel.json.link, /\/p\/ATLANTIS$/);
  const corp = await call("/admin/partners", { token: boss.token, body: { kind: "corporate", name: "Emirates Group", code: "EMIRATES", discountPercent: 20, emailDomain: "emirates.example", contactEmail: "hr@emirates.example" } });
  assert.equal(corp.status, 201);
  assert.equal((await call("/partners/atlantis")).json.name, "Atlantis The Royal");
  assert.equal((await call("/partners/NOPE")).status, 404);

  const guest = await register("Hotel Guest", "guest@example.com");
  const b1 = await paidBooking(guest.token, "b19", { partner: "ATLANTIS" });
  const full = db.barbers.find((b) => b.id === "b19")!.services.find((s) => s.id === "b19-cut")!.price;
  assert.equal(db.bookings.find((b) => b.id === b1.id)!.partnerId, hotel.json.id);
  assert.equal(b1.amount, full, "hotel guests pay the normal price");
  const staff = await register("Crew Member", "crew@emirates.example");
  const b2 = await paidBooking(staff.token, "b19");
  assert.equal(b2.amount, full - Math.round((full * 20) / 100 / 100) * 100, "company email gets the discount automatically");
  const partners = (await call("/admin/partners", { token: boss.token })).json as { code: string; bookings: number; owedThisMonth: { amount: number }[] }[];
  assert.equal(partners.find((p) => p.code === "ATLANTIS")!.bookings, 1);
});

test("finance month with VAT lines and a CSV; analytics; invoices", async () => {
  const boss = (await call("/auth/login", { body: { email: "boss@alwaysfresh.app", password: "password123" } })).json;
  const me = await register("Invoice Person", "invoice@example.com");
  const b = await paidBooking(me.token, "b35");
  const month = b.startsAt.slice(0, 7);
  const fin = (await call(`/admin/finance?month=${month}`, { token: boss.token })).json;
  assert.ok(fin.lines.find((l: { key: string }) => l.key === "bookings").amounts.length > 0);
  const csv = await call(`/admin/finance.csv?month=${month}`, { token: boss.token });
  assert.equal(csv.headers.get("content-type"), "text/csv; charset=utf-8");
  assert.match(String(csv.json), /^date,type,reference,customer,barber,currency,amount,always_fresh_fee,vat/);
  assert.match(String(csv.json), new RegExp(b.id));
  const stats = (await call("/admin/analytics?days=30", { token: boss.token })).json;
  assert.ok(stats.bookings.paid >= 1);
  assert.equal(stats.byHour.length, 24);
  const inv = await call(`/bookings/${b.id}/invoice`, { token: me.token });
  assert.equal(inv.status, 200);
  assert.match(inv.json.number, /^AF-\d{6}-[A-Z0-9]{6}$/);
  assert.equal(inv.json.total, b.amount);
  assert.equal(inv.json.lines.reduce((t: number, l: { amount: number }) => t + l.amount, 0), b.amount);
  const other = await register("Not Mine", "notmine@example.com");
  assert.equal((await call(`/bookings/${b.id}/invoice`, { token: other.token })).status, 404);
});

test("awards and recommendations", async () => {
  const awards = (await call("/awards?country=AE&city=Dubai")).json;
  assert.equal(awards.list.length, 10);
  assert.equal(awards.list[0].rank, 1);
  const profile = (await call(`/barbers/${awards.list[0].barber.id}`)).json;
  assert.equal(profile.award.rank, 1);
  const me = await register("Recs Person", "recs@example.com");
  await paidBooking(me.token, "b19");
  const recs = (await call("/me/recommendations", { token: me.token })).json as { id: string; reason: string }[];
  assert.ok(recs.length > 0 && recs.length <= 8);
  assert.ok(!recs.some((r) => r.id === "b19"), "not the barber they already know");
  assert.ok(recs.every((r) => r.reason));
});

test("chat: only after a booking; both sides see messages and unread counts", async () => {
  const me = await register("Chatty Client", "chatty@example.com");
  const barberAcc = await call("/auth/register-barber", {
    body: { name: "Chat Barber", email: "chatbarber@example.com", password: "password123", countryCode: "AE", city: "Dubai", shopAddress: "JLT", specialties: ["fade"], haircutPrice: 9000 },
  });
  const barberId = barberAcc.json.user.barberId;
  Object.assign(db.barbers.find((b) => b.id === barberId)!, { status: "live", workingDays: [0, 1, 2, 3, 4, 5, 6] });
  assert.equal((await call("/chats", { token: me.token, body: { barberId } })).status, 403, "book first");
  await paidBooking(me.token, barberId);
  const chat = (await call("/chats", { token: me.token, body: { barberId } })).json;
  assert.equal((await call(`/chats/${chat.id}/messages`, { token: me.token, body: { text: "Can you do a mid fade?" } })).status, 201);
  const inbox = (await call("/chats", { token: barberAcc.json.token })).json;
  assert.equal(inbox[0].unread, 1);
  assert.equal(inbox[0].with.name, "Chatty Client");
  const thread = (await call(`/chats/${chat.id}`, { token: barberAcc.json.token })).json;
  assert.equal(thread.messages[0].text, "Can you do a mid fade?");
  assert.equal(thread.side, "barber");
  await call(`/chats/${chat.id}/messages`, { token: barberAcc.json.token, body: { text: "Sure, see you Thursday." } });
  assert.equal((await call("/chats", { token: barberAcc.json.token })).json[0].unread, 0);
  assert.equal((await call("/chats", { token: me.token })).json[0].unread, 1);
  assert.ok(db.notifications.some((n) => n.kind === "chat" && n.body === "Sure, see you Thursday."));
  const stranger = await register("Stranger", "stranger-chat@example.com");
  assert.equal((await call(`/chats/${chat.id}`, { token: stranger.token })).status, 404);
});

test("live updates stream alerts to the signed-in person", async () => {
  const me = await register("Live Person", "live@example.com");
  assert.equal((await fetch(`${base}/events`)).status, 401);
  const ctrl = new AbortController();
  const res = await fetch(`${base}/events?token=${me.token}`, { signal: ctrl.signal });
  assert.equal(res.headers.get("content-type"), "text/event-stream");
  const reader = res.body!.getReader();
  const { notify } = await import("./notify.js");
  setTimeout(() => notify(me.user.id, { kind: "account", title: "Hello live", body: "Streamed" }), 50);
  let got = "";
  while (!got.includes("Hello live")) got += new TextDecoder().decode((await reader.read()).value);
  ctrl.abort();
  assert.match(got, /event: notification/);
});

test("payouts: without Stripe, barbers are told how they're paid", async () => {
  const barber = (await call("/auth/login", { body: { email: "chatbarber@example.com", password: "password123" } })).json;
  const status = (await call("/barbers/me/payouts", { token: barber.token })).json;
  assert.equal(status.available, false);
  assert.equal((await call("/barbers/me/payouts", { method: "POST", token: barber.token })).status, 503);
});
