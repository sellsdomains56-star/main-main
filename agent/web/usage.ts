import { api } from "./api.js";
import { clear, h } from "./dom.js";
import { locale, plural, t } from "./i18n.js";
import { state } from "./state.js";
import { toast } from "./util.js";

/** Usage & spending: what the agent has cost, from the server's per-turn log. */

interface Report {
  today: number;
  last7Days: number;
  thisMonth: number;
  allTime: number;
  since: number | null;
  monthlyBudget: number;
  days: { date: string; costUsd: number; turns: number }[];
  byModel: { model: string; label: string; provider: string; turns: number; inputTokens: number; outputTokens: number; costUsd: number }[];
  byAgent: { agentId: string | null; name: string; emoji: string; turns: number; costUsd: number }[];
  byKind: { kind: "chat" | "swarm" | "scheduled"; turns: number; costUsd: number }[];
}

function money(usd: number): string {
  const small = usd > 0 && usd < 1;
  return new Intl.NumberFormat(locale(), { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: small ? 3 : 2 }).format(usd);
}

const tokens = (n: number) => new Intl.NumberFormat(locale(), { notation: "compact", maximumFractionDigits: 1 }).format(n);
const dayLabel = (date: string, style: "short" | "long" = "short") =>
  new Intl.DateTimeFormat(locale(), style === "short" ? { day: "numeric", month: "short" } : { weekday: "short", day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`));
const KIND: Record<Report["byKind"][number]["kind"], string> = { chat: "Chats", swarm: "Swarm agents", scheduled: "Scheduled tasks" };

function tile(label: string, value: number, sub?: string) {
  return h("div", { class: "stat-tile" }, h("span", { class: "stat-label" }, label), h("span", { class: "stat-value" }, money(value)), sub ? h("span", { class: "stat-sub" }, sub) : null);
}

/** Daily spending for 30 days: one bar per day, hover or focus a day for its numbers. */
function dailyChart(days: Report["days"]): HTMLElement {
  const max = Math.max(...days.map((d) => d.costUsd));
  const tip = h("div", { class: "chart-tip", role: "status", hidden: true });
  const plot = h("div", { class: "bar-plot" });
  const show = (col: HTMLElement, d: Report["days"][number]) => {
    clear(tip);
    tip.append(h("strong", null, dayLabel(d.date, "long")), h("span", null, money(d.costUsd)), h("span", { class: "muted" }, plural(d.turns, ["{n} reply", "{n} replies"], ["رد واحد", "ردّان", "{n} ردود", "{n} ردًا"])));
    tip.hidden = false;
    const plotBox = plot.getBoundingClientRect();
    const box = col.getBoundingClientRect();
    const x = Math.min(Math.max(box.left - plotBox.left + box.width / 2, 60), plotBox.width - 60);
    tip.style.insetInlineStart = "";
    tip.style.left = `${x}px`;
  };
  for (const d of days) {
    const height = max > 0 ? Math.max((d.costUsd / max) * 100, d.costUsd > 0 ? 2 : 0) : 0;
    const col = h(
      "div",
      { class: "bar-col", tabindex: 0, "aria-label": `${dayLabel(d.date, "long")}: ${money(d.costUsd)}` },
      h("div", { class: "bar", style: `height:${height}%` }),
    );
    col.addEventListener("mouseenter", () => show(col, d));
    col.addEventListener("focus", () => show(col, d));
    col.addEventListener("mouseleave", () => (tip.hidden = true));
    col.addEventListener("blur", () => (tip.hidden = true));
    plot.append(col);
  }
  const axis = h(
    "div",
    { class: "bar-axis" },
    h("span", null, dayLabel(days[0].date)),
    h("span", null, dayLabel(days[Math.floor(days.length / 2)].date)),
    h("span", null, t("Today")),
  );
  const table = h(
    "details",
    { class: "chart-table" },
    h("summary", null, t("Show as a table")),
    h(
      "table",
      { class: "data-table" },
      h("thead", null, h("tr", null, h("th", null, t("Day")), h("th", { class: "num" }, t("Replies")), h("th", { class: "num" }, t("Cost")))),
      h("tbody", null, ...[...days].reverse().map((d) => h("tr", null, h("td", null, dayLabel(d.date, "long")), h("td", { class: "num" }, String(d.turns)), h("td", { class: "num" }, money(d.costUsd))))),
    ),
  );
  return h(
    "div",
    { class: "chart" },
    h("div", { class: "chart-head" }, h("h3", { class: "section-title" }, t("Last 30 days")), h("span", { class: "muted" }, max > 0 ? t("Highest day: {v}", { v: money(max) }) : "")),
    h("div", { class: "bar-frame" }, plot, tip),
    axis,
    table,
  );
}

function budgetRow(r: Report, rerender: () => void): HTMLElement {
  const input = h("input", { class: "input budget-input", type: "number", min: 0, step: 1, inputmode: "decimal", value: r.monthlyBudget || "", placeholder: t("No budget") });
  const save = h("button", { class: "btn small", type: "button" }, t("Save"));
  save.addEventListener("click", async () => {
    const value = Math.max(0, Number(input.value) || 0);
    try {
      state.boot.settings = await api("/api/settings", { method: "PUT", body: { monthlyBudget: value } });
      toast(value ? t("Budget saved") : t("Budget removed"));
      rerender();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  });
  const parts: (HTMLElement | null)[] = [];
  if (r.monthlyBudget > 0) {
    const share = r.thisMonth / r.monthlyBudget;
    const level = share >= 1 ? "over" : share >= 0.8 ? "near" : "ok";
    parts.push(
      h(
        "div",
        { class: "budget-meter" },
        h("div", { class: `budget-fill ${level}`, style: `width:${Math.min(share, 1) * 100}%` }),
      ),
      h(
        "p",
        { class: `budget-text ${level}` },
        t("{spent} of your {budget} monthly budget", { spent: money(r.thisMonth), budget: money(r.monthlyBudget) }),
        level === "over" ? ` · ${t("Over budget")}` : level === "near" ? ` · ${t("Nearly there")}` : "",
      ),
    );
  }
  return h(
    "div",
    { class: "field budget" },
    h("h3", { class: "section-title" }, t("Monthly budget")),
    ...parts,
    h("div", { class: "row" }, h("span", { class: "currency" }, "$"), input, save),
    h("small", { class: "muted" }, t("You'll get a notification at 80% and 100% of it. Nothing is blocked.")),
  );
}

function table(headers: string[], rows: (string | HTMLElement)[][], numeric: number[]): HTMLElement {
  return h(
    "table",
    { class: "data-table" },
    h("thead", null, h("tr", null, ...headers.map((x, i) => h("th", { class: numeric.includes(i) ? "num" : "" }, x)))),
    h("tbody", null, ...rows.map((r) => h("tr", null, ...r.map((cell, i) => h("td", { class: numeric.includes(i) ? "num" : "" }, cell))))),
  );
}

export function renderUsage(body: HTMLElement): void {
  const render = async () => {
    let r: Report;
    try {
      r = await api<Report>("/api/usage");
    } catch (err) {
      clear(body);
      body.append(h("p", { class: "form-error" }, (err as Error).message));
      return;
    }
    clear(body);
    body.append(
      h(
        "div",
        { class: "stat-row" },
        tile(t("Today"), r.today),
        tile(t("Last 7 days"), r.last7Days),
        tile(t("This month"), r.thisMonth),
        tile(t("All time"), r.allTime, r.since ? t("since {date}", { date: new Intl.DateTimeFormat(locale(), { dateStyle: "medium" }).format(r.since) }) : undefined),
      ),
      dailyChart(r.days),
      budgetRow(r, render),
    );
    if (r.byModel.length) {
      body.append(
        h("h3", { class: "section-title" }, t("This month by model")),
        table(
          [t("Model"), t("Replies"), t("Tokens in"), t("Tokens out"), t("Cost")],
          r.byModel.map((m) => [t(m.label), String(m.turns), tokens(m.inputTokens), tokens(m.outputTokens), money(m.costUsd)]),
          [1, 2, 3, 4],
        ),
        h("h3", { class: "section-title" }, t("This month by agent")),
        table(
          [t("Agent"), t("Replies"), t("Cost")],
          r.byAgent.map((a) => [`${a.emoji} ${a.name}`, String(a.turns), money(a.costUsd)]),
          [1, 2],
        ),
        h("h3", { class: "section-title" }, t("This month by kind")),
        table(
          [t("Kind"), t("Replies"), t("Cost")],
          r.byKind.map((k) => [t(KIND[k.kind]), String(k.turns), money(k.costUsd)]),
          [1, 2],
        ),
      );
    } else {
      body.append(h("p", { class: "muted" }, t("Nothing spent this month yet.")));
    }
    body.append(
      h(
        "p",
        { class: "usage-note muted" },
        t("Estimates from Anthropic's and xAI's published prices, including prompt caching and web searches. Your provider's bill is the final word."),
      ),
    );
  };
  void render();
}
