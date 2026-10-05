import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocationSheet } from "../../components/LocationSheet";
import { ReelsFeed } from "../../components/ReelsFeed";
import { Button, Loading, Row, T } from "../../components/ui";
import { fonts } from "../../components/theme";
import { api } from "../../lib/api";
import { useLightStatusBar } from "../../lib/statusBar";
import { useLocation } from "../../lib/location";
import type { Reel } from "../../lib/types";
import { Ionicons } from "@expo/vector-icons";

export default function ReelsTab() {
  const { start } = useLocalSearchParams<{ start?: string }>();
  const { place, country } = useLocation();
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api.reels({ country: place?.countryCode, city: place?.city || undefined }).then(setReels, (e: Error) => setError(e.message));
  }, [place]);
  useEffect(load, [load]);

  const where = place ? place.city || country?.name || "" : "Everywhere";

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {reels && reels.length > 0 && <ReelsFeed key={`${where}-${start ?? ""}`} reels={reels} startId={start} />}
      {!reels && !error && <View style={{ flex: 1, justifyContent: "center" }}><Loading color="#fff" /></View>}
      {(error || reels?.length === 0) && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <T variant="heading" color="#fff" center>{error ?? `No reels in ${where} yet`}</T>
          <T color="rgba(255,255,255,0.7)" center style={{ marginTop: 6 }}>Try another city to see barbers' latest cuts.</T>
          <Button title={error ? "Try again" : "Change city"} size="md" onPress={error ? load : () => setSheet(true)} style={{ marginTop: 18 }} />
        </View>
      )}

      {/* Floating header */}
      <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 10, left: 16, right: 16 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T variant="title" color="#fff" style={{ fontFamily: fonts.black }}>Reels</T>
          <Pressable onPress={() => setSheet(true)} style={{ backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
            <Row gap={4}>
              <Ionicons name="location" size={14} color="#fff" />
              <T variant="caption" color="#fff">{where}</T>
              <Ionicons name="chevron-down" size={14} color="#fff" />
            </Row>
          </Pressable>
        </Row>
      </View>
      <LocationSheet visible={sheet} onClose={() => setSheet(false)} />
    </View>
  );
}
