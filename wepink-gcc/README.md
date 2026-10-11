# wepink Gulf — GCC storefront

The online store for the wepink franchise in the GCC: a black-cherry and hot-pink campaign look, English and Arabic (full right-to-left layout), local prices for all six countries, a complete shop → bag → checkout flow, and a referral and ambassador programme ("Earn with wepink").

It's a static site (HTML, CSS and plain JavaScript, no build step), so it can be hosted anywhere (Netlify, Vercel, Cloudflare Pages, S3) or used as the design for a Shopify or Salla theme.

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

Builds the whole store as a single HTML file (styles, scripts and logos inlined) that opens with a double-click, no server needed, and can be sent to the client as an attachment. Pages switch with the address hash (`#/shop?c=perfume`). Fonts load from Google Fonts when online.

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
| `earn.html` | **Earn with wepink**: how the ambassador programme works, an earnings calculator, Pink / Hot Pink / Diamond tiers, sign-up that creates a personal code and share link, and FAQ |

## Built for the Gulf

- **Arabic and English.** Every string is translated, and the layout mirrors for Arabic (drawers, arrows, prices). The language is picked from the browser on first visit, then remembered.
- **Six countries, six currencies:** AED, SAR, QAR, KWD, BHD, OMR. Each country has its own VAT (UAE 5%, KSA 15%, Bahrain 10%, Oman 5%, Qatar and Kuwait none), free-delivery threshold, delivery fee, delivery times, cities and dialling code.
- **Local payment methods** per country: cards, Apple Pay, mada (KSA), KNET (Kuwait), BenefitPay (Bahrain), tabby, Tamara and cash on delivery.
- **WhatsApp** for customer care, plus an order summary that can be sent to WhatsApp after checkout.
- **Gifting** (Ramadan, Eid): free gift wrap and a handwritten card note at checkout.
- **Referrals and ambassadors.** Anyone can sign up on the Earn page and get a personal code (e.g. `MARIAM10`) and link. A friend who opens `?ref=CODE` gets a welcome message, the code is shown in their bag, and checkout applies the friend discount. Ambassadors earn commission by tier, and product pages have a "Share & earn" button that shares the product with their code. Terms live in `config.referral` in `data.js`.
- **Scent finder quiz**, search (by name, type or note), a bag drawer with a free-delivery progress bar, and a country/currency picker.
- Keyboard and screen-reader friendly (focus trapping in dialogs, labelled controls, visible focus), respects reduced motion, and works from 360 px phones to wide desktops.

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
- **Virginia Fonseca:** `assets/photos/` holds two portraits cropped from wepink's own campaign banners.
- **Prices** are GCC placeholders by product type (body splash AED 79, eau de cologne AED 189, body cream AED 69…), not conversions of Brazilian prices.

## Before launch — what to replace

1. **Image rights:** the product photos and Virginia Fonseca's portraits come from wepink Brazil's own site and campaigns. Confirm in writing with the brand that the franchise may use them in the GCC (her image rights are contractual), or swap in the GCC campaign shots in `assets/photos/` (`config.photos` in `data.js`).
2. **Logo:** `assets/brand/logo.svg` is wepink's official logo from their site (with white and ink versions generated from it).
3. **Brand colours:** set the official pink and supporting colours in the `:root` blocks of `assets/css/styles.css` (the campaign colours are in the "Noir pink" block at the end).
4. **Products:** confirm which of the 389 products the franchise will carry and their GCC registration status; remove the rest from `data/catalog-source.json` (or filter them in `import_catalog.py`) and re-run the `js` step.
5. **Prices:** GCC prices are placeholders by product type. Set them in `price_of()` in `import_catalog.py`, or per product and currency in the catalogue (`prices: { SAR: 205, KWD: 16.5 }`). Check the KWD rate, which isn't pegged to the dollar.
6. **Referral terms:** the friend discount (10%), commission tiers (10 / 15 / 20%) and perks are placeholders in `config.referral` and `i18n.js`.
7. **Contact details:** WhatsApp number, email, Instagram and TikTok in `config` at the top of `data.js`.
8. **Stores:** the store list in `data.js` (all are "opening soon" for now).
9. **Copy:** the brand story, the Virginia Fonseca text, and the delivery/returns promises in `i18n.js` need sign-off from the brand.

## Going live

The checkout is a working front end only — no payment is taken, and orders, newsletter sign-ups, store-interest forms and ambassador sign-ups are kept in the visitor's browser. Referral codes are accepted if they look valid; real codes, click and order tracking, and commission payouts need a backend. To sell for real, connect it to:

- **A commerce platform** for products, stock, orders and multi-currency: Shopify (with Markets for the six countries) or Salla/Zid (popular in Saudi Arabia). This design can be used as the theme.
- **A payment gateway** that supports mada, KNET, BenefitPay and Apple Pay (for example Checkout.com, Tap or PayTabs), plus tabby and Tamara merchant accounts.
- **A referral/affiliate platform** to issue codes, track orders and pay commission — for example a Shopify affiliate app, or the referral tools in Salla/Zid.
- **A delivery partner** for GCC-wide shipping and cash on delivery (for example Aramex or SMSA).
- **Product registration:** cosmetics and fragrance generally need registering before sale in each country (for example Dubai Municipality's Montaji in the UAE and the SFDA in Saudi Arabia) — check with the franchise's regulatory advisor.
