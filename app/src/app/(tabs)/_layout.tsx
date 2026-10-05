import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, useWindowDimensions, type ColorValue } from "react-native";
import { TabBar } from "../../components/TabBar";
import { colors } from "../../components/theme";

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (on: IconName, off: IconName) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? on : off} color={color} size={22} />;
  };

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const wide = Platform.OS === "web" && width >= 1024; // the website gets the side rail
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} wide={wide} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? "left" : "bottom",
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: icon("home", "home-outline") }} />
      <Tabs.Screen name="reels" options={{ title: "Reels", tabBarIcon: icon("play-circle", "play-circle-outline"), sceneStyle: { backgroundColor: "#000" } }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings", tabBarIcon: icon("calendar", "calendar-outline") }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person", "person-outline") }} />
    </Tabs>
  );
}
