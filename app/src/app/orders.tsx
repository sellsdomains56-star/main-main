import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../components/theme";
import { Button, Card, ErrorBox, Loading, P, Screen, styles } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { money } from "../lib/format";
import type { Order } from "../lib/types";

const LABEL: Record<Order["status"], string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid · preparing",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

export default function Orders() {
  const t = useTheme();
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
    return (
      <Screen>
        <P muted style={{ marginBottom: 12 }}>Sign in to see your orders.</P>
        <Button title="Sign in" onPress={() => router.push("/login")} />
      </Screen>
    );
  }

  return (
    <Screen>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!orders && !error && <Loading />}
      {orders?.length === 0 && (
        <>
          <P muted style={{ marginBottom: 12 }}>No orders yet.</P>
          <Button title="Shop GP's Fresh products" onPress={() => router.replace("/shop")} />
        </>
      )}
      {orders?.map((o) => (
        <Card key={o.id}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <P muted>{new Date(o.createdAt).toLocaleDateString()}</P>
            <Text style={{ color: o.status === "pending_payment" ? t.accent : t.primary, fontWeight: "700", fontSize: 12 }}>{LABEL[o.status]}</Text>
          </View>
          {o.items.map((i) => <P key={i.productId}>{i.quantity} × {i.name}</P>)}
          <P style={{ fontWeight: "800", marginTop: 6 }}>{money(o.amount, o.currency)}</P>
          {o.status === "pending_payment" && (
            <View style={{ marginTop: 8 }}>
              <Button title="Pay now" onPress={() => router.push({ pathname: "/order/[orderId]", params: { orderId: o.id } })} />
            </View>
          )}
        </Card>
      ))}
    </Screen>
  );
}
