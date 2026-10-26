import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";

/**
 * End-to-end tests against local stand-ins for the Anthropic and xAI APIs that
 * stream the same event formats, so the adapters' requests, tool loops and
 * history replay are checked without real keys.
 */

type Captured = { path: string; headers: http.IncomingHttpHeaders; body: Record<string, unknown> };
const anthropicRequests: Captured[] = [];
const xaiRequests: Captured[] = [];

function sse(events: { event?: string; data: unknown }[]): string {
  return events.map((e) => `${e.event ? `event: ${e.event}\n` : ""}data: ${JSON.stringify(e.data)}\n\n`).join("");
}

/** Claude: first a thinking block, a web search and a `remember` call; then the answer. */
function anthropicReply(call: number): string {
  const start = (index: number, block: unknown) => ({ event: "content_block_start", data: { type: "content_block_start", index, content_block: block } });
  const delta = (index: number, d: unknown) => ({ event: "content_block_delta", data: { type: "content_block_delta", index, delta: d } });
  const stop = (index: number) => ({ event: "content_block_stop", data: { type: "content_block_stop", index } });
  const message = {
    id: `msg_${call}`,
    type: "message",
    role: "assistant",
    model: "claude-opus-5-5",
    content: [],
    stop_reason: null,
    stop_sequence: null,
    usage: { input_tokens: 100, output_tokens: 1 },
  };
  const head = [{ event: "message_start", data: { type: "message_start", message } }];
  const end = (reason: string) => [
    { event: "message_delta", data: { type: "message_delta", delta: { stop_reason: reason, stop_sequence: null }, usage: { output_tokens: 42 } } },
    { event: "message_stop", data: { type: "message_stop" } },
  ];
  if (call === 1) {
    return sse([
      ...head,
      start(0, { type: "thinking", thinking: "", signature: "" }),
      delta(0, { type: "thinking_delta", thinking: "The user likes espresso; save it and look it up." }),
      delta(0, { type: "signature_delta", signature: "sig-abc" }),
      stop(0),
      start(1, { type: "server_tool_use", id: "srvtoolu_1", name: "web_search", input: {} }),
      delta(1, { type: "input_json_delta", partial_json: '{"query":"best espresso beans"}' }),
      stop(1),
      start(2, {
        type: "web_search_tool_result",
        tool_use_id: "srvtoolu_1",
        content: [{ type: "web_search_result", url: "https://example.com/beans", title: "Best beans", encrypted_content: "enc", page_age: null }],
      }),
      stop(2),
      start(3, { type: "tool_use", id: "toolu_1", name: "remember", input: {} }),
      delta(3, { type: "input_json_delta", partial_json: '{"fact":"Loves espresso","category":"preference"}' }),
      stop(3),
      ...end("tool_use"),
    ]);
  }
  return sse([
    ...head,
    start(0, { type: "text", text: "" }),
    delta(0, { type: "text_delta", text: `Answer ${call}.` }),
    stop(0),
    ...end("end_turn"),
  ]);
}

/** Claude with a code sandbox: runs code that makes a file, then answers. */
function anthropicSandboxReply(): string {
  const start = (index: number, block: unknown) => ({ event: "content_block_start", data: { type: "content_block_start", index, content_block: block } });
  const delta = (index: number, d: unknown) => ({ event: "content_block_delta", data: { type: "content_block_delta", index, delta: d } });
  const stop = (index: number) => ({ event: "content_block_stop", data: { type: "content_block_stop", index } });
  const message = { id: "msg_sb", type: "message", role: "assistant", model: "claude-opus-5-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } };
  return sse([
    { event: "message_start", data: { type: "message_start", message } },
    start(0, { type: "server_tool_use", id: "srvtoolu_sb", name: "bash_code_execution", input: {} }),
    delta(0, { type: "input_json_delta", partial_json: '{"command":"python chart.py"}' }),
    stop(0),
    start(1, {
      type: "bash_code_execution_tool_result",
      tool_use_id: "srvtoolu_sb",
      content: { type: "bash_code_execution_result", return_code: 0, stdout: "saved", stderr: "", content: [{ type: "bash_code_execution_output", file_id: "file_out_1" }] },
    }),
    stop(1),
    start(2, { type: "text", text: "" }),
    delta(2, { type: "text_delta", text: "Here's your chart." }),
    stop(2),
    {
      event: "message_delta",
      data: { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null, container: { id: "container_1", expires_at: "2099-01-01T00:00:00Z" } }, usage: { output_tokens: 20 } },
    },
    { event: "message_stop", data: { type: "message_stop" } },
  ]);
}

