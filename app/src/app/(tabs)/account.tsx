import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocationSheet } from "../../components/LocationSheet";
import { colors } from "../../components/theme";
import { Avatar, Button, Card, Divider, ListRow, Loading, Row, Screen, Section, T } from "../../components/ui";
import { useAlerts } from "../../lib/alerts";
import { useAuth } from "../../lib/auth";
import { APP_NAME, DEMO_DATA, SHOP_NAME } from "../../lib/config";
import { flag, useLocation } from "../../lib/location";

export default function Account() {
  const insets = useSafeAreaInsets();
  const { user, loading, signOut } = useAuth();
  const { unread } = useAlerts();
  const { place, country } = useLocation();
  const [sheet, setSheet] = useState(false);
  if (loading) return <Screen><Loading /></Screen>;

  const where = place ? `${flag(place.countryCode)} ${place.city || "All cities"}, ${country?.name ?? ""}` : "Not set";

  return (
    <Screen>
      <View style={{ marginTop: insets.top + 8 }}>
        {user ? (
          <Pressable onPress={() => router.push("/profile")} accessibilityRole="button" accessibilityLabel="Edit profile">
            <Row gap={14}>
              <Avatar uri={user.photoUrl} name={user.name} size={64} />
              <View style={{ flex: 1 }}>
                <T variant="title">{user.name}</T>
                <T variant="caption" muted>{user.email}</T>
                {user.role === "barber" ? <T variant="caption" color={colors.accent}>Barber account</T> : <T variant="caption" style={{ textDecorationLine: "underline", marginTop: 2 }}>Edit profile</T>}
              </View>
            </Row>
          </Pressable>
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
          <ListRow icon="speedometer-outline" title="Dashboard" subtitle="Today's chairs, earnings, reviews" onPress={() => router.push("/business")} />
          <ListRow icon="pricetags-outline" title="Services & prices" subtitle="What you offer, how long, how much; home visits" onPress={() => router.push("/business/services")} />
          <ListRow icon="time-outline" title="Hours & days off" subtitle="Working days, opening hours, holidays" onPress={() => router.push("/business/hours")} />
          <ListRow icon="images-outline" title="My work" subtitle="Photo, bio, portfolio, before & afters" onPress={() => router.push("/portfolio")} />
          <ListRow icon="videocam-outline" title="Post a reel" subtitle="Show off your latest cut" onPress={() => router.push("/post-reel")} />
          <ListRow icon="person-circle-outline" title="My public profile" subtitle="Services, reels and reviews" onPress={() => router.push({ pathname: "/barber/[id]", params: { id: user.barberId! } })} />
          <ListRow icon="calendar-outline" title="Appointments" onPress={() => router.push("/bookings")} />
        </Section>
      )}

      {user?.manages && (
        <Section title="Your barbershop">
          <ListRow icon="storefront-outline" title="Shop panel" subtitle="Calendar, walk-ins, barbers' hours, services, reports" onPress={() => router.push("/shop-panel")} />
        </Section>
      )}

      {user?.admin && (
        <Section title="JB team">
          <ListRow icon="shield-checkmark-outline" title="Admin panel" subtitle="Approve barbers, bookings & refunds, support, settings" onPress={() => router.push("/admin")} />
        </Section>
      )}

      {user?.role !== "barber" && (
        <Section title="Members">
          <ListRow icon="card-outline" title="The Club" subtitle="Monthly cuts, member pricing, your member card" onPress={() => router.push("/club")} />
          <ListRow icon="person-outline" title="My chair" subtitle="Quiet or chatty, your drink, your usual cut" onPress={() => router.push("/preferences")} />
          <ListRow icon="cut-outline" title="My cuts" subtitle="Notes and photos from every cut, rebook reminders" onPress={() => router.push("/my-cuts")} />
          <ListRow icon="heart-outline" title="Favourites" subtitle={user?.favourites?.length ? `${user.favourites.length} saved ${user.favourites.length === 1 ? "barber" : "barbers"}` : "Barbers you saved"} onPress={() => router.push("/favourites")} />
          <ListRow icon="people-outline" title="Invite friends" subtitle="Give credit, get credit after their first cut" onPress={() => router.push("/invite")} />
          <ListRow icon="gift-outline" title="Gift cards" subtitle="Send one, or redeem a code" onPress={() => router.push("/gifts")} />
          <ListRow icon="bookmark-outline" title="Saved reels" subtitle="Your style board for the next cut" onPress={() => router.push("/reels")} />
        </Section>
      )}

      <Section title="General">
        {user?.role !== "barber" && <ListRow icon="calendar-outline" title="My bookings" onPress={() => router.push("/bookings")} />}
        {user && <ListRow icon="chatbubbles-outline" title="Messages" subtitle={user.role === "barber" ? "Questions from your clients" : "Talk to barbers you've booked"} onPress={() => router.push("/messages")} />}
        <ListRow
          icon="notifications-outline"
          title="Alerts"
          subtitle={unread ? `${unread} new` : "Bookings, reminders, barber on the way"}
          onPress={() => router.push("/notifications")}
        />
        <ListRow icon="bag-handle-outline" title={`${SHOP_NAME} orders`} onPress={() => router.push("/orders")} />
        <ListRow icon="location-outline" title="My city" subtitle={where} onPress={() => setSheet(true)} />
        <ListRow icon="settings-outline" title="Settings" subtitle={user ? "Alerts, your data, legal, delete account" : "Terms and privacy"} onPress={() => router.push("/settings")} />
        <ListRow icon="sparkles-outline" title="AI Try-On" subtitle="See new styles on your own photo" onPress={() => router.push("/stylist")} />
      </Section>

      <Section title="Support">
        <ListRow icon="chatbubble-ellipses-outline" title="JB Concierge" subtitle="Ask anything, 24/7" onPress={() => router.push("/assistant")} />
        <ListRow icon="help-circle-outline" title="Help centre" subtitle="FAQs and contact support" onPress={() => router.push("/help")} />
      </Section>

      {!user && DEMO_DATA && (
        <Section title="Demo">
          <ListRow icon="cut-outline" title="Try as a barber" subtitle="Dashboard, earnings, services, hours" onPress={() => router.push("/login")} />
          <ListRow icon="storefront-outline" title="Try as a barbershop" subtitle="The shop panel: calendar, walk-ins, team hours" onPress={() => router.push("/login")} />
          <ListRow icon="shield-checkmark-outline" title="Try as the JB team" subtitle="The admin panel with sample data" onPress={() => router.push("/login")} />
        </Section>
      )}

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
