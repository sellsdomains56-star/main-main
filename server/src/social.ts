import { randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { hashPassword } from "./auth.js";
import { newId, save, db } from "./db.js";
import type { User } from "./types.js";

export type Provider = "apple" | "google";

export interface SocialIdentity {
  provider: Provider;
  sub: string;
  email?: string;
  emailVerified: boolean;
}

// Public signing keys, fetched and cached by jose.
const APPLE_KEYS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
const GOOGLE_KEYS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

const ISSUERS: Record<Provider, string[]> = {
  apple: ["https://appleid.apple.com"],
  google: ["https://accounts.google.com", "accounts.google.com"],
};

/**
 * Checks an identity token from Apple or Google: signature, issuer, audience (our app's
 * client IDs) and expiry. Throws if anything is off.
 */
export async function verifyIdentityToken(provider: Provider, token: string, audience: string[], keys?: JWTVerifyGetKey): Promise<SocialIdentity> {
  if (!audience.length) throw new Error(`${provider} sign-in isn't configured on this server.`);
  const { payload } = await jwtVerify(token, keys ?? (provider === "apple" ? APPLE_KEYS : GOOGLE_KEYS), { issuer: ISSUERS[provider], audience });
  if (!payload.sub) throw new Error("The token has no user id.");
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
  // Apple sends email_verified as a string, Google as a boolean.
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";
  return { provider, sub: payload.sub, email, emailVerified };
}

/** Finds the account for this Apple/Google identity, links it to an existing account with the same verified email, or creates one. */
export function upsertSocialUser(id: SocialIdentity, name?: string): User {
  const key = id.provider === "apple" ? "appleSub" : "googleSub";
  let user = db.users.find((u) => u[key] === id.sub);
  if (!user && id.email && id.emailVerified) {
    user = db.users.find((u) => u.email === id.email);
    if (user) user[key] = id.sub;
  }
  if (!user) {
    if (!id.email) throw new Error("We couldn't get an email address from your account.");
    if (db.users.some((u) => u.email === id.email)) throw new Error("An account with this email already exists — sign in with your email and password.");
    user = {
      id: newId(),
      name: name?.trim() || id.email.split("@")[0],
      email: id.email,
      passwordHash: hashPassword(randomBytes(24).toString("hex")), // no password; they sign in with Apple/Google
      role: "customer",
      [key]: id.sub,
    };
    db.users.push(user);
  }
  save();
  return user;
}
