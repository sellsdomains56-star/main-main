import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, shortDate, sumText, Table, Toolbar } from "../../components/admin";
import { Avatar, ErrorBox, Loading, Row, T, Tag } from "../../components/ui";
import { api } from "../../lib/api";
import type { AdminCustomerRow } from "../../lib/types";

/** Customers: who books, how often, what they've spent. */
export default function Customers() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AdminCustomerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    api.admin.customers(q).then(setRows, (e: Error) => setError(e.message));
  }, [q]);
  useFocusEffect(load);

  return (
    <AdminPage title="Customers" subtitle="Private details stay private: use this to help people, never to market to them without consent.">
      <Toolbar q={q} onQ={setQ} placeholder="Name, email or city" />
      {error && <ErrorBox message={error} onRetry={load} />}
      {!rows ? (
        <Loading />
      ) : (
        <Table
          rows={rows}
          keyOf={(c) => c.id}
          empty={{ icon: "people-outline", title: "No customers match" }}
          columns={[
            {
              label: "Customer",
              flex: 1.8,
              render: (c) => (
                <Row gap={12}>
                  <Avatar name={c.name} size={36} />
                  <View style={{ flex: 1 }}>
                    <T variant="strong" numberOfLines={1}>{c.name}</T>
                    <T variant="small" muted numberOfLines={1}>{c.email}</T>
                  </View>
                </Row>
              ),
            },
            { label: "City", render: (c) => <T variant="caption">{c.city ?? "—"}</T> },
            { label: "Joined", render: (c) => <T variant="caption">{c.createdAt ? shortDate(c.createdAt) : "—"}</T> },
            { label: "Bookings", align: "right", render: (c) => <T variant="caption">{c.bookings}{c.cancelled ? ` (${c.cancelled} cancelled)` : ""}</T> },
            { label: "Last cut", render: (c) => <T variant="caption">{c.lastBooking ? shortDate(c.lastBooking) : "—"}</T> },
            { label: "Spent", flex: 1.2, align: "right", render: (c) => <T variant="caption">{sumText(c.spent)}</T> },
            { label: "Club", render: (c) => (c.member ? <Tag label={c.member[0]!.toUpperCase() + c.member.slice(1)} tone="dark" /> : <T variant="caption" muted>—</T>) },
          ]}
        />
      )}
    </AdminPage>
  );
}
