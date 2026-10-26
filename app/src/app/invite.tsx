import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { colors, fonts, radius } from "../components/theme";
import { Button, Card, EmptyState, ErrorBox, IconLine, Loading, Row, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { APP_NAME } from "../lib/config";
import { money } from "../lib/format";
import { shareText } from "../lib/share";
import type { Referral } from "../lib/types";

/** Invite a friend: they get credit on their first cut, and so do you. */
export default function Invite() {
  const { user } = useAuth();
  const [ref, setRef] = useState<Referral | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (user) api.referral().then(setRef, (e: Error) => setError(e.message));
  }, [user]);

  if (!user) return <Screen><EmptyState icon="gift-outline" title="Invite friends" body="Sign in to get your invite code." action={{ label: "Sign in", onPress: () => router.push("/login") }} /></Screen>;
  if (!ref) return <Screen>{error ? <ErrorBox message={error} /> : <Loading />}</Screen>;

  const gift = money(ref.amount, ref.currency);
  const share = async () => {
    const how = await shareText(`${APP_NAME} invite`, `Get ${gift} off your first cut on ${APP_NAME} — book top barbers, at the shop or at home. Use my code ${ref.code}:`, ref.link);
    setNote(how === "copied" ? "Invite copied — paste it to a friend." : null);
  };

  return (
    <Screen footer={<Button title="Share my invite" icon="share-social-outline" onPress={share} />}>
      <Card tone="ink" style={{ padding: 22, borderRadius: radius.xl }}>
        <T variant="eyebrow" color={colors.inkMuted}>Give {gift}, get {gift}</T>
        <T variant="title" color={colors.onInk} style={{ marginTop: 8 }}>Invite a friend to {APP_NAME}</T>
        <T variant="caption" color={colors.inkMuted} style={{ marginTop: 6 }}>When they finish their first cut, you both get {gift} to spend on your next one.</T>
        <View style={{ marginTop: 18, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.inkLine, alignItems: "center" }}>
          <T variant="small" color={colors.inkMuted}>Your code</T>
          <T variant="title" color={colors.onInk} style={{ fontFamily: fonts.semibold, letterSpacing: 2, marginTop: 2 }}>{ref.code}</T>
        </View>
      </Card>
      {note && <View style={{ marginTop: 12 }}><IconLine icon="checkmark-circle-outline">{note}</IconLine></View>}
      <Row gap={10} style={{ marginTop: 18 }}>
        <Stat value={String(ref.invited)} label="joined with your code" />
        <Stat value={String(ref.rewarded)} label="had their first cut" />
        <Stat value={money(ref.amount * ref.rewarded, ref.currency)} label="earned" />
      </Row>
      <View style={{ marginTop: 20, gap: 8 }}>
        <IconLine icon="person-add-outline">Your friend signs up with your code (or your link).</IconLine>
        <IconLine icon="cut-outline">They book and finish their first cut.</IconLine>
        <IconLine icon="gift-outline">You both get {gift} credit, used automatically on your next booking.</IconLine>
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 8, alignItems: "center" }}>
      <T variant="strong">{value}</T>
      <T variant="small" muted center>{label}</T>
    </View>
  );
}
