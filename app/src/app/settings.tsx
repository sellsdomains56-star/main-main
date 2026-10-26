import { Stack, router } from "expo-router";
import { useState } from "react";
import { Platform, Switch, View } from "react-native";
import { colors } from "../components/theme";
import { Button, Card, ErrorBox, IconLine, ListRow, Pill, Row, Screen, Section, T, Wrap } from "../components/ui";
import { langPref, themePref, writePref, type LangPref, type ThemePref } from "../lib/prefs";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { AlertSettings } from "../lib/types";

const ALERTS: { key: keyof AlertSettings; title: string; body: string; barbersOnly?: boolean }[] = [
  { key: "reminders", title: "Reminders", body: "The day before and an hour before each booking" },
  { key: "offers", title: "Offers and The Club", body: "Member perks, gift cards and offers from JB" },
  { key: "social", title: "Reels activity", body: "Likes, comments and replies on reels" },
  { key: "tips", title: "Tips", body: "When a client leaves you a tip", barbersOnly: true },
];

/** Light or dark, and English or Arabic: saved on this device, applied by reloading (or on the next launch of the phone app). */
function LookAndLanguage() {
  const [theme, setTheme] = useState<ThemePref>(themePref());
  const [lng, setLng] = useState<LangPref>(langPref());
  const [restart, setRestart] = useState(false);
  const apply = (key: "af_theme" | "af_lang", value: string) => {
    writePref(key, value);
    if (Platform.OS === "web") window.location.reload();
    else setRestart(true);
  };
  return (
    <>
      <Section title="Appearance">
        <Wrap>
          {(["system", "light", "dark"] as const).map((t) => (
            <Pill key={t} label={{ system: "System", light: "Light", dark: "Dark" }[t]} icon={{ system: "phone-portrait-outline", light: "sunny-outline", dark: "moon-outline" }[t] as "sunny-outline"} selected={theme === t} onPress={() => { setTheme(t); apply("af_theme", t); }} />
          ))}
        </Wrap>
      </Section>
      <Section title="Language">
        <Wrap>
          <Pill label="English" selected={lng === "en"} onPress={() => { setLng("en"); apply("af_lang", "en"); }} />
          <Pill label="العربية" selected={lng === "ar"} onPress={() => { setLng("ar"); apply("af_lang", "ar"); }} />
        </Wrap>
        {restart && <View style={{ marginTop: 10 }}><IconLine icon="refresh-outline" muted>Close and reopen the app to apply.</IconLine></View>}
      </Section>
    </>
  );
}

/** Account settings: which alerts reach the phone, a copy of your data, the legal pages, and deleting the account. */
export default function Settings() {
  const { user, setUser, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [mailed, setMailed] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!user) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Settings" }} />
        <LookAndLanguage />
        <Section title="Legal">
          <ListRow icon="document-text-outline" title="Terms of use" onPress={() => router.push({ pathname: "/legal/[doc]", params: { doc: "terms" } })} />
          <ListRow icon="lock-closed-outline" title="Privacy policy" onPress={() => router.push({ pathname: "/legal/[doc]", params: { doc: "privacy" } })} />
        </Section>
      </Screen>
    );
  }

  const run = (key: string, fn: () => Promise<void>) => async () => {
    setBusy(key);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  const toggle = (key: keyof AlertSettings, on: boolean) => run(key, async () => setUser(await api.updateAlerts({ [key]: on })))();

  return (
    <Screen>
      <Stack.Screen options={{ title: "Settings" }} />
      {error && <ErrorBox message={error} />}

      <Section title="Alerts on this phone">
        <T variant="caption" muted style={{ marginBottom: 6 }}>Bookings, payments and messages about your account always reach you.</T>
        {ALERTS.filter((a) => !a.barbersOnly || user.role === "barber").map((a) => {
          const on = user.alerts?.[a.key] !== false;
          return (
            <Row key={a.key} gap={12} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ flex: 1 }}>
                <T variant="strong">{a.title}</T>
                <T variant="caption" muted>{a.body}</T>
              </View>
              <Switch
                value={on}
                disabled={busy === a.key}
                onValueChange={(v) => toggle(a.key, v)}
                accessibilityLabel={a.title}
                trackColor={{ true: colors.ink, false: colors.surface }}
                thumbColor={Platform.OS === "android" ? colors.card : undefined}
                {...(Platform.OS === "web" ? ({ activeThumbColor: colors.card } as object) : {})}
              />
            </Row>
          );
        })}
      </Section>

      <LookAndLanguage />

      <Section title="Your data">
        <T variant="caption" muted style={{ marginBottom: 10 }}>A copy of everything we hold about you: account, bookings, orders, reviews and messages.</T>
        {mailed ? (
          <IconLine icon="checkmark-circle-outline">Sent to {mailed}. It may take a few minutes.</IconLine>
        ) : (
          <Button title="Email me a copy" icon="mail-outline" variant="secondary" size="md" loading={busy === "export"} onPress={run("export", async () => setMailed((await api.emailMyData()).sentTo))} style={{ alignSelf: "flex-start" }} />
        )}
      </Section>

      <Section title="Legal">
        <ListRow icon="document-text-outline" title="Terms of use" onPress={() => router.push({ pathname: "/legal/[doc]", params: { doc: "terms" } })} />
        <ListRow icon="lock-closed-outline" title="Privacy policy" onPress={() => router.push({ pathname: "/legal/[doc]", params: { doc: "privacy" } })} />
      </Section>

      <Section title="Delete account">
        {!confirmDelete ? (
          <Button title="Delete my account" icon="trash-outline" variant="danger" size="md" onPress={() => setConfirmDelete(true)} style={{ alignSelf: "flex-start" }} />
        ) : (
          <Card tone="surface">
            <T variant="strong">Delete your account for good?</T>
            <View style={{ marginTop: 8, gap: 6 }}>
              <IconLine icon="close-circle-outline" muted>Upcoming bookings are cancelled and refunded in full.</IconLine>
              <IconLine icon="close-circle-outline" muted>Your name, email, preferences, saved reels, gift-card balance and Club membership are removed.</IconLine>
              <IconLine icon="information-circle-outline" muted>Past bookings stay for the barber's records and tax, without your name.</IconLine>
              {user.role === "barber" && <IconLine icon="information-circle-outline" muted>Your barber profile is taken down and clients can no longer book you.</IconLine>}
            </View>
            <Row gap={10} style={{ marginTop: 14 }}>
              <Button title="Keep my account" variant="secondary" size="md" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }} />
              <Button
                title="Delete for good"
                variant="danger"
                size="md"
                loading={busy === "delete"}
                style={{ flex: 1 }}
                onPress={run("delete", async () => {
                  await api.deleteAccount();
                  await signOut().catch(() => {});
                  router.replace("/");
                })}
              />
            </Row>
          </Card>
        )}
      </Section>
    </Screen>
  );
}
