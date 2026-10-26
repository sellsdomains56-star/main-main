import type { AgentProfile, Conversation, Effort, FileRecord, Memory, Reminder, Repeat, Settings, Step, StoredMessage } from "../../src/types.js";
import { TOOL_GROUPS } from "../../src/types.js";
import { setFileUrlResolver } from "../api.js";
import { lang } from "../i18n.js";
import { agentFrom, broadcast, fail, installBackend, json, newId, Run, sleep, sse, type Json } from "../inpage.js";
import { capability, type Sample, type SampleError, type SampleOptions, type SampleTool, type SampleTurn } from "./claude.js";
import { Store, WrongPassword } from "./store.js";

/**
 * The cloud page: the app runs entirely in this page, Claude answers through
 * the viewer's own claude.ai account (the `sample` capability), and
 * everything is kept, encrypted with the user's password, in their private
 * store (`db`). No server, no API key.
 */

type Tool = Extract<Step, { kind: "tool" }>;

const L = (en: string, ar: string) => (lang() === "ar" ? ar : en);
const AGENT_NAME = "Dizz Lab";
const SWARM_CONCURRENCY = 2;
const SWARM_MAX_TASKS = 8;
/** Leave room under the 256 KiB input cap for the instructions and the reply's tool rounds. */
const MAX_INPUT_BYTES = 170_000;

const DEFAULT_SETTINGS: Settings = { language: "", userName: "", defaultModel: "claude", effort: "auto", personality: "default", customInstructions: "", monthlyBudget: 0 };

const data = {
  settings: { ...DEFAULT_SETTINGS },
  memories: [] as Memory[],
  reminders: [] as Reminder[],
  agents: new Map<string, AgentProfile>(),
  conversations: new Map<string, Conversation>(),
  /** Loaded conversations' messages (each is its own encrypted record). */
  messages: new Map<string, StoredMessage[]>(),
  /** Uploads live in this page only. */
  files: new Map<string, FileRecord & { blob: Blob; url: string }>(),
};
const runs = new Map<string, Run>();
let authed = false;
let failedLogins = 0;

setFileUrlResolver((id) => data.files.get(id)?.url ?? "");

// ── Startup: what this view can use ─────────────────────────────────────────

let sample: Sample | null = null;
let store!: Store;
const ready = (async () => {
  const [s, db, user] = await Promise.all([capability.sample(), capability.db(), capability.user()]);
  sample = s;
  const userId = (await user?.id().catch(() => null)) ?? null;
  store = await Store.open(db, userId, (err) => {
    console.error("[dizz] save failed", err);
    const code = (err as { code?: string })?.code;
    broadcast({
      type: "notification",
      title: L("Couldn't save", "تعذّر الحفظ"),
      body: code === "quota_exceeded" ? L("Your storage is full. Delete some old chats.", "مساحة التخزين ممتلئة. احذف بعض المحادثات القديمة.") : L("Your latest change may not be kept.", "قد لا يُحفظ آخر تغيير."),
      conversationId: null,
    });
  });
  if (!store.persistent) {
    authed = true;
    scheduleReminders();
  }
})();

const saveSettings = () => store.save("settings", data.settings);
const saveMemories = () => store.save("memories", data.memories);
const saveReminders = () => store.save("reminders", data.reminders);
const saveAgents = () => store.save("agents", [...data.agents.values()]);
const saveIndex = () => store.save("index", [...data.conversations.values()]);
const saveMessages = (id: string) => store.save(`c_${id}`, data.messages.get(id) ?? []);

async function loadAll() {
  const [settings, memories, reminders, agents, index] = await Promise.all([
    store.load<Settings>("settings"),
    store.load<Memory[]>("memories"),
    store.load<Reminder[]>("reminders"),
    store.load<AgentProfile[]>("agents"),
    store.load<Conversation[]>("index"),
  ]);
  data.settings = { ...DEFAULT_SETTINGS, ...(settings ?? {}) };
  data.memories = memories ?? [];
  data.reminders = reminders ?? [];
  data.agents = new Map((agents ?? []).map((a) => [a.id, a]));
  data.conversations = new Map((index ?? []).map((c) => [c.id, c]));
  data.messages.clear();
  scheduleReminders();
}

function signOut() {
  for (const run of runs.values()) run.stop();
  store.lock();
  authed = false;
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  data.settings = { ...DEFAULT_SETTINGS };
  data.memories = [];
  data.reminders = [];
  data.agents.clear();
  data.conversations.clear();
  data.messages.clear();
}

async function messagesOf(id: string): Promise<StoredMessage[]> {
  let list = data.messages.get(id);
  if (!list) {
    list = (await store.load<StoredMessage[]>(`c_${id}`)) ?? [];
    data.messages.set(id, list);
  }
  return list;
}

function touch(id: string) {
  const c = data.conversations.get(id);
  if (c) c.updatedAt = Date.now();
  void saveIndex();
}

// ── Reminders (they fire while this page is open, and catch up when it opens) ─

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function nextRun(r: Reminder): number | null {
  const d = new Date(r.nextRun);
  const step: Record<Exclude<Repeat, "none">, () => void> = {
    hourly: () => d.setHours(d.getHours() + 1),
    daily: () => d.setDate(d.getDate() + 1),
    weekdays: () => {
      do d.setDate(d.getDate() + 1);
      while (d.getDay() === 0 || d.getDay() === 6);
    },
    weekly: () => d.setDate(d.getDate() + 7),
    monthly: () => d.setMonth(d.getMonth() + 1),
  };
  if (r.repeat === "none") return null;
  do step[r.repeat]();
  while (d.getTime() <= Date.now());
  return d.getTime();
}

