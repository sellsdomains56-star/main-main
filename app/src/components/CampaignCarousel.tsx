import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { resolveMedia } from "../lib/config";
import type { Campaign } from "../lib/types";
import { colors, fonts, radius } from "./theme";
import { Row, styles, T } from "./ui";

/** Campaign banners: full-bleed photos with an offer, swiping by themselves until touched. */
export function CampaignCarousel({ campaigns, width }: { campaigns: Campaign[]; width: number }) {
  const scroller = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const touched = useRef(false);
  const height = Math.round(Math.min(width * 0.72, 340));

  useEffect(() => {
    if (campaigns.length < 2) return;
    const timer = setInterval(() => {
      if (touched.current) return;
      setIndex((i) => {
        const next = (i + 1) % campaigns.length;
        scroller.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [width, campaigns.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index && i >= 0 && i < campaigns.length) setIndex(i);
  };

  if (!campaigns.length) return null;
  return (
    <View>
      <View style={{ width, height, borderRadius: radius.xl, overflow: "hidden", backgroundColor: colors.ink }}>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          onTouchStart={() => (touched.current = true)}
          onScrollBeginDrag={() => (touched.current = true)}
        >
          {campaigns.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => router.push((c.link.params ? { pathname: c.link.pathname, params: c.link.params } : c.link.pathname) as never)}
              accessibilityRole="button"
              accessibilityLabel={`${c.title}. ${c.body} ${c.cta}`}
              style={({ pressed }) => [{ width, height, cursor: "pointer" } as object, pressed && styles.pressed]}
            >
              <Image source={{ uri: resolveMedia(c.photoUrl) ?? undefined }} resizeMode="cover" style={{ position: "absolute", width, height }} />
              <LinearGradient
                colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.25)", "rgba(11,11,11,0.88)"]}
                locations={[0, 0.4, 1]}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <View style={{ flex: 1, justifyContent: "flex-end", padding: 20 }}>
                <T variant="eyebrow" color={colors.inkMuted} style={{ letterSpacing: 2.5 }}>{c.eyebrow}</T>
                <Text style={{ fontFamily: fonts.display, color: colors.onInk, fontSize: 28, lineHeight: 31, letterSpacing: -1, marginTop: 6 }} numberOfLines={2}>{c.title}</Text>
                <T variant="caption" color={colors.inkMuted} numberOfLines={2} style={{ marginTop: 6, maxWidth: 420 }}>{c.body}</T>
                <Row gap={8} style={{ marginTop: 14 }}>
                  <View style={{ height: 38, paddingLeft: 16, paddingRight: 6, borderRadius: radius.pill, backgroundColor: colors.onInk, flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <T variant="caption" color={colors.ink} style={{ fontFamily: fonts.semibold }}>{c.cta}</T>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="arrow-forward" size={15} color={colors.onInk} />
                    </View>
                  </View>
                </Row>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {campaigns.length > 1 && (
        <Row gap={6} style={{ justifyContent: "center", marginTop: 12 }}>
          {campaigns.map((c, i) => (
            <View key={c.id} style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === index ? colors.ink : colors.surfaceStrong }} />
          ))}
        </Row>
      )}
    </View>
  );
}
