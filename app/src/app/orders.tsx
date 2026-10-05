import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { colors, fonts } from "../components/theme";
import { Button, Card, EmptyState, ErrorBox, IconLine, Loading, Row, Screen, T, Tag } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { SHOP_NAME } from "../lib/config";
import { money } from "../lib/format";
import type { Order } from "../lib/types";

const LABEL: Record<Order["status"], string> = {
  pending_payment: "Awaiting payment", paid: "Preparing", shipped: "Shipped", out_for_delivery: "On its way", delivered: "Delivered", cancelled: "Cancelled",
};

const DELIVERY_STEPS: { status: Order["status"]; label: string }[] = [
  { status: "paid", label: "Packing" },
  { status: "out_for_delivery", label: "On its way" },
  { status: "delivered", label: "Delivered" },
];

/** Packing → On its way → Delivered, for orders a barbershop delivers. */
function DeliveryTracker({ order }: { order: Order }) {
  const at = DELIVERY_STEPS.findIndex((s) => s.status === order.status);
  const eta = new Date(Date.parse(order.createdAt) + (order.shop?.etaMin ?? 60) * 60_000);
  return (
    <View style={{ marginTop: 12 }}>
      <Row gap={0}>
        {DELIVERY_STEPS.map((s, i) => (
          <View key={s.status} style={{ flex: 1 }}>
            <View style={{ height: 4, borderRadius: 2, marginRight: i < 2 ? 4 : 0, backgroundColor: i <= at ? colors.ink : colors.surfaceStrong }} />
            <T variant="small" color={i <= at ? colors.text : colors.faint} style={{ marginTop: 6, fontFamily: i === at ? fonts.semibold : fonts.regular }}>{s.label}</T>
          </View>
        ))}
      </Row>
      <View style={{ marginTop: 10, gap: 4 }}>
        {order.status !== "delivered" && (
          <IconLine icon="time-outline">Arrives around {eta.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</IconLine>
        )}
        <IconLine icon="storefront-outline" muted>From {order.shop?.name} to {order.shippingAddress}</IconLine>
      </View>
    </View>
  );
}

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
  // Follow a delivery while it's on its way.
  const tracking = !!orders?.some((o) => o.fulfilment === "delivery" && (o.status === "paid" || o.status === "out_for_delivery"));
  useEffect(() => {
    if (!tracking) return;
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [tracking, load]);

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
            <Tag label={o.fulfilment === "delivery" && o.status === "paid" ? "Packing" : LABEL[o.status]} tone={o.status === "pending_payment" ? "neutral" : o.status === "cancelled" ? "danger" : "accent"} />
          </Row>
          <View style={{ marginTop: 10, gap: 2 }}>
            {o.items.map((i) => <T key={i.productId}>{i.quantity} × {i.name}</T>)}
          </View>
          {o.fulfilment === "delivery" && o.status !== "pending_payment" && o.status !== "cancelled" && <DeliveryTracker order={o} />}
          <Row style={{ justifyContent: "space-between", marginTop: 12 }}>
            <T variant="heading">{money(o.amount, o.currency)}</T>
            {o.status === "pending_payment" && <Button title="Pay now" size="sm" onPress={() => router.push({ pathname: "/order/[orderId]", params: { orderId: o.id } })} />}
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
