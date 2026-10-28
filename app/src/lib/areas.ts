import type { Spot } from "./types";

/**
 * Areas a customer can pick for a home visit, so the app can work out how far the barber travels without a maps
 * service: the centre of each area, close enough for a taxi estimate. UAE areas in detail; elsewhere the city centre.
 * `also` are other names people type (landmarks, short forms), matched inside the address they write.
 */
export interface Area {
  name: string;
  region: string; // emirate or city
  country: string;
  lat: number;
  lng: number;
  also?: string[];
}

const ae = (name: string, region: string, lat: number, lng: number, also?: string[]): Area => ({ name, region, country: "AE", lat, lng, also });

export const AREAS: Area[] = [
  // Dubai
  ae("Downtown Dubai", "Dubai", 25.1972, 55.2744, ["downtown", "burj khalifa", "dubai mall", "opera district"]),
  ae("Business Bay", "Dubai", 25.186, 55.268, ["bay avenue"]),
  ae("DIFC", "Dubai", 25.211, 55.28, ["financial centre", "financial center", "gate village"]),
  ae("City Walk", "Dubai", 25.2068, 55.2622),
  ae("Al Wasl", "Dubai", 25.198, 55.256),
  ae("Jumeirah", "Dubai", 25.205, 55.245, ["jumeira", "la mer", "kite beach"]),
  ae("Al Satwa", "Dubai", 25.2235, 55.274, ["satwa"]),
  ae("Umm Suqeim", "Dubai", 25.145, 55.205, ["burj al arab", "madinat jumeirah"]),
  ae("Al Barsha", "Dubai", 25.11, 55.195, ["barsha", "mall of the emirates"]),
  ae("Barsha Heights", "Dubai", 25.0975, 55.178, ["tecom"]),
  ae("Al Sufouh", "Dubai", 25.105, 55.168, ["knowledge park"]),
  ae("Dubai Media City", "Dubai", 25.0928, 55.1556, ["media city"]),
  ae("Dubai Internet City", "Dubai", 25.0957, 55.1601, ["internet city"]),
  ae("Palm Jumeirah", "Dubai", 25.1124, 55.139, ["the palm", "atlantis", "palm"]),
  ae("Dubai Harbour", "Dubai", 25.093, 55.142, ["harbour marina", "emaar beachfront"]),
  ae("Bluewaters Island", "Dubai", 25.0808, 55.1206, ["bluewaters", "ain dubai"]),
  ae("Dubai Marina", "Dubai", 25.0805, 55.1403, ["marina", "marina walk"]),
  ae("JBR", "Dubai", 25.0786, 55.1335, ["jumeirah beach residence", "the walk"]),
  ae("JLT", "Dubai", 25.0693, 55.1414, ["jumeirah lake towers", "jumeirah lakes towers"]),
  ae("Emirates Hills", "Dubai", 25.068, 55.168, ["the springs", "the meadows", "the lakes"]),
  ae("JVC", "Dubai", 25.059, 55.2098, ["jumeirah village circle"]),
  ae("Dubai Hills Estate", "Dubai", 25.105, 55.245, ["dubai hills"]),
  ae("Al Quoz", "Dubai", 25.14, 55.235, ["alserkal"]),
  ae("Meydan", "Dubai", 25.159, 55.303, ["mbr city", "mohammed bin rashid city"]),
  ae("Arabian Ranches", "Dubai", 25.055, 55.27, ["ranches"]),
  ae("Motor City", "Dubai", 25.046, 55.238),
  ae("Dubai Sports City", "Dubai", 25.04, 55.22, ["sports city"]),
  ae("Damac Hills", "Dubai", 25.025, 55.25, ["akoya"]),
  ae("Al Furjan", "Dubai", 25.03, 55.145, ["furjan"]),
  ae("Discovery Gardens", "Dubai", 25.04, 55.142),
  ae("Jebel Ali", "Dubai", 25.005, 55.11),
  ae("Dubai Investments Park", "Dubai", 24.998, 55.17, ["dip"]),
  ae("Expo City", "Dubai", 24.964, 55.148, ["dubai south", "expo"]),
  ae("Al Karama", "Dubai", 25.246, 55.303, ["karama"]),
  ae("Bur Dubai", "Dubai", 25.256, 55.296, ["al fahidi", "mankhool", "oud metha"]),
  ae("Deira", "Dubai", 25.271, 55.31, ["al rigga", "port saeed", "al muraqqabat"]),
  ae("Al Garhoud", "Dubai", 25.244, 55.348, ["garhoud", "dubai airport", "dxb"]),
  ae("Dubai Festival City", "Dubai", 25.222, 55.352, ["festival city"]),
  ae("Dubai Creek Harbour", "Dubai", 25.198, 55.345, ["creek harbour"]),
  ae("Al Qusais", "Dubai", 25.28, 55.38, ["qusais"]),
  ae("Al Mamzar", "Dubai", 25.296, 55.347, ["mamzar"]),
  ae("Mirdif", "Dubai", 25.218, 55.418, ["mirdiff"]),
  ae("International City", "Dubai", 25.165, 55.408),
  ae("Dubai Silicon Oasis", "Dubai", 25.12, 55.38, ["silicon oasis", "dso"]),
  ae("Hatta", "Dubai", 24.795, 56.115),
  // Abu Dhabi
  ae("Abu Dhabi city", "Abu Dhabi", 24.48, 54.36, ["corniche", "al markaziyah"]),
  ae("Al Reem Island", "Abu Dhabi", 24.499, 54.406, ["reem island"]),
  ae("Saadiyat Island", "Abu Dhabi", 24.54, 54.43, ["saadiyat"]),
  ae("Yas Island", "Abu Dhabi", 24.488, 54.606, ["yas"]),
  ae("Khalifa City", "Abu Dhabi", 24.42, 54.58),
  ae("Mussafah", "Abu Dhabi", 24.35, 54.5),
  ae("Al Ain", "Abu Dhabi", 24.2075, 55.7447),
  // Northern emirates
  ae("Sharjah city", "Sharjah", 25.3463, 55.4209, ["sharjah"]),
  ae("Al Majaz", "Sharjah", 25.327, 55.387, ["majaz"]),
  ae("Al Nahda, Sharjah", "Sharjah", 25.301, 55.373, ["al nahda"]),
  ae("Ajman", "Ajman", 25.4052, 55.5136),
  ae("Umm Al Quwain", "Umm Al Quwain", 25.5647, 55.5552),
  ae("Ras Al Khaimah", "Ras Al Khaimah", 25.7895, 55.9432, ["rak"]),
  ae("Fujairah", "Fujairah", 25.1288, 56.3265),
  ae("Khor Fakkan", "Sharjah", 25.3395, 56.3511),
];

