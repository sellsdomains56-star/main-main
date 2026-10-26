import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import {
  addMemory,
  addReminder,
  cancelReminder,
  deleteMemory,
  listMemories,
  listReminders,
  searchMessages,
} from "../db.js";
import {
  changedFiles,
  formatSize,
  isTextMime,
  isVisionImage,
  mimeFor,
  registerGenerated,
  snapshotWorkspace,
  workspacePath,
} from "../files.js";
import { runCode } from "../tools/code.js";
import { generateImage } from "../tools/image.js";
import { formatWhen } from "../tools/schedule.js";
import { tr, trCount } from "../i18n.js";
import type { AgentProfile, EmailApproval, FileRecord } from "../types.js";

export interface ToolContext {
  conversationId: string;
  signal: AbortSignal;
  /** Update the running step's status line (e.g. "12/40 agents done"). */
  progress(text: string): void;
  /** Runs one task with a fresh agent (used by swarms). Not available inside a sub-agent. */
  runSubAgent?: (agent: AgentProfile | null, task: string, signal: AbortSignal) => Promise<SubAgentResult>;
}

export interface SubAgentResult {
  ok: boolean;
  text: string;
  files: FileRecord[];
}

export interface ToolOutcome {
  ok: boolean;
  /** What the model reads. */
  content: string;
  /** A short line for the step in the UI. */
  result?: string;
  /** Files the tool created, shown to the user. */
  files?: FileRecord[];
  /** Images the model should see (Claude reads them in the tool result). */
  images?: { mime: string; data: string }[];
  /** Something waiting for your OK, shown as a card in the chat. */
  approval?: EmailApproval;
}

export interface AgentTool {
  name: string;
  description: string;
  jsonSchema: Record<string, unknown>;
  label(input: unknown): string;
  detail?(input: unknown): string | undefined;
  run(input: unknown, ctx: ToolContext): Promise<ToolOutcome>;
}

export function defineTool<S extends z.ZodObject>(tool: {
  name: string;
  description: string;
  schema: S;
  label: (input: z.infer<S>) => string;
  detail?: (input: z.infer<S>) => string | undefined;
  run: (input: z.infer<S>, ctx: ToolContext) => Promise<ToolOutcome>;
}): AgentTool {
  const { $schema: _ignored, ...jsonSchema } = z.toJSONSchema(tool.schema) as Record<string, unknown>;
  // Labels are drawn before validation (while the input is still streaming in), so they get raw input.
  const loose = (fn?: (input: z.infer<S>) => string | undefined) => (input: unknown) => {
    try {
      return fn?.((input ?? {}) as z.infer<S>);
    } catch {
      return undefined;
    }
  };
  return {
    name: tool.name,
    description: tool.description,
    jsonSchema,
    label: (input) => loose(tool.label)(input) ?? tool.name,
    detail: loose(tool.detail),
    async run(input, ctx) {
      // Tool input is model output: validate it before acting on it.
      const parsed = tool.schema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, content: `Invalid input for ${tool.name}: ${z.prettifyError(parsed.error)}`, result: tr("Invalid input", "مدخلات غير صالحة") };
      }
      try {
        return await tool.run(parsed.data, ctx);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, content: `${tool.name} failed: ${message}`, result: message };
      }
    },
  };
}

const REPEAT_AR: Record<string, string> = { hourly: "كل ساعة", daily: "يوميًا", weekdays: "أيام العمل", weekly: "أسبوعيًا", monthly: "شهريًا" };

const quote = (s: string | undefined, max = 60) => (s ? `“${s.length > max ? `${s.slice(0, max)}…` : s}”` : "");

const MAX_IMAGE_FOR_MODEL = 3.5 * 1024 * 1024;

function imagesFor(files: FileRecord[]): ToolOutcome["images"] {
  const images: NonNullable<ToolOutcome["images"]> = [];
  for (const f of files) {
    if (!isVisionImage(f.mime) || f.size > MAX_IMAGE_FOR_MODEL || images.length >= 4) continue;
    images.push({ mime: f.mime, data: fs.readFileSync(workspacePath(f.name)).toString("base64") });
  }
  return images;
}

// ── Memory ────────────────────────────────────────────────────────────────────

