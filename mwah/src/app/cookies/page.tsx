import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
export const metadata: Metadata = { title: "Cookie Policy" };

export default function Cookies() {
  return (
    <Policy title="Cookie Policy" intro="We keep this simple: essential cookies run the shop, and one optional cookie remembers a creator who sent you.">
      <h2>What we store on your device</h2>
      <table>
        <thead><tr><th>Name</th><th>Purpose</th><th>Type</th><th>Lasts</th></tr></thead>
        <tbody>
          <tr><td><code>mwah_cart</code> (browser storage)</td><td>Remembers what is in your bag</td><td>Essential</td><td>Until you clear it</td></tr>
          <tr><td><code>mwah_consent</code></td><td>Remembers your cookie choice</td><td>Essential</td><td>12 months</td></tr>
          <tr><td><code>mwah_admin</code>, <code>mwah_influencer</code></td><td>Keep staff and creators signed in</td><td>Essential (only for logged-in staff and creators)</td><td>14 days</td></tr>
          <tr><td><code>mwah_ref</code></td><td>Remembers which creator&apos;s link you used, so their discount is applied at checkout and they are credited</td><td><b>Optional, only with your consent</b></td><td>30 days</td></tr>
          <tr><td><code>mwah_clicked</code></td><td>Counts one visit per day from a creator link</td><td><b>Optional, only with your consent</b></td><td>1 day</td></tr>
        </tbody>
      </table>
      <p>When you pay, Stripe may set its own cookies on its checkout page to prevent fraud and make payment work. They are governed by Stripe&apos;s policies.</p>

      <h2>Your choice</h2>
      <p>The first time you visit, you can choose <b>Accept all</b> or <b>Essential only</b>. If you choose essential only, we do not set the creator cookies. A creator link then just shows you the code to type at checkout. You can change your mind by clearing this site&apos;s cookies in your browser; the banner will appear again.</p>
      <p>We do not use advertising or analytics cookies.</p>
    </Policy>
  );
}
