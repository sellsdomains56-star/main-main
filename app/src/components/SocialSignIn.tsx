import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { api } from "../lib/api";
import { DEMO_DATA, GOOGLE_CLIENT_IDS } from "../lib/config";
import type { User } from "../lib/types";
import { colors, fonts, radius } from "./theme";
import { styles, T } from "./ui";

WebBrowser.maybeCompleteAuthSession(); // finishes the Google pop-up on the website

type Done = (token: string, user: User) => Promise<void>;

const googleConfigured = !!(Platform.OS === "ios" ? GOOGLE_CLIENT_IDS.ios : Platform.OS === "android" ? GOOGLE_CLIENT_IDS.android : GOOGLE_CLIENT_IDS.web);

/**
 * "Continue with Apple" (Apple's own button, iPhone) and "Continue with Google".
 * Each shows only where it can work; the demo page shows both and signs in to a demo account.
 */
export function SocialSignIn({ onSignedIn, onError }: { onSignedIn: Done; onError: (message: string) => void }) {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<"apple" | "google" | null>(null);

  useEffect(() => {
    if (Platform.OS === "ios") AppleAuthentication.isAvailableAsync().then(setAppleAvailable, () => setAppleAvailable(false));
  }, []);

  const finish = async (provider: "apple" | "google", idToken: string, name?: string) => {
    setBusy(provider);
    try {
      const res = await api.socialSignIn(provider, idToken, name);
      await onSignedIn(res.token, res.user);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  async function apple() {
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (!cred.identityToken) throw new Error("Apple didn't return a sign-in token.");
      // Apple shares the name only the first time someone signs in.
      const name = cred.fullName ? AppleAuthentication.formatFullName(cred.fullName) : undefined;
      await finish("apple", cred.identityToken, name || undefined);
    } catch (e) {
      if ((e as { code?: string }).code !== "ERR_REQUEST_CANCELED") onError((e as Error).message);
    }
  }

  const showApple = DEMO_DATA || appleAvailable;
  const showGoogle = DEMO_DATA || googleConfigured;
  if (!showApple && !showGoogle) return null;

  return (
    <View style={{ gap: 10 }}>
      {showApple &&
        (appleAvailable && !DEMO_DATA ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={27}
            style={{ width: "100%", height: 54 }}
            onPress={apple}
          />
        ) : (
          <ProviderButton dark icon={<Ionicons name="logo-apple" size={20} color={colors.onInk} />} label="Continue with Apple" busy={busy === "apple"} onPress={() => finish("apple", "demo")} />
        ))}
      {showGoogle &&
        (DEMO_DATA ? (
          <ProviderButton icon={<GoogleG />} label="Continue with Google" busy={busy === "google"} onPress={() => finish("google", "demo")} />
        ) : (
          <GoogleButton busy={busy === "google"} onToken={(t) => finish("google", t)} onError={onError} />
        ))}
      {DEMO_DATA && <T variant="small" muted center>Demo: these sign you in to a demo account. The app uses your real Apple or Google account.</T>}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10, marginBottom: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <T variant="caption" muted>or with email</T>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
    </View>
  );
}

/** Kept separate so the Google hook only runs when client IDs are configured. */
function GoogleButton({ busy, onToken, onError }: { busy: boolean; onToken: (idToken: string) => void; onError: (m: string) => void }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_CLIENT_IDS.web || undefined,
    iosClientId: GOOGLE_CLIENT_IDS.ios || undefined,
    androidClientId: GOOGLE_CLIENT_IDS.android || undefined,
    selectAccount: true,
  });
  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params.id_token;
      if (idToken) onToken(idToken);
      else onError("Google didn't return a sign-in token.");
    } else if (response?.type === "error") {
      onError(response.error?.message ?? "Google sign-in failed.");
    }
  }, [response, onToken, onError]);
  return <ProviderButton icon={<GoogleG />} label="Continue with Google" busy={busy} disabled={!request} onPress={() => promptAsync()} />;
}

function ProviderButton({ icon, label, onPress, busy, disabled, dark }: { icon: React.ReactNode; label: string; onPress: () => void; busy?: boolean; disabled?: boolean; dark?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        { height: 54, borderRadius: radius.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: dark ? colors.ink : colors.card, borderWidth: dark ? 0 : 1, borderColor: colors.border, opacity: disabled ? 0.4 : 1 },
        pressed && styles.pressed,
        focused && styles.focusRing,
      ]}
    >
      {busy ? <ActivityIndicator color={dark ? colors.onInk : colors.text} /> : icon}
      <T variant="strong" color={dark ? colors.onInk : colors.text} style={{ fontFamily: fonts.semibold }}>{label}</T>
    </Pressable>
  );
}

/** Google's standard "G" mark, as its sign-in branding guidelines require. */
function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}
