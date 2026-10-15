import type { Barber, Country, Shop } from "./types.js";

export const COUNTRIES: Country[] = [
  {
    code: "DE",
    name: "Germany",
    currency: "eur",
    cities: [
      { name: "Berlin", timeZone: "Europe/Berlin", lat: 52.52, lng: 13.405 },
      { name: "Hamburg", timeZone: "Europe/Berlin", lat: 53.5511, lng: 9.9937 },
      { name: "Munich", timeZone: "Europe/Berlin", lat: 48.1351, lng: 11.582 },
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "gbp",
    cities: [
      { name: "London", timeZone: "Europe/London", lat: 51.5072, lng: -0.1276 },
      { name: "Manchester", timeZone: "Europe/London", lat: 53.4808, lng: -2.2426 },
    ],
  },
  {
    code: "NL",
    name: "Netherlands",
    currency: "eur",
    cities: [{ name: "Amsterdam", timeZone: "Europe/Amsterdam", lat: 52.3676, lng: 4.9041 }],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "aed",
    cities: [
      { name: "Dubai", timeZone: "Asia/Dubai", lat: 25.2048, lng: 55.2708 },
      { name: "Abu Dhabi", timeZone: "Asia/Dubai", lat: 24.4539, lng: 54.3773 },
      { name: "Sharjah", timeZone: "Asia/Dubai", lat: 25.3463, lng: 55.4209 },
      { name: "Ajman", timeZone: "Asia/Dubai", lat: 25.4052, lng: 55.5136 },
      { name: "Umm Al Quwain", timeZone: "Asia/Dubai", lat: 25.5647, lng: 55.5552 },
      { name: "Ras Al Khaimah", timeZone: "Asia/Dubai", lat: 25.7895, lng: 55.9432 },
      { name: "Fujairah", timeZone: "Asia/Dubai", lat: 25.1288, lng: 56.3265 },
      { name: "Al Ain", timeZone: "Asia/Dubai", lat: 24.2075, lng: 55.7447 },
      { name: "Khor Fakkan", timeZone: "Asia/Dubai", lat: 25.3395, lng: 56.3511 },
      { name: "Kalba", timeZone: "Asia/Dubai", lat: 25.051, lng: 56.354 },
      { name: "Dibba Al Fujairah", timeZone: "Asia/Dubai", lat: 25.5925, lng: 56.261 },
      { name: "Madinat Zayed", timeZone: "Asia/Dubai", lat: 23.6845, lng: 53.7054 },
      { name: "Ruwais", timeZone: "Asia/Dubai", lat: 24.1103, lng: 52.7306 },
    ],
  },
  {
    code: "FR",
    name: "France",
    currency: "eur",
    cities: [{ name: "Paris", timeZone: "Europe/Paris", lat: 48.8566, lng: 2.3522 }],
  },
  {
    code: "TR",
    name: "Türkiye",
    currency: "try",
    cities: [{ name: "Istanbul", timeZone: "Europe/Istanbul", lat: 41.0082, lng: 28.9784 }],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    currency: "sar",
    cities: [{ name: "Riyadh", timeZone: "Asia/Riyadh", lat: 24.7136, lng: 46.6753 }],
  },
  {
    code: "NG",
    name: "Nigeria",
    currency: "ngn",
    cities: [{ name: "Lagos", timeZone: "Africa/Lagos", lat: 6.5244, lng: 3.3792 }],
  },
  {
    code: "CA",
    name: "Canada",
    currency: "cad",
    cities: [{ name: "Toronto", timeZone: "America/Toronto", lat: 43.6532, lng: -79.3832 }],
  },
  {
    code: "BR",
    name: "Brazil",
    currency: "brl",
    cities: [{ name: "São Paulo", timeZone: "America/Sao_Paulo", lat: -23.5505, lng: -46.6333 }],
  },
  {
    code: "AU",
    name: "Australia",
    currency: "aud",
    cities: [{ name: "Sydney", timeZone: "Australia/Sydney", lat: -33.8688, lng: 151.2093 }],
  },
  {
    code: "US",
    name: "United States",
    currency: "usd",
    cities: [
      { name: "New York", timeZone: "America/New_York", lat: 40.7128, lng: -74.006 },
      { name: "Los Angeles", timeZone: "America/Los_Angeles", lat: 34.0522, lng: -118.2437 },
    ],
  },
];

// Sample barber photos (media/demo/av1…av20, built by scripts/make-demo-media.sh from Unsplash).
// They don't show the barbers named here; real barbers upload their own under Account → My work.
const photo = (n: number) => `/media/demo/av${((n - 1) % 20) + 1}.jpg`;

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
    photoUrl: photo(13), countryCode: "DE", city: "Berlin", shopAddress: "Oranienstraße 21, 10999 Berlin", lat: 52.5017, lng: 13.418,
    specialties: ["skin fade", "taper", "line-up", "afro", "beard"], services: std("b1", 2500, 1500, 3800, 3000),
    offersHomeVisits: true, homeVisitFee: 1500, ...base, ratingSum: 4.9 * 87, ratingCount: 87,
  },
  {
    id: "b2", name: "Jonas Klinge", bio: "Scissor work, textured crops and classic gentleman cuts.",
    photoUrl: photo(19), countryCode: "DE", city: "Berlin", shopAddress: "Kastanienallee 7, 10435 Berlin", lat: 52.539, lng: 13.41,
    specialties: ["textured crop", "scissor cut", "pompadour", "long hair", "quiff"], services: std("b2", 3000, 1500, 4200, 3300),
    offersHomeVisits: false, homeVisitFee: 0, ...base, ratingSum: 4.7 * 54, ratingCount: 54,
  },
  {
    id: "b3", name: "Emre Usta", bio: "Turkish-style hot towel shaves and razor-sharp fades.",
    photoUrl: photo(16), countryCode: "DE", city: "Hamburg", shopAddress: "Schanzenstraße 40, 20357 Hamburg", lat: 53.562, lng: 9.964,
    specialties: ["skin fade", "hot towel shave", "beard", "buzz cut"], services: std("b3", 2200, 1400, 3400, 2800),
    offersHomeVisits: true, homeVisitFee: 1200, ...base, ratingSum: 4.8 * 112, ratingCount: 112,
  },
  {
    id: "b4", name: "Lukas Bauer", bio: "Modern mullets, curtains and everything in between.",
    photoUrl: photo(12), countryCode: "DE", city: "Munich", shopAddress: "Gärtnerplatz 3, 80469 München", lat: 48.1316, lng: 11.576,
    specialties: ["mullet", "curtains", "long hair", "textured crop"], services: std("b4", 3500, 1800, 4800, 3800),
    offersHomeVisits: true, homeVisitFee: 2000, ...base, ratingSum: 4.6 * 41, ratingCount: 41,
  },
  {
    id: "b5", name: "Dre Clipz", bio: "South London's finest. Designs, fades, waves.",
    photoUrl: photo(15), countryCode: "GB", city: "London", shopAddress: "88 Rye Lane, London SE15", lat: 51.469, lng: -0.069,
    specialties: ["skin fade", "hair design", "waves", "afro", "line-up"], services: std("b5", 2500, 1200, 3500, 2800),
    offersHomeVisits: true, homeVisitFee: 1500, ...base, ratingSum: 4.9 * 140, ratingCount: 140,
  },
  {
    id: "b6", name: "Oliver Shaw", bio: "Traditional Mayfair barbering with a modern edge.",
    photoUrl: photo(17), countryCode: "GB", city: "London", shopAddress: "12 Jermyn Street, London SW1", lat: 51.508, lng: -0.137,
    specialties: ["side part", "pompadour", "scissor cut", "hot towel shave"], services: std("b6", 4500, 2500, 6500, 5000),
    offersHomeVisits: false, homeVisitFee: 0, ...base, ratingSum: 4.8 * 76, ratingCount: 76,
  },
  {
    id: "b7", name: "Kai Morgan", bio: "Northern Quarter favourite for crops and curls.",
    photoUrl: photo(14), countryCode: "GB", city: "Manchester", shopAddress: "45 Oldham Street, Manchester M1", lat: 53.484, lng: -2.234,
    specialties: ["textured crop", "curly hair", "taper", "french crop"], services: std("b7", 2000, 1000, 2800, 2300),
    offersHomeVisits: true, homeVisitFee: 1000, ...base, ratingSum: 4.7 * 63, ratingCount: 63,
  },
  {
    id: "b8", name: "Sem de Vries", bio: "Clean Scandinavian minimalism — sharp, simple, fresh.",
    photoUrl: photo(18), countryCode: "NL", city: "Amsterdam", shopAddress: "Haarlemmerstraat 99, Amsterdam", lat: 52.381, lng: 4.889,
    specialties: ["french crop", "buzz cut", "taper", "scissor cut"], services: std("b8", 3200, 1600, 4400, 3500),
    offersHomeVisits: true, homeVisitFee: 1500, ...base, ratingSum: 4.8 * 58, ratingCount: 58,
  },
  {
    id: "b9", name: "Omar Al Hashimi", bio: "Luxury grooming, delivered to your villa or hotel.",
    photoUrl: photo(2), countryCode: "AE", city: "Dubai", shopAddress: "Jumeirah Beach Road, by Mercato Mall, Jumeirah 1, Dubai", lat: 25.21636, lng: 55.25301,
    specialties: ["skin fade", "beard", "hot towel shave", "side part"], services: std("ae9", 12000, 7000, 17000, 14000),
    offersHomeVisits: true, homeVisitFee: 8000, ...base, workingDays: [0, 1, 2, 3, 4, 6], ratingSum: 4.9 * 95, ratingCount: 95,
  },
  {
    id: "b10", name: "Marcus Lee", bio: "Brooklyn born. Tapers, waves and braids prep.",
    photoUrl: photo(11), countryCode: "US", city: "New York", shopAddress: "220 Bedford Ave, Brooklyn, NY", lat: 40.717, lng: -73.957,
    specialties: ["taper", "waves", "afro", "line-up", "hair design"], services: std("b10", 4000, 2000, 5500, 4500),
    offersHomeVisits: true, homeVisitFee: 2500, ...base, ratingSum: 4.8 * 120, ratingCount: 120,
  },
  {
    id: "b11", name: "Diego Ramirez", bio: "Classic cuts, pompadours and long-hair styling in LA.",
    photoUrl: photo(20), countryCode: "US", city: "Los Angeles", shopAddress: "1500 Sunset Blvd, Los Angeles, CA", lat: 34.078, lng: -118.26,
    specialties: ["pompadour", "long hair", "curtains", "scissor cut", "beard"], services: std("b11", 4500, 2000, 6000, 5000),
    offersHomeVisits: true, homeVisitFee: 3000, ...base, ratingSum: 4.7 * 66, ratingCount: 66,
  },
  {
    id: "b12", name: "Karim Benali", bio: "Parisian precision: crops, tapers and beard design.",
    photoUrl: photo(13), countryCode: "FR", city: "Paris", shopAddress: "18 Rue Oberkampf, 75011 Paris", lat: 48.865, lng: 2.376,
    specialties: ["french crop", "taper", "beard", "skin fade"], services: std("b12", 3000, 1800, 4500, 3500),
    offersHomeVisits: true, homeVisitFee: 2000, ...base, ratingSum: 4.8 * 102, ratingCount: 102,
  },
  {
    id: "b13", name: "Mehmet Kaya", bio: "Third-generation Istanbul barber. Razor work and hot towel rituals.",
    photoUrl: photo(16), countryCode: "TR", city: "Istanbul", shopAddress: "İstiklal Cd. 120, Beyoğlu, İstanbul", lat: 41.034, lng: 28.978,
    specialties: ["hot towel shave", "skin fade", "beard", "side part"], services: std("b13", 60000, 35000, 85000, 70000),
    offersHomeVisits: true, homeVisitFee: 30000, ...base, ratingSum: 4.9 * 210, ratingCount: 210,
  },
  {
    id: "b14", name: "Faisal Al Otaibi", bio: "Sharp fades and beard sculpting in Riyadh, at your home or office.",
    photoUrl: photo(12), countryCode: "SA", city: "Riyadh", shopAddress: "Tahlia St, Al Olaya, Riyadh", lat: 24.695, lng: 46.68,
    specialties: ["skin fade", "beard", "line-up", "taper"], services: std("b14", 8000, 5000, 12000, 9500),
    offersHomeVisits: true, homeVisitFee: 5000, ...base, workingDays: [0, 1, 2, 3, 4, 6], ratingSum: 4.8 * 88, ratingCount: 88,
  },
  {
    id: "b15", name: "Tunde Adeyemi", bio: "Lagos-born, waves and braids specialist. Clean every time.",
    photoUrl: photo(15), countryCode: "NG", city: "Lagos", shopAddress: "12 Admiralty Way, Lekki, Lagos", lat: 6.447, lng: 3.473,
    specialties: ["waves", "braids", "locs", "afro", "line-up"], services: std("b15", 800000, 400000, 1100000, 900000),
    offersHomeVisits: true, homeVisitFee: 300000, ...base, ratingSum: 4.9 * 134, ratingCount: 134,
  },
  {
    id: "b16", name: "Andre Thompson", bio: "Toronto's fade king. Kids cuts welcome.",
    photoUrl: photo(14), countryCode: "CA", city: "Toronto", shopAddress: "560 Queen St W, Toronto, ON", lat: 43.648, lng: -79.401,
    specialties: ["skin fade", "kids cut", "hair design", "taper"], services: std("b16", 4000, 2000, 5500, 4500),
    offersHomeVisits: false, homeVisitFee: 0, ...base, ratingSum: 4.7 * 77, ratingCount: 77,
  },
  {
    id: "b17", name: "Rafael Souza", bio: "Cortes modernos and hair colour in São Paulo.",
    photoUrl: photo(19), countryCode: "BR", city: "São Paulo", shopAddress: "Rua Augusta 1500, São Paulo", lat: -23.556, lng: -46.66,
    specialties: ["hair color", "textured crop", "curly hair", "mullet"], services: std("b17", 7000, 4000, 10000, 8000),
    offersHomeVisits: true, homeVisitFee: 4000, ...base, ratingSum: 4.8 * 91, ratingCount: 91,
  },
  {
    id: "b18", name: "Liam O'Connor", bio: "Bondi beach cuts — relaxed, textured, effortless.",
    photoUrl: photo(18), countryCode: "AU", city: "Sydney", shopAddress: "80 Campbell Parade, Bondi Beach NSW", lat: -33.891, lng: 151.277,
    specialties: ["textured crop", "long hair", "curtains", "scissor cut"], services: std("b18", 5000, 2500, 7000, 5500),
    offersHomeVisits: true, homeVisitFee: 3000, ...base, ratingSum: 4.6 * 58, ratingCount: 58,
  },
  // United Arab Emirates — every emirate and the main towns
  {
    id: "b19", name: "Yousef Al Mansoori", bio: "Dubai Marina’s go-to for sharp fades and beard sculpts.",
    photoUrl: photo(1), countryCode: "AE", city: "Dubai", shopAddress: "Marina Walk, by Dubai Marina Mall, Dubai Marina", lat: 25.07664, lng: 55.14022,
    specialties: ["skin fade", "beard", "taper", "line-up"], services: std("b19", 9000, 5000, 13000, 10000),
    offersHomeVisits: true, homeVisitFee: 6000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.8 * 64, ratingCount: 64,
  },
  {
    id: "b20", name: "Rashid Khan", bio: "Old Deira barbering — hot towel shaves and classic cuts since 2009.",
    photoUrl: photo(7), countryCode: "AE", city: "Dubai", shopAddress: "Al Rigga Road, by Al Rigga Metro, Deira, Dubai", lat: 25.26363, lng: 55.32375,
    specialties: ["hot towel shave", "scissor cut", "beard", "side part"], services: std("b20", 5000, 3000, 7500, 6000),
    offersHomeVisits: false, homeVisitFee: 0, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.7 * 138, ratingCount: 138,
  },
  {
    id: "b21", name: "Khalid Al Dhaheri", bio: "Gentleman’s grooming on the Corniche, home visits across Abu Dhabi.",
    photoUrl: photo(11), countryCode: "AE", city: "Abu Dhabi", shopAddress: "Corniche Road West, Nation Towers, Abu Dhabi", lat: 24.4655, lng: 54.327,
    specialties: ["side part", "beard", "hot towel shave", "skin fade"], services: std("b21", 10000, 6000, 15000, 12000),
    offersHomeVisits: true, homeVisitFee: 7000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.9 * 81, ratingCount: 81,
  },
  {
    id: "b22", name: "Arjun Nair", bio: "Fades, tapers and kids’ cuts near Khalifa City.",
    photoUrl: photo(20), countryCode: "AE", city: "Abu Dhabi", shopAddress: "Khalifa City A, Abu Dhabi", lat: 24.4244, lng: 54.56917,
    specialties: ["taper", "kids cut", "skin fade", "textured crop"], services: std("b22", 6000, 3500, 8500, 7000),
    offersHomeVisits: true, homeVisitFee: 4000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.7 * 47, ratingCount: 47,
  },
  {
    id: "b23", name: "Hamad Al Suwaidi", bio: "Clean fades and beard line-ups in Al Majaz.",
    photoUrl: photo(17), countryCode: "AE", city: "Sharjah", shopAddress: "Al Majaz Waterfront, Jamal Abdul Nasser St, Sharjah", lat: 25.32628, lng: 55.39126,
    specialties: ["skin fade", "beard", "line-up"], services: std("b23", 5500, 3000, 8000, 6500),
    offersHomeVisits: true, homeVisitFee: 4000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.8 * 59, ratingCount: 59,
  },
  {
    id: "b24", name: "Imran Qureshi", bio: "Ajman’s friendliest chair — family cuts and hot towel shaves.",
    photoUrl: photo(12), countryCode: "AE", city: "Ajman", shopAddress: "Sheikh Rashid Bin Humaid St, Al Sawan, Ajman", lat: 25.40561, lng: 55.44212,
    specialties: ["hot towel shave", "kids cut", "scissor cut", "beard"], services: std("b24", 4000, 2500, 6000, 5000),
    offersHomeVisits: true, homeVisitFee: 3000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.6 * 72, ratingCount: 72,
  },
  {
    id: "b25", name: "Saeed Al Mualla", bio: "Traditional and modern cuts by the lagoon in Umm Al Quwain.",
    photoUrl: photo(13), countryCode: "AE", city: "Umm Al Quwain", shopAddress: "Corniche Road, Old Town, Umm Al Quwain", lat: 25.58257, lng: 55.57698,
    specialties: ["scissor cut", "beard", "taper"], services: std("b25", 4500, 2500, 6500, 5000),
    offersHomeVisits: true, homeVisitFee: 3500, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.7 * 28, ratingCount: 28,
  },
  {
    id: "b26", name: "Tariq Al Shehhi", bio: "Ras Al Khaimah fades with a mountain view.",
    photoUrl: photo(14), countryCode: "AE", city: "Ras Al Khaimah", shopAddress: "Al Nakheel, Ras Al Khaimah", lat: 25.7905, lng: 55.9468,
    specialties: ["skin fade", "waves", "line-up", "beard"], services: std("b26", 5000, 3000, 7500, 6000),
    offersHomeVisits: true, homeVisitFee: 4000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.8 * 36, ratingCount: 36,
  },
  {
    id: "b27", name: "Nasser Al Kaabi", bio: "East-coast barbering: beard design and classic cuts in Fujairah.",
    photoUrl: photo(16), countryCode: "AE", city: "Fujairah", shopAddress: "Fujairah Tower, Hamad Bin Abdullah Road, Fujairah", lat: 25.12123, lng: 56.33403,
    specialties: ["beard", "side part", "scissor cut"], services: std("b27", 5000, 3000, 7500, 6000),
    offersHomeVisits: true, homeVisitFee: 4000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.7 * 31, ratingCount: 31,
  },
  {
    id: "b28", name: "Obaid Al Ketbi", bio: "Al Ain’s garden-city barber — fades, kids’ cuts and home visits.",
    photoUrl: photo(18), countryCode: "AE", city: "Al Ain", shopAddress: "Mohammed Bin Khalifa Street, Al Ain", lat: 24.22256, lng: 55.75079,
    specialties: ["skin fade", "kids cut", "taper", "beard"], services: std("b28", 5000, 3000, 7500, 6000),
    offersHomeVisits: true, homeVisitFee: 3500, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.8 * 44, ratingCount: 44,
  },
  {
    id: "b29", name: "Jassim Al Naqbi", bio: "Seaside fades and beard trims on the Khor Fakkan corniche.",
    photoUrl: photo(19), countryCode: "AE", city: "Khor Fakkan", shopAddress: "Corniche Road, Khor Fakkan", lat: 25.36052, lng: 56.34837,
    specialties: ["skin fade", "beard", "line-up"], services: std("b29", 4500, 2500, 6500, 5500),
    offersHomeVisits: true, homeVisitFee: 3000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.7 * 19, ratingCount: 19,
  },
  {
    id: "b30", name: "Ali Al Zaabi", bio: "Kalba’s neighbourhood barber — quick, clean, friendly.",
    photoUrl: photo(20), countryCode: "AE", city: "Kalba", shopAddress: "Kalba Corniche, Kalba", lat: 25.07, lng: 56.356,
    specialties: ["scissor cut", "taper", "kids cut"], services: std("b30", 4000, 2500, 6000, 5000),
    offersHomeVisits: false, homeVisitFee: 0, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.6 * 22, ratingCount: 22,
  },
  {
    id: "b31", name: "Majid Al Hosani", bio: "Dibba fades and hot towel shaves between the mountains and the sea.",
    photoUrl: photo(15), countryCode: "AE", city: "Dibba Al Fujairah", shopAddress: "Dibba Road, Dibba Al Fujairah", lat: 25.59933, lng: 56.28432,
    specialties: ["hot towel shave", "skin fade", "beard"], services: std("b31", 4500, 2500, 6500, 5500),
    offersHomeVisits: true, homeVisitFee: 3500, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.8 * 17, ratingCount: 17,
  },
  {
    id: "b32", name: "Salem Al Mazrouei", bio: "Al Dhafra’s barber — home visits across Madinat Zayed.",
    photoUrl: photo(11), countryCode: "AE", city: "Madinat Zayed", shopAddress: "Main Street, Madinat Zayed", lat: 23.65204, lng: 53.70466,
    specialties: ["scissor cut", "beard", "taper"], services: std("b32", 5000, 3000, 7000, 6000),
    offersHomeVisits: true, homeVisitFee: 4000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.7 * 14, ratingCount: 14,
  },
  {
    id: "b33", name: "Ravi Menon", bio: "Ruwais township cuts for crews and families, on your schedule.",
    photoUrl: photo(17), countryCode: "AE", city: "Ruwais", shopAddress: "Ruwais Mall, Ruwais", lat: 24.07553, lng: 52.67161,
    specialties: ["taper", "buzz cut", "kids cut", "skin fade"], services: std("b33", 4500, 2500, 6500, 5500),
    offersHomeVisits: true, homeVisitFee: 3000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.6 * 26, ratingCount: 26,
  },
  // More chairs at the JB's Fresh flagships
  {
    id: "b34", name: "Theo Mensah", bio: "Tapers, waves and beard shaping at JB’s Fresh Peckham.",
    photoUrl: photo(11), countryCode: "GB", city: "London", shopAddress: "88 Rye Lane, London SE15", lat: 51.469, lng: -0.069,
    specialties: ["taper", "waves", "beard", "afro"], services: std("b34", 2200, 1100, 3200, 2600),
    offersHomeVisits: false, homeVisitFee: 0, ...base, ratingSum: 4.8 * 58, ratingCount: 58,
  },
  {
    id: "b35", name: "Zayn Haddad", bio: "Textured crops and hot towel shaves at JB’s Fresh Dubai Marina.",
    photoUrl: photo(3), countryCode: "AE", city: "Dubai", shopAddress: "Marina Walk, by Dubai Marina Mall, Dubai Marina", lat: 25.07664, lng: 55.14022,
    specialties: ["textured crop", "hot towel shave", "beard", "skin fade"], services: std("b35", 8500, 4500, 12000, 9500),
    offersHomeVisits: false, homeVisitFee: 0, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.7 * 31, ratingCount: 31,
  },
  // Dubai, ten barbers in all
  {
    id: "b36", name: "Hassan Farouk", bio: "Skin fades and beard sculpts on the Boulevard, with a view of the Burj.",
    photoUrl: photo(4), countryCode: "AE", city: "Dubai", shopAddress: "Boulevard Plaza, Mohammed Bin Rashid Blvd, Downtown Dubai", lat: 25.20009, lng: 55.27507,
    specialties: ["skin fade", "beard", "line-up", "taper"], services: std("b36", 15000, 8000, 20000, 17000),
    offersHomeVisits: true, homeVisitFee: 10000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.9 * 124, ratingCount: 124,
  },
  {
    id: "b37", name: "Mateo Silva", bio: "Scissor cuts and textured crops for Business Bay’s busiest diaries — in by 8, out by 8:45.",
    photoUrl: photo(5), countryCode: "AE", city: "Dubai", shopAddress: "Bay Avenue, Business Bay, Dubai", lat: 25.19071, lng: 55.26598,
    specialties: ["scissor cut", "textured crop", "side part", "pompadour"], services: std("b37", 11000, 6000, 15000, 12500),
    offersHomeVisits: true, homeVisitFee: 7000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 8, closeHour: 20, ratingSum: 4.8 * 77, ratingCount: 77,
  },
  {
    id: "b38", name: "Ahmed Saeed", bio: "Al Barsha’s family barber — kids’ first cuts, fathers and sons side by side.",
    photoUrl: photo(6), countryCode: "AE", city: "Dubai", shopAddress: "Al Barsha 1, near Mall of the Emirates, Dubai", lat: 25.115, lng: 55.1975,
    specialties: ["kids cut", "taper", "buzz cut", "skin fade"], services: std("b38", 6000, 3500, 8500, 7000),
    offersHomeVisits: true, homeVisitFee: 4000, ...base, workingDays: [0, 1, 2, 3, 4, 5, 6], openHour: 9, closeHour: 22, ratingSum: 4.8 * 203, ratingCount: 203,
  },
  {
    id: "b39", name: "Ryan Costa", bio: "Beach-ready crops and blow-dries on The Walk, JBR.",
    photoUrl: photo(8), countryCode: "AE", city: "Dubai", shopAddress: "The Walk, JBR, Dubai", lat: 25.0792, lng: 55.13549,
    specialties: ["textured crop", "french crop", "skin fade", "hair color"], services: std("b39", 9500, 5000, 13500, 11000),
    offersHomeVisits: true, homeVisitFee: 6000, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.7 * 58, ratingCount: 58,
  },
  {
    id: "b40", name: "Faris Al Zarooni", bio: "VIP grooming at your villa, hotel suite or yacht — Palm Jumeirah and Dubai Harbour.",
    photoUrl: photo(10), countryCode: "AE", city: "Dubai", shopAddress: "Golden Mile, Palm Jumeirah (home visits only)", lat: 25.10693, lng: 55.14733,
    specialties: ["hot towel shave", "beard", "skin fade", "side part"], services: std("b40", 22000, 12000, 30000, 25000),
    offersHomeVisits: true, homeVisitFee: 15000, ...base, workingDays: [0, 1, 2, 3, 4, 5, 6], openHour: 8, closeHour: 23, ratingSum: 5 * 46, ratingCount: 46,
  },
  {
    id: "b41", name: "Sami Nasser", bio: "Beard specialist at JB’s Fresh Downtown — sculpting, colour and the perfect line-up.",
    photoUrl: photo(9), countryCode: "AE", city: "Dubai", shopAddress: "Boulevard Plaza, Mohammed Bin Rashid Blvd, Downtown Dubai", lat: 25.20009, lng: 55.27507,
    specialties: ["beard", "line-up", "hot towel shave", "hair color"], services: std("b41", 10000, 6000, 14000, 11500),
    offersHomeVisits: false, homeVisitFee: 0, ...base, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22, ratingSum: 4.9 * 88, ratingCount: 88,
  },
];

