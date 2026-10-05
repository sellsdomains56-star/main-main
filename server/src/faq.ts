export interface FaqItem {
  id: string;
  topic: "booking" | "payment" | "account" | "barber" | "shop" | "ai";
  question: string;
  answer: string;
}

/** Help-centre answers. The AI assistant is given the same text, so the two never disagree. */
export const FAQ: FaqItem[] = [
  { id: "book", topic: "booking", question: "How do I book a barber?", answer: "Search by city, style, rating, price or availability, open a barber's profile, pick a service, choose shop or home visit, pick a time and pay. You get a confirmation straight away." },
  { id: "home", topic: "booking", question: "Can the barber come to me?", answer: "Yes — barbers marked \"Comes to you\" do home, hotel and office visits for a travel fee shown before you pay. Choose \"At my place\" when booking and enter your address." },
  { id: "cancel", topic: "booking", question: "How do I cancel or change a booking?", answer: "Open Bookings and tap Cancel. Cancelling a paid booking refunds it in full to your original payment method; refunds usually arrive in 5–10 business days. To change the time, cancel and book again." },
  { id: "late", topic: "booking", question: "What if my barber is late or doesn't show up?", answer: "Contact support from the Help centre with your booking and we'll sort it out, including a full refund if the appointment didn't happen." },
  { id: "pay", topic: "payment", question: "How can I pay?", answer: "Apple Pay, Google Pay and cards (plus local methods like iDEAL or Klarna where available). Payments are processed securely by Stripe; we never see your card number." },
  { id: "currency", topic: "payment", question: "Which currency will I pay in?", answer: "You pay in the barber's local currency. Your bank converts it if your card uses a different currency." },
  { id: "reviews", topic: "booking", question: "Who can leave reviews?", answer: "Only customers who booked and completed an appointment through JB Always Fresh can rate that barber, once per appointment — so every review is from a real visit." },
  { id: "account", topic: "account", question: "How do I delete my account or data?", answer: "Contact support from the Help centre and choose Account. We delete your account and personal data within 30 days." },
  { id: "join", topic: "barber", question: "I'm a barber — how do I join?", answer: "Tap \"Are you a barber?\" on Home, create your profile, add services, photos, before-and-after transformations and reels. Customers book and pay through the app." },
  { id: "tryon", topic: "ai", question: "What happens to my try-on photo?", answer: "Your photo is sent securely to our AI providers to analyse your hair and create previews, then discarded. We don't store it or use it to train AI, and previews are only shown to you." },
  { id: "tryon-real", topic: "ai", question: "How accurate are the try-on previews?", answer: "They are AI-generated previews to help you pick a style. The real result depends on your hair's length and texture — show the preview to your barber and they'll tell you what's achievable." },
  { id: "shop", topic: "shop", question: "How does JB's Fresh delivery work?", answer: "Orders ship within 2 business days. Delivery is a flat fee, free above the threshold shown in the shop. Unopened products can be returned within 30 days." },
];

export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@jbalwaysfresh.com";