function scheduleReminders() {
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();
  for (const r of data.reminders) {
    if (!r.active) continue;
    const wait = r.nextRun - Date.now();
    if (wait > 2 ** 31 - 1) continue; // more than ~24 days out: scheduled on a later visit
    timers.set(r.id, setTimeout(() => void fireReminder(r), Math.max(0, wait)));
  }
}

async function fireReminder(r: Reminder) {
  timers.delete(r.id);
  if (!r.active || !authed) return;
  r.lastRun = Date.now();
  const next = nextRun(r);
  if (next) r.nextRun = next;
  else r.active = false;
  void saveReminders();
  if (next) scheduleReminders();
  const body = r.task ? `${r.message}\n\n${L("Scheduled task:", "مهمة مجدولة:")} ${r.task}` : r.message;
  if (r.conversationId && data.conversations.has(r.conversationId)) {
    const list = await messagesOf(r.conversationId);
    list.push({
      id: newId("m"),
      conversationId: r.conversationId,
      role: "assistant",
      createdAt: Date.now(),
      text: `⏰ **${L("Reminder", "تذكير")}:** ${body}`,
      provider: "system",
      status: "complete",
    });
    void saveMessages(r.conversationId);
    touch(r.conversationId);
    broadcast({ type: "conversation", conversationId: r.conversationId, running: false });
  }
  broadcast({ type: "notification", title: L("⏰ Reminder", "⏰ تذكير"), body: r.message, conversationId: r.conversationId });
}

// ── What Claude is told ─────────────────────────────────────────────────────

const PERSONALITIES: Record<Settings["personality"], string> = {
  default:
    "Talk like a brilliant friend who happens to know a lot, not like a help desk. Be direct, warm and sharp. Lead with the " +
    "answer, then the reasoning that matters. Match the user's energy: a casual message gets a short, natural reply in plain " +
    "sentences, not headings and bullet lists; a big question gets a thorough answer. Have opinions when asked and say which " +
    "option you'd pick and why. Say \"I'm not sure\" plainly when you aren't. A dry sense of humour is welcome when it fits. " +
    "Skip filler, stock phrases (\"Great question!\", \"I hope this helps\"), needless disclaimers and flattery.",
  fun: "Fun mode: be witty, playful and a little irreverent, like a clever friend. Jokes are welcome, but the facts still have to be right and useful.",
  concise: "Be extremely concise: the shortest answer that fully helps. Bullet points over paragraphs. No preamble, no recap.",
  professional: "Be polished and precise, like a trusted chief of staff: structured, thorough, neutral in tone.",
};

function when(ms: number) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short" }).format(ms);
}

