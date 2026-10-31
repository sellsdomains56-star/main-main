import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Linking, View } from "react-native";
import { colors, radius } from "../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Screen, T } from "../../components/ui";
import { api } from "../../lib/api";
import type { Payouts as PayoutStatus } from "../../lib/types";

/** Where the barber's money goes: their own Stripe account (paid out automatically), set up once. */
export default function Payouts() {
  const { done } = useLocalSearchParams<{ done?: string }>();
  const [p, setP] = useState<PayoutStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    api.payouts().then(setP, (e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load, done]);
  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.startPayouts();
      await Linking.openURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (!p) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;
  return (
    <Screen footer={p.available && !p.payoutsEnabled ? <Button title={p.connected ? "Finish setting up" : "Set up payouts"} icon="card-outline" loading={busy} onPress={start} /> : undefined}>
      <Stack.Screen options={{ title: "Payouts" }} />
      <T variant="title">Payouts</T>
      <Card tone={p.payoutsEnabled ? "ink" : "surface"} style={{ marginTop: 16, padding: 20, borderRadius: radius.xl }}>
        <T variant="eyebrow" color={p.payoutsEnabled ? colors.inkMuted : colors.muted}>{p.payoutsEnabled ? "On" : p.connected ? "Almost there" : "Not set up"}</T>
        <T variant="heading" color={p.payoutsEnabled ? colors.onInk : colors.text} style={{ marginTop: 6 }}>
          {p.payoutsEnabled ? "You're paid straight to your bank" : p.available ? "Get paid automatically" : "Weekly bank transfer"}
        </T>
        <T variant="caption" color={p.payoutsEnabled ? colors.inkMuted : colors.muted} style={{ marginTop: 6 }}>
          {p.payoutsEnabled
            ? "Each paid booking goes to your account minus the Always Fresh fee. Tips are yours in full."
            : p.available
              ? "Stripe (our payments partner) checks your ID and bank once. After that every booking pays out to you on its own."
              : p.note}
        </T>
      </Card>
      {!!p.missing?.length && (
        <View style={{ marginTop: 14 }}>
          <IconLine icon="alert-circle-outline">Stripe still needs: {p.missing.map((m) => m.replace(/[._]/g, " ")).join(", ")}.</IconLine>
        </View>
      )}
      <View style={{ marginTop: 18, gap: 8 }}>
        <IconLine icon="shield-checkmark-outline" muted>Your bank details stay with Stripe; Always Fresh never sees them.</IconLine>
        <IconLine icon="time-outline" muted>Payouts usually land 2–7 days after the appointment, depending on your bank.</IconLine>
      </View>
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}
