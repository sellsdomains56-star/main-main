import type { Metadata } from "next";
import Link from "next/link";
import { Policy, V } from "@/components/Policy";
import { getSettings } from "@/lib/store";
import { countryName } from "@/lib/countries";
export const metadata: Metadata = { title: "Terms of Sale" };

export default async function Terms() {
  const { legal: l, storeName, vatPct, tax } = await getSettings();
  const collected = Object.entries(tax).filter(([, t]) => t.collect).map(([c]) => countryName(c)).sort();
  return (
    <Policy title="Terms of Sale" intro={`These terms apply to every order you place on this website. Please read them together with our Shipping, Returns & Refunds and Privacy policies.`}>
      <h2>1. Who we are</h2>
      <p>This website is operated by <b><V v={l.legalName} label="company name" /></b>, a business licensed by <V v={l.licensingAuthority} label="licensing authority" /> in the United Arab Emirates under trade licence no. <V v={l.tradeLicenceNo} label="trade licence no." />, VAT registration (TRN) <V v={l.vatTrn} label="TRN" />, registered address <V v={l.address} label="address" />. We trade as {storeName} (&quot;we&quot;, &quot;us&quot;). You can contact us at <V v={l.email} label="support email" /> or <V v={l.phone} label="phone" />.</p>

      <h2>2. Your order and our acceptance</h2>
      <ul>
        <li>Placing an order is an offer to buy. We accept it, and a contract is formed, when we confirm that your order has been dispatched. The confirmation page and any email we send when you pay only acknowledge that we received it.</li>
        <li>You must be at least 18 to place an order. Please make sure the details you give (especially your address and phone number) are correct.</li>
        <li>We may decline or cancel an order, for example if an item is out of stock, a price was shown wrongly, we suspect fraud, or we cannot lawfully ship to your destination. If we cancel after you have paid, we refund you in full.</li>
      </ul>

      <h2>3. Prices, VAT and payment</h2>
      <ul>
        <li>Prices are shown in UAE dirhams (AED). Prices for deliveries within the UAE include {vatPct}% VAT. Deliveries to addresses outside the UAE are treated as exports and are normally zero-rated for UAE VAT. The total shown at checkout is what you pay to us.</li>
        <li><b>Import taxes, duties and fees.</b> If your order is delivered outside the UAE, your country may charge import VAT or GST, customs duty and courier handling fees. {collected.length > 0 ? <>For deliveries to <b>{collected.join(", ")}</b> we collect the destination VAT/GST (and duty, where shown) at checkout. It appears as a separate line, is included in the total you pay, and you will have nothing more to pay on delivery for those items. </> : null}For every other country these charges are not included in our prices, are set by the authorities and couriers of your country, and are your responsibility. Checkout shows an estimate where we can, but we cannot guarantee the amount.</li>
        <li>Payment is taken at checkout by our payment provider, Stripe, using cards, Apple Pay or Google Pay. Your bank may ask you to confirm the payment (3-D Secure). We never see or store your full card details. Your bank or card issuer may convert AED into your currency and may charge its own fees.</li>
        <li>A tax invoice is available on request.</li>
      </ul>

      <h2>4. Delivery</h2>
      <p>Delivery estimates, costs, restrictions and what happens if a parcel is late, lost or damaged are set out in our <Link href="/shipping">Shipping Policy</Link> and on the <Link href="/delivery-times">Delivery times</Link> page. Estimates are not guaranteed dates. Risk in the goods passes to you when you, or someone you have named, take physical possession of them. Ownership passes to you when we have received full payment.</p>

      <h2>5. Where we do not ship</h2>
      <p>We do not sell or ship to countries or regions that are subject to comprehensive sanctions or where export is prohibited, which currently includes Cuba, Iran, North Korea, Syria and the Crimea, so-called Donetsk and so-called Luhansk regions of Ukraine, and any other destination marked as unavailable at checkout. By placing an order you confirm that you are not located in, or ordering on behalf of anyone in, those places, and that the goods will not be used in breach of any export or sanctions law. We may cancel and refund any order that breaks this rule.</p>

      <h2>6. Cancelling, returns and refunds</h2>
      <p>You can cancel an order free of charge until it has been dispatched. After that, our <Link href="/returns">Returns &amp; Refunds Policy</Link> applies, including how your statutory rights work if you live in a country that gives you a right to withdraw from distance purchases.</p>

      <h2>7. Using our products safely</h2>
      <ul>
        <li>Our balms are cosmetic products for external use on the lips only. They are not medicines and are not intended to diagnose, treat, cure or prevent any condition.</li>
        <li>Check the ingredient list on the product page and on the pack before use, especially if you have allergies or sensitivities (for example to beeswax, plant oils, fragrance or flavouring). If you are unsure, test a small amount first.</li>
        <li>Stop using a product and see a doctor if you get irritation, swelling or an allergic reaction. Keep out of reach of young children. Do not use on broken or infected skin.</li>
        <li>Store in a cool place away from direct sunlight and heat.</li>
      </ul>
      <p>Colours and flavours may look or taste slightly different from the pictures on your screen. We try to describe products accurately, but small variations between batches can happen.</p>

      <h2>8. Discount and creator codes</h2>
      <ul>
        <li>Only one code applies to an order. Codes cannot be combined, exchanged for cash or used on gift or already discounted items unless stated, and we can end or change a code at any time (not for orders already placed).</li>
        <li>Creator codes and links belong to approved creators. You may not use a creator&apos;s code for your own purchases if you are that creator, and we may remove a discount or cancel an order that abuses the system.</li>
      </ul>

      <h2>9. Our liability</h2>
      <p>Nothing in these terms limits or excludes liability for death or personal injury caused by negligence, for fraud, or for anything else that the law does not allow us to limit. Nothing in these terms reduces the rights you have as a consumer under UAE consumer protection law (including Federal Law No. 15 of 2020 and its regulations) or the mandatory consumer laws of the country where you live.</p>
      <p>Subject to that, we are not liable for losses that were not reasonably foreseeable, for loss of profit or business (we sell to consumers), or for delays or failures caused by events outside our reasonable control, such as courier or customs delays, strikes, severe weather, war, or government action. Where we are liable to you for a problem with an order, our liability is limited to the price you paid for that order.</p>

      <h2>10. Intellectual property and website use</h2>
      <p>The content on this website, including text, images, packaging designs, the name &quot;{storeName}&quot; and our logos, belongs to us or our licensors. You may view and share it for personal, non-commercial use. You may not copy it for commercial purposes, scrape the site, interfere with its security, or use it to break the law.</p>

      <h2>11. Privacy and cookies</h2>
      <p>How we use your personal data is explained in our <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link>.</p>

      <h2>12. Changes to these terms</h2>
      <p>We may update these terms. The version in force when you place your order is the one that applies to that order, and we keep a record of the version you accepted at checkout.</p>

      <h2>13. Governing law and disputes</h2>
      <p>These terms and any contract with us are governed by the laws of the United Arab Emirates as applied in the Emirate of <V v={l.jurisdiction} label="Emirate" />. If you have a problem, please contact us first at <V v={l.email} label="support email" /> and we will try to resolve it within 14 days. If we cannot, the courts of <V v={l.jurisdiction} label="Emirate" /> have jurisdiction. If you are a consumer living outside the UAE, this does not take away any mandatory protection of the country where you live, or any right you have to bring a claim in your local courts.</p>

      <h2>14. General</h2>
      <p>If any part of these terms is found unenforceable, the rest stays in force. You may not transfer your rights under a contract with us without our consent. If we do not enforce a right straight away, we do not lose it. These terms are in English; a translation is for convenience only.</p>
    </Policy>
  );
}
