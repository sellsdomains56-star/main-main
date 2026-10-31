import { AGREEMENT_VERSION, SAMPLE_SIGNATURE } from "./agreement.js";
import { DEMO_ADMIN_EMAIL, hashPassword } from "./auth.js";
import { db, newId, save } from "./db.js";
import { mainServices } from "./common.js";
import { PRODUCTS } from "./products.js";
import type { Barber, Booking, User } from "./types.js";

/** Sample logins for trying the barber side and the admin panel (DEMO_ACCOUNTS=1). Never use in production. */
export const DEMO_LOGINS = {
  admin: { email: DEMO_ADMIN_EMAIL, password: "fresh-team-demo" },
  barber: { email: "mateo@demo.alwaysfresh.app", password: "fresh-barber-demo", barberId: "b37" },
  shop: { email: "owner@demo.alwaysfresh.app", password: "fresh-shop-demo", shopId: "s-dubai-downtown" },
};

/** Two more chairs at Always Fresh Downtown, so the shop panel's calendar has a full team. */
const EXTRA_TEAM: [string, string, string[]][] = [
  ["demo-dt-1", "Rami Aziz", ["skin fade", "taper", "kids cut"]],
  ["demo-dt-2", "Leo Santos", ["scissor cut", "textured crop", "beard"]],
];

const CUSTOMERS = ["Omar Khalid", "Rashid Al Amiri", "Daniel Moreau", "Ahmed Saleh", "Yusuf Rahman", "Liam Patel", "Faisal Nasser", "Marco Rossi", "Hamdan Ali", "Sami Haddad"];
const DUBAI = ["b37", "b36", "b41", "b19", "b35", "b9", "b38", "b39", "b40", "b20", "demo-dt-1", "demo-dt-2"];
const COMMENTS = ["Sharpest fade I've had in Dubai.", "On time, clean shop, great conversation.", "Exactly what I asked for. Booking again.", "Beard line-up was perfect."];

/** Deterministic pseudo-random numbers, so every restart builds the same sample. */
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

/** Dubai wall-clock time → ISO UTC (Dubai is UTC+4 all year). */
const dubai = (dayOffset: number, hour: number, minute = 0) => {
  const d = new Date(Date.now() + 4 * 3_600_000); // today's date in Dubai, not in UTC (they differ after 8pm UTC)
  const local = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + dayOffset, hour, minute));
  return new Date(local.getTime() - 4 * 3_600_000).toISOString();
};

