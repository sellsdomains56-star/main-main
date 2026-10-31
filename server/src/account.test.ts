import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

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
  return { status: res.status, json: res.status === 204 ? null : await res.json().catch(() => null) };
}
const register = async (name: string, email: string) => (await call("/auth/register", { body: { name, email, password: "password123", countryCode: "AE", city: "Dubai" } })).json;

test("forgot password: an emailed link sets a new password and signs out other devices", async () => {
  const acc = await register("Reese Set", "reset@example.com");
  assert.equal((await call("/auth/forgot", { body: { email: "nobody@example.com" } })).status, 204, "same answer for unknown emails");
  assert.equal((await call("/auth/forgot", { body: { email: "reset@example.com" } })).status, 204);
  const mail = db.outbox.filter((m) => m.to === "reset@example.com").at(-1)!;
  assert.match(mail.subject, /Reset your/);
  const token = mail.text.match(/token=([a-f0-9]+)/)![1]!;
  assert.equal((await call("/auth/reset", { body: { token: "x".repeat(40), password: "newpassword1" } })).status, 400);
  const reset = await call("/auth/reset", { body: { token, password: "newpassword1" } });
  assert.equal(reset.status, 200);
  assert.ok(reset.json.token);
  assert.equal((await call("/me", { token: acc.token })).status, 401, "old session is gone");
  assert.equal((await call("/auth/login", { body: { email: "reset@example.com", password: "newpassword1" } })).status, 200);
  assert.equal((await call("/auth/reset", { body: { token, password: "another123" } })).status, 400, "a link works once");
});

test("too many wrong passwords are slowed down", async () => {
  await register("Lock Out", "lock@example.com");
  let last = 0;
  for (let i = 0; i < 11; i++) last = (await call("/auth/login", { body: { email: "lock@example.com", password: "wrong-password" } })).status;
  assert.equal(last, 429);
});

test("a booking confirmation is emailed with a receipt", async () => {
  const acc = await register("Rec Eipt", "receipt@example.com");
  const day = new Date(Date.now() + 6 * 86_400_000);
  while (day.getUTCDay() === 0 || day.getUTCDay() === 5) day.setUTCDate(day.getUTCDate() + 1);
  const date = day.toISOString().slice(0, 10);
  const slots = (await call(`/barbers/b19/availability?date=${date}&serviceId=b19-cut`)).json.slots as string[];
  const { json } = await call("/bookings", { token: acc.token, body: { barberId: "b19", serviceId: "b19-cut", startsAt: slots[1], locationType: "shop", tip: 1000 } });
  await call(`/bookings/${json.booking.id}/confirm-payment`, { method: "POST", token: acc.token });
  const mail = db.outbox.filter((m) => m.to === "receipt@example.com").at(-1)!;
  assert.match(mail.subject, /You're booked/);
  assert.match(mail.text, /Receipt/);
  assert.match(mail.text, /Tip for/);
});

test("alerts can be switched off; a copy of your data; deleting the account", async () => {
  const acc = await register("Del Ete", "delete@example.com");
  const prefs = await call("/me/alerts", { method: "PATCH", token: acc.token, body: { offers: false } });
  assert.equal(prefs.json.alerts.offers, false);

  const day = new Date(Date.now() + 8 * 86_400_000);
  while (day.getUTCDay() === 0 || day.getUTCDay() === 5) day.setUTCDate(day.getUTCDate() + 1);
  const date = day.toISOString().slice(0, 10);
  const slots = (await call(`/barbers/b35/availability?date=${date}&serviceId=b35-cut`)).json.slots as string[];
  const { json } = await call("/bookings", { token: acc.token, body: { barberId: "b35", serviceId: "b35-cut", startsAt: slots[0], locationType: "shop" } });
  await call(`/bookings/${json.booking.id}/confirm-payment`, { method: "POST", token: acc.token });

  const mine = await call("/me/export", { token: acc.token });
  assert.equal(mine.json.account.email, "delete@example.com");
  assert.equal(mine.json.bookings.length, 1);
  assert.equal((await call("/me/export", { method: "POST", token: acc.token })).status, 202);
  assert.ok(db.outbox.some((m) => m.to === "delete@example.com" && /Your Always Fresh data/.test(m.subject)));

  assert.equal((await call("/me", { method: "DELETE", token: acc.token, body: {} })).status, 400, "needs a confirmation");
  assert.equal((await call("/me", { method: "DELETE", token: acc.token, body: { confirm: true } })).status, 204);
  assert.equal((await call("/me", { token: acc.token })).status, 401);
  assert.equal((await call("/auth/login", { body: { email: "delete@example.com", password: "password123" } })).status, 401);
  const booking = db.bookings.find((b) => b.id === json.booking.id)!;
  assert.equal(booking.status, "cancelled", "upcoming bookings are cancelled");
  const user = db.users.find((u) => u.id === booking.customerId)!;
  assert.equal(user.name, "Deleted account");
  assert.ok(!user.email.includes("delete@example.com"));
  // The email is free to sign up again.
  assert.equal((await call("/auth/register", { body: { name: "Back Again", email: "delete@example.com", password: "password123" } })).status, 201);
});
