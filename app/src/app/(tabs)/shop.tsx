import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { LocationPicker } from "../../components/LocationPicker";
import { QuantityStepper } from "../../components/QuantityStepper";
import { useTheme } from "../../components/theme";
import { Button, Card, Chip, ErrorBox, Loading, P, Screen } from "../../components/ui";
import { useCart } from "../../lib/cart";
import { SHOP_NAME } from "../../lib/config";
import { money } from "../../lib/format";
import { useLocation } from "../../lib/location";
import { useCatalog } from "../../lib/useCatalog";

export default function Shop() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { place } = useLocation();
  const { catalog, error, reload } = useCatalog(place?.countryCode);
  const { items, count, add, setQuantity } = useCart();
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => ["All", ...new Set(catalog?.products.map((p) => p.category) ?? [])], [catalog]);
  const products = catalog?.products.filter((p) => category === "All" || p.category === category) ?? [];
  const cartTotal = catalog?.products.reduce((sum, p) => sum + p.price * (items[p.id] ?? 0), 0) ?? 0;
  const columns = Math.min(width, 820) > 560 ? 3 : 2;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Screen>
        <Card style={{ backgroundColor: t.primary, borderColor: t.primary }}>
          <Text style={{ color: t.primaryText, fontSize: 24, fontWeight: "800" }}>🛍️ Buy all {SHOP_NAME} products</Text>
          <P style={{ color: t.primaryText, marginTop: 4 }}>
            The same pomades, oils and shampoos our barbers use — delivered to your door. Pay with Apple Pay, Google Pay or card.
          </P>
          {catalog && (
            <P style={{ color: t.primaryText, marginTop: 6, fontWeight: "700" }}>
              Free delivery from {money(catalog.shipping.freeFrom, catalog.currency)}
            </P>
          )}
        </Card>

        {!place && (
          <Card>
            <P muted style={{ marginBottom: 8 }}>Where should we deliver? Prices are shown in your local currency.</P>
            <LocationPicker />
          </Card>
        )}

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {categories.map((c) => <Chip key={c} label={c} selected={c === category} onPress={() => setCategory(c)} />)}
        </View>

        {error && <ErrorBox message={error} onRetry={reload} />}
        {!catalog && !error && <Loading />}

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}>
          {products.map((p) => (
            <View key={p.id} style={{ width: `${100 / columns}%`, paddingHorizontal: 6 }}>
              <Card style={{ flex: 1 }}>
                <View style={{ backgroundColor: t.chip, borderRadius: 12, alignItems: "center", paddingVertical: 18, marginBottom: 10 }}>
                  <Text style={{ fontSize: 44 }}>{p.emoji}</Text>
                </View>
                <Text style={{ color: t.text, fontWeight: "700", fontSize: 15 }}>{p.name}</Text>
                <P muted style={{ fontSize: 13, marginTop: 4, flexGrow: 1 }}>{p.description}</P>
                <Text style={{ color: t.text, fontWeight: "800", fontSize: 17, marginVertical: 10 }}>{money(p.price, p.currency)}</Text>
                {items[p.id] ? (
                  <QuantityStepper value={items[p.id]} onChange={(q) => setQuantity(p.id, q)} />
                ) : (
                  <Button title="Add to cart" icon="cart" onPress={() => add(p.id)} />
                )}
              </Card>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 6 }}>
          <Button title="My orders" variant="secondary" icon="receipt" onPress={() => router.push("/orders")} />
        </View>
        {count > 0 && <View style={{ height: 70 }} />}
      </Screen>

      {count > 0 && catalog && (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 12, paddingHorizontal: 16, alignItems: "center" }}>
          <View style={{ width: "100%", maxWidth: 788 }}>
            <Button title={`View cart (${count}) · ${money(cartTotal, catalog.currency)}`} icon="cart" onPress={() => router.push("/cart")} />
          </View>
        </View>
      )}
    </View>
  );
}

