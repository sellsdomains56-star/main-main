import OpenAI from "openai";
import { config } from "../../config.js";
import { readFileBytes } from "../../files.js";
import type { Effort, Source, StoredMessage } from "../../types.js";
import { attachmentKind } from "./attachments.js";
import { TurnError, type ProviderAdapter, type RunInput, type RunResult } from "./types.js";

type InputItem = OpenAI.Responses.ResponseInputItem;
type ContentPart = OpenAI.Responses.ResponseInputContent;
/** Output items come back as typed objects; we store and replay them as plain JSON. */
type Item = Record<string, unknown> & { type: string };

let client: OpenAI | null = null;
function xai(): OpenAI {
  // Reasoning models can think for a long time; xAI recommends a generous timeout.
  client ??= new OpenAI({ apiKey: config.xaiKey, baseURL: config.xaiBaseUrl, timeout: 3_600_000, maxRetries: 3 });
  return client;
}

const EFFORT: Record<Effort, "low" | "medium" | "xhigh"> = { fast: "low", auto: "medium", deep: "xhigh", max: "xhigh" };

function userContent(m: StoredMessage): ContentPart[] {
  const parts: ContentPart[] = [];
  if (m.context) parts.push({ type: "input_text", text: m.context });
  for (const a of m.attachments ?? []) {
    const file = readFileBytes(a.id, { includeDeleted: true });
    if (!file) {
      parts.push({ type: "input_text", text: `[Attached file "${a.name}" is no longer available]` });
      continue;
    }
    const kind = attachmentKind(a.mime, file.data);
    // Grok reads JPEG and PNG; other images are left in the workspace.
    if (kind === "image" && ["image/jpeg", "image/png"].includes(a.mime)) {
      parts.push({ type: "input_image", image_url: `data:${a.mime};base64,${file.data.toString("base64")}`, detail: "high" });
    } else if (kind === "text") {
      parts.push({ type: "input_text", text: `<file name="${a.name}">\n${file.data.toString("utf8")}\n</file>` });
    } else {
      parts.push({
        type: "input_text",
        text: `[Attached file "${a.name}" (${a.mime}) is saved in the workspace as "${a.name}". Open it with run_code.]`,
      });
    }
  }
  const text = m.scheduled ? `[Scheduled task — the user isn't watching live; do it and report the result]\n${m.text}` : m.text;
  parts.push({ type: "input_text", text: text || "(see attachments)" });
  return parts;
}

/** Same idea as for Claude: Grok's own turns are replayed from their stored items (encrypted reasoning included). */
export function grokInput(system: string, history: StoredMessage[]): InputItem[] {
  const input: InputItem[] = [{ role: "system", content: system }];
  for (const m of history) {
    if (m.role === "user") input.push({ role: "user", content: userContent(m) });
    else if (m.provider === "xai" && m.status === "complete" && m.native?.length) input.push(...(m.native as InputItem[]));
    else input.push({ role: "assistant", content: m.text.trim() || "(no reply)" });
  }
  return input;
}

function serverToolName(type: string): string {
  return type.replace(/_call$/, "");
}

function serverToolInput(item: Item): unknown {
  const action = item.action as Record<string, unknown> | undefined;
  return action ?? {};
}

