import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, useWide } from "../../components/admin";
import { DAY_NAMES, HourStepper, WEEK } from "../../components/shopPanel";
import { colors } from "../../components/theme";
import { Button, Card, ErrorBox, Field, IconLine, Loading, Pill, Row, T, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import type { ShopPanel } from "../../lib/types";

/** The shop's own page in the app: about, phone and opening hours. */
export default function ShopSettings() {
  const wide = useWide();
  const [panel, setPanel] = useState<ShopPanel | null>(null);
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [open, setOpen] = useState(10);
  const [close, setClose] = useState(21);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const load = useCallback(() => {
    api.manage.panel().then((p) => {
      setPanel(p);
      setAbout(p.shop.about);
      setPhone(p.shop.phone);
      setDays(p.shop.workingDays);
      setOpen(p.shop.openHour);
      setClose(p.shop.closeHour);
    }, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  if (!panel) return <AdminPage title="Shop settings">{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</AdminPage>;
  const touch = () => setSaved(false);
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.manage.updateSettings({ about: about.trim(), phone: phone.trim(), workingDays: days, openHour: open, closeHour: close });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage title="Shop settings" subtitle={`${panel.shop.name} · ${panel.shop.address}`} actions={<Button title="Save" icon="checkmark" size="md" loading={busy} onPress={save} />}>
      {error && <ErrorBox message={error} />}
      {saved && <Row gap={6} style={{ marginBottom: 12 }}><Ionicons name="checkmark-circle" size={18} color={colors.text} /><T variant="caption">Saved — your page in the app is updated.</T></Row>}
      <View style={{ flexDirection: wide ? "row" : "column", gap: 16 }}>
        <Card style={{ flex: 1, padding: 20 }}>
          <T variant="heading" style={{ marginBottom: 12 }}>Your page in the app</T>
          <Field label="About the shop" value={about} onChangeText={(v) => { touch(); setAbout(v); }} multiline maxLength={400} />
          <Field label="Phone" value={phone} onChangeText={(v) => { touch(); setPhone(v); }} keyboardType="phone-pad" />
          <IconLine icon="information-circle-outline" muted>To change the name, address, photos or the private-hire price, message the JB team.</IconLine>
        </Card>
        <Card style={{ flex: 1, padding: 20 }}>
          <T variant="heading" style={{ marginBottom: 12 }}>Opening hours</T>
          <T variant="eyebrow" muted style={{ marginBottom: 8 }}>Open on</T>
          <Wrap>{WEEK.map((d) => <Pill key={d} label={DAY_NAMES[d]!} selected={days.includes(d)} onPress={() => { touch(); setDays((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d])); }} />)}</Wrap>
          <Row gap={12} style={{ marginTop: 16 }}>
            <HourStepper label="Opens" value={open} min={0} max={close - 1} onChange={(v) => { touch(); setOpen(v); }} />
            <HourStepper label="Closes" value={close} min={open + 1} max={24} onChange={(v) => { touch(); setClose(v); }} />
          </Row>
          <View style={{ marginTop: 12 }}>
            <IconLine icon="information-circle-outline" muted>Shown on your page and used for private hire. Each barber's own hours are set under Barbers.</IconLine>
          </View>
        </Card>
      </View>
    </AdminPage>
  );
}
