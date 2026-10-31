import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QrCode } from "../components/QrCode";
import { colors, fonts, radius } from "../components/theme";
import { EmptyState, Loading, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { ShopPanel, ShopQueue } from "../lib/types";

const first = (name: string) => name.trim().split(/\s+/)[0] ?? name;

/** For the TV on the shop wall: who's in the chair, who's next, and a code to join from the street. */
export default function QueueScreen() {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [panel, setPanel] = useState<ShopPanel | null>(null);
  const [q, setQ] = useState<ShopQueue | null>(null);
  const [clock, setClock] = useState(() => new Date());

  const load = useCallback(() => {
    api.manage.queue().then(setQ, () => {});
  }, []);
  useEffect(() => {
    if (!user?.manages) return;
    api.manage.panel().then(setPanel, () => {});
    load();
    const t = setInterval(() => {
      load();
      setClock(new Date());
    }, 10_000);
    return () => clearInterval(t);
  }, [user, load]);

  if (loading) return <Screen><Loading /></Screen>;
  if (!user?.manages) return <Screen><EmptyState icon="tv-outline" title="Queue screen" body="Sign in with your shop's account on the TV or tablet." action={{ label: "Sign in", onPress: () => router.push("/login") }} /></Screen>;
  const big = width >= 900;
  const time = panel ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZone: panel.shop.timeZone }).format(clock) : "";

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, paddingTop: insets.top + 28, paddingHorizontal: big ? 56 : 24, paddingBottom: 28 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Close the queue screen" hitSlop={10}>
          <T variant="eyebrow" color={colors.inkMuted}>{panel?.shop.name ?? "Always Fresh"}</T>
        </Pressable>
        <T variant="heading" color={colors.onInk}>{time}</T>
      </View>
      {!q ? (
        <Loading color={colors.onInk} />
      ) : (
        <View style={{ flex: 1, flexDirection: big ? "row" : "column", gap: 28, marginTop: 28 }}>
          <View style={{ flex: 1.3 }}>
            <T variant="eyebrow" color={colors.inkMuted}>Now serving</T>
            {q.inChair.length === 0 && <T color={colors.onInk} style={{ fontSize: big ? 44 : 30, fontFamily: fonts.semibold, marginTop: 12 }}>Next one up, come on in</T>}
            {q.inChair.map((i) => (
              <View key={i.id} style={{ flexDirection: "row", alignItems: "baseline", gap: 14, marginTop: 14 }}>
                <T color={colors.onInk} style={{ fontSize: big ? 64 : 40, lineHeight: big ? 72 : 48, fontFamily: fonts.semibold }}>{first(i.name)}</T>
                <T color={colors.inkMuted} style={{ fontSize: big ? 24 : 18 }}>{i.barber ? `with ${first(i.barber.name)}` : "head to the desk"}</T>
              </View>
            ))}
            <T variant="eyebrow" color={colors.inkMuted} style={{ marginTop: 40 }}>Next up</T>
            {q.waiting.length === 0 && <T color={colors.inkMuted} style={{ fontSize: big ? 26 : 20, marginTop: 10 }}>No queue — walk straight in.</T>}
            {q.waiting.slice(0, 6).map((i) => (
              <View key={i.id} style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 12 }}>
                <View style={{ width: big ? 52 : 40, height: big ? 52 : 40, borderRadius: 26, borderWidth: 1, borderColor: colors.inkLine, alignItems: "center", justifyContent: "center" }}>
                  <T color={colors.onInk} style={{ fontSize: big ? 22 : 17, fontFamily: fonts.semibold }}>{i.position}</T>
                </View>
                <T color={colors.onInk} style={{ fontSize: big ? 32 : 22, flex: 1 }}>{first(i.name)}</T>
                <T color={colors.inkMuted} style={{ fontSize: big ? 22 : 16 }}>~{i.estimateMin} min</T>
              </View>
            ))}
          </View>
          {panel && (
            <View style={{ flex: big ? 0.7 : undefined, alignItems: "center", justifyContent: "center", gap: 14 }}>
              <View style={{ padding: 14, backgroundColor: "#FFFFFF", borderRadius: radius.lg }}>
                <QrCode value={panel.links.queue} size={big ? 240 : 160} label="Scan to join the queue" />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="phone-portrait-outline" size={18} color={colors.onInk} />
                <T color={colors.onInk} style={{ fontSize: big ? 22 : 16 }}>Scan to join the queue</T>
              </View>
              <T color={colors.inkMuted} center>Wait nearby — we'll alert you when your chair is ready.</T>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
