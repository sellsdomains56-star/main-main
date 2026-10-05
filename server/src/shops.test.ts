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

/** A Monday–Saturday date at least `daysAhead` days out. */
function workday(daysAhead: number): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  while (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function customer(email: string) {
  const r = await call("/auth/register", { body: { name: "Casey Customer", email, password: "password123", countryCode: "GB", city: "London" } });
  return r.json.token as string;
}

/** A barber account for a seed barber, so the shop's staff can be tested. */
async function staffFor(barberId: string, email: string) {
  const r = await call("/auth/register", { body: { name: "Shop Staff", email, password: "password123" } });
  const user = db.users.find((u) => u.id === r.json.user.id)!;
  Object.assign(user, { role: "barber", barberId });
  return r.json.token as string;
}

const PECKHAM = "s-london-peckham";

test("barbershops list by city and show team, menu and products", async () => {
  const { json: london } = await call("/shops?country=GB&city=London");
  assert.ok(london.length >= 2 && london.every((s: { city: string }) => s.city === "London"));
  const { json: shop } = await call(`/shops/${PECKHAM}`);
  assert.equal(shop.team.length, 2);
  assert.ok(shop.menu.some((m: { key: string }) => m.key === "skin-fade"));
  assert.equal(shop.currency, "gbp");
  assert.ok(shop.products.length > 0 && shop.delivery && shop.privateHire);
  assert.equal((await call("/shops/nope")).status, 404);
});

test("book any barber at a shop: the best-rated free barber gets it", async () => {
  const token = await customer("anybarber@example.com");
  const date = workday(2);
  const { json: avail } = await call(`/shops/${PECKHAM}/availability?date=${date}&service=skin-fade`);
  assert.ok(avail.slots.length > 0);
  const slot = avail.slots[0];
  const first = await call(`/shops/${PECKHAM}/bookings`, { token, body: { service: "skin-fade", startsAt: slot } });
  assert.equal(first.status, 201);
  assert.equal(first.json.booking.barber.name, "Dre Clipz"); // 4.9 beats 4.8
  assert.equal(first.json.booking.shop.name, "JB’s Fresh Peckham");
  // Same time again: the other barber takes it; a third time, the shop is full.
  const second = await call(`/shops/${PECKHAM}/bookings`, { token, body: { service: "skin-fade", startsAt: slot } });
  assert.equal(second.json.booking.barber.name, "Theo Mensah");
  const third = await call(`/shops/${PECKHAM}/bookings`, { token, body: { service: "skin-fade", startsAt: slot } });
  assert.equal(third.status, 409);
  const { json: after } = await call(`/shops/${PECKHAM}/availability?date=${date}&service=skin-fade`);
  assert.ok(!after.slots.includes(slot));
});

test("private hire: pay, block the team's diaries, tell the shop, cancel with refund", async () => {
  const token = await customer("hire@example.com");
  const staff = await staffFor("b6", "jermyn-staff@example.com");
  const shop = "s-london-jermyn";
  const date = workday(4);
  const { json: avail } = await call(`/shops/${shop}/hire-availability?date=${date}&hours=3`);
  assert.ok(avail.slots.length > 0);
  const start = avail.slots[0];

  assert.equal((await call("/hires", { token, body: { shopId: shop, startsAt: start, hours: 1, guests: 4 } })).status, 400); // under the minimum
  assert.equal((await call("/hires", { token, body: { shopId: shop, startsAt: start, hours: 3, guests: 40 } })).status, 400); // too many guests
  const created = await call("/hires", { token, body: { shopId: shop, startsAt: start, hours: 3, guests: 6, occasion: "Wedding morning" } });
  assert.equal(created.status, 201);
  assert.equal(created.json.hire.amount, 22000 * 3);
  assert.equal(created.json.hire.status, "pending_payment");
  const hireId = created.json.hire.id;

  const paid = await call(`/hires/${hireId}/confirm-payment`, { token, method: "POST" });
  assert.equal(paid.json.status, "confirmed");

  // Oliver (b6) can't be booked during the hire, and the same start can't be hired twice.
  const service = db.barbers.find((b) => b.id === "b6")!.services[0];
  const { json: barberAvail } = await call(`/barbers/b6/availability?date=${date}&serviceId=${service.id}`);
  assert.ok(!barberAvail.slots.includes(start));
  assert.equal((await call("/hires", { token, body: { shopId: shop, startsAt: start, hours: 3, guests: 2 } })).status, 409);

  const { json: staffHires } = await call("/hires", { token: staff });
  assert.ok(staffHires.some((h: { id: string }) => h.id === hireId));
  const { json: inbox } = await call("/notifications", { token: staff });
  assert.ok(inbox.items.some((n: { kind: string; hireId?: string }) => n.kind === "hire" && n.hireId === hireId));

  const cancelled = await call(`/hires/${hireId}/cancel`, { token, method: "POST" });
  assert.equal(cancelled.json.status, "cancelled");
  const { json: reopened } = await call(`/barbers/b6/availability?date=${date}&serviceId=${service.id}`);
  assert.ok(reopened.slots.includes(start));
});

test("shops without private hire refuse it", async () => {
  const token = await customer("nohire@example.com");
  const date = workday(4);
  const { json } = await call(`/shops/s-paris-oberkampf/hire-availability?date=${date}&hours=2`);
  assert.deepEqual(json.slots, []);
  const r = await call("/hires", { token, body: { shopId: "s-paris-oberkampf", startsAt: `${date}T10:00:00.000Z`, hours: 2, guests: 2 } });
  assert.equal(r.status, 400);
});

test("delivery from a barbershop: shop terms, stock check, courier updates", async () => {
  const token = await customer("delivery@example.com");
  const staff = await staffFor("b5", "peckham-staff@example.com");
  const base = { countryCode: "GB", shippingName: "Casey", shippingAddress: "5 Bellenden Rd, London SE15", fulfilment: "delivery", shopId: PECKHAM };

  // Under £30: £3.99 delivery.
  const small = await call("/orders", { token, body: { ...base, items: [{ productId: "p-brush", quantity: 1 }] } });
  assert.equal(small.status, 201);
  assert.equal(small.json.order.shipping, 399);
  assert.equal(small.json.order.shop.name, "JB’s Fresh Peckham");

  // Shaw & Sons doesn't deliver; Paris can't deliver to the UK.
  assert.equal((await call("/orders", { token, body: { ...base, shopId: "s-london-jermyn", items: [{ productId: "p-shampoo", quantity: 1 }] } })).status, 400);
  assert.equal((await call("/orders", { token, body: { ...base, shopId: "s-paris-oberkampf", items: [{ productId: "p-pomade", quantity: 1 }] } })).status, 400);

  const big = await call("/orders", { token, body: { ...base, items: [{ productId: "p-kit", quantity: 1 }] } });
  assert.equal(big.json.order.shipping, 0); // over the free-delivery threshold
  const orderId = big.json.order.id;
  await call(`/orders/${orderId}/confirm-payment`, { token, method: "POST" });

  const { json: queue } = await call("/shop-orders", { token: staff });
  assert.ok(queue.some((o: { id: string }) => o.id === orderId));
  assert.ok(!queue.some((o: { id: string }) => o.id === small.json.order.id)); // unpaid orders stay hidden

  const outsider = await customer("outsider@example.com");
  assert.equal((await call(`/orders/${orderId}/status`, { token: outsider, body: { status: "delivered" } })).status, 404);
  assert.equal((await call(`/orders/${orderId}/status`, { token: staff, body: { status: "out_for_delivery" } })).json.status, "out_for_delivery");
  assert.equal((await call(`/orders/${orderId}/status`, { token: staff, body: { status: "delivered" } })).json.status, "delivered");

  const { json: inbox } = await call("/notifications", { token });
  const titles = inbox.items.filter((n: { orderId?: string }) => n.orderId === orderId).map((n: { title: string }) => n.title);
  assert.deepEqual(titles, ["Delivered", "Your order is on its way", "Order received"]);
});

test("shipped orders still work as before", async () => {
  const token = await customer("shipping@example.com");
  const r = await call("/orders", { token, body: { countryCode: "GB", shippingName: "Casey", shippingAddress: "5 Bellenden Rd, London SE15", items: [{ productId: "p-brush", quantity: 1 }] } });
  assert.equal(r.status, 201);
  assert.equal(r.json.order.fulfilment, "shipping");
  assert.equal(r.json.order.shop, null);
});
