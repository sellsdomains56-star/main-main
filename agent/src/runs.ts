import type { AgentEvent } from "./types.js";

type Listener = (event: AgentEvent) => void;

/**
 * A turn that is running. It keeps going if the browser disconnects (your
 * phone locks, you switch tabs); reopening the chat replays what happened so
 * far and continues live.
 */
export class ActiveRun {
  readonly events: AgentEvent[] = [];
  readonly controller = new AbortController();
  private listeners = new Set<Listener>();
  private closers = new Set<() => void>();
  finished = false;

  constructor(readonly conversationId: string) {}

  push = (event: AgentEvent) => {
    this.events.push(event);
    for (const l of this.listeners) l(event);
  };

  /** Replays everything so far, then follows live. `onClose` runs when the run ends. */
  subscribe(listener: Listener, onClose?: () => void): () => void {
    for (const e of this.events) listener(e);
    if (this.finished) {
      onClose?.();
      return () => {};
    }
    this.listeners.add(listener);
    if (onClose) this.closers.add(onClose);
    return () => {
      this.listeners.delete(listener);
      if (onClose) this.closers.delete(onClose);
    };
  }

  finish() {
    this.finished = true;
    this.listeners.clear();
    for (const close of this.closers) close();
    this.closers.clear();
  }
}

const runs = new Map<string, ActiveRun>();

export function getRun(conversationId: string): ActiveRun | undefined {
  return runs.get(conversationId);
}

export function isRunning(conversationId: string): boolean {
  return runs.has(conversationId);
}

export function startRun(conversationId: string, work: (run: ActiveRun) => Promise<void>): ActiveRun {
  if (runs.has(conversationId)) throw new Error("This conversation is already working on a reply.");
  const run = new ActiveRun(conversationId);
  runs.set(conversationId, run);
  void work(run)
    .catch((err) => {
      console.error("[dizz] run crashed:", err);
      run.push({ type: "error", error: err instanceof Error ? err.message : String(err) });
    })
    .finally(() => {
      runs.delete(conversationId);
      run.finish();
    });
  return run;
}

export function stopRun(conversationId: string): boolean {
  const run = runs.get(conversationId);
  if (!run) return false;
  run.controller.abort();
  return true;
}

export function runningConversations(): string[] {
  return [...runs.keys()];
}
