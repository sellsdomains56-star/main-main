import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

const { createApp } = await import("./app.js");
const { db } = await import("./db.js");
const { runPerks } = await import("./rewards.js");
const { openNow } = await import("./search.js");

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
const register = async (name: string, email: string, invite?: string) =>
  call("/auth/register", { body: { name, email, password: "password123", countryCode: "AE", city: "Dubai", ...(invite ? { invite } : {}) } });

let n = 0;
async function newBarber() {
  n += 1;
  const acc = await call("/auth/register-barber", {
    body: { name: `Cust Barber${n}`, email: `custbarber${n}@example.com`, password: "password123", countryCode: "AE", city: "Dubai", shopAddress: "JLT", specialties: ["skin fade"], haircutPrice: 9000 },
  });
  assert.equal(acc.status, 201);
  const barber = db.barbers.find((b) => b.id === acc.json.user.barberId)!;
  barber.workingDays = [0, 1, 2, 3, 4, 5, 6];
  barber.status = "live";
  return { token: acc.json.token as string, id: barber.id, barber };
}

/** A paid booking a few days out, at the n-th free time. */
async function book(token: string, barberId: string, days = 4, slot = 1) {
  const date = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  const serviceId = db.barbers.find((b) => b.id === barberId)!.services[0]!.id;
  const slots = (await call(`/barbers/${barberId}/availability?date=${date}&serviceId=${serviceId}`)).json.slots as string[];
  const { json } = await call("/bookings", { token, body: { barberId, serviceId, startsAt: slots[slot], locationType: "shop" } });
  await call(`/bookings/${json.booking.id}/confirm-payment`, { method: "POST", token });
  return { id: json.booking.id as string, slots, serviceId };
}

test("move a booking to another free time; the old time frees up", async () => {
  const b = await newBarber();
  const me = (await register("Mo Ver", "mover@example.com")).json;
  const { id, slots } = await book(me.token, b.id);
  const moved = await call(`/bookings/${id}/reschedule`, { token: me.token, body: { startsAt: slots[4] } });
  assert.equal(moved.status, 200);
  assert.equal(moved.json.startsAt, slots[4]);
  const other = (await register("Ot Her", "other-move@example.com")).json;
  assert.equal((await call(`/bookings/${id}/reschedule`, { token: other.token, body: { startsAt: slots[2] } })).status, 404, "only your own booking");
  const date = slots[0]!.slice(0, 10);
  const free = (await call(`/barbers/${b.id}/availability?date=${date}&serviceId=${db.barbers.find((x) => x.id === b.id)!.services[0]!.id}`)).json.slots as string[];
  assert.ok(free.includes(slots[1]!), "the old time is free again");
  assert.ok(!free.includes(slots[4]!));
  // Someone else takes a time: it can't be moved onto it.
  const taken = await book(other.token, b.id, 4, 6);
  assert.equal((await call(`/bookings/${id}/reschedule`, { token: me.token, body: { startsAt: taken.slots[6] } })).status, 409);
  const alerts = db.notifications.filter((x) => x.title === "Booking moved");
  assert.ok(alerts.length >= 1, "the barber hears about it");
});

test("favourites, your usual and your cuts", async () => {
  const b = await newBarber();
  const me = (await register("Fav Ourite", "fav@example.com")).json;
  assert.equal((await call(`/barbers/${b.id}/favourite`, { method: "POST", token: me.token })).json.favourite, true);
  assert.deepEqual((await call("/me/favourites", { token: me.token })).json.map((x: { id: string }) => x.id), [b.id]);
  assert.equal((await call(`/barbers/${b.id}/favourite`, { method: "POST", token: me.token })).json.favourite, false);
  assert.equal((await call("/me/usual", { token: me.token })).json, null);

  const { id, serviceId } = await book(me.token, b.id);
  const usual = (await call("/me/usual", { token: me.token })).json;
  assert.equal(usual.barber.id, b.id);
  assert.equal(usual.service.id, serviceId);

  db.bookings.find((x) => x.id === id)!.status = "completed";
  assert.equal((await call(`/bookings/${id}/cut-photo`, { token: me.token, body: { url: "/uploads/a.jpg" } })).status, 404, "customers can't add cut photos");
  assert.equal((await call(`/bookings/${id}/cut-photo`, { token: b.token, body: { url: "/uploads/a.jpg" } })).status, 200);
  const cuts = (await call("/me/cuts", { token: me.token })).json;
  assert.equal(cuts.length, 1);
  assert.deepEqual(cuts[0].cutPhotos, ["/uploads/a.jpg"]);
});