/** Grok: first a reasoning item and a `remember` call; then the answer with a citation. */
function xaiReply(call: number): string {
  const reasoning = { type: "reasoning", id: `rs_${call}`, summary: [], encrypted_content: `enc-${call}` };
  const usage = { input_tokens: 50, output_tokens: 10, total_tokens: 60 };
  const response = (output: unknown[]) => ({ id: `resp_${call}`, object: "response", status: "completed", model: "grok-4.7", output, usage });
  const ev = (data: Record<string, unknown>) => ({ event: data.type as string, data });
  if (call === 1) {
    const fn = { type: "function_call", id: "fc_1", call_id: "call_1", name: "remember", arguments: '{"fact":"Prefers Grok","category":"preference"}', status: "completed" };
    return sse([
      ev({ type: "response.output_item.added", output_index: 0, item: reasoning, sequence_number: 1 }),
      ev({ type: "response.output_item.done", output_index: 0, item: reasoning, sequence_number: 2 }),
      ev({ type: "response.output_item.added", output_index: 1, item: { ...fn, arguments: "", status: "in_progress" }, sequence_number: 3 }),
      ev({ type: "response.output_item.done", output_index: 1, item: fn, sequence_number: 4 }),
      ev({ type: "response.completed", response: response([reasoning, fn]), sequence_number: 5 }),
    ]);
  }
  const msg = {
    type: "message",
    id: `msg_${call}`,
    role: "assistant",
    status: "completed",
    content: [{ type: "output_text", text: `Grok answer ${call}.`, annotations: [{ type: "url_citation", url: "https://x.com/post", title: "A post", start_index: 0, end_index: 1 }] }],
  };
  return sse([
    ev({ type: "response.output_text.delta", item_id: msg.id, output_index: 0, content_index: 0, delta: `Grok answer ${call}.`, logprobs: [], sequence_number: 1 }),
    ev({ type: "response.output_text.annotation.added", item_id: msg.id, output_index: 0, content_index: 0, annotation_index: 0, annotation: msg.content[0].annotations[0], sequence_number: 2 }),
    ev({ type: "response.completed", response: response([msg]), sequence_number: 3 }),
  ]);
}

const googleRequests: Captured[] = [];
let tokenCounter = 0;

/** A stand-in for Google's sign-in, Gmail and Calendar APIs. */
function googleReply(method: string, path: string, raw: string): unknown {
  const b64 = (s: string) => Buffer.from(s).toString("base64url");
  if (path.startsWith("/oauth2.googleapis.com/token")) {
    const form = new URLSearchParams(raw);
    tokenCounter++;
    return { access_token: `access-${tokenCounter}`, expires_in: 3600, scope: "gmail", ...(form.get("grant_type") === "authorization_code" ? { refresh_token: "refresh-1" } : {}) };
  }
  if (path.startsWith("/openidconnect.googleapis.com/v1/userinfo")) return { email: "me@example.com" };
  const gmail = "/gmail.googleapis.com/gmail/v1/users/me";
  if (path.startsWith(`${gmail}/messages?`)) return { messages: [{ id: "m1", threadId: "t1" }] };
  if (path.startsWith(`${gmail}/messages/m1`)) {
    return {
      id: "m1",
      threadId: "t1",
      labelIds: ["UNREAD"],
      snippet: "Lunch on Friday?",
      payload: {
        mimeType: "multipart/alternative",
        headers: [
          { name: "From", value: "Bob <bob@example.com>" },
          { name: "To", value: "me@example.com" },
          { name: "Subject", value: "Lunch" },
          { name: "Date", value: "Mon, 26 Oct 2026 09:00:00 +0400" },
          { name: "Message-ID", value: "<abc@mail>" },
        ],
        parts: [
          { mimeType: "text/plain", body: { data: b64("Hi! Lunch on Friday at 1?") } },
          { mimeType: "text/html", body: { data: b64("<p>Hi! Lunch on <b>Friday</b> at 1?</p>") } },
        ],
      },
    };
  }
  if (path === `${gmail}/drafts` && method === "POST") return { id: "draft-1", message: { id: "dm1" } };
  if (path === `${gmail}/drafts/send` && method === "POST") return { id: "sent-1" };
  return {};
}

let server: http.Server;

before(async () => {
  let anthropicCalls = 0;
  let xaiCalls = 0;
  server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      let body: Record<string, unknown> = {};
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = Object.fromEntries(new URLSearchParams(raw));
      }
      if (body.stream) res.writeHead(200, { "content-type": "text/event-stream" });
      if (req.url!.startsWith("/google/")) {
        googleRequests.push({ path: req.url!, headers: req.headers, body: body ?? {} });
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(googleReply(req.method!, req.url!.slice("/google".length), raw)));
        return;
      }
      if (req.url!.startsWith("/anthropic/v1/files")) {
        anthropicRequests.push({ path: req.url!, headers: req.headers, body: { method: req.method, size: raw.length } });
        if (req.url!.endsWith("/content")) {
          res.writeHead(200, { "content-type": "image/png" });
          res.end(Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]));
          return;
        }
        res.writeHead(200, { "content-type": "application/json" });
        const id = req.method === "POST" ? "file_up_1" : req.url!.split("/").pop();
        res.end(JSON.stringify({ id, type: "file", filename: req.method === "POST" ? "sales.csv" : "chart.png", mime_type: "image/png", size_bytes: 7, created_at: "2026-10-26T00:00:00Z", downloadable: true }));
        return;
      }
      if (req.url!.startsWith("/anthropic/")) {
        anthropicRequests.push({ path: req.url!, headers: req.headers, body });
        if (body.stream && (body.tools as { type?: string }[] | undefined)?.some((t) => t.type?.startsWith("code_execution"))) {
          res.end(anthropicSandboxReply());
          return;
        }
        // Title requests are plain (non-streaming) calls.
        if (!body.stream) {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ id: "t", type: "message", role: "assistant", model: body.model, content: [{ type: "text", text: "Espresso chat" }], stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } }));
          return;
        }
        res.end(anthropicReply(++anthropicCalls));
      } else {
        xaiRequests.push({ path: req.url!, headers: req.headers, body });
        if (!body.stream) {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ id: "t", object: "response", status: "completed", model: body.model, output: [{ type: "message", id: "m", role: "assistant", status: "completed", content: [{ type: "output_text", text: "Grok chat", annotations: [] }] }], usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 } }));
          return;
        }
        res.end(xaiReply(++xaiCalls));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}/anthropic`;
  process.env.XAI_API_KEY = "test-key";
  process.env.XAI_BASE_URL = `http://127.0.0.1:${port}/xai/v1`;
  process.env.AGENT_PASSWORD = "correct horse";
  process.env.TIMEZONE = "Asia/Dubai";
  process.env.GOOGLE_API_ORIGIN = `http://127.0.0.1:${port}/google`;
  const { initAuth } = await import("./auth.js");
  await initAuth(); // creates the vault from AGENT_PASSWORD and unlocks it
});

