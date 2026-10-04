import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { Catalog } from "./types";

/** JB's Fresh products priced in the currency of the given country. */
export function useCatalog(countryCode?: string) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    setError(null);
    api.products(countryCode).then(setCatalog, (e: Error) => setError(e.message));
  }, [countryCode]);
  useEffect(load, [load]);
  return { catalog, error, reload: load };
}
