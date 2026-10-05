import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { LocationPill } from "../components/LocationSheet";
import { ProductArt } from "../components/ProductArt";
import { QuantityStepper } from "../components/QuantityStepper";
import { colors, radius } from "../components/theme";
import { Button, Card, Divider, EmptyState, ErrorBox, Field, Loading, Row, Screen, Section, SummaryLine, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { SHOP_NAME } from "../lib/config";
import { money } from "../lib/format";
import { useLocation } from "../lib/location";
import { useCatalog } from "../lib/useCatalog";

export default function Cart() {
  const { user } = useAuth();
  const { place } = useLocation();
  const { catalog, error: loadError } = useCatalog(place?.countryCode);
  const { items, setQuantity } = useCart();
  const [name, setName] = useState(user?.name ?? "");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loadError) return <Screen><ErrorBox message={loadError} /></Screen>;
  if (!catalog) return <Screen><Loading /></Screen>;

  const lines = catalog.products.filter((p) => items[p.id]);
  const subtotal = lines.reduce((sum, p) => sum + p.price * items[p.id], 0);
  const shipping = subtotal >= catalog.shipping.freeFrom ? 0 : catalog.shipping.fee;

  if (!lines.length) {
    return (
      <Screen>
        <EmptyState icon="bag-handle-outline" title="Your cart is empty" body={`Pomades, beard oils and more from ${SHOP_NAME}.`} action={{ label: "Start shopping", onPress: () => router.replace("/shop") }} />
      </Screen>
    );
  }

  async function checkout() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!place) return;
    setBusy(true);
    setError(null);
    try {
      const { order } = await api.createOrder({
        countryCode: place.countryCode,
        items: lines.map((p) => ({ productId: p.id, quantity: items[p.id] })),
        shippingName: name,
        shippingAddress: address,
      });
      router.replace({ pathname: "/order/[orderId]", params: { orderId: order.id } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      footer={
        <Button
          title={user ? `Checkout · ${money(subtotal + shipping, catalog.currency)}` : "Sign in to check out"}
          icon="lock-closed"
          onPress={checkout}
          loading={busy}
          disabled={!!user && (!place || !name.trim() || address.trim().length < 5)}
        />
      }
    >
      {lines.map((p, i) => (
        <View key={p.id}>
          {i > 0 && <Divider style={{ marginVertical: 0 }} />}
          <Row gap={14} style={{ paddingVertical: 12 }}>
            <ProductArt category={p.category} size={56} />
            <View style={{ flex: 1 }}>
              <T variant="strong" numberOfLines={1}>{p.name.replace(`${SHOP_NAME} `, "")}</T>
              <T variant="caption" muted>{money(p.price * items[p.id], p.currency)}</T>
            </View>
            <QuantityStepper value={items[p.id]} onChange={(q) => setQuantity(p.id, q)} compact />
          </Row>
        </View>
      ))}

      <Card tone="surface" style={{ marginTop: 12 }}>
        <SummaryLine label="Subtotal" value={money(subtotal, catalog.currency)} />
        <SummaryLine label="Delivery" value={shipping ? money(shipping, catalog.currency) : "Free"} />
        {shipping > 0 && (
          <T variant="small" color={colors.accent} style={{ marginTop: 4 }}>
            Add {money(catalog.shipping.freeFrom - subtotal, catalog.currency)} more for free delivery
          </T>
        )}
        <Divider />
        <SummaryLine label="Total" value={money(subtotal + shipping, catalog.currency)} strong />
      </Card>

      <Section title="Delivery details">
        <View style={{ marginBottom: 14 }}>
          <LocationPill label="Country" />
        </View>
        <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
        <Field label="Delivery address" value={address} onChangeText={setAddress} multiline placeholder="Street and number, postcode, city" autoComplete="street-address" />
      </Section>
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}
