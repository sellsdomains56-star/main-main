import type { AgentProfile, Conversation, Effort, FileRecord, ModelInfo, Settings, StoredMessage, ToolGroup } from "../src/types.js";

export type { AgentProfile, Conversation, Effort, FileRecord, ModelInfo, Settings, StoredMessage, ToolGroup };

export interface Bootstrap {
  agentName: string;
  timezone: string;
  models: ModelInfo[];
  settings: Settings;
  toolGroups: ToolGroup[];
  security: { encryptedAtRest: boolean; autoUnlock: boolean };
  features: {
    imageGeneration: boolean;
    codeExecution: boolean;
    phoneNotifications: boolean;
    /** The server can send Web Push notifications. */
    webPush?: boolean;
    voice?: { naturalVoice: boolean; phone: boolean; phoneWebhook: string | null };
    swarmConcurrency: number;
    swarmMaxTasks: number;
  };
  running: string[];
  /** Set by the browser-only demo build. */
  demo?: boolean;
  /** Set by the cloud page (Claude through the viewer's claude.ai account). */
  cloud?: boolean;
  /** Cloud page: false when nothing can be saved (the page isn't open in Claude, or you're signed out). */
  persistent?: boolean;
  /** Cloud page: false when Claude can't be reached from this view. */
  ai?: boolean;
}

export interface ConversationSummary extends Conversation {
  running: boolean;
  agent: { id: string; name: string; emoji: string } | null;
}

export interface OpenConversation {
  conversation: Conversation;
  agent: AgentProfile | null;
  messages: StoredMessage[];
  running: boolean;
}

export const state = {
  boot: null as unknown as Bootstrap,
  conversations: [] as ConversationSummary[],
  /** null while on a fresh, not-yet-sent chat */
  current: null as OpenConversation | null,
  /** the agent a fresh chat will be with */
  draftAgent: null as AgentProfile | null,
  model: "",
  effort: "auto" as Effort,
  search: "",
};

const LOCAL = "agent.prefs";
interface Prefs {
  model?: string;
  effort?: Effort;
  sidebarCollapsed?: boolean;
  theme?: "system" | "dark" | "light";
  readAloud?: boolean;
}

export function prefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem(LOCAL) ?? "{}") as Prefs;
  } catch {
    return {};
  }
}

export function savePrefs(patch: Partial<Prefs>): void {
  try {
    localStorage.setItem(LOCAL, JSON.stringify({ ...prefs(), ...patch }));
  } catch {
    // private mode
  }
}

export function modelInfo(id: string): ModelInfo | undefined {
  return state.boot.models.find((m) => m.id === id);
}

export const EFFORTS: { id: Effort; label: string; hint: string }[] = [
  { id: "fast", label: "Fast", hint: "Quick answers" },
  { id: "auto", label: "Auto", hint: "Thinks when it helps" },
  { id: "deep", label: "Deep", hint: "Thinks hard, takes longer" },
  { id: "max", label: "Max", hint: "Thinks as long as it needs. Slowest, smartest" },
];
