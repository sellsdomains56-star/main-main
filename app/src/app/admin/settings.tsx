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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(() => {
    api.admin.settings().then((x) => {
      setS(x);
      setFee(x.platformFeePercent);
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
          <T variant="heading">JB fee</T>
          <T variant="caption" muted style={{ marginTop: 2 }}>The share of each booking JB keeps. Tips always go 100% to the barber.</T>
          <Row style={{ marginTop: 16, justifyContent: "space-between" }}>
            <Row gap={0} style={{ backgroundColor: colors.surface, borderRadius: radius.pill }}>
              <Pressable accessibilityLabel="Lower the fee" onPress={() => setFee((f) => Math.max(0, f - 1))} style={{ padding: 14 }}><Ionicons name="remove" size={18} color={colors.text} /></Pressable>
              <T variant="title" style={{ minWidth: 64, textAlign: "center" }}>{fee}%</T>
              <Pressable accessibilityLabel="Raise the fee" onPress={() => setFee((f) => Math.min(50, f + 1))} style={{ padding: 14 }}><Ionicons name="add" size={18} color={colors.text} /></Pressable>
            </Row>
            <Button title="Save fee" size="md" disabled={fee === s.platformFeePercent} loading={busy === "fee"} onPress={() => patch("fee", { platformFeePercent: fee })} />
          </Row>
          <T variant="caption" muted style={{ marginTop: 12 }}>On an AED 120 cut the barber gets AED {Math.round(120 * (1 - fee / 100))}, JB keeps AED {Math.round(120 * fee / 100)}. Only new bookings use the new fee — tell barbers before you change it.</T>
        </Card>

        <Card style={{ flex: 1, padding: 20 }}>
          <T variant="heading">New barbers</T>
          <T variant="caption" muted style={{ marginTop: 2, marginBottom: 12 }}>Whether new sign-ups need the team's approval before customers can book them.</T>
          <OptionRow label="Review every new barber" sublabel="Recommended: check ID, trade licence and work first" selected={s.reviewNewBarbers} onPress={() => !s.reviewNewBarbers && patch("review", { reviewNewBarbers: true })} icon="shield-checkmark-outline" />
          <OptionRow label="Go live straight away" sublabel="Faster growth, more risk" selected={!s.reviewNewBarbers} onPress={() => s.reviewNewBarbers && patch("review", { reviewNewBarbers: false })} icon="flash-outline" />
        </Card>
      </View>

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
