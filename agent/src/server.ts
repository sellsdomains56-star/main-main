import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { regenerate, sendMessage } from "./agent/chat.js";
import { publicMessage } from "./agent/run.js";
import {
  checkPassword,
  clearLoginFailures,
  clearSession,
  isAuthenticated,
  issueSession,
  loginBlocked,
  recordLoginFailure,
  requireAuth,
  revokeAllSessions,
} from "./auth.js";
import { availableModels, config } from "./config.js";
import {
  addMemory,
  cancelReminder,
  countAgents,
  createAgent,
  createConversation,
  deleteAgent,
  deleteConversation,
  deleteMemory,
  findAgent,
  getAgent,
  getConversation,
  getFile,
  getSettings,
  listAgents,
  listConversations,
  listFiles,
  listMemories,
  listMessages,
  listReminders,
  markFileDeleted,
  saveSettings,
  setSecretKV,
  updateAgent,
  updateConversation,
  type AgentInput,
} from "./db.js";
import { GALLERY } from "./connectors/gallery.js";
import { discardGmailDraft, finishGoogleAuth, GOOGLE_SERVICES, googleClient, isGoogleKind, sendGmailDraft, startGoogleAuth } from "./connectors/google.js";
import { addMcpConnector, closeMcp, connectMcp, finishMcpAuth } from "./connectors/mcp.js";
import { getConnector, listConnectors, publicConnector, removeConnector, takeAuth, updateConnector } from "./connectors/store.js";
import { onAppEvent } from "./events.js";
import { mimeFor, readFileBytes, saveUpload, WORKSPACE_DIR } from "./files.js";
import { getRun, isRunning, runningConversations, stopRun, type ActiveRun } from "./runs.js";
import { EFFORT_LEVELS, TOOL_GROUPS, type AgentEvent } from "./types.js";
import { reportError } from "./monitoring.js";
import { spendingReport } from "./spending.js";
import { indexMemory } from "./memory.js";
import { changePassword, createVault, isUnlocked, lock, VaultLockedError, vaultExists } from "./vault.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(here, "../web");
const production = process.env.NODE_ENV === "production";

// ── Front end bundle (built in memory with esbuild; rebuilt per request in development) ──

let bundle: Promise<Map<string, { body: Uint8Array; type: string }>> | null = null;
async function buildBundle() {
  const result = await esbuild.build({
    entryPoints: [path.join(WEB_DIR, "app.ts")],
    bundle: true,
    format: "esm",
    target: "es2022",
    minify: production,
    sourcemap: production ? false : "inline",
    write: false,
    outdir: "/bundle",
    loader: { ".css": "css" },
    logLevel: "silent",
  });
  const out = new Map<string, { body: Uint8Array; type: string }>();
  for (const f of result.outputFiles) {
    const name = path.basename(f.path);
    out.set(name, { body: f.contents, type: name.endsWith(".css") ? "text/css" : "text/javascript" });
  }
  return out;
}
function getBundle() {
  if (!bundle || !production) bundle = buildBundle();
  return bundle;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const asyncRoute =
  (fn: (req: Request, res: Response) => Promise<unknown> | unknown) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function parse<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, z.prettifyError(result.error));
  return result.data;
}

const param = (req: Request, name: string) => String(req.params[name]);