// Profile details per barber. Portfolio images are sample photos from scripts/make-demo-media.sh.
const PROFILE: Record<string, { years: number; languages: string[]; gallery: number[]; transformations: number[] }> = {
  b1: { years: 12, languages: ["German", "English", "French"], gallery: [1, 3, 4], transformations: [1, 2] },
  b2: { years: 8, languages: ["German", "English"], gallery: [2, 5, 7], transformations: [3] },
  b3: { years: 15, languages: ["German", "Turkish", "English"], gallery: [8, 1, 3], transformations: [1, 2] },
  b4: { years: 6, languages: ["German", "English"], gallery: [7, 2], transformations: [3] },
  b5: { years: 10, languages: ["English"], gallery: [4, 1, 6], transformations: [4, 1] },
  b6: { years: 20, languages: ["English", "Italian"], gallery: [5, 8], transformations: [5] },
  b7: { years: 7, languages: ["English"], gallery: [2, 9], transformations: [3] },
  b8: { years: 9, languages: ["Dutch", "English"], gallery: [2, 9, 5], transformations: [3, 5] },
  b9: { years: 14, languages: ["Arabic", "English", "Urdu"], gallery: [17, 11, 1, 8], transformations: [2, 1] },
  b10: { years: 11, languages: ["English", "Spanish"], gallery: [4, 6, 10], transformations: [4, 6] },
  b11: { years: 13, languages: ["English", "Spanish"], gallery: [5, 7], transformations: [5] },
  b12: { years: 10, languages: ["French", "Arabic", "English"], gallery: [2, 3, 1], transformations: [3, 2] },
  b13: { years: 22, languages: ["Turkish", "English"], gallery: [8, 1, 5], transformations: [1, 5] },
  b14: { years: 9, languages: ["Arabic", "English"], gallery: [1, 3], transformations: [2] },
  b15: { years: 12, languages: ["English", "Yoruba"], gallery: [6, 10, 4], transformations: [6, 4] },
  b16: { years: 8, languages: ["English", "French"], gallery: [1, 4], transformations: [1] },
  b17: { years: 7, languages: ["Portuguese", "English", "Spanish"], gallery: [2, 7], transformations: [3] },
  b18: { years: 5, languages: ["English"], gallery: [2, 9], transformations: [3] },
  b19: { years: 5, languages: ["Arabic", "English"], gallery: [13, 1, 14, 6], transformations: [2] },
  b20: { years: 17, languages: ["Urdu", "Hindi", "English", "Arabic"], gallery: [11, 18, 3, 9], transformations: [3] },
  b21: { years: 13, languages: ["Arabic", "English"], gallery: [4, 7], transformations: [4] },
  b22: { years: 9, languages: ["Malayalam", "English", "Hindi"], gallery: [5, 8], transformations: [5] },
  b23: { years: 10, languages: ["Arabic", "English"], gallery: [6, 9], transformations: [6] },
  b24: { years: 15, languages: ["Urdu", "English", "Arabic"], gallery: [7, 1], transformations: [1] },
  b25: { years: 8, languages: ["Arabic", "English"], gallery: [8, 2], transformations: [2] },
  b26: { years: 7, languages: ["Arabic", "English"], gallery: [9, 3], transformations: [3] },
  b27: { years: 11, languages: ["Arabic", "English"], gallery: [1, 4], transformations: [4] },
  b28: { years: 12, languages: ["Arabic", "English"], gallery: [2, 5], transformations: [5] },
  b29: { years: 6, languages: ["Arabic", "English"], gallery: [3, 6], transformations: [6] },
  b30: { years: 9, languages: ["Arabic", "English"], gallery: [4, 7], transformations: [1] },
  b31: { years: 14, languages: ["Arabic", "English"], gallery: [5, 8], transformations: [2] },
  b32: { years: 10, languages: ["Arabic", "English"], gallery: [6, 9], transformations: [3] },
  b33: { years: 8, languages: ["Malayalam", "English", "Hindi"], gallery: [7, 1], transformations: [4] },
  b34: { years: 6, languages: ["English", "Twi"], gallery: [6, 4], transformations: [4] },
  b35: { years: 7, languages: ["Arabic", "English", "French"], gallery: [3, 5, 12, 2], transformations: [3] },
  b36: { years: 11, languages: ["Arabic", "English"], gallery: [1, 13, 6, 18], transformations: [1, 2] },
  b37: { years: 9, languages: ["Portuguese", "English", "Spanish"], gallery: [2, 5, 15, 12], transformations: [3, 5] },
  b38: { years: 16, languages: ["Arabic", "English", "Urdu"], gallery: [19, 4, 16, 6], transformations: [4, 1] },
  b39: { years: 6, languages: ["English", "Portuguese"], gallery: [15, 2, 10, 5], transformations: [3] },
  b40: { years: 18, languages: ["Arabic", "English", "French"], gallery: [17, 11, 8, 10], transformations: [2, 5] },
  b41: { years: 10, languages: ["Arabic", "English"], gallery: [8, 20, 9, 7], transformations: [2, 6] },
};

