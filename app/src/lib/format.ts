export function money(minor: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);
}

export function dateTime(iso: string, timeZone?: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));
}

export function time(iso: string, timeZone?: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));
}

/** Next `count` calendar days as YYYY-MM-DD in the given time zone. */
export function upcomingDays(count: number, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone });
  const label = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", timeZone });
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.now() + i * 86_400_000);
    return { date: fmt.format(d), label: i === 0 ? "Today" : label.format(d) };
  });
}

export const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  on_the_way: "Barber on the way",
  completed: "Completed",
  cancelled: "Cancelled",
};
