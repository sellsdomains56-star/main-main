import type { Express } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { parse } from "../common.js";
import { db, save } from "../db.js";

const PushToken = z.string().regex(/^Expo(nent)?PushToken\[[^\]]+\]$/, "Not an Expo push token");

/** The alerts inbox, and the phones that should receive push notifications. */
export function registerNotificationRoutes(app: Express) {
  app.get("/notifications", requireAuth, (req, res) => {
    const mine = db.notifications.filter((n) => n.userId === req.user!.id);
    res.json({
      unread: mine.filter((n) => !n.read).length,
      items: mine.slice(-50).reverse().map(({ userId: _u, ...n }) => n),
    });
  });

  app.post("/notifications/read", requireAuth, (req, res) => {
    const { ids } = parse(z.object({ ids: z.array(z.string()).optional() }), req.body ?? {});
    for (const n of db.notifications) if (n.userId === req.user!.id && (!ids || ids.includes(n.id))) n.read = true;
    save();
    res.status(204).end();
  });

  app.post("/me/push-tokens", requireAuth, (req, res) => {
    const { token } = parse(z.object({ token: PushToken }), req.body);
    // A phone belongs to whoever signed in on it last.
    for (const u of db.users) if (u.pushTokens?.includes(token)) u.pushTokens = u.pushTokens.filter((t) => t !== token);
    req.user!.pushTokens = [...(req.user!.pushTokens ?? []), token].slice(-5);
    save();
    res.status(204).end();
  });

  app.delete("/me/push-tokens", requireAuth, (req, res) => {
    const { token } = parse(z.object({ token: PushToken }), req.body);
    req.user!.pushTokens = (req.user!.pushTokens ?? []).filter((t) => t !== token);
    save();
    res.status(204).end();
  });
}
