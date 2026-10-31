# Mwah: lip balm store

Storefront + admin panel + creator (influencer) referral programme. Next.js 16, Tailwind 4, Supabase, Stripe. Prices are in AED.

## Run it locally (no accounts needed)
```bash
cd mwah && npm install && npm run dev
```
- Shop: http://localhost:3000 (sample flavours, checkout runs in **test mode**, no charge)
- Admin: http://localhost:3000/admin, `admin@mwah.ae` / `mwah-admin` (dev defaults only)
- Data lives in `.data/db.json`. Delete it to reset.

## Go live
1. **Supabase**: create a project, run `supabase/schema.sql` in the SQL editor, copy the project URL and *service-role* key.
2. **Stripe**: activate a UAE account and create the key and webhook described in [`docs/LAUNCH.md`](docs/LAUNCH.md). Webhook events: `checkout.session.completed` and `charge.refunded`. (Orders are also confirmed when the customer returns to the site, so a missed webhook won't lose a sale.)
3. Set the variables from `.env.example` on your host (Netlify / Vercel). **`ADMIN_PASSWORD` and `SESSION_SECRET` are mandatory in production.**
4. Deploy, log in at `/admin`, and work through **Launch checklist**. It tracks everything below and stays red until it is true.

## What's in it
- **Storefront**: home, shop (search/sort), product pages, slide-out bag, one-page checkout with live totals, order tracking page, story, shipping & returns.
- **Admin** (`/admin`): sales dashboard, orders (status flow, tracking, notes), products (photos, stock, drafts), discount codes, customers, settings (shipping zones, VAT).
- **Shipping & tax**: zones by country with free-shipping thresholds. 5% UAE VAT included in prices; orders shipped outside the UAE are zero-rated exports (switchable). Confirm with your accountant.

## Policies, delivery times and compliance
- **Policy pages** (all generated from your **Admin → Settings**): Terms of Sale, Shipping, Returns & Refunds, Privacy, Cookies and Creator Terms. Footer links to all of them. Checkout will not take payment until the customer ticks acceptance, and the order stores the policy version, time and IP they accepted.
- **Business details** (company name, trade licence, TRN, address, email) are entered in Settings. Anything missing shows as a visible gap on the policy pages and fails the launch checklist. Nothing is invented.
- **Delivery estimates for 238 countries and territories**, grouped into 13 zones, with a searchable public page (`/delivery-times`). Customers also see an estimated delivery *date range* at checkout (processing + courier business days, Mon–Fri) and on their order page. Every zone's rate, free-shipping threshold and days are editable. The defaults are planning estimates, not carrier quotes.
- **Blocked destinations** (default Cuba, Iran, North Korea, Syria, Russia, Belarus) are hidden at checkout and refused by the server.
- **Cookies**: essential only unless the visitor accepts. Creator referral cookies are never set before consent; a creator link then just shows the code to type.
- These policies are **drafts, not legal advice**. See [`docs/LAUNCH.md`](docs/LAUNCH.md) for what a lawyer must review and the regulatory risks that policy text cannot fix.

## Creator referral programme (influencers only)
- Referral links exist **only for creators the admin approves**. Customers cannot create codes.
- Creators apply at `/influencers`. In **Admin → Creators** you approve (a code and one-time password are generated), set commission % and fan-discount % per creator, pause them, and record payouts.
- Creator link: `/r/CODE`. If the visitor accepts cookies it remembers the creator for 30 days and counts one click per browser per day. The code also works typed at checkout. Creators agree to the Creator Terms (including ad-disclosure rules) when applying.
- A referred order gets the creator's fan discount (never stacked with another code; the bigger one wins). Commission is calculated on the product value after discount, excluding shipping. Self-referrals (same email) are ignored. Cancelled or refunded orders drop out of earnings.
- Creators log in at `/influencer` to see clicks, orders, conversion, earnings, balance and payouts.

## Before launch, check
- Product copy, ingredients, claims, About page and the return policy are **placeholders**. Replace them with your real information.
- Email notifications (order confirmation, shipped) are not built yet. Resend or Postmark is the usual next step.
- **Refunds**: from an order's page, *Refund via Stripe* sends a full or partial refund to the customer's card and restocks on full refunds. Refunds made in the Stripe dashboard sync back through the `charge.refunded` webhook.
