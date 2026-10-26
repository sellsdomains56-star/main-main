import { config } from "./config.js";
import { listMemories, memoryVectors, saveMemoryVector } from "./db.js";
import type { Memory } from "./types.js";

/**
 * Memory that scales. With a few dozen facts every one goes into each message; past
 * that, each message gets the facts that matter for it (standing instructions and
 * facts about you always, then the best matches), and the agent can search the rest.
 * Search works by meaning when a Voyage AI key is set, by shared words otherwise.
 */

/** Up to this many memories, all of them go into every message. */
export const ALL_MEMORIES_UP_TO = 60;
const ALWAYS = new Set(["instruction", "about_me"]);

const STOP = new Set(
  (
    "a an and are as at be but by can do does for from had has have how i if in into is it its me my of on or our so than that the their them then there these they this to " +
    "us was we were what when where which who why will with would you your about please could should want need know tell get make " +
    "في من على إلى الى عن مع هذا هذه ذلك التي الذي هو هي أنا انا نحن أنت انت هل ما ماذا كيف لماذا متى أين اين كان كانت أن ان لا لم لن قد كل بعض او أو ثم"
  ).split(/\s+/),
);

/** Words worth matching on: lower-cased, Arabic diacritics and tatweel removed, stopwords dropped. */
export function keywords(text: string): string[] {
  return (text.toLowerCase().replace(/[ً-ٰٟـ]/g, "").match(/[\p{L}\p{N}]+/gu) ?? [])
    .map((w) => w.replace(/^ال(?=\p{L}{3,})/u, "")) // Arabic definite article
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function keywordScore(query: Set<string>, text: string): number {
  let score = 0;
  for (const w of keywords(text)) {
    if (query.has(w)) score += 2;
    else if (w.length >= 4) for (const q of query) if (q.length >= 4 && (w.startsWith(q) || q.startsWith(w))) score += 1;
  }
  return score;
}

/** The memories to put in front of the agent for one message. */
export function memoriesFor(query: string, all = listMemories()): { shown: Memory[]; hidden: number } {
  if (all.length <= ALL_MEMORIES_UP_TO) return { shown: all, hidden: 0 };
  const words = new Set(keywords(query));
  const always = all.filter((m) => ALWAYS.has(m.category)).slice(-25);
  const rest = all
    .filter((m) => !ALWAYS.has(m.category))
    .map((m, i, list) => ({ m, score: keywordScore(words, m.text) + i / list.length / 2 })) // newer breaks ties
    .sort((a, b) => b.score - a.score);
  const picked = new Set([...always, ...rest.slice(0, ALL_MEMORIES_UP_TO - always.length).map((r) => r.m)]);
  // Keep them in the order they were learned.
  const shown = all.filter((m) => picked.has(m));
  return { shown, hidden: all.length - shown.length };
}

// ── Meaning search (Voyage AI) ───────────────────────────────────────────────

async function embed(texts: string[], inputType: "query" | "document", signal?: AbortSignal): Promise<Float32Array[]> {
  const out: Float32Array[] = [];
  for (let i = 0; i < texts.length; i += 500) {
    const res = await fetch(`${config.voyageBaseUrl}/embeddings`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.voyageKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ input: texts.slice(i, i + 500), model: config.voyageModel, input_type: inputType, output_dimension: 512 }),
      signal: signal ?? AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`Voyage AI error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const body = (await res.json()) as { data: { embedding: number[]; index: number }[] };
    for (const d of [...body.data].sort((a, b) => a.index - b.index)) out.push(Float32Array.from(d.embedding));
  }
  return out;
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** Embeds memories that don't have a vector yet (new ones, or after switching models). */
async function ensureVectors(all: Memory[], signal?: AbortSignal): Promise<Map<string, Float32Array>> {
  const vectors = memoryVectors(config.voyageModel);
  const missing = all.filter((m) => !vectors.has(m.id));
  if (missing.length) {
    const made = await embed(
      missing.map((m) => m.text),
      "document",
      signal,
    );
    missing.forEach((m, i) => {
      saveMemoryVector(m.id, config.voyageModel, made[i]);
      vectors.set(m.id, made[i]);
    });
  }
  return vectors;
}

/** Finds the memories that best match a question: by meaning with Voyage AI, by shared words otherwise. */
export async function searchMemories(query: string, limit = 10, signal?: AbortSignal): Promise<{ memory: Memory; score: number }[]> {
  const all = listMemories();
  if (!all.length) return [];
  if (config.voyageKey) {
    try {
      const vectors = await ensureVectors(all, signal);
      const [q] = await embed([query], "query", signal);
      return all
        .map((memory) => ({ memory, score: vectors.has(memory.id) ? cosine(q, vectors.get(memory.id)!) : 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (err) {
      if (signal?.aborted) throw err;
      console.warn("[dizz] meaning search unavailable, matching words instead:", err instanceof Error ? err.message : err);
    }
  }
  const words = new Set(keywords(query));
  return all
    .map((memory) => ({ memory, score: keywordScore(words, memory.text) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Embeds a new memory in the background so meaning search is ready for it. */
export function indexMemory(memory: Memory): void {
  if (!config.voyageKey) return;
  embed([memory.text], "document")
    .then(([v]) => saveMemoryVector(memory.id, config.voyageModel, v))
    .catch((err) => console.warn("[dizz] couldn't index a memory:", err instanceof Error ? err.message : err));
}
