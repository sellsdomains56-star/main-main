// Delivery date maths. Client-safe. UAE working week is Monday to Friday.
export function addBusinessDays(from: Date, n: number): Date {
  const d = new Date(from);
  let left = n;
  while (left > 0) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) left--; }
  return d;
}
export type Timing = { processingMinDays: number; processingMaxDays: number };
export type ZoneTiming = { minDays: number; maxDays: number };

/** Earliest and latest estimated arrival: processing time + courier transit, in business days, counted from today. */
export function estimateWindow(s: Timing, z: ZoneTiming, now = new Date()) {
  return { from: addBusinessDays(now, s.processingMinDays + z.minDays), to: addBusinessDays(now, s.processingMaxDays + z.maxDays) };
}
export const fmtDay = (iso: string | Date) => new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const totalDays = (s: Timing, z: ZoneTiming) => [s.processingMinDays + z.minDays, s.processingMaxDays + z.maxDays] as const;
