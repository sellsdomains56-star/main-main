import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { shopPhoto } from "../lib/brandMedia";
import { resolveMedia } from "../lib/config";
import { money } from "../lib/format";
import type { ShopSummary } from "../lib/types";
import { colors, radius } from "./theme";
import { Rating, Row, styles, T, Tag } from "./ui";

const open = (id: string) => router.push({ pathname: "/barbershop/[shopId]", params: { shopId: id } });

/** The shop's photo, or a black panel with its initial. */
export function ShopPhoto({ shop, width, height, rounded = radius.lg }: { shop: Pick<ShopSummary, "photoUrl" | "name">; width: number | `${number}%`; height: number; rounded?: number }) {
  const source = shopPhoto(shop.photoUrl, (u) => resolveMedia(u) ?? u);
  if (!source) {
    return (
      <View style={{ width, height, borderRadius: rounded, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" }}>
        <T variant="display" color={colors.onInk}>{shop.name.replace(/^The /, "")[0]}</T>
      </View>
    );
  }
  return <Image source={source} accessibilityLabel={shop.name} resizeMode="cover" style={{ width, height, borderRadius: rounded, backgroundColor: colors.surface }} />;
}

/** Carousel tile on Home: photo with the name over it. */
export function ShopTile({ shop, width = 260 }: { shop: ShopSummary; width?: number }) {
  const h = Math.round(width * 0.72);
  return (
    <Pressable
      onPress={() => open(shop.id)}
      accessibilityRole="button"
      accessibilityLabel={`${shop.name}, ${shop.address}`}
      style={({ pressed }) => [{ width, cursor: "pointer" } as object, pressed && styles.pressed]}
    >
      <View style={{ borderRadius: radius.xl, overflow: "hidden" }}>
        <ShopPhoto shop={shop} width={width} height={h} rounded={radius.xl} />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(11,11,11,0.82)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h * 0.6 }} />
        <View style={{ position: "absolute", left: 16, right: 16, bottom: 14 }}>
          <T variant="heading" color={colors.onInk} numberOfLines={1}>{shop.name}</T>
          <Row gap={6} style={{ marginTop: 2 }}>
            <Rating value={shop.rating} color={colors.onInk} />
            <T variant="caption" color={colors.inkMuted} numberOfLines={1}>· {shop.teamSize} {shop.teamSize === 1 ? "barber" : "barbers"}</T>
          </Row>
        </View>
        <Row gap={6} style={{ position: "absolute", top: 12, left: 12 }}>
          {shop.offersDelivery && <Tag label="Delivers" tone="light" icon="bicycle-outline" />}
          {shop.offersPrivateHire && <Tag label="Private hire" tone="light" icon="sparkles-outline" />}
        </Row>
      </View>
    </Pressable>
  );
}

/** List row on the barbershops screen. */
export function ShopCard({ shop }: { shop: ShopSummary }) {
  return (
    <Pressable
      onPress={() => open(shop.id)}
      accessibilityRole="button"
      accessibilityLabel={`${shop.name}, ${shop.rating ?? "new"} stars, ${shop.address}`}
      style={({ pressed }) => [{ flexDirection: "row", gap: 14, paddingVertical: 14, cursor: "pointer" } as object, pressed && styles.pressed]}
    >
      <ShopPhoto shop={shop} width={96} height={96} />
      <View style={{ flex: 1, justifyContent: "center" }}>
        <T variant="heading" numberOfLines={1}>{shop.name}</T>
        <Row gap={6} style={{ marginTop: 3 }}>
          <Rating value={shop.rating} count={shop.ratingCount} />
          <T variant="caption" muted>· {shop.teamSize} {shop.teamSize === 1 ? "barber" : "barbers"}</T>
        </Row>
        <T variant="caption" muted numberOfLines={1} style={{ marginTop: 3 }}>{shop.address}</T>
        <Row gap={6} style={{ marginTop: 8, flexWrap: "wrap" }}>
          {shop.startingPrice != null && <Tag label={`from ${money(shop.startingPrice, shop.currency)}`} />}
          {shop.offersDelivery && <Tag label="Delivers" icon="bicycle-outline" />}
          {shop.offersPrivateHire && <Tag label="Private hire" icon="sparkles-outline" />}
        </Row>
      </View>
    </Pressable>
  );
}

export const shopHours = (s: { openHour: number; closeHour: number }) => `${String(s.openHour).padStart(2, "0")}:00–${String(s.closeHour).padStart(2, "0")}:00`;
