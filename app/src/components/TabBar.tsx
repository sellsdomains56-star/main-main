import { Ionicons } from "@expo/vector-icons";
import { router, type Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth";
import { Logo } from "./Brand";
import { colors, fonts, radius } from "./theme";
import { Avatar, T } from "./ui";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const OFF = "rgba(244,242,238,0.45)";

/**
 * The black navigation from the reference: a docked bar on phones, and on wide screens
 * the rounded black side rail with the monogram, the tabs, "Book now" and your avatar.
 */
export function TabBar({ state, descriptors, navigation, wide }: TabBarProps & { wide: boolean }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const onReels = state.routes[state.index]?.name === "reels";

  const items = state.routes.map((route, index) => {
    const { options } = descriptors[route.key]!;
    const focused = state.index === index;
    const color = focused ? colors.onInk : OFF;
    const label = options.title ?? route.name;
    const onPress = () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
    };
    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={label}
        style={({ pressed }) => [
          { alignItems: "center", justifyContent: "center", gap: 4, minHeight: 52 },
          wide ? { width: 64, paddingVertical: 10, borderRadius: radius.lg, backgroundColor: focused ? colors.inkRaised : "transparent" } : { flex: 1 },
          pressed && { opacity: 0.7 },
        ]}
      >
        {options.tabBarIcon?.({ focused, color, size: 22 })}
        <T variant="small" color={color} style={{ fontFamily: fonts.semibold, fontSize: 11 }}>{label}</T>
      </Pressable>
    );
  });

  if (wide) {
    return (
      <View style={{ width: 112, padding: 16, paddingRight: 0, backgroundColor: colors.bg }}>
        <View style={{ flex: 1, backgroundColor: colors.ink, borderRadius: 44, alignItems: "center", paddingVertical: 22 }}>
          <Pressable onPress={() => navigation.navigate("index")} accessibilityLabel="Home">
            <Logo size={54} outlined />
          </Pressable>
          <View style={{ marginTop: 36, gap: 8 }}>{items}</View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => router.push("/explore")} accessibilityRole="button" accessibilityLabel="Book now" style={{ width: 64, height: 120, alignItems: "center", justifyContent: "center" }}>
            <T variant="eyebrow" color={colors.onInk} style={{ width: 120, textAlign: "center", transform: [{ rotate: "-90deg" }], letterSpacing: 2.4 }}>Book now</T>
          </Pressable>
          <Pressable onPress={() => router.push(user ? "/account" : "/login")} accessibilityLabel={user ? "Account" : "Sign in"} style={{ marginTop: 16 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: "rgba(244,242,238,0.35)", alignItems: "center", justifyContent: "center" }}>
              {user ? <Avatar name={user.name} size={48} /> : <Ionicons name="person-outline" size={22} color={colors.onInk} />}
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: onReels ? "#000" : colors.bg }}>
      <View style={{ flexDirection: "row", backgroundColor: colors.ink, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 8, paddingHorizontal: 8, paddingBottom: Math.max(insets.bottom, 8) }}>
        {items}
      </View>
    </View>
  );
}
