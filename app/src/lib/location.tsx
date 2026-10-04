import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";
import { storage } from "./storage";
import type { Country } from "./types";

const KEY = "af_location";

export interface Place {
  countryCode: string;
  city: string; // "" = whole country
}

interface LocationState {
  countries: Country[];
  place: Place | null;
  setPlace: (place: Place) => void;
  country: Country | undefined;
  error: string | null;
  reload: () => void;
}

const LocationContext = createContext<LocationState | null>(null);

/** Country + city the customer is booking in. Every barber search is scoped to it. */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [place, setPlaceState] = useState<Place | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setError(null);
    api.locations().then(setCountries, (e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    reload();
    storage.get(KEY).then((saved) => {
      if (saved) setPlaceState(JSON.parse(saved));
    });
  }, [reload]);

  const setPlace = useCallback((next: Place) => {
    setPlaceState(next);
    storage.set(KEY, JSON.stringify(next));
  }, []);

  const value = useMemo(
    () => ({ countries, place, setPlace, error, reload, country: countries.find((c) => c.code === place?.countryCode) }),
    [countries, place, setPlace, error, reload],
  );
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside LocationProvider");
  return ctx;
}

const FLAGS: Record<string, string> = { DE: "🇩🇪", GB: "🇬🇧", NL: "🇳🇱", AE: "🇦🇪", US: "🇺🇸" };
export const flag = (code: string) =>
  FLAGS[code] ?? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
