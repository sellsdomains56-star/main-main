import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { api, ApiError } from "./api.js";
import { deviceLabel } from "./push.js";

/** Face ID, Touch ID, fingerprint and Windows Hello sign-in (passkeys). */

export const passkeysSupported = () => browserSupportsWebAuthn();

const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));
function toB64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type ExtResults = { prf?: { enabled?: boolean; results?: { first?: ArrayBuffer | Uint8Array } } };

/** The passkey's PRF secret, if the device produced one (it unlocks the data after a restart). */
function prfSecret(ext: unknown): string | undefined {
  const first = (ext as ExtResults | undefined)?.prf?.results?.first;
  return first ? toB64url(first) : undefined;
}

/** Ask the device for a PRF secret too; the salt is the server's, the secret never leaves this sign-in. */
function withPrf<T extends object>(options: T, salt: string): T {
  const extensions = (options as { extensions?: object }).extensions ?? {};
  return { ...options, extensions: { ...extensions, prf: { eval: { first: fromB64url(salt) } } } };
}

/** Signs in (and, after a restart, unlocks) with a passkey. */
export async function signInWithPasskey(): Promise<void> {
  const { options, prfSalt } = await api<{ options: Parameters<typeof startAuthentication>[0]["optionsJSON"]; prfSalt: string }>("/api/passkeys/login/options", { method: "POST", body: {} });
  const response = await startAuthentication({ optionsJSON: withPrf(options, prfSalt) });
  const prf = prfSecret(response.clientExtensionResults);
  await api("/api/passkeys/login", { body: { response: { ...response, clientExtensionResults: {} }, prf } });
}

/** Adds this device's Face ID or fingerprint. Returns whether it can also unlock the data after a restart. */
export async function addPasskey(): Promise<{ unlocks: boolean }> {
  const { options, prfSalt } = await api<{ options: Parameters<typeof startRegistration>[0]["optionsJSON"]; prfSalt: string }>("/api/passkeys/register/options", { method: "POST", body: {} });
  const response = await startRegistration({ optionsJSON: withPrf(options, prfSalt) });
  let prf = prfSecret(response.clientExtensionResults);
  await api("/api/passkeys/register", { body: { response: { ...response, clientExtensionResults: {} }, prf, label: deviceLabel() } });
  // Some devices only hand out the secret when signing in: do that once now to set up unlocking.
  if (!prf && (response.clientExtensionResults as ExtResults | undefined)?.prf?.enabled) {
    try {
      await signInWithPasskey();
      prf = "set";
    } catch {
      // It still signs you in; unlocking after a restart just needs the password.
    }
  }
  return { unlocks: !!prf };
}

export const isNeedsPassword = (err: unknown) => err instanceof ApiError && err.status === 423;
