import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, Linking, Platform, Pressable, View } from "react-native";
import { AdminPage, ApplicationTag, BookingTable, Kpi, shortDate, shortDateTime, StatusTag, sumText, useWide } from "../../../components/admin";
import { SignatureDrawing } from "../../../components/Signature";
import { colors, fonts, radius } from "../../../components/theme";
import { Avatar, Button, Card, ErrorBox, Field, IconLine, Loading, Pill, Rating, Row, T, Tag, Wrap } from "../../../components/ui";
import { api, mediaUrl } from "../../../lib/api";
import { money } from "../../../lib/format";
import type { AdminBarberDetail, ApplicationDocKind, BarberStatus } from "../../../lib/types";

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
          {b.status === "pending" && (!b.application.required || b.application.status === "approved") && <Button title="Approve — go live" icon="checkmark" size="md" loading={busy === "approve"} onPress={() => update("approve", { status: "live" })} />}
          {b.status === "suspended" && <Button title="Reinstate" icon="play" size="md" loading={busy === "approve"} onPress={() => update("approve", { status: "live" })} />}
          {(!b.application.required || b.application.status === "approved" || b.application.status === "none") && <Button title={b.verified ? "Remove verified" : "Mark verified"} icon="shield-checkmark-outline" variant="secondary" size="md" loading={busy === "verify"} onPress={() => update("verify", { verified: !b.verified })} />}
          {b.status !== "suspended" && <Button title="Pause" icon="pause" variant="danger" size="md" loading={busy === "pause"} onPress={() => update("pause", { status: "suspended" })} />}
        </Row>
      }
    >
      {error && <ErrorBox message={error} />}
      {b.application.required && b.application.status !== "none" && <ApplicationReview b={b} wide={wide} onChanged={load} />}
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
            <T variant="heading">Profile checklist</T>
            <T variant="caption" muted style={{ marginBottom: 10 }}>{b.shop ? `Works at ${b.shop.name}: covered by the shop's contract with JB, no application needed.` : "What the barber has filled in so far."}</T>
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

const QUICK_REASONS = [
  "The ID photo is blurry. Please upload a sharper one.",
  "Your licence has expired. Please upload a valid one.",
  "The name on your ID doesn't match the name you signed with.",
  "That isn't a barber licence or permit. Please upload the right document.",
];
const DOC_LABEL: Record<ApplicationDocKind, string> = { id_front: "ID · front", id_back: "ID · back", licence: "Licence or permit" };
const expired = (d: string) => !!d && d < new Date().toISOString().slice(0, 10);
const longDate = (d: string) => (d ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(d)) : "—");

