import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { PayButton } from "../../components/PayButton";
import { Avatar, Button, Card, Divider, ErrorBox, IconLine, Loading, Row, Screen, SummaryLine, T } from "../../components/ui";
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
    router.replace({ pathname: "/bookings", params: { booked: bookingId } });
  }, [bookingId]);

  if (error && !data) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;
  const { booking } = data;
  const amount = money(booking.amount, booking.currency);
  const servicePrice = booking.coveredBy ? 0 : booking.service?.price ?? booking.amount;
  const fee = Math.max(0, booking.amount + (booking.creditUsed ?? 0) - servicePrice);

  return (
    <Screen>
      <T variant="eyebrow" muted>Almost done</T>
      <T variant="display" style={{ marginTop: 6 }}>Review & pay</T>
      <Card style={{ marginTop: 16 }}>
        <Row gap={12}>
          <Avatar uri={booking.barber.photoUrl} name={booking.barber.name} size={48} />
          <View style={{ flex: 1 }}>
            <T variant="strong">{booking.barber.name}{booking.shop ? ` · ${booking.shop.name}` : ""}</T>
            <T variant="caption" muted>{dateTime(booking.startsAt, booking.barber.timeZone)} ({booking.barber.city} time)</T>
          </View>
        </Row>
        <Divider />
        <SummaryLine label={booking.service?.name ?? "Service"} value={booking.coveredBy ? "Included · The Club" : money(servicePrice, booking.currency)} />
        {fee > 0 && <SummaryLine label="Home visit" value={money(fee, booking.currency)} />}
        {!!booking.creditUsed && <SummaryLine label="Gift credit" value={`−${money(booking.creditUsed, booking.currency)}`} />}
        <View style={{ marginTop: 6 }}><IconLine icon={booking.locationType === "home" ? "home-outline" : "storefront-outline"} muted>{booking.address}</IconLine></View>
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
          <PayButton clientSecret={data.clientSecret} currency={booking.currency} amount={booking.amount} amountLabel={amount} label={`${booking.service?.name ?? "Appointment"} with ${booking.barber.name}`} onPaid={onPaid} />
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
