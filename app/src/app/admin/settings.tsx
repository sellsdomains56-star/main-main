import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { AdminPage, useWide } from "../../components/admin";
import { colors, radius } from "../../components/theme";
import { Button, Card, ErrorBox, IconLine, Loading, OptionRow, Photo, Row, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import type { AdminSettings } from "../../lib/types";

/** Platform rules the team can change without a new release. */
export default function Settings() {
  const wide = useWide();
  const [s, setS] = useState<AdminSettings | null>(null);
  const [fee, setFee] = useState(10);
  const [includedKm, setIncludedKm] = useState(10);
  const [perKm, setPerKm] = useState(400); // AED minor units
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(() => {
    api.admin.settings().then((x) => {
      setS(x);
      setFee(x.platformFeePercent);
      setIncludedKm(x.travelIncludedKm);
      setPerKm(x.travelPerKmAed);
    }, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  const patch = async (key: string, body: Parameters<typeof api.admin.updateSettings>[0]) => {
    setBusy(key);
    setError(null);
    try {
      const next = await api.admin.updateSettings(body);
      setS(next);
      setFee(next.platformFeePercent);
      setIncludedKm(next.travelIncludedKm);
      setPerKm(next.travelPerKmAed);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (!s) return <AdminPage title="Settings">{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</AdminPage>;
  const hidden = s.campaigns.filter((c) => c.hidden).map((c) => c.id);

  return (
    <AdminPage title="Settings" subtitle="Changes apply straight away, for everyone. Each one is a business decision — agree it with the team first.">
      {error && <ErrorBox message={error} />}
      <View style={{ flexDirection: wide ? "row" : "column", gap: 16 }}>
        <Card style={{ flex: 1, padding: 20 }}>
          <T variant="heading">Always Fresh fee</T>
          <T variant="caption" muted style={{ marginTop: 2 }}>The share of each booking Always Fresh keeps. Tips always go 100% to the barber.</T>
          <Row style={{ marginTop: 16, justifyContent: "space-between" }}>
            <Row gap={0} style={{ backgroundColor: colors.surface, borderRadius: radius.pill }}>
              <Pressable accessibilityLabel="Lower the fee" onPress={() => setFee((f) => Math.max(0, f - 1))} style={{ padding: 14 }}><Ionicons name="remove" size={18} color={colors.text} /></Pressable>
              <T variant="title" style={{ minWidth: 64, textAlign: "center" }}>{fee}%</T>
              <Pressable accessibilityLabel="Raise the fee" onPress={() => setFee((f) => Math.min(50, f + 1))} style={{ padding: 14 }}><Ionicons name="add" size={18} color={colors.text} /></Pressable>
            </Row>
            <Button title="Save fee" size="md" disabled={fee === s.platformFeePercent} loading={busy === "fee"} onPress={() => patch("fee", { platformFeePercent: fee })} />
          </Row>
          <T variant="caption" muted style={{ marginTop: 12 }}>On an AED 120 cut the barber gets AED {Math.round(120 * (1 - fee / 100))}, Always Fresh keeps AED {Math.round(120 * fee / 100)}. Only new bookings use the new fee — tell barbers before you change it.</T>
        </Card>

        <Card style={{ flex: 1, padding: 20 }}>
          <T variant="heading">New barbers</T>
          <T variant="caption" muted style={{ marginTop: 2, marginBottom: 12 }}>Whether new sign-ups need the team's approval before customers can book them.</T>
          <OptionRow label="Review every new barber" sublabel="Recommended: check ID, trade licence and work first" selected={s.reviewNewBarbers} onPress={() => !s.reviewNewBarbers && patch("review", { reviewNewBarbers: true })} icon="shield-checkmark-outline" />
          <OptionRow label="Go live straight away" sublabel="Faster growth, more risk" selected={!s.reviewNewBarbers} onPress={() => s.reviewNewBarbers && patch("review", { reviewNewBarbers: false })} icon="flash-outline" />
        </Card>
      </View>

      <Card style={{ padding: 20, marginTop: 16 }}>
        <T variant="heading">Home visits further away</T>
        <T variant="caption" muted style={{ marginTop: 2 }}>The barber&apos;s visit fee covers the first {s.travelIncludedKm} km from their pin. Beyond that, customers pay extra for the barber&apos;s taxi there and back, shown before they pay. It all goes to the barber, with no Always Fresh fee. Each barber sets how far they go.</T>
        <View style={{ flexDirection: wide ? "row" : "column", gap: 16, marginTop: 16, alignItems: wide ? "center" : "flex-start" }}>
          <Stepper label="Included" value={`${includedKm} km`} onLess={() => setIncludedKm((k) => Math.max(0, k - 1))} onMore={() => setIncludedKm((k) => Math.min(100, k + 1))} />
          <Stepper label="Then, a km" value={`AED ${(perKm / 100).toFixed(perKm % 100 ? 2 : 0)}`} onLess={() => setPerKm((p) => Math.max(0, p - 50))} onMore={() => setPerKm((p) => Math.min(5000, p + 50))} />
          <Button title="Save" size="md" disabled={includedKm === s.travelIncludedKm && perKm === s.travelPerKmAed} loading={busy === "travel"} onPress={() => patch("travel", { travelIncludedKm: includedKm, travelPerKmAed: perKm })} />
        </View>
        <T variant="caption" muted style={{ marginTop: 12 }}>
          A customer 23 km away pays {23 > includedKm ? `AED ${Math.ceil(((23 - includedKm) * perKm) / 500) * 5} extra (${23 - includedKm} km beyond ${includedKm})` : "nothing extra"} on top of the barber&apos;s visit fee. Distances are the straight line plus 30% for roads.
        </T>
      </Card>

      <T variant="title" style={{ fontSize: 20, marginTop: 28 }}>Home banners</T>
      <T muted style={{ marginTop: 4, marginBottom: 12 }}>Switch campaigns on and off. New campaigns are added by the developers.</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {s.campaigns.map((c) => (
          <Card key={c.id} style={{ flexGrow: 1, flexBasis: 300, padding: 14, opacity: c.hidden ? 0.55 : 1 }}>
            <Row gap={12}>
              <Photo uri={c.photoUrl} name={c.title} style={{ width: 72, height: 72 }} />
              <View style={{ flex: 1 }}>
                <T variant="eyebrow" muted>{c.eyebrow}</T>
                <T variant="strong" numberOfLines={2} style={{ marginTop: 2 }}>{c.title}</T>
                <Row gap={6} style={{ marginTop: 6 }}>
                  <Tag label={c.hidden ? "Off" : "On"} tone={c.hidden ? "neutral" : "accent"} />
                  <T variant="small" muted>{c.countries ? c.countries.join(", ") : c.except ? `Everywhere but ${c.except.join(", ")}` : "Everywhere"}</T>
                </Row>
              </View>
              <Button title={c.hidden ? "Turn on" : "Turn off"} size="sm" variant="secondary" loading={busy === c.id} onPress={() => patch(c.id, { hiddenCampaigns: c.hidden ? hidden.filter((h) => h !== c.id) : [...hidden, c.id] })} />
            </Row>
          </Card>
        ))}
      </View>

      <View style={{ marginTop: 28, gap: 8 }}>
        <IconLine icon="lock-closed-outline" muted>Who's on the team is set by the developers (ADMIN_EMAILS on the server). Remove people the day they leave.</IconLine>
        <IconLine icon="key-outline" muted>Payment keys, AI keys and email settings live on the server, never in this panel.</IconLine>
      </View>
    </AdminPage>
  );
}

function Stepper({ label, value, onLess, onMore }: { label: string; value: string; onLess: () => void; onMore: () => void }) {
  return (
    <View>
      <T variant="caption" muted style={{ marginBottom: 6 }}>{label}</T>
      <Row gap={0} style={{ backgroundColor: colors.surface, borderRadius: radius.pill }}>
        <Pressable accessibilityLabel={`Less: ${label}`} onPress={onLess} style={{ padding: 14 }}><Ionicons name="remove" size={18} color={colors.text} /></Pressable>
        <T variant="title" style={{ minWidth: 96, textAlign: "center" }}>{value}</T>
        <Pressable accessibilityLabel={`More: ${label}`} onPress={onMore} style={{ padding: 14 }}><Ionicons name="add" size={18} color={colors.text} /></Pressable>
      </Row>
    </View>
  );
}
