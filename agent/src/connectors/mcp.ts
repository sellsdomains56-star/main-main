import { createHash, randomBytes } from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { auth, UnauthorizedError, type OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { OAuthClientInformationMixed, OAuthClientMetadata, OAuthTokens } from "@modelcontextprotocol/sdk/shared/auth.js";
import type { AgentTool, ToolOutcome } from "../agent/tools.js";
import { config } from "../config.js";
import { createConnector, getConnector, listConnectors, rememberAuth, saveConnector, type Connector, type McpToolInfo } from "./store.js";

/**
 * Apps you add by link. Under the hood these are MCP servers (the open standard
 * Claude and others use for connectors). Apps that need you to sign in go
 * through OAuth with automatic client registration; apps that give you an API
 * key or token send it as a bearer token.
 */

/** Keeps the OAuth state the MCP SDK needs inside the connector's encrypted record. */
class ConnectorAuth implements OAuthClientProvider {
  authorizationUrl: string | null = null;
  constructor(
    private connectorId: string,
    private redirect: string,
  ) {}
  private get c(): Connector {
    const c = getConnector(this.connectorId);
    if (!c?.mcp) throw new Error("Connector not found");
    return c;
  }
  private patch(fn: (m: NonNullable<Connector["mcp"]>) => void) {
    const c = this.c;
    fn(c.mcp!);
    saveConnector(c);
  }
  get redirectUrl() {
    return this.redirect;
  }
  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: config.agentName,
      redirect_uris: [this.redirect],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    };
  }
  state() {
    const state = randomBytes(24).toString("base64url");
    rememberAuth(state, { connectorId: this.connectorId, kind: "mcp", redirectUrl: this.redirect });
    return state;
  }
  clientInformation() {
    const m = this.c.mcp!;
    // A registration is tied to its redirect address; register again if you've moved the app.
    return m.redirectUrl === this.redirect ? (m.clientInformation as OAuthClientInformationMixed | undefined) : undefined;
  }
  saveClientInformation(info: OAuthClientInformationMixed) {
    this.patch((m) => {
      m.clientInformation = info as Record<string, unknown>;
      m.redirectUrl = this.redirect;
    });
  }
  tokens() {
    return this.c.mcp!.tokens as OAuthTokens | undefined;
  }
  saveTokens(tokens: OAuthTokens) {
    this.patch((m) => (m.tokens = tokens as Record<string, unknown>));
  }
  redirectToAuthorization(url: URL) {
    this.authorizationUrl = url.toString();
  }
  saveCodeVerifier(verifier: string) {
    this.patch((m) => (m.codeVerifier = verifier));
  }
  codeVerifier() {
    const v = this.c.mcp!.codeVerifier;
    if (!v) throw new Error("No sign-in in progress");
    return v;
  }
  invalidateCredentials(scope: "all" | "client" | "tokens" | "verifier" | "discovery") {
    this.patch((m) => {
      if (scope === "all" || scope === "client") m.clientInformation = undefined;
      if (scope === "all" || scope === "tokens") m.tokens = undefined;
      if (scope === "all" || scope === "verifier") m.codeVerifier = undefined;
    });
  }
}

const pool = new Map<string, { client: Client; lastUsed: number }>();
setInterval(() => {
  for (const [id, entry] of pool) {
    if (Date.now() - entry.lastUsed > 10 * 60_000) {
      pool.delete(id);
      void entry.client.close().catch(() => {});
    }
  }
}, 60_000).unref();

function transportFor(c: Connector, kind: "http" | "sse", authProvider?: OAuthClientProvider) {
  const url = new URL(c.mcp!.url);
  const requestInit: RequestInit | undefined = c.mcp!.token ? { headers: { Authorization: `Bearer ${c.mcp!.token}` } } : undefined;
  const opts = { requestInit, authProvider: c.mcp!.token ? undefined : authProvider };
  return kind === "sse" ? new SSEClientTransport(url, opts) : new StreamableHTTPClientTransport(url, opts);
}

/**
 * Connects (trying the current transport, then the older SSE one). Returns the
 * sign-in URL when the app needs you to sign in first.
 */
