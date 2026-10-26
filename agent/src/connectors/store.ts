import { randomBytes } from "node:crypto";
import { addConnectorRow, deleteConnectorRow, listConnectorRows, updateConnectorRow } from "../db.js";
import { onLock } from "../vault.js";

export type ConnectorKind = "gmail" | "google_calendar" | "google_drive" | "mcp";

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export interface McpToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpSettings {
  url: string;
  /** An API key or token the app gave you, sent as a bearer token (instead of signing in). */
  token?: string;
  transport?: "http" | "sse";
  /** OAuth state the MCP SDK asks us to keep (client registration, tokens, PKCE verifier). */
  clientInformation?: Record<string, unknown>;
  tokens?: Record<string, unknown>;
  codeVerifier?: string;
  redirectUrl?: string;
  tools: McpToolInfo[];
  serverName?: string;
}

/** A connected app. Stored encrypted as a whole: tokens are as private as your chats. */
export interface Connector {
  id: string;
  kind: ConnectorKind;
  name: string;
  enabled: boolean;
  status: "connected" | "needs_auth" | "error";
  error?: string;
  /** The account it's signed in as (e.g. your Gmail address), or the server's name. */
  account?: string;
  google?: GoogleTokens;
  mcp?: McpSettings;
  /** Gmail: send emails without asking first. */
  autoSend?: boolean;
  createdAt: number;
}

/** What the browser sees: no tokens. */
export function publicConnector(c: Connector) {
  return {
    id: c.id,
    kind: c.kind,
    name: c.name,
    enabled: c.enabled,
    status: c.status,
    error: c.error,
    account: c.account,
    autoSend: !!c.autoSend,
    url: c.mcp?.url,
    usesToken: !!c.mcp?.token,
    tools: c.mcp?.tools.map((t) => ({ name: t.name, description: t.description })) ?? [],
    createdAt: c.createdAt,
  };
}

let cache: Map<string, Connector> | null = null;
onLock(() => (cache = null));

function all(): Map<string, Connector> {
  cache ??= new Map(listConnectorRows().map((json) => {
    const c = JSON.parse(json) as Connector;
    return [c.id, c];
  }));
  return cache;
}

export function listConnectors(): Connector[] {
  return [...all().values()].sort((a, b) => a.createdAt - b.createdAt);
}

export function getConnector(id: string): Connector | null {
  return all().get(id) ?? null;
}

export function findConnector(kind: ConnectorKind): Connector | null {
  return listConnectors().find((c) => c.kind === kind) ?? null;
}

export function createConnector(input: Omit<Connector, "id" | "createdAt">): Connector {
  const connector: Connector = { ...input, id: `con_${randomBytes(9).toString("base64url")}`, createdAt: Date.now() };
  addConnectorRow(connector.id, JSON.stringify(connector), connector.createdAt);
  all().set(connector.id, connector);
  return connector;
}

export function saveConnector(connector: Connector): Connector {
  updateConnectorRow(connector.id, JSON.stringify(connector));
  all().set(connector.id, connector);
  return connector;
}

export function updateConnector(id: string, patch: Partial<Connector>): Connector | null {
  const current = getConnector(id);
  return current ? saveConnector({ ...current, ...patch }) : null;
}

export function removeConnector(id: string): boolean {
  all().delete(id);
  return deleteConnectorRow(id);
}

/** Short-lived OAuth sign-ins in progress, by `state`. */
export interface PendingAuth {
  connectorId: string;
  kind: ConnectorKind;
  codeVerifier?: string;
  redirectUrl: string;
  expires: number;
}
const pending = new Map<string, PendingAuth>();

export function rememberAuth(state: string, auth: Omit<PendingAuth, "expires">): void {
  for (const [k, v] of pending) if (v.expires < Date.now()) pending.delete(k);
  pending.set(state, { ...auth, expires: Date.now() + 15 * 60_000 });
}

/** Single use: a state can complete one sign-in only. */
export function takeAuth(state: string): PendingAuth | null {
  const auth = pending.get(state);
  pending.delete(state);
  return auth && auth.expires > Date.now() ? auth : null;
}
