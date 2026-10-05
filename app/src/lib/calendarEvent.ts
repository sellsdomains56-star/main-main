import { APP_NAME } from "./config";
import { isConsultation, type Booking } from "./types";

/** A booking as a calendar entry, with alerts a day and an hour before. */
export interface CalendarItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  notes: string;
  url?: string;
}

export const ALERT_MINUTES_BEFORE = [24 * 60, 60];

/** device = the phone's calendar; google = Google Calendar on the web; ics = a calendar file. */
export type CalendarTarget = "device" | "google" | "ics";

export function bookingCalendarItem(b: Booking): CalendarItem {
  const service = b.service?.name ?? "Appointment";
  const location = b.locationType === "video" ? b.videoLink ?? "Google Meet (link in the app)" : b.locationType === "phone" ? `Phone call — your barber calls ${b.phone}` : b.address;
  const lines = [
    `${service} with ${b.barber.name} (${APP_NAME}).`,
    b.locationType === "home" ? `${b.barber.name.split(" ")[0]} comes to you — you'll get an alert when they're on the way.` : "",
    b.locationType === "video" ? "Join the Google Meet from Bookings in the app." : "",
    b.notes ? `Notes: ${b.notes}` : "",
    "Manage or cancel in the app under Bookings.",
  ].filter(Boolean);
  return {
    id: b.id,
    title: isConsultation(b) ? `Consultation with ${b.barber.name}` : `${service} — ${b.barber.name}`,
    start: new Date(b.startsAt),
    end: new Date(b.endsAt),
    location,
    notes: lines.join("\n"),
    url: b.locationType === "video" ? b.videoLink ?? undefined : undefined,
  };
}

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

/** An .ics file (Apple Calendar, Outlook, Google Calendar import) with the two alerts. */
export function icsFor(item: CalendarItem): string {
  const alarms = ALERT_MINUTES_BEFORE.map((m) => ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(item.title)}`, `TRIGGER:-PT${m}M`, "END:VALARM"].join("\r\n"));
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JB Always Fresh//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${item.id}@jbalwaysfresh`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(item.start)}`,
    `DTEND:${stamp(item.end)}`,
    `SUMMARY:${esc(item.title)}`,
    `LOCATION:${esc(item.location)}`,
    `DESCRIPTION:${esc(item.notes)}`,
    ...(item.url ? [`URL:${item.url}`] : []),
    ...alarms,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** Google Calendar's "add event" page, pre-filled. */
export function googleCalendarUrl(item: CalendarItem): string {
  const q = new URLSearchParams({ action: "TEMPLATE", text: item.title, dates: `${stamp(item.start)}/${stamp(item.end)}`, details: item.notes, location: item.location });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
