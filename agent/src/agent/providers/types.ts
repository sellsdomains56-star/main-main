import type { Effort, Source, StoredMessage } from "../../types.js";
import type { AgentTool, ToolOutcome } from "../tools.js";

export interface ToolStart {
  id: string;
  name: string;
  input: unknown;
  /** Runs on the provider's servers (web search, X search, web fetch). */
  server?: boolean;
}

/** How a provider reports progress while it works. */
export interface RunHooks {
  onText(delta: string): void;
  onThinking(delta: string): void;
  onToolStart(tool: ToolStart): void;
  /** Update a running step once its input has finished streaming in. */
  onToolInput(id: string, input: unknown): void;
  onToolEnd(id: string, outcome: { ok: boolean; result?: string }): void;
  onSources(sources: Source[]): void;
  /** Runs one of our own tools (validated and executed by the caller). */
  executeTool(name: string, input: unknown, id: string): Promise<ToolOutcome>;
}

export interface RunInput {
  model: string;
  effort: Effort;
  system: string;
  /** The whole conversation, ending with the new user message. */
  history: StoredMessage[];
  tools: AgentTool[];
  /** Offer the provider's own web search (and X search on Grok). */
  serverTools: boolean;
  signal: AbortSignal;
  hooks: RunHooks;
}

export interface RunResult {
  /** The provider's own transcript of this turn, replayed unchanged on later turns. Null when the turn didn't finish cleanly. */
  native: unknown[] | null;
  usage: { inputTokens: number; outputTokens: number };
  /** Set when the model declined the request. */
  refusal?: string;
}

export interface ProviderAdapter {
  run(input: RunInput): Promise<RunResult>;
  /** A one-shot, tool-free completion (used for chat titles). */
  quick(model: string, prompt: string, signal?: AbortSignal): Promise<string>;
}

export class TurnError extends Error {}