function utcOffset(ms: number) {
  const minutes = -new Date(ms).getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

function instructionsFor(agent: AgentProfile | null, isSubAgent: boolean, hasTools: boolean): string {
  const s = data.settings;
  const name = s.userName.trim();
  const owner = `one person${name ? `, ${name}` : ""}`;
  const now = Date.now();
  const parts = [
    "<instructions>",
    "These instructions come from the user's own app, Dizz Lab, not from the user typing. Follow them for the whole conversation.",
    agent
      ? `You are ${agent.name}, one of the custom AI agents in ${AGENT_NAME}, a private agent system that works for ${owner}.${agent.description ? ` Your role: ${agent.description}` : ""}`
      : `You are ${AGENT_NAME}, a private AI agent that works for ${owner}: their assistant for research, writing, planning, ` +
        "analysis, learning and running their day. Nobody else uses this app, so you can be personal and remember things about them.",
    agent?.instructions.trim() ? `Your instructions:\n<agent_instructions>\n${agent.instructions.trim()}\n</agent_instructions>` : "",
    isSubAgent
      ? "Right now you are a sub-agent: the main agent handed you one task from a larger job. Work on your own and don't ask questions " +
        "(nobody will answer). Your reply goes back to the main agent, so make it complete and self-contained, with no chit-chat."
      : "",
    PERSONALITIES[s.personality] ?? PERSONALITIES.default,
    s.language === "ar"
      ? "Language: the user's app is in Arabic. Reply in Arabic (Modern Standard Arabic, or match their dialect if they write in one) unless they write in another language."
      : "Language: reply in the language the user writes in (for example Arabic or English).",
    hasTools
      ? [
          "Your tools:",
          "- Long-term memory: save lasting facts about the user with `remember` without asking (one fact each); `forget` wrong ones. Don't announce routine saves at length.",
          "- Reminders: `set_reminder` with an exact ISO 8601 time worked out from the current time and offset below. They pop up while the user has this app open.",
          isSubAgent ? "" : "- Agents: create custom agents with `create_agents` when asked, and use `delegate_tasks` to have several work in parallel on independent pieces of a job.",
          "- `search_past_conversations` finds things discussed in earlier chats.",
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    "Limits of this version: it runs inside the user's claude.ai account, so you can't browse the web, read live news or prices, run code, " +
      "or use their email and calendar here. If a request needs that, say so in one line and do what you can (the Dizz Lab app on " +
      "their computer can do those things).",
    "Format with Markdown: short paragraphs, headings only for long answers, tables for comparisons, fenced code blocks with a language.",
    s.customInstructions.trim() ? `The user's own instructions for you (follow them):\n<custom_instructions>\n${s.customInstructions.trim()}\n</custom_instructions>` : "",
    `Current time: ${when(now)} (UTC${utcOffset(now)}, ${Intl.DateTimeFormat().resolvedOptions().timeZone})`,
    data.memories.length ? `What you remember about the user:\n${data.memories.map((m) => `- [${m.id}] (${m.category}) ${m.text}`).join("\n")}` : "What you remember about the user: nothing yet.",
    data.agents.size ? `Custom agents: ${data.agents.size} (use list_agents to see them)` : "",
    "</instructions>",
  ];
  return parts.filter(Boolean).join("\n\n");
}

/** How hard Claude thinks for each setting. Max asks for the most capable model by name and falls back to the top tier. */
function tierFor(effort: Effort): Pick<SampleOptions, "modelTier" | "model" | "effort"> {
  switch (effort) {
    case "fast":
      return { modelTier: "quick" };
    case "deep":
      return { modelTier: "complex", effort: "high" };
    case "max":
      return { modelTier: "complex", model: "claude-fable-5-1", effort: "high" };
    default:
      return { modelTier: "default" };
  }
}

function errorText(e: SampleError | undefined): string {
  switch (e?.code) {
    case "not_granted":
      return L("You didn't allow this page to use Claude. Reload it and choose Allow to chat.", "لم تسمح لهذه الصفحة باستخدام Claude. أعد تحميلها واختر السماح لتبدأ المحادثة.");
    case "sampling_disabled":
    case "not_declared":
    case "capability_disabled":
    case "capability_removed":
      return L("Claude isn't available in this view. Open this page in the Claude app or on claude.ai.", "Claude غير متاح هنا. افتح هذه الصفحة في تطبيق Claude أو على claude.ai.");
    case "rate_limited":
      return L("You've reached your Claude usage limit for now. Try again a bit later.", "وصلت إلى حد استخدام Claude حاليًا. حاول مرة أخرى بعد قليل.");
    case "session_expired":
      return L("Your claude.ai session ended. Sign in again, then reload this page.", "انتهت جلستك في claude.ai. سجّل الدخول مجددًا ثم أعد تحميل الصفحة.");
    case "refused":
      return L("Claude declined this one. Try asking in a different way.", "رفض Claude هذا الطلب. جرّب صياغته بطريقة أخرى.");
    case "prompt_too_large":
      return L("This chat has grown too long to send. Start a new chat.", "أصبحت هذه المحادثة أطول من أن تُرسل. ابدأ محادثة جديدة.");
    case "empty_completion":
      return L("Claude didn't write anything. Try again, or ask for less at once.", "لم يكتب Claude شيئًا. حاول مجددًا أو اطلب أقل دفعة واحدة.");
    case "image_rejected":
      return L("Claude couldn't read that image. Try a different one.", "تعذّر على Claude قراءة هذه الصورة. جرّب صورة أخرى.");
    default:
      return L("Couldn't reach Claude. Try again in a moment.", "تعذّر الوصول إلى Claude. حاول مرة أخرى بعد لحظة.");
  }
}

const bytes = (turns: SampleTurn[]) => turns.reduce((n, t) => n + new TextEncoder().encode(t.content).length, 0);
const isTextFile = (f: FileRecord) => /^text\/|json|csv|xml|javascript|typescript|markdown|yaml/.test(f.mime) || /\.(txt|md|csv|tsv|json|ya?ml|xml|html?|js|ts|py|sql|log)$/i.test(f.name);

async function userContent(m: StoredMessage): Promise<string> {
  let text = m.text;
  for (const f of m.attachments ?? []) {
    const file = data.files.get(f.id);
    if (file && isTextFile(f)) {
      const body = (await file.blob.text()).slice(0, 60_000);
      text += `\n\n<attached_file name="${f.name}">\n${body}\n</attached_file>`;
    } else if (!f.mime.startsWith("image/")) {
      text += `\n\n[${L("Attached", "مرفق")}: ${f.name} (${f.mime}); this version can only read text files and images]`;
    }
  }
  return text;
}

async function turnsFor(history: StoredMessage[], instructions: string): Promise<SampleTurn[]> {
  const turns: SampleTurn[] = [{ role: "user", content: instructions }];
  for (const m of history) {
    const content = m.role === "user" ? await userContent(m) : m.text;
    if (content.trim()) turns.push({ role: m.role, content });
  }
  // Drop the oldest exchanges (never the instructions) until it fits.
  while (bytes(turns) > MAX_INPUT_BYTES && turns.length > 2) turns.splice(1, 1);
  return turns;
}

// ── Tools Claude can use in this page ────────────────────────────────────────

interface TurnState {
  run: Run;
  conversationId: string;
  steps: Step[];
}

function startStep(t: TurnState, name: string, label: string, detail?: string) {
  const step: Tool = { kind: "tool", id: newId("tool"), name, label, detail, status: "running" };
  t.steps.push(step);
  t.run.push({ type: "step", step: { ...step } });
  return {
    progress(line: string) {
      step.result = line;
      t.run.push({ type: "step", step: { ...step } });
    },
    end(ok: boolean, result: string) {
      step.status = ok ? "ok" : "error";
      step.result = result;
      t.run.push({ type: "step", step: { ...step } });
    },
  };
}

const str = (v: unknown, max = 4000) => String(v ?? "").trim().slice(0, max);

function toolsFor(t: TurnState, isSubAgent: boolean, effort: Effort): SampleTool[] {
  const tools: SampleTool[] = [
    {
      name: "remember",
      description: "Save one lasting fact about the user to long-term memory (who they are, preferences, people, projects, standing instructions), in the third person.",
      inputSchema: {
        type: "object",
        properties: {
          fact: { type: "string", description: "The fact, one sentence" },
          category: { type: "string", enum: ["about_me", "preference", "person", "project", "instruction", "other"] },
        },
        required: ["fact", "category"],
      },
      execute(input) {
        const fact = str(input.fact, 600);
        if (fact.length < 2) throw new Error("The fact is empty");
        const step = startStep(t, "remember", L("Saved to memory", "حُفظ في الذاكرة"), fact);
        if (data.memories.some((m) => m.text.toLowerCase() === fact.toLowerCase())) {
          step.end(true, L("Already known", "معروف مسبقًا"));
          return "Already remembered.";
        }
        const memory: Memory = { id: newId("mem"), text: fact, category: str(input.category, 40) || "other", createdAt: Date.now() };
        data.memories.push(memory);
        void saveMemories();
        step.end(true, fact);
        return `Saved as ${memory.id}.`;
      },
    },
    {
      name: "forget",
      description: "Delete a memory by its id (shown in brackets in the memory list). Use when a fact is wrong or the user asks you to forget it.",
      inputSchema: { type: "object", properties: { memory_id: { type: "string" } }, required: ["memory_id"] },
      execute(input) {
        const id = str(input.memory_id, 100);
        const step = startStep(t, "forget", L("Removed a memory", "حُذفت معلومة من الذاكرة"));
        const before = data.memories.length;
        data.memories = data.memories.filter((m) => m.id !== id);
        const ok = data.memories.length < before;
        if (ok) void saveMemories();
        step.end(ok, ok ? L("Deleted", "حُذفت") : L("Not found", "غير موجود"));
        if (!ok) throw new Error(`No memory with id ${id}`);
        return "Deleted.";
      },
    },
    {
      name: "set_reminder",
      description: "Set a reminder, optionally repeating. It pops up in the app at that time while the app is open (and as soon as it's opened if missed).",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "Short reminder text, as the user will see it" },
          when: { type: "string", description: "ISO 8601 time with UTC offset, e.g. 2026-10-27T08:00:00+04:00" },
          repeat: { type: "string", enum: ["none", "hourly", "daily", "weekdays", "weekly", "monthly"] },
        },
        required: ["message", "when"],
      },
      execute(input) {
        const message = str(input.message, 300);
        const at = Date.parse(str(input.when, 60));
        if (!message) throw new Error("The reminder needs a message");
        if (Number.isNaN(at)) throw new Error(`Couldn't read "${str(input.when, 60)}" as a time; use ISO 8601 with an offset`);
        if (at < Date.now() - 60_000) throw new Error("That time is in the past");
        const repeat = (["none", "hourly", "daily", "weekdays", "weekly", "monthly"].includes(String(input.repeat)) ? input.repeat : "none") as Repeat;
        const reminder: Reminder = { id: newId("r"), message, task: null, nextRun: at, repeat, conversationId: t.conversationId, active: true, createdAt: Date.now(), lastRun: null };
        data.reminders.push(reminder);
        void saveReminders();
        scheduleReminders();
        const shown = new Intl.DateTimeFormat(lang() === "ar" ? "ar-u-nu-latn" : undefined, { dateStyle: "medium", timeStyle: "short" }).format(at);
        startStep(t, "set_reminder", L("Set a reminder", "ضبط تذكيرًا"), message).end(true, shown);
        return `Scheduled ${reminder.id} for ${when(at)}${repeat === "none" ? "" : `, then ${repeat}`}.`;
      },
    },
    {
      name: "list_reminders",
      description: "List the user's upcoming reminders with their ids.",
      execute() {
        const active = data.reminders.filter((r) => r.active).sort((a, b) => a.nextRun - b.nextRun);
        startStep(t, "list_reminders", L("Checked reminders", "راجع التذكيرات")).end(true, String(active.length));
        return active.length ? active.map((r) => `- ${r.id}: ${r.message} (next ${when(r.nextRun)}${r.repeat !== "none" ? `, ${r.repeat}` : ""})`).join("\n") : "No upcoming reminders.";
      },
    },
    {
      name: "cancel_reminder",
      description: "Cancel a reminder by id (from list_reminders).",
      inputSchema: { type: "object", properties: { reminder_id: { type: "string" } }, required: ["reminder_id"] },
      execute(input) {
        const r = data.reminders.find((x) => x.id === str(input.reminder_id, 100) && x.active);
        startStep(t, "cancel_reminder", L("Cancelled a reminder", "ألغى تذكيرًا")).end(!!r, r ? L("Cancelled", "أُلغي") : L("Not found", "غير موجود"));
        if (!r) throw new Error("No such active reminder");
        r.active = false;
        void saveReminders();
        scheduleReminders();
        return "Cancelled.";
      },
    },
    {
      name: "search_past_conversations",
      description: "Search the text of the user's earlier conversations (titles and messages), newest first. Returns short snippets.",
      inputSchema: { type: "object", properties: { query: { type: "string", description: "A distinctive word or phrase" } }, required: ["query"] },
      async execute(input) {
        const q = str(input.query, 200).toLowerCase();
        if (q.length < 2) throw new Error("Search for at least two characters");
        const step = startStep(t, "search_past_conversations", L(`Searched past chats for “${q}”`, `بحث في المحادثات السابقة عن “${q}”`));
        const recent = [...data.conversations.values()].filter((c) => c.id !== t.conversationId).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 40);
        const hits: string[] = [];
        for (const c of recent) {
          for (const m of await messagesOf(c.id)) {
            const i = m.text.toLowerCase().indexOf(q);
            if (i === -1) continue;
            hits.push(`- "${c.title || "Untitled"}" (${m.role}, ${when(m.createdAt)}): …${m.text.slice(Math.max(0, i - 150), i + 350).replace(/\s+/g, " ")}…`);
            if (hits.length >= 12) break;
          }
          if (hits.length >= 12) break;
        }
        step.end(true, String(hits.length));
        return hits.length ? hits.join("\n") : "No earlier messages match.";
      },
    },
    {
      name: "create_agents",
      description: "Create one or more custom agents (up to 50 per call), each with a name, emoji, one-line description and detailed instructions. Names must be unique.",
      inputSchema: {
        type: "object",
        properties: {
          agents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                emoji: { type: "string" },
                description: { type: "string", description: "One line: what this agent is for" },
                instructions: { type: "string", description: "How it should work: role, expertise, steps, output format" },
              },
              required: ["name", "description", "instructions"],
            },
          },
        },
        required: ["agents"],
      },
      execute(input) {
        const specs = (Array.isArray(input.agents) ? input.agents : []).slice(0, 50) as Json[];
        const made: AgentProfile[] = [];
        const skipped: string[] = [];
        for (const spec of specs) {
          const name = str(spec.name, 80);
          if (!name) continue;
          if ([...data.agents.values()].some((a) => a.name.toLowerCase() === name.toLowerCase())) {
            skipped.push(name);
            continue;
          }
          const agent = agentFrom({ name, emoji: str(spec.emoji, 8) || "🤖", description: str(spec.description, 300), instructions: str(spec.instructions, 8000) });
          data.agents.set(agent.id, agent);
          made.push(agent);
        }
        if (made.length) void saveAgents();
        startStep(t, "create_agents", L(`Created ${made.length} agents`, `أنشأ ${made.length} وكلاء`), made.map((a) => `${a.emoji} ${a.name}`).join("\n")).end(
          made.length > 0 || !skipped.length,
          L(`${made.length} created`, `أُنشئ ${made.length}`),
        );
        return `Created: ${made.map((a) => a.name).join(", ") || "none"}.${skipped.length ? ` Already existed: ${skipped.join(", ")}.` : ""}`;
      },
    },
    {
      name: "list_agents",
      description: "List the user's custom agents (name, emoji, description), optionally filtered by a word.",
      inputSchema: { type: "object", properties: { query: { type: "string" } } },
      execute(input) {
        const q = str(input.query, 100).toLowerCase();
        const list = [...data.agents.values()].filter((a) => !q || `${a.name} ${a.description}`.toLowerCase().includes(q)).slice(0, 200);
        startStep(t, "list_agents", L("Looked at agents", "اطّلع على الوكلاء")).end(true, String(list.length));
        return list.length ? list.map((a) => `- ${a.emoji} ${a.name}: ${a.description}`).join("\n") : "No agents match.";
      },
    },
  ];
  if (!isSubAgent) tools.push(delegateTool(t, effort));
  return tools;
}

