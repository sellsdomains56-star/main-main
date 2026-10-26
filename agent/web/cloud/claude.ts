/**
 * The claude.ai page runtime: when this page is open in Claude, `window.claude`
 * lends it the viewer's own Claude (sample), a private store (db) and who is
 * viewing (user). Each resolves null where the page can't use it.
 */

export interface SampleTool {
  name: string;
  description: string;
  inputSchema?: { type: "object"; properties?: Record<string, unknown>; required?: string[] };
  execute(input: Record<string, unknown>, context: { signal: AbortSignal }): unknown;
}
export interface SampleOptions {
  onText?: (u: { text: string; delta: string }) => void;
  signal?: AbortSignal;
  tools?: SampleTool[];
  images?: Blob[];
  modelTier?: "default" | "complex" | "quick";
  model?: string;
  effort?: "low" | "medium" | "high";
  cache?: boolean;
}
export type SampleTurn = { role: "user" | "assistant"; content: string };
export interface SampleError {
  code: string;
  message: string;
  text?: string;
}
export interface Sample {
  (input: string | SampleTurn[], options?: SampleOptions): Promise<{ text: string; truncated: boolean }>;
  limits(): Promise<{ maxPromptBytes: number; images?: { maxCount: number; maxInputBytes: number; mediaTypes: string[] }; tools?: { maxCount: number } }>;
}

export interface DocSnapshot {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
export interface DocRef {
  get(): Promise<DocSnapshot>;
  set(data: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
}
export interface Db {
  doc(path: string): DocRef;
}
export interface User {
  id(): Promise<string | null>;
}

interface Runtime {
  use(name: "sample"): Promise<Sample | null>;
  use(name: "db"): Promise<Db | null>;
  use(name: "user"): Promise<User | null>;
}

function runtime(): Runtime | null {
  const c = (window as unknown as { claude?: Runtime }).claude;
  return c && typeof c.use === "function" ? c : null;
}

export const capability = {
  sample: () => runtime()?.use("sample").catch(() => null) ?? Promise.resolve(null),
  db: () => runtime()?.use("db").catch(() => null) ?? Promise.resolve(null),
  user: () => runtime()?.use("user").catch(() => null) ?? Promise.resolve(null),
};
