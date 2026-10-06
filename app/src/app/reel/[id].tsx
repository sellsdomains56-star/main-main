import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReelsFeed } from "../../components/ReelsFeed";
import { fonts } from "../../components/theme";
import { ErrorBox, Loading, T } from "../../components/ui";
import { api } from "../../lib/api";
import { useLightStatusBar } from "../../lib/statusBar";
import type { Reel } from "../../lib/types";

/** The full-screen reel viewer, opened from the grid (or a shared link). Swipe for more from the same list. */
export default function ReelViewer() {
  const { id, country, city, saved } = useLocalSearchParams<{ id: string; country?: string; city?: string; saved?: string }>();
  const insets = useSafeAreaInsets();
  useLightStatusBar();
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = saved ? api.savedReels() : api.reels({ country, city });
    load
      .then(async (list) => {
        // A shared link may point outside the list (another city): show it first.
        if (!list.some((r) => r.id === id)) list = [await api.reel(id), ...list];
        setReels(list);
      })
      .catch((e: Error) => setError(e.message));
  }, [id, country, city, saved]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {reels && <ReelsFeed reels={reels} startId={id} bottomInset={insets.bottom} />}
      {!reels && !error && <View style={{ flex: 1, justifyContent: "center" }}><Loading color="#fff" /></View>}
      {error && <View style={{ padding: 20, marginTop: 80 }}><ErrorBox message={error} /></View>}
      <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 8, left: 8, right: 8, flexDirection: "row", alignItems: "center" }}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/reels"))}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
        <T variant="heading" color="#fff" style={{ fontFamily: fonts.bold }}>{saved ? "Saved" : "Reels"}</T>
      </View>
    </View>
  );
}
