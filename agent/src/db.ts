import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";
import type {
  AgentProfile,
  Conversation,
  FileRecord,
  Memory,
  MessageData,
  Reminder,
  Repeat,
  Settings,
  StoredMessage,
} from "./types.js";
import { decryptBytes, decryptText as dec, encryptBytes, encryptText as enc, onLock } from "./vault.js";

/**
 * Storage. Ids, timestamps and flags are plain so the app can sort and schedule;
 * everything you or the agents wrote is encrypted (see vault.ts). Searching
 * therefore happens in memory, after decrypting.
 */

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(9).toString("base64url")}`;
}

fs.mkdirSync(config.dataDir, { recursive: true });
const db = new DatabaseSync(process.env.NODE_ENV === "test" ? ":memory:" : path.join(config.dataDir, "dizzlab.db"));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, agent_id TEXT, pinned INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, text TEXT NOT NULL, data TEXT NOT NULL, created_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS messages_by_conversation ON messages(conversation_id, created_at);
  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY, text TEXT NOT NULL, category TEXT NOT NULL, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY, message TEXT NOT NULL, task TEXT, next_run INTEGER NOT NULL, repeat TEXT NOT NULL,
    conversation_id TEXT, active INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, last_run INTEGER);
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, origin TEXT NOT NULL,
    conversation_id TEXT, path TEXT NOT NULL, created_at INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0);
  CREATE INDEX IF NOT EXISTS files_by_path ON files(path);
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, data TEXT NOT NULL, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY, data TEXT NOT NULL, model TEXT, effort TEXT, tools TEXT,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS memory_vectors (
    memory_id TEXT PRIMARY KEY, model TEXT NOT NULL, vector BLOB NOT NULL);
  CREATE TABLE IF NOT EXISTS usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, provider TEXT NOT NULL, model TEXT NOT NULL,
    agent_id TEXT, conversation_id TEXT, kind TEXT NOT NULL, input_tokens INTEGER NOT NULL, output_tokens INTEGER NOT NULL,
    cache_read_tokens INTEGER NOT NULL DEFAULT 0, web_searches INTEGER NOT NULL DEFAULT 0, cost_usd REAL NOT NULL);
  CREATE INDEX IF NOT EXISTS usage_by_time ON usage_log(ts);
`);

type Row = Record<string, unknown>;

// ── Conversations ─────────────────────────────────────────────────────────────

function toConversation(r: Row): Conversation {
  return {
    id: r.id as string,
    title: dec(r.title as string),
    agentId: (r.agent_id as string | null) ?? null,
    pinned: r.pinned === 1,
    createdAt: r.created_at as number,
    updatedAt: r.updated_at as number,
  };
}

export function createConversation(title = "", agentId: string | null = null): Conversation {
  const now = Date.now();
  const id = newId("c");
  db.prepare("INSERT INTO conversations (id, title, agent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(
    id,
    enc(title),
    agentId,
    now,
    now,
  );
  return { id, title, agentId, pinned: false, createdAt: now, updatedAt: now };
}

export function getConversation(id: string): Conversation | null {
  const r = db.prepare("SELECT * FROM conversations WHERE id = ?").get(id) as Row | undefined;
  return r ? toConversation(r) : null;
}

/** Pinned first, then newest; `query` matches titles and message text. */
export function listConversations(query = ""): Conversation[] {
  const all = (db.prepare("SELECT * FROM conversations ORDER BY pinned DESC, updated_at DESC").all() as Row[]).map(toConversation);
  const q = query.trim().toLowerCase();
  if (!q) return all.slice(0, 500);
  const inMessages = new Set<string>();
  for (const r of db.prepare("SELECT conversation_id, text FROM messages").all() as Row[]) {
    if (!inMessages.has(r.conversation_id as string) && dec(r.text as string).toLowerCase().includes(q)) {
      inMessages.add(r.conversation_id as string);
    }
  }
  return all.filter((c) => c.title.toLowerCase().includes(q) || inMessages.has(c.id)).slice(0, 200);
}

