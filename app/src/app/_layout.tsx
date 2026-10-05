import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, useFonts } from "@expo-google-fonts/inter";
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaymentProvider } from "../components/PaymentProvider";
import { colors, fonts } from "../components/theme";
import { AuthProvider } from "../lib/auth";
import { CartProvider } from "../lib/cart";
import { APP_NAME } from "../lib/config";
import { LocationProvider } from "../lib/location";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...Ionicons.font, PlayfairDisplay_700Bold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  if (!fontsLoaded && !fontError) return null; // if a font can't load, start anyway with system fonts

  return (
    <AuthProvider>
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
                <Stack.Screen name="become-barber" options={{ title: "Join as a barber" }} />
                <Stack.Screen name="post-reel" options={{ title: "New reel" }} />
              </Stack>
            </>
          </PaymentProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
