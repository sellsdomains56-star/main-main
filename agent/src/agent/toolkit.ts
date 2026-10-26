import { connectorTools } from "../connectors/index.js";
import { TOOL_GROUPS, type AgentProfile, type ToolGroup } from "../types.js";
import { AGENT_TOOLS } from "./swarm.js";
import { BASE_TOOLS, type AgentTool } from "./tools.js";

/**
 * The tools an agent gets: everything for the main agent, the chosen ability
 * groups for a custom agent. Sub-agents never get the swarm tools, so a swarm
 * can't spawn swarms of its own.
 */
export function toolsFor(agent: AgentProfile | null, isSubAgent: boolean): { tools: AgentTool[]; serverTools: boolean } {
  const groups = new Set<ToolGroup>(agent?.tools ?? TOOL_GROUPS);
  if (isSubAgent) groups.delete("agents");
  const tools: AgentTool[] = [];
  for (const group of ["memory", "reminders", "files", "code", "images"] as const) {
    if (groups.has(group)) tools.push(...BASE_TOOLS[group]);
  }
  if (groups.has("connectors")) tools.push(...connectorTools());
  if (groups.has("agents")) tools.push(...AGENT_TOOLS);
  return { tools, serverTools: groups.has("web") };
}
