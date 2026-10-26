import type { Repeat } from "../types.js";

/**
 * The next time a repeating reminder is due after `from`, stepping in local
 * time (the server runs with TZ set to your time zone) so "every day at 8"
 * stays at 8 across daylight-saving changes. Missed runs are skipped.
 */
export function nextOccurrence(previous: number, repeat: Repeat, now: number): number | null {
  if (repeat === "none") return null;
  const d = new Date(previous);
  do {
    switch (repeat) {
      case "hourly":
        d.setHours(d.getHours() + 1);
        break;
      case "daily":
        d.setDate(d.getDate() + 1);
        break;
      case "weekdays":
        do d.setDate(d.getDate() + 1);
        while (d.getDay() === 0 || d.getDay() === 6);
        break;
      case "weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "monthly": {
        const day = new Date(previous).getDate();
        d.setDate(1);
        d.setMonth(d.getMonth() + 1);
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(day, lastDay));
        break;
      }
    }
  } while (d.getTime() <= now);
  return d.getTime();
}

/** "Tue 27 Oct 2026, 09:00" in the configured time zone. */
export function formatWhen(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

/** "+04:00" for the zone at that moment. */
export function utcOffset(ms: number, timeZone: string): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(ms)
    .find((p) => p.type === "timeZoneName")?.value;
  const match = part?.match(/GMT([+-]\d{2}:\d{2})/);
  return match ? match[1] : "+00:00";
}
