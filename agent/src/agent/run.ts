import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { AUTO_MODEL, findModel, type ModelInfo } from "../config.js";
import { routeModel } from "./router.js";
import { addMessage, getKV, getSettings, newId, setKV } from "../db.js";
import { recordUsage } from "../spending.js";
import type { AgentEvent, AgentProfile, Effort, FileRecord, MessageData, Source, Step, StoredMessage, TurnUsage } from "../types.js";
import { systemPrompt, turnContext } from "./prompt.js";
import { providerFor } from "./providers/index.js";
import { TurnError } from "./providers/types.js";
import { toolsFor } from "./toolkit.js";
import { tr } from "../i18n.js";
import { reportError } from "../monitoring.js";
import type { SubAgentResult, ToolOutcome } from "./tools.js";

export interface TurnOptions {
  conversationId: string;
  model: ModelInfo;
  effort: Effort;
  agent: AgentProfile | null;
  /** The conversation so far, ending with the new user message. */
  history: StoredMessage[];
  signal: AbortSignal;
  emit: (event: AgentEvent) => void;
  isSubAgent?: boolean;
  /** Save the reply as a message (sub-agent replies are only returned). */
  persist?: boolean;
}

const quote = (s: unknown, max = 70) => {
  const text = typeof s === "string" ? s : "";
  return text ? `“${text.length > max ? `${text.slice(0, max)}…` : text}”` : "";
};

/** Labels for the providers' own server-side tools. */
function serverLabel(name: string, input: Record<string, unknown>): { label: string; detail?: string } {
  const query = (input.query ?? (Array.isArray(input.queries) ? input.queries[0] : undefined)) as string | undefined;
  switch (name) {
    case "web_search":
      return { label: query ? tr(`Searched the web for ${quote(query)}`, `بحث في الويب عن ${quote(query)}`) : tr("Searching the web", "يبحث في الويب") };
    case "x_search":
      return { label: query ? tr(`Searched X for ${quote(query)}`, `بحث في X عن ${quote(query)}`) : tr("Searching X", "يبحث في X") };
    case "web_fetch": {
      const url = (input.url as string | undefined) ?? "";
      let host = "";
      try {
        host = url ? new URL(url).host : "";
      } catch {
        host = url;
      }
      return { label: host ? tr(`Read ${host}`, `قرأ ${host}`) : tr("Reading a page", "يقرأ صفحة"), detail: url || undefined };
    }
    case "compaction":
      return { label: tr("Condensed the earlier conversation to keep going", "لخّص المحادثة السابقة ليواصل") };
    case "code_execution":
    case "code_interpreter":
    case "bash_code_execution": {
      const command = (input.command ?? input.code) as string | undefined;
      return { label: tr("Ran code in the sandbox", "شغّل كودًا في البيئة المعزولة"), detail: command || undefined };
    }
    case "text_editor_code_execution": {
      const file = input.path as string | undefined;
      const verb = input.command === "view" ? tr("Read", "قرأ") : tr("Wrote", "كتب");
      return { label: file ? `${verb} ${file}` : tr("Edited a file in the sandbox", "عدّل ملفًا في البيئة المعزولة"), detail: (input.file_text as string | undefined) || undefined };
    }
    default:
      return { label: name.replace(/_/g, " ") };
  }
}

function friendlyError(err: unknown, model: ModelInfo): string {
  const who = model.provider === "xai" ? "xAI" : "Anthropic";
  if (err instanceof Anthropic.AuthenticationError || (err instanceof OpenAI.AuthenticationError)) return `${who} rejected the API key. Check it in agent/.env.`;
  if (err instanceof Anthropic.PermissionDeniedError || err instanceof OpenAI.PermissionDeniedError) return `${who} says this key can't use ${model.label}.`;
  if (err instanceof Anthropic.RateLimitError || err instanceof OpenAI.RateLimitError) return `${who} rate limit reached. Wait a moment and try again.`;
  if (err instanceof Anthropic.NotFoundError || err instanceof OpenAI.NotFoundError) return `${who} doesn't know the model "${model.id}".`;
  if (err instanceof Anthropic.APIConnectionError || err instanceof OpenAI.APIConnectionError) return `Couldn't reach ${who}. Check the internet connection.`;
  if (err instanceof Anthropic.APIError || err instanceof OpenAI.APIError) {
    const status = (err as { status?: number }).status;
    if (status === 529 || status === 503) return `${who} is overloaded right now. Try again in a minute.`;
    return `${who} error${status ? ` ${status}` : ""}: ${err.message}`;
  }
  if (err instanceof TurnError) return err.message;
  return err instanceof Error ? err.message : String(err);
}

