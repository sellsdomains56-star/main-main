import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { SignatureDrawing, SignaturePad } from "../../components/Signature";
import { colors } from "../../components/theme";
import { Button, Card, ErrorBox, Field, IconLine, Loading, OptionRow, Screen, T } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { shortDay } from "../../lib/format";
import { LEGAL_REVIEWED } from "../../lib/legal";
import type { Agreement, BarberApplication } from "../../lib/types";

/** The Independent Barber Agreement. Anyone can read it; a freelance barber applying signs it here. */
export default function AgreementScreen() {
  const { user } = useAuth();
  const barber = user?.role === "barber";
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [app, setApp] = useState<BarberApplication | null>(null);
  const [name, setName] = useState("");
  const [svg, setSvg] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (barber) {
      api.application().then((a) => {
        setApp(a);
        setAgreement(a.agreement);
        setName((n) => n || a.legalName);
      }, (e: Error) => setError(e.message));
    } else api.barberAgreement().then(setAgreement, (e: Error) => setError(e.message));
  }, [barber]);
  useFocusEffect(load);

  if (!agreement) return <Screen>{error ? <ErrorBox message={error} onRetry={load} /> : <Loading />}</Screen>;

  const canSign = !!app?.required && app.canEdit && !app.signature?.current;
  const sign = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.signApplication({ name: name.trim(), svg: svg!, agree });
      if (router.canGoBack()) router.back();
      else router.replace("/business/apply");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Screen footer={canSign ? <Button title="Sign agreement" icon="create-outline" onPress={sign} loading={busy} disabled={!svg || name.trim().length < 3 || !agree} /> : undefined}>
      <T variant="display">{agreement.title}</T>
      <T variant="caption" muted style={{ marginTop: 6 }}>Version {agreement.version}</T>
      {!LEGAL_REVIEWED && <Card tone="surface" style={{ marginTop: 14 }}><IconLine icon="information-circle-outline" muted>Draft: this wording is being reviewed by our lawyers before launch.</IconLine></Card>}
      <T style={{ marginTop: 16, lineHeight: 24 }}>{agreement.intro}</T>
      {agreement.sections.map((s) => (
        <View key={s.heading} style={{ marginTop: 22 }}>
          <T variant="heading" style={{ marginBottom: 6 }}>{s.heading}</T>
          <T muted style={{ lineHeight: 23 }}>{s.body}</T>
        </View>
      ))}

      {app?.signature?.current && (
        <Card style={{ marginTop: 28, padding: 16 }}>
          <T variant="eyebrow" muted>Signed</T>
          <View style={{ height: 80, marginTop: 6 }}><SignatureDrawing svg={app.signature.svg} /></View>
          <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 8 }}>
            <T variant="strong">{app.signature.name}</T>
            <T variant="small" muted>Signed electronically on {shortDay(app.signature.signedAt)}</T>
          </View>
        </Card>
      )}

      {canSign && (
        <View style={{ marginTop: 32 }}>
          <T variant="title" style={{ fontSize: 22 }}>Sign</T>
          <T variant="caption" muted style={{ marginTop: 4, marginBottom: 14 }}>Type your full name as on your ID, then sign in the box with your finger (or mouse).</T>
          <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
          <SignaturePad onChange={setSvg} />
          <View style={{ marginTop: 8 }}>
            <OptionRow multi label={`I've read and agree to the ${agreement.title}`} sublabel="Signing electronically has the same effect as signing on paper." selected={agree} onPress={() => setAgree((a) => !a)} />
          </View>
          {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
        </View>
      )}
      {!canSign && error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
    </Screen>
  );
}
