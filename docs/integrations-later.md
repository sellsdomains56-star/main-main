# Integrations that need Always Fresh's own accounts

These are designed but not switched on, because each needs a contract or an account in the company's name. The steps below are what to do once you have them.

## Stripe Connect (paying barbers automatically)

Built: barbers open Dashboard → Payouts, Stripe checks their ID and bank (Stripe Express), and from then on each booking's money goes straight to them with Always Fresh's fee taken by Stripe (`application_fee_amount`). Without it, Always Fresh keeps receiving all money and pays barbers by bank transfer.

1. In the Stripe dashboard, open Connect and choose **Express** accounts. Fill in the platform profile (UAE, marketplace for barber services).
2. Set `STRIPE_SECRET_KEY` (live key) on the server. Nothing else to configure.
3. Ask barbers to tap **Set up payouts**. Once Stripe enables their account, new bookings with them are paid out automatically.

## WhatsApp updates

Built: customers switch on WhatsApp in Profile. See README "Going live" → WhatsApp updates for the Meta Business setup and the `jb_update` template.

## Email (receipts, password reset)

Built: see README "Going live" → Email (Resend).

## Tabby / Tamara (pay in 4)

Not built yet. Both are "buy now, pay later" providers popular in the UAE; they're worth it for the Club, gift cards and bigger bookings (private hire, packages).

1. Apply for a merchant account with Tabby (tabby.ai) and/or Tamara (tamara.co). They need the trade licence and the company bank account.
2. Easiest path: enable them **inside Stripe** if your Stripe account supports them for the UAE (Payment methods settings) — the app's payment sheet then shows them with no code change.
3. Otherwise each provider has a checkout session API: the server creates a session for a booking or purchase and the app opens the provider's page, then a webhook marks it paid (same flow as `confirm-payment` today).

## Apple Wallet (Club card and booking passes)

Not built. Needs an Apple Developer account (Pass Type ID and certificate).

1. In the Apple Developer portal, create a Pass Type ID (e.g. `pass.com.alwaysfresh.club`) and its certificate.
2. Add a server route that signs a `.pkpass` (e.g. with the `passkit-generator` package) for the member card (name, plan, member number as a QR code) and for each booking (time, barber, address).
3. Add "Add to Apple Wallet" buttons on The Club and on booking cards.

## Siri Shortcuts ("Hey Siri, book my usual")

Not built. Needs the native iOS build.

1. Add an App Intent ("Book my usual") with an Expo config plugin, which opens `alwaysfresh://book/<barber>?serviceId=…` — the app already handles "Book your usual" links.
2. Donate the intent after each booking so Siri suggests it.

## Google Maps on Android

Built; needs `GOOGLE_MAPS_ANDROID_API_KEY` at build time (see README).

## Arabic

The app has an English/Arabic switch (Settings → Language) with right-to-left layout and the main screens translated. Before launch, have a native Arabic copywriter review `app/src/lib/i18n.ts` and translate the remaining screens (the business, shop and admin panels can stay English at first).
