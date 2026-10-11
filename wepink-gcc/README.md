# wepink Gulf — GCC storefront

The online store for the wepink franchise in the GCC: English and Arabic (full right-to-left layout), local prices for all six countries, and a complete shop → bag → checkout flow.

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
| `index.html` | Hero, categories, bestsellers, the layering ritual, scent finder, gifting, store openings, newsletter |
| `shop.html` | Full catalogue with category, scent-family and price sorting (`?c=perfume`, `?f=sweet`, `?sort=low`) |
| `product.html?id=…` | Product page: price in local currency, tabby instalments, VAT note, delivery for the shopper's country, scent notes, "complete the ritual" |
| `stores.html` | Store openings by country, with a register-interest form and a mall/partner contact |
| `about.html` | Brand story and values |
| `help.html` | WhatsApp, email, hours and FAQ (delivery, COD, returns, authenticity) |
| `checkout.html` | Contact and Gulf address form, the country's payment methods, a gift note, and an order summary with VAT |

## Built for the Gulf

- **Arabic and English.** Every string is translated, and the layout mirrors for Arabic (drawers, arrows, prices). The language is picked from the browser on first visit, then remembered.
- **Six countries, six currencies:** AED, SAR, QAR, KWD, BHD, OMR. Each country has its own VAT (UAE 5%, KSA 15%, Bahrain 10%, Oman 5%, Qatar and Kuwait none), free-delivery threshold, delivery fee, delivery times, cities and dialling code.
- **Local payment methods** per country: cards, Apple Pay, mada (KSA), KNET (Kuwait), BenefitPay (Bahrain), tabby, Tamara and cash on delivery.
- **WhatsApp** for customer care, plus an order summary that can be sent to WhatsApp after checkout.
- **Gifting** (Ramadan, Eid): free gift wrap and a handwritten card note at checkout.
- **Scent finder quiz**, search (by name, type or note), a bag drawer with a free-delivery progress bar, and a country/currency picker.
- Keyboard and screen-reader friendly (focus trapping in dialogs, labelled controls, visible focus), respects reduced motion, and works from 360 px phones to wide desktops.

## Before launch — what to replace

Everything below is a placeholder until the brand and the franchise provide the real thing.

1. **Logo:** replace `assets/brand/logo.svg` (pink), `logo-white.svg` (footer) and `favicon.svg` with the official files from the wepink brand kit. The current wordmark is a stand-in set in Plus Jakarta Sans.
2. **Brand colours:** set the official pink and supporting colours in the `:root` block at the top of `assets/css/styles.css`.
3. **Products:** `assets/js/data.js` has a sample catalogue. Replace names, sizes, notes, descriptions and prices with the official GCC range. **Pink Oud and the Eid Gift Box are concept products for the Gulf launch, not existing wepink products — confirm them with the brand before going live.**
4. **Product photos:** the bottles are drawn in SVG. Add `image: "assets/products/obsessed-body-splash.webp"` to a product and its photo replaces the drawing everywhere.
5. **Prices:** set local prices in AED (`price`) or per currency (`prices: { SAR: 75, KWD: 5.75 }`). Check the KWD rate, which isn't pegged to the dollar.
6. **Contact details:** WhatsApp number, email, Instagram and TikTok in `config` at the top of `data.js`.
7. **Stores:** the store list in `data.js` (all are "opening soon" for now).
8. **Copy:** the "Our story" text and the delivery/returns promises in `i18n.js` need sign-off from the brand.

## Going live

The checkout is a working front end only — no payment is taken, and orders, newsletter sign-ups and store-interest forms are kept in the visitor's browser. To sell for real, connect it to:

- **A commerce platform** for products, stock, orders and multi-currency: Shopify (with Markets for the six countries) or Salla/Zid (popular in Saudi Arabia). This design can be used as the theme.
- **A payment gateway** that supports mada, KNET, BenefitPay and Apple Pay (for example Checkout.com, Tap or PayTabs), plus tabby and Tamara merchant accounts.
- **A delivery partner** for GCC-wide shipping and cash on delivery (for example Aramex or SMSA).
- **Product registration:** cosmetics and fragrance generally need registering before sale in each country (for example Dubai Municipality's Montaji in the UAE and the SFDA in Saudi Arabia) — check with the franchise's regulatory advisor.
