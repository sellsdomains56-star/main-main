import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useIsFocused } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Image, Platform, Pressable, View, type ViewToken } from "react-native";
import { api, mediaUrl } from "../lib/api";
import { useAuth } from "../lib/auth";
import { money } from "../lib/format";
import type { Reel } from "../lib/types";
import { compact } from "./ReelThumb";
import { colors, fonts, radius } from "./theme";
import { Avatar, Button, Row, T } from "./ui";

/**
 * Full-screen vertical reels, one video per "page". The visible reel plays,
 * the others pause. Browsers only autoplay muted video, so the web starts muted.
 */
export function ReelsFeed({ reels, startId, bottomInset = 0 }: { reels: Reel[]; startId?: string; bottomInset?: number }) {
  const [height, setHeight] = useState(0);
  const [items, setItems] = useState(reels);
  const startIndex = Math.max(0, reels.findIndex((r) => r.id === startId));
  const [active, setActive] = useState(startIndex);
  const [muted, setMuted] = useState(Platform.OS === "web");
  const focused = useIsFocused();
  const { user } = useAuth();

  useEffect(() => setItems(reels), [reels]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable);
    if (first?.index != null) setActive(first.index);
  }).current;

  const like = useCallback(
    async (reel: Reel) => {
      if (!user) {
        router.push("/login");
        return;
      }
      // Optimistic toggle, then reconcile with the server.
      setItems((list) => list.map((r) => (r.id === reel.id ? { ...r, likedByMe: !r.likedByMe, likes: r.likes + (r.likedByMe ? -1 : 1) } : r)));
      try {
        const updated = await api.likeReel(reel.id);
        setItems((list) => list.map((r) => (r.id === reel.id ? updated : r)));
      } catch {
        setItems((list) => list.map((r) => (r.id === reel.id ? reel : r)));
      }
    },
    [user],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {height > 0 && (
        <FlatList
          data={items}
          keyExtractor={(r) => r.id}
          pagingEnabled
          snapToInterval={height}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          windowSize={3}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          renderItem={({ item, index }) => (
            <ReelPage
              reel={item}
              height={height}
              playing={focused && index === active}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              onLike={() => like(item)}
              bottomInset={bottomInset}
            />
          )}
        />
      )}
    </View>
  );
}

const ReelPage = memo(function ReelPage({
  reel,
  height,
  playing,
  muted,
  onToggleMute,
  onLike,
  bottomInset,
}: {
  reel: Reel;
  height: number;
  playing: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onLike: () => void;
  bottomInset: number;
}) {
  const [paused, setPaused] = useState(false);
  const player = useVideoPlayer(mediaUrl(reel.videoUrl), (p) => {
    p.loop = true;
    p.muted = muted;
  });

  useEffect(() => {
    player.muted = muted;
  }, [player, muted]);

  useEffect(() => {
    if (playing && !paused) player.play();
    else player.pause();
  }, [player, playing, paused]);

  useEffect(() => {
    if (!playing) setPaused(false);
  }, [playing]);

  const b = reel.barber;
  return (
    <View style={{ height, width: "100%", backgroundColor: "#000" }}>
      {reel.posterUrl && <Image source={{ uri: mediaUrl(reel.posterUrl)! }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />}
      <VideoView player={player} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} contentFit="cover" nativeControls={false} />
      <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setPaused((p) => !p)} accessibilityLabel={paused ? "Play" : "Pause"}>
        {paused && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="play" size={72} color="rgba(255,255,255,0.85)" />
          </View>
        )}
      </Pressable>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.75)"]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 320 }}
        pointerEvents="none"
      />

      {/* Right-hand actions */}
      <View style={{ position: "absolute", right: 12, bottom: bottomInset + 130, alignItems: "center", gap: 22 }}>
        <Action icon={reel.likedByMe ? "heart" : "heart-outline"} color={reel.likedByMe ? "#FF3B5C" : "#fff"} label={compact(reel.likes)} onPress={onLike} a11y="Like" />
        <Action icon="person-circle-outline" label="Profile" onPress={() => router.push({ pathname: "/barber/[id]", params: { id: b.id } })} a11y="Barber profile" />
        <Action icon={muted ? "volume-mute" : "volume-high"} label={muted ? "Muted" : "Sound"} onPress={onToggleMute} a11y={muted ? "Unmute" : "Mute"} />
      </View>

      {/* Barber + caption + book */}
      <View style={{ position: "absolute", left: 16, right: 80, bottom: bottomInset + 20 }}>
        <Pressable onPress={() => router.push({ pathname: "/barber/[id]", params: { id: b.id } })}>
          <Row gap={10}>
            <View style={{ borderWidth: 2, borderColor: "#fff", borderRadius: 22 }}>
              <Avatar uri={b.photoUrl} name={b.name} size={40} />
            </View>
            <View>
              <T variant="strong" color="#fff" style={{ fontFamily: fonts.bold }}>{b.name}</T>
              <Row gap={4}>
                <Ionicons name="star" size={12} color={colors.gold} />
                <T variant="small" color="rgba(255,255,255,0.9)">
                  {b.rating ? b.rating.toFixed(1) : "New"} · {b.city}{b.offersHomeVisits ? " · comes to you" : ""}
                </T>
              </Row>
            </View>
          </Row>
        </Pressable>
        {!!reel.caption && (
          <T color="#fff" numberOfLines={2} style={{ marginTop: 10 }}>{reel.caption}</T>
        )}
        <Button
          title={`Book ${b.name.split(" ")[0]} · from ${money(b.startingPrice, b.currency)}`}
          icon="calendar"
          size="md"
          variant="gold"
          onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: b.id } })}
          style={{ marginTop: 14, alignSelf: "flex-start", borderRadius: radius.pill }}
        />
      </View>
    </View>
  );
});

function Action({ icon, label, onPress, color = "#fff", a11y }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; color?: string; a11y: string }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={a11y} hitSlop={8} style={{ alignItems: "center" }}>
      <Ionicons name={icon} size={32} color={color} />
      <T variant="small" color="#fff" style={{ marginTop: 2 }}>{label}</T>
    </Pressable>
  );
}
