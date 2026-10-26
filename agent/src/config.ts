import path from "node:path";
import type { ModelInfo, Provider } from "./types.js";

export type { ModelInfo, Provider };

const env = process.env;

function list(value: string | undefined, fallback: string[]): string[] {
  const items = (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return items.length ? items : fallback;
}

function codeMode(value: string | undefined): "local" | "sandbox" | "off" {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "0" || v === "off" || v === "false") return "off";
  if (v === "sandbox") return "sandbox";
  return "local";
}

const KNOWN_MODELS: Record<string, Omit<ModelInfo, "id">> = {
  "claude-fable-5-1": { label: "Claude Fable 5.1", provider: "anthropic", blurb: "Most capable. Hardest problems and long tasks" },
  "claude-opus-5-5": { label: "Claude Opus 5.5", provider: "anthropic", blurb: "Smartest. Deep reasoning and agentic work" },
  "claude-sonnet-5-5": { label: "Claude Sonnet 5.5", provider: "anthropic", blurb: "Fast and highly capable" },
  "claude-haiku-5-5": { label: "Claude Haiku 5.5", provider: "anthropic", blurb: "Quickest answers" },
  "grok-4.7": { label: "Grok 4.7", provider: "xai", blurb: "Live web and X search" },
};

function describe(id: string, provider: Provider): ModelInfo {
  const known = KNOWN_MODELS[id];
  if (known && known.provider === provider) return { id, ...known };
  return { id, label: id, provider, blurb: provider === "xai" ? "xAI model" : "Anthropic model" };
}

export const config = {
  port: Number(env.PORT ?? 8787),
  dataDir: path.resolve(env.DATA_DIR ?? "./data"),
  publicUrl: (env.PUBLIC_URL ?? "").replace(/\/$/, ""),
  trustProxy: env.TRUST_PROXY === "1",
  agentName: env.AGENT_NAME?.trim() || "Dizz Lab",
  timezone: env.TIMEZONE?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone,
  password: env.AGENT_PASSWORD ?? "",
  sessionSecret: env.SESSION_SECRET ?? "",
  anthropicKey: env.ANTHROPIC_API_KEY ?? "",
  xaiKey: env.XAI_API_KEY ?? "",
  xaiBaseUrl: env.XAI_BASE_URL ?? "https://api.x.ai/v1",
  xaiImageModel: env.XAI_IMAGE_MODEL?.trim() || "grok-imagine-image-2.0",
  /** Your Google Cloud OAuth client, for the Gmail, Calendar and Drive connectors (can also be entered in the app). */
  googleClientId: env.GOOGLE_CLIENT_ID?.trim() ?? "",
  googleClientSecret: env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
  /** Tests point Google's hosts at a local stand-in. */
  googleApiOrigin: env.GOOGLE_API_ORIGIN?.trim() ?? "",
  ntfyUrl: env.NTFY_URL?.trim() ?? "",
  /** Put the reminder text in phone pushes (it then passes through the ntfy server). */
  ntfyShowContent: env.NTFY_SHOW_CONTENT === "1",
  /**
   * Where the agent runs code: "local" (on this machine, in the workspace folder), "sandbox" (Claude runs it
   * in Anthropic's isolated container: use this on a server) or "off".
   */
  codeExecution: codeMode(env.CODE_EXECUTION),
  /** How many agents of a swarm work at the same time (keeps you under rate limits). */
  swarmConcurrency: Math.max(1, Number(env.SWARM_CONCURRENCY ?? 8)),
  /** The most tasks one delegate_tasks call may hand out. */
  swarmMaxTasks: Math.max(1, Number(env.SWARM_MAX_TASKS ?? 1000)),
  /** A scripted provider for tests and for trying the UI without API keys. */
  mock: env.AGENT_MOCK === "1",
  anthropicModels: list(env.ANTHROPIC_MODELS, ["claude-fable-5-1", "claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"]),
  xaiModels: list(env.XAI_MODELS, ["grok-4.7"]),
};

// Dates on the server (reminder repeats, "today") follow your time zone.
process.env.TZ = config.timezone;

export function availableModels(): ModelInfo[] {
  const models: ModelInfo[] = [];
  if (config.anthropicKey) models.push(...config.anthropicModels.map((id) => describe(id, "anthropic")));
  if (config.xaiKey) models.push(...config.xaiModels.map((id) => describe(id, "xai")));
  if (config.mock || models.length === 0) {
    models.push({ id: "mock", label: "Demo mode", provider: "mock", blurb: "No API key set: scripted replies" });
  }
  return models;
}

export function findModel(id: string | undefined): ModelInfo {
  const models = availableModels();
  return models.find((m) => m.id === id) ?? models[0];
}
