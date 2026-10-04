import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Button, Card, EmptyState, ErrorBox, Loading, Row, Screen, Segmented, T, Tag } from "../../components/ui";
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

const tone = (s: Booking["status"]) => (s === "cancelled" ? "danger" : s === "pending_payment" ? "warn" : s === "completed" ? "neutral" : "brand");

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const load = useCallback(() => {
    if (!user) return;
    setError(null);
    api.bookings().then(setList, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);

  const header = <T variant="display" style={{ marginTop: insets.top + 8, marginBottom: 16 }}>Bookings</T>;

  if (authLoading) return <Screen>{header}<Loading /></Screen>;
  if (!user) {
    return (
      <Screen>
        {header}
        <EmptyState icon="calendar-outline" title="Your appointments live here" body="Sign in to book barbers and manage your cuts." action={{ label: "Sign in", onPress: () => router.push("/login") }} />
      </Screen>
    );
  }

  const isBarber = user.role === "barber";
  const now = Date.now();
  const isUpcoming = (b: Booking) => Date.parse(b.endsAt) >= now && b.status !== "cancelled" && b.status !== "completed";
  const shown = (list ?? []).filter((b) => (tab === "upcoming" ? isUpcoming(b) : !isUpcoming(b)));
  if (tab === "upcoming") shown.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const run = (fn: () => Promise<unknown>) => async () => {
    try {
      await fn();
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Screen>
      {header}
      <Segmented value={tab} onChange={setTab} options={[{ value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }]} />
      <View style={{ marginTop: 16 }}>
        {error && <ErrorBox message={error} onRetry={load} />}
        {!list && !error && <Loading />}
        {list && shown.length === 0 && (
          <EmptyState
            icon="cut-outline"
            title={tab === "upcoming" ? "Nothing booked yet" : "No past appointments"}
            body={isBarber ? "New bookings from customers appear here." : tab === "upcoming" ? "Find a barber near you and get fresh." : undefined}
            action={!isBarber && tab === "upcoming" ? { label: "Find a barber", onPress: () => router.push("/explore") } : undefined}
          />
        )}
        {shown.map((b) => (
          <Card key={b.id} style={{ marginBottom: 12 }}>
            <Row gap={12}>
              <Avatar uri={isBarber ? null : b.barber.photoUrl} name={isBarber ? b.customerName : b.barber.name} size={48} />
              <View style={{ flex: 1 }}>
                <T variant="strong">{isBarber ? b.customerName : b.barber.name}</T>
                <T variant="caption" muted>{b.service?.name} · {money(b.amount, b.currency)}</T>
              </View>
              <Tag label={STATUS_LABEL[b.status]} tone={tone(b.status)} />
            </Row>
            <View style={{ marginTop: 12, gap: 4 }}>
              <T variant="caption">🗓  {dateTime(b.startsAt, b.barber.timeZone)} ({b.barber.city} time)</T>
              <T variant="caption">{b.locationType === "home" ? "🏠" : "💈"}  {b.address}</T>
              {!!b.notes && <T variant="caption" muted>📝  {b.notes}</T>}
            </View>
            <Row gap={8} style={{ marginTop: 14, flexWrap: "wrap" }}>
              {!isBarber && b.status === "pending_payment" && (
                <Button title="Pay now" size="md" onPress={() => router.push({ pathname: "/pay/[bookingId]", params: { bookingId: b.id } })} />
              )}
              {isBarber && b.status === "confirmed" && <Button title="On my way" icon="car-outline" size="md" onPress={run(() => api.setBookingStatus(b.id, "on_the_way"))} />}
              {isBarber && (b.status === "confirmed" || b.status === "on_the_way") && (
                <Button title="Mark done" icon="checkmark" size="md" variant="secondary" onPress={run(() => api.setBookingStatus(b.id, "completed"))} />
              )}
              {!isBarber && b.status === "completed" && !b.reviewed && (
                <Button title="Rate your cut" icon="star" size="md" onPress={() => router.push({ pathname: "/review/[bookingId]", params: { bookingId: b.id } })} />
              )}
              {!isBarber && b.status === "completed" && (
                <Button title="Book again" size="md" variant="secondary" onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: b.barber.id } })} />
              )}
              {["pending_payment", "confirmed"].includes(b.status) && (
                <Button
                  title="Cancel"
                  size="md"
                  variant="ghost"
                  onPress={run(async () => {
                    if (await confirmAction(b.status === "confirmed" ? "Cancel and refund this booking?" : "Cancel this booking?")) await api.cancelBooking(b.id);
                  })}
                />
              )}
            </Row>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
