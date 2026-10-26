import Anthropic from "@anthropic-ai/sdk";
import { config } from "../../config.js";
import { readFileBytes } from "../../files.js";
import type { Effort, Source, StoredMessage } from "../../types.js";
import type { ToolOutcome } from "../tools.js";
import { attachmentKind } from "./attachments.js";
import { TurnError, type ProviderAdapter, type RunInput, type RunResult } from "./types.js";

type MessageParam = Anthropic.Beta.BetaMessageParam;
type ContentBlockParam = Anthropic.Beta.BetaContentBlockParam;
type ToolUnion = Anthropic.Beta.BetaToolUnion;

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  client ??= new Anthropic({ apiKey: config.anthropicKey, maxRetries: 3 });
  return client;
}

const EFFORT: Record<Effort, "low" | "medium" | "xhigh"> = { fast: "low", auto: "medium", deep: "xhigh" };

/** Haiku has no server-side fallback and only the basic web tools. */
const isHaiku = (model: string) => model.includes("haiku");

function userContent(m: StoredMessage): ContentBlockParam[] {
  const blocks: ContentBlockParam[] = [];
  if (m.context) blocks.push({ type: "text", text: m.context });
  for (const a of m.attachments ?? []) {
    const file = readFileBytes(a.id, { includeDeleted: true });
    if (!file) {
      blocks.push({ type: "text", text: `[Attached file "${a.name}" is no longer available]` });
      continue;
    }
    const data = file.data;
    switch (attachmentKind(a.mime, data)) {
      case "image":
        blocks.push({
          type: "image",
          source: { type: "base64", media_type: a.mime as "image/png", data: data.toString("base64") },
        });
        break;
      case "pdf":
        blocks.push({
          type: "document",
          title: a.name,
          source: { type: "base64", media_type: "application/pdf", data: data.toString("base64") },
        });
        break;
      case "text":
        blocks.push({
          type: "document",
          title: a.name,
          source: { type: "text", media_type: "text/plain", data: data.toString("utf8") || "(empty file)" },
        });
        break;
      default:
        blocks.push({
          type: "text",
          text: `[Attached file "${a.name}" (${a.mime}) is saved in the workspace as "${a.name}". Open it with run_code.]`,
        });
    }
  }
  const text = m.scheduled ? `[Scheduled task — the user isn't watching live; do it and report the result]\n${m.text}` : m.text;
  blocks.push({ type: "text", text: text || "(see attachments)" });
  return blocks;
}

/**
 * Rebuilds the conversation for Claude. Claude's own turns are replayed from
 * their stored transcript unchanged (thinking blocks included), and every other
 * message is rebuilt from stored data, so the request is append-only: each turn
 * sends the previous request's messages byte-for-byte, plus the new ones.
 */
export function claudeMessages(history: StoredMessage[]): MessageParam[] {
  const out: MessageParam[] = [];
  for (const m of history) {
    if (m.role === "user") {
      out.push({ role: "user", content: userContent(m) });
      continue;
    }
    const replay = m.provider === "anthropic" && m.status === "complete" && m.native?.length ? (m.native as MessageParam[]) : null;
    const first = replay?.[0];
    const startsWithThinking =
      first && Array.isArray(first.content) && first.content[0] && ["thinking", "redacted_thinking"].includes(first.content[0].type);
    // An assistant turn that begins with thinking can't be merged onto a preceding assistant message.
    if (startsWithThinking && out.at(-1)?.role === "assistant") out.push({ role: "user", content: "(continue)" });
    if (replay) out.push(...replay);
    else out.push({ role: "assistant", content: [{ type: "text", text: m.text.trim() || "(no reply)" }] });
  }
  return out;
}

function toolResultContent(outcome: ToolOutcome): Anthropic.Beta.BetaToolResultBlockParam["content"] {
  const content: Exclude<Anthropic.Beta.BetaToolResultBlockParam["content"], string | undefined> = [
    { type: "text", text: outcome.content || "(no output)" },
  ];
  for (const img of outcome.images ?? []) {
    content.push({ type: "image", source: { type: "base64", media_type: img.mime as "image/png", data: img.data } });
  }
  return content;
}

