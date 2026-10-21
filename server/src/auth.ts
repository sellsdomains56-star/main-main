import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { db, save } from "./db.js";
import type { User } from "./types.js";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

export function createSession(userId: string): string {
  const token = randomBytes(32).toString("hex");
  db.sessions[token] = userId;
  save();
  return token;
}

/** The team: emails listed in ADMIN_EMAILS (and the sample admin when DEMO_ACCOUNTS is on). */
export const isAdmin = (user: User | undefined) => !!user && (config.adminEmails.includes(user.email.toLowerCase()) || (config.demoAccounts && user.email === DEMO_ADMIN_EMAIL));
export const DEMO_ADMIN_EMAIL = "admin@demo.jbalwaysfresh.com";

export function publicUser(user: User) {
  const { passwordHash: _omit, pushTokens: _tokens, appleSub: _apple, googleSub: _google, ...rest } = user;
  return { ...rest, ...(isAdmin(user) ? { admin: true } : {}) };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/** Attaches req.user when a valid token is sent, but never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const userId = token ? db.sessions[token] : undefined;
  req.user = userId ? db.users.find((u) => u.id === userId) : undefined;
  next();
}

/** Admin panel routes: signed in and on the team. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!isAdmin(req.user)) {
      res.status(403).json({ error: "Only the JB Always Fresh team can do this." });
      return;
    }
    next();
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const userId = token ? db.sessions[token] : undefined;
  const user = userId ? db.users.find((u) => u.id === userId) : undefined;
  if (!user) {
    res.status(401).json({ error: "Please sign in." });
    return;
  }
  req.user = user;
  next();
}
