import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { DayPicker } from "../../components/DayPicker";
import { SlideToConfirm } from "../../components/SlideToConfirm";
import { colors } from "../../components/theme";
import { Avatar, Button, ErrorBox, Field, IconLine, Loading, OptionRow, Pill, Row, Screen, StepCard, StepConnector, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { money, time, upcomingDays } from "../../lib/format";
import { CONSULTATION_ID, type Barber, type LocationType, type Membership, type VenueKind } from "../../lib/types";

/** Booking a cut (shop or home), or with `?mode=consult` a free video / phone consultation. */
export default function Book() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ barberId: string; serviceId?: string; startsAt?: string; locationType?: "shop" | "home"; mode?: "consult" }>();
  const consult = params.mode === "consult";
  const [barber, setBarber] = useState<Barber | null>(null);
  const [serviceId, setServiceId] = useState<string | undefined>(consult ? CONSULTATION_ID : params.serviceId);
  const [locationType, setLocationType] = useState<LocationType>(consult ? "video" : "shop");
  const [date, setDate] = useState<string | null>(null);
  const [userPickedDate, setUserPickedDate] = useState(false);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Home visits: home, hotel, yacht or office, and how to get in.
  const [venue, setVenue] = useState<VenueKind>("home");
  const [venueDetails, setVenueDetails] = useState("");
  // Booking for someone else.
  const [forGuest, setForGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  // The Club and gift credit, to show what's included before paying.
  const [club, setClub] = useState<{ membership: Membership | null; credit: Record<string, number> } | null>(null);
  const [waitlisted, setWaitlisted] = useState<string | null>(null);
  useEffect(() => {
    if (user) api.clubMe().then(setClub, () => setClub(null));
  }, [user]);

  useEffect(() => {
    api.barber(params.barberId).then((b) => {
      setBarber(b);
      if (consult) return;
      setServiceId((s) => s ?? b.services[0]?.id);
      if (params.locationType) setLocationType(params.locationType === "home" && b.offersHomeVisits ? "home" : "shop");
      else if (b.offersHomeVisits) setLocationType("home");
      // Pre-filled from the concierge: open on that day.
      if (params.startsAt) {
        setDate(new Intl.DateTimeFormat("en-CA", { timeZone: b.timeZone }).format(new Date(params.startsAt)));
        setUserPickedDate(true);
      }
    }, (e: Error) => setError(e.message));
  }, [params.barberId, params.locationType, params.startsAt, consult]);

  const days = useMemo(() => (barber ? upcomingDays(14, barber.timeZone) : []), [barber]);
  useEffect(() => {
    if (!date && days.length) setDate(days[0].date);
  }, [days, date]);

  useEffect(() => {
    if (!barber || !date || !serviceId) return;
    setSlots(null);
    setSlot(null);
    api.availability(barber.id, date, serviceId).then((r) => {
      // Until the customer picks a day themselves, skip ahead to the first day with free times.
      const i = days.findIndex((d) => d.date === date);
      if (!r.slots.length && !userPickedDate && i >= 0 && i < days.length - 1) setDate(days[i + 1].date);
      else {
        setSlots(r.slots);
        if (params.startsAt && r.slots.includes(params.startsAt)) setSlot(params.startsAt);
      }
    }, (e: Error) => setError(e.message));
  }, [barber, date, serviceId, days, userPickedDate, params.startsAt]);

  const service = barber?.services.find((s) => s.id === serviceId);
  const member = club?.membership?.active ? club.membership : null;
  const clubCovers = !consult && !!member && (member.cutsLeft === null || member.cutsLeft > 0);
  const clubHomeFree = !consult && !!member?.freeHomeVisits && locationType === "home";
  const before = consult ? 0 : (clubCovers ? 0 : service?.price ?? 0) + (locationType === "home" && !clubHomeFree ? barber?.homeVisitFee ?? 0 : 0);
  const credit = barber ? Math.min(club?.credit?.[barber.currency] ?? 0, before) : 0;
  const total = before - credit;
  const whereDone = (consult ? locationType === "video" || phone.replace(/\D/g, "").length >= 6 : locationType === "shop" || address.trim().length > 4) && (!forGuest || guestName.trim().length > 0);
  const ready = !!slot && (consult || !!service) && whereDone;

  const confirm = useCallback(async () => {
    if (!barber || !slot || !serviceId) return;
    setSubmitting(true);
    setError(null);
    try {
      const { booking } = await api.createBooking({
        barberId: barber.id, serviceId, startsAt: slot, locationType, address, phone, notes,
        venue: locationType === "home" ? { kind: venue, details: venueDetails } : undefined,
        guest: forGuest && guestName.trim() ? { name: guestName.trim(), phone: guestPhone.trim() } : undefined,
      });
      // Paid bookings go to Review & pay (Apple Pay / Google Pay); free consultations are confirmed already.
      if (booking.status === "pending_payment") router.replace({ pathname: "/pay/[bookingId]", params: { bookingId: booking.id } });
      else router.replace({ pathname: "/bookings", params: { booked: booking.id } });
    } catch (e) {
      setError((e as Error).message);
      if (date) api.availability(barber.id, date, serviceId).then((r) => setSlots(r.slots), () => {});
    } finally {
      setSubmitting(false);
    }
  }, [barber, slot, serviceId, locationType, address, phone, notes, date, venue, venueDetails, forGuest, guestName, guestPhone]);

  if (!barber) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;
  if (consult && !barber.offersConsultations) return <Screen><ErrorBox message={`${barber.name} doesn't offer consultations right now.`} /></Screen>;

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View>
            <T variant="eyebrow" color={colors.muted}>Total</T>
            <T variant="title">{consult ? "Free" : total === 0 && clubCovers ? "Included" : money(total, barber.currency)}</T>
            {!consult && (clubCovers || credit > 0) && <T variant="small" muted>{clubCovers ? `Cut included · The Club` : `${money(credit, barber.currency)} gift credit`}</T>}
          </View>
          <View style={{ flex: 1 }}>
            {user ? (
              <SlideToConfirm
                label={consult ? "Slide to book call" : "Slide to book"}
                disabledLabel={!slot ? "Pick a time" : consult ? "Add your number" : "Add your address"}
                disabled={!ready}
                loading={submitting}
                onConfirm={confirm}
              />
            ) : (
              <Button title="Sign in to book" onPress={() => router.push("/login")} />
            )}
          </View>
        </Row>
      }
    >
      <Stack.Screen options={{ title: consult ? "Free consultation" : "Book appointment" }} />
      <Row gap={12}>
        <Avatar uri={barber.photoUrl} name={barber.name} size={48} />
        <View style={{ flex: 1 }}>
          <T variant="heading">{barber.name}</T>
          <T variant="caption" muted>{barber.city} · times in local time</T>
        </View>
      </Row>

      <View style={{ marginTop: 22 }}>
        {consult ? (
          <StepCard step={1} title="How do you want to talk?" state={whereDone ? "done" : "active"}>
            <T variant="caption" muted style={{ marginBottom: 12 }}>A free 15-minute chat to plan your cut, ask about styles or get a price — before you book.</T>
            <OptionRow label="Video call" sublabel="On Google Meet" icon="videocam-outline" selected={locationType === "video"} onPress={() => setLocationType("video")} />
            <OptionRow label="Phone call" sublabel={`${barber.name.split(" ")[0]} calls you`} icon="call-outline" selected={locationType === "phone"} onPress={() => setLocationType("phone")} />
            {locationType === "phone" && (
              <Field label="Your phone number" placeholder="+44 7700 900123" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" style={{ marginTop: 6, marginBottom: 0 }} />
            )}
            {locationType === "video" && (
              <IconLine icon="information-circle-outline" muted>
                {barber.hasVideoLink ? "You'll get the Google Meet link in Bookings as soon as you book." : "Your barber adds the Google Meet link — it appears in Bookings before the call."}
              </IconLine>
            )}
          </StepCard>
        ) : (
          <>
            <StepCard step={1} title="Choose a service" state={service ? "done" : "active"}>
              {barber.services.map((s) => (
                <OptionRow
                  key={s.id}
                  label={s.name}
                  sublabel={`${s.durationMin} min`}
                  selected={s.id === serviceId}
                  onPress={() => setServiceId(s.id)}
                  right={<T variant="strong">{money(s.price, barber.currency)}</T>}
                />
              ))}
            </StepCard>

            <StepConnector lit={!!service} side="right" />

            <StepCard step={2} title="Where?" state={whereDone ? "done" : "active"}>
              {barber.offersHomeVisits && (
                <OptionRow
                  label="At my place"
                  sublabel={`Home, hotel or office · +${money(barber.homeVisitFee, barber.currency)}`}
                  icon="home-outline"
                  selected={locationType === "home"}
                  onPress={() => setLocationType("home")}
                />
              )}
              <OptionRow label="At the shop" sublabel={barber.shopAddress} icon="storefront-outline" selected={locationType === "shop"} onPress={() => setLocationType("shop")} />
              {locationType === "home" && (
                <View style={{ marginTop: 6 }}>
                  <Wrap gap={8}>
                    {VENUES.map((v) => <Pill key={v.kind} label={v.label} icon={v.icon} selected={venue === v.kind} onPress={() => setVenue(v.kind)} />)}
                  </Wrap>
                  <Field label={VENUES.find((v) => v.kind === venue)!.address} placeholder={VENUES.find((v) => v.kind === venue)!.addressHint} value={address} onChangeText={setAddress} autoComplete="street-address" style={{ marginTop: 12 }} />
                  <Field label={VENUES.find((v) => v.kind === venue)!.details} placeholder={VENUES.find((v) => v.kind === venue)!.detailsHint} value={venueDetails} onChangeText={setVenueDetails} style={{ marginBottom: 0 }} />
                </View>
              )}
            </StepCard>
          </>
        )}

        <StepConnector lit={whereDone} />

        <StepCard step={consult ? 2 : 3} title="When?" state={slot ? "done" : "active"}>
          <T variant="caption" muted style={{ marginBottom: 10 }}>{barber.city} time{consult ? " · 15 minutes" : ""}</T>
          <DayPicker
            days={days}
            value={date}
            onChange={(d) => {
              setUserPickedDate(true);
              setDate(d);
            }}
          />
          <View style={{ marginTop: 14 }}>
            {!slots && <Loading />}
            {slots?.length === 0 && (
              <View style={{ gap: 10 }}>
                <T muted>{barber.name.split(" ")[0]} is fully booked this day.</T>
                {user && date && (
                  waitlisted === date ? (
                    <IconLine icon="checkmark-circle-outline">You're on the waitlist — we'll alert you the moment a time opens.</IconLine>
                  ) : (
                    <Button
                      title="Join the waitlist for this day"
                      icon="time-outline"
                      size="md"
                      variant="secondary"
                      style={{ alignSelf: "flex-start" }}
                      onPress={() => api.joinWaitlist(barber.id, date).then(() => setWaitlisted(date), (e: Error) => setError(e.message))}
                    />
                  )
                )}
              </View>
            )}
            <Wrap gap={8}>
              {slots?.map((s) => <Pill key={s} label={time(s, barber.timeZone)} selected={s === slot} onPress={() => setSlot(s)} />)}
            </Wrap>
          </View>
        </StepCard>

        <StepConnector lit={!!slot} side="right" />

        <StepCard step={consult ? 3 : 4} title={consult ? "What would you like to ask?" : "Anything to add?"} state={slot ? "active" : "upcoming"}>
          {!consult && (
            <View style={{ marginBottom: 14 }}>
              <OptionRow label="Booking for someone else" sublabel="A guest, your son, a client…" icon="people-outline" selected={forGuest} onPress={() => setForGuest((g) => !g)} />
              {forGuest && (
                <Row gap={10}>
                  <Field label="Their name" value={guestName} onChangeText={setGuestName} style={{ flex: 1, marginBottom: 0 }} />
                  <Field label="Their phone" value={guestPhone} onChangeText={setGuestPhone} keyboardType="phone-pad" style={{ flex: 1, marginBottom: 0 }} />
                </Row>
              )}
              {!!user?.preferences && <View style={{ marginTop: 10 }}><IconLine icon="person-outline" muted>Your barber sees “My chair”: {[user.preferences.conversation === "quiet" ? "quiet please" : user.preferences.conversation === "chatty" ? "happy to chat" : null, user.preferences.drink].filter(Boolean).join(", ") || "your preferences"}.</IconLine></View>}
            </View>
          )}
          <Field
            label={consult ? "Your question (optional)" : "Notes for your barber (optional)"}
            placeholder={consult ? "e.g. Would a mid fade suit my hair type? What does it cost?" : "e.g. Mid fade, keep the length on top"}
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ marginBottom: 0 }}
          />
        </StepCard>
      </View>
      {error && <View style={{ marginTop: 16 }}><ErrorBox message={error} /></View>}
    </Screen>
  );
}

const VENUES: { kind: VenueKind; label: string; icon: "home-outline" | "bed-outline" | "boat-outline" | "briefcase-outline"; address: string; addressHint: string; details: string; detailsHint: string }[] = [
  { kind: "home", label: "Home", icon: "home-outline", address: "Your address", addressHint: "Street, number, postcode", details: "Getting in (optional)", detailsHint: "Gate code, floor, parking" },
  { kind: "hotel", label: "Hotel", icon: "bed-outline", address: "Hotel", addressHint: "e.g. Atlantis The Royal, Palm Jumeirah", details: "Room and name at reception", detailsHint: "e.g. Suite 1204, under Al Mansoori" },
  { kind: "yacht", label: "Yacht", icon: "boat-outline", address: "Marina", addressHint: "e.g. Dubai Harbour Marina", details: "Berth and yacht name", detailsHint: "e.g. Berth C-14, MY Serenity" },
  { kind: "office", label: "Office", icon: "briefcase-outline", address: "Office address", addressHint: "Building, street", details: "Floor and who to ask for", detailsHint: "e.g. 32nd floor, ask for Sara" },
];
