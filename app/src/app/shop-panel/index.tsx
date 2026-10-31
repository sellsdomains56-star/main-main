import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useWide } from "../../components/admin";
import { addDays, atLocal, dayLabel, Field2, freeStarts, hhmm, hourLabel, minutesLabel, minutesOfDay, Sheet } from "../../components/shopPanel";
import { colors, fonts, radius } from "../../components/theme";
import { Avatar, Button, ErrorBox, Field, IconLine, Loading, Pill, Row, T, Tag, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import type { CalBlock, CalBooking, ShopCalendar } from "../../lib/types";

const PX = 1.6; // pixels per minute: 30 minutes = 48px
const COL_PHONE = 168;

type Draft = { kind: "booking"; barberId: string; serviceId?: string; startsAt?: string } | { kind: "block"; barberIds: string[]; startsAt?: string };

/** The day in the shop: every barber side by side, what's booked, what's free, what's blocked. Tap to add or change. */
export default function Calendar() {
  const wide = useWide();
  const [date, setDate] = useState<string | null>(null);
  const [cal, setCal] = useState<ShopCalendar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [open, setOpen] = useState<CalBooking | null>(null);
  const [openBlock, setOpenBlock] = useState<CalBlock | null>(null);
  const [today, setToday] = useState<string>("");
  const [now, setNow] = useState(() => Date.now()); // moves the red line on each refresh

  const load = useCallback(() => {
    api.manage.calendar(date ?? undefined).then((c) => {
      setCal(c);
      setNow(Date.now());
      if (!date) {
        setDate(c.date);
        setToday(c.date);
      }
    }, (e: Error) => setError(e.message));
  }, [date]);
  useFocusEffect(load);
  useEffect(() => {
    const t = setInterval(load, 60_000); // new app bookings appear on their own
    return () => clearInterval(t);
  }, [load]);

  if (!cal || !date) return <View style={{ padding: 24 }}>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</View>;

  const tz = cal.timeZone;
  const startMin = cal.openHour * 60;
  const endMin = cal.closeHour * 60;
  const height = (endMin - startMin) * PX;
  const nowMin = date === today ? minutesOfDay(now, tz) : -1;
  const cur = cal.currency;
  const visible = cal.bookings.filter((b) => b.status !== "cancelled" || b.noShow);

  const header = (
    <View style={{ paddingHorizontal: wide ? 28 : 16, paddingTop: wide ? 24 : 14 }}>
      <Row style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Row gap={8}>
          <NavBtn icon="chevron-back" label="Previous day" onPress={() => setDate(addDays(date, -1))} />
          <Pressable onPress={() => setDate(today)} accessibilityRole="button" style={{ paddingHorizontal: 14, height: 40, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, justifyContent: "center", backgroundColor: date === today ? colors.ink : colors.card }}>
            <T variant="caption" color={date === today ? colors.onInk : colors.text} style={{ fontFamily: fonts.semibold }}>Today</T>
          </Pressable>
          <NavBtn icon="chevron-forward" label="Next day" onPress={() => setDate(addDays(date, 1))} />
          <T variant="title" style={{ fontSize: wide ? 24 : 19, marginLeft: 6 }}>{dayLabel(date)}</T>
        </Row>
        <Row gap={8}>
          <Button title="Block time" icon="remove-circle-outline" variant="secondary" size="sm" onPress={() => setDraft({ kind: "block", barberIds: [] })} />
          <Button title="New booking" icon="add" size="sm" onPress={() => setDraft({ kind: "booking", barberId: cal.barbers.find((b) => b.working)?.id ?? cal.barbers[0]?.id ?? "" })} />
        </Row>
      </Row>
      <Row gap={8} style={{ marginTop: 14, flexWrap: "wrap" }}>
        <Stat label="Booked" value={String(cal.summary.bookings)} />
        <Stat label="Done" value={String(cal.summary.done)} />
        <Stat label="Walk-ins" value={String(cal.summary.walkIns)} />
        <Stat label="No-shows" value={String(cal.summary.noShows)} />
        <Stat label="Takings" value={money(cal.summary.takings, cur)} />
      </Row>
      <Row gap={14} style={{ marginTop: 12, flexWrap: "wrap" }}>
        <Legend swatch={{ backgroundColor: colors.ink }} label="Booked in the app" />
        <Legend swatch={{ backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.ink }} label="Walk-in / phone" />
        <Legend swatch={{ backgroundColor: colors.surfaceStrong }} label="Blocked" />
        <Legend swatch={{ backgroundColor: colors.surface }} label="Not working" />
      </Row>
      {error && <View style={{ marginTop: 10 }}><ErrorBox message={error} /></View>}
    </View>
  );

  const columns = cal.barbers.map((b) => {
    const hours = b.hours;
    const mine = visible.filter((x) => x.barberId === b.id);
    const blocks = cal.blocks.filter((x) => x.barberId === b.id);
    const offBefore = Math.max(0, (hours.openHour * 60 - startMin) * PX);
    const offAfter = Math.max(0, (endMin - hours.closeHour * 60) * PX);
    return (
      <View key={b.id} style={{ flex: wide ? 1 : undefined, width: wide ? undefined : COL_PHONE, minWidth: wide ? 150 : undefined, borderLeftWidth: 1, borderLeftColor: colors.border }}>
        <View style={{ height, position: "relative" }}>
          {/* Empty half-hours: tap to book or block. */}
          {Array.from({ length: (endMin - startMin) / 30 }, (_, i) => {
            const m = startMin + i * 30;
            return (
              <Pressable
                key={m}
                disabled={!b.working}
                onPress={() => setDraft({ kind: "booking", barberId: b.id, startsAt: atLocal(date, m, tz) })}
                accessibilityLabel={`${b.name} at ${hourLabel(Math.floor(m / 60)).slice(0, 3)}${String(m % 60).padStart(2, "0")}`}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({ position: "absolute", top: i * 30 * PX, left: 0, right: 0, height: 30 * PX, borderTopWidth: 1, borderTopColor: m % 60 === 0 ? colors.border : "rgba(0,0,0,0.04)", backgroundColor: (hovered || pressed) && b.working ? colors.accentSoft : "transparent" })}
              />
            );
          })}
          {!b.working ? (
            <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, alignItems: "center", paddingTop: 24 }}>
              <T variant="caption" muted>{b.offline ? "Off in the app" : b.dayOff ? "Day off" : "Not working"}</T>
            </View>
          ) : (
            <>
              {offBefore > 0 && <View pointerEvents="none" style={{ position: "absolute", top: 0, height: offBefore, left: 0, right: 0, backgroundColor: colors.surface }} />}
              {offAfter > 0 && <View pointerEvents="none" style={{ position: "absolute", bottom: 0, height: offAfter, left: 0, right: 0, backgroundColor: colors.surface }} />}
            </>
          )}
          {blocks.map((k) => {
            const top = (minutesOfDay(k.startsAt, tz) - startMin) * PX;
            const h = Math.max(18, ((Date.parse(k.endsAt) - Date.parse(k.startsAt)) / 60_000) * PX - 2);
            return (
              <Pressable key={k.id} onPress={() => setOpenBlock(k)} accessibilityLabel={`${k.reason}, ${hhmm(k.startsAt, tz)}`} style={[{ position: "absolute", top, height: h, left: 3, right: 3, borderRadius: 8, padding: 6, backgroundColor: colors.surfaceStrong, overflow: "hidden" }, Platform.OS === "web" && ({ backgroundImage: "repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 6px, transparent 6px 12px)" } as object)]}>
                <T variant="small" style={{ fontFamily: fonts.semibold }} numberOfLines={1}>{k.reason}</T>
                <T variant="small" muted numberOfLines={1}>{hhmm(k.startsAt, tz)}–{hhmm(k.endsAt, tz)}</T>
              </Pressable>
            );
          })}
          {mine.map((x) => {
            const top = (minutesOfDay(x.startsAt, tz) - startMin) * PX;
            const h = Math.max(22, x.durationMin * PX - 2);
            const app = x.source === "app";
            const done = x.status === "completed";
            const ink = app && !done && !x.noShow;
            return (
              <Pressable
                key={x.id}
                onPress={() => setOpen(x)}
                accessibilityLabel={`${x.client}, ${x.service}, ${hhmm(x.startsAt, tz)}`}
                style={{ position: "absolute", top, height: h, left: 3, right: 3, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5, overflow: "hidden",
                  backgroundColor: ink ? colors.ink : done || x.noShow ? colors.surface : colors.card, borderWidth: ink ? 0 : 1.5, borderColor: done || x.noShow ? colors.border : colors.ink, opacity: x.noShow ? 0.6 : 1 }}
              >
                <Row gap={4}>
                  {done && <Ionicons name="checkmark-circle" size={12} color={colors.text} />}
                  {x.noShow && <Ionicons name="close-circle" size={12} color={colors.danger} />}
                  <T variant="small" color={ink ? colors.onInk : colors.text} style={{ fontFamily: fonts.semibold, flex: 1, textDecorationLine: x.noShow ? "line-through" : "none" }} numberOfLines={1}>{x.client}</T>
                </Row>
                {h > 34 && <T variant="small" color={ink ? colors.inkMuted : colors.muted} numberOfLines={1}>{hhmm(x.startsAt, tz)} · {x.service}</T>}
                {h > 56 && <T variant="small" color={ink ? colors.inkMuted : colors.muted} numberOfLines={1}>{app ? "App" : "Walk-in"} · {money(x.amount, x.currency)}</T>}
              </Pressable>
            );
          })}
          {cal.hires.map((hire) => (
            <View key={hire.id} pointerEvents="none" style={{ position: "absolute", top: (minutesOfDay(hire.startsAt, tz) - startMin) * PX, height: ((Date.parse(hire.endsAt) - Date.parse(hire.startsAt)) / 60_000) * PX, left: 0, right: 0, backgroundColor: "rgba(11,11,11,0.08)", borderTopWidth: 2, borderTopColor: colors.ink, padding: 6 }}>
              <T variant="small" style={{ fontFamily: fonts.semibold }}>Private hire · {hire.guests} guests</T>
            </View>
          ))}
          {nowMin >= startMin && nowMin <= endMin && <View pointerEvents="none" style={{ position: "absolute", top: (nowMin - startMin) * PX, left: 0, right: 0, height: 2, backgroundColor: colors.danger }} />}
        </View>
      </View>
    );
  });

  const heads = (
    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card }}>
      <View style={{ width: 56 }} />
      {cal.barbers.map((b) => (
        <View key={b.id} style={{ flex: wide ? 1 : undefined, width: wide ? undefined : COL_PHONE, minWidth: wide ? 150 : undefined, paddingVertical: 10, paddingHorizontal: 8, borderLeftWidth: 1, borderLeftColor: colors.border }}>
          <Row gap={8}>
            <Avatar uri={b.photoUrl} name={b.name} size={30} />
            <View style={{ flex: 1 }}>
              <T variant="caption" style={{ fontFamily: fonts.semibold }} numberOfLines={1}>{b.name}</T>
              <T variant="small" muted numberOfLines={1}>{b.working ? `${hourLabel(b.hours.openHour)}–${hourLabel(b.hours.closeHour)} · ${visible.filter((x) => x.barberId === b.id && x.status !== "cancelled").length} booked` : b.offline ? "Off in the app" : "Off today"}</T>
            </View>
          </Row>
        </View>
      ))}
    </View>
  );

  const times = (
    <View style={{ width: 56, height }}>
      {Array.from({ length: cal.closeHour - cal.openHour + 1 }, (_, i) => (
        <T key={i} variant="small" muted style={{ position: "absolute", top: i * 60 * PX - 7, right: 8 }}>{hourLabel(cal.openHour + i)}</T>
      ))}
    </View>
  );

  const grid = (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
      {heads}
      <View style={{ flexDirection: "row", paddingTop: 8, paddingBottom: 8 }}>
        {times}
        {columns}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {header}
        <View style={{ paddingHorizontal: wide ? 28 : 8, marginTop: 16 }}>
          {wide ? grid : <ScrollView horizontal showsHorizontalScrollIndicator={false}>{grid}</ScrollView>}
        </View>
      </ScrollView>

      {draft?.kind === "booking" && <NewBooking cal={cal} draft={draft} onClose={() => setDraft(null)} onDone={() => { setDraft(null); load(); }} />}
      {draft?.kind === "block" && <BlockTime cal={cal} draft={draft} onClose={() => setDraft(null)} onDone={() => { setDraft(null); load(); }} />}
      {open && <BookingSheet cal={cal} booking={open} onClose={() => setOpen(null)} onDone={() => { setOpen(null); load(); }} />}
      <Sheet visible={!!openBlock} title={openBlock?.reason ?? ""} onClose={() => setOpenBlock(null)}>
        {openBlock && (
          <>
            <T muted>{cal.barbers.find((b) => b.id === openBlock.barberId)?.name} · {hhmm(openBlock.startsAt, tz)}–{hhmm(openBlock.endsAt, tz)}</T>
            <T variant="caption" muted style={{ marginTop: 8 }}>Customers can't book this time in the app.</T>
            <Button title="Remove block" icon="trash-outline" variant="danger" size="md" style={{ marginTop: 16 }} onPress={() => api.manage.unblock(openBlock.id).then(() => { setOpenBlock(null); load(); }, (e: Error) => setError(e.message))} />
          </>
        )}
      </Sheet>
    </View>
  );
}

