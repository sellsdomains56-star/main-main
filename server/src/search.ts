import { busy } from "./busy.js";
import { availableToday, barberView, cityOf, findCountry, isLive, mainServices } from "./common.js";
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
  openNow?: boolean; // working right now in their own time zone
  near?: { lat: number; lng: number }; // the customer's position: adds distanceKm, and sort "nearest" uses it
  sort?: "rating" | "price" | "soonest" | "experience" | "nearest";
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

/** Straight-line distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lng - a.lng) * rad) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Open right now: a working day, inside opening hours, not off or switched off by their shop. */
export function openNow(b: Barber, now = new Date()) {
  const tz = cityOf(b).timeZone;
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(now).map((p) => [p.type, p.value]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday!);
  const hour = Number(parts.hour);
  return !b.offline && b.workingDays.includes(day) && hour >= b.openHour && hour < b.closeHour && !(b.timeOff ?? []).includes(`${parts.year}-${parts.month}-${parts.day}`);
}

function freeOn(b: Barber, date: string) {
  const shortest = Math.min(...mainServices(b).map((s) => s.durationMin));
  return availableSlots(b, cityOf(b).timeZone, date, shortest, busy()).length > 0;
}

export function searchBarbers(f: BarberFilters) {
  const list = db.barbers.filter(
    (b) =>
      isLive(b) &&
      (!f.country || b.countryCode === f.country) &&
      (!f.city || b.city.toLowerCase() === f.city.toLowerCase()) &&
      (!f.specialties?.length || f.specialties.some((s) => b.specialties.includes(s))) &&
      (!f.minRating || rating(b) >= f.minRating) &&
      (!f.maxPrice || Math.min(...mainServices(b).map((s) => s.price)) <= f.maxPrice) &&
      (!f.homeVisits || b.offersHomeVisits) &&
      (!f.q || matchesText(b, f.q)) &&
      (!f.availableToday || availableToday(b)) &&
      (!f.availableOn || freeOn(b, f.availableOn)) &&
      (!f.openNow || openNow(b)),
  );
  const near = f.near;
  const views = list.map((b) => ({ ...barberView(b), ...(near ? { distanceKm: Math.round(distanceKm(near, b) * 10) / 10 } : {}) }));
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
    case "nearest":
      if (near) views.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0) || byRating(a, b));
      else views.sort(byRating);
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
