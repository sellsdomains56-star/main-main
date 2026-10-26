import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { colors, fonts, radius } from "../../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, Pill, Screen, T, Wrap } from "../../../components/ui";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import type { QueueStatus, Shop } from "../../../lib/types";

const SERVICES = ["Haircut", "Skin fade", "Beard trim", "Haircut + beard", "Kids cut"];

/** The walk-in queue, from the app: see the wait, join, get an alert when it's your turn. */
export default function JoinQueue() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [service, setService] = useState(SERVICES[0]!);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.queueStatus(shopId).then(setStatus, (e: Error) => setError(e.message));
  }, [shopId]);
  useEffect(() => {
    api.shop(shopId).then(setShop, () => {});
    load();
    const t = setInterval(load, 20_000); // the queue moves: keep the wait fresh
    return () => clearInterval(t);
  }, [shopId, load, user]);

  const run = (fn: () => Promise<unknown>) => async () => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!status) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;
  const mine = status.mine;
  const yourTurn = mine && (mine.status === "called" || mine.status === "serving");

  return (
    <Screen
      footer={
        mine ? (
          <Button title="Leave the queue" variant="secondary" onPress={run(() => api.leaveQueue(shopId))} loading={busy} />
        ) : !user ? (
          <Button title="Sign in to join" onPress={() => router.push("/login")} />
        ) : (
          <Button title="Join the queue" icon="people" onPress={run(() => api.joinQueue(shopId, service))} loading={busy} disabled={!status.open} />
        )
      }
    >
      <Stack.Screen options={{ title: "Walk-in queue" }} />
      <T variant="eyebrow" muted>{shop?.name ?? "Barbershop"}</T>
      <T variant="title" style={{ marginTop: 6 }}>{mine ? (yourTurn ? "It's your turn" : "You're in the queue") : "Walk in, skip the wait"}</T>

      <Card tone="ink" style={{ marginTop: 16, padding: 22, borderRadius: radius.xl }}>
        {mine ? (
          yourTurn ? (
            <>
              <T variant="eyebrow" color={colors.inkMuted}>Head to the desk</T>
              <T variant="display" color={colors.onInk} style={{ marginTop: 6 }}>{mine.barber ? `${mine.barber.name.split(" ")[0]} is ready` : "Your chair is ready"}</T>
            </>
          ) : (
            <>
              <T variant="eyebrow" color={colors.inkMuted}>Your place</T>
              <T color={colors.onInk} style={{ fontFamily: fonts.semibold, fontSize: 64, lineHeight: 72, marginTop: 4 }}>#{mine.position ?? 1}</T>
              <T color={colors.onInk}>About {mine.estimateMin ?? status.estimateMin} min · {mine.service}</T>
              <T variant="caption" color={colors.inkMuted} style={{ marginTop: 8 }}>We'll send an alert when it's your turn. Keep the app open or alerts on.</T>
            </>
          )
        ) : (
          <>
            <T variant="eyebrow" color={colors.inkMuted}>{status.open ? "Right now" : "Closed now"}</T>
            <T color={colors.onInk} style={{ fontFamily: fonts.semibold, fontSize: 44, lineHeight: 52, marginTop: 4 }}>{status.open ? (status.waiting ? `${status.waiting} waiting` : "No queue") : "—"}</T>
            <T color={colors.inkMuted}>{status.open ? (status.waiting ? `About ${status.estimateMin} min wait` : "Come straight in, or join so they know you're coming") : "The queue opens when the shop does. You can still book a time."}</T>
          </>
        )}
      </Card>

      {status.nowServing.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <IconLine icon="cut-outline" muted>In the chair now: {status.nowServing.join(", ")}</IconLine>
        </View>
      )}

      {!mine && status.open && (
        <View style={{ marginTop: 20 }}>
          <T variant="strong" style={{ marginBottom: 8 }}>What are you coming in for?</T>
          <Wrap>{SERVICES.map((s) => <Pill key={s} label={s} selected={service === s} onPress={() => setService(s)} />)}</Wrap>
          <T variant="small" muted style={{ marginTop: 12 }}>Walk-ins pay at the shop. Prefer a set time? </T>
          <Button title="Book a time instead" size="sm" variant="ghost" style={{ alignSelf: "flex-start" }} onPress={() => router.push({ pathname: "/barbershop/[shopId]/book", params: { shopId } })} />
        </View>
      )}
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}
