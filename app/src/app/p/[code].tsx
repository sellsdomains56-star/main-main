import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { colors, radius } from "../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Screen, T } from "../../components/ui";
import { api } from "../../lib/api";
import { APP_NAME } from "../../lib/config";
import { rememberPartner } from "../../lib/partner";
import type { PartnerWelcome } from "../../lib/types";

/** Where a hotel's QR code (or a company link) lands: remembers the partner for the next booking. */
export default function PartnerLanding() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [p, setP] = useState<PartnerWelcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.partner(code).then((x) => {
      setP(x);
      void rememberPartner(x);
    }, (e: Error) => setError(e.message));
  }, [code]);
  if (!p) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;
  const hotel = p.kind === "hotel";
  return (
    <Screen footer={<Button title={hotel ? "Book a barber to my room" : "Find a barber"} icon="cut" onPress={() => router.replace(hotel ? { pathname: "/explore", params: { home: "1" } } : "/explore")} />}>
      <Stack.Screen options={{ title: p.name }} />
      <Card tone="ink" style={{ padding: 24, borderRadius: radius.xl }}>
        <T variant="eyebrow" color={colors.inkMuted}>{APP_NAME} × {p.name}</T>
        <T variant="title" color={colors.onInk} style={{ marginTop: 8 }}>{hotel ? `Welcome, guest of ${p.name}` : `Welcome, ${p.name} team`}</T>
        <T color={colors.inkMuted} style={{ marginTop: 8 }}>
          {hotel ? "Book a verified barber to your room or suite. Pay in the app, no cash needed." : `You get ${p.discountPercent}% off every cut with ${APP_NAME}.`}
        </T>
      </Card>
      <View style={{ marginTop: 18, gap: 10 }}>
        {hotel ? (
          <>
            <IconLine icon="bed-outline">Choose "Comes to you", then "Hotel", and add your room number.</IconLine>
            <IconLine icon="shield-checkmark-outline">Every barber is ID-checked by {APP_NAME}.</IconLine>
            <IconLine icon="card-outline">Apple Pay, Google Pay or card. Tips go to your barber in full.</IconLine>
          </>
        ) : (
          <>
            <IconLine icon="pricetag-outline">{p.discountPercent}% off the service is applied when you book.</IconLine>
            <IconLine icon="mail-outline">Sign up with your work email and it applies every time.</IconLine>
          </>
        )}
      </View>
    </Screen>
  );
}
