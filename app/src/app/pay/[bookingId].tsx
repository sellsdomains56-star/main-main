import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { PayButton } from "../../components/PayButton";
import { Button, Card, ErrorBox, H1, Loading, P, Screen } from "../../components/ui";
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

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;
  const { booking } = data;
  const amount = money(booking.amount, booking.currency);

  return (
    <Screen>
      <H1>Almost fresh ✂️</H1>
      <Card>
        <P style={{ fontWeight: "700" }}>{booking.service?.name} with {booking.barber.name}</P>
        <P muted>{dateTime(booking.startsAt, booking.barber.timeZone)} ({booking.barber.city} time)</P>
        <P muted>{booking.locationType === "home" ? "🏠 " : "💈 "}{booking.address}</P>
        <P style={{ fontWeight: "800", fontSize: 18, marginTop: 8 }}>{amount}</P>
      </Card>

      {booking.status !== "pending_payment" ? (
        <>
          <P>This booking is already paid.</P>
          <Button title="View bookings" onPress={() => router.replace("/bookings")} />
        </>
      ) : data.clientSecret && !STRIPE_PUBLISHABLE_KEY ? (
        <ErrorBox message="This app build is missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, so it can't take payments." />
      ) : data.clientSecret ? (
        <PayButton clientSecret={data.clientSecret} currency={booking.currency} amountLabel={amount} onPaid={onPaid} />
      ) : data.demoPayments ? (
        <>
          <P muted style={{ marginBottom: 10 }}>
            Demo mode: Stripe isn't configured on the server, so no real money moves. Add your Stripe keys to accept Apple Pay, Google Pay and cards.
          </P>
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
