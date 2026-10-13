# wepink Gulf — GCC storefront

The online store for the wepink franchise in the GCC: a black-cherry and hot-pink campaign look, English and Arabic (full right-to-left layout), local prices for all six countries, a complete shop → bag → checkout flow, a referral and ambassador programme ("Earn with wepink"), the wepink Club sign-up, and an **admin panel** where the team manages products, photos, prices, orders, ambassadors and customers.

It's a static site (HTML, CSS and plain JavaScript, no build step), so it can be hosted anywhere (Netlify, Vercel, Cloudflare Pages, S3). Products, orders and customers live in a [Supabase](https://supabase.com) database (project `wepink-gulf`, Mumbai region); without it the store still runs from its built-in catalogue.

## Run it

```bash
npx http-server wepink-gcc -p 8080
# or
cd wepink-gcc && python3 -m http.server 8080
```

Then open http://localhost:8080. Add `?lang=ar` or `?country=SA` to any URL to preview Arabic or another country.

### One-file preview

```bash
node wepink-gcc/scripts/build-single.mjs   # → wepink-gcc/dist/wepink-gulf.html
```

Builds the whole store as a single HTML file (styles, scripts and logos inlined) that opens with a double-click, no server needed, and can be sent to the client as an attachment. Pages switch with the address hash (`#/shop?c=perfume`). Fonts load from Google Fonts when online. It also writes `dist/wepink-admin.html`, the admin panel as one file; keep the two files in the same folder so "Open the store" works. Both need an internet connection to reach the database.

