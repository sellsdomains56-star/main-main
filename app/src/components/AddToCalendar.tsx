import { useState } from "react";
import { View } from "react-native";
import { addToCalendar, calendarOptions } from "../lib/addToCalendar";
import { bookingCalendarItem } from "../lib/calendarEvent";
import type { CalendarTarget } from "../lib/calendarEvent";
import type { Booking } from "../lib/types";
import { colors } from "./theme";
import { Button, Row, T } from "./ui";

const LABEL: Record<CalendarTarget, string> = { device: "Add to calendar", google: "Google Calendar", ics: "Apple / Outlook" };

/**
 * Adds a booking to the customer's calendar with alerts a day and an hour before.
 * Phones: straight into the phone's calendar. Website: Google Calendar or an .ics file.
 */
export function AddToCalendar({ booking, size = "md", variant = "secondary" }: { booking: Booking; size?: "md" | "sm"; variant?: "secondary" | "light" }) {
  const onInk = variant === "light"; // sitting on a black card
  const options = calendarOptions();
  const [choosing, setChoosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function add(target: CalendarTarget) {
    setBusy(true);
    setNote(null);
    setFailed(false);
    try {
      setNote(await addToCalendar(bookingCalendarItem(booking), target));
      setChoosing(false);
    } catch (e) {
      setFailed(true);
      setNote((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      {options.length > 1 && choosing ? (
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          {options.map((o) => <Button key={o} title={LABEL[o]} icon={o === "google" ? "logo-google" : o === "ics" ? "download-outline" : "calendar"} size={size} variant={variant} onPress={() => add(o)} />)}
          <Button title="Close" size={size} variant="ghost" onPress={() => setChoosing(false)} />
        </Row>
      ) : (
        <Button
          title={options.length === 1 && options[0] === "google" ? "Add to Google Calendar" : "Add to calendar"}
          icon="calendar-outline"
          size={size}
          variant={variant}
          loading={busy}
          onPress={() => (options.length > 1 ? setChoosing(true) : add(options[0]))}
        />
      )}
      {!!note && <T variant="small" color={failed ? (onInk ? "#FF9C8F" : "#B42318") : onInk ? colors.inkMuted : colors.muted} style={{ marginTop: 6 }}>{note}</T>}
    </View>
  );
}
