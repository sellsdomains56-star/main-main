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

export const BARBERS: Barber[] = [
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
];
