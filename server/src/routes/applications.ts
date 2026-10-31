import express, { type Express, type Request } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { logActivity } from "../activity.js";
import { agreementText, AGREEMENT_VERSION } from "../agreement.js";
import { adminRole, requireAdminRole, requireAuth } from "../auth.js";
import { getBarber, HttpError, parse, platformFeePercent } from "../common.js";
import { config } from "../config.js";
import { db, newId, PRIVATE_DIR, save } from "../db.js";
import { notify } from "../notify.js";
import type { ApplicationDocKind, ApplicationStatus, Barber, BarberApplication } from "../types.js";

const DOC_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "application/pdf": "pdf" };
const CONTENT_TYPE: Record<string, string> = Object.fromEntries(Object.entries(DOC_TYPES).map(([type, ext]) => [ext, type]));
const KINDS = ["id_front", "id_back", "licence"] as const satisfies readonly ApplicationDocKind[];
const LINK_MINUTES = 15;
/** Sample documents for the demo accounts ship with the code. */
const SAMPLES_DIR = new URL("../../media/samples/", import.meta.url);

const today = () => new Date().toISOString().slice(0, 10);
const inUae = (b: Barber) => b.countryCode === "AE";
const idLabel = (b: Barber) => (inUae(b) ? "Emirates ID" : "passport");

export const applicationOf = (barberId: string) => db.applications.find((a) => a.barberId === barberId);

/** Freelance barbers apply with their ID, licence and the signed agreement; barbers at a barbershop are covered by Always Fresh's contract with the shop. */
export const needsApplication = (b: Barber) => !b.shopId;

export function startApplication(barberId: string): BarberApplication {
  const now = new Date().toISOString();
  const a: BarberApplication = { barberId, status: "draft", docs: {}, createdAt: now, updatedAt: now };
  db.applications.push(a);
  return a;
}

const signLink = (file: string, exp: number) => createHmac("sha256", config.fileUrlSecret).update(`${file}:${exp}`).digest("hex");

/** A link to a private document that works for 15 minutes; ID documents are never served from a public address. */
export function docLink(file: string) {
  const exp = Date.now() + LINK_MINUTES * 60_000;
  return `/private/${file}?exp=${exp}&sig=${signLink(file, exp)}`;
}

/** What's still needed before the application can be sent; empty when it's complete. */
export function missingItems(a: BarberApplication | undefined, b: Barber): string[] {
  const id = idLabel(b);
  const m: string[] = [];
  if (!a?.legalName) m.push("Your full name as on your ID");
  if (!a?.idNumber) m.push(`Your ${id} number`);
  if (!a?.idExpiry) m.push(`Your ${id} expiry date`);
  else if (a.idExpiry < today()) m.push(`Your ${id} has expired: renew it first`);
  if (!a?.docs.id_front) m.push(inUae(b) ? "Photo of the front of your Emirates ID" : "Photo of your passport's photo page");
  if (inUae(b) && !a?.docs.id_back) m.push("Photo of the back of your Emirates ID");
  if (!a?.licenceNumber) m.push("Your licence or permit number");
  if (!a?.licenceAuthority) m.push("Who issued your licence or permit");
  if (!a?.licenceExpiry) m.push("Your licence expiry date");
  else if (a.licenceExpiry < today()) m.push("Your licence has expired: renew it first");
  if (!a?.docs.licence) m.push("Photo or PDF of your licence or permit");
  if (!a?.signature || a.signature.version !== AGREEMENT_VERSION) m.push("Sign the barber agreement");
  return m;
}

/** Freelancers who joined before applications existed have no application; they count as checked outside the app. */
export function applicationStatus(b: Barber): ApplicationStatus | "not_needed" | "none" {
  if (!needsApplication(b)) return "not_needed";
  return applicationOf(b.id)?.status ?? (b.status === "pending" ? "draft" : "none");
}