function delegateTool(t: TurnState, effort: Effort): SampleTool {
  return {
    name: "delegate_tasks",
    description:
      `Run up to ${SWARM_MAX_TASKS} independent tasks in parallel, each by a fresh agent (optionally one of the user's custom agents, by name). ` +
      "Each agent sees only its task, so make every task self-contained. Returns each agent's answer.",
    inputSchema: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: { type: "object", properties: { task: { type: "string" }, agent: { type: "string", description: "A custom agent's name (optional)" } }, required: ["task"] },
        },
      },
      required: ["tasks"],
    },
    async execute(input, { signal }) {
      const tasks = ((Array.isArray(input.tasks) ? input.tasks : []) as Json[]).map((x) => ({ task: str(x.task, 8000), agent: str(x.agent, 80) })).filter((x) => x.task);
      if (!tasks.length) throw new Error("No tasks given");
      if (tasks.length > SWARM_MAX_TASKS) throw new Error(`At most ${SWARM_MAX_TASKS} tasks per call; split the job into rounds`);
      const n = tasks.length;
      const step = startStep(t, "delegate_tasks", L(`Running ${n} agents`, `يشغّل ${n} وكلاء`), tasks.map((x) => `• ${x.agent ? `${x.agent}: ` : ""}${x.task.slice(0, 120)}`).join("\n"));
      const subTier = tierFor(({ max: "deep", deep: "auto" } as Record<string, Effort>)[effort] ?? effort);
      const results: string[] = new Array(n);
      let next = 0;
      let done = 0;
      let succeeded = 0;
      const worker = async () => {
        while (next < n && !signal.aborted) {
          const i = next++;
          const { task, agent: agentName } = tasks[i];
          const profile = agentName ? ([...data.agents.values()].find((a) => a.name.toLowerCase() === agentName.toLowerCase()) ?? null) : null;
          try {
            const { text } = await sample!(`${instructionsFor(profile, true, false)}\n\nYour task:\n${task}`, { ...(profile?.effort ? tierFor(profile.effort) : subTier), cache: false, signal });
            results[i] = text;
            succeeded++;
          } catch (e) {
            results[i] = `[failed: ${(e as SampleError).code ?? "error"}] ${(e as SampleError).text ?? ""}`;
          }
          done++;
          step.progress(L(`${done}/${n} done`, `اكتمل ${done}/${n}`));
        }
      };
      await Promise.all(Array.from({ length: Math.min(SWARM_CONCURRENCY, n) }, worker));
      step.end(succeeded > 0, L(`${succeeded}/${n} succeeded`, `نجح ${succeeded}/${n}`));
      const each = Math.floor(28_000 / n);
      return tasks.map((x, i) => `## Task ${i + 1}${x.agent ? ` (${x.agent})` : ""}: ${x.task.slice(0, 200)}\n\n${(results[i] ?? "[not run]").slice(0, each)}`).join("\n\n");
    },
  };
}

