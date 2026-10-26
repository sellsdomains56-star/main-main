import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Button, ErrorBox, Field, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

/** Opened from the reset email: choose a new password and you're signed in. */
export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { signIn } = useAuth();
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (password !== again) return setError("The two passwords don't match.");
    setBusy(true);
    setError(null);
    try {
      const res = await api.resetPassword(token ?? "", password);
      await signIn(res.token, res.user);
      router.replace("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title="Save and sign in" onPress={save} loading={busy} disabled={password.length < 8 || !again} />}>
      <Stack.Screen options={{ title: "New password" }} />
      <T variant="display">Choose a new password</T>
      <T muted style={{ marginTop: 8, marginBottom: 20 }}>At least 8 characters. Other devices will be signed out.</T>
      {!token && <ErrorBox message="This link is incomplete. Open it again from the email, or ask for a new one." />}
      <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
      <Field label="Type it again" value={again} onChangeText={setAgain} secureTextEntry autoComplete="new-password" />
      {error && <ErrorBox message={error} />}
    </Screen>
  );
}
