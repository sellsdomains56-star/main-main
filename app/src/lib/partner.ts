import { storage } from "./storage";
import type { PartnerWelcome } from "./types";

const KEY = "af_partner";
const DAYS = 14; // a hotel stay or a company link counts for two weeks

/** Remember the hotel or company someone arrived through, for their next bookings. */
export const rememberPartner = (p: PartnerWelcome) => storage.set(KEY, JSON.stringify({ ...p, at: Date.now() })).catch(() => {});

/** The partner still in effect, if any. */
export async function currentPartner(): Promise<PartnerWelcome | null> {
  try {
    const raw = await storage.get(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PartnerWelcome & { at: number };
    return Date.now() - p.at < DAYS * 86_400_000 ? p : null;
  } catch {
    return null;
  }
}
