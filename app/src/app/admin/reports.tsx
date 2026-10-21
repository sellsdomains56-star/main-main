import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, ago, StatusTag, useWide } from "../../components/admin";
import { Button, Card, EmptyState, ErrorBox, IconLine, Loading, Photo, Row, T } from "../../components/ui";
import { api } from "../../lib/api";
import type { AdminTicket } from "../../lib/types";

/** Reels people reported. Remove one that breaks the rules (stolen photos, offensive), or keep it. */
export default function Reports() {
  const wide = useWide();
  const [rows, setRows] = useState<AdminTicket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(() => {
    api.admin.reports().then(setRows, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  const act = async (t: AdminTicket, action: "remove" | "dismiss") => {
    setBusy(t.id + action);
    setError(null);
    try {
      await api.admin.resolveReport(t.id, action);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminPage title="Reported reels" subtitle="Aim to check every report within 24 hours. Removing a reel tells the barber why.">
      {error && <ErrorBox message={error} onRetry={load} />}
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Card><EmptyState icon="flag-outline" title="No reports" body="When someone reports a reel, it shows up here." /></Card>
      ) : (
        <View style={{ gap: 12 }}>
          {rows.map((t) => (
            <Card key={t.id} style={{ padding: 16, opacity: t.status === "closed" ? 0.65 : 1 }}>
              <View style={{ flexDirection: wide ? "row" : "column", gap: 16 }}>
                <Photo uri={t.reel?.posterUrl} name={t.reel?.barber?.name ?? "Removed"} style={{ width: wide ? 96 : "100%", height: wide ? 128 : 200 }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <T variant="strong">{t.reel?.barber?.name ?? "Reel removed"}</T>
                    <StatusTag status={t.status} />
                  </Row>
                  {t.reel && <T variant="caption" muted numberOfLines={2}>“{t.reel.caption}”</T>}
                  <IconLine icon="flag-outline">{t.message.replace(/^Reported reel by [^:]+:\s*/, "")}</IconLine>
                  <T variant="small" muted>Reported by {t.name} · {ago(t.createdAt)}</T>
                  {t.replies?.map((r) => <T key={r.at} variant="small" muted>{r.by}: {r.text}</T>)}
                  {t.status === "open" && t.reel && (
                    <Row gap={8} style={{ marginTop: 8, flexWrap: "wrap" }}>
                      <Button title="Watch" icon="play" size="sm" variant="secondary" onPress={() => router.push({ pathname: "/reel/[id]", params: { id: t.reel!.id } })} />
                      <Button title="Remove reel" icon="trash-outline" size="sm" variant="danger" loading={busy === t.id + "remove"} onPress={() => act(t, "remove")} />
                      <Button title="Keep it" size="sm" variant="ghost" loading={busy === t.id + "dismiss"} onPress={() => act(t, "dismiss")} />
                    </Row>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </AdminPage>
  );
}