The campaign photos stay files beside the page (`assets/products/hero/`). The second photo of each product (shown when the pointer is over a card, and in the product gallery) can also come in packs for hosts that limit the number of files: `node wepink-gcc/scripts/build-photo-packs.mjs` writes `dist/assets/products/hero2/` (19 packs and an index); the preview loads a pack the first time it needs one and uses the plain file when there's no pack.

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | Campaign hero (with Virginia Fonseca's photo once supplied), the icons, categories, "Created by Virginia Fonseca" and the VF line, the layering ritual, "Made to be noticed" campaign band, scent finder, gifting, the ambassador programme, store openings, newsletter |
| `shop.html` | Full catalogue with category, scent-family and price sorting (`?c=perfume`, `?f=sweet`, `?sort=low`) |
| `product.html?id=…` | Product page: price in local currency, tabby instalments, VAT note, delivery for the shopper's country, scent notes, "complete the ritual" |
| `stores.html` | Store openings by country, with a register-interest form and a mall/partner contact |
| `about.html` | Brand story and values |
| `help.html` | WhatsApp, email, hours and FAQ (delivery, COD, returns, authenticity) |
| `checkout.html` | Contact and Gulf address form, the country's payment methods, a gift note, a referral/promo code, and an order summary with VAT |
| `earn.html` | **Earn with wepink**: how the ambassador programme works, an earnings calculator, Pink / Hot Pink / Diamond tiers, sign-up that creates a personal code and share link, a live dashboard (link visits, orders, commission), and FAQ |
| `admin.html` | **Admin panel** for the team (not linked from the store): dashboard, products, orders, ambassadors, customers, settings |

## Built for the Gulf

- **Arabic and English.** Every string is translated, and the layout mirrors for Arabic (drawers, arrows, prices). The language is picked from the browser on first visit, then remembered.
- **Six countries, six currencies:** AED, SAR, QAR, KWD, BHD, OMR. Each country has its own VAT (UAE 5%, KSA 15%, Bahrain 10%, Oman 5%, Qatar and Kuwait none), free-delivery threshold, delivery fee, delivery times, cities and dialling code.
- **Local payment methods** per country: cards, Apple Pay, mada (KSA), KNET (Kuwait), BenefitPay (Bahrain), tabby, Tamara and cash on delivery.
- **WhatsApp** for customer care, plus an order summary that can be sent to WhatsApp after checkout. A green WhatsApp button in the corner of every page (as on wepink Brazil) opens a card with the care hours, quick topics (my order, scent advice, payment & delivery) and "Start chat".
- **Help centre** (help.html), modelled on wepink Brazil's Central de Ajuda: search, six topics (orders & delivery, payment, returns & refunds, products & safety, about wepink, account & Club) with answers filled in for the shopper's country, a "didn't find it?" block (WhatsApp, email, hours, assistant) and an exchange / return request form that sends a ready-made message to WhatsApp. The questions live in `faq` in `assets/js/data.js`; confirm refund and exchange times with the franchise.
- **Beauty assistant** ("Ask wepink", the pink button in the corner). It answers from the help centre and recommends from the catalogue by scent family, notes (vanilla, rose, oud…), type, who it's for, budget ("under 150") or name, in Arabic and English, with add-to-bag buttons, and hands over to WhatsApp for order questions. It can send its picks to the shopper's WhatsApp: name, number and consent are saved as a wepink Club contact (`details.via = "assistant"`). It runs in the browser at no cost per message; to let a language model hold the conversation, set `config.assistant.endpoint` to a service that takes `{ lang, country, messages }` and returns `{ reply, products: [ids] }` (the built-in answers stay as the fallback).
- **Gifting** (Ramadan, Eid): free gift wrap and a handwritten card note at checkout.
- **Referrals and ambassadors.** Anyone can sign up on the Earn page and gets a personal code (e.g. `MARIAM10`, made unique by the database) and link. A friend who opens `?ref=CODE` gets a welcome message (the visit is counted for the ambassador), the code is shown in their bag, and checkout applies the friend discount to their first order. Only active ambassadors' codes are accepted. Each order with a code records the commission for the ambassador's tier (Pink / Hot Pink / Diamond by orders that month); it becomes due when the team marks the order delivered, and the admin panel tracks what's pending, due and paid. Ambassadors see their link visits, orders and earnings on the Earn page, and product pages have a "Share & earn" button that shares the product with their code.
- **Sign in with Google or Apple.** A "Sign in" button in the header (and "My account" in the phone menu) opens Continue with Google / Continue with Apple. Signing in creates the shopper's customer record from their account (name, email, photo), then asks for their WhatsApp number, birthday and offers consent; their account shows their orders, checkout and the Earn form fill in their details, and orders they place are linked to them. See "Turning on Google and Apple sign-in" below.
- **wepink Club.** A sign-up pop-up (after 15 seconds, at most once a week, never during checkout) and a footer button: name, WhatsApp number, optional email and birthday, and a tick box to receive offers.
- **Black or white.** A moon/sun button in the header (and "Black / White" in the phone menu) switches the whole store between the white version and a black one. The first visit follows the device's dark/light setting; after that the shopper's choice is remembered. Colours live in theme tokens at the top of `styles.css` (`--bg`, `--fg`, `--surface`…), and `html[data-tone="noir"]` swaps them.
- **Interactive silk.** Behind every page a sheet of pink satin (WebGL) drifts in slow folds that lift and part around the cursor or finger, and every tap sends a ripple through it; fine pink threads with glints float above it and bend away from the cursor (`assets/js/silk.js`; about 30 frames a second at half resolution, paused when the tab is hidden; threads only where WebGL is missing). Tinted sections let it show through, and on the black version so do the home page's dark bands.
- **Pink loading line** across the top while the next page loads.
- **Two campaign photos per product.** Cards show the first and fade to the second when the pointer is over them (loaded only then); the product page gallery shows both, then the studio packshots.
- **Scent finder quiz**, search (by name, type or note), a bag drawer with a free-delivery progress bar, and a country/currency picker.
- Keyboard and screen-reader friendly (focus trapping in dialogs, labelled controls, visible focus), respects reduced motion (the brand marquee and homepage film still play, and the silk moves at half speed), and works from 360 px phones to wide desktops.

## Admin panel & database

Open `admin.html` (or `dist/wepink-admin.html`). The first time:

1. Choose **Create account** and sign up with the owner's email (the one listed in the database's `admins` table) and a password of 8+ characters.
2. Supabase emails a confirmation link — click it. If the page it opens doesn't load, that's fine: the email is confirmed. (Once the store has a web address, set it as the Site URL in Supabase → Authentication → URL Configuration so the link lands on the site, and password-reset links work.)
3. Come back and **Sign in**. Other people get access when an admin adds their email in Settings → Admins and they create an account the same way.

