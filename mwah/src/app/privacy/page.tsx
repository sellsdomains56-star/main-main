import type { Metadata } from "next";
import Link from "next/link";
import { Policy, V } from "@/components/Policy";
import { getSettings } from "@/lib/store";
export const metadata: Metadata = { title: "Privacy Policy" };

export default async function Privacy() {
  const { legal: l, storeName } = await getSettings();
  return (
    <Policy title="Privacy Policy" intro={`${storeName} respects your privacy. This policy explains what personal data we collect, why, who we share it with, and the choices you have.`}>
      <h2>1. Who is responsible for your data</h2>
      <p>The controller of your personal data is <b><V v={l.legalName} label="company name" /></b>, <V v={l.address} label="address" />, United Arab Emirates. Contact us about privacy at <b><V v={l.email} label="support email" /></b>. We handle personal data in line with the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and, where they apply to you, the EU and UK GDPR and US state privacy laws such as the California Consumer Privacy Act.</p>

      <h2>2. What we collect and why</h2>
      <table>
        <thead><tr><th>What</th><th>Why we use it</th><th>Legal basis</th></tr></thead>
        <tbody>
          <tr><td>Name, email, phone, delivery address, order contents</td><td>To take payment, deliver your order, handle customs, and give support, returns and refunds</td><td>Contract</td></tr>
          <tr><td>Payment details (handled by Stripe, not by us: we receive only the payment status, card brand and last four digits)</td><td>To take payment and prevent fraud</td><td>Contract; legitimate interests</td></tr>
          <tr><td>Proof you accepted our policies (version, time, IP address)</td><td>To keep a record of the contract and defend legal claims</td><td>Legitimate interests; legal obligation</td></tr>
          <tr><td>Invoices, tax and accounting records</td><td>To meet UAE tax and accounting law (kept for at least five years)</td><td>Legal obligation</td></tr>
          <tr><td>Messages you send us</td><td>To reply and keep a record of the help we gave</td><td>Contract; legitimate interests</td></tr>
          <tr><td>Creator link click and the creator who referred you (optional cookie)</td><td>To give you the creator&apos;s discount and credit the creator</td><td>Consent</td></tr>
          <tr><td>Technical data such as IP address, browser and pages visited, in server logs</td><td>To keep the site secure and working</td><td>Legitimate interests</td></tr>
          <tr><td>Creator applications: name, email, social handle, follower count, bank or payout details you give us</td><td>To assess applications, run the programme and pay commission</td><td>Contract; legitimate interests</td></tr>
        </tbody>
      </table>
      <p>We do not use your data for automated decisions that have legal effects on you. We do not sell your personal data and we do not share it for cross-context behavioural advertising. We do not send marketing emails today. If we start, we will only do so with your consent or where the law allows, and every message will have an unsubscribe link.</p>

      <h2>3. Who we share it with</h2>
      <ul>
        <li><b>Stripe</b> processes your payment. Stripe is an independent controller for its own fraud and compliance duties; see its privacy policy.</li>
        <li><b>Couriers and postal services</b> receive your name, address, phone number, email and the contents/value of the parcel to deliver it and clear customs. Customs authorities in the destination country may receive it too.</li>
        <li><b>Service providers</b> that host our website and database and keep it secure, acting on our instructions.</li>
        <li><b>Professional advisers, regulators and law enforcement</b> where we are required to, or need to protect our legal rights.</li>
        <li><b>A buyer of the business</b>, if it is sold, under the same protections.</li>
      </ul>

      <h2>4. International transfers</h2>
      <p>We are based in the UAE and ship worldwide, so your data is transferred to the destination country (for delivery) and to the countries where our providers operate. Where the law requires it, we use safeguards such as standard contractual clauses or only share what is necessary to perform your contract.</p>

      <h2>5. How long we keep it</h2>
      <p>Order and tax records: at least five years, as UAE law requires. Messages and support records: up to three years after the last contact. Technical logs: up to 90 days. Creator records: for the life of the programme and then as long as accounting rules require. We delete or anonymise data when it is no longer needed.</p>

      <h2>6. Your rights</h2>
      <p>Depending on where you live, you can ask us to access, correct, delete, restrict or port your personal data, object to some uses, withdraw consent at any time (this does not affect earlier use), and opt out of any sale or sharing of data (we do neither). Email <V v={l.email} label="support email" /> and we will reply within 30 days. We may need to verify your identity. If you are unhappy, you can complain to us, or to the data protection authority where you live (in the UAE, the UAE Data Office) or work.</p>

      <h2>7. Cookies</h2>
      <p>See our <Link href="/cookies">Cookie Policy</Link>. We only use essential cookies unless you accept the optional one.</p>

      <h2>8. Security</h2>
      <p>We use encryption in transit, restricted access, and trusted providers. Payment details go straight to Stripe. No system is perfectly secure. If a breach is likely to harm you, we will tell you and the authorities as the law requires.</p>

      <h2>9. Children</h2>
      <p>Our shop is for adults. We do not knowingly collect personal data from children. If you think a child has given us data, contact us and we will delete it.</p>

      <h2>10. Changes</h2>
      <p>We will post updates here and change the date at the top. If a change is important, we will tell you.</p>
    </Policy>
  );
}
