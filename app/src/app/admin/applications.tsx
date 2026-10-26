import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, ApplicationTag, shortDate, Table, Toolbar } from "../../components/admin";
import { colors } from "../../components/theme";
import { Avatar, ErrorBox, Loading, Row, T } from "../../components/ui";
import { api } from "../../lib/api";
import type { ApplicationRow } from "../../lib/types";

type Filter = "submitted" | "rejected" | "draft" | "approved" | "all";

const soon = (d: string | null) => !!d && Date.parse(d) < Date.now() + 60 * 86_400_000;
const expiry = (d: string | null) => (d ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(d)) : "—");

/** Freelance barbers who want to join: their ID, licence and signed agreement, oldest first. */
export default function Applications() {
  const [status, setStatus] = useState<Filter>("submitted");
  const [rows, setRows] = useState<ApplicationRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setRows(null);
    api.admin.applications(status).then(setRows, (e: Error) => setError(e.message));
  }, [status]);
  useFocusEffect(load);

  return (
    <AdminPage title="Applications" subtitle="Freelance barbers send their Emirates ID, barber licence and the signed agreement. Check them, then approve or send back.">
      <Toolbar
        filter={{ value: status, onChange: setStatus, options: [{ value: "submitted", label: "To review" }, { value: "rejected", label: "Sent back" }, { value: "draft", label: "Not sent" }, { value: "approved", label: "Approved" }, { value: "all", label: "All" }] }}
      />
      {error && <ErrorBox message={error} onRetry={load} />}
      {!rows ? (
        <Loading />
      ) : (
        <Table
          rows={rows}
          keyOf={(r) => r.barberId}
          onPress={(r) => router.navigate({ pathname: "/admin/barbers/[id]", params: { id: r.barberId } })}
          empty={{ icon: "id-card-outline", title: status === "submitted" ? "Nothing to review" : "No applications here" }}
          columns={[
            {
              label: "Barber",
              flex: 1.8,
              render: (r) => (
                <Row gap={12}>
                  <Avatar uri={r.photoUrl} name={r.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <T variant="strong" numberOfLines={1}>{r.legalName || r.name}</T>
                    <T variant="small" muted numberOfLines={1}>{r.email ?? "No login"} · {r.city}</T>
                  </View>
                </Row>
              ),
            },
            { label: "Status", render: (r) => <ApplicationTag status={r.status} /> },
            { label: "Sent", render: (r) => <T variant="caption">{r.submittedAt ? shortDate(r.submittedAt) : r.missing ? `${r.missing} left` : "Ready"}</T> },
            { label: "ID expires", render: (r) => <T variant="caption" color={soon(r.idExpiry) ? colors.danger : colors.text}>{expiry(r.idExpiry)}</T> },
            { label: "Licence expires", render: (r) => <T variant="caption" color={soon(r.licenceExpiry) ? colors.danger : colors.text}>{expiry(r.licenceExpiry)}</T> },
          ]}
        />
      )}
    </AdminPage>
  );
}
