import { randomBytes } from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import type { Request } from "express";
import { config } from "./config.js";
import { getKV, getPasskey, listPasskeys, savePasskey, setKV, type PasskeyRecord } from "./db.js";
import { isUnlocked, unlockWithPasskey, wrapKeyForPasskey } from "./vault.js";

/**
 * Sign in with Face ID, Touch ID, a fingerprint or Windows Hello (passkeys).
 * Passkeys that support the PRF extension also unlock your encrypted data after a
 * restart; others sign you in while the data is already unlocked.
 */

const CHALLENGE_TTL = 5 * 60_000;
const challenges = new Map<string, number>();

function rememberChallenge(challenge: string) {
  const now = Date.now();
  for (const [c, expires] of challenges) if (expires < now) challenges.delete(c);
  challenges.set(challenge, now + CHALLENGE_TTL);
}

/** Single use: a challenge is accepted once, within five minutes. */
function takeChallenge(challenge: string): boolean {
  const expires = challenges.get(challenge);
  challenges.delete(challenge);
  return !!expires && expires > Date.now();
}

function stored(key: string, size: number): string {
  let value = getKV(key);
  if (!value) {
    value = randomBytes(size).toString("base64url");
    setKV(key, value);
  }
  return value;
}

/** The salt every passkey's PRF secret is derived from; public by design. */
export const prfSalt = () => stored("passkey_prf_salt", 32);
const userId = () => Buffer.from(stored("passkey_user_id", 16), "base64url");

/** Where the app is served from, as the browser sees it. */
function relyingParty(req: Request): { rpID: string; origins: string[] } {
  const origins = new Set<string>([`${req.protocol}://${req.get("host")}`]);
  let rpID = req.hostname;
  if (config.publicUrl) {
    const url = new URL(config.publicUrl);
    origins.add(url.origin);
    rpID = url.hostname;
  }
  return { rpID, origins: [...origins] };
}

export function passkeySummaries() {
  return listPasskeys().map((p) => ({ id: p.id, label: p.label, createdAt: p.createdAt, lastUsedAt: p.lastUsedAt, unlocks: !!p.prfWrappedKey }));
}

export async function registrationOptions(req: Request) {
  const { rpID } = relyingParty(req);
  const options = await generateRegistrationOptions({
    rpName: config.agentName,
    rpID,
    userName: config.agentName,
    userDisplayName: config.agentName,
    userID: userId(),
    attestationType: "none",
    excludeCredentials: listPasskeys().map((p) => ({ id: p.id, transports: p.transports })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  rememberChallenge(options.challenge);
  return { options, prfSalt: prfSalt() };
}

export async function finishRegistration(req: Request, body: { response: RegistrationResponseJSON; prf?: string; label: string }): Promise<void> {
  const { rpID, origins } = relyingParty(req);
  const verification = await verifyRegistrationResponse({
    response: body.response,
    expectedChallenge: (c) => takeChallenge(c),
    expectedOrigin: origins,
    expectedRPID: rpID,
    requireUserVerification: true,
  });
  if (!verification.verified || !verification.registrationInfo) throw new Error("The passkey couldn't be verified");
  const { credential } = verification.registrationInfo;
  savePasskey({
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports ?? [],
    label: body.label,
    prfWrappedKey: body.prf ? wrapKeyForPasskey(Buffer.from(body.prf, "base64url"), credential.id) : null,
    createdAt: Date.now(),
    lastUsedAt: null,
  });
}

export async function authenticationOptions(req: Request) {
  const { rpID } = relyingParty(req);
  const options = await generateAuthenticationOptions({ rpID, userVerification: "required", allowCredentials: [] });
  rememberChallenge(options.challenge);
  return { options, prfSalt: prfSalt() };
}

export type LoginResult = { ok: true; passkey: PasskeyRecord } | { ok: false; status: number; error: string; needsPassword?: boolean };

/**
 * Checks a passkey sign-in. If the data is locked (after a restart), the passkey's PRF
 * secret unlocks it. A passkey without one gets its unlock set up the first time it's
 * used while the data is unlocked and the browser supplies the secret.
 */
export async function finishAuthentication(req: Request, body: { response: AuthenticationResponseJSON; prf?: string }): Promise<LoginResult> {
  const passkey = getPasskey(body.response.id);
  if (!passkey) return { ok: false, status: 401, error: "This passkey isn't registered here. Sign in with your password." };
  const { rpID, origins } = relyingParty(req);
  const verification = await verifyAuthenticationResponse({
    response: body.response,
    expectedChallenge: (c) => takeChallenge(c),
    expectedOrigin: origins,
    expectedRPID: rpID,
    requireUserVerification: true,
    credential: { id: passkey.id, publicKey: Buffer.from(passkey.publicKey, "base64url"), counter: passkey.counter, transports: passkey.transports as never },
  }).catch(() => null);
  if (!verification?.verified) return { ok: false, status: 401, error: "That passkey sign-in didn't check out. Try again." };

  const secret = body.prf ? Buffer.from(body.prf, "base64url") : null;
  if (!isUnlocked()) {
    if (!passkey.prfWrappedKey || !secret || !unlockWithPasskey(passkey.prfWrappedKey, secret, passkey.id)) {
      return {
        ok: false,
        status: 423,
        needsPassword: true,
        error: "Your data is locked after a restart, and this passkey can't unlock it. Sign in with your password once.",
      };
    }
  }
  const updated: PasskeyRecord = {
    ...passkey,
    counter: verification.authenticationInfo.newCounter,
    lastUsedAt: Date.now(),
    prfWrappedKey: passkey.prfWrappedKey ?? (secret ? wrapKeyForPasskey(secret, passkey.id) : null),
  };
  savePasskey(updated);
  return { ok: true, passkey: updated };
}
