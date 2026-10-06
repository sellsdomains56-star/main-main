import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, Share, Text, useWindowDimensions, View } from "react-native";
import { GiftCardArt } from "../components/GiftCardArt";
import { SlideToConfirm } from "../components/SlideToConfirm";
import { colors, fonts, radius } from "../components/theme";
import { Button, Card, Divider, ErrorBox, Field, Loading, Pill, Row, Screen, Section, Segmented, T, Wrap } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { APP_NAME } from "../lib/config";
import { money } from "../lib/format";
import { useLocation } from "../lib/location";
import type { GiftCard } from "../lib/types";

async function shareCode(g: GiftCard) {
  const text = `${g.toName}, here's a ${money(g.amount, g.currency)} ${APP_NAME} gift card${g.message ? ` — ${g.message}` : ""}. Redeem code ${g.code} in Account → Gift cards.`;
  if (Platform.OS === "web") {
    const nav = globalThis.navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav?.share) await nav.share({ title: `${APP_NAME} gift card`, text }).catch(() => {});
    else await nav?.clipboard?.writeText(text).catch(() => {});
  } else {
    await Share.share({ message: text }).catch(() => {});
  }
}

/** Send a gift card, redeem one, and see your gift balance. */
export default function Gifts() {
  const { sent } = useLocalSearchParams<{ sent?: string }>();
  const { user } = useAuth();
  const { place } = useLocation();
  const { width } = useWindowDimensions();
  const [opts, setOpts] = useState<{ currency: string; amounts: number[] } | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [design, setDesign] = useState<"noir" | "ivory">("noir");
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [credit, setCredit] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<GiftCard[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.giftAmounts(place?.countryCode).then((o) => {
      setOpts(o);
      setAmount((a) => a ?? o.amounts[1]);
    }, (e: Error) => setError(e.message));
  }, [place?.countryCode]);
  const refresh = useCallback(() => {
    if (!user) return;
    api.clubMe().then((r) => setCredit(r.credit), () => {});
    api.gifts().then(setMine, () => {});
  }, [user]);
  useFocusEffect(refresh);

  const justSent = sent ? mine.find((g) => g.id === sent) : undefined;
  const cardW = Math.min(Math.min(width, 760) - 40, 360);
  const ready = !!amount && toName.trim().length > 0 && /.+@.+\..+/.test(toEmail.trim());

  const buy = useCallback(async () => {
    if (!user) return router.push("/login");
    if (!amount) return;
    setBusy(true);
    setError(null);
    try {
      const { purchase } = await api.buyGift({ amount, countryCode: place?.countryCode, toName, toEmail, message, design });
      router.push({ pathname: "/checkout/[purchaseId]", params: { purchaseId: purchase.id } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [user, amount, place?.countryCode, toName, toEmail, message, design]);

  async function redeem() {
    if (!user) return router.push("/login");
    setError(null);
    setNote(null);
    try {
      const r = await api.redeemGift(code);
      setCredit(r.credit);
      setCode("");
      setNote(`${money(r.amount, r.currency)} added — it's used automatically on your next booking or order.`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!opts && !error) return <Screen><Loading /></Screen>;
  const balances = Object.entries(credit).filter(([, v]) => v > 0);

  return (
    <Screen
      footer={
        !justSent && (
          <SlideToConfirm
            label={amount && opts ? `Slide to send · ${money(amount, opts.currency).replace(/[.,]00$/, "")}` : "Slide to send"}
            disabledLabel={!toName.trim() ? "Who is it for?" : "Add their email"}
            disabled={!ready}
            loading={busy}
            onConfirm={buy}
            resetAfter
          />
        )
      }
    >
      <Stack.Screen options={{ title: "Gift cards" }} />
      {justSent?.code ? (
        <Card tone="ink" style={{ padding: 20, borderRadius: radius.xl, marginBottom: 20 }}>
          <T variant="eyebrow" color={colors.inkMuted}>Gift card ready</T>
          <T variant="heading" color={colors.onInk} style={{ marginTop: 6 }}>Send this code to {justSent.toName}</T>
          <Text selectable style={{ fontFamily: fonts.semibold, color: colors.onInk, fontSize: 26, letterSpacing: 3, marginTop: 12 }}>{justSent.code}</Text>
          <T variant="caption" color={colors.inkMuted} style={{ marginTop: 6 }}>They redeem it in Account → Gift cards. It never expires.</T>
          <Button title="Share the gift" icon="share-outline" variant="light" size="md" onPress={() => shareCode(justSent)} style={{ marginTop: 14, alignSelf: "flex-start" }} />
        </Card>
      ) : null}

      <View style={{ alignItems: "center" }}>
        <GiftCardArt design={design} amount={amount ?? 0} currency={opts?.currency ?? "eur"} toName={toName} message={message} width={cardW} />
      </View>

      <Section title="Send a gift card">
        <Segmented value={design} onChange={setDesign} options={[{ value: "noir", label: "Noir" }, { value: "ivory", label: "Ivory" }]} />
        <Wrap gap={8}>
          <View style={{ height: 12, width: "100%" }} />
          {opts?.amounts.map((a) => <Pill key={a} label={money(a, opts.currency).replace(/[.,]00$/, "")} selected={a === amount} onPress={() => setAmount(a)} />)}
        </Wrap>
        <View style={{ marginTop: 16 }}>
          <Field label="Their name" value={toName} onChangeText={setToName} placeholder="e.g. Jordan" />
          <Field label="Their email" value={toEmail} onChangeText={setToEmail} keyboardType="email-address" autoCapitalize="none" placeholder="jordan@example.com" />
          <Field label="Message (optional)" value={message} onChangeText={setMessage} maxLength={300} multiline placeholder="Happy birthday — stay fresh." />
        </View>
      </Section>

      <Divider style={{ marginTop: 8 }} />
      <Section title="Redeem a gift card">
        {balances.length > 0 && (
          <T variant="caption" muted style={{ marginTop: -6, marginBottom: 10 }}>Your gift balance: {balances.map(([c, v]) => money(v, c)).join(" · ")}</T>
        )}
        <Row gap={10} style={{ alignItems: "flex-end" }}>
          <View style={{ flex: 1 }}>
            <Field label="Gift card code" value={code} onChangeText={(v) => setCode(v.toUpperCase())} autoCapitalize="characters" placeholder="JBF-XXXX-XXXX" style={{ marginBottom: 0 }} />
          </View>
          <Button title="Redeem" variant="secondary" onPress={redeem} disabled={code.trim().length < 8} />
        </Row>
        {note && <T variant="caption" style={{ marginTop: 10 }}>{note}</T>}
      </Section>

      {mine.length > 0 && (
        <Section title="Gift cards you sent">
          {mine.map((g) => (
            <Row key={g.id} style={{ justifyContent: "space-between", paddingVertical: 10 }}>
              <View style={{ flex: 1 }}>
                <T variant="strong">{money(g.amount, g.currency)} for {g.toName}</T>
                <T variant="caption" muted>{g.status === "redeemed" ? "Redeemed" : `Code ${g.code}`}</T>
              </View>
              {g.status === "active" && <Button title="Share" size="sm" variant="secondary" onPress={() => shareCode(g)} />}
            </Row>
          ))}
        </Section>
      )}
      {error && <View style={{ marginTop: 12 }}><ErrorBox message={error} /></View>}
    </Screen>
  );
}
