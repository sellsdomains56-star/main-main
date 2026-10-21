import { router } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { LogoLockup } from "../components/Brand";
import { SocialSignIn } from "../components/SocialSignIn";
import { Button, Card, ErrorBox, Field, Screen, Segmented, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { APP_NAME, DEMO_DATA } from "../lib/config";
import { DEMO_LOGINS } from "../lib/demo/server";
import { useLocation } from "../lib/location";

export default function Login() {
  const { signIn } = useAuth();
  const { place } = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const done = useCallback(async (token: string, user: Parameters<typeof signIn>[1]) => {
    await signIn(token, user);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [signIn]);

  // Demo page only: one tap into the barber's or the team's side, with sample data.
  async function tryAs(who: "barber" | "admin") {
    setBusy(true);
    setError(null);
    try {
      const login = DEMO_LOGINS[who];
      const res = await api.login(login.email, login.password);
      await signIn(res.token, res.user);
      router.replace(who === "barber" ? "/business" : "/admin");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = mode === "login"
        ? await api.login(email, password)
        : await api.register({ name, email, password, countryCode: place?.countryCode, city: place?.city || undefined });
      await done(res.token, res.user);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      footer={
        <Button
          title={mode === "login" ? "Sign in" : "Create account"}
          onPress={submit}
          loading={busy}
          disabled={!email || !password || (mode === "register" && !name)}
        />
      }
    >
      <View style={{ alignItems: "center", marginBottom: 22 }}>
        <LogoLockup size={64} />
      </View>
      <T variant="display">{mode === "login" ? "Welcome back" : `Join ${APP_NAME}`}</T>
      <T muted style={{ marginTop: 6, marginBottom: 20 }}>
        {mode === "login" ? `Sign in to ${APP_NAME}.` : "Book barbers, save reels and shop in seconds."}
      </T>
      <SocialSignIn onSignedIn={done} onError={setError} />
      <Segmented value={mode} onChange={setMode} options={[{ value: "login", label: "Sign in" }, { value: "register", label: "Create account" }]} />
      <View style={{ marginTop: 20 }}>
        {mode === "register" && <Field label="Name" value={name} onChangeText={setName} autoComplete="name" />}
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "register" ? "At least 8 characters" : undefined} />
      </View>
      {error && <ErrorBox message={error} />}
      {DEMO_DATA && (
        <Card tone="surface" style={{ marginTop: 8 }}>
          <T variant="eyebrow" muted>Demo · see the other sides</T>
          <T variant="caption" muted style={{ marginTop: 4, marginBottom: 12 }}>Sample accounts with a month of bookings. Nothing is real and nothing is charged.</T>
          <Button title="Try as a barber" icon="cut-outline" variant="secondary" size="md" disabled={busy} onPress={() => tryAs("barber")} />
          <Button title="Try as the JB team (admin)" icon="shield-checkmark-outline" variant="secondary" size="md" disabled={busy} onPress={() => tryAs("admin")} style={{ marginTop: 8 }} />
        </Card>
      )}
    </Screen>
  );
}
