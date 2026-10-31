# Launch guide

The **Admin → Launch checklist** page tracks all of this live. This document explains the *why*.

> **Not legal advice.** The policy pages are carefully structured drafts written for a UAE-based online seller shipping worldwide. They do not replace a lawyer. Have a UAE commercial lawyer review them, and your target markets, before you take real orders.

## 1. Connect Stripe

1. Stripe → activate your UAE account (business details, bank account for AED payouts).
2. Developers → API keys → create a **restricted key**: write on *Checkout Sessions* and *Refunds*; read on *PaymentIntents* and *Charges*. (The standard secret key also works.) Start with a **test** key (`sk_test_…` / `rk_test_…`).
3. Developers → Webhooks → add `https://YOUR-SITE/api/stripe/webhook` with events `checkout.session.completed` and `charge.refunded`. Copy the signing secret (`whsec_…`).
4. Set on your host (Netlify/Vercel → environment variables): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`.
5. Place a test order with card `4242 4242 4242 4242`, issue a refund from the order page, and watch it appear in Stripe.
6. Swap in the live key and live webhook secret. Place one real order and refund it.

**Never paste keys into chat or commit them to the repository.** Add them as environment variables in your hosting settings. To let a Claude Code session read an API token, add it under the cloud environment's settings (Edit → Network secrets or environment variables), not in the conversation.

Other Stripe notes
- Stripe charges in **AED**. International cards work; the customer's bank converts. You can switch on Stripe's *Adaptive Pricing* in the Stripe dashboard to show local currencies.
- Minimum charge is AED 2. Stripe prohibits some businesses and sanctioned regions: read Stripe's restricted-businesses list and the Stripe Services Agreement for your account, and describe your business honestly when you apply.
- Set your public business name, support email/phone and statement descriptor in the Stripe dashboard. Customers see these on their bank statement, and unclear descriptors cause chargebacks.

## 2. Fill in your business details
Admin → Settings → Business details: company name, trade licence number and authority, VAT TRN, registered address, support email and phone, and the Emirate for legal disputes. These feed the Terms, Privacy Policy and the footer.

## 3. Risks policy text cannot fix

| Area | Why it matters | What to do |
| --- | --- | --- |
| **Cosmetics regulation** | Lip balm is a regulated cosmetic. This is the most likely source of real liability. | Confirm UAE product registration/notification and labelling (MoIAT / Dubai Municipality or your emirate's authority), a safety assessment and good-manufacturing records. For each export market check the rules: EU/UK need a *Responsible Person* in that market and a product notification; the US requires FDA facility registration and product listing under MoCRA (with a small-business exemption that depends on your size and products); Canada, Australia, Saudi Arabia and others have their own regimes. A specialist cosmetics regulatory consultant is worth the fee. |
| **Product liability insurance** | Allergic reactions happen. | Get product liability insurance that covers the countries you sell to (many US marketplaces and carriers expect it). |
| **Labelling** | Ingredients (INCI), batch number, expiry/PAO, manufacturer and address, country of origin, warnings, net content. | Check your physical packs against each market's rules. The site's ingredient lists must match the pack exactly. |
| **Sanctions & export controls** | Stripe, banks and couriers apply US/EU sanctions even where UAE law does not. | Keep the blocked list. Do not ship to Crimea, Donetsk or Luhansk. Consider screening names for high-risk orders. |
| **Customs & duties** | Some countries (e.g. EU, UK, Australia, Canada, US) apply VAT/duty on low-value parcels and are changing the rules. | The policies tell customers they pay import charges. If you later want to collect them at checkout (DDP), use a duties tool or courier DDP service. |
| **VAT** | UAE VAT at 5% on UAE sales; exports are normally zero-rated with evidence of export. | Register for VAT if you are over the threshold, keep export proof (airway bills), and confirm with your accountant. Overseas sales may also trigger VAT/GST registration abroad once you pass local thresholds. |
| **Consumer law** | EU/UK distance-selling rights, UAE consumer protection and e-commerce law (Federal Decree-Law 14 of 2023). | The Returns Policy is built around sealed-hygiene-product exceptions. A lawyer should confirm it for your key markets. |
| **Data protection** | GDPR/UK GDPR/UAE PDPL/CCPA apply to your customers' data. | Register or appoint representatives where required (e.g. an EU/UK representative if you target those markets at scale). Keep the Privacy Policy accurate if you add email marketing or analytics. |
| **Influencers** | Undisclosed paid promotion is a legal breach for you and the creator. | Creator Terms require disclosure. In the UAE, paid influencer promotion generally needs a Media Council advertiser permit. Check posts. |
| **Marketing claims** | "Heals", "treats", "SPF" etc. turn a cosmetic into a drug/regulated claim. | Keep claims to moisturising/softening/glossy finish unless you have the evidence and approvals. |

## 4. Taxes by destination country

**How the shop handles it** (Admin → Taxes by country):
- **UAE deliveries:** prices include 5% VAT, on goods and delivery. Tax invoices are generated for every order.
- **Exports:** UAE VAT is removed (zero-rated export). Keep proof of export (airway bills) for every parcel.
- **Customer pays at import (default for every country):** the customer pays their country's VAT/GST and any duty to customs or the courier on delivery. Product pages and checkout show an estimate and say clearly that it is not charged by you.
- **You collect at checkout (tick per country):** the destination VAT/GST (and optional duty) is added as its own line, charged through Stripe, and shown on the invoice. **Only tick this where you are registered, or where your courier offers a duties-paid service, and you must pay the tax over.**

**Where overseas sellers are typically expected to collect at the point of sale** (rules change: confirm each with your accountant before ticking):

| Market | Typical regime |
| --- | --- |
| EU | Import One-Stop Shop (IOSS) for consignments up to €150: register in one EU country, charge destination VAT, file monthly. Customs duty on low-value parcels is also changing, so check current EU rules. |
| United Kingdom | VAT collected at checkout for consignments up to £135 by the seller, who must register for UK VAT. |
| Australia, New Zealand | GST collected at checkout for consignments up to AUD/NZD 1,000 once you pass the local sales threshold. |
| Norway | VOEC registration for consignments up to NOK 3,000. |
| Switzerland, Singapore, others | Registration thresholds apply for overseas sellers. |
| United States | No federal VAT. Customs duty may apply; state sales-tax obligations depend on where you have economic nexus. |

**GCC specifics**
- Saudi Arabia 15%, Bahrain 10%, Oman 5% VAT are charged on import by customs; Qatar and Kuwait have no VAT. These are the defaults shown as estimates.
- Goods that have entered the GCC customs union duty-paid move without further customs duty, but destination VAT still applies.
- **Cosmetics are regulated per country:** Saudi Arabia (SFDA), Kuwait, Qatar, Bahrain and Oman each have product registration or notification rules for imported cosmetics. Confirm before shipping there. This is separate from tax.

The reference rates in the app are standard rates and can be out of date. Review every country you sell to.

**Currencies:** shoppers can browse in AED, SAR, QAR, BHD, OMR, KWD, USD, EUR and GBP as an approximation (Admin → Currencies). They are always charged in AED by Stripe.

## 5. Shipping rates and times
The defaults (13 zones, 238 countries) are planning estimates based on published express-courier behaviour and conservative buffers. Get real quotes from your courier (Aramex, DHL Express, FedEx, Emirates Post or a consolidator) for a 20–50 g parcel to a few cities in each zone. Edit rates and days under Admin → Settings, then tick *Rates & times confirmed*. Changing any rate clears the tick.

## 6. Before the first real customer
- [ ] Launch checklist is fully green (including destination taxes and product copy)
- [ ] One test order paid, delivered to you, and refunded end to end
- [ ] Real photos and ingredient lists on every product
- [ ] Support email is monitored; you reply within the time the policies promise (1 working day)
- [ ] You have a process for packing, labelling and handing parcels to the courier within the promised processing time