async function open(c: Connector, redirectUrl: string): Promise<{ client: Client } | { authUrl: string }> {
  const provider = new ConnectorAuth(c.id, redirectUrl);
  const kinds: ("http" | "sse")[] = c.mcp!.transport ? [c.mcp!.transport] : ["http", "sse"];
  let lastError: unknown;
  for (const kind of kinds) {
    const client = new Client({ name: config.agentName, version: "1.0.0" });
    try {
      await client.connect(transportFor(c, kind, provider));
      if (c.mcp!.transport !== kind) {
        c.mcp!.transport = kind;
        saveConnector(c);
      }
      return { client };
    } catch (err) {
      lastError = err;
      if (err instanceof UnauthorizedError || provider.authorizationUrl) {
        if (provider.authorizationUrl) return { authUrl: provider.authorizationUrl };
        if (c.mcp!.token) throw new Error("The app rejected that token. Check it and try again.");
        throw new Error("The app asked to sign in, but didn't offer a way to (no OAuth). Add an API key or token instead.");
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function client(c: Connector): Promise<Client> {
  const pooled = pool.get(c.id);
  if (pooled) {
    pooled.lastUsed = Date.now();
    return pooled.client;
  }
  const opened = await open(c, c.mcp!.redirectUrl ?? "http://localhost/api/connectors/oauth/callback");
  if ("authUrl" in opened) {
    saveConnector({ ...c, status: "needs_auth", error: "Sign in again" });
    throw new Error(`${c.name} needs you to sign in again (Connectors → ${c.name}).`);
  }
  pool.set(c.id, { client: opened.client, lastUsed: Date.now() });
  opened.client.onclose = () => pool.delete(c.id);
  return opened.client;
}

async function loadTools(c: Connector, mcp: Client): Promise<Connector> {
  const tools: McpToolInfo[] = [];
  let cursor: string | undefined;
  do {
    const page = await mcp.listTools(cursor ? { cursor } : undefined);
    for (const t of page.tools) tools.push({ name: t.name, description: t.description ?? "", inputSchema: t.inputSchema as Record<string, unknown> });
    cursor = page.nextCursor;
  } while (cursor && tools.length < 500);
  const server = mcp.getServerVersion();
  return saveConnector({
    ...c,
    status: "connected",
    error: undefined,
    account: server?.title ?? server?.name ?? c.account,
    mcp: { ...c.mcp!, tools, serverName: server?.name },
  });
}

/** "Add by link": connects to the app, or returns where to sign in. */
export async function addMcpConnector(
  input: { name?: string; url: string; token?: string },
  redirectUrl: string,
): Promise<{ connector: Connector; authUrl?: string }> {
  const url = new URL(input.url.trim());
  if (!/^https?:$/.test(url.protocol)) throw new Error("The link must start with https://");
  const existing = listConnectors().find((c) => c.kind === "mcp" && c.mcp?.url === url.toString());
  const connector =
    existing ??
    createConnector({
      kind: "mcp",
      name: input.name?.trim() || url.hostname.replace(/^(www|mcp|api)\./, "").split(".")[0].replace(/^./, (ch) => ch.toUpperCase()),
      enabled: true,
      status: "needs_auth",
      mcp: { url: url.toString(), tools: [] },
    });
  if (existing && input.token !== undefined) existing.mcp!.token = input.token || undefined;
  if (!existing && input.token) connector.mcp!.token = input.token;
  saveConnector(connector);
  return connectMcp(connector.id, redirectUrl);
}

export async function connectMcp(id: string, redirectUrl: string): Promise<{ connector: Connector; authUrl?: string }> {
  const c = getConnector(id)!;
  pool.delete(id);
  try {
    const opened = await open(c, redirectUrl);
    if ("authUrl" in opened) return { connector: saveConnector({ ...c, status: "needs_auth" }), authUrl: opened.authUrl };
    const connector = await loadTools(c, opened.client);
    pool.set(id, { client: opened.client, lastUsed: Date.now() });
    return { connector };
  } catch (err) {
    const connector = saveConnector({ ...c, status: "error", error: err instanceof Error ? err.message : String(err) });
    return { connector };
  }
}

/** Completes the app's sign-in after it redirects back to us. */
export async function finishMcpAuth(connectorId: string, code: string, redirectUrl: string): Promise<Connector> {
  const c = getConnector(connectorId);
  if (!c?.mcp) throw new Error("Connector not found");
  const provider = new ConnectorAuth(c.id, redirectUrl);
  const result = await auth(provider, { serverUrl: c.mcp.url, authorizationCode: code });
  if (result !== "AUTHORIZED") throw new Error("Sign-in didn't complete");
  const { connector } = await connectMcp(c.id, redirectUrl);
  if (connector.status !== "connected") throw new Error(connector.error ?? "Couldn't connect after signing in");
  return connector;
}

export function closeMcp(id: string): void {
  const entry = pool.get(id);
  pool.delete(id);
  void entry?.client.close().catch(() => {});
}

// ── Exposing an app's tools to the agent ─────────────────────────────────────

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 20) || "app";
}

/** Tool names must be short and simple; long ones get a stable hash suffix. */
function toolName(connector: Connector, tool: string): string {
  const name = `${slug(connector.name)}__${tool.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  if (name.length <= 64) return name;
  return `${name.slice(0, 55)}_${createHash("sha1").update(name).digest("hex").slice(0, 8)}`;
}

function outcomeFrom(result: Record<string, unknown>): ToolOutcome {
  const parts: string[] = [];
  const images: NonNullable<ToolOutcome["images"]> = [];
  for (const item of (result.content as Record<string, unknown>[] | undefined) ?? []) {
    if (item.type === "text") parts.push(String(item.text));
    else if (item.type === "image" && typeof item.data === "string") images.push({ mime: String(item.mimeType), data: item.data });
    else if (item.type === "resource") {
      const r = item.resource as Record<string, unknown>;
      parts.push(typeof r.text === "string" ? r.text : `[resource ${String(r.uri)}]`);
    } else if (item.type === "resource_link") parts.push(`[${String(item.name ?? "link")}](${String(item.uri)})`);
  }
  if (!parts.length && result.structuredContent) parts.push(JSON.stringify(result.structuredContent, null, 2));
  let content = parts.join("\n\n") || "(no output)";
  if (content.length > 60_000) content = `${content.slice(0, 60_000)}\n\n[… cut]`;
  const ok = !result.isError;
  return { ok, content, result: ok ? "Done" : content.slice(0, 120), images: images.slice(0, 4) };
}

function asTool(c: Connector, t: McpToolInfo): AgentTool {
  const schema = t.inputSchema?.type === "object" ? t.inputSchema : { type: "object", properties: {} };
  const required = (schema.required as string[] | undefined) ?? [];
  const pretty = t.name.replace(/[_-]+/g, " ");
  return {
    name: toolName(c, t.name),
    description: `[${c.name}] ${t.description || pretty}`.slice(0, 1024),
    jsonSchema: schema,
    label: () => `${c.name}: ${pretty}`,
    detail: (input) => {
      const json = JSON.stringify(input ?? {}, null, 2);
      return json === "{}" ? undefined : json.slice(0, 2000);
    },
    async run(input, ctx) {
      // The app validates fully; we only make sure a cut-off input doesn't reach it.
      if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, content: "The input must be an object." };
      const missing = required.filter((k) => !(k in (input as Record<string, unknown>)));
      if (missing.length) return { ok: false, content: `Missing required field(s): ${missing.join(", ")}` };
      try {
        const mcp = await client(getConnector(c.id)!);
        const result = await mcp.callTool({ name: t.name, arguments: input as Record<string, unknown> }, undefined, {
          signal: ctx.signal,
          timeout: 120_000,
        });
        return outcomeFrom(result as Record<string, unknown>);
      } catch (err) {
        pool.delete(c.id);
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, content: `${c.name} failed: ${message}`, result: message.slice(0, 120) };
      }
    },
  };
}

export function mcpTools(): AgentTool[] {
  return listConnectors()
    .filter((c) => c.kind === "mcp" && c.enabled && c.status === "connected" && c.mcp)
    .flatMap((c) => c.mcp!.tools.map((t) => asTool(c, t)));
}
