import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { colors, fonts, glowSmall, radius } from "../../components/theme";
import { Avatar, Button, ErrorBox, Field, Loading, OptionRow, Pill, Row, Screen, StepCard, StepConnector, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { money, time, upcomingDays } from "../../lib/format";
import type { Barber } from "../../lib/types";

export default function Book() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ barberId: string; serviceId?: string; startsAt?: string; locationType?: "shop" | "home" }>();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [serviceId, setServiceId] = useState<string | undefined>(params.serviceId);
  const [locationType, setLocationType] = useState<"shop" | "home">("shop");
  const [date, setDate] = useState<string | null>(null);
  const [userPickedDate, setUserPickedDate] = useState(false);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.barber(params.barberId).then((b) => {
      setBarber(b);
      setServiceId((s) => s ?? b.services[0]?.id);
      if (params.locationType) setLocationType(params.locationType === "home" && b.offersHomeVisits ? "home" : "shop");
      else if (b.offersHomeVisits) setLocationType("home");
      // Pre-filled from the concierge: open on that day.
      if (params.startsAt) {
        setDate(new Intl.DateTimeFormat("en-CA", { timeZone: b.timeZone }).format(new Date(params.startsAt)));
        setUserPickedDate(true);
      }
    }, (e: Error) => setError(e.message));
  }, [params.barberId, params.locationType, params.startsAt]);

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

  if (!barber) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;
  const service = barber.services.find((s) => s.id === serviceId);
  const total = (service?.price ?? 0) + (locationType === "home" ? barber.homeVisitFee : 0);
  const ready = !!slot && !!service && (locationType === "shop" || address.trim().length > 4);

  async function confirm() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!service || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const { booking } = await api.createBooking({ barberId: barber!.id, serviceId: service.id, startsAt: slot, locationType, address, notes });
      router.replace({ pathname: "/pay/[bookingId]", params: { bookingId: booking.id } });
    } catch (e) {
      setError((e as Error).message);
      if (date) api.availability(barber!.id, date, service.id).then((r) => setSlots(r.slots), () => {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen
      footer={
        <Row gap={14}>
          <View>
            <T variant="eyebrow" color={colors.muted}>Total</T>
            <T variant="title" color={colors.gold}>{money(total, barber.currency)}</T>
          </View>
          <Button title={user ? "Continue" : "Sign in to book"} onPress={confirm} loading={submitting} disabled={!!user && !ready} style={{ flex: 1 }} />
        </Row>
      }
    >
      <Row gap={12}>
        <Avatar uri={barber.photoUrl} name={barber.name} size={48} />
        <View style={{ flex: 1 }}>
          <T variant="heading">{barber.name}</T>
          <T variant="caption" muted>{barber.city} · times in local time</T>
        </View>
      </Row>

      <View style={{ marginTop: 22 }}>
        <StepCard step={1} title="Choose a service" state={service ? "done" : "active"}>
          {barber.services.map((s) => (
            <OptionRow
              key={s.id}
              label={s.name}
              sublabel={`${s.durationMin} min`}
              selected={s.id === serviceId}
              onPress={() => setServiceId(s.id)}
              right={<T variant="strong" color={s.id === serviceId ? colors.gold : colors.text}>{money(s.price, barber.currency)}</T>}
            />
          ))}
        </StepCard>

        <StepConnector lit={!!service} side="right" />

        <StepCard step={2} title="Where?" state={locationType === "shop" || address.trim().length > 4 ? "done" : "active"}>
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
            <Field label="Your address" placeholder="Street, number, postcode" value={address} onChangeText={setAddress} autoComplete="street-address" style={{ marginTop: 6, marginBottom: 0 }} />
          )}
        </StepCard>

        <StepConnector lit={locationType === "shop" || address.trim().length > 4} />

        <StepCard step={3} title="When?" state={slot ? "done" : "active"}>
          <T variant="caption" muted style={{ marginBottom: 10 }}>{barber.city} time</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: -10, marginHorizontal: -6 }} contentContainerStyle={{ gap: 8, paddingVertical: 10, paddingHorizontal: 6 }}>
            {days.map((d) => {
              const selected = d.date === date;
              const [top, bottom] = d.label === "Today" ? ["Today", d.date.slice(8)] : d.label.split(" ").length === 2 ? orderParts(d.label) : [d.label, ""];
              return (
                <Pressable
                  key={d.date}
                  onPress={() => {
                    setUserPickedDate(true);
                    setDate(d.date);
                  }}
                  accessibilityState={{ selected }}
                  accessibilityLabel={d.label}
                  style={[
                    { width: 58, paddingVertical: 10, borderRadius: radius.md, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
                    selected && { borderColor: colors.gold, backgroundColor: "rgba(242,181,58,0.10)" },
                    selected && glowSmall,
                  ]}
                >
                  <T variant="small" color={selected ? colors.gold : colors.muted}>{top}</T>
                  <T variant="heading" style={{ fontFamily: fonts.semibold }}>{Number(bottom) || bottom}</T>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ marginTop: 14 }}>
            {!slots && <Loading />}
            {slots?.length === 0 && <T muted>No free times this day — try another day.</T>}
            <Wrap gap={8}>
              {slots?.map((s) => <Pill key={s} label={time(s, barber.timeZone)} selected={s === slot} onPress={() => setSlot(s)} />)}
            </Wrap>
          </View>
        </StepCard>

        <StepConnector lit={!!slot} side="right" />

        <StepCard step={4} title="Anything to add?" state={slot ? "active" : "upcoming"}>
          <Field label="Notes for your barber (optional)" placeholder="e.g. Mid fade, keep the length on top" value={notes} onChangeText={setNotes} multiline style={{ marginBottom: 0 }} />
        </StepCard>
      </View>
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}

/** "Tue 6" / "6 Tue" → ["Tue", "6"] regardless of locale order. */
function orderParts(label: string): [string, string] {
  const [a, b] = label.split(" ");
  return /^\d/.test(a) ? [b, a] : [a, b];
}
