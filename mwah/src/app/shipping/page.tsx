import type { Metadata } from "next";
import Link from "next/link";
import { Policy, V } from "@/components/Policy";
import { getSettings } from "@/lib/store";
import { COUNTRY_LIST } from "@/lib/countries";
import { fmt } from "@/lib/money";
import { totalDays } from "@/lib/delivery";
export const metadata: Metadata = { title: "Shipping Policy" };

export default async function Shipping() {
  const s = await getSettings();
  const blocked = s.blockedCountries.map((c) => COUNTRY_LIST.find((x) => x.code === c)?.name ?? c);
  return (
    <Policy title="Shipping Policy" intro="We ship from the UAE to customers around the world. Here is exactly what to expect.">
      <h2>1. Preparing your order</h2>
      <p>We prepare and dispatch orders within <b>{s.processingMinDays}–{s.processingMaxDays} business days</b> (Monday to Friday, excluding UAE public holidays) after payment is confirmed. Orders placed on a weekend or public holiday start on the next business day. We email you tracking details when the parcel is handed to the courier.</p>

      <h2>2. Delivery times and costs</h2>
      <p>Orders travel by tracked express courier. The windows below are <b>door to door from the day you order</b>, in business days, and include our preparation time. For a single country, see <Link href="/delivery-times">Delivery times worldwide</Link>. Your estimated delivery date is also shown at checkout and on your order page.</p>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead><tr><th>Region</th><th>Estimated delivery</th><th>Shipping</th><th>Free shipping</th></tr></thead>
          <tbody>{s.zones.map((z) => { const [lo, hi] = totalDays(s, z); return <tr key={z.id}><td>{z.name}</td><td>{lo}–{hi} business days</td><td>{fmt(z.rate)}</td><td>{z.freeOver ? `Orders over ${fmt(z.freeOver)}` : "—"}</td></tr>; })}</tbody>
        </table>
      </div>
      <p><b>Estimates are not guarantees.</b> Customs inspection, public holidays, severe weather, incorrect addresses and courier delays can add time, and remote areas may take longer than the region average. We are not liable for delays outside our control, but please tell us if your order is late and we will chase it.</p>

      <h2>3. Customs, duties and taxes</h2>
      <p>For orders delivered outside the UAE, the parcel is exported from the UAE and imported into your country. Your country may charge <b>import VAT/GST, customs duty and courier clearance fees</b>. We do not collect these and they are not included in our prices. The courier may ask you to pay them before or on delivery. You are the importer of the goods and are responsible for any such charges and for making sure the products are allowed into your country.</p>
      <p>If you refuse or fail to pay charges and the parcel is returned to us or abandoned, we will refund the price of the products minus the courier&apos;s return and handling costs, once the parcel is back with us. We cannot refund the original shipping cost in that case. If the parcel is destroyed by customs, we cannot refund it.</p>

      <h2>4. Where we deliver</h2>
      <p>We deliver to the countries listed on the <Link href="/delivery-times">Delivery times</Link> page, to street addresses (not all couriers deliver to PO boxes). We currently do <b>not</b> ship to: {blocked.join(", ")}, or to the Crimea, so-called Donetsk and so-called Luhansk regions of Ukraine, because of sanctions, courier restrictions and payment-provider rules. We cannot ship to a freight forwarder in a restricted destination. This list can change.</p>

      <h2>5. Your address</h2>
      <p>Please check your address and phone number before you pay. Couriers often need a phone number for delivery and customs. If an address is wrong or incomplete we will try to contact you, but we are not responsible for a parcel that cannot be delivered because of incorrect details. If it is returned to us, we can send it again once you pay the new shipping cost, or refund the product price minus return and handling costs. You can ask us to change an address until the order is dispatched.</p>

      <h2>6. Delivery attempts and tracking</h2>
      <p>Couriers normally make several delivery attempts, then hold the parcel at a local depot for a limited time before returning it. You can follow your parcel with the tracking number we email you. Someone may need to sign for it.</p>

      <h2>7. Late, lost or damaged parcels</h2>
      <ul>
        <li><b>Late:</b> if tracking shows no delivery by 10 business days after the end of your estimated window, email us. We will open a trace with the courier.</li>
        <li><b>Lost:</b> if the courier confirms the parcel is lost, or it has not been found within 15 business days of our trace, we will send a replacement or refund the full order, including shipping, whichever you prefer.</li>
        <li><b>Damaged or wrong item:</b> please check your parcel on delivery and email us within <b>7 days</b> with your order number and photos of the product and packaging. We will replace it or refund you, including shipping, at no cost to you.</li>
      </ul>
      <p>These promises sit alongside, and do not replace, your legal rights as a consumer.</p>

      <h2>8. Contact</h2>
      <p>Questions about a delivery? Email <b><V v={s.legal.email} label="support email" /></b> with your order number.</p>
    </Policy>
  );
}
