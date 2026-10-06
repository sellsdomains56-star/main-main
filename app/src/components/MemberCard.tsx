import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, PanResponder, Platform, View } from "react-native";
import type { PlanId } from "../lib/types";
import { Monogram } from "./Brand";
import { colors, fonts } from "./theme";
import { T } from "./ui";

const native = Platform.OS !== "web";

const LOOK: Record<PlanId, { bg: [string, string]; ink: string; muted: string; edge: string }> = {
  fresh: { bg: ["#F7F5F1", "#E4E0D9"], ink: colors.ink, muted: "rgba(11,11,11,0.55)", edge: "rgba(11,11,11,0.12)" },
  regular: { bg: ["#2B2B2B", "#121212"], ink: colors.onInk, muted: "rgba(244,242,238,0.6)", edge: "rgba(244,242,238,0.14)" },
  black: { bg: ["#151515", "#000000"], ink: colors.onInk, muted: "rgba(244,242,238,0.6)", edge: colors.gold }, // the one gold line
};

/**
 * The Club member card: a credit-card-sized card with a slow light sweep. Drag across it and it
 * tilts like a real card in your hand.
 */
export function MemberCard({ plan, planName, number, name, validUntil, width }: { plan: PlanId; planName: string; number: string; name: string; validUntil?: string; width: number }) {
  const look = LOOK[plan];
  const height = Math.round(width / 1.586);
  const sweep = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(sweep, { toValue: 1, duration: 2600, useNativeDriver: native }), Animated.delay(2400), Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: native })]));
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => tilt.setValue({ x: Math.max(-1, Math.min(1, g.dx / 120)), y: Math.max(-1, Math.min(1, g.dy / 120)) }),
      onPanResponderRelease: () => Animated.spring(tilt, { toValue: { x: 0, y: 0 }, useNativeDriver: native, friction: 5 }).start(),
      onPanResponderTerminate: () => Animated.spring(tilt, { toValue: { x: 0, y: 0 }, useNativeDriver: native }).start(),
    }),
  ).current;

  const rotateY = tilt.x.interpolate({ inputRange: [-1, 1], outputRange: ["-14deg", "14deg"] });
  const rotateX = tilt.y.interpolate({ inputRange: [-1, 1], outputRange: ["12deg", "-12deg"] });
  const shift = sweep.interpolate({ inputRange: [0, 1], outputRange: [-width, width * 1.4] });

  return (
    <Animated.View
      {...pan.panHandlers}
      accessible
      accessibilityLabel={`${planName} member card, number ${number}, ${name}`}
      style={[
        { width, height, borderRadius: 18, transform: [{ perspective: 800 }, { rotateX }, { rotateY }] },
        Platform.select({ web: { boxShadow: "0 18px 40px rgba(0,0,0,0.28)", cursor: "grab" } as object, default: { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 10 } }),
      ]}
    >
      <View style={{ flex: 1, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: look.edge }}>
        <LinearGradient colors={look.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <Animated.View pointerEvents="none" style={{ position: "absolute", top: -height, bottom: -height, width: width * 0.35, transform: [{ translateX: shift }, { rotate: "20deg" }] }}>
          <LinearGradient colors={["rgba(255,255,255,0)", plan === "fresh" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.10)", "rgba(255,255,255,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
        </Animated.View>
        <View style={{ flex: 1, padding: width * 0.065, justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Monogram size={width * 0.13} color={look.ink} strokeWidth={2} />
            <T variant="eyebrow" color={look.muted} style={{ letterSpacing: 3 }}>The Club</T>
          </View>
          <View>
            <T color={look.ink} style={{ fontFamily: fonts.display, fontSize: width * 0.1, letterSpacing: width * 0.012, lineHeight: width * 0.12 }}>{planName.toUpperCase()}</T>
            <T color={look.ink} style={{ fontFamily: fonts.medium, fontSize: width * 0.045, letterSpacing: 2.5, marginTop: 6 }}>{number}</T>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <T variant="small" color={look.muted} style={{ letterSpacing: 1.4, textTransform: "uppercase" }} numberOfLines={1}>{name}</T>
              {validUntil && <T variant="small" color={look.muted} style={{ letterSpacing: 1.4 }}>VALID {validUntil}</T>}
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
