import { findModel } from "../config.js";
import { addMessage, deleteMessage, getAgent, getConversation, getFile, getSettings, listMessages } from "../db.js";
import { broadcast } from "../events.js";
import { startRun, type ActiveRun } from "../runs.js";
import type { Effort, FileRecord } from "../types.js";
import { turnContext } from "./prompt.js";
import { runTurn } from "./run.js";
import { autoTitle } from "./title.js";

export interface SendOptions {
  conversationId: string;
  text: string;
  attachmentIds?: string[];
  model?: string;
  effort?: Effort;
  /** Sent by the scheduler rather than typed. */
  scheduled?: boolean;
}

function resolveModelAndEffort(conversationId: string, model?: string, effort?: Effort) {
  const conversation = getConversation(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  const agent = conversation.agentId ? getAgent(conversation.agentId) : null;
  const settings = getSettings();
  return {
    agent,
    model: findModel(model || agent?.model || settings.defaultModel),
    effort: effort ?? agent?.effort ?? settings.effort,
  };
}

function launch(conversationId: string, model: ReturnType<typeof findModel>, effort: Effort, agent: ReturnType<typeof getAgent>): ActiveRun {
  const run = startRun(conversationId, async (active) => {
    broadcast({ type: "conversation", conversationId, running: true });
    try {
      const history = listMessages(conversationId);
      const reply = await runTurn({ conversationId, model, effort, agent, history, signal: active.controller.signal, emit: active.push });
      const firstUser = history.find((m) => m.role === "user");
      if (firstUser && reply.status === "complete") {
        const title = await autoTitle(conversationId, firstUser.text || firstUser.attachments?.map((a) => a.name).join(", ") || "", reply.text, model);
        if (title) active.push({ type: "title", title });
      }
    } finally {
      broadcast({ type: "conversation", conversationId, running: false });
    }
  });
  return run;
}

/** Saves your message and starts the agent on it. */
export function sendMessage(opts: SendOptions): ActiveRun {
  const { agent, model, effort } = resolveModelAndEffort(opts.conversationId, opts.model, opts.effort);
  const attachments = (opts.attachmentIds ?? [])
    .map((id) => getFile(id))
    .filter((f): f is FileRecord & { path: string } => !!f)
    .map(({ path: _path, ...f }) => f);
  addMessage(opts.conversationId, "user", {
    text: opts.text,
    attachments: attachments.length ? attachments : undefined,
    context: turnContext(),
    scheduled: opts.scheduled || undefined,
  });
  return launch(opts.conversationId, model, effort, agent);
}

/** Drops the last reply and asks again, optionally with another model. */
export function regenerate(conversationId: string, model?: string, effort?: Effort): ActiveRun {
  const messages = listMessages(conversationId);
  const last = messages.at(-1);
  if (!last) throw new Error("Nothing to regenerate");
  if (last.role === "assistant") deleteMessage(last.id);
  const resolved = resolveModelAndEffort(conversationId, model, effort);
  return launch(conversationId, resolved.model, resolved.effort, resolved.agent);
}
