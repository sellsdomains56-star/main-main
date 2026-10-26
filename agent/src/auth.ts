import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { getKV, setKV } from "./db.js";
import { createVault, isUnlocked, unlock, vaultExists } from "./vault.js";

const COOKIE = "dizz_session";
const SESSION_DAYS = 30;

/**
 * Your password does two jobs: it signs you in, and it unlocks the encryption
 * key for your data (see vault.ts). It is never stored, not even hashed.
 *
 * If AGENT_PASSWORD is set, the app unlocks itself on start (convenient, but
 * then anyone with the .env file can read your data). Without it, you choose a
 * password in the browser on first run and sign in after every restart.
 */
export async function initAuth(): Promise<void> {
  if (!getKV("session_secret")) setKV("session_secret", randomBytes(32).toString("hex"));
  if (!getKV("session_version")) setKV("session_version", "1");
  if (!config.password) return;
  if (!vaultExists()) await createVault(config.password);
  else if (!(await unlock(config.password))) console.warn("[dizz] AGENT_PASSWORD doesn't match your vault; sign in from the browser.");
}

export const checkPassword = (attempt: string) => unlock(attempt);

function secret(): string {
  return config.sessionSecret || getKV("session_secret")!;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueSession(res: Response, secure: boolean): void {
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = `${expires}.${getKV("session_version")}.${randomBytes(8).toString("base64url")}`;
  res.cookie(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure,
    maxAge: SESSION_DAYS * 86_400_000,
    path: "/",
  });
}

export function clearSession(res: Response): void {
  res.clearCookie(COOKIE, { path: "/" });
}

/** Signs out every device by invalidating all existing sessions. */
export function revokeAllSessions(): void {
  setKV("session_version", String(Number(getKV("session_version") ?? "1") + 1));
}

function readCookie(req: Request): string | null {
  const header = req.headers.cookie ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === COOKIE) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function isAuthenticated(req: Request): boolean {
  const token = readCookie(req);
  if (!token) return false;
  const i = token.lastIndexOf(".");
  const payload = token.slice(0, i);
  const sig = Buffer.from(token.slice(i + 1));
  const expected = Buffer.from(sign(payload));
  if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return false;
  const [expires, version] = payload.split(".");
  return Number(expires) > Date.now() && version === getKV("session_version");
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Sign in first" });
    return;
  }
  // Signed in, but the server restarted and the data is still locked.
  if (!isUnlocked()) {
    res.status(423).json({ error: "Locked. Sign in again to unlock your data.", locked: true });
    return;
  }
  next();
}

// ── Login throttling ─────────────────────────────────────────────────────────

const failures = new Map<string, { count: number; until: number }>();
const WINDOW = 15 * 60_000;

export function loginBlocked(ip: string): number {
  const f = failures.get(ip);
  if (!f || f.until < Date.now()) return 0;
  return f.count >= 5 ? Math.ceil((f.until - Date.now()) / 1000) : 0;
}

export function recordLoginFailure(ip: string): void {
  const f = failures.get(ip);
  if (!f || f.until < Date.now()) failures.set(ip, { count: 1, until: Date.now() + WINDOW });
  else f.count++;
}

export function clearLoginFailures(ip: string): void {
  failures.delete(ip);
}
