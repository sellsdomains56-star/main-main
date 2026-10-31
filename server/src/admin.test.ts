import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

// The team's email must be known before the config loads.
process.env.ADMIN_EMAILS = "boss@alwaysfresh.app";
const { createApp } = await import("./app.js");

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
  return { status: res.status, json: res.status === 204 ? null : await res.json() };
}

/** Fills in and sends a freelance barber's application: ID and licence details, the three documents, the signed agreement. */
async function completeApplication(token: string) {
  await call("/barbers/me/application", { method: "PATCH", token, body: { legalName: "Karim Pending", idNumber: "784199012345671", idExpiry: "2030-01-31", licenceNumber: "BL-1", licenceAuthority: "Dubai Municipality", licenceExpiry: "2030-01-31" } });
  for (const kind of ["id_front", "id_back", "licence"]) {
    await fetch(`${base}/barbers/me/application/documents/${kind}`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "image/jpeg" }, body: new Uint8Array(2000) });
  }
  await call("/barbers/me/application/sign", { token, body: { name: "Karim Pending", svg: "M10 10 L 100 60 L 200 20 L 280 90", agree: true } });
  return call("/barbers/me/application/submit", { token, method: "POST" });
}

const register = async (name: string, email: string) => (await call("/auth/register", { body: { name, email, password: "password123", countryCode: "AE", city: "Dubai" } })).json;

/** A Monday–Saturday date at least `daysAhead` days out. */
function workday(daysAhead: number): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 5) d.setUTCDate(d.getUTCDate() + 1); // most UAE barbers are off on Fridays or Sundays
  return d.toISOString().slice(0, 10);
}

test("only the team opens the admin panel", async () => {
  const someone = await register("Some One", "someone@example.com");
  assert.equal((await call("/admin/overview")).status, 401);
  assert.equal((await call("/admin/overview", { token: someone.token })).status, 403);
  const boss = await register("The Boss", "boss@alwaysfresh.app");
  assert.equal(boss.user.admin, true);
  const { status, json } = await call("/admin/overview", { token: boss.token });
  assert.equal(status, 200);
  assert.ok(json.barbers.live >= 40);
  assert.equal(json.feePercent, 10);
});

test("new barbers wait for approval; the team approves, verifies and suspends", async () => {
  const boss = (await call("/auth/login", { body: { email: "boss@alwaysfresh.app", password: "password123" } })).json;
  await call("/admin/settings", { method: "PATCH", token: boss.token, body: { reviewNewBarbers: true } });
  const acc = (await call("/auth/register-barber", {
    body: { name: "Karim Pending", email: "karim@example.com", password: "password123", countryCode: "AE", city: "Dubai", shopAddress: "JLT Cluster D", haircutPrice: 8000 },
  })).json;
  const id = acc.user.barberId;
  const listed = async () => (await call("/barbers?country=AE&city=Dubai")).json.some((b: { id: string }) => b.id === id);

  assert.equal(await listed(), false);
  assert.equal((await call(`/barbers/${id}`)).status, 404); // the public can't see it yet
  assert.equal((await call(`/barbers/${id}`, { token: acc.token })).status, 200); // the barber can
  assert.equal((await call("/barbers/me/business", { token: acc.token })).json.status, "pending");
  const queue = (await call("/admin/barbers?status=pending", { token: boss.token })).json;
  assert.ok(queue.some((b: { id: string }) => b.id === id));

  // A freelancer only goes live once the team approves their application (ID, licence, signed agreement).
  const tooSoon = await call(`/admin/barbers/${id}`, { method: "PATCH", token: boss.token, body: { status: "live" } });
  assert.equal(tooSoon.status, 400);
  await completeApplication(acc.token);
  assert.equal((await call(`/admin/barbers/${id}/application/approve`, { token: boss.token, method: "POST" })).status, 200);
  const approved = (await call(`/admin/barbers/${id}`, { token: boss.token })).json;
  assert.equal(approved.status, "live");
  assert.equal(approved.verified, true);
  assert.equal(await listed(), true);
  const alerts = (await call("/notifications", { token: acc.token })).json;
  assert.ok(alerts.items.some((n: { title: string }) => n.title === "You're approved"));

  await call(`/admin/barbers/${id}`, { method: "PATCH", token: boss.token, body: { status: "suspended" } });
  assert.equal(await listed(), false);
  const customer = await register("Cora Customer", "cora@example.com");
  const tryBook = await call("/bookings", { token: customer.token, body: { barberId: id, serviceId: `${id}-cut`, startsAt: new Date(Date.now() + 3 * 86_400_000).toISOString(), locationType: "shop" } });
  assert.equal(tryBook.status, 404);
  await call("/admin/settings", { method: "PATCH", token: boss.token, body: { reviewNewBarbers: false } });
});