const STYLE_NAMES = ["", "Skin fade", "Beard sculpt", "Textured crop", "Taper", "Side part", "Hair design"];

// ---------- Barbershops ----------
// Photos starting with "brand:" are the app's own shop photography (app/src/lib/brandMedia.ts).

const shopBase = { workingDays: [1, 2, 3, 4, 5, 6], openHour: 9, closeHour: 19 };
const gulfDays = { workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 22 };
const ALL_PRODUCTS = ["p-pomade", "p-wax", "p-powder", "p-wave", "p-shampoo", "p-conditioner", "p-beard-oil", "p-beard-balm", "p-aftershave", "p-brush", "p-kit"];

export const SHOPS: Shop[] = [
  {
    id: "s-london-peckham", name: "JB’s Fresh Peckham", photoUrl: "brand:hero-barber-bw",
    about: "The JB’s Fresh flagship: fades and designs all day, and the full product wall.",
    countryCode: "GB", city: "London", address: "88 Rye Lane, London SE15", lat: 51.469, lng: -0.069, phone: "+44 20 7946 0188",
    ...shopBase, closeHour: 20,
    privateHire: { pricePerHour: 15000, minHours: 2, maxHours: 8, maxGuests: 12 },
    delivery: { fee: 399, freeFrom: 3000, etaMin: 45, radiusKm: 8 }, productIds: ALL_PRODUCTS,
  },
  {
    id: "s-london-jermyn", name: "Shaw & Sons", photoUrl: "/media/demo/shop-vintage-red.jpg",
    about: "Traditional Jermyn Street barbering: hot towels, straight razors and wedding-morning shaves.",
    countryCode: "GB", city: "London", address: "12 Jermyn Street, London SW1", lat: 51.508, lng: -0.137, phone: "+44 20 7946 0112",
    ...shopBase,
    privateHire: { pricePerHour: 22000, minHours: 2, maxHours: 6, maxGuests: 8 },
    delivery: null, productIds: ["p-shampoo", "p-beard-oil", "p-aftershave"],
  },
  {
    id: "s-dubai-marina", name: "JB’s Fresh Dubai Marina", photoUrl: "/media/demo/shop-luxury.jpg",
    about: "Marina Walk flagship with sea views. Late opening, VIP room and same-hour delivery across the Marina and JBR.",
    countryCode: "AE", city: "Dubai", address: "Marina Walk, by Dubai Marina Mall, Dubai Marina", lat: 25.07664, lng: 55.14022, phone: "+971 4 555 0188",
    ...gulfDays,
    privateHire: { pricePerHour: 75000, minHours: 2, maxHours: 8, maxGuests: 15 },
    delivery: { fee: 1500, freeFrom: 15000, etaMin: 40, radiusKm: 10 }, productIds: ALL_PRODUCTS,
  },
  {
    id: "s-dubai-downtown", name: "JB’s Fresh Downtown", photoUrl: "/media/demo/chair-window.jpg",
    about: "Floor-to-ceiling windows on the Boulevard. Fades, beard sculpting and a private room for groom parties.",
    countryCode: "AE", city: "Dubai", address: "Boulevard Plaza, Mohammed Bin Rashid Blvd, Downtown Dubai", lat: 25.20009, lng: 55.27507, phone: "+971 4 555 0177",
    ...gulfDays,
    privateHire: { pricePerHour: 90000, minHours: 2, maxHours: 6, maxGuests: 10 },
    delivery: { fee: 1500, freeFrom: 15000, etaMin: 35, radiusKm: 8 }, productIds: ALL_PRODUCTS,
  },
  {
    id: "s-dubai-deira", name: "Deira Classic Barbers", photoUrl: "/media/demo/shop-brick.jpg",
    about: "Old Deira barbering since 2009 — hot towel shaves and classic cuts.",
    countryCode: "AE", city: "Dubai", address: "Al Rigga Road, by Al Rigga Metro, Deira, Dubai", lat: 25.26363, lng: 55.32375, phone: "+971 4 555 0120",
    ...gulfDays,
    privateHire: null,
    delivery: { fee: 1000, freeFrom: 10000, etaMin: 50, radiusKm: 6 }, productIds: ["p-pomade", "p-shampoo", "p-beard-oil", "p-aftershave"],
  },
  {
    id: "s-abudhabi-corniche", name: "Corniche Gentlemen’s Lounge", photoUrl: "/media/demo/chair-leather.jpg",
    about: "Gentleman’s grooming on the Corniche, with a private lounge for groom parties.",
    countryCode: "AE", city: "Abu Dhabi", address: "Corniche Road West, Nation Towers, Abu Dhabi", lat: 24.4655, lng: 54.327, phone: "+971 2 555 0121",
    ...gulfDays,
    privateHire: { pricePerHour: 60000, minHours: 2, maxHours: 6, maxGuests: 10 },
    delivery: { fee: 1500, freeFrom: 15000, etaMin: 60, radiusKm: 12 }, productIds: ALL_PRODUCTS,
  },
  {
    id: "s-sharjah-majaz", name: "Al Majaz Barbers", photoUrl: "/media/demo/shop-chairs-row.jpg",
    about: "Clean fades and beard line-ups on the Al Majaz waterfront.",
    countryCode: "AE", city: "Sharjah", address: "Al Majaz Waterfront, Jamal Abdul Nasser St, Sharjah", lat: 25.32628, lng: 55.39126, phone: "+971 6 555 0123",
    ...gulfDays,
    privateHire: { pricePerHour: 40000, minHours: 2, maxHours: 5, maxGuests: 8 },
    delivery: { fee: 1000, freeFrom: 10000, etaMin: 50, radiusKm: 8 }, productIds: ["p-pomade", "p-powder", "p-beard-oil", "p-beard-balm", "p-kit"],
  },
  {
    id: "s-berlin-kreuzberg", name: "Fresh Kreuzberg", photoUrl: "/media/demo/shop-busy.jpg",
    about: "Kreuzberg’s fade studio — walk-ins welcome, Saturday parties on request.",
    countryCode: "DE", city: "Berlin", address: "Oranienstraße 21, 10999 Berlin", lat: 52.5017, lng: 13.418, phone: "+49 30 5555 0121",
    ...shopBase,
    privateHire: { pricePerHour: 12000, minHours: 2, maxHours: 6, maxGuests: 10 },
    delivery: { fee: 495, freeFrom: 3500, etaMin: 50, radiusKm: 6 }, productIds: ALL_PRODUCTS,
  },
  {
    id: "s-nyc-bedford", name: "Bedford Ave Cuts", photoUrl: "/media/demo/shop-bright.jpg",
    about: "Brooklyn tapers, waves and braids prep on Bedford Ave.",
    countryCode: "US", city: "New York", address: "220 Bedford Ave, Brooklyn, NY", lat: 40.717, lng: -73.957, phone: "+1 718 555 0110",
    ...shopBase,
    privateHire: { pricePerHour: 18000, minHours: 2, maxHours: 6, maxGuests: 10 },
    delivery: { fee: 599, freeFrom: 4000, etaMin: 45, radiusKm: 5 }, productIds: ALL_PRODUCTS,
  },
  {
    id: "s-paris-oberkampf", name: "Salon Oberkampf", photoUrl: "/media/demo/shop-minimal.jpg",
    about: "Parisian precision on Rue Oberkampf — crops, tapers and beard design.",
    countryCode: "FR", city: "Paris", address: "18 Rue Oberkampf, 75011 Paris", lat: 48.865, lng: 2.376, phone: "+33 1 55 55 01 12",
    ...shopBase,
    privateHire: null,
    delivery: { fee: 495, freeFrom: 3500, etaMin: 50, radiusKm: 5 }, productIds: ["p-pomade", "p-wax", "p-shampoo", "p-beard-oil", "p-aftershave"],
  },
];

/** Which seed barbers work at which shop. */
const SHOP_TEAMS: Record<string, string[]> = {
  "s-london-peckham": ["b5", "b34"],
  "s-london-jermyn": ["b6"],
  "s-dubai-marina": ["b19", "b35"],
  "s-dubai-downtown": ["b36", "b41"],
  "s-dubai-deira": ["b20"],
  "s-abudhabi-corniche": ["b21"],
  "s-sharjah-majaz": ["b23"],
  "s-berlin-kreuzberg": ["b1"],
  "s-nyc-bedford": ["b10"],
  "s-paris-oberkampf": ["b12"],
};

export const BARBERS: Barber[] = BASE_BARBERS.map((b) => {
  const p = PROFILE[b.id] ?? { years: 5, languages: ["English"], gallery: [], transformations: [] };
  const shop = SHOPS.find((s) => SHOP_TEAMS[s.id]?.includes(b.id));
  return {
    ...b,
    ...(shop ? { shopId: shop.id, shopAddress: shop.address, lat: shop.lat, lng: shop.lng } : {}), // at the shop's chair
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