/** The barber's ID, licence and signed agreement, with approve and send back. */
function ApplicationReview({ b, wide, onChanged }: { b: AdminBarberDetail; wide: boolean; onChanged: () => void }) {
  const a = b.application;
  const [sendingBack, setSendingBack] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const act = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
      setSendingBack(false);
      setReason("");
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const open = (url: string) => {
    const full = mediaUrl(url);
    if (!full) return;
    if (Platform.OS === "web") window.open(full, "_blank", "noopener");
    else void Linking.openURL(full);
  };
  const fact = (label: string, value: string, warn?: boolean) => (
    <View style={{ width: wide ? "33.3%" : "50%", paddingVertical: 6, paddingRight: 12 }}>
      <T variant="small" muted>{label}</T>
      <T variant="caption" style={{ fontFamily: fonts.semibold, marginTop: 2 }} color={warn ? colors.danger : colors.text}>{value || "—"}{warn ? " · expired" : ""}</T>
    </View>
  );
  const docs = (["id_front", "id_back", "licence"] as ApplicationDocKind[]).filter((k) => a.docs[k]);

  return (
    <Card style={{ padding: 20, marginBottom: 16, borderWidth: a.status === "submitted" ? 1.5 : 0, borderColor: colors.text }}>
      <Row style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <Row gap={10}>
          <T variant="heading">Application</T>
          <ApplicationTag status={a.status} />
        </Row>
        <T variant="small" muted>
          {a.status === "submitted" && a.submittedAt ? `Sent ${shortDateTime(a.submittedAt)}` : a.reviewedAt ? `${a.status === "approved" ? "Approved" : "Sent back"} ${shortDateTime(a.reviewedAt)}${a.reviewedBy ? ` by ${a.reviewedBy}` : ""}` : "Not sent yet"}
        </T>
      </Row>
      {a.status === "rejected" && a.rejectionReason && <T variant="caption" color={colors.danger} style={{ marginTop: 8 }}>Asked to fix: {a.rejectionReason}</T>}

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
        {fact("Full name (as on ID)", a.legalName)}
        {fact(`${a.idLabel} number`, a.idNumber)}
        {fact(`${a.idLabel} expires`, longDate(a.idExpiry), expired(a.idExpiry))}
        {fact("Licence or permit number", a.licenceNumber)}
        {fact("Issued by", a.licenceAuthority)}
        {fact("Licence expires", longDate(a.licenceExpiry), expired(a.licenceExpiry))}
      </View>

      <T variant="eyebrow" muted style={{ marginTop: 14, marginBottom: 8 }}>Documents · tap to open full size</T>
      {docs.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {docs.map((k) => {
            const d = a.docs[k]!;
            return (
              <Pressable key={k} onPress={() => open(d.url)} accessibilityRole="link" accessibilityLabel={`Open ${DOC_LABEL[k]}`} style={{ width: wide ? 220 : "47%" }}>
                <View style={{ aspectRatio: 1.58, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}>
                  {d.contentType === "application/pdf" ? (
                    <View style={{ alignItems: "center", gap: 4 }}><Ionicons name="document-text" size={30} color={colors.text} /><T variant="small">PDF · open</T></View>
                  ) : (
                    <Image source={{ uri: mediaUrl(d.url) ?? undefined }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  )}
                </View>
                <T variant="small" style={{ marginTop: 4, fontFamily: fonts.semibold }}>{DOC_LABEL[k]}</T>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <T variant="caption" muted>No documents yet.</T>
      )}

      <T variant="eyebrow" muted style={{ marginTop: 16, marginBottom: 8 }}>Barber agreement</T>
      {a.signature ? (
        <View style={{ flexDirection: wide ? "row" : "column", gap: 14, alignItems: wide ? "center" : "stretch" }}>
          <View style={{ width: wide ? 240 : "100%", height: 80, borderRadius: radius.md, backgroundColor: colors.surface, padding: 6 }}><SignatureDrawing svg={a.signature.svg} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="strong">{a.signature.name}</T>
            <T variant="small" muted>Signed {shortDateTime(a.signature.signedAt)} · version {a.signature.version}{a.signature.current ? "" : " (an older version: ask them to sign again)"}</T>
            {(a.signature.ip || a.signature.userAgent) && <T variant="small" muted numberOfLines={1}>From {a.signature.userAgent ?? "unknown device"}{a.signature.ip ? ` · IP ${a.signature.ip}` : ""}</T>}
            <T variant="small" onPress={() => router.push("/business/agreement")} style={{ textDecorationLine: "underline", marginTop: 2 }}>Read the agreement</T>
          </View>
        </View>
      ) : (
        <T variant="caption" muted>Not signed yet.</T>
      )}

      {a.missing.length > 0 && a.status !== "approved" && (
        <View style={{ marginTop: 14 }}>
          <T variant="small" muted style={{ marginBottom: 4 }}>Still missing</T>
          {a.missing.map((m) => <IconLine key={m} icon="ellipse-outline" muted>{m}</IconLine>)}
        </View>
      )}
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}

      {a.status === "submitted" && (
        <View style={{ marginTop: 18, gap: 12 }}>
          {!sendingBack ? (
            <Row gap={8} style={{ flexWrap: "wrap" }}>
              <Button title="Approve: verified and live" icon="shield-checkmark" size="md" loading={busy === "approve"} onPress={() => act("approve", () => api.admin.approveApplication(b.id))} />
              <Button title="Send back" icon="arrow-undo-outline" variant="secondary" size="md" onPress={() => setSendingBack(true)} />
            </Row>
          ) : (
            <View style={{ gap: 8 }}>
              <T variant="strong">What should the barber fix?</T>
              <Wrap gap={6}>{QUICK_REASONS.map((r) => <Pill key={r} label={r.split(".")[0]!} selected={reason === r} onPress={() => setReason(r)} />)}</Wrap>
              <Field label="Message to the barber" value={reason} onChangeText={setReason} multiline placeholder="Be specific: they'll see this in the app." />
              <Row gap={8}>
                <Button title="Send back to barber" icon="send" size="md" variant="danger" loading={busy === "reject"} disabled={reason.trim().length < 5} onPress={() => act("reject", () => api.admin.rejectApplication(b.id, reason.trim()))} />
                <Button title="Cancel" variant="ghost" size="md" onPress={() => setSendingBack(false)} />
              </Row>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}
