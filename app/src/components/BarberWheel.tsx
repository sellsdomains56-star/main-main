import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef } from "react";
import { Animated, Platform, Pressable, View } from "react-native";
import { money } from "../lib/format";
import type { Barber } from "../lib/types";
import { nextFreeLabel } from "./BarberCard";
import { colors, fonts, radius } from "./theme";
import { Photo, Rating, Row, T } from "./ui";

const native = Platform.OS !== "web";

/**
 * The best barbers as a wheel: swipe sideways and each card snaps to the centre, where it's
 * full size and lit with a gold edge; the ones either side tilt back and shrink.
 */
export function BarberWheel({ barbers, width }: { barbers: Barber[]; width: number }) {
  const cardW = Math.min(240, Math.round(width * 0.6));
  const gap = 14;
  const step = cardW + gap;
  const side = (width - cardW) / 2; // so the first and last cards can sit in the middle
  const x = useRef(new Animated.Value(0)).current;

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={step}
      decelerationRate="fast"
      disableIntervalMomentum
      contentContainerStyle={{ paddingHorizontal: side, gap, paddingVertical: 18 }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: native })}
      scrollEventThrottle={16}
      style={Platform.OS === "web" ? ({ scrollSnapType: "x mandatory" } as object) : undefined}
    >
      {barbers.map((b, i) => {
        const range = [(i - 1) * step, i * step, (i + 1) * step];
        const scale = x.interpolate({ inputRange: range, outputRange: [0.84, 1, 0.84], extrapolate: "clamp" });
        const rotateY = x.interpolate({ inputRange: range, outputRange: ["38deg", "0deg", "-38deg"], extrapolate: "clamp" });
        const opacity = x.interpolate({ inputRange: range, outputRange: [0.8, 1, 0.8], extrapolate: "clamp" });
        const glow = x.interpolate({ inputRange: range, outputRange: [0, 1, 0], extrapolate: "clamp" });
        return (
          <Animated.View
            key={b.id}
            style={[
              { width: cardW, opacity, transform: [{ perspective: 900 }, { rotateY }, { scale }] },
              Platform.OS === "web" ? ({ scrollSnapAlign: "center" } as object) : null,
            ]}
          >
            <WheelCard barber={b} rank={i + 1} width={cardW} glow={glow} />
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
}

function WheelCard({ barber, rank, width, glow }: { barber: Barber; rank: number; width: number; glow: Animated.AnimatedInterpolation<number> }) {
  const h = Math.round(width * 1.3);
  const next = nextFreeLabel(barber.nextAvailable, barber.timeZone);
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/barber/[id]", params: { id: barber.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Number ${rank}: ${barber.name}, ${barber.rating ?? "new"} stars`}
      style={{ cursor: "pointer" } as object}
    >
      <View style={{ width, height: h, borderRadius: radius.xl, overflow: "hidden", backgroundColor: colors.ink }}>
        <Photo uri={barber.photoUrl} name={barber.name} style={{ width, height: h }} rounded={radius.xl} />
        <LinearGradient colors={["rgba(11,11,11,0)", "rgba(11,11,11,0.6)", "rgba(11,11,11,0.95)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h * 0.55 }} />
        {/* Gold edge, lit only on the centre card */}
        <Animated.View pointerEvents="none" style={{ position: "absolute", inset: 0, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.neonBright, opacity: glow } as object} />
        <View style={{ position: "absolute", top: 14, left: 14, height: 30, minWidth: 30, paddingHorizontal: 9, borderRadius: 15, borderWidth: 1, borderColor: colors.neon, backgroundColor: "rgba(11,11,11,0.55)", alignItems: "center", justifyContent: "center" }}>
          <T variant="small" color={colors.neonBright} style={{ fontFamily: fonts.bold }}>#{rank}</T>
        </View>
        <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
          <T variant="heading" color={colors.onInk} numberOfLines={1}>{barber.name}</T>
          <Row gap={6} style={{ marginTop: 3 }}>
            <Rating value={barber.rating} color={colors.neonBright} />
            <T variant="caption" color={colors.inkMuted}>· from {money(barber.startingPrice, barber.currency)}</T>
          </Row>
          {next && (
            <Row gap={5} style={{ marginTop: 8 }}>
              <Ionicons name="time-outline" size={13} color={colors.onInk} />
              <T variant="small" color={colors.onInk} style={{ fontFamily: fonts.semibold }}>{next}</T>
            </Row>
          )}
        </View>
      </View>
    </Pressable>
  );
}
