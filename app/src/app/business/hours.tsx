import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { colors, fonts, radius } from "../../components/theme";
import { Button, ErrorBox, IconLine, Loading, Pill, Row, Screen, Section, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { upcomingDays } from "../../lib/format";
import type { BusinessDashboard } from "../../lib/types";

const DAYS = [1, 2, 3, 4, 5, 6, 0]; // Monday first
const NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hh = (h: number) => `${String(h % 24).padStart(2, "0")}:00`;
const dayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/** Barbers set their week (days and hours) and tap dates on a calendar to take them off. */
export default function Hours() {
  const { user } = useAuth();
  const [data, setData] = useState<BusinessDashboard | null>(null);
  const [days, setDays] = useState<number[]>([]);
  const [open, setOpen] = useState(10);
  const [close, setClose] = useState(20);
  const [off, setOff] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    if (user?.role !== "barber") return;
    api.business().then((d) => {
      setData(d);
      setDays(d.hours.workingDays);
      setOpen(d.hours.openHour);
      setClose(d.hours.closeHour);
      setOff(d.hours.timeOff);
    }, (e: Error) => setError(e.message));
  }, [user]);
  useEffect(load, [load]);

  // Five weeks from this Monday, in the barber's own time zone.
  const today = data ? upcomingDays(1, data.barber.timeZone)[0]!.date : "";
  const grid = useMemo(() => {
    if (!today) return [];
    const monday = addDays(today, -((dayOf(today) + 6) % 7));
    return Array.from({ length: 35 }, (_, i) => addDays(monday, i));
  }, [today]);

  if (!data) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;

  const touch = () => setSaved(false);
  const toggleDay = (d: number) => {
    touch();
    setDays((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]));
  };
  const toggleOff = (date: string) => {
    touch();
    setOff((x) => (x.includes(date) ? x.filter((y) => y !== date) : [...x, date].sort()));
  };
  const booked = new Map(data.week.map((w) => [w.date, w.count]));
  const clash = off.filter((d) => (booked.get(d) ?? 0) > 0);

  const save = async () => {
    setError(null);
    if (!days.length) return setError("Pick at least one working day.");
    setBusy(true);
    try {
      // Past days off are dropped; future ones beyond the calendar are kept.
      await api.updateMyBarber({ workingDays: [...days].sort(), openHour: open, closeHour: close, timeOff: off.filter((d) => d >= today) });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={
        <Row gap={10}>
          {saved && <Row gap={6} style={{ flex: 1 }}><Ionicons name="checkmark-circle" size={18} color={colors.text} /><T variant="caption">Saved — your booking slots are updated</T></Row>}
          <Button title="Save hours" onPress={save} loading={busy} style={saved ? undefined : { flex: 1 }} />
        </Row>
      }
    >
      <T muted>Customers can only book inside these hours ({data.barber.city} time). Slots fill around the bookings you already have.</T>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}

      <Section title="Working days">
        <Wrap>
          {DAYS.map((d) => <Pill key={d} label={NAME[d]!} selected={days.includes(d)} onPress={() => toggleDay(d)} />)}
        </Wrap>
      </Section>

      <Section title="Opening hours">
        <Row gap={12}>
          <HourPicker label="Opens" value={open} min={0} max={close - 1} onChange={(v) => { touch(); setOpen(v); }} />
          <HourPicker label="Closes" value={close} min={open + 1} max={24} onChange={(v) => { touch(); setClose(v); }} />
        </Row>
        <T variant="caption" muted style={{ marginTop: 8 }}>{close - open} hours a day · last booking ends by {hh(close)}</T>
      </Section>

      <Section title="Days off" eyebrow="Tap a date to take it off">
        <Row gap={4} style={{ marginBottom: 6 }}>
          {DAYS.map((d) => <T key={d} variant="small" muted center style={{ flex: 1 }}>{NAME[d]}</T>)}
        </Row>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {grid.map((date) => {
            const past = date < today;
            const isOff = off.includes(date);
            const working = days.includes(dayOf(date));
            const count = booked.get(date) ?? 0;
            const first = date.endsWith("-01");
            return (
              <View key={date} style={{ width: `${100 / 7}%`, padding: 2 }}>
                <Pressable
                  disabled={past || !working}
                  onPress={() => toggleOff(date)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isOff, disabled: past || !working }}
                  accessibilityLabel={`${date}${isOff ? ", day off" : working ? ", working" : ", not a working day"}`}
                  style={({ pressed }) => [
                    { height: 48, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
                    isOff ? { backgroundColor: colors.ink } : working && !past ? { backgroundColor: colors.card, borderWidth: 1, borderColor: date === today ? colors.accentLine : colors.border } : { backgroundColor: "transparent" },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  {first && <T variant="small" color={isOff ? colors.inkMuted : colors.muted} style={{ fontSize: 9, lineHeight: 10 }}>{new Intl.DateTimeFormat(undefined, { month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))}</T>}
                  <T variant="caption" color={isOff ? colors.onInk : past || !working ? colors.faint : colors.text} style={{ fontFamily: date === today ? fonts.bold : fonts.medium, textDecorationLine: isOff ? "line-through" : "none" }}>{Number(date.slice(8))}</T>
                  {count > 0 && <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 2, backgroundColor: isOff ? colors.onInk : colors.text }} />}
                </Pressable>
              </View>
            );
          })}
        </View>
        <Row gap={14} style={{ marginTop: 10, flexWrap: "wrap" }}>
          <Legend swatch={<View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: colors.ink }} />} label="Day off" />
          <Legend swatch={<View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text }} />} label="Has bookings" />
          <T variant="small" muted>{off.filter((d) => d >= today).length} days off booked</T>
        </Row>
        {clash.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <IconLine icon="alert-circle-outline">You have bookings on {clash.length === 1 ? "a day" : "days"} you've taken off. Those customers are still coming — message support if you need us to move or refund them.</IconLine>
          </View>
        )}
      </Section>
    </Screen>
  );
}

function HourPicker({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const step = (icon: "remove" | "add", to: number) => (
    <Pressable accessibilityLabel={`${label} ${icon === "add" ? "later" : "earlier"}`} disabled={to < min || to > max} onPress={() => onChange(to)} hitSlop={6} style={{ padding: 12, opacity: to < min || to > max ? 0.3 : 1 }}>
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flex: 1 }}>
      <T variant="caption" muted style={{ marginBottom: 6 }}>{label}</T>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, height: 52 }}>
        {step("remove", value - 1)}
        <T variant="heading">{hh(value)}</T>
        {step("add", value + 1)}
      </View>
    </View>
  );
}

function Legend({ swatch, label }: { swatch: ReactNode; label: string }) {
  return (
    <Row gap={6}>
      <View style={{ width: 14, alignItems: "center" }}>{swatch}</View>
      <T variant="small" muted>{label}</T>
    </Row>
  );
}