test("invite a friend: both get credit after the friend's first cut", async () => {
  const b = await newBarber();
  const host = (await register("Host Friend", "host@example.com")).json;
  const ref = (await call("/me/referral", { token: host.token })).json;
  assert.match(ref.code, /^FRESH-[A-Z0-9]{5}$/);
  assert.equal(ref.amount, 2500);
  assert.equal((await register("Bad Code", "badcode@example.com", "FRESH-ZZZZZ")).status, 400);
  const guest = (await register("New Friend", "newfriend@example.com", ref.code.toLowerCase())).json;
  assert.equal((await call("/me/referral", { token: host.token })).json.invited, 1);

  const { id } = await book(guest.token, b.id);
  assert.equal((await call(`/bookings/${id}/status`, { token: b.token, body: { status: "completed" } })).status, 200);
  const hostUser = db.users.find((u) => u.email === "host@example.com")!;
  const guestUser = db.users.find((u) => u.email === "newfriend@example.com")!;
  assert.equal(hostUser.credit?.aed, 2500);
  assert.equal(guestUser.credit?.aed, 2500);
  // Only the first cut counts.
  const second = await book(guest.token, b.id, 5);
  await call(`/bookings/${second.id}/status`, { token: b.token, body: { status: "completed" } });
  assert.equal(hostUser.credit?.aed, 2500);
  assert.equal((await call("/me/referral", { token: host.token })).json.rewarded, 1);
});

test("rebook reminders offer the next free time; birthdays get a treat once", async () => {
  const b = await newBarber();
  const me = (await register("Re Book", "rebook@example.com")).json;
  const set = await call("/me/rebook", { method: "PATCH", token: me.token, body: { everyWeeks: 3, barberId: b.id } });
  assert.equal(set.status, 200);
  assert.equal(set.json.rebook.everyWeeks, 3);
  const user = db.users.find((u) => u.email === "rebook@example.com")!;
  user.rebook!.nextAt = new Date(Date.now() - 1000).toISOString();
  runPerks();
  const nudge = db.notifications.filter((x) => x.userId === user.id && x.title === "Time for a fresh cut");
  assert.equal(nudge.length, 1);
  assert.match(nudge[0]!.body, /is free|Book your next/);
  assert.ok(Date.parse(user.rebook!.nextAt) > Date.now() + 20 * 86_400_000, "next nudge in three weeks");
  assert.equal((await call("/me/rebook", { method: "PATCH", token: me.token, body: { everyWeeks: null } })).json.rebook, undefined);

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", month: "2-digit", day: "2-digit" }).format(new Date());
  assert.equal((await call("/me", { method: "PATCH", token: me.token, body: { birthday: "13-40" } })).status, 400);
  assert.equal((await call("/me", { method: "PATCH", token: me.token, body: { birthday: today } })).status, 200);
  runPerks();
  runPerks();
  assert.equal(user.credit?.aed, 2000);
  assert.equal(db.notifications.filter((x) => x.userId === user.id && x.title.startsWith("Happy birthday")).length, 1);
});

