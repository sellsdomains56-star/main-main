import { db } from "./db.js";
import type { Barber } from "./types.js";

/**
 * Home visits from further away: the barber's visit fee covers the first few km from their pin; beyond that the
 * customer pays a rate per km for the barber's taxi there and back. All of it goes to the barber (no JB fee).
 * Distances are estimates from map points: the straight line, plus 30% because roads wind.
 */

export type Spot = { lat: number; lng: number };

const ROAD_FACTOR = 1.3;
const AVERAGE_KMH = 45; // city driving with some motorway, for the "about 30 min by car" hint

export const DEFAULT_INCLUDED_KM = 10;
export const DEFAULT_PER_KM_AED = 400; // AED 4 per extra km, minor units
export const DEFAULT_MAX_KM = 30;

/** The rate per extra km outside the UAE (minor units); AED is set by the team in the admin panel. */
const PER_KM: Record<string, number> = { sar: 400, eur: 100, gbp: 100, usd: 100, cad: 150, aud: 150, try: 3000, ngn: 50000, brl: 500 };

/** Straight-line distance in km (haversine). */
export function straightKm(a: Spot, b: Spot) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** About how far the drive is, in whole km (at least 1). */
export const roadKm = (a: Spot, b: Spot) => Math.max(1, Math.round(straightKm(a, b) * ROAD_FACTOR));

export const travelSettings = () => ({
  includedKm: db.settings.travelIncludedKm ?? DEFAULT_INCLUDED_KM,
  perKmAed: db.settings.travelPerKmAed ?? DEFAULT_PER_KM_AED,
});

export const perKmFor = (currency: string) => (currency === "aed" ? travelSettings().perKmAed : PER_KM[currency] ?? 100);

/** How far a barber goes for a home visit, in km from their pin. */
export const maxKmOf = (b: Barber) => b.travelMaxKm ?? DEFAULT_MAX_KM;

/** What a home visit to `spot` costs on top of the visit fee, and whether the barber goes that far. */
export function travelQuote(b: Barber, spot: Spot, currency: string) {
  const km = roadKm(b, spot);
  const { includedKm } = travelSettings();
  const perKm = perKmFor(currency);
  const extraKm = Math.max(0, km - includedKm);
  // Rounded up to whole 5s (AED 52 → AED 55), so prices stay simple.
  const fee = extraKm && perKm ? Math.ceil((extraKm * perKm) / 500) * 500 : 0;
  return {
    km,
    minutes: Math.max(10, Math.round((km / AVERAGE_KMH) * 12) * 5),
    includedKm,
    extraKm,
    perKm,
    fee,
    maxKm: maxKmOf(b),
    tooFar: km > maxKmOf(b),
  };
}
