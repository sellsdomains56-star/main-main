import { z } from "zod";
import { busy } from "./busy.js";
import { cityOf, CONSULTATION, findCountry, findService, getBarber, HttpError } from "./common.js";
import { config } from "./config.js";
import { db, newId, save } from "./db.js";
import { bookingConfirmed } from "./notify.js";
import { createPaymentIntent } from "./payments.js";
import { SHOPS } from "./seed.js";
import { availableSlots } from "./slots.js";
import type { Booking } from "./types.js";

export function bookingView(b: Booking) {
  const barber = getBarber(b.barberId);
  const customer = db.users.find((u) => u.id === b.customerId);
  const shop = b.locationType === "shop" && barber.shopId ? SHOPS.find((s) => s.id === barber.shopId) : undefined;
  return {
    ...b,
    paymentIntentId: undefined,
    barber: { id: barber.id, name: barber.name, photoUrl: barber.photoUrl, city: barber.city, timeZone: cityOf(barber).timeZone },
    shop: shop ? { id: shop.id, name: shop.name } : null,
    customerName: customer?.name ?? "Customer",
    service: findService(barber, b.serviceId) ?? (b.serviceId === CONSULTATION.id ? CONSULTATION : undefined),
    // Video consultations: the barber's Google Meet link, once the booking is confirmed.
    videoLink: b.locationType === "video" && ["confirmed", "on_the_way"].includes(b.status) ? barber.videoLink ?? null : null,
  };
}

export const NewBooking = z.object({
  barberId: z.string(),
  serviceId: z.string(),
  startsAt: z.string().datetime(),
  locationType: z.enum(["shop", "home", "video", "phone"]),
  address: z.string().default(""),
  phone: z.string().trim().max(30).default(""),
  notes: z.string().max(1000).default(""),
});

/** Checks the slot is still free, stores the booking and starts the payment (free consultations confirm straight away). */
export async function placeBooking(customerId: string, body: z.infer<typeof NewBooking>): Promise<{ booking: Booking; clientSecret: string | null }> {
  const barber = getBarber(body.barberId);
  const service = findService(barber, body.serviceId);
  if (!service) throw new HttpError(404, "Service not found.");
  const consultation = service.id === CONSULTATION.id;
  const remote = body.locationType === "video" || body.locationType === "phone";
  if (consultation !== remote) {
    throw new HttpError(400, consultation ? "Consultations are by video call or phone." : "Choose the shop or your place for this service.");
  }
  if (body.locationType === "home" && !barber.offersHomeVisits) throw new HttpError(400, "This barber doesn't do home visits.");
  if (body.locationType === "home" && !body.address.trim()) throw new HttpError(400, "Please enter the address the barber should come to.");
  if (body.locationType === "phone" && body.phone.replace(/[^\d]/g, "").length < 6) throw new HttpError(400, "Please enter the phone number your barber should call.");

  const tz = cityOf(barber).timeZone;
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(body.startsAt));
  const free = availableSlots(barber, tz, date, service.durationMin, busy());
  if (!free.includes(new Date(body.startsAt).toISOString())) throw new HttpError(409, "That time was just taken — please pick another slot.");

  const start = new Date(body.startsAt);
  const booking: Booking = {
    id: newId(),
    customerId,
    barberId: barber.id,
    serviceId: service.id,
    startsAt: start.toISOString(),
    endsAt: new Date(start.getTime() + service.durationMin * 60_000).toISOString(),
    locationType: body.locationType,
    address: body.locationType === "home" ? body.address.trim() : body.locationType === "shop" ? barber.shopAddress : body.locationType === "video" ? "Video call · Google Meet" : "Phone call",
    phone: body.locationType === "phone" ? body.phone : undefined,
    notes: body.notes,
    amount: service.price + (body.locationType === "home" ? barber.homeVisitFee : 0),
    currency: findCountry(barber.countryCode)!.currency,
    status: "pending_payment",
    reviewed: false,
    createdAt: new Date().toISOString(),
  };
  // Free bookings (consultations) are confirmed straight away — nothing to pay.
  if (booking.amount === 0) {
    booking.status = "confirmed";
    db.bookings.push(booking);
    bookingConfirmed(booking);
    save();
    return { booking, clientSecret: null };
  }
  const intent = await createPaymentIntent(`booking-${booking.id}`, booking.amount, booking.currency, {
    kind: "booking",
    bookingId: booking.id,
    barberId: booking.barberId,
    platformFee: String(Math.round((booking.amount * config.platformFeePercent) / 100)),
  });
  booking.paymentIntentId = intent?.id;
  db.bookings.push(booking);
  save();
  return { booking, clientSecret: intent?.clientSecret ?? null };
}
