import { config, modelLabel } from "./config.js";
import { addUsageRow, getAgent, getKV, getSettings, setKV, usageRowsSince, usageTotal, type UsageRow } from "./db.js";
import { notify } from "./events.js";
import { tr } from "./i18n.js";
import type { TurnUsage } from "./types.js";

/** Records one turn's cost, and warns once a month when spending passes 80% and 100% of your budget. */
export function recordUsage(entry: { provider: string; model: string; agentId: string | null; conversationId: string | null; kind: UsageRow["kind"]; usage: TurnUsage }): void {
  const { usage } = entry;
  addUsageRow({
    ts: Date.now(),
    provider: entry.provider,
    model: entry.model,
    agentId: entry.agentId,
    conversationId: entry.conversationId,
    kind: entry.kind,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheReadTokens: usage.cacheReadTokens ?? 0,
    webSearches: usage.webSearches ?? 0,
    costUsd: usage.costUsd ?? 0,
  });
  checkBudget();
}

const dayOf = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: config.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(ms);
const money = (usd: number) => `$${usd.toFixed(2)}`;

function monthSpend(now = Date.now()): number {
  const month = dayOf(now).slice(0, 7);
  return usageRowsSince(now - 32 * 86_400_000)
    .filter((r) => dayOf(r.ts).startsWith(month))
    .reduce((sum, r) => sum + r.costUsd, 0);
}

function checkBudget() {
  const budget = getSettings().monthlyBudget;
  if (!budget || budget <= 0) return;
  const spent = monthSpend();
  const month = dayOf(Date.now()).slice(0, 7);
  const key = `budget_alert:${month}`;
  const already = Number(getKV(key) ?? 0);
  const level = spent >= budget ? 100 : spent >= budget * 0.8 ? 80 : 0;
  if (level <= already) return;
  setKV(key, String(level));
  const title = level === 100 ? tr("Monthly budget reached", "تم بلوغ الميزانية الشهرية") : tr("80% of your monthly budget used", "استُخدم 80% من ميزانيتك الشهرية");
  const body = tr(`${money(spent)} of ${money(budget)} this month.`, `${money(spent)} من ${money(budget)} هذا الشهر.`);
  void notify(title, body, null);
}

export interface SpendingReport {
  currency: "USD";
  today: number;
  last7Days: number;
  thisMonth: number;
  allTime: number;
  since: number | null;
  monthlyBudget: number;
  /** The last 30 days, oldest first, in your time zone. */
  days: { date: string; costUsd: number; turns: number }[];
  byModel: { model: string; label: string; provider: string; turns: number; inputTokens: number; outputTokens: number; costUsd: number }[];
  byAgent: { agentId: string | null; name: string; emoji: string; turns: number; costUsd: number }[];
  byKind: { kind: UsageRow["kind"]; turns: number; costUsd: number }[];
}

export function spendingReport(now = Date.now()): SpendingReport {
  const rows = usageRowsSince(now - 32 * 86_400_000);
  const today = dayOf(now);
  const days: SpendingReport["days"] = [];
  for (let i = 29; i >= 0; i--) days.push({ date: dayOf(now - i * 86_400_000), costUsd: 0, turns: 0 });
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));
  const week = new Set(days.slice(-7).map((d) => d.date));
  const month = today.slice(0, 7);
  const byModel = new Map<string, SpendingReport["byModel"][number]>();
  const byAgent = new Map<string, SpendingReport["byAgent"][number]>();
  const byKind = new Map<string, SpendingReport["byKind"][number]>();
  let todaySpend = 0;
  let weekSpend = 0;
  let monthSpendTotal = 0;
  for (const r of rows) {
    const date = dayOf(r.ts);
    const i = dayIndex.get(date);
    if (i !== undefined) {
      days[i].costUsd += r.costUsd;
      days[i].turns++;
    }
    if (date === today) todaySpend += r.costUsd;
    if (week.has(date)) weekSpend += r.costUsd;
    if (!date.startsWith(month)) continue;
    // The breakdowns cover this month.
    monthSpendTotal += r.costUsd;
    const m = byModel.get(r.model) ?? { model: r.model, label: modelLabel(r.model), provider: r.provider, turns: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 };
    m.turns++;
    m.inputTokens += r.inputTokens;
    m.outputTokens += r.outputTokens;
    m.costUsd += r.costUsd;
    byModel.set(r.model, m);
    const agentKey = r.agentId ?? "";
    const agent = r.agentId ? getAgent(r.agentId) : null;
    const a = byAgent.get(agentKey) ?? {
      agentId: r.agentId,
      name: r.agentId ? (agent?.name ?? tr("Deleted agent", "وكيل محذوف")) : config.agentName,
      emoji: r.agentId ? (agent?.emoji ?? "🤖") : "✦",
      turns: 0,
      costUsd: 0,
    };
    a.turns++;
    a.costUsd += r.costUsd;
    byAgent.set(agentKey, a);
    const k = byKind.get(r.kind) ?? { kind: r.kind, turns: 0, costUsd: 0 };
    k.turns++;
    k.costUsd += r.costUsd;
    byKind.set(r.kind, k);
  }
  const total = usageTotal();
  const desc = <T extends { costUsd: number }>(list: Iterable<T>) => [...list].sort((x, y) => y.costUsd - x.costUsd);
  return {
    currency: "USD",
    today: todaySpend,
    last7Days: weekSpend,
    thisMonth: monthSpendTotal,
    allTime: total.costUsd,
    since: total.since,
    monthlyBudget: getSettings().monthlyBudget,
    days,
    byModel: desc(byModel.values()),
    byAgent: desc(byAgent.values()).slice(0, 50),
    byKind: desc(byKind.values()),
  };
}
