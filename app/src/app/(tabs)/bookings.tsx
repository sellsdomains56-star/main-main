import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { useTheme } from "../../components/theme";
import { Avatar, Button, Card, ErrorBox, Loading, P, Screen, styles } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { dateTime, money, STATUS_LABEL } from "../../lib/format";
import type { Booking } from "../../lib/types";

function confirmAction(message: string): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(window.confirm(message));
  return new Promise((resolve) =>
    Alert.alert("Are you sure?", message, [
      { text: "No", style: "cancel", onPress: () => resolve(false) },
      { text: "Yes", style: "destructive", onPress: () => resolve(true) },
    ]),
  );
}

export default function Bookings() {
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setError(null);
    api.bookings().then(setList, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);

  if (authLoading) return <Screen><Loading /></Screen>;
  if (!user) {
    return (
      <Screen>
        <P muted style={{ marginBottom: 12 }}>Sign in to see your appointments.</P>
        <Button title="Sign in" onPress={() => router.push("/login")} />
      </Screen>
    );
  }

  const isBarber = user.role === "barber";
  const now = Date.now();
  const upcoming = list?.filter((b) => Date.parse(b.endsAt) >= now && b.status !== "cancelled" && b.status !== "completed") ?? [];
  const past = list?.filter((b) => !upcoming.includes(b)) ?? [];

  const run = (fn: () => Promise<unknown>) => async () => {
    try {
      await fn();
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const renderBooking = (b: Booking) => (
    <BookingCard key={b.id} booking={b} isBarber={isBarber}>
      {!isBarber && b.status === "pending_payment" && (
        <Button title="Pay now" onPress={() => router.push({ pathname: "/pay/[bookingId]", params: { bookingId: b.id } })} />
      )}
      {isBarber && b.status === "confirmed" && <Button title="I'm on my way" icon="car" onPress={run(() => api.setBookingStatus(b.id, "on_the_way"))} />}
      {isBarber && (b.status === "confirmed" || b.status === "on_the_way") && (
        <View style={{ marginTop: 8 }}><Button title="Mark as done" variant="secondary" icon="checkmark" onPress={run(() => api.setBookingStatus(b.id, "completed"))} /></View>
      )}
      {!isBarber && b.status === "completed" && !b.reviewed && (
        <Button title="Rate your barber" icon="star" onPress={() => router.push({ pathname: "/review/[bookingId]", params: { bookingId: b.id } })} />
      )}
      {["pending_payment", "confirmed"].includes(b.status) && (
        <View style={{ marginTop: 8 }}>
          <Button
            title="Cancel booking"
            variant="secondary"
            onPress={run(async () => {
              if (await confirmAction(b.status === "confirmed" ? "Cancel and refund this booking?" : "Cancel this booking?")) await api.cancelBooking(b.id);
            })}
          />
        </View>
      )}
    </BookingCard>
  );

  return (
    <Screen>
      {error && <ErrorBox message={error} onRetry={load} />}
      {!list && !error && <Loading />}
      {list?.length === 0 && (
        <>
          <P muted style={{ marginBottom: 12 }}>{isBarber ? "No appointments yet." : "No bookings yet — time to get fresh."}</P>
          {!isBarber && <Button title="Find a barber" onPress={() => router.push("/barbers")} />}
        </>
      )}
      {upcoming.length > 0 && <P style={{ fontWeight: "800", fontSize: 18, marginBottom: 10 }}>Upcoming</P>}
      {upcoming.map(renderBooking)}
      {past.length > 0 && <P style={{ fontWeight: "800", fontSize: 18, marginVertical: 10 }}>Past</P>}
      {past.map(renderBooking)}
    </Screen>
  );
}

function BookingCard({ booking: b, isBarber, children }: { booking: Booking; isBarber: boolean; children: React.ReactNode }) {
  const t = useTheme();
  const statusColor = b.status === "cancelled" ? t.danger : b.status === "pending_payment" ? t.accent : t.primary;
  return (
    <Card>
      <View style={styles.row}>
        <Avatar uri={b.barber.photoUrl} size={48} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: t.text, fontWeight: "700", fontSize: 16 }}>
            {isBarber ? b.customerName : b.barber.name}
          </Text>
          <P muted>{b.service?.name} · {money(b.amount, b.currency)}</P>
        </View>
        <Text style={{ color: statusColor, fontWeight: "700", fontSize: 12 }}>{STATUS_LABEL[b.status]}</Text>
      </View>
      <P style={{ marginTop: 10 }}>🗓 {dateTime(b.startsAt, b.barber.timeZone)} ({b.barber.city} time)</P>
      <P>{b.locationType === "home" ? "🏠" : "💈"} {b.address}</P>
      {!!b.notes && <P muted>📝 {b.notes}</P>}
      <View style={{ marginTop: 10 }}>{children}</View>
    </Card>
  );
}