const remember = defineTool({
  name: "remember",
  description:
    "Save a lasting fact about the user to long-term memory: who they are, preferences, people and projects in their life, " +
    "standing instructions. Use it when the user tells you something worth knowing in future conversations, or asks you to " +
    "remember something. One fact per call, written in the third person (\"Prefers metric units\"). Don't save one-off details.",
  schema: z.object({
    fact: z.string().min(2).max(600).describe("The fact, one sentence"),
    category: z.enum(["about_me", "preference", "person", "project", "instruction", "other"]).describe("What kind of fact it is"),
  }),
  label: () => tr("Saved to memory", "حُفظ في الذاكرة"),
  detail: (i) => i.fact,
  async run({ fact, category }) {
    const duplicate = listMemories().find((m) => m.text.toLowerCase() === fact.toLowerCase());
    if (duplicate) return { ok: true, content: `Already remembered (${duplicate.id}).`, result: tr("Already known", "معروف مسبقًا") };
    const memory = addMemory(fact, category);
    return { ok: true, content: `Saved as ${memory.id}.`, result: fact };
  },
});

const forget = defineTool({
  name: "forget",
  description: "Delete a memory by its id (ids appear in the memory list in your context). Use when a fact is wrong, outdated or the user asks you to forget it.",
  schema: z.object({ memory_id: z.string().describe("The memory id, e.g. mem_abc123") }),
  label: () => tr("Removed a memory", "حُذفت معلومة من الذاكرة"),
  async run({ memory_id }) {
    return deleteMemory(memory_id)
      ? { ok: true, content: "Deleted.", result: tr("Deleted", "حُذفت") }
      : { ok: false, content: `No memory with id ${memory_id}.`, result: tr("Not found", "غير موجود") };
  },
});

const searchPast = defineTool({
  name: "search_past_conversations",
  description:
    "Search the text of all earlier conversations with the user, newest first. Use it when they refer to something you discussed " +
    "before (\"that recipe from last week\", \"what did we decide about…\") that isn't in this conversation or your memory.",
  schema: z.object({ query: z.string().min(2).describe("A distinctive word or phrase to look for") }),
  label: (i) => tr(`Searched past chats for ${quote(i.query)}`, `بحث في المحادثات السابقة عن ${quote(i.query)}`),
  async run({ query }, ctx) {
    const hits = searchMessages(query, 15).filter((m) => m.conversationId !== ctx.conversationId);
    if (!hits.length) return { ok: true, content: "No earlier messages match.", result: tr("No matches", "لا نتائج") };
    const lines = hits.map((m) => {
      const i = m.text.toLowerCase().indexOf(query.toLowerCase());
      const start = Math.max(0, i - 200);
      const snippet = m.text.slice(start, start + 500).replace(/\s+/g, " ");
      const when = formatWhen(m.createdAt, config.timezone);
      return `- [${when}] "${m.title || "Untitled"}" (${m.role}): …${snippet}…`;
    });
    return { ok: true, content: lines.join("\n"), result: trCount(hits.length, ["{n} match", "{n} matches"], ["نتيجة واحدة", "نتيجتان", "{n} نتائج", "{n} نتيجة"]) };
  },
});

// ── Reminders & scheduled tasks ───────────────────────────────────────────────

const setReminder = defineTool({
  name: "set_reminder",
  description:
    "Schedule a reminder or a recurring task. At the given time the user gets a notification in this app (and on their phone if " +
    "set up). Give `task` when they want you to *do* something at that time, e.g. \"every weekday at 8:00 brief me on the news\" — " +
    "you will then carry out the task on your own and post the result. Times are ISO 8601 with the UTC offset from your context.",
  schema: z.object({
    message: z.string().min(1).max(300).describe("Short text of the reminder, as the user will see it"),
    when: z.string().describe("First time it fires, ISO 8601 with offset, e.g. 2026-10-27T08:00:00+04:00"),
    repeat: z.enum(["none", "hourly", "daily", "weekdays", "weekly", "monthly"]).default("none"),
    task: z.string().max(2000).optional().describe("Instructions for you to carry out at that time, if this is a task, not just a ping"),
  }),
  label: (i) => (i.task ? tr("Scheduled a task", "جدول مهمة") : tr("Set a reminder", "ضبط تذكيرًا")),
  detail: (i) => [i.message, i.when, i.repeat && i.repeat !== "none" ? `repeats ${i.repeat}` : ""].filter(Boolean).join(" · "),
  async run({ message, when, repeat, task }, ctx) {
    const at = Date.parse(when);
    if (Number.isNaN(at)) return { ok: false, content: `Couldn't read "${when}" as a time. Use ISO 8601 like 2026-10-27T08:00:00+04:00.` };
    if (at < Date.now() - 60_000) return { ok: false, content: `${formatWhen(at, config.timezone)} is in the past. Pick a future time.` };
    const reminder = addReminder({ message, task: task?.trim() || null, nextRun: at, repeat, conversationId: ctx.conversationId });
    const whenText = formatWhen(at, config.timezone);
    const repeatText = repeat === "none" ? "" : `, then ${repeat}`;
    const shown = formatWhen(at, config.timezone, true) + (repeat === "none" ? "" : tr(`, then ${repeat}`, `، ثم ${REPEAT_AR[repeat]}`));
    return { ok: true, content: `Scheduled ${reminder.id} for ${whenText}${repeatText}.`, result: shown };
  },
});

