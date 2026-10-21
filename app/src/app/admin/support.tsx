import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, ago, StatusTag, Toolbar } from "../../components/admin";
import { colors, radius } from "../../components/theme";
import { Avatar, Button, Card, EmptyState, ErrorBox, Field, Loading, Row, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import type { AdminTicket } from "../../lib/types";

type Filter = "open" | "closed" | "all";
const TOPIC: Record<string, string> = { booking: "Booking", payment: "Payment", account: "Account", barber: "Barber", other: "Other" };

/** Questions from the Help centre and the concierge's "talk to a person". */
export default function Support() {
  const [status, setStatus] = useState<Filter>("open");
  const [rows, setRows] = useState<AdminTicket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(() => {
    api.admin.tickets(status).then(setRows, (e: Error) => setError(e.message));
  }, [status]);
  useFocusEffect(load);

  const send = async (t: AdminTicket, close: boolean, withReply = true) => {
    const reply = withReply ? drafts[t.id]?.trim() : "";
    setBusy(t.id + (!withReply ? "closeonly" : close ? "close" : "reply"));
    setError(null);
    try {
      await api.admin.updateTicket(t.id, { ...(reply ? { reply } : {}), ...(close ? { status: "closed" } : {}) });
      setDrafts((d) => ({ ...d, [t.id]: "" }));
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminPage title="Support" subtitle="Reply within a working day. Signed-in customers get your reply in their alerts; answer the rest by email.">
      <Toolbar filter={{ value: status, onChange: setStatus, options: [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }, { value: "all", label: "All" }] }} />
      {error && <ErrorBox message={error} onRetry={load} />}
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Card><EmptyState icon="chatbubbles-outline" title={status === "open" ? "Inbox zero" : "Nothing here"} body={status === "open" ? "Every question has an answer." : undefined} /></Card>
      ) : (
        <View style={{ gap: 12 }}>
          {rows.map((t) => (
            <Card key={t.id} style={{ padding: 18 }}>
              <Row gap={12} style={{ alignItems: "flex-start" }}>
                <Avatar name={t.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Row style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <View>
                      <T variant="strong">{t.name}</T>
                      <T variant="small" muted>{t.email} · {ago(t.createdAt)}</T>
                    </View>
                    <Row gap={6}>
                      <Tag label={TOPIC[t.topic] ?? t.topic} />
                      <StatusTag status={t.status} />
                    </Row>
                  </Row>
                  <T style={{ marginTop: 10 }}>{t.message}</T>
                  {t.replies?.map((r) => (
                    <View key={r.at} style={{ marginTop: 10, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12 }}>
                      <T variant="small" muted>{r.by} · {ago(r.at)}</T>
                      <T variant="caption" style={{ marginTop: 2 }}>{r.text}</T>
                    </View>
                  ))}
                  {t.status === "open" ? (
                    <View style={{ marginTop: 14 }}>
                      <Field label="Your reply" value={drafts[t.id] ?? ""} onChangeText={(v) => setDrafts((d) => ({ ...d, [t.id]: v }))} multiline placeholder={`Hi ${t.name.split(" ")[0]}, …`} />
                      <Row gap={8} style={{ flexWrap: "wrap" }}>
                        <Button title="Reply & close" icon="checkmark" size="sm" disabled={!drafts[t.id]?.trim()} loading={busy === t.id + "close"} onPress={() => send(t, true)} />
                        <Button title="Reply, keep open" size="sm" variant="secondary" disabled={!drafts[t.id]?.trim()} loading={busy === t.id + "reply"} onPress={() => send(t, false)} />
                        <Button title="Close without reply" size="sm" variant="ghost" loading={busy === t.id + "closeonly"} onPress={() => send(t, true, false)} />
                      </Row>
                    </View>
                  ) : (
                    <Button title="Reopen" size="sm" variant="ghost" onPress={() => api.admin.updateTicket(t.id, { status: "open" }).then(load, (e: Error) => setError(e.message))} style={{ alignSelf: "flex-start", marginTop: 8, paddingHorizontal: 0 }} />
                  )}
                </View>
              </Row>
            </Card>
          ))}
        </View>
      )}
    </AdminPage>
  );
}
