# JB Always Fresh

**One global platform for barbers and hairstyling:** discover, compare and book barbers anywhere in the world, see their work, read real reviews, get help from an AI concierge, and preview new hairstyles on your own face before you book. Instead of searching Instagram, Google Maps, TikTok and separate booking apps, everything is in one place — as a **website and an iPhone/Android app from one codebase**.

Design: light page, black ink, gold details only — see [`app/DESIGN.md`](app/DESIGN.md). The brand name lives in `APP_NAME` / `SHOP_NAME` in `app/src/lib/config.ts` (plus `name` in `app/app.json`).

| Folder | What it is |
| --- | --- |
| [`app/`](app) | The **iOS app, Android app and website** (Expo / React Native + Expo Router). |
| [`server/`](server) | The **API** (Node + Express + TypeScript): barbers, search, bookings, payments, reviews, portfolios, reels, shop, AI concierge, AI try-on, support. |

## Features

### Discover & compare
- **Search anywhere in the world** or in your city: free text ("fade london", "braids lagos"), hairstyle/specialty, minimum rating, max price, available today, home visits. Sort by top rated, soonest available, lowest price or most experienced.
- **Professional barber profiles:** photo, bio, years of experience, languages, specialties, services and prices, location, next free time, star rating and verified reviews.
- **Portfolio:** photos of their work and **before-and-after transformations** with a drag-to-compare slider; barbers manage it under Account → My work.
- **Reels:** a full-screen swipe-up video feed of barbers' work, with Book straight from the video.

### Book & pay
- Shop appointments or **barber comes to you** (home/hotel/office) with a travel fee.
- Live availability in the barber's local time zone; double-bookings are impossible.
- **Stripe payments:** Apple Pay, Google Pay, cards (and local methods on the web). Cancelling refunds automatically.
- Reviews only from completed bookings, one per appointment.

### AI
- **AI Hairstyle Try-On:** upload a selfie → Claude analyses face shape, hair type and current cut and recommends haircuts, fades, colours and beard styles with exact "tell your barber" words → **OpenAI image editing renders each look on your own photo** (compare with a slider, or describe your own idea) → **Find barbers for this look** searches barbers with that specialty. Photos are not stored.
- **JB Concierge (Claude):** a chat assistant that searches barbers worldwide, explains profiles and prices, checks availability, shows your bookings, prepares a booking for you to confirm and pay (it never books or charges on its own), answers policy questions from the help centre, and opens support tickets. Conversations are kept server-side, append-only.

### Support & shop
- **Help centre:** searchable FAQ, a contact form that creates support tickets, and the concierge 24/7.
- **JB's Fresh shop:** "Buy all JB's Fresh products" with local-currency prices, cart, delivery and the same checkout.
- **Demo mode:** without Stripe keys, payments are simulated so you can try everything.

## Try-it demo (no install)

`node app/scripts/build-demo-page.mjs out.html` builds the website as one self-contained page (code, fonts, icons, demo media and seed data inlined) that runs with an in-browser demo server (`app/src/lib/demo/server.ts`) instead of the API — bookings, reviews, reels likes, shop orders and support tickets are kept on the viewer's device and payments are simulated. Published as a claude.ai Artifact with the `sample` capability, the concierge and the AI stylist's photo analysis run on the viewer's Claude; try-on picture previews need the real server's OpenAI connection.

## Run it locally

Requirements: Node 20+.

```bash
# 1. API
cd server
npm install
cp .env.example .env      # optional: STRIPE_SECRET_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY
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
5. **AI** – set `ANTHROPIC_API_KEY` for the AI stylist analysis and JB Concierge (Claude `claude-opus-5-5`; `server/src/stylist.ts`, `server/src/assistant.ts`), and `OPENAI_API_KEY` for try-on previews (OpenAI image editing, model set by `OPENAI_IMAGE_MODEL`, default `gpt-image-2`; `server/src/tryon.ts`). `TRYON_DAILY_LIMIT` caps previews per user per day to control cost. Each provider bills per use; previews are the most expensive part. Photos are processed per request and never stored. Hook your helpdesk into `createTicket` in `server/src/routes/support.ts` and set `SUPPORT_EMAIL`.
6. **Database** – the API stores data in `server/data/db.json`, which is fine for trying it out. Move to Postgres (or similar) before launch; all data access goes through `server/src/db.ts`.
7. **Reels** – the 12 sample reels in `server/media/demo/` are generated placeholders (`server/scripts/make-demo-reels.sh`); delete them from `server/src/reels.ts` once barbers upload real videos. Uploaded videos are stored in `server/data/uploads/` — move them to object storage (S3, Cloudflare R2, …) behind a CDN before launch, and consider transcoding uploads to H.264 MP4 so every device can play them.
8. **Shop** – replace the sample products, prices and delivery fees in `server/src/products.ts`, and add product photos. Paid orders show as "Paid · preparing"; hook up your fulfilment (or a tool like Shopify/ShipStation) to ship them and mark them shipped.
9. **Portfolio images** – the sample portfolio and before/after images in `server/media/demo/` are generated placeholders (`server/scripts/make-demo-portfolio.sh`); real barbers upload their own under Account → My work. Uploaded images go to `server/data/uploads/` — move them to object storage behind a CDN before launch.
10. **Cities** – add countries/cities in `server/src/seed.ts` (`COUNTRIES`). Replace the sample barbers with real ones.
11. **App stores** – change the bundle IDs in `app/app.json` if needed, then `npx eas-cli build --platform all` and `npx eas-cli submit`. Deploy the website with `npx expo export --platform web` and host the `dist/` folder (any static host).