after(() => server.close());

async function untilDone(run: { subscribe: (fn: (e: { type: string }) => void, onClose?: () => void) => () => void }) {
  await new Promise<void>((resolve) => run.subscribe(() => {}, resolve));
}

describe("Claude adapter", () => {
  it("streams thinking, server search and tool calls, then replays history append-only", async () => {
    const { createConversation, listMessages, listMemories } = await import("./db.js");
    const { sendMessage } = await import("./agent/chat.js");
    const conversation = createConversation();

    await untilDone(sendMessage({ conversationId: conversation.id, text: "I love espresso", model: "claude-opus-5-5", effort: "deep" }));
    const [first, second] = anthropicRequests.filter((r) => r.body.stream);
    assert.ok(first && second, "two streamed requests for one tool round");

    // Request shape
    assert.equal(first.body.model, "claude-opus-5-5");
    assert.deepEqual(first.body.thinking, { type: "adaptive", display: "summarized" });
    assert.deepEqual(first.body.output_config, { effort: "xhigh" });
    assert.equal(first.body.fallbacks, "default");
    assert.match(String(first.headers["anthropic-beta"]), /server-side-fallback-2026-07-01/);
    assert.equal("temperature" in first.body, false);
    const tools = first.body.tools as { name: string; type?: string; eager_input_streaming?: boolean }[];
    assert.ok(tools.some((t) => t.type === "web_search_20260209"));
    assert.ok(tools.some((t) => t.type === "web_fetch_20260209"));
    assert.ok(tools.filter((t) => !t.type).every((t) => t.eager_input_streaming === true));
    assert.ok(tools.some((t) => t.name === "delegate_tasks"), "the main agent can run swarms");

    // The tool round: the assistant turn comes back unchanged, then our result.
    const msgs = second.body.messages as { role: string; content: { type: string; [k: string]: unknown }[] }[];
    const assistant = msgs[1];
    assert.equal(assistant.role, "assistant");
    assert.deepEqual(assistant.content.map((b) => b.type), ["thinking", "server_tool_use", "web_search_tool_result", "tool_use"]);
    assert.equal(assistant.content[0].signature, "sig-abc");
    const result = msgs[2].content[0];
    assert.equal(result.type, "tool_result");
    assert.equal(result.tool_use_id, "toolu_1");
    assert.ok(listMemories().some((m) => m.text === "Loves espresso"));

    // What was saved
    const saved = listMessages(conversation.id).at(-1)!;
    assert.equal(saved.status, "complete");
    assert.equal(saved.text, "Answer 2.");
    assert.deepEqual(saved.sources, [{ url: "https://example.com/beans", title: "Best beans" }]);
    assert.deepEqual(
      saved.steps!.map((s) => (s.kind === "tool" ? `${s.name}:${s.status}` : s.kind)),
      ["thinking", "web_search:ok", "remember:ok"],
    );

    // Next turn: the earlier request is an exact prefix of the new one.
    await untilDone(sendMessage({ conversationId: conversation.id, text: "Thanks", model: "claude-opus-5-5" }));
    const third = anthropicRequests.filter((r) => r.body.stream)[2];
    const prior = second.body.messages as unknown[];
    const next = third.body.messages as unknown[];
    assert.equal(JSON.stringify(next.slice(0, prior.length)), JSON.stringify(prior));
    assert.equal(next.length, prior.length + 2);
  });

  it("runs code in Anthropic's sandbox: uploads attachments once, keeps the container, saves files it makes", async () => {
    const { config } = await import("./config.js");
    const { createConversation, listMessages } = await import("./db.js");
    const { sendMessage } = await import("./agent/chat.js");
    const { saveUpload } = await import("./files.js");
    config.codeExecution = "sandbox";
    try {
      const conversation = createConversation();
      const csv = saveUpload("sales.csv", "text/csv", Buffer.from("month,sales\nJan,10\nFeb,12\n"), conversation.id);
      const before = anthropicRequests.length;
      await untilDone(sendMessage({ conversationId: conversation.id, text: "Chart my sales", attachmentIds: [csv.id], model: "claude-opus-5-5" }));
      const reqs = anthropicRequests.slice(before);
      assert.equal(reqs.filter((r) => r.path.endsWith("/v1/files") && r.body.method === "POST").length, 1, "the attachment is uploaded once");
      const first = reqs.find((r) => r.body.stream)!;
      const tools = first.body.tools as { name: string; type?: string }[];
      assert.ok(tools.some((t) => t.type === "code_execution_20260521"));
      assert.ok(!tools.some((t) => t.name === "run_code"), "no local code runs in sandbox mode");
      assert.match(String(first.headers["anthropic-beta"]), /files-api-2025-04-14/);
      const userBlocks = (first.body.messages as { content: { type: string; file_id?: string }[] }[])[0].content;
      assert.ok(userBlocks.some((b) => b.type === "container_upload" && b.file_id === "file_up_1"));

      const saved = listMessages(conversation.id).at(-1)!;
      assert.equal(saved.text, "Here's your chart.");
      assert.deepEqual(saved.files?.map((f) => f.name), ["sandbox/chart.png"]);
      assert.deepEqual(saved.steps?.map((s) => (s.kind === "tool" ? `${s.name}:${s.status}` : s.kind)), ["bash_code_execution:ok"]);

      // The next turn reuses the container and sends the same upload again (no new upload).
      await untilDone(sendMessage({ conversationId: conversation.id, text: "Thanks", model: "claude-opus-5-5" }));
      const later = anthropicRequests.slice(before).filter((r) => r.body.stream);
      assert.equal(later.at(-1)!.body.container, "container_1");
      assert.equal(anthropicRequests.slice(before).filter((r) => r.path.endsWith("/v1/files") && r.body.method === "POST").length, 1);
    } finally {
      config.codeExecution = "local";
    }
  });

  it("uses the basic web tools and no fallback for Haiku", async () => {
    const { createConversation } = await import("./db.js");
    const { sendMessage } = await import("./agent/chat.js");
    const conversation = createConversation();
    const before = anthropicRequests.length;
    await untilDone(sendMessage({ conversationId: conversation.id, text: "hi", model: "claude-haiku-5-5" }));
    const req = anthropicRequests.slice(before).find((r) => r.body.stream)!;
    const tools = req.body.tools as { type?: string }[];
    assert.ok(tools.some((t) => t.type === "web_search_20250305"));
    assert.equal(req.body.fallbacks, undefined);
  });
});

