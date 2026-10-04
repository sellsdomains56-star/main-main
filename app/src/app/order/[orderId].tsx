import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { PayButton } from "../../components/PayButton";
import { Button, Card, ErrorBox, H1, Loading, P, Screen } from "../../components/ui";
import { api } from "../../lib/api";
import { useCart } from "../../lib/cart";
import { STRIPE_PUBLISHABLE_KEY } from "../../lib/config";
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

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;
  const { order } = data;
  const amount = money(order.amount, order.currency);

  return (
    <Screen>
      <H1>Checkout 🛍️</H1>
      <Card>
        {order.items.map((i) => (
          <P key={i.productId}>{i.quantity} × {i.name} — {money(i.unitPrice * i.quantity, order.currency)}</P>
        ))}
        <P muted style={{ marginTop: 6 }}>Delivery: {order.shipping ? money(order.shipping, order.currency) : "Free"}</P>
        <P muted>To: {order.shippingName}, {order.shippingAddress}</P>
        <P style={{ fontWeight: "800", fontSize: 18, marginTop: 8 }}>{amount}</P>
      </Card>

      {order.status !== "pending_payment" ? (
        <Button title="View my orders" onPress={() => router.replace("/orders")} />
      ) : data.clientSecret && !STRIPE_PUBLISHABLE_KEY ? (
        <ErrorBox message="This app build is missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, so it can't take payments." />
      ) : data.clientSecret ? (
        <PayButton clientSecret={data.clientSecret} currency={order.currency} amountLabel={amount} onPaid={onPaid} />
      ) : data.demoPayments ? (
        <>
          <P muted style={{ marginBottom: 10 }}>Demo mode: Stripe isn't configured on the server, so no real money moves.</P>
          <Button
            title={`Simulate paying ${amount}`}
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
    </Screen>
  );
}