function openSse(res: Response): (data: unknown) => void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  const ping = setInterval(() => res.write(": ping\n\n"), 20_000);
  res.on("close", () => clearInterval(ping));
  return (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/** Streams a run to the browser. Closing the tab doesn't stop the run. */
function streamRun(res: Response, run: ActiveRun) {
  const send = openSse(res);
  const unsubscribe = run.subscribe(
    (event: AgentEvent) => send(event),
    () => res.end(),
  );
  res.on("close", unsubscribe);
}

function requireConversation(id: string) {
  const conversation = getConversation(id);
  if (!conversation) throw new HttpError(404, "Conversation not found");
  return conversation;
}

const effort = z.enum(EFFORT_LEVELS);
const agentBody = z.object({
  name: z.string().trim().min(1).max(60),
  emoji: z.string().trim().max(8).optional(),
  description: z.string().max(300).optional(),
  instructions: z.string().max(20_000).optional(),
  model: z.string().nullable().optional(),
  effort: effort.nullable().optional(),
  tools: z.array(z.enum(TOOL_GROUPS)).nullable().optional(),
});
function toAgentInput(body: z.infer<typeof agentBody>): AgentInput {
  return {
    name: body.name,
    emoji: body.emoji || "🤖",
    description: body.description ?? "",
    instructions: body.instructions ?? "",
    model: body.model && availableModels().some((m) => m.id === body.model) ? body.model : null,
    effort: body.effort ?? null,
    tools: body.tools?.length ? body.tools : null,
  };
}

// ── App ───────────────────────────────────────────────────────────────────────

export function createApp() {
  const app = express();
  if (config.trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use((_req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; " +
        "connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });

  // Every state-changing API call must carry this header. Browsers won't add it cross-site, which (with the
  // SameSite=Strict cookie) blocks request forgery.
  app.use("/api", (req, res, next) => {
    if (req.method !== "GET" && req.get("x-requested-with") !== "agent") {
      res.status(403).json({ error: "Missing X-Requested-With header" });
      return;
    }
    next();
  });

  // ── Session ──
  // For uptime checks and container health checks; says nothing about you.
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/session", (req, res) => {
    res.json({
      authenticated: isAuthenticated(req) && isUnlocked(),
      setupRequired: !vaultExists(),
      locked: vaultExists() && !isUnlocked(),
      agentName: config.agentName,
    });
  });

  // First run: you choose the password that signs you in and encrypts your data.
  app.post("/api/setup", express.json(), asyncRoute(async (req, res) => {
    if (vaultExists()) throw new HttpError(409, `${config.agentName} is already set up`);
    const { password } = parse(z.object({ password: z.string().min(8, "Use at least 8 characters").max(500) }), req.body);
    await createVault(password);
    issueSession(res, req.secure);
    res.json({ ok: true });
  }));

  app.post("/api/login", express.json(), asyncRoute(async (req, res) => {
    const ip = req.ip ?? "unknown";
    const wait = loginBlocked(ip);
    if (wait) {
      res.status(429).json({ error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} min.` });
      return;
    }
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!(await checkPassword(password))) {
      recordLoginFailure(ip);
      res.status(401).json({ error: "Wrong password" });
      return;
    }
    clearLoginFailures(ip);
    issueSession(res, req.secure);
    res.json({ ok: true });
  }));

  // Where Google and other apps send you back after you sign in. The cookie isn't sent on that cross-site
  // redirect (it's SameSite=Strict), so the single-use, unguessable `state` is what ties it to your request.
  app.get("/api/connectors/oauth/callback", asyncRoute(async (req, res) => {
    const back = (params: Record<string, string>) => res.redirect(302, `/#/connectors?${new URLSearchParams(params)}`);
    const pendingAuth = takeAuth(String(req.query.state ?? ""));
    if (!pendingAuth) return back({ error: "That sign-in link expired. Try connecting again." });
    if (req.query.error) return back({ error: `Sign-in was cancelled (${String(req.query.error)}).` });
    if (!isUnlocked()) return back({ error: "Dizz Lab was locked. Sign in, then connect again." });
    const connector = getConnector(pendingAuth.connectorId);
    if (!connector) return back({ error: "That connector was removed." });
    try {
      const code = String(req.query.code ?? "");
      const done =
        pendingAuth.kind === "mcp"
          ? await finishMcpAuth(connector.id, code, pendingAuth.redirectUrl)
          : await finishGoogleAuth(pendingAuth, code, connector);
      back({ connected: done.name });
    } catch (err) {
      back({ error: `${connector.name}: ${err instanceof Error ? err.message : String(err)}` });
    }
  }));

  app.post("/api/logout", (_req, res) => {
    clearSession(res);
    res.json({ ok: true });
  });

  app.use("/api", requireAuth);
  app.use("/api", express.json({ limit: "5mb" }));

  app.post("/api/logout-all", (_req, res) => {
    revokeAllSessions();
    clearSession(res);
    res.json({ ok: true });
  });

  app.post("/api/lock", (_req, res) => {
    for (const id of runningConversations()) stopRun(id);
    lock();
    res.json({ ok: true });
  });

  app.post("/api/password", asyncRoute(async (req, res) => {
    const body = parse(
      z.object({ current: z.string().max(500), next: z.string().min(8, "Use at least 8 characters").max(500) }),
      req.body,
    );
    if (!(await changePassword(body.current, body.next))) throw new HttpError(400, "Your current password isn't right");
    revokeAllSessions(); // other devices sign in again with the new password
    issueSession(res, req.secure);
    res.json({ ok: true });
  }));

  app.get("/api/usage", (_req, res) => {
    res.json(spendingReport());
  });

  app.get("/api/bootstrap", (_req, res) => {
    res.json({
      agentName: config.agentName,
      timezone: config.timezone,
      models: availableModels(),
      settings: getSettings(),
      toolGroups: TOOL_GROUPS,
      security: {
        encryptedAtRest: true,
        autoUnlock: !!config.password,
      },
      features: {
        imageGeneration: !!config.xaiKey,
        codeExecution: config.codeExecution !== "off",
        phoneNotifications: !!config.ntfyUrl,
        swarmConcurrency: config.swarmConcurrency,
        swarmMaxTasks: config.swarmMaxTasks,
      },
      running: runningConversations(),
    });
  });

  // ── Live app events ──
  app.get("/api/events", (_req, res) => {
    const send = openSse(res);
    send({ type: "hello" });
    const off = onAppEvent(send);
    res.on("close", off);
  });

  // ── Conversations ──
  app.get("/api/conversations", (req, res) => {
    const running = new Set(runningConversations());
    const agents = new Map(listAgents("", 100_000).map((a) => [a.id, a]));
    res.json(
      listConversations(String(req.query.q ?? "")).map((c) => {
        const agent = c.agentId ? agents.get(c.agentId) : undefined;
        return { ...c, running: running.has(c.id), agent: agent ? { id: agent.id, name: agent.name, emoji: agent.emoji } : null };
      }),
    );
  });

  app.post("/api/conversations", (req, res) => {
    const { agentId } = parse(z.object({ agentId: z.string().nullable().optional() }), req.body ?? {});
    if (agentId && !getAgent(agentId)) throw new HttpError(404, "Agent not found");
    res.json(createConversation("", agentId ?? null));
  });

  app.get("/api/conversations/:id", (req, res) => {
    const conversation = requireConversation(param(req, "id"));
    res.json({
      conversation,
      agent: conversation.agentId ? getAgent(conversation.agentId) : null,
      messages: listMessages(conversation.id).map(publicMessage),
      running: isRunning(conversation.id),
    });
  });

  app.patch("/api/conversations/:id", (req, res) => {
    const conversation = requireConversation(param(req, "id"));
    const patch = parse(z.object({ title: z.string().max(200).optional(), pinned: z.boolean().optional() }), req.body);
    updateConversation(conversation.id, patch);
    res.json(getConversation(conversation.id));
  });

  app.delete("/api/conversations/:id", (req, res) => {
    const id = param(req, "id");
    stopRun(id);
    deleteConversation(id);
    res.json({ ok: true });
  });

  const sendBody = z.object({
    text: z.string().max(200_000).default(""),
    attachmentIds: z.array(z.string()).max(20).default([]),
    model: z.string().optional(),
    effort: effort.optional(),
  });

  app.post("/api/conversations/:id/messages", (req, res) => {
    const conversation = requireConversation(param(req, "id"));
    const body = parse(sendBody, req.body);
    if (!body.text.trim() && !body.attachmentIds.length) throw new HttpError(400, "Say something or attach a file");
    if (isRunning(conversation.id)) throw new HttpError(409, "Still working on the last message");
    streamRun(res, sendMessage({ conversationId: conversation.id, ...body }));
  });

  app.post("/api/conversations/:id/regenerate", (req, res) => {
    const conversation = requireConversation(param(req, "id"));
    const body = parse(z.object({ model: z.string().optional(), effort: effort.optional() }), req.body ?? {});
    if (isRunning(conversation.id)) throw new HttpError(409, "Still working on the last message");
    streamRun(res, regenerate(conversation.id, body.model, body.effort));
  });

  app.get("/api/conversations/:id/stream", (req, res) => {
    const run = getRun(param(req, "id"));
    if (!run) {
      res.status(204).end();
      return;
    }
    streamRun(res, run);
  });

  app.post("/api/conversations/:id/stop", (req, res) => {
    res.json({ stopped: stopRun(param(req, "id")) });
  });

  app.get("/api/conversations/:id/export", (req, res) => {
    const conversation = requireConversation(param(req, "id"));
    const lines = [`# ${conversation.title || "Chat"}`, ""];
    for (const m of listMessages(conversation.id)) {
      const who = m.role === "user" ? "**You**" : `**${config.agentName}**${m.model ? ` (${m.model})` : ""}`;
      lines.push(`${who} · ${new Date(m.createdAt).toLocaleString("en-GB", { timeZone: config.timezone })}`, "", m.text, "");
      for (const s of m.sources ?? []) lines.push(`- [${s.title}](${s.url})`);
      lines.push("---", "");
    }
    const name = (conversation.title || "chat").replace(/[^\w\- ]+/g, "").trim() || "chat";
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${name}.md"`);
    res.send(lines.join("\n"));
  });

  // ── Memory ──
  app.get("/api/memories", (_req, res) => {
    res.json(listMemories());
  });
  app.post("/api/memories", (req, res) => {
    const body = parse(z.object({ text: z.string().trim().min(2).max(600), category: z.string().default("other") }), req.body);
    const memory = addMemory(body.text, body.category);
    indexMemory(memory);
    res.json(memory);
  });
  app.delete("/api/memories/:id", (req, res) => {
    res.json({ ok: deleteMemory(param(req, "id")) });
  });

  // ── Reminders ──
  app.get("/api/reminders", (_req, res) => {
    res.json(listReminders());
  });
  app.delete("/api/reminders/:id", (req, res) => {
    res.json({ ok: cancelReminder(param(req, "id")) });
  });

  // ── Agents ──
  app.get("/api/agents", (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 200) || 200, 5000);
    const offset = Number(req.query.offset ?? 0) || 0;
    res.json({ agents: listAgents(String(req.query.q ?? ""), limit, offset), total: countAgents() });
  });
  app.post("/api/agents", (req, res) => {
    const body = parse(agentBody, req.body);
    if (findAgent(body.name)) throw new HttpError(409, `An agent called "${body.name}" already exists`);
    res.json(createAgent(toAgentInput(body)));
  });
  app.post("/api/agents/import", (req, res) => {
    const items = parse(z.array(agentBody).max(5000), req.body);
    let created = 0;
    const skipped: string[] = [];
    for (const item of items) {
      if (findAgent(item.name)) skipped.push(item.name);
      else {
        createAgent(toAgentInput(item));
        created++;
      }
    }
    res.json({ created, skipped });
  });
  app.get("/api/agents/export", (_req, res) => {
    const agents = listAgents("", 100_000).map(({ id: _id, createdAt: _c, updatedAt: _u, ...a }) => a);
    res.setHeader("Content-Disposition", 'attachment; filename="agents.json"');
    res.json(agents);
  });
  app.get("/api/agents/:id", (req, res) => {
    const agent = getAgent(param(req, "id"));
    if (!agent) throw new HttpError(404, "That agent no longer exists");
    res.json(agent);
  });
  app.patch("/api/agents/:id", (req, res) => {
    const body = parse(agentBody.partial(), req.body);
    const current = getAgent(param(req, "id"));
    if (!current) throw new HttpError(404, "Agent not found");
    if (body.name && body.name.toLowerCase() !== current.name.toLowerCase() && findAgent(body.name)) {
      throw new HttpError(409, `An agent called "${body.name}" already exists`);
    }
    const merged = toAgentInput({ ...current, ...body, name: body.name ?? current.name });
    res.json(updateAgent(current.id, merged));
  });
  app.delete("/api/agents/:id", (req, res) => {
    res.json({ ok: deleteAgent(param(req, "id")) });
  });

  // ── Connectors ──
  const redirectUrl = (req: Request) => `${config.publicUrl || `${req.protocol}://${req.get("host")}`}/api/connectors/oauth/callback`;

  app.get("/api/connectors", (req, res) => {
    res.json({
      connectors: listConnectors().map(publicConnector),
      google: {
        configured: !!googleClient(),
        fromEnv: !!(config.googleClientId && config.googleClientSecret),
        redirectUri: redirectUrl(req),
        services: Object.entries(GOOGLE_SERVICES).map(([kind, s]) => ({ kind, name: s.name, description: s.description })),
      },
      gallery: GALLERY,
    });
  });

  app.put("/api/connectors/google/setup", (req, res) => {
    const body = parse(z.object({ clientId: z.string().trim().min(10), clientSecret: z.string().trim().min(6) }), req.body);
    setSecretKV("google_oauth", JSON.stringify(body));
    res.json({ ok: true });
  });

  app.post("/api/connectors/google/:kind/connect", (req, res) => {
    const kind = param(req, "kind");
    if (!isGoogleKind(kind)) throw new HttpError(404, "Unknown Google service");
    res.json({ authUrl: startGoogleAuth(kind, redirectUrl(req)) });
  });

  app.post("/api/connectors/mcp", asyncRoute(async (req, res) => {
    const body = parse(z.object({ name: z.string().max(60).optional(), url: z.string().url("That isn't a valid link"), token: z.string().max(4000).optional() }), req.body);
    const { connector, authUrl } = await addMcpConnector(body, redirectUrl(req));
    res.json({ connector: publicConnector(connector), authUrl });
  }));

  app.post("/api/connectors/:id/connect", asyncRoute(async (req, res) => {
    const connector = getConnector(param(req, "id"));
    if (!connector) throw new HttpError(404, "Connector not found");
    if (isGoogleKind(connector.kind)) {
      res.json({ authUrl: startGoogleAuth(connector.kind, redirectUrl(req)) });
      return;
    }
    const { connector: updated, authUrl } = await connectMcp(connector.id, redirectUrl(req));
    res.json({ connector: publicConnector(updated), authUrl });
  }));

  app.patch("/api/connectors/:id", (req, res) => {
    const patch = parse(z.object({ enabled: z.boolean().optional(), autoSend: z.boolean().optional(), name: z.string().trim().min(1).max(60).optional() }), req.body);
    const updated = updateConnector(param(req, "id"), patch);
    if (!updated) throw new HttpError(404, "Connector not found");
    res.json(publicConnector(updated));
  });

  app.delete("/api/connectors/:id", asyncRoute(async (req, res) => {
    const connector = getConnector(param(req, "id"));
    if (!connector) throw new HttpError(404, "Connector not found");
    closeMcp(connector.id);
    // Best effort: tell Google to forget the grant too.
    if (connector.google?.refreshToken && !config.googleApiOrigin) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(connector.google.refreshToken)}`, { method: "POST" }).catch(() => {});
    }
    removeConnector(connector.id);
    res.json({ ok: true });
  }));

  // The Send / Discard buttons on an email the agent drafted.
  app.post("/api/connectors/:id/email/:action", asyncRoute(async (req, res) => {
    const connector = getConnector(param(req, "id"));
    if (!connector || connector.kind !== "gmail") throw new HttpError(404, "Gmail isn't connected");
    const { draftId } = parse(z.object({ draftId: z.string().min(1) }), req.body);
    try {
      if (param(req, "action") === "send") await sendGmailDraft(connector, draftId);
      else if (param(req, "action") === "discard") await discardGmailDraft(connector, draftId);
      else throw new HttpError(404, "Unknown action");
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(409, `This draft was already sent or deleted (${err instanceof Error ? err.message : String(err)})`);
    }
    res.json({ ok: true });
  }));

  // ── Files ──
  app.get("/api/files", (_req, res) => {
    res.json(listFiles());
  });

  app.post("/api/files", express.raw({ type: () => true, limit: "50mb" }), (req, res) => {
    const name = String(req.query.name ?? "").trim();
    if (!name) throw new HttpError(400, "Missing file name");
    const data = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (!data.length) throw new HttpError(400, "The file is empty");
    const declared = req.get("content-type")?.split(";")[0].trim();
    const mime = declared && declared !== "application/octet-stream" ? declared : mimeFor(name);
    const conversationId = req.query.conversationId ? String(req.query.conversationId) : null;
    res.json(saveUpload(name, mime, data, conversationId && getConversation(conversationId) ? conversationId : null));
  });

  // Files are served sandboxed: only plain media types render inline, everything else downloads.
  const INLINE = /^(image\/(png|jpeg|gif|webp)|application\/pdf|audio\/|video\/|text\/plain)/;
  app.get("/api/files/:id", (req, res) => {
    const file = getFile(param(req, "id"));
    if (!file || !fs.existsSync(file.path)) throw new HttpError(404, "File not found");
    const inline = req.query.download !== "1" && INLINE.test(file.mime);
    res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'");
    res.setHeader("Content-Type", inline ? file.mime : "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(path.basename(file.name))}`,
    );
    res.setHeader("Cache-Control", "private, no-store");
    res.end(readFileBytes(file.id)!.data);
  });

  app.delete("/api/files/:id", (req, res) => {
    const file = getFile(param(req, "id"));
    if (!file) throw new HttpError(404, "File not found");
    // Remove the workspace copy. Uploaded originals stay so old chats still replay exactly.
    const workspaceCopy = path.join(WORKSPACE_DIR, file.name);
    if (workspaceCopy.startsWith(WORKSPACE_DIR + path.sep) && fs.existsSync(workspaceCopy)) fs.rmSync(workspaceCopy);
    markFileDeleted(file.id);
    res.json({ ok: true });
  });

  // ── Settings ──
  app.get("/api/settings", (_req, res) => {
    res.json(getSettings());
  });
  app.put("/api/settings", (req, res) => {
    const patch = parse(
      z.object({
        userName: z.string().max(80).optional(),
        defaultModel: z.string().optional(),
        effort: effort.optional(),
        personality: z.enum(["default", "fun", "concise", "professional"]).optional(),
        language: z.enum(["en", "ar"]).optional(),
        customInstructions: z.string().max(20_000).optional(),
        monthlyBudget: z.number().min(0).max(1_000_000).optional(),
      }),
      req.body,
    );
    res.json(saveSettings(patch));
  });

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // ── Front end ──
  app.get(["/app.js", "/app.css"], asyncRoute(async (req, res) => {
    const file = (await getBundle()).get(path.basename(req.path));
    if (!file) throw new HttpError(404, "Not built");
    res.setHeader("Content-Type", `${file.type}; charset=utf-8`);
    res.setHeader("Cache-Control", production ? "public, max-age=300" : "no-cache");
    res.end(Buffer.from(file.body));
  }));
  app.use(express.static(path.join(WEB_DIR, "public"), { index: false, dotfiles: "ignore" }));
  app.get("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(WEB_DIR, "index.html"));
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status =
      err instanceof HttpError ? err.status : err instanceof VaultLockedError ? 423 : ((err as { status?: number }).status ?? 500);
    if (status >= 500) {
      console.error("[dizz]", err);
      reportError(err, "http");
    }
    if (res.headersSent) {
      res.end();
      return;
    }
    res.status(status).json({ error: err instanceof Error ? err.message : "Something went wrong" });
  });

  return app;
}
