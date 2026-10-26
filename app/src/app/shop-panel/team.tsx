import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { AdminPage, StatusTag, useWide } from "../../components/admin";
import { addDays, DAY_NAMES, HourStepper, hourLabel, WEEK } from "../../components/shopPanel";
import { colors, fonts, radius } from "../../components/theme";
import { Avatar, Button, Card, ErrorBox, Field, IconLine, Loading, Pill, Row, T, Tag, Wrap } from "../../components/ui";
import type { ShopMember, ShopPanel } from "../../lib/types";
import { api } from "../../lib/api";

/** The shop's barbers: when each one works, days off, and whether the app can book them right now. */
export default function Team() {
  const [panel, setPanel] = useState<ShopPanel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const load = useCallback(() => {
    api.manage.panel().then(setPanel, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  if (!panel) return <AdminPage title="Barbers">{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</AdminPage>;
  const replace = (m: ShopMember) => setPanel((p) => p && { ...p, team: p.team.map((x) => (x.id === m.id ? { ...x, ...m } : x)) });

  return (
    <AdminPage title="Barbers" subtitle="Set each barber's days and hours, book days off, and switch someone off in the app when they can't take bookings.">
      {error && <ErrorBox message={error} />}
      <View style={{ gap: 12 }}>
        {panel.team.map((m) => (
          <Member key={m.id} m={m} today={panel.today} open={editing === m.id} onToggle={() => setEditing(editing === m.id ? null : m.id)} onSaved={replace} />
        ))}
      </View>
      <AddBarber onAdded={load} />
    </AdminPage>
  );
}

function Member({ m, today, open, onToggle, onSaved }: { m: ShopMember; today: string; open: boolean; onToggle: () => void; onSaved: (m: ShopMember) => void }) {
  const wide = useWide();
  const [days, setDays] = useState(m.hours.workingDays);
  const [openH, setOpenH] = useState(m.hours.openHour);
  const [closeH, setCloseH] = useState(m.hours.closeHour);
  const [off, setOff] = useState(m.hours.timeOff);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const run = async (key: string, body: Parameters<typeof api.manage.updateBarber>[1]) => {
    setBusy(key);
    setError(null);
    try {
      const next = await api.manage.updateBarber(m.id, body);
      onSaved(next);
      if (key === "hours") setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const working = WEEK.filter((d) => m.hours.workingDays.includes(d)).map((d) => DAY_NAMES[d]).join(", ");
  const upcomingOff = m.hours.timeOff.filter((d) => d >= today);
  const calendar = Array.from({ length: 28 }, (_, i) => addDays(today, i));

  return (
    <Card style={{ padding: 18 }}>
      <View style={{ flexDirection: wide ? "row" : "column", gap: 14, alignItems: wide ? "center" : "flex-start" }}>
        <Row gap={12} style={{ flex: 1 }}>
          <Avatar uri={m.photoUrl} name={m.name} size={48} />
          <View style={{ flex: 1 }}>
            <Row gap={6} style={{ flexWrap: "wrap" }}>
              <T variant="strong">{m.name}</T>
              {m.status !== "live" && <StatusTag status={m.status} />}
              {m.offline && <Tag label="Off in the app" tone="danger" icon="pause" />}
              {!m.offline && m.status === "live" && <Tag label={m.workingToday ? "In today" : "Off today"} />}
            </Row>
            <T variant="caption" muted>{working} · {hourLabel(m.hours.openHour)}–{hourLabel(m.hours.closeHour)}{upcomingOff.length ? ` · ${upcomingOff.length} days off booked` : ""}</T>
            {m.email && <T variant="small" muted>{m.email}</T>}
          </View>
        </Row>
        <Row gap={8}>
          <Button title={m.offline ? "Turn on in app" : "Turn off in app"} icon={m.offline ? "play" : "pause"} size="sm" variant="secondary" loading={busy === "offline"} onPress={() => run("offline", { offline: !m.offline })} />
          <Button title={open ? "Close" : "Hours & days off"} size="sm" variant={open ? "ghost" : "primary"} onPress={onToggle} />
        </Row>
      </View>
      {m.offline && <View style={{ marginTop: 10 }}><IconLine icon="information-circle-outline" muted>Customers can see {m.name.split(" ")[0]}'s profile but can't book until you turn them back on. You can still add walk-ins.</IconLine></View>}
      {error && <View style={{ marginTop: 10 }}><ErrorBox message={error} /></View>}

      {open && (
        <View style={{ marginTop: 18, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
          <T variant="eyebrow" muted style={{ marginBottom: 8 }}>Working days</T>
          <Wrap>{WEEK.map((d) => <Pill key={d} label={DAY_NAMES[d]!} selected={days.includes(d)} onPress={() => { setSaved(false); setDays((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d])); }} />)}</Wrap>
          <Row gap={12} style={{ marginTop: 16, maxWidth: 420 }}>
            <HourStepper label="Starts" value={openH} min={0} max={closeH - 1} onChange={(v) => { setSaved(false); setOpenH(v); }} />
            <HourStepper label="Finishes" value={closeH} min={openH + 1} max={24} onChange={(v) => { setSaved(false); setCloseH(v); }} />
          </Row>
          <T variant="eyebrow" muted style={{ marginTop: 18, marginBottom: 8 }}>Days off · tap to book or remove</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, maxWidth: 560 }}>
            {calendar.map((d) => {
              const isOff = off.includes(d);
              const works = days.includes(new Date(`${d}T12:00:00Z`).getUTCDay());
              return (
                <Pressable key={d} disabled={!works} onPress={() => { setSaved(false); setOff((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d].sort())); }} accessibilityRole="button" accessibilityState={{ selected: isOff }} accessibilityLabel={`${d}${isOff ? ", day off" : ""}`}
                  style={{ width: 64, height: 50, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", backgroundColor: isOff ? colors.ink : works ? colors.card : colors.surface, borderWidth: works && !isOff ? 1 : 0, borderColor: colors.border }}>
                  <T variant="small" color={isOff ? colors.inkMuted : colors.muted}>{DAY_NAMES[new Date(`${d}T12:00:00Z`).getUTCDay()]}</T>
                  <T variant="caption" color={isOff ? colors.onInk : works ? colors.text : colors.faint} style={{ fontFamily: fonts.semibold, textDecorationLine: isOff ? "line-through" : "none" }}>{Number(d.slice(8))}</T>
                </Pressable>
              );
            })}
          </View>
          <Row gap={10} style={{ marginTop: 16 }}>
            <Button title="Save" size="md" loading={busy === "hours"} onPress={() => run("hours", { workingDays: days, openHour: openH, closeHour: closeH, timeOff: off })} />
            {saved && <Row gap={6}><Ionicons name="checkmark-circle" size={18} color={colors.text} /><T variant="caption">Saved — the app's free times are updated</T></Row>}
          </Row>
        </View>
      )}
    </Card>
  );
}

function AddBarber({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState<{ email: string; password: string; name: string } | null>(null);
  const add = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.manage.addBarber(name.trim(), email.trim());
      setLogin({ ...res.login, name: res.barber.name });
      setName("");
      setEmail("");
      onAdded();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card style={{ padding: 18, marginTop: 20 }}>
      <T variant="heading">Add a barber</T>
      <T variant="caption" muted style={{ marginTop: 2, marginBottom: 12 }}>We create their app account with your services and hours. Give them the first password; they can change it later.</T>
      {login ? (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: 14 }}>
          <T variant="strong">{login.name} is on your team</T>
          <T variant="caption" style={{ marginTop: 6 }}>Email: {login.email}</T>
          <T variant="caption">First password: <T variant="caption" style={{ fontFamily: fonts.bold }}>{login.password}</T></T>
          <T variant="small" muted style={{ marginTop: 6 }}>Shown once. JB checks new barbers before customers can book them.</T>
          <Button title="Add another" size="sm" variant="ghost" onPress={() => setLogin(null)} style={{ alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 0 }} />
        </View>
      ) : (
        <View style={{ maxWidth: 520 }}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Yusuf Karim" />
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="yusuf@example.com" />
          {error && <ErrorBox message={error} />}
          <Button title="Add to team" icon="person-add-outline" size="md" disabled={name.trim().length < 2 || !email.includes("@")} loading={busy} onPress={add} style={{ alignSelf: "flex-start" }} />
        </View>
      )}
    </Card>
  );
}

