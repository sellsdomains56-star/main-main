import type { AgentTool } from "../agent/tools.js";
import { googleTools } from "./google.js";
import { mcpTools } from "./mcp.js";
import { listConnectors } from "./store.js";

/** Every tool from your connected apps that are turned on. */
export function connectorTools(): AgentTool[] {
  return [...googleTools(), ...mcpTools()];
}

/** One line for the agent's context: which apps it can use right now. */
export function connectorSummary(): string {
  const live = listConnectors().filter((c) => c.enabled && c.status === "connected");
  if (!live.length) return "";
  return `Connected apps: ${live.map((c) => (c.account && c.kind !== "mcp" ? `${c.name} (${c.account})` : c.name)).join(", ")}`;
}
