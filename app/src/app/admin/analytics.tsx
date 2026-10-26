import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, Kpi, sumText, Table, useWide } from "../../components/admin";
import { colors } from "../../components/theme";
import { Avatar, Card, ErrorBox, Loading, Row, Segmented, T } from "../../components/ui";
import { api } from "../../lib/api";
import type { AdminAnalytics } from "../../lib/types";

const RANGES = [{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "90", label: "90 days" }] as const;
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** How the marketplace is doing: conversion, repeat customers, cities, services and when people book. */
export default function Analytics() {
  const wide = useWide();
  const [days, setDays] = useState<"7" | "30" | "90">("30");
  const [a, setA] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    api.admin.analytics(Number(days)).then(setA, (e: Error) => setError(e.message));
  }, [days]);
  useFocusEffect(load);

  return (
    <AdminPage title="Analytics" subtitle={`Bookings made in the app in the last ${days} days`}>
      <View style={{ maxWidth: 360, marginBottom: 16 }}><Segmented value={days} onChange={setDays} options={RANGES.map((r) => ({ ...r }))} /></View>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!a ? <Loading /> : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Kpi dark label="Paid bookings" value={String(a.bookings.paid)} sub={`${a.bookings.conversion}% of ${a.bookings.made} started were paid`} />
            <Kpi label="Repeat customers" value={`${a.customers.repeatRate}%`} sub="have booked twice or more" />
            <Kpi label="Active customers" value={String(a.customers.active)} sub={`${a.customers.firstTime} first-timers · ${a.customers.returning} returning`} />
            <Kpi label="Cancellations" value={`${a.bookings.cancelRate}%`} sub={`${a.bookings.cancelled} bookings`} />
            <Kpi label="Average booking" value={sumText(a.averageBooking)} sub={`booked ${a.leadTimeHours} h ahead (median)`} />
            <Kpi label="New accounts" value={String(a.customers.newAccounts)} />
          </View>
          <View style={{ flexDirection: wide ? "row" : "column", gap: 16, marginTop: 16 }}>
            <Card style={{ flex: 1, padding: 20 }}>
              <T variant="heading">When people book</T>
              <T variant="caption" muted style={{ marginBottom: 14 }}>Appointments by hour (local time)</T>
              <Spark values={a.byHour.slice(7, 24)} labels={Array.from({ length: 17 }, (_, i) => `${i + 7}`)} />
              <T variant="caption" muted style={{ marginTop: 18, marginBottom: 14 }}>By day of the week</T>
              <Spark values={[1, 2, 3, 4, 5, 6, 0].map((d) => a.byWeekday[d]!)} labels={[1, 2, 3, 4, 5, 6, 0].map((d) => WEEK[d]!)} />
            </Card>
            <Card style={{ flex: 1, padding: 20 }}>
              <T variant="heading" style={{ marginBottom: 10 }}>Most booked services</T>
              {a.byService.map((s) => (
                <View key={s.name} style={{ marginBottom: 10 }}>
                  <Row style={{ justifyContent: "space-between" }}><T variant="caption">{s.name}</T><T variant="caption" muted>{s.count}</T></Row>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surface, marginTop: 4, overflow: "hidden" }}>
                    <View style={{ width: `${(s.count / (a.byService[0]?.count || 1)) * 100}%`, height: 6, backgroundColor: colors.ink }} />
                  </View>
                </View>
              ))}
            </Card>
          </View>
          <View style={{ flexDirection: wide ? "row" : "column", gap: 16, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <T variant="title" style={{ fontSize: 20, marginBottom: 12 }}>Cities</T>
              <Table rows={a.byCity} keyOf={(c) => c.city} empty={{ icon: "map-outline", title: "No bookings yet" }} columns={[
                { label: "City", flex: 1.4, render: (c) => <T variant="strong">{c.city}</T> },
                { label: "Bookings", align: "right", render: (c) => <T variant="caption">{c.bookings}</T> },
                { label: "Revenue", flex: 1.4, align: "right", render: (c) => <T variant="caption">{sumText(c.revenue)}</T> },
              ]} />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="title" style={{ fontSize: 20, marginBottom: 12 }}>Busiest barbers</T>
              <Table rows={a.topBarbers} keyOf={(b) => b.id} empty={{ icon: "cut-outline", title: "No bookings yet" }} columns={[
                { label: "Barber", flex: 1.8, render: (b) => <Row gap={10}><Avatar uri={b.photoUrl} name={b.name} size={30} /><View><T variant="strong">{b.name}</T><T variant="small" muted>{b.city}</T></View></Row> },
                { label: "Bookings", align: "right", render: (b) => <T variant="caption">{b.bookings}</T> },
              ]} />
            </View>
          </View>
        </>
      )}
    </AdminPage>
  );
}

/** Thin bars with a label under each. */
function Spark({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <View>
      <View style={{ height: 90, flexDirection: "row", alignItems: "flex-end", gap: 3, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {values.map((v, i) => <View key={i} accessibilityLabel={`${labels[i]}: ${v}`} style={{ flex: 1, height: `${Math.max(2, (v / max) * 100)}%`, backgroundColor: v === max ? colors.ink : colors.faint, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />)}
      </View>
      <View style={{ flexDirection: "row", gap: 3, marginTop: 4 }}>
        {labels.map((l, i) => <T key={i} variant="small" muted center style={{ flex: 1, fontSize: 10 }}>{l}</T>)}
      </View>
    </View>
  );
}
