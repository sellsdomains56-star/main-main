import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, ErrorBox, Field, Screen, Segmented, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { APP_NAME } from "../lib/config";
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
      <T variant="display">{mode === "login" ? "Welcome back" : `Join ${APP_NAME}`}</T>
      <T muted style={{ marginTop: 6, marginBottom: 20 }}>
        {mode === "login" ? `Sign in to ${APP_NAME}.` : "Book barbers, save reels and shop in seconds."}
      </T>
      <Segmented value={mode} onChange={setMode} options={[{ value: "login", label: "Sign in" }, { value: "register", label: "Create account" }]} />
      <View style={{ marginTop: 20 }}>
        {mode === "register" && <Field label="Name" value={name} onChangeText={setName} autoComplete="name" />}
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "register" ? "At least 8 characters" : undefined} />
      </View>
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}
