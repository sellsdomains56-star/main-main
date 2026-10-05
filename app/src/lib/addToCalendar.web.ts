import { DEMO_DATA } from "./config";
import { googleCalendarUrl, icsFor, type CalendarItem, type CalendarTarget } from "./calendarEvent";

/**
 * Website: Google Calendar opens pre-filled; "Apple / Outlook" downloads an .ics file
 * (with alerts a day and an hour before) that any calendar app imports.
 */
export async function addToCalendar(item: CalendarItem, target: CalendarTarget = "google"): Promise<string> {
  if (target === "google") {
    window.open(googleCalendarUrl(item), "_blank", "noopener");
    return "Opened Google Calendar — save the event there.";
  }
  const blob = new Blob([icsFor(item)], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "jb-always-fresh-appointment.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  return "Calendar file downloaded — open it to add the appointment with alerts.";
}

/** The demo page can't download files, so it offers Google Calendar only. */
export const calendarOptions = (): readonly CalendarTarget[] => (DEMO_DATA ? ["google"] : ["google", "ics"]);
