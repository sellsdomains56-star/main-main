import { nextFreeLabel } from "../BarberCard";
import { money } from "../../lib/format";
import type { Barber } from "../../lib/types";

/** One pin: a barber, labelled with their starting price. `free` = has a free slot today. */
export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  free: boolean;
}

export interface BarberMapProps {
  pins: MapPin[];
  height: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** false = a still preview (no panning or zooming), e.g. on Home. */
  interactive?: boolean;
  /** Shown in the corner of the website's preview map when street tiles can't load (the demo page). */
  placeName?: string;
}

export function barberPins(barbers: Pick<Barber, "id" | "lat" | "lng" | "startingPrice" | "currency" | "nextAvailable" | "timeZone">[]): MapPin[] {
  return barbers
    .filter((b) => Number.isFinite(b.lat) && Number.isFinite(b.lng))
    .map((b) => ({
      id: b.id,
      lat: b.lat,
      lng: b.lng,
      label: money(b.startingPrice, b.currency).replace(/[.,]00$/, ""), // "AED 70", not "AED 70.00"
      free: !!nextFreeLabel(b.nextAvailable, b.timeZone)?.startsWith("Today"),
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
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.03),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.03),
  };
}

/** Opens turn-by-turn directions in the phone's maps app (Apple Maps on iPhone, Google Maps elsewhere). */
export function directionsUrl(lat: number, lng: number, ios: boolean) {
  return ios ? `https://maps.apple.com/?daddr=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
