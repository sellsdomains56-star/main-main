import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import type { ShopCalendar } from "../lib/types";
import { colors, radius } from "./theme";
import { Row, T } from "./ui";

/** Minutes since local midnight of an instant, in the shop's time zone. */
export function minutesOfDay(iso: string | number, timeZone: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return Number(p.hour) * 60 + Number(p.minute);
}

export const hhmm = (iso: string | number, timeZone: string) => new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
export const hourLabel = (h: number) => `${String(h % 24).padStart(2, "0")}:00`;
export const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
export const dayLabel = (date: string) => new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEK = [1, 2, 3, 4, 5, 6, 0]; // Monday first

function tzOffset(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - instant.getTime();
}

/** An instant from the shop's local date and minutes since midnight. */
export function atLocal(date: string, minutes: number, timeZone: string) {
  const guess = Date.parse(`${date}T00:00:00Z`) + minutes * 60_000;
  return new Date(guess - tzOffset(new Date(guess), timeZone)).toISOString();
}

/**
 * Start times (every 15 minutes) when a barber is free for `durationMin` on the calendar's day,
 * inside their hours. Bookings, blocked time and private hires all count; `ignore` skips a booking being moved.
 */
export function freeStarts(cal: ShopCalendar, barberId: string, durationMin: number, ignore?: string) {
  const barber = cal.barbers.find((b) => b.id === barberId);
  if (!barber) return [];
  const busy = [
    ...cal.bookings.filter((b) => b.barberId === barberId && b.status !== "cancelled" && b.id !== ignore),
    ...cal.blocks.filter((b) => b.barberId === barberId),
    ...cal.hires,
  ].map((x) => [Date.parse(x.startsAt), Date.parse(x.endsAt)] as const);
  const out: string[] = [];
  const now = Date.now() - 5 * 60_000;
  for (let m = barber.hours.openHour * 60; m + durationMin <= barber.hours.closeHour * 60; m += 15) {
    const start = Date.parse(atLocal(cal.date, m, cal.timeZone));
    const end = start + durationMin * 60_000;
    if (end < now) continue;
    if (busy.some(([s, e]) => start < e && end > s)) continue;
    out.push(new Date(start).toISOString());
  }
  return out;
}

/** A centred card over a dimmed page, for the panel's forms. */
export function Sheet({ visible, title, onClose, children, wide }: { visible: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Pressable onPress={() => {}} style={{ width: "100%", maxWidth: wide ? 640 : 480, maxHeight: "92%", backgroundColor: colors.card, borderRadius: radius.lg, overflow: "hidden" }}>
          <Row style={{ justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6 }}>
            <T variant="title" style={{ fontSize: 20, flex: 1 }}>{title}</T>
            <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={10}><Ionicons name="close" size={22} color={colors.text} /></Pressable>
          </Row>
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 10 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** "– 10:00 +" for an hour of the day. */
export function HourStepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const step = (icon: "remove" | "add", to: number) => (
    <Pressable accessibilityLabel={`${label} ${icon === "add" ? "later" : "earlier"}`} disabled={to < min || to > max} onPress={() => onChange(to)} hitSlop={6} style={{ padding: 10, opacity: to < min || to > max ? 0.3 : 1 }}>
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flex: 1 }}>
      <T variant="caption" muted style={{ marginBottom: 6 }}>{label}</T>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, height: 46 }}>
        {step("remove", value - 1)}
        <T variant="strong">{hourLabel(value)}</T>
        {step("add", value + 1)}
      </View>
    </View>
  );
}

const STEPS = [10, 15, 20, 30, 40, 45, 60, 75, 90, 120, 150, 180, 240];
export const minutesLabel = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ""}`);

/** "– 45 min +" in the steps barbers actually use. */
export function MinutesStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const down = [...STEPS].reverse().find((s) => s < value);
  const up = STEPS.find((s) => s > value);
  const btn = (icon: "remove" | "add", to: number | undefined, label: string) => (
    <Pressable accessibilityLabel={label} disabled={to === undefined} onPress={() => to !== undefined && onChange(to)} hitSlop={6} style={{ padding: 10, opacity: to === undefined ? 0.3 : 1 }}>
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, height: 46, minWidth: 140 }}>
      {btn("remove", down, "Shorter")}
      <T variant="strong">{minutesLabel(value)}</T>
      {btn("add", up, "Longer")}
    </View>
  );
}

/** A labelled group inside a sheet. */
export function Field2({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <T variant="eyebrow" muted style={{ marginBottom: 8 }}>{label}</T>
      {children}
    </View>
  );
}
