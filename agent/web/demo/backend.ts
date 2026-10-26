import type { AgentProfile, Conversation, FileRecord, Settings, Source, Step, StoredMessage } from "../../src/types.js";
import { TOOL_GROUPS } from "../../src/types.js";
import { setFileUrlResolver } from "../api.js";
import { lang } from "../i18n.js";
import { agentFrom, broadcast, fail, installBackend, json, newId, Run, sleep, sse, type Json } from "../inpage.js";

/**
 * The browser-only demo: answers the app's /api calls from memory, with
 * scripted (not AI) replies in English or Arabic. Nothing leaves the page and
 * everything is gone when you close it.
 */

interface Memory {
  id: string;
  text: string;
  category: string;
  createdAt: number;
}
interface Reminder {
  id: string;
  message: string;
  task: string | null;
  nextRun: number;
  repeat: string;
  conversationId: string | null;
  active: boolean;
  createdAt: number;
  lastRun: number | null;
}
interface DemoConnector {
  id: string;
  kind: "gmail" | "google_calendar" | "google_drive" | "mcp";
  name: string;
  enabled: boolean;
  status: "connected";
  account?: string;
  autoSend: boolean;
  url?: string;
  usesToken: boolean;
  tools: { name: string; description: string }[];
  createdAt: number;
}


const db = {
  password: "" as string,
  authed: false,
  settings: { language: "", userName: "", defaultModel: "demo", effort: "auto", personality: "default", customInstructions: "", monthlyBudget: 0 } as Settings,
  conversations: new Map<string, Conversation>(),
  messages: new Map<string, StoredMessage[]>(),
  memories: [] as Memory[],
  reminders: [] as Reminder[],
  agents: new Map<string, AgentProfile>(),
  files: new Map<string, FileRecord & { url: string }>(),
  connectors: [] as DemoConnector[],
};

setFileUrlResolver((id) => db.files.get(id)?.url ?? "");

const runs = new Map<string, Run>();

// ── The scripted "AI" ────────────────────────────────────────────────────────

const AR_RE = /[؀-ۿ]/;

const TEAM = [
  { emoji: "🧭", en: ["Strategist", "Turns goals into a clear plan"], ar: ["المخطط الاستراتيجي", "يحوّل الأهداف إلى خطة واضحة"] },
  { emoji: "🔎", en: ["Market Researcher", "Sizes markets and maps competitors"], ar: ["باحث السوق", "يقدّر حجم السوق ويرسم خريطة المنافسين"] },
  { emoji: "📣", en: ["Marketer", "Plans campaigns and channels"], ar: ["المسوّق", "يخطط الحملات وقنوات التسويق"] },
  { emoji: "📊", en: ["Finance Analyst", "Builds budgets and forecasts"], ar: ["المحلل المالي", "يعدّ الميزانيات والتوقعات"] },
  { emoji: "✍️", en: ["Copywriter", "Writes sharp, persuasive copy"], ar: ["كاتب المحتوى", "يكتب نصوصًا مقنعة وموجزة"] },
];

