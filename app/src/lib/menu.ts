import type { Service, ServiceCategory } from "./types";

/** Menu sections, in the order customers see them (mirrors server/src/services.ts). */
export const CATEGORIES: { id: ServiceCategory; label: string }[] = [
  { id: "hair", label: "Hair" },
  { id: "beard", label: "Beard & shave" },
  { id: "face", label: "Face & skin" },
  { id: "colour", label: "Colour" },
  { id: "kids", label: "Kids" },
  { id: "packages", label: "Packages" },
  { id: "extras", label: "Extras" },
];

/** A service's section; older services without one are placed by their name. */
export function categoryOf(s: Pick<Service, "name" | "category">): ServiceCategory {
  if (s.category) return s.category;
  const n = s.name.toLowerCase();
  if (/\+|package|combo/.test(n)) return "packages";
  if (/kid|child|junior/.test(n)) return "kids";
  if (/colou?r|grey|blend|dye/.test(n)) return "colour";
  if (/facial|mask|skin|thread|wax|brow/.test(n)) return "face";
  if (/beard|shave|moustache|mustache/.test(n)) return "beard";
  return "hair";
}

export const isExtra = (s: Pick<Service, "name" | "category">) => categoryOf(s) === "extras";

/** The menu split into sections that have something in them (extras last). */
export function sections(services: Service[]) {
  return CATEGORIES.map((c) => ({ ...c, items: services.filter((s) => categoryOf(s) === c.id) })).filter((c) => c.items.length);
}

export const minutes = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`);

/** 10%, 15% and 20% of `base`, rounded to whole units of the currency. */
export function tipChoices(base: number) {
  return [0.1, 0.15, 0.2].map((r) => ({ percent: Math.round(r * 100), amount: Math.max(100, Math.round((base * r) / 100) * 100) }));
}
