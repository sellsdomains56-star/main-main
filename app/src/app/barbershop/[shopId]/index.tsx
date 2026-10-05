import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Linking, Platform, Pressable, useWindowDimensions, View } from "react-native";
import { BarberCard } from "../../../components/BarberCard";
import { BarberMap } from "../../../components/map/BarberMap";
import { directionsUrl } from "../../../components/map/types";
import { shopHours, ShopPhoto } from "../../../components/ShopCard";
import { colors, fonts, radius } from "../../../components/theme";
import { Button, Divider, ErrorBox, IconLine, Loading, Rating, Row, Screen, styles, T } from "../../../components/ui";
import { api } from "../../../lib/api";
import { useCart } from "../../../lib/cart";
import { money } from "../../../lib/format";
import { flag } from "../../../lib/location";
import type { Shop } from "../../../lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Mon–Sat" for a run of days, else a list. */
function dayRange(days: number[]) {
  const sorted = [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); // Monday first
  const idx = sorted.map((d) => (d + 6) % 7);
  const consecutive = idx.every((d, i) => i === 0 || d === idx[i - 1] + 1);
  return consecutive && sorted.length > 2 ? `${DAYS[sorted[0]]}–${DAYS[sorted[sorted.length - 1]]}` : sorted.map((d) => DAYS[d]).join(", ");
}