async function runDemo(run: Run, conversationId: string, userText: string, agent: AgentProfile | null) {
  const ar = AR_RE.test(userText) || lang() === "ar";
  const L = (en: string, arabic: string) => (ar ? arabic : en);
  const started = Date.now();
  const messageId = newId("m");
  const steps: Step[] = [];
  const files: FileRecord[] = [];
  let sources: Source[] = [];
  let text = "";
  const live = () => !run.stopped;

  run.push({ type: "start", messageId, model: "demo", provider: "mock" });

  const think = async (thought: string) => {
    const step: Step = { kind: "thinking", text: "", startedAt: Date.now() };
    steps.push(step);
    for (const word of thought.split(/(?<=\s)/)) {
      if (!live()) return;
      step.text += word;
      run.push({ type: "thinking", delta: word });
      await sleep(25);
    }
    await sleep(350);
    step.endedAt = Date.now();
  };
  const tool = async (name: string, label: string, detail: string | undefined, result: string, extra: Partial<Extract<Step, { kind: "tool" }>> = {}) => {
    const step: Extract<Step, { kind: "tool" }> = { kind: "tool", id: newId("tool"), name, label, detail, status: "running", ...extra };
    steps.push(step);
    run.push({ type: "step", step: { ...step } });
    await sleep(700);
    step.status = "ok";
    step.result = result;
    run.push({ type: "step", step: { ...step } });
    return step;
  };
  const say = async (reply: string) => {
    for (const word of reply.split(/(?<=\s)/)) {
      if (!live()) return;
      text += word;
      run.push({ type: "text", delta: word });
      await sleep(18);
    }
  };

  const lower = userText.toLowerCase();
  await think(L("Working out what's being asked and which tools would help.", "أفهم المطلوب وأحدد الأدوات المناسبة."));

  const rememberMatch = userText.match(/remember (?:that )?(.+)/i) ?? userText.match(/(?:تذكّر|تذكر)\s+(?:أن\s*)?(.+)/);
  if (rememberMatch) {
    const fact = rememberMatch[1].replace(/[.!؟?]$/, "");
    db.memories.push({ id: newId("mem"), text: fact, category: "about_me", createdAt: Date.now() });
    await tool("remember", L("Saved to memory", "حُفظ في الذاكرة"), fact, fact);
    await say(L("Got it, I'll remember that. You can see and edit everything I know about you under **Memory**.", "تمام، سأتذكر ذلك. يمكنك رؤية كل ما أعرفه عنك وتعديله من **الذاكرة**."));
  } else if (/remind me|ذكّرني|ذكرني/i.test(userText)) {
    const what = userText.replace(/^.*?remind me (to )?/i, "").replace(/^.*?(ذكّرني|ذكرني)\s*(أن|بـ|ب)?\s*/, "") || userText;
    const at = Date.now() + 60_000;
    const reminder: Reminder = { id: newId("r"), message: what, task: null, nextRun: at, repeat: "none", conversationId, active: true, createdAt: Date.now(), lastRun: null };
    db.reminders.push(reminder);
    const when = new Intl.DateTimeFormat(ar ? "ar-u-nu-latn" : undefined, { hour: "2-digit", minute: "2-digit" }).format(at);
    await tool("set_reminder", L("Set a reminder", "ضبط تذكيرًا"), what, when);
    setTimeout(() => fireReminder(reminder, ar), 60_000);
    await say(L(`Done. I'll remind you at **${when}** (in one minute, so you can see it work).`, `تم. سأذكّرك الساعة **${when}** (بعد دقيقة، لترى كيف يعمل).`));
  } else if (/(create|build|make).*(agents?|team)|(أنشئ|ابن|اصنع).*(وكلاء|وكيل|فريق)/i.test(userText)) {
    const made: AgentProfile[] = [];
    for (const m of TEAM) {
      const [name, description] = ar ? m.ar : m.en;
      if ([...db.agents.values()].some((a) => a.name === name)) continue;
      const agentProfile: AgentProfile = {
        id: newId("a"),
        name,
        emoji: m.emoji,
        description,
        instructions: description,
        model: null,
        effort: null,
        tools: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      db.agents.set(agentProfile.id, agentProfile);
      made.push(agentProfile);
    }
    await tool("create_agents", L(`Created ${made.length} agents`, `أنشأ ${made.length} وكلاء`), made.map((a) => `${a.emoji} ${a.name}`).join("\n"), L(`${made.length} created`, `أُنشئ ${made.length}`));
    await say(
      L("Your team is ready:\n\n", "فريقك جاهز:\n\n") +
        TEAM.map((m) => `- ${m.emoji} **${(ar ? m.ar : m.en)[0]}**: ${(ar ? m.ar : m.en)[1]}`).join("\n") +
        L(
          "\n\nOpen **Agents** to chat with any of them, or ask me to *use the team* on a project and they'll work in parallel.",
          "\n\nافتح **الوكلاء** للتحدث مع أي منهم، أو اطلب مني *استخدام الفريق* في مشروع وسيعملون بالتوازي.",
        ),
    );
  } else if (/\b(agents?|swarm|team)\b|وكلاء|الوكلاء|الفريق|سرب/i.test(userText)) {
    const topics = ar ? ["الفرص", "المخاطر", "الخطوات التالية"] : ["Opportunities", "Risks", "Next steps"];
    const step = await tool("delegate_tasks", L(`Running ${topics.length} agents`, `يشغّل ${topics.length} وكلاء`), topics.map((t) => `• ${t}`).join("\n"), "");
    for (let i = 1; i <= topics.length; i++) {
      step.status = "running";
      step.result = L(`${i}/${topics.length} done`, `اكتمل ${i}/${topics.length}`);
      run.push({ type: "step", step: { ...step } });
      await sleep(600);
    }
    step.status = "ok";
    step.result = L(`${topics.length}/${topics.length} succeeded`, `نجح ${topics.length}/${topics.length}`);
    run.push({ type: "step", step: { ...step } });
    const report = new Blob(
      [`# ${L("Swarm report", "تقرير السرب")}\n\n${topics.map((t) => `## ${t}\n\n${L("(In the real app, an agent researches this part live.)", "(في التطبيق الحقيقي، يبحث وكيل في هذا الجزء مباشرة.)")}`).join("\n\n")}\n`],
      { type: "text/markdown" },
    );
    const file = storeFile("swarm-report.md", report, "generated", conversationId);
    files.push(file);
    run.push({ type: "file", file });
    await say(
      L(
        `I split that across **${topics.length} agents** working in parallel: ${topics.join(", ")}. In the real app each one researches live with web search and code, and I combine their findings into one answer; the full results are in the report file below.`,
        `وزّعت المهمة على **${topics.length} وكلاء** يعملون بالتوازي: ${topics.join("، ")}. في التطبيق الحقيقي يبحث كل واحد منهم مباشرة عبر الويب والكود، ثم أجمع نتائجهم في إجابة واحدة؛ والنتائج الكاملة في ملف التقرير بالأسفل.`,
      ),
    );
  } else if (/\b(e-?mail|mail|gmail)\b|بريد|إيميل|ايميل/i.test(userText)) {
    const gmail = db.connectors.find((c) => c.kind === "gmail" && c.enabled);
    if (!gmail) {
      await say(
        L(
          "I can do that once Gmail is connected. Open **Connectors** and press **Connect** on Gmail (in this demo it connects instantly), then ask me again.",
          "أستطيع ذلك بعد ربط Gmail. افتح **الموصلات** واضغط **ربط** بجانب Gmail (في هذه النسخة التجريبية يتم الربط فورًا)، ثم اطلب مني مرة أخرى.",
        ),
      );
    } else {
      const body = L("Hi Bob,\n\nFriday at 1 works for me. See you then!\n\nBest", "مرحبًا بوب،\n\nيوم الجمعة الساعة الواحدة يناسبني. أراك هناك!\n\nمع التحية");
      const subject = L("Re: Lunch", "رد: الغداء");
      await tool("gmail_send_email", L("Drafted an email", "صاغ رسالة"), `To: bob@example.com\nSubject: ${subject}\n\n${body}`, L("Waiting for you to send", "بانتظار إرسالك"), {
        approval: { kind: "email", connectorId: gmail.id, draftId: newId("draft"), to: "bob@example.com", subject, preview: body },
      });
      await say(L("I drafted the email. Review it below and press **Send** when you're happy.", "صغت الرسالة. راجعها بالأسفل واضغط **إرسال** عندما تكون جاهزًا."));
    }
  } else if (/\b(code|python|calculate|compute|chart|plot|interest)\b|كود|بايثون|احسب|مخطط|الفائدة/i.test(userText)) {
    const rows: string[] = [];
    for (let year = 0; year <= 30; year += 5) rows.push(`| ${year} | $${Math.round(10_000 * 1.07 ** year).toLocaleString("en-US")} |`);
    const code = "for year in range(0, 31, 5):\n    print(year, round(10_000 * 1.07 ** year))";
    await tool("run_code", L("Ran Python", "شغّل كود Python"), code, L("Done in 0.1s", "اكتمل في 0.1 ث"));
    await say(
      L("Here's $10,000 growing at 7% a year:\n\n", "هذا نمو 10,000 دولار بنسبة 7% سنويًا:\n\n") +
        `| ${L("Year", "السنة")} | ${L("Balance", "الرصيد")} |\n|---:|---:|\n${rows.join("\n")}\n\n` +
        L("In the real app I run real code on your computer, and can draw the chart as an image.", "في التطبيق الحقيقي أشغّل كودًا حقيقيًا على جهازك، ويمكنني رسم المخطط كصورة."),
    );
  } else if (/\b(news|today|weather|search|latest)\b|أخبار|الطقس|طقس|ابحث|اليوم/i.test(userText)) {
    await tool("web_search", L("Searching the web", "يبحث في الويب"), undefined, L("Demo: no internet", "تجريبي: بلا إنترنت"), { server: true });
    sources = [];
    await say(
      L(
        "In the real app I'd search the web (and X with Grok) right now and answer with sources you can click. This demo runs offline in your browser, so I can't fetch live news here.",
        "في التطبيق الحقيقي أبحث في الويب (وفي X مع Grok) الآن وأجيب مع مصادر يمكنك فتحها. هذه النسخة التجريبية تعمل دون اتصال في متصفحك، لذا لا أستطيع جلب الأخبار المباشرة هنا.",
      ),
    );
  } else if (/\b(image|picture|photo|draw)\b|صورة|ارسم/i.test(userText)) {
    await say(
      L(
        "Image generation uses Grok Imagine, so it needs an xAI key in the real app. Add `XAI_API_KEY` and ask again there.",
        "إنشاء الصور يستخدم Grok Imagine، لذا يحتاج مفتاح xAI في التطبيق الحقيقي. أضف `XAI_API_KEY` واطلب ذلك هناك.",
      ),
    );
  } else {
    const intro = agent
      ? L(`I'm **${agent.emoji} ${agent.name}**. ${agent.description}\n\n`, `أنا **${agent.emoji} ${agent.name}**. ${agent.description}\n\n`)
      : "";
    await say(
      intro +
        L(
          "This is the **Dizz Lab demo**: it runs in your browser with scripted replies, so you can try the app before installing it. Things to try:\n\n" +
            "- *Remember that I love Arabic coffee*\n- *Remind me to stretch*\n- *Build me a team of agents*, then *use the team to plan a launch*\n" +
            "- Connect Gmail under **Connectors**, then *email Bob that Friday works*\n- *Calculate compound interest with Python*\n\n" +
            "Switch the language under **Settings**. Installed on your computer with an API key, the same app talks to **Claude** and **Grok**.",
          "هذه **النسخة التجريبية من Dizz Lab**: تعمل في متصفحك بردود مُعدّة مسبقًا، لتجرّب التطبيق قبل تثبيته. جرّب مثلًا:\n\n" +
            "- *تذكر أنني أحب القهوة العربية*\n- *ذكّرني بالتمارين*\n- *ابنِ لي فريقًا من الوكلاء*، ثم *استخدم الفريق لتخطيط إطلاق منتج*\n" +
            "- اربط Gmail من **الموصلات**، ثم *أرسل بريدًا لبوب أن الجمعة مناسبة*\n- *احسب الفائدة المركبة بكود بايثون*\n\n" +
            "غيّر اللغة من **الإعدادات**. وعند تثبيته على جهازك مع مفتاح API، يتحدث التطبيق نفسه مع **Claude** و **Grok**.",
        ),
    );
  }

  const message: StoredMessage = {
    id: messageId,
    conversationId,
    role: "assistant",
    createdAt: Date.now(),
    text,
    steps,
    files,
    sources,
    provider: "mock",
    model: "demo",
    status: run.stopped ? "stopped" : "complete",
    durationMs: Date.now() - started,
  };
  db.messages.get(conversationId)?.push(message);
  touch(conversationId);
  run.push({ type: "done", message });
  const conversation = db.conversations.get(conversationId);
  if (conversation && !conversation.title) {
    conversation.title = userText.split(/\s+/).slice(0, 6).join(" ").slice(0, 60);
    run.push({ type: "title", title: conversation.title });
  }
}

function fireReminder(r: Reminder, ar: boolean) {
  if (!r.active || !db.authed) return;
  r.active = false;
  r.lastRun = Date.now();
  if (r.conversationId && db.messages.has(r.conversationId)) {
    db.messages.get(r.conversationId)!.push({
      id: newId("m"),
      conversationId: r.conversationId,
      role: "assistant",
      createdAt: Date.now(),
      text: ar ? `⏰ **تذكير:** ${r.message}` : `⏰ **Reminder:** ${r.message}`,
      provider: "system",
      status: "complete",
    });
    touch(r.conversationId);
    broadcast({ type: "conversation", conversationId: r.conversationId, running: false });
  }
  broadcast({ type: "notification", title: ar ? "⏰ تذكير" : "⏰ Reminder", body: r.message, conversationId: r.conversationId });
}

function startRun(conversationId: string, userText: string): Run {
  const run = new Run();
  runs.set(conversationId, run);
  const conversation = db.conversations.get(conversationId)!;
  const agent = conversation.agentId ? (db.agents.get(conversation.agentId) ?? null) : null;
  void runDemo(run, conversationId, userText, agent).finally(() => {
    runs.delete(conversationId);
    run.finish();
  });
  return run;
}

// ── Storage helpers ──────────────────────────────────────────────────────────

function touch(conversationId: string) {
  const c = db.conversations.get(conversationId);
  if (c) c.updatedAt = Date.now();
}

function storeFile(name: string, blob: Blob, origin: FileRecord["origin"], conversationId: string | null): FileRecord {
  const record: FileRecord & { url: string } = {
    id: newId("f"),
    name,
    mime: blob.type || "application/octet-stream",
    size: blob.size,
    origin,
    conversationId,
    createdAt: Date.now(),
    url: URL.createObjectURL(blob),
  };
  db.files.set(record.id, record);
  const { url: _url, ...publicRecord } = record;
  return publicRecord;
}

function conversationSummary(c: Conversation) {
  const agent = c.agentId ? db.agents.get(c.agentId) : undefined;
  return { ...c, running: runs.has(c.id), agent: agent ? { id: agent.id, name: agent.name, emoji: agent.emoji } : null };
}


const GOOGLE_SERVICES = [
  { kind: "gmail", name: "Gmail", description: "Search and read your email, save attachments, and draft or send replies." },
  { kind: "google_calendar", name: "Google Calendar", description: "See your schedule and add or remove events." },
  { kind: "google_drive", name: "Google Drive", description: "Find and read your Docs, Sheets, Slides and files." },
];

const GALLERY = [
  { id: "notion", name: "Notion", url: "https://mcp.notion.com/mcp", description: "Search, read and update your pages and databases", auth: "signin" },
  { id: "linear", name: "Linear", url: "https://mcp.linear.app/mcp", description: "Find, create and update issues and projects", auth: "signin" },
  { id: "atlassian", name: "Jira & Confluence", url: "https://mcp.atlassian.com/v1/mcp", description: "Work with Jira issues and Confluence pages", auth: "signin" },
  { id: "zapier", name: "Zapier", url: "https://mcp.zapier.com/api/mcp/mcp", description: "Reach thousands of apps through the actions you set up in Zapier", auth: "signin" },
  { id: "canva", name: "Canva", url: "https://mcp.canva.com/mcp", description: "Find, create and edit designs", auth: "signin" },
  { id: "stripe", name: "Stripe", url: "https://mcp.stripe.com", description: "Look up payments, customers, invoices and balances", auth: "signin" },
  { id: "paypal", name: "PayPal", url: "https://mcp.paypal.com/mcp", description: "Invoices, orders and transactions", auth: "signin" },
  { id: "vercel", name: "Vercel", url: "https://mcp.vercel.com", description: "Projects, deployments and logs", auth: "signin" },
  { id: "sentry", name: "Sentry", url: "https://mcp.sentry.dev/mcp", description: "Investigate errors and performance issues", auth: "signin" },
  { id: "github", name: "GitHub", url: "https://api.githubcopilot.com/mcp/", description: "Repositories, issues and pull requests", auth: "token" },
];

function connectorTools(name: string) {
  return ["search", "read", "create", "update"].map((verb) => ({ name: `${verb}`, description: `${verb[0].toUpperCase()}${verb.slice(1)} in ${name} (demo)` }));
}

// ── Routing ──────────────────────────────────────────────────────────────────

async function handle(method: string, path: string, query: URLSearchParams, body: Json, raw: BodyInit | null | undefined, signal?: AbortSignal | null): Promise<Response> {
  const seg = path.split("/").filter(Boolean).slice(1); // after "api"
  const [a, b, c, d] = seg;

  // Session
  if (a === "session") return json({ authenticated: db.authed, setupRequired: !db.password, locked: false, agentName: "Dizz Lab" });
  if (a === "setup" && method === "POST") {
    if (db.password) return fail(409, "Dizz Lab is already set up");
    if (String(body.password ?? "").length < 8) return fail(400, "Use at least 8 characters");
    db.password = String(body.password);
    db.authed = true;
    return json({ ok: true });
  }
  if (a === "login" && method === "POST") {
    if (body.password !== db.password) return fail(401, "Wrong password");
    db.authed = true;
    return json({ ok: true });
  }
  if (["logout", "logout-all", "lock"].includes(a) && method === "POST") {
    db.authed = false;
    return json({ ok: true });
  }
  if (!db.authed) return fail(401, "Sign in first");

  if (a === "password" && method === "POST") {
    if (body.current !== db.password) return fail(400, "Your current password isn't right");
    db.password = String(body.next);
    return json({ ok: true });
  }

  if (a === "bootstrap") {
    return json({
      agentName: "Dizz Lab",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      models: [{ id: "demo", label: "Demo mode", provider: "mock", blurb: "No API key set: scripted replies" }],
      settings: db.settings,
      toolGroups: TOOL_GROUPS,
      security: { encryptedAtRest: true, autoUnlock: false },
      features: { imageGeneration: false, codeExecution: true, phoneNotifications: false, swarmConcurrency: 8, swarmMaxTasks: 1000 },
      running: [...runs.keys()],
      demo: true,
    });
  }

  if (a === "settings") {
    if (method === "PUT") Object.assign(db.settings, body);
    return json(db.settings);
  }

  // Conversations
  if (a === "conversations") {
    if (!b && method === "GET") {
      const q = (query.get("q") ?? "").toLowerCase();
      const list = [...db.conversations.values()]
        .filter((conv) => !q || conv.title.toLowerCase().includes(q) || (db.messages.get(conv.id) ?? []).some((m) => m.text.toLowerCase().includes(q)))
        .sort((x, y) => Number(y.pinned) - Number(x.pinned) || y.updatedAt - x.updatedAt);
      return json(list.map(conversationSummary));
    }
    if (!b && method === "POST") {
      const now = Date.now();
      const conv: Conversation = { id: newId("c"), title: "", agentId: (body.agentId as string | null) ?? null, pinned: false, createdAt: now, updatedAt: now };
      db.conversations.set(conv.id, conv);
      db.messages.set(conv.id, []);
      return json(conv);
    }
    const conv = db.conversations.get(b);
    if (!conv) return fail(404, "Conversation not found");
    if (!c) {
      if (method === "GET") {
        return json({ conversation: conv, agent: conv.agentId ? (db.agents.get(conv.agentId) ?? null) : null, messages: db.messages.get(conv.id) ?? [], running: runs.has(conv.id) });
      }
      if (method === "PATCH") {
        if (typeof body.title === "string") conv.title = body.title;
        if (typeof body.pinned === "boolean") conv.pinned = body.pinned;
        return json(conv);
      }
      if (method === "DELETE") {
        db.conversations.delete(conv.id);
        db.messages.delete(conv.id);
        return json({ ok: true });
      }
    }
    if (c === "messages" && method === "POST") {
      if (runs.has(conv.id)) return fail(409, "Still working on the last message");
      const attachments = ((body.attachmentIds as string[]) ?? []).map((id) => db.files.get(id)).filter(Boolean).map((f) => {
        const { url: _url, ...rest } = f!;
        return rest;
      });
      const text = String(body.text ?? "");
      if (!text.trim() && !attachments.length) return fail(400, "Say something or attach a file");
      db.messages.get(conv.id)!.push({ id: newId("m"), conversationId: conv.id, role: "user", createdAt: Date.now(), text, attachments: attachments.length ? attachments : undefined });
      touch(conv.id);
      return sse(startRun(conv.id, text || attachments.map((f) => f.name).join(", ")), signal);
    }
    if (c === "regenerate" && method === "POST") {
      const msgs = db.messages.get(conv.id)!;
      if (msgs.at(-1)?.role === "assistant") msgs.pop();
      const lastUser = [...msgs].reverse().find((m) => m.role === "user");
      return sse(startRun(conv.id, lastUser?.text ?? ""), signal);
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
      for (const m of db.messages.get(conv.id) ?? []) lines.push(`**${m.role === "user" ? "You" : "Dizz Lab"}**`, "", m.text, "", "---", "");
      return new Response(lines.join("\n"), { headers: { "content-type": "text/markdown" } });
    }
  }

  // Memory
  if (a === "memories") {
    if (method === "GET") return json(db.memories);
    if (method === "POST") {
      const memory = { id: newId("mem"), text: String(body.text), category: String(body.category ?? "other"), createdAt: Date.now() };
      db.memories.push(memory);
      return json(memory);
    }
    if (method === "DELETE") {
      db.memories = db.memories.filter((m) => m.id !== b);
      return json({ ok: true });
    }
  }

  // Reminders
  if (a === "reminders") {
    if (method === "GET") return json(db.reminders.filter((r) => r.active).sort((x, y) => x.nextRun - y.nextRun));
    if (method === "DELETE") {
      const r = db.reminders.find((x) => x.id === b);
      if (r) r.active = false;
      return json({ ok: !!r });
    }
  }

  // Agents
  if (a === "agents") {
    const all = () => [...db.agents.values()].sort((x, y) => x.name.localeCompare(y.name));
    if (b === "export") return json(all().map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }) => rest));
    if (b === "import" && method === "POST") {
      let created = 0;
      const skipped: string[] = [];
      for (const item of (body as unknown as Json[]) ?? []) {
        if (all().some((x) => x.name.toLowerCase() === String(item.name).toLowerCase())) skipped.push(String(item.name));
        else {
          const agent = agentFrom(item);
          db.agents.set(agent.id, agent);
          created++;
        }
      }
      return json({ created, skipped });
    }
    if (!b && method === "GET") {
      const q = (query.get("q") ?? "").toLowerCase();
      const limit = Number(query.get("limit") ?? 200);
      const offset = Number(query.get("offset") ?? 0);
      const filtered = all().filter((x) => !q || x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q));
      return json({ agents: filtered.slice(offset, offset + limit), total: db.agents.size });
    }
    if (!b && method === "POST") {
      if (all().some((x) => x.name.toLowerCase() === String(body.name).toLowerCase())) return fail(409, `An agent called "${String(body.name)}" already exists`);
      const agent = agentFrom(body);
      db.agents.set(agent.id, agent);
      return json(agent);
    }
    const agent = db.agents.get(b);
    if (!agent) return fail(404, "That agent no longer exists");
    if (method === "GET") return json(agent);
    if (method === "PATCH") {
      const updated = agentFrom(body, agent);
      db.agents.set(agent.id, updated);
      return json(updated);
    }
    if (method === "DELETE") {
      db.agents.delete(agent.id);
      return json({ ok: true });
    }
  }

  // Files
  if (a === "files") {
    if (!b && method === "GET") {
      return json([...db.files.values()].sort((x, y) => y.createdAt - x.createdAt).map(({ url: _url, ...rest }) => rest));
    }
    if (!b && method === "POST") {
      const blob = raw instanceof Blob ? raw : new Blob([raw as BlobPart]);
      if (!blob.size) return fail(400, "The file is empty");
      return json(storeFile(query.get("name") ?? "file", blob, "upload", query.get("conversationId")));
    }
    if (method === "DELETE") {
      const f = db.files.get(b);
      if (f) URL.revokeObjectURL(f.url);
      db.files.delete(b);
      return json({ ok: true });
    }
  }

  // Connectors
  if (a === "connectors") {
    if (!b && method === "GET") return json({ connectors: db.connectors, google: { configured: true, fromEnv: true, redirectUri: "", services: GOOGLE_SERVICES }, gallery: GALLERY });
    if (b === "google" && d === "connect") {
      const svc = GOOGLE_SERVICES.find((s) => s.kind === c)!;
      const connector: DemoConnector = {
        id: newId("con"),
        kind: svc.kind as DemoConnector["kind"],
        name: svc.name,
        enabled: true,
        status: "connected",
        account: "you@gmail.com",
        autoSend: false,
        usesToken: false,
        tools: [],
        createdAt: Date.now(),
      };
      db.connectors = db.connectors.filter((x) => x.kind !== connector.kind).concat(connector);
      return json({ connector });
    }
    if (b === "google" && c === "setup") return json({ ok: true });
    if (b === "mcp" && method === "POST") {
      const app = GALLERY.find((g) => g.url === body.url);
      const name = String(body.name ?? app?.name ?? new URL(String(body.url)).hostname);
      const connector: DemoConnector = {
        id: newId("con"),
        kind: "mcp",
        name,
        enabled: true,
        status: "connected",
        autoSend: false,
        url: String(body.url),
        usesToken: !!body.token,
        tools: connectorTools(name),
        createdAt: Date.now(),
      };
      db.connectors = db.connectors.filter((x) => x.url !== connector.url).concat(connector);
      return json({ connector });
    }
    const connector = db.connectors.find((x) => x.id === b);
    if (!connector) return fail(404, "Connector not found");
    if (c === "connect") return json({ connector });
    if (c === "email") return json({ ok: true });
    if (method === "PATCH") {
      Object.assign(connector, body);
      return json(connector);
    }
    if (method === "DELETE") {
      db.connectors = db.connectors.filter((x) => x.id !== b);
      return json({ ok: true });
    }
  }

  return fail(404, "Not found");
}

installBackend(handle, 40);