describe("Grok adapter", () => {
  it("uses the Responses API with web and X search, runs function calls and passes reasoning back", async () => {
    const { createConversation, listMessages, listMemories } = await import("./db.js");
    const { sendMessage } = await import("./agent/chat.js");
    const conversation = createConversation();
    await untilDone(sendMessage({ conversationId: conversation.id, text: "Remember I prefer Grok", model: "grok-4.7", effort: "fast" }));

    const [first, second] = xaiRequests.filter((r) => r.body.stream);
    assert.equal(first.path, "/xai/v1/responses");
    assert.equal(first.body.store, false);
    assert.deepEqual(first.body.include, ["reasoning.encrypted_content"]);
    assert.deepEqual(first.body.reasoning, { effort: "low" });
    const tools = first.body.tools as { type: string; name?: string }[];
    assert.ok(tools.some((t) => t.type === "web_search"));
    assert.ok(tools.some((t) => t.type === "x_search"));
    assert.ok(tools.some((t) => t.type === "function" && t.name === "generate_image"));

    const input = second.body.input as { type?: string; role?: string; call_id?: string; encrypted_content?: string }[];
    assert.equal(input[0].role, "system");
    assert.ok(input.some((i) => i.type === "reasoning" && i.encrypted_content === "enc-1"));
    assert.ok(input.some((i) => i.type === "function_call_output" && i.call_id === "call_1"));
    assert.ok(listMemories().some((m) => m.text === "Prefers Grok"));

    const saved = listMessages(conversation.id).at(-1)!;
    assert.equal(saved.text, "Grok answer 2.");
    assert.deepEqual(saved.sources, [{ url: "https://x.com/post", title: "A post" }]);
  });

  it("replays a Claude turn to Grok as plain text when you switch models", async () => {
    const { createConversation } = await import("./db.js");
    const { sendMessage } = await import("./agent/chat.js");
    const conversation = createConversation();
    await untilDone(sendMessage({ conversationId: conversation.id, text: "first", model: "claude-sonnet-5-5" }));
    const before = xaiRequests.length;
    await untilDone(sendMessage({ conversationId: conversation.id, text: "second", model: "grok-4.7" }));
    const req = xaiRequests.slice(before).find((r) => r.body.stream)!;
    const input = req.body.input as { role?: string; content?: unknown }[];
    const assistantTurns = input.filter((i) => i.role === "assistant");
    assert.equal(assistantTurns.length, 1);
    assert.equal(typeof assistantTurns[0].content, "string");
  });
});

describe("Swarms and custom agents", () => {
  it("creates agents and runs a swarm of them in parallel", async () => {
    const { createConversation, findAgent, listMessages } = await import("./db.js");
    const { AGENT_TOOLS } = await import("./agent/swarm.js");
    const { sendMessage } = await import("./agent/chat.js");
    const create = AGENT_TOOLS.find((t) => t.name === "create_agents")!;
    const conversation = createConversation();
    const ctx = { conversationId: conversation.id, signal: new AbortController().signal, progress() {} };
    const made = await create.run(
      {
        agents: Array.from({ length: 12 }, (_, i) => ({
          name: `Analyst ${i + 1}`,
          description: "Researches one company",
          instructions: "Be precise.",
          model: "mock",
        })),
      },
      ctx,
    );
    assert.ok(made.ok, made.content);
    assert.ok(findAgent("analyst 7"), "names are case-insensitive");

    // The mock model delegates when asked to "use agents".
    await untilDone(sendMessage({ conversationId: conversation.id, text: "use agents to compare phones", model: "mock" }));
    const reply = listMessages(conversation.id).at(-1)!;
    const swarm = reply.steps!.find((s) => s.kind === "tool" && s.name === "delegate_tasks");
    assert.ok(swarm && swarm.kind === "tool" && swarm.status === "ok", JSON.stringify(reply.steps));
    assert.match(reply.text, /3 of 3 tasks succeeded/);
  });

  it("gives custom agents only the abilities you chose, and never swarm tools to sub-agents", async () => {
    const { toolsFor } = await import("./agent/toolkit.js");
    const now = Date.now();
    const base = { id: "a_x", name: "X", emoji: "🤖", description: "", instructions: "", model: null, effort: null, createdAt: now, updatedAt: now };
    const limited = toolsFor({ ...base, tools: ["memory"] }, false);
    assert.deepEqual(limited.tools.map((t) => t.name), ["remember", "forget", "search_past_conversations"]);
    assert.equal(limited.serverTools, false);
    const sub = toolsFor(null, true);
    assert.ok(!sub.tools.some((t) => t.name === "delegate_tasks"));
    assert.ok(sub.serverTools);
  });
});

