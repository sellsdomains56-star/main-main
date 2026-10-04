import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaymentProvider } from "../components/PaymentProvider";
import { useTheme } from "../components/theme";
import { AuthProvider } from "../lib/auth";
import { CartProvider } from "../lib/cart";
import { APP_NAME } from "../lib/config";
import { LocationProvider } from "../lib/location";

export default function RootLayout() {
  const t = useTheme();
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <PaymentProvider>
            <>
              <StatusBar style="auto" />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: t.card },
                  headerTintColor: t.text,
                  headerTitleStyle: { fontWeight: "700" },
                  contentStyle: { backgroundColor: t.bg },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false, title: APP_NAME }} />
                <Stack.Screen name="barber/[id]" options={{ title: "Barber" }} />
                <Stack.Screen name="book/[barberId]" options={{ title: "Book appointment" }} />
                <Stack.Screen name="pay/[bookingId]" options={{ title: "Payment" }} />
                <Stack.Screen name="review/[bookingId]" options={{ title: "Rate your barber", presentation: "modal" }} />
                <Stack.Screen name="login" options={{ title: "Sign in", presentation: "modal" }} />
                <Stack.Screen name="become-barber" options={{ title: "Join as a barber" }} />
                <Stack.Screen name="cart" options={{ title: "Your cart" }} />
                <Stack.Screen name="order/[orderId]" options={{ title: "Checkout" }} />
                <Stack.Screen name="orders" options={{ title: "My orders" }} />
              </Stack>
            </>
          </PaymentProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
