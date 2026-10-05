import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, PanResponder, View } from "react-native";
import { colors, fonts, radius } from "./theme";
import { T } from "./ui";

const KNOB = 50;
const PAD = 5;

/**
 * "Slide to book": drag the white knob across the black track to confirm.
 * Screen-reader users confirm with the standard activate action (double-tap).
 */
export function SlideToConfirm({ label, onConfirm, disabled, loading, disabledLabel, resetAfter }: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
  disabledLabel?: string;
  /** Slide back after confirming (when the action navigates away and the screen stays mounted). */
  resetAfter?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const max = Math.max(0, width - KNOB - PAD * 2);
  const locked = disabled || loading;

  // Spring back after a failed attempt (loading ended but we're still here) or when disabled.
  useEffect(() => {
    if (!loading) Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
  }, [loading, disabled, x]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !locked,
        onMoveShouldSetPanResponder: (_, g) => !locked && Math.abs(g.dx) > 3,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => x.setValue(Math.min(Math.max(g.dx, 0), max)),
        onPanResponderRelease: (_, g) => {
          if (max > 0 && g.dx >= max * 0.82) {
            Animated.timing(x, { toValue: max, duration: 120, useNativeDriver: false }).start(() => {
              onConfirm();
              if (resetAfter) setTimeout(() => Animated.spring(x, { toValue: 0, useNativeDriver: false }).start(), 700);
            });
          } else {
            Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 8 }).start();
          }
        },
        onPanResponderTerminate: () => Animated.spring(x, { toValue: 0, useNativeDriver: false }).start(),
      }),
    [locked, max, onConfirm, x, resetAfter],
  );

  const labelOpacity = max ? x.interpolate({ inputRange: [0, max * 0.6], outputRange: [1, 0], extrapolate: "clamp" }) : 1;
  const fill = x.interpolate({ inputRange: [0, Math.max(max, 1)], outputRange: [KNOB + PAD * 2, width || KNOB + PAD * 2], extrapolate: "clamp" });

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={disabled && disabledLabel ? disabledLabel : label}
      accessibilityHint="Slide right, or double-tap, to confirm"
      accessibilityState={{ disabled: !!locked, busy: !!loading }}
      accessibilityActions={[{ name: "activate" }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === "activate" && !locked && onConfirm()}
      style={{ height: KNOB + PAD * 2, borderRadius: radius.pill, backgroundColor: colors.ink, justifyContent: "center", opacity: disabled ? 0.35 : 1, overflow: "hidden" }}
    >
      {/* The track fills in behind the knob as it moves */}
      <Animated.View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: fill, borderRadius: radius.pill, backgroundColor: colors.inkRaised }} />
      <Animated.View pointerEvents="none" style={{ position: "absolute", left: KNOB + PAD * 2, right: 34, alignItems: "center", opacity: labelOpacity }}>
        <T variant="eyebrow" color={colors.onInk} numberOfLines={1} style={{ fontSize: 12, letterSpacing: 1.6, fontFamily: fonts.bold }}>
          {disabled && disabledLabel ? disabledLabel : label}
        </T>
      </Animated.View>
      <View pointerEvents="none" style={{ position: "absolute", right: 18, flexDirection: "row", opacity: 0.35 }}>
        <Ionicons name="chevron-forward" size={14} color={colors.onInk} />
        <Ionicons name="chevron-forward" size={14} color={colors.onInk} style={{ marginLeft: -6 }} />
      </View>
      <Animated.View
        {...responder.panHandlers}
        style={[{ position: "absolute", left: PAD, width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: colors.onInk, alignItems: "center", justifyContent: "center", transform: [{ translateX: x }] }, { cursor: locked ? "default" : "grab" } as object]}
      >
        {loading ? <ActivityIndicator color={colors.ink} /> : <Ionicons name="arrow-forward" size={22} color={colors.ink} />}
      </Animated.View>
    </View>
  );
}
