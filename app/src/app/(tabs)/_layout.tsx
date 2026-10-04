import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { useTheme } from "../../components/theme";
import { useCart } from "../../lib/cart";
import { APP_NAME } from "../../lib/config";

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color} size={size} />;

export default function TabsLayout() {
  const t = useTheme();
  const { count } = useCart();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
        headerStyle: { backgroundColor: t.card },
        headerTintColor: t.text,
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: APP_NAME, tabBarLabel: "Home", tabBarIcon: icon("home") }} />
      <Tabs.Screen name="barbers" options={{ title: "Find a barber", tabBarLabel: "Barbers", tabBarIcon: icon("cut") }} />
      <Tabs.Screen name="stylist" options={{ title: "AI Stylist", tabBarIcon: icon("sparkles") }} />
      <Tabs.Screen name="shop" options={{ title: "GP's Fresh Shop", tabBarLabel: "Shop", tabBarIcon: icon("bag-handle"), tabBarBadge: count || undefined }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings", tabBarIcon: icon("calendar") }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: icon("person-circle") }} />
    </Tabs>
  );
}
