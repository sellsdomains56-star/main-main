import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { DayPicker } from "../../components/DayPicker";
import { atLocal, hhmm, HourStepper } from "../../components/shopPanel";
import { colors } from "../../components/theme";
import { Button, Card, EmptyState, ErrorBox, Field, IconLine, Loading, Pill, Row, Screen, Section, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { upcomingDays } from "../../lib/format";
import type { BusinessDashboard, CalBlock } from "../../lib/types";

const REASONS = ["Lunch", "Appointment", "School run", "Training", "Personal"];
const dateLabel = (iso: string, tz: string) => new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(new Date(iso));

/** Block a few hours (lunch, a dentist, school pick-up): customers can't book them. Whole days off live in Hours & days off. */
export default function Blocks() {
  const [data, setData] = useState<BusinessDashboard | null>(null);
  const [blocks, setBlocks] = useState<CalBlock[] | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [from, setFrom] = useState(13);
  const [to, setTo] = useState(14);
  const [reason, setReason] = useState("Lunch");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api.business().then((d) => {
      setData(d);
      setDate((x) => x ?? upcomingDays(1, d.barber.timeZone)[0]!.date);
      setFrom((f) => Math.min(Math.max(f, d.hours.openHour), d.hours.closeHour - 1));
      setTo((t) => Math.min(Math.max(t, d.hours.openHour + 1), d.hours.closeHour));
    }, (e: Error) => setError(e.message));
    api.myBlocks().then(setBlocks, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  if (!data || !date) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;
  const tz = data.barber.timeZone;

  const add = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.addMyBlock({ startsAt: atLocal(date, from * 60, tz), endsAt: atLocal(date, to * 60, tz), reason });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: string) => {
    try {
      await api.removeMyBlock(id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "Block time" }} />
      <T variant="title">Block time</T>
      <T variant="caption" muted style={{ marginTop: 4 }}>A lunch, an appointment, the school run: customers can't book these hours. For whole days, use Hours & days off.</T>

      <Section title="New block">
        <DayPicker days={upcomingDays(21, tz)} value={date} onChange={setDate} />
        <Row gap={10} style={{ marginTop: 14 }}>
          <HourStepper label="From" value={from} min={0} max={to - 1} onChange={setFrom} />
          <HourStepper label="Until" value={to} min={from + 1} max={24} onChange={setTo} />
        </Row>
        <T variant="caption" muted style={{ marginTop: 14, marginBottom: 8 }}>Reason (only you and your shop see it)</T>
        <Wrap>{REASONS.map((r) => <Pill key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />)}</Wrap>
        <Field label="Or write your own" value={REASONS.includes(reason) ? "" : reason} onChangeText={(v) => setReason(v || "Lunch")} maxLength={80} style={{ marginTop: 12 }} />
        {error && <ErrorBox message={error} />}
        <Button title={`Block ${String(from).padStart(2, "0")}:00–${String(to % 24).padStart(2, "0")}:00`} icon="ban-outline" onPress={add} loading={busy} />
      </Section>

      <Section title="Coming up">
        {!blocks && <Loading />}
        {blocks?.length === 0 && <EmptyState icon="calendar-clear-outline" title="Nothing blocked" body="Your free times are all open for booking." />}
        {blocks?.map((b) => (
          <Card key={b.id} tone="surface" style={{ marginBottom: 10 }}>
            <Row style={{ justifyContent: "space-between" }} gap={10}>
              <View style={{ flex: 1 }}>
                <T variant="strong">{b.reason}</T>
                <IconLine icon="time-outline" muted>{dateLabel(b.startsAt, tz)} · {hhmm(b.startsAt, tz)}–{hhmm(b.endsAt, tz)}</IconLine>
              </View>
              <Button title="Remove" size="sm" variant="ghost" onPress={() => remove(b.id)} />
            </Row>
          </Card>
        ))}
        <T variant="small" color={colors.muted} style={{ marginTop: 6 }}>Times are in {data.barber.city} time.</T>
      </Section>
    </Screen>
  );
}
