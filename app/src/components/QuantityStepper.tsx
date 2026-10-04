import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { colors, radius } from "./theme";
import { T } from "./ui";

export function QuantityStepper({ value, onChange, compact }: { value: number; onChange: (v: number) => void; compact?: boolean }) {
  const btn = (icon: "remove" | "add" | "trash-outline", next: number, label: string) => (
    <Pressable accessibilityLabel={label} onPress={() => onChange(next)} hitSlop={6} style={{ padding: compact ? 6 : 8 }}>
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 4 }}>
      {btn(value === 1 ? "trash-outline" : "remove", value - 1, "Remove one")}
      <T variant="strong" center style={{ minWidth: 22 }}>{value}</T>
      {btn("add", value + 1, "Add one")}
    </View>
  );
}
