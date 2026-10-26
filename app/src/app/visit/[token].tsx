import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { colors, radius } from "../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Photo, Row, Screen, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import { APP_NAME } from "../../lib/config";
import { dateTime, STATUS_LABEL, time } from "../../lib/format";
import type { SharedVisit } from "../../lib/types";

const VENUE = { home: "Home", hotel: "Hotel", yacht: "Yacht", office: "Office" } as const;

/** What a friend sees through "share my visit": who is coming, when, and the status. No address or contacts. */
export default function Visit() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [visit, setVisit] = useState<SharedVisit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.visit(token).then(setVisit, (e: Error) => setError(e.message));
  }, [token]);
  useEffect(() => {
    load();
    const t = setInterval(load, 30_000); // keep the status fresh while it's open
    return () => clearInterval(t);
  }, [load]);

  if (!visit) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;
  return (
    <Screen>
      <Stack.Screen options={{ title: "Barber visit" }} />
      <T variant="eyebrow" muted>{APP_NAME} · shared visit</T>
      <T variant="title" style={{ marginTop: 6 }}>{visit.customerFirstName}'s barber visit</T>
      <Card style={{ marginTop: 16 }}>
        <Row gap={12}>
          <Photo uri={visit.barber.photoUrl} name={visit.barber.name} style={{ width: 56, height: 56 }} rounded={28} />
          <View style={{ flex: 1 }}>
            <Row gap={6}>
              <T variant="heading">{visit.barber.name}</T>
              {visit.barber.verified && <Ionicons name="shield-checkmark" size={16} color={colors.text} accessibilityLabel="Verified by JB" />}
            </Row>
            <T variant="caption" muted>{visit.service}</T>
          </View>
          <Tag label={STATUS_LABEL[visit.status] ?? visit.status} tone={visit.status === "on_the_way" || visit.status === "confirmed" ? "accent" : visit.status === "cancelled" ? "danger" : "neutral"} />
        </Row>
        <View style={{ marginTop: 14, gap: 6 }}>
          <IconLine icon="calendar-outline">{dateTime(visit.startsAt, visit.timeZone)}–{time(visit.endsAt, visit.timeZone)}</IconLine>
          <IconLine icon="location-outline">{visit.venue ? `${VENUE[visit.venue]} · ` : ""}{visit.area}</IconLine>
          {visit.barber.verified && <IconLine icon="shield-checkmark-outline" muted>ID and licence checked by {APP_NAME}</IconLine>}
        </View>
      </Card>
      <Card tone="surface" style={{ marginTop: 14, borderRadius: radius.lg }}>
        <T variant="strong">Worried about something?</T>
        <T variant="caption" muted style={{ marginTop: 2, marginBottom: 10 }}>Call your friend first. In an emergency, call the police.</T>
        <Button title="Call 999" icon="call" variant="danger" size="md" onPress={() => Linking.openURL("tel:999")} style={{ alignSelf: "flex-start" }} />
      </Card>
      <T variant="small" muted style={{ marginTop: 16 }}>This page updates by itself. The address and contact details stay private.</T>
    </Screen>
  );
}
