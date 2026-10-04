import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, Chip, ErrorBox, Field, H1, P, Screen } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
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

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = mode === "login"
        ? await api.login(email, password)
        : await api.register({ name, email, password, countryCode: place?.countryCode, city: place?.city || undefined });
      await signIn(res.token, res.user);
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <H1>{mode === "login" ? "Welcome back" : "Create your account"}</H1>
      <View style={{ flexDirection: "row", marginVertical: 12 }}>
        <Chip label="Sign in" selected={mode === "login"} onPress={() => setMode("login")} />
        <Chip label="New here? Sign up" selected={mode === "register"} onPress={() => setMode("register")} />
      </View>
      {mode === "register" && <Field label="Name" value={name} onChangeText={setName} autoComplete="name" />}
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === "login" ? "current-password" : "new-password"} />
      {mode === "register" && <P muted style={{ marginBottom: 12 }}>At least 8 characters.</P>}
      {error && <ErrorBox message={error} />}
      <Button title={mode === "login" ? "Sign in" : "Create account"} onPress={submit} loading={busy} disabled={!email || !password || (mode === "register" && !name)} />
    </Screen>
  );
}
