import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { PayButton } from "../../components/PayButton";
import { Button, Card, Divider, ErrorBox, IconLine, Loading, Screen, SummaryLine, T } from "../../components/ui";
import { api } from "../../lib/api";
import { useCart } from "../../lib/cart";
import { SHOP_NAME, STRIPE_PUBLISHABLE_KEY } from "../../lib/config";
import { money } from "../../lib/format";
import type { Order } from "../../lib/types";

export default function PayOrder() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { clear } = useCart();
  const [data, setData] = useState<{ order: Order; clientSecret: string | null; demoPayments: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api.orderPayment(orderId).then(setData, (e: Error) => setError(e.message));
  }, [orderId]);
  useEffect(load, [load]);

  const onPaid = useCallback(async () => {
    await api.confirmOrderPayment(orderId);
    clear();
    router.replace("/orders");
  }, [orderId, clear]);

  if (error && !data) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;
  const { order } = data;
  const amount = money(order.amount, order.currency);

  return (
    <Screen>
      <T variant="title">Review & pay</T>
      <Card style={{ marginTop: 16 }}>
        {order.items.map((i) => (
          <SummaryLine key={i.productId} label={`${i.quantity} × ${i.name}`} value={money(i.unitPrice * i.quantity, order.currency)} />
        ))}
        {!!order.discount && <SummaryLine label="Club member discount" value={`−${money(order.discount, order.currency)}`} />}
        <SummaryLine label="Delivery" value={order.shipping ? money(order.shipping, order.currency) : "Free"} />
        {!!order.creditUsed && <SummaryLine label="Gift credit" value={`−${money(order.creditUsed, order.currency)}`} />}
        <Divider />
        <SummaryLine label="Total" value={amount} strong />
        <View style={{ marginTop: 10 }}><IconLine icon="car-outline" muted>{order.shippingName}, {order.shippingAddress}</IconLine></View>
      </Card>

      <View style={{ marginTop: 20 }}>
        {error && <ErrorBox message={error} />}
        {order.status !== "pending_payment" ? (
          <Button title="View my orders" onPress={() => router.replace("/orders")} />
        ) : data.clientSecret && !STRIPE_PUBLISHABLE_KEY ? (
          <ErrorBox message="This app build is missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, so it can't take payments." />
        ) : data.clientSecret ? (
          <PayButton clientSecret={data.clientSecret} currency={order.currency} amount={order.amount} amountLabel={amount} label={`${SHOP_NAME} order`} onPaid={onPaid} />
        ) : data.demoPayments ? (
          <>
            <T variant="caption" muted style={{ marginBottom: 12 }}>Demo mode — Stripe isn't connected yet, so no real money moves.</T>
            <Button
              title={`Pay ${amount}`}
              icon="lock-closed"
              loading={busy}
              onPress={async () => {
                setBusy(true);
                try {
                  await onPaid();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </>
        ) : (
          <ErrorBox message="Payments are temporarily unavailable." onRetry={load} />
        )}
      </View>
    </Screen>
  );
}
