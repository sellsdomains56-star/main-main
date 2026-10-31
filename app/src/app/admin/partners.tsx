import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { AdminPage, sumText, Table, useWide } from "../../components/admin";
import { QrCode } from "../../components/QrCode";
import { Button, Card, ErrorBox, Field, IconLine, Loading, Pill, Row, T, Tag, Wrap } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import type { Partner } from "../../lib/types";

/** Hotels whose guests book through a QR code (Always Fresh pays them a commission) and companies whose people get a discount. */
export default function Partners() {
  const wide = useWide();
  const { user } = useAuth();
  const canEdit = user?.adminRole === "owner" || user?.adminRole === "operations" || !user?.adminRole;
  const [list, setList] = useState<Partner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [kind, setKind] = useState<"hotel" | "corporate">("hotel");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState(10);
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.admin.partners().then(setList, (e: Error) => setError(e.message));
  }, []);
  useFocusEffect(load);

  const add = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.admin.addPartner({ kind, name: name.trim(), code: code.trim().toUpperCase(), discountPercent: kind === "corporate" ? percent : 0, commissionPercent: kind === "hotel" ? percent : 0, emailDomain: kind === "corporate" ? domain.trim() : "", contactEmail: email.trim(), active: true });
      setName("");
      setCode("");
      setDomain("");
      setEmail("");
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const toggle = (p: Partner) => async () => {
    try {
      await api.admin.updatePartner(p.id, { active: !p.active });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const shown = list?.find((p) => p.id === open);

  return (
    <AdminPage title="Hotels & companies" subtitle="Partners' QR codes, their bookings this month, and what Always Fresh owes or gives">
      {error && <ErrorBox message={error} onRetry={load} />}
      <View style={{ flexDirection: wide ? "row" : "column", gap: 16, alignItems: "flex-start" }}>
        <View style={{ flex: 2, width: "100%" }}>
          {!list ? <Loading /> : (
            <Table
              rows={list}
              keyOf={(p) => p.id}
              onPress={(p) => setOpen(open === p.id ? null : p.id)}
              empty={{ icon: "business-outline", title: "No partners yet", body: "Add a hotel or a company on the right." }}
              columns={[
                { label: "Partner", flex: 1.6, render: (p) => <View><T variant="strong">{p.name}</T><T variant="small" muted>{p.code} · {p.kind === "hotel" ? `${p.commissionPercent}% commission` : `${p.discountPercent}% off${p.emailDomain ? ` · @${p.emailDomain}` : ""}`}</T></View> },
                { label: "This month", align: "right", render: (p) => <T variant="caption">{p.bookingsThisMonth} bookings</T> },
                { label: "Revenue", flex: 1.2, align: "right", render: (p) => <T variant="caption">{sumText(p.revenueThisMonth)}</T> },
                { label: "Owed / given", flex: 1.2, align: "right", render: (p) => <T variant="caption">{p.kind === "hotel" ? sumText(p.owedThisMonth) : sumText(p.discountsThisMonth)}</T> },
                { label: "", align: "right", render: (p) => <Tag label={p.active ? "Active" : "Paused"} tone={p.active ? "accent" : "neutral"} /> },
              ]}
            />
          )}
          {shown && (
            <Card style={{ marginTop: 16, padding: 20 }}>
              <Row gap={20} style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
                <QrCode value={shown.link} size={150} label={`QR code for ${shown.name}`} />
                <View style={{ flex: 1, minWidth: 220, gap: 6 }}>
                  <T variant="heading">{shown.name}</T>
                  <IconLine icon="link-outline">{shown.link.replace(/^https?:\/\//, "")}</IconLine>
                  <IconLine icon="mail-outline" muted>{shown.contactEmail}</IconLine>
                  <IconLine icon="stats-chart-outline" muted>{shown.bookings} bookings in total</IconLine>
                  <T variant="small" muted>{shown.kind === "hotel" ? "Put it on room cards and at the concierge desk. Guests scan, book a barber to their room, and the hotel earns its commission." : `Staff sign up with their @${shown.emailDomain ?? "company"} email (or the code) and get the discount automatically.`}</T>
                  {canEdit && <Button title={shown.active ? "Pause" : "Switch on"} size="sm" variant="secondary" style={{ alignSelf: "flex-start", marginTop: 6 }} onPress={toggle(shown)} />}
                </View>
              </Row>
            </Card>
          )}
        </View>
        {canEdit && (
          <Card style={{ flex: 1, width: "100%", padding: 20 }}>
            <T variant="heading">Add a partner</T>
            <Wrap>
              <Pill label="Hotel" icon="bed-outline" selected={kind === "hotel"} onPress={() => { setKind("hotel"); setPercent(10); }} />
              <Pill label="Company" icon="briefcase-outline" selected={kind === "corporate"} onPress={() => { setKind("corporate"); setPercent(15); }} />
            </Wrap>
            <Field label="Name" value={name} onChangeText={setName} placeholder={kind === "hotel" ? "Atlantis The Royal" : "Emirates Group"} style={{ marginTop: 12 }} />
            <Field label="Code (in the QR link)" value={code} onChangeText={(v) => setCode(v.toUpperCase())} autoCapitalize="characters" placeholder={kind === "hotel" ? "ATLANTIS" : "EMIRATES"} />
            <T variant="caption" muted style={{ marginBottom: 8 }}>{kind === "hotel" ? "Commission Always Fresh pays the hotel" : "Discount for their people"}</T>
            <Wrap>{(kind === "hotel" ? [5, 10, 15] : [10, 15, 20, 25]).map((x) => <Pill key={x} label={`${x}%`} selected={percent === x} onPress={() => setPercent(x)} />)}</Wrap>
            {kind === "corporate" && <Field label="Company email domain (optional)" value={domain} onChangeText={setDomain} autoCapitalize="none" placeholder="emirates.com" style={{ marginTop: 12 }} />}
            <Field label="Contact email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ marginTop: kind === "corporate" ? 0 : 12 }} />
            <Button title="Add partner" icon="add" loading={busy} disabled={name.trim().length < 2 || code.trim().length < 3 || !email.includes("@")} onPress={add} />
          </Card>
        )}
      </View>
    </AdminPage>
  );
}
