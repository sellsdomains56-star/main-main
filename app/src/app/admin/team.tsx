import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, ago, ROLE_NAME, Table, useWide } from "../../components/admin";
import { Avatar, Button, Card, ErrorBox, Field, IconLine, Loading, Pill, Row, SearchBar, T, Tag, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { ActivityEntry, AdminRole, TeamMember } from "../../lib/types";

const ROLES: { role: AdminRole; body: string }[] = [
  { role: "operations", body: "Barbers, shops, bookings, partners, the activity log." },
  { role: "support", body: "Support tickets, reported reels, bookings and customers." },
  { role: "finance", body: "Finance, VAT, analytics, orders and partners." },
  { role: "owner", body: "Everything, including the team and settings." },
];

/** Who's on the team with which role, and a log of what everyone did in the panel. */
export default function Team() {
  const wide = useWide();
  const { user } = useAuth();
  const owner = (user?.adminRole ?? "owner") === "owner";
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [log, setLog] = useState<ActivityEntry[] | null>(null);
  const [q, setQ] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("support");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (owner) api.admin.team().then(setTeam, (e: Error) => setError(e.message));
    api.admin.activity(q || undefined).then(setLog, (e: Error) => setError(e.message));
  }, [owner, q]);
  useFocusEffect(load);

  const set = (e: string, r: AdminRole | null) => async () => {
    setError(null);
    try {
      await api.admin.setTeamRole(e, r);
      setEmail("");
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <AdminPage title="Team & activity" subtitle="Roles decide what each person can open; every change is logged">
      {error && <ErrorBox message={error} onRetry={load} />}
      {owner && (
        <View style={{ flexDirection: wide ? "row" : "column", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
          <View style={{ flex: 1.6, width: "100%" }}>
            {!team ? <Loading /> : team.map((m) => (
              <Card key={m.email} style={{ marginBottom: 10 }}>
                <Row gap={12}>
                  <Avatar name={m.name ?? m.email} size={38} />
                  <View style={{ flex: 1 }}>
                    <T variant="strong">{m.name ?? "No account yet"}</T>
                    <T variant="caption" muted>{m.email}</T>
                  </View>
                  <Tag label={ROLE_NAME[m.role]} tone={m.role === "owner" ? "dark" : "neutral"} />
                </Row>
                {m.fixed ? (
                  <View style={{ marginTop: 8 }}><IconLine icon="lock-closed-outline" muted>Owner set on the server (ADMIN_EMAILS)</IconLine></View>
                ) : (
                  <Row gap={6} style={{ marginTop: 10, flexWrap: "wrap" }}>
                    {ROLES.map((r) => <Pill key={r.role} label={ROLE_NAME[r.role]} selected={m.role === r.role} onPress={set(m.email, r.role)} />)}
                    <Button title="Remove" size="sm" variant="ghost" onPress={set(m.email, null)} />
                  </Row>
                )}
              </Card>
            ))}
          </View>
          <Card style={{ flex: 1, width: "100%", padding: 20 }}>
            <T variant="heading">Add someone</T>
            <T variant="caption" muted style={{ marginTop: 4 }}>They sign up in the app first, then you give them a role.</T>
            <Field label="Their email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ marginTop: 12 }} />
            <Wrap>{ROLES.map((r) => <Pill key={r.role} label={ROLE_NAME[r.role]} selected={role === r.role} onPress={() => setRole(r.role)} />)}</Wrap>
            <T variant="caption" muted style={{ marginTop: 8 }}>{ROLES.find((r) => r.role === role)!.body}</T>
            <Button title="Give access" icon="key-outline" style={{ marginTop: 14 }} disabled={!email.includes("@")} onPress={set(email.trim().toLowerCase(), role)} />
          </Card>
        </View>
      )}
      <T variant="title" style={{ fontSize: 20, marginBottom: 12 }}>Activity</T>
      <View style={{ maxWidth: 480, marginBottom: 12 }}><SearchBar value={q} onChangeText={setQ} placeholder="Search by person, action or barber" /></View>
      {!log ? <Loading /> : (
        <Table
          rows={log}
          keyOf={(a) => a.id}
          empty={{ icon: "time-outline", title: "Nothing yet", body: "Approvals, refunds, setting changes and replies show up here." }}
          columns={[
            { label: "When", render: (a) => <T variant="caption">{ago(a.at)}</T> },
            { label: "Who", flex: 1.3, render: (a) => <T variant="caption">{a.by.name}</T> },
            { label: "What", flex: 1.2, render: (a) => <T variant="strong">{a.action.replace(/[._]/g, " ")}</T> },
            { label: "On", flex: 1.6, render: (a) => <View><T variant="caption">{a.target}</T>{a.detail ? <T variant="small" muted numberOfLines={2}>{a.detail}</T> : null}</View> },
          ]}
        />
      )}
    </AdminPage>
  );
}
