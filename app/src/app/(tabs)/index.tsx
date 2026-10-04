import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberTile } from "../../components/BarberCard";
import { LocationPill, LocationSheet } from "../../components/LocationSheet";
import { ReelThumb } from "../../components/ReelThumb";
import { colors, fonts, radius } from "../../components/theme";
import { Avatar, Card, IconButton, Loading, Row, SearchBar, Section, styles, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { APP_NAME, SHOP_NAME } from "../../lib/config";
import { dateTime, money, STATUS_LABEL } from "../../lib/format";
import { useLocation } from "../../lib/location";
import type { Barber, Booking, Reel } from "../../lib/types";
import { useCatalog } from "../../lib/useCatalog";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { count } = useCart();
  const { place, country } = useLocation();
  const { catalog } = useCatalog(place?.countryCode);
  const [barbers, setBarbers] = useState<Barber[] | null>(null);
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [next, setNext] = useState<Booking | null>(null);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    if (!place) return;
    setBarbers(null);
    const filter = { country: place.countryCode, city: place.city || undefined };
    api.barbers(filter).then(setBarbers, () => setBarbers([]));
    api.reels(filter).then(setReels, () => setReels([]));
  }, [place]);

  useFocusEffect(
    useCallback(() => {
      if (!user || user.role !== "customer") return setNext(null);
      api.bookings().then(
        (list) => setNext(list.filter((b) => ["confirmed", "on_the_way", "pending_payment"].includes(b.status) && Date.parse(b.endsAt) > Date.now()).sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null),
        () => {},
      );
    }, [user]),
  );

  const where = place ? place.city || country?.name : null;
  const pageWidth = Math.min(width, 760) - 40;
  const banner = Math.min(pageWidth * 0.86, 420);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={[styles.inner, { paddingHorizontal: 20 }]}>
        {/* Top bar */}
        <Row style={{ justifyContent: "space-between" }}>
          <LocationPill label="Book barbers in" />
          <Row gap={10}>
            <IconButton icon="bag-handle-outline" label="Cart" badge={count} onPress={() => router.push(count ? "/cart" : "/shop")} />
            {user ? (
              <Pressable onPress={() => router.push("/account")} accessibilityLabel="Account">
                <Avatar name={user.name} size={42} />
              </Pressable>
            ) : (
              <IconButton icon="person-outline" label="Sign in" onPress={() => router.push("/login")} />
            )}
          </Row>
        </Row>

        <T variant="display" style={{ marginTop: 22 }}>
          {greeting()}{user ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </T>
        <T muted style={{ marginTop: 4 }}>Ready to get fresh?</T>

        <View style={{ marginTop: 18 }}>
          <SearchBar placeholder="Search barbers, fades, beards…" onPress={() => router.push("/explore")} />
        </View>

        {/* Service tiles */}
        <Row gap={12} style={{ marginTop: 20, alignItems: "stretch" }}>
          <BigTile title="Book a barber" subtitle="At the shop" emoji="💈" bg={colors.brandSoft} onPress={() => router.push("/explore")} />
          <BigTile title="Barber at home" subtitle="They come to you" emoji="🏠" bg={colors.peach} onPress={() => router.push({ pathname: "/explore", params: { home: "1" } })} />
        </Row>
        <Row gap={12} style={{ marginTop: 12 }}>
          <SmallTile title="AI Stylist" emoji="✨" bg={colors.lilac} onPress={() => router.push("/stylist")} />
          <SmallTile title="Reels" emoji="🎬" bg={colors.rose} onPress={() => router.push("/reels")} />
          <SmallTile title="Shop" emoji="🛍️" bg={colors.sky} onPress={() => router.push("/shop")} />
        </Row>

        {/* Upcoming appointment */}
        {next && (
          <Card style={{ marginTop: 20 }} onPress={() => router.push("/bookings")}>
            <Row gap={12}>
              <Avatar uri={next.barber.photoUrl} name={next.barber.name} size={48} />
              <View style={{ flex: 1 }}>
                <T variant="small" muted>Your next cut</T>
                <T variant="strong">{next.service?.name} · {next.barber.name}</T>
                <T variant="caption" muted>{dateTime(next.startsAt, next.barber.timeZone)}</T>
              </View>
              <Tag label={STATUS_LABEL[next.status]} tone={next.status === "pending_payment" ? "warn" : "brand"} />
            </Row>
          </Card>
        )}

        {!place && (
          <Card tone="surface" style={{ marginTop: 20 }} onPress={() => setSheet(true)}>
            <Row gap={12}>
              <T style={{ fontSize: 30, lineHeight: 36 }}>📍</T>
              <View style={{ flex: 1 }}>
                <T variant="strong">Where are you?</T>
                <T variant="caption" muted>Pick your city to see barbers near you.</T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </Row>
          </Card>
        )}
      </View>

      {/* Promo banners */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={banner + 12} decelerationRate="fast" contentContainerStyle={[styles.inner, { paddingHorizontal: 20, gap: 12, marginTop: 24 }]}>
        <Banner width={banner} bg={colors.brand} title="Your barber, at your door" body="Book a home visit and skip the queue." cta="Book now" emoji="🏠" dark onPress={() => router.push({ pathname: "/explore", params: { home: "1" } })} />
        <Banner width={banner} bg={colors.lilac} title="Not sure what cut to get?" body="Snap a selfie — our AI stylist finds your perfect cut." cta="Try AI Stylist" emoji="✨" onPress={() => router.push("/stylist")} />
        <Banner
          width={banner}
          bg={colors.peach}
          title={`${SHOP_NAME} products`}
          body={catalog ? `Free delivery over ${money(catalog.shipping.freeFrom, catalog.currency)}.` : "Pomades, beard oils & more — delivered."}
          cta="Shop now"
          emoji="🛍️"
          onPress={() => router.push("/shop")}
        />
      </ScrollView>

      {place && (
        <>
          <View style={[styles.inner, { paddingHorizontal: 20 }]}>
            <Section title={`Trending in ${where}`} action={{ label: "Watch all", onPress: () => router.push("/reels") }}>
              {!reels && <Loading />}
              {reels?.length === 0 && <T muted>No reels here yet.</T>}
            </Section>
          </View>
          {!!reels?.length && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.inner, { paddingHorizontal: 20, gap: 12 }]}>
              {reels.slice(0, 10).map((r) => (
                <ReelThumb key={r.id} reel={r} onPress={() => router.push({ pathname: "/reels", params: { start: r.id } })} />
              ))}
            </ScrollView>
          )}

          <View style={[styles.inner, { paddingHorizontal: 20 }]}>
            <Section title={`Top rated in ${where}`} action={{ label: "See all", onPress: () => router.push("/explore") }}>
              {!barbers && <Loading />}
              {barbers?.length === 0 && <T muted>No barbers here yet — try another city.</T>}
            </Section>
          </View>
          {!!barbers?.length && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.inner, { paddingHorizontal: 20, gap: 14 }]}>
              {barbers.slice(0, 8).map((b) => <BarberTile key={b.id} barber={b} />)}
            </ScrollView>
          )}
        </>
      )}

      <View style={[styles.inner, { paddingHorizontal: 20 }]}>
        {user?.role !== "barber" && (
          <Card tone="surface" style={{ marginTop: 28 }} onPress={() => router.push("/become-barber")}>
            <Row gap={12}>
              <T style={{ fontSize: 28, lineHeight: 34 }}>✂️</T>
              <View style={{ flex: 1 }}>
                <T variant="strong">Are you a barber?</T>
                <T variant="caption" muted>Join {APP_NAME} and get booked in your city.</T>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </Row>
          </Card>
        )}
      </View>
      <LocationSheet visible={sheet} onClose={() => setSheet(false)} />
    </ScrollView>
  );
}

