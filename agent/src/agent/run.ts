import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { findModel, type ModelInfo } from "../config.js";
import { addMessage, getSettings, newId } from "../db.js";
import type { AgentEvent, AgentProfile, Effort, FileRecord, MessageData, Source, Step, StoredMessage } from "../types.js";
import { systemPrompt, turnContext } from "./prompt.js";
import { providerFor } from "./providers/index.js";
import { TurnError } from "./providers/types.js";
import { toolsFor } from "./toolkit.js";
import { tr } from "../i18n.js";
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
  const { tools, serverTools } = toolsFor(agent, !!opts.isSubAgent);
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
      signal,
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
    if (result.refusal) {
      const note = tr(`\n\n> **${model.label} declined this request.** ${result.refusal}`, `\n\n> **رفض ${model.label} هذا الطلب.** ${result.refusal}`);
      text += note;
      emit({ type: "text", delta: note });
    }
    data = { ...base, text, native: result.native ?? undefined, status: "complete", usage: result.usage, durationMs: Date.now() - started };
  } catch (err) {
    closeThinking();
    for (const s of steps) if (s.kind === "tool" && s.status === "running") s.status = "error";
    if (signal.aborted) {
      data = { ...base, text, status: "stopped", durationMs: Date.now() - started };
    } else {
      const error = friendlyError(err, model);
      console.error(`[dizz] ${model.id} turn failed:`, err);
      data = { ...base, text, status: "error", error, durationMs: Date.now() - started };
      emit({ type: "error", error });
    }
  }

  const message: StoredMessage =
    opts.persist === false
      ? { ...data, id: messageId, conversationId, role: "assistant", createdAt: Date.now() }
      : addMessage(conversationId, "assistant", data, messageId);
  emit({ type: "done", message: publicMessage(message) });
  return message;
}

/** One task for one agent, in a fresh context, for a swarm. */
async function runSubAgent(parent: TurnOptions, profile: AgentProfile | null, task: string, signal: AbortSignal): Promise<SubAgentResult> {
  const model = findModel(profile?.model ?? parent.model.id);
  const userMessage: StoredMessage = {
    id: newId("m"),
    conversationId: parent.conversationId,
    role: "user",
    text: task,
    context: turnContext(),
    createdAt: Date.now(),
  };
  const reply = await runTurn({
    conversationId: parent.conversationId,
    model,
    effort: profile?.effort ?? (parent.effort === "deep" ? "auto" : parent.effort),
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
