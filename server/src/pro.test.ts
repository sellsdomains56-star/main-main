import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

const { createApp } = await import("./app.js");
const { db } = await import("./db.js");
const { priceRuleAt, adjustedPrice, levelOf } = await import("./pro.js");

let base = "";
const server = createApp().listen(0);
before(() => {
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

async function call(path: string, init: { method?: string; body?: unknown; token?: string; shop?: string } = {}) {
  const res = await fetch(base + path, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: { "content-type": "application/json", ...(init.token ? { authorization: `Bearer ${init.token}` } : {}), ...(init.shop ? { "x-shop": init.shop } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  return { status: res.status, json: res.status === 204 ? null : await res.json().catch(() => null) };
}
const register = async (name: string, email: string) => (await call("/auth/register", { body: { name, email, password: "password123", countryCode: "AE", city: "Dubai" } })).json;

let n = 0;
async function newBarber() {
  n += 1;
  const acc = await call("/auth/register-barber", {
    body: { name: `Pro Barber${n}`, email: `probarber${n}@example.com`, password: "password123", countryCode: "AE", city: "Dubai", shopAddress: "JLT", specialties: ["skin fade"], haircutPrice: 10000 },
  });
  const barber = db.barbers.find((b) => b.id === acc.json.user.barberId)!;
  Object.assign(barber, { workingDays: [0, 1, 2, 3, 4, 5, 6], openHour: 0, closeHour: 24, status: "live" });
  return { token: acc.json.token as string, barber };
}
const dayAhead = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

async function paidBooking(token: string, barberId: string, startsAt: string) {
  const serviceId = db.barbers.find((b) => b.id === barberId)!.services[0]!.id;
  const r = await call("/bookings", { token, body: { barberId, serviceId, startsAt, locationType: "shop" } });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  await call(`/bookings/${r.json.booking.id}/confirm-payment`, { method: "POST", token });
  return r.json.booking as { id: string; amount: number; priceRule?: number };
}

test("barbers block a few hours; booked time can't be blocked", async () => {
  const { token, barber } = await newBarber();
  const date = dayAhead(3);
  const slots = (await call(`/barbers/${barber.id}/availability?date=${date}&serviceId=${barber.services[0]!.id}`)).json.slots as string[];
  const start = slots[10]!;
  const end = new Date(Date.parse(start) + 2 * 3_600_000).toISOString();
  const made = await call("/barbers/me/blocks", { token, body: { startsAt: start, endsAt: end, reason: "Dentist" } });
  assert.equal(made.status, 201);
  const after = (await call(`/barbers/${barber.id}/availability?date=${date}&serviceId=${barber.services[0]!.id}`)).json.slots as string[];
  assert.ok(!after.includes(start), "blocked time isn't offered");
  assert.equal((await call("/barbers/me/blocks", { token })).json.length, 1);
  const me = (await register("Block Customer", "blockcust@example.com")).token;
  await paidBooking(me, barber.id, slots[2]!);
  assert.equal((await call("/barbers/me/blocks", { token, body: { startsAt: slots[2], endsAt: new Date(Date.parse(slots[2]!) + 3_600_000).toISOString() } })).status, 409);
  assert.equal((await call(`/barbers/me/blocks/${made.json.id}`, { method: "DELETE", token })).status, 204);
});

test("off-peak discounts and peak premiums change the price; availability shows them", async () => {
  const { token, barber } = await newBarber();
  const rules = await call("/barbers/me/rules", { method: "PUT", token, body: { offPeak: { percent: 20, days: [0, 1, 2, 3, 4, 5, 6], fromHour: 0, toHour: 12 }, peak: { percent: 10, days: [0, 1, 2, 3, 4, 5, 6], fromHour: 18, toHour: 24 } } });
  assert.equal(rules.status, 200);
  assert.equal((await call("/barbers/me/rules", { method: "PUT", token, body: { offPeak: { percent: 20, days: [1], fromHour: 10, toHour: 20 }, peak: { percent: 10, days: [1], fromHour: 18, toHour: 22 } } })).status, 400, "overlap refused");
  const date = dayAhead(4);
  const av = (await call(`/barbers/${barber.id}/availability?date=${date}&serviceId=${barber.services[0]!.id}`)).json;
  const morning = av.slots.find((s: string) => priceRuleAt(barber, s) < 0)!;
  const evening = av.slots.find((s: string) => priceRuleAt(barber, s) > 0)!;
  assert.equal(av.deals[morning], -20);
  assert.equal(av.deals[evening], 10);
  const me = (await register("Deal Customer", "deal@example.com")).token;
  const cheap = await paidBooking(me, barber.id, morning);
  assert.equal(cheap.amount, adjustedPrice(barber.services[0]!.price, -20));
  assert.equal(cheap.priceRule, -20);
  const dear = await paidBooking(me, barber.id, evening);
  assert.equal(dear.amount, adjustedPrice(barber.services[0]!.price, 10));
  assert.equal(adjustedPrice(10000, -15), 8500);
  assert.equal(adjustedPrice(9900, -15), 8400, "rounded to whole units");
});

test("late cancellations keep the barber's fee; early ones refund in full", async () => {
  const { token, barber } = await newBarber();
  await call("/barbers/me/rules", { method: "PUT", token, body: { cancelPolicy: { freeHours: 48, lateFeePercent: 50 } } });
  const me = (await register("Late Canceller", "late@example.com")).token;
  const soon = (await call(`/barbers/${barber.id}/availability?date=${dayAhead(1)}&serviceId=${barber.services[0]!.id}`)).json.slots as string[];
  const b = await paidBooking(me, barber.id, soon[soon.length - 1]!);
  const view = (await call(`/bookings/${b.id}`, { token: me })).json;
  assert.equal(view.cancelTerms.lateFeePercent, 50);
  assert.equal(view.cancelTerms.fee, Math.round(b.amount / 2));
  const cancelled = await call(`/bookings/${b.id}/cancel`, { method: "POST", token: me });
  assert.equal(cancelled.json.lateFee, Math.round(b.amount / 2));
  const later = (await call(`/barbers/${barber.id}/availability?date=${dayAhead(6)}&serviceId=${barber.services[0]!.id}`)).json.slots as string[];
  const early = await paidBooking(me, barber.id, later[3]!);
  assert.equal((await call(`/bookings/${early.id}/cancel`, { method: "POST", token: me })).json.lateFee, undefined);
  const dash = (await call("/barbers/me/business", { token })).json;
  assert.ok(dash.earnings.month.lateFees >= 0);
  assert.equal(levelOf(barber), "new");
  assert.equal(dash.level, "new");
  assert.match(dash.link, /\/barber\//);
});

test("client book: visits, private notes and 'we miss you' messages (once a week)", async () => {
  const { token, barber } = await newBarber();
  const me = await register("Client Book", "clientbook@example.com");
  const slots = (await call(`/barbers/${barber.id}/availability?date=${dayAhead(2)}&serviceId=${barber.services[0]!.id}`)).json.slots as string[];
  const b = await paidBooking(me.token, barber.id, slots[4]!);
  db.bookings.find((x) => x.id === b.id)!.startsAt = new Date(Date.now() - 50 * 86_400_000).toISOString();
  db.bookings.find((x) => x.id === b.id)!.status = "completed";
  const clients = (await call("/barbers/me/clients", { token })).json;
  assert.equal(clients.length, 1);
  assert.equal(clients[0].name, "Client Book");
  assert.equal(clients[0].visits, 1);
  assert.equal((await call("/barbers/me/clients/note", { method: "PUT", token, body: { key: clients[0].key, note: "Likes it short on the sides" } })).status, 200);
  assert.equal((await call("/barbers/me/clients", { token })).json[0].note, "Likes it short on the sides");
  const sent = await call("/barbers/me/clients/message", { token, body: { keys: [clients[0].key], text: "We miss you! 10% off this week." } });
  assert.deepEqual(sent.json, { sent: 1, skipped: 0 });
  assert.deepEqual((await call("/barbers/me/clients/message", { token, body: { keys: [clients[0].key], text: "Again?" } })).json, { sent: 0, skipped: 1 }, "not twice in a week");
  assert.ok(db.notifications.some((x) => x.userId === me.user.id && x.kind === "message" && x.body.includes("/barber/")));
});

test("shop roles, branches, queue, check-in, stock, payroll and client messages", async () => {
  const SHOP = "s-dubai-marina";
  const owner = await register("Shop Owner", "shopowner@example.com");
  Object.assign(db.users.find((u) => u.id === owner.user.id)!, { manages: SHOP, branches: ["s-dubai-downtown"] });
  // Staff: the owner adds a front desk account, which can't see money.
  const desk = await call("/manage/staff", { token: owner.token, body: { name: "Desk Person", email: "desk@example.com", role: "front_desk" } });
  assert.equal(desk.status, 201);
  const deskToken = (await call("/auth/login", { body: desk.json.login })).json.token;
  assert.equal((await call("/manage", { token: deskToken })).json.role, "front_desk");
  assert.equal((await call("/manage/reports", { token: deskToken })).status, 403);
  assert.equal((await call("/manage/payroll", { token: deskToken })).status, 403);
  assert.equal((await call("/manage/staff", { token: deskToken })).status, 403);
  assert.equal((await call("/manage/queue", { token: deskToken })).status, 200);
  // Branches: the owner switches shops with a header; nobody else can.
  const panel = (await call("/manage", { token: owner.token })).json;
  assert.deepEqual(panel.branches.map((b: { id: string }) => b.id), [SHOP, "s-dubai-downtown"]);
  assert.equal((await call("/manage", { token: owner.token, shop: "s-dubai-downtown" })).json.shop.id, "s-dubai-downtown");
  assert.equal((await call("/manage", { token: deskToken, shop: "s-dubai-downtown" })).json.shop.id, SHOP, "not their branch");

  // Queue: a walk-in at the desk, a customer from the app, call and done.
  const shopObj = (await import("./shops.js")).getShop(SHOP);
  Object.assign(db.shopSettings, { [SHOP]: { workingDays: [0, 1, 2, 3, 4, 5, 6], openHour: 0, closeHour: 24 } });
  for (const b of db.barbers.filter((x) => x.shopId === SHOP)) Object.assign(b, { workingDays: [0, 1, 2, 3, 4, 5, 6], openHour: 0, closeHour: 24 });
  assert.ok(shopObj);
  assert.equal((await call("/manage/queue", { token: deskToken, body: { name: "Walk In", service: "Fade" } })).status, 201);
  const guest = await register("Queue Joiner", "queuer@example.com");
  assert.equal((await call(`/shops/${SHOP}/queue`, { token: guest.token, body: {} })).status, 201);
  assert.equal((await call(`/shops/${SHOP}/queue`, { token: guest.token, body: {} })).status, 409);
  const status = (await call(`/shops/${SHOP}/queue`, { token: guest.token })).json;
  assert.equal(status.waiting, 2);
  assert.equal(status.mine.position, 2);
  assert.ok(status.mine.estimateMin > 0);
  const q = (await call("/manage/queue", { token: deskToken })).json;
  const mine = q.waiting.find((x: { fromApp: boolean }) => x.fromApp);
  await call(`/manage/queue/${mine.id}`, { token: deskToken, body: { action: "call", barberId: "b19" } });
  assert.ok(db.notifications.some((x) => x.userId === guest.user.id && x.title === "It's your turn"));
  await call(`/manage/queue/${mine.id}`, { token: deskToken, body: { action: "done" } });
  assert.equal((await call("/manage/queue", { token: deskToken })).json.doneToday, 1);

  // Check-in: today's booking at the shop.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
  const slots = (await call(`/barbers/b19/availability?date=${today}&serviceId=b19-cut`)).json.slots as string[];
  if (slots.length) {
    const b = await paidBooking(guest.token, "b19", slots[0]!);
    const list = (await call("/manage/check-in", { token: deskToken })).json;
    assert.ok(list.some((x: { id: string }) => x.id === b.id));
    await call(`/manage/check-in/${b.id}`, { method: "POST", token: deskToken });
    assert.ok(db.bookings.find((x) => x.id === b.id)!.checkedInAt);
  }

  // Stock: sold out products disappear from the shop page and can't be ordered.
  assert.equal((await call("/manage/stock", { method: "PUT", token: deskToken, body: { counts: { "p-pomade": 0 } } })).status, 403);
  assert.equal((await call("/manage/stock", { method: "PUT", token: owner.token, body: { counts: { "p-pomade": 0, "p-wax": 5 } } })).status, 200);
  const stock = (await call("/manage/stock", { token: owner.token })).json;
  assert.equal(stock.find((p: { id: string }) => p.id === "p-pomade").count, 0);
  assert.ok(!(await call(`/shops/${SHOP}`)).json.products.some((p: { id: string }) => p.id === "p-pomade"));
  const order = await call("/orders", { token: guest.token, body: { countryCode: "AE", items: [{ productId: "p-wax", quantity: 2 }], shippingName: "Q", shippingAddress: "Marina Walk, Dubai", fulfilment: "delivery", shopId: SHOP } });
  assert.equal(order.status, 201);
  await call(`/orders/${order.json.order.id}/confirm-payment`, { method: "POST", token: guest.token });
  assert.equal(db.stock[SHOP]!["p-wax"], 3, "a paid delivery takes stock");
  const orders = (await call("/manage/orders", { token: deskToken })).json;
  assert.equal(orders.orders[0].commission, Math.round((orders.orders[0].subtotal * 15) / 100));
  assert.equal((await call(`/manage/orders/${order.json.order.id}`, { token: deskToken, body: { status: "delivered" } })).json.status, "delivered");

  // Money split and payroll.
  assert.equal((await call("/manage/settings", { method: "PATCH", token: owner.token, body: { barberSharePercent: 60 } })).json.barberSharePercent, 60);
  await call("/manage/barbers/b19", { method: "PATCH", token: owner.token, body: { sharePercent: 70 } });
  const pay = (await call("/manage/payroll?period=month", { token: owner.token })).json;
  const b19 = pay.rows.find((r: { id: string }) => r.id === "b19");
  assert.equal(b19.sharePercent, 70);
  assert.equal(b19.barberPay, Math.round(((b19.services + b19.lateFees - b19.jbFee) * 70) / 100) + b19.tips);
  assert.ok(pay.totals.productCommission > 0);

  // Messages to lapsed clients (none yet in this fresh shop).
  assert.equal((await call("/manage/clients?weeks=6", { token: owner.token })).status, 200);
  assert.equal((await call("/manage/staff", { token: owner.token })).json.length, 2);
  assert.equal((await call(`/manage/staff/${desk.json.staff.id}`, { method: "DELETE", token: owner.token })).status, 204);
  assert.equal((await call("/manage", { token: deskToken })).status, 401, "removed staff are signed out");
});