function BigTile({ title, subtitle, emoji, bg, onPress }: { title: string; subtitle: string; emoji: string; bg: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flex: 1, backgroundColor: bg, borderRadius: radius.lg, padding: 16, height: 132, overflow: "hidden" }, pressed && styles.pressed]}>
      <T variant="heading">{title}</T>
      <T variant="caption" muted>{subtitle}</T>
      <T style={{ position: "absolute", right: 12, bottom: 8, fontSize: 52, lineHeight: 62 }}>{emoji}</T>
    </Pressable>
  );
}

function SmallTile({ title, emoji, bg, onPress }: { title: string; emoji: string; bg: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flex: 1, alignItems: "center" }, pressed && styles.pressed]}>
      <View style={{ backgroundColor: bg, borderRadius: radius.lg, width: "100%", height: 78, alignItems: "center", justifyContent: "center" }}>
        <T style={{ fontSize: 34, lineHeight: 42 }}>{emoji}</T>
      </View>
      <T variant="caption" style={{ marginTop: 8, fontFamily: fonts.semibold }}>{title}</T>
    </Pressable>
  );
}

function Banner({ width, bg, title, body, cta, emoji, dark, onPress }: { width: number; bg: string; title: string; body: string; cta: string; emoji: string; dark?: boolean; onPress: () => void }) {
  const fg = dark ? "#fff" : colors.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ width, backgroundColor: bg, borderRadius: radius.lg, padding: 18, minHeight: 140, overflow: "hidden" }, pressed && styles.pressed]}>
      <View style={{ maxWidth: "72%" }}>
        <T variant="heading" color={fg}>{title}</T>
        <T variant="caption" color={dark ? "rgba(255,255,255,0.85)" : colors.muted} style={{ marginTop: 4 }}>{body}</T>
      </View>
      <View style={{ marginTop: 14, alignSelf: "flex-start", backgroundColor: dark ? "#fff" : colors.text, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 }}>
        <T variant="caption" color={dark ? colors.brandDark : "#fff"} style={{ fontFamily: fonts.semibold }}>{cta}</T>
      </View>
      <T style={{ position: "absolute", right: 14, bottom: 6, fontSize: 64, lineHeight: 76 }}>{emoji}</T>
    </Pressable>
  );
}

