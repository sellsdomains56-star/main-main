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
2. **Stripe**: activate a UAE account, copy the secret key. Add a webhook to `https://YOUR-SITE/api/stripe/webhook` for `checkout.session.completed` and copy its signing secret. (Orders are also confirmed when the customer returns to the site, so a missed webhook won't lose a sale.)
3. Set the variables from `.env.example` on your host (Netlify / Vercel). **`ADMIN_PASSWORD` and `SESSION_SECRET` are mandatory in production.**
4. Deploy, log in at `/admin`, replace the sample products and check **Settings** (shipping rates, VAT).

## What's in it
- **Storefront**: home, shop (search/sort), product pages, slide-out bag, one-page checkout with live totals, order tracking page, story, shipping & returns.
- **Admin** (`/admin`): sales dashboard, orders (status flow, tracking, notes), products (photos, stock, drafts), discount codes, customers, settings (shipping zones, VAT).
- **Shipping & tax**: zones by country with free-shipping thresholds. 5% UAE VAT included in prices; orders shipped outside the UAE are zero-rated exports (switchable). Confirm with your accountant.

## Creator referral programme (influencers only)
- Referral links exist **only for creators the admin approves**. Customers cannot create codes.
- Creators apply at `/influencers`. In **Admin → Creators** you approve (a code and one-time password are generated), set commission % and fan-discount % per creator, pause them, and record payouts.
- Creator link: `/r/CODE`. It remembers the creator for 30 days and counts one click per browser per day. The code also works typed at checkout.
- A referred order gets the creator's fan discount (never stacked with another code; the bigger one wins). Commission is calculated on the product value after discount, excluding shipping. Self-referrals (same email) are ignored. Cancelled or refunded orders drop out of earnings.
- Creators log in at `/influencer` to see clicks, orders, conversion, earnings, balance and payouts.

## Before launch, check
- Product copy, ingredients, claims, About page and the return policy are **placeholders**. Replace them with your real information.
- Email notifications (order confirmation, shipped) are not built yet. Resend or Postmark is the usual next step.
- Refunds are issued in Stripe; the admin only marks the order refunded and restocks.