test("barbers run their business: services, hours, days off, dashboard", async () => {
  const acc = (await call("/auth/register-barber", {
    body: { name: "Bilal Business", email: "bilal@example.com", password: "password123", countryCode: "AE", city: "Dubai", shopAddress: "Bay Avenue", haircutPrice: 9000 },
  })).json;
  const token = acc.token;
  const before = (await call("/barbers/me/business", { token })).json;
  assert.equal(before.status, "live");
  assert.ok(before.checklist.find((c: { key: string }) => c.key === "photo").done === false);

  // Services: rename one, add one, drop the rest.
  const services = before.barber.services;
  const saved = await call("/barbers/me/services", { method: "PUT", token, body: { services: [{ id: services[0].id, name: "Signature cut", durationMin: 40, price: 12000 }, { name: "Kids cut", durationMin: 30, price: 6000 }] } });
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.json.services.map((s: { name: string }) => s.name), ["Signature cut", "Kids cut"]);
  assert.equal(saved.json.services[0].id, services[0].id);
  assert.equal((await call("/barbers/me/services", { method: "PUT", token, body: { services: [] } })).status, 400);

  // Hours and a day off: no slots that day.
  const off = workday(3);
  const hours = await call("/barbers/me", { method: "PATCH", token, body: { workingDays: [1, 2, 3, 4, 5, 6], openHour: 11, closeHour: 20, timeOff: [off] } });
  assert.equal(hours.status, 200);
  assert.equal((await call("/barbers/me", { method: "PATCH", token, body: { openHour: 20, closeHour: 11 } })).status, 400);
  const id = acc.user.barberId;
  const slotsOff = (await call(`/barbers/${id}/availability?date=${off}&serviceId=${services[0].id}`)).json.slots;
  assert.equal(slotsOff.length, 0);
  const day = workday(5) === off ? workday(6) : workday(5);
  const slots = (await call(`/barbers/${id}/availability?date=${day}&serviceId=${services[0].id}`)).json.slots;
  assert.ok(slots.length > 0);

  // A paid booking shows up in the dashboard's numbers, after the platform fee.
  const customer = await register("Pay Ing", "paying@example.com");
  const { json: created } = await call("/bookings", { token: customer.token, body: { barberId: id, serviceId: services[0].id, startsAt: slots[0], locationType: "shop" } });
  await call(`/bookings/${created.booking.id}/confirm-payment`, { method: "POST", token: customer.token });
  // Can't drop a service that's booked.
  assert.equal((await call("/barbers/me/services", { method: "PUT", token, body: { services: [{ name: "Only this", durationMin: 30, price: 5000 }] } })).status, 409);
  const after = (await call("/barbers/me/business", { token })).json;
  assert.equal(after.upcomingCount, 1);
  assert.equal(after.next.id, created.booking.id);
  assert.equal(after.hours.timeOff[0], off);
});

test("the team cancels with a refund, moderates reels, answers tickets and sets the fee", async () => {
  const boss = (await call("/auth/login", { body: { email: "boss@alwaysfresh.app", password: "password123" } })).json;
  const customer = await register("Tia Ticket", "tia@example.com");

  // Cancel a paid booking for a customer.
  const { json: profile } = await call("/barbers/b37");
  const day = workday(4);
  const { json: avail } = await call(`/barbers/b37/availability?date=${day}&serviceId=${profile.services[0].id}`);
  const { json: created } = await call("/bookings", { token: customer.token, body: { barberId: "b37", serviceId: profile.services[0].id, startsAt: avail.slots[0], locationType: "shop" } });
  await call(`/bookings/${created.booking.id}/confirm-payment`, { method: "POST", token: customer.token });
  const listed = (await call("/admin/bookings?status=upcoming&q=tia", { token: boss.token })).json;
  assert.equal(listed[0].id, created.booking.id);
  const cancelled = await call(`/admin/bookings/${created.booking.id}/cancel`, { token: boss.token, body: { reason: "Barber unwell" } });
  assert.equal(cancelled.json.status, "cancelled");
  const mine = (await call("/notifications", { token: customer.token })).json;
  assert.ok(mine.items.some((n: { body: string }) => n.body.includes("Barber unwell")));

  // A reported reel goes to the moderation queue; removing it takes it down.
  await call("/reels/r13/report", { token: customer.token, body: { reason: "Not his work" } });
  const reports = (await call("/admin/reports", { token: boss.token })).json;
  const report = reports.find((r: { reelId: string }) => r.reelId === "r13");
  assert.equal(report.reel.id, "r13");
  assert.equal((await call(`/admin/reports/${report.id}`, { token: boss.token, body: { action: "remove" } })).json.status, "closed");
  assert.equal((await call("/reels/r13")).status, 404);

  // Support tickets: reply and close; the customer is told.
  const { json: ticket } = await call("/support/tickets", { token: customer.token, body: { topic: "payment", message: "I was charged twice, please help." } });
  const open = (await call("/admin/tickets", { token: boss.token })).json;
  assert.ok(open.some((t: { id: string }) => t.id === ticket.id));
  const replied = await call(`/admin/tickets/${ticket.id}`, { method: "PATCH", token: boss.token, body: { reply: "Refunded the second charge.", status: "closed" } });
  assert.equal(replied.json.status, "closed");
  assert.equal(replied.json.replies[0].text, "Refunded the second charge.");

  // Settings: the fee and switching a campaign off.
  const settings = await call("/admin/settings", { method: "PATCH", token: boss.token, body: { platformFeePercent: 12, hiddenCampaigns: ["dubai-launch"] } });
  assert.equal(settings.json.platformFeePercent, 12);
  assert.equal((await call("/admin/overview", { token: boss.token })).json.feePercent, 12);
  const campaigns = (await call("/campaigns?country=AE")).json;
  assert.ok(!campaigns.some((c: { id: string }) => c.id === "dubai-launch"));

  // Customers and shops lists.
  assert.ok((await call("/admin/customers?q=tia", { token: boss.token })).json[0].email === "tia@example.com");
  assert.ok((await call("/admin/shops", { token: boss.token })).json.length >= 5);
});