| Tab | What it does |
| --- | --- |
| Dashboard | Sales, visitors, new customers, people who agreed to offers, ambassadors, commission due, orders to handle; visits per day; where visitors come from (campaign, ambassador link or website), most viewed pages, countries, devices and language — for 7, 30 or 90 days |
| Products | Search and filter all products; add, edit, hide or delete them; upload photos (resized and saved as WebP), reorder them and pick a **photo style** — *product photo* (shown as it is), *cut-out* (a transparent-background photo the store stages on its pink scenes) or *campaign scene* (a styled shot that fills the frame); names, Arabic names, category, type, size, badge, scent family, price and "was" price, exact per-currency prices, taglines, descriptions and scent notes in both languages, colours, sort order. Bulk hide / show / delete, **export and import CSV** (the export is the template: only the columns in the file are changed), and "add back missing original products" |
| Orders | Every checkout, with the customer, address, items, totals in their currency and AED, payment method, gift note and referral code. Move orders from New → Confirmed → Shipped → Delivered (or Cancelled / Returned), add team notes, WhatsApp the customer, export CSV |
| Ambassadors | Codes, contacts, link visits, orders (and this month), sales, commission pending / due / paid; mark commission paid, pause or delete a code, WhatsApp them, export CSV |
| Customers | Everyone who left details anywhere on the store (club, newsletter, checkout, ambassador sign-up, store interest, Google / Apple sign-in), whether they agreed to offers, birthday, orders and spend, the campaign that first brought them, their recent page visits (with cookie consent); filter, export CSV, untick offers when someone asks to stop, or delete someone's data |
| Settings | The store-wide **price increase** (5% now), the friend discount and commission tiers, the WhatsApp number, email and social links shown on the store, admins, and your password |

### Turning on Google and Apple sign-in

The buttons are built in, but Google and Apple each need the store registered with them, and sign-in only works when the store (and admin) are opened from a **web address** — not from a file on a computer. Until a provider is switched on, its button says sign-in is coming soon.