describe("Reminders", () => {
  it("repeats in local time and skips missed runs", async () => {
    const { nextOccurrence } = await import("./tools/schedule.js");
    const at = new Date(2026, 9, 23, 8, 0).getTime(); // Fri 23 Oct 2026, 08:00
    assert.equal(new Date(nextOccurrence(at, "weekdays", at)!).getDay(), 1, "Friday → Monday");
    assert.equal(nextOccurrence(at, "none", at), null);
    const now = new Date(2026, 9, 26, 12, 0).getTime();
    const next = new Date(nextOccurrence(at, "daily", now)!);
    assert.equal(next.getDate(), 27);
    assert.equal(next.getHours(), 8);
    const monthly = new Date(nextOccurrence(new Date(2026, 0, 31, 9, 0).getTime(), "monthly", 0)!);
    assert.equal(monthly.getMonth(), 1);
    assert.equal(monthly.getDate(), 28, "31 Jan → 28 Feb");
  });

  it("fires a due reminder into its chat", async () => {
    const { addReminder, createConversation, listMessages, getReminder } = await import("./db.js");
    const { tick } = await import("./scheduler.js");
    const conversation = createConversation();
    const r = addReminder({ message: "Stretch", task: null, nextRun: Date.now() - 1000, repeat: "daily", conversationId: conversation.id });
    await tick();
    assert.match(listMessages(conversation.id).at(-1)!.text, /Reminder:\*\* Stretch/);
    assert.ok(getReminder(r.id)!.nextRun > Date.now(), "rescheduled for tomorrow");
  });
});

describe("Tools", () => {
  it("validates input and keeps file access inside the workspace", async () => {
    const { BASE_TOOLS } = await import("./agent/tools.js");
    const ctx = { conversationId: "c_none", signal: new AbortController().signal, progress() {} };
    const write = BASE_TOOLS.files.find((t) => t.name === "write_file")!;
    const read = BASE_TOOLS.files.find((t) => t.name === "read_file")!;
    assert.equal((await write.run({ path: "../escape.txt", content: "x" }, ctx)).ok, false);
    assert.equal((await write.run({ path: "/etc/passwd", content: "x" }, ctx)).ok, false);
    assert.equal((await write.run({ nope: 1 }, ctx)).ok, false);
    assert.ok((await write.run({ path: "notes/hello.md", content: "# Hi" }, ctx)).ok);
    assert.equal((await read.run({ path: "notes/hello.md" }, ctx)).content, "# Hi");
  });

  it("runs code without leaking API keys to it", async () => {
    const { BASE_TOOLS } = await import("./agent/tools.js");
    const run = BASE_TOOLS.code[0];
    const ctx = { conversationId: "c_none", signal: new AbortController().signal, progress() {} };
    const out = await run.run({ language: "javascript", code: "console.log(process.env.ANTHROPIC_API_KEY ?? 'no key', 6 * 7)" }, ctx);
    assert.ok(out.ok);
    assert.match(out.content, /no key 42/);
    const slow = await run.run({ language: "bash", code: "sleep 5", timeout_seconds: 1 }, ctx);
    assert.equal(slow.ok, false);
    assert.match(slow.content, /Timed out/);
  });
});

describe("Encryption at rest", () => {
  it("stores chats, memories and agents only as ciphertext", async () => {
    const { addMemory, createAgent, createConversation, addMessage, rawRow, listMessages, getConversation } = await import("./db.js");
    const c = createConversation("Secret plans");
    const m = addMessage(c.id, "user", { text: "my bank PIN is 4321" });
    const mem = addMemory("Lives at 1 Secret Street", "about_me");
    const agent = createAgent({ name: "Spy", emoji: "🕵️", description: "covert", instructions: "Tell no one", model: null, effort: null, tools: null });
    for (const [table, id] of [["conversations", c.id], ["messages", m.id], ["memories", mem.id], ["agents", agent.id]] as const) {
      const raw = JSON.stringify(rawRow(table, id));
      assert.doesNotMatch(raw, /Secret|4321|Tell no one|covert/, `${table} leaked plaintext`);
      assert.match(raw, /e1:/);
    }
    assert.equal(getConversation(c.id)!.title, "Secret plans");
    assert.equal(listMessages(c.id)[0].text, "my bank PIN is 4321");
  });

  it("encrypts uploaded files on disk", async () => {
    const fs = await import("node:fs");
    const { saveUpload, readFileBytes } = await import("./files.js");
    const { getFile } = await import("./db.js");
    const file = saveUpload("diary.txt", "text/plain", Buffer.from("dear diary"), null);
    assert.doesNotMatch(fs.readFileSync(getFile(file.id)!.path).toString("latin1"), /dear diary/);
    assert.equal(readFileBytes(file.id)!.data.toString(), "dear diary");
  });

  it("checks the password with the key itself, and can change it", async () => {
    const { unlock, changePassword } = await import("./vault.js");
    assert.equal(await unlock("wrong"), false);
    assert.equal(await unlock("correct horse"), true);
    assert.equal(await changePassword("wrong", "new password"), false);
    assert.equal(await changePassword("correct horse", "new password 2"), true);
    assert.equal(await unlock("new password 2"), true);
    assert.equal(await changePassword("new password 2", "correct horse"), true);
  });
});

