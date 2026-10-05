import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { PayButton } from "../../components/PayButton";
import { ShopPhoto } from "../../components/ShopCard";
import { radius } from "../../components/theme";
import { Button, Card, Divider, ErrorBox, IconLine, Loading, Row, Screen, SummaryLine, T } from "../../components/ui";
import { api } from "../../lib/api";
import { STRIPE_PUBLISHABLE_KEY } from "../../lib/config";
import { dateTime, money, time } from "../../lib/format";
import type { Hire } from "../../lib/types";

/** Review & pay for a private hire. */
export default function PayHire() {
  const { hireId } = useLocalSearchParams<{ hireId: string }>();
  const [data, setData] = useState<{ hire: Hire; clientSecret: string | null; demoPayments: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api.hirePayment(hireId).then(setData, (e: Error) => setError(e.message));
  }, [hireId]);
  useEffect(load, [load]);

  const onPaid = useCallback(async () => {
    await api.confirmHirePayment(hireId);
    router.replace({ pathname: "/bookings", params: { hired: hireId } });
  }, [hireId]);

  if (error && !data) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;
  const { hire } = data;
  const amount = money(hire.amount, hire.currency);
  const tz = hire.shop.timeZone;

  return (
    <Screen>
      <T variant="eyebrow" muted>Almost done</T>
      <T variant="display" style={{ marginTop: 6 }}>Review & pay</T>
      <Card style={{ marginTop: 16 }}>
        <Row gap={12}>
          <ShopPhoto shop={hire.shop} width={48} height={48} rounded={radius.md} />
          <View style={{ flex: 1 }}>
            <T variant="strong">{hire.shop.name} · private hire</T>
            <T variant="caption" muted>{dateTime(hire.startsAt, tz)}–{time(hire.endsAt, tz)} ({hire.shop.city} time)</T>
          </View>
        </Row>
        <Divider />
        <SummaryLine label={`${hire.hours} hours × ${money(hire.amount / hire.hours, hire.currency)}`} value={amount} />
        <View style={{ marginTop: 6, gap: 4 }}>
          <IconLine icon="people-outline" muted>{hire.occasion || "Private event"} · {hire.guests} {hire.guests === 1 ? "guest" : "guests"}</IconLine>
          <IconLine icon="storefront-outline" muted>{hire.shop.address}</IconLine>
        </View>
        <Divider />
        <SummaryLine label="Total" value={amount} strong />
      </Card>

      <View style={{ marginTop: 20 }}>
        {error && <ErrorBox message={error} />}
        {hire.status !== "pending_payment" ? (
          <Button title="View my bookings" onPress={() => router.replace("/bookings")} />
        ) : data.clientSecret && !STRIPE_PUBLISHABLE_KEY ? (
          <ErrorBox message="This app build is missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, so it can't take payments." />
        ) : data.clientSecret ? (
          <PayButton clientSecret={data.clientSecret} currency={hire.currency} amount={hire.amount} amountLabel={amount} label={`Private hire of ${hire.shop.name}`} onPaid={onPaid} />
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