1. **Host the store** (Netlify, Vercel or Cloudflare Pages, for example) and note its address, e.g. `https://wepink-gulf.com`.
2. In Supabase → **Authentication → URL Configuration**: set **Site URL** to that address and add `https://wepink-gulf.com/**` under **Redirect URLs**.
3. **Google** (free): in [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → OAuth consent screen, create an External app named "wepink Gulf" with your support email and logo. Then Credentials → Create credentials → OAuth client ID → Web application, and add the redirect URI `https://jkhtnytpkkqwnmhvgfmm.supabase.co/auth/v1/callback`. Copy the Client ID and Client secret into Supabase → **Authentication → Sign In / Providers → Google**, and turn it on.
4. **Apple** (needs an Apple Developer account, US$99/year): in Certificates, Identifiers & Profiles create an App ID with "Sign in with Apple", then a **Services ID** (e.g. `com.wepinkgulf.web`) with Sign in with Apple configured for the domain `jkhtnytpkkqwnmhvgfmm.supabase.co` and the return URL `https://jkhtnytpkkqwnmhvgfmm.supabase.co/auth/v1/callback`. Create a **Key** with Sign in with Apple and download the `.p8` file. In Supabase → **Sign In / Providers → Apple**, turn it on, put the Services ID under Client IDs, and generate the secret key from the `.p8` file, Key ID and Team ID (Supabase's Apple guide has a generator). Apple's secret expires every 6 months — set a reminder to renew it.

The admin panel has the same two buttons; admins can sign in with Google or Apple as long as the email on that account is listed in Settings → Admins.

**How the store stays in sync.** The store reads products, prices and settings from the database on every visit and keeps a copy in the shopper's browser, so pages open instantly and pick up the team's changes within a page load. Products whose photos haven't been replaced keep using the photos that ship with the site; uploaded photos are served from Supabase Storage. If the database can't be reached, the store falls back to its built-in catalogue, and orders still go through WhatsApp.

The database schema, row-level security and functions are in `supabase/schema.sql`. Shoppers can only read live products and settings; everything else goes through functions that check their input (place an order, sign up, check a code, save a form, record a visit). Admins are checked by the database itself, not just the page.

## Customer data & privacy

The store collects:

- **What people type in**: name, phone/WhatsApp, email, address, birthday, store city — from the wepink Club, newsletter, checkout, ambassador sign-up and store-interest forms, the scent quiz ("send my match to WhatsApp", source `quiz`, with the matched products) and the beauty assistant ("send these picks to my WhatsApp", source `club`, `details.via = "assistant"`). One customer record per person (matched by email, then phone), with every way they've joined.
- **When the Club pop-up appears**: 15 seconds into a visit, or on a computer as soon as the pointer heads for the tabs or the close button, at most once a week, never during checkout or over another window, and never again once someone has joined.
- **From Google / Apple sign-in**: the name, email and profile photo on the account (Apple lets people hide their email; then Apple gives a private relay address that still reaches them).
- **Consent for offers**: the Club tick box, the checkout "send me offers" box and the newsletter. Only send marketing to customers marked "Agreed to offers".
- **Visits, only after cookie consent**: a banner asks first; if accepted, each page view is recorded with the page, device type, screen size, language, the country of the connection, and the campaign (`?utm_source=…`) or ambassador link that brought the visitor. Declined means nothing is recorded. When a visitor later fills in a form, their visits are linked to their customer record.

The privacy notice is on the Help page (`help.html#privacy`), linked from the banner and the footer. Gulf data-protection laws (the UAE's PDPL, Saudi Arabia's PDPL) require consent for marketing and a way to see or delete data — the admin panel handles both, but the notice needs sign-off from the franchise's legal advisor.

## The catalogue

All 389 products come from wepink Brazil's own store (wepink.com.br runs on VTEX, whose public catalogue API lists every product with photos and descriptions):

```bash
python3 wepink-gcc/scripts/import_catalog.py fetch /tmp/wepink-raw   # download the catalogue
python3 wepink-gcc/scripts/import_catalog.py build /tmp/wepink-raw   # normalise + download 2 photos each
python3 wepink-gcc/scripts/cutout.py                                 # cut bottles out of the studio backdrop
python3 wepink-gcc/scripts/import_catalog.py js                      # write assets/js/catalog.js
```

- **Left out:** the 18 "Wehot" intimate-wellness products, which are restricted or prohibited in several GCC markets.
- **English and Arabic copy** lives in `data/translations.json` (names, taglines, descriptions, scent notes), translated from the Portuguese and reviewed for the Gulf: references to alcohol (whisky, cognac and rum notes) were removed. Re-running the import keeps it.
- **Photos:** `assets/products/<id>.webp` are the brand's studio shots (600 px). `assets/products/cutout/` holds the same bottles cut out of their white backdrop, which the store stages on its own scenes (spotlight, floor shadow, reflection, glow). 348 products have a clean cut-out; pale or clear bottles that don't cut out cleanly use the studio photo blended into the tint. Re-cut a product from a chosen photo with `python3 scripts/cutout.py <id>@1`.
- **Campaign hero shots:** every product also has two AI campaign shots (Nano Banana Pro on Higgsfield, 2K, 4:5) made from its studio photo — a night look (black-cherry plinth, hot-pink satin, magenta rim light; navy smoke or desert sunset for men's lines) and a day look (blush silk sheets, pearls, golden hour). They live in Supabase Storage under `product-images/hero/` and are set on each product with photo style *campaign scene*: cards and product pages show them first, the product gallery keeps the studio photos after them, and the staged spots on the home page (hero, category tiles) keep using the cut-outs. Change or replace them per product in the admin panel.
- **Virginia Fonseca:** `assets/photos/` holds her two official portraits from wepink's own campaign banners (no AI-generated images of her), used in the home hero and the "Created by Virginia Fonseca" section.
- **Campaign shots built in:** `assets/products/hero/<id>.webp` holds each product's Nano Banana Pro shot (640 × 800), so cards, the ritual, the icons and every staged spot show campaign photography even before the database answers (or with no database at all); the live database adds the second shot. The "Shop by ritual" tiles, the gifting promo and the ambassador band use campaign photos too (`featured.categoryPhotos`, `config.photos.gift`, `config.photos.earnBand`).
- **Homepage film:** `assets/video/` holds "Enter the pink universe", a 25-second cinematic film made with Seedance 2.5 from the real packshots and the wepink logo (the pink flagship doors, the store, product macros, a hand spraying VF Golden, the collection on marble podiums, the logo). It opens the home page full width under the see-through header, muted on a loop with a Sound on button; phones get the 720p file and a square crop; `film-poster.jpg` shows until it plays. Set or clear it in `data.js` (`config.film`).
- **The campaign:** `assets/photos/campaign/` holds 12 editorial images made with Nano Banana Pro at 4K around the real products (giant Heaven Pink bottle, VF Golden splash, fruit-stacked body creams, torn-paper lip oil, a pink chessboard, satin, red studio, golden hour, a jewelled crown, a beach towel, a squeezed peach, a red light stripe), with an AI model who is not Virginia. They fill the **Shot to be noticed** lookbook on the home page, the "Made to be noticed" band, a campaign strip at the top of Perfumes, Body Splash, Body Care, Makeup, Skincare and For Him, an "In the campaign" badge and gallery photo on every product in them, the Earn and About pages and the Club pop-up. Change them in `data.js` (`config.photos`, `featured.looks`).
- **Prices** are GCC placeholders by product type (body splash AED 79, eau de cologne AED 189, body cream AED 69…), not conversions of Brazilian prices. Shoppers pay them **+5%** (the store-wide increase in Settings), so a body splash sells for AED 83 and an eau de cologne for AED 198.
- The catalogue was loaded into the database once; from now on the admin panel is where products change. Re-running the import only updates `catalog.js`, the built-in fallback.

## Before launch — what to replace

1. **Image rights:** the product photos and Virginia Fonseca's portraits come from wepink Brazil's own site and campaigns. Confirm in writing with the brand that the franchise may use them in the GCC (her image rights are contractual), or swap in the GCC campaign shots in `assets/photos/` (`config.photos` in `data.js`).
2. **Logo:** `assets/brand/logo.svg` is wepink's official logo from their site (with white and ink versions generated from it).
3. **Brand colours:** set the official pink and supporting colours in the `:root` blocks of `assets/css/styles.css` (the campaign colours are in the "Noir pink" block at the end).
4. **Products:** confirm which of the 389 products the franchise will carry and their GCC registration status; remove the rest from `data/catalog-source.json` (or filter them in `import_catalog.py`) and re-run the `js` step.
5. **Prices:** GCC prices are placeholders by product type, plus the 5% increase. Set real prices per product in the admin panel (or by CSV import), with exact per-currency prices where needed. Check the KWD rate, which isn't pegged to the dollar (rates are in `data.js` and `place_order` in `schema.sql`).
6. **Referral terms:** the friend discount (10%) and commission tiers (10 / 15 / 20%) are placeholders — change them in Settings; the tier perks and FAQ wording are in `i18n.js`.
7. **Contact details:** WhatsApp number, email, Instagram and TikTok — set them in Settings (the defaults are in `config` at the top of `data.js`).
8. **Stores:** the store list in `data.js` (all are "opening soon" for now).
9. **Copy:** the brand story, the Virginia Fonseca text, the Club perks, the privacy notice, and the delivery/returns promises in `i18n.js` need sign-off from the brand.
10. **Web address:** set `siteUrl` in `config` (`data.js`) and the `og:image` address in the HTML pages to the real domain, then run `node scripts/build-sitemap.mjs` to rewrite `sitemap.xml` and `robots.txt`, and submit the sitemap in Google Search Console.
11. **Help centre answers:** refund (7 working days), replacement (48 hours) and exchange times in `faq` (`data.js`) follow wepink Brazil; confirm them for the Gulf.
12. **Database plan:** the Supabase project is on the free plan, which pauses after a week without activity and has no backups — move it to a paid plan before launch, and turn on leaked-password protection (Authentication → Passwords).

## Search engines and link previews

- Every page sets its title, description, share image (`og:` and Twitter tags), canonical address and English / Arabic alternates (`?lang=ar`) as it renders; the static tags in each HTML file cover apps that don't run scripts (WhatsApp, Instagram and X previews use `assets/photos/og-share.jpg`, 1200 × 630).
- Structured data for Google: Organization and WebSite with a site-search box (`shop.html?q=…` opens the search) on the home page, Product with price, currency, availability and images plus breadcrumbs on product pages, breadcrumbs on the shop, and FAQPage on the help centre.
- Product images carry the product's name as their description, in the shopper's language.
- `sitemap.xml` lists every page and product in both languages; `robots.txt` keeps the admin panel and checkout out of search (both also carry `noindex`).
- The store is drawn by JavaScript. Google renders it, but for the fastest indexing host it somewhere that can pre-render pages (Netlify or Vercel prerendering, or Cloudflare Pages with a prerender service).

## Going live

Orders, ambassadors, referral codes, commission and customer details are recorded in the database and managed in the admin panel, and each order also opens a WhatsApp message to the team. No payment is taken online yet — orders are confirmed on WhatsApp and paid on delivery or by link. To take payments and ship at scale, connect:

- **A payment gateway** that supports mada, KNET, BenefitPay and Apple Pay (for example Checkout.com, Tap or PayTabs), plus tabby and Tamara merchant accounts. Card payments should be confirmed by the gateway on the server (a Supabase Edge Function) before an order is marked paid.
- **Stock**: the database doesn't track stock yet; hide products that sell out, or add stock levels when a warehouse system is chosen.
- **A delivery partner** for GCC-wide shipping and cash on delivery (for example Aramex or SMSA).
- **Product registration:** cosmetics and fragrance generally need registering before sale in each country (for example Dubai Municipality's Montaji in the UAE and the SFDA in Saudi Arabia) — check with the franchise's regulatory advisor.
