import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { barberView, cityOf, findCountry, getBarber, HttpError } from "./common.js";
import { db } from "./db.js";
import { FAQ, SUPPORT_EMAIL } from "./faq.js";
import { createTicket, TicketTopic } from "./routes/support.js";
import { searchBarbers } from "./search.js";
import { availableSlots } from "./slots.js";
import type { User } from "./types.js";

type MessageParam = Anthropic.Beta.Messages.BetaMessageParam;
type Tool = Anthropic.Beta.Messages.BetaTool;

const client = new Anthropic();
const MODEL = "claude-opus-5-5";
const MAX_TOOL_ROUNDS = 8;

/** Things the app renders under the assistant's reply: barber cards, a "review & book" button, a ticket receipt. */
export type AssistantAction =
  | { type: "barbers"; barberIds: string[] }
  | { type: "book"; barberId: string; serviceId: string; startsAt: string; locationType: "shop" | "home" }
  | { type: "ticket"; ticketId: string };

// The system prompt and tool list never change during a conversation, so the history stays
// append-only (required for thinking blocks to remain valid) and the prompt cache stays warm.
const SYSTEM = `You are the JB Always Fresh concierge — the in-app assistant for a global barber and hairstyling platform where people discover, compare and book barbers anywhere in the world, shop JB's Fresh grooming products, and preview hairstyles with the AI Try-On.

How to help:
- Find and recommend barbers with search_barbers. Ask for the city if you don't know where the customer is (a context note on each message tells you their chosen city, if any). Recommend at most 3 barbers and say briefly why each fits (rating, specialty, price, next availability, home visits).
- Use get_barber for details (services, prices, reviews, address, languages, experience) and check_availability for free times. Times are in the barber's local time zone — always say so.
- To book: once the customer has chosen a barber, service, time and shop-or-home, call prepare_booking. It does NOT book or charge anything — it shows the customer a "Review & book" button so they confirm and pay themselves. Never claim a booking is made.
- For their existing appointments use list_my_bookings (they must be signed in).
- If something needs a human (refund dispute, no-show, account deletion, a complaint, anything you can't resolve), offer to open a support ticket and call create_support_ticket once they agree. Support also answers at ${SUPPORT_EMAIL}.
- For hairstyle ideas, suggest the AI Try-On (Home → AI Stylist): upload a photo, get recommendations and realistic previews, then find barbers for the look.

Style: warm, confident, brief — this is a chat on a phone. Use short paragraphs or a few bullets, no tables, no markdown headings. Prices: always with the currency shown in tool results. Never invent barbers, prices, times, policies or reviews — only state what tools or the help centre below say; if you don't know, say so and offer support.

Help centre (official policies):
${FAQ.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}`;

