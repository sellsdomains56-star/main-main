import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, shortDateTime, StatusTag, Table, Toolbar } from "../../components/admin";
import { Avatar, ErrorBox, Loading, Row, T, Tag, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import type { AdminOrderRow, AdminShopRow } from "../../lib/types";

type Tab = "shops" | "orders";

/** Partner barbershops (teams, private hire, delivery) and JB's Fresh Shop orders to ship. */
export default function Shops() {
  const [tab, setTab] = useState<Tab>("shops");
  const [shops, setShops] = useState<AdminShopRow[] | null>(null);
  const [orders, setOrders] = useState<AdminOrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    api.admin.shops().then(setShops, (e: Error) => setError(e.message));
    api.admin.orders().then(setOrders, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);
  const toShip = orders?.filter((o) => o.status === "paid").length ?? 0;

  return (
    <AdminPage title="Shops & orders" subtitle="Barbershops on the platform, and product orders from JB's Fresh Shop.">
      <Toolbar filter={{ value: tab, onChange: setTab, options: [{ value: "shops", label: `Barbershops${shops ? ` · ${shops.length}` : ""}` }, { value: "orders", label: `Orders${toShip ? ` · ${toShip} to ship` : ""}` }] }} />
      {error && <ErrorBox message={error} onRetry={load} />}
      {tab === "shops" ? (
        !shops ? <Loading /> : (
          <Table
            rows={shops}
            keyOf={(s) => s.id}
            onPress={(s) => router.push({ pathname: "/barbershop/[shopId]", params: { shopId: s.id } })}
            empty={{ icon: "storefront-outline", title: "No barbershops yet" }}
            columns={[
              {
                label: "Barbershop",
                flex: 1.6,
                render: (s) => (
                  <View>
                    <T variant="strong" numberOfLines={1}>{s.name}</T>
                    <T variant="small" muted numberOfLines={1}>{s.address}</T>
                  </View>
                ),
              },
              { label: "City", render: (s) => <T variant="caption">{s.city}</T> },
              {
                label: "Team",
                flex: 1.3,
                render: (s) => (
                  <Row gap={0}>
                    {s.team.slice(0, 5).map((b) => <View key={b.id} style={{ marginRight: -8 }}><Avatar uri={b.photoUrl} name={b.name} size={28} /></View>)}
                    <T variant="caption" style={{ marginLeft: 14 }}>{s.team.length}</T>
                  </Row>
                ),
              },
              { label: "Bookings · 30d", align: "right", render: (s) => <T variant="caption">{s.bookings30}</T> },
              { label: "Hires", align: "right", render: (s) => <T variant="caption">{s.hires}</T> },
              { label: "Offers", flex: 1.2, render: (s) => <Wrap gap={4}>{s.privateHire && <Tag label="Private hire" />}{s.delivery && <Tag label="Delivery" />}</Wrap> },
            ]}
          />
        )
      ) : !orders ? (
        <Loading />
      ) : (
        <Table
          rows={orders}
          keyOf={(o) => o.id}
          empty={{ icon: "cube-outline", title: "No orders yet" }}
          columns={[
            {
              label: "Customer",
              flex: 1.4,
              render: (o) => (
                <View>
                  <T variant="strong" numberOfLines={1}>{o.customer?.name ?? "—"}</T>
                  <T variant="small" muted numberOfLines={1}>{o.address}</T>
                </View>
              ),
            },
            { label: "Placed", render: (o) => <T variant="caption">{shortDateTime(o.createdAt)}</T> },
            { label: "Items", align: "right", render: (o) => <T variant="caption">{o.items}</T> },
            { label: "How", flex: 1.2, render: (o) => <T variant="caption">{o.fulfilment === "delivery" ? `Delivery · ${o.shop?.name ?? ""}` : "Shipping"}</T> },
            { label: "Total", align: "right", render: (o) => <T variant="caption">{money(o.amount, o.currency)}</T> },
            { label: "Status", render: (o) => <StatusTag status={o.status} /> },
          ]}
        />
      )}
    </AdminPage>
  );
}
