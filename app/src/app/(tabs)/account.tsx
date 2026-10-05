import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocationSheet } from "../../components/LocationSheet";
import { colors } from "../../components/theme";
import { Avatar, Button, Card, Divider, ListRow, Loading, Row, Screen, Section, T } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { APP_NAME, SHOP_NAME } from "../../lib/config";
import { flag, useLocation } from "../../lib/location";

export default function Account() {
  const insets = useSafeAreaInsets();
  const { user, loading, signOut } = useAuth();
  const { place, country } = useLocation();
  const [sheet, setSheet] = useState(false);
  if (loading) return <Screen><Loading /></Screen>;

  const where = place ? `${flag(place.countryCode)} ${place.city || "All cities"}, ${country?.name ?? ""}` : "Not set";

  return (
    <Screen>
      <View style={{ marginTop: insets.top + 8 }}>
        {user ? (
          <Row gap={14}>
            <Avatar name={user.name} size={64} />
            <View style={{ flex: 1 }}>
              <T variant="title">{user.name}</T>
              <T variant="caption" muted>{user.email}</T>
              {user.role === "barber" && <T variant="caption" color={colors.goldDeep}>Barber account</T>}
            </View>
          </Row>
        ) : (
          <Card tone="surface">
            <T variant="title">Welcome to {APP_NAME}</T>
            <T muted style={{ marginTop: 6 }}>Sign in to book barbers, pay with Apple Pay or Google Pay, save reels and use the AI stylist.</T>
            <Button title="Sign in or create account" onPress={() => router.push("/login")} style={{ marginTop: 16 }} />
          </Card>
        )}
      </View>

      {user?.role === "barber" && user.barberId && (
        <Section title="Your business">
          <ListRow icon="images-outline" title="My work" subtitle="Profile photo, portfolio, before & afters" onPress={() => router.push("/portfolio")} />
          <ListRow icon="videocam-outline" title="Post a reel" subtitle="Show off your latest cut" onPress={() => router.push("/post-reel")} />
          <ListRow icon="person-circle-outline" title="My public profile" subtitle="Services, reels and reviews" onPress={() => router.push({ pathname: "/barber/[id]", params: { id: user.barberId! } })} />
          <ListRow icon="calendar-outline" title="Appointments" onPress={() => router.push("/bookings")} />
        </Section>
      )}

      <Section title="General">
        {user?.role !== "barber" && <ListRow icon="calendar-outline" title="My bookings" onPress={() => router.push("/bookings")} />}
        <ListRow icon="bag-handle-outline" title={`${SHOP_NAME} orders`} onPress={() => router.push("/orders")} />
        <ListRow icon="location-outline" title="My city" subtitle={where} onPress={() => setSheet(true)} />
        <ListRow icon="sparkles-outline" title="AI Try-On" subtitle="See new styles on your own photo" onPress={() => router.push("/stylist")} />
      </Section>

      <Section title="Support">
        <ListRow icon="chatbubble-ellipses-outline" title="JB Concierge" subtitle="Ask anything, 24/7" onPress={() => router.push("/assistant")} />
        <ListRow icon="help-circle-outline" title="Help centre" subtitle="FAQs and contact support" onPress={() => router.push("/help")} />
      </Section>

      {!user && (
        <Section title="For barbers">
          <ListRow icon="cut-outline" title={`Join ${APP_NAME}`} subtitle="Get booked by customers in your city" onPress={() => router.push("/become-barber")} />
        </Section>
      )}

      {user && (
        <>
          <Divider style={{ marginTop: 24 }} />
          <ListRow icon="log-out-outline" title="Sign out" danger onPress={signOut} />
        </>
      )}
      <LocationSheet visible={sheet} onClose={() => setSheet(false)} />
    </Screen>
  );
}
