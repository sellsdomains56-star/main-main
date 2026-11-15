import Anthropic from "@anthropic-ai/sdk";
import { SPEEDS, type Speed } from "./humanize.js";
import { addJob, addReminder, findJob, listJobs, markPaid, updateJob } from "./jobs.js";
import { systemPrompt } from "./persona.js";
import { getHistory, pushTurns, setSpeed } from "./state.js";

const MODEL = () => process.env.TIM_MODEL ?? "claude-sonnet-5-5";
const MAX_ROUNDS = 6;
let client: Anthropic | undefined;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "add_job",
    description: "Put a new client job in the job book. Only use amounts/days the boss or the rate card gave you.",
    input_schema: {
      type: "object",
      properties: {
        client: { type: "string" },
        what: { type: "string", description: "e.g. 'website', 'promo video with storyboard'" },
        amount: { type: "number" },
        currency: { type: "string", description: "default AED" },
        deadline_days: { type: "number", description: "days promised AFTER payment is confirmed" },
      },
      required: ["client", "what"],
      additionalProperties: false,
    },
  },
  {
    name: "mark_paid",
    description: "The boss said the client has paid. Starts the deadline clock. NEVER call this unless the boss himself said it in this chat.",
    input_schema: {
      type: "object",
      properties: { job_id: { type: "number" }, client: { type: "string", description: "client name if no id" }, deadline_days: { type: "number", description: "set only if the job has none yet" } },
      additionalProperties: false,
    },
  },
  {
    name: "update_job",
    description: "Change a job's amount, deadline days, description or status, or add a note.",
    input_schema: {
      type: "object",
      properties: {
        job_id: { type: "number" },
        amount: { type: "number" },
        deadline_days: { type: "number" },
        what: { type: "string" },
        status: { type: "string", enum: ["quoted", "waiting_payment", "delivered", "cancelled"] },
        note: { type: "string" },
      },
      required: ["job_id"],
      additionalProperties: false,
    },
  },
  { name: "list_jobs", description: "Show every job with its status and due date.", input_schema: { type: "object", properties: {}, additionalProperties: false } },
  {
    name: "add_reminder",
    description: "Remind the boss about something at a given time (e.g. the Google Meet you pushed to later). Needs a real date/time from the boss.",
    input_schema: {
      type: "object",
      properties: { at: { type: "string", description: "ISO 8601 date-time with timezone offset" }, text: { type: "string" } },
      required: ["at", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "set_speed",
    description: "Change how fast Tim answers. Only when the boss asks.",
    input_schema: { type: "object", properties: { speed: { type: "string", enum: [...SPEEDS] } }, required: ["speed"], additionalProperties: false },
  },
];

function runTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "add_job": {
      const job = addJob({
        client: String(input.client),
        what: String(input.what),
        amount: typeof input.amount === "number" ? input.amount : null,
        currency: typeof input.currency === "string" ? input.currency : undefined,
        deadlineDays: typeof input.deadline_days === "number" ? input.deadline_days : null,
      });
      return JSON.stringify(job);
    }
    case "mark_paid": {
      const ref = { id: typeof input.job_id === "number" ? input.job_id : undefined, client: typeof input.client === "string" ? input.client : undefined };
      const found = findJob(ref);
      if (!found) return "error: couldn't pin down exactly one job. Ask the boss which one.";
      if (found.deadlineDays == null && typeof input.deadline_days !== "number") return "error: this job has no deadline days yet. Ask the boss how many days, then call again with deadline_days.";
      if (found.deadlineDays == null) updateJob(found.id, { deadlineDays: input.deadline_days as number });
      return JSON.stringify(markPaid(found.id));
    }
    case "update_job": {
      const job = updateJob(Number(input.job_id), {
        amount: typeof input.amount === "number" ? input.amount : undefined,
        deadlineDays: typeof input.deadline_days === "number" ? input.deadline_days : undefined,
        what: typeof input.what === "string" ? input.what : undefined,
        status: typeof input.status === "string" ? (input.status as never) : undefined,
        note: typeof input.note === "string" ? input.note : undefined,
      });
      return job ? JSON.stringify(job) : "error: no such job";
    }
    case "list_jobs":
      return JSON.stringify(listJobs());
    case "add_reminder": {
      const at = new Date(String(input.at));
      if (Number.isNaN(at.getTime()) || at.getTime() < Date.now()) return "error: that time is invalid or in the past. Ask the boss for the day and time.";
      return JSON.stringify(addReminder(at, String(input.text)));
    }
    case "set_speed": {
      const s = input.speed as Speed;
      if (!SPEEDS.includes(s)) return "error: unknown speed";
      setSpeed(s);
      return `ok, speed is now ${s}`;
    }
    default:
      return `error: unknown tool ${name}`;
  }
}

/** One owner message in, Tim's raw reply text out (one bubble per line). */
export async function reply(incoming: string): Promise<string> {
  client ??= new Anthropic();
  const messages: Anthropic.MessageParam[] = [...getHistory().map((t) => ({ role: t.role, content: t.text })), { role: "user", content: incoming }];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const res = await client.messages.create({ model: MODEL(), max_tokens: 1024, system: systemPrompt(), tools: TOOLS, messages });
    messages.push({ role: "assistant", content: res.content });
    const uses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
    if (res.stop_reason !== "tool_use" || !uses.length) {
      const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
      const out = text || "didn't get that bro, say it again?";
      pushTurns({ role: "user", text: incoming }, { role: "assistant", text: out });
      return out;
    }
    messages.push({
      role: "user",
      content: uses.map((u) => {
        try {
          return { type: "tool_result" as const, tool_use_id: u.id, content: runTool(u.name, u.input as Record<string, unknown>) };
        } catch (err) {
          return { type: "tool_result" as const, tool_use_id: u.id, content: `error: ${(err as Error).message}`, is_error: true };
        }
      }),
    });
  }
  const out = "my head's messy rn bro, say it again in a bit";
  pushTurns({ role: "user", text: incoming }, { role: "assistant", text: out });
  return out;
}
