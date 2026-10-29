import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const isProd = process.env.NODE_ENV === "production";
function secretKey() { // checked on use (not import) so `next build` works without runtime secrets
  if (isProd && !process.env.SESSION_SECRET) throw new Error("SESSION_SECRET must be set in production");
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-only-secret-change-me-please-32chars");
}

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@mwah.ae").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? (isProd ? undefined : "mwah-admin");

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}
export function checkPassword(pw: string, stored?: string) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  const a = Buffer.from(hash, "hex"), b = scryptSync(pw, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}
export const randomPassword = () => randomBytes(6).toString("base64url");

type Role = "admin" | "influencer";
async function sign(role: Role, sub: string) {
  return new SignJWT({ role }).setSubject(sub).setProtectedHeader({ alg: "HS256" }).setExpirationTime("14d").sign(secretKey());
}
async function read(role: Role) {
  const token = (await cookies()).get(`mwah_${role}`)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === role ? (payload.sub as string) : null;
  } catch { return null; }
}
async function setCookie(role: Role, sub: string) {
  (await cookies()).set(`mwah_${role}`, await sign(role, sub), {
    httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: 60 * 60 * 24 * 14,
  });
}

export async function loginAdmin(email: string, password: string) {
  if (!ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD is not set. Add it to your environment variables.");
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) return false;
  const a = Buffer.from(password), b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  await setCookie("admin", ADMIN_EMAIL);
  return true;
}
export const isAdmin = async () => Boolean(await read("admin"));
export async function requireAdmin() { if (!(await isAdmin())) redirect("/admin/login"); }

export const loginInfluencer = (id: string) => setCookie("influencer", id);
export const influencerId = () => read("influencer");
export async function logout(role: Role) { (await cookies()).delete(`mwah_${role}`); }
