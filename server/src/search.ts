import { availableToday, barberView, cityOf, findCountry } from "./common.js";
import { db } from "./db.js";
import { availableSlots } from "./slots.js";
import type { Barber } from "./types.js";

export interface BarberFilters {
  country?: string; // ISO code; omit to search worldwide
  city?: string;
  q?: string; // free text: name, style, city or country
  specialties?: string[]; // match any
  minRating?: number;
  maxPrice?: number; // minor units, compared with the barber's starting price (in their own currency)
  availableToday?: boolean;
  availableOn?: string; // YYYY-MM-DD in the barber's local time
  homeVisits?: boolean;
  sort?: "rating" | "price" | "soonest" | "experience";
  limit?: number;
}

const rating = (b: Barber) => (b.ratingCount ? b.ratingSum / b.ratingCount : 0);

function matchesText(b: Barber, q: string) {
  const country = findCountry(b.countryCode);
  const haystack = [b.name, b.city, country?.name ?? "", b.bio, ...b.specialties, ...b.languages].join(" ").toLowerCase();
  // Every word must appear somewhere, so "fade london" finds London barbers who do fades.
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word) || haystack.includes(word.replace(/s$/, "")));
}

function freeOn(b: Barber, date: string) {
  const shortest = Math.min(...b.services.map((s) => s.durationMin));
  return availableSlots(b, cityOf(b).timeZone, date, shortest, db.bookings).length > 0;
}

export function searchBarbers(f: BarberFilters) {
  const list = db.barbers.filter(
    (b) =>
      (!f.country || b.countryCode === f.country) &&
      (!f.city || b.city.toLowerCase() === f.city.toLowerCase()) &&
      (!f.specialties?.length || f.specialties.some((s) => b.specialties.includes(s))) &&
      (!f.minRating || rating(b) >= f.minRating) &&
      (!f.maxPrice || Math.min(...b.services.map((s) => s.price)) <= f.maxPrice) &&
      (!f.homeVisits || b.offersHomeVisits) &&
      (!f.q || matchesText(b, f.q)) &&
      (!f.availableToday || availableToday(b)) &&
      (!f.availableOn || freeOn(b, f.availableOn)),
  );
  const views = list.map(barberView);
  const byRating = (a: (typeof views)[number], b: (typeof views)[number]) => (b.rating ?? 0) - (a.rating ?? 0) || b.ratingCount - a.ratingCount;
  switch (f.sort ?? "rating") {
    case "price":
      views.sort((a, b) => a.startingPrice - b.startingPrice);
      break;
    case "soonest":
      views.sort((a, b) => (a.nextAvailable ?? "9999").localeCompare(b.nextAvailable ?? "9999") || byRating(a, b));
      break;
    case "experience":
      views.sort((a, b) => b.yearsExperience - a.yearsExperience || byRating(a, b));
      break;
    default:
      views.sort(byRating);
  }
  return f.limit ? views.slice(0, f.limit) : views;
}

/** Every specialty offered on the platform, most common first. */
export function allSpecialties() {
  const counts = new Map<string, number>();
  for (const b of db.barbers) for (const s of b.specialties) counts.set(s, (counts.get(s) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([s]) => s);
}
