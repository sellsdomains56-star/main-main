import type { CancelPolicy, Level, PriceRule } from "./types";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hh = (h: number) => `${String(h % 24).padStart(2, "0")}:00`;

/** "Mon–Wed" or "Mon, Thu, Sat". */
export function daysLabel(days: number[]) {
  const order = [1, 2, 3, 4, 5, 6, 0].filter((d) => days.includes(d));
  if (order.length === 7) return "Every day";
  const idx = order.map((d) => [1, 2, 3, 4, 5, 6, 0].indexOf(d));
  const run = idx.every((v, i) => i === 0 || v === idx[i - 1]! + 1);
  return run && order.length > 2 ? `${DAY[order[0]!]}–${DAY[order.at(-1)!]}` : order.map((d) => DAY[d]).join(", ");
}

/** "15% off Mon–Wed 10:00–13:00". */
export const ruleLabel = (r: PriceRule, kind: "offPeak" | "peak") => `${r.percent}% ${kind === "offPeak" ? "off" : "extra"} ${daysLabel(r.days)} ${hh(r.fromHour)}–${hh(r.toHour)}`;

/** "Free cancellation up to 24 hours before; after that 50% is kept." */
export function policyLabel(p: CancelPolicy | null | undefined) {
  if (!p || !p.freeHours || !p.lateFeePercent) return "Free cancellation up to the start";
  return `Free cancellation up to ${p.freeHours} hours before; after that ${p.lateFeePercent === 100 ? "the full price is" : `${p.lateFeePercent}% is`} kept`;
}

export const LEVEL_LABEL: Record<Level, string> = { new: "New", rising: "Rising", pro: "Pro", elite: "Elite" };
export const LEVEL_HELP: Record<Level, string> = {
  new: "Just joined Always Fresh",
  rising: "5+ cuts on Always Fresh",
  pro: "25+ cuts, rated 4.5 or more",
  elite: "60+ cuts, rated 4.8 or more",
};

/** A service price with an off-peak or peak percent applied, rounded to whole units (as the server does). */
export const adjustedPrice = (price: number, percent: number) => (percent ? Math.max(0, Math.round((price * (100 + percent)) / 100 / 100) * 100) : price);
