import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { colors, fonts } from "../../components/theme";

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (on: IconName, off: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? on : off} color={color} size={24} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home", "home-outline") }} />
      <Tabs.Screen
        name="reels"
        options={{
          title: "Reels",
          tabBarIcon: icon("play-circle", "play-circle-outline"),
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
          tabBarStyle: { backgroundColor: "#000", borderTopColor: "#000" },
        }}
      />
      <Tabs.Screen name="bookings" options={{ title: "Bookings", tabBarIcon: icon("calendar", "calendar-outline") }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person", "person-outline") }} />
    </Tabs>
  );
}
