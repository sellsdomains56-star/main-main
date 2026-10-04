import { router } from "expo-router";
import { Text, View } from "react-native";
import { money } from "../lib/format";
import type { Barber } from "../lib/types";
import { useTheme } from "./theme";
import { Avatar, Card, P, Stars, styles } from "./ui";

export function BarberCard({ barber }: { barber: Barber }) {
  const t = useTheme();
  return (
    <Card onPress={() => router.push(`/barber/${barber.id}`)}>
      <View style={styles.row}>
        <Avatar uri={barber.photoUrl} size={64} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: t.text, fontSize: 17, fontWeight: "700" }}>{barber.name}</Text>
          <View style={[styles.row, { marginTop: 3 }]}>
            <Stars value={barber.rating ?? 0} size={14} />
            <P muted style={{ marginLeft: 6, fontSize: 13 }}>
              {barber.rating ? `${barber.rating.toFixed(1)} (${barber.ratingCount})` : "New"}
            </P>
          </View>
          <P muted style={{ fontSize: 13, marginTop: 3 }}>
            {barber.city} · from {money(barber.startingPrice, barber.currency)}
            {barber.offersHomeVisits ? " · comes to you" : ""}
          </P>
        </View>
      </View>
      <P muted style={{ fontSize: 13, marginTop: 10 }} >{barber.specialties.slice(0, 4).join(" · ")}</P>
    </Card>
  );
}
