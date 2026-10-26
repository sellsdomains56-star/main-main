export type Provider = "anthropic" | "xai" | "mock";

export interface ModelInfo {
  id: string;
  label: string;
  provider: Provider;
  /** One line shown under the name in the model menu. */
  blurb: string;
}

export const EFFORT_LEVELS = ["fast", "auto", "deep", "max"] as const;
/** How hard the model thinks: fast (barely), auto (as needed), deep (hard), max (as long as it takes). */
export type Effort = (typeof EFFORT_LEVELS)[number];

export interface FileRecord {
  id: string;
  name: string;
  mime: string;
  size: number;
  /** "upload" = sent by you, "generated" = made by the agent (code, images, write_file). */
  origin: "upload" | "generated";
  conversationId: string | null;
  createdAt: number;
}

export interface Source {
  url: string;
  title: string;
}

/** Something the agent prepared that waits for your click (e.g. an email it drafted). */
export interface EmailApproval {
  kind: "email";
  connectorId: string;
  draftId: string;
  to: string;
  subject: string;
  preview: string;
}

export type Step =
  | { kind: "thinking"; text: string; startedAt: number; endedAt?: number }
  | {
      kind: "tool";
      id: string;
      name: string;
      label: string;
      /** Shown when the step is expanded: the search query, the code that ran, ... */
      detail?: string;
      status: "running" | "ok" | "error";
      result?: string;
      server?: boolean;
      approval?: EmailApproval;
    };

export interface MessageData {
  text: string;
  /** user: files sent with the message */
  attachments?: FileRecord[];
  /** user: the time, memories and workspace listing as of this turn (frozen so history replays byte-identically) */
  context?: string;
  /** user: sent by the scheduler, not typed */
  scheduled?: boolean;
  /** assistant */
  steps?: Step[];
  files?: FileRecord[];
  sources?: Source[];
  provider?: Provider | "system";
  model?: string;
  /** assistant: the provider's own transcript of the turn (thinking, tool calls, results), replayed unchanged */
  native?: unknown[];
  status?: "complete" | "stopped" | "error";
  error?: string;
  usage?: { inputTokens: number; outputTokens: number };
  durationMs?: number;
}

export interface StoredMessage extends MessageData {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  /** The custom agent this chat is with; null for the main agent. */
  agentId: string | null;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Groups of abilities an agent can be given. */
export const TOOL_GROUPS = ["web", "memory", "reminders", "files", "code", "images", "connectors", "agents"] as const;
export type ToolGroup = (typeof TOOL_GROUPS)[number];

/** A custom agent: its own identity, instructions, model and abilities. You can have as many as you like. */
export interface AgentProfile {
  id: string;
  name: string;
  emoji: string;
  description: string;
  instructions: string;
  /** null = use your default model */
  model: string | null;
  effort: Effort | null;
  /** null = every ability */
  tools: ToolGroup[] | null;
  createdAt: number;
  updatedAt: number;
}

export interface Memory {
  id: string;
  text: string;
  category: string;
  createdAt: number;
}

export type Repeat = "none" | "hourly" | "daily" | "weekdays" | "weekly" | "monthly";

export interface Reminder {
  id: string;
  message: string;
  /** When set, the agent carries out this instruction at the time instead of just pinging. */
  task: string | null;
  nextRun: number;
  repeat: Repeat;
  conversationId: string | null;
  active: boolean;
  createdAt: number;
  lastRun: number | null;
}

export interface Settings {
  /** Interface language; the agent replies in it too (unless you write in another). "" = not chosen yet. */
  language: "" | "en" | "ar";
  userName: string;
  defaultModel: string;
  effort: Effort;
  personality: "default" | "fun" | "concise" | "professional";
  customInstructions: string;
}

/** What the server streams to the browser while the agent works. */
export type AgentEvent =
  | { type: "start"; messageId: string; model: string; provider: string }
  | { type: "text"; delta: string }
  | { type: "thinking"; delta: string }
  | { type: "step"; step: Step }
  | { type: "file"; file: FileRecord }
  | { type: "sources"; sources: Source[] }
  | { type: "done"; message: StoredMessage }
  | { type: "title"; title: string }
  | { type: "error"; error: string };
