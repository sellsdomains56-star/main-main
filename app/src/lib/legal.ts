/**
 * The terms of use and privacy policy shown in the app. Drafts written for a UAE launch:
 * set LEGAL_REVIEWED to true once the company's lawyer has approved the final wording.
 */
export const LEGAL_REVIEWED = false;
export const LEGAL_UPDATED = "October 2026";
export const LEGAL_CONTACT = "support@alwaysfresh.app";

export interface LegalDoc { title: string; intro: string; sections: { heading: string; body: string[] }[] }

export const LEGAL: Record<"terms" | "privacy", LegalDoc> = {
  terms: {
    title: "Terms of use",
    intro: "These terms apply when you use the Always Fresh app or website to find, book and pay barbers and barbershops, buy Always Fresh products, join The Club or buy gift cards. By creating an account or booking, you agree to them.",
    sections: [
      { heading: "What Always Fresh does", body: [
        "We run a marketplace. Barbers and barbershops on the app are independent businesses: they set their own services, prices and hours and are responsible for the services they provide. We take bookings and payments for them and pass the money on, minus our fee.",
        "Barbers are checked before they can take bookings (identity, trade licence and health card where required), but we don't employ them.",
      ] },
      { heading: "Your account", body: [
        "You need to be 18 or over to have an account. Bookings for children are made by a parent or guardian.",
        "Keep your password private. You're responsible for what happens in your account. Tell us straight away if you think someone else has used it.",
      ] },
      { heading: "Bookings and payment", body: [
        "Prices are shown in the local currency and include VAT where it applies. You pay when you book, by card, Apple Pay or Google Pay. A booking is confirmed once payment goes through.",
        "Extras and home-visit travel fees are added to the price before you pay. Tips go to the barber in full.",
        "Gift-card credit and Club cuts are applied automatically when you book.",
      ] },
      { heading: "Changes and cancellations", body: [
        "You can cancel an upcoming booking in the app. Unless a barber's own cancellation rules are shown before you book, cancelling gives a full refund to your original payment method, usually within 5 to 10 business days.",
        "If a barber or barbershop cancels, you get a full refund. If you don't turn up, the booking can be marked as a no-show and isn't refunded.",
      ] },
      { heading: "The Club and gift cards", body: [
        "Club memberships are paid for 30 days at a time and include the services listed for your plan. Unused services don't roll over. You can stop renewing at any time.",
        "Gift cards can be spent on bookings and products. They can't be exchanged for cash.",
      ] },
      { heading: "Products and delivery", body: [
        "Always Fresh products are sold by us. Delivery times are estimates. If something arrives damaged or wrong, contact us within 7 days for a replacement or refund.",
      ] },
      { heading: "Reviews, reels and photos", body: [
        "Only customers who completed a booking can review it. Reviews must be honest and respectful.",
        "Barbers may only post photos and videos of clients who agreed to it. Anything that breaks these rules, or the law, can be removed, and accounts can be paused.",
      ] },
      { heading: "AI features", body: [
        "The concierge and try-on give suggestions. They can be wrong, and the concierge never books or pays on its own: you always confirm.",
      ] },
      { heading: "Responsibility", body: [
        "We work hard to keep the app available and accurate, but can't promise it will always be. Nothing in these terms limits rights you have under UAE consumer protection law.",
      ] },
      { heading: "Changes, law and contact", body: [
        "We may update these terms and will tell you in the app before important changes take effect.",
        "These terms are governed by the laws of the United Arab Emirates, as applied in the Emirate of Dubai.",
        `Questions: ${LEGAL_CONTACT} or Account → Help centre.`,
      ] },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "This explains what personal data Always Fresh collects, why, who we share it with and the choices you have. We follow the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021).",
    sections: [
      { heading: "What we collect", body: [
        "Account details: name, email, password (stored scrambled), city, and your Apple or Google sign-in ID if you use them.",
        "Bookings and orders: what you booked, when and where (including a home or hotel address you give us), notes for your barber, payments and refunds. We never see or store your full card number: our payment provider handles it.",
        "Preferences you choose to give (“My chair”), reviews, comments, saved reels, support messages and concierge chats.",
        "Photos you upload for AI Try-On are used to make the preview and are not kept.",
        "Basic device information and push-notification tokens so alerts reach your phone.",
      ] },
      { heading: "Why we use it", body: [
        "To run your bookings, payments, reminders and deliveries; to show barbers what they need for your appointment; to prevent fraud; to answer support requests; and to keep the app working and improve it.",
        "We send offers only if you leave them switched on in Settings → Alerts.",
      ] },
      { heading: "Who we share it with", body: [
        "The barber or barbershop you book, so they can serve you. Our payment provider (Stripe), email and push-notification services, hosting, and AI providers that power the concierge and try-on, only for those purposes. Authorities when the law requires it.",
        "We don't sell your personal data.",
      ] },
      { heading: "How long we keep it", body: [
        "While you have an account. When you delete it, we remove your personal details. Past bookings and payments are kept without your name for as long as UAE tax and accounting rules require.",
      ] },
      { heading: "Your choices and rights", body: [
        "Get a copy of your data: Settings → Your data → Email me a copy.",
        "Correct your details in Account, choose your alerts in Settings, or delete your account in Settings → Delete account.",
        `For anything else, or to complain about how we handle your data, write to ${LEGAL_CONTACT}. You can also contact the UAE Data Office.`,
      ] },
      { heading: "Security", body: [
        "Data is sent encrypted, passwords are stored scrambled, and access is limited to the team members who need it.",
      ] },
      { heading: "Changes", body: [
        "We'll tell you in the app before important changes to this policy take effect.",
      ] },
    ],
  },
};
