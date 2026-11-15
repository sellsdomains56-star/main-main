import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { test } from "node:test";

process.env.TIM_DATA_DIR = mkdtempSync(tmpdir() + "/tim-") + "/";
const { toBubbles, typingDelayMs, readDelayMs, betweenMs } = await import("./humanize.js");
const jobs = await import("./jobs.js");

test("bubbles: one per line, long lines split at sentence ends, capped", () => {
  assert.deepEqual(toBubbles("yo\n\nwhat's up bro"), ["yo", "what's up bro"]);
  const long = Array.from({ length: 12 }, (_, i) => `This is sentence number ${i} and it is fairly long.`).join(" ");
  const out = toBubbles(long);
  assert.ok(out.length > 1 && out.every((b) => b.length <= 220));
  assert.equal(toBubbles(Array.from({ length: 20 }, () => "x").join("\n")).length, 8);
});

test("speed: instant is zero, slow takes longer than fast, delays are capped", () => {
  const rng = () => 0.5;
  const text = "ok bro give me a sec";
  assert.equal(typingDelayMs(text, "instant", rng), 0);
  assert.equal(readDelayMs(text, "instant", rng), 0);
  assert.equal(betweenMs("instant", rng), 0);
  assert.ok(typingDelayMs(text, "fast", rng) < typingDelayMs(text, "normal", rng));
  assert.ok(typingDelayMs(text, "normal", rng) < typingDelayMs(text, "slow", rng));
  assert.ok(typingDelayMs("x".repeat(5000), "slow", rng) <= 9000);
});

test("job book: unpaid until marked paid, then the deadline clock starts", () => {
  const job = jobs.addJob({ client: "Omar", what: "website", amount: 3000, deadlineDays: 10 });
  assert.equal(job.status, "waiting_payment");
  assert.equal(jobs.findJob({ client: "omar" })?.id, job.id);
  const now = new Date("2026-11-15T10:00:00Z");
  const paid = jobs.markPaid(job.id, now)!;
  assert.equal(paid.status, "paid");
  assert.equal(paid.dueAt, "2026-11-25T10:00:00.000Z");
  assert.equal(jobs.markPaid(job.id, new Date("2027-01-01"))!.paidAt, now.toISOString()); // second "paid" changes nothing
});

test("findJob refuses to guess when a name matches two unpaid jobs", () => {
  jobs.addJob({ client: "Sara Ali", what: "video" });
  jobs.addJob({ client: "Sara Khan", what: "content pack" });
  assert.equal(jobs.findJob({ client: "sara" }), null);
});

test("nudges: unpaid jobs are chased at most once a day, reminders fire once", () => {
  jobs.addReminder(new Date("2026-11-16T09:00:00Z"), "schedule the Meet");
  const before = new Date("2026-11-16T10:00:00Z");
  const first = jobs.dueNudges(before);
  assert.ok(first.some((n) => n.startsWith("reminder:")));
  assert.ok(first.some((n) => n.startsWith("unpaid:")));
  assert.deepEqual(jobs.dueNudges(new Date(before.getTime() + 3_600_000)), []);
});
