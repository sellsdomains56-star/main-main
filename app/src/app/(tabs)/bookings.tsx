import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddToCalendar } from "../../components/AddToCalendar";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, Field, IconLine, Loading, Row, Screen, Segmented, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { enablePush, pushState, type PushState } from "../../lib/push";
import { dateTime, money, STATUS_LABEL, time } from "../../lib/format";
import { isConsultation, type Booking, type Hire, type Order, type Preferences } from "../../lib/types";
import { ShopPhoto } from "../../components/ShopCard";

const LOCATION_ICON = { shop: "storefront-outline", home: "home-outline", video: "videocam-outline", phone: "call-outline" } as const;

const VENUE_LABEL = { home: "Home", hotel: "Hotel", yacht: "Yacht", office: "Office" } as const;
const VENUE_ICON = { home: "home-outline", hotel: "bed-outline", yacht: "boat-outline", office: "briefcase-outline" } as const;

/** "quiet please · Espresso · No. 2 sides…" — what the barber should know. */
function chairSummary(p: Preferences) {
  return [
    p.conversation === "quiet" ? "quiet please" : p.conversation === "chatty" ? "happy to chat" : null,
    p.drink,
    p.fragrance === "none" ? "no fragrance" : null,
    p.allergies ? `allergies: ${p.allergies}` : null,
    p.standingCut,
    p.music ? `music: ${p.music}` : null,
  ].filter(Boolean).join(" · ");
}

/** 10%, 15% and 20% of the price (or of the service, for Club cuts), rounded to whole units. */
function tipOptions(b: Booking) {
  const base = b.service?.price || b.amount || 2000;
  return [0.1, 0.15, 0.2].map((r) => Math.max(100, Math.round((base * r) / 100) * 100));
}

