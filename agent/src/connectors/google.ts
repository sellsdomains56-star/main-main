import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { defineTool, type AgentTool, type ToolOutcome } from "../agent/tools.js";
import { config } from "../config.js";
import { getSecretKV } from "../db.js";
import { registerGenerated, safeName, WORKSPACE_DIR, formatSize } from "../files.js";
import { formatWhen } from "../tools/schedule.js";
import { createConnector, findConnector, rememberAuth, saveConnector, type Connector, type ConnectorKind, type PendingAuth } from "./store.js";

/**
 * Gmail, Google Calendar and Google Drive, through your own Google Cloud OAuth
 * client. Each service is its own connector with its own consent, so you only
 * grant what you use. Tokens are kept in the encrypted store.
 */

export type GoogleKind = Extract<ConnectorKind, "gmail" | "google_calendar" | "google_drive">;

export const GOOGLE_SERVICES: Record<GoogleKind, { name: string; scopes: string[]; description: string }> = {
  gmail: {
    name: "Gmail",
    scopes: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.compose"],
    description: "Search and read your email, save attachments, and draft or send replies.",
  },
  google_calendar: {
    name: "Google Calendar",
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
    description: "See your schedule and add or remove events.",
  },
  google_drive: {
    name: "Google Drive",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    description: "Find and read your Docs, Sheets, Slides and files.",
  },
};

export function isGoogleKind(kind: string): kind is GoogleKind {
  return kind in GOOGLE_SERVICES;
}

/** Points Google's hosts at a local stand-in during tests. */
const g = (url: string) => (config.googleApiOrigin ? url.replace(/^https:\/\/([^/]+)/, `${config.googleApiOrigin}/$1`) : url);

export function googleClient(): { clientId: string; clientSecret: string } | null {
  if (config.googleClientId && config.googleClientSecret) return { clientId: config.googleClientId, clientSecret: config.googleClientSecret };
  const saved = getSecretKV("google_oauth");
  if (!saved) return null;
  const parsed = JSON.parse(saved) as { clientId: string; clientSecret: string };
  return parsed.clientId && parsed.clientSecret ? parsed : null;
}

// ── Sign-in ───────────────────────────────────────────────────────────────────

/** Starts "Connect Gmail" (etc.): returns Google's consent page URL. */
export function startGoogleAuth(kind: GoogleKind, redirectUrl: string): string {
  const client = googleClient();
  if (!client) throw new Error("Add your Google OAuth client first (Connectors → Google setup).");
  const connector =
    findConnector(kind) ?? createConnector({ kind, name: GOOGLE_SERVICES[kind].name, enabled: true, status: "needs_auth" });
  const state = randomBytes(24).toString("base64url");
  const codeVerifier = randomBytes(48).toString("base64url");
  rememberAuth(state, { connectorId: connector.id, kind, codeVerifier, redirectUrl });
  const params = new URLSearchParams({
    client_id: client.clientId,
    redirect_uri: redirectUrl,
    response_type: "code",
    scope: ["openid", "email", ...GOOGLE_SERVICES[kind].scopes].join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
    code_challenge: createHash("sha256").update(codeVerifier).digest("base64url"),
    code_challenge_method: "S256",
  });
  return `${g("https://accounts.google.com/o/oauth2/v2/auth")}?${params}`;
}

async function tokenRequest(body: Record<string, string>) {
  const client = googleClient();
  if (!client) throw new Error("Google sign-in isn't set up");
  const res = await fetch(g("https://oauth2.googleapis.com/token"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: client.clientId, client_secret: client.clientSecret, ...body }),
    signal: AbortSignal.timeout(20_000),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, string | number>;
  if (!res.ok) throw Object.assign(new Error(String(json.error_description ?? json.error ?? `Google said ${res.status}`)), { code: json.error });
  return json;
}

