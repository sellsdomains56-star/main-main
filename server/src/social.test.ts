import assert from "node:assert/strict";
import { test } from "node:test";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { db } from "./db.js";
import { upsertSocialUser, verifyIdentityToken } from "./social.js";

async function issuer(iss: string) {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = { ...(await exportJWK(publicKey)), kid: "test", alg: "RS256" };
  const keys = createLocalJWKSet({ keys: [jwk] });
  const sign = (claims: Record<string, unknown>, aud: string, exp = "5m") =>
    new SignJWT(claims).setProtectedHeader({ alg: "RS256", kid: "test" }).setIssuer(iss).setAudience(aud).setIssuedAt().setExpirationTime(exp).sign(privateKey);
  return { keys, sign };
}

test("Google ID tokens are verified against issuer, audience and signature", async () => {
  const google = await issuer("https://accounts.google.com");
  const token = await google.sign({ sub: "g-123", email: "Jo@Example.com", email_verified: true }, "web-client");
  const id = await verifyIdentityToken("google", token, ["web-client", "ios-client"], google.keys);
  assert.deepEqual(id, { provider: "google", sub: "g-123", email: "jo@example.com", emailVerified: true });

  // Wrong audience, wrong issuer, expired, or signed by someone else: all rejected.
  await assert.rejects(verifyIdentityToken("google", await google.sign({ sub: "g-1" }, "someone-else"), ["web-client"], google.keys));
  await assert.rejects(verifyIdentityToken("apple", token, ["web-client"], google.keys));
  await assert.rejects(verifyIdentityToken("google", await google.sign({ sub: "g-1" }, "web-client", "-1m"), ["web-client"], google.keys));
  const forger = await issuer("https://accounts.google.com");
  await assert.rejects(verifyIdentityToken("google", await forger.sign({ sub: "g-1" }, "web-client"), ["web-client"], google.keys));
  // Not configured on this server.
  await assert.rejects(verifyIdentityToken("google", token, [], google.keys), /isn't configured/);
});

test("Apple tokens: string email_verified is understood", async () => {
  const apple = await issuer("https://appleid.apple.com");
  const token = await apple.sign({ sub: "a-1", email: "abc@privaterelay.appleid.com", email_verified: "true" }, "com.alwaysfresh.app");
  const id = await verifyIdentityToken("apple", token, ["com.alwaysfresh.app"], apple.keys);
  assert.equal(id.emailVerified, true);
  assert.equal(id.sub, "a-1");
});

test("social sign-in creates, then finds, then links accounts by verified email", () => {
  const created = upsertSocialUser({ provider: "apple", sub: "apple-xyz", email: "new.person@example.com", emailVerified: true }, "New Person");
  assert.equal(created.name, "New Person");
  assert.equal(created.appleSub, "apple-xyz");
  assert.equal(created.role, "customer");

  const again = upsertSocialUser({ provider: "apple", sub: "apple-xyz", emailVerified: false });
  assert.equal(again.id, created.id); // Apple only sends the email the first time

  const linked = upsertSocialUser({ provider: "google", sub: "google-xyz", email: "new.person@example.com", emailVerified: true });
  assert.equal(linked.id, created.id);
  assert.equal(db.users.find((u) => u.id === created.id)?.googleSub, "google-xyz");

  // An unverified email never takes over (or duplicates) an existing account.
  assert.throws(() => upsertSocialUser({ provider: "google", sub: "google-other", email: "new.person@example.com", emailVerified: false }), /already exists/);
});
