import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { colors, radius } from "./theme";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Styling: "color-wand-outline",
  "Hair care": "water-outline",
  Beard: "man-outline",
  Shave: "leaf-outline",
  Tools: "brush-outline",
  Bundles: "gift-outline",
};

/** Placeholder product art: a gold line icon on a quiet tile, until real product photos exist. */
export function ProductArt({ category, size }: { category: string; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size > 80 ? radius.lg : radius.md, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={ICONS[category] ?? "pricetag-outline"} size={size * 0.36} color={colors.gold} />
    </View>
  );
}
