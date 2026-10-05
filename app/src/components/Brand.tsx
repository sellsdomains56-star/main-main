import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import monogram from "../../assets/brand/monogram.json";
import { colors, fonts } from "./theme";

/**
 * The JB monogram: a J and a B drawn in one thin line, sharing a stem — the J's top bar
 * runs into the B and its hook curls below. assets/brand/monogram.json also feeds the
 * app icon (scripts/make-icons.mjs).
 */
export function Monogram({ size = 48, color = colors.text, strokeWidth = 2.4 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox={monogram.viewBox} accessibilityLabel="JB">
      {monogram.paths.map((d) => (
        <Path key={d} d={d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="square" strokeLinejoin="miter" />
      ))}
    </Svg>
  );
}

/** The monogram in a circle — the app icon, the side rail and small headers. */
export function Logo({ size = 44, outlined }: { size?: number; outlined?: boolean }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="JB Always Fresh"
      style={{
        width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center",
        backgroundColor: colors.ink, borderWidth: outlined ? 1 : 0, borderColor: "rgba(244,242,238,0.35)",
      }}
    >
      <Monogram size={size * 0.78} color={colors.onInk} strokeWidth={size < 50 ? 3.4 : 2.8} />
    </View>
  );
}

/** The full logo: JB monogram with ALWAYS FRESH beneath it (and EST. 2026). */
export function LogoLockup({ size = 64, color = colors.text, muted = colors.muted, est = true }: { size?: number; color?: string; muted?: string; est?: boolean }) {
  return (
    <View accessibilityRole="image" accessibilityLabel="JB Always Fresh" style={{ alignItems: "center" }}>
      <Monogram size={size} color={color} strokeWidth={size < 50 ? 3.2 : 2.4} />
      <Text style={{ color, fontFamily: fonts.bold, fontSize: Math.max(10, size * 0.19), letterSpacing: Math.max(2, size * 0.05), marginTop: size * 0.02 }}>ALWAYS FRESH</Text>
      {est && <Text style={{ color: muted, fontFamily: fonts.semibold, fontSize: Math.max(8, size * 0.13), letterSpacing: 2, marginTop: 3 }}>EST. 2026</Text>}
    </View>
  );
}

/** "JB ALWAYS FRESH / EST. 2026" in spaced capitals, for one-line headers. */
export function Wordmark({ color = colors.text, muted = colors.muted }: { color?: string; muted?: string }) {
  return (
    <View>
      <Text style={{ color, fontFamily: fonts.bold, fontSize: 13, letterSpacing: 2.4 }}>JB ALWAYS FRESH</Text>
      <Text style={{ color: muted, fontFamily: fonts.semibold, fontSize: 9, letterSpacing: 2.2, marginTop: 3 }}>EST. 2026 · WORLDWIDE</Text>
    </View>
  );
}
