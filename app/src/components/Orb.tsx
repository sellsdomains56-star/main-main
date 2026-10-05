import { LinearGradient } from "expo-linear-gradient";
import { Platform, View } from "react-native";

const depth = Platform.select({
  web: { boxShadow: "0 28px 60px rgba(0,0,0,0.28), 0 6px 16px rgba(0,0,0,0.18)" },
  default: { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 16 }, elevation: 10 },
}) as object;

/** The concierge's glossy black orb. */
export function Orb({ size = 140 }: { size?: number }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2 }, depth]} accessible={false}>
      <LinearGradient
        colors={["#7A7A7A", "#2E2E2E", "#0E0E0E", "#000000"]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0.25, y: 0.05 }}
        end={{ x: 0.8, y: 0.95 }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
      {/* Soft highlight for a glassy, lit-from-above look */}
      <LinearGradient
        colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0)"]}
        locations={[0, 0.85]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: -size * 0.05, left: size * 0.17, width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25, transform: [{ scaleY: 0.55 }] }}
      />
    </View>
  );
}