const TOOLS: Tool[] = [
  {
    name: "search_barbers",
    description:
      "Search barbers worldwide. Combine any filters. Returns up to 8 barbers with id, rating, starting price, specialties, next available time and whether they do home visits.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text: style, name, city or country, e.g. 'skin fade', 'braids lagos'" },
        country_code: { type: "string", description: "ISO 3166-1 alpha-2 code, e.g. GB, DE, AE" },
        city: { type: "string", description: "City name exactly as the platform lists it, e.g. London, New York, São Paulo" },
        specialties: { type: "array", items: { type: "string" }, description: "Match any of these specialties, e.g. ['skin fade','beard']" },
        min_rating: { type: "number", description: "Minimum average star rating, 1-5" },
        max_price: { type: "number", description: "Maximum starting price in the barber's currency, in major units (e.g. 25 for €25)" },
        available_today: { type: "boolean" },
        home_visits: { type: "boolean", description: "Only barbers who come to the customer" },
        sort: { type: "string", enum: ["rating", "price", "soonest", "experience"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_barber",
    description: "Full profile of one barber: bio, services with ids and prices, address, languages, years of experience, recent reviews, next available time.",
    input_schema: {
      type: "object",
      properties: { barber_id: { type: "string" } },
      required: ["barber_id"],
      additionalProperties: false,
    },
  },
  {
    name: "check_availability",
    description: "Free start times for a barber's service on a date (barber's local time).",
    input_schema: {
      type: "object",
      properties: {
        barber_id: { type: "string" },
        service_id: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD in the barber's local time" },
      },
      required: ["barber_id", "service_id", "date"],
      additionalProperties: false,
    },
  },
  {
    name: "list_my_bookings",
    description: "The signed-in customer's upcoming and recent bookings.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "prepare_booking",
    description:
      "Shows the customer a 'Review & book' button pre-filled with this choice. Does not book or charge. Only call after the customer chose barber, service, time and shop/home.",
    input_schema: {
      type: "object",
      properties: {
        barber_id: { type: "string" },
        service_id: { type: "string" },
        starts_at: { type: "string", description: "Exact ISO start time as returned by check_availability" },
        location_type: { type: "string", enum: ["shop", "home"] },
      },
      required: ["barber_id", "service_id", "starts_at", "location_type"],
      additionalProperties: false,
    },
  },
  {
    name: "create_support_ticket",
    description: "Open a ticket for the human support team. Only after the customer agrees. Include all details they gave.",
    input_schema: {
      type: "object",
      properties: {
        topic: { type: "string", enum: TicketTopic.options as unknown as string[] },
        message: { type: "string", description: "Clear summary of the problem and what the customer wants" },
        email: { type: "string", description: "Customer email — required only if they are not signed in" },
        booking_id: { type: "string" },
      },
      required: ["topic", "message"],
      additionalProperties: false,
    },
  },
];

const inputs = {
  search_barbers: z.object({
    query: z.string().optional(),
    country_code: z.string().optional(),
    city: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    min_rating: z.number().optional(),
    max_price: z.number().optional(),
    available_today: z.boolean().optional(),
    home_visits: z.boolean().optional(),
    sort: z.enum(["rating", "price", "soonest", "experience"]).optional(),
  }),
  get_barber: z.object({ barber_id: z.string() }),
  check_availability: z.object({ barber_id: z.string(), service_id: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  list_my_bookings: z.object({}),
  prepare_booking: z.object({ barber_id: z.string(), service_id: z.string(), starts_at: z.string(), location_type: z.enum(["shop", "home"]) }),
  create_support_ticket: z.object({ topic: TicketTopic, message: z.string().min(5), email: z.string().email().optional(), booking_id: z.string().optional() }),
};

const fmtMoney = (minor: number, currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);
const fmtLocal = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));

function summary(v: ReturnType<typeof barberView>) {
  return {
    id: v.id,
    name: v.name,
    location: `${v.city}, ${v.countryName}`,
    rating: v.rating ? `${v.rating} (${v.ratingCount} reviews)` : "new",
    from: fmtMoney(v.startingPrice, v.currency),
    specialties: v.specialties,
    years_experience: v.yearsExperience,
    home_visits: v.offersHomeVisits,
    next_available: v.nextAvailable ? `${fmtLocal(v.nextAvailable, v.timeZone)} (${v.city} time)` : "nothing in the next 2 weeks",
  };
}

export interface TurnContext {
  user?: User;
  actions: AssistantAction[];
}

export async function runTool(name: string, raw: unknown, ctx: TurnContext): Promise<unknown> {
  switch (name) {
    case "search_barbers": {
      const i = inputs.search_barbers.parse(raw);
      const results = searchBarbers({
        q: i.query,
        country: i.country_code?.toUpperCase(),
        city: i.city,
        specialties: i.specialties,
        minRating: i.min_rating,
        maxPrice: i.max_price ? Math.round(i.max_price * 100) : undefined,
        availableToday: i.available_today,
        homeVisits: i.home_visits,
        sort: i.sort,
        limit: 8,
      });
      if (results.length) ctx.actions.push({ type: "barbers", barberIds: results.slice(0, 3).map((b) => b.id) });
      return results.length ? results.map(summary) : "No barbers match. Try fewer filters or a nearby city.";
    }
    case "get_barber": {
      const i = inputs.get_barber.parse(raw);
      const b = getBarber(i.barber_id);
      const v = barberView(b);
      const reviews = db.reviews.filter((r) => r.barberId === b.id).slice(-3).map((r) => ({ rating: r.rating, comment: r.comment }));
      ctx.actions.push({ type: "barbers", barberIds: [b.id] });
      return {
        ...summary(v),
        bio: v.bio,
        languages: v.languages,
        shop_address: v.shopAddress,
        home_visit_fee: v.offersHomeVisits ? fmtMoney(v.homeVisitFee, v.currency) : null,
        services: v.services.map((s) => ({ id: s.id, name: s.name, minutes: s.durationMin, price: fmtMoney(s.price, v.currency) })),
        portfolio: `${v.gallery.length} photos, ${v.transformations.length} before-and-after transformations`,
        recent_reviews: reviews,
        time_zone: v.timeZone,
      };
    }
    case "check_availability": {
      const i = inputs.check_availability.parse(raw);
      const b = getBarber(i.barber_id);
      const service = b.services.find((s) => s.id === i.service_id);
      if (!service) throw new HttpError(404, "Unknown service id — call get_barber for the list.");
      const tz = cityOf(b).timeZone;
      const slots = availableSlots(b, tz, i.date, service.durationMin, db.bookings);
      return slots.length
        ? { time_zone: tz, free_times: slots.map((s) => ({ starts_at: s, local: fmtLocal(s, tz) })) }
        : "No free times that day. Try another date.";
    }
    case "list_my_bookings": {
      if (!ctx.user) return "The customer is not signed in. Ask them to sign in (Account tab) to see bookings.";
      const mine = db.bookings.filter((b) => b.customerId === ctx.user!.id).slice(-10);
      if (!mine.length) return "No bookings yet.";
      return mine.map((bk) => {
        const b = getBarber(bk.barberId);
        const tz = cityOf(b).timeZone;
        return {
          booking_id: bk.id,
          barber: b.name,
          service: b.services.find((s) => s.id === bk.serviceId)?.name,
          when: `${fmtLocal(bk.startsAt, tz)} (${b.city} time)`,
          where: bk.address,
          status: bk.status,
          paid: fmtMoney(bk.amount, bk.currency),
        };
      });
    }
    case "prepare_booking": {
      const i = inputs.prepare_booking.parse(raw);
      const b = getBarber(i.barber_id);
      const service = b.services.find((s) => s.id === i.service_id);
      if (!service) throw new HttpError(404, "Unknown service id.");
      if (i.location_type === "home" && !b.offersHomeVisits) throw new HttpError(400, "This barber doesn't do home visits.");
      const tz = cityOf(b).timeZone;
      const start = new Date(i.starts_at);
      const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(start);
      if (!availableSlots(b, tz, date, service.durationMin, db.bookings).includes(start.toISOString())) {
        throw new HttpError(409, "That time is no longer free — check availability again.");
      }
      ctx.actions.push({ type: "book", barberId: b.id, serviceId: service.id, startsAt: start.toISOString(), locationType: i.location_type });
      return "A 'Review & book' button is now shown under your message. The customer confirms the details and pays there.";
    }
    case "create_support_ticket": {
      const i = inputs.create_support_ticket.parse(raw);
      const email = ctx.user?.email ?? i.email;
      if (!email) return "Need the customer's email address first — ask them for it.";
      const ticket = createTicket({
        userId: ctx.user?.id, name: ctx.user?.name ?? "Customer", email, topic: i.topic,
        message: i.message, bookingId: i.booking_id, source: "assistant",
      });
      ctx.actions.push({ type: "ticket", ticketId: ticket.id });
      return { ticket_id: ticket.id, reply_to: email, note: "Support usually replies within 24 hours." };
    }
    default:
      throw new HttpError(400, `Unknown tool ${name}`);
  }
}

export class AssistantRefusedError extends Error {}

/**
 * Runs one customer turn: appends the user's message to `history` (in place, append-only),
 * loops through tool calls, and returns the reply text plus UI actions. On failure the caller
 * restores the history length it had before the turn, so nothing half-finished is kept.
 */
export async function runAssistantTurn(
  history: MessageParam[],
  message: string,
  context: { user?: User; country?: string; city?: string },
): Promise<{ reply: string; actions: AssistantAction[] }> {
  const where = context.city
    ? `${context.city}, ${findCountry(context.country ?? "")?.name ?? context.country ?? ""}`
    : context.country
      ? findCountry(context.country)?.name ?? context.country
      : "not chosen";
  const note = `[Context — today: ${new Date().toISOString().slice(0, 10)}; customer's chosen city: ${where}; signed in: ${context.user ? `yes, as ${context.user.name.split(" ")[0]}` : "no"}]`;
  history.push({ role: "user", content: [{ type: "text", text: note }, { type: "text", text: message }] });

  const ctx: TurnContext = { user: context.user, actions: [] };
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM,
      tools: TOOLS,
      cache_control: { type: "ephemeral" },
      messages: history,
    });

    if (response.stop_reason === "refusal") throw new AssistantRefusedError("I can't help with that one. Try asking another way, or contact support.");
    history.push({ role: "assistant", content: response.content });

    const toolUses = response.content.filter((b): b is Anthropic.Beta.Messages.BetaToolUseBlock => b.type === "tool_use");
    if (response.stop_reason !== "tool_use" || !toolUses.length) {
      const reply = response.content
        .filter((b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { reply: reply || "Sorry — I lost my train of thought. Could you say that again?", actions: dedupe(ctx.actions) };
    }

    const results: Anthropic.Beta.Messages.BetaToolResultBlockParam[] = [];
    for (const use of toolUses) {
      try {
        const out = await runTool(use.name, use.input, ctx);
        results.push({ type: "tool_result", tool_use_id: use.id, content: typeof out === "string" ? out : JSON.stringify(out) });
      } catch (err) {
        const msg = err instanceof z.ZodError ? `Invalid input: ${err.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}` : (err as Error).message;
        results.push({ type: "tool_result", tool_use_id: use.id, content: msg, is_error: true });
      }
    }
    history.push({ role: "user", content: results });
  }
  return { reply: "That took more steps than expected — could you narrow it down a little?", actions: dedupe(ctx.actions) };
}

function dedupe(actions: AssistantAction[]): AssistantAction[] {
  // Keep the latest barber list only, plus every booking/ticket action.
  const lastBarbers = [...actions].reverse().find((a) => a.type === "barbers");
  return [...(lastBarbers ? [lastBarbers] : []), ...actions.filter((a) => a.type !== "barbers")];
}
