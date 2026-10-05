import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, IconLine, Loading, Row, Screen, Segmented, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { dateTime, money, STATUS_LABEL } from "../../lib/format";
import type { Booking } from "../../lib/types";

const tone = (s: Booking["status"]) => (s === "cancelled" ? "danger" : s === "confirmed" || s === "on_the_way" ? "accent" : "neutral");

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null); // in-app confirm (works on web too)

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
            <View style={{ marginTop: 12, gap: 6 }}>
              <IconLine icon="calendar-outline">{dateTime(b.startsAt, b.barber.timeZone)} ({b.barber.city} time)</IconLine>
              <IconLine icon={b.locationType === "home" ? "home-outline" : "storefront-outline"}>{b.address}</IconLine>
              {!!b.notes && <IconLine icon="document-text-outline" muted>{b.notes}</IconLine>}
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
              {["pending_payment", "confirmed"].includes(b.status) && confirmingCancel !== b.id && (
                <Button title="Cancel" size="md" variant="ghost" onPress={() => setConfirmingCancel(b.id)} />
              )}
            </Row>
            {confirmingCancel === b.id && (
              <View style={{ marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: colors.dangerSoft }}>
                <T variant="caption">{b.status === "confirmed" ? "Cancel this booking? You'll get a full refund." : "Cancel this booking?"}</T>
                <Row gap={8} style={{ marginTop: 10 }}>
                  <Button
                    title="Yes, cancel"
                    size="sm"
                    variant="danger"
                    onPress={run(async () => {
                      setConfirmingCancel(null);
                      await api.cancelBooking(b.id);
                    })}
                  />
                  <Button title="Keep booking" size="sm" variant="secondary" onPress={() => setConfirmingCancel(null)} />
                </Row>
              </View>
            )}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