/** Finishes sign-in after Google redirects back with a code. */
export async function finishGoogleAuth(auth: PendingAuth, code: string, connector: Connector): Promise<Connector> {
  const t = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: auth.redirectUrl, code_verifier: auth.codeVerifier! });
  const accessToken = String(t.access_token);
  const info = (await (
    await fetch(g("https://openidconnect.googleapis.com/v1/userinfo"), { headers: { Authorization: `Bearer ${accessToken}` } })
  ).json()) as { email?: string };
  return saveConnector({
    ...connector,
    status: "connected",
    error: undefined,
    account: info.email,
    google: {
      accessToken,
      refreshToken: String(t.refresh_token ?? connector.google?.refreshToken ?? ""),
      expiresAt: Date.now() + Number(t.expires_in ?? 3600) * 1000,
      scope: String(t.scope ?? ""),
    },
  });
}

async function accessToken(c: Connector, force = false): Promise<string> {
  if (!c.google) throw new Error(`${c.name} isn't connected`);
  if (!force && c.google.expiresAt > Date.now() + 60_000) return c.google.accessToken;
  try {
    const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: c.google.refreshToken });
    c.google = { ...c.google, accessToken: String(t.access_token), expiresAt: Date.now() + Number(t.expires_in ?? 3600) * 1000 };
    saveConnector(c);
    return c.google.accessToken;
  } catch (err) {
    if ((err as { code?: string }).code === "invalid_grant") {
      saveConnector({ ...c, status: "needs_auth", error: "Google signed this connection out. Reconnect it." });
      throw new Error(`${c.name} needs reconnecting (Connectors → ${c.name} → Connect).`);
    }
    throw err;
  }
}

