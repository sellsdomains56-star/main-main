import { Text, View } from "react-native";
import { colors, fonts } from "./theme";

/** The JB monogram in a black circle. `outlined` draws it as a ring for use on black panels. */
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
      <Text style={{ color: colors.onInk, fontFamily: fonts.regular, fontSize: size * 0.4, letterSpacing: -size * 0.04, marginLeft: -size * 0.02 }}>JB</Text>
    </View>
  );
}

/** "JB ALWAYS FRESH / EST. 2026" in spaced capitals, as on the reference's logo lock-up. */
export function Wordmark({ color = colors.text, muted = colors.muted }: { color?: string; muted?: string }) {
  return (
    <View>
      <Text style={{ color, fontFamily: fonts.bold, fontSize: 13, letterSpacing: 2.4 }}>JB ALWAYS FRESH</Text>
      <Text style={{ color: muted, fontFamily: fonts.semibold, fontSize: 9, letterSpacing: 2.2, marginTop: 3 }}>EST. 2026 · WORLDWIDE</Text>
    </View>
  );
}
