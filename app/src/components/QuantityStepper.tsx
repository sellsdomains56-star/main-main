import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "./theme";

export function QuantityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const t = useTheme();
  const btn = (icon: "remove" | "add", next: number, label: string) => (
    <Pressable accessibilityLabel={label} onPress={() => onChange(next)} hitSlop={6} style={{ backgroundColor: t.chip, borderRadius: 999, padding: 6 }}>
      <Ionicons name={icon} size={18} color={t.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      {btn("remove", value - 1, "Remove one")}
      <Text style={{ color: t.text, fontWeight: "700", fontSize: 16, minWidth: 18, textAlign: "center" }}>{value}</Text>
      {btn("add", value + 1, "Add one")}
    </View>
  );
}