describe("Connectors", () => {
  async function signedIn() {
    const { createApp } = await import("./server.js");
    const srv = createApp().listen(0);
    const base = `http://127.0.0.1:${(srv.address() as AddressInfo).port}`;
    const headers = { "content-type": "application/json", "x-requested-with": "agent" };
    const login = await fetch(`${base}/api/login`, { method: "POST", headers, body: '{"password":"correct horse"}' });
    const cookie = login.headers.get("set-cookie")!.split(";")[0];
    const call = (path: string, init: { method?: string; body?: unknown } = {}) =>
      fetch(`${base}${path}`, {
        method: init.method ?? (init.body ? "POST" : "GET"),
        headers: { ...headers, cookie },
        body: init.body ? JSON.stringify(init.body) : undefined,
        redirect: "manual",
      });
    return { srv, base, call };
  }

  it("connects Gmail through Google sign-in, reads mail and drafts emails that wait for your OK", async () => {
    const { srv, base, call } = await signedIn();
    try {
      assert.equal((await call("/api/connectors/google/setup", { method: "PUT", body: { clientId: "client-123.apps.googleusercontent.com", clientSecret: "secret-xyz" } })).status, 200);
      const { authUrl } = (await (await call("/api/connectors/google/gmail/connect", { body: {} })).json()) as { authUrl: string };
      const auth = new URL(authUrl);
      assert.match(auth.searchParams.get("scope")!, /gmail\.readonly/);
      assert.equal(auth.searchParams.get("code_challenge_method"), "S256");
      assert.equal(auth.searchParams.get("access_type"), "offline");
      const state = auth.searchParams.get("state")!;

      // Google sends you back without our cookie; the state alone completes it, once.
      const back = await fetch(`${base}/api/connectors/oauth/callback?code=good-code&state=${state}`, { redirect: "manual" });
      assert.equal(back.status, 302);
      assert.equal(back.headers.get("location"), "/#/connectors?connected=Gmail");
      const replay = await fetch(`${base}/api/connectors/oauth/callback?code=good-code&state=${state}`, { redirect: "manual" });
      assert.match(replay.headers.get("location")!, /error=/);
      const exchange = googleRequests.find((r) => r.path.includes("/token") && String(r.body.grant_type) === "authorization_code")!;
      assert.equal(exchange.body.code, "good-code");
      assert.ok(String(exchange.body.code_verifier).length >= 43);

      const listed = (await (await call("/api/connectors")).json()) as { connectors: { kind: string; status: string; account: string; id: string }[] };
      const gmail = listed.connectors.find((c) => c.kind === "gmail")!;
      assert.equal(gmail.status, "connected");
      assert.equal(gmail.account, "me@example.com");
      assert.doesNotMatch(JSON.stringify(listed), /access-\d|refresh-1|secret-xyz/, "tokens never reach the browser");

      const { rawRow } = await import("./db.js");
      assert.doesNotMatch(JSON.stringify(rawRow("connectors", gmail.id)), /refresh-1|access-\d/, "tokens are encrypted at rest");

      const { toolsFor } = await import("./agent/toolkit.js");
      const tools = toolsFor(null, false).tools;
      const tool = (name: string) => tools.find((t) => t.name === name)!;
      const ctx = { conversationId: "c_x", signal: new AbortController().signal, progress() {} };

      const found = await tool("gmail_search").run({ query: "is:unread" }, ctx);
      assert.match(found.content, /Subject: Lunch/);
      assert.match(found.content, /\[unread\]/);
      const read = await tool("gmail_read").run({ message_id: "m1" }, ctx);
      assert.match(read.content, /Lunch on Friday at 1\?/);

      const drafted = await tool("gmail_send_email").run({ to: "bob@example.com", subject: "Re: Lunch", body: "Friday works!", reply_to_message_id: "m1" }, ctx);
      assert.ok(drafted.approval, "it waits for approval");
      assert.equal(drafted.approval!.draftId, "draft-1");
      const draftReq = googleRequests.find((r) => r.path.endsWith("/drafts") && r.body.message)!;
      const rawEmail = Buffer.from((draftReq.body.message as { raw: string }).raw, "base64url").toString();
      assert.match(rawEmail, /To: bob@example\.com/);
      assert.match(rawEmail, /In-Reply-To: <abc@mail>/);
      assert.equal((draftReq.body.message as { threadId: string }).threadId, "t1");
      assert.ok(!googleRequests.some((r) => r.path.endsWith("/drafts/send")), "nothing sent yet");

      assert.equal((await call(`/api/connectors/${gmail.id}/email/send`, { body: { draftId: "draft-1" } })).status, 200);
      assert.ok(googleRequests.some((r) => r.path.endsWith("/drafts/send")));

      // An expired access token is refreshed automatically.
      const { getConnector, saveConnector } = await import("./connectors/store.js");
      const c = getConnector(gmail.id)!;
      saveConnector({ ...c, google: { ...c.google!, expiresAt: 0 } });
      await tool("gmail_search").run({ query: "" }, ctx);
      assert.ok(googleRequests.some((r) => r.path.includes("/token") && r.body.grant_type === "refresh_token" && r.body.refresh_token === "refresh-1"));
    } finally {
      srv.close();
    }
  });

  it("adds an app by link (an MCP server) with a token and lets the agent use its tools", async () => {
    const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
    const { StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
    const { z } = await import("zod");
    const express = (await import("express")).default;
    const appServer = express();
    appServer.use(express.json());
    appServer.post("/mcp", async (req, res) => {
      if (req.headers.authorization !== "Bearer sk-good") {
        res.status(401).json({ error: "unauthorized" });
        return;
      }
      const mcp = new McpServer({ name: "calculator", version: "1.0.0" });
      mcp.registerTool("add", { description: "Add two numbers", inputSchema: { a: z.number(), b: z.number() } }, async ({ a, b }) => ({
        content: [{ type: "text", text: String(a + b) }],
      }));
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on("close", () => void transport.close());
      await mcp.connect(transport);
      await transport.handleRequest(req, res, req.body);
    });
    const mcpSrv = appServer.listen(0);
    const url = `http://127.0.0.1:${(mcpSrv.address() as AddressInfo).port}/mcp`;
    const { srv, call } = await signedIn();
    try {
      const bad = (await (await call("/api/connectors/mcp", { body: { url, name: "Calc", token: "sk-wrong" } })).json()) as { connector: { status: string; error: string } };
      assert.equal(bad.connector.status, "error");
      const good = (await (await call("/api/connectors/mcp", { body: { url, name: "Calc", token: "sk-good" } })).json()) as {
        connector: { status: string; tools: { name: string }[]; usesToken: boolean };
      };
      assert.equal(good.connector.status, "connected");
      assert.deepEqual(good.connector.tools.map((t) => t.name), ["add"]);

      const { toolsFor } = await import("./agent/toolkit.js");
      const add = toolsFor(null, false).tools.find((t) => t.name === "calc__add");
      assert.ok(add, "tool is namespaced by app");
      const out = await add!.run({ a: 2, b: 3 }, { conversationId: "c_x", signal: new AbortController().signal, progress() {} });
      assert.equal(out.ok, true);
      assert.equal(out.content, "5");
      assert.equal((await add!.run({ a: 2 }, { conversationId: "c_x", signal: new AbortController().signal, progress() {} })).ok, false);

      // Custom agents only get connectors if you give them that ability.
      const limited = toolsFor({ id: "a", name: "a", emoji: "", description: "", instructions: "", model: null, effort: null, tools: ["memory"], createdAt: 0, updatedAt: 0 }, false);
      assert.ok(!limited.tools.some((t) => t.name === "calc__add"));
    } finally {
      srv.close();
      mcpSrv.close();
    }
  });
});

describe("Smart pick", () => {
  it("picks a model per message", async () => {
    const { routeModel } = await import("./agent/router.js");
    const pick = (text: string, effort: "fast" | "auto" | "deep" | "max" = "auto", attachments = 0) =>
      routeModel({ text, effort, attachments: Array.from({ length: attachments }, (_, i) => ({ id: `f${i}`, name: "a.pdf", mime: "application/pdf", size: 1, origin: "upload" as const, conversationId: null, createdAt: 0 })) }).id;
    assert.equal(pick("thanks!"), "claude-haiku-5-5");
    assert.equal(pick("شكرا"), "claude-haiku-5-5");
    assert.equal(pick("What's a good name for a grey cat?"), "claude-sonnet-5-5");
    assert.equal(pick("Analyze my Q3 numbers and build a budget for next year"), "claude-opus-5-5");
    assert.equal(pick("حلل أرقام المبيعات"), "claude-opus-5-5");
    assert.equal(pick("summarise", "auto", 1), "claude-opus-5-5");
    assert.equal(pick("hi", "deep"), "claude-opus-5-5");
    assert.equal(pick("Anything", "max"), "claude-fable-5-1");
    assert.equal(pick("What's trending on X right now?"), "grok-4.7");
  });

  it("answers with the picked model and records it on the reply", async () => {
    const { createConversation, listMessages } = await import("./db.js");
    const { sendMessage } = await import("./agent/chat.js");
    const conversation = createConversation();
    const before = anthropicRequests.length;
    await untilDone(sendMessage({ conversationId: conversation.id, text: "thanks", model: "auto" }));
    const req = anthropicRequests.slice(before).find((r) => r.body.stream)!;
    assert.equal(req.body.model, "claude-haiku-5-5");
    assert.equal(listMessages(conversation.id).at(-1)!.model, "claude-haiku-5-5");
  });
});

describe("Spending", () => {
  it("prices requests from published rates, caching and long prompts included", async () => {
    const { requestCost } = await import("./pricing.js");
    const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
    close(requestCost("anthropic", "claude-opus-5-5", { input: 1_000_000, output: 1_000_000 }), 24);
    close(requestCost("anthropic", "claude-fable-5-1", { input: 0, output: 0, cacheRead: 1_000_000, cacheWrite: 1_000_000 }), 0.25 + 12.5);
    close(requestCost("anthropic", "claude-sonnet-5-5", { input: 0, output: 0, webSearches: 3 }), 0.03);
    // Haiku over 100K prompt tokens and Grok over 200K switch to the long-context price.
    close(requestCost("anthropic", "claude-haiku-5-5", { input: 50_000, output: 0 }), 0.005);
    close(requestCost("anthropic", "claude-haiku-5-5", { input: 150_000, output: 0 }), 0.075);
    close(requestCost("xai", "grok-4.7", { input: 100_000, output: 10_000, cacheRead: 50_000 }), 0.2 + 0.06 + 0.025);
    close(requestCost("xai", "grok-4.7", { input: 250_000, output: 0 }), 1);
  });

  it("logs every turn's cost and warns once when the monthly budget is used up", async () => {
    const { createConversation, saveSettings } = await import("./db.js");
    const { sendMessage } = await import("./agent/chat.js");
    const { spendingReport } = await import("./spending.js");
    const { onAppEvent } = await import("./events.js");
    const before = spendingReport();
    const alerts: string[] = [];
    const off = onAppEvent((e) => {
      if (e.type === "notification") alerts.push(e.title);
    });
    saveSettings({ monthlyBudget: before.thisMonth + 0.000001 });
    try {
      const conversation = createConversation();
      await untilDone(sendMessage({ conversationId: conversation.id, text: "How much is this?", model: "claude-sonnet-5-5" }));
      await untilDone(sendMessage({ conversationId: conversation.id, text: "And this?", model: "claude-sonnet-5-5" }));
    } finally {
      off();
      saveSettings({ monthlyBudget: 0 });
    }
    const after = spendingReport();
    assert.ok(after.thisMonth > before.thisMonth);
    assert.ok(after.today >= after.thisMonth - before.thisMonth - 1e-12);
    const sonnet = after.byModel.find((m) => m.model === "claude-sonnet-5-5");
    assert.ok(sonnet && sonnet.turns >= 2 && sonnet.costUsd > 0);
    assert.equal(after.days.length, 30);
    assert.deepEqual(alerts.filter((a) => a === "Monthly budget reached"), ["Monthly budget reached"], "one alert, not one per turn");
  });
});

describe("Arabic", () => {
  it("has an Arabic translation for every string in the interface", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const { AR } = await import("../web/i18n-ar.js");
    const webDir = path.resolve(import.meta.dirname, "../web");
    const missing: string[] = [];
    for (const file of fs.readdirSync(webDir).filter((f) => f.endsWith(".ts"))) {
      const code = fs.readFileSync(path.join(webDir, file), "utf8").replace(/^\s*\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
      for (const m of code.matchAll(/(?<![\w.])t\(\s*"((?:[^"\\]|\\.)*)"/g)) {
        const key = m[1].replace(/\\"/g, '"');
        if (!(key in AR)) missing.push(`${file}: ${key}`);
      }
    }
    assert.deepEqual(missing, []);
    assert.ok(Object.keys(AR).length > 200);
  });

  it("labels the agent's activity and sets its reply language from Settings", async () => {
    const { saveSettings, getSettings } = await import("./db.js");
    const { BASE_TOOLS } = await import("./agent/tools.js");
    const { systemPrompt } = await import("./agent/prompt.js");
    const remember = BASE_TOOLS.memory[0];
    saveSettings({ language: "ar" });
    try {
      assert.equal(remember.label({}), "حُفظ في الذاكرة");
      assert.match(systemPrompt(getSettings()), /Reply in Arabic/);
    } finally {
      saveSettings({ language: "en" });
    }
    assert.equal(remember.label({}), "Saved to memory");
    assert.match(systemPrompt(getSettings()), /reply in the language the user writes in/);
  });
});

describe("HTTP API", () => {
  it("requires the password and blocks cross-site writes", async () => {
    const { createApp } = await import("./server.js");
    const srv = createApp().listen(0);
    const base = `http://127.0.0.1:${(srv.address() as AddressInfo).port}`;
    try {
      assert.equal((await fetch(`${base}/api/conversations`)).status, 401);
      const noHeader = await fetch(`${base}/api/login`, { method: "POST", headers: { "content-type": "application/json" }, body: '{"password":"correct horse"}' });
      assert.equal(noHeader.status, 403);
      const headers = { "content-type": "application/json", "x-requested-with": "agent" };
      const wrong = await fetch(`${base}/api/login`, { method: "POST", headers, body: '{"password":"nope"}' });
      assert.equal(wrong.status, 401);
      const ok = await fetch(`${base}/api/login`, { method: "POST", headers, body: '{"password":"correct horse"}' });
      assert.equal(ok.status, 200);
      const cookie = ok.headers.get("set-cookie")!.split(";")[0];
      const list = await fetch(`${base}/api/conversations`, { headers: { cookie } });
      assert.equal(list.status, 200);
      const boot = (await (await fetch(`${base}/api/bootstrap`, { headers: { cookie } })).json()) as { models: { id: string }[] };
      assert.ok(boot.models.some((m) => m.id === "claude-opus-5-5"));
      assert.ok(boot.models.some((m) => m.id === "grok-4.7"));
      const page = await fetch(`${base}/`);
      assert.match(page.headers.get("content-security-policy")!, /default-src 'self'/);

      // Locking forgets the key: the session still exists, but data stays sealed until the password is entered.
      const headersWithCookie = { ...headers, cookie };
      assert.equal((await fetch(`${base}/api/lock`, { method: "POST", headers: headersWithCookie, body: "{}" })).status, 200);
      assert.equal((await fetch(`${base}/api/conversations`, { headers: { cookie } })).status, 423);
      const session = (await (await fetch(`${base}/api/session`, { headers: { cookie } })).json()) as { locked: boolean };
      assert.equal(session.locked, true);
      const again = await fetch(`${base}/api/login`, { method: "POST", headers, body: '{"password":"correct horse"}' });
      assert.equal(again.status, 200);
      assert.equal((await fetch(`${base}/api/conversations`, { headers: { cookie } })).status, 200);
    } finally {
      srv.close();
    }
  });
});
