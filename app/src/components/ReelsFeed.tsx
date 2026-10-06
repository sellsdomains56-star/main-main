import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router, useIsFocused } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, Image, Platform, Pressable, Share, View, type ViewToken } from "react-native";
import { api, mediaUrl } from "../lib/api";
import { useAuth } from "../lib/auth";
import { APP_NAME } from "../lib/config";
import { money } from "../lib/format";
import { tap } from "../lib/haptics";
import type { Reel } from "../lib/types";
import { CommentsSheet, MoreSheet } from "./ReelSheets";
import { compact } from "./ReelThumb";
import { fonts, radius } from "./theme";
import { Avatar, Row, T } from "./ui";

const native = Platform.OS !== "web";

/** Link to a reel that opens it in the app (or on the website). */
export const reelLink = (id: string) => Linking.createURL(`/reel/${id}`);

/**
 * Full-screen vertical reels, Instagram style: swipe up for the next one, tap for sound,
 * double-tap to like, hold to pause; Like · Comment · Share · Save · ⋯ on the right.
 * Opened from a grid, so nothing plays until someone picks a reel.
 */
export function ReelsFeed({ reels, startId, bottomInset = 0, onHide }: { reels: Reel[]; startId?: string; bottomInset?: number; onHide?: (id: string) => void }) {
  const [height, setHeight] = useState(0);
  const [items, setItems] = useState(reels);
  const startIndex = Math.max(0, reels.findIndex((r) => r.id === startId));
  const [active, setActive] = useState(startIndex);
  const [muted, setMuted] = useState(Platform.OS === "web"); // browsers only autoplay muted video
  const [comments, setComments] = useState<Reel | null>(null);
  const [more, setMore] = useState<Reel | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const focused = useIsFocused();
  const { user } = useAuth();

  useEffect(() => setItems(reels), [reels]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems.find((v) => v.isViewable);
    if (first?.index != null) setActive(first.index);
  }).current;

  const patch = (id: string, p: Partial<Reel>) => setItems((list) => list.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const signedIn = useCallback(() => {
    if (user) return true;
    router.push("/login");
    return false;
  }, [user]);

  const like = useCallback(
    async (reel: Reel, onlyLike = false) => {
      if (!signedIn() || (onlyLike && reel.likedByMe)) return;
      patch(reel.id, { likedByMe: !reel.likedByMe, likes: reel.likes + (reel.likedByMe ? -1 : 1) });
      try {
        patch(reel.id, await api.likeReel(reel.id));
      } catch {
        patch(reel.id, reel);
      }
    },
    [signedIn],
  );

  const save = useCallback(
    async (reel: Reel) => {
      if (!signedIn()) return;
      patch(reel.id, { savedByMe: !reel.savedByMe });
      setToast(reel.savedByMe ? "Removed from saved" : "Saved to your collection");
      try {
        patch(reel.id, await api.saveReel(reel.id));
      } catch {
        patch(reel.id, reel);
      }
    },
    [signedIn],
  );

  const copyLink = useCallback(async (reel: Reel) => {
    try {
      await (globalThis.navigator as Navigator | undefined)?.clipboard?.writeText(reelLink(reel.id));
      setToast("Link copied");
    } catch {
      setToast("Couldn't copy the link");
    }
  }, []);

  const share = useCallback(
    async (reel: Reel) => {
      const url = reelLink(reel.id);
      const text = `${reel.barber.name} on ${APP_NAME}${reel.caption ? ` — ${reel.caption}` : ""}`;
      try {
        if (Platform.OS === "web") {
          const nav = globalThis.navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
          if (nav?.share) await nav.share({ title: APP_NAME, text, url });
          else return copyLink(reel);
        } else {
          const res = await Share.share(Platform.OS === "ios" ? { message: text, url } : { message: `${text}\n${url}` });
          if (res.action === Share.dismissedAction) return;
        }
        patch(reel.id, { shares: reel.shares + 1 });
        api.shareReel(reel.id).catch(() => {});
      } catch {
        // cancelled
      }
    },
    [copyLink],
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
              playing={focused && index === active && !comments && !more}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              onLike={(onlyLike) => like(item, onlyLike)}
              onComments={() => setComments(item)}
              onShare={() => share(item)}
              onSave={() => save(item)}
              onMore={() => setMore(item)}
              bottomInset={bottomInset}
            />
          )}
        />
      )}
      {toast && (
        <View pointerEvents="none" style={{ position: "absolute", top: "45%", left: 0, right: 0, alignItems: "center" }}>
          <View style={{ backgroundColor: "rgba(20,20,20,0.92)", paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill }}>
            <T variant="caption" color="#fff" style={{ fontFamily: fonts.semibold }}>{toast}</T>
          </View>
        </View>
      )}
      {comments && <CommentsSheet reel={comments} visible onClose={() => setComments(null)} onCount={(n) => patch(comments.id, { comments: n })} />}
      {more && (
        <MoreSheet
          reel={items.find((r) => r.id === more.id) ?? more}
          visible
          onClose={() => setMore(null)}
          onSave={() => save(items.find((r) => r.id === more.id) ?? more)}
          onCopyLink={() => copyLink(more)}
          onHide={() => {
            setItems((list) => list.filter((r) => r.id !== more.id));
            onHide?.(more.id);
            setToast("We'll show you fewer like this");
          }}
          onReported={() => setToast("Thanks — our team will review it")}
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
  onComments,
  onShare,
  onSave,
  onMore,
  bottomInset,
}: {
  reel: Reel;
  height: number;
  playing: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onLike: (onlyLike?: boolean) => void;
  onComments: () => void;
  onShare: () => void;
  onSave: () => void;
  onMore: () => void;
  bottomInset: number;
}) {
  const [held, setHeld] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const counted = useRef(false);
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heart = useRef(new Animated.Value(0)).current;
  const soundHint = useRef(new Animated.Value(0)).current;
  const player = useVideoPlayer(mediaUrl(reel.videoUrl), (p) => {
    p.loop = true;
    p.muted = muted;
  });

  useEffect(() => {
    player.muted = muted;
  }, [player, muted]);

  useEffect(() => {
    if (playing && !held) player.play();
    else player.pause();
    if (playing && !counted.current) {
      counted.current = true;
      api.viewReel(reel.id).catch(() => {});
    }
  }, [player, playing, held, reel.id]);

  // Thin progress line along the bottom, like Instagram.
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const d = player.duration;
      if (d > 0) setProgress(Math.min(1, player.currentTime / d));
    }, 200);
    return () => clearInterval(t);
  }, [player, playing]);

  const burst = () => {
    heart.setValue(0);
    Animated.sequence([
      Animated.spring(heart, { toValue: 1, useNativeDriver: native, speed: 18, bounciness: 12 }),
      Animated.timing(heart, { toValue: 0, duration: 260, delay: 380, useNativeDriver: native }),
    ]).start();
  };

  // One tap: sound on/off. Two quick taps: like, with the big heart.
  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      lastTap.current = 0;
      burst();
      tap();
      onLike(true);
      return;
    }
    lastTap.current = now;
    tapTimer.current = setTimeout(() => {
      onToggleMute();
      soundHint.setValue(1);
      Animated.timing(soundHint, { toValue: 0, duration: 700, delay: 400, useNativeDriver: native }).start();
    }, 280);
  };

  const b = reel.barber;
  const caption = reel.caption;
  return (
    <View style={{ height, width: "100%", backgroundColor: "#000" }}>
      {reel.posterUrl && <Image source={{ uri: mediaUrl(reel.posterUrl)! }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />}
      <VideoView player={player} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} contentFit="cover" nativeControls={false} />
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}
        onPress={onTap}
        onLongPress={() => setHeld(true)}
        onPressOut={() => setHeld(false)}
        delayLongPress={250}
        accessibilityLabel={muted ? "Turn sound on" : "Turn sound off"}
        accessibilityHint="Double-tap to like, hold to pause"
      >
        <Animated.View pointerEvents="none" style={{ opacity: heart, transform: [{ scale: heart.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }}>
          <Ionicons name="heart" size={110} color="#fff" />
        </Animated.View>
        <Animated.View pointerEvents="none" style={{ position: "absolute", opacity: soundHint, width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={muted ? "volume-mute" : "volume-high"} size={28} color="#fff" />
        </Animated.View>
      </Pressable>

      <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300 }} pointerEvents="none" />

      {/* Right-hand actions */}
      <View style={{ position: "absolute", right: 10, bottom: bottomInset + 26, alignItems: "center", gap: 20 }}>
        <Action icon={reel.likedByMe ? "heart" : "heart-outline"} color={reel.likedByMe ? "#FF3B5C" : "#fff"} label={compact(reel.likes)} onPress={() => onLike()} a11y={reel.likedByMe ? "Unlike" : "Like"} />
        <Action icon="chatbubble-outline" label={compact(reel.comments)} onPress={onComments} a11y="Comments" />
        <Action icon="paper-plane-outline" label={compact(reel.shares)} onPress={onShare} a11y="Share" />
        <Action icon={reel.savedByMe ? "bookmark" : "bookmark-outline"} label="" onPress={onSave} a11y={reel.savedByMe ? "Remove from saved" : "Save"} />
        <Action icon="ellipsis-horizontal" label="" onPress={onMore} a11y="More options" />
        <Pressable onPress={() => router.push({ pathname: "/barber/[id]", params: { id: b.id } })} accessibilityLabel={`${b.name}'s profile`} style={{ borderWidth: 2, borderColor: "#fff", borderRadius: 8, overflow: "hidden" }}>
          <Avatar uri={b.photoUrl} name={b.name} size={30} />
        </Pressable>
      </View>

      {/* Barber, Book, caption */}
      <View style={{ position: "absolute", left: 14, right: 76, bottom: bottomInset + 24 }}>
        <Row gap={10}>
          <Pressable onPress={() => router.push({ pathname: "/barber/[id]", params: { id: b.id } })} accessibilityRole="button" accessibilityLabel={`${b.name}'s profile`}>
            <Row gap={10}>
              <Avatar uri={b.photoUrl} name={b.name} size={34} />
              <T variant="strong" color="#fff" style={{ fontFamily: fonts.semibold }} numberOfLines={1}>{b.name}</T>
            </Row>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: "/book/[barberId]", params: { barberId: b.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Book ${b.name}`}
            style={({ pressed }) => ({ paddingHorizontal: 12, height: 30, justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.75)", backgroundColor: pressed ? "rgba(255,255,255,0.2)" : "transparent" })}
          >
            <T variant="small" color="#fff" style={{ fontFamily: fonts.semibold }}>Book</T>
          </Pressable>
        </Row>
        {!!caption && (
          <Pressable onPress={() => setExpanded((e) => !e)} accessibilityLabel={expanded ? "Show less" : "Show the full caption"}>
            <T color="#fff" numberOfLines={expanded ? undefined : 1} style={{ marginTop: 10 }}>
              {caption}
            </T>
            {!expanded && caption.length > 38 && <T variant="caption" color="rgba(255,255,255,0.7)">more</T>}
          </Pressable>
        )}
        <Row gap={6} style={{ marginTop: 8 }}>
          <Ionicons name="star" size={12} color="#fff" />
          <T variant="small" color="rgba(255,255,255,0.85)">
            {b.rating ? b.rating.toFixed(1) : "New"} · {b.city} · from {money(b.startingPrice, b.currency)}{b.offersHomeVisits ? " · comes to you" : ""}
          </T>
        </Row>
        <Row gap={6} style={{ marginTop: 4 }}>
          <Ionicons name="play-outline" size={12} color="rgba(255,255,255,0.7)" />
          <T variant="small" color="rgba(255,255,255,0.7)">{compact(reel.views)} views</T>
        </Row>
      </View>

      {/* Progress */}
      <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: bottomInset, height: 2, backgroundColor: "rgba(255,255,255,0.2)" }}>
        <View style={{ width: `${progress * 100}%`, height: 2, backgroundColor: "#fff" }} />
      </View>
    </View>
  );
});

function Action({ icon, label, onPress, color = "#fff", a11y }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; color?: string; a11y: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} hitSlop={8} style={{ alignItems: "center", minWidth: 44 }}>
      <Ionicons name={icon} size={29} color={color} />
      {!!label && <T variant="small" color="#fff" style={{ marginTop: 3, fontFamily: fonts.semibold }}>{label}</T>}
    </Pressable>
  );
}
