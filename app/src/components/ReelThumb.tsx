import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, View } from "react-native";
import { mediaUrl } from "../lib/api";
import type { Reel } from "../lib/types";
import { colors, radius } from "./theme";
import { Row, styles, T } from "./ui";

export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n));

export function ReelThumb({ reel, width = 120, onPress, showBarber = true }: { reel: Reel; width?: number; onPress: () => void; showBarber?: boolean }) {
  const poster = mediaUrl(reel.posterUrl);
  return (
    <Pressable onPress={onPress} accessibilityLabel={`Play reel by ${reel.barber.name}`} style={({ pressed }) => [{ width }, pressed && styles.pressed]}>
      <View style={{ width, height: width * 1.6, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.text }}>
        {poster ? (
          <Image source={{ uri: poster }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink }}>
            <Ionicons name="play-circle" size={36} color={colors.gold} />
          </View>
        )}
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.25)" }}>
          <Row gap={4}>
            <Ionicons name="play" size={12} color="#fff" />
            <T variant="small" color="#fff">{compact(reel.likes)}</T>
          </Row>
        </View>
      </View>
      {showBarber && <T variant="caption" numberOfLines={1} style={{ marginTop: 6 }}>{reel.barber.name}</T>}
    </Pressable>
  );
}
