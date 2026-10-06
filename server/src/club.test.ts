import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "./app.js";
import { db } from "./db.js";

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

async function customer(email: string, countryCode = "GB") {
  const r = await call("/auth/register", { body: { name: "Morgan Member", email, password: "password123", countryCode, city: "London" } });
  return r.json.token as string;
}

function workday(daysAhead: number): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  while (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function firstSlot(barberId: string, serviceId: string, days = 3) {
  const { json } = await call(`/barbers/${barberId}/availability?date=${workday(days)}&serviceId=${serviceId}`);
  return json.slots[0] as string;
}

async function pay(token: string, purchaseId: string) {
  return call(`/purchases/${purchaseId}/confirm-payment`, { token, method: "POST" });
}

test("The Club: join Fresh, first cut is included, second is paid, products discounted", async () => {
  const token = await customer("club1@example.com");
  const { json: plans } = await call("/club/plans?country=GB");
  assert.equal(plans.currency, "gbp");
  assert.equal(plans.plans.length, 3);

  const join = await call("/club/join", { token, body: { plan: "fresh", countryCode: "GB" } });
  assert.equal(join.status, 201);
  const paid = await pay(token, join.json.purchase.id);
  assert.equal(paid.json.membership.active, true);
  assert.equal(paid.json.membership.cutsLeft, 1);
  assert.match(paid.json.membership.number, /^JB-\d{4}-\d{3}$/);

  const b5 = (await call("/barbers/b5")).json;
  const cut = b5.services[0];
  const first = await call("/bookings", { token, body: { barberId: "b5", serviceId: cut.id, startsAt: await firstSlot("b5", cut.id), locationType: "shop" } });
  assert.equal(first.json.booking.amount, 0);
  assert.equal(first.json.booking.status, "confirmed"); // nothing to pay
  assert.equal(first.json.booking.coveredBy, "membership");
  assert.equal((await call("/club/me", { token })).json.membership.cutsLeft, 0);

  const second = await call("/bookings", { token, body: { barberId: "b5", serviceId: cut.id, startsAt: await firstSlot("b5", cut.id, 4), locationType: "shop" } });
  assert.equal(second.json.booking.amount, cut.price);

  // Cancelling the included cut gives it back.
  await call(`/bookings/${first.json.booking.id}/cancel`, { token, method: "POST" });
  assert.equal((await call("/club/me", { token })).json.membership.cutsLeft, 1);

  const order = await call("/orders", { token, body: { countryCode: "GB", shippingName: "Morgan", shippingAddress: "1 Test Street, London", items: [{ productId: "p-kit", quantity: 1 }] } });
  assert.equal(order.json.order.discount, Math.round(order.json.order.subtotal * 0.1));
});

test("Black members get home visits included", async () => {
  const token = await customer("club2@example.com");
  const join = await call("/club/join", { token, body: { plan: "black" } });
  await pay(token, join.json.purchase.id);
  const b5 = (await call("/barbers/b5")).json;
  const cut = b5.services[0];
  const r = await call("/bookings", {
    token,
    body: { barberId: "b5", serviceId: cut.id, startsAt: await firstSlot("b5", cut.id, 5), locationType: "home", address: "Suite 1204, The Ned, London", venue: { kind: "hotel", details: "Room 1204, ask for me at the desk" } },
  });
  assert.equal(r.json.booking.amount, 0);
  assert.equal(r.json.booking.venue.kind, "hotel");
});

test("gift cards: buy, pay, the code shows once; redeem once into credit that pays for a booking", async () => {
  const buyer = await customer("gift-buyer@example.com");
  const { json: amounts } = await call("/gifts/amounts?country=GB");
  const g = await call("/gifts", { token: buyer, body: { amount: amounts.amounts[0], countryCode: "GB", toName: "Jordan", toEmail: "jordan@example.com", message: "Happy birthday" } });
  assert.equal(g.status, 201);
  assert.equal(g.json.gift.code, null); // not until it's paid
  const paid = await pay(buyer, g.json.purchase.id);
  const code = paid.json.gift.code as string;
  assert.match(code, /^JBF-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

  const friend = await customer("gift-friend@example.com");
  assert.equal((await call("/gifts/redeem", { token: friend, body: { code: "JBF-NOPE-NOPE" } })).status, 404);
  const redeemed = await call("/gifts/redeem", { token: friend, body: { code: code.toLowerCase() } });
  assert.equal(redeemed.json.credit.gbp, 5000);
  assert.equal((await call("/gifts/redeem", { token: friend, body: { code } })).status, 409);

  const b6 = (await call("/barbers/b6")).json;
  const s = b6.services[0]; // £25 classic cut
  const b = await call("/bookings", { token: friend, body: { barberId: "b6", serviceId: s.id, startsAt: await firstSlot("b6", s.id), locationType: "shop" } });
  assert.equal(b.json.booking.creditUsed, s.price);
  assert.equal(b.json.booking.amount, 0);
  assert.equal((await call("/club/me", { token: friend })).json.credit.gbp, 5000 - s.price);
  await call(`/bookings/${b.json.booking.id}/cancel`, { token: friend, method: "POST" });
  assert.equal((await call("/club/me", { token: friend })).json.credit.gbp, 5000);
});

test("preferences, booking for a guest, cut notes, tips and the waitlist", async () => {
  const token = await customer("prefs@example.com");
  const me = await call("/me/preferences", { token, method: "PATCH", body: { conversation: "quiet", drink: "Espresso", standingCut: "No. 2 sides, scissors on top" } });
  assert.equal(me.json.preferences.conversation, "quiet");

  // A barber account for b5 so we can act as the barber.
  const barberReg = await call("/auth/register", { body: { name: "Dre", email: "dre-staff@example.com", password: "password123" } });
  const staff = barberReg.json.token as string;
  const u = db.users.find((x) => x.id === barberReg.json.user.id)!;
  Object.assign(u, { role: "barber", barberId: "b5" });

  const b5 = (await call("/barbers/b5")).json;
  const cut = b5.services[0];
  const slot = await firstSlot("b5", cut.id, 6);
  const r = await call("/bookings", { token, body: { barberId: "b5", serviceId: cut.id, startsAt: slot, locationType: "shop", guest: { name: "Alex (my son)", phone: "+44 7700 900111" } } });
  const id = r.json.booking.id;
  assert.equal(r.json.booking.customerName, "Alex (my son)");
  assert.equal(r.json.booking.customerPreferences.drink, "Espresso");
  await call(`/bookings/${id}/confirm-payment`, { token, method: "POST" });

  // Someone else waits for that day; the cancellation tells them.
  const waiter = await customer("waiter@example.com");
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(slot));
  assert.equal((await call("/waitlist", { token: waiter, body: { barberId: "b5", date: day } })).status, 201);
  assert.equal((await call("/waitlist", { token: waiter })).json.length, 1);

  assert.equal((await call(`/bookings/${id}/tip`, { token, body: { amount: 500 } })).status, 400); // not done yet
  await call(`/bookings/${id}/status`, { token: staff, body: { status: "completed" } });
  assert.equal((await call(`/bookings/${id}/notes`, { token, body: { cutNotes: "x" } })).status, 404); // customers can't write notes
  await call(`/bookings/${id}/notes`, { token: staff, body: { cutNotes: "No. 2 sides, 1.5 inch on top, matte pomade" } });
  const tip = await call(`/bookings/${id}/tip`, { token, body: { amount: 500 } });
  await pay(token, tip.json.purchase.id);
  const after = (await call(`/bookings/${id}`, { token })).json;
  assert.equal(after.tip, 500);
  assert.equal(after.cutNotes, "No. 2 sides, 1.5 inch on top, matte pomade");

  // A second booking that day, cancelled, alerts the waitlist.
  const slot2 = (await call(`/barbers/b5/availability?date=${day}&serviceId=${cut.id}`)).json.slots[0];
  const r2 = await call("/bookings", { token, body: { barberId: "b5", serviceId: cut.id, startsAt: slot2, locationType: "shop" } });
  await call(`/bookings/${r2.json.booking.id}/confirm-payment`, { token, method: "POST" });
  await call(`/bookings/${r2.json.booking.id}/cancel`, { token, method: "POST" });
  const inbox = (await call("/notifications", { token: waiter })).json.items;
  assert.ok(inbox.some((n: { kind: string }) => n.kind === "waitlist"));
  assert.equal((await call("/waitlist", { token: waiter })).json.length, 0);
});
