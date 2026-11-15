import { readJson, writeJson } from "./store.js";

export type JobStatus = "quoted" | "waiting_payment" | "paid" | "delivered" | "cancelled";

export interface Job {
  id: number;
  client: string;
  what: string;
  amount: number | null;
  currency: string;
  status: JobStatus;
  /** Days Tim promises after payment is confirmed. */
  deadlineDays: number | null;
  createdAt: string;
  paidAt?: string;
  dueAt?: string;
  /** When Tim last pinged the boss about this unpaid job. */
  lastChasedAt?: string;
  notes: string[];
}

export interface Reminder {
  id: number;
  at: string;
  text: string;
  done: boolean;
}

interface Book {
  nextJobId: number;
  nextReminderId: number;
  jobs: Job[];
  reminders: Reminder[];
}

const FILE = "jobs.json";
const empty = (): Book => ({ nextJobId: 1, nextReminderId: 1, jobs: [], reminders: [] });
const load = () => readJson<Book>(FILE, empty());
const save = (b: Book) => writeJson(FILE, b);

export function addJob(input: { client: string; what: string; amount?: number | null; currency?: string; deadlineDays?: number | null; status?: JobStatus }): Job {
  const b = load();
  const job: Job = {
    id: b.nextJobId++,
    client: input.client.trim(),
    what: input.what.trim(),
    amount: input.amount ?? null,
    currency: input.currency ?? "AED",
    status: input.status ?? "waiting_payment",
    deadlineDays: input.deadlineDays ?? null,
    createdAt: new Date().toISOString(),
    notes: [],
  };
  b.jobs.push(job);
  save(b);
  return job;
}

/** Find a job by id, or by client name when the boss just says "paid, Omar". Ambiguous names return null. */
export function findJob(ref: { id?: number; client?: string }): Job | null {
  const jobs = load().jobs;
  if (ref.id != null) return jobs.find((j) => j.id === ref.id) ?? null;
  if (!ref.client) return null;
  const q = ref.client.trim().toLowerCase();
  const open = jobs.filter((j) => j.client.toLowerCase().includes(q) && j.status !== "cancelled" && j.status !== "delivered");
  const unpaid = open.filter((j) => j.status === "waiting_payment" || j.status === "quoted");
  const pool = unpaid.length ? unpaid : open;
  return pool.length === 1 ? pool[0]! : null;
}

export function updateJob(id: number, patch: Partial<Pick<Job, "client" | "what" | "amount" | "currency" | "deadlineDays" | "status">> & { note?: string }): Job | null {
  const b = load();
  const job = b.jobs.find((j) => j.id === id);
  if (!job) return null;
  const { note, ...fields } = patch;
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) (job as unknown as Record<string, unknown>)[k] = v;
  if (note) job.notes.push(note);
  save(b);
  return job;
}

/** The boss said "paid". Only the owner can reach this; the deadline clock starts now. */
export function markPaid(id: number, now = new Date()): Job | null {
  const b = load();
  const job = b.jobs.find((j) => j.id === id);
  if (!job) return null;
  if (job.status === "paid" || job.status === "delivered") return job;
  job.status = "paid";
  job.paidAt = now.toISOString();
  if (job.deadlineDays != null) job.dueAt = new Date(now.getTime() + job.deadlineDays * 86_400_000).toISOString();
  save(b);
  return job;
}

export const listJobs = (): Job[] => load().jobs;

export function addReminder(at: Date, text: string): Reminder {
  const b = load();
  const r: Reminder = { id: b.nextReminderId++, at: at.toISOString(), text, done: false };
  b.reminders.push(r);
  save(b);
  return r;
}

export const listReminders = (): Reminder[] => load().reminders.filter((r) => !r.done);

/** Things Tim should bring up with the boss now: due reminders, and unpaid jobs not chased in the last 24h. */
export function dueNudges(now = new Date()): string[] {
  const b = load();
  const out: string[] = [];
  for (const r of b.reminders) {
    if (!r.done && new Date(r.at) <= now) {
      r.done = true;
      out.push(`reminder: ${r.text}`);
    }
  }
  for (const j of b.jobs) {
    if (j.status !== "waiting_payment") continue;
    const since = new Date(j.lastChasedAt ?? j.createdAt).getTime();
    if (now.getTime() - since >= 24 * 3_600_000) {
      j.lastChasedAt = now.toISOString();
      out.push(`unpaid: job #${j.id} ${j.client} (${j.what}) still waiting for payment`);
    }
  }
  if (out.length) save(b);
  return out;
}
