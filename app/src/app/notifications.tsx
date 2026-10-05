import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { ALERT_ICON } from "../components/AlertBanner";
import { colors, fonts, radius } from "../components/theme";
import { Button, Card, EmptyState, IconButton, Loading, Row, Screen, styles, T } from "../components/ui";
import { useAlerts } from "../lib/alerts";
import { useAuth } from "../lib/auth";
import { enablePush, pushState, type PushState } from "../lib/push";
import type { AppNotification } from "../lib/types";

function ago(iso: string) {
  const min = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date(iso));
}

/** Alerts inbox: booked, new bookings, reminders, "your barber is on the way", cancellations. */
export default function Notifications() {
  const { user } = useAuth();
  const { items, unread, refresh, markAllRead, dismissFresh } = useAlerts();
  const [push, setPush] = useState<PushState>("unsupported");

  // New alerts keep their dot while you're here; leaving the screen marks them read.
  useFocusEffect(
    useCallback(() => {
      dismissFresh();
      refresh();
      return () => void markAllRead();
    }, [refresh, markAllRead, dismissFresh]),
  );
  useEffect(() => {
    pushState().then(setPush, () => {});
  }, []);

  const open = (n: AppNotification) => {
    if (n.kind === "completed" && n.bookingId) router.push({ pathname: "/review/[bookingId]", params: { bookingId: n.bookingId } });
    else router.push("/bookings");
  };

  if (!user) {
    return (
      <Screen>
        <EmptyState icon="notifications-outline" title="Sign in for alerts" body="We'll tell you when you're booked, remind you before, and let you know when your barber is on the way." action={{ label: "Sign in", onPress: () => router.push("/login") }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Alerts", headerRight: () => (unread ? <IconButton icon="checkmark-done-outline" label="Mark all as read" tone="plain" onPress={markAllRead} /> : null) }} />

      {Platform.OS !== "web" && push !== "on" && (
        <Card tone="ink" style={{ padding: 18, borderRadius: radius.xl, marginBottom: 16 }}>
          <Row gap={12} style={{ alignItems: "flex-start" }}>
            <Ionicons name="notifications-outline" size={22} color={colors.onInk} />
            <View style={{ flex: 1 }}>
              <T variant="heading" color={colors.onInk}>Turn on notifications</T>
              <T variant="caption" color={colors.inkMuted} style={{ marginTop: 4 }}>Get an alert the day before, an hour before, and the moment your barber is on the way.</T>
              {push === "ask" ? (
                <Button title="Turn on" variant="light" size="sm" onPress={async () => setPush(await enablePush(true))} style={{ alignSelf: "flex-start", marginTop: 12 }} />
              ) : (
                <T variant="caption" color={colors.onInk} style={{ marginTop: 10 }}>Notifications are off for this app — turn them on in your phone's Settings.</T>
              )}
            </View>
          </Row>
        </Card>
      )}

      {!items && <Loading />}
      {items?.length === 0 && (
        <EmptyState icon="notifications-outline" title="No alerts yet" body="We'll let you know when you're booked, the day before, an hour before, and when your barber is on the way." />
      )}
      {items?.map((n) => (
        <Pressable
          key={n.id}
          onPress={() => open(n)}
          accessibilityRole="button"
          style={({ pressed }) => [{ flexDirection: "row", gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }, pressed && styles.pressed]}
        >
          <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: n.read ? colors.surface : colors.ink }}>
            <Ionicons name={ALERT_ICON[n.kind]} size={20} color={n.read ? colors.text : colors.onInk} />
          </View>
          <View style={{ flex: 1 }}>
            <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }} gap={8}>
              <T variant="strong" style={{ flex: 1, fontFamily: n.read ? fonts.medium : fonts.bold }}>{n.title}</T>
              <T variant="small" muted>{ago(n.createdAt)}</T>
            </Row>
            <T variant="caption" muted style={{ marginTop: 2 }}>{n.body}</T>
          </View>
          {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ink, marginTop: 8 }} />}
        </Pressable>
      ))}
    </Screen>
  );
}