export function seedDemoAccounts() {
  if (db.users.some((u) => u.email === DEMO_LOGINS.admin.email)) return;
  const now = Date.now();
  const user = (name: string, email: string, password: string, extra: Partial<User> = {}, daysAgo = 20): User => {
    const u: User = { id: newId(), name, email, role: "customer", passwordHash: hashPassword(password), countryCode: "AE", city: "Dubai", createdAt: new Date(now - daysAgo * 86_400_000).toISOString(), ...extra };
    db.users.push(u);
    return u;
  };
  user("Always Fresh team", DEMO_LOGINS.admin.email, DEMO_LOGINS.admin.password, {}, 60);
  user("Mateo Silva", DEMO_LOGINS.barber.email, DEMO_LOGINS.barber.password, { role: "barber", barberId: DEMO_LOGINS.barber.barberId }, 90);
  const owner = user("Nadia Haddad", DEMO_LOGINS.shop.email, DEMO_LOGINS.shop.password, { manages: DEMO_LOGINS.shop.shopId, shopRole: "owner", branches: ["s-dubai-marina"] }, 120);
  user("Omar at the desk", "desk@demo.alwaysfresh.app", "fresh-desk-demo", { manages: DEMO_LOGINS.shop.shopId, shopRole: "front_desk" }, 40);
  const downtown = db.barbers.filter((b) => b.shopId === DEMO_LOGINS.shop.shopId);
  for (const [id, name, specialties] of EXTRA_TEAM) {
    if (db.barbers.some((b) => b.id === id) || !downtown[0]) continue;
    const base = downtown[0];
    db.barbers.push({
      ...structuredClone(base), id, name, bio: `${name.split(" ")[0]} works the chairs at Always Fresh Downtown.`, photoUrl: "", specialties,
      services: base.services.map((s) => ({ ...s, id: `${id}-${s.id.split("-").pop()}` })), gallery: [], transformations: [], ratingSum: 0, ratingCount: 0,
      yearsExperience: 4, workingDays: [0, 1, 2, 3, 4, 6], openHour: 10, closeHour: 21, timeOff: [],
    });
  }
  const rand = rng(42);
  const customers = CUSTOMERS.map((n, i) => user(n, `${n.split(" ")[0].toLowerCase()}@example.com`, "customer-demo", {}, Math.floor(rand() * 30)));

  // Bookings: the last 30 days (done, a few cancelled) and the next week, more for Mateo.
  const taken = new Set<string>();
  const book = (barberId: string, dayOffset: number, hour: number, status: Booking["status"], customer = customers[Math.floor(rand() * customers.length)]!) => {
    const barber = db.barbers.find((b) => b.id === barberId);
    if (!barber) return;
    const key = `${barberId}:${dayOffset}:${hour}`;
    if (taken.has(key)) return;
    if (!barber.workingDays.includes(new Date(dubai(dayOffset, 12)).getUTCDay())) return; // only on days they work
    taken.add(key);
    const menu = mainServices(barber); // extras are only added to a service, never booked alone
    const service = menu[Math.floor(rand() * menu.length)]!;
    const startsAt = dubai(dayOffset, hour);
    const b: Booking = {
      id: newId(), customerId: customer.id, barberId, serviceId: service.id, startsAt,
      endsAt: new Date(Date.parse(startsAt) + service.durationMin * 60_000).toISOString(),
      locationType: "shop", address: barber.shopAddress, notes: "", amount: service.price, currency: "aed",
      status, reviewed: false, createdAt: new Date(Date.parse(startsAt) - (1 + Math.floor(rand() * 5)) * 86_400_000).toISOString(),
      remindedDay: true, remindedHour: true,
    };
    if (status === "completed" && rand() < 0.5) b.tip = Math.round(service.price * 0.1 / 500) * 500 || 1000;
    db.bookings.push(b);
    return b;
  };
  for (let d = -30; d <= -1; d++) {
    for (const id of DUBAI) if (rand() < (id === "b37" ? 0.75 : 0.35)) book(id, d, 10 + Math.floor(rand() * 8), rand() < 0.08 ? "cancelled" : "completed");
  }
  for (const [h, done] of [[10, true], [12, true], [15, false], [17, false], [19, false]] as const) book("b37", 0, h, done && Date.parse(dubai(0, h)) < now ? "completed" : "confirmed");
  for (let d = 1; d <= 6; d++) {
    for (const id of DUBAI) {
      const n = id === "b37" ? 2 + Math.floor(rand() * 3) : rand() < 0.4 ? 1 : 0;
      for (let i = 0; i < n; i++) book(id, d, 10 + Math.floor(rand() * 9), "confirmed");
    }
  }

  // A busy day at Always Fresh Downtown: app bookings, walk-ins, a lunch break.
  const walkIns = ["Khalid", "Arjun", "Tom", "Majid", "Pedro", "Ali"];
  ["b36", "b41", "demo-dt-1", "demo-dt-2"].forEach((id, i) => {
    for (const h of [11, 13, 16, 18]) {
      const b = book(id, 0, h + (i % 2 ? 1 : 0), Date.parse(dubai(0, h + 1)) < now ? "completed" : "confirmed");
      if (b && rand() < 0.4) Object.assign(b, { customerId: owner.id, guest: { name: walkIns[Math.floor(rand() * walkIns.length)]!, phone: "" }, source: "shop", reviewed: true });
    }
    db.blocks.push({ id: newId(), shopId: DEMO_LOGINS.shop.shopId, barberId: id, startsAt: dubai(0, 14 + (i % 2)), endsAt: new Date(Date.parse(dubai(0, 14 + (i % 2))) + 45 * 60_000).toISOString(), reason: "Lunch", createdAt: new Date(now).toISOString() });
  });

  // A few reviews for Mateo's recent cuts.
  const done = db.bookings.filter((b) => b.barberId === "b37" && b.status === "completed").slice(-4);
  done.forEach((b, i) => {
    const c = db.users.find((u) => u.id === b.customerId)!;
    db.reviews.push({ id: newId(), barberId: "b37", customerId: c.id, customerName: c.name.split(" ")[0]!, bookingId: b.id, rating: i === 2 ? 4 : 5, comment: COMMENTS[i]!, createdAt: b.endsAt });
    b.reviewed = true;
  });

  // Two barbers who just signed up and wait for the team's approval.
  const pending: [string, string, string, number, number, string][] = [
    ["Karim Haddad", "Cluster D, Jumeirah Lake Towers, Dubai", "Dubai", 25.0698, 55.1414, "/media/demo/av12.jpg"],
    ["Yusuf Rahman", "Al Nuaimiya, Ajman", "Ajman", 25.3933, 55.4466, "/media/demo/av15.jpg"],
  ];
  pending.forEach(([name, address, city, lat, lng, photo], i) => {
    const id = `demo-pending-${i + 1}`;
    const price = 6000 + i * 1000;
    const barber: Barber = {
      id, name, bio: i === 0 ? "Precision fades and beard sculpting in JLT. Ten years behind the chair in Beirut and Dubai." : "", photoUrl: i === 0 ? photo : "",
      countryCode: "AE", city, shopAddress: address, lat, lng, specialties: ["skin fade", "beard"],
      services: [
        { id: `${id}-cut`, name: "Classic haircut", durationMin: 30, price },
        { id: `${id}-fade`, name: "Skin fade", durationMin: 45, price: Math.round(price * 1.2) },
      ],
      offersHomeVisits: i === 0, homeVisitFee: i === 0 ? 5000 : 0, yearsExperience: i === 0 ? 10 : 3, languages: ["English", "Arabic"],
      gallery: [], transformations: [], workingDays: [1, 2, 3, 4, 5, 6], openHour: 10, closeHour: 21, ratingSum: 0, ratingCount: 0,
      status: "pending", joinedAt: new Date(now - (i + 1) * 3_600_000 * 7).toISOString(),
    };
    db.barbers.push(barber);
    user(name, `${name.split(" ")[0]!.toLowerCase()}.barber@example.com`, "barber-demo", { role: "barber", barberId: id, city }, 0);
  });

  // Applications: Karim's is waiting for the team, Yusuf is still filling his in, Mateo was approved when he joined.
  const doc = (file: string, ago: number) => ({ file, contentType: "image/jpeg", uploadedAt: new Date(now - ago).toISOString() });
  const docs = (ago: number) => ({ id_front: doc("sample-id-front.jpg", ago), id_back: doc("sample-id-back.jpg", ago), licence: doc("sample-licence.jpg", ago) });
  const signed = (name: string, ago: number) => ({ name, svg: SAMPLE_SIGNATURE, version: AGREEMENT_VERSION, signedAt: new Date(now - ago).toISOString(), ip: "203.0.113.24", userAgent: "Sample phone" });
  const stamp = (ago: number) => new Date(now - ago).toISOString();
  db.applications.push(
    {
      barberId: "demo-pending-1", status: "submitted", legalName: "Karim Haddad", idNumber: "784-1990-1234567-1", idExpiry: "2028-06-30",
      licenceNumber: "BL-2026-004512", licenceAuthority: "Dubai Municipality", licenceExpiry: "2027-09-30",
      docs: docs(3 * 3_600_000), signature: signed("Karim Haddad", 3 * 3_600_000), submittedAt: stamp(3 * 3_600_000), createdAt: stamp(7 * 3_600_000), updatedAt: stamp(3 * 3_600_000),
    },
    { barberId: "demo-pending-2", status: "draft", legalName: "Yusuf Rahman", idNumber: "784-1996-7654321-2", idExpiry: "2029-02-28", docs: { id_front: doc("sample-id-front.jpg", 13 * 3_600_000) }, createdAt: stamp(14 * 3_600_000), updatedAt: stamp(13 * 3_600_000) },
    {
      barberId: DEMO_LOGINS.barber.barberId, status: "approved", legalName: "Mateo Silva", idNumber: "784-1989-2468013-5", idExpiry: "2028-11-30",
      licenceNumber: "BL-2025-118734", licenceAuthority: "Dubai Municipality", licenceExpiry: "2027-12-31",
      docs: docs(120 * 86_400_000), signature: signed("Mateo Silva", 120 * 86_400_000), submittedAt: stamp(120 * 86_400_000),
      reviewedAt: stamp(119 * 86_400_000), reviewedBy: DEMO_ADMIN_EMAIL, createdAt: stamp(121 * 86_400_000), updatedAt: stamp(119 * 86_400_000),
    },
  );

  // Mateo's booking rules: free cancellation up to 24 hours, then half; 15% off quiet weekday mornings.
  const mateo = db.barbers.find((b) => b.id === DEMO_LOGINS.barber.barberId);
  if (mateo) {
    mateo.cancelPolicy = { freeHours: 24, lateFeePercent: 50 };
    mateo.offPeak = { percent: 15, days: [1, 2, 3], fromHour: 10, toHour: 13 };
  }
  // The shop floor: a walk-in queue, stock on the shelf, and a few deliveries.
  const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
  db.queue.push(
    { id: newId(), shopId: DEMO_LOGINS.shop.shopId, name: "Hamza", phone: "", service: "Skin fade", status: "serving", barberId: downtown[0]?.id, joinedAt: minsAgo(50), calledAt: minsAgo(15) },
    { id: newId(), shopId: DEMO_LOGINS.shop.shopId, name: "Leo", phone: "", service: "Haircut", status: "waiting", joinedAt: minsAgo(25) },
    { id: newId(), shopId: DEMO_LOGINS.shop.shopId, name: customers[2]!.name, phone: "", userId: customers[2]!.id, service: "Haircut + beard", status: "waiting", joinedAt: minsAgo(12) },
    { id: newId(), shopId: DEMO_LOGINS.shop.shopId, name: "Ibrahim", phone: "", service: "Beard trim", status: "waiting", joinedAt: minsAgo(4) },
  );
  db.stock[DEMO_LOGINS.shop.shopId] = { "p-pomade": 14, "p-wax": 2, "p-powder": 9, "p-shampoo": 0, "p-beard-oil": 21 };
  [[2, "p-pomade", 2, "delivered"], [6, "p-beard-oil", 1, "out_for_delivery"], [26, "p-kit", 1, "paid"]].forEach(([hoursAgo, productId, quantity, status], i) => {
    const c = customers[(i * 3) % customers.length]!;
    const product = PRODUCTS.find((p) => p.id === productId)!;
    const unit = product.prices.aed!;
    const subtotal = unit * (quantity as number);
    db.orders.push({
      id: newId(), customerId: c.id, items: [{ productId: product.id, name: product.name, quantity: quantity as number, unitPrice: unit }],
      subtotal, shipping: 0, amount: subtotal, currency: "aed", fulfilment: "delivery", shopId: DEMO_LOGINS.shop.shopId,
      shippingName: c.name, shippingAddress: ["Burj Views, Downtown Dubai", "Boulevard Point, Downtown Dubai", "29 Boulevard, Downtown Dubai"][i]!, countryCode: "AE",
      status: status as "paid", createdAt: new Date(now - (hoursAgo as number) * 3_600_000).toISOString(),
    });
  });

  // Partners: a hotel whose guests book through its QR code, and a company whose people get a discount.
  db.partners.push(
    { id: "demo-partner-atlantis", kind: "hotel", name: "Atlantis The Royal", code: "ATLANTIS", discountPercent: 0, commissionPercent: 10, contactEmail: "concierge@atlantis.example", active: true, createdAt: new Date(now - 40 * 86_400_000).toISOString() },
    { id: "demo-partner-emirates", kind: "corporate", name: "Emirates Group", code: "EMIRATES", discountPercent: 15, commissionPercent: 0, emailDomain: "emirates.example", contactEmail: "people@emirates.example", active: true, createdAt: new Date(now - 25 * 86_400_000).toISOString() },
  );
  db.bookings.filter((b) => ["confirmed", "completed"].includes(b.status)).forEach((b, i) => {
    if (i % 9 === 0) b.partnerId = "demo-partner-atlantis";
    else if (i % 13 === 0) b.partnerId = "demo-partner-emirates";
  });
  // A client's question for Mateo.
  const at = (m: number) => new Date(now - m * 60_000).toISOString();
  db.chats.push({
    id: newId(), customerId: customers[1]!.id, barberId: DEMO_LOGINS.barber.barberId, updatedAt: at(40),
    messages: [
      { id: newId(), from: "customer", text: "Hi Mateo, can you do a textured crop like your last reel?", at: at(55) },
      { id: newId(), from: "barber", text: "For sure. Bring a photo if you have one. See you Thursday!", at: at(48) },
      { id: newId(), from: "customer", text: "Perfect, I'll be 5 minutes early.", at: at(40) },
    ],
  });

  // Support: two questions and a reported reel.
  const t = (userIdx: number, topic: "booking" | "payment" | "other", message: string, hoursAgo: number, reelId?: string) => {
    const c = customers[userIdx]!;
    db.tickets.push({ id: newId(), userId: c.id, name: c.name, email: c.email, topic, message, source: "form", status: "open", reelId, createdAt: new Date(now - hoursAgo * 3_600_000).toISOString() });
  };
  t(0, "booking", "My barber was 20 minutes late yesterday at Business Bay. Can I get something back?", 5);
  t(3, "payment", "I was charged twice for my Club membership this month — please check.", 26);
  const reported = db.reels.find((r) => r.id === "r14");
  const reportedBy = reported && db.barbers.find((b) => b.id === reported.barberId);
  if (reported && reportedBy) t(5, "other", `Reported reel by ${reportedBy.name}: Looks like someone else's photo`, 3, reported.id);

  save();
  console.log(`Demo accounts ready — admin: ${DEMO_LOGINS.admin.email} / ${DEMO_LOGINS.admin.password}, barber: ${DEMO_LOGINS.barber.email} / ${DEMO_LOGINS.barber.password}, barbershop: ${DEMO_LOGINS.shop.email} / ${DEMO_LOGINS.shop.password}`);
}
