import type { Request } from "express";
import { db, newId } from "./db.js";

const KEEP = 2000;

/** Records what a team member did in the admin panel (who, what, to what). Saved with the next save(). */
export function logActivity(req: Request, action: string, target: string, detail?: string) {
  const u = req.user!;
  db.activity.push({ id: newId(), at: new Date().toISOString(), by: { id: u.id, name: u.name, email: u.email }, action, target, ...(detail ? { detail } : {}) });
  if (db.activity.length > KEEP) db.activity.splice(0, db.activity.length - KEEP);
}
