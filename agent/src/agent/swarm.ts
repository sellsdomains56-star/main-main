import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { availableModels, config } from "../config.js";
import { countAgents, createAgent, deleteAgent, findAgent, listAgents, updateAgent } from "../db.js";
import { registerGenerated, WORKSPACE_DIR } from "../files.js";
import { EFFORT_LEVELS, TOOL_GROUPS, type AgentProfile, type FileRecord } from "../types.js";
import { tr, trCount } from "../i18n.js";
import { defineTool, type SubAgentResult } from "./tools.js";

/** One shared limit for every swarm, so two swarms at once can't double the load. */
class Semaphore {
  private queue: (() => void)[] = [];
  private active = 0;
  constructor(private readonly limit: number) {}
  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) await new Promise<void>((resolve) => this.queue.push(resolve));
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      this.queue.shift()?.();
    }
  }
}
const slots = new Semaphore(config.swarmConcurrency);

const abilities = z
  .array(z.enum(TOOL_GROUPS))
  .optional()
  .describe(`Which abilities it gets; leave out for all of them. Options: ${TOOL_GROUPS.join(", ")}`);

const agentSpec = z.object({
  name: z.string().min(1).max(60).describe("A short, unique name, e.g. \"Market Researcher\""),
  emoji: z.string().max(8).optional().describe("One emoji for its avatar"),
  description: z.string().max(300).describe("One line on what it's for"),
  instructions: z
    .string()
    .max(20_000)
    .describe("Its system instructions: role, expertise, how it should work and what its answers should look like"),
  model: z.string().optional().describe("A model id to pin it to; leave out to use the user's default"),
  effort: z.enum(EFFORT_LEVELS).optional(),
  abilities,
});

function checkModel(model: string | undefined): string | null {
  if (!model) return null;
  return availableModels().some((m) => m.id === model) ? model : null;
}

const describeAgent = (a: AgentProfile) =>
  `- ${a.emoji} ${a.name} (${a.id})${a.model ? ` [${a.model}]` : ""}: ${a.description || a.instructions.slice(0, 100)}`;

const createAgentsTool = defineTool({
  name: "create_agents",
  description:
    "Create one or more custom agents for the user. Each gets its own name, instructions, model and abilities, appears in the " +
    "user's Agents list (they can chat with it directly) and can be given tasks with delegate_tasks. Create as many as the user " +
    "asks for; write specific, expert instructions for each.",
  schema: z.object({ agents: z.array(agentSpec).min(1).max(200) }),
  label: (i) =>
    i.agents?.length
      ? trCount(i.agents.length, ["Created {n} agent", "Created {n} agents"], ["أنشأ وكيلًا", "أنشأ وكيلين", "أنشأ {n} وكلاء", "أنشأ {n} وكيلًا"])
      : tr("Creating agents", "ينشئ وكلاء"),
  detail: (i) => i.agents?.map((a) => `${a.emoji ?? "🤖"} ${a.name}`).join("\n"),
  async run({ agents }) {
    const made: AgentProfile[] = [];
    const skipped: string[] = [];
    for (const spec of agents) {
      if (findAgent(spec.name)) {
        skipped.push(spec.name);
        continue;
      }
      made.push(
        createAgent({
          name: spec.name.trim(),
          emoji: spec.emoji?.trim() || "🤖",
          description: spec.description.trim(),
          instructions: spec.instructions.trim(),
          model: checkModel(spec.model),
          effort: spec.effort ?? null,
          tools: spec.abilities?.length ? [...new Set(spec.abilities)] : null,
        }),
      );
    }
    const lines = made.map(describeAgent);
    if (skipped.length) lines.push(`Skipped (name already taken): ${skipped.join(", ")}`);
    return { ok: made.length > 0 || skipped.length > 0, content: lines.join("\n"), result: tr(`${made.length} created`, `أُنشئ ${made.length}`) };
  },
});

