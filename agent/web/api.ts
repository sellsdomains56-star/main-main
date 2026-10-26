import type { AgentEvent } from "../src/types.js";
import { t } from "./i18n.js";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

let onUnauthorized: () => void = () => {};

/** Where a stored file is shown or downloaded from (the browser-only demo serves them from memory). */
let fileUrlResolver = (id: string, download: boolean) => `/api/files/${encodeURIComponent(id)}${download ? "?download=1" : ""}`;
export const fileUrl = (id: string, download = false) => fileUrlResolver(id, download);
export function setFileUrlResolver(fn: typeof fileUrlResolver) {
  fileUrlResolver = fn;
}

/** Fetches something from the API and saves it as a file. */
export async function downloadFrom(path: string, filename: string): Promise<void> {
  const res = await fetch(path, { headers: { "X-Requested-With": "agent" } });
  if (!res.ok) throw await failure(res);
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function failure(res: Response): Promise<ApiError> {
  let message = `${res.status} ${res.statusText}`;
  try {
    const body = await res.json();
    if (body?.error) message = t(body.error);
  } catch {
    // not JSON
  }
  if (res.status === 401 || res.status === 423) onUnauthorized();
  return new ApiError(res.status, message);
}

export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: { "X-Requested-With": "agent", ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    credentials: "same-origin",
  });
  if (!res.ok) throw await failure(res);
  return (await res.json()) as T;
}

export async function upload<T>(file: Blob, name: string, conversationId: string | null): Promise<T> {
  const qs = new URLSearchParams({ name });
  if (conversationId) qs.set("conversationId", conversationId);
  const res = await fetch(`/api/files?${qs}`, {
    method: "POST",
    headers: { "X-Requested-With": "agent", "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw await failure(res);
  return (await res.json()) as T;
}

/** Reads a server-sent event stream from a fetch (POST or GET) until it ends. */
export async function stream(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; signal?: AbortSignal },
  onEvent: (e: AgentEvent) => void,
): Promise<boolean> {
  const res = await fetch(path, {
    method: init.method ?? "POST",
    headers: { "X-Requested-With": "agent", "Content-Type": "application/json", Accept: "text/event-stream" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: init.signal,
  });
  if (res.status === 204) return false;
  if (!res.ok) throw await failure(res);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data: ")) onEvent(JSON.parse(line.slice(6)) as AgentEvent);
      }
    }
  }
  return true;
}
