import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddToCalendar } from "../../components/AddToCalendar";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, IconLine, Loading, Row, Screen, Segmented, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { enablePush, pushState, type PushState } from "../../lib/push";
import { dateTime, money, STATUS_LABEL } from "../../lib/format";
import { isConsultation, type Booking } from "../../lib/types";

const LOCATION_ICON = { shop: "storefront-outline", home: "home-outline", video: "videocam-outline", phone: "call-outline" } as const;

const tone = (s: Booking["status"]) => (s === "cancelled" ? "danger" : s === "confirmed" || s === "on_the_way" ? "accent" : "neutral");

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null); // in-app confirm (works on web too)
  const { booked } = useLocalSearchParams<{ booked?: string }>(); // just booked: offer calendar + alerts
  const [push, setPush] = useState<PushState>("unsupported");
  useEffect(() => {
    if (booked) pushState().then(setPush, () => {});
  }, [booked]);

  const load = useCallback(() => {
    if (!user) return;
    setError(null);
    api.bookings().then(setList, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);
  // The "you're booked" card is shown once; leaving the tab clears it.
  useFocusEffect(useCallback(() => () => booked && router.setParams({ booked: undefined }), [booked]));

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

  const justBooked = booked ? list?.find((b) => b.id === booked && b.status !== "cancelled") : undefined;

  return (
    <Screen>
      {header}
      {justBooked && (
        <Card tone="ink" style={{ padding: 18, borderRadius: radius.xl, marginBottom: 16 }}>
          <T variant="eyebrow" color={colors.inkMuted}>You're booked</T>
          <T variant="heading" color={colors.onInk} style={{ marginTop: 6 }}>
            {justBooked.service?.name} with {justBooked.barber.name}
          </T>
          <T variant="caption" color={colors.inkMuted} style={{ marginTop: 4 }}>
            {dateTime(justBooked.startsAt, justBooked.barber.timeZone)} ({justBooked.barber.city} time).{" "}
            {justBooked.locationType === "home" ? "We'll alert you the day before, an hour before, and the moment your barber is on the way." : "We'll remind you the day before and an hour before."}
          </T>
          <Row gap={8} style={{ marginTop: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
            <AddToCalendar booking={justBooked} size="sm" variant="light" />
            {push === "ask" && <Button title="Turn on alerts" icon="notifications-outline" size="sm" variant="light" onPress={async () => setPush(await enablePush(true))} />}
          </Row>
        </Card>
      )}
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
                <T variant="caption" muted>{b.service?.name} · {b.amount ? money(b.amount, b.currency) : "Free"}</T>
              </View>
              <Tag label={STATUS_LABEL[b.status]} tone={tone(b.status)} />
            </Row>
            <View style={{ marginTop: 12, gap: 6 }}>
              <IconLine icon="calendar-outline">{dateTime(b.startsAt, b.barber.timeZone)} ({b.barber.city} time)</IconLine>
              <IconLine icon={LOCATION_ICON[b.locationType]}>
                {b.locationType === "phone" ? (isBarber ? `Phone call · call ${b.customerName.split(" ")[0]} on ${b.phone}` : `Phone call · ${b.barber.name.split(" ")[0]} calls you on ${b.phone}`) : b.address}
              </IconLine>
              {b.locationType === "video" && ["confirmed", "on_the_way"].includes(b.status) && !b.videoLink && (
                <IconLine icon="information-circle-outline" muted>
                  {isBarber ? "Add your Google Meet link in My work so your client can join." : "Your barber will add the Google Meet link here before the call."}
                </IconLine>
              )}
              {!!b.notes && <IconLine icon="document-text-outline" muted>{b.notes}</IconLine>}
            </View>
            <Row gap={8} style={{ marginTop: 14, flexWrap: "wrap" }}>
              {b.locationType === "video" && !!b.videoLink && ["confirmed", "on_the_way"].includes(b.status) && (
                <Button title="Join Google Meet" icon="videocam" size="md" onPress={() => Linking.openURL(b.videoLink!)} />
              )}
              {isBarber && b.locationType === "video" && !b.videoLink && ["confirmed", "on_the_way"].includes(b.status) && (
                <Button title="Add Meet link" icon="link" size="md" variant="secondary" onPress={() => router.push("/portfolio")} />
              )}
              {isBarber && b.locationType === "phone" && !!b.phone && ["confirmed", "on_the_way"].includes(b.status) && (
                <Button title={`Call ${b.customerName.split(" ")[0]}`} icon="call" size="md" onPress={() => Linking.openURL(`tel:${b.phone!.replace(/[^\d+]/g, "")}`)} />
              )}
              {!isBarber && ["confirmed", "on_the_way"].includes(b.status) && b.id !== justBooked?.id && <AddToCalendar booking={b} />}
              {!isBarber && b.status === "pending_payment" && (
                <Button title="Pay now" size="md" onPress={() => router.push({ pathname: "/pay/[bookingId]", params: { bookingId: b.id } })} />
              )}
              {isBarber && b.status === "confirmed" && b.locationType === "home" && <Button title="On my way" icon="car-outline" size="md" onPress={run(() => api.setBookingStatus(b.id, "on_the_way"))} />}
              {isBarber && (b.status === "confirmed" || b.status === "on_the_way") && (
                <Button title="Mark done" icon="checkmark" size="md" variant="secondary" onPress={run(() => api.setBookingStatus(b.id, "completed"))} />
              )}
              {!isBarber && b.status === "completed" && !b.reviewed && !isConsultation(b) && (
                <Button title="Rate your cut" icon="star" size="md" onPress={() => router.push({ pathname: "/review/[bookingId]", params: { bookingId: b.id } })} />
              )}
              {!isBarber && b.status === "completed" && (
                <Button title={isConsultation(b) ? "Book the cut" : "Book again"} size="md" variant="secondary" onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: b.barber.id } })} />
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