export const xaiProvider: ProviderAdapter = {
  async run({ model, effort, system, history, tools, serverTools, signal, hooks }: RunInput): Promise<RunResult> {
    const toolDefs = [
      ...(serverTools ? [{ type: "web_search" }, { type: "x_search" }] : []),
      ...tools.map((t) => ({ type: "function", name: t.name, description: t.description, parameters: t.jsonSchema })),
    ] as unknown as OpenAI.Responses.Tool[];

    const base = grokInput(system, history);
    const turn: Item[] = [];
    const usage = { inputTokens: 0, outputTokens: 0 };
    let wroteText = false;

    for (let iteration = 0; iteration < 60; iteration++) {
      const stream = await xai().responses.create(
        {
          model,
          input: [...base, ...(turn as unknown as InputItem[])],
          tools: toolDefs,
          reasoning: { effort: EFFORT[effort] },
          // We keep the history ourselves (xAI recommends this when sending images), so the encrypted
          // reasoning has to come back with each response.
          store: false,
          include: ["reasoning.encrypted_content"],
          stream: true,
        },
        { signal },
      );

      let final: OpenAI.Responses.Response | null = null;
      const sources: Source[] = [];
      let startedText = false;
      for await (const ev of stream) {
        switch (ev.type) {
          case "response.output_text.delta":
            if (!startedText && wroteText) hooks.onText("\n\n");
            startedText = wroteText = true;
            hooks.onText(ev.delta);
            break;
          case "response.reasoning_summary_text.delta":
          case "response.reasoning_text.delta":
            hooks.onThinking(ev.delta);
            break;
          case "response.output_item.added": {
            const item = ev.item as unknown as Item;
            if (item.type === "function_call") hooks.onToolStart({ id: item.call_id as string, name: item.name as string, input: {} });
            else if (item.type.endsWith("_call")) {
              hooks.onToolStart({ id: item.id as string, name: serverToolName(item.type), input: serverToolInput(item), server: true });
            }
            break;
          }
          case "response.output_item.done": {
            const item = ev.item as unknown as Item;
            if (item.type === "function_call") {
              try {
                hooks.onToolInput(item.call_id as string, JSON.parse((item.arguments as string) || "{}"));
              } catch {
                // Reported when the call runs.
              }
            } else if (item.type.endsWith("_call")) {
              hooks.onToolInput(item.id as string, serverToolInput(item));
              hooks.onToolEnd(item.id as string, { ok: item.status !== "failed", result: item.status === "failed" ? "Failed" : "Done" });
            }
            break;
          }
          case "response.output_text.annotation.added": {
            const a = ev.annotation as { type?: string; url?: string; title?: string } | null;
            if (a?.type === "url_citation" && a.url) sources.push({ url: a.url, title: a.title || a.url });
            break;
          }
          case "response.completed":
          case "response.incomplete":
            final = ev.response;
            break;
          case "response.failed":
            throw new TurnError(ev.response.error?.message ?? "Grok couldn't finish the response.");
          case "error":
            throw new TurnError(ev.message);
        }
      }
      if (!final) throw new TurnError("The response ended early.");
      if (sources.length) hooks.onSources(sources);
      usage.inputTokens += final.usage?.input_tokens ?? 0;
      usage.outputTokens += final.usage?.output_tokens ?? 0;

      const output = final.output as unknown as Item[];
      turn.push(...output);
      const calls = output.filter((i) => i.type === "function_call");
      if (!calls.length) {
        const refusal = output
          .flatMap((i) => (i.type === "message" ? (i.content as { type: string; refusal?: string }[]) : []))
          .find((c) => c.type === "refusal");
        if (refusal) return { native: null, usage, refusal: refusal.refusal ?? "The model declined this request." };
        return { native: turn, usage };
      }
      if (final.status === "incomplete") throw new TurnError("The reply hit the length limit in the middle of a tool call.");

      const results = await Promise.all(
        calls.map(async (call) => {
          let args: unknown;
          try {
            args = JSON.parse((call.arguments as string) || "{}");
          } catch {
            return { type: "function_call_output", call_id: call.call_id, output: `INVALID_JSON: ${String(call.arguments)}` };
          }
          const outcome = await hooks.executeTool(call.name as string, args, call.call_id as string);
          const note = outcome.images?.length ? `\n(${outcome.images.length} image(s) were shown to the user.)` : "";
          return { type: "function_call_output", call_id: call.call_id, output: (outcome.ok ? "" : "ERROR: ") + outcome.content + note };
        }),
      );
      turn.push(...(results as Item[]));
    }
    throw new TurnError("Stopped after 60 steps without finishing.");
  },

  async quick(model, prompt, signal) {
    const response = await xai().responses.create(
      { model, input: [{ role: "user", content: prompt }], reasoning: { effort: "low" }, store: false },
      { signal },
    );
    return response.output_text.trim();
  },
};
