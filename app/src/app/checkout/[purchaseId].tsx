import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { PayButton } from "../../components/PayButton";
import { Button, Card, Divider, ErrorBox, Loading, Screen, SummaryLine, T } from "../../components/ui";
import { api } from "../../lib/api";
import { STRIPE_PUBLISHABLE_KEY } from "../../lib/config";
import { money } from "../../lib/format";
import type { Purchase } from "../../lib/types";

const AFTER: Record<Purchase["kind"], string> = { membership: "/club", gift: "/gifts", tip: "/bookings" };

/** Review & pay for a Club membership, a gift card or a tip — Apple Pay / Google Pay first. */
export default function Checkout() {
  const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();
  const [data, setData] = useState<{ purchase: Purchase; clientSecret: string | null; demoPayments: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api.purchasePayment(purchaseId).then(setData, (e: Error) => setError(e.message));
  }, [purchaseId]);
  useEffect(load, [load]);

  const onPaid = useCallback(async () => {
    const r = await api.confirmPurchase(purchaseId);
    const kind = r.purchase.kind;
    router.replace(kind === "gift" ? { pathname: "/gifts", params: { sent: r.purchase.ref } } : kind === "membership" ? { pathname: "/club", params: { welcome: "1" } } : { pathname: "/bookings", params: { tipped: "1" } });
  }, [purchaseId]);

  if (error && !data) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;
  const { purchase } = data;
  const amount = money(purchase.amount, purchase.currency);

  return (
    <Screen>
      <T variant="eyebrow" muted>Almost done</T>
      <T variant="display" style={{ marginTop: 6 }}>Review & pay</T>
      <Card style={{ marginTop: 16 }}>
        <SummaryLine label={purchase.label} value={amount} />
        <Divider />
        <SummaryLine label="Total" value={amount} strong />
        {purchase.kind === "membership" && <T variant="small" muted style={{ marginTop: 8 }}>Covers 30 days from today. Renew any time from The Club.</T>}
        {purchase.kind === "tip" && <T variant="small" muted style={{ marginTop: 8 }}>100% of your tip goes to your barber.</T>}
      </Card>
      <View style={{ marginTop: 20 }}>
        {error && <ErrorBox message={error} />}
        {purchase.status !== "pending_payment" ? (
          <Button title="Done" onPress={() => router.replace(AFTER[purchase.kind])} />
        ) : data.clientSecret && !STRIPE_PUBLISHABLE_KEY ? (
          <ErrorBox message="This app build is missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, so it can't take payments." />
        ) : data.clientSecret ? (
          <PayButton clientSecret={data.clientSecret} currency={purchase.currency} amount={purchase.amount} amountLabel={amount} label={purchase.label} onPaid={onPaid} />
        ) : data.demoPayments ? (
          <>
            <Button
              title={`Pay ${amount}`}
              icon="logo-apple"
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
            <T variant="small" muted center style={{ marginTop: 10 }}>Demo — no real money moves. In the app this opens Apple Pay (or Google Pay), with cards as a fallback.</T>
          </>
        ) : (
          <ErrorBox message="Payments are temporarily unavailable." onRetry={load} />
        )}
      </View>
    </Screen>
  );
}
