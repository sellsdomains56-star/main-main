import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocationSheet } from "../../components/LocationSheet";
import { compact } from "../../components/ReelThumb";
import { colors, fonts, radius } from "../../components/theme";
import { Avatar, Button, EmptyState, ErrorBox, Loading, Row, Segmented, styles, T } from "../../components/ui";
import { api, mediaUrl } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useLocation } from "../../lib/location";
import type { Barber, Reel } from "../../lib/types";

/**
 * Reels, Instagram style: a grid first (nothing plays until you pick one), top barbers as
 * story circles, and your saved collection. Tapping a tile opens the full-screen viewer.
 */
export default function ReelsTab() {
  const { start } = useLocalSearchParams<{ start?: string }>();
  const { place, country } = useLocation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<"foryou" | "saved">("foryou");
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [saved, setSaved] = useState<Reel[] | null>(null);
  const [top, setTop] = useState<Barber[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);

  const scope = { country: place?.countryCode, city: place?.city || undefined };
  const load = useCallback(() => {
    setError(null);
    api.reels({ country: place?.countryCode, city: place?.city || undefined }).then(setReels, (e: Error) => setError(e.message));
    api.barbers({ country: place?.countryCode, city: place?.city || undefined, sort: "rating" }).then((b) => setTop(b.slice(0, 10)), () => setTop([]));
  }, [place]);
  useEffect(load, [load]);
  useFocusEffect(
    useCallback(() => {
      if (user) api.savedReels().then(setSaved, () => setSaved([]));
      else setSaved(null);
    }, [user]),
  );

  // Home's "Trending" row links here with a reel to open.
  useEffect(() => {
    if (start) router.push({ pathname: "/reel/[id]", params: { id: start, ...scope } });
  }, [start]); // eslint-disable-line react-hooks/exhaustive-deps

  const where = place ? place.city || country?.name || "" : "Everywhere";
  const inner = Math.min(width, 760);
  const tile = (inner - 4) / 3;
  const list = tab === "foryou" ? reels : saved;
  const open = (r: Reel) => router.push({ pathname: "/reel/[id]", params: tab === "saved" ? { id: r.id, saved: "1" } : { id: r.id, ...scope } });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, { paddingHorizontal: 20 }]}>
          <Row style={{ justifyContent: "space-between" }}>
            <T variant="display">Reels</T>
            <Pressable onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel={`Reels in ${where}. Change city`} style={{ backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 14, height: 38, justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
              <Row gap={5}>
                <Ionicons name="location-outline" size={14} color={colors.text} />
                <T variant="caption" style={{ fontFamily: fonts.semibold }}>{where}</T>
                <Ionicons name="chevron-down" size={14} color={colors.text} />
              </Row>
            </Pressable>
          </Row>
        </View>

        {/* Top barbers, like Instagram stories */}
        {top.length > 0 && tab === "foryou" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
            {top.map((b) => (
              <Pressable key={b.id} onPress={() => router.push({ pathname: "/barber-reels/[barberId]", params: { barberId: b.id } })} accessibilityRole="button" accessibilityLabel={`${b.name}'s reels`} style={{ width: 72, alignItems: "center" }}>
                <View style={{ padding: 2.5, borderRadius: 40, borderWidth: 2, borderColor: colors.ink }}>
                  <Avatar uri={b.photoUrl} name={b.name} size={60} />
                </View>
                <T variant="small" numberOfLines={1} style={{ marginTop: 6 }}>{b.name.split(" ")[0]}</T>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={[styles.inner, { paddingHorizontal: 20, marginTop: 16, marginBottom: 12 }]}>
          <Segmented value={tab} onChange={setTab} options={[{ value: "foryou", label: "For you" }, { value: "saved", label: "Saved" }]} />
        </View>

        <View style={styles.inner}>
          {error && tab === "foryou" && <View style={{ paddingHorizontal: 20 }}><ErrorBox message={error} onRetry={load} /></View>}
          {tab === "saved" && !user && (
            <EmptyState icon="bookmark-outline" title="Save reels you love" body="Tap the bookmark on any reel to keep it here — your style board for the next cut." action={{ label: "Sign in", onPress: () => router.push("/login") }} />
          )}
          {!list && !error && (tab === "foryou" || user) && <Loading />}
          {list?.length === 0 && tab === "foryou" && (
            <View style={{ alignItems: "center", padding: 32 }}>
              <T variant="heading" center>No reels in {where} yet</T>
              <Button title="Change city" size="md" onPress={() => setSheet(true)} style={{ marginTop: 14 }} />
            </View>
          )}
          {list?.length === 0 && tab === "saved" && (
            <EmptyState icon="bookmark-outline" title="Nothing saved yet" body="Tap the bookmark on a reel to save a cut you want to show your barber." />
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
            {list?.map((r) => <Tile key={r.id} reel={r} size={tile} onPress={() => open(r)} />)}
          </View>
        </View>
      </ScrollView>
      <LocationSheet visible={sheet} onClose={() => setSheet(false)} />
    </View>
  );
}

function Tile({ reel, size, onPress }: { reel: Reel; size: number; onPress: () => void }) {
  const poster = mediaUrl(reel.posterUrl);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Reel by ${reel.barber.name}, ${compact(reel.views)} views`} style={({ pressed }) => [{ width: size, height: size * 1.6, backgroundColor: colors.ink, opacity: pressed ? 0.85 : 1 }]}>
      {poster ? <Image source={{ uri: poster }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : null}
      <Ionicons name="film-outline" size={16} color="#fff" style={{ position: "absolute", top: 8, right: 8 }} />
      <Row gap={4} style={{ position: "absolute", left: 8, bottom: 8 }}>
        <Ionicons name="play-outline" size={14} color="#fff" />
        <T variant="small" color="#fff" style={{ fontFamily: fonts.semibold, textShadowColor: "rgba(0,0,0,0.6)", textShadowRadius: 4 }}>{compact(reel.views)}</T>
      </Row>
    </Pressable>
  );
}
