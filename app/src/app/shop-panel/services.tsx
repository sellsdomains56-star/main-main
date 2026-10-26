import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, useWide } from "../../components/admin";
import { MinutesStepper } from "../../components/shopPanel";
import { colors } from "../../components/theme";
import { Button, Card, ErrorBox, Field, IconButton, IconLine, Loading, Pill, Row, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import type { ShopPanel } from "../../lib/types";

interface Draft { key: string; name: string; durationMin: number; price: string }

/** The shop's menu, from what the team offers now: each service once, with the most common time and price. */
function menuOf(panel: ShopPanel): Draft[] {
  const seen = new Map<string, Draft>();
  for (const b of panel.team) {
    for (const s of b.services) {
      const k = s.name.trim().toLowerCase();
      if (!seen.has(k)) seen.set(k, { key: s.id, name: s.name, durationMin: s.durationMin, price: String(s.price / 100) });
    }
  }
  return [...seen.values()];
}
const toMinor = (v: string) => Math.round((parseFloat(v.replace(",", ".")) || 0) * 100);

/** One menu for the team: how long each service takes (30 minutes, an hour…) and what it costs. It sets the app's booking times. */
export default function Services() {
  const wide = useWide();
  const [panel, setPanel] = useState<ShopPanel | null>(null);
  const [rows, setRows] = useState<Draft[]>([]);
  const [who, setWho] = useState<string[]>([]); // empty = everyone
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const load = useCallback(() => {
    api.manage.panel().then((p) => {
      setPanel(p);
      setRows(menuOf(p));
    }, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  if (!panel) return <AdminPage title="Services & times">{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</AdminPage>;
  const cur = panel.shop.currency.toUpperCase();
  const edit = (key: string, patch: Partial<Draft>) => {
    setSaved(false);
    setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  };
  const pickBarber = (id: string) => {
    setSaved(false);
    const team = panel.team.filter((b) => b.id === id)[0];
    setWho((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
    if (team && who.length === 0) setRows(team.services.map((s) => ({ key: s.id, name: s.name, durationMin: s.durationMin, price: String(s.price / 100) })));
  };

  const save = async () => {
    setError(null);
    if (rows.some((r) => r.name.trim().length < 2)) return setError("Give every service a name.");
    setBusy(true);
    try {
      await api.manage.saveServices(rows.map((r) => ({ name: r.name.trim(), durationMin: r.durationMin, price: toMinor(r.price) })), who.length ? who : undefined);
      setSaved(true);
      api.manage.panel().then(setPanel, () => {});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      title="Services & times"
      subtitle="How long each service takes decides the booking slots in the app. Prices are what customers pay."
      actions={<Button title={who.length ? `Save for ${who.length} barber${who.length > 1 ? "s" : ""}` : "Save for everyone"} icon="checkmark" size="md" loading={busy} onPress={save} />}
    >
      {error && <ErrorBox message={error} />}
      {saved && <Row gap={6} style={{ marginBottom: 12 }}><Ionicons name="checkmark-circle" size={18} color={colors.text} /><T variant="caption">Saved — customers see the new times and prices now.</T></Row>}
      <Card style={{ padding: 18, marginBottom: 16 }}>
        <T variant="eyebrow" muted style={{ marginBottom: 8 }}>Apply to</T>
        <Wrap>
          <Pill label="Everyone" selected={!who.length} onPress={() => { setWho([]); setRows(menuOf(panel)); setSaved(false); }} />
          {panel.team.map((b) => <Pill key={b.id} label={b.name.split(" ")[0]!} selected={who.includes(b.id)} onPress={() => pickBarber(b.id)} />)}
        </Wrap>
        <T variant="caption" muted style={{ marginTop: 8 }}>{who.length ? "Only the chosen barbers get this menu." : "Every barber gets this menu. Pick barbers to give someone different times or prices (a senior barber, say)."}</T>
      </Card>
      <View style={{ gap: 10 }}>
        {rows.map((r) => (
          <Card key={r.key} style={{ padding: 14 }}>
            <View style={{ flexDirection: wide ? "row" : "column", gap: 12, alignItems: wide ? "flex-end" : "stretch" }}>
              <Field label="Service" value={r.name} onChangeText={(name) => edit(r.key, { name })} style={{ flex: 2, marginBottom: 0 }} />
              <View style={{ flex: 1 }}>
                <T variant="caption" muted style={{ marginBottom: 6 }}>Takes</T>
                <MinutesStepper value={r.durationMin} onChange={(durationMin) => edit(r.key, { durationMin })} />
              </View>
              <Field label={`Price (${cur})`} value={r.price} onChangeText={(price) => edit(r.key, { price: price.replace(/[^\d.,]/g, "") })} keyboardType="decimal-pad" style={{ flex: 1, marginBottom: 0 }} />
              {rows.length > 1 && <IconButton icon="trash-outline" label={`Remove ${r.name}`} tone="plain" onPress={() => { setSaved(false); setRows((x) => x.filter((y) => y.key !== r.key)); }} />}
            </View>
          </Card>
        ))}
      </View>
      {rows.length < 25 && <Button title="Add a service" icon="add" variant="secondary" size="md" onPress={() => { setSaved(false); setRows((r) => [...r, { key: `new-${Date.now()}`, name: "", durationMin: 30, price: "" }]); }} style={{ alignSelf: "flex-start", marginTop: 12 }} />}
      <View style={{ marginTop: 18, gap: 6 }}>
        <IconLine icon="information-circle-outline" muted>Bookings already made keep their time and price. A service with upcoming bookings can't be removed until they're done.</IconLine>
      </View>
    </AdminPage>
  );
}
