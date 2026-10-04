import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { PayButton } from "../../components/PayButton";
import { Avatar, Button, Card, Divider, ErrorBox, Loading, Row, Screen, SummaryLine, T } from "../../components/ui";
import { api } from "../../lib/api";
import { STRIPE_PUBLISHABLE_KEY } from "../../lib/config";
import { dateTime, money } from "../../lib/format";
import type { Booking } from "../../lib/types";

export default function Pay() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [data, setData] = useState<{ booking: Booking; clientSecret: string | null; demoPayments: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api.payment(bookingId).then(setData, (e: Error) => setError(e.message));
  }, [bookingId]);
  useEffect(load, [load]);

  const onPaid = useCallback(async () => {
    await api.confirmPayment(bookingId);
    router.replace("/bookings");
  }, [bookingId]);

  if (error && !data) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;
  const { booking } = data;
  const amount = money(booking.amount, booking.currency);
  const fee = booking.amount - (booking.service?.price ?? booking.amount);

  return (
    <Screen>
      <T variant="title">Review & pay</T>
      <Card style={{ marginTop: 16 }}>
        <Row gap={12}>
          <Avatar uri={booking.barber.photoUrl} name={booking.barber.name} size={48} />
          <View style={{ flex: 1 }}>
            <T variant="strong">{booking.barber.name}</T>
            <T variant="caption" muted>{dateTime(booking.startsAt, booking.barber.timeZone)} ({booking.barber.city} time)</T>
          </View>
        </Row>
        <Divider />
        <SummaryLine label={booking.service?.name ?? "Service"} value={money(booking.service?.price ?? booking.amount, booking.currency)} />
        {fee > 0 && <SummaryLine label="Home visit" value={money(fee, booking.currency)} />}
        <T variant="caption" muted style={{ marginTop: 4 }}>{booking.locationType === "home" ? "🏠 " : "💈 "}{booking.address}</T>
        <Divider />
        <SummaryLine label="Total" value={amount} strong />
      </Card>

      <View style={{ marginTop: 20 }}>
        {error && <ErrorBox message={error} />}
        {booking.status !== "pending_payment" ? (
          <Button title="View my bookings" onPress={() => router.replace("/bookings")} />
        ) : data.clientSecret && !STRIPE_PUBLISHABLE_KEY ? (
          <ErrorBox message="This app build is missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, so it can't take payments." />
        ) : data.clientSecret ? (
          <PayButton clientSecret={data.clientSecret} currency={booking.currency} amountLabel={amount} onPaid={onPaid} />
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
