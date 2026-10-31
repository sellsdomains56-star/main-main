# JB Always Fresh

**One global platform for barbers and hairstyling:** discover, compare and book barbers anywhere in the world, see their work, read real reviews, get help from an AI concierge, and preview new hairstyles on your own face before you book. Instead of searching Instagram, Google Maps, TikTok and separate booking apps, everything is in one place — as a **website and an iPhone/Android app from one codebase**.

Design: minimal black and white (off-white page, black type and panels, real barbershop photography) after the "Modern Barber" reference, with the JB monogram logo ("ALWAYS FRESH" beneath, in black and white versions), with gold used sparingly (star ratings and the #1 badge) — see [`app/DESIGN.md`](app/DESIGN.md). The brand name lives in `APP_NAME` / `SHOP_NAME` in `app/src/lib/config.ts` (plus `name` in `app/app.json`).

| Folder | What it is |
| --- | --- |
| [`app/`](app) | The **iOS app, Android app and website** (Expo / React Native + Expo Router). |
| [`server/`](server) | The **API** (Node + Express + TypeScript): barbers, search, bookings, payments, reviews, portfolios, reels, shop, AI concierge, AI try-on, support. |
| [`wepink-gcc/`](wepink-gcc) | A separate client project: the **wepink GCC storefront** (English/Arabic, six Gulf currencies). See its [README](wepink-gcc/README.md). |

## Features

### Discover & compare
- **Search anywhere in the world** or in your city: free text ("fade london", "braids lagos"), hairstyle/specialty, minimum rating, max price, available today, home visits. Sort by top rated, soonest available, lowest price or most experienced.
- **Navigation:** five tabs — Home, Reels, **JB Concierge** (the raised black orb in the middle opens the AI chat), Bookings and Account. Wide screens get the same in the black side rail.
- **3D map:** every barber and barbershop at their exact address. The full-screen map (`/map`, from Home, search or any profile) shows the whole country with chips for each emirate (All UAE, Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah), filters (barbers, barbershops, free today, home visits) and a swipeable card per place that moves the map. Pins are the barber's photo (square for barbershops) standing on a stem with the price; nearby pins group with a count, and pins at the same address fan out when you're close. The building a barber works in is lit up. Tilt and turn with two fingers (right-drag on a computer), switch 2D/3D, zoom, point north. Home, profiles and shop pages show a slowly turning 3D preview; barbers drop their own pin exactly from **My work → Your spot on the map**.
  - **Phones** use Apple Maps (iPhone) and Google Maps (Android) in 3D: tilted camera, real 3D buildings, dark style.
  - **Website and demo page** use the app's own 3D map engine (`app/src/components/map/engine.ts`): a canvas renderer with perspective, rotation and extruded buildings, drawing an offline map of the UAE built from OpenStreetMap — the exact coastline with the Palms, The World, the Creek and the Canal, the seven emirates' borders, highways with their E-numbers, district names, landmarks, airports, the street grid of Dubai, Sharjah, Ajman and Abu Dhabi, and every street and 3D building around each barber. No tiles, keys or network needed. `node app/scripts/build-uae-map.mjs` rebuilds the data (`app/src/components/map/uae.json`, ~0.9 MB) from OpenFreeMap's OpenStreetMap vector tiles. Outside the UAE the website shows the pins on a plain grid; the phone apps have full maps everywhere.
- **Sample content that feels alive:** real barbershop photography on barber profiles, portfolios, before/afters, barbershops and campaign banners, photo-motion video reels, and ten barbers in Dubai (Downtown, Business Bay, Marina, JBR, Palm Jumeirah, Al Barsha, Deira) priced in dirhams. Campaign banners on Home (offers, The Club, gift cards, wedding season) are edited in `server/src/campaigns.ts` and can target a country.
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
- **Extra travel for far home visits:** the customer shares their location or picks their area (an area named in the address, like "Atlantis The Royal, Palm Jumeirah", is picked up by itself). The app works out about how far the barber drives from their pin (the straight line plus 30% for roads). The visit fee covers the first 10 km; each km beyond adds AED 4 for the barber's taxi there and back, rounded up to AED 5 ("Mateo is about 23 km away … +AED 55"), shown before paying, on the receipt and to the barber. It all goes to the barber, with no JB fee. Each barber sets how far they go (10–80 km); further away, the visit can't be booked. The team changes the included km and the rate in Settings.
- **Slide to book**, then **"Book with Apple Pay"** (Google Pay on Android) — Apple's and Google's own buttons — with cards and other methods as a fallback.
- Live availability in the barber's local time zone; double-bookings are impossible.
- **Stripe payments:** Apple Pay, Google Pay, cards (and local methods on the web). Cancelling refunds automatically.
- Reviews only from completed bookings, one per appointment.

### Alerts & calendar
- **Push notifications** (iPhone and Android) plus an **Alerts inbox** in the app (bell on Home): "You're booked", a reminder **the day before** and **an hour before**, **"Your barber is on the way"** the moment the barber taps *On my way* for a home visit, cancellations, and "How was your cut?" afterwards. Barbers get "New booking" and their own 1-hour reminders. On the website, new alerts slide in at the top of the page while it's open.
- **Add to calendar:** on phones the appointment goes straight into the phone's calendar with alerts a day and an hour before; on the website it opens Google Calendar or downloads a calendar file for Apple Calendar / Outlook.

### Accounts
- **Permissions, asked properly:** never at launch; the first time a feature needs one (location for "Nearest" or a home visit, the camera, notifications, the calendar), a short screen explains why before the system prompt, and if it was turned off the app offers the phone's Settings. **Settings → Permissions** shows each one (on, approximate, not asked, off) with Allow / Open Settings, refreshed when you come back. Photos need no permission (the system picker), and the microphone, background location and tracking are never used.
- **Continue with Apple** (Apple's own button on iPhone), **Continue with Google**, or email and password. The server verifies Apple/Google identity tokens and links accounts that share a verified email.

### AI
- **AI Hairstyle Try-On:** upload a selfie → the AI analyses face shape, hair type and current cut and recommends haircuts, fades, colours and beard styles with exact "tell your barber" words → **OpenAI image editing renders each look on your own photo** (compare with a slider, or describe your own idea) → **Find barbers for this look** searches barbers with that specialty. Photos are not stored.
- **JB Concierge:** an AI chat assistant that searches barbers worldwide, explains profiles and prices, checks availability, shows your bookings, prepares a booking for you to confirm and pay (it never books or charges on its own), answers policy questions from the help centre, and opens support tickets. Conversations are kept server-side, append-only.

### For barbers
- Same app, same sign-in. A barber account gets **Your business** in Account: a **dashboard** (today's clients with *On my way* / *Mark done*, earnings today / this week / this month after the JB fee and tips, the next 7 days, reviews, a profile checklist), **Services & prices** (add, rename, remove, duration, price, home visits, travel fee and how far they go), **Hours & days off** (working days, opening hours, tap dates on a calendar to take them off) and **My work** (photo, bio, specialties, portfolio, before-and-afters, map pin).
- New barbers start **in review** (hidden from customers) until the team approves them, when `REVIEW_NEW_BARBERS` is on (default outside tests; the admin panel can switch it).
- **Joining as a freelance barber (KYC):** after creating their profile, a freelancer sends an **application** (Dashboard → My application): full name, Emirates ID number and expiry with photos of both sides (a passport outside the UAE), their barber licence or permit (number, who issued it, expiry, photo or PDF), and the **Independent Barber Agreement** signed in the app (typed name, drawn signature, tick box; the version, time, IP and device are kept). They tap **Submit application**; the status shows *Submitted*, and the team either approves it (the barber goes live with the Verified badge) or sends it back with a reason the barber sees in the app, fixes and sends again. Barbers at a barbershop don't apply: JB signs a contract with the shop itself. Documents are never public: they're stored outside the public uploads and only opened through links that expire after 15 minutes (`server/src/routes/applications.ts`); deleting the account deletes them.

### For barbershops: the shop panel
- `/shop-panel` (Account → **Shop panel**), for the owner or manager of a barbershop on the platform. The JB team gives access in the admin panel: **Shops & orders → tap the shop → Give access** with the email of an account they made in the app. API: `server/src/routes/manage.ts`, every route checks that the signed-in person runs that shop.
- **Calendar:** every barber side by side for a day — app bookings (solid), walk-ins and phone bookings (outlined), breaks and blocked time (striped), days off, private hires, and a line for the time now. Tap an empty half-hour to add a booking; tap a booking to mark it **done** or **no-show**, **move** it to another time or barber (the customer gets an alert), or **cancel** it (app bookings are refunded). **Block time** for one barber or the whole team (lunch, training…).
- **Barbers:** each barber's working days, hours and days off; **turn a barber off in the app** when they can't take bookings; add a barber (their account is made with a first password to hand over).
- **Services & times:** one menu for the team or for chosen barbers — how long each service takes (15 minutes to 8 hours) and its price.
- **Reports:** today, this week or this month — takings, bookings from the app vs walk-ins, no-shows, most-booked services, and how busy each barber is.
- **Shop settings:** the shop's about text, phone and opening days and hours shown in the app.
- **Linked to the app:** walk-ins, blocked time, days off, hours and barbers turned off all remove those times from what customers can book; service times set the length of the booking slots. Walk-ins are paid at the shop, so they carry no JB fee and don't count in the barber's in-app earnings or the team's revenue.

### For the team: admin panel
- `/admin` on the website (sidebar on a laptop, tabs on a phone), for emails listed in `ADMIN_EMAILS`; the API checks `requireAdmin` on every call.
- **Overview** (fees, bookings, barbers, customers, 14-day chart, what needs attention), **Applications** (freelance barbers' Emirates ID, licence and signed agreement, oldest first, with expiry dates: approve, or send back with a reason), **Barbers** (verify, pause, reinstate; a freelancer only goes live once their application is approved), **Bookings** (search, cancel with a full refund and alerts to both sides), **Customers**, **Shops & orders**, **Reported reels** (remove or keep), **Support** (reply and close), **Settings** (JB fee, new-barber review, extra travel for far home visits, home banners).
- **Analytics** (bookings, revenue, repeat customers, busiest hours and cities), **Finance & VAT** (fees, tips, refunds, VAT, CSV for the accountant), **Hotels & companies** (partner codes and QR links: hotel guests and company staff get their own landing page and corporate discounts), **Team & activity** (give staff a role: owner, operations, finance or support, and see who changed what).

### Support & shop
- **Help centre:** searchable FAQ, a contact form that creates support tickets, and the concierge 24/7.
- **JB's Fresh shop:** "Buy all JB's Fresh products" with local-currency prices, cart, delivery and the same checkout.
- **Demo mode:** without Stripe keys, payments are simulated so you can try everything.

## Try-it demo (no install)

`node app/scripts/build-demo-page.mjs out.html` builds the website as one self-contained page (code, fonts, icons, demo media and seed data inlined) that runs with an in-browser demo server (`app/src/lib/demo/server.ts`) instead of the API — bookings, reviews, reels likes, shop orders and support tickets are kept on the viewer's device and payments are simulated. Its concierge and try-on suggestions are built in and answer from the demo's own data. Add `--start barber`, `--start shop` or `--start admin` to build a page for one side: it opens signed in to that side's sample account, on the barber's dashboard, the barbershop panel or the admin panel.

## Tester link (Netlify)

**Live tester link: https://jb-always-fresh.netlify.app** (Netlify site `jb-always-fresh`; preview deploys stay behind the team login).

`node app/scripts/build-netlify.mjs` builds the same demo as a website for testers in `app/dist-netlify`: on a phone, open the link and **Add to Home Screen** — it opens full screen with the app's icon, like an installed app. Two ways to publish it:

- **Connected to GitHub (recommended):** in Netlify, *Add new site → Import an existing project → GitHub*, pick this repository and the branch to publish. `netlify.toml` holds the build settings, and every push updates the tester link.
- **With a token:** set `NETLIFY_AUTH_TOKEN` (and, after the first upload, `NETLIFY_SITE_ID`), then `NODE_USE_ENV_PROXY=1 node app/scripts/deploy-netlify.mjs`. It prints the link.

On the demo, Account → **Try as a barber**, **Try as a barbershop** and **Try as the JB team** open each side with sample data. The concierge and the try-on suggestions are built in and answer from the demo's own data; the live app uses the server's AI. Everything runs on sample data in the browser.

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

Sample logins: start the API with `DEMO_ACCOUNTS=1` to seed a team account (`admin@demo.jbalwaysfresh.com` / `jb-team-demo`), a barber (`mateo@demo.jbalwaysfresh.com` / `jb-barber-demo`) with a month of bookings, a barbershop owner (`owner@demo.jbalwaysfresh.com` / `jb-shop-demo`) running JB's Fresh Downtown with a busy day of app bookings, walk-ins and lunch breaks, two barbers waiting for approval, support tickets and a reported reel. Never set it in production. For real team access, list emails in `ADMIN_EMAILS`.

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
4. **Paying barbers** – built with Stripe Connect (Express): each barber opens Dashboard → Payouts, Stripe checks their ID and bank, and from then on their bookings are paid to them directly with JB's fee (`PLATFORM_FEE_PERCENT`, app bookings only, never on tips) kept as Stripe's `application_fee_amount`. Turn on Connect (Express) in your Stripe dashboard; no extra keys. Barbers who haven't set it up are paid by you, by bank transfer. See `docs/integrations-later.md`.
5. **Sign in with Apple & Google** – Apple: "Sign in with Apple" is enabled for the iOS app (`usesAppleSignIn` in `app/app.json`); turn on the capability for your App ID in the Apple Developer portal and set `APPLE_BUNDLE_ID` on the server. Google: create OAuth client IDs (web, iOS, Android) in Google Cloud Console, put them in `app/.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, and list them in `GOOGLE_CLIENT_IDS` on the server. Buttons only appear where they're configured. (Apple sign-in on the website needs an Apple Services ID — set `APPLE_SERVICE_ID` — and isn't wired into the web build yet.)
6. **Push notifications** – run `npx eas-cli init` in `app/` (adds the EAS project id the app needs for push tokens) and let EAS set up the Apple push key and Firebase credentials when you build (`npx eas-cli credentials`). The server sends alerts through Expo's push service — no extra keys needed (optionally set `EXPO_ACCESS_TOKEN` if you turn on enhanced push security). Reminders are checked every minute by the API process.
7. **AI** – set `ANTHROPIC_API_KEY` for the AI stylist analysis and JB Concierge (`server/src/stylist.ts`, `server/src/assistant.ts`), and `OPENAI_API_KEY` for try-on previews (OpenAI image editing, model set by `OPENAI_IMAGE_MODEL`, default `gpt-image-2`; `server/src/tryon.ts`). `TRYON_DAILY_LIMIT` caps previews per user per day to control cost. Each provider bills per use; previews are the most expensive part. Photos are processed per request and never stored. Hook your helpdesk into `createTicket` in `server/src/routes/support.ts` and set `SUPPORT_EMAIL`.
8. **Database** – without settings the API keeps data in `server/data/db.json` (fine for trying it out). For launch set `DATABASE_URL` to a Postgres database (Neon, Supabase, RDS, Render…): the API creates its table on first start, loads the data at startup and saves changes within a second (and on shutdown). All data access goes through `server/src/db.ts`.
9. **Reels** – the 18 sample reels in `server/media/demo/` are photo-motion clips built by `server/scripts/make-demo-media.sh`; delete them from `server/src/reels.ts` once barbers upload real videos. Uploaded videos are stored in `server/data/uploads/` — move them to object storage (S3, Cloudflare R2, …) behind a CDN before launch, and consider transcoding uploads to H.264 MP4 so every device can play them.
10. **Shop** – replace the sample products, prices and delivery fees in `server/src/products.ts`, and add product photos. Paid orders show as "Paid · preparing"; hook up your fulfilment (or a tool like Shopify/ShipStation) to ship them and mark them shipped.
11. **Barbershops** – replace the sample shops in `server/src/seed.ts` (`SHOPS`, with their teams in `SHOP_TEAMS`): address, pin, hours, private-hire price and limits, delivery fee, free-delivery threshold, delivery time and the products each stocks. Barbers belong to a shop through `shopId`. Shop staff (barber accounts at that shop) see private hires and delivery orders in Bookings and mark deliveries *Out for delivery* / *Delivered*; if you use a courier service (Uber Direct, Stuart, Careem…), call it from `POST /orders/:id/status` in `server/src/app.ts`. Private hire and "any barber" bookings use the same Stripe payments and refunds as everything else.
12. **The Club & gift cards** – plans, prices and perks are in `server/src/club.ts` (`PLANS`, `GIFT_AMOUNTS`). Each membership payment covers 30 days and is paid like a booking; for automatic monthly renewal, move it to Stripe Billing (a Subscription per member) and extend `paidUntil` from the `invoice.paid` webhook. Gift-card codes are single-use and their balance never expires; check the rules for gift cards and stored value in each country you sell in.
13. **Sample photos and reels** – the barber photos, portfolios, before/afters, shop photos, campaign banners and reels in `server/media/demo/` are built from Unsplash photos (free to use under the Unsplash License; list in `server/media/photos/SOURCES.txt`) by `server/scripts/make-demo-media.sh`. They are placeholders that don't show the barbers named in the app — replace them with your barbers' own photos and videos (they upload them under Account → My work) and your own campaign imagery before launch. The before/after pairs are two different photos, so don't present them as real results. Uploaded images go to `server/data/uploads/` — move them to object storage behind a CDN before launch.
14. **Email** – receipts, password reset and "email me my data" go through [Resend](https://resend.com): verify your domain there, then set `RESEND_API_KEY`, `EMAIL_FROM` (e.g. `JB Always Fresh <hello@jbalwaysfresh.com>`) and `APP_URL` (the website address that reset links open). Without a key, emails are only logged (and kept in a short outbox), so everything else still works.
15. **WhatsApp updates** – customers can switch on WhatsApp in Account → Profile (with their mobile number) to also get booking confirmations, reminders, "on the way" and cancellations on WhatsApp. Set up the [WhatsApp Business Platform](https://business.whatsapp.com/products/business-platform) in Meta Business Manager, add your business number, and get a utility template approved (default name `jb_update`, two body variables: `{{1}}` the title and `{{2}}` the text). Then set `WHATSAPP_TOKEN` (a permanent system-user token), `WHATSAPP_PHONE_ID` (the number's id) and, if different, `WHATSAPP_TEMPLATE` / `WHATSAPP_LANGUAGE`. Without them nothing is sent to WhatsApp; push and in-app alerts still work.
16. **Legal pages** – the terms of use and privacy policy in `app/src/lib/legal.ts` are drafts written for a UAE launch. Have your lawyer approve them, add the company's legal name and address, then set `LEGAL_REVIEWED = true` to remove the "draft" note. Account deletion, a copy of your data (Settings) and photo consent are built in.
17. **VAT and receipts** – every paid booking has a receipt (Bookings → Receipt, printable as PDF). Once JB is VAT-registered, set `VAT_TRN`, `COMPANY_LEGAL_NAME` and `COMPANY_ADDRESS` (and `VAT_PERCENT` if not 5): receipts become tax invoices showing the VAT, and the admin's Finance & VAT page exports a CSV for your accountant.
18. **Brand photography & logo** – the home screen's hero carousel, service tiles and AI Try-On panel use the photos in `app/assets/brand/` (listed in `app/src/lib/brandMedia.ts`). Before launch, make sure you own or have a licence for every photo. The JB monogram lives in `app/assets/brand/monogram.json`; after changing it, regenerate the app icon, Android icon layers, splash icon and favicon with `node app/scripts/make-icons.mjs`, and the black and white logo files in `app/assets/brand/logo/` with `node app/scripts/make-logos.mjs` (both need Playwright).
19. **Cities & maps** – add countries/cities (with their centre coordinates) in `server/src/seed.ts` (`COUNTRIES`) and replace the sample barbers with real ones; each barber's pin is `lat`/`lng` (barbers can move it with `PATCH /barbers/me`). Android maps need a Google Maps API key: set `GOOGLE_MAPS_ANDROID_API_KEY` when building (read by `app/app.config.js`); iPhone uses Apple Maps with no key. The website's 3D map needs no key; after moving or adding barbers in the UAE, run `node app/scripts/build-uae-map.mjs` so their streets and buildings are included. Map data © OpenStreetMap contributors (ODbL) — keep the attribution shown on the map. Home-visit distances use the customer's location or the centre of the area they pick (the list is in `app/src/lib/areas.ts`); for exact addresses, add an address search such as Google Places Autocomplete and send its coordinates as the booking's `spot`.
20. **Barber applications** – have the lawyer approve the barber agreement in `server/src/agreement.ts` (and bump `AGREEMENT_VERSION` whenever the wording changes: barbers who signed an older version are asked to sign again). Set `FILE_URL_SECRET` (any long random string) so links to ID documents keep working across restarts and servers. ID documents are stored in `server/data/private/`; before launch move them to private, encrypted storage (a private S3 or R2 bucket) and decide with the lawyer how long to keep them after a barber leaves (UAE data protection law). Sample documents for the demo accounts are drawn by `node server/scripts/make-sample-documents.mjs`.
21. **Permissions** – the iPhone texts and Android permissions are set in `app/app.json` (expo-location, expo-image-picker, expo-calendar plugins, `android.permissions` / `blockedPermissions`, and the iOS privacy manifest under `ios.privacyManifests`). They're shown to App Review, so keep them in step with the features. After a new build, test each "Not now" and "Don't allow" path on a real phone (delete and reinstall the app to be asked again). The table of what's asked when is in `docs/store-listing.md`.
22. **App Store & Google Play** – join the Apple Developer Program and create a Google Play Console account, change the bundle IDs in `app/app.json` if needed, fill in the placeholders in `app/eas.json` (App Store Connect app id, Apple team id, the Google Play service-account key file), then `npx eas-cli build --profile production --platform all` and `npx eas-cli submit --profile production` (EAS builds and uploads both apps from the cloud — no Mac needed). Store texts, privacy answers and review notes are ready in `docs/store-listing.md`. Deploy the website with `npx expo export --platform web` and host the `dist/` folder (any static host).
