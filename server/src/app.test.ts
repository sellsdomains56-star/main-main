import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "./app.js";
import { zonedTime } from "./slots.js";

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

function nextWorkday(): string {
  const d = new Date(Date.now() + 2 * 86_400_000);
  while (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

test("zonedTime converts local wall time to UTC", () => {
  assert.equal(zonedTime("2026-07-01", 9, 0, "Europe/Berlin").toISOString(), "2026-07-01T07:00:00.000Z");
  assert.equal(zonedTime("2026-01-15", 9, 30, "America/New_York").toISOString(), "2026-01-15T14:30:00.000Z");
});

test("locations list countries with cities", async () => {
  const { json } = await call("/locations");
  const de = json.find((c: { code: string }) => c.code === "DE");
  assert.ok(de.cities.some((c: { name: string; barberCount: number }) => c.name === "Berlin" && c.barberCount > 0));
});

test("barbers can be filtered by country and city", async () => {
  const { json: berlin } = await call("/barbers?country=DE&city=Berlin");
  assert.ok(berlin.length > 0);
  assert.ok(berlin.every((b: { city: string; countryCode: string }) => b.city === "Berlin" && b.countryCode === "DE"));
  const { json: uk } = await call("/barbers?country=GB");
  assert.ok(uk.every((b: { countryCode: string; currency: string }) => b.countryCode === "GB" && b.currency === "gbp"));
});

test("full flow: register, book, pay (demo), complete, rate", async () => {
  const customer = await call("/auth/register", { body: { name: "Sam Customer", email: "sam@example.com", password: "password123", countryCode: "DE", city: "Berlin" } });
  assert.equal(customer.status, 201);
  const barberAcc = await call("/auth/register-barber", {
    body: { name: "Test Barber", email: "barber@example.com", password: "password123", countryCode: "DE", city: "Berlin", shopAddress: "Teststr. 1", specialties: ["skin fade"], haircutPrice: 2000 },
  });
  assert.equal(barberAcc.status, 201);
  const barberId = barberAcc.json.user.barberId;

  const { json: barber } = await call(`/barbers/${barberId}`);
  const service = barber.services[0];
  const date = nextWorkday();
  const { json: avail } = await call(`/barbers/${barberId}/availability?date=${date}&serviceId=${service.id}`);
  assert.ok(avail.slots.length > 0);

  const booking = await call("/bookings", {
    token: customer.json.token,
    body: { barberId, serviceId: service.id, startsAt: avail.slots[0], locationType: "home", address: "Kiezweg 5, Berlin" },
  });
  assert.equal(booking.status, 201, JSON.stringify(booking.json));
  assert.equal(booking.json.demoPayments, true);
  assert.equal(booking.json.booking.amount, service.price + barber.homeVisitFee);
  const id = booking.json.booking.id;

  // Slot is now taken.
  const { json: after } = await call(`/barbers/${barberId}/availability?date=${date}&serviceId=${service.id}`);
  assert.ok(!after.slots.includes(avail.slots[0]));
  const clash = await call("/bookings", { token: customer.json.token, body: { barberId, serviceId: service.id, startsAt: avail.slots[0], locationType: "shop" } });
  assert.equal(clash.status, 409);

  // Can't rate before the appointment is done.
  assert.equal((await call(`/bookings/${id}/review`, { token: customer.json.token, body: { rating: 5 } })).status, 400);

  const paid = await call(`/bookings/${id}/confirm-payment`, { token: customer.json.token, method: "POST" });
  assert.equal(paid.json.status, "confirmed");

  // Customers can't update status; the barber can.
  assert.equal((await call(`/bookings/${id}/status`, { token: customer.json.token, body: { status: "completed" } })).status, 404);
  assert.equal((await call(`/bookings/${id}/status`, { token: barberAcc.json.token, body: { status: "on_the_way" } })).json.status, "on_the_way");
  assert.equal((await call(`/bookings/${id}/status`, { token: barberAcc.json.token, body: { status: "completed" } })).json.status, "completed");

  const review = await call(`/bookings/${id}/review`, { token: customer.json.token, body: { rating: 4, comment: "Very fresh" } });
  assert.equal(review.status, 201);
  assert.equal(review.json.rating, 4);
  assert.equal((await call(`/bookings/${id}/review`, { token: customer.json.token, body: { rating: 5 } })).status, 409);

  const { json: profile } = await call(`/barbers/${barberId}`);
  assert.equal(profile.reviews[0].comment, "Very fresh");
  assert.equal(profile.reviews[0].customerName, "Sam");
});

test("AI stylist requires sign-in and reports when not configured", async () => {
  assert.equal((await call("/ai/haircut-advice", { body: { imageBase64: "x".repeat(200) } })).status, 401);
  if (process.env.ANTHROPIC_API_KEY) return;
  const { json } = await call("/auth/register", { body: { name: "Al", email: "al@example.com", password: "password123" } });
  const res = await call("/ai/haircut-advice", { token: json.token, body: { imageBase64: "x".repeat(200) } });
  assert.equal(res.status, 503);
});
