import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberTile } from "../../components/BarberCard";
import { LocationPill, LocationSheet } from "../../components/LocationSheet";
import { ReelThumb } from "../../components/ReelThumb";
import { colors, fonts, radius, shadow } from "../../components/theme";
import { Avatar, Card, GoldIcon, IconButton, Loading, Row, SearchBar, Section, styles, T, Tag, type IconName } from "../../components/ui";
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
          {greeting()}{user ? `, ${user.name.split(" ")[0]}` : ""}
        </T>
        <T muted style={{ marginTop: 4 }}>Ready to get fresh?</T>

        <View style={{ marginTop: 18 }}>
          <SearchBar placeholder="Search barbers, styles or cities worldwide" onPress={() => router.push("/explore")} />
        </View>

        {/* Service tiles */}
        <Row gap={12} style={{ marginTop: 20, alignItems: "stretch" }}>
          <BigTile title="Book a barber" subtitle="At the shop" icon="cut" dark onPress={() => router.push("/explore")} />
          <BigTile title="Barber at home" subtitle="They come to you" icon="home" onPress={() => router.push({ pathname: "/explore", params: { home: "1" } })} />
        </Row>
        <Row gap={12} style={{ marginTop: 12 }}>
          <SmallTile title="AI Try-On" icon="sparkles" onPress={() => router.push("/stylist")} />
          <SmallTile title="Concierge" icon="chatbubble-ellipses" onPress={() => router.push("/assistant")} />
          <SmallTile title="Reels" icon="play" onPress={() => router.push("/reels")} />
          <SmallTile title="Shop" icon="bag-handle" onPress={() => router.push("/shop")} />
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
              <Tag label={STATUS_LABEL[next.status]} tone={next.status === "pending_payment" ? "neutral" : "gold"} />
            </Row>
          </Card>
        )}

        {!place && (
          <Card tone="surface" style={{ marginTop: 20 }} onPress={() => setSheet(true)}>
            <Row gap={12}>
              <GoldIcon icon="location" />
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
        <Banner width={banner} title="See a new cut on your own face" body="AI Try-On previews cuts, fades, colours and beards on your photo — before you book." cta="Try it on" icon="sparkles" dark onPress={() => router.push("/stylist")} />
        <Banner width={banner} title="Your barber, at your door" body="Book a home visit and skip the queue." cta="Book now" icon="home" onPress={() => router.push({ pathname: "/explore", params: { home: "1" } })} />
        <Banner
          width={banner}
          dark
          title={`${SHOP_NAME} products`}
          body={catalog ? `Free delivery over ${money(catalog.shipping.freeFrom, catalog.currency)}.` : "Pomades, beard oils & more — delivered."}
          cta="Shop now"
          icon="bag-handle"
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
              <GoldIcon icon="cut" />
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
      <Pressable
        onPress={() => router.push("/assistant")}
        accessibilityRole="button"
        accessibilityLabel="Ask JB Concierge"
        style={({ pressed }) => [
          { position: "absolute", right: 20, bottom: 20, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 18, height: 52 },
          shadow,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="sparkles" size={18} color={colors.gold} />
        <T variant="strong" color={colors.onInk}>Ask JB</T>
      </Pressable>
    </View>
  );
}

function BigTile({ title, subtitle, icon, dark, onPress }: { title: string; subtitle: string; icon: IconName; dark?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flex: 1, borderRadius: radius.lg, padding: 16, height: 136, justifyContent: "space-between" },
        dark ? { backgroundColor: colors.ink } : [styles.card, { padding: 16 }],
        pressed && styles.pressed,
      ]}
    >
      <GoldIcon icon={icon} dark={dark} />
      <View>
        <T variant="heading" color={dark ? colors.onInk : colors.text}>{title}</T>
        <T variant="caption" color={dark ? "rgba(255,255,255,0.65)" : colors.muted}>{subtitle}</T>
      </View>
    </Pressable>
  );
}

function SmallTile({ title, icon, onPress }: { title: string; icon: IconName; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flex: 1, alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 14, borderWidth: 1, borderColor: colors.border }, pressed && styles.pressed]}>
      <Ionicons name={icon} size={24} color={colors.gold} />
      <T variant="caption" style={{ marginTop: 8, fontFamily: fonts.semibold }}>{title}</T>
    </Pressable>
  );
}

function Banner({ width, title, body, cta, icon, dark, onPress }: { width: number; title: string; body: string; cta: string; icon: IconName; dark?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width, borderRadius: radius.lg, padding: 20, minHeight: 150, overflow: "hidden" },
        dark ? { backgroundColor: colors.ink } : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={{ maxWidth: "74%" }}>
        <T variant="title" color={dark ? colors.gold : colors.text} style={{ fontSize: 20, lineHeight: 26 }}>{title}</T>
        <T variant="caption" color={dark ? "rgba(255,255,255,0.75)" : colors.muted} style={{ marginTop: 6 }}>{body}</T>
      </View>
      <Row gap={6} style={{ marginTop: 16 }}>
        <T variant="caption" color={dark ? colors.gold : colors.goldDeep} style={{ fontFamily: fonts.semibold }}>{cta}</T>
        <Ionicons name="arrow-forward" size={14} color={dark ? colors.gold : colors.goldDeep} />
      </Row>
      <Ionicons name={icon} size={84} color={dark ? "rgba(197,162,83,0.18)" : colors.goldSoft} style={{ position: "absolute", right: -6, bottom: -8 }} />
    </Pressable>
  );
}
