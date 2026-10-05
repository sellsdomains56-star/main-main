import { Pressable, ScrollView } from "react-native";
import { colors, fonts, radius } from "./theme";
import { T } from "./ui";

/** Horizontal strip of days: "Today 6", "Tue 7"… */
export function DayPicker({ days, value, onChange }: { days: { date: string; label: string }[]; value: string | null; onChange: (date: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: -10, marginHorizontal: -6 }} contentContainerStyle={{ gap: 8, paddingVertical: 10, paddingHorizontal: 6 }}>
      {days.map((d) => {
        const selected = d.date === value;
        const [top, bottom] = d.label === "Today" ? ["Today", d.date.slice(8)] : d.label.split(" ").length === 2 ? orderParts(d.label) : [d.label, ""];
        return (
          <Pressable
            key={d.date}
            onPress={() => onChange(d.date)}
            accessibilityState={{ selected }}
            accessibilityLabel={d.label}
            style={[
              { width: 58, paddingVertical: 10, borderRadius: radius.md, alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
              selected && { borderColor: colors.accent, backgroundColor: colors.accent },
            ]}
          >
            <T variant="small" color={selected ? colors.inkMuted : colors.muted}>{top}</T>
            <T variant="heading" color={selected ? colors.onAccent : colors.text} style={{ fontFamily: fonts.semibold }}>{Number(bottom) || bottom}</T>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** "Tue 6" / "6 Tue" → ["Tue", "6"] regardless of locale order. */
function orderParts(label: string): [string, string] {
  const [a, b] = label.split(" ");
  return /^\d/.test(a) ? [b, a] : [a, b];
}