export default function ShopPage() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { width } = useWindowDimensions();
  const { setDeliveryShop } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api.shop(shopId).then(setShop, (e: Error) => setError(e.message));
  }, [shopId]);
  useEffect(load, [load]);

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!shop) return <Screen><Loading /></Screen>;

  const contentW = Math.min(width, 760) - 40;
  const book = () => router.push({ pathname: "/barbershop/[shopId]/book", params: { shopId: shop.id } });

  return (
    <Screen footer={<Button title={shop.startingPrice != null ? `Book a chair · from ${money(shop.startingPrice, shop.currency)}` : "Book a chair"} onPress={book} />}>
      <Stack.Screen options={{ title: "" }} />
      <View style={{ borderRadius: radius.xl, overflow: "hidden" }}>
        <ShopPhoto shop={shop} width={contentW} height={Math.round(Math.min(contentW * 0.66, 360))} rounded={radius.xl} />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(11,11,11,0.85)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 170 }} />
        <View style={{ position: "absolute", left: 20, right: 20, bottom: 18 }}>
          <T variant="eyebrow" color={colors.inkMuted}>{flag(shop.countryCode)} Barbershop · {shop.city}</T>
          <T variant="title" color={colors.onInk} style={{ marginTop: 6 }}>{shop.name}</T>
          <Row gap={6} style={{ marginTop: 4 }}>
            <Rating value={shop.rating} count={shop.ratingCount} color={colors.onInk} />
            <T variant="caption" color={colors.inkMuted}>· {shop.teamSize} {shop.teamSize === 1 ? "barber" : "barbers"}</T>
          </Row>
        </View>
      </View>

      <T style={{ marginTop: 16 }}>{shop.about}</T>
      <View style={{ marginTop: 12, gap: 6 }}>
        <IconLine icon="location-outline">{shop.address}</IconLine>
        <IconLine icon="time-outline">{dayRange(shop.workingDays)} · {shopHours(shop)}</IconLine>
      </View>

      {/* What you can do here */}
      <View style={{ marginTop: 22, gap: 10 }}>
        <Action
          icon="cut-outline"
          eyebrow="01 — Book a chair"
          title="Any barber, first free chair"
          body={`Pick a service and a time; we seat you with ${shop.teamSize > 1 ? "the best-rated barber who's free" : shop.team[0]?.name ?? "the barber"}.`}
          onPress={book}
        />
        {shop.privateHire && (
          <Action
            icon="sparkles-outline"
            eyebrow="02 — Private hire"
            title="Hire the whole shop"
            body={`For a groom's party, a birthday or a team day. ${money(shop.privateHire.pricePerHour, shop.currency)} an hour, ${shop.privateHire.minHours}–${shop.privateHire.maxHours} hours, up to ${shop.privateHire.maxGuests} guests.`}
            onPress={() => router.push({ pathname: "/barbershop/[shopId]/hire", params: { shopId: shop.id } })}
          />
        )}
        {shop.delivery && shop.products.length > 0 && (
          <Action
            icon="bicycle-outline"
            eyebrow={`${shop.privateHire ? "03" : "02"} — Delivery`}
            title={`Products to your door in ~${shop.delivery.etaMin} min`}
            body={`${shop.products.length} JB's Fresh products in stock. ${shop.delivery.fee ? `Delivery ${money(shop.delivery.fee, shop.currency)}, free over ${money(shop.delivery.freeFrom, shop.currency)}` : "Free delivery"} · within ${shop.delivery.radiusKm} km.`}
            onPress={() => {
              setDeliveryShop(shop.id);
              router.push({ pathname: "/shop", params: { shopId: shop.id } });
            }}
          />
        )}
      </View>

      {shop.menu.length > 0 && (
        <View style={{ marginTop: 28 }}>
          <T variant="eyebrow" muted>Services</T>
          <T variant="heading" style={{ marginTop: 4, marginBottom: 6 }}>Menu</T>
          {shop.menu.map((m, i) => (
            <View key={m.key}>
              {i > 0 && <Divider style={{ marginVertical: 0 }} />}
              <Row style={{ justifyContent: "space-between", paddingVertical: 12 }}>
                <View style={{ flex: 1 }}>
                  <T variant="strong">{m.name}</T>
                  <T variant="caption" muted>{m.durationMin} min</T>
                </View>
                <T variant="strong">{shop.teamSize > 1 ? "from " : ""}{money(m.fromPrice, shop.currency)}</T>
              </Row>
            </View>
          ))}
        </View>
      )}

      {shop.team.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <T variant="eyebrow" muted>The team</T>
          <T variant="heading" style={{ marginTop: 4 }}>Or pick your barber</T>
          {shop.team.map((b, i) => (
            <View key={b.id}>
              {i > 0 && <Divider style={{ marginVertical: 0 }} />}
              <BarberCard barber={b} />
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 24 }}>
        <T variant="heading" style={{ marginBottom: 10 }}>Location</T>
        <BarberMap pins={[{ id: shop.id, lat: shop.lat, lng: shop.lng, label: shop.name.split(" ").slice(0, 2).join(" "), free: true }]} height={200} placeName={shop.city} />
        <Row gap={8} style={{ marginTop: 12, flexWrap: "wrap" }}>
          <Button title="Directions" icon="navigate-outline" size="sm" variant="secondary" onPress={() => Linking.openURL(directionsUrl(shop.lat, shop.lng, Platform.OS === "ios"))} />
          <Button title="Call the shop" icon="call-outline" size="sm" variant="secondary" onPress={() => Linking.openURL(`tel:${shop.phone.replace(/[^\d+]/g, "")}`)} />
        </Row>
      </View>
    </Screen>
  );
}

function Action({ icon, eyebrow, title, body, onPress }: { icon: keyof typeof Ionicons.glyphMap; eyebrow: string; title: string; body: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [{ backgroundColor: colors.ink, borderRadius: radius.xl, padding: 18, flexDirection: "row", gap: 14, alignItems: "center", cursor: "pointer" } as object, pressed && styles.pressed]}
    >
      <View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.inkLine, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={22} color={colors.onInk} />
      </View>
      <View style={{ flex: 1 }}>
        <T variant="eyebrow" color={colors.inkMuted}>{eyebrow}</T>
        <T variant="strong" color={colors.onInk} style={{ marginTop: 4, fontFamily: fonts.semibold }}>{title}</T>
        <T variant="caption" color={colors.inkMuted} style={{ marginTop: 2 }}>{body}</T>
      </View>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.onInk, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="arrow-forward" size={18} color={colors.ink} />
      </View>
    </Pressable>
  );
}
