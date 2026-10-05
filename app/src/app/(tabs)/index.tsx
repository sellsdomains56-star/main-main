import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState, type ComponentProps } from "react";
import { Image, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberTile } from "../../components/BarberCard";
import { Logo, Wordmark } from "../../components/Brand";
import { LocationPill } from "../../components/LocationSheet";
import { ReelThumb } from "../../components/ReelThumb";
import { colors, fonts, radius, raise } from "../../components/theme";
import { ArrowButton, Avatar, Card, IconBadge, IconButton, Loading, Rating, Row, SearchBar, Section, styles, T, Tag, Timeline, type IconName } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { HERO_PHOTO, SERVICE_PHOTOS } from "../../lib/brandMedia";
import { useCart } from "../../lib/cart";
import { APP_NAME, SHOP_NAME } from "../../lib/config";
import { dateTime, money, STATUS_LABEL } from "../../lib/format";
import { useLocation } from "../../lib/location";
import type { Barber, Booking, Reel } from "../../lib/types";
import { useCatalog } from "../../lib/useCatalog";

type ArtName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const { count } = useCart();
  const { place, country } = useLocation();
  const { catalog } = useCatalog(place?.countryCode);
  const [barbers, setBarbers] = useState<Barber[] | null>(null);
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [next, setNext] = useState<Booking | null>(null);

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

  // Two columns like the reference on desktop; one column on phones.
  const wide = Platform.OS === "web" && width >= 1024;
  const sceneW = wide ? width - 112 : width;
  const pad = wide ? 32 : 20;
  const maxW = wide ? 1280 : 760;
  const contentW = Math.min(sceneW, maxW) - pad * 2;
  const leftW = wide ? Math.min(560, (contentW - 32) * 0.47) : contentW;
  const tileW = (leftW - 20) / 3;
  const heroH = wide ? Math.max(640, Math.min(height - 48, 900)) : Math.round(Math.min(contentW * 1.2, 500));
  const where = place ? place.city || country?.name : null;
  const featured = barbers?.[0] ?? null;
  const block = [styles.inner, { maxWidth: maxW, paddingHorizontal: pad }];
  const edge = Math.max(pad, (sceneW - maxW) / 2 + pad); // horizontal rows line up with the page column

  const intro = (
    <>
      <T variant="body" style={{ fontFamily: fonts.medium, fontSize: 17, lineHeight: 24, marginTop: wide ? 0 : 22 }}>
        Precision cuts.{"\n"}Timeless style.{"\n"}Built for confidence.
      </T>
      <ArrowButton title="Book appointment" onPress={() => router.push("/explore")} style={{ marginTop: 20 }} />
    </>
  );

  const steps = (
    <Timeline
      active={next ? 1 : 0}
      steps={[
        { title: "Find your barber", body: "Search worldwide, compare work, reviews and prices." },
        { title: "Book & pay", body: "At the shop or at your door. Apple Pay, Google Pay or card." },
        { title: "Get fresh", body: "Rate the cut and book again in one tap." },
      ]}
    />
  );

  const tiles = (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {SERVICES.map((sv) => <ServiceTile key={sv.slot} {...sv} width={tileW} />)}
    </View>
  );

  const headline = (
    <Row style={{ alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
      <Text style={{ fontFamily: fonts.display, color: colors.text, fontSize: wide ? 64 : 46, lineHeight: wide ? 64 : 47, letterSpacing: wide ? -2.6 : -2 }}>
        Your barber,{"\n"}anywhere in{"\n"}the world.
      </Text>
      <View style={{ maxWidth: 150, paddingBottom: 6 }}>
        <T variant="caption" style={{ fontFamily: fonts.medium, lineHeight: 19 }}>At the shop or at your door. Every day.</T>
        <View style={{ height: 1, backgroundColor: colors.text, width: 48, marginTop: 8 }} />
      </View>
    </Row>
  );

  const hero = <Hero height={heroH} featured={featured} where={where} wide={wide} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + (wide ? 24 : 10), paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={block}>
          {wide ? (
            <Row gap={32} style={{ alignItems: "stretch" }}>
              <View style={{ width: leftW, justifyContent: "space-between", gap: 28 }}>
                <View>
                  <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Row gap={14}>
                      <Logo size={56} />
                      <Wordmark />
                    </Row>
                    <View style={{ width: 270 }}>{intro}</View>
                  </Row>
                  <View style={{ marginTop: 36 }}>{steps}</View>
                </View>
                {tiles}
                {headline}
              </View>
              <View style={{ flex: 1 }}>{hero}</View>
            </Row>
          ) : (
            <>
              <TopBar count={count} />
              {intro}
              <View style={{ marginTop: 24 }}>{hero}</View>
              <View style={{ marginTop: 28 }}>{headline}</View>
              <View style={{ marginTop: 28 }}>{steps}</View>
              <Section eyebrow="Services" title="What are you after?">{tiles}</Section>
            </>
          )}

          {wide ? (
            <Row style={{ justifyContent: "space-between", marginTop: 40, gap: 16 }}>
              <View style={{ flex: 1, maxWidth: 560 }}>
                <SearchBar placeholder="Search barbers, styles or cities worldwide" onPress={() => router.push("/explore")} />
              </View>
              <Row gap={14}>
                <LocationPill label="Book barbers in" />
                <IconButton icon="bag-handle-outline" label="Cart" badge={count} onPress={() => router.push(count ? "/cart" : "/shop")} />
              </Row>
            </Row>
          ) : (
            <View style={{ marginTop: 24 }}>
              <SearchBar placeholder="Search barbers, styles or cities" onPress={() => router.push("/explore")} />
            </View>
          )}

          {/* Upcoming appointment */}
          {next && (
            <Card style={{ marginTop: 20 }} onPress={() => router.push("/bookings")}>
              <Row gap={12}>
                <Avatar uri={next.barber.photoUrl} name={next.barber.name} size={48} />
                <View style={{ flex: 1 }}>
                  <T variant="eyebrow" muted>Your next cut</T>
                  <T variant="strong" style={{ marginTop: 2 }}>{next.service?.name} · {next.barber.name}</T>
                  <T variant="caption" muted>{dateTime(next.startsAt, next.barber.timeZone)}</T>
                </View>
                <Tag label={STATUS_LABEL[next.status]} tone={next.status === "pending_payment" ? "neutral" : "accent"} />
              </Row>
            </Card>
          )}

          <Section eyebrow="More from JB" title="Fresh, your way">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {MORE.map((m) => <MoreCard key={m.title} {...m} width={wide ? (contentW - 36) / 4 : (contentW - 12) / 2} />)}
            </View>
          </Section>
        </View>

        {place && (
          <>
            <View style={block}>
              <Section title={`Top rated in ${where}`} action={{ label: "See all", onPress: () => router.push("/explore") }}>
                {!barbers && <Loading />}
                {barbers?.length === 0 && <T muted>No barbers here yet — try another city.</T>}
              </Section>
            </View>
            {!!barbers?.length && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: edge, gap: 14 }}>
                {barbers.slice(0, 8).map((b) => <BarberTile key={b.id} barber={b} />)}
              </ScrollView>
            )}

            <View style={block}>
              <Section title={`Trending in ${where}`} action={{ label: "Watch all", onPress: () => router.push("/reels") }}>
                {!reels && <Loading />}
                {reels?.length === 0 && <T muted>No reels here yet.</T>}
              </Section>
            </View>
            {!!reels?.length && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: edge, gap: 12 }}>
                {reels.slice(0, 10).map((r) => (
                  <ReelThumb key={r.id} reel={r} onPress={() => router.push({ pathname: "/reels", params: { start: r.id } })} />
                ))}
              </ScrollView>
            )}
          </>
        )}

        <View style={block}>
          {/* AI Try-On feature panel */}
          <Pressable
            onPress={() => router.push("/stylist")}
            accessibilityRole="button"
            accessibilityLabel="Open AI Try-On"
            style={({ pressed }) => [{ marginTop: 36, backgroundColor: colors.ink, borderRadius: radius.xl, padding: 24, overflow: "hidden", minHeight: 230 }, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="head-outline" size={200} color="rgba(244,242,238,0.08)" style={{ position: "absolute", right: -24, bottom: -30 }} />
            <T variant="eyebrow" color={colors.inkMuted}>AI Try-On</T>
            <Text style={{ fontFamily: fonts.display, color: colors.onInk, fontSize: 30, lineHeight: 33, letterSpacing: -1.2, marginTop: 10, maxWidth: 320 }}>
              See the cut before you sit in the chair.
            </Text>
            <T variant="caption" color={colors.inkMuted} style={{ marginTop: 10, maxWidth: 300 }}>
              Upload a selfie — AI reads your face shape and hair, then previews fades, cuts, colours and beards on you.
            </T>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 20, alignSelf: "flex-start", backgroundColor: colors.onInk, borderRadius: radius.pill, paddingLeft: 22, paddingRight: 6, height: 52 }}>
              <T variant="eyebrow" color={colors.ink} style={{ fontSize: 12, letterSpacing: 1.4 }}>Try it on</T>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="arrow-forward" size={18} color={colors.onInk} />
              </View>
            </View>
          </Pressable>

          {/* Shop strip */}
          <Card style={{ marginTop: 14 }} onPress={() => router.push("/shop")}>
            <Row gap={14}>
              <IconBadge icon="bag-handle-outline" size={48} />
              <View style={{ flex: 1 }}>
                <T variant="heading">Buy all {SHOP_NAME} products</T>
                <T variant="caption" muted>{catalog ? `Pomades, oils & more · free delivery over ${money(catalog.shipping.freeFrom, catalog.currency)}` : "Pomades, beard oils & more — delivered."}</T>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.text} />
            </Row>
          </Card>

          {user?.role !== "barber" && (
            <Card tone="surface" style={{ marginTop: 14 }} onPress={() => router.push("/become-barber")}>
              <Row gap={14}>
                <IconBadge icon="cut-outline" size={48} />
                <View style={{ flex: 1 }}>
                  <T variant="heading">Are you a barber?</T>
                  <T variant="caption" muted>Join {APP_NAME} and get booked in your city.</T>
                </View>
                <Ionicons name="arrow-forward" size={18} color={colors.text} />
              </Row>
            </Card>
          )}

          <View style={{ alignItems: "center", marginTop: 44, gap: 14 }}>
            <Logo size={40} />
            <Wordmark />
          </View>
        </View>
      </ScrollView>

      {!wide && (
        <Pressable
          onPress={() => router.push("/assistant")}
          accessibilityRole="button"
          accessibilityLabel="Ask JB Concierge"
          style={({ pressed }) => [
            { position: "absolute", right: 20, bottom: 18, width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink, borderWidth: 1, borderColor: "rgba(244,242,238,0.18)" },
            raise,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="sparkles" size={22} color={colors.onInk} />
        </Pressable>
      )}
    </View>
  );
}

