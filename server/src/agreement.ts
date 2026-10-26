/**
 * The agreement every freelance barber signs before going live. {company} and {fee} are filled in when it's shown.
 * A draft written for a UAE launch: have the company's lawyer approve it, then bump AGREEMENT_VERSION whenever the
 * wording changes (barbers who signed an older version are asked to sign again).
 */
export const AGREEMENT_VERSION = "2026-10";

export const AGREEMENT = {
  title: "Independent Barber Agreement",
  intro:
    "This agreement sets out how you work with JB Always Fresh as an independent barber. Please read it in full. You sign it once, electronically, before your profile goes live.",
  sections: [
    {
      heading: "1. Who this agreement is between",
      body: "This agreement is between {company} (\"JB\"), which runs the JB Always Fresh app, and you, the barber who signs below. You join as an independent professional: you are not JB's employee, partner or agent, and you decide when, where and how you work.",
    },
    {
      heading: "2. What JB does",
      body: "JB lists you in the app, lets customers find and book you, takes payment from customers on your behalf, sends booking confirmations and reminders, and gives you and your customers support. JB does not promise any number of bookings.",
    },
    {
      heading: "3. Your licence and your ID",
      body: "You confirm that you hold a valid licence or permit to work as a barber where you work, and a valid Emirates ID (or passport, outside the UAE). You keep them valid, show them to JB when asked, and tell JB within 7 days if any of them is suspended, cancelled or expires. JB may pause your profile until valid documents are on file.",
    },
    {
      heading: "4. Standards of work",
      body: "You work professionally, safely and hygienically: you clean and disinfect your tools between customers, use a new blade for every shave, and follow the rules of the health authority where you work. You arrive on time, treat every customer with respect, and never discriminate against or harass anyone. On home and hotel visits you behave as a guest in the customer's space.",
    },
    {
      heading: "5. Prices, payment and fees",
      body: "You set your own services and prices in the app. Customers pay through the app. JB keeps a service fee of {fee}% of the price of each booking made through the app. Tips always go to you in full, and bookings you add yourself (walk-ins, phone bookings) carry no JB fee. JB pays your share to your bank account every week, or automatically through Stripe once you set up payouts. You are responsible for your own taxes, including VAT if you are registered for it.",
    },
    {
      heading: "6. Cancellations and no-shows",
      body: "Customers cancel under the cancellation rules you set in the app. If you cancel a booking, the customer gets a full refund. Repeated late cancellations or no-shows on your side may lead to a pause of your profile.",
    },
    {
      heading: "7. Customers' personal data",
      body: "You use customers' names, numbers and addresses only to provide the service they booked. You don't share them with anyone or contact customers for other purposes outside the app, and you follow the UAE's data protection rules.",
    },
    {
      heading: "8. Photos and videos",
      body: "You only post photos or videos of a customer with that customer's agreement. You keep the rights to your content and allow JB to show it in the app and in JB's marketing while you are on JB Always Fresh.",
    },
    {
      heading: "9. Responsibility and insurance",
      body: "You are responsible for the services you provide and for any harm they cause. Where the law or your licence requires insurance, you keep it in place. As far as the law allows, JB is not responsible for the services you provide.",
    },
    {
      heading: "10. Reviews and complaints",
      body: "Customers can review your work. JB may remove reviews that break the app's rules. JB handles customer complaints and may refund a customer when a service was not delivered as booked.",
    },
    {
      heading: "11. Pausing and leaving",
      body: "You can leave at any time (Settings → Delete account); your upcoming bookings are then cancelled and refunded. JB may pause or remove your profile if you break this agreement, if your documents are no longer valid, or if customers' safety is at risk, and JB will tell you why.",
    },
    {
      heading: "12. Changes to this agreement",
      body: "JB may update this agreement. JB tells you about changes in the app at least 14 days before they apply, and asks you to sign again when the changes are significant.",
    },
    {
      heading: "13. Law",
      body: "This agreement is governed by the laws of the United Arab Emirates, and the courts of Dubai decide any dispute about it.",
    },
  ],
};

/** The agreement with the company's name and the current fee filled in. */
export function agreementText(company: string, feePercent: number) {
  const fill = (s: string) => s.replaceAll("{company}", company).replaceAll("{fee}", String(feePercent));
  return {
    version: AGREEMENT_VERSION,
    title: AGREEMENT.title,
    intro: fill(AGREEMENT.intro),
    sections: AGREEMENT.sections.map((s) => ({ heading: s.heading, body: fill(s.body) })),
  };
}

/** A drawn signature (SVG path in a 300 × 120 box) for the sample applications. */
export const SAMPLE_SIGNATURE = "M18 78 C 30 40, 44 30, 52 62 S 66 98, 78 64 C 86 42, 96 40, 104 70 L 110 82 C 122 58, 134 46, 150 60 C 164 72, 176 74, 190 56 C 204 40, 220 44, 232 62 M 200 92 L 286 84";
