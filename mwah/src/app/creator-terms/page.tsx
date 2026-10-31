import type { Metadata } from "next";
import Link from "next/link";
import { Policy, V } from "@/components/Policy";
import { getSettings } from "@/lib/store";
import { fmt } from "@/lib/money";
export const metadata: Metadata = { title: "Creator Programme Terms" };

export default async function CreatorTerms() {
  const s = await getSettings();
  return (
    <Policy title="Creator Programme Terms" intro="These terms apply to anyone approved to join the creator referral programme. Referral links and codes are for approved creators only.">
      <h2>1. Joining</h2>
      <ul>
        <li>You apply on our website. We choose who to approve and do not have to give a reason. You must be 18 or over and legally able to enter this agreement.</li>
        <li>You are an independent creator, not our employee, agent or partner. You are responsible for your own content, equipment, taxes and any licences you need.</li>
        <li>You get a personal link, a code and a dashboard login. Keep the login private. You are responsible for what happens under it.</li>
      </ul>

      <h2>2. How the programme works</h2>
      <ul>
        <li>People who use your code, or who accept the cookie after opening your link, get a discount on their order (currently {s.defaultCustomerDiscountPct}% for new creators; the exact figure is on your dashboard). Discounts cannot be combined with other codes.</li>
        <li>You earn commission on <b>paid orders that came through your link or code</b> (currently {s.defaultCommissionPct}% for new creators; your rate is on your dashboard). Commission is calculated on the product value after the discount, <b>not</b> on shipping, taxes or duties.</li>
        <li>Orders that are cancelled, refunded, fraudulent or placed by you or someone in your household do not earn commission. If a refund happens after we have paid you, we may take that commission off future payouts.</li>
        <li>Your link only works if the visitor accepts the optional cookie, or types your code. We cannot guarantee that every visit or sale is tracked, and our tracking records are final.</li>
        <li>We may change commission rates, discounts or these terms for future orders by giving you notice on your dashboard or by email.</li>
      </ul>

      <h2>3. Payouts</h2>
      <ul>
        <li>We pay out your balance when it reaches <b>{fmt(s.minPayout)}</b>, at least monthly, by the method we agree with you. Payouts are made in AED.</li>
        <li>You must give us accurate payout details. You are responsible for reporting and paying any tax on what you earn. We may ask for identity or tax information and hold payments until we have it.</li>
      </ul>

      <h2>4. Rules for your content</h2>
      <ul>
        <li><b>Disclose the relationship.</b> Every post, story, video or message that includes your link or code must clearly say it is an ad or paid partnership (for example #ad or the platform&apos;s &quot;paid partnership&quot; label), in the way the law of your audience&apos;s country requires. This includes the US FTC Endorsement Guides, UK ASA/CMA rules, EU rules and, where you are in the UAE, the UAE Media Council rules, including any advertiser permit you need to promote products for payment. You are responsible for getting this right.</li>
        <li>Be truthful. Do not claim our products treat, cure or prevent any condition, and do not invent reviews, results or experiences you did not have.</li>
        <li>No spam, no unsolicited messages, no fake accounts or bots, no misleading links, no coupon sites without permission, and no paid search ads using our brand name.</li>
        <li>Do not use your own code or link to buy for yourself, and do not create or use extra accounts to do so.</li>
        <li>Do not say you speak for {s.storeName}. Do not post anything unlawful, hateful, or that infringes someone else&apos;s rights.</li>
        <li>You keep the rights to your content. You give us a free, worldwide licence to repost it with credit for marketing while you are in the programme.</li>
      </ul>

      <h2>5. Ending the agreement</h2>
      <p>Either of us can end it at any time by telling the other. We can pause or remove you immediately if you break these terms or the law, or harm our reputation. On ending, we pay out the balance you have earned for valid orders, minus anything we are entitled to hold back for refunds. Your link and code stop working.</p>

      <h2>6. Liability</h2>
      <p>Nothing here limits liability that cannot legally be limited. We do not promise that you will earn any amount, and we are not liable for lost earnings, tracking problems or the programme ending. These terms are governed by the laws of the United Arab Emirates as applied in the Emirate of <V v={s.legal.jurisdiction} label="Emirate" />, and the courts of that Emirate have jurisdiction.</p>

      <h2>7. Your data</h2>
      <p>We use your application and payout details to run the programme, as described in our <Link href="/privacy">Privacy Policy</Link>.</p>
    </Policy>
  );
}
