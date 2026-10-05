import type { Express } from "express";
import { z } from "zod";
import { optionalAuth, requireAuth } from "../auth.js";
import { parse } from "../common.js";
import { db, newId, save } from "../db.js";
import { FAQ, SUPPORT_EMAIL } from "../faq.js";
import type { SupportTicket } from "../types.js";

export const TicketTopic = z.enum(["booking", "payment", "account", "barber", "shop", "other"]);

export function createTicket(t: Omit<SupportTicket, "id" | "status" | "createdAt">): SupportTicket {
  const ticket: SupportTicket = { ...t, id: newId(), status: "open", createdAt: new Date().toISOString() };
  db.tickets.push(ticket);
  save();
  // Hook point: forward to your helpdesk (Zendesk, Intercom, email…) here.
  console.log(`[support] new ${ticket.topic} ticket ${ticket.id} from ${ticket.email}`);
  return ticket;
}

export function registerSupportRoutes(app: Express) {
  app.get("/support/faq", (_req, res) => {
    res.json({ email: SUPPORT_EMAIL, faq: FAQ });
  });

  app.post("/support/tickets", optionalAuth, (req, res) => {
    const body = parse(
      z.object({
        name: z.string().trim().min(1).max(100).optional(),
        email: z.string().trim().toLowerCase().email().optional(),
        topic: TicketTopic,
        message: z.string().trim().min(10, "Please describe the problem (at least 10 characters)").max(4000),
        bookingId: z.string().optional(),
      }),
      req.body,
    );
    const user = req.user;
    const email = body.email ?? user?.email;
    if (!email) {
      res.status(400).json({ error: "Please enter your email so we can reply." });
      return;
    }
    const ticket = createTicket({
      userId: user?.id, name: body.name ?? user?.name ?? "Customer", email, topic: body.topic,
      message: body.message, bookingId: body.bookingId, source: "form",
    });
    res.status(201).json(ticket);
  });

  app.get("/support/tickets", requireAuth, (req, res) => {
    res.json(db.tickets.filter((t) => t.userId === req.user!.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  });
}
