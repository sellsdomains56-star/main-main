import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { LocationPicker } from "../components/LocationPicker";
import { QuantityStepper } from "../components/QuantityStepper";
import { useTheme } from "../components/theme";
import { Button, Card, ErrorBox, Field, H2, Loading, P, Screen, styles } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { useLocation } from "../lib/location";
import { useCatalog } from "../lib/useCatalog";

export default function Cart() {
  const t = useTheme();
  const { user } = useAuth();
  const { place, country } = useLocation();
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
        <P muted style={{ marginBottom: 12 }}>Your cart is empty.</P>
        <Button title="Shop GP's Fresh products" onPress={() => router.replace("/shop")} />
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
    <Screen>
      {lines.map((p) => (
        <Card key={p.id}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <Text style={{ fontSize: 32, marginRight: 12 }}>{p.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontWeight: "700" }}>{p.name}</Text>
              <P muted>{money(p.price, p.currency)} each</P>
            </View>
            <QuantityStepper value={items[p.id]} onChange={(q) => setQuantity(p.id, q)} />
          </View>
        </Card>
      ))}

      <Card>
        <Row label="Subtotal" value={money(subtotal, catalog.currency)} />
        <Row label="Delivery" value={shipping ? money(shipping, catalog.currency) : "Free"} />
        {shipping > 0 && (
          <P muted style={{ fontSize: 13, marginTop: 4 }}>
            Add {money(catalog.shipping.freeFrom - subtotal, catalog.currency)} more for free delivery.
          </P>
        )}
        <View style={{ height: 1, backgroundColor: t.border, marginVertical: 10 }} />
        <Row label="Total" value={money(subtotal + shipping, catalog.currency)} bold />
      </Card>

      <H2>Delivery</H2>
      {!place ? (
        <Card><LocationPicker /></Card>
      ) : (
        <P muted style={{ marginBottom: 10 }}>Delivering to {country?.name ?? place.countryCode}. Change your country on the Home tab.</P>
      )}
      <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
      <Field label="Delivery address" value={address} onChangeText={setAddress} multiline placeholder="Street and number, postcode, city" autoComplete="street-address" />

      {error && <ErrorBox message={error} />}
      <Button
        title={user ? "Continue to payment" : "Sign in to check out"}
        icon="lock-closed"
        onPress={checkout}
        loading={busy}
        disabled={!!user && (!place || !name.trim() || address.trim().length < 5)}
      />
    </Screen>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  const t = useTheme();
  return (
    <View style={[styles.row, { justifyContent: "space-between", marginVertical: 2 }]}>
      <P style={bold ? { fontWeight: "800" } : undefined}>{label}</P>
      <Text style={{ color: t.text, fontWeight: bold ? "800" : "600", fontSize: bold ? 18 : 15 }}>{value}</Text>
    </View>
  );
}
