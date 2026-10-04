import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { LocationPill } from "../components/LocationSheet";
import { QuantityStepper } from "../components/QuantityStepper";
import { colors, radius } from "../components/theme";
import { Button, ErrorBox, IconButton, Loading, Pill, Row, Screen, styles, T } from "../components/ui";
import { useCart } from "../lib/cart";
import { SHOP_NAME } from "../lib/config";
import { money } from "../lib/format";
import { useLocation } from "../lib/location";
import { useCatalog } from "../lib/useCatalog";

const TINTS = [colors.brandSoft, colors.peach, colors.lilac, colors.sky, colors.rose];

export default function Shop() {
  const { width } = useWindowDimensions();
  const { place } = useLocation();
  const { catalog, error, reload } = useCatalog(place?.countryCode);
  const { items, count, add, setQuantity } = useCart();
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => ["All", ...new Set(catalog?.products.map((p) => p.category) ?? [])], [catalog]);
  const products = catalog?.products.filter((p) => category === "All" || p.category === category) ?? [];
  const cartTotal = catalog?.products.reduce((sum, p) => sum + p.price * (items[p.id] ?? 0), 0) ?? 0;
  const columns = Math.min(width, 760) > 560 ? 3 : 2;
  const cardWidth = (Math.min(width, 760) - 40 - 12 * (columns - 1)) / columns;

  return (
    <Screen
      footer={
        count > 0 && catalog ? (
          <Button title={`View cart · ${count} ${count === 1 ? "item" : "items"} · ${money(cartTotal, catalog.currency)}`} icon="bag-handle" onPress={() => router.push("/cart")} />
        ) : undefined
      }
    >
      <Stack.Screen options={{ headerRight: () => <IconButton icon="receipt-outline" label="My orders" tone="plain" onPress={() => router.push("/orders")} /> }} />
      <View style={{ backgroundColor: colors.brand, borderRadius: radius.lg, padding: 20, overflow: "hidden" }}>
        <T variant="title" color="#fff">Buy all {SHOP_NAME} products</T>
        <T variant="caption" color="rgba(255,255,255,0.9)" style={{ marginTop: 6, maxWidth: "75%" }}>
          The same pomades, oils and shampoos our barbers use — delivered to your door.
        </T>
        {catalog && (
          <View style={{ marginTop: 14, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
            <T variant="small" color="#fff">🚚 Free delivery over {money(catalog.shipping.freeFrom, catalog.currency)}</T>
          </View>
        )}
        <T style={{ position: "absolute", right: 14, bottom: 4, fontSize: 64, lineHeight: 76 }}>🛍️</T>
      </View>

      <View style={{ marginTop: 16 }}>
        <LocationPill label="Delivering to" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 16, marginBottom: 6 }}>
        {categories.map((c) => <Pill key={c} label={c} selected={c === category} onPress={() => setCategory(c)} />)}
      </ScrollView>

      {error && <ErrorBox message={error} onRetry={reload} />}
      {!catalog && !error && <Loading />}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
        {products.map((p, i) => (
          <View key={p.id} style={{ width: cardWidth }}>
            <View style={{ backgroundColor: TINTS[i % TINTS.length], borderRadius: radius.lg, aspectRatio: 1, alignItems: "center", justifyContent: "center" }}>
              <T style={{ fontSize: 56, lineHeight: 68 }}>{p.emoji}</T>
              {!items[p.id] && (
                <Pressable
                  accessibilityLabel={`Add ${p.name} to cart`}
                  onPress={() => add(p.id)}
                  style={({ pressed }) => [{ position: "absolute", right: 10, bottom: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }, pressed && styles.pressed]}
                >
                  <Ionicons name="add" size={22} color={colors.text} />
                </Pressable>
              )}
            </View>
            <T variant="strong" style={{ marginTop: 10 }}>{money(p.price, p.currency)}</T>
            <T variant="caption" numberOfLines={2}>{p.name.replace(`${SHOP_NAME} `, "")}</T>
            <T variant="small" muted numberOfLines={2} style={{ marginTop: 2 }}>{p.description}</T>
            {!!items[p.id] && (
              <Row style={{ marginTop: 8 }}>
                <QuantityStepper value={items[p.id]} onChange={(q) => setQuantity(p.id, q)} compact />
              </Row>
            )}
          </View>
        ))}
      </View>
    </Screen>
  );
}