/** The application as the barber (or, with `team`, the Always Fresh team) sees it, documents as short-lived links. */
export function applicationView(b: Barber, team = false) {
  const a = applicationOf(b.id);
  const status = applicationStatus(b);
  const docs = Object.fromEntries(Object.entries(a?.docs ?? {}).map(([kind, d]) => [kind, { url: docLink(d!.file), contentType: d!.contentType, uploadedAt: d!.uploadedAt }]));
  const sig = a?.signature;
  return {
    required: needsApplication(b),
    status,
    canEdit: status === "draft" || status === "rejected",
    uae: inUae(b),
    idLabel: inUae(b) ? "Emirates ID" : "Passport",
    legalName: a?.legalName ?? "",
    idNumber: a?.idNumber ?? "",
    idExpiry: a?.idExpiry ?? "",
    licenceNumber: a?.licenceNumber ?? "",
    licenceAuthority: a?.licenceAuthority ?? "",
    licenceExpiry: a?.licenceExpiry ?? "",
    docs,
    signature: sig ? { name: sig.name, svg: sig.svg, version: sig.version, signedAt: sig.signedAt, current: sig.version === AGREEMENT_VERSION, ...(team ? { ip: sig.ip ?? null, userAgent: sig.userAgent ?? null } : {}) } : null,
    submittedAt: a?.submittedAt ?? null,
    reviewedAt: a?.reviewedAt ?? null,
    rejectionReason: a?.rejectionReason ?? null,
    ...(team ? { reviewedBy: a?.reviewedBy ?? null } : {}),
    missing: needsApplication(b) ? missingItems(a, b) : [],
    agreement: agreementText(config.companyName, platformFeePercent()),
  };
}

function myBarber(req: Request) {
  const user = req.user!;
  if (user.role !== "barber" || !user.barberId) throw new HttpError(403, "Only barbers can do this.");
  return getBarber(user.barberId);
}

/** The barber's application, while they may still change it. */
function editable(req: Request) {
  const b = myBarber(req);
  if (!needsApplication(b)) throw new HttpError(400, "Barbers at a barbershop don't apply: Always Fresh's contract with your shop covers you.");
  const a = applicationOf(b.id) ?? startApplication(b.id);
  if (a.status === "submitted") throw new HttpError(409, "Your application is with the Always Fresh team. You can change it if they ask you to.");
  if (a.status === "approved") throw new HttpError(409, "Your application is approved. To update a document, contact support.");
  return { a, b };
}

const Day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2027-05-31").refine((s) => !Number.isNaN(Date.parse(s)), "That date doesn't exist");