async function gapi<T>(c: Connector, url: string, init: RequestInit = {}, signal?: AbortSignal): Promise<T> {
  const call = async (token: string) =>
    fetch(g(url), {
      ...init,
      signal: signal ?? AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${token}`, ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  let res = await call(await accessToken(c));
  if (res.status === 401) res = await call(await accessToken(c, true));
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? `Google returned ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const type = res.headers.get("content-type") ?? "";
  return (type.includes("json") ? await res.json() : await res.text()) as T;
}

function connected(kind: GoogleKind): Connector {
  const c = findConnector(kind);
  if (!c || c.status !== "connected" || !c.google) throw new Error(`${GOOGLE_SERVICES[kind].name} isn't connected. The user can connect it under Connectors.`);
  return c;
}

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max)}\n\n[… ${s.length - max} more characters]` : s);

export function htmlToText(html: string): string {
  return html
    .replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Gmail ─────────────────────────────────────────────────────────────────────

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";

interface GmailPart {
  mimeType?: string;
  filename?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string; size?: number; attachmentId?: string };
  parts?: GmailPart[];
}
interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: GmailPart;
}

const header = (m: GmailMessage, name: string) => m.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

function walk(part: GmailPart | undefined, visit: (p: GmailPart) => void) {
  if (!part) return;
  visit(part);
  for (const p of part.parts ?? []) walk(p, visit);
}

function bodyText(m: GmailMessage): string {
  let plain = "";
  let html = "";
  walk(m.payload, (p) => {
    if (!p.body?.data || p.filename) return;
    const text = Buffer.from(p.body.data, "base64url").toString("utf8");
    if (p.mimeType === "text/plain" && !plain) plain = text;
    if (p.mimeType === "text/html" && !html) html = text;
  });
  return plain || (html ? htmlToText(html) : m.snippet ?? "");
}

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
const encodeHeader = (v: string) => (/^[\x20-\x7e]*$/.test(v) ? v : `=?UTF-8?B?${Buffer.from(v).toString("base64")}?=`);

function buildEmail(fields: { to: string; cc?: string; bcc?: string; subject: string; body: string; inReplyTo?: string; references?: string }): string {
  const headers = [
    `To: ${oneLine(fields.to)}`,
    fields.cc ? `Cc: ${oneLine(fields.cc)}` : null,
    fields.bcc ? `Bcc: ${oneLine(fields.bcc)}` : null,
    `Subject: ${encodeHeader(oneLine(fields.subject))}`,
    fields.inReplyTo ? `In-Reply-To: ${oneLine(fields.inReplyTo)}` : null,
    fields.references ? `References: ${oneLine(fields.references)}` : null,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ].filter((h): h is string => h !== null);
  const body = Buffer.from(fields.body, "utf8").toString("base64").replace(/.{76}/g, "$&\r\n");
  return Buffer.from(`${headers.join("\r\n")}\r\n\r\n${body}`).toString("base64url");
}

/** Sends a draft (used by the Send button on the approval card). */
export async function sendGmailDraft(c: Connector, draftId: string): Promise<void> {
  await gapi(c, `${GMAIL}/drafts/send`, { method: "POST", body: JSON.stringify({ id: draftId }) });
}

export async function discardGmailDraft(c: Connector, draftId: string): Promise<void> {
  await gapi(c, `${GMAIL}/drafts/${encodeURIComponent(draftId)}`, { method: "DELETE" });
}

const gmailSearch = defineTool({
  name: "gmail_search",
  description:
    "Search the user's Gmail with Gmail's search syntax, newest first, e.g. \"is:unread\", \"from:amazon newer_than:7d\", " +
    "\"subject:invoice has:attachment\", \"in:sent to:sarah\". Returns sender, subject, date, a snippet and the message id.",
  schema: z.object({
    query: z.string().default("").describe("Gmail search query; empty for the latest messages"),
    max_results: z.number().int().min(1).max(50).default(10),
  }),
  label: (i) => (i.query ? `Searched Gmail for “${i.query}”` : "Checked Gmail"),
  async run({ query, max_results }, ctx) {
    const c = connected("gmail");
    const list = await gapi<{ messages?: { id: string }[] }>(c, `${GMAIL}/messages?${new URLSearchParams({ q: query, maxResults: String(max_results) })}`, {}, ctx.signal);
    const ids = list.messages ?? [];
    if (!ids.length) return { ok: true, content: "No emails match.", result: "No matches" };
    const meta = "format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date";
    const messages = await Promise.all(ids.map((m) => gapi<GmailMessage>(c, `${GMAIL}/messages/${m.id}?${meta}`, {}, ctx.signal)));
    const lines = messages.map(
      (m) =>
        `- id ${m.id}${m.labelIds?.includes("UNREAD") ? " [unread]" : ""} · ${header(m, "Date")}\n  From: ${header(m, "From")}\n  Subject: ${header(m, "Subject") || "(no subject)"}\n  ${m.snippet ?? ""}`,
    );
    return { ok: true, content: lines.join("\n"), result: `${messages.length} email${messages.length === 1 ? "" : "s"}` };
  },
});

const gmailRead = defineTool({
  name: "gmail_read",
  description: "Read one email in full (headers, text and a list of attachments) by its id from gmail_search.",
  schema: z.object({ message_id: z.string() }),
  label: () => "Read an email",
  async run({ message_id }, ctx) {
    const c = connected("gmail");
    const m = await gapi<GmailMessage>(c, `${GMAIL}/messages/${encodeURIComponent(message_id)}?format=full`, {}, ctx.signal);
    const attachments: string[] = [];
    walk(m.payload, (p) => {
      if (p.filename && p.body?.attachmentId) attachments.push(`- ${p.filename} (${p.mimeType}, ${formatSize(p.body.size ?? 0)}) attachment_id ${p.body.attachmentId}`);
    });
    const content = [
      `From: ${header(m, "From")}`,
      `To: ${header(m, "To")}`,
      header(m, "Cc") ? `Cc: ${header(m, "Cc")}` : "",
      `Date: ${header(m, "Date")}`,
      `Subject: ${header(m, "Subject")}`,
      `Message id: ${m.id} · Thread id: ${m.threadId}`,
      "",
      clip(bodyText(m), 30_000),
      attachments.length ? `\nAttachments (save with gmail_save_attachment):\n${attachments.join("\n")}` : "",
    ]
      .filter((l) => l !== "")
      .join("\n");
    return { ok: true, content, result: oneLine(header(m, "Subject")).slice(0, 80) || "(no subject)" };
  },
});

const gmailAttachment = defineTool({
  name: "gmail_save_attachment",
  description: "Save an email attachment into the workspace so you can read or analyse it (e.g. with read_file or run_code).",
  schema: z.object({ message_id: z.string(), attachment_id: z.string(), filename: z.string() }),
  label: (i) => `Saved ${i.filename ?? "an attachment"}`,
  async run({ message_id, attachment_id, filename }, ctx) {
    const c = connected("gmail");
    const a = await gapi<{ data: string }>(c, `${GMAIL}/messages/${encodeURIComponent(message_id)}/attachments/${encodeURIComponent(attachment_id)}`, {}, ctx.signal);
    const dir = path.join(WORKSPACE_DIR, "email-attachments");
    fs.mkdirSync(dir, { recursive: true });
    const rel = `email-attachments/${safeName(filename)}`;
    fs.writeFileSync(path.join(WORKSPACE_DIR, rel), Buffer.from(a.data, "base64url"));
    const file = registerGenerated(rel, ctx.conversationId);
    return { ok: true, content: `Saved as ${rel} (${formatSize(file.size)}).`, result: formatSize(file.size), files: [file] };
  },
});

const gmailSend = defineTool({
  name: "gmail_send_email",
  description:
    "Write an email from the user's Gmail: a new message, or a reply (give reply_to_message_id to keep it in the thread). " +
    "Unless the user turned on automatic sending, it is saved as a draft and the user sends it with one click in the app; " +
    "tell them it's ready to review. Write it in the user's voice and sign it with their name if you know it.",
  schema: z.object({
    to: z.string().min(3).describe("Recipient address(es), comma separated"),
    subject: z.string().max(300),
    body: z.string().min(1).describe("Plain-text body"),
    cc: z.string().optional(),
    bcc: z.string().optional(),
    reply_to_message_id: z.string().optional().describe("The id of the email being replied to"),
  }),
  label: (i) => (i.reply_to_message_id ? "Drafted a reply" : "Drafted an email"),
  detail: (i) => [`To: ${i.to ?? ""}`, `Subject: ${i.subject ?? ""}`, "", i.body ?? ""].join("\n"),
  async run({ to, subject, body, cc, bcc, reply_to_message_id }, ctx): Promise<ToolOutcome> {
    const c = connected("gmail");
    let threadId: string | undefined;
    let inReplyTo: string | undefined;
    let references: string | undefined;
    if (reply_to_message_id) {
      const meta = "format=metadata&metadataHeaders=Message-ID&metadataHeaders=References";
      const original = await gapi<GmailMessage>(c, `${GMAIL}/messages/${encodeURIComponent(reply_to_message_id)}?${meta}`, {}, ctx.signal);
      threadId = original.threadId;
      inReplyTo = header(original, "Message-ID") || undefined;
      references = [header(original, "References"), inReplyTo].filter(Boolean).join(" ") || undefined;
    }
    const raw = buildEmail({ to, cc, bcc, subject, body, inReplyTo, references });
    const draft = await gapi<{ id: string }>(c, `${GMAIL}/drafts`, { method: "POST", body: JSON.stringify({ message: { raw, threadId } }) }, ctx.signal);
    if (c.autoSend) {
      await sendGmailDraft(c, draft.id);
      return { ok: true, content: `Sent to ${to}.`, result: `Sent to ${to}` };
    }
    return {
      ok: true,
      content: `Saved as a draft for the user to review. A card with a Send button is shown in the chat; it is NOT sent yet.`,
      result: "Waiting for you to send",
      approval: { kind: "email", connectorId: c.id, draftId: draft.id, to, subject, preview: body.slice(0, 600) },
    };
  },
});

// ── Calendar ──────────────────────────────────────────────────────────────────

const CAL = "https://www.googleapis.com/calendar/v3/calendars";

interface CalEvent {
  id: string;
  summary?: string;
  location?: string;
  description?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: { email: string; responseStatus?: string }[];
}

const when = (t?: { dateTime?: string; date?: string }) =>
  t?.dateTime ? formatWhen(Date.parse(t.dateTime), config.timezone) : t?.date ? `${t.date} (all day)` : "?";

const calendarList = defineTool({
  name: "calendar_list_events",
  description: "List events from the user's Google Calendar in a time range (defaults to the next 7 days). Optionally filter by text.",
  schema: z.object({
    time_min: z.string().optional().describe("ISO 8601 start, with offset"),
    time_max: z.string().optional().describe("ISO 8601 end, with offset"),
    query: z.string().optional(),
    max_results: z.number().int().min(1).max(100).default(25),
  }),
  label: (i) => (i.query ? `Searched your calendar for “${i.query}”` : "Checked your calendar"),
  async run({ time_min, time_max, query, max_results }, ctx) {
    const c = connected("google_calendar");
    const start = time_min ? new Date(time_min) : new Date();
    const end = time_max ? new Date(time_max) : new Date(start.getTime() + 7 * 86_400_000);
    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      maxResults: String(max_results),
      timeZone: config.timezone,
    });
    if (query) params.set("q", query);
    const data = await gapi<{ items?: CalEvent[] }>(c, `${CAL}/primary/events?${params}`, {}, ctx.signal);
    const items = data.items ?? [];
    if (!items.length) return { ok: true, content: "No events in that range.", result: "Nothing scheduled" };
    const lines = items.map(
      (e) =>
        `- ${when(e.start)} → ${when(e.end)}: ${e.summary ?? "(no title)"}${e.location ? ` @ ${e.location}` : ""} (id ${e.id})` +
        (e.attendees?.length ? `\n  with ${e.attendees.map((a) => a.email).join(", ")}` : ""),
    );
    return { ok: true, content: lines.join("\n"), result: `${items.length} event${items.length === 1 ? "" : "s"}` };
  },
});

const calendarCreate = defineTool({
  name: "calendar_create_event",
  description:
    "Add an event to the user's Google Calendar. Use ISO 8601 times with the offset from your context, or dates (YYYY-MM-DD) " +
    "for all-day events. Guests are added without emailing them unless notify_guests is true.",
  schema: z.object({
    title: z.string().min(1),
    start: z.string(),
    end: z.string(),
    location: z.string().optional(),
    description: z.string().optional(),
    guests: z.array(z.string()).optional().describe("Email addresses"),
    notify_guests: z.boolean().default(false),
  }),
  label: (i) => `Added “${i.title ?? "an event"}” to your calendar`,
  detail: (i) => [i.start, i.end, i.location].filter(Boolean).join(" · "),
  async run({ title, start, end, location, description, guests, notify_guests }, ctx) {
    const c = connected("google_calendar");
    const allDay = /^\d{4}-\d{2}-\d{2}$/.test(start);
    const time = (v: string) => (allDay ? { date: v } : { dateTime: new Date(v).toISOString(), timeZone: config.timezone });
    const event = await gapi<CalEvent>(
      c,
      `${CAL}/primary/events?sendUpdates=${notify_guests ? "all" : "none"}`,
      {
        method: "POST",
        body: JSON.stringify({
          summary: title,
          location,
          description,
          start: time(start),
          end: time(end),
          attendees: guests?.map((email) => ({ email })),
        }),
      },
      ctx.signal,
    );
    return { ok: true, content: `Created "${title}" (${when(event.start)}). Link: ${event.htmlLink ?? "n/a"} (id ${event.id})`, result: when(event.start) };
  },
});

const calendarDelete = defineTool({
  name: "calendar_delete_event",
  description: "Delete an event from the user's Google Calendar by id. Only when the user clearly asks to cancel or remove it.",
  schema: z.object({ event_id: z.string() }),
  label: () => "Removed a calendar event",
  async run({ event_id }, ctx) {
    const c = connected("google_calendar");
    await gapi(c, `${CAL}/primary/events/${encodeURIComponent(event_id)}?sendUpdates=none`, { method: "DELETE" }, ctx.signal);
    return { ok: true, content: "Deleted.", result: "Deleted" };
  },
});

// ── Drive ─────────────────────────────────────────────────────────────────────

const DRIVE = "https://www.googleapis.com/drive/v3/files";
const EXPORTS: Record<string, string> = {
  "application/vnd.google-apps.document": "text/plain",
  "application/vnd.google-apps.spreadsheet": "text/csv",
  "application/vnd.google-apps.presentation": "text/plain",
};

const driveSearch = defineTool({
  name: "drive_search",
  description: "Search the user's Google Drive by file name and content. Returns names, types, dates, links and ids.",
  schema: z.object({ query: z.string().min(1), max_results: z.number().int().min(1).max(50).default(15) }),
  label: (i) => `Searched Drive for “${i.query ?? ""}”`,
  async run({ query, max_results }, ctx) {
    const c = connected("google_drive");
    const safe = query.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const params = new URLSearchParams({
      q: `(name contains '${safe}' or fullText contains '${safe}') and trashed = false`,
      pageSize: String(max_results),
      orderBy: "modifiedTime desc",
      fields: "files(id,name,mimeType,modifiedTime,size,webViewLink)",
    });
    const data = await gapi<{ files?: { id: string; name: string; mimeType: string; modifiedTime: string; size?: string; webViewLink?: string }[] }>(
      c,
      `${DRIVE}?${params}`,
      {},
      ctx.signal,
    );
    const files = data.files ?? [];
    if (!files.length) return { ok: true, content: "No files match.", result: "No matches" };
    const lines = files.map((f) => `- ${f.name} (${f.mimeType.replace("application/vnd.google-apps.", "google ")}, modified ${f.modifiedTime.slice(0, 10)}) id ${f.id}${f.webViewLink ? ` ${f.webViewLink}` : ""}`);
    return { ok: true, content: lines.join("\n"), result: `${files.length} file${files.length === 1 ? "" : "s"}` };
  },
});

const driveRead = defineTool({
  name: "drive_read",
  description: "Read a Google Drive file by id: Docs and Slides as text, Sheets as CSV. Other files (PDFs, images, Office) are saved to the workspace.",
  schema: z.object({ file_id: z.string() }),
  label: () => "Read a Drive file",
  async run({ file_id }, ctx): Promise<ToolOutcome> {
    const c = connected("google_drive");
    const id = encodeURIComponent(file_id);
    const meta = await gapi<{ name: string; mimeType: string; size?: string }>(c, `${DRIVE}/${id}?fields=name,mimeType,size`, {}, ctx.signal);
    const exportAs = EXPORTS[meta.mimeType];
    if (exportAs) {
      const text = await gapi<string>(c, `${DRIVE}/${id}/export?mimeType=${encodeURIComponent(exportAs)}`, {}, ctx.signal);
      return { ok: true, content: `${meta.name}\n\n${clip(String(text), 60_000)}`, result: meta.name };
    }
    if (meta.mimeType.startsWith("application/vnd.google-apps.")) return { ok: false, content: `${meta.name} (${meta.mimeType}) can't be read as a file.` };
    if (Number(meta.size ?? 0) > 25 * 1024 * 1024) return { ok: false, content: `${meta.name} is larger than 25 MB.` };
    const token = await accessToken(c);
    const res = await fetch(g(`${DRIVE}/${id}?alt=media`), { headers: { Authorization: `Bearer ${token}` }, signal: ctx.signal });
    if (!res.ok) throw new Error(`Drive returned ${res.status}`);
    const data = Buffer.from(await res.arrayBuffer());
    if (/^text\/|json|csv|xml/.test(meta.mimeType) && !data.subarray(0, 4000).includes(0)) {
      return { ok: true, content: `${meta.name}\n\n${clip(data.toString("utf8"), 60_000)}`, result: meta.name };
    }
    fs.mkdirSync(path.join(WORKSPACE_DIR, "drive"), { recursive: true });
    const rel = `drive/${safeName(meta.name)}`;
    fs.writeFileSync(path.join(WORKSPACE_DIR, rel), data);
    const file = registerGenerated(rel, ctx.conversationId);
    return { ok: true, content: `Saved ${meta.name} to the workspace as ${rel}; open it with read_file or run_code.`, result: meta.name, files: [file] };
  },
});

/** The tools for each Google service that's connected and turned on. */
export function googleTools(): AgentTool[] {
  const on = (kind: GoogleKind) => {
    const c = findConnector(kind);
    return !!c && c.enabled && c.status === "connected";
  };
  return [
    ...(on("gmail") ? [gmailSearch, gmailRead, gmailAttachment, gmailSend] : []),
    ...(on("google_calendar") ? [calendarList, calendarCreate, calendarDelete] : []),
    ...(on("google_drive") ? [driveSearch, driveRead] : []),
  ];
}
