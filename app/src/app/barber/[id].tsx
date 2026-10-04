import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../components/theme";
import { Avatar, Button, Card, Chip, ErrorBox, H1, H2, Loading, P, Screen, Stars, styles } from "../../components/ui";
import { api } from "../../lib/api";
import { money } from "../../lib/format";
import { flag } from "../../lib/location";
import type { Barber, Review } from "../../lib/types";

export default function BarberProfile() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [barber, setBarber] = useState<(Barber & { reviews: Review[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api.barber(id).then(setBarber, (e: Error) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!barber) return <Screen><Loading /></Screen>;

  return (
    <Screen>
      <Stack.Screen options={{ title: barber.name }} />
      <View style={{ alignItems: "center", marginBottom: 12 }}>
        <Avatar uri={barber.photoUrl} size={110} />
        <H1>{barber.name}</H1>
        <View style={styles.row}>
          <Stars value={barber.rating ?? 0} />
          <P muted style={{ marginLeft: 6 }}>{barber.rating ? `${barber.rating.toFixed(1)} · ${barber.ratingCount} reviews` : "No reviews yet"}</P>
        </View>
        <P muted style={{ marginTop: 4 }}>{flag(barber.countryCode)} {barber.city}, {barber.countryName}</P>
      </View>

      <P>{barber.bio}</P>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
        {barber.specialties.map((s) => <Chip key={s} label={s} />)}
      </View>

      <Card style={{ marginTop: 8 }}>
        <P>📍 Shop: {barber.shopAddress}</P>
        <P style={{ marginTop: 4 }}>
          {barber.offersHomeVisits ? `🏠 Comes to you (+${money(barber.homeVisitFee, barber.currency)})` : "🏠 Shop appointments only"}
        </P>
      </Card>

      <H2>Services</H2>
      {barber.services.map((s) => (
        <Card key={s.id} onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: barber.id, serviceId: s.id } })}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View>
              <Text style={{ color: t.text, fontWeight: "700", fontSize: 16 }}>{s.name}</Text>
              <P muted>{s.durationMin} min</P>
            </View>
            <Text style={{ color: t.text, fontWeight: "800", fontSize: 16 }}>{money(s.price, barber.currency)}</Text>
          </View>
        </Card>
      ))}
      <Button title="Book now" icon="calendar" onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: barber.id } })} />

      <H2>Reviews</H2>
      {barber.reviews.length === 0 && <P muted>Be the first to rate {barber.name.split(" ")[0]} after your cut.</P>}
      {barber.reviews.map((r) => (
        <Card key={r.id}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <Text style={{ color: t.text, fontWeight: "700" }}>{r.customerName}</Text>
            <Stars value={r.rating} size={14} />
          </View>
          {!!r.comment && <P style={{ marginTop: 6 }}>{r.comment}</P>}
          <P muted style={{ fontSize: 12, marginTop: 6 }}>{new Date(r.createdAt).toLocaleDateString()}</P>
        </Card>
      ))}
    </Screen>
  );
}
