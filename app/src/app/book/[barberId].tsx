import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "../../components/theme";
import { Avatar, Button, Card, Chip, ErrorBox, Field, H2, Loading, P, Screen, styles } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { money, time, upcomingDays } from "../../lib/format";
import type { Barber } from "../../lib/types";

export default function Book() {
  const t = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ barberId: string; serviceId?: string }>();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [serviceId, setServiceId] = useState<string | undefined>(params.serviceId);
  const [locationType, setLocationType] = useState<"shop" | "home">("shop");
  const [date, setDate] = useState<string | null>(null);
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
    api.availability(barber.id, date, serviceId).then((r) => setSlots(r.slots), (e: Error) => setError(e.message));
  }, [barber, date, serviceId]);

  if (!barber) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;
  const service = barber.services.find((s) => s.id === serviceId);
  const total = (service?.price ?? 0) + (locationType === "home" ? barber.homeVisitFee : 0);

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
      // Refresh slots in case the chosen one was taken.
      if (date) api.availability(barber!.id, date, service.id).then((r) => setSlots(r.slots), () => {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={[styles.row, { marginBottom: 6 }]}>
        <Avatar uri={barber.photoUrl} size={44} />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ color: t.text, fontWeight: "700", fontSize: 17 }}>{barber.name}</Text>
          <P muted>{barber.city} · times shown in {barber.city} time</P>
        </View>
      </View>

      <H2>1. Service</H2>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {barber.services.map((s) => (
          <Chip key={s.id} label={`${s.name} · ${money(s.price, barber.currency)}`} selected={s.id === serviceId} onPress={() => setServiceId(s.id)} />
        ))}
      </View>

      <H2>2. Where?</H2>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {barber.offersHomeVisits && (
          <Chip label={`🏠 Come to me (+${money(barber.homeVisitFee, barber.currency)})`} selected={locationType === "home"} onPress={() => setLocationType("home")} />
        )}
        <Chip label="💈 At the shop" selected={locationType === "shop"} onPress={() => setLocationType("shop")} />
      </View>
      {locationType === "home" ? (
        <Field label="Your address" placeholder="Street, number, postcode" value={address} onChangeText={setAddress} />
      ) : (
        <P muted>{barber.shopAddress}</P>
      )}

      <H2>3. When?</H2>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((d) => <Chip key={d.date} label={d.label} selected={d.date === date} onPress={() => setDate(d.date)} />)}
      </ScrollView>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
        {!slots && <Loading />}
        {slots?.length === 0 && <P muted>No free times this day — try another day.</P>}
        {slots?.map((s) => <Chip key={s} label={time(s, barber.timeZone)} selected={s === slot} onPress={() => setSlot(s)} />)}
      </View>

      <Field label="Notes for your barber (optional)" placeholder="e.g. 'Mid fade, keep the length on top'" value={notes} onChangeText={setNotes} multiline />

      {error && <ErrorBox message={error} />}
      <Card>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <P>Total</P>
          <Text style={{ color: t.text, fontWeight: "800", fontSize: 20 }}>{money(total, barber.currency)}</Text>
        </View>
      </Card>
      <Button
        title={user ? "Continue to payment" : "Sign in to book"}
        onPress={confirm}
        loading={submitting}
        disabled={!slot || !service || (locationType === "home" && !address.trim())}
      />
    </Screen>
  );
}
