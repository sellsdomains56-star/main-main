import type { Express } from "express";
import { z } from "zod";
import { optionalAuth, requireAuth } from "../auth.js";
import { barberView, getBarber, HttpError, parse } from "../common.js";
import { db, newId, save } from "../db.js";
import { createTicket } from "./support.js";
import type { Reel } from "../types.js";

export function reelView(r: Reel, viewerId?: string) {
  const v = barberView(getBarber(r.barberId));
  return {
    id: r.id,
    videoUrl: r.videoUrl,
    posterUrl: r.posterUrl ?? null,
    caption: r.caption,
    likes: r.likedBy.length,
    likedByMe: !!viewerId && r.likedBy.includes(viewerId),
    savedByMe: !!viewerId && (r.savedBy ?? []).includes(viewerId),
    comments: (r.comments ?? []).length,
    views: r.views ?? 0,
    shares: r.shares ?? 0,
    createdAt: r.createdAt,
    barber: { id: v.id, name: v.name, photoUrl: v.photoUrl, city: v.city, rating: v.rating, ratingCount: v.ratingCount, startingPrice: v.startingPrice, currency: v.currency, offersHomeVisits: v.offersHomeVisits },
  };
}

function getReel(id: string) {
  const reel = db.reels.find((r) => r.id === id);
  if (!reel) throw new HttpError(404, "Reel not found.");
  return reel;
}

const toggle = (list: string[] | undefined, id: string) => ((list ?? []).includes(id) ? (list ?? []).filter((x) => x !== id) : [...(list ?? []), id]);

/** Instagram-style reels: feed, like, save, comments, views, share and report. */
export function registerReelRoutes(app: Express) {
  app.get("/reels", optionalAuth, (req, res) => {
    const q = parse(z.object({ country: z.string().optional(), city: z.string().optional(), barberId: z.string().optional() }), req.query);
    const barbersById = new Map(db.barbers.map((b) => [b.id, b]));
    const list = db.reels.filter((r) => {
      const b = barbersById.get(r.barberId);
      return b && (!q.barberId || b.id === q.barberId) && (!q.country || b.countryCode === q.country) && (!q.city || b.city === q.city);
    });
    // Newest first, with a boost for popular reels.
    const score = (r: Reel) => Date.parse(r.createdAt) / 3_600_000 + Math.log1p(r.likedBy.length) * 24;
    res.json(list.sort((a, b) => score(b) - score(a)).map((r) => reelView(r, req.user?.id)));
  });

  // The signed-in user's saved collection, newest reels first.
  app.get("/reels/saved", requireAuth, (req, res) => {
    const me = req.user!.id;
    res.json(db.reels.filter((r) => (r.savedBy ?? []).includes(me)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((r) => reelView(r, me)));
  });

  app.get("/reels/:id", optionalAuth, (req, res) => {
    res.json(reelView(getReel(String(req.params.id)), req.user?.id));
  });

  app.post("/reels/:id/like", requireAuth, (req, res) => {
    const reel = getReel(String(req.params.id));
    reel.likedBy = toggle(reel.likedBy, req.user!.id);
    save();
    res.json(reelView(reel, req.user!.id));
  });

  app.post("/reels/:id/save", requireAuth, (req, res) => {
    const reel = getReel(String(req.params.id));
    reel.savedBy = toggle(reel.savedBy, req.user!.id);
    save();
    res.json(reelView(reel, req.user!.id));
  });

  // Counted once per play by the app; anonymous views count too.
  app.post("/reels/:id/view", (req, res) => {
    const reel = getReel(String(req.params.id));
    reel.views = (reel.views ?? 0) + 1;
    save();
    res.status(204).end();
  });

  app.post("/reels/:id/share", (req, res) => {
    const reel = getReel(String(req.params.id));
    reel.shares = (reel.shares ?? 0) + 1;
    save();
    res.status(204).end();
  });

  app.get("/reels/:id/comments", optionalAuth, (req, res) => {
    const reel = getReel(String(req.params.id));
    const me = req.user?.id;
    res.json(
      [...(reel.comments ?? [])]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((c) => ({ id: c.id, name: c.name, text: c.text, likes: c.likedBy.length, likedByMe: !!me && c.likedBy.includes(me), mine: c.userId === me, createdAt: c.createdAt })),
    );
  });

  app.post("/reels/:id/comments", requireAuth, (req, res) => {
    const reel = getReel(String(req.params.id));
    const { text } = parse(z.object({ text: z.string().trim().min(1, "Write a comment first.").max(500) }), req.body);
    const user = req.user!;
    const isBarber = user.role === "barber" && user.barberId === reel.barberId;
    const comment = { id: newId(), userId: user.id, name: isBarber ? getBarber(reel.barberId).name : user.name.split(" ")[0], text, likedBy: [], createdAt: new Date().toISOString() };
    (reel.comments ??= []).push(comment);
    save();
    res.status(201).json({ id: comment.id, name: comment.name, text, likes: 0, likedByMe: false, mine: true, createdAt: comment.createdAt });
  });

  app.post("/reels/:id/comments/:cid/like", requireAuth, (req, res) => {
    const c = (getReel(String(req.params.id)).comments ?? []).find((x) => x.id === req.params.cid);
    if (!c) throw new HttpError(404, "Comment not found.");
    c.likedBy = toggle(c.likedBy, req.user!.id);
    save();
    res.json({ likes: c.likedBy.length, likedByMe: c.likedBy.includes(req.user!.id) });
  });

  // Your own comment, or any comment on your reel if you're the barber.
  app.delete("/reels/:id/comments/:cid", requireAuth, (req, res) => {
    const reel = getReel(String(req.params.id));
    const c = (reel.comments ?? []).find((x) => x.id === req.params.cid);
    if (!c || (c.userId !== req.user!.id && req.user!.barberId !== reel.barberId)) throw new HttpError(404, "Comment not found.");
    reel.comments = (reel.comments ?? []).filter((x) => x !== c);
    save();
    res.status(204).end();
  });

  // "Report" in the ⋯ menu goes to the support team as a ticket.
  app.post("/reels/:id/report", requireAuth, (req, res) => {
    const reel = getReel(String(req.params.id));
    const { reason } = parse(z.object({ reason: z.string().trim().min(1).max(200) }), req.body);
    createTicket({ userId: req.user!.id, name: req.user!.name, email: req.user!.email, topic: "other", message: `Reported reel ${reel.id} by ${getBarber(reel.barberId).name}: ${reason}`, source: "form" });
    res.status(201).json({ ok: true });
  });

  app.delete("/reels/:id", requireAuth, (req, res) => {
    const reel = db.reels.find((r) => r.id === req.params.id);
    if (!reel || reel.barberId !== req.user!.barberId) throw new HttpError(404, "Reel not found.");
    db.reels = db.reels.filter((r) => r !== reel);
    save();
    res.status(204).end();
  });
}