const listAgentsTool = defineTool({
  name: "list_agents",
  description: "List the user's custom agents (name, id, model, what each is for). Optionally filter by a word.",
  schema: z.object({
    query: z.string().optional(),
    limit: z.number().int().min(1).max(1000).default(100),
    offset: z.number().int().min(0).default(0),
  }),
  label: () => tr("Looked at agents", "اطّلع على الوكلاء"),
  async run({ query, limit, offset }) {
    const agents = listAgents(query ?? "", limit, offset);
    const total = countAgents();
    if (!agents.length) return { ok: true, content: total ? "No agents match." : "The user has no custom agents yet.", result: tr("None", "لا شيء") };
    const more = offset + agents.length < total && !query ? `\n(${total - offset - agents.length} more; use offset)` : "";
    return { ok: true, content: agents.map(describeAgent).join("\n") + more, result: tr(`${agents.length} of ${total}`, `${agents.length} من ${total}`) };
  },
});

const updateAgentTool = defineTool({
  name: "update_agent",
  description: "Change a custom agent's name, instructions, model, effort or abilities.",
  schema: agentSpec.partial().extend({ agent: z.string().describe("The agent's id or exact name") }),
  label: (i) => (i.agent ? tr(`Updated ${i.agent}`, `حدّث ${i.agent}`) : tr("Updated an agent", "حدّث وكيلًا")),
  async run({ agent, abilities: groups, model, ...rest }) {
    const target = findAgent(agent);
    if (!target) return { ok: false, content: `No agent called "${agent}".`, result: tr("Not found", "غير موجود") };
    const updated = updateAgent(target.id, {
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
      ...(model !== undefined ? { model: checkModel(model) } : {}),
      ...(groups !== undefined ? { tools: groups.length ? groups : null } : {}),
    });
    return { ok: true, content: `Updated:\n${describeAgent(updated!)}`, result: tr("Saved", "حُفظ") };
  },
});

const deleteAgentsTool = defineTool({
  name: "delete_agents",
  description: "Delete custom agents by id or exact name. Their past chats are kept.",
  schema: z.object({ agents: z.array(z.string()).min(1).max(1000) }),
  label: (i) =>
    trCount(i.agents?.length ?? 0, ["Deleted {n} agent", "Deleted {n} agents"], ["حذف وكيلًا", "حذف وكيلين", "حذف {n} وكلاء", "حذف {n} وكيلًا"]),
  async run({ agents }) {
    let deleted = 0;
    const missing: string[] = [];
    for (const ref of agents) {
      const a = findAgent(ref);
      if (a && deleteAgent(a.id)) deleted++;
      else missing.push(ref);
    }
    return { ok: true, content: `Deleted ${deleted}.${missing.length ? ` Not found: ${missing.join(", ")}` : ""}`, result: tr(`${deleted} deleted`, `حُذف ${deleted}`) };
  },
});

