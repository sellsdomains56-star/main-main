/**
 * Campaign banners on Home: seasonal offers and highlights. `countries` limits a banner to
 * those countries; `except` hides it there (so the UAE can get a dirham version).
 * Edit freely — the app shows them in this order.
 */
export interface Campaign {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  photoUrl: string;
  link: { pathname: string; params?: Record<string, string> };
  countries?: string[];
  except?: string[];
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: "dubai-launch", eyebrow: "Now in Dubai", title: "Ten barbers. One tap.", countries: ["AE"],
    body: "From the Marina to Downtown — book a chair, or have your barber come to you.",
    cta: "Explore Dubai", photoUrl: "/media/demo/cmp-dubai.jpg", link: { pathname: "/explore" },
  },
  {
    id: "club-ae", eyebrow: "The Club · Black", title: "Unlimited cuts. At your door.", countries: ["AE"],
    body: "Every service, every month, home visits included — AED 599 a month.",
    cta: "Join The Club", photoUrl: "/media/demo/cmp-club.jpg", link: { pathname: "/club" },
  },
  {
    id: "club", eyebrow: "The Club · Black", title: "Unlimited cuts. At your door.", except: ["AE"],
    body: "Every service, every month, home visits included.",
    cta: "Join The Club", photoUrl: "/media/demo/cmp-club.jpg", link: { pathname: "/club" },
  },
  {
    id: "villa", eyebrow: "Villa · hotel · yacht", title: "Your barber comes to you", countries: ["AE"],
    body: "Home visits across Dubai and Abu Dhabi — Palm Jumeirah and Dubai Harbour included.",
    cta: "Book a home visit", photoUrl: "/media/demo/cmp-home.jpg", link: { pathname: "/explore", params: { home: "1" } },
  },
  {
    id: "groom", eyebrow: "Wedding season", title: "Hire the whole shop",
    body: "The groom, the groomsmen and a barbershop all to yourselves.",
    cta: "See barbershops", photoUrl: "/media/demo/cmp-groom.jpg", link: { pathname: "/shops" },
  },
  {
    id: "gift-ae", eyebrow: "Gift cards", title: "Give a fresh cut", countries: ["AE"],
    body: "From AED 200 — sent in seconds, never expires.",
    cta: "Send a gift", photoUrl: "/media/demo/cmp-gift.jpg", link: { pathname: "/gifts" },
  },
  {
    id: "gift", eyebrow: "Gift cards", title: "Give a fresh cut", except: ["AE"],
    body: "Sent in seconds, never expires.",
    cta: "Send a gift", photoUrl: "/media/demo/cmp-gift.jpg", link: { pathname: "/gifts" },
  },
  {
    id: "family", eyebrow: "Family Saturdays", title: "Two chairs, side by side",
    body: "Kids' first cuts with patient barbers — book for your son and yourself.",
    cta: "Find a family barber", photoUrl: "/media/demo/cmp-family.jpg", link: { pathname: "/explore", params: { specialty: "kids cut" } },
  },
  {
    id: "products", eyebrow: "Always Fresh", title: "Delivered from the shop",
    body: "Pomade, beard oil and more, brought to your door by your nearest barbershop.",
    cta: "Shop products", photoUrl: "/media/demo/cmp-products.jpg", link: { pathname: "/shops" },
  },
];

export const campaignsFor = (country?: string) =>
  CAMPAIGNS.filter((c) => (!c.countries || (country && c.countries.includes(country))) && !(country && c.except?.includes(country)));
