import type { AgentTool } from "../agent/tools.js";
import { apiSummary, apiTools } from "./apis.js";
import { googleTools } from "./google.js";
import { mcpTools } from "./mcp.js";
import { listConnectors } from "./store.js";

/** Every tool from your connected apps that are turned on. */
export function connectorTools(): AgentTool[] {
  return [...googleTools(), ...mcpTools(), ...apiTools()];
}

/** One line for the agent's context: which apps it can use right now. */
export function connectorSummary(): string {
  const live = listConnectors().filter((c) => c.enabled && c.status === "connected");
  const apps = live.length ? `Connected apps: ${live.map((c) => (c.account && c.kind !== "mcp" ? `${c.name} (${c.account})` : c.name)).join(", ")}` : "";
  return [apps, apiSummary()].filter(Boolean).join("\n");
}