const HIRE_LABEL: Record<Hire["status"], string> = { pending_payment: "Awaiting payment", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" };

const tone = (s: Booking["status"]) => (s === "cancelled" ? "danger" : s === "confirmed" || s === "on_the_way" ? "accent" : "neutral");

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<Booking[] | null>(null);
  const [hires, setHires] = useState<Hire[]>([]);
  const [deliveries, setDeliveries] = useState<Order[]>([]); // shop staff: delivery orders to send out
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [confirmingCancel, setConfirmingCancel] = useState<string | null>(null); // in-app confirm (works on web too)
  const [tipping, setTipping] = useState<string | null>(null); // booking id with the tip picker open
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({}); // barber's cut notes being written
  const { booked, hired } = useLocalSearchParams<{ booked?: string; hired?: string }>(); // just booked: offer calendar + alerts
  const [push, setPush] = useState<PushState>("unsupported");
  useEffect(() => {
    if (booked) pushState().then(setPush, () => {});
  }, [booked]);

  const load = useCallback(() => {
    if (!user) return;
    setError(null);
    api.bookings().then(setList, (e: Error) => setError(e.message));
    api.hires().then(setHires, () => {});
    if (user.role === "barber") api.shopOrders().then(setDeliveries, () => {});
  }, [user]);
  useFocusEffect(load);
  // The "you're booked" card is shown once; leaving the tab clears it.
  useFocusEffect(useCallback(() => () => (booked || hired) && router.setParams({ booked: undefined, hired: undefined }), [booked, hired]));

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
  const justHired = hired ? hires.find((h) => h.id === hired && h.status === "confirmed") : undefined;
  const hireUpcoming = (h: Hire) => Date.parse(h.endsAt) >= now && h.status !== "cancelled" && h.status !== "completed";
  const shownHires = hires.filter((h) => (tab === "upcoming" ? hireUpcoming(h) : !hireUpcoming(h)));
  const openDeliveries = deliveries.filter((o) => o.status === "paid" || o.status === "out_for_delivery");

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
      {justHired && (
        <Card tone="ink" style={{ padding: 18, borderRadius: radius.xl, marginBottom: 16 }}>
          <T variant="eyebrow" color={colors.inkMuted}>The shop is yours</T>
          <T variant="heading" color={colors.onInk} style={{ marginTop: 6 }}>{justHired.shop.name}, private hire</T>
          <T variant="caption" color={colors.inkMuted} style={{ marginTop: 4 }}>
            {dateTime(justHired.startsAt, justHired.shop.timeZone)}–{time(justHired.endsAt, justHired.shop.timeZone)} ({justHired.shop.city} time) for {justHired.guests} {justHired.guests === 1 ? "guest" : "guests"}. The team has been told.
          </T>
        </Card>
      )}
      {isBarber && openDeliveries.length > 0 && (
        <View style={{ marginBottom: 18 }}>
          <T variant="eyebrow" muted style={{ marginBottom: 8 }}>Shop deliveries</T>
          {openDeliveries.map((o) => (
            <Card key={o.id} style={{ marginBottom: 10 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <T variant="strong">{o.shippingName}</T>
                <Tag label={o.status === "paid" ? "To pack" : "Out for delivery"} tone="accent" icon="bicycle-outline" />
              </Row>
              <View style={{ marginTop: 8, gap: 4 }}>
                <IconLine icon="location-outline">{o.shippingAddress}</IconLine>
                <IconLine icon="bag-handle-outline" muted>{o.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}</IconLine>
              </View>
              <Row gap={8} style={{ marginTop: 12 }}>
                {o.status === "paid" && <Button title="Out for delivery" icon="bicycle-outline" size="md" onPress={run(() => api.setOrderStatus(o.id, "out_for_delivery"))} />}
                <Button title="Delivered" icon="checkmark" size="md" variant={o.status === "paid" ? "secondary" : "primary"} onPress={run(() => api.setOrderStatus(o.id, "delivered"))} />
              </Row>
            </Card>
          ))}
        </View>
      )}
      <Segmented value={tab} onChange={setTab} options={[{ value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }]} />
      <View style={{ marginTop: 16 }}>
        {error && <ErrorBox message={error} onRetry={load} />}
        {!list && !error && <Loading />}
        {shownHires.map((h) => (
          <Card key={h.id} style={{ marginBottom: 12 }}>
            <Row gap={12}>
              <ShopPhoto shop={h.shop} width={48} height={48} rounded={radius.md} />
              <View style={{ flex: 1 }}>
                <T variant="strong">{isBarber ? h.customerName : h.shop.name}</T>
                <T variant="caption" muted>Private hire · {h.occasion || "Private event"} · {money(h.amount, h.currency)}</T>
              </View>
              <Tag label={HIRE_LABEL[h.status]} tone={h.status === "cancelled" ? "danger" : h.status === "confirmed" ? "accent" : "neutral"} />
            </Row>
            <View style={{ marginTop: 12, gap: 6 }}>
              <IconLine icon="calendar-outline">{dateTime(h.startsAt, h.shop.timeZone)}–{time(h.endsAt, h.shop.timeZone)} ({h.shop.city} time)</IconLine>
              <IconLine icon="people-outline">{h.guests} {h.guests === 1 ? "guest" : "guests"} · {h.shop.address}</IconLine>
              {!!h.notes && <IconLine icon="document-text-outline" muted>{h.notes}</IconLine>}
            </View>
            {!isBarber && (h.status === "pending_payment" || h.status === "confirmed") && (
              <Row gap={8} style={{ marginTop: 14, flexWrap: "wrap" }}>
                {h.status === "pending_payment" && <Button title="Pay now" size="md" onPress={() => router.push({ pathname: "/hire/[hireId]", params: { hireId: h.id } })} />}
                {confirmingCancel !== h.id && <Button title="Cancel" size="md" variant="ghost" onPress={() => setConfirmingCancel(h.id)} />}
              </Row>
            )}
            {confirmingCancel === h.id && (
              <View style={{ marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: colors.dangerSoft }}>
                <T variant="caption">{h.status === "confirmed" ? "Cancel the private hire? You'll get a full refund." : "Cancel the private hire?"}</T>
                <Row gap={8} style={{ marginTop: 10 }}>
                  <Button title="Yes, cancel" size="sm" variant="danger" onPress={run(async () => { setConfirmingCancel(null); await api.cancelHire(h.id); })} />
                  <Button title="Keep it" size="sm" variant="secondary" onPress={() => setConfirmingCancel(null)} />
                </Row>
              </View>
            )}
          </Card>
        ))}
        {list && shown.length === 0 && shownHires.length === 0 && (
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
                <T variant="strong">{isBarber ? b.customerName : b.barber.name}{!isBarber && b.shop ? ` · ${b.shop.name}` : ""}</T>
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
              {b.venue && b.venue.kind !== "home" && <IconLine icon={VENUE_ICON[b.venue.kind]}>{VENUE_LABEL[b.venue.kind]}{b.venue.details ? ` · ${b.venue.details}` : ""}</IconLine>}
              {b.venue?.kind === "home" && !!b.venue.details && <IconLine icon="key-outline" muted>{b.venue.details}</IconLine>}
              {b.guest && <IconLine icon="people-outline" muted>{isBarber ? `Booked by ${b.bookedBy ?? "a customer"}${b.guest.phone ? ` · ${b.guest.name.split(" ")[0]}'s phone ${b.guest.phone}` : ""}` : `For ${b.guest.name}`}</IconLine>}
              {b.coveredBy === "membership" && <IconLine icon="card-outline" muted>Included in The Club</IconLine>}
              {!!b.creditUsed && <IconLine icon="gift-outline" muted>{money(b.creditUsed, b.currency)} gift credit used</IconLine>}
              {isBarber && b.customerPreferences && chairSummary(b.customerPreferences) && <IconLine icon="person-outline">My chair: {chairSummary(b.customerPreferences)}</IconLine>}
              {!!b.notes && <IconLine icon="document-text-outline" muted>{b.notes}</IconLine>}
              {!!b.cutNotes && !isBarber && <IconLine icon="cut-outline">Your barber's notes: {b.cutNotes}</IconLine>}
              {!!b.tip && <IconLine icon="heart-outline" muted>{isBarber ? "Tipped" : "You tipped"} {money(b.tip, b.currency)}</IconLine>}
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
                <Button
                  title={isConsultation(b) ? "Book the cut" : "Rebook exactly this"}
                  icon="repeat"
                  size="md"
                  variant="secondary"
                  onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: b.barber.id, ...(isConsultation(b) || !b.service ? {} : { serviceId: b.service.id }) } })}
                />
              )}
              {!isBarber && b.status === "completed" && !isConsultation(b) && !b.tip && tipping !== b.id && (
                <Button title="Leave a tip" icon="heart-outline" size="md" variant="ghost" onPress={() => setTipping(b.id)} />
              )}
              {["pending_payment", "confirmed"].includes(b.status) && confirmingCancel !== b.id && (
                <Button title="Cancel" size="md" variant="ghost" onPress={() => setConfirmingCancel(b.id)} />
              )}
            </Row>
            {tipping === b.id && (
              <View style={{ marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface }}>
                <T variant="caption">Thank {b.barber.name.split(" ")[0]} — 100% goes to your barber.</T>
                <Row gap={8} style={{ marginTop: 10, flexWrap: "wrap" }}>
                  {tipOptions(b).map((amt) => (
                    <Button
                      key={amt}
                      title={money(amt, b.currency).replace(/[.,]00$/, "")}
                      size="sm"
                      variant="secondary"
                      onPress={run(async () => {
                        const { purchase } = await api.tip(b.id, amt);
                        setTipping(null);
                        router.push({ pathname: "/checkout/[purchaseId]", params: { purchaseId: purchase.id } });
                      })}
                    />
                  ))}
                  <Button title="Not now" size="sm" variant="ghost" onPress={() => setTipping(null)} />
                </Row>
              </View>
            )}
            {isBarber && b.status === "completed" && (
              <View style={{ marginTop: 12 }}>
                <Field
                  label="Notes for next time (the customer sees these)"
                  value={notesDraft[b.id] ?? b.cutNotes ?? ""}
                  onChangeText={(v) => setNotesDraft((d) => ({ ...d, [b.id]: v }))}
                  placeholder="e.g. No. 2 sides, 1.5 inch on top, matte pomade"
                  multiline
                  style={{ marginBottom: 8 }}
                />
                {notesDraft[b.id] !== undefined && notesDraft[b.id] !== (b.cutNotes ?? "") && (
                  <Button
                    title="Save notes"
                    size="sm"
                    style={{ alignSelf: "flex-start" }}
                    onPress={run(async () => {
                      await api.setCutNotes(b.id, notesDraft[b.id]);
                      setNotesDraft((d) => {
                        const { [b.id]: _done, ...rest } = d;
                        return rest;
                      });
                    })}
                  />
                )}
              </View>
            )}
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
