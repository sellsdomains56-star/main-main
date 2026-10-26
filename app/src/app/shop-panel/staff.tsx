import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, useWide } from "../../components/admin";
import { colors } from "../../components/theme";
import { Avatar, Button, Card, ErrorBox, Field, IconLine, Loading, Pill, Row, T, Tag, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { ROLE_LABEL } from "../../lib/shopPanel";
import type { ShopStaff } from "../../lib/types";

const ROLES: { role: "manager" | "front_desk"; body: string }[] = [
  { role: "manager", body: "Everything except staff: calendar, barbers, services, reports, pay." },
  { role: "front_desk", body: "Calendar, walk-ins, the queue, check-in and deliveries. No money or settings." },
];

/** The owner gives the team their own logins: managers and front desk, each seeing only what they need. */
export default function Staff() {
  const wide = useWide();
  const [list, setList] = useState<ShopStaff[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"manager" | "front_desk">("front_desk");
  const [login, setLogin] = useState<{ email: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.manage.staff().then(setList, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  const run = (fn: () => Promise<unknown>) => async () => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage title="Staff & roles" subtitle="Who can open this shop panel, and what they can do">
      {error && <ErrorBox message={error} onRetry={load} />}
      <View style={{ flexDirection: wide ? "row" : "column", gap: 16, alignItems: "flex-start" }}>
        <View style={{ flex: 1.4, width: "100%" }}>
          {!list ? <Loading /> : list.map((s) => (
            <Card key={s.id} style={{ marginBottom: 10 }}>
              <Row gap={12}>
                <Avatar name={s.name} size={40} />
                <View style={{ flex: 1 }}>
                  <T variant="strong">{s.name}{s.you ? " (you)" : ""}</T>
                  <T variant="caption" muted>{s.email}</T>
                </View>
                <Tag label={ROLE_LABEL[s.role]} tone={s.role === "owner" ? "dark" : "neutral"} />
              </Row>
              {s.role !== "owner" && !s.you && (
                <Row gap={8} style={{ marginTop: 12, flexWrap: "wrap" }}>
                  {ROLES.map((r) => <Pill key={r.role} label={ROLE_LABEL[r.role]} selected={s.role === r.role} onPress={run(() => api.manage.setStaffRole(s.id, r.role))} />)}
                  <Button title="Remove access" size="sm" variant="ghost" onPress={run(() => api.manage.removeStaff(s.id))} />
                </Row>
              )}
            </Card>
          ))}
        </View>
        <Card style={{ flex: 1, width: "100%", padding: 20 }}>
          <T variant="heading">Add someone</T>
          <Field label="Name" value={name} onChangeText={setName} style={{ marginTop: 12 }} />
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Wrap>{ROLES.map((r) => <Pill key={r.role} label={ROLE_LABEL[r.role]} selected={role === r.role} onPress={() => setRole(r.role)} />)}</Wrap>
          <T variant="caption" muted style={{ marginTop: 8 }}>{ROLES.find((r) => r.role === role)!.body}</T>
          <Button
            title="Create their login"
            icon="person-add-outline"
            style={{ marginTop: 14 }}
            loading={busy}
            disabled={name.trim().length < 2 || !email.includes("@")}
            onPress={run(async () => {
              const r = await api.manage.addStaff({ name: name.trim(), email: email.trim(), role });
              setLogin(r.login);
              setName("");
              setEmail("");
            })}
          />
          {login && (
            <View style={{ marginTop: 14, padding: 14, borderRadius: 14, backgroundColor: colors.surface }}>
              <T variant="strong">Hand this over in person</T>
              <IconLine icon="mail-outline">{login.email}</IconLine>
              <IconLine icon="key-outline">{login.password}</IconLine>
              <T variant="small" muted style={{ marginTop: 6 }}>Shown once. They can change it with "Forgot password?".</T>
            </View>
          )}
        </Card>
      </View>
    </AdminPage>
  );
}