const listRemindersTool = defineTool({
  name: "list_reminders",
  description: "List the user's upcoming reminders and scheduled tasks with their ids.",
  schema: z.object({}),
  label: () => tr("Checked reminders", "راجع التذكيرات"),
  async run() {
    const all = listReminders();
    if (!all.length) return { ok: true, content: "No upcoming reminders.", result: tr("None", "لا شيء") };
    const lines = all.map(
      (r) =>
        `- ${r.id}: ${r.message} — next ${formatWhen(r.nextRun, config.timezone)}${r.repeat !== "none" ? ` (${r.repeat})` : ""}` +
        (r.task ? ` — task: ${r.task}` : ""),
    );
    return { ok: true, content: lines.join("\n"), result: trCount(all.length, ["{n} upcoming", "{n} upcoming"], ["تذكير قادم", "تذكيران قادمان", "{n} تذكيرات قادمة", "{n} تذكيرًا قادمًا"]) };
  },
});

const cancelReminderTool = defineTool({
  name: "cancel_reminder",
  description: "Cancel a reminder or scheduled task by id (from list_reminders).",
  schema: z.object({ reminder_id: z.string() }),
  label: () => tr("Cancelled a reminder", "ألغى تذكيرًا"),
  async run({ reminder_id }) {
    return cancelReminder(reminder_id)
      ? { ok: true, content: "Cancelled.", result: tr("Cancelled", "أُلغي") }
      : { ok: false, content: `No active reminder ${reminder_id}.`, result: tr("Not found", "غير موجود") };
  },
});

// ── Files & code ──────────────────────────────────────────────────────────────

const listFilesTool = defineTool({
  name: "list_files",
  description: "List the files in your workspace folder (uploads from the user and files you created).",
  schema: z.object({}),
  label: () => tr("Looked at files", "اطّلع على الملفات"),
  async run() {
    const files = [...snapshotWorkspace().keys()].sort();
    if (!files.length) return { ok: true, content: "The workspace is empty.", result: tr("Empty", "فارغ") };
    const lines = files.slice(0, 300).map((rel) => `- ${rel} (${formatSize(fs.statSync(workspacePath(rel)).size)})`);
    return { ok: true, content: lines.join("\n"), result: trCount(files.length, ["{n} file", "{n} files"], ["ملف واحد", "ملفان", "{n} ملفات", "{n} ملفًا"]) };
  },
});

const readFileTool = defineTool({
  name: "read_file",
  description:
    "Read a text file from the workspace (code, csv, json, markdown, logs…), or look at an image file. For PDFs, Office files and " +
    "other binary formats, use run_code with a suitable library instead.",
  schema: z.object({
    path: z.string().describe("Path relative to the workspace"),
    offset: z.number().int().min(0).default(0).describe("Character to start from, for long files"),
    max_chars: z.number().int().min(100).max(100_000).default(40_000),
  }),
  label: (i) => (i.path ? tr(`Read ${i.path}`, `قرأ ${i.path}`) : tr("Read a file", "قرأ ملفًا")),
  async run({ path: rel, offset, max_chars }) {
    const full = workspacePath(rel);
    if (!fs.existsSync(full)) return { ok: false, content: `No file "${rel}" in the workspace.`, result: tr("Not found", "غير موجود") };
    const mime = mimeFor(rel, "application/octet-stream");
    const size = fs.statSync(full).size;
    if (isVisionImage(mime) && size <= MAX_IMAGE_FOR_MODEL) {
      return {
        ok: true,
        content: `Image ${rel} (${formatSize(size)}) is attached.`,
        result: formatSize(size),
        images: [{ mime, data: fs.readFileSync(full).toString("base64") }],
      };
    }
    const buf = fs.readFileSync(full);
    if (!isTextMime(mime) && buf.subarray(0, 8000).includes(0)) {
      return { ok: false, content: `${rel} is a binary file (${mime}, ${formatSize(size)}). Use run_code to process it.`, result: tr("Binary file", "ملف ثنائي") };
    }
    const text = buf.toString("utf8");
    const slice = text.slice(offset, offset + max_chars);
    const more = offset + max_chars < text.length ? `\n\n[… ${text.length - offset - max_chars} more characters; call again with offset ${offset + max_chars}]` : "";
    return { ok: true, content: slice + more, result: `${formatSize(size)}` };
  },
});

