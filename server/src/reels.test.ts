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

async function customer(email: string) {
  const r = await call("/auth/register", { body: { name: "Riley Reels", email, password: "password123" } });
  return r.json.token as string;
}

test("reels: save to a collection, comment, like a comment, delete your own", async () => {
  const token = await customer("reels1@example.com");
  const saved = await call("/reels/r6/save", { token, method: "POST" });
  assert.equal(saved.json.savedByMe, true);
  const { json: collection } = await call("/reels/saved", { token });
  assert.deepEqual(collection.map((r: { id: string }) => r.id), ["r6"]);

  const before = (await call("/reels/r6", { token })).json.comments;
  const c = await call("/reels/r6/comments", { token, body: { text: "  Clean waves  " } });
  assert.equal(c.status, 201);
  assert.equal(c.json.text, "Clean waves");
  assert.equal((await call("/reels/r6", { token })).json.comments, before + 1);
  assert.equal((await call("/reels/r6/comments", { token, body: { text: "   " } })).status, 400);

  const liked = await call(`/reels/r6/comments/${c.json.id}/like`, { token, method: "POST" });
  assert.deepEqual(liked.json, { likes: 1, likedByMe: true });
  const { json: list } = await call("/reels/r6/comments", { token });
  assert.equal(list[0].id, c.json.id); // newest first
  assert.equal(list[0].mine, true);

  const other = await customer("reels2@example.com");
  assert.equal((await call(`/reels/r6/comments/${c.json.id}`, { token: other, method: "DELETE" })).status, 404);
  assert.equal((await call(`/reels/r6/comments/${c.json.id}`, { token, method: "DELETE" })).status, 204);

  await call("/reels/r6/save", { token, method: "POST" });
  assert.equal((await call("/reels/saved", { token })).json.length, 0);
});

test("reels: views and shares count, reports reach support, sign-in needed to save", async () => {
  const { json: r0 } = await call("/reels/r1");
  await call("/reels/r1/view", { method: "POST" });
  await call("/reels/r1/share", { method: "POST" });
  const { json: r1 } = await call("/reels/r1");
  assert.equal(r1.views, r0.views + 1);
  assert.equal(r1.shares, r0.shares + 1);
  assert.equal((await call("/reels/r1/save", { method: "POST" })).status, 401);
  const token = await customer("reels3@example.com");
  assert.equal((await call("/reels/r1/report", { token, body: { reason: "It's spam" } })).status, 201);
  assert.equal((await call("/reels/nope")).status, 404);
});