/** Runs one agent turn: streams the model, runs tools, and returns (and usually saves) the reply. */
export async function runTurn(opts: TurnOptions): Promise<StoredMessage> {
  const { conversationId, model, effort, agent, history, signal, emit } = opts;
  const started = Date.now();
  const messageId = newId("m");
  const settings = getSettings();
  const { tools, serverTools, codeSandbox } = toolsFor(agent, !!opts.isSubAgent);
  const containerKey = `container:${conversationId}`;
  const usage: TurnUsage = { inputTokens: 0, outputTokens: 0 };
  const steps: Step[] = [];
  const files: FileRecord[] = [];
  const sources: Source[] = [];
  let text = "";

  emit({ type: "start", messageId, model: model.id, provider: model.provider });

  const openThinking = () => {
    const last = steps.at(-1);
    return last?.kind === "thinking" && !last.endedAt ? last : null;
  };
  const closeThinking = () => {
    const t = openThinking();
    if (t) t.endedAt = Date.now();
  };
  const toolStep = (id: string) => steps.find((s): s is Extract<Step, { kind: "tool" }> => s.kind === "tool" && s.id === id);
  const describe = (name: string, input: unknown, server?: boolean) => {
    const own = tools.find((t) => t.name === name);
    if (own && !server) return { label: own.label(input), detail: own.detail?.(input) };
    return serverLabel(name, (input ?? {}) as Record<string, unknown>);
  };

  const run = async () =>
    providerFor(model.provider).run({
      model: model.id,
      effort,
      system: systemPrompt(settings, agent, !!opts.isSubAgent),
      history,
      tools,
      serverTools,
      codeSandbox,
      // Sub-agents get a fresh sandbox; a conversation keeps its own between turns.
      container: codeSandbox && !opts.isSubAgent ? savedContainer(containerKey) : null,
      conversationId,
      signal,
      usage,
      hooks: {
        onText(delta) {
          closeThinking();
          text += delta;
          emit({ type: "text", delta });
        },
        onThinking(delta) {
          let t = openThinking();
          if (!t) {
            t = { kind: "thinking", text: "", startedAt: Date.now() };
            steps.push(t);
          }
          t.text += delta;
          emit({ type: "thinking", delta });
        },
        onToolStart({ id, name, input, server }) {
          closeThinking();
          if (toolStep(id)) return;
          const step: Step = { kind: "tool", id, name, ...describe(name, input, server), status: "running", server };
          steps.push(step);
          emit({ type: "step", step });
        },
        onToolInput(id, input) {
          const step = toolStep(id);
          if (!step) return;
          Object.assign(step, describe(step.name, input, step.server));
          emit({ type: "step", step });
        },
        onToolEnd(id, { ok, result }) {
          const step = toolStep(id);
          if (!step) return;
          step.status = ok ? "ok" : "error";
          step.result = result;
          emit({ type: "step", step });
        },
        onSources(found) {
          for (const s of found) if (!sources.some((x) => x.url === s.url)) sources.push(s);
          emit({ type: "sources", sources });
        },
        onFile(f) {
          if (files.some((x) => x.id === f.id)) return;
          files.push(f);
          emit({ type: "file", file: f });
        },
        async executeTool(name, input, id): Promise<ToolOutcome> {
          let step = toolStep(id);
          if (!step) {
            step = { kind: "tool", id, name, ...describe(name, input), status: "running" };
            steps.push(step);
          } else Object.assign(step, describe(name, input));
          emit({ type: "step", step });
          const tool = tools.find((t) => t.name === name);
          const outcome: ToolOutcome = tool
            ? await tool.run(input, {
                conversationId,
                signal,
                progress(line) {
                  step.result = line;
                  emit({ type: "step", step });
                },
                runSubAgent: opts.isSubAgent ? undefined : (profile, task, sig) => runSubAgent(opts, profile, task, sig),
              })
            : { ok: false, content: `There is no tool called ${name}.` };
          step.status = outcome.ok ? "ok" : "error";
          step.result = outcome.result ?? (outcome.ok ? tr("Done", "تم") : outcome.content.slice(0, 200));
          if (outcome.approval) step.approval = outcome.approval;
          emit({ type: "step", step });
          for (const f of outcome.files ?? []) {
            if (files.some((x) => x.id === f.id)) continue;
            files.push(f);
            emit({ type: "file", file: f });
          }
          return outcome;
        },
      },
    });

  let data: MessageData;
  const base = { steps, files, sources, provider: model.provider, model: model.id };
  try {
    const result = await run();
    closeThinking();
    if (result.container && !opts.isSubAgent) setKV(containerKey, JSON.stringify(result.container));
    if (result.refusal) {
      const note = tr(`\n\n> **${model.label} declined this request.** ${result.refusal}`, `\n\n> **رفض ${model.label} هذا الطلب.** ${result.refusal}`);
      text += note;
      emit({ type: "text", delta: note });
    }
    data = { ...base, text, native: result.native ?? undefined, status: "complete", usage, durationMs: Date.now() - started };
  } catch (err) {
    closeThinking();
    for (const s of steps) if (s.kind === "tool" && s.status === "running") s.status = "error";
    if (signal.aborted) {
      data = { ...base, text, status: "stopped", usage, durationMs: Date.now() - started };
    } else {
      const error = friendlyError(err, model);
      console.error(`[dizz] ${model.id} turn failed:`, err);
      reportError(err, "agent-turn");
      data = { ...base, text, status: "error", error, usage, durationMs: Date.now() - started };
      emit({ type: "error", error });
    }
  }

  // What the turn cost goes into the spending log, whether it finished or not.
  if (usage.inputTokens || usage.outputTokens) {
    recordUsage({
      provider: model.provider,
      model: model.id,
      agentId: agent?.id ?? null,
      conversationId,
      kind: opts.isSubAgent ? "swarm" : history.at(-1)?.scheduled ? "scheduled" : "chat",
      usage,
    });
  }

  const message: StoredMessage =
    opts.persist === false
      ? { ...data, id: messageId, conversationId, role: "assistant", createdAt: Date.now() }
      : addMessage(conversationId, "assistant", data, messageId);
  emit({ type: "done", message: publicMessage(message) });
  return message;
}

