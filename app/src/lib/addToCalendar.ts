import { EntityTypes, getCalendars, getDefaultCalendarSync, requestCalendarPermissions } from "expo-calendar";
import { Platform } from "react-native";
import { ALERT_MINUTES_BEFORE, type CalendarItem, type CalendarTarget } from "./calendarEvent";

/**
 * iPhone / Android: puts the appointment straight into the phone's calendar with alerts
 * a day and an hour before. Resolves with a message to show.
 */
export async function addToCalendar(item: CalendarItem, _target: CalendarTarget = "device"): Promise<string> {
  const permission = await requestCalendarPermissions(true); // iOS: write-only, no access to existing events
  if (!permission.granted) throw new Error("Allow calendar access in Settings to add your appointment.");
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
