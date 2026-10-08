# JB Always Fresh

**One global platform for barbers and hairstyling:** discover, compare and book barbers anywhere in the world, see their work, read real reviews, get help from an AI concierge, and preview new hairstyles on your own face before you book. Instead of searching Instagram, Google Maps, TikTok and separate booking apps, everything is in one place — as a **website and an iPhone/Android app from one codebase**.

Design: minimal black and white (off-white page, black type and panels, real barbershop photography) after the "Modern Barber" reference, with the JB monogram logo ("ALWAYS FRESH" beneath, in black and white versions), with gold used sparingly (star ratings and the #1 badge) — see [`app/DESIGN.md`](app/DESIGN.md). The brand name lives in `APP_NAME` / `SHOP_NAME` in `app/src/lib/config.ts` (plus `name` in `app/app.json`).

| Folder | What it is |
| --- | --- |
| [`app/`](app) | The **iOS app, Android app and website** (Expo / React Native + Expo Router). |
| [`server/`](server) | The **API** (Node + Express + TypeScript): barbers, search, bookings, payments, reviews, portfolios, reels, shop, AI concierge, AI try-on, support. |
| [`premiere-arabic-transcriber/`](premiere-arabic-transcriber) | A separate tool: an **Adobe Premiere Pro panel** that transcribes Arabic speech in a sequence into editable Arabic captions. |

## Features

### Discover & compare
- **Search anywhere in the world** or in your city: free text ("fade london", "braids lagos"), hairstyle/specialty, minimum rating, max price, available today, home visits. Sort by top rated, soonest available, lowest price or most experienced.
- **Maps:** a List / Map switch in search shows every barber in the city as a price pin — black pins have a free slot today. Home shows a map preview of your city, and every profile has a location map with Directions (Apple Maps / Google Maps). Phones use Apple Maps (iPhone) and Google Maps (Android); the website uses Leaflet with greyscale OpenStreetMap tiles.
- **Every city in the UAE:** Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah, Al Ain, Khor Fakkan, Kalba, Dibba Al Fujairah, Madinat Zayed and Ruwais, with sample barbers in each.
- **Barbershops:** each shop has its own page (photos, address, hours, map, menu and team). **Book a chair** with whoever's free — pick a service and a time and the best-rated free barber gets it. **Hire the whole shop** for a groom's party, birthday or team day: pick hours, guests and a start time (a day's notice), pay up front, and the shop's barbers are blocked for those hours. **Order for delivery:** the shop's own product stock, brought by courier in about 45 minutes, with a Packing → On its way → Delivered tracker and alerts; shop staff move it along from their Bookings tab. At checkout customers choose same-day delivery from a nearby shop or regular shipping.
- **Professional barber profiles:** photo, bio, years of experience, languages, specialties, services and prices, location, next free time, star rating and verified reviews.
- **Portfolio:** photos of their work and **before-and-after transformations** with a drag-to-compare slider; barbers manage it under Account → My work.
- **Reels, Instagram style:** a grid first (nothing plays until you pick one) with top barbers as story circles; tap a reel for the full-screen viewer: swipe up for the next, tap for sound, double-tap to like, hold to pause, plus **Like · Comment · Share · Save · ⋯** (copy link, not interested, report) and a Book button. Saved reels become your style board.
- **The Club (memberships):** Fresh (1 service a month), Regular (2) and Black (unlimited, home/hotel/yacht visits included), with 10–20% off products and a member card that tilts in your hand. Included services are applied automatically when you book.
- **Gift cards:** Noir or Ivory designs, a personal message, paid with Apple Pay; the recipient redeems the code and the balance pays for their next booking or order.
- **My chair:** quiet or chatty, drink, fragrance, music, allergies and your usual cut — the barber sees it on every booking.
- **Concierge visits:** home visits to a home, hotel, yacht or office with room, berth or gate details; book for someone else (a guest, your son, a client).
- **After the cut:** the barber leaves cut notes for next time, you can **Rebook exactly this** in one tap and **leave a tip** (100% to the barber).
- **Waitlist:** when a barber is fully booked, join the waitlist for that day and get an alert the moment a time opens.
- **Haptics:** a soft tick when you pick a time and a success tap when you slide to book (iPhone and Android).

### Book & pay
- **Free consultations:** a 15-minute **video call on Google Meet** (the barber's own Meet link, shown in Bookings) or a **phone call** (the barber calls the number you give) before you book a cut. Barbers switch it on/off and add their Meet link under Account → My work.
- Shop appointments or **barber comes to you** (home/hotel/office) with a travel fee.
- **Slide to book**, then **"Book with Apple Pay"** (Google Pay on Android) — Apple's and Google's own buttons — with cards and other methods as a fallback.
- Live availability in the barber's local time zone; double-bookings are impossible.
- **Stripe payments:** Apple Pay, Google Pay, cards (and local methods on the web). Cancelling refunds automatically.
- Reviews only from completed bookings, one per appointment.

### Alerts & calendar
- **Push notifications** (iPhone and Android) plus an **Alerts inbox** in the app (bell on Home): "You're booked", a reminder **the day before** and **an hour before**, **"Your barber is on the way"** the moment the barber taps *On my way* for a home visit, cancellations, and "How was your cut?" afterwards. Barbers get "New booking" and their own 1-hour reminders. On the website, new alerts slide in at the top of the page while it's open.
- **Add to calendar:** on phones the appointment goes straight into the phone's calendar with alerts a day and an hour before; on the website it opens Google Calendar or downloads a calendar file for Apple Calendar / Outlook.

### Accounts
- **Continue with Apple** (Apple's own button on iPhone), **Continue with Google**, or email and password. The server verifies Apple/Google identity tokens and links accounts that share a verified email.

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
5. **Sign in with Apple & Google** – Apple: "Sign in with Apple" is enabled for the iOS app (`usesAppleSignIn` in `app/app.json`); turn on the capability for your App ID in the Apple Developer portal and set `APPLE_BUNDLE_ID` on the server. Google: create OAuth client IDs (web, iOS, Android) in Google Cloud Console, put them in `app/.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, and list them in `GOOGLE_CLIENT_IDS` on the server. Buttons only appear where they're configured. (Apple sign-in on the website needs an Apple Services ID — set `APPLE_SERVICE_ID` — and isn't wired into the web build yet.)
6. **Push notifications** – run `npx eas-cli init` in `app/` (adds the EAS project id the app needs for push tokens) and let EAS set up the Apple push key and Firebase credentials when you build (`npx eas-cli credentials`). The server sends alerts through Expo's push service — no extra keys needed (optionally set `EXPO_ACCESS_TOKEN` if you turn on enhanced push security). Reminders are checked every minute by the API process.
7. **AI** – set `ANTHROPIC_API_KEY` for the AI stylist analysis and JB Concierge (Claude `claude-opus-5-5`; `server/src/stylist.ts`, `server/src/assistant.ts`), and `OPENAI_API_KEY` for try-on previews (OpenAI image editing, model set by `OPENAI_IMAGE_MODEL`, default `gpt-image-2`; `server/src/tryon.ts`). `TRYON_DAILY_LIMIT` caps previews per user per day to control cost. Each provider bills per use; previews are the most expensive part. Photos are processed per request and never stored. Hook your helpdesk into `createTicket` in `server/src/routes/support.ts` and set `SUPPORT_EMAIL`.
8. **Database** – the API stores data in `server/data/db.json`, which is fine for trying it out. Move to Postgres (or similar) before launch; all data access goes through `server/src/db.ts`.
9. **Reels** – the 12 sample reels in `server/media/demo/` are generated placeholders (`server/scripts/make-demo-reels.sh`); delete them from `server/src/reels.ts` once barbers upload real videos. Uploaded videos are stored in `server/data/uploads/` — move them to object storage (S3, Cloudflare R2, …) behind a CDN before launch, and consider transcoding uploads to H.264 MP4 so every device can play them.
10. **Shop** – replace the sample products, prices and delivery fees in `server/src/products.ts`, and add product photos. Paid orders show as "Paid · preparing"; hook up your fulfilment (or a tool like Shopify/ShipStation) to ship them and mark them shipped.
11. **Barbershops** – replace the sample shops in `server/src/seed.ts` (`SHOPS`, with their teams in `SHOP_TEAMS`): address, pin, hours, private-hire price and limits, delivery fee, free-delivery threshold, delivery time and the products each stocks. Barbers belong to a shop through `shopId`. Shop staff (barber accounts at that shop) see private hires and delivery orders in Bookings and mark deliveries *Out for delivery* / *Delivered*; if you use a courier service (Uber Direct, Stuart, Careem…), call it from `POST /orders/:id/status` in `server/src/app.ts`. Private hire and "any barber" bookings use the same Stripe payments and refunds as everything else.
12. **The Club & gift cards** – plans, prices and perks are in `server/src/club.ts` (`PLANS`, `GIFT_AMOUNTS`). Each membership payment covers 30 days and is paid like a booking; for automatic monthly renewal, move it to Stripe Billing (a Subscription per member) and extend `paidUntil` from the `invoice.paid` webhook. Gift-card codes are single-use and their balance never expires; check the rules for gift cards and stored value in each country you sell in.
13. **Portfolio images** – the sample portfolio and before/after images in `server/media/demo/` are generated placeholders (`server/scripts/make-demo-portfolio.sh`); real barbers upload their own under Account → My work. Uploaded images go to `server/data/uploads/` — move them to object storage behind a CDN before launch.
14. **Brand photography & logo** – the home screen's hero carousel, service tiles and AI Try-On panel use the photos in `app/assets/brand/` (listed in `app/src/lib/brandMedia.ts`). Before launch, make sure you own or have a licence for every photo. The JB monogram lives in `app/assets/brand/monogram.json`; after changing it, regenerate the app icon, Android icon layers, splash icon and favicon with `node app/scripts/make-icons.mjs`, and the black and white logo files in `app/assets/brand/logo/` with `node app/scripts/make-logos.mjs` (both need Playwright).
15. **Cities & maps** – add countries/cities (with their centre coordinates) in `server/src/seed.ts` (`COUNTRIES`) and replace the sample barbers with real ones; each barber's pin is `lat`/`lng` (barbers can move it with `PATCH /barbers/me`). Android maps need a Google Maps API key: set `GOOGLE_MAPS_ANDROID_API_KEY` when building (read by `app/app.config.js`); iPhone uses Apple Maps with no key. For the website, OpenStreetMap's own tile servers are for light use — for real traffic set `EXPO_PUBLIC_MAP_TILES_URL` (and `EXPO_PUBLIC_MAP_TILES_ATTRIBUTION`) to a tile provider such as MapTiler, Stadia or Mapbox.
16. **App Store & Google Play** – join the Apple Developer Program and create a Google Play Console account, change the bundle IDs in `app/app.json` if needed, then `npx eas-cli build --platform all` and `npx eas-cli submit` (EAS builds and uploads both apps from the cloud — no Mac needed). Deploy the website with `npx expo export --platform web` and host the `dist/` folder (any static host).
