import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BarberMap } from "../components/map/BarberMap";
import { barberPins, EMIRATES, shopPins, type MapPin } from "../components/map/types";
import { colors, fonts, radius } from "../components/theme";
import { ErrorBox, Row, styles, T } from "../components/ui";
import { api } from "../lib/api";
import { resolveMedia } from "../lib/config";
import { money } from "../lib/format";
import { tick } from "../lib/haptics";
import { useLocation } from "../lib/location";
import type { Barber, ShopSummary } from "../lib/types";

type Filter = "all" | "barbers" | "shops" | "free" | "home";
const FILTERS: { id: Filter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "all", label: "All", icon: "apps-outline" },
  { id: "barbers", label: "Barbers", icon: "cut-outline" },
  { id: "shops", label: "Barbershops", icon: "storefront-outline" },
  { id: "free", label: "Free today", icon: "flash-outline" },
  { id: "home", label: "Home visits", icon: "home-outline" },
];

const INK = "rgba(11,11,11,0.86)";
const LINE = "rgba(244,242,238,0.16)";

/** Full-screen 3D map: every barber and barbershop in the country, at their exact address. */
export default function MapScreen() {
  const params = useLocalSearchParams<{ focus?: string; country?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { place, country, countries } = useLocation();
  const code = params.country ?? place?.countryCode ?? "AE";
  const uae = code === "AE";
  const [barbers, setBarbers] = useState<Barber[] | null>(null);
  const [shops, setShops] = useState<ShopSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [picked, setArea] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(params.focus ?? null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom: number; key: string } | null>(null);
  const list = useRef<FlatList<MapPin>>(null);
  const programmatic = useRef(false);

  useEffect(() => {
    setError(null);
    Promise.all([api.barbers({ country: code, sort: "rating" }), api.shops({ country: code })]).then(
      ([b, s]) => {
        setBarbers(b);
        setShops(s);
      },
      (e: Error) => setError(e.message),
    );
  }, [code]);

  const countryInfo = countries?.find((c) => c.code === code) ?? country;
  const areas = useMemo(() => {
    if (uae) return EMIRATES;
    const cities = countryInfo?.cities ?? [];
    return [
      { name: "All", lat: 0, lng: 0, zoom: 0, match: [] as string[] },
      ...cities.map((c) => ({ name: c.name, lat: c.lat, lng: c.lng, zoom: 11.6, match: [c.name] })),
    ];
  }, [uae, countryInfo]);
  const allArea = areas[0]!.name;
  const area = picked ?? allArea;
  const areaOf = (city: string) => areas.find((a) => a.match.includes(city))?.name;

  const byId = useMemo(() => {
    const m = new Map<string, Barber | ShopSummary>();
    for (const b of barbers ?? []) m.set(b.id, b);
    for (const s of shops ?? []) m.set(s.id, s);
    return m;
  }, [barbers, shops]);

  const pins = useMemo(() => {
    const b = (barbers ?? []).filter((x) => (filter === "home" ? x.offersHomeVisits : true));
    const bp = barberPins(b).filter((p) => (filter === "free" ? p.free : true));
    const sp = shopPins(shops ?? []);
    const all = filter === "barbers" || filter === "free" || filter === "home" ? bp : filter === "shops" ? sp : [...sp, ...bp];
    return all.filter((p) => area === allArea || areaOf((byId.get(p.id) as { city: string } | undefined)?.city ?? "") === area);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbers, shops, filter, area, byId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const x of [...(barbers ?? []), ...(shops ?? [])]) {
      const a = areaOf(x.city);
      if (a) c[a] = (c[a] ?? 0) + 1;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barbers, shops, areas]);

  const cardW = Math.min(width - 56, 360);
  const gap = 12;
  const cardH = 128;
  const bottomH = cardH + 24 + Math.max(insets.bottom, 12);
  const topH = insets.top + 150;

  // Keep the selected card in view.
  useEffect(() => {
    const i = pins.findIndex((p) => p.id === selected);
    if (i < 0) return;
    programmatic.current = true;
    list.current?.scrollToOffset({ offset: i * (cardW + gap), animated: true }); // the side padding centres it
    const t = setTimeout(() => (programmatic.current = false), 600);
    return () => clearTimeout(t);
  }, [selected, pins]);

  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (programmatic.current) return;
    const x = e.nativeEvent.contentOffset.x;
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => {
      const i = Math.max(0, Math.min(pins.length - 1, Math.round(x / (cardW + gap))));
      const p = pins[i];
      if (p && p.id !== selected) {
        tick();
        setSelected(p.id);
      }
    }, 140);
  }

  function pickArea(a: (typeof areas)[number]) {
    tick();
    setArea(a.name);
    setSelected(null);
    if (a.name === allArea) setFocus(null);
    else setFocus({ lat: a.lat, lng: a.lng, zoom: a.zoom, key: `${a.name}-${Date.now()}` });
  }

  const total = (barbers?.length ?? 0) + (shops?.length ?? 0);
  const where = uae ? "the UAE" : (countryInfo?.name ?? "your country");

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <StatusBar style="light" />
      <BarberMap
        pins={pins}
        height={height}
        radius={0}
        selectedId={selected}
        onSelect={(id) => {
          tick();
          setSelected(id);
        }}
        placeName={countryInfo?.name}
        insets={{ top: topH, bottom: bottomH }}
        fitKey={`${filter}`}
        focus={focus}
        scrollZoom
      />

      {/* Top: back, title, filters and the emirates */}
      <LinearGradient
        colors={["rgba(11,11,11,0.94)", "rgba(11,11,11,0.7)", "rgba(11,11,11,0)"]}
        locations={[0, 0.62, 1]}
        pointerEvents="box-none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: insets.top + 10, paddingBottom: 26 }}
      >
        <Row gap={12} style={{ paddingHorizontal: 16 }}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [{ width: 42, height: 42, borderRadius: 21, backgroundColor: INK, borderWidth: 1, borderColor: LINE, alignItems: "center", justifyContent: "center" }, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.onInk} />
          </Pressable>
          <View style={{ flex: 1 }} pointerEvents="none">
            <T variant="eyebrow" color={colors.inkMuted} style={{ letterSpacing: 2.4 }}>The map · 3D</T>
            <T style={{ fontFamily: fonts.display, color: colors.onInk, fontSize: 21, letterSpacing: -0.6, marginTop: 2 }} numberOfLines={1}>
              {barbers ? `${total} places in ${where}` : `Barbers in ${where}`}
            </T>
          </View>
          <Pressable
            onPress={() => router.push("/explore")}
            accessibilityRole="button"
            accessibilityLabel="Show as a list"
            style={({ pressed }) => [{ height: 42, paddingHorizontal: 14, borderRadius: 21, backgroundColor: INK, borderWidth: 1, borderColor: LINE, flexDirection: "row", alignItems: "center", gap: 6 }, pressed && styles.pressed]}
          >
            <Ionicons name="list-outline" size={17} color={colors.onInk} />
            <T variant="small" color={colors.onInk} style={{ fontFamily: fonts.semibold }}>List</T>
          </Pressable>
        </Row>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 14 }}>
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => {
                  tick();
                  setFilter(f.id);
                  setSelected(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={({ pressed }) => [
                  { flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: on ? colors.onInk : LINE, backgroundColor: on ? colors.onInk : INK },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name={f.icon} size={15} color={on ? colors.ink : colors.onInk} />
                <T variant="small" color={on ? colors.ink : colors.onInk} style={{ fontFamily: fonts.semibold }}>{f.label}</T>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingHorizontal: 18, paddingTop: 12 }}>
          {areas.map((a) => {
            const on = area === a.name;
            const n = a.name === allArea ? total : (counts[a.name] ?? 0);
            if (a.name !== allArea && !n) return null;
            return (
              <Pressable key={a.name} onPress={() => pickArea(a)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${a.name}, ${n} places`} style={{ paddingVertical: 4 }}>
                <T variant="small" color={on ? colors.onInk : colors.inkMuted} style={{ fontFamily: on ? fonts.bold : fonts.semibold, letterSpacing: 1.2, textTransform: "uppercase", fontSize: 11 }}>
                  {a.name} <T variant="small" color={on ? colors.onInk : "rgba(244,242,238,0.4)"} style={{ fontSize: 11 }}>{n}</T>
                </T>
                <View style={{ height: 2, marginTop: 5, borderRadius: 1, backgroundColor: on ? colors.onInk : "transparent" }} />
              </Pressable>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* Bottom: one card per pin, swiping moves the map */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: Math.max(insets.bottom, 12) }} pointerEvents="box-none">
        {error && <View style={{ paddingHorizontal: 16 }}><ErrorBox message={error} /></View>}
        {!!pins.length && (
          <FlatList
            ref={list}
            horizontal
            data={pins}
            keyExtractor={(p) => p.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardW + gap}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: (width - cardW) / 2, gap }}
            getItemLayout={(_, i) => ({ length: cardW + gap, offset: (cardW + gap) * i, index: i })}
            onScroll={onScroll}
            scrollEventThrottle={32}
            renderItem={({ item }) => (
              <PlaceCard pin={item} data={byId.get(item.id)} width={cardW} height={cardH} selected={item.id === selected} onPress={() => setSelected(item.id)} />
            )}
          />
        )}
        {barbers && !pins.length && (
          <View style={{ marginHorizontal: 16, padding: 16, borderRadius: radius.xl, backgroundColor: INK, borderWidth: 1, borderColor: LINE }}>
            <T color={colors.onInk} style={{ fontFamily: fonts.semibold }}>Nothing here with these filters</T>
            <T variant="caption" color={colors.inkMuted} style={{ marginTop: 4 }}>Try All, or another emirate.</T>
          </View>
        )}
      </View>
    </View>
  );
}

function PlaceCard({ pin, data, width, height, selected, onPress }: { pin: MapPin; data?: Barber | ShopSummary; width: number; height: number; selected: boolean; onPress: () => void }) {
  const shop = pin.kind === "shop";
  const barber = !shop ? (data as Barber | undefined) : undefined;
  const photo = pin.photoUrl && !pin.photoUrl.startsWith("brand:") ? resolveMedia(pin.photoUrl) : null;
  const open = () => router.push(shop ? `/barbershop/${pin.id}` : `/barber/${pin.id}`);
  const price = barber ? `From ${money(barber.startingPrice, barber.currency)}` : (data as ShopSummary | undefined)?.startingPrice != null ? `Chairs from ${money((data as ShopSummary).startingPrice!, (data as ShopSummary).currency)}` : "Barbershop";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pin.title}. ${pin.address ?? ""}. Show on the map`}
      style={({ pressed }) => [
        { width, height, borderRadius: 24, padding: 12, flexDirection: "row", gap: 12, backgroundColor: selected ? colors.onInk : INK, borderWidth: 1, borderColor: selected ? colors.onInk : LINE, boxShadow: "0 18px 40px rgba(0,0,0,0.45)" } as object,
        pressed && styles.pressed,
      ]}
    >
      <View style={{ width: 92, height: height - 24, borderRadius: shop ? 16 : 18, overflow: "hidden", backgroundColor: colors.inkRaised }}>
        {photo ? <Image source={{ uri: photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Ionicons name="storefront-outline" size={26} color={colors.onInk} /></View>}
        {pin.free && !shop && (
          <View style={{ position: "absolute", left: 6, bottom: 6, backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
            <T variant="small" color={colors.onInk} style={{ fontSize: 10, fontFamily: fonts.bold }}>FREE TODAY</T>
          </View>
        )}
      </View>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <T variant="small" color={selected ? colors.muted : colors.inkMuted} style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", fontFamily: fonts.semibold }} numberOfLines={1}>
            {shop ? "Barbershop" : barber?.shop ? barber.shop.name : "Barber"}
          </T>
          <T style={{ fontFamily: fonts.semibold, fontSize: 16, color: selected ? colors.text : colors.onInk, marginTop: 2 }} numberOfLines={1}>{pin.title}</T>
          <Row gap={4} style={{ marginTop: 3 }}>
            <Ionicons name="location-outline" size={12} color={selected ? colors.muted : colors.inkMuted} />
            <T variant="small" color={selected ? colors.muted : colors.inkMuted} numberOfLines={1} style={{ flex: 1 }}>{pin.address}</T>
          </Row>
        </View>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <View>
            {pin.rating != null && (
              <Row gap={4}>
                <Ionicons name="star" size={12} color={selected ? colors.goldInk : colors.gold} />
                <T variant="small" color={selected ? colors.text : colors.onInk} style={{ fontFamily: fonts.semibold }}>{pin.rating.toFixed(1)}</T>
              </Row>
            )}
            <T variant="small" color={selected ? colors.text : colors.onInk} style={{ fontFamily: fonts.semibold, marginTop: 2 }}>{price}</T>
          </View>
          <Pressable
            onPress={open}
            accessibilityRole="button"
            accessibilityLabel={shop ? `Open ${pin.title}` : `Book ${pin.title}`}
            style={({ pressed }) => [{ height: 38, paddingLeft: 14, paddingRight: 5, borderRadius: 19, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: selected ? colors.ink : colors.onInk }, pressed && styles.pressed]}
          >
            <T variant="small" color={selected ? colors.onInk : colors.ink} style={{ fontFamily: fonts.semibold }}>{shop ? "Open" : "Book"}</T>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: selected ? colors.onInk : colors.ink, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="arrow-forward" size={14} color={selected ? colors.ink : colors.onInk} />
            </View>
          </Pressable>
        </Row>
      </View>
    </Pressable>
  );
}
