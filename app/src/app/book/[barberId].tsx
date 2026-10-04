import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { colors, fonts, radius } from "../../components/theme";
import { Avatar, Button, Divider, ErrorBox, Field, Loading, Pill, Row, Screen, Section, Segmented, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { money, time, upcomingDays } from "../../lib/format";
import type { Barber } from "../../lib/types";

export default function Book() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ barberId: string; serviceId?: string }>();
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
      if (b.offersHomeVisits) setLocationType("home");
    }, (e: Error) => setError(e.message));
  }, [params.barberId]);

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
      else setSlots(r.slots);
    }, (e: Error) => setError(e.message));
  }, [barber, date, serviceId, days, userPickedDate]);

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
            <T variant="small" muted>Total</T>
            <T variant="title">{money(total, barber.currency)}</T>
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

      <Section title="Service">
        {barber.services.map((s, i) => {
          const selected = s.id === serviceId;
          return (
            <View key={s.id}>
              {i > 0 && <Divider style={{ marginVertical: 0 }} />}
              <Pressable onPress={() => setServiceId(s.id)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }} accessibilityState={{ selected }}>
                <Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={22} color={selected ? colors.brand : colors.faint} />
                <View style={{ flex: 1 }}>
                  <T variant="strong">{s.name}</T>
                  <T variant="caption" muted>{s.durationMin} min</T>
                </View>
                <T variant="strong">{money(s.price, barber.currency)}</T>
              </Pressable>
            </View>
          );
        })}
      </Section>

      <Section title="Where?">
        {barber.offersHomeVisits ? (
          <Segmented<"home" | "shop">
            value={locationType}
            onChange={setLocationType}
            options={[
              { value: "home", label: `At my place (+${money(barber.homeVisitFee, barber.currency)})` },
              { value: "shop", label: "At the shop" },
            ]}
          />
        ) : (
          <T variant="caption" muted>This barber works at the shop only.</T>
        )}
        <View style={{ marginTop: 14 }}>
          {locationType === "home" ? (
            <Field label="Your address" placeholder="Street, number, postcode" value={address} onChangeText={setAddress} autoComplete="street-address" />
          ) : (
            <Row gap={8}>
              <Ionicons name="location-outline" size={16} color={colors.muted} />
              <T variant="caption" muted>{barber.shopAddress}</T>
            </Row>
          )}
        </View>
      </Section>

      <Section title="Date">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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
                style={{ width: 58, paddingVertical: 10, borderRadius: radius.md, alignItems: "center", backgroundColor: selected ? colors.text : colors.surface }}
              >
                <T variant="small" color={selected ? "rgba(255,255,255,0.8)" : colors.muted}>{top}</T>
                <T variant="heading" color={selected ? "#fff" : colors.text} style={{ fontFamily: fonts.bold }}>{Number(bottom) || bottom}</T>
              </Pressable>
            );
          })}
        </ScrollView>
      </Section>

      <Section title="Time">
        {!slots && <Loading />}
        {slots?.length === 0 && <T muted>No free times this day — try another day.</T>}
        <Wrap gap={8}>
          {slots?.map((s) => <Pill key={s} label={time(s, barber.timeZone)} selected={s === slot} onPress={() => setSlot(s)} />)}
        </Wrap>
      </Section>

      <Section title="Notes for your barber">
        <Field label="Optional" placeholder="e.g. Mid fade, keep the length on top" value={notes} onChangeText={setNotes} multiline />
      </Section>
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}

/** "Tue 6" / "6 Tue" → ["Tue", "6"] regardless of locale order. */
function orderParts(label: string): [string, string] {
  const [a, b] = label.split(" ");
  return /^\d/.test(a) ? [b, a] : [a, b];
}
