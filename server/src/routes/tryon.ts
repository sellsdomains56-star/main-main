import type { Express } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { HttpError, parse } from "../common.js";
import { config } from "../config.js";
import { renderTryOn, TryOnUnavailableError } from "../tryon.js";

// Per-user daily counter (resets when the server restarts; move to the database for production).
const usage = new Map<string, { day: string; count: number }>();

export function registerTryOnRoutes(app: Express) {
  app.post("/ai/tryon/preview", requireAuth, async (req, res) => {
    const body = parse(
      z.object({
        imageBase64: z.string().min(100),
        mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
        look: z.string().trim().min(3, "Describe the look").max(500),
      }),
      req.body,
    );
    if (!config.openaiConfigured) throw new HttpError(503, "Try-on previews aren't switched on for this server yet.");

    const day = new Date().toISOString().slice(0, 10);
    const used = usage.get(req.user!.id);
    const count = used?.day === day ? used.count : 0;
    if (count >= config.tryOnDailyLimit) throw new HttpError(429, `You've reached today's limit of ${config.tryOnDailyLimit} previews. Come back tomorrow!`);

    try {
      const image = await renderTryOn({ data: body.imageBase64.replace(/^data:[^,]+,/, ""), mediaType: body.mediaType }, body.look);
      usage.set(req.user!.id, { day, count: count + 1 });
      res.json({ image, remainingToday: config.tryOnDailyLimit - count - 1 });
    } catch (err) {
      if (err instanceof TryOnUnavailableError) throw new HttpError(503, err.message);
      if (err instanceof OpenAI.RateLimitError) throw new HttpError(429, "Lots of people are trying on styles right now — please try again in a minute.");
      if (err instanceof OpenAI.BadRequestError) {
        // Usually the safety system rejecting the photo or prompt.
        throw new HttpError(422, "We couldn't create a preview from this photo. Try a clear, well-lit photo of your head and shoulders.");
      }
      if (err instanceof OpenAI.APIError) {
        console.error("try-on API error", err.status, err.message);
        throw new HttpError(502, "The preview couldn't be created just now. Please try again.");
      }
      throw err;
    }
  });
}
