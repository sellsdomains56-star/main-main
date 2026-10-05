import express, { type Express, type Request } from "express";
import { mkdirSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { barberView, getBarber, HttpError, parse } from "../common.js";
import { newId, save, UPLOADS_DIR } from "../db.js";

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic" };

/** Media must be something this API serves (uploads or bundled demo media). */
const MediaPath = z.string().regex(/^\/(uploads|media)\/[\w./-]+$/, "Upload the image first");

function myBarber(req: Request) {
  const user = req.user!;
  if (user.role !== "barber" || !user.barberId) throw new HttpError(403, "Only barbers can do this.");
  return getBarber(user.barberId);
}

/** Barbers manage their own profile photo, portfolio gallery and before/after transformations. */
export function registerPortfolioRoutes(app: Express) {
  app.post("/uploads/image", requireAuth, express.raw({ type: Object.keys(IMAGE_TYPES), limit: "15mb" }), (req, res) => {
    myBarber(req);
    const ext = IMAGE_TYPES[(req.header("content-type") ?? "").split(";")[0]];
    if (!ext || !Buffer.isBuffer(req.body) || req.body.length < 100) throw new HttpError(400, "Please attach a JPEG, PNG or WebP image.");
    const name = `${newId()}.${ext}`;
    mkdirSync(UPLOADS_DIR, { recursive: true });
    writeFileSync(new URL(name, UPLOADS_DIR), req.body);
    res.status(201).json({ url: `/uploads/${name}` });
  });

  app.patch("/barbers/me", requireAuth, (req, res) => {
    const barber = myBarber(req);
    const body = parse(
      z.object({
        photoUrl: MediaPath.optional(),
        bio: z.string().max(600).optional(),
        shopAddress: z.string().min(1).optional(),
        yearsExperience: z.number().int().min(0).max(70).optional(),
        languages: z.array(z.string().min(1).max(30)).max(10).optional(),
        specialties: z.array(z.string().min(1).max(40)).max(20).optional(),
        offersHomeVisits: z.boolean().optional(),
      }),
      req.body,
    );
    Object.assign(barber, body);
    save();
    res.json(barberView(barber));
  });

  app.post("/barbers/me/gallery", requireAuth, (req, res) => {
    const barber = myBarber(req);
    const body = parse(z.object({ url: MediaPath, caption: z.string().max(200).default("") }), req.body);
    barber.gallery.unshift({ id: newId(), url: body.url, caption: body.caption.trim() });
    save();
    res.status(201).json(barberView(barber));
  });

  app.delete("/barbers/me/gallery/:id", requireAuth, (req, res) => {
    const barber = myBarber(req);
    barber.gallery = barber.gallery.filter((p) => p.id !== req.params.id);
    save();
    res.json(barberView(barber));
  });

  app.post("/barbers/me/transformations", requireAuth, (req, res) => {
    const barber = myBarber(req);
    const body = parse(z.object({ beforeUrl: MediaPath, afterUrl: MediaPath, caption: z.string().max(200).default("") }), req.body);
    barber.transformations.unshift({ id: newId(), beforeUrl: body.beforeUrl, afterUrl: body.afterUrl, caption: body.caption.trim() });
    save();
    res.status(201).json(barberView(barber));
  });

  app.delete("/barbers/me/transformations/:id", requireAuth, (req, res) => {
    const barber = myBarber(req);
    barber.transformations = barber.transformations.filter((t) => t.id !== req.params.id);
    save();
    res.json(barberView(barber));
  });

}