export function updateConversation(id: string, patch: { title?: string; pinned?: boolean }): void {
  if (patch.title !== undefined) db.prepare("UPDATE conversations SET title = ? WHERE id = ?").run(enc(patch.title), id);
  if (patch.pinned !== undefined) db.prepare("UPDATE conversations SET pinned = ? WHERE id = ?").run(patch.pinned ? 1 : 0, id);
}

export function touchConversation(id: string): void {
  db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").run(Date.now(), id);
}

export function deleteConversation(id: string): void {
  db.prepare("DELETE FROM conversations WHERE id = ?").run(id);
}

// ── Messages ──────────────────────────────────────────────────────────────────

function toMessage(r: Row): StoredMessage {
  const data = JSON.parse(dec(r.data as string)) as MessageData;
  return {
    ...data,
    id: r.id as string,
    conversationId: r.conversation_id as string,
    role: r.role as StoredMessage["role"],
    createdAt: r.created_at as number,
  };
}

export function addMessage(conversationId: string, role: StoredMessage["role"], data: MessageData, id = newId("m")): StoredMessage {
  const createdAt = Date.now();
  db.prepare("INSERT INTO messages (id, conversation_id, role, text, data, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    id,
    conversationId,
    role,
    enc(data.text),
    enc(JSON.stringify(data)),
    createdAt,
  );
  touchConversation(conversationId);
  return { ...data, id, conversationId, role, createdAt };
}

export function listMessages(conversationId: string): StoredMessage[] {
  const rows = db.prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at, rowid").all(conversationId);
  return (rows as Row[]).map(toMessage);
}

export function deleteMessage(id: string): void {
  db.prepare("DELETE FROM messages WHERE id = ?").run(id);
}

/** Past messages containing `query`, newest first, for the agent's search_past_conversations tool. */
export function searchMessages(query: string, limit = 12): { conversationId: string; title: string; role: string; text: string; createdAt: number }[] {
  const q = query.toLowerCase();
  const titles = new Map<string, string>();
  const hits: { conversationId: string; title: string; role: string; text: string; createdAt: number }[] = [];
  const rows = db.prepare("SELECT id, conversation_id, role, text, created_at FROM messages ORDER BY created_at DESC").all() as Row[];
  for (const r of rows) {
    const text = dec(r.text as string);
    if (!text.toLowerCase().includes(q)) continue;
    const conversationId = r.conversation_id as string;
    if (!titles.has(conversationId)) titles.set(conversationId, getConversation(conversationId)?.title ?? "");
    hits.push({ conversationId, title: titles.get(conversationId)!, role: r.role as string, text, createdAt: r.created_at as number });
    if (hits.length >= limit) break;
  }
  return hits;
}

// ── Memories ──────────────────────────────────────────────────────────────────

function toMemory(r: Row): Memory {
  return { id: r.id as string, text: dec(r.text as string), category: r.category as string, createdAt: r.created_at as number };
}

export function listMemories(): Memory[] {
  return (db.prepare("SELECT * FROM memories ORDER BY created_at").all() as Row[]).map(toMemory);
}

export function addMemory(text: string, category: string): Memory {
  const memory = { id: newId("mem"), text, category, createdAt: Date.now() };
  db.prepare("INSERT INTO memories (id, text, category, created_at) VALUES (?, ?, ?, ?)").run(memory.id, enc(text), category, memory.createdAt);
  return memory;
}

export function deleteMemory(id: string): boolean {
  db.prepare("DELETE FROM memory_vectors WHERE memory_id = ?").run(id);
  return db.prepare("DELETE FROM memories WHERE id = ?").run(id).changes > 0;
}

/** Meaning-vectors of memories for semantic search, encrypted like the memories themselves. */
export function memoryVectors(model: string): Map<string, Float32Array> {
  const out = new Map<string, Float32Array>();
  for (const r of db.prepare("SELECT memory_id, vector FROM memory_vectors WHERE model = ?").all(model) as Row[]) {
    const plain = decryptBytes(Buffer.from(r.vector as Uint8Array));
    out.set(r.memory_id as string, new Float32Array(plain.buffer, plain.byteOffset, plain.byteLength / 4));
  }
  return out;
}

