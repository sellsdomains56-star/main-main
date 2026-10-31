import type { Metadata } from "next";
import Link from "next/link";
import { Policy, V } from "@/components/Policy";
import { getSettings } from "@/lib/store";
export const metadata: Metadata = { title: "Returns & Refunds Policy" };

export default async function Returns() {
  const { legal: l } = await getSettings();
  return (
    <Policy title="Returns & Refunds Policy" intro="If you are not happy, we want to put it right. This is how returns and refunds work.">
      <h2>1. Cancelling before dispatch</h2>
      <p>You can cancel an order for a full refund any time before it is dispatched. Email <b><V v={l.email} label="support email" /></b> as soon as you can.</p>

      <h2>2. Returning products you have changed your mind about</h2>
      <p>Because lip balm is a hygiene product that touches your lips, we can only accept back items that are <b>unopened, unused and in their original sealed packaging</b>. Once the seal or packaging has been opened, we cannot resell it, so we cannot take it back unless it is faulty (see section 3).</p>
      <ul>
        <li>You have <b>14 days from the day you receive your order</b> to tell us you want to return it, and a further 14 days to post it back.</li>
        <li>Email us with your order number and which items you want to return. We will send you the return address and a return reference. Please do not send anything back without one.</li>
        <li>You pay for return postage unless the item is faulty or wrong. Use a tracked service and keep proof of postage. We are not responsible for returns that are lost on the way to us.</li>
        <li>Returned items must arrive in the condition we sent them. We may reduce a refund if a returned item has been used or is missing its seal.</li>
      </ul>

      <h2>3. Faulty, damaged or wrong items</h2>
      <p>If your product arrives damaged, defective or is not what you ordered, tell us within <b>7 days</b> of delivery with your order number and photos. We will, at your choice, send a replacement or refund you in full, including the shipping you paid. We cover the return cost if we ask you to send the item back. If you notice a problem later, contact us anyway. Your legal rights for faulty goods continue beyond 7 days.</p>

      <h2>4. How refunds are paid</h2>
      <ul>
        <li>Refunds go back to the card or wallet you paid with, through our payment provider Stripe. We cannot refund to a different account.</li>
        <li>We refund within <b>14 days</b> of approving a cancellation or of receiving and checking your return (or of receiving proof you have posted it, if you are in a country where the law allows that). Your bank may take a further 5–10 business days to show it.</li>
        <li>Refunds are made in AED. Any difference caused by your bank&apos;s exchange rate or fees is outside our control.</li>
        <li>If you use a right to withdraw from the whole order, we refund the standard shipping we charged. If you return only part of an order, we do not refund the shipping, unless the law requires it.</li>
        <li>Import duties and taxes paid in your own country are collected by your authorities. Ask your courier or customs office whether they can be reclaimed on a return.</li>
      </ul>

      <h2>5. Your statutory rights</h2>
      <p>This policy does not affect your legal rights as a consumer. For example, in the EU, the UK and some other countries, distance purchases normally come with a 14-day right to withdraw. That right does not apply to sealed goods that are not suitable for return for health or hygiene reasons once they have been unsealed after delivery, which is the reason for the sealed-packaging rule above. Nothing here removes rights that cannot be removed under UAE consumer protection law or the law of the country where you live.</p>

      <h2>6. Problems with a payment or a dispute with your bank</h2>
      <p>Please contact us before opening a chargeback. We can usually fix the problem faster, and we may be able to refund you straight away. We will give your bank the records it asks for.</p>

      <p>Delivery questions are covered in our <Link href="/shipping">Shipping Policy</Link>.</p>
    </Policy>
  );
}
