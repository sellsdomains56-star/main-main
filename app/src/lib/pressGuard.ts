import { useRef } from "react";
import { Platform, type GestureResponderEvent } from "react-native";

/**
 * On phone browsers, the touch that stops a scrolling list (or the end of a short drag) can arrive
 * as a tap on whatever tile is under the finger. Instagram ignores those; so do we.
 */
let lastScroll = 0;
if (Platform.OS === "web" && typeof document !== "undefined") {
  document.addEventListener("scroll", () => (lastScroll = Date.now()), { capture: true, passive: true });
}

const MOVE = 10; // px a finger may drift and still count as a tap
const SETTLE = 220; // ms after the last scroll before a tap counts

/** Props for a tile inside a scrolling list: `onPress` only fires for a deliberate tap. */
export function useTapGuard(onPress: () => void) {
  const start = useRef<{ x: number; y: number; scrolled: number } | null>(null);
  return {
    onPressIn: (e: GestureResponderEvent) => {
      start.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, scrolled: lastScroll };
    },
    onPress: (e: GestureResponderEvent) => {
      const s = start.current;
      start.current = null;
      if (s) {
        const moved = Math.abs(e.nativeEvent.pageX - s.x) > MOVE || Math.abs(e.nativeEvent.pageY - s.y) > MOVE;
        const scrolling = Date.now() - lastScroll < SETTLE || lastScroll !== s.scrolled;
        if (moved || scrolling) return;
      }
      onPress();
    },
  };
}
