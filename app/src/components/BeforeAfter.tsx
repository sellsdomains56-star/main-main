import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { Image, PanResponder, View, type LayoutChangeEvent } from "react-native";
import { colors, fonts, radius } from "./theme";
import { T } from "./ui";

/**
 * Drag the gold handle to compare two photos. The "after" image fills the frame and the
 * "before" image is revealed from the left up to the handle.
 */
export function BeforeAfter({
  beforeUri,
  afterUri,
  beforeLabel = "Before",
  afterLabel = "After",
  height = 320,
}: {
  beforeUri: string;
  afterUri: string;
  beforeLabel?: string;
  afterLabel?: string;
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  const [split, setSplit] = useState(0.5); // 0..1 from the left
  const widthRef = useRef(0);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy), // let vertical scrolls through
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => move(e.nativeEvent.locationX),
        onPanResponderMove: (e) => move(e.nativeEvent.locationX),
      }),
    [],
  );

  function move(x: number) {
    if (!widthRef.current) return;
    setSplit(Math.min(0.97, Math.max(0.03, x / widthRef.current)));
  }

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  };

  const x = width * split;
  return (
    <View
      onLayout={onLayout}
      {...responder.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`${beforeLabel} and ${afterLabel} comparison`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(split * 100) }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => setSplit((s) => Math.min(0.97, Math.max(0.03, s + (e.nativeEvent.actionName === "increment" ? 0.1 : -0.1))))}
      style={{ height, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.ink, cursor: "ew-resize" } as object}
    >
      <Image source={{ uri: afterUri }} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} resizeMode="cover" />
      <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: x, overflow: "hidden" }}>
        <Image source={{ uri: beforeUri }} style={{ width, height }} resizeMode="cover" />
      </View>

      {/* Handle */}
      <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: x - 1, width: 2, backgroundColor: colors.gold }} />
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: height / 2 - 20, left: x - 20, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.gold, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
      >
        <Ionicons name="chevron-back" size={13} color={colors.gold} />
        <Ionicons name="chevron-forward" size={13} color={colors.gold} />
      </View>

      <Label text={beforeLabel} side="left" />
      <Label text={afterLabel} side="right" />
    </View>
  );
}

function Label({ text, side }: { text: string; side: "left" | "right" }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 12, [side]: 12, backgroundColor: "rgba(17,17,17,0.72)", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      <T variant="small" color={side === "right" ? colors.gold : colors.onInk} style={{ fontFamily: fonts.semibold, letterSpacing: 1 }}>
        {text.toUpperCase()}
      </T>
    </View>
  );
}
