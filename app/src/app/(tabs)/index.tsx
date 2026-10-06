import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { Image, Platform, Pressable, ScrollView, Text, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberTile } from "../../components/BarberCard";
import { LogoLockup } from "../../components/Brand";
import { LocationPill } from "../../components/LocationSheet";
import { BarberMap } from "../../components/map/BarberMap";
import { ShopTile } from "../../components/ShopCard";
import { barberPins } from "../../components/map/types";
import { ReelThumb } from "../../components/ReelThumb";
import { SlideToConfirm } from "../../components/SlideToConfirm";
import { colors, fonts, radius, raise } from "../../components/theme";
import { Avatar, Card, IconBadge, IconButton, Loading, Rating, Row, SearchBar, Section, styles, T, Tag, Timeline, type IconName } from "../../components/ui";
import { api } from "../../lib/api";
import { useAlerts } from "../../lib/alerts";
import { useAuth } from "../../lib/auth";
import { HERO_PHOTOS, SERVICE_PHOTOS, TRYON_PHOTO } from "../../lib/brandMedia";
import { useCart } from "../../lib/cart";
import { APP_NAME, SHOP_NAME } from "../../lib/config";
import { dateTime, money, STATUS_LABEL } from "../../lib/format";
import { useLocation } from "../../lib/location";
import type { Barber, Booking, Reel, ShopSummary } from "../../lib/types";
import { useCatalog } from "../../lib/useCatalog";

type ArtName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const goConsult = () => router.push({ pathname: "/explore", params: { consult: "1" } });

