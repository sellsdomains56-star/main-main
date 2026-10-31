import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { db, save } from "./db.js";
import type { AdminRole, User } from "./types.js";

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

/**
 * The team and what each person may do. ADMIN_EMAILS (and the sample admin when DEMO_ACCOUNTS is on) are owners;
 * owners add more people with a role in the admin panel (Settings → Team).
 */
export function adminRole(user: User | undefined): AdminRole | null {
  if (!user || user.deletedAt) return null;
  const email = user.email.toLowerCase();
  if (config.adminEmails.includes(email) || (config.demoAccounts && email === DEMO_ADMIN_EMAIL)) return "owner";
  return db.settings.team?.[email] ?? null;
}
export const isAdmin = (user: User | undefined) => adminRole(user) !== null;
export const DEMO_ADMIN_EMAIL = "admin@demo.alwaysfresh.app";

export function publicUser(user: User) {
  const { passwordHash: _omit, pushTokens: _tokens, appleSub: _apple, googleSub: _google, ...rest } = user;
  const role = adminRole(user);
  return { ...rest, ...(role ? { admin: true, adminRole: role } : {}) };
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
      res.status(403).json({ error: "Only the Always Fresh team can do this." });
      return;
    }
    next();
  });
}

/** Team members whose role is one of `roles` (owners always pass). */
export const requireAdminRole = (...roles: AdminRole[]) => (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    const role = adminRole(req.user);
    if (!role) {
      res.status(403).json({ error: "Only the Always Fresh team can do this." });
      return;
    }
    if (role !== "owner" && !roles.includes(role)) {
      res.status(403).json({ error: "Your team role doesn't include this. Ask an owner." });
      return;
    }
    next();
  });
};

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