/** The sandbox a conversation used last, while it still exists (containers expire after a while). */
function savedContainer(key: string): string | null {
  try {
    const saved = JSON.parse(getKV(key) ?? "null") as { id: string; expiresAt: number } | null;
    return saved && saved.expiresAt > Date.now() + 60_000 ? saved.id : null;
  } catch {
    return null;
  }
}

/** One task for one agent, in a fresh context, for a swarm. */
async function runSubAgent(parent: TurnOptions, profile: AgentProfile | null, task: string, signal: AbortSignal): Promise<SubAgentResult> {
  const named = findModel(profile?.model ?? parent.model.id);
  const model = named.id === AUTO_MODEL.id ? routeModel({ text: task, effort: profile?.effort ?? parent.effort }) : named;
  const userMessage: StoredMessage = {
    id: newId("m"),
    conversationId: parent.conversationId,
    role: "user",
    text: task,
    context: turnContext(Date.now(), task),
    createdAt: Date.now(),
  };
  const reply = await runTurn({
    conversationId: parent.conversationId,
    model,
    // Swarm members think one notch less than the main agent by default: there are many of them.
    effort: profile?.effort ?? ({ max: "deep", deep: "auto" } as const)[parent.effort as "max" | "deep"] ?? parent.effort,
    agent: profile,
    history: [userMessage],
    signal,
    emit: () => {},
    isSubAgent: true,
    persist: false,
  });
  return {
    ok: reply.status === "complete",
    text: reply.status === "complete" ? reply.text : `${reply.text}\n\n[${reply.error ?? reply.status}]`.trim(),
    files: reply.files ?? [],
  };
}

/** What the browser gets: everything except the provider transcript. */
export function publicMessage(m: StoredMessage): StoredMessage {
  const { native: _native, context: _context, ...rest } = m;
  return rest;
}