test("profile photo, phone and WhatsApp on the account", async () => {
  const me = (await register("Pro File", "profile@example.com")).json;
  assert.equal((await call("/me", { method: "PATCH", token: me.token, body: { whatsapp: true } })).status, 400, "needs a number first");
  const ok = await call("/me", { method: "PATCH", token: me.token, body: { photoUrl: "/uploads/me.jpg", phone: "+971 50 000 0000", whatsapp: true } });
  assert.equal(ok.status, 200);
  assert.equal(ok.json.photoUrl, "/uploads/me.jpg");
  assert.equal(ok.json.whatsapp, true);
  assert.equal((await call("/me", { method: "PATCH", token: me.token, body: { photoUrl: "https://evil.example/x.jpg" } })).status, 400);
});

test("share my visit: a read-only link without the address or contact details", async () => {
  const b = await newBarber();
  const me = (await register("Sha Re", "share@example.com")).json;
  const { id } = await book(me.token, b.id);
  const shared = await call(`/bookings/${id}/share`, { method: "POST", token: me.token });
  assert.equal(shared.status, 200);
  const again = await call(`/bookings/${id}/share`, { method: "POST", token: me.token });
  assert.equal(again.json.token, shared.json.token, "same link each time");
  const view = await call(`/visits/${shared.json.token}`);
  assert.equal(view.status, 200);
  assert.equal(view.json.customerFirstName, "Sha");
  assert.equal(view.json.barber.name, "Cust Barber" + n);
  assert.equal(JSON.stringify(view.json).includes("share@example.com"), false);
  assert.equal((await call("/visits/not-a-real-token")).status, 404);
  const mine = (await call("/bookings", { token: me.token })).json as { shareToken?: string }[];
  assert.ok(mine.length > 0 && mine.every((x) => !x.shareToken), "the token isn't sent around with bookings");
});

test("review photos and the barber's reply", async () => {
  const b = await newBarber();
  const me = (await register("Re View", "review-photo@example.com")).json;
  const { id } = await book(me.token, b.id);
  await call(`/bookings/${id}/status`, { token: b.token, body: { status: "completed" } });
  const review = await call(`/bookings/${id}/review`, { token: me.token, body: { rating: 5, comment: "Sharp", photoUrl: "/uploads/fresh.jpg" } });
  assert.equal(review.status, 201);
  const list = (await call("/business/reviews", { token: b.token })).json;
  assert.equal(list.length, 1);
  assert.equal(list[0].customerName, "Re");
  assert.equal(list[0].photoUrl, "/uploads/fresh.jpg");
  assert.equal((await call(`/reviews/${list[0].id}/reply`, { token: me.token, body: { text: "Thanks!" } })).status, 404);
  const reply = await call(`/reviews/${list[0].id}/reply`, { token: b.token, body: { text: "Thanks for coming in!" } });
  assert.equal(reply.status, 200);
  const profile = (await call(`/barbers/${b.id}`)).json;
  assert.equal(profile.reviews[0].reply.text, "Thanks for coming in!");
  assert.ok(db.notifications.some((x) => x.title.endsWith("replied to your review")));
});

test("search: open now, and nearest first with distances", async () => {
  const b = await newBarber();
  b.barber.workingDays = [0, 1, 2, 3, 4, 5, 6];
  b.barber.openHour = 0;
  b.barber.closeHour = 24;
  assert.equal(openNow(b.barber), true);
  b.barber.offline = true;
  assert.equal(openNow(b.barber), false);
  b.barber.offline = false;
  const open = (await call("/barbers?country=AE&openNow=true")).json as { id: string }[];
  assert.ok(open.some((x) => x.id === b.id));
  // Standing right on this barber's pin: they come first.
  b.barber.lat = 25.2;
  b.barber.lng = 55.1;
  const near = (await call("/barbers?country=AE&sort=nearest&lat=25.2&lng=55.1")).json as { id: string; distanceKm: number }[];
  assert.equal(near[0]!.id, b.id);
  assert.equal(near[0]!.distanceKm, 0);
  assert.ok(near.every((x, i) => i === 0 || x.distanceKm >= near[i - 1]!.distanceKm));
});
