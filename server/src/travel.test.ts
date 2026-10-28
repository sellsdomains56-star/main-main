import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

// The team's email must be known before the config loads.
process.env.ADMIN_EMAILS = "travel-lead@jbalwaysfresh.com";
const { createApp } = await import("./app.js");
const { roadKm, straightKm } = await import("./travel.js");

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

test("distances: straight line, then about 30% more by road", () => {
  const marina = { lat: 25.0805, lng: 55.1403 };
  const downtown = { lat: 25.1972, lng: 55.2744 };
  assert.ok(Math.abs(straightKm(marina, downtown) - 18.6) < 0.5);
  assert.equal(roadKm(marina, downtown), 24);
  assert.equal(roadKm(marina, marina), 1);
});

test("home visits further away cost extra for the barber's taxi, which goes to the barber with no JB fee", async () => {
  const customer = (await call("/auth/register", { body: { name: "Tariq Traveller", email: "tariq@example.com", password: "password123" } })).json;
  const acc = (await call("/auth/register-barber", {
    body: { name: "Rami Roads", email: "rami@example.com", password: "password123", countryCode: "AE", city: "Dubai", shopAddress: "Al Barsha 1", haircutPrice: 10000, offersHomeVisits: true },
  })).json;
  const barberId = acc.user.barberId;
  const barber = (await call(`/barbers/${barberId}`)).json;
  assert.deepEqual(barber.travel, { includedKm: 10, perKm: 400, maxKm: 30 });
  const pin = { lat: barber.lat, lng: barber.lng };
  // 0.159° of latitude is about 17.7 km in a straight line: about 23 km by road.
  const far = { lat: pin.lat - 0.159, lng: pin.lng };
  const tooFar = { lat: pin.lat - 0.3, lng: pin.lng };
  const quote = async (p: { lat: number; lng: number }) => (await call(`/barbers/${barberId}/travel?lat=${p.lat}&lng=${p.lng}`)).json;

  // Nearby: the visit fee covers it.
  const near = await quote(pin);
  assert.equal(near.km, 1);
  assert.equal(near.fee, 0);
  assert.equal(near.tooFar, false);
  // 23 km: 13 km beyond the 10 included, at AED 4 a km, rounded up to AED 55.
  const q = await quote(far);
  assert.equal(q.km, 23);
  assert.equal(q.extraKm, 13);
  assert.equal(q.fee, 5500);
  assert.equal(q.currency, "aed");
  assert.equal(q.visitFee, barber.homeVisitFee);
  // Beyond the barber's 30 km.
  assert.equal((await quote(tooFar)).tooFar, true);

  const service = barber.services[0];
  const { json: avail } = await call(`/barbers/${barberId}/availability?date=${nextWorkday()}&serviceId=${service.id}`);
  const book = (spot?: { lat: number; lng: number }, slot = avail.slots[0]) =>
    call("/bookings", { token: customer.token, body: { barberId, serviceId: service.id, startsAt: slot, locationType: "home", address: "Villa 12, Arabian Ranches", ...(spot ? { spot: { ...spot, label: "Arabian Ranches" } } : {}) } });

  // A home visit needs a point on the map, and can't be further than the barber goes.
  assert.equal((await book()).status, 400);
  const refused = await book(tooFar);
  assert.equal(refused.status, 400);
  assert.match(refused.json.error, /goes up to 30 km/);

  const made = await book(far);
  assert.equal(made.status, 201, JSON.stringify(made.json));
  assert.equal(made.json.booking.amount, service.price + barber.homeVisitFee + 5500);
  assert.equal(made.json.booking.distanceKm, 23);
  assert.equal(made.json.booking.travelFee, 5500);
  assert.equal(made.json.booking.spot.label, "Arabian Ranches");
  await call(`/bookings/${made.json.booking.id}/confirm-payment`, { method: "POST", token: customer.token });

  // The barber is told how far, and what the taxi extra is.
  const alerts = (await call("/notifications", { token: acc.token })).json;
  assert.match(alerts.items[0].body, /About 23 km from your pin, with AED\s?55\.00 extra for your taxi/);

  // JB's 10% is on the cut and the visit fee, not on the taxi extra.
  const lead = (await call("/auth/register", { body: { name: "Travel Lead", email: "travel-lead@jbalwaysfresh.com", password: "password123" } })).json;
  const rows = (await call("/admin/bookings?status=all", { token: lead.token })).json;
  const row = (rows.items ?? rows).find((r: { id: string }) => r.id === made.json.booking.id);
  assert.equal(row.fee, Math.round((service.price + barber.homeVisitFee) / 10));

  // The barber goes further; the team changes the rules.
  assert.equal((await call("/barbers/me", { method: "PATCH", token: acc.token, body: { travelMaxKm: 50 } })).status, 200);
  const longer = await quote(tooFar);
  assert.equal(longer.tooFar, false);
  assert.equal(longer.maxKm, 50);
  await call("/admin/settings", { method: "PATCH", token: lead.token, body: { travelIncludedKm: 20, travelPerKmAed: 500 } });
  const settings = (await call("/admin/settings", { token: lead.token })).json;
  assert.equal(settings.travelIncludedKm, 20);
  assert.equal((await quote(far)).fee, 1500); // 3 km beyond 20, at AED 5
});
