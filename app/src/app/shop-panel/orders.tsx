import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, Kpi, shortDate, shortDateTime, StatusTag, Table } from "../../components/admin";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { colors, radius } from "../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Row, Segmented, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import { useShopPanel } from "../../lib/shopPanel";
import type { ShopHireRow, ShopOrderRow, StockRow } from "../../lib/types";

type Tab = "orders" | "stock" | "hires";
type Orders = Awaited<ReturnType<typeof api.manage.orders>>;

/** Delivery orders to send out (with the shop's commission), what's on the shelf, and private hires. */
export default function OrdersAndStock() {
  const { can } = useShopPanel();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Orders | null>(null);
  const [stock, setStock] = useState<StockRow[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [hires, setHires] = useState<ShopHireRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api.manage.orders().then(setOrders, (e: Error) => setError(e.message));
    api.manage.stock().then((s) => {
      setStock(s);
      setCounts(Object.fromEntries(s.map((p) => [p.id, p.count])));
    }, (e: Error) => setError(e.message));
    api.manage.hires().then(setHires, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  const act = (o: ShopOrderRow, status: "out_for_delivery" | "delivered") => async () => {
    try {
      await api.manage.setOrderStatus(o.id, status);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const saveStock = async () => {
    try {
      await api.manage.saveStock(counts);
      setSaved(true);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const open = orders?.orders.filter((o) => o.status === "paid" || o.status === "out_for_delivery").length ?? 0;
  const low = stock?.filter((p) => p.count !== null && p.count <= 3).length ?? 0;

  return (
    <AdminPage title="Orders & stock" subtitle="Deliveries from your shop, your shelf, and private hires">
      <View style={{ maxWidth: 520, marginBottom: 16 }}>
        <Segmented value={tab} onChange={setTab} options={[{ value: "orders", label: `Deliveries${open ? ` · ${open}` : ""}` }, { value: "stock", label: `Stock${low ? ` · ${low} low` : ""}` }, { value: "hires", label: "Private hires" }]} />
      </View>
      {error && <ErrorBox message={error} onRetry={load} />}

      {tab === "orders" && (!orders ? <Loading /> : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <Kpi dark label="Your commission this month" value={money(orders.month.commission, orders.currency)} sub={`${orders.commissionPercent}% of product sales you deliver`} />
            <Kpi label="Product sales" value={money(orders.month.sales, orders.currency)} sub={`${orders.month.orders} orders this month`} />
            <Kpi label="To send out" value={String(open)} />
          </View>
          <Table
            rows={orders.orders}
            keyOf={(o) => o.id}
            empty={{ icon: "bag-handle-outline", title: "No deliveries yet", body: "When customers order JB's Fresh products for delivery from your shop, they appear here." }}
            columns={[
              { label: "Customer", flex: 1.4, render: (o) => <View><T variant="strong">{o.name}</T><T variant="small" muted numberOfLines={1}>{o.address}</T></View> },
              { label: "Items", flex: 1.6, render: (o) => <T variant="caption">{o.items.map((i) => `${i.quantity} × ${i.name.replace("JB's Fresh ", "")}`).join(", ")}</T> },
              { label: "Ordered", render: (o) => <T variant="caption">{shortDateTime(o.createdAt)}</T> },
              { label: "Commission", align: "right", render: (o) => <T variant="caption">{money(o.commission, o.currency)}</T> },
              { label: "Status", render: (o) => <StatusTag status={o.status} /> },
              {
                label: "", flex: 2, align: "right", render: (o) => (
                  <Row gap={6} style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {o.status === "paid" && <Button title="Out for delivery" size="sm" onPress={act(o, "out_for_delivery")} />}
                    {(o.status === "paid" || o.status === "out_for_delivery") && <Button title="Delivered" size="sm" variant={o.status === "paid" ? "secondary" : "primary"} onPress={act(o, "delivered")} />}
                  </Row>
                ),
              },
            ]}
          />
        </>
      ))}

      {tab === "stock" && (!stock ? <Loading /> : (
        <Card style={{ padding: 20 }}>
          <T variant="heading">On the shelf</T>
          <T variant="caption" muted style={{ marginTop: 4, marginBottom: 12 }}>Paid deliveries take stock off automatically. At zero, the product disappears from your shop page. Leave a product uncounted if you don't track it.</T>
          {stock.map((p) => (
            <Row key={p.id} gap={12} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" }}>
              <View style={{ flex: 1 }}>
                <T variant="strong">{p.name.replace("JB's Fresh ", "")}</T>
                <T variant="small" muted>{money(p.price, p.currency)}</T>
              </View>
              {counts[p.id] === null || counts[p.id] === undefined ? (
                <Button title="Count it" size="sm" variant="ghost" disabled={!can("manager")} onPress={() => { setSaved(false); setCounts((c) => ({ ...c, [p.id]: 10 })); }} />
              ) : (
                <Row gap={8}>
                  {counts[p.id] === 0 ? <Tag label="Sold out" tone="danger" /> : counts[p.id]! <= 3 ? <Tag label="Low" tone="neutral" icon="alert-circle-outline" /> : null}
                  {can("manager") ? <Count value={counts[p.id]!} onChange={(v) => { setSaved(false); setCounts((c) => ({ ...c, [p.id]: v })); }} /> : <T variant="strong">{counts[p.id]}</T>}
                </Row>
              )}
            </Row>
          ))}
          {can("manager") && (
            <Row gap={10} style={{ marginTop: 14 }}>
              <Button title={saved ? "Saved" : "Save stock"} icon={saved ? "checkmark" : undefined} disabled={saved} onPress={saveStock} />
            </Row>
          )}
          {!can("manager") && <View style={{ marginTop: 10 }}><IconLine icon="lock-closed-outline" muted>Ask a manager to change stock counts.</IconLine></View>}
        </Card>
      ))}

      {tab === "hires" && (!hires ? <Loading /> : (
        <Table
          rows={hires}
          keyOf={(h) => h.id}
          empty={{ icon: "sparkles-outline", title: "No private hires yet", body: "When someone hires the whole shop, it shows here and blocks your team's calendar." }}
          columns={[
            { label: "Customer", flex: 1.3, render: (h) => <View><T variant="strong">{h.customer}</T><T variant="small" muted>{h.occasion || "Private event"}</T></View> },
            { label: "When", flex: 1.3, render: (h) => <T variant="caption">{shortDate(h.startsAt)} · {h.hours} h</T> },
            { label: "Guests", render: (h) => <T variant="caption">{h.guests}</T> },
            { label: "Paid", align: "right", render: (h) => <T variant="caption">{money(h.amount, h.currency)}</T> },
            { label: "Status", render: (h) => <StatusTag status={h.status} /> },
          ]}
        />
      ))}
    </AdminPage>
  );
}

/** "– 12 +" for a shelf count (never below zero). */
function Count({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const btn = (icon: "remove" | "add", next: number, label: string) => (
    <Pressable accessibilityLabel={label} disabled={next < 0} onPress={() => onChange(next)} hitSlop={6} style={{ padding: 8, opacity: next < 0 ? 0.3 : 1 }}>
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 4 }}>
      {btn("remove", value - 1, "One less")}
      <T variant="strong" center style={{ minWidth: 28 }}>{value}</T>
      {btn("add", value + 1, "One more")}
    </View>
  );
}
