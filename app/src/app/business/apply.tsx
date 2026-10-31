import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Platform, ScrollView, View } from "react-native";
import { SignatureDrawing } from "../../components/Signature";
import { colors, fonts, radius } from "../../components/theme";
import { Button, Card, ErrorBox, Field, IconLine, Loading, Pill, Row, Screen, Section, T, Timeline, Wrap } from "../../components/ui";
import { api, mediaUrl } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { shortDay } from "../../lib/format";
import { chooseDocument, photographDocument, type PickedDoc } from "../../lib/pickDocument";
import type { ApplicationDocKind, BarberApplication } from "../../lib/types";

type TextKey = "legalName" | "idNumber" | "idExpiry" | "licenceNumber" | "licenceAuthority" | "licenceExpiry";
const DATE_KEYS: TextKey[] = ["idExpiry", "licenceExpiry"];
/** Who usually issues barbers' licences and permits in the UAE; anything else can be typed. */
const AUTHORITIES = ["Dubai Municipality", "Dubai Economy and Tourism", "Abu Dhabi (ADDED)", "Sharjah Municipality", "A free zone"];

// Dates are typed the UAE way (31/05/2028) and kept as 2028-05-31.
const toDmy = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : iso);
function fromDmy(v: string): string | null {
  const m = v.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (!m) return /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? v.trim() : null;
  const iso = `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}
const formOf = (a: BarberApplication): Record<TextKey, string> => ({
  legalName: a.legalName, idNumber: a.idNumber, idExpiry: toDmy(a.idExpiry), licenceNumber: a.licenceNumber, licenceAuthority: a.licenceAuthority, licenceExpiry: toDmy(a.licenceExpiry),
});

/** A freelance barber's application: ID, licence and the signed agreement, sent to the Always Fresh team to check before going live. */
export default function Apply() {
  const { user } = useAuth();
  const [app, setApp] = useState<BarberApplication | null>(null);
  const [form, setForm] = useState<Record<TextKey, string> | null>(null);
  const [fieldError, setFieldError] = useState<Partial<Record<TextKey, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const saving = useRef<Promise<unknown>>(Promise.resolve());
  const scroll = useRef<ScrollView>(null);

  const load = useCallback(() => {
    if (user?.role !== "barber") return;
    api.application().then((a) => {
      setApp(a);
      setForm(formOf(a));
    }, (e: Error) => setError(e.message));
  }, [user]);
  useFocusEffect(load);

  // When the status changes (sent, sent back, approved), show the status card at the top.
  const status = useRef<string | null>(null);
  useEffect(() => {
    if (app && status.current && status.current !== app.status) setTimeout(() => scroll.current?.scrollTo({ y: 0, animated: true }), 60);
    status.current = app?.status ?? null;
  }, [app]);

  if (user?.role !== "barber") return <Screen><ErrorBox message="Sign in with your barber account to see your application." /></Screen>;
  if (!app || !form) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;

  const edit = app.canEdit;
  const set = (key: TextKey) => (v: string) => setForm((f) => (f ? { ...f, [key]: v } : f));

  /** Saves one field when the barber leaves it, and shows the tidied value (e.g. the ID number with dashes). */
  const saveField = (key: TextKey, raw?: string) => {
    const typed = (raw ?? form[key]).trim();
    const value = DATE_KEYS.includes(key) ? fromDmy(typed) : typed;
    const current = app[key];
    if (!typed || value === current) return;
    if (value === null) {
      setFieldError((e) => ({ ...e, [key]: "Use a date like 31/05/2028" }));
      return;
    }
    setFieldError((e) => ({ ...e, [key]: undefined }));
    saving.current = api.saveApplication({ [key]: value }).then(
      (a) => {
        setApp(a);
        setForm((f) => (f ? { ...f, [key]: DATE_KEYS.includes(key) ? toDmy(a[key]) : a[key] } : f));
      },
      (e: Error) => setFieldError((x) => ({ ...x, [key]: e.message })),
    );
  };

  const upload = async (kind: ApplicationDocKind, how: "camera" | "file") => {
    setBusy(kind);
    setError(null);
    try {
      const picked: PickedDoc | null = how === "camera" ? await photographDocument() : await chooseDocument({ pdf: kind === "licence" });
      if (picked) setApp(await api.uploadApplicationDoc(kind, picked.blob, picked.contentType));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    setBusy("submit");
    setError(null);
    try {
      await saving.current;
      setApp(await api.submitApplication());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const signed = app.signature?.current;
  const idDone = !!(app.legalName && app.idNumber && app.idExpiry && app.docs.id_front && (!app.uae || app.docs.id_back));
  const licenceDone = !!(app.licenceNumber && app.licenceAuthority && app.licenceExpiry && app.docs.licence);
  const step = !idDone ? 0 : !licenceDone ? 1 : !signed ? 2 : 3;

  return (
    <Screen
      key="application" // a fresh scroll view once loaded: on the web it only takes its ref when it first appears
      scrollRef={scroll}
      footer={
        edit ? (
          <View style={{ gap: 6 }}>
            <Button title={app.status === "rejected" ? "Send application again" : "Submit application"} icon="paper-plane" onPress={submit} loading={busy === "submit"} disabled={app.missing.length > 0} />
            <T variant="small" muted center>{app.missing.length ? `${app.missing.length} ${app.missing.length === 1 ? "thing" : "things"} left before you can send it` : "Everything's ready. The Always Fresh team checks it before you go live."}</T>
          </View>
        ) : undefined
      }
    >
      <T variant="eyebrow" muted>Join Always Fresh</T>
      <T variant="title" style={{ marginTop: 6 }}>Your barber application</T>
      <T muted style={{ marginTop: 6 }}>Every freelance barber on Always Fresh is licensed and verified. Send your {app.idLabel}, your barber licence and the signed agreement, and the Always Fresh team checks them before you go live.</T>

      <StatusCard app={app} step={step} />
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}

      {app.required && app.status !== "none" && (
        <>
          <Section eyebrow="Step 01" title={`Your ${app.idLabel}`}>
            <Field label="Full name, as on your ID" value={form.legalName} onChangeText={set("legalName")} onBlur={() => saveField("legalName")} editable={edit} autoComplete="name" />
            <Hint error={fieldError.legalName} />
            <Field label={`${app.idLabel} number`} value={form.idNumber} onChangeText={set("idNumber")} onBlur={() => saveField("idNumber")} editable={edit} placeholder={app.uae ? "784-1990-1234567-1" : "Passport number"} keyboardType={app.uae ? "number-pad" : "default"} autoCapitalize="characters" />
            <Hint error={fieldError.idNumber} />
            <Field label={`${app.idLabel} expiry date`} value={form.idExpiry} onChangeText={set("idExpiry")} onBlur={() => saveField("idExpiry")} editable={edit} placeholder="DD/MM/YYYY" keyboardType="numbers-and-punctuation" />
            <Hint error={fieldError.idExpiry} />
            <Row gap={12} style={{ alignItems: "stretch" }}>
              <DocTile label={app.uae ? "Front" : "Photo page"} doc={app.docs.id_front} edit={edit} busy={busy === "id_front"} onCamera={() => upload("id_front", "camera")} onFile={() => upload("id_front", "file")} />
              {app.uae && <DocTile label="Back" doc={app.docs.id_back} edit={edit} busy={busy === "id_back"} onCamera={() => upload("id_back", "camera")} onFile={() => upload("id_back", "file")} />}
            </Row>
            <T variant="small" muted style={{ marginTop: 10 }}>Lay the card flat in good light so every word is readable. Only the Always Fresh team can see your documents.</T>
          </Section>

          <Section eyebrow="Step 02" title="Your barber licence">
            <T variant="caption" muted style={{ marginBottom: 12 }}>The licence or permit that lets you work as a barber, for example from the municipality or a freelance permit.</T>
            <Field label="Licence or permit number" value={form.licenceNumber} onChangeText={set("licenceNumber")} onBlur={() => saveField("licenceNumber")} editable={edit} autoCapitalize="characters" />
            <Hint error={fieldError.licenceNumber} />
            <T variant="caption" muted style={{ marginBottom: 6 }}>Issued by</T>
            {app.uae && (
              <Wrap gap={8}>
                {AUTHORITIES.map((a) => (
                  <Pill key={a} label={a} selected={form.licenceAuthority === a} onPress={edit ? () => { set("licenceAuthority")(a); saveField("licenceAuthority", a); } : undefined} />
                ))}
              </Wrap>
            )}
            <Field label={app.uae ? "Or type who issued it" : "Who issued it"} value={AUTHORITIES.includes(form.licenceAuthority) ? "" : form.licenceAuthority} onChangeText={set("licenceAuthority")} onBlur={() => saveField("licenceAuthority")} editable={edit} style={{ marginTop: app.uae ? 12 : 0 }} />
            <Hint error={fieldError.licenceAuthority} />
            <Field label="Licence expiry date" value={form.licenceExpiry} onChangeText={set("licenceExpiry")} onBlur={() => saveField("licenceExpiry")} editable={edit} placeholder="DD/MM/YYYY" keyboardType="numbers-and-punctuation" />
            <Hint error={fieldError.licenceExpiry} />
            <Row gap={12}>
              <DocTile label="Licence or permit" sub="Photo or PDF" doc={app.docs.licence} edit={edit} busy={busy === "licence"} onCamera={() => upload("licence", "camera")} onFile={() => upload("licence", "file")} />
              <View style={{ flex: 1 }} />
            </Row>
          </Section>

          <Section eyebrow="Step 03" title="The barber agreement">
            {signed ? (
              <Card style={{ padding: 16 }}>
                <View style={{ height: 70 }}><SignatureDrawing svg={app.signature!.svg} /></View>
                <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 8, marginTop: 4 }}>
                  <T variant="strong">{app.signature!.name}</T>
                  <T variant="small" muted>Signed electronically on {shortDay(app.signature!.signedAt)} · version {app.signature!.version}</T>
                </View>
                <Button title="Read the agreement" icon="document-text-outline" variant="ghost" size="sm" onPress={() => router.push("/business/agreement")} style={{ alignSelf: "flex-start", paddingHorizontal: 0, marginTop: 6 }} />
              </Card>
            ) : (
              <Card tone="surface" style={{ padding: 16 }}>
                <T variant="strong">{app.agreement.title}</T>
                <T variant="caption" muted style={{ marginTop: 4 }}>How you work with Always Fresh as an independent barber: your licence, standards, prices and the Always Fresh fee, payouts and leaving. Read it and sign with your finger.</T>
                <Button title={app.signature ? "Sign the new version" : "Read and sign"} icon="create-outline" size="md" onPress={() => router.push("/business/agreement")} style={{ alignSelf: "flex-start", marginTop: 12 }} disabled={!edit} />
              </Card>
            )}
          </Section>

          {edit && app.missing.length > 0 && (
            <Card tone="surface" style={{ marginTop: 24, padding: 16 }}>
              <T variant="strong" style={{ marginBottom: 8 }}>Still needed</T>
              {app.missing.map((m) => <IconLine key={m} icon="ellipse-outline" muted>{m}</IconLine>)}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

function Hint({ error }: { error?: string }) {
  return error ? <T variant="small" color={colors.danger} style={{ marginTop: -8, marginBottom: 12 }}>{error}</T> : null;
}

/** Where the application stands, in words the barber can act on. */
function StatusCard({ app, step }: { app: BarberApplication; step: number }) {
  if (!app.required) {
    return (
      <Card tone="surface" style={{ marginTop: 16 }}>
        <IconLine icon="storefront-outline">You work at a barbershop, so Always Fresh's contract with your shop covers you. There's nothing for you to send.</IconLine>
      </Card>
    );
  }
  if (app.status === "none") {
    return <Card tone="surface" style={{ marginTop: 16 }}><IconLine icon="shield-checkmark-outline">Your documents are on file with the Always Fresh team. Nothing to do here.</IconLine></Card>;
  }
  if (app.status === "submitted") {
    return (
      <Card tone="ink" style={{ marginTop: 16, padding: 20 }}>
        <Row gap={8}><Ionicons name="time-outline" size={18} color={colors.onInk} /><T variant="eyebrow" color={colors.inkMuted}>Submitted · {shortDay(app.submittedAt!)}</T></Row>
        <T variant="heading" color={colors.onInk} style={{ marginTop: 8 }}>The Always Fresh team is checking your documents</T>
        <T variant="caption" color={colors.inkMuted} style={{ marginTop: 6 }}>We check your {app.idLabel}, your licence and the signed agreement, then let you know here. Meanwhile, finish your profile so you're ready to be booked.</T>
      </Card>
    );
  }
  if (app.status === "approved") {
    return (
      <Card style={{ marginTop: 16, padding: 20 }}>
        <Row gap={8}><Ionicons name="shield-checkmark" size={20} color={colors.text} /><T variant="heading">Approved · verified barber</T></Row>
        <T variant="caption" muted style={{ marginTop: 6 }}>Checked by the Always Fresh team on {shortDay(app.reviewedAt!)}. Your profile shows the Verified badge. To update a document (for example a renewed licence), contact support.</T>
      </Card>
    );
  }
  return (
    <View style={{ marginTop: 16, gap: 12 }}>
      {app.status === "rejected" && (
        <Card tone="surface" style={{ backgroundColor: colors.dangerSoft, padding: 16 }}>
          <T variant="strong" color={colors.danger}>The Always Fresh team asked for a change</T>
          <T variant="caption" color={colors.danger} style={{ marginTop: 4 }}>{app.rejectionReason}</T>
          <T variant="small" color={colors.danger} style={{ marginTop: 6 }}>Fix it below, then send your application again.</T>
        </Card>
      )}
      <Card style={{ padding: 18 }}>
        <Timeline
          active={step}
          steps={[
            { title: `Your ${app.idLabel}`, body: app.uae ? "Number, expiry and photos of both sides" : "Number, expiry and a photo of the photo page" },
            { title: "Your licence", body: "Licence or permit number, who issued it, expiry and a photo or PDF" },
            { title: "The agreement", body: "Read the barber agreement and sign it" },
            { title: "Always Fresh checks", body: "We verify everything, then you go live" },
          ]}
        />
      </Card>
    </View>
  );
}

/** One document: a preview once it's uploaded, and buttons to take a photo or choose a file. */
function DocTile({ label, sub, doc, edit, busy, onCamera, onFile }: {
  label: string; sub?: string; doc?: { url: string; contentType: string }; edit: boolean; busy: boolean; onCamera: () => void; onFile: () => void;
}) {
  const pdf = doc?.contentType === "application/pdf";
  const open = () => doc && Platform.OS === "web" && window.open(mediaUrl(doc.url) ?? undefined, "_blank", "noopener");
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={{ aspectRatio: 1.58, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.surface, borderWidth: doc ? 0 : 1.5, borderStyle: "dashed", borderColor: colors.faint, alignItems: "center", justifyContent: "center" }}>
        {busy ? (
          <Loading />
        ) : doc && !pdf ? (
          <Image source={{ uri: mediaUrl(doc.url) ?? undefined }} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityLabel={`${label} (uploaded)`} />
        ) : doc ? (
          <View style={{ alignItems: "center", gap: 4 }}><Ionicons name="document-text" size={30} color={colors.text} /><T variant="small" style={{ fontFamily: fonts.semibold }}>PDF uploaded</T></View>
        ) : (
          <View style={{ alignItems: "center", gap: 4 }}><Ionicons name="id-card-outline" size={26} color={colors.muted} /><T variant="small" muted>{sub ?? "Photo"}</T></View>
        )}
        {doc && !busy && (
          <View style={{ position: "absolute", top: 8, right: 8, backgroundColor: colors.ink, borderRadius: 12, padding: 3 }}>
            <Ionicons name="checkmark" size={14} color={colors.onInk} />
          </View>
        )}
      </View>
      <Row style={{ justifyContent: "space-between", marginTop: 6 }}>
        <T variant="caption" style={{ fontFamily: fonts.semibold }}>{label}</T>
        {doc && pdf && Platform.OS === "web" && <T variant="small" muted onPress={open}>Open</T>}
      </Row>
      {edit && !busy && (
        <Row gap={6} style={{ marginTop: 6, flexWrap: "wrap" }}>
          <Button title={doc ? "Retake" : "Camera"} icon="camera-outline" size="sm" variant="secondary" onPress={onCamera} />
          <Button title={doc ? "Replace" : "Upload"} icon="cloud-upload-outline" size="sm" variant="secondary" onPress={onFile} />
        </Row>
      )}
    </View>
  );
}