function NavBtn({ icon, label, onPress }: { icon: "chevron-back" | "chevron-forward"; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} accessibilityRole="button" style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 8 }}>
      <T variant="small" muted>{label}</T>
      <T variant="strong">{value}</T>
    </View>
  );
}

function Legend({ swatch, label }: { swatch: object; label: string }) {
  return (
    <Row gap={6}>
      <View style={[{ width: 14, height: 14, borderRadius: 4 }, swatch]} />
      <T variant="small" muted>{label}</T>
    </Row>
  );
}

/** Walk-in or phone booking: barber, service (its time and price), a free time, the client. */
function NewBooking({ cal, draft, onClose, onDone }: { cal: ShopCalendar; draft: { barberId: string; startsAt?: string }; onClose: () => void; onDone: () => void }) {
  const [barberId, setBarberId] = useState(draft.barberId);
  const barber = cal.barbers.find((b) => b.id === barberId);
  const [serviceId, setServiceId] = useState(barber?.services[0]?.id ?? "");
  const service = barber?.services.find((s) => s.id === serviceId) ?? barber?.services[0];
  const durationMin = service?.durationMin;
  const starts = durationMin ? freeStarts(cal, barberId, durationMin) : [];
  const [startsAt, setStartsAt] = useState(draft.startsAt);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tz = cal.timeZone;
  const chosen = startsAt && starts.includes(startsAt) ? startsAt : undefined;

  const save = async () => {
    if (!service || !chosen) return;
    setBusy(true);
    setError(null);
    try {
      await api.manage.addBooking({ barberId, serviceId: service.id, startsAt: chosen, name: name.trim(), phone: phone.trim(), notes: notes.trim() });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible title="New booking" onClose={onClose} wide>
      <Field2 label="Barber">
        <Wrap>{cal.barbers.filter((b) => b.working).map((b) => <Pill key={b.id} label={b.name.split(" ")[0]!} selected={b.id === barberId} onPress={() => { setBarberId(b.id); setServiceId(b.services[0]?.id ?? ""); }} />)}</Wrap>
      </Field2>
      <Field2 label="Service">
        <Wrap>{barber?.services.map((s) => <Pill key={s.id} label={`${s.name} · ${minutesLabel(s.durationMin)} · ${money(s.price, cal.currency)}`} selected={s.id === service?.id} onPress={() => setServiceId(s.id)} />)}</Wrap>
      </Field2>
      <Field2 label={`Time · ${dayLabel(cal.date)}`}>
        {starts.length ? <Wrap gap={6}>{starts.map((t) => <Pill key={t} label={hhmm(t, tz)} selected={t === chosen} onPress={() => setStartsAt(t)} />)}</Wrap> : <T muted>No free time left for this service today. Try another barber or day.</T>}
      </Field2>
      <Field label="Client's name" value={name} onChangeText={setName} placeholder="e.g. Ahmed" />
      <Field label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+971 …" />
      <Field label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="e.g. same as last time" />
      <IconLine icon="information-circle-outline" muted>Paid at the shop — no Always Fresh fee. The app won't offer this time to anyone else.</IconLine>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
      <Button title={chosen ? `Book ${hhmm(chosen, tz)}` : "Pick a time"} onPress={save} loading={busy} disabled={!chosen || !name.trim()} style={{ marginTop: 16 }} />
    </Sheet>
  );
}

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];
const REASONS = ["Lunch", "Break", "Training", "Personal", "Meeting"];

