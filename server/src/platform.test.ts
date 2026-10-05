import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "./app.js";

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

test("profiles include experience, languages, portfolio, transformations and next availability", async () => {
  const { json: b } = await call("/barbers/b1");
  assert.ok(b.yearsExperience > 0);
  assert.ok(b.languages.length > 0);
  assert.ok(b.gallery.length > 0 && b.gallery[0].url.startsWith("/media/"));
  assert.ok(b.transformations[0].beforeUrl && b.transformations[0].afterUrl);
  assert.ok(b.nextAvailable && Date.parse(b.nextAvailable) > Date.now());
  assert.equal((await fetch(base + b.transformations[0].afterUrl)).status, 200);
});

test("search worldwide with filters", async () => {
  const { json: all } = await call("/barbers");
  assert.ok(new Set(all.map((b: { countryCode: string }) => b.countryCode)).size >= 10, "barbers in many countries");

  const { json: text } = await call("/barbers?search=fade%20london");
  assert.ok(text.length > 0 && text.every((b: { city: string }) => b.city === "London"));

  const { json: braids } = await call("/barbers?specialty=braids,locs");
  assert.ok(braids.length > 0 && braids.every((b: { specialties: string[] }) => b.specialties.some((s) => s === "braids" || s === "locs")));

  const { json: top } = await call("/barbers?minRating=4.85");
  assert.ok(top.every((b: { rating: number }) => b.rating >= 4.8));

  const { json: cheap } = await call("/barbers?country=GB&maxPrice=2000");
  assert.ok(cheap.length > 0 && cheap.every((b: { startingPrice: number }) => b.startingPrice <= 2000));

  const { json: soon } = await call("/barbers?sort=soonest");
  const times = soon.map((b: { nextAvailable: string | null }) => b.nextAvailable ?? "9999");
  assert.deepEqual(times, [...times].sort());

  const { json: exp } = await call("/barbers?sort=experience");
  assert.ok(exp[0].yearsExperience >= exp[exp.length - 1].yearsExperience);

  const { json: specs } = await call("/specialties");
  assert.ok(specs.includes("skin fade"));
});

test("barbers manage photo, gallery and before/after", async () => {
  const { json: acc } = await call("/auth/register-barber", {
    body: { name: "Port Folio", email: "pf@example.com", password: "password123", countryCode: "FR", city: "Paris", shopAddress: "1 Rue", haircutPrice: 3000, yearsExperience: 4, languages: ["French"] },
  });
  const upload = async (token: string) =>
    fetch(`${base}/uploads/image`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "image/jpeg" }, body: new Uint8Array(2000) });

  const { json: customer } = await call("/auth/register", { body: { name: "C", email: "c-pf@example.com", password: "password123" } });
  assert.equal((await upload(customer.token)).status, 403);

  const up = await upload(acc.token);
  assert.equal(up.status, 201);
  const { url } = await up.json();
  assert.match(url, /^\/uploads\/.+\.jpg$/);

  const patched = await call("/barbers/me", { method: "PATCH", token: acc.token, body: { photoUrl: url, yearsExperience: 5, languages: ["French", "English"] } });
  assert.equal(patched.json.photoUrl, url);
  assert.equal(patched.json.yearsExperience, 5);

  assert.equal((await call("/barbers/me/gallery", { token: acc.token, body: { url: "https://evil.example/x.jpg" } })).status, 400);
  const g = await call("/barbers/me/gallery", { token: acc.token, body: { url, caption: "Fresh fade" } });
  assert.equal(g.json.gallery[0].caption, "Fresh fade");
  const t = await call("/barbers/me/transformations", { token: acc.token, body: { beforeUrl: url, afterUrl: url, caption: "Skin fade" } });
  assert.equal(t.json.transformations.length, 1);
  const removed = await call(`/barbers/me/gallery/${g.json.gallery[0].id}`, { method: "DELETE", token: acc.token });
  assert.equal(removed.json.gallery.length, 0);
});