export function saveMemoryVector(memoryId: string, model: string, vector: Float32Array): void {
  const sealed = encryptBytes(Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength));
  db.prepare("INSERT INTO memory_vectors (memory_id, model, vector) VALUES (?, ?, ?) ON CONFLICT(memory_id) DO UPDATE SET model = excluded.model, vector = excluded.vector").run(
    memoryId,
    model,
    sealed,
  );
}

// ── Reminders ─────────────────────────────────────────────────────────────────

function toReminder(r: Row): Reminder {
  return {
    id: r.id as string,
    message: dec(r.message as string),
    task: r.task ? dec(r.task as string) : null,
    nextRun: r.next_run as number,
    repeat: r.repeat as Repeat,
    conversationId: (r.conversation_id as string | null) ?? null,
    active: r.active === 1,
    createdAt: r.created_at as number,
    lastRun: (r.last_run as number | null) ?? null,
  };
}

export function addReminder(input: Pick<Reminder, "message" | "task" | "nextRun" | "repeat" | "conversationId">): Reminder {
  const reminder: Reminder = { ...input, id: newId("r"), active: true, createdAt: Date.now(), lastRun: null };
  db.prepare(
    "INSERT INTO reminders (id, message, task, next_run, repeat, conversation_id, active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
  ).run(
    reminder.id,
    enc(reminder.message),
    reminder.task ? enc(reminder.task) : null,
    reminder.nextRun,
    reminder.repeat,
    reminder.conversationId,
    reminder.createdAt,
  );
  return reminder;
}

export function listReminders(): Reminder[] {
  return (db.prepare("SELECT * FROM reminders WHERE active = 1 ORDER BY next_run").all() as Row[]).map(toReminder);
}

export function getReminder(id: string): Reminder | null {
  const r = db.prepare("SELECT * FROM reminders WHERE id = ?").get(id) as Row | undefined;
  return r ? toReminder(r) : null;
}

export function dueReminders(now: number): Reminder[] {
  return (db.prepare("SELECT * FROM reminders WHERE active = 1 AND next_run <= ? ORDER BY next_run").all(now) as Row[]).map(toReminder);
}

export function rescheduleReminder(id: string, nextRun: number | null, lastRun: number): void {
  if (nextRun === null) db.prepare("UPDATE reminders SET active = 0, last_run = ? WHERE id = ?").run(lastRun, id);
  else db.prepare("UPDATE reminders SET next_run = ?, last_run = ? WHERE id = ?").run(nextRun, lastRun, id);
}

export function cancelReminder(id: string): boolean {
  return db.prepare("UPDATE reminders SET active = 0 WHERE id = ? AND active = 1").run(id).changes > 0;
}

// ── Files ─────────────────────────────────────────────────────────────────────

function toFile(r: Row): FileRecord {
  return {
    id: r.id as string,
    name: dec(r.name as string),
    mime: r.mime as string,
    size: r.size as number,
    origin: r.origin as FileRecord["origin"],
    conversationId: (r.conversation_id as string | null) ?? null,
    createdAt: r.created_at as number,
  };
}