const writeFileTool = defineTool({
  name: "write_file",
  description:
    "Create or overwrite a text file in the workspace and offer it to the user as a download — documents, code, CSVs, notes. " +
    "Subfolders are created as needed.",
  schema: z.object({
    path: z.string().min(1).describe("Path relative to the workspace, e.g. notes/plan.md"),
    content: z.string().describe("The full file contents"),
  }),
  label: (i) => (i.path ? tr(`Wrote ${i.path}`, `كتب ${i.path}`) : tr("Wrote a file", "كتب ملفًا")),
  async run({ path: rel, content }, ctx) {
    const full = workspacePath(rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
    const file = registerGenerated(rel.replace(/^\.\//, ""), ctx.conversationId);
    return { ok: true, content: `Wrote ${rel} (${formatSize(file.size)}). The user can download it.`, result: formatSize(file.size), files: [file] };
  },
});

const runCodeTool = defineTool({
  name: "run_code",
  description:
    "Run Python, JavaScript (Node.js) or bash on the user's machine, in the workspace folder, and get stdout/stderr back. Use it for " +
    "calculations, data analysis, charts (save with matplotlib to a .png file), converting or inspecting files (PDF, Excel, Word), " +
    "and anything that needs real computation. Files you save in the working directory are shown to the user. Each run is a fresh " +
    "process; packages already installed on the machine are available.",
  schema: z.object({
    language: z.enum(["python", "javascript", "bash"]),
    code: z.string().min(1).describe("The program to run"),
    timeout_seconds: z.number().int().min(1).max(300).default(60),
  }),
  label: (i) =>
    i.language === "bash"
      ? tr("Ran a shell command", "نفّذ أمرًا في الطرفية")
      : tr(`Ran ${i.language === "javascript" ? "JavaScript" : "Python"}`, `شغّل كود ${i.language === "javascript" ? "JavaScript" : "Python"}`),
  detail: (i) => i.code,
  async run({ language, code, timeout_seconds }, ctx) {
    const before = snapshotWorkspace();
    const r = await runCode(language, code, timeout_seconds, ctx.signal);
    const files = changedFiles(before).slice(0, 20).map((rel) => registerGenerated(rel, ctx.conversationId));
    const parts = [
      r.timedOut ? `Timed out after ${timeout_seconds}s.` : `Exit code ${r.exitCode}.`,
      r.stdout ? `stdout:\n${r.stdout}` : "stdout: (empty)",
      r.stderr ? `stderr:\n${r.stderr}` : "",
      files.length ? `Files created or changed (shown to the user): ${files.map((f) => f.name).join(", ")}` : "",
    ].filter(Boolean);
    const ok = !r.timedOut && r.exitCode === 0;
    const secs = (r.durationMs / 1000).toFixed(1);
    const summary = r.timedOut
      ? tr("Timed out", "انتهت المهلة")
      : ok
        ? tr(`Done in ${secs}s`, `اكتمل في ${secs} ث`)
        : tr(`Exited with ${r.exitCode}`, `انتهى برمز ${r.exitCode}`);
    return { ok, content: parts.join("\n\n"), result: summary, files, images: imagesFor(files) };
  },
});

const generateImageTool = defineTool({
  name: "generate_image",
  description:
    "Create an image from a text description with Grok Imagine and show it to the user. Write a rich, specific prompt: subject, " +
    "style, composition, lighting, mood.",
  schema: z.object({
    prompt: z.string().min(3).max(4000),
    aspect_ratio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"]).optional(),
  }),
  label: () => tr("Generated an image", "أنشأ صورة"),
  detail: (i) => i.prompt,
  async run({ prompt, aspect_ratio }, ctx) {
    const file = await generateImage(prompt, aspect_ratio, ctx.conversationId, ctx.signal);
    return {
      ok: true,
      content: `Generated ${file.name}; it is shown to the user. Don't repeat the prompt back unless asked.`,
      result: file.name,
      files: [file],
    };
  },
});

/** Our own tools, by ability group. */
export const BASE_TOOLS = {
  memory: [remember, forget, searchPast],
  reminders: [setReminder, listRemindersTool, cancelReminderTool],
  files: [listFilesTool, readFileTool, writeFileTool],
  /** Only offered when code runs on this machine (see toolsFor). */
  code: [runCodeTool],
  images: config.xaiKey ? [generateImageTool] : [],
};

export function workspaceListing(limit = 40): string {
  const files = [...snapshotWorkspace().keys()].sort();
  if (!files.length) return "(empty)";
  const shown = files.slice(0, limit).join(", ");
  return files.length > limit ? `${shown}, … and ${files.length - limit} more` : shown;
}

