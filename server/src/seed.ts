import type { Barber, Country } from "./types.js";

export const COUNTRIES: Country[] = [
  {
    code: "DE",
    name: "Germany",
    currency: "eur",
    cities: [
      { name: "Berlin", timeZone: "Europe/Berlin" },
      { name: "Hamburg", timeZone: "Europe/Berlin" },
      { name: "Munich", timeZone: "Europe/Berlin" },
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "gbp",
    cities: [
      { name: "London", timeZone: "Europe/London" },
      { name: "Manchester", timeZone: "Europe/London" },
    ],
  },
  {
    code: "NL",
    name: "Netherlands",
    currency: "eur",
    cities: [{ name: "Amsterdam", timeZone: "Europe/Amsterdam" }],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "aed",
    cities: [{ name: "Dubai", timeZone: "Asia/Dubai" }],
  },
  {
    code: "FR",
    name: "France",
    currency: "eur",
    cities: [{ name: "Paris", timeZone: "Europe/Paris" }],
  },
  {
    code: "TR",
    name: "Türkiye",
    currency: "try",
    cities: [{ name: "Istanbul", timeZone: "Europe/Istanbul" }],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    currency: "sar",
    cities: [{ name: "Riyadh", timeZone: "Asia/Riyadh" }],
  },
  {
    code: "NG",
    name: "Nigeria",
    currency: "ngn",
    cities: [{ name: "Lagos", timeZone: "Africa/Lagos" }],
  },
  {
    code: "CA",
    name: "Canada",
    currency: "cad",
    cities: [{ name: "Toronto", timeZone: "America/Toronto" }],
  },
  {
    code: "BR",
    name: "Brazil",
    currency: "brl",
    cities: [{ name: "São Paulo", timeZone: "America/Sao_Paulo" }],
  },
  {
    code: "AU",
    name: "Australia",
    currency: "aud",
    cities: [{ name: "Sydney", timeZone: "Australia/Sydney" }],
  },
  {
    code: "US",
    name: "United States",
    currency: "usd",
    cities: [
      { name: "New York", timeZone: "America/New_York" },
      { name: "Los Angeles", timeZone: "America/Los_Angeles" },
    ],
  },
];

const photo = (n: number) => `https://i.pravatar.cc/400?img=${n}`;

const std = (prefix: string, cut: number, beard: number, combo: number, fade: number): Barber["services"] => [
  { id: `${prefix}-cut`, name: "Classic haircut", durationMin: 30, price: cut },
  { id: `${prefix}-fade`, name: "Skin fade", durationMin: 45, price: fade },
  { id: `${prefix}-beard`, name: "Beard trim & line-up", durationMin: 20, price: beard },
  { id: `${prefix}-combo`, name: "Haircut + beard", durationMin: 60, price: combo },
];

const base = { workingDays: [1, 2, 3, 4, 5, 6], openHour: 9, closeHour: 19 };

type SeedBarber = Omit<Barber, "yearsExperience" | "languages" | "gallery" | "transformations">;

const BASE_BARBERS: SeedBarber[] = [
  {
    id: "b1", name: "Malik Fresh", bio: "Fades so clean they glow. 12 years behind the chair.",
    photoUrl: photo(12), countryCode: "DE", city: "Berlin", shopAddress: "Oranienstraße 21, 10999 Berlin",
    specialties: ["skin fade", "taper", "line-up", "afro", "beard"], services: std("b1", 2500, 1500, 3800, 3000),
    offersHomeVisits: true, homeVisitFee: 1500, ...base, ratingSum: 4.9 * 87, ratingCount: 87,
  },
  {
    id: "b2", name: "Jonas Klinge", bio: "Scissor work, textured crops and classic gentleman cuts.",
    photoUrl: photo(15), countryCode: "DE", city: "Berlin", shopAddress: "Kastanienallee 7, 10435 Berlin",
    specialties: ["textured crop", "scissor cut", "pompadour", "long hair", "quiff"], services: std("b2", 3000, 1500, 4200, 3300),
    offersHomeVisits: false, homeVisitFee: 0, ...base, ratingSum: 4.7 * 54, ratingCount: 54,
  },
  {
    id: "b3", name: "Emre Usta", bio: "Turkish-style hot towel shaves and razor-sharp fades.",
    photoUrl: photo(51), countryCode: "DE", city: "Hamburg", shopAddress: "Schanzenstraße 40, 20357 Hamburg",
    specialties: ["skin fade", "hot towel shave", "beard", "buzz cut"], services: std("b3", 2200, 1400, 3400, 2800),
    offersHomeVisits: true, homeVisitFee: 1200, ...base, ratingSum: 4.8 * 112, ratingCount: 112,
  },
  {
    id: "b4", name: "Lukas Bauer", bio: "Modern mullets, curtains and everything in between.",
    photoUrl: photo(33), countryCode: "DE", city: "Munich", shopAddress: "Gärtnerplatz 3, 80469 München",
    specialties: ["mullet", "curtains", "long hair", "textured crop"], services: std("b4", 3500, 1800, 4800, 3800),
    offersHomeVisits: true, homeVisitFee: 2000, ...base, ratingSum: 4.6 * 41, ratingCount: 41,
  },
  {
    id: "b5", name: "Dre Clipz", bio: "South London's finest. Designs, fades, waves.",
    photoUrl: photo(59), countryCode: "GB", city: "London", shopAddress: "88 Rye Lane, London SE15",
    specialties: ["skin fade", "hair design", "waves", "afro", "line-up"], services: std("b5", 2500, 1200, 3500, 2800),
    offersHomeVisits: true, homeVisitFee: 1500, ...base, ratingSum: 4.9 * 140, ratingCount: 140,
  },
  {
    id: "b6", name: "Oliver Shaw", bio: "Traditional Mayfair barbering with a modern edge.",
    photoUrl: photo(68), countryCode: "GB", city: "London", shopAddress: "12 Jermyn Street, London SW1",
    specialties: ["side part", "pompadour", "scissor cut", "hot towel shave"], services: std("b6", 4500, 2500, 6500, 5000),
    offersHomeVisits: false, homeVisitFee: 0, ...base, ratingSum: 4.8 * 76, ratingCount: 76,
  },
  {
    id: "b7", name: "Kai Morgan", bio: "Northern Quarter favourite for crops and curls.",
    photoUrl: photo(60), countryCode: "GB", city: "Manchester", shopAddress: "45 Oldham Street, Manchester M1",
    specialties: ["textured crop", "curly hair", "taper", "french crop"], services: std("b7", 2000, 1000, 2800, 2300),
    offersHomeVisits: true, homeVisitFee: 1000, ...base, ratingSum: 4.7 * 63, ratingCount: 63,
  },
  {
    id: "b8", name: "Sem de Vries", bio: "Clean Scandinavian minimalism — sharp, simple, fresh.",
    photoUrl: photo(53), countryCode: "NL", city: "Amsterdam", shopAddress: "Haarlemmerstraat 99, Amsterdam",
    specialties: ["french crop", "buzz cut", "taper", "scissor cut"], services: std("b8", 3200, 1600, 4400, 3500),
    offersHomeVisits: true, homeVisitFee: 1500, ...base, ratingSum: 4.8 * 58, ratingCount: 58,
  },
  {
    id: "b9", name: "Omar Al Hashimi", bio: "Luxury grooming, delivered to your villa or hotel.",
    photoUrl: photo(14), countryCode: "AE", city: "Dubai", shopAddress: "Jumeirah Beach Road, Dubai",
    specialties: ["skin fade", "beard", "hot towel shave", "side part"], services: std("ae9", 12000, 7000, 17000, 14000),
    offersHomeVisits: true, homeVisitFee: 8000, ...base, workingDays: [0, 1, 2, 3, 4, 6], ratingSum: 4.9 * 95, ratingCount: 95,
  },
  {
    id: "b10", name: "Marcus Lee", bio: "Brooklyn born. Tapers, waves and braids prep.",
    photoUrl: photo(57), countryCode: "US", city: "New York", shopAddress: "220 Bedford Ave, Brooklyn, NY",
    specialties: ["taper", "waves", "afro", "line-up", "hair design"], services: std("b10", 4000, 2000, 5500, 4500),
    offersHomeVisits: true, homeVisitFee: 2500, ...base, ratingSum: 4.8 * 120, ratingCount: 120,
  },
  {
    id: "b11", name: "Diego Ramirez", bio: "Classic cuts, pompadours and long-hair styling in LA.",
    photoUrl: photo(52), countryCode: "US", city: "Los Angeles", shopAddress: "1500 Sunset Blvd, Los Angeles, CA",
    specialties: ["pompadour", "long hair", "curtains", "scissor cut", "beard"], services: std("b11", 4500, 2000, 6000, 5000),
    offersHomeVisits: true, homeVisitFee: 3000, ...base, ratingSum: 4.7 * 66, ratingCount: 66,
  },
  {
    id: "b12", name: "Karim Benali", bio: "Parisian precision: crops, tapers and beard design.",
    photoUrl: photo(11), countryCode: "FR", city: "Paris", shopAddress: "18 Rue Oberkampf, 75011 Paris",
    specialties: ["french crop", "taper", "beard", "skin fade"], services: std("b12", 3000, 1800, 4500, 3500),
    offersHomeVisits: true, homeVisitFee: 2000, ...base, ratingSum: 4.8 * 102, ratingCount: 102,
  },
  {
    id: "b13", name: "Mehmet Kaya", bio: "Third-generation Istanbul barber. Razor work and hot towel rituals.",
    photoUrl: photo(13), countryCode: "TR", city: "Istanbul", shopAddress: "İstiklal Cd. 120, Beyoğlu, İstanbul",
    specialties: ["hot towel shave", "skin fade", "beard", "side part"], services: std("b13", 60000, 35000, 85000, 70000),
    offersHomeVisits: true, homeVisitFee: 30000, ...base, ratingSum: 4.9 * 210, ratingCount: 210,
  },
  {
    id: "b14", name: "Faisal Al Otaibi", bio: "Sharp fades and beard sculpting in Riyadh, at your home or office.",
    photoUrl: photo(18), countryCode: "SA", city: "Riyadh", shopAddress: "Tahlia St, Al Olaya, Riyadh",
    specialties: ["skin fade", "beard", "line-up", "taper"], services: std("b14", 8000, 5000, 12000, 9500),
    offersHomeVisits: true, homeVisitFee: 5000, ...base, workingDays: [0, 1, 2, 3, 4, 6], ratingSum: 4.8 * 88, ratingCount: 88,
  },
  {
    id: "b15", name: "Tunde Adeyemi", bio: "Lagos-born, waves and braids specialist. Clean every time.",
    photoUrl: photo(56), countryCode: "NG", city: "Lagos", shopAddress: "12 Admiralty Way, Lekki, Lagos",
    specialties: ["waves", "braids", "locs", "afro", "line-up"], services: std("b15", 800000, 400000, 1100000, 900000),
    offersHomeVisits: true, homeVisitFee: 300000, ...base, ratingSum: 4.9 * 134, ratingCount: 134,
  },
  {
    id: "b16", name: "Andre Thompson", bio: "Toronto's fade king. Kids cuts welcome.",
    photoUrl: photo(65), countryCode: "CA", city: "Toronto", shopAddress: "560 Queen St W, Toronto, ON",
    specialties: ["skin fade", "kids cut", "hair design", "taper"], services: std("b16", 4000, 2000, 5500, 4500),
    offersHomeVisits: false, homeVisitFee: 0, ...base, ratingSum: 4.7 * 77, ratingCount: 77,
  },
  {
    id: "b17", name: "Rafael Souza", bio: "Cortes modernos and hair colour in São Paulo.",
    photoUrl: photo(61), countryCode: "BR", city: "São Paulo", shopAddress: "Rua Augusta 1500, São Paulo",
    specialties: ["hair color", "textured crop", "curly hair", "mullet"], services: std("b17", 7000, 4000, 10000, 8000),
    offersHomeVisits: true, homeVisitFee: 4000, ...base, ratingSum: 4.8 * 91, ratingCount: 91,
  },
  {
    id: "b18", name: "Liam O'Connor", bio: "Bondi beach cuts — relaxed, textured, effortless.",
    photoUrl: photo(70), countryCode: "AU", city: "Sydney", shopAddress: "80 Campbell Parade, Bondi Beach NSW",
    specialties: ["textured crop", "long hair", "curtains", "scissor cut"], services: std("b18", 5000, 2500, 7000, 5500),
    offersHomeVisits: true, homeVisitFee: 3000, ...base, ratingSum: 4.6 * 58, ratingCount: 58,
  },
];

// Profile details per barber. Portfolio images are placeholders from scripts/make-demo-portfolio.sh.
const PROFILE: Record<string, { years: number; languages: string[]; gallery: number[]; transformations: number[] }> = {
  b1: { years: 12, languages: ["German", "English", "French"], gallery: [1, 3, 4], transformations: [1, 2] },
  b2: { years: 8, languages: ["German", "English"], gallery: [2, 5, 7], transformations: [3] },
  b3: { years: 15, languages: ["German", "Turkish", "English"], gallery: [8, 1, 3], transformations: [1, 2] },
  b4: { years: 6, languages: ["German", "English"], gallery: [7, 2], transformations: [3] },
  b5: { years: 10, languages: ["English"], gallery: [4, 1, 6], transformations: [4, 1] },
  b6: { years: 20, languages: ["English", "Italian"], gallery: [5, 8], transformations: [5] },
  b7: { years: 7, languages: ["English"], gallery: [2, 9], transformations: [3] },
  b8: { years: 9, languages: ["Dutch", "English"], gallery: [2, 9, 5], transformations: [3, 5] },
  b9: { years: 14, languages: ["Arabic", "English", "Urdu"], gallery: [1, 3, 8], transformations: [2, 1] },
  b10: { years: 11, languages: ["English", "Spanish"], gallery: [4, 6, 10], transformations: [4, 6] },
  b11: { years: 13, languages: ["English", "Spanish"], gallery: [5, 7], transformations: [5] },
  b12: { years: 10, languages: ["French", "Arabic", "English"], gallery: [2, 3, 1], transformations: [3, 2] },
  b13: { years: 22, languages: ["Turkish", "English"], gallery: [8, 1, 5], transformations: [1, 5] },
  b14: { years: 9, languages: ["Arabic", "English"], gallery: [1, 3], transformations: [2] },
  b15: { years: 12, languages: ["English", "Yoruba"], gallery: [6, 10, 4], transformations: [6, 4] },
  b16: { years: 8, languages: ["English", "French"], gallery: [1, 4], transformations: [1] },
  b17: { years: 7, languages: ["Portuguese", "English", "Spanish"], gallery: [2, 7], transformations: [3] },
  b18: { years: 5, languages: ["English"], gallery: [2, 9], transformations: [3] },
};

const STYLE_NAMES = ["", "Skin fade", "Beard sculpt", "Textured crop", "Taper + waves", "Side part", "Braids"];

export const BARBERS: Barber[] = BASE_BARBERS.map((b) => {
  const p = PROFILE[b.id] ?? { years: 5, languages: ["English"], gallery: [], transformations: [] };
  return {
    ...b,
    yearsExperience: p.years,
    languages: p.languages,
    gallery: p.gallery.map((n) => ({ id: `${b.id}-g${n}`, url: `/media/demo/g${n}.jpg`, caption: "" })),
    transformations: p.transformations.map((n) => ({
      id: `${b.id}-t${n}`,
      beforeUrl: `/media/demo/t${n}-before.jpg`,
      afterUrl: `/media/demo/t${n}-after.jpg`,
      caption: STYLE_NAMES[n] ?? "",
    })),
  };
});
