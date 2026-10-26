import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, ApplicationTag, StatusTag, sumText, Table, Toolbar } from "../../../components/admin";
import { colors } from "../../../components/theme";
import { Avatar, ErrorBox, Loading, Rating, Row, T } from "../../../components/ui";
import { api } from "../../../lib/api";
import type { AdminBarberRow } from "../../../lib/types";

type Filter = "all" | "pending" | "live" | "suspended";

/** Every barber on the platform; new ones wait here for the team's approval. */
export default function Barbers() {
  const params = useLocalSearchParams<{ status?: Filter }>();
  const [status, setStatus] = useState<Filter>(params.status ?? "all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AdminBarberRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.admin.barbers({ status, q }).then(setRows, (e: Error) => setError(e.message));
  }, [status, q]);
  useFocusEffect(load);

  return (
    <AdminPage title="Barbers" subtitle="Everyone on the platform. New freelancers are approved from Applications; pause anyone who breaks the rules.">
      <Toolbar
        q={q}
        onQ={setQ}
        placeholder="Name, city or email"
        filter={{ value: status, onChange: setStatus, options: [{ value: "all", label: "All" }, { value: "pending", label: "In review" }, { value: "live", label: "Live" }, { value: "suspended", label: "Paused" }] }}
      />
      {error && <ErrorBox message={error} onRetry={load} />}
      {!rows ? (
        <Loading />
      ) : (
        <Table
          rows={rows}
          keyOf={(b) => b.id}
          onPress={(b) => router.navigate({ pathname: "/admin/barbers/[id]", params: { id: b.id } })}
          empty={{ icon: "cut-outline", title: status === "pending" ? "No one waiting for approval" : "No barbers match" }}
          columns={[
            {
              label: "Barber",
              flex: 1.8,
              render: (b) => (
                <Row gap={12}>
                  <Avatar uri={b.photoUrl} name={b.name} size={40} />
                  <View style={{ flex: 1 }}>
                    <Row gap={6}>
                      <T variant="strong" numberOfLines={1}>{b.name}</T>
                      {b.verified && <Ionicons name="shield-checkmark" size={14} color={colors.text} accessibilityLabel="Verified" />}
                    </Row>
                    <T variant="small" muted numberOfLines={1}>{b.email ?? "No login"}{b.shop ? ` · ${b.shop.name}` : ""}</T>
                  </View>
                </Row>
              ),
            },
            { label: "City", render: (b) => <T variant="caption">{b.city}</T> },
            { label: "Status", render: (b) => <StatusTag status={b.status} /> },
            { label: "Application", render: (b) => <ApplicationTag status={b.application} /> },
            { label: "Rating", render: (b) => <Rating value={b.rating} count={b.ratingCount} /> },
            { label: "Bookings", align: "right", render: (b) => <T variant="caption">{b.bookings}</T> },
            { label: "Revenue · 30d", flex: 1.2, align: "right", render: (b) => <T variant="caption">{sumText(b.revenue30)}</T> },
            { label: "Profile", align: "right", render: (b) => <T variant="caption" color={b.profileDone === b.profileTotal ? colors.text : colors.muted}>{b.profileDone}/{b.profileTotal}</T> },
          ]}
        />
      )}
    </AdminPage>
  );
}
