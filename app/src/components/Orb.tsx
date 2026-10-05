import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { glow } from "./theme";

/** The concierge's glowing honey-gold orb. */
export function Orb({ size = 140 }: { size?: number }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2 }, glow]} accessible={false}>
      <LinearGradient
        colors={["#FFE29A", "#F2B53A", "#A86A0E", "#2A1A05"]}
        locations={[0, 0.35, 0.75, 1]}
        start={{ x: 0.25, y: 0.1 }}
        end={{ x: 0.85, y: 0.95 }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
      {/* Soft highlight for a glassy, lit-from-above look */}
      <LinearGradient
        colors={["rgba(255,248,225,0.42)", "rgba(255,248,225,0)"]}
        locations={[0, 0.85]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: -size * 0.05, left: size * 0.17, width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25, transform: [{ scaleY: 0.55 }] }}
      />
    </View>
  );
}
