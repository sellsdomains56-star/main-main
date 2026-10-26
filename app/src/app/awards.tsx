import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { BarberCard } from "../components/BarberCard";
import { colors, fonts, radius } from "../components/theme";
import { Card, Divider, ErrorBox, Placeholder, Row, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { useLocation } from "../lib/location";
import type { Award } from "../lib/types";

/** Last month's top 10 barbers in the city: most finished cuts, weighted by rating. */
export default function Awards() {
  const { place } = useLocation();
  const [award, setAward] = useState<Award | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.awards(place?.countryCode ?? "AE", place?.city || "Dubai").then(setAward, (e: Error) => setError(e.message));
  }, [place]);
  return (
    <Screen>
      <Stack.Screen options={{ title: "Top 10" }} />
      <Card tone="ink" style={{ padding: 22, borderRadius: radius.xl }}>
        <T variant="eyebrow" color={colors.inkMuted}>JB awards · {award?.label ?? ""}</T>
        <T variant="title" color={colors.onInk} style={{ marginTop: 6 }}>Top 10 in {award?.city ?? place?.city ?? "your city"}</T>
        <T variant="caption" color={colors.inkMuted} style={{ marginTop: 6 }}>The barbers with the most finished cuts last month, weighted by their rating. A new list every month.</T>
      </Card>
      {error && <ErrorBox message={error} />}
      <View style={{ marginTop: 12 }}>
        {!award && !error && <Placeholder kind="rows" count={5} />}
        {award?.list.length === 0 && <T muted style={{ marginTop: 12 }}>No awards here yet.</T>}
        {award?.list.map((x, i) => (
          <View key={x.barber.id}>
            {i > 0 && <Divider style={{ marginVertical: 0 }} />}
            <Row gap={12}>
              <T style={{ width: 34, fontFamily: fonts.semibold, fontSize: 22, color: x.rank <= 3 ? colors.accent : colors.text }}>{x.rank}</T>
              <View style={{ flex: 1 }}><BarberCard barber={x.barber} /></View>
            </Row>
          </View>
        ))}
      </View>
    </Screen>
  );
}
