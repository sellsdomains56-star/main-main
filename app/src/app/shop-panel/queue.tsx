import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { AdminPage, Kpi, useWide } from "../../components/admin";
import { QrCode } from "../../components/QrCode";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, Field, IconLine, Loading, Pill, Row, T, Tag, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useShopPanel } from "../../lib/shopPanel";
import type { QueueItem, ShopQueue } from "../../lib/types";

const SERVICES = ["Haircut", "Skin fade", "Beard trim", "Haircut + beard", "Kids cut"];
const mins = (iso: string) => Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));

/** The front desk's walk-in queue: add people at the door, call them to a chair, mark them done. App customers get an alert. */
export default function Queue() {
  const wide = useWide();
  const { panel } = useShopPanel();
  const [q, setQ] = useState<ShopQueue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [service, setService] = useState(SERVICES[0]!);
  const [calling, setCalling] = useState<string | null>(null); // entry picking a barber
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.manage.queue().then(setQ, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);
  useEffect(() => {
    const t = setInterval(load, 15_000); // people join from the app too
    return () => clearInterval(t);
  }, [load]);

  const run = (fn: () => Promise<unknown>) => async () => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const row = (item: QueueItem, inChair: boolean) => (
    <Card key={item.id} style={{ marginBottom: 10 }}>
      <Row gap={12}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: inChair ? colors.ink : colors.surface, alignItems: "center", justifyContent: "center" }}>
          {inChair ? <Ionicons name="cut" size={16} color={colors.onInk} /> : <T variant="strong">{item.position}</T>}
        </View>
        <View style={{ flex: 1 }}>
          <Row gap={6}>
            <T variant="strong">{item.name}</T>
            {item.fromApp && <Tag label="App" icon="phone-portrait-outline" />}
          </Row>
          <T variant="caption" muted>
            {item.service} · {inChair ? `${item.status === "called" ? "Called" : "In the chair"}${item.barber ? ` with ${item.barber.name.split(" ")[0]}` : ""}` : `waiting ${mins(item.joinedAt)} min · ~${item.estimateMin} min to go`}
          </T>
        </View>
        {inChair ? (
          <Row gap={6}>
            {item.status === "called" && <Button title="Seated" size="sm" variant="secondary" onPress={run(() => api.manage.queueAction(item.id, "serve"))} />}
            <Button title="Done" size="sm" icon="checkmark" onPress={run(() => api.manage.queueAction(item.id, "done"))} />
          </Row>
        ) : (
          <Row gap={6}>
            <Button title="Call" size="sm" icon="megaphone-outline" onPress={() => setCalling(calling === item.id ? null : item.id)} />
            <Button title="Remove" size="sm" variant="ghost" onPress={run(() => api.manage.queueAction(item.id, "remove"))} />
          </Row>
        )}
      </Row>
      {calling === item.id && q && (
        <View style={{ marginTop: 12 }}>
          <T variant="caption" muted style={{ marginBottom: 8 }}>Who's cutting?</T>
          <Wrap>
            {q.team.map((b) => (
              <Pill key={b.id} label={b.name.split(" ")[0]!} icon={b.working ? "radio-button-on" : undefined} onPress={run(async () => { setCalling(null); await api.manage.queueAction(item.id, "call", b.id); })} />
            ))}
            <Pill label="Any chair" onPress={run(async () => { setCalling(null); await api.manage.queueAction(item.id, "call"); })} />
          </Wrap>
        </View>
      )}
    </Card>
  );

  return (
    <AdminPage
      title="Walk-in queue"
      subtitle={q ? (q.open ? `${q.chairs} ${q.chairs === 1 ? "chair" : "chairs"} working now` : "The shop is closed now") : undefined}
      actions={
        <Row gap={8}>
          <Button title="TV screen" icon="tv-outline" size="sm" variant="secondary" onPress={() => router.push("/queue-screen")} />
          <Button title="Check-in tablet" icon="tablet-portrait-outline" size="sm" variant="secondary" onPress={() => router.push("/check-in")} />
        </Row>
      }
    >
      {error && <ErrorBox message={error} onRetry={load} />}
      {!q ? (
        <Loading />
      ) : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Kpi dark label="Waiting" value={String(q.waiting.length)} sub={q.waiting.length ? `Next: ${q.waiting[0]!.name}` : "Nobody waiting"} />
            <Kpi label="In the chair" value={String(q.inChair.length)} />
            <Kpi label="Done today" value={String(q.doneToday)} sub="From the queue" />
          </View>
          <View style={{ flexDirection: wide ? "row" : "column", gap: 16, marginTop: 16, alignItems: "flex-start" }}>
            <View style={{ flex: 1.6, width: "100%" }}>
              <T variant="heading" style={{ marginBottom: 10 }}>In the chair</T>
              {q.inChair.length ? q.inChair.map((i) => row(i, true)) : <T muted style={{ marginBottom: 16 }}>Nobody called yet.</T>}
              <T variant="heading" style={{ marginTop: 8, marginBottom: 10 }}>Waiting</T>
              {q.waiting.length ? q.waiting.map((i) => row(i, false)) : <Card><EmptyState icon="people-outline" title="No queue" body="Walk-ins you add, and people who join from the app, appear here." /></Card>}
            </View>
            <View style={{ flex: 1, width: "100%", gap: 16 }}>
              <Card style={{ padding: 20 }}>
                <T variant="heading">Add a walk-in</T>
                <Field label="Name" value={name} onChangeText={setName} placeholder="First name is enough" style={{ marginTop: 12 }} />
                <Wrap>{SERVICES.map((s) => <Pill key={s} label={s} selected={service === s} onPress={() => setService(s)} />)}</Wrap>
                <Button title="Add to the queue" icon="person-add-outline" style={{ marginTop: 14 }} loading={busy} disabled={!name.trim()} onPress={run(async () => { await api.manage.addToQueue({ name: name.trim(), service }); setName(""); })} />
              </Card>
              {panel && (
                <Card style={{ padding: 20, alignItems: "center", borderRadius: radius.lg }}>
                  <T variant="heading">Queue from the street</T>
                  <T variant="caption" muted center style={{ marginTop: 4, marginBottom: 14 }}>Print this for the window: people scan it, join, and wait nearby.</T>
                  <QrCode value={panel.links.queue} size={170} label="QR code to join the queue" />
                  <View style={{ marginTop: 10 }}><IconLine icon="link-outline" muted>{panel.links.queue.replace(/^https?:\/\//, "")}</IconLine></View>
                </Card>
              )}
            </View>
          </View>
        </>
      )}
    </AdminPage>
  );
}
