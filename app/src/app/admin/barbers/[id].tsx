import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { AdminPage, BookingTable, Kpi, shortDate, StatusTag, sumText, useWide } from "../../../components/admin";
import { colors, fonts } from "../../../components/theme";
import { Avatar, Button, Card, ErrorBox, IconLine, Loading, Rating, Row, T, Tag, Wrap } from "../../../components/ui";
import { api } from "../../../lib/api";
import { money } from "../../../lib/format";
import type { AdminBarberDetail, BarberStatus } from "../../../lib/types";

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** One barber, everything the team needs to approve, verify or pause them. */
export default function BarberDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wide = useWide();
  const [b, setB] = useState<AdminBarberDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api.admin.barber(id).then(setB, (e: Error) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  if (!b) return <AdminPage title="Barber" back={{ label: "All barbers", href: "/admin/barbers" }}>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</AdminPage>;

  const update = async (key: string, body: { status?: BarberStatus; verified?: boolean }) => {
    setBusy(key);
    setError(null);
    try {
      await api.admin.updateBarber(b.id, body);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const p = b.profile;
  const days = [1, 2, 3, 4, 5, 6, 0].filter((d) => b.hours.workingDays.includes(d)).map((d) => DAY[d]).join(", ");

  return (
    <AdminPage
      title={b.name}
      subtitle={`${b.city} · joined ${b.joinedAt ? shortDate(b.joinedAt) : "at launch"}${b.email ? ` · ${b.email}` : ""}`}
      back={{ label: "All barbers", href: "/admin/barbers" }}
      actions={
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          {b.status === "pending" && <Button title="Approve — go live" icon="checkmark" size="md" loading={busy === "approve"} onPress={() => update("approve", { status: "live" })} />}
          {b.status === "suspended" && <Button title="Reinstate" icon="play" size="md" loading={busy === "approve"} onPress={() => update("approve", { status: "live" })} />}
          <Button title={b.verified ? "Remove verified" : "Mark verified"} icon="shield-checkmark-outline" variant="secondary" size="md" loading={busy === "verify"} onPress={() => update("verify", { verified: !b.verified })} />
          {b.status !== "suspended" && <Button title="Pause" icon="pause" variant="danger" size="md" loading={busy === "pause"} onPress={() => update("pause", { status: "suspended" })} />}
        </Row>
      }
    >
      {error && <ErrorBox message={error} />}
      <View style={{ flexDirection: wide ? "row" : "column", gap: 16 }}>
        <Card style={{ flex: 1, padding: 20 }}>
          <Row gap={14}>
            <Avatar uri={p.photoUrl} name={p.name} size={72} />
            <View style={{ flex: 1, gap: 6 }}>
              <Row gap={6} style={{ flexWrap: "wrap" }}>
                <StatusTag status={b.status} />
                {b.verified && <Tag label="Verified" icon="shield-checkmark" />}
                {b.shop && <Tag label={b.shop.name} icon="storefront-outline" />}
              </Row>
              <Rating value={b.rating} count={b.ratingCount} />
            </View>
          </Row>
          <T style={{ marginTop: 14 }}>{p.bio || "No bio yet."}</T>
          <View style={{ marginTop: 12, gap: 6 }}>
            <IconLine icon="location-outline">{p.shopAddress}</IconLine>
            <IconLine icon="time-outline">{days} · {String(b.hours.openHour).padStart(2, "0")}:00–{String(b.hours.closeHour).padStart(2, "0")}:00{b.hours.timeOff.length ? ` · ${b.hours.timeOff.length} days off` : ""}</IconLine>
            <IconLine icon={p.offersHomeVisits ? "car-outline" : "storefront-outline"}>{p.offersHomeVisits ? `Home visits +${money(p.homeVisitFee, p.currency)}` : "Shop only"}</IconLine>
            <IconLine icon="ribbon-outline">{p.yearsExperience ? `${p.yearsExperience} years` : "Experience not set"} · {p.languages.join(", ") || "languages not set"}</IconLine>
          </View>
          {p.specialties.length > 0 && <View style={{ marginTop: 12 }}><Wrap gap={6}>{p.specialties.map((s) => <Tag key={s} label={s} />)}</Wrap></View>}
          <Button title="Open public profile" variant="ghost" size="sm" icon="open-outline" onPress={() => router.push({ pathname: "/barber/[id]", params: { id: b.id } })} style={{ alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 0 }} />
        </Card>

        <View style={{ flex: 1, gap: 16 }}>
          <Card style={{ padding: 20 }}>
            <T variant="heading">Before going live</T>
            <T variant="caption" muted style={{ marginBottom: 10 }}>Check ID and trade licence outside the app, then mark verified.</T>
            {b.checklist.map((c) => (
              <Row key={c.key} gap={10} style={{ paddingVertical: 5 }}>
                <Ionicons name={c.done ? "checkmark-circle" : "ellipse-outline"} size={18} color={c.done ? colors.text : colors.faint} />
                <T variant="caption" muted={!c.done}>{c.label}</T>
              </Row>
            ))}
          </Card>
          <Card style={{ padding: 20 }}>
            <T variant="heading" style={{ marginBottom: 8 }}>Services</T>
            {p.services.map((s) => (
              <Row key={s.id} style={{ justifyContent: "space-between", paddingVertical: 4 }}>
                <T variant="caption">{s.name} · {s.durationMin} min</T>
                <T variant="caption" style={{ fontFamily: fonts.semibold }}>{money(s.price, p.currency)}</T>
              </Row>
            ))}
          </Card>
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
        <Kpi label="Paid bookings" value={String(b.stats.paid)} sub={`${b.stats.completed} completed · ${b.stats.cancelled} cancelled`} />
        <Kpi label="Booking revenue" value={sumText(b.stats.revenue, "0")} sub={`30 days: ${sumText(b.revenue30)}`} />
        <Kpi label="Reels" value={String(b.stats.reels)} sub={b.stats.reports ? `${b.stats.reports} reported` : "None reported"} />
        <Kpi label="Portfolio" value={String(p.gallery.length + p.transformations.length)} sub="photos and before-and-afters" />
      </View>

      <T variant="title" style={{ fontSize: 20, marginTop: 28, marginBottom: 12 }}>Recent bookings</T>
      <BookingTable rows={b.recent} />
    </AdminPage>
  );
}