// ── One turn ─────────────────────────────────────────────────────────────────

async function runTurn(run: Run, conversationId: string, effort: Effort) {
  const started = Date.now();
  const messageId = newId("m");
  const conversation = data.conversations.get(conversationId)!;
  const agent = conversation.agentId ? (data.agents.get(conversation.agentId) ?? null) : null;
  const t: TurnState = { run, conversationId, steps: [] };
  let text = "";
  let status: StoredMessage["status"] = "complete";
  let error: string | undefined;
  run.push({ type: "start", messageId, model: "claude", provider: "anthropic" });

  try {
    if (!sample) throw { code: "sampling_disabled", message: "No sample capability" } satisfies SampleError;
    const limits = await sample.limits().catch(() => null);
    const tools = limits?.tools ? toolsFor(t, false, effort).slice(0, limits.tools.maxCount) : undefined;
    const history = await messagesOf(conversationId);
    const turns = await turnsFor(history, instructionsFor(agent, false, !!tools));
    const last = [...history].reverse().find((m) => m.role === "user");
    const images = limits?.images
      ? (last?.attachments ?? [])
          .filter((f) => limits.images!.mediaTypes.includes(f.mime))
          .map((f) => data.files.get(f.id)?.blob)
          .filter((b): b is Blob => !!b)
          .slice(0, limits.images.maxCount)
      : [];
    const result = await sample(turns, {
      ...tierFor(agent?.effort ?? effort),
      cache: false,
      signal: run.controller.signal,
      ...(tools?.length ? { tools } : {}),
      ...(images.length ? { images } : {}),
      onText: ({ text: whole, delta }) => {
        text = whole;
        run.push({ type: "text", delta });
      },
    });
    text = result.text;
    if (result.truncated) text += L("\n\n*(Cut short: ask me to continue.)*", "\n\n*(توقف قبل الاكتمال: اطلب مني المتابعة.)*");
  } catch (err) {
    const e = err as SampleError;
    if (e?.code === "cancelled" || run.stopped) {
      status = "stopped";
      text = e?.text ?? text;
    } else {
      console.error("[dizz] Claude call failed", err);
      status = "error";
      error = errorText(e);
      text = e?.code === "refused" ? "" : (e?.text ?? text);
      run.push({ type: "error", error });
    }
  }
  for (const s of t.steps) if (s.kind === "tool" && s.status === "running") s.status = "error";

  const message: StoredMessage = {
    id: messageId,
    conversationId,
    role: "assistant",
    createdAt: Date.now(),
    text,
    steps: t.steps,
    provider: "anthropic",
    model: "claude",
    status,
    error,
    durationMs: Date.now() - started,
  };
  (await messagesOf(conversationId)).push(message);
  void saveMessages(conversationId);
  if (!conversation.title) {
    const first = (await messagesOf(conversationId)).find((m) => m.role === "user");
    conversation.title = (first?.text || first?.attachments?.[0]?.name || "").split(/\s+/).slice(0, 7).join(" ").slice(0, 60);
    if (conversation.title) run.push({ type: "title", title: conversation.title });
  }
  touch(conversationId);
  run.push({ type: "done", message });
}

