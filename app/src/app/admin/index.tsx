import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, Bars, BookingTable, Kpi, StatusTag, sumText, useWide } from "../../components/admin";
import { colors } from "../../components/theme";
import { Avatar, Button, Card, ErrorBox, ListRow, Loading, Row, T } from "../../components/ui";
import { api } from "../../lib/api";
import type { AdminOverview } from "../../lib/types";

/** What's happening across the platform, and what needs the team today. */
export default function Overview() {
  const wide = useWide();
  const [o, setO] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    api.admin.overview().then(setO, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  if (!o) return <AdminPage title="Overview">{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</AdminPage>;

  const todo = [
    { n: o.barbers.pending, icon: "cut-outline" as const, one: "barber waiting for approval", many: "barbers waiting for approval", href: "/admin/barbers?status=pending" },
    { n: o.openTickets, icon: "chatbubbles-outline" as const, one: "support question to answer", many: "support questions to answer", href: "/admin/support" },
    { n: o.openReports, icon: "flag-outline" as const, one: "reported reel to check", many: "reported reels to check", href: "/admin/reports" },
    { n: o.ordersToShip, icon: "cube-outline" as const, one: "shop order to ship", many: "shop orders to ship", href: "/admin/shops" },
  ].filter((t) => t.n > 0);

  return (
    <AdminPage title="Overview" subtitle={`Last 30 days · JB fee ${o.feePercent}% of every booking`}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Kpi dark label="JB revenue · fees" value={sumText(o.revenue30.fees, "0")} sub={`On ${sumText(o.revenue30.bookings, "no")} of bookings`} icon="trending-up" />
        <Kpi label="Bookings" value={String(o.bookings.last30)} sub={`${o.bookings.last7} this week · ${o.bookings.today} today`} icon="calendar-outline" onPress={() => router.navigate("/admin/bookings")} />
        <Kpi label="Barbers live" value={String(o.barbers.live)} sub={`${o.barbers.pending} in review · ${o.barbers.suspended} paused`} icon="cut-outline" onPress={() => router.navigate("/admin/barbers")} />
        <Kpi label="Customers" value={String(o.customers.total)} sub={`${o.customers.new7} new this week · ${o.customers.members} Club members`} icon="people-outline" onPress={() => router.navigate("/admin/customers")} />
      </View>

      <View style={{ flexDirection: wide ? "row" : "column", gap: 16, marginTop: 16 }}>
        <Card style={{ flex: 1.4, padding: 20 }}>
          <T variant="heading">Bookings made per day</T>
          <T variant="caption" muted style={{ marginBottom: 14 }}>Last 14 days</T>
          <Bars series={o.series} height={wide ? 220 : 120} />
        </Card>
        <Card style={{ flex: 1, padding: 20 }}>
          <T variant="heading">Needs attention</T>
          {todo.length === 0 ? (
            <T muted style={{ marginTop: 10 }}>All clear — nothing waiting on the team.</T>
          ) : (
            <View style={{ marginTop: 6 }}>
              {todo.map((t) => (
                <ListRow key={t.href} icon={t.icon} title={`${t.n} ${t.n === 1 ? t.one : t.many}`} onPress={() => router.navigate(t.href as never)} />
              ))}
            </View>
          )}
          <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 6 }}>
            <T variant="eyebrow" muted>Other income · 30 days</T>
            <Row style={{ justifyContent: "space-between" }}><T variant="caption" muted>Private hire</T><T variant="caption">{sumText(o.revenue30.hires)}</T></Row>
            <Row style={{ justifyContent: "space-between" }}><T variant="caption" muted>JB's Fresh Shop</T><T variant="caption">{sumText(o.revenue30.shop)}</T></Row>
            <Row style={{ justifyContent: "space-between" }}><T variant="caption" muted>The Club & gift cards</T><T variant="caption">{sumText(o.revenue30.clubAndGifts)}</T></Row>
            <Row style={{ justifyContent: "space-between" }}><T variant="caption" muted>Cancelled bookings</T><T variant="caption">{o.bookings.cancelled30}</T></Row>
          </View>
        </Card>
      </View>

      {o.pendingBarbers.length > 0 && (
        <View style={{ marginTop: 28 }}>
          <Row style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <T variant="title" style={{ fontSize: 20 }}>New barbers to approve</T>
            <Button title="See all" size="sm" variant="ghost" onPress={() => router.navigate("/admin/barbers?status=pending" as never)} />
          </Row>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {o.pendingBarbers.map((b) => (
              <Card key={b.id} onPress={() => router.navigate({ pathname: "/admin/barbers/[id]", params: { id: b.id } })} style={{ flexGrow: 1, flexBasis: 260, padding: 16 }}>
                <Row gap={12}>
                  <Avatar uri={b.photoUrl} name={b.name} size={44} />
                  <View style={{ flex: 1 }}>
                    <T variant="strong">{b.name}</T>
                    <T variant="caption" muted>{b.city} · profile {b.profileDone}/{b.profileTotal}</T>
                  </View>
                  <StatusTag status={b.status} />
                </Row>
              </Card>
            ))}
          </View>
        </View>
      )}

      <View style={{ marginTop: 28 }}>
        <Row style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <T variant="title" style={{ fontSize: 20 }}>Latest bookings</T>
          <Button title="All bookings" size="sm" variant="ghost" onPress={() => router.navigate("/admin/bookings")} />
        </Row>
        <BookingTable rows={o.recent} />
      </View>
    </AdminPage>
  );
}
