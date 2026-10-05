import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlerts } from "../lib/alerts";
import type { NotificationKind } from "../lib/types";
import { colors, fonts, radius, raise } from "./theme";
import { T } from "./ui";

export const ALERT_ICON: Record<NotificationKind, keyof typeof Ionicons.glyphMap> = {
  booking_confirmed: "checkmark-circle-outline",
  new_booking: "calendar-outline",
  on_the_way: "car-outline",
  reminder: "alarm-outline",
  completed: "star-outline",
  cancelled: "close-circle-outline",
  order_update: "bicycle-outline",
  hire: "storefront-outline",
};

/**
 * On the website, a new alert (booked, reminder, barber on the way…) slides in at the top
 * while the page is open — phones get real push notifications instead.
 */
export function AlertBanner() {
  const insets = useSafeAreaInsets();
  const { fresh, dismissFresh } = useAlerts();

  useEffect(() => {
    if (!fresh) return;
    const t = setTimeout(dismissFresh, 8000);
    return () => clearTimeout(t);
  }, [fresh, dismissFresh]);

  if (Platform.OS !== "web" || !fresh) return null;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 10, left: 12, right: 12, alignItems: "center", zIndex: 50 }}>
      <Pressable
        accessibilityRole="alert"
        accessibilityLabel={`${fresh.title}. ${fresh.body}`}
        onPress={() => {
          dismissFresh();
          router.push("/notifications");
        }}
        style={[{ width: "100%", maxWidth: 520, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.ink, borderRadius: radius.lg, padding: 14 }, raise]}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.onInk, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={ALERT_ICON[fresh.kind]} size={20} color={colors.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <T variant="strong" color={colors.onInk} style={{ fontFamily: fonts.semibold }} numberOfLines={1}>{fresh.title}</T>
          <T variant="caption" color={colors.inkMuted} numberOfLines={2}>{fresh.body}</T>
        </View>
        <Pressable onPress={dismissFresh} accessibilityLabel="Dismiss" hitSlop={10}>
          <Ionicons name="close" size={18} color={colors.inkMuted} />
        </Pressable>
      </Pressable>
    </View>
  );
}
