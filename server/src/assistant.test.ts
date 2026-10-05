import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "./app.js";
import { runTool, type TurnContext } from "./assistant.js";
import { db } from "./db.js";

let base = "";
const server = createApp().listen(0);
before(() => {
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });

test("help centre FAQ and support tickets", async () => {
  const faq = await (await fetch(`${base}/support/faq`)).json();
  assert.ok(faq.faq.length >= 8 && faq.email.includes("@"));

  assert.equal((await post("/support/tickets", { topic: "booking", message: "My barber did not show up today." })).status, 400, "guests need an email");
  const ok = await post("/support/tickets", { topic: "booking", message: "My barber did not show up today.", email: "guest@example.com" });
  assert.equal(ok.status, 201);
  assert.equal((await ok.json()).status, "open");
});

test("assistant endpoint needs a guest key or sign-in, and reports when Claude isn't configured", async () => {
  if (process.env.ANTHROPIC_API_KEY) return;
  assert.equal((await post("/assistant/chat", { message: "hi" })).status, 400);
  assert.equal((await post("/assistant/chat", { message: "hi" }, { "x-guest-key": "guest-key-1234567890" })).status, 503);
});

test("assistant tools: search, profile, availability, prepare booking, ticket", async () => {
  const ctx: TurnContext = { actions: [] };
  const found = (await runTool("search_barbers", { query: "fade", city: "London" }, ctx)) as { id: string; location: string; from: string }[];
  assert.ok(found.length > 0 && found.every((b) => b.location.startsWith("London")));
  assert.match(found[0].from, /£/);
  assert.deepEqual(ctx.actions[0].type, "barbers");

  const profile = (await runTool("get_barber", { barber_id: found[0].id }, ctx)) as { services: { id: string }[] };
  const serviceId = profile.services[0].id;

  // Find a day with free times.
  let slot: string | undefined;
  for (let i = 1; i < 10 && !slot; i++) {
    const date = new Date(Date.now() + i * 86_400_000).toISOString().slice(0, 10);
    const r = await runTool("check_availability", { barber_id: found[0].id, service_id: serviceId, date }, ctx);
    if (typeof r !== "string") slot = (r as { free_times: { starts_at: string }[] }).free_times[0].starts_at;
  }
  assert.ok(slot);
  await runTool("prepare_booking", { barber_id: found[0].id, service_id: serviceId, starts_at: slot, location_type: "shop" }, ctx);
  assert.ok(ctx.actions.some((a) => a.type === "book" && a.startsAt === slot));
  await assert.rejects(runTool("prepare_booking", { barber_id: found[0].id, service_id: serviceId, starts_at: "2020-01-01T10:00:00.000Z", location_type: "shop" }, ctx));

  assert.match(String(await runTool("list_my_bookings", {}, ctx)), /not signed in/);
  assert.match(String(await runTool("create_support_ticket", { topic: "payment", message: "Charged twice" }, ctx)), /email/);
  const t = (await runTool("create_support_ticket", { topic: "payment", message: "Charged twice for one cut", email: "a@b.co" }, ctx)) as { ticket_id: string };
  assert.ok(db.tickets.some((x) => x.id === t.ticket_id && x.source === "assistant"));
});
