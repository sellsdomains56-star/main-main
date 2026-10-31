import { nextFreeLabel } from "../BarberCard";
import { money } from "../../lib/format";
import type { Barber, ShopSummary } from "../../lib/types";

/** One pin on the map: a barber (round photo, starting price) or a barbershop (square photo). */
export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  /** The tag under the photo, e.g. "AED 120". */
  label: string;
  /** Has a free slot today. */
  free: boolean;
  kind?: "barber" | "shop";
  /** Full name, for the hover card and screen readers. */
  title?: string;
  photoUrl?: string | null;
  rating?: number | null;
  /** Where exactly, e.g. "Bay Avenue, Business Bay". */
  address?: string;
}

export interface BarberMapProps {
  pins: MapPin[];
  height: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** false = a still preview (no panning or zooming), e.g. on Home. Tapping it calls onPress. */
  interactive?: boolean;
  onPress?: () => void;
  /** The place the pins are in, for screen readers and the "no street map here" note. */
  placeName?: string;
  /** Tilted 3D camera with buildings (default) or a flat map. */
  tilt?: boolean;
  onTiltChange?: (tilt: boolean) => void;
  /** Slowly circle the pins — for still previews. */
  orbit?: boolean;
  /** Room taken by overlays (chips on top, cards at the bottom) so pins are framed clear of them. */
  insets?: { top?: number; bottom?: number };
  /** Change it to fly the camera to all pins again. */
  fitKey?: string | number;
  /** Fly to an area, e.g. when an emirate chip is picked. */
  focus?: { lat: number; lng: number; zoom: number; key: string } | null;
  /** Zoom with the mouse wheel without holding Ctrl (full-screen maps). */
  scrollZoom?: boolean;
  /** Rounded corners (0 for full-screen). */
  radius?: number;
  /**
   * Pick a spot: the map shows a fixed pin in the middle and reports the point under it as the
   * map moves (barbers placing their chair exactly).
   */
  onCenter?: (lat: number, lng: number) => void;
}

export function barberPins(
  barbers: (Pick<Barber, "id" | "lat" | "lng" | "startingPrice" | "currency" | "nextAvailable" | "timeZone"> &
    Partial<Pick<Barber, "name" | "photoUrl" | "rating" | "shopAddress">>)[],
): MapPin[] {
  return barbers
    .filter((b) => Number.isFinite(b.lat) && Number.isFinite(b.lng))
    .map((b) => ({
      id: b.id,
      lat: b.lat,
      lng: b.lng,
      label: money(b.startingPrice, b.currency).replace(/[.,]00$/, ""), // "AED 70", not "AED 70.00"
      free: !!nextFreeLabel(b.nextAvailable, b.timeZone)?.startsWith("Today"),
      kind: "barber" as const,
      title: b.name,
      photoUrl: b.photoUrl,
      rating: b.rating,
      address: b.shopAddress,
    }));
}

export function shopPins(shops: ShopSummary[]): MapPin[] {
  return shops.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    label: s.name,
    free: true,
    kind: "shop" as const,
    title: s.name,
    photoUrl: s.photoUrl,
    rating: s.rating,
    address: s.address,
  }));
}

/** Map region that shows every pin with some breathing room. */
export function regionFor(pins: MapPin[]) {
  if (!pins.length) return { latitude: 25.2048, longitude: 55.2708, latitudeDelta: 0.3, longitudeDelta: 0.3 };
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.006),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.006),
  };
}

/** Opens turn-by-turn directions in the phone's maps app (Apple Maps on iPhone, Google Maps elsewhere). */
export function directionsUrl(lat: number, lng: number, ios: boolean) {
  return ios ? `https://maps.apple.com/?daddr=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** The seven emirates (and the whole country) for the map's chips: where to fly and how close. */
export const EMIRATES: { name: string; lat: number; lng: number; zoom: number; match: string[] }[] = [
  { name: "All UAE", lat: 24.35, lng: 54.6, zoom: 6.6, match: [] },
  { name: "Dubai", lat: 25.135, lng: 55.21, zoom: 10.6, match: ["Dubai"] },
  { name: "Abu Dhabi", lat: 24.43, lng: 54.45, zoom: 10.4, match: ["Abu Dhabi", "Al Ain", "Madinat Zayed", "Ruwais"] },
  { name: "Sharjah", lat: 25.33, lng: 55.42, zoom: 11.6, match: ["Sharjah", "Khor Fakkan", "Kalba"] },
  { name: "Ajman", lat: 25.41, lng: 55.47, zoom: 12.6, match: ["Ajman"] },
  { name: "Umm Al Quwain", lat: 25.56, lng: 55.6, zoom: 12, match: ["Umm Al Quwain"] },
  { name: "Ras Al Khaimah", lat: 25.76, lng: 55.92, zoom: 11.3, match: ["Ras Al Khaimah"] },
  { name: "Fujairah", lat: 25.3, lng: 56.32, zoom: 9.9, match: ["Fujairah", "Dibba Al Fujairah"] },
];