export default function Home() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const { unread } = useAlerts();
  const { count } = useCart();
  const { place, country } = useLocation();
  const { catalog } = useCatalog(place?.countryCode);
  const [barbers, setBarbers] = useState<Barber[] | null>(null);
  const [reels, setReels] = useState<Reel[] | null>(null);
  const [shops, setShops] = useState<ShopSummary[]>([]);
  const [next, setNext] = useState<Booking | null>(null);

  useEffect(() => {
    if (!place) return;
    setBarbers(null);
    const filter = { country: place.countryCode, city: place.city || undefined };
    api.barbers(filter).then(setBarbers, () => setBarbers([]));
    api.reels(filter).then(setReels, () => setReels([]));
    api.shops(filter).then(setShops, () => setShops([]));
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
  const heroW = wide ? contentW - leftW - 32 : contentW;
  const heroH = wide ? Math.max(640, Math.min(height - 48, 900)) : Math.round(Math.min(contentW * 1.3, 540));
  const where = place ? place.city || country?.name : null;
  const featured = barbers?.[0] ?? null;
  const block = [styles.inner, { maxWidth: maxW, paddingHorizontal: pad }];
  const edge = Math.max(pad, (sceneW - maxW) / 2 + pad); // horizontal rows line up with the page column

  const intro = (
    <View>
      <T variant="body" style={{ fontFamily: fonts.medium, fontSize: 17, lineHeight: 24 }}>
        Precision cuts.{"\n"}Timeless style.{"\n"}Built for confidence.
      </T>
      {/* On phones, stop short of the floating concierge button so the knob can reach the end. */}
      <View style={{ marginTop: 20, width: wide ? 270 : Math.min(contentW - 76, 300) }}>
        <SlideToConfirm label="Book appointment" onConfirm={() => router.push("/explore")} resetAfter />
      </View>
    </View>
  );

  const steps = (
    <Timeline
      active={next ? 1 : 0}
      steps={[
        { title: "Consultation", body: "Free video call on Google Meet or a phone call with your barber.", onPress: goConsult },
        { title: "Cut & style", body: "At the shop or at your door. Slide to book, pay with Apple Pay.", onPress: () => router.push("/explore") },
        { title: "Finish & groom", body: "Rate the cut, pick up JB's Fresh products, rebook in a tap.", onPress: () => router.push("/shop") },
      ]}
    />
  );

  const tiles = (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {SERVICES.map((sv) => <ServiceTile key={sv.slot} {...sv} width={tileW} />)}
    </View>
  );

  const headline = (
    <View>
      <Row style={{ alignItems: "flex-end", gap: 14 }}>
        <Text style={{ fontFamily: fonts.display, color: colors.text, fontSize: wide ? 66 : 48, lineHeight: wide ? 64 : 47, letterSpacing: wide ? -2.8 : -2.2 }}>
          Fresh{"\n"}Barber{"\n"}Experience
        </Text>
        <Row gap={2} style={{ paddingBottom: wide ? 10 : 6 }}>
          <MaterialCommunityIcons name="razor-single-edge" size={wide ? 40 : 30} color={colors.text} style={{ transform: [{ rotate: "-50deg" }] }} />
          <MaterialCommunityIcons name="content-cut" size={wide ? 34 : 26} color={colors.text} />
        </Row>
      </Row>
      <View style={{ marginTop: 14, maxWidth: 220 }}>
        <T variant="caption" style={{ fontFamily: fonts.medium, lineHeight: 19 }}>Elevate your style. Every day — anywhere in the world.</T>
        <View style={{ height: 1, backgroundColor: colors.text, width: 48, marginTop: 8 }} />
      </View>
    </View>
  );

  const hero = <HeroCarousel width={heroW} height={heroH} featured={featured} where={where} wide={wide} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + (wide ? 24 : 10), paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={block}>
          {wide ? (
            <Row gap={32} style={{ alignItems: "stretch" }}>
              <View style={{ width: leftW, justifyContent: "space-between", gap: 28 }}>
                <View>
                  <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <LogoLockup size={64} />
                    <View style={{ width: 270 }}>{intro}</View>
                  </Row>
                  <View style={{ marginTop: 36 }}>{steps}</View>
                </View>
                {tiles}
                {headline}
              </View>
              {hero}
            </Row>
          ) : (
            <>
              <TopBar count={count} />
              <View style={{ marginTop: 18 }}>{hero}</View>
              <Row style={{ marginTop: 26, alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>{intro}</Row>
              <View style={{ marginTop: 34 }}>{headline}</View>
              <View style={{ marginTop: 30 }}>{steps}</View>
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
                {user && <IconButton icon="notifications-outline" label="Alerts" badge={unread} onPress={() => router.push("/notifications")} />}
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
                  <T variant="eyebrow" muted>{next.locationType === "video" || next.locationType === "phone" ? "Your consultation" : "Your next cut"}</T>
                  <T variant="strong" style={{ marginTop: 2 }}>{next.service?.name} · {next.barber.name}</T>
                  <T variant="caption" muted>{dateTime(next.startsAt, next.barber.timeZone)}</T>
                </View>
                <Tag label={STATUS_LABEL[next.status]} tone={next.status === "pending_payment" ? "neutral" : "accent"} />
              </Row>
            </Card>
          )}

          <Section eyebrow="More from JB" title="Fresh, your way">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {MORE.map((m) => <MoreCard key={m.title} {...m} width={wide ? (contentW - 24) / 3 : (contentW - 12) / 2} />)}
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
                {barbers.slice(0, 8).map((b, i) => <BarberTile key={b.id} barber={b} rank={i === 0 ? 1 : undefined} />)}
              </ScrollView>
            )}

            {shops.length > 0 && (
              <>
                <View style={block}>
                  <Section eyebrow="Barbershops" title={`Book a shop in ${where}`} action={{ label: "See all", onPress: () => router.push("/shops") }}>
                    <T variant="caption" muted style={{ marginTop: -6 }}>A chair with whoever's free, the whole shop for your event, or products delivered today.</T>
                  </Section>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: edge, gap: 14 }}>
                  {shops.slice(0, 6).map((s) => <ShopTile key={s.id} shop={s} width={wide ? 320 : 260} />)}
                </ScrollView>
              </>
            )}

            {!!barbers?.length && (
              <View style={block}>
                <Section
                  eyebrow="On the map"
                  title={`Barbers in ${where}`}
                  action={{ label: "Open map", onPress: () => router.push({ pathname: "/explore", params: { view: "map" } }) }}
                >
                  <Pressable onPress={() => router.push({ pathname: "/explore", params: { view: "map" } })} accessibilityRole="button" accessibilityLabel={`Open the map of barbers in ${where}`}>
                    <View pointerEvents="none">
                      <BarberMap pins={barberPins(barbers)} height={wide ? 360 : 240} interactive={false} placeName={where ?? undefined} />
                    </View>
                  </Pressable>
                  <T variant="caption" muted style={{ marginTop: 8 }}>
                    {barbers.length} {barbers.length === 1 ? "barber" : "barbers"} · {barberPins(barbers).filter((p) => p.free).length} free today
                  </T>
                </Section>
              </View>
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
                  <ReelThumb key={r.id} reel={r} onPress={() => router.push({ pathname: "/reel/[id]", params: { id: r.id, country: place.countryCode, city: place.city || undefined } })} />
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
            style={({ pressed }) => [{ marginTop: 36, backgroundColor: colors.ink, borderRadius: radius.xl, overflow: "hidden", minHeight: 300, flexDirection: "row" }, pressed && styles.pressed]}
          >
            <View style={{ flex: 1.15, padding: 24, justifyContent: "space-between" }}>
              <View>
                <T variant="eyebrow" color={colors.inkMuted}>AI Try-On</T>
                <Text style={{ fontFamily: fonts.display, color: colors.onInk, fontSize: wide ? 34 : 26, lineHeight: wide ? 37 : 29, letterSpacing: -1.1, marginTop: 10 }}>
                  See the cut before you sit in the chair.
                </Text>
                <T variant="caption" color={colors.inkMuted} style={{ marginTop: 10 }}>
                  Upload a selfie — AI previews fades, cuts, colours and beards on you.
                </T>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18, alignSelf: "flex-start", backgroundColor: colors.onInk, borderRadius: radius.pill, paddingLeft: 18, paddingRight: 5, height: 48 }}>
                <T variant="eyebrow" color={colors.ink} style={{ fontSize: 11, letterSpacing: 1.2 }}>Try it on</T>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="arrow-forward" size={17} color={colors.onInk} />
                </View>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Image source={TRYON_PHOTO} resizeMode="cover" style={{ position: "absolute", width: "100%", height: "100%" }} accessibilityLabel="A fresh crop with a skin fade" />
              <LinearGradient colors={["rgba(11,11,11,1)", "rgba(11,11,11,0)"]} start={{ x: 0, y: 0.5 }} end={{ x: 0.35, y: 0.5 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
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

          {/* Footer: the white version of the logo on black */}
          <View style={{ alignItems: "center", marginTop: 44, backgroundColor: colors.ink, borderRadius: radius.xl, paddingVertical: 36 }}>
            <LogoLockup size={60} color={colors.onInk} muted={colors.inkMuted} />
            <T variant="caption" color={colors.inkMuted} style={{ marginTop: 14 }}>Book barbers worldwide · Every city in the UAE</T>
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

/** Phone header: the JB logo, cart and account. */
function TopBar({ count }: { count: number }) {
  const { user } = useAuth();
  const { unread } = useAlerts();
  return (
    <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
      <LogoLockup size={46} est={false} />
      <Row gap={8}>
        {user && <IconButton icon="notifications-outline" label="Alerts" badge={unread} onPress={() => router.push("/notifications")} />}
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
 * The big photo panel from the reference: swipeable photos (brandMedia.HERO_PHOTOS) with dots,
 * the city picker, and the top barber in your city.
 */
function HeroCarousel({ width, height, featured, where, wide }: { width: number; height: number; featured: Barber | null; where: string | null | undefined; wide: boolean }) {
  const scroller = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const touched = useRef(false);

  // Gently advance every few seconds until the visitor swipes themselves.
  useEffect(() => {
    if (HERO_PHOTOS.length < 2) return;
    const timer = setInterval(() => {
      if (touched.current) return;
      setIndex((i) => {
        const next = (i + 1) % HERO_PHOTOS.length;
        scroller.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [width]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index && i >= 0 && i < HERO_PHOTOS.length) setIndex(i);
  };

  return (
    <View style={{ width, height, borderRadius: 32, backgroundColor: colors.ink, overflow: "hidden" }}>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        onTouchStart={() => (touched.current = true)}
        onScrollBeginDrag={() => (touched.current = true)}
        style={{ position: "absolute", top: 0, left: 0, width, height }}
      >
        {HERO_PHOTOS.map((p) => (
          <Image key={p.label} source={p.source} resizeMode="cover" accessibilityLabel={p.label} style={{ width, height }} />
        ))}
      </ScrollView>
      <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0.78)"]} locations={[0, 0.25, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />

      <View pointerEvents="box-none" style={{ flex: 1, padding: 18, justifyContent: "space-between" }}>
        <Row style={{ justifyContent: "space-between" }} >
          <LocationPill label="Book barbers in" variant="chip" />
          {wide && (
            <Pressable onPress={() => router.push("/assistant")} accessibilityRole="button" style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: "rgba(244,242,238,0.4)" }, pressed && styles.pressed]}>
              <Ionicons name="sparkles" size={14} color={colors.onInk} />
              <T variant="caption" color={colors.onInk} style={{ fontFamily: fonts.semibold }}>Ask JB Concierge</T>
            </Pressable>
          )}
        </Row>
        <View pointerEvents="box-none">
          <Row style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }} >
            <Row gap={10}>
              <View style={{ width: 28, height: 1, backgroundColor: colors.onInk }} />
              <T variant="eyebrow" color={colors.onInk} style={{ lineHeight: 16 }}>Expert craftsmanship{"\n"}Premium experience</T>
            </Row>
            <Row gap={6} >
              {HERO_PHOTOS.map((p, i) => (
                <View key={p.label} style={{ width: i === index ? 20 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? colors.onInk : "rgba(244,242,238,0.45)" }} />
              ))}
            </Row>
          </Row>
          {featured ? (
            <Pressable
              onPress={() => router.push({ pathname: "/barber/[id]", params: { id: featured.id } })}
              accessibilityRole="button"
              accessibilityLabel={`Top barber in ${where}: ${featured.name}`}
              style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(11,11,11,0.55)", borderRadius: radius.lg, padding: 10, borderWidth: 1, borderColor: "rgba(244,242,238,0.18)" }, glass, pressed && styles.pressed]}
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
            <T variant="caption" color={colors.onInk}>Choose your city to see the best barbers near you.</T>
          )}
        </View>
      </View>
    </View>
  );
}

/** Frosted glass behind the featured-barber card on the web (native shows the translucent fill). */
const glass = Platform.select({ web: { backdropFilter: "blur(14px)" } as object, default: {} });

const SERVICES: { slot: keyof typeof SERVICE_PHOTOS; label: string; art: ArtName; go: () => void }[] = [
  { slot: "haircut", label: "Haircut", art: "content-cut", go: () => router.push({ pathname: "/explore", params: { specialty: "scissor cut,textured crop,taper,french crop" } }) },
  { slot: "beard", label: "Beard trim", art: "mustache", go: () => router.push({ pathname: "/explore", params: { specialty: "beard,line-up" } }) },
  { slot: "shave", label: "Shave", art: "razor-single-edge", go: () => router.push({ pathname: "/explore", params: { specialty: "hot towel shave" } }) },
  { slot: "fade", label: "Skin fade", art: "head-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "skin fade" } }) },
  { slot: "styling", label: "Styling", art: "hair-dryer-outline", go: () => router.push({ pathname: "/explore", params: { specialty: "pompadour,side part,hair design,hair color" } }) },
  { slot: "products", label: "Products", art: "bottle-tonic-outline", go: () => router.push("/shop") },
];

/** Dark service tile with an uppercase label — a photo when one is set, line art otherwise. */
function ServiceTile({ slot, label, art, go, width }: (typeof SERVICES)[number] & { width: number }) {
  const photo = SERVICE_PHOTOS[slot];
  const h = width * 0.86;
  return (
    <Pressable
      onPress={go}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [{ width, height: h, borderRadius: 18, overflow: "hidden", backgroundColor: colors.ink }, pressed && styles.pressed]}
    >
      {photo ? (
        <Image source={photo} resizeMode="cover" style={{ position: "absolute", width: "100%", height: "100%" }} />
      ) : (
        <>
          <LinearGradient colors={["#2A2A2A", "#0B0B0B"]} start={{ x: 0.9, y: 0 }} end={{ x: 0.1, y: 1 }} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          <MaterialCommunityIcons name={art} size={width * 0.42} color="rgba(244,242,238,0.85)" style={{ position: "absolute", right: width * 0.1, top: width * 0.08 }} />
        </>
      )}
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(11,11,11,0.8)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%" }} />
      <View style={{ flex: 1, justifyContent: "flex-end", padding: 11 }}>
        <T variant="eyebrow" color={colors.onInk} numberOfLines={1} style={{ fontSize: 10, letterSpacing: 1.2, fontFamily: fonts.bold }}>
          {label}
        </T>
      </View>
    </Pressable>
  );
}

const MORE: { title: string; body: string; icon: IconName; go: () => void }[] = [
  { title: "Consultation", body: "Google Meet or a call", icon: "videocam-outline", go: goConsult },
  { title: "Barber at home", body: "They come to you", icon: "home-outline", go: () => router.push({ pathname: "/explore", params: { home: "1" } }) },
  { title: "JB Concierge", body: "Ask anything, 24/7", icon: "chatbubble-ellipses-outline", go: () => router.push("/assistant") },
  { title: "Reels", body: "Watch barbers at work", icon: "play-outline", go: () => router.push("/reels") },
  { title: "The Club", body: "Cuts every month", icon: "card-outline", go: () => router.push("/club") },
  { title: "Gift cards", body: "Give a fresh cut", icon: "gift-outline", go: () => router.push("/gifts") },
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
