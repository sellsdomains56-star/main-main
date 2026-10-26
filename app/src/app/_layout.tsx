import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, useFonts } from "@expo-google-fonts/inter";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AlertBanner } from "../components/AlertBanner";
import { PaymentProvider } from "../components/PaymentProvider";
import { WelcomeTour } from "../components/WelcomeTour";
import { colors, fonts } from "../components/theme";
import { AlertsProvider } from "../lib/alerts";
import { api } from "../lib/api";
import { AuthProvider, useAuth } from "../lib/auth";
import { usePushNavigation } from "../lib/push";
import { CartProvider } from "../lib/cart";
import { APP_NAME, DEMO_HOME, DEMO_START } from "../lib/config";
import { DEMO_LOGINS } from "../lib/demo/server";
import { LocationProvider } from "../lib/location";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...Ionicons.font, ...MaterialCommunityIcons.font, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  if (!fontsLoaded && !fontError) return null; // if a font can't load, start anyway with system fonts

  return (
    <AuthProvider>
      <AlertsProvider>
        <PushNavigation />
        <LocationProvider>
          <CartProvider>
            <PaymentProvider>
              <>
                <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerStyle: { backgroundColor: colors.bg },
                    headerShadowVisible: false,
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
                    headerBackButtonDisplayMode: "minimal",
                    contentStyle: { backgroundColor: colors.bg },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false, title: APP_NAME }} />
                  <Stack.Screen name="explore" options={{ title: "Find a barber" }} />
                  <Stack.Screen name="stylist" options={{ title: "AI Try-On" }} />
                  <Stack.Screen name="assistant" options={{ title: "JB Concierge" }} />
                  <Stack.Screen name="help" options={{ title: "Help centre" }} />
                  <Stack.Screen name="portfolio" options={{ title: "My work" }} />
                  <Stack.Screen name="shop" options={{ title: "JB's Fresh Shop" }} />
                  <Stack.Screen name="cart" options={{ title: "Your cart" }} />
                  <Stack.Screen name="order/[orderId]" options={{ title: "Checkout" }} />
                  <Stack.Screen name="orders" options={{ title: "My orders" }} />
                  <Stack.Screen name="barber/[id]" options={{ title: "" }} />
                  <Stack.Screen name="barber-reels/[barberId]" options={{ headerShown: false }} />
                  <Stack.Screen name="book/[barberId]" options={{ title: "Book appointment" }} />
                  <Stack.Screen name="pay/[bookingId]" options={{ title: "Payment" }} />
                  <Stack.Screen name="review/[bookingId]" options={{ title: "Rate your cut", presentation: "modal" }} />
                  <Stack.Screen name="login" options={{ title: "", presentation: "modal" }} />
                  <Stack.Screen name="forgot-password" options={{ title: "Reset password" }} />
                  <Stack.Screen name="reset-password" options={{ title: "New password" }} />
                  <Stack.Screen name="settings" options={{ title: "Settings" }} />
                  <Stack.Screen name="legal/[doc]" options={{ title: "" }} />
                  <Stack.Screen name="become-barber" options={{ title: "Join as a barber" }} />
                  <Stack.Screen name="post-reel" options={{ title: "New reel" }} />
                  <Stack.Screen name="notifications" options={{ title: "Alerts" }} />
                  <Stack.Screen name="reel/[id]" options={{ headerShown: false, animation: "fade" }} />
                  <Stack.Screen name="club" options={{ title: "The Club" }} />
                  <Stack.Screen name="gifts" options={{ title: "Gift cards" }} />
                  <Stack.Screen name="preferences" options={{ title: "My chair" }} />
                  <Stack.Screen name="checkout/[purchaseId]" options={{ title: "Payment" }} />
                  <Stack.Screen name="shops" options={{ title: "Barbershops" }} />
                  <Stack.Screen name="map" options={{ headerShown: false, title: "Map" }} />
                  <Stack.Screen name="barbershop/[shopId]/index" options={{ title: "" }} />
                  <Stack.Screen name="barbershop/[shopId]/book" options={{ title: "Book a chair" }} />
                  <Stack.Screen name="barbershop/[shopId]/hire" options={{ title: "Private hire" }} />
                  <Stack.Screen name="hire/[hireId]" options={{ title: "Payment" }} />
                  <Stack.Screen name="business/index" options={{ title: "Dashboard" }} />
                  <Stack.Screen name="admin" options={{ headerShown: false, title: "Admin panel" }} />
                  <Stack.Screen name="shop-panel" options={{ headerShown: false, title: "Shop panel" }} />
                  <Stack.Screen name="business/services" options={{ title: "Services & prices" }} />
                  <Stack.Screen name="business/hours" options={{ title: "Hours & days off" }} />
                  <Stack.Screen name="business/reviews" options={{ title: "Reviews" }} />
                  <Stack.Screen name="business/blocks" options={{ title: "Block time" }} />
                  <Stack.Screen name="business/rules" options={{ title: "Booking rules & deals" }} />
                  <Stack.Screen name="business/clients" options={{ title: "Clients" }} />
                  <Stack.Screen name="business/link" options={{ title: "My link & QR" }} />
                  <Stack.Screen name="barbershop/[shopId]/queue" options={{ title: "Walk-in queue" }} />
                  <Stack.Screen name="queue-screen" options={{ headerShown: false, title: "Queue" }} />
                  <Stack.Screen name="check-in" options={{ headerShown: false, title: "Check in" }} />
                  <Stack.Screen name="profile" options={{ title: "Profile" }} />
                  <Stack.Screen name="favourites" options={{ title: "Favourites" }} />
                  <Stack.Screen name="my-cuts" options={{ title: "My cuts" }} />
                  <Stack.Screen name="invite" options={{ title: "Invite friends" }} />
                  <Stack.Screen name="visit/[token]" options={{ title: "Barber visit" }} />
                </Stack>
                <AlertBanner />
                <WelcomeTour />
                {DEMO_START && <DemoStart who={DEMO_START} />}
              </>
            </PaymentProvider>
          </CartProvider>
        </LocationProvider>
      </AlertsProvider>
    </AuthProvider>
  );
}

/** Demo page for one side: sign in with its sample account and open its panel, covering the home screen meanwhile. */
function DemoStart({ who }: { who: keyof typeof DEMO_HOME }) {
  const { user, loading, signIn } = useAuth();
  const [covering, setCovering] = useState(true);
  const started = useRef(false);
  useEffect(() => {
    if (loading || started.current) return;
    started.current = true;
    (async () => {
      if (!user) {
        const res = await api.login(DEMO_LOGINS[who].email, DEMO_LOGINS[who].password);
        await signIn(res.token, res.user);
      }
      router.replace(DEMO_HOME[who]);
    })().catch(() => {}).finally(() => setTimeout(() => setCovering(false), 300));
  }, [loading, user, who, signIn]);
  if (!covering) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }]}>
      <ActivityIndicator color={colors.text} />
    </View>
  );
}

/** Tapping a push notification opens the booking it's about. */
function PushNavigation() {
  usePushNavigation();
  return null;
}
