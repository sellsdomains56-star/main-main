import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

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

/** A Monday–Saturday date `daysAhead` days out. */
function workday(daysAhead: number): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 5) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

test("every barber has a full menu in sections, with extras", async () => {
  const { json: b } = await call("/barbers/b19");
  const cats = new Set(b.services.map((s: { category: string }) => s.category));
  for (const c of ["hair", "beard", "face", "kids", "packages", "extras"]) assert.ok(cats.has(c), `has ${c}`);
  assert.ok(b.services.every((s: { description?: string }) => s.description && s.description.length > 5));
  assert.equal(b.services[0].id, "b19-cut", "the original ids stay");
});

test("extras add time and price; a tip is charged with the booking but never feeds the fee", async () => {
  const reg = await call("/auth/register", { body: { name: "Ext Ra", email: "extras@example.com", password: "password123", countryCode: "AE", city: "Dubai" } });
  const token = reg.json.token;
  const { json: b } = await call("/barbers/b19");
  const fade = b.services.find((s: { id: string }) => s.id === "b19-fade");
  const towel = b.services.find((s: { id: string }) => s.id === "b19-x-towel");
  const massage = b.services.find((s: { id: string }) => s.id === "b19-x-massage");
  const day = workday(5);

  const plain = (await call(`/barbers/b19/availability?date=${day}&serviceId=b19-fade`)).json.slots as string[];
  const longer = (await call(`/barbers/b19/availability?date=${day}&serviceId=b19-fade&extras=b19-x-towel,b19-x-massage`)).json.slots as string[];
  assert.ok(longer.length > 0 && longer.length <= plain.length, "a longer booking fits in the same or fewer times");
  assert.equal((await call(`/barbers/b19/availability?date=${day}&serviceId=b19-fade&extras=b19-cut`)).status, 400, "only extras can be added");

  const created = await call("/bookings", { token, body: { barberId: "b19", serviceId: "b19-fade", extras: ["b19-x-towel", "b19-x-massage"], tip: 2000, startsAt: longer[0], locationType: "shop" } });
  assert.equal(created.status, 201);
  const bk = created.json.booking;
  assert.equal(bk.amount, fade.price + towel.price + massage.price, "the extras are in the amount");
  assert.equal(bk.tip, 2000, "the tip is kept apart from the amount");
  assert.equal((Date.parse(bk.endsAt) - Date.parse(bk.startsAt)) / 60_000, fade.durationMin + towel.durationMin + massage.durationMin);
  assert.deepEqual(bk.extras.map((x: { id: string }) => x.id), ["b19-x-towel", "b19-x-massage"]);

  // The time is held for the whole length.
  const after = (await call(`/barbers/b19/availability?date=${day}&serviceId=b19-cut`)).json.slots as string[];
  assert.ok(!after.includes(longer[0]));
});
