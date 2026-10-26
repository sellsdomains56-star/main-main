import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

// The team's email must be known before the config loads.
process.env.ADMIN_EMAILS = "team@jbalwaysfresh.com";
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

const register = async (name: string, email: string) => (await call("/auth/register", { body: { name, email, password: "password123", countryCode: "AE", city: "Dubai" } })).json;
const SHOP = "s-dubai-marina"; // team: b19, b35

/** A Monday–Saturday date at least `daysAhead` days out (UAE shops close some Fridays/Sundays in the seed, so avoid edge days). */
function workday(daysAhead: number): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 5) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
/** Dubai wall-clock time → ISO (UTC+4). */
const dubai = (date: string, hour: number, minute = 0) => new Date(Date.parse(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00Z`) - 4 * 3_600_000).toISOString();

let owner = "";
let customer = "";

test("the JB team gives a shop owner their panel; nobody else gets in", async () => {
  const team = await register("Team", "team@jbalwaysfresh.com");
  const o = await register("Omar Owner", "owner@marina.example");
  customer = (await register("Cyrus Customer", "cyrus@example.com")).token;
  owner = o.token;
  assert.equal((await call("/manage", { token: owner })).status, 403);
  const given = await call(`/admin/shops/${SHOP}/managers`, { token: team.token, body: { email: "owner@marina.example" } });
  assert.equal(given.status, 200);
  assert.equal(given.json.managers[0].email, "owner@marina.example");
  const me = (await call("/me", { token: owner })).json;
  assert.equal(me.manages, SHOP);
  const panel = await call("/manage", { token: owner });
  assert.equal(panel.status, 200);
  assert.deepEqual(panel.json.team.map((b: { id: string }) => b.id).sort(), ["b19", "b35"]);
  assert.equal((await call("/manage", { token: customer })).status, 403);
});

test("walk-ins and blocked time take the slot away from the app", async () => {
  const day = workday(3);
  const { json: profile } = await call("/barbers/b19");
  const cut = profile.services[0];
  const slotsBefore = (await call(`/barbers/b19/availability?date=${day}&serviceId=${cut.id}`)).json.slots as string[];
  const at = slotsBefore.find((s) => s === dubai(day, 12))!;
  assert.ok(at, "12:00 is free to start with");

  const walkIn = await call("/manage/bookings", { token: owner, body: { barberId: "b19", serviceId: cut.id, startsAt: at, name: "Walk-in Wes", phone: "+971500000000" } });
  assert.equal(walkIn.status, 201);
  assert.equal(walkIn.json.source, "shop");
  assert.equal(walkIn.json.client, "Walk-in Wes");
  const clash = await call("/manage/bookings", { token: owner, body: { barberId: "b19", serviceId: cut.id, startsAt: at, name: "Second" } });
  assert.equal(clash.status, 409);

  const blocked = await call("/manage/blocks", { token: owner, body: { barberIds: ["b19"], startsAt: dubai(day, 15), endsAt: dubai(day, 16), reason: "Training" } });
  assert.equal(blocked.status, 201);
  const slotsAfter = (await call(`/barbers/b19/availability?date=${day}&serviceId=${cut.id}`)).json.slots as string[];
  assert.ok(!slotsAfter.includes(at));
  assert.ok(!slotsAfter.includes(dubai(day, 15)));
  assert.ok(!slotsAfter.includes(dubai(day, 15, 30)));

  const cal = (await call(`/manage/calendar?date=${day}`, { token: owner })).json;
  assert.ok(cal.bookings.some((b: { client: string }) => b.client === "Walk-in Wes"));
  assert.equal(cal.blocks[0].reason, "Training");
  assert.equal(cal.summary.walkIns, 1);
  const ownBookings = (await call("/bookings", { token: owner })).json as unknown[];
  assert.equal(ownBookings.length, 0, "walk-ins don't land in the manager's own Bookings tab");

  // Removing the block gives the time back.
  await call(`/manage/blocks/${blocked.json[0].id}`, { method: "DELETE", token: owner });
  const again = (await call(`/barbers/b19/availability?date=${day}&serviceId=${cut.id}`)).json.slots as string[];
  assert.ok(again.includes(dubai(day, 15)));
});

test("the shop moves, finishes and cancels app bookings; customers are told", async () => {
  const day = workday(4);
  const { json: profile } = await call("/barbers/b19");
  const cut = profile.services[0];
  const { json: created } = await call("/bookings", { token: customer, body: { barberId: "b19", serviceId: cut.id, startsAt: dubai(day, 11), locationType: "shop" } });
  await call(`/bookings/${created.booking.id}/confirm-payment`, { method: "POST", token: customer });

  // Move to the other barber, who offers the same service by name.
  const moved = await call(`/manage/bookings/${created.booking.id}/move`, { token: owner, body: { barberId: "b35", startsAt: dubai(day, 17) } });
  assert.equal(moved.status, 200);
  assert.equal(moved.json.barberId, "b35");
  const alerts = (await call("/notifications", { token: customer })).json.items as { title: string }[];
  assert.ok(alerts.some((n) => n.title === "Your booking moved"));

  // No-show only once the time has started.
  assert.equal((await call(`/manage/bookings/${created.booking.id}`, { token: owner, body: { action: "no_show" } })).status, 400);
  const cancelled = await call(`/manage/bookings/${created.booking.id}`, { token: owner, body: { action: "cancel", reason: "Barber unwell — sorry!" } });
  assert.equal(cancelled.json.status, "cancelled");
  const after = (await call("/notifications", { token: customer })).json.items as { body: string }[];
  assert.ok(after.some((n) => n.body.includes("Barber unwell")));
});

test("hours, days off and switching a barber off change what the app offers", async () => {
  const day = workday(5);
  const { json: profile } = await call("/barbers/b35");
  const cut = profile.services[0];
  assert.ok((await call(`/barbers/b35/availability?date=${day}&serviceId=${cut.id}`)).json.slots.length > 0);

  await call("/manage/barbers/b35", { method: "PATCH", token: owner, body: { timeOff: [day] } });
  assert.equal((await call(`/barbers/b35/availability?date=${day}&serviceId=${cut.id}`)).json.slots.length, 0);
  await call("/manage/barbers/b35", { method: "PATCH", token: owner, body: { timeOff: [], openHour: 12, closeHour: 18 } });
  const short = (await call(`/barbers/b35/availability?date=${day}&serviceId=${cut.id}`)).json.slots as string[];
  assert.equal(short[0], dubai(day, 12));
  assert.equal((await call("/manage/barbers/b35", { method: "PATCH", token: owner, body: { openHour: 18, closeHour: 12 } })).status, 400);

  await call("/manage/barbers/b35", { method: "PATCH", token: owner, body: { offline: true } });
  assert.equal((await call(`/barbers/b35/availability?date=${day}&serviceId=${cut.id}`)).json.slots.length, 0);
  await call("/manage/barbers/b35", { method: "PATCH", token: owner, body: { offline: false } });
  assert.equal((await call("/manage/barbers/b99", { method: "PATCH", token: owner, body: { offline: true } })).status, 404); // not on the team
});

test("one menu for the whole team: times and prices, ids kept for the same names", async () => {
  const before = (await call("/manage", { token: owner })).json.team.find((b: { id: string }) => b.id === "b19");
  const keep = before.services[0];
  const res = await call("/manage/services", { method: "PUT", token: owner, body: { services: [
    { name: keep.name, durationMin: 45, price: 13000 },
    { name: "Kids cut", durationMin: 30, price: 6000 },
  ] } });
  assert.equal(res.status, 200);
  const b19 = res.json.find((b: { id: string }) => b.id === "b19");
  assert.equal(b19.services[0].id, keep.id);
  assert.equal(b19.services[0].durationMin, 45);
  assert.ok(res.json.every((b: { services: { name: string }[] }) => b.services.some((s) => s.name === "Kids cut")));
  // A walk-in on that service now takes 45 minutes.
  const day = workday(6);
  const walk = await call("/manage/bookings", { token: owner, body: { barberId: "b19", serviceId: keep.id, startsAt: dubai(day, 10), name: "Timed" } });
  assert.equal(walk.json.durationMin, 45);
});

test("reports, adding a barber and the shop's own hours", async () => {
  // A late walk-in today shows up in today's numbers.
  const todayDubai = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
  const { json: profile } = await call("/barbers/b35");
  await call("/manage/bookings", { token: owner, body: { barberId: "b35", serviceId: profile.services[0].id, startsAt: dubai(todayDubai, 23), name: "Late Larry" } });
  const report = await call("/manage/reports?period=today", { token: owner });
  assert.equal(report.status, 200);
  assert.equal(report.json.byBarber.length, 2);
  assert.ok(report.json.totals.walkIns >= 1);
  const month = (await call("/manage/reports?period=month", { token: owner })).json;
  assert.equal(month.from.slice(8), "01");
  assert.ok(month.perDay.length >= 28);

  const added = await call("/manage/barbers", { token: owner, body: { name: "New Nabil", email: "nabil@marina.example" } });
  assert.equal(added.status, 201);
  assert.ok(added.json.login.password.length >= 8);
  const login = await call("/auth/login", { body: { email: "nabil@marina.example", password: added.json.login.password } });
  assert.equal(login.json.user.role, "barber");
  assert.equal((await call("/manage", { token: owner })).json.team.length, 3);

  const s = await call("/manage/settings", { method: "PATCH", token: owner, body: { openHour: 9, phone: "+971 4 000 0000" } });
  assert.equal(s.json.openHour, 9);
  assert.equal((await call(`/shops/${SHOP}`)).json.phone, "+971 4 000 0000");
});
