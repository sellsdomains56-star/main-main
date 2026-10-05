import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReelsFeed } from "../../components/ReelsFeed";
import { ErrorBox, Loading } from "../../components/ui";
import { api } from "../../lib/api";
import { useLightStatusBar } from "../../lib/statusBar";
import type { Reel } from "../../lib/types";

/** One barber's reels, opened from their profile. */
export default function BarberReels() {
  const { barberId, start } = useLocalSearchParams<{ barberId: string; start?: string }>();
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.reels({ barberId }).then(setReels, (e: Error) => setError(e.message));
  }, [barberId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {reels && <ReelsFeed reels={reels} startId={start} bottomInset={insets.bottom} />}
      {!reels && !error && <View style={{ flex: 1, justifyContent: "center" }}><Loading color="#fff" /></View>}
      {error && <View style={{ padding: 20, marginTop: 80 }}><ErrorBox message={error} /></View>}
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/reels"))}
        accessibilityLabel="Back"
        style={{ position: "absolute", top: insets.top + 10, left: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}
