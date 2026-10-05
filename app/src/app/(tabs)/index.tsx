import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberTile } from "../../components/BarberCard";
import { LocationPill, LocationSheet } from "../../components/LocationSheet";
import { ReelThumb } from "../../components/ReelThumb";
import { colors, fonts, glowSmall, radius } from "../../components/theme";
import { ArrowButton, Avatar, Card, GoldIcon, IconButton, Loading, Row, SearchBar, Section, styles, T, Tag, Timeline, type IconName } from "../../components/ui";
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
      {/* Warm gold haze behind the header */}
      <LinearGradient colors={["rgba(242,181,58,0.16)", "rgba(242,181,58,0.04)", "rgba(10,10,11,0)"]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 360 }} pointerEvents="none" />
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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

        <T variant="eyebrow" style={{ marginTop: 28 }}>{greeting()}{user ? `, ${user.name.split(" ")[0]}` : ""}</T>
        <T variant="display" style={{ marginTop: 8, fontSize: 40, lineHeight: 46 }}>Precision cuts.{"\n"}Anywhere.</T>
        <T muted style={{ marginTop: 10, maxWidth: 420 }}>Discover, compare and book the best barbers worldwide — at their shop or at your door.</T>
        <ArrowButton title="Book appointment" onPress={() => router.push("/explore")} style={{ marginTop: 20 }} />

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

        <Section eyebrow="Services" title="What are you after?">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {SERVICES.map((sv) => (
              <ServiceTile key={sv.label} label={sv.label} icon={sv.icon} width={(Math.min(width, 760) - 40 - 20) / 3} onPress={sv.go} />
            ))}
          </View>
        </Section>

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={banner + 12} decelerationRate="fast" style={{ marginTop: 0, marginBottom: -24 }} contentContainerStyle={[styles.inner, { paddingHorizontal: 20, paddingVertical: 24, gap: 12 }]}>
        <Banner width={banner} eyebrow="AI Try-On" title="See a new cut on your own face" body="AI Try-On previews cuts, fades, colours and beards on your photo — before you book." cta="Try it on" icon="sparkles" dark onPress={() => router.push("/stylist")} />
        <Banner width={banner} eyebrow="Home visits" title="Your barber, at your door" body="Book a home visit and skip the queue." cta="Book now" icon="home" onPress={() => router.push({ pathname: "/explore", params: { home: "1" } })} />
        <Banner
          width={banner}
          eyebrow="Shop"
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
        <Section eyebrow="How it works" title="Fresh in three steps">
          <Card>
            <Timeline
              active={next ? 2 : 0}
              steps={[
                { title: "Find your barber", body: "Search worldwide, compare work, reviews and prices — or let AI Try-On pick your look." },
                { title: "Book & pay", body: "Choose a time at the shop or at your door. Pay with Apple Pay, Google Pay or card." },
                { title: "Get fresh", body: "Your barber does the rest. Rate the cut and book again in one tap." },
              ]}
            />
          </Card>
        </Section>

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
          { position: "absolute", right: 20, bottom: 20, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 20, height: 52 },
          glowSmall,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="sparkles" size={18} color={colors.onGold} />
        <T variant="strong" color={colors.onGold}>Ask JB</T>
      </Pressable>
    </View>
  );
}

const SERVICES: { label: string; icon: IconName; go: () => void }[] = [
  { label: "Haircut", icon: "cut-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "scissor cut,textured crop,taper,french crop" } }) },
  { label: "Skin fade", icon: "flash-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "skin fade" } }) },
  { label: "Beard trim", icon: "man-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "beard,line-up" } }) },
  { label: "Hot shave", icon: "flame-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "hot towel shave" } }) },
  { label: "Styling", icon: "color-wand-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "pompadour,side part,hair design,hair color" } }) },
  { label: "Products", icon: "bag-handle-outline", go: () => router.push("/shop") },
];

/** Dark service tile with an uppercase label, like a moody photo card (swap in real photos later). */
function ServiceTile({ label, icon, width, onPress }: { label: string; icon: IconName; width: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ width, height: width * 0.82, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.border }, pressed && styles.pressed]}>
      <LinearGradient colors={["#221C12", "#121214"]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <Ionicons name={icon} size={width * 0.5} color="rgba(242,181,58,0.16)" style={{ position: "absolute", right: -6, top: 4 }} />
      <View style={{ flex: 1, justifyContent: "flex-end", padding: 12 }}>
        <Ionicons name={icon} size={18} color={colors.gold} />
        <T variant="eyebrow" color={colors.text} style={{ marginTop: 6, fontSize: 10, letterSpacing: 1.4 }} numberOfLines={1}>{label}</T>
      </View>
    </Pressable>
  );
}

function BigTile({ title, subtitle, icon, dark, onPress }: { title: string; subtitle: string; icon: IconName; dark?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, { flex: 1, padding: 16, height: 140, justifyContent: "space-between" }, dark && styles.cardGlow, pressed && styles.pressed]}
    >
      <GoldIcon icon={icon} />
      <View>
        <T variant="heading">{title}</T>
        <T variant="caption" muted>{subtitle}</T>
      </View>
    </Pressable>
  );
}

function SmallTile({ title, icon, onPress }: { title: string; icon: IconName; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [{ flex: 1, alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 16, borderWidth: 1, borderColor: colors.border }, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={22} color={colors.gold} />
      <T variant="small" style={{ marginTop: 8, fontFamily: fonts.semibold }}>{title}</T>
    </Pressable>
  );
}

function Banner({ width, eyebrow, title, body, cta, icon, dark, onPress }: { width: number; eyebrow: string; title: string; body: string; cta: string; icon: IconName; dark?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.card, { width, padding: 20, minHeight: 168, overflow: "hidden" }, dark && styles.cardGlow, pressed && styles.pressed]}>
      <Ionicons name={icon} size={120} color="rgba(242,181,58,0.07)" style={{ position: "absolute", right: -14, bottom: -18 }} />
      <T variant="eyebrow">{eyebrow}</T>
      <T variant="title" style={{ marginTop: 8, maxWidth: "88%", fontSize: 22, lineHeight: 28 }}>{title}</T>
      <T variant="caption" muted style={{ marginTop: 6, maxWidth: "80%" }}>{body}</T>
      <Row gap={6} style={{ marginTop: 16 }}>
        <T variant="caption" color={colors.gold} style={{ fontFamily: fonts.semibold }}>{cta}</T>
        <Ionicons name="arrow-forward" size={14} color={colors.gold} />
      </Row>
    </Pressable>
  );
}
