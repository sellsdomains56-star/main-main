import { Stack, router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Button, ErrorBox, Field, IconLine, Screen, T } from "../components/ui";
import { api } from "../lib/api";
import { DEMO_DATA } from "../lib/config";

/** "Forgot password?": we email a link that lets them choose a new one. */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={sent ? <Button title="Back to sign in" onPress={() => router.back()} /> : <Button title="Email me a link" onPress={send} loading={busy} disabled={!email.includes("@")} />}>
      <Stack.Screen options={{ title: "Reset password" }} />
      <T variant="display">Forgot your password?</T>
      {sent ? (
        <View style={{ marginTop: 14, gap: 10 }}>
          <T muted>If {email.trim()} has an account, a link to choose a new password is on its way. It works for one hour.</T>
          <IconLine icon="mail-outline" muted>Not there? Check your spam folder, or ask again in a minute.</IconLine>
          {DEMO_DATA && <IconLine icon="information-circle-outline" muted>Demo: no email is sent. In the app the link arrives in your inbox.</IconLine>}
        </View>
      ) : (
        <>
          <T muted style={{ marginTop: 8, marginBottom: 20 }}>Enter the email you signed up with and we'll send you a link to choose a new one.</T>
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          {error && <ErrorBox message={error} />}
        </>
      )}
    </Screen>
  );
}
