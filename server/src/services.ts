import type { Barber, Service, ServiceCategory } from "./types.js";

/** Menu sections, in the order customers see them. "extras" can be added to any booking. */
export const CATEGORIES: { id: ServiceCategory; label: string }[] = [
  { id: "hair", label: "Hair" },
  { id: "beard", label: "Beard & shave" },
  { id: "face", label: "Face & skin" },
  { id: "colour", label: "Colour" },
  { id: "kids", label: "Kids" },
  { id: "packages", label: "Packages" },
  { id: "extras", label: "Extras" },
];

/** A service's section; services made before sections existed are placed by their name. */
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

/** The extras a customer picked, checked against the barber's menu. */
export function extrasFor(barber: Barber, ids: string[]): Service[] | null {
  const out: Service[] = [];
  for (const id of new Set(ids)) {
    const s = barber.services.find((x) => x.id === id);
    if (!s || !isExtra(s)) return null;
    out.push(s);
  }
  return out;
}

/** Round a price to a step that suits the currency's size (AED 5, €1…). */
function nice(v: number, base: number) {
  const step = Math.max(100, 10 ** (Math.floor(Math.log10(Math.max(base, 1))) - 1) / 2);
  return Math.max(step, Math.round(v / step) * step);
}

type Item = [suffix: string, name: string, category: ServiceCategory, minutes: number, price: number, description: string];

/**
 * A barber's full menu, built from their four core prices and what they're known for, so every
 * barber offers what a good shop in Dubai would: cuts, beard and shave, face care, colour, kids,
 * packages, and extras to add on. The first four keep their original ids.
 */
export function fullMenu(prefix: string, specialties: string[], p: { cut: number; beard: number; combo: number; fade: number }): Service[] {
  const has = (...s: string[]) => s.some((x) => specialties.includes(x));
  const c = p.cut;
  const n = (v: number) => nice(v, c);
  const items: (Item | false)[] = [
    ["cut", "Classic haircut", "hair", 30, p.cut, "Scissors and clippers, finished with a wash-free style."],
    ["fade", "Skin fade", "hair", 45, p.fade, "Faded to the skin, blended high or low, with a sharp line-up."],
    ["beard", "Beard trim & line-up", "beard", 20, p.beard, "Shaped, trimmed and lined up with a straight razor."],
    ["combo", "Haircut + beard", "packages", 60, p.combo, "Any haircut plus a beard trim and line-up."],
    ["scissor", "Scissor cut", "hair", 45, n(c * 1.15), "Cut entirely with scissors for natural texture and movement."],
    ["buzz", "Buzz cut", "hair", 20, n(c * 0.6), "One length all over, with clean edges."],
    has("long hair", "curtains", "mullet") && ["long", "Long hair cut & style", "hair", 60, n(c * 1.4), "Shape and layers for longer hair, finished with a blow-dry."],
    has("skin fade", "buzz cut") && ["headshave", "Head shave", "hair", 30, n(c * 0.8), "Clipper then hot-towel razor shave for a smooth finish."],
    has("beard", "line-up", "hot towel shave") && ["sculpt", "Beard sculpt + hot towel", "beard", 30, n(p.beard * 1.5), "A full beard reshape with hot towels and beard oil."],
    ["shave", "Hot towel shave", "beard", 30, n(p.beard * 1.6), "Traditional wet shave: hot towels, lather and a straight razor."],
    ["facial", "Express facial", "face", 30, n(c * 0.9), "Cleanse, scrub, steam and a cooling mask."],
    ["mask", "Black mask & steam", "face", 20, n(c * 0.5), "Peel-off charcoal mask to clear the nose and cheeks."],
    has("hair color") && ["colour", "Grey blending", "colour", 30, n(c * 0.9), "A natural tone that softens grey without looking dyed."],
    has("beard", "hair color") && ["beardcolour", "Beard colour", "colour", 20, n(p.beard * 0.9), "Even out or darken the beard, matched to your hair."],
    ["kids", "Kids cut (under 12)", "kids", 30, n(c * 0.7), "A patient cut for boys under 12."],
    ["fresh", "The Full Fresh", "packages", 90, n((c + p.beard) * 1.6), "Haircut, beard sculpt, hot towel, express facial and a head massage."],
    (has("hot towel shave", "side part") || c >= 10000) && ["groom", "Groom package", "packages", 120, n(c * 3.2), "For the big day: cut, hot towel shave, facial, black mask and styling."],
    ["towel", "Hot towel", "extras", 10, n(c * 0.15), "A hot towel to finish any service."],
    ["wash", "Hair wash & style", "extras", 10, n(c * 0.2), "Wash, condition and style with Always Fresh products."],
    ["massage", "Head & shoulder massage", "extras", 15, n(c * 0.3), "Ten minutes to switch off."],
    ["brows", "Eyebrow threading", "extras", 10, n(c * 0.2), "Clean, natural brows."],
    ["wax", "Nose & ear wax", "extras", 10, n(c * 0.2), "Quick and tidy."],
    has("hair design", "line-up", "waves") && ["design", "Hair design", "extras", 15, n(c * 0.3), "A line, pattern or part cut into the fade."],
  ];
  return items.filter((x): x is Item => !!x).map(([suffix, name, category, durationMin, price, description]) => ({
    id: `${prefix}-${suffix === "towel" || suffix === "wash" || suffix === "massage" || suffix === "brows" || suffix === "wax" || suffix === "design" ? `x-${suffix}` : suffix}`,
    name, category, durationMin, price, description,
  }));
}
