/**
 * What each request costs, from the providers' published prices (USD per million
 * tokens). These are estimates for the spending dashboard; your provider's bill is
 * the source of truth. Update them here when prices change.
 */

interface Price {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

const ANTHROPIC: Record<string, { base: Price; long?: { above: number; price: Price } }> = {
  "claude-fable-5-1": { base: { input: 10, output: 50, cacheRead: 0.25, cacheWrite: 12.5 } },
  "claude-opus-5-5": { base: { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 } },
  "claude-opus-5": { base: { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 } },
  "claude-sonnet-5-5": { base: { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 } },
  "claude-haiku-5-5": {
    base: { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
    long: { above: 100_000, price: { input: 0.5, output: 2.5, cacheRead: 0.05, cacheWrite: 0.625 } },
  },
};

const XAI: Record<string, { base: Price; long?: { above: number; price: Price } }> = {
  "grok-4.7": {
    base: { input: 2, output: 6, cacheRead: 0.5, cacheWrite: 2 },
    long: { above: 200_000, price: { input: 4, output: 12, cacheRead: 1, cacheWrite: 4 } },
  },
};

/** Per call of a provider's own tools. */
const TOOL_CALL = { anthropic: { webSearch: 0.01 }, xai: { webSearch: 0.005 } };

export interface RequestUsage {
  /** Uncached prompt tokens. */
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
  webSearches?: number;
}

function lookup(table: typeof ANTHROPIC, model: string) {
  if (table[model]) return table[model];
  // Unknown ids (dated snapshots, new releases): match by family name.
  const family = Object.keys(table).find((k) => model.startsWith(k) || k.startsWith(model.replace(/-\d{8}$/, "")));
  return family ? table[family] : null;
}

/** The estimated cost in USD of one request. Unknown models count as the family's most expensive sibling would. */
export function requestCost(provider: string, model: string, u: RequestUsage): number {
  const table = provider === "xai" ? XAI : ANTHROPIC;
  const entry = lookup(table, model) ?? (provider === "xai" ? XAI["grok-4.7"] : ANTHROPIC["claude-opus-5-5"]);
  const promptTokens = u.input + (u.cacheRead ?? 0) + (u.cacheWrite ?? 0);
  const p = entry.long && promptTokens > entry.long.above ? entry.long.price : entry.base;
  const tokens = (u.input * p.input + u.output * p.output + (u.cacheRead ?? 0) * p.cacheRead + (u.cacheWrite ?? 0) * p.cacheWrite) / 1_000_000;
  const tools = (u.webSearches ?? 0) * (provider === "xai" ? TOOL_CALL.xai.webSearch : TOOL_CALL.anthropic.webSearch);
  return tokens + tools;
}
