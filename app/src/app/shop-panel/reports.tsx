import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { AdminPage, Bars, Kpi, Table, useWide } from "../../components/admin";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, Card, ErrorBox, Field, IconLine, Loading, Pill, Row, Segmented, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import type { ShopReport } from "../../lib/types";

type Period = ShopReport["period"];

/** How the shop is doing: bookings, takings, walk-ins vs the app, no-shows, and how busy each barber is. */
export default function Reports() {
  const wide = useWide();
  const [period, setPeriod] = useState<Period>("week");
  const [r, setR] = useState<ShopReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    api.manage.reports(period).then(setR, (e: Error) => setError(e.message));
  }, [period]);
  useFocusEffect(load);

  const label = { today: "Today", week: "This week", month: "This month" }[period];
  return (
    <AdminPage title="Reports" subtitle={r ? `${label} · ${r.from === r.to ? r.from : `${r.from} to ${r.to}`} · includes what's already booked` : undefined}>
      <View style={{ maxWidth: 420, marginBottom: 16 }}>
        <Segmented value={period} onChange={setPeriod} options={[{ value: "today", label: "Today" }, { value: "week", label: "This week" }, { value: "month", label: "This month" }]} />
      </View>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!r ? (
        <Loading />
      ) : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Kpi dark label="Takings" value={money(r.totals.takings, r.currency)} sub={`${money(r.totals.appTakings, r.currency)} paid in the app`} />
            <Kpi label="Bookings" value={String(r.totals.bookings)} sub={`${r.totals.completed} done · ${r.totals.fromApp} from the app · ${r.totals.walkIns} walk-ins`} />
            <Kpi label="No-shows" value={String(r.totals.noShows)} sub={`${r.totals.cancelled} cancelled`} />
            <Kpi label="Busiest barber" value={r.byBarber[0]?.name.split(" ")[0] ?? "—"} sub={r.byBarber[0] ? `${r.byBarber[0].busyPercent}% of their hours booked` : undefined} />
          </View>
          <View style={{ flexDirection: wide ? "row" : "column", gap: 16, marginTop: 16 }}>
            {r.perDay.length > 1 && (
              <Card style={{ flex: 1.4, padding: 20 }}>
                <T variant="heading">Bookings per day</T>
                <T variant="caption" muted style={{ marginBottom: 14 }}>{label}</T>
                <Bars series={r.perDay} today={r.today} height={wide ? 180 : 120} />
              </Card>
            )}
            <Card style={{ flex: 1, padding: 20 }}>
              <T variant="heading" style={{ marginBottom: 10 }}>Most booked</T>
              {r.topServices.length === 0 && <T muted>Nothing booked yet.</T>}
              {r.topServices.map((s) => {
                const max = r.topServices[0]!.count;
                return (
                  <View key={s.name} style={{ marginBottom: 10 }}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <T variant="caption">{s.name}</T>
                      <T variant="caption" muted>{s.count}</T>
                    </Row>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface, marginTop: 4, overflow: "hidden" }}>
                      <View style={{ width: `${(s.count / max) * 100}%`, height: 6, borderRadius: 3, backgroundColor: colors.ink }} />
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>
          <T variant="title" style={{ fontSize: 20, marginTop: 28, marginBottom: 12 }}>By barber</T>
          <Table
            rows={r.byBarber}
            keyOf={(b) => b.id}
            empty={{ icon: "people-outline", title: "No barbers yet" }}
            columns={[
              { label: "Barber", flex: 1.6, render: (b) => <Row gap={10}><Avatar uri={b.photoUrl} name={b.name} size={34} /><T variant="strong" numberOfLines={1}>{b.name}</T></Row> },
              { label: "Bookings", align: "right", render: (b) => <T variant="caption">{b.bookings}</T> },
              { label: "Done", align: "right", render: (b) => <T variant="caption">{b.completed}</T> },
              { label: "Walk-ins", align: "right", render: (b) => <T variant="caption">{b.walkIns}</T> },
              { label: "No-shows", align: "right", render: (b) => <T variant="caption">{b.noShows}</T> },
              {
                label: "Busy", flex: 1.2,
                render: (b) => (
                  <Row gap={8} style={{ width: "100%" }}>
                    <View style={{ flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: colors.surface, overflow: "hidden" }}>
                      <View style={{ width: `${b.busyPercent}%`, height: 6, backgroundColor: colors.ink }} />
                    </View>
                    <T variant="small" muted>{b.busyPercent}%</T>
                  </Row>
                ),
              },
              { label: "Takings", align: "right", render: (b) => <T variant="caption">{money(b.takings, r.currency)}</T> },
            ]}
          />
          <BringBack />
        </>
      )}
    </AdminPage>
  );
}

const WEEKS = [4, 6, 8, 12];

/** "We miss you": one message to app clients who haven't been in for a while (and have nothing booked). */
function BringBack() {
  const [weeks, setWeeks] = useState(6);
  const [count, setCount] = useState<{ clients: number; lapsed: number } | null>(null);
  const [text, setText] = useState("It's been a while! Your chair is waiting — book this week and leave fresh.");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setCount(null);
    api.manage.lapsedClients(weeks).then(setCount, (e: Error) => setError(e.message));
  }, [weeks]);
  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api.manage.messageLapsed(weeks, text);
      setResult(`Sent to ${r.sent} ${r.sent === 1 ? "client" : "clients"}${r.skipped ? ` · ${r.skipped} skipped (messaged this week or offers off)` : ""}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card style={{ marginTop: 28, padding: 20 }}>
      <T variant="heading">Bring clients back</T>
      <T variant="caption" muted style={{ marginTop: 4, marginBottom: 12 }}>A message in the app, with your booking link, to clients who haven't been in for a while and have nothing booked.</T>
      <Wrap>{WEEKS.map((w) => <Pill key={w} label={`Not seen in ${w}+ weeks`} selected={weeks === w} onPress={() => { setWeeks(w); setResult(null); }} />)}</Wrap>
      <T variant="strong" style={{ marginTop: 12 }}>{count ? `${count.lapsed} of ${count.clients} app clients` : " "}</T>
      <Field label="Message" value={text} onChangeText={setText} multiline maxLength={400} style={{ marginTop: 10 }} />
      {error && <ErrorBox message={error} />}
      {result ? <IconLine icon="checkmark-circle-outline">{result}</IconLine> : <Button title={`Send to ${count?.lapsed ?? 0}`} icon="send" size="md" style={{ alignSelf: "flex-start" }} disabled={!count?.lapsed || text.trim().length < 5} loading={busy} onPress={send} />}
    </Card>
  );
}
