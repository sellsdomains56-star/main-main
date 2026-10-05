import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { colors, radius } from "./theme";

type ArtName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const ART: Record<string, ArtName> = {
  Styling: "lotion-outline",
  "Hair care": "bottle-tonic-outline",
  Beard: "mustache",
  Shave: "razor-double-edge",
  Tools: "content-cut",
  Bundles: "gift-outline",
};

/** Placeholder product art: black line art on a white tile, until real product photos exist. */
export function ProductArt({ category, size }: { category: string; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size > 80 ? radius.lg : radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }}>
      <MaterialCommunityIcons name={ART[category] ?? "tag-outline"} size={size * 0.38} color={colors.text} />
    </View>
  );
}
