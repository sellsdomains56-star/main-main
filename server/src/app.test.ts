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

test("shop: products priced in local currency, order with shipping, pay (demo)", async () => {
  const { json: uk } = await call("/products?country=GB");
  assert.equal(uk.currency, "gbp");
  assert.ok(uk.products.length > 5 && uk.products.every((p: { name: string; price: number }) => p.name.startsWith("JB's Fresh") && p.price > 0));

  const { json: acc } = await call("/auth/register", { body: { name: "Shopper", email: "shop@example.com", password: "password123" } });
  assert.equal((await call("/orders", { body: { countryCode: "DE", items: [{ productId: "p-pomade", quantity: 1 }], shippingName: "S", shippingAddress: "Somewhere 1" } })).status, 401);

  const { json: de } = await call("/products?country=DE");
  const pomade = de.products.find((p: { id: string }) => p.id === "p-pomade");
  const small = await call("/orders", {
    token: acc.token,
    body: { countryCode: "DE", items: [{ productId: "p-pomade", quantity: 2 }], shippingName: "Shopper", shippingAddress: "Kiezweg 5, Berlin" },
  });
  assert.equal(small.status, 201, JSON.stringify(small.json));
  assert.equal(small.json.order.currency, "eur");
  assert.equal(small.json.order.subtotal, pomade.price * 2);
  assert.equal(small.json.order.amount, pomade.price * 2 + de.shipping.fee);

  const big = await call("/orders", {
    token: acc.token,
    body: { countryCode: "DE", items: [{ productId: "p-kit", quantity: 2 }], shippingName: "Shopper", shippingAddress: "Kiezweg 5, Berlin" },
  });
  assert.equal(big.json.order.shipping, 0);

  const paid = await call(`/orders/${small.json.order.id}/confirm-payment`, { token: acc.token, method: "POST" });
  assert.equal(paid.json.status, "paid");
  const { json: orders } = await call("/orders", { token: acc.token });
  assert.equal(orders.length, 2);

  const bad = await call("/orders", { token: acc.token, body: { countryCode: "DE", items: [{ productId: "nope", quantity: 1 }], shippingName: "S", shippingAddress: "Somewhere 1" } });
  assert.equal(bad.status, 404);
});

test("reels: feed by city, like toggle, barber upload", async () => {
  const { json: berlin } = await call("/reels?country=DE&city=Berlin");
  assert.ok(berlin.length >= 2);
  assert.ok(berlin.every((r: { barber: { city: string } }) => r.barber.city === "Berlin"));
  const video = await fetch(base + berlin[0].videoUrl);
  assert.equal(video.status, 200);
  assert.match(video.headers.get("content-type") ?? "", /video\/mp4/);

  const { json: fan } = await call("/auth/register", { body: { name: "Fan", email: "fan@example.com", password: "password123" } });
  const liked = await call(`/reels/${berlin[0].id}/like`, { token: fan.token, method: "POST" });
  assert.equal(liked.json.likedByMe, true);
  assert.equal(liked.json.likes, berlin[0].likes + 1);
  const { json: feed } = await call("/reels?country=DE&city=Berlin", { token: fan.token });
  assert.equal(feed.find((r: { id: string }) => r.id === berlin[0].id).likedByMe, true);
  const unliked = await call(`/reels/${berlin[0].id}/like`, { token: fan.token, method: "POST" });
  assert.equal(unliked.json.likes, berlin[0].likes);

  const upload = (token: string) =>
    fetch(`${base}/reels?caption=${encodeURIComponent("Fresh fade")}`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "video/mp4" }, body: new Uint8Array(5000) });
  assert.equal((await upload(fan.token)).status, 403);
  const { json: barber } = await call("/auth/login", { body: { email: "barber@example.com", password: "password123" } });
  const res = await upload(barber.token);
  assert.equal(res.status, 201);
  const reel = await res.json();
  assert.equal(reel.caption, "Fresh fade");
  const { json: mine } = await call(`/reels?barberId=${barber.user.barberId}`);
  assert.equal(mine[0].id, reel.id);
  assert.equal((await call(`/reels/${reel.id}`, { token: barber.token, method: "DELETE" })).status, 204);
});
