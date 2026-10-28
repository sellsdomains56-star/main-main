import { EntityTypes, getCalendars, getDefaultCalendarSync } from "expo-calendar";
import { Platform } from "react-native";
import { askPermission } from "./askPermission";
import { ALERT_MINUTES_BEFORE, type CalendarItem, type CalendarTarget } from "./calendarEvent";

/**
 * iPhone / Android: puts the appointment straight into the phone's calendar with alerts
 * a day and an hour before. Resolves with a message to show.
 */
export async function addToCalendar(item: CalendarItem, _target: CalendarTarget = "device"): Promise<string> {
  // iOS: add-only access, no reading of existing events. Explained first; Settings if it was turned off.
  if (!(await askPermission("calendar"))) throw new Error("Calendar access is off, so the appointment wasn't added. You can turn it on in Settings → Permissions.");
  const calendar =
    Platform.OS === "ios"
      ? getDefaultCalendarSync()
      : (await getCalendars(EntityTypes.EVENT)).filter((c) => c.allowsModifications).sort((a, b) => Number(!!b.isPrimary) - Number(!!a.isPrimary))[0];
  if (!calendar) throw new Error("No calendar on this phone can take new events.");
  await calendar.createEvent({
    title: item.title,
    startDate: item.start,
    endDate: item.end,
    location: item.location,
    notes: item.notes,
    url: item.url,
    alarms: ALERT_MINUTES_BEFORE.map((m) => ({ relativeOffset: -m })),
  });
  return "Added to your calendar — you'll get alerts a day and an hour before.";
}

export const calendarOptions = (): readonly CalendarTarget[] => ["device"];