/** Emirates ID numbers have 15 digits and start with 784; they're shown as 784-YYYY-NNNNNNN-N. */
function idNumberFor(b: Barber, raw: string) {
  if (inUae(b)) {
    const d = raw.replace(/\D/g, "");
    if (d.length !== 15 || !d.startsWith("784")) throw new HttpError(400, "An Emirates ID number has 15 digits and starts with 784.");
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 14)}-${d.slice(14)}`;
  }
  const v = raw.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9]{5,20}$/.test(v)) throw new HttpError(400, "Enter your passport number (letters and numbers only).");
  return v;
}

const teamToTell = () => db.users.filter((u) => ["owner", "operations"].includes(adminRole(u) ?? ""));

export function registerApplicationRoutes(app: Express) {
  // ---------- Private documents (signed links only) ----------
  app.get("/private/:file", (req, res) => {
    const file = String(req.params.file);
    const exp = Number(req.query.exp);
    const sig = String(req.query.sig ?? "");
    const want = /^[\w-]+\.(jpg|png|webp|heic|pdf)$/.test(file) && exp > Date.now() ? signLink(file, exp) : "";
    if (!want || sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) throw new HttpError(403, "This link has expired. Open the document again from the app.");
    const path = existsSync(new URL(file, PRIVATE_DIR)) ? new URL(file, PRIVATE_DIR) : file.startsWith("sample-") ? new URL(file, SAMPLES_DIR) : null;
    if (!path || !existsSync(path)) throw new HttpError(404, "Document not found.");
    res.set({ "content-type": CONTENT_TYPE[file.split(".").pop()!]!, "cache-control": "private, no-store", "content-disposition": "inline" });
    res.send(readFileSync(path));
  });

  // Anyone can read the agreement before joining.
  app.get("/legal/barber-agreement", (_req, res) => {
    res.json(agreementText(config.companyName, platformFeePercent()));
  });

  // ---------- The barber's application ----------
  app.get("/barbers/me/application", requireAuth, (req, res) => {
    res.json(applicationView(myBarber(req)));
  });

  app.patch("/barbers/me/application", requireAuth, (req, res) => {
    const { a, b } = editable(req);
    const body = parse(z.object({
      legalName: z.string().trim().min(3, "Enter your full name as on your ID").max(120).optional(),
      idNumber: z.string().trim().min(1).max(40).optional(),
      idExpiry: Day.optional(),
      licenceNumber: z.string().trim().min(2, "Enter the licence or permit number").max(60).optional(),
      licenceAuthority: z.string().trim().min(2, "Enter who issued it").max(120).optional(),
      licenceExpiry: Day.optional(),
    }), req.body);
    if (body.idNumber !== undefined) body.idNumber = idNumberFor(b, body.idNumber);
    Object.assign(a, body, { updatedAt: new Date().toISOString() });
    save();
    res.json(applicationView(b));
  });

  app.post("/barbers/me/application/documents/:kind", requireAuth, express.raw({ type: Object.keys(DOC_TYPES), limit: "12mb" }), (req, res) => {
    const kind = parse(z.enum(KINDS), req.params.kind);
    const { a, b } = editable(req);
    const type = (req.header("content-type") ?? "").split(";")[0]!;
    const ext = DOC_TYPES[type];
    if (!ext || !Buffer.isBuffer(req.body) || req.body.length < 100) throw new HttpError(400, "Attach a photo (JPEG, PNG, WebP) or a PDF.");
    mkdirSync(PRIVATE_DIR, { recursive: true });
    const file = `${newId()}.${ext}`;
    writeFileSync(new URL(file, PRIVATE_DIR), req.body);
    const old = a.docs[kind];
    if (old && existsSync(new URL(old.file, PRIVATE_DIR))) rmSync(new URL(old.file, PRIVATE_DIR));
    a.docs[kind] = { file, contentType: type, uploadedAt: new Date().toISOString() };
    a.updatedAt = new Date().toISOString();
    save();
    res.status(201).json(applicationView(b));
  });

  app.post("/barbers/me/application/sign", requireAuth, (req, res) => {
    const { a, b } = editable(req);
    const body = parse(z.object({
      name: z.string().trim().min(3, "Type your full name to sign").max(120),
      // The drawn signature as SVG path data (move/line/curve commands only).
      svg: z.string().max(60_000).regex(/^[MLQCZmlqcz0-9.,\s-]+$/, "Draw your signature again").refine((s) => s.length >= 20, "Draw your signature in the box"),
      agree: z.literal(true, { message: "Tick the box to confirm you've read and agree to the agreement." }),
    }), req.body);
    a.signature = { name: body.name, svg: body.svg, version: AGREEMENT_VERSION, signedAt: new Date().toISOString(), ip: req.ip, userAgent: req.header("user-agent")?.slice(0, 300) };
    if (!a.legalName) a.legalName = body.name;
    a.updatedAt = new Date().toISOString();
    save();
    res.json(applicationView(b));
  });

  app.post("/barbers/me/application/submit", requireAuth, (req, res) => {
    const { a, b } = editable(req);
    const missing = missingItems(a, b);
    if (missing.length) throw new HttpError(400, `Still needed: ${missing.join("; ")}.`);
    Object.assign(a, { status: "submitted", submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    delete a.rejectionReason;
    for (const u of teamToTell()) notify(u.id, { kind: "account", title: "New barber application", body: `${a.legalName} (${b.city}) sent their ID, licence and signed agreement for review.` });
    save();
    res.json(applicationView(b));
  });

  // ---------- The team reviews ----------
  app.get("/admin/applications", requireAdminRole("operations", "support"), (req, res) => {
    const f = parse(z.object({ status: z.enum(["submitted", "draft", "rejected", "approved", "all"]).default("all") }), req.query);
    const order: Record<string, number> = { submitted: 0, rejected: 1, draft: 2, approved: 3 };
    const rows = db.barbers
      .filter(needsApplication)
      .map((b) => ({ b, a: applicationOf(b.id), status: applicationStatus(b) }))
      .filter((r) => r.status !== "none" && (f.status === "all" || r.status === f.status))
      .map(({ b, a, status }) => ({
        barberId: b.id, name: b.name, legalName: a?.legalName ?? null, photoUrl: b.photoUrl, city: b.city,
        email: db.users.find((u) => u.barberId === b.id)?.email ?? null,
        status, barberStatus: b.status ?? "live",
        submittedAt: a?.submittedAt ?? null, updatedAt: a?.updatedAt ?? b.joinedAt ?? null,
        missing: missingItems(a, b).length,
        idExpiry: a?.idExpiry ?? null, licenceExpiry: a?.licenceExpiry ?? null,
      }))
      // Oldest submitted first: first come, first served.
      .sort((x, y) => order[x.status]! - order[y.status]! || (x.submittedAt ?? x.updatedAt ?? "").localeCompare(y.submittedAt ?? y.updatedAt ?? ""));
    res.json(rows);
  });

  app.post("/admin/barbers/:id/application/approve", requireAdminRole("operations"), (req, res) => {
    const b = getBarber(String(req.params.id));
    const a = applicationOf(b.id);
    if (!a || a.status !== "submitted") throw new HttpError(409, "There's no submitted application to approve.");
    const missing = missingItems(a, b);
    if (missing.length) throw new HttpError(400, `This application isn't complete: ${missing.join("; ")}.`);
    Object.assign(a, { status: "approved", reviewedAt: new Date().toISOString(), reviewedBy: req.user!.email, updatedAt: new Date().toISOString() });
    b.verified = true;
    const wentLive = b.status === "pending";
    if (wentLive) b.status = "live";
    logActivity(req, "application.approved", b.name);
    const user = db.users.find((u) => u.barberId === b.id);
    if (user) notify(user.id, { kind: "account", title: "You're approved", body: wentLive ? "Your ID, licence and agreement are checked. You're live: clients can find and book you now." : "Your ID, licence and agreement are checked. Your profile now shows the Verified badge." });
    save();
    res.json(applicationView(b, true));
  });

  app.post("/admin/barbers/:id/application/reject", requireAdminRole("operations"), (req, res) => {
    const b = getBarber(String(req.params.id));
    const a = applicationOf(b.id);
    if (!a || a.status !== "submitted") throw new HttpError(409, "There's no submitted application to send back.");
    const { reason } = parse(z.object({ reason: z.string().trim().min(5, "Tell the barber what to fix").max(500) }), req.body);
    Object.assign(a, { status: "rejected", rejectionReason: reason, reviewedAt: new Date().toISOString(), reviewedBy: req.user!.email, updatedAt: new Date().toISOString() });
    logActivity(req, "application.rejected", b.name, reason);
    const user = db.users.find((u) => u.barberId === b.id);
    if (user) notify(user.id, { kind: "account", title: "Your application needs a change", body: `${reason} Open Dashboard → Your application to fix it and send it again.` });
    save();
    res.json(applicationView(b, true));
  });
}

/** Account deleted: the ID documents and the application go with it. */
export function deleteApplication(barberId: string) {
  const a = applicationOf(barberId);
  if (!a) return;
  for (const d of Object.values(a.docs)) if (d && existsSync(new URL(d.file, PRIVATE_DIR))) rmSync(new URL(d.file, PRIVATE_DIR));
  db.applications = db.applications.filter((x) => x !== a);
}