function startRun(conversationId: string, effort: Effort): Run {
  const run = new Run();
  runs.set(conversationId, run);
  void runTurn(run, conversationId, effort).finally(() => {
    runs.delete(conversationId);
    run.finish();
  });
  return run;
}

// ── Routing ──────────────────────────────────────────────────────────────────

function conversationSummary(c: Conversation) {
  const agent = c.agentId ? data.agents.get(c.agentId) : undefined;
  return { ...c, running: runs.has(c.id), agent: agent ? { id: agent.id, name: agent.name, emoji: agent.emoji } : null };
}

const publicFile = ({ blob: _b, url: _u, ...rest }: FileRecord & { blob: Blob; url: string }): FileRecord => rest;
const effortOf = (v: unknown): Effort => (["fast", "auto", "deep", "max"].includes(String(v)) ? (v as Effort) : data.settings.effort);

async function handle(method: string, path: string, query: URLSearchParams, body: Json, raw: BodyInit | null | undefined, signal?: AbortSignal | null): Promise<Response> {
  await ready;
  const [a, b, c] = path.split("/").filter(Boolean).slice(1); // after "api"

  // Session
  if (a === "session") {
    const setupRequired = authed ? false : !(await store.hasVault());
    return json({ authenticated: authed, setupRequired, locked: false, agentName: AGENT_NAME });
  }
  if (a === "setup" && method === "POST") {
    if (await store.hasVault()) return fail(409, "Dizz Lab is already set up");
    const password = String(body.password ?? "");
    if (password.length < 8) return fail(400, "Use at least 8 characters");
    await store.create(password);
    authed = true;
    await loadAll();
    return json({ ok: true });
  }
  if (a === "login" && method === "POST") {
    if (failedLogins >= 5) await sleep(Math.min(30_000, 1000 * 2 ** (failedLogins - 5)));
    try {
      await store.unlock(String(body.password ?? ""));
    } catch (err) {
      if (!(err instanceof WrongPassword)) throw err;
      failedLogins++;
      return fail(401, "Wrong password");
    }
    failedLogins = 0;
    authed = true;
    await loadAll();
    return json({ ok: true });
  }
  if (["logout", "logout-all", "lock"].includes(a) && method === "POST") {
    if (store.persistent) signOut();
    return json({ ok: true });
  }
  if (!authed) return fail(401, "Sign in first");

  if (a === "password" && method === "POST") {
    if (String(body.next ?? "").length < 8) return fail(400, "Use at least 8 characters");
    try {
      await store.changePassword(String(body.current ?? ""), String(body.next));
    } catch (err) {
      if (err instanceof WrongPassword) return fail(400, "Your current password isn't right");
      throw err;
    }
    return json({ ok: true });
  }

  if (a === "bootstrap") {
    return json({
      agentName: AGENT_NAME,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      models: [{ id: "claude", label: "Claude", provider: "anthropic", blurb: "Through your claude.ai account" }],
      settings: { ...data.settings, defaultModel: "claude" },
      toolGroups: TOOL_GROUPS,
      security: { encryptedAtRest: store.persistent, autoUnlock: false },
      features: { imageGeneration: false, codeExecution: false, phoneNotifications: false, swarmConcurrency: SWARM_CONCURRENCY, swarmMaxTasks: SWARM_MAX_TASKS },
      running: [...runs.keys()],
      cloud: true,
      persistent: store.persistent,
      ai: !!sample,
    });
  }

  if (a === "settings") {
    if (method === "PUT") {
      Object.assign(data.settings, body);
      void saveSettings();
    }
    return json(data.settings);
  }

  // Conversations
  if (a === "conversations") {
    if (!b && method === "GET") {
      const q = (query.get("q") ?? "").toLowerCase();
      const list = [...data.conversations.values()]
        .filter((conv) => !q || conv.title.toLowerCase().includes(q) || (data.messages.get(conv.id) ?? []).some((m) => m.text.toLowerCase().includes(q)))
        .sort((x, y) => Number(y.pinned) - Number(x.pinned) || y.updatedAt - x.updatedAt);
      return json(list.map(conversationSummary));
    }
    if (!b && method === "POST") {
      const now = Date.now();
      const conv: Conversation = { id: newId("c"), title: "", agentId: (body.agentId as string | null) ?? null, pinned: false, createdAt: now, updatedAt: now };
      data.conversations.set(conv.id, conv);
      data.messages.set(conv.id, []);
      void saveIndex();
      return json(conv);
    }
    const conv = data.conversations.get(b);
    if (!conv) return fail(404, "Conversation not found");
    if (!c) {
      if (method === "GET") {
        return json({ conversation: conv, agent: conv.agentId ? (data.agents.get(conv.agentId) ?? null) : null, messages: await messagesOf(conv.id), running: runs.has(conv.id) });
      }
      if (method === "PATCH") {
        if (typeof body.title === "string") conv.title = body.title;
        if (typeof body.pinned === "boolean") conv.pinned = body.pinned;
        void saveIndex();
        return json(conv);
      }
      if (method === "DELETE") {
        runs.get(conv.id)?.stop();
        data.conversations.delete(conv.id);
        data.messages.delete(conv.id);
        void store.remove(`c_${conv.id}`);
        void saveIndex();
        return json({ ok: true });
      }
    }
    if (c === "messages" && method === "POST") {
      if (runs.has(conv.id)) return fail(409, "Still working on the last message");
      const attachments = ((body.attachmentIds as string[]) ?? []).map((id) => data.files.get(id)).filter((f) => !!f).map(publicFile);
      const text = String(body.text ?? "");
      if (!text.trim() && !attachments.length) return fail(400, "Say something or attach a file");
      (await messagesOf(conv.id)).push({ id: newId("m"), conversationId: conv.id, role: "user", createdAt: Date.now(), text, attachments: attachments.length ? attachments : undefined });
      void saveMessages(conv.id);
      touch(conv.id);
      return sse(startRun(conv.id, effortOf(body.effort)), signal);
    }
    if (c === "regenerate" && method === "POST") {
      if (runs.has(conv.id)) return fail(409, "Still working on the last message");
      const msgs = await messagesOf(conv.id);
      if (msgs.at(-1)?.role === "assistant") msgs.pop();
      if (!msgs.some((m) => m.role === "user")) return fail(400, "Nothing to regenerate");
      return sse(startRun(conv.id, effortOf(body.effort)), signal);
    }
    if (c === "stream") {
      const run = runs.get(conv.id);
      return run ? sse(run, signal) : new Response(null, { status: 204 });
    }
    if (c === "stop") {
      const run = runs.get(conv.id);
      run?.stop();
      return json({ stopped: !!run });
    }
    if (c === "export") {
      const lines = [`# ${conv.title || "Chat"}`, ""];
      for (const m of await messagesOf(conv.id)) lines.push(`**${m.role === "user" ? "You" : AGENT_NAME}**`, "", m.text, "", "---", "");
      return new Response(lines.join("\n"), { headers: { "content-type": "text/markdown" } });
    }
  }

  // Memory
  if (a === "memories") {
    if (method === "GET") return json(data.memories);
    if (method === "POST") {
      const memory: Memory = { id: newId("mem"), text: String(body.text ?? "").slice(0, 600), category: String(body.category ?? "other"), createdAt: Date.now() };
      data.memories.push(memory);
      void saveMemories();
      return json(memory);
    }
    if (method === "DELETE") {
      data.memories = data.memories.filter((m) => m.id !== b);
      void saveMemories();
      return json({ ok: true });
    }
  }

  // Reminders
  if (a === "reminders") {
    if (method === "GET") return json(data.reminders.filter((r) => r.active).sort((x, y) => x.nextRun - y.nextRun));
    if (method === "DELETE") {
      const r = data.reminders.find((x) => x.id === b);
      if (r) {
        r.active = false;
        void saveReminders();
        scheduleReminders();
      }
      return json({ ok: !!r });
    }
  }

  // Agents
  if (a === "agents") {
    const all = () => [...data.agents.values()].sort((x, y) => x.name.localeCompare(y.name));
    const taken = (name: string, except?: string) => all().some((x) => x.id !== except && x.name.toLowerCase() === name.toLowerCase());
    if (b === "export") return json(all().map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest));
    if (b === "import" && method === "POST") {
      let created = 0;
      const skipped: string[] = [];
      for (const item of (Array.isArray(body) ? body : []) as Json[]) {
        const agent = agentFrom(item);
        if (!agent.name || taken(agent.name)) skipped.push(agent.name);
        else {
          data.agents.set(agent.id, agent);
          created++;
        }
      }
      void saveAgents();
      return json({ created, skipped });
    }
    if (!b && method === "GET") {
      const q = (query.get("q") ?? "").toLowerCase();
      const limit = Number(query.get("limit") ?? 200);
      const offset = Number(query.get("offset") ?? 0);
      const filtered = all().filter((x) => !q || x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q));
      return json({ agents: filtered.slice(offset, offset + limit), total: data.agents.size });
    }
    if (!b && method === "POST") {
      const agent = agentFrom(body);
      if (!agent.name) return fail(400, "Give the agent a name");
      if (taken(agent.name)) return fail(409, `An agent called "${agent.name}" already exists`);
      data.agents.set(agent.id, agent);
      void saveAgents();
      return json(agent);
    }
    const agent = data.agents.get(b);
    if (!agent) return fail(404, "That agent no longer exists");
    if (method === "GET") return json(agent);
    if (method === "PATCH") {
      const updated = agentFrom(body, agent);
      if (taken(updated.name, agent.id)) return fail(409, `An agent called "${updated.name}" already exists`);
      data.agents.set(agent.id, updated);
      void saveAgents();
      return json(updated);
    }
    if (method === "DELETE") {
      data.agents.delete(agent.id);
      void saveAgents();
      return json({ ok: true });
    }
  }

  // Files (kept in this page while it's open)
  if (a === "files") {
    if (!b && method === "GET") return json([...data.files.values()].sort((x, y) => y.createdAt - x.createdAt).map(publicFile));
    if (!b && method === "POST") {
      const blob = raw instanceof Blob ? raw : new Blob([raw as BlobPart]);
      if (!blob.size) return fail(400, "The file is empty");
      const record = {
        id: newId("f"),
        name: query.get("name") ?? "file",
        mime: blob.type || "application/octet-stream",
        size: blob.size,
        origin: "upload" as const,
        conversationId: query.get("conversationId"),
        createdAt: Date.now(),
        blob,
        url: URL.createObjectURL(blob),
      };
      data.files.set(record.id, record);
      return json(publicFile(record));
    }
    if (method === "DELETE") {
      const f = data.files.get(b);
      if (f) URL.revokeObjectURL(f.url);
      data.files.delete(b);
      return json({ ok: true });
    }
  }

  // Connectors need the app on a computer.
  if (a === "connectors") {
    if (!b && method === "GET") return json({ connectors: [], google: { configured: false, fromEnv: false, redirectUri: "", services: [] }, gallery: [], cloud: true });
    return fail(400, "Connectors need the Dizz Lab app on your computer");
  }

  return fail(404, "Not found");
}

installBackend(handle);
