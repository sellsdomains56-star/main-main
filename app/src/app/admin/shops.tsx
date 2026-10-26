import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, shortDateTime, StatusTag, Table, Toolbar } from "../../components/admin";
import { Sheet } from "../../components/shopPanel";
import { Avatar, Button, ErrorBox, Field, IconLine, Loading, Row, T, Tag, Wrap } from "../../components/ui";
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
  const [access, setAccess] = useState<AdminShopRow | null>(null);

  return (
    <AdminPage title="Shops & orders" subtitle="Barbershops on the platform, and product orders from JB's Fresh Shop.">
      <Toolbar filter={{ value: tab, onChange: setTab, options: [{ value: "shops", label: `Barbershops${shops ? ` · ${shops.length}` : ""}` }, { value: "orders", label: `Orders${toShip ? ` · ${toShip} to ship` : ""}` }] }} />
      {error && <ErrorBox message={error} onRetry={load} />}
      {tab === "shops" ? (
        !shops ? <Loading /> : (
          <Table
            rows={shops}
            keyOf={(s) => s.id}
            onPress={setAccess}
            empty={{ icon: "storefront-outline", title: "No barbershops yet" }}
            columns={[
              {
                label: "Barbershop",
                flex: 1.6,
                render: (s) => (
                  <View style={{ alignSelf: "stretch", paddingRight: 12 }}>
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
              { label: "Shop panel", flex: 1.2, render: (s) => (s.managers.length ? <T variant="caption" numberOfLines={1}>{s.managers.map((m) => m.name).join(", ")}</T> : <Tag label="Not set up" />) },
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
      {access && <ShopAccess shop={access} onClose={() => setAccess(null)} onChanged={load} />}
    </AdminPage>
  );
}

/** Who runs this barbershop in the shop panel: give an owner or manager access by the email of their app account. */
function ShopAccess({ shop, onClose, onChanged }: { shop: AdminShopRow; onClose: () => void; onChanged: () => void }) {
  const [managers, setManagers] = useState(shop.managers);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.admin.addManager(shop.id, email.trim());
      setManagers(res.managers);
      setEmail("");
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet visible title={shop.name} onClose={onClose}>
      <T variant="eyebrow" muted style={{ marginBottom: 8 }}>Shop panel access</T>
      {managers.length === 0 && <T muted style={{ marginBottom: 10 }}>No one yet.</T>}
      {managers.map((m) => (
        <Row key={m.id} style={{ justifyContent: "space-between", paddingVertical: 6 }}>
          <View style={{ flex: 1 }}>
            <T variant="strong">{m.name}</T>
            <T variant="small" muted>{m.email}</T>
          </View>
          <Button title="Remove" size="sm" variant="ghost" onPress={() => api.admin.removeManager(shop.id, m.id).then(() => { setManagers((x) => x.filter((y) => y.id !== m.id)); onChanged(); }, (e: Error) => setError(e.message))} />
        </Row>
      ))}
      <Field label="Owner or manager's email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="owner@theirshop.com" style={{ marginTop: 12 }} />
      <IconLine icon="information-circle-outline" muted>They sign up in the app first (free), then you give their account access here. They'll see "Shop panel" under Account.</IconLine>
      {error && <View style={{ marginTop: 10 }}><ErrorBox message={error} /></View>}
      <Row gap={8} style={{ marginTop: 14 }}>
        <Button title="Give access" icon="key-outline" size="md" disabled={!email.includes("@")} loading={busy} onPress={add} style={{ flex: 1 }} />
        <Button title="Shop page" icon="open-outline" size="md" variant="secondary" onPress={() => { onClose(); router.push({ pathname: "/barbershop/[shopId]", params: { shopId: shop.id } }); }} />
      </Row>
    </Sheet>
  );
}
