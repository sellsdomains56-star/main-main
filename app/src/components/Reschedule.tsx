import { useEffect, useState } from "react";
import { View } from "react-native";
import { api } from "../lib/api";
import { time, upcomingDays } from "../lib/format";
import type { Booking } from "../lib/types";
import { DayPicker } from "./DayPicker";
import { colors } from "./theme";
import { Button, Loading, Pill, Row, T, Wrap } from "./ui";

/** Pick a new day and time for a booking: same barber, service and extras. */
export function Reschedule({ booking, onDone, onCancel }: { booking: Booking; onDone: (b: Booking) => void; onCancel: () => void }) {
  const tz = booking.barber.timeZone;
  const [days] = useState(() => upcomingDays(21, tz));
  const [date, setDate] = useState(() => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(booking.startsAt)));
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!booking.service) return;
    let live = true;
    setSlots(null);
    setSlot(null);
    api.availability(booking.barber.id, date, booking.service.id, (booking.extras ?? []).map((x) => x.id)).then(
      (r) => live && setSlots(r.slots.filter((s) => s !== booking.startsAt)),
      (e: Error) => live && setError(e.message),
    );
    return () => {
      live = false;
    };
  }, [booking, date]);

  const save = async () => {
    if (!slot) return;
    setSaving(true);
    setError(null);
    try {
      onDone(await api.reschedule(booking.id, slot));
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <View style={{ marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface }}>
      <T variant="strong">Change the time</T>
      <T variant="caption" muted style={{ marginTop: 2, marginBottom: 10 }}>Same barber and service. Free up to an hour before.</T>
      <DayPicker days={days} value={date} onChange={setDate} />
      <View style={{ marginTop: 12 }}>
        {!slots && !error && <Loading />}
        {slots?.length === 0 && <T variant="caption" muted>No free times this day — try another.</T>}
        <Wrap>{slots?.map((s) => <Pill key={s} label={time(s, tz)} selected={s === slot} onPress={() => setSlot(s)} />)}</Wrap>
      </View>
      {error && <T variant="caption" color={colors.danger} style={{ marginTop: 8 }}>{error}</T>}
      <Row gap={8} style={{ marginTop: 12 }}>
        <Button title="Move booking" size="sm" disabled={!slot} loading={saving} onPress={save} />
        <Button title="Keep the time" size="sm" variant="secondary" onPress={onCancel} />
      </Row>
    </View>
  );
}
