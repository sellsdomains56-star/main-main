import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Button, Card, EmptyState, ErrorBox, Loading, Row, Screen, T, Tag } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { SHOP_NAME } from "../lib/config";
import { money } from "../lib/format";
import type { Order } from "../lib/types";

const LABEL: Record<Order["status"], string> = { pending_payment: "Awaiting payment", paid: "Preparing", shipped: "Shipped", cancelled: "Cancelled" };

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setError(null);
    api.orders().then(setOrders, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);

  if (!user) {
    return <Screen><EmptyState icon="receipt-outline" title="Sign in to see your orders" action={{ label: "Sign in", onPress: () => router.push("/login") }} /></Screen>;
  }

  return (
    <Screen>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!orders && !error && <Loading />}
      {orders?.length === 0 && <EmptyState icon="bag-handle-outline" title="No orders yet" body={`Treat yourself to some ${SHOP_NAME}.`} action={{ label: "Shop now", onPress: () => router.replace("/shop") }} />}
      {orders?.map((o) => (
        <Card key={o.id} style={{ marginBottom: 12 }}>
          <Row style={{ justifyContent: "space-between" }}>
            <T variant="caption" muted>{new Date(o.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</T>
            <Tag label={LABEL[o.status]} tone={o.status === "pending_payment" ? "warn" : o.status === "cancelled" ? "danger" : "brand"} />
          </Row>
          <View style={{ marginTop: 10, gap: 2 }}>
            {o.items.map((i) => <T key={i.productId}>{i.quantity} × {i.name}</T>)}
          </View>
          <Row style={{ justifyContent: "space-between", marginTop: 12 }}>
            <T variant="heading">{money(o.amount, o.currency)}</T>
            {o.status === "pending_payment" && <Button title="Pay now" size="sm" onPress={() => router.push({ pathname: "/order/[orderId]", params: { orderId: o.id } })} />}
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