const delegateTool = defineTool({
  name: "delegate_tasks",
  description:
    "Hand work to a swarm of agents that run in parallel, each in its own fresh context with web search, code and file tools. " +
    `Up to ${config.swarmMaxTasks} tasks per call; ${config.swarmConcurrency} run at a time. Use it for work that splits into ` +
    "independent pieces — researching many companies, people or products, comparing options from several angles, processing a " +
    "batch of files, drafting variants — or when the user asks for agents. Either list `tasks`, or give a `template` containing " +
    "{item} plus `items` to fill it with. Name a custom agent to use its instructions, or leave it out for a general worker. Each " +
    "task must be self-contained: the agents can't see this conversation. You get every result back to combine; the full " +
    "results are also saved as a report file for the user.",
  schema: z.object({
    tasks: z
      .array(z.object({ task: z.string().min(1), agent: z.string().optional().describe("Custom agent id or name") }))
      .max(config.swarmMaxTasks)
      .optional(),
    template: z.string().optional().describe("A task with {item} in it, e.g. \"Find the CEO, revenue and HQ of {item}\""),
    items: z.array(z.string()).max(config.swarmMaxTasks).optional(),
    agent: z.string().optional().describe("Default agent for every task (id or name)"),
    title: z.string().max(100).optional().describe("A short name for this job, used for the report"),
  }),
  label: (i) => {
    const n = (i.tasks?.length ?? 0) + (i.items?.length ?? 0);
    return n
      ? trCount(n, ["Running {n} agent", "Running {n} agents"], ["يشغّل وكيلًا", "يشغّل وكيلين", "يشغّل {n} وكلاء", "يشغّل {n} وكيلًا"])
      : tr("Running agents", "يشغّل الوكلاء");
  },
  detail: (i) =>
    [i.title, i.template, ...(i.tasks ?? []).slice(0, 20).map((t) => `• ${t.task}`), ...(i.items ?? []).slice(0, 20).map((x) => `• ${x}`)]
      .filter(Boolean)
      .join("\n"),
  async run({ tasks, template, items, agent, title }, ctx) {
    if (!ctx.runSubAgent) return { ok: false, content: "Sub-agents can't start swarms of their own." };
    const jobs = [
      ...(tasks ?? []).map((t) => ({ task: t.task, agent: t.agent ?? agent })),
      ...(template && items ? items.map((item) => ({ task: template.replaceAll("{item}", item), agent })) : []),
    ];
    if (!jobs.length) return { ok: false, content: "Give `tasks`, or a `template` with `items`." };
    if (jobs.length > config.swarmMaxTasks) {
      return { ok: false, content: `That's ${jobs.length} tasks; the limit per call is ${config.swarmMaxTasks}. Split it up.` };
    }

    const resolved: { task: string; profile: AgentProfile | null; label: string }[] = [];
    const unknown = new Set<string>();
    for (const job of jobs) {
      const profile = job.agent ? findAgent(job.agent) : null;
      if (job.agent && !profile) unknown.add(job.agent);
      resolved.push({ task: job.task, profile, label: profile ? `${profile.emoji} ${profile.name}` : "Worker" });
    }
    if (unknown.size) {
      return { ok: false, content: `Unknown agent(s): ${[...unknown].join(", ")}. Use list_agents, create them first, or leave agent out.` };
    }

    const results: SubAgentResult[] = new Array(resolved.length);
    let done = 0;
    let failed = 0;
    const report = () =>
      ctx.progress(
        tr(`${done}/${resolved.length} done`, `اكتمل ${done}/${resolved.length}`) + (failed ? tr(` · ${failed} failed`, ` · فشل ${failed}`) : ""),
      );
    report();
    const runOne = (i: number) =>
      slots.run(async () => {
        if (ctx.signal.aborted) {
          results[i] = { ok: false, text: "Cancelled.", files: [] };
          return;
        }
        try {
          results[i] = await ctx.runSubAgent!(resolved[i].profile, resolved[i].task, ctx.signal);
        } catch (err) {
          results[i] = { ok: false, text: err instanceof Error ? err.message : String(err), files: [] };
        }
        done++;
        if (!results[i].ok) failed++;
        report();
      });
    await Promise.all(resolved.map((_, i) => runOne(i)));

    // Keep what goes back to the model within reason; the report file has everything.
    const budget = Math.max(1500, Math.min(20_000, Math.floor(160_000 / resolved.length)));
    let truncated = false;
    const section = (i: number, limit: number) => {
      const r = results[i];
      let body = r.text.trim() || "(no answer)";
      if (body.length > limit) {
        body = `${body.slice(0, limit)}… [cut; full text in the report]`;
        truncated = true;
      }
      return `## ${i + 1}. ${resolved[i].label}${r.ok ? "" : " — FAILED"}\n**Task:** ${resolved[i].task}\n\n${body}`;
    };
    const content = resolved.map((_, i) => section(i, budget)).join("\n\n---\n\n");

    const files: FileRecord[] = results.flatMap((r) => r.files);
    if (resolved.length > 3 || truncated) {
      const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
      const slug = (title ?? "swarm").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "swarm";
      const rel = `swarm-reports/${stamp}-${slug}.md`;
      fs.mkdirSync(path.join(WORKSPACE_DIR, "swarm-reports"), { recursive: true });
      const full = resolved.map((_, i) => section(i, Number.MAX_SAFE_INTEGER)).join("\n\n---\n\n");
      fs.writeFileSync(path.join(WORKSPACE_DIR, rel), `# ${title ?? "Swarm report"}\n\n${resolved.length} tasks, ${resolved.length - failed} succeeded.\n\n${full}\n`);
      files.unshift(registerGenerated(rel, ctx.conversationId));
    }
    return {
      ok: failed < resolved.length,
      content: `${resolved.length - failed} of ${resolved.length} tasks succeeded.\n\n${content}`,
      result: tr(`${resolved.length - failed}/${resolved.length} succeeded`, `نجح ${resolved.length - failed}/${resolved.length}`),
      files,
    };
  },
});

export const AGENT_TOOLS = [delegateTool, createAgentsTool, listAgentsTool, updateAgentTool, deleteAgentsTool];
