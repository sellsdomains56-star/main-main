# Always Fresh 💈

Book a barber in your city — at their shop or at your door — pay with Apple Pay, Google Pay or card, rate your cut, and let an AI stylist tell you which haircut suits you from a photo of your head.

One codebase, three platforms:

| Folder | What it is |
| --- | --- |
| [`app/`](app) | The **iOS app, Android app and website** (Expo / React Native + Expo Router). |
| [`server/`](server) | The **API** (Node + Express + TypeScript): barbers, locations, bookings, payments, ratings, AI stylist. |

## Features

- **Book by country and city** – customers pick their country, then their city (or "all cities"), and only see barbers there. Prices are in the local currency and appointment times are shown in the barber's local time.
- **Barber profiles** – bio, specialties, services and prices, shop address, rating and reviews.
- **Barber comes to you** – choose "Come to me" (home visit, with the barber's travel fee) or "At the shop".
- **Live availability** – 30-minute slots inside opening hours; taken slots disappear, double-bookings are rejected.
- **Payments** – Stripe PaymentIntents. On iPhone the payment sheet shows **Apple Pay**, on Android **Google Pay**, on the website the Stripe Payment Element (Apple Pay in Safari, Google Pay in Chrome, cards, and local methods like iDEAL/Klarna if you enable them in Stripe). Cancelling a paid booking refunds it.
- **Ratings** – after the barber marks the appointment done, the customer can rate 1–5 stars and leave a review (one per booking).
- **AI stylist** – take or upload a photo of your head, add preferences (length, maintenance, vibe). Claude analyses face shape and hair type, recommends 3–5 cuts with exact "tell your barber" instructions, and suggests barbers in your city who specialise in them.
- **Barber accounts** – barbers sign up in-app ("Join as a barber"), get a listing in their city, see their appointments and tap "I'm on my way" / "Mark as done".
- **Demo mode** – without Stripe keys the app runs with simulated payments so you can try everything immediately.

## Run it locally

Requirements: Node 20+.

```bash
# 1. API
cd server
npm install
cp .env.example .env      # optional: add STRIPE_SECRET_KEY and ANTHROPIC_API_KEY
npm run dev               # http://localhost:4000

# 2. App (new terminal)
cd app
npm install
cp .env.example .env      # set EXPO_PUBLIC_API_URL, optional Stripe publishable key
npx expo start            # press w for the website, scan the QR code for your phone
```

On a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP (e.g. `http://192.168.1.20:4000`), not `localhost`.

> Apple Pay / Google Pay and the camera use native code, so on phones use a **development build** (`npx expo run:ios`, `npx expo run:android`, or `npx eas-cli build --profile development`) rather than Expo Go.

Tests and type checks:

```bash
cd server && npm test && npm run typecheck
cd app && npx tsc --noEmit
```

## Going live checklist

1. **Stripe** – create an account, put `STRIPE_SECRET_KEY` in `server/.env` and `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `app/.env`. Add a webhook to `https://<your-api>/webhooks/stripe` for `payment_intent.succeeded` and set `STRIPE_WEBHOOK_SECRET`. Set `EXPO_PUBLIC_MERCHANT_COUNTRY` to your Stripe account's country.
2. **Apple Pay** – create the merchant ID `merchant.com.alwaysfresh.app` in your Apple Developer account (or change it in `app/app.json` and `app/src/lib/config.ts`), upload Stripe's Apple Pay certificate, and for the website register your domain under Stripe → Settings → Payment method domains.
3. **Google Pay** – enabled via `enableGooglePay` in `app/app.json`; request production access in the Google Pay console before launch (test mode is used in development builds).
4. **Paying barbers** – right now all money lands in your Stripe account and the platform fee (`PLATFORM_FEE_PERCENT`) is recorded on each payment. To pay barbers out automatically, add Stripe Connect (Express accounts) and pass `transfer_data` / `application_fee_amount` when creating the PaymentIntent in `server/src/payments.ts`.
5. **AI stylist** – set `ANTHROPIC_API_KEY` on the server. It uses Claude (`claude-opus-5-5`) with vision and structured output (`server/src/stylist.ts`). Photos are resized on the device and are not stored.
6. **Database** – the API stores data in `server/data/db.json`, which is fine for trying it out. Move to Postgres (or similar) before launch; all data access goes through `server/src/db.ts`.
7. **Cities** – add countries/cities in `server/src/seed.ts` (`COUNTRIES`). Replace the sample barbers with real ones.
8. **App stores** – change the bundle IDs in `app/app.json` if needed, then `npx eas-cli build --platform all` and `npx eas-cli submit`. Deploy the website with `npx expo export --platform web` and host the `dist/` folder (any static host).
