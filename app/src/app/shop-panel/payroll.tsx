import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, Kpi, Table } from "../../components/admin";
import { Avatar, Button, Card, ErrorBox, IconLine, Loading, Pill, Row, Segmented, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import type { Payroll as PayrollData } from "../../lib/types";

type Period = PayrollData["period"];
const SHARES = [40, 50, 60, 70];

/** Who earned what: each barber's share of their services (after the JB fee on app bookings), their tips, and what the shop keeps. */
export default function Payroll() {
  const [period, setPeriod] = useState<Period>("month");
  const [p, setP] = useState<PayrollData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // barber id, or "shop" for the default split

  const load = useCallback(() => {
    api.manage.payroll(period).then(setP, (e: Error) => setError(e.message));
  }, [period]);
  useFocusEffect(load);

  const run = (fn: () => Promise<unknown>) => async () => {
    try {
      await fn();
      setEditing(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const label = { today: "Today", week: "This week", month: "This month" }[period];

  return (
    <AdminPage title="Pay & split" subtitle={p ? `${label} · ${p.from === p.to ? p.from : `${p.from} to ${p.to}`}` : undefined}>
      <View style={{ maxWidth: 420, marginBottom: 16 }}>
        <Segmented value={period} onChange={setPeriod} options={[{ value: "today", label: "Today" }, { value: "week", label: "This week" }, { value: "month", label: "This month" }]} />
      </View>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!p ? (
        <Loading />
      ) : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Kpi dark label="Barbers' pay" value={money(p.totals.barberPay, p.currency)} sub={`incl. ${money(p.totals.tips, p.currency)} tips`} />
            <Kpi label="The shop keeps" value={money(p.totals.shopKeeps, p.currency)} sub={p.totals.productCommission ? `incl. ${money(p.totals.productCommission, p.currency)} product commission` : undefined} />
            <Kpi label="Services" value={money(p.totals.services, p.currency)} sub={p.totals.lateFees ? `+ ${money(p.totals.lateFees, p.currency)} late-cancellation fees` : undefined} />
            <Kpi label="JB fee" value={money(p.totals.jbFee, p.currency)} sub="App bookings only" />
          </View>

          <Card style={{ marginTop: 16, padding: 20 }}>
            <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }} gap={10}>
              <View style={{ flex: 1, minWidth: 220 }}>
                <T variant="heading">The split</T>
                <T variant="caption" muted style={{ marginTop: 2 }}>Barbers get {p.defaultSharePercent}% of their services unless you set their own. Tips always go to them in full.</T>
              </View>
              {p.canEditSplit && editing !== "shop" && <Button title="Change" size="sm" variant="secondary" onPress={() => setEditing("shop")} />}
            </Row>
            {editing === "shop" && (
              <Wrap gap={8}>
                {SHARES.map((x) => <Pill key={x} label={`${x}% to the barber`} selected={p.defaultSharePercent === x} onPress={run(() => api.manage.updateSettings({ barberSharePercent: x }))} />)}
              </Wrap>
            )}
            {!p.canEditSplit && <View style={{ marginTop: 8 }}><IconLine icon="lock-closed-outline" muted>Only the shop's owner can change the split.</IconLine></View>}
          </Card>

          <View style={{ marginTop: 16 }}>
            <Table
              rows={p.rows}
              keyOf={(r) => r.id}
              empty={{ icon: "people-outline", title: "No barbers yet" }}
              columns={[
                { label: "Barber", flex: 1.6, render: (r) => <Row gap={10}><Avatar uri={r.photoUrl} name={r.name} size={32} /><View><T variant="strong">{r.name}</T><T variant="small" muted>{r.appointments} cuts · {r.walkIns} walk-ins</T></View></Row> },
                { label: "Services", align: "right", render: (r) => <T variant="caption">{money(r.services + r.lateFees, p.currency)}</T> },
                { label: "JB fee", align: "right", render: (r) => <T variant="caption">− {money(r.jbFee, p.currency)}</T> },
                {
                  label: "Split", align: "right", render: (r) => editing === r.id ? (
                    <Wrap gap={4}>
                      {SHARES.map((x) => <Pill key={x} label={`${x}%`} selected={r.sharePercent === x} onPress={run(() => api.manage.updateBarber(r.id, { sharePercent: x }))} />)}
                      {r.customShare && <Pill label="Shop default" onPress={run(() => api.manage.updateBarber(r.id, { sharePercent: null }))} />}
                    </Wrap>
                  ) : (
                    <Button title={`${r.sharePercent}%${r.customShare ? "" : " (default)"}`} size="sm" variant="ghost" disabled={!p.canEditSplit} onPress={() => setEditing(r.id)} />
                  ),
                },
                { label: "Tips", align: "right", render: (r) => <T variant="caption">{money(r.tips, p.currency)}</T> },
                { label: "Barber gets", align: "right", render: (r) => <T variant="strong">{money(r.barberPay, p.currency)}</T> },
                { label: "Shop keeps", align: "right", render: (r) => <T variant="caption">{money(r.shopKeeps, p.currency)}</T> },
              ]}
            />
          </View>
          <View style={{ marginTop: 14 }}><IconLine icon="information-circle-outline" muted>{p.note}</IconLine></View>
        </>
      )}
    </AdminPage>
  );
}