export function addFile(file: Omit<FileRecord, "id" | "createdAt">, storedPath: string): FileRecord {
  const record: FileRecord = { ...file, id: newId("f"), createdAt: Date.now() };
  db.prepare(
    "INSERT INTO files (id, name, mime, size, origin, conversation_id, path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(record.id, enc(record.name), record.mime, record.size, record.origin, record.conversationId, storedPath, record.createdAt);
  return record;
}

export function getFile(id: string, includeDeleted = false): (FileRecord & { path: string }) | null {
  const r = db.prepare(`SELECT * FROM files WHERE id = ?${includeDeleted ? "" : " AND deleted = 0"}`).get(id) as Row | undefined;
  return r ? { ...toFile(r), path: r.path as string } : null;
}

export function listFiles(): FileRecord[] {
  return (db.prepare("SELECT * FROM files WHERE deleted = 0 ORDER BY created_at DESC LIMIT 500").all() as Row[]).map(toFile);
}

export function markFileDeleted(id: string): void {
  db.prepare("UPDATE files SET deleted = 1 WHERE id = ?").run(id);
}

/** The newest live record for a workspace path, so re-written files keep one entry. */
export function findFileByPath(storedPath: string): FileRecord | null {
  const r = db.prepare("SELECT * FROM files WHERE path = ? AND deleted = 0 ORDER BY created_at DESC").get(storedPath) as Row | undefined;
  return r ? toFile(r) : null;
}

export function updateFileSize(id: string, size: number, mime: string): void {
  db.prepare("UPDATE files SET size = ?, mime = ? WHERE id = ?").run(size, mime, id);
}

// ── Settings ──────────────────────────────────────────────────────────────────

/** Plain key/value pairs the app needs before it's unlocked (session secret and version). */
export function getKV(key: string): string | null {
  const r = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as Row | undefined;
  return r ? (r.value as string) : null;
}

export function setKV(key: string, value: string): void {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

/** Encrypted key/value pairs (e.g. your Google OAuth client). */
export function getSecretKV(key: string): string | null {
  const raw = getKV(key);
  return raw === null ? null : dec(raw);
}

export function setSecretKV(key: string, value: string | null): void {
  if (value === null) db.prepare("DELETE FROM settings WHERE key = ?").run(key);
  else setKV(key, enc(value));
}

const DEFAULT_SETTINGS: Settings = {
  language: "",
  userName: "",
  defaultModel: "",
  effort: "auto",
  personality: "default",
  customInstructions: "",
  monthlyBudget: 0,
};

let settingsCache: Settings | null = null;
onLock(() => (settingsCache = null));

export function getSettings(): Settings {
  if (settingsCache) return { ...settingsCache };
  const raw = getKV("settings");
  settingsCache = { ...DEFAULT_SETTINGS, ...(raw ? (JSON.parse(dec(raw)) as Partial<Settings>) : {}) };
  return { ...settingsCache };
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...patch };
  setKV("settings", enc(JSON.stringify(next)));
  settingsCache = next;
  return { ...next };
}

// ── Custom agents ─────────────────────────────────────────────────────────────
// Kept decrypted in memory once loaded, so thousands of agents stay quick to search.

type AgentSecret = Pick<AgentProfile, "name" | "emoji" | "description" | "instructions">;
let agentCache: Map<string, AgentProfile> | null = null;
onLock(() => (agentCache = null));

function toAgent(r: Row): AgentProfile {
  const secret = JSON.parse(dec(r.data as string)) as AgentSecret;
  return {
    id: r.id as string,
    ...secret,
    model: (r.model as string | null) ?? null,
    effort: (r.effort as AgentProfile["effort"]) ?? null,
    tools: r.tools ? (JSON.parse(r.tools as string) as AgentProfile["tools"]) : null,
    createdAt: r.created_at as number,
    updatedAt: r.updated_at as number,
  };
}

function agents(): Map<string, AgentProfile> {
  agentCache ??= new Map((db.prepare("SELECT * FROM agents").all() as Row[]).map((r) => [r.id as string, toAgent(r)]));
  return agentCache;
}

export type AgentInput = Pick<AgentProfile, "name" | "emoji" | "description" | "instructions" | "model" | "effort" | "tools">;

function writeAgent(agent: AgentProfile, insert: boolean): void {
  const secret: AgentSecret = { name: agent.name, emoji: agent.emoji, description: agent.description, instructions: agent.instructions };
  const tools = agent.tools ? JSON.stringify(agent.tools) : null;
  if (insert) {
    db.prepare("INSERT INTO agents (id, data, model, effort, tools, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      agent.id,
      enc(JSON.stringify(secret)),
      agent.model,
      agent.effort,
      tools,
      agent.createdAt,
      agent.updatedAt,
    );
  } else {
    db.prepare("UPDATE agents SET data = ?, model = ?, effort = ?, tools = ?, updated_at = ? WHERE id = ?").run(
      enc(JSON.stringify(secret)),
      agent.model,
      agent.effort,
      tools,
      agent.updatedAt,
      agent.id,
    );
  }
  agents().set(agent.id, agent);
}

export function createAgent(input: AgentInput): AgentProfile {
  const now = Date.now();
  const agent: AgentProfile = { ...input, id: newId("a"), createdAt: now, updatedAt: now };
  writeAgent(agent, true);
  return agent;
}

export function updateAgent(id: string, patch: Partial<AgentInput>): AgentProfile | null {
  const current = getAgent(id);
  if (!current) return null;
  const next = { ...current, ...patch, updatedAt: Date.now() };
  writeAgent(next, false);
  return next;
}

export function getAgent(id: string): AgentProfile | null {
  return agents().get(id) ?? null;
}

/** By id, or by exact name (case-insensitive). */
export function findAgent(idOrName: string): AgentProfile | null {
  const byId = agents().get(idOrName);
  if (byId) return byId;
  const name = idOrName.trim().toLowerCase();
  for (const a of agents().values()) if (a.name.toLowerCase() === name) return a;
  return null;
}

export function listAgents(query = "", limit = 1000, offset = 0): AgentProfile[] {
  const q = query.trim().toLowerCase();
  return [...agents().values()]
    .filter((a) => !q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }))
    .slice(offset, offset + limit);
}

