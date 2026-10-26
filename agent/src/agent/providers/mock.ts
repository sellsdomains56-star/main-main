import { uiLang } from "../../i18n.js";
import type { StoredMessage } from "../../types.js";
import type { ProviderAdapter, RunInput, RunResult } from "./types.js";

/**
 * A scripted stand-in used by the tests and when no API key is set, so the
 * whole app (streaming, tools, files, reminders, swarms) can be tried for free.
 */

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });

async function stream(text: string, input: RunInput) {
  for (const word of text.split(/(?<=\s)/)) {
    await sleep(process.env.NODE_ENV === "test" ? 0 : 12, input.signal);
    input.hooks.onText(word);
  }
}

function lastUserText(history: StoredMessage[]): string {
  return [...history].reverse().find((m) => m.role === "user")?.text ?? "";
}

export const mockProvider: ProviderAdapter = {
  async run(input: RunInput): Promise<RunResult> {
    const text = lastUserText(input.history);
    const lower = text.toLowerCase();
    const has = (name: string) => input.tools.some((t) => t.name === name);
    const call = async (name: string, args: unknown) => {
      const id = `mock_${Math.random().toString(36).slice(2, 10)}`;
      input.hooks.onToolStart({ id, name, input: args });
      input.hooks.onToolInput(id, args);
      return input.hooks.executeTool(name, args, id);
    };

    const ar = /[\u0600-\u06FF]/.test(text) || uiLang() === "ar";
    const L = (en: string, arabic: string) => (ar ? arabic : en);
    input.hooks.onThinking(L("Working out what's being asked and which tools would help.", "أفهم المطلوب وأحدد الأدوات المناسبة."));
    await sleep(process.env.NODE_ENV === "test" ? 0 : 300, input.signal);

    let reply: string;
    const rememberMatch = text.match(/remember (?:that )?(.+)/i) ?? text.match(/(?:تذكّر|تذكر)\s+(?:أن\s+)?(.+)/);
    if (rememberMatch && has("remember")) {
      const outcome = await call("remember", { fact: rememberMatch[1].replace(/[.!]$/, ""), category: "about_me" });
      reply = L(`Got it — I'll remember that. (${outcome.content})`, "تمام، سأتذكر ذلك.");
    } else if ((/\bremind\b/.test(lower) || /ذكّرني|ذكرني/.test(text)) && has("set_reminder")) {
      const when = new Date(Date.now() + 60_000).toISOString();
      const message = text.replace(/^.*?remind me (to )?/i, "").replace(/^.*?(ذكّرني|ذكرني)\s*(أن|بـ|ب)?\s*/, "") || text;
      const outcome = await call("set_reminder", { message, when, repeat: "none" });
      reply = outcome.ok ? L(`Done. ${outcome.content}`, `تم. سأذكّرك بعد دقيقة.`) : L(`I couldn't set that: ${outcome.content}`, `لم أتمكن من ضبط التذكير: ${outcome.content}`);
    } else if ((/\b(swarm|delegate|agents?)\b/.test(lower) || /وكلاء|وكيل/.test(text)) && has("delegate_tasks")) {
      const topics = ar ? ["التاريخ", "الاقتصاد", "المستقبل"] : ["the history", "the economics", "the future"];
      const outcome = await call("delegate_tasks", {
        tasks: topics.map((t) => ({ task: ar ? `اكتب جملتين عن ${t} في: ${text}` : `Write two sentences on ${t} of: ${text}` })),
      });
      reply = L(
        `I split that across ${topics.length} agents. Here's what came back:\n\n${outcome.content.slice(0, 1500)}`,
        `وزّعت المهمة على ${topics.length} وكلاء. هذه النتائج:\n\n${outcome.content.slice(0, 1500)}`,
      );
    } else if ((/\b(email|e-mail|mail)\b/.test(lower) || /بريد|إيميل|ايميل|رسالة/.test(text)) && has("gmail_send_email")) {
      const outcome = await call("gmail_send_email", {
        to: "bob@example.com",
        subject: L("Re: Lunch", "رد: الغداء"),
        body: L("Hi Bob,\n\nFriday at 1 works for me. See you then!\n\nBest", "مرحبًا بوب،\n\nيوم الجمعة الساعة الواحدة يناسبني. أراك هناك!\n\nمع التحية"),
      });
      reply = outcome.ok
        ? L("I drafted the email. Review it below and press **Send** when you're happy.", "صغت الرسالة. راجعها بالأسفل واضغط **إرسال** عندما تكون جاهزًا.")
        : L(`I couldn't draft it: ${outcome.content}`, `لم أتمكن من صياغتها: ${outcome.content}`);
    } else if ((/\b(code|python|calculate|compute)\b/.test(lower) || /كود|بايثون|احسب/.test(text)) && has("run_code")) {
      const outcome = await call("run_code", {
        language: "python",
        code: "import math\nprint('sqrt(2) =', math.sqrt(2))\nprint('2**64 =', 2**64)",
      });
      reply = `${L("I ran some Python:", "شغّلت كود Python:")}\n\n\`\`\`\n${outcome.content}\n\`\`\``;
    } else {
      reply = ar
        ? `**الوضع التجريبي** — لم يُضبط مفتاح لأي مزوّد ذكاء اصطناعي، لذا هذا رد مُعدّ مسبقًا.\n\n` +
          `كتبت: _${text.slice(0, 200) || "(لا شيء)"}_\n\n` +
          "أضف `ANTHROPIC_API_KEY` و/أو `XAI_API_KEY` في `agent/.env` ثم أعد التشغيل للتحدث مع Claude أو Grok. " +
          "حتى ذلك الحين جرّب: *تذكر أنني أحب القهوة*، *ذكّرني بالتمارين*، *احسب شيئًا بالكود*، أو *استخدم الوكلاء للبحث عن القطط*."
        : `**Demo mode** — no AI provider key is set, so this is a scripted reply.\n\n` +
          `You said: _${text.slice(0, 200) || "(nothing)"}_\n\n` +
          "Add `ANTHROPIC_API_KEY` and/or `XAI_API_KEY` to `agent/.env` and restart to talk to Claude or Grok. " +
          "Meanwhile, try *remember that I like espresso*, *remind me to stretch*, *calculate something with code*, or *use agents to research cats*.";
    }
    await stream(reply, input);
    return { native: null, usage: { inputTokens: 0, outputTokens: 0 } };
  },

  async quick(_model, prompt) {
    const firstLine = prompt.split("\n").find((l) => l.startsWith("User:"))?.slice(5).trim() ?? "New chat";
    return firstLine.split(/\s+/).slice(0, 5).join(" ");
  },
};