/** Breaks and blocked time: one barber or the whole team. */
function BlockTime({ cal, draft, onClose, onDone }: { cal: ShopCalendar; draft: { barberIds: string[]; startsAt?: string }; onClose: () => void; onDone: () => void }) {
  const working = cal.barbers.filter((b) => b.working);
  const [ids, setIds] = useState<string[]>(draft.barberIds.length ? draft.barberIds : working.map((b) => b.id).slice(0, 1));
  const tz = cal.timeZone;
  const [openedAt] = useState(() => Date.now());
  const starts = useMemo(() => {
    const out: string[] = [];
    for (let m = cal.openHour * 60; m < cal.closeHour * 60; m += 15) out.push(atLocal(cal.date, m, tz));
    return out.filter((t) => Date.parse(t) > openedAt - 15 * 60_000);
  }, [cal, tz, openedAt]);
  const [startsAt, setStartsAt] = useState(draft.startsAt ?? starts[0]);
  const [minutes, setMinutes] = useState(60);
  const [reason, setReason] = useState("Lunch");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const all = ids.length === working.length;

  const save = async () => {
    if (!startsAt) return;
    setBusy(true);
    setError(null);
    try {
      await api.manage.block({ barberIds: ids, startsAt, endsAt: new Date(Date.parse(startsAt) + minutes * 60_000).toISOString(), reason: reason.trim() || "Blocked" });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible title="Block time" onClose={onClose} wide>
      <Field2 label="Who">
        <Wrap>
          <Pill label="Everyone" selected={all} onPress={() => setIds(all ? [] : working.map((b) => b.id))} />
          {working.map((b) => <Pill key={b.id} label={b.name.split(" ")[0]!} selected={ids.includes(b.id)} onPress={() => setIds((x) => (x.includes(b.id) ? x.filter((y) => y !== b.id) : [...x, b.id]))} />)}
        </Wrap>
      </Field2>
      <Field2 label={`From · ${dayLabel(cal.date)}`}>
        <Wrap gap={6}>{starts.map((t) => <Pill key={t} label={hhmm(t, tz)} selected={t === startsAt} onPress={() => setStartsAt(t)} />)}</Wrap>
      </Field2>
      <Field2 label="For">
        <Wrap>{DURATIONS.map((d) => <Pill key={d} label={minutesLabel(d)} selected={d === minutes} onPress={() => setMinutes(d)} />)}</Wrap>
      </Field2>
      <Field2 label="Why">
        <Wrap>{REASONS.map((r) => <Pill key={r} label={r} selected={r === reason} onPress={() => setReason(r)} />)}</Wrap>
      </Field2>
      <Field label="Or write your own" value={REASONS.includes(reason) ? "" : reason} onChangeText={setReason} placeholder="e.g. Photo shoot" />
      <IconLine icon="information-circle-outline" muted>Customers can't book blocked time in the app. Existing bookings stay — move them if needed.</IconLine>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
      <Button title={startsAt ? `Block ${hhmm(startsAt, tz)}–${hhmm(Date.parse(startsAt) + minutes * 60_000, tz)}` : "Pick a time"} onPress={save} loading={busy} disabled={!ids.length || !startsAt} style={{ marginTop: 16 }} />
    </Sheet>
  );
}

/** One booking: who, what, when — mark done or no-show, move it, or cancel. */
function BookingSheet({ cal, booking: b, onClose, onDone }: { cal: ShopCalendar; booking: CalBooking; onClose: () => void; onDone: () => void }) {
  const tz = cal.timeZone;
  const [mode, setMode] = useState<"view" | "move" | "cancel">("view");
  const [to, setTo] = useState(b.barberId);
  const [at, setAt] = useState<string | undefined>();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const barber = cal.barbers.find((x) => x.id === b.barberId);
  const target = cal.barbers.find((x) => x.id === to);
  const sameService = target?.services.find((s) => s.name.toLowerCase() === b.service.toLowerCase());
  const starts = useMemo(() => (target && sameService ? freeStarts(cal, to, sameService.durationMin, b.id) : []), [cal, to, target, sameService, b.id]);
  const upcoming = b.status === "confirmed" || b.status === "on_the_way";
  const [openedAt] = useState(() => Date.now());
  const started = Date.parse(b.startsAt) <= openedAt;

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet visible title={b.client} onClose={onClose} wide={mode === "move"}>
      <Row gap={6} style={{ flexWrap: "wrap", marginBottom: 12 }}>
        <Tag label={b.source === "app" ? "Booked in the app" : "Walk-in / phone"} tone={b.source === "app" ? "dark" : "neutral"} />
        <Tag label={b.noShow ? "No-show" : b.status === "completed" ? "Done" : b.status === "cancelled" ? "Cancelled" : "Upcoming"} tone={b.noShow ? "danger" : "neutral"} />
      </Row>
      <View style={{ gap: 6 }}>
        <IconLine icon="cut-outline">{b.service} · {minutesLabel(b.durationMin)} · {money(b.amount, b.currency)} {b.source === "app" ? "(paid in the app)" : "(pay at the shop)"}</IconLine>
        <IconLine icon="time-outline">{hhmm(b.startsAt, tz)}–{hhmm(b.endsAt, tz)} with {barber?.name}</IconLine>
        {!!b.phone && <IconLine icon="call-outline">{b.phone}</IconLine>}
        {b.locationType === "home" && <IconLine icon="home-outline">Home visit · {b.address}</IconLine>}
        {!!b.notes && <IconLine icon="document-text-outline">{b.notes}</IconLine>}
      </View>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}

      {upcoming && mode === "view" && (
        <View style={{ marginTop: 18, gap: 8 }}>
          <Row gap={8}>
            <Button title="Done" icon="checkmark" size="md" style={{ flex: 1 }} loading={busy === "done"} onPress={() => run("done", () => api.manage.act(b.id, "done"))} />
            <Button title="No-show" icon="close" size="md" variant="secondary" style={{ flex: 1 }} disabled={!started} loading={busy === "no_show"} onPress={() => run("no_show", () => api.manage.act(b.id, "no_show"))} />
          </Row>
          <Row gap={8}>
            <Button title="Move" icon="swap-horizontal" size="md" variant="secondary" style={{ flex: 1 }} onPress={() => setMode("move")} />
            <Button title="Cancel" icon="trash-outline" size="md" variant="danger" style={{ flex: 1 }} onPress={() => setMode("cancel")} />
          </Row>
          {!started && <T variant="small" muted>No-show can be marked once the appointment time has started.</T>}
        </View>
      )}

      {mode === "move" && (
        <View style={{ marginTop: 18 }}>
          <Field2 label="Move to">
            <Wrap>{cal.barbers.filter((x) => x.working).map((x) => <Pill key={x.id} label={x.name.split(" ")[0]!} selected={x.id === to} onPress={() => { setTo(x.id); setAt(undefined); }} />)}</Wrap>
          </Field2>
          <Field2 label="New time">
            {!sameService ? <T muted>{target?.name.split(" ")[0]} doesn't offer {b.service}.</T> : starts.length ? <Wrap gap={6}>{starts.map((t) => <Pill key={t} label={hhmm(t, tz)} selected={t === at} onPress={() => setAt(t)} />)}</Wrap> : <T muted>No free time left today.</T>}
          </Field2>
          {b.source === "app" && <IconLine icon="notifications-outline" muted>The customer gets an alert with the new time.</IconLine>}
          <Row gap={8} style={{ marginTop: 14 }}>
            <Button title="Back" variant="secondary" size="md" onPress={() => setMode("view")} style={{ flex: 1 }} />
            <Button title={at ? `Move to ${hhmm(at, tz)}` : "Pick a time"} size="md" disabled={!at} loading={busy === "move"} onPress={() => at && run("move", () => api.manage.move(b.id, to, at))} style={{ flex: 1.4 }} />
          </Row>
        </View>
      )}

      {mode === "cancel" && (
        <View style={{ marginTop: 18 }}>
          <Field label="Message to the client (optional)" value={reason} onChangeText={setReason} placeholder="e.g. Barber unwell — sorry!" />
          <T variant="caption" muted>{b.source === "app" ? "They get a full refund and an alert." : "It's removed from the calendar."}</T>
          <Row gap={8} style={{ marginTop: 14 }}>
            <Button title="Keep it" variant="secondary" size="md" onPress={() => setMode("view")} style={{ flex: 1 }} />
            <Button title={b.source === "app" ? "Cancel & refund" : "Cancel booking"} variant="danger" size="md" loading={busy === "cancel"} onPress={() => run("cancel", () => api.manage.act(b.id, "cancel", reason.trim()))} style={{ flex: 1.4 }} />
          </Row>
        </View>
      )}
    </Sheet>
  );
}
