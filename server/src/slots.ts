import type { Barber, Booking } from "./types.js";

/** Offset (ms) of `timeZone` from UTC at the given instant. */
function tzOffset(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - instant.getTime();
}

/** Convert a wall-clock time in `timeZone` to a UTC Date. */
export function zonedTime(date: string, hour: number, minute: number, timeZone: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute);
  const offset = tzOffset(new Date(guess), timeZone);
  return new Date(guess - offset);
}

const STEP_MIN = 30;

/** Free start times (ISO UTC) for a service of `durationMin` on local date `date` (YYYY-MM-DD). */
export function availableSlots(
  barber: Barber,
  timeZone: string,
  date: string,
  durationMin: number,
  bookings: Booking[],
  now = new Date(),
): string[] {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (!barber.workingDays.includes(weekday)) return [];

  const taken = bookings
    .filter((b) => b.barberId === barber.id && b.status !== "cancelled")
    .map((b) => [Date.parse(b.startsAt), Date.parse(b.endsAt)] as const);

  const slots: string[] = [];
  for (let min = barber.openHour * 60; min + durationMin <= barber.closeHour * 60; min += STEP_MIN) {
    const start = zonedTime(date, Math.floor(min / 60), min % 60, timeZone);
    const end = start.getTime() + durationMin * 60_000;
    if (start.getTime() < now.getTime() + 60 * 60_000) continue; // at least 1h notice
    if (taken.some(([s, e]) => start.getTime() < e && end > s)) continue;
    slots.push(start.toISOString());
  }
  return slots;
}