export const anthropicProvider: ProviderAdapter = {
  async run({ model, effort, system, history, tools, serverTools, signal, hooks }: RunInput): Promise<RunResult> {
    const haiku = isHaiku(model);
    const toolDefs: ToolUnion[] = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.jsonSchema as Anthropic.Beta.BetaTool.InputSchema,
      // Stream large inputs (code, file bodies) as they're written; we validate them ourselves before running.
      eager_input_streaming: true,
    }));
    if (serverTools) {
      toolDefs.push(
        haiku
          ? { type: "web_search_20250305", name: "web_search", max_uses: 8 }
          : { type: "web_search_20260209", name: "web_search", max_uses: 8 },
        haiku
          ? { type: "web_fetch_20250910", name: "web_fetch", max_uses: 8 }
          : { type: "web_fetch_20260209", name: "web_fetch", max_uses: 8 },
      );
    }

    const messages = claudeMessages(history);
    const turn: MessageParam[] = [];
    const usage = { inputTokens: 0, outputTokens: 0 };
    let wroteText = false;
    let jsonRetries = 0;

    for (let iteration = 0; iteration < 60; iteration++) {
      const stream = anthropic().beta.messages.stream(
        {
          model,
          max_tokens: 64000,
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages: [...messages, ...turn],
          tools: toolDefs,
          thinking: { type: "adaptive", display: "summarized" },
          output_config: { effort: EFFORT[effort] },
          cache_control: { type: "ephemeral" },
          // If a safety classifier declines, retry on Anthropic's recommended fallback model instead of failing.
          ...(haiku ? {} : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }),
        },
        { signal },
      );

      const partialJson = new Map<number, { id: string; json: string }>();
      const sources: Source[] = [];
      let message: Anthropic.Beta.BetaMessage;
      try {
        for await (const ev of stream) {
          if (ev.type === "content_block_start") {
            const b = ev.content_block;
            if (b.type === "text") {
              if (wroteText) hooks.onText("\n\n");
            } else if (b.type === "tool_use") {
              partialJson.set(ev.index, { id: b.id, json: "" });
              hooks.onToolStart({ id: b.id, name: b.name, input: {} });
            } else if (b.type === "server_tool_use") {
              partialJson.set(ev.index, { id: b.id, json: "" });
              hooks.onToolStart({ id: b.id, name: b.name, input: {}, server: true });
            } else if (b.type === "web_search_tool_result") {
              if (Array.isArray(b.content)) {
                const found = b.content.map((r) => ({ url: r.url, title: r.title }));
                sources.push(...found);
                hooks.onToolEnd(b.tool_use_id, { ok: true, result: `${found.length} results` });
              } else hooks.onToolEnd(b.tool_use_id, { ok: false, result: b.content.error_code });
            } else if (b.type === "web_fetch_tool_result") {
              const ok = b.content.type === "web_fetch_result";
              hooks.onToolEnd(b.tool_use_id, { ok, result: ok ? "Read the page" : "Couldn't open the page" });
            }
          } else if (ev.type === "content_block_delta") {
            if (ev.delta.type === "text_delta") {
              wroteText = true;
              hooks.onText(ev.delta.text);
            } else if (ev.delta.type === "thinking_delta") hooks.onThinking(ev.delta.thinking);
            else if (ev.delta.type === "input_json_delta") {
              const p = partialJson.get(ev.index);
              if (p) p.json += ev.delta.partial_json;
            }
          } else if (ev.type === "content_block_stop") {
            const p = partialJson.get(ev.index);
            if (p) {
              try {
                hooks.onToolInput(p.id, JSON.parse(p.json || "{}"));
              } catch {
                // Validated properly below; this only feeds the step label.
              }
            }
          }
        }
        message = await stream.finalMessage();
        jsonRetries = 0;
      } catch (err) {
        // With eager input streaming a tool input can arrive as invalid JSON. Re-issue the turn for that
        // case only; API errors (auth, rate limits, abort) go up.
        if (err instanceof Anthropic.APIError || signal.aborted || jsonRetries++ >= 2) throw err;
        continue;
      }

      if (sources.length) hooks.onSources(sources);
      const u = message.usage;
      usage.inputTokens += (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
      usage.outputTokens += u.output_tokens ?? 0;

      if (message.stop_reason === "refusal") {
        return { native: null, usage, refusal: message.stop_details?.explanation ?? "The model declined this request." };
      }
      turn.push({ role: "assistant", content: message.content as ContentBlockParam[] });

      if (message.stop_reason === "pause_turn") continue; // a long server-side search; let it carry on

      const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
      if (!toolUses.length) return { native: turn, usage };
      if (message.stop_reason === "max_tokens") throw new TurnError("The reply hit the length limit in the middle of a tool call.");

      // Run every tool call from this step in parallel and answer them all in one message.
      const results = await Promise.all(
        toolUses.map(async (t): Promise<Anthropic.Beta.BetaToolResultBlockParam> => {
          const outcome = await hooks.executeTool(t.name, t.input, t.id);
          return { type: "tool_result", tool_use_id: t.id, is_error: !outcome.ok, content: toolResultContent(outcome) };
        }),
      );
      turn.push({ role: "user", content: results });
    }
    throw new TurnError("Stopped after 60 steps without finishing.");
  },

  async quick(model, prompt, signal) {
    const response = await anthropic().messages.create(
      { model, max_tokens: 2000, output_config: { effort: "low" }, messages: [{ role: "user", content: prompt }] },
      { signal },
    );
    return response.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
  },
};
