import Anthropic from "@anthropic-ai/sdk";
import type { Express, Request } from "express";
import { z } from "zod";
import { AssistantRefusedError, runAssistantTurn } from "../assistant.js";
import { optionalAuth } from "../auth.js";
import { HttpError, parse } from "../common.js";
import { config } from "../config.js";
import { db, newId, save } from "../db.js";
import type { Conversation } from "../types.js";

/** Signed-in users own conversations by user id; guests by a random key their device keeps. */
function ownerKey(req: Request) {
  if (req.user) return `user:${req.user.id}`;
  const key = req.header("x-guest-key");
  if (!key || key.length < 16) throw new HttpError(400, "Missing guest key.");
  return `guest:${key}`;
}

const busy = new Set<string>(); // one turn at a time per conversation keeps the history append-only

export function registerAssistantRoutes(app: Express) {
  app.get("/assistant/conversations/:id", optionalAuth, (req, res) => {
    const convo = db.conversations.find((c) => c.id === req.params.id && c.ownerKey === ownerKey(req));
    if (!convo) throw new HttpError(404, "Conversation not found.");
    res.json({ id: convo.id, display: convo.display });
  });

  app.post("/assistant/chat", optionalAuth, async (req, res) => {
    const body = parse(
      z.object({
        conversationId: z.string().optional(),
        message: z.string().trim().min(1).max(2000),
        country: z.string().optional(),
        city: z.string().optional(),
      }),
      req.body,
    );
    const key = ownerKey(req);
    if (!config.anthropicConfigured) throw new HttpError(503, "The assistant isn't configured on this server yet.");

    let convo: Conversation | undefined;
    if (body.conversationId) {
      convo = db.conversations.find((c) => c.id === body.conversationId && c.ownerKey === key);
      if (!convo) throw new HttpError(404, "Conversation not found.");
    } else {
      const now = new Date().toISOString();
      convo = { id: newId(), ownerKey: key, messages: [], display: [], createdAt: now, updatedAt: now };
      db.conversations.push(convo);
    }
    if (busy.has(convo.id)) throw new HttpError(409, "Still answering your last message.");
    busy.add(convo.id);

    const history = convo.messages as Anthropic.Beta.Messages.BetaMessageParam[];
    const before = history.length;
    try {
      const { reply, actions } = await runAssistantTurn(history, body.message, { user: req.user, country: body.country, city: body.city });
      const at = new Date().toISOString();
      convo.display.push({ role: "user", text: body.message, at }, { role: "assistant", text: reply, actions, at });
      convo.updatedAt = at;
      save();
      res.json({ conversationId: convo.id, reply, actions });
    } catch (err) {
      history.length = before; // drop the unfinished turn; earlier history is untouched
      if (!convo.display.length) db.conversations = db.conversations.filter((c) => c !== convo);
      if (err instanceof AssistantRefusedError) throw new HttpError(422, err.message);
      if (err instanceof Anthropic.RateLimitError) throw new HttpError(429, "The assistant is busy right now — please try again in a minute.");
      if (err instanceof Anthropic.APIError) {
        console.error("assistant API error", err.status, err.message);
        throw new HttpError(502, "The assistant couldn't answer just now. Please try again.");
      }
      throw err;
    } finally {
      busy.delete(convo.id);
    }
  });
}
