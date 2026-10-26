import type { AgentEvent, AgentProfile } from "../src/types.js";

/**
 * Plumbing for builds that answer the app's /api calls inside the page
 * instead of from a server: the demo (scripted replies) and the cloud page
 * (real Claude through the viewer's claude.ai account).
 */

export type Json = Record<string, unknown>;
export type Handler = (method: string, path: string, query: URLSearchParams, body: Json, raw: BodyInit | null | undefined, signal?: AbortSignal | null) => Promise<Response>;

const encoder = new TextEncoder();
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let counter = 0;
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
export const fail = (status: number, error: string) => json({ error }, status);

// ── Live events (the real app uses an EventSource) ───────────────────────────

const sources = new Set<FakeEventSource>();
class FakeEventSource {
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 1;
  constructor(public url: string) {
    sources.add(this);
    setTimeout(() => this.onmessage?.({ data: JSON.stringify({ type: "hello" }) }));
  }
  addEventListener() {}
  close() {
    sources.delete(this);
  }
}
export function broadcast(event: Json) {
  for (const s of sources) s.onmessage?.({ data: JSON.stringify(event) });
}

// ── Agent runs, streamed like the server's SSE ───────────────────────────────

export class Run {
  events: AgentEvent[] = [];
  private listeners = new Set<(e: AgentEvent) => void>();
  private closers = new Set<() => void>();
  done = false;
  stopped = false;
  readonly controller = new AbortController();
  push = (e: AgentEvent) => {
    this.events.push(e);
    for (const l of this.listeners) l(e);
  };
  subscribe(listener: (e: AgentEvent) => void, onClose: () => void) {
    for (const e of this.events) listener(e);
    if (this.done) return onClose();
    this.listeners.add(listener);
    this.closers.add(onClose);
  }
  stop() {
    this.stopped = true;
    this.controller.abort();
  }
  finish() {
    this.done = true;
    for (const c of this.closers) c();
    this.listeners.clear();
    this.closers.clear();
  }
}

export function sse(run: Run, signal?: AbortSignal | null): Response {
  let closed = false;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      run.subscribe(
        (e) => {
          if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
        },
        () => {
          if (!closed) {
            closed = true;
            controller.close();
          }
        },
      );
      signal?.addEventListener("abort", () => {
        if (closed) return;
        closed = true;
        controller.error(new DOMException("Aborted", "AbortError"));
      });
    },
  });
  return new Response(body, { headers: { "content-type": "text/event-stream" } });
}

// ── Shared record helpers ────────────────────────────────────────────────────

export function agentFrom(body: Json, current?: AgentProfile): AgentProfile {
  const now = Date.now();
  return {
    id: current?.id ?? newId("a"),
    name: String(body.name ?? current?.name ?? "").trim(),
    emoji: String(body.emoji ?? current?.emoji ?? "🤖") || "🤖",
    description: String(body.description ?? current?.description ?? ""),
    instructions: String(body.instructions ?? current?.instructions ?? ""),
    model: body.model === undefined ? (current?.model ?? null) : ((body.model as string | null) ?? null),
    effort: body.effort === undefined ? (current?.effort ?? null) : ((body.effort as AgentProfile["effort"]) ?? null),
    tools: body.tools === undefined ? (current?.tools ?? null) : ((body.tools as AgentProfile["tools"]) ?? null),
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  };
}

/** Routes the app's /api requests to `handler`; everything else goes to the network as usual. */
export function installBackend(handler: Handler, latencyMs = 0) {
  (window as unknown as { EventSource: unknown }).EventSource = FakeEventSource;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith("/api/")) return realFetch(input, init);
    const [path, qs] = url.split("?");
    const method = (init?.method ?? "GET").toUpperCase();
    let body: Json = {};
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body) as Json;
      } catch {
        body = {};
      }
    }
    if (latencyMs) await sleep(latencyMs);
    try {
      return await handler(method, path, new URLSearchParams(qs ?? ""), body, init?.body, init?.signal);
    } catch (err) {
      console.error("[dizz]", method, path, err);
      return fail(500, err instanceof Error ? err.message : String(err));
    }
  };
}