/** City centres outside the UAE: the fallback when the customer doesn't share their location (an address naming the city counts). */
const CITIES: Area[] = [
  { name: "Central Berlin", region: "Berlin", country: "DE", lat: 52.52, lng: 13.405, also: ["Berlin"] },
  { name: "Central Hamburg", region: "Hamburg", country: "DE", lat: 53.5511, lng: 9.9937, also: ["Hamburg"] },
  { name: "Central Munich", region: "Munich", country: "DE", lat: 48.1351, lng: 11.582, also: ["Munich"] },
  { name: "Central London", region: "London", country: "GB", lat: 51.5072, lng: -0.1276, also: ["London"] },
  { name: "Central Manchester", region: "Manchester", country: "GB", lat: 53.4808, lng: -2.2426, also: ["Manchester"] },
  { name: "Central Amsterdam", region: "Amsterdam", country: "NL", lat: 52.3676, lng: 4.9041, also: ["Amsterdam"] },
  { name: "Central Paris", region: "Paris", country: "FR", lat: 48.8566, lng: 2.3522, also: ["Paris"] },
  { name: "Central Istanbul", region: "Istanbul", country: "TR", lat: 41.0082, lng: 28.9784, also: ["Istanbul"] },
  { name: "Central Riyadh", region: "Riyadh", country: "SA", lat: 24.7136, lng: 46.6753, also: ["Riyadh"] },
  { name: "Central Lagos", region: "Lagos", country: "NG", lat: 6.5244, lng: 3.3792, also: ["Lagos"] },
  { name: "Central Toronto", region: "Toronto", country: "CA", lat: 43.6532, lng: -79.3832, also: ["Toronto"] },
  { name: "Central New York", region: "New York", country: "US", lat: 40.7128, lng: -74.006, also: ["New York"] },
  { name: "Central Los Angeles", region: "Los Angeles", country: "US", lat: 34.0522, lng: -118.2437, also: ["Los Angeles"] },
  { name: "Central Sydney", region: "Sydney", country: "AU", lat: -33.8688, lng: 151.2093, also: ["Sydney"] },
  { name: "Central São Paulo", region: "São Paulo", country: "BR", lat: -23.5505, lng: -46.6333, also: ["São Paulo"] },
];

/** The areas to offer for a barber in this country and city. */
export function areasFor(countryCode: string, city: string): Area[] {
  if (countryCode === "AE") return AREAS;
  const own = CITIES.filter((c) => c.region === city);
  return own.length ? own : CITIES.filter((c) => c.country === countryCode);
}

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Areas whose name or other names contain what's been typed. */
export function searchAreas(list: Area[], query: string): Area[] {
  const q = norm(query);
  if (!q) return list.slice(0, 10);
  return list.filter((a) => [a.name, a.region, ...(a.also ?? [])].some((n) => norm(n).includes(q))).slice(0, 10);
}

/** The area an address mentions, if any ("Suite 1204, Atlantis The Royal" → Palm Jumeirah). The longest name wins, so "Palm Jumeirah" beats "Jumeirah". */
export function areaInAddress(list: Area[], address: string): Area | null {
  const text = ` ${norm(address)} `;
  let best: { area: Area; length: number } | null = null;
  for (const a of list) {
    for (const n of [a.name, ...(a.also ?? [])]) {
      const key = norm(n);
      if (key.length >= 3 && text.includes(` ${key} `) && (!best || key.length > best.length)) best = { area: a, length: key.length };
    }
  }
  return best?.area ?? null;
}

export const spotOf = (a: Area): Spot => ({ lat: a.lat, lng: a.lng, label: a.name, source: "area" });

/** Straight-line distance in km between two points on the map. */
export function straightKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