export function countAgents(): number {
  return agents().size;
}

export function deleteAgent(id: string): boolean {
  db.prepare("UPDATE conversations SET agent_id = NULL WHERE agent_id = ?").run(id);
  const deleted = db.prepare("DELETE FROM agents WHERE id = ?").run(id).changes > 0;
  agents().delete(id);
  return deleted;
}

// ── Connectors (whole record encrypted; see connectors/store.ts) ───────────────

export function listConnectorRows(): string[] {
  return (db.prepare("SELECT data FROM connectors ORDER BY created_at").all() as Row[]).map((r) => dec(r.data as string));
}

export function addConnectorRow(id: string, json: string, createdAt: number): void {
  db.prepare("INSERT INTO connectors (id, data, created_at) VALUES (?, ?, ?)").run(id, enc(json), createdAt);
}

export function updateConnectorRow(id: string, json: string): void {
  db.prepare("UPDATE connectors SET data = ? WHERE id = ?").run(enc(json), id);
}

export function deleteConnectorRow(id: string): boolean {
  return db.prepare("DELETE FROM connectors WHERE id = ?").run(id).changes > 0;
}

/** The stored (encrypted) form of a row, for tests that check nothing readable reaches the disk. */
export function rawRow(table: "conversations" | "messages" | "memories" | "agents" | "connectors", id: string): Row | undefined {
  return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as Row | undefined;
}

// ── Spending log ──────────────────────────────────────────────────────────────
// Token counts and estimated cost per agent turn. Only numbers, model names and ids:
// nothing you said, so it isn't encrypted (and can be summed in SQL).

export interface UsageRow {
  ts: number;
  provider: string;
  model: string;
  agentId: string | null;
  conversationId: string | null;
  kind: "chat" | "swarm" | "scheduled";
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  webSearches: number;
  costUsd: number;
}

export function addUsageRow(r: UsageRow): void {
  db.prepare(
    "INSERT INTO usage_log (ts, provider, model, agent_id, conversation_id, kind, input_tokens, output_tokens, cache_read_tokens, web_searches, cost_usd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(r.ts, r.provider, r.model, r.agentId, r.conversationId, r.kind, r.inputTokens, r.outputTokens, r.cacheReadTokens, r.webSearches, r.costUsd);
}

export function usageRowsSince(since: number): UsageRow[] {
  return (db.prepare("SELECT * FROM usage_log WHERE ts >= ? ORDER BY ts").all(since) as Row[]).map((r) => ({
    ts: r.ts as number,
    provider: r.provider as string,
    model: r.model as string,
    agentId: (r.agent_id as string | null) ?? null,
    conversationId: (r.conversation_id as string | null) ?? null,
    kind: r.kind as UsageRow["kind"],
    inputTokens: r.input_tokens as number,
    outputTokens: r.output_tokens as number,
    cacheReadTokens: r.cache_read_tokens as number,
    webSearches: r.web_searches as number,
    costUsd: r.cost_usd as number,
  }));
}

export function usageTotal(): { costUsd: number; since: number | null } {
  const r = db.prepare("SELECT COALESCE(SUM(cost_usd), 0) AS cost, MIN(ts) AS since FROM usage_log").get() as Row;
  return { costUsd: r.cost as number, since: (r.since as number | null) ?? null };
}
