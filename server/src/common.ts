import { z } from "zod";
import { db } from "./db.js";
import { COUNTRIES } from "./seed.js";
import { availableSlots } from "./slots.js";
import type { Barber, Service } from "./types.js";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const findCountry = (code: string) => COUNTRIES.find((c) => c.code === code);

export function cityOf(barber: Barber) {
  const city = findCountry(barber.countryCode)?.cities.find((c) => c.name === barber.city);
  if (!city) throw new HttpError(500, `Unknown city for barber ${barber.id}`);
  return city;
}

export function getBarber(id: string): Barber {
  const barber = db.barbers.find((b) => b.id === id);
  if (!barber) throw new HttpError(404, "Barber not found.");
  return barber;
}

/** The free consultation every barber offers unless they turn it off: a 15-minute video or phone call. */
export const CONSULTATION: Service = { id: "consultation", name: "Free consultation", durationMin: 15, price: 0 };

export const offersConsultations = (b: Barber) => b.offersConsultations !== false;

/** A barber's service by id, including the free consultation. */
export function findService(b: Barber, serviceId: string): Service | undefined {
  if (serviceId === CONSULTATION.id) return offersConsultations(b) ? CONSULTATION : undefined;
  return b.services.find((s) => s.id === serviceId);
}

export function barberView(b: Barber) {
  const country = findCountry(b.countryCode)!;
  return {
    id: b.id,
    name: b.name,
    bio: b.bio,
    photoUrl: b.photoUrl,
    countryCode: b.countryCode,
    countryName: country.name,
    city: b.city,
    timeZone: cityOf(b).timeZone,
    shopAddress: b.shopAddress,
    specialties: b.specialties,
    services: b.services,
    offersHomeVisits: b.offersHomeVisits,
    homeVisitFee: b.homeVisitFee,
    offersConsultations: offersConsultations(b),
    hasVideoLink: !!b.videoLink,
    currency: country.currency,
    rating: b.ratingCount ? Math.round((b.ratingSum / b.ratingCount) * 10) / 10 : null,
    ratingCount: b.ratingCount,
    startingPrice: Math.min(...b.services.map((s) => s.price)),
    yearsExperience: b.yearsExperience,
    languages: b.languages,
    gallery: b.gallery,
    transformations: b.transformations,
    nextAvailable: nextAvailable(b),
  };
}

/** Local calendar dates (YYYY-MM-DD) for the next `days` days in a time zone. */
export function upcomingDates(timeZone: string, days: number, from = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone });
  return Array.from({ length: days }, (_, i) => fmt.format(new Date(from.getTime() + i * 86_400_000)));
}

/** Earliest bookable start (ISO) for the barber's shortest service in the next two weeks, or null. */
export function nextAvailable(b: Barber, now = new Date()): string | null {
  const tz = cityOf(b).timeZone;
  const shortest = Math.min(...b.services.map((s) => s.durationMin));
  for (const date of upcomingDates(tz, 14, now)) {
    const slots = availableSlots(b, tz, date, shortest, db.bookings, now);
    if (slots.length) return slots[0];
  }
  return null;
}

/** True if the barber has any free slot on their local "today". */
export function availableToday(b: Barber, now = new Date()): boolean {
  const tz = cityOf(b).timeZone;
  const shortest = Math.min(...b.services.map((s) => s.durationMin));
  return availableSlots(b, tz, upcomingDates(tz, 1, now)[0], shortest, db.bookings, now).length > 0;
}

export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new HttpError(400, result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  return result.data;
}
