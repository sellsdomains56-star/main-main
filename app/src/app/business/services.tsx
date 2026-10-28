import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { colors, radius } from "../../components/theme";
import { Button, Card, ErrorBox, Field, IconButton, IconLine, Loading, OptionRow, Pill, Row, Screen, Section, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { money } from "../../lib/format";
import { CATEGORIES, categoryOf } from "../../lib/menu";
import type { Barber, ServiceCategory } from "../../lib/types";

interface Draft {
  key: string;
  id?: string;
  name: string;
  durationMin: number;
  price: string; // what the barber types, in whole units ("120" = AED 120)
  category: ServiceCategory;
  description: string;
}

const toDraft = (b: Barber): Draft[] => b.services.map((s) => ({ key: s.id, id: s.id, name: s.name, durationMin: s.durationMin, price: String(s.price / 100), category: categoryOf(s), description: s.description ?? "" }));
const toMinor = (v: string) => Math.round((parseFloat(v.replace(",", ".")) || 0) * 100);

/** Barbers set what they offer: services, how long each takes, prices, and home visits. */
export default function Services() {
  const { user } = useAuth();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [rows, setRows] = useState<Draft[]>([]);
  const [home, setHome] = useState(false);
  const [homeFee, setHomeFee] = useState("");
  const [maxKm, setMaxKm] = useState(30); // how far from their pin they go
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    if (!user?.barberId) return;
    api.barber(user.barberId).then((b) => {
      setBarber(b);
      setRows(toDraft(b));
      setHome(b.offersHomeVisits);
      setHomeFee(b.homeVisitFee ? String(b.homeVisitFee / 100) : "");
      setMaxKm(b.travel?.maxKm ?? 30);
    }, (e: Error) => setError(e.message));
  }, [user]);
  useEffect(load, [load]);

  if (!barber) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;

  const edit = (key: string, patch: Partial<Draft>) => {
    setSaved(false);
    setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  };
  const add = () => {
    setSaved(false);
    setRows((r) => [...r, { key: `new-${Date.now()}`, name: "", durationMin: 30, price: "", category: "hair", description: "" }]);
  };
  const remove = (key: string) => {
    setSaved(false);
    setRows((r) => r.filter((x) => x.key !== key));
  };

  const save = async () => {
    setError(null);
    if (rows.some((r) => r.name.trim().length < 2)) return setError("Give every service a name.");
    if (rows.some((r) => toMinor(r.price) <= 0)) return setError("Every service needs a price.");
    setBusy(true);
    try {
      await api.saveServices(rows.map((r) => ({ id: r.id, name: r.name.trim(), durationMin: r.durationMin, price: toMinor(r.price), category: r.category, description: r.description.trim() })));
      const next = await api.updateMyBarber({ offersHomeVisits: home, homeVisitFee: home ? toMinor(homeFee) : 0, ...(home ? { travelMaxKm: maxKm } : {}) });
      setBarber(next);
      setRows(toDraft(next));
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const cur = barber.currency;
  return (
    <Screen
      footer={
        <Row gap={10}>
          {saved && <Row gap={6} style={{ flex: 1 }}><Ionicons name="checkmark-circle" size={18} color={colors.text} /><T variant="caption">Saved — customers see it now</T></Row>}
          <Button title="Save changes" onPress={save} loading={busy} style={saved ? undefined : { flex: 1 }} />
        </Row>
      }
    >
      <T muted>What customers can book, how long it takes and what it costs. Prices are in {cur.toUpperCase()}, before the JB fee.</T>
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}

      <Section title="Your services">
        {rows.map((r, i) => (
          <Card key={r.key} style={{ marginBottom: 12 }}>
            <Row style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <T variant="eyebrow" muted>{`Service ${String(i + 1).padStart(2, "0")}`}</T>
              {rows.length > 1 && <IconButton icon="trash-outline" label={`Remove ${r.name || "service"}`} tone="plain" onPress={() => remove(r.key)} />}
            </Row>
            <Field label="Name" value={r.name} onChangeText={(name) => edit(r.key, { name })} placeholder="e.g. Skin fade" maxLength={60} />
            <T variant="caption" muted style={{ marginBottom: 6 }}>Section</T>
            <Wrap gap={6}>{CATEGORIES.map((c) => <Pill key={c.id} label={c.id === "extras" ? "Extra (add-on)" : c.label} selected={r.category === c.id} onPress={() => edit(r.key, { category: c.id })} />)}</Wrap>
            <Field label="Description (optional)" value={r.description} onChangeText={(description) => edit(r.key, { description })} placeholder="e.g. Faded to the skin with a sharp line-up" maxLength={200} style={{ marginTop: 12 }} />
            <Row gap={12} style={{ alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <T variant="caption" muted style={{ marginBottom: 6 }}>Takes</T>
                <Minutes value={r.durationMin} onChange={(durationMin) => edit(r.key, { durationMin })} />
              </View>
              <Field label={`Price (${cur.toUpperCase()})`} value={r.price} onChangeText={(price) => edit(r.key, { price: price.replace(/[^\d.,]/g, "") })} keyboardType="decimal-pad" placeholder="120" style={{ flex: 1 }} />
            </Row>
          </Card>
        ))}
        {rows.length < 40 && <Button title="Add a service" icon="add" variant="secondary" size="md" onPress={add} style={{ alignSelf: "flex-start" }} />}
      </Section>

      <Section title="Home visits">
        <OptionRow label="I come to the customer" sublabel="Home, hotel or office — customers add their address" selected={home} onPress={() => { setSaved(false); setHome(true); }} icon="car-outline" />
        <OptionRow label="Only at my chair" selected={!home} onPress={() => { setSaved(false); setHome(false); }} icon="storefront-outline" />
        {home && <Field label={`Travel fee on top of the service (${cur.toUpperCase()})`} value={homeFee} onChangeText={(v) => { setSaved(false); setHomeFee(v.replace(/[^\d.,]/g, "")); }} keyboardType="decimal-pad" placeholder="e.g. 50" />}
        {home && toMinor(homeFee) > 0 && <T variant="caption" muted>A classic cut at home: {money((barber.services[0]?.price ?? 0) + toMinor(homeFee), cur)}.</T>}
        {home && (
          <View style={{ marginTop: 16 }}>
            <T variant="strong">How far you go</T>
            <T variant="caption" muted style={{ marginTop: 2, marginBottom: 8 }}>From your pin on the map. Customers further away can&apos;t book you to come to them.</T>
            <Wrap gap={8}>{[10, 20, 30, 50, 80].map((km) => <Pill key={km} label={`${km} km`} selected={maxKm === km} onPress={() => { setSaved(false); setMaxKm(km); }} />)}</Wrap>
            {barber.travel && (
              <View style={{ marginTop: 10 }}>
                <IconLine icon="car-outline" muted>
                  Your travel fee covers the first {barber.travel.includedKm} km. Further than that, customers pay {money(barber.travel.perKm, cur)} a km extra for your taxi there and back, and the app tells them before they pay. It all goes to you, with no JB fee.
                </IconLine>
              </View>
            )}
          </View>
        )}
      </Section>

      <Section>
        <IconLine icon="information-circle-outline" muted>Customers who already booked keep the price they paid. A service with upcoming bookings can't be removed until those are done.</IconLine>
        <Pressable onPress={() => router.push("/business/hours")} style={{ marginTop: 14 }}>
          <IconLine icon="time-outline">Set your hours and days off</IconLine>
        </Pressable>
      </Section>
    </Screen>
  );
}

const STEPS = [10, 15, 20, 30, 40, 45, 60, 75, 90, 120, 150, 180, 240];

/** "– 45 min +" in sensible steps. */
function Minutes({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const down = [...STEPS].reverse().find((s) => s < value);
  const up = STEPS.find((s) => s > value);
  const btn = (icon: "remove" | "add", to: number | undefined, label: string) => (
    <Pressable accessibilityLabel={label} disabled={to === undefined} onPress={() => to !== undefined && onChange(to)} hitSlop={6} style={{ padding: 12, opacity: to === undefined ? 0.3 : 1 }}>
      <Ionicons name={icon} size={16} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, height: 50 }}>
      {btn("remove", down, "Shorter")}
      <T variant="strong">{value < 60 ? `${value} min` : `${Math.floor(value / 60)} h${value % 60 ? ` ${value % 60}` : ""}`}</T>
      {btn("add", up, "Longer")}
    </View>
  );
}