/** Phone header: monogram + wordmark, cart and account. */
function TopBar({ count }: { count: number }) {
  const { user } = useAuth();
  return (
    <Row style={{ justifyContent: "space-between" }}>
      <Row gap={12}>
        <Logo size={44} />
        <Wordmark />
      </Row>
      <Row gap={8}>
        <IconButton icon="bag-handle-outline" label="Cart" badge={count} onPress={() => router.push(count ? "/cart" : "/shop")} />
        {user ? (
          <Pressable onPress={() => router.push("/account")} accessibilityLabel="Account">
            <Avatar name={user.name} size={44} />
          </Pressable>
        ) : (
          <IconButton icon="person-outline" label="Sign in" onPress={() => router.push("/login")} />
        )}
      </Row>
    </Row>
  );
}

/**
 * The big black hero panel. With a photo in brandMedia.HERO_PHOTO it shows that; otherwise a
 * lit, editorial poster: a pendant lamp, the monogram, and the top barber in your city.
 */
function Hero({ height, featured, where, wide }: { height: number; featured: Barber | null; where: string | null | undefined; wide: boolean }) {
  return (
    <View style={{ height, borderRadius: 32, backgroundColor: colors.ink, overflow: "hidden" }}>
      {HERO_PHOTO ? (
        <>
          <Image source={HERO_PHOTO} resizeMode="cover" style={{ position: "absolute", width: "100%", height: "100%" }} accessibilityLabel="A barber at work" />
          <LinearGradient colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0)", "rgba(0,0,0,0.65)"]} locations={[0, 0.4, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        </>
      ) : (
        <>
          <LinearGradient colors={["#262626", "#0B0B0B"]} start={{ x: 0.7, y: 0 }} end={{ x: 0.3, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          {/* Pendant lamp with a soft pool of light */}
          <View style={{ position: "absolute", top: 0, right: wide ? "24%" : "8%", alignItems: "center" }} pointerEvents="none">
            <View style={{ width: 1, height: height * 0.14, backgroundColor: "rgba(244,242,238,0.3)" }} />
            <View style={{ width: 96, height: 42, borderTopLeftRadius: 48, borderTopRightRadius: 48, backgroundColor: "#1C1C1C", borderWidth: 1, borderBottomWidth: 0, borderColor: "rgba(244,242,238,0.14)" }} />
            <View style={[{ width: 58, height: 7, borderRadius: 4, backgroundColor: "#FFF8EC", marginTop: -3 }, lampGlow]} />
          </View>
          <Text style={{ position: "absolute", left: -10, bottom: height * 0.12, fontFamily: fonts.medium, fontSize: height * 0.5, lineHeight: height * 0.5, letterSpacing: -height * 0.03, color: "rgba(244,242,238,0.06)" }} accessible={false}>
            JB
          </Text>
          <MaterialCommunityIcons name="content-cut" size={Math.min(height * 0.24, 140)} color="rgba(244,242,238,0.92)" style={{ position: "absolute", right: "17%", top: height * 0.34, transform: [{ rotate: "-35deg" }] }} />
        </>
      )}

      <View style={{ flex: 1, padding: 18, justifyContent: "space-between" }}>
        <Row style={{ justifyContent: "space-between" }}>
          <LocationPill label="Book barbers in" variant="chip" />
          {wide && (
            <Pressable onPress={() => router.push("/assistant")} accessibilityRole="button" style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: "rgba(244,242,238,0.3)" }, pressed && styles.pressed]}>
              <Ionicons name="sparkles" size={14} color={colors.onInk} />
              <T variant="caption" color={colors.onInk} style={{ fontFamily: fonts.semibold }}>Ask JB Concierge</T>
            </Pressable>
          )}
        </Row>
        <View>
          <Row gap={10} style={{ marginBottom: 16 }}>
            <View style={{ width: 28, height: 1, backgroundColor: colors.onInk }} />
            <T variant="eyebrow" color={colors.onInk} style={{ lineHeight: 16 }}>Expert craftsmanship{"\n"}Premium experience</T>
          </Row>
          {featured ? (
            <Pressable
              onPress={() => router.push({ pathname: "/barber/[id]", params: { id: featured.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Top barber in ${where}: ${featured.name}`}
              style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(244,242,238,0.10)", borderRadius: radius.lg, padding: 10, borderWidth: 1, borderColor: colors.inkLine }, pressed && styles.pressed]}
            >
              <Avatar uri={featured.photoUrl} name={featured.name} size={46} />
              <View style={{ flex: 1 }}>
                <T variant="small" color={colors.inkMuted}>Top barber in {where}</T>
                <T variant="strong" color={colors.onInk} numberOfLines={1}>{featured.name}</T>
                <Rating value={featured.rating} count={featured.ratingCount} color={colors.onInk} />
              </View>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.onInk, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="arrow-forward" size={18} color={colors.ink} />
              </View>
            </Pressable>
          ) : (
            <T variant="caption" color={colors.inkMuted}>Choose your city to see the best barbers near you.</T>
          )}
        </View>
      </View>
    </View>
  );
}

/** Warm light around the bulb (a radial glow on the web and iOS). */
const lampGlow = Platform.select({
  web: { boxShadow: "0 0 24px 10px rgba(255,248,236,0.35), 0 60px 180px 110px rgba(255,248,236,0.10)" },
  ios: { shadowColor: "#FFF8EC", shadowOpacity: 0.6, shadowRadius: 60, shadowOffset: { width: 0, height: 30 } },
  default: {},
}) as object;

const SERVICES: { slot: keyof typeof SERVICE_PHOTOS; label: string; art: ArtName; go: () => void }[] = [
  { slot: "haircut", label: "Haircut", art: "content-cut", go: () => router.push({ pathname: "/explore", params: { specialty: "scissor cut,textured crop,taper,french crop" } }) },
  { slot: "beard", label: "Beard trim", art: "mustache", go: () => router.push({ pathname: "/explore", params: { specialty: "beard,line-up" } }) },
  { slot: "shave", label: "Shave", art: "razor-single-edge", go: () => router.push({ pathname: "/explore", params: { specialty: "hot towel shave" } }) },
  { slot: "fade", label: "Skin fade", art: "head-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "skin fade" } }) },
  { slot: "styling", label: "Styling", art: "hair-dryer-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "pompadour,side part,hair design,hair color" } }) },
  { slot: "products", label: "Products", art: "bottle-tonic-outline", go: () => router.push("/shop") },
];

/** Dark service tile with an uppercase label — a photo when one is set, line art until then. */
function ServiceTile({ slot, label, art, go, width }: (typeof SERVICES)[number] & { width: number }) {
  const photo = SERVICE_PHOTOS[slot];
  return (
    <Pressable onPress={go} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ width, height: width * 0.82, borderRadius: 18, overflow: "hidden", backgroundColor: colors.ink }, pressed && styles.pressed]}>
      {photo ? (
        <Image source={photo} resizeMode="cover" style={{ position: "absolute", width: "100%", height: "100%" }} />
      ) : (
        <>
          <LinearGradient colors={["#2A2A2A", "#0B0B0B"]} start={{ x: 0.9, y: 0 }} end={{ x: 0.1, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          <MaterialCommunityIcons name={art} size={width * 0.42} color="rgba(244,242,238,0.85)" style={{ position: "absolute", right: width * 0.1, top: width * 0.08 }} />
        </>
      )}
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "50%" }} />
      <View style={{ flex: 1, justifyContent: "flex-end", padding: 11 }}>
        <T variant="eyebrow" color={colors.onInk} style={{ fontSize: 10, letterSpacing: 1.2, fontFamily: fonts.bold }} numberOfLines={1}>{label}</T>
      </View>
    </Pressable>
  );
}

const MORE: { title: string; body: string; icon: IconName; go: () => void }[] = [
  { title: "Barber at home", body: "They come to you", icon: "home-outline", go: () => router.push({ pathname: "/explore", params: { home: "1" } }) },
  { title: "AI Try-On", body: "See a cut on your face", icon: "sparkles-outline", go: () => router.push("/stylist") },
  { title: "JB Concierge", body: "Ask anything, 24/7", icon: "chatbubble-ellipses-outline", go: () => router.push("/assistant") },
  { title: "Reels", body: "Watch barbers at work", icon: "play-outline", go: () => router.push("/reels") },
];

function MoreCard({ title, body, icon, go, width }: (typeof MORE)[number] & { width: number }) {
  return (
    <Pressable onPress={go} accessibilityRole="button" style={({ pressed }) => [styles.card, { width, padding: 16, minHeight: 132, justifyContent: "space-between" }, pressed && styles.pressed]}>
      <IconBadge icon={icon} size={40} />
      <View style={{ marginTop: 14 }}>
        <T variant="heading" style={{ fontSize: 16 }}>{title}</T>
        <T variant="caption" muted>{body}</T>
      </View>
    </Pressable>
  );
}
