import type { Metadata } from "next";
import Link from "next/link";
import { launchChecks } from "@/lib/launch";
import { confirmItem } from "../../actions";
export const metadata: Metadata = { title: "Launch checklist", robots: { index: false } };

export default async function Launch() {
  const checks = await launchChecks();
  const done = checks.filter((c) => c.ok).length;
  const groups = [...new Set(checks.map((c) => c.group))];
  return (
    <div className="space-y-6">
      <div><h1 className="text-4xl font-extrabold">Launch checklist</h1>
        <p className={`mt-2 inline-block rounded-full px-4 py-1.5 text-sm font-extrabold ${done === checks.length ? "bg-green-200 text-green-900" : "bg-butter"}`}>{done === checks.length ? "Ready to launch 🎉" : `${done} of ${checks.length} done`}</p></div>
      {groups.map((g) => (
        <section key={g} className="card p-5"><h2 className="text-lg font-extrabold">{g}</h2>
          <ul className="mt-3 divide-y divide-blush">
            {checks.filter((c) => c.group === g).map((c) => (
              <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="flex min-w-0 flex-1 gap-3"><span aria-hidden className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm font-extrabold ${c.ok ? "bg-green-200 text-green-900" : "bg-red-100 text-red-800"}`}>{c.ok ? "✓" : "!"}</span>
                  <div className="min-w-0"><p className="font-bold">{c.title}<span className="sr-only">{c.ok ? ": done" : ": not done"}</span></p><p className="text-sm">{c.detail}</p></div></div>
                {c.fix?.confirm && <form action={confirmItem.bind(null, c.fix.confirm, !c.ok)}><button className={`btn px-4 py-2 text-sm ${c.ok ? "btn-ghost" : "btn-pink"}`}>{c.ok ? "Undo" : "I've done this"}</button></form>}
                {c.fix?.href && !c.ok && c.fix.href !== "/admin/launch" && <Link href={c.fix.href} className="btn btn-ghost px-4 py-2 text-sm">Fix</Link>}
              </li>))}
          </ul></section>))}
      <section className="card p-5 text-sm"><h2 className="text-lg font-extrabold">Connecting Stripe</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>In Stripe, create a <b>restricted key</b> with write access to Checkout Sessions and Refunds, and read access to PaymentIntents and Charges. Or use the standard secret key.</li>
          <li>Add a webhook to <code className="rounded bg-cream px-1">https://YOUR-SITE/api/stripe/webhook</code> for <code className="rounded bg-cream px-1">checkout.session.completed</code> and <code className="rounded bg-cream px-1">charge.refunded</code>.</li>
          <li>Put the key as <code className="rounded bg-cream px-1">STRIPE_SECRET_KEY</code> and the webhook signing secret as <code className="rounded bg-cream px-1">STRIPE_WEBHOOK_SECRET</code> in your host&apos;s environment variables. Never paste them in chat or commit them to the repository.</li>
          <li>Test with a <code className="rounded bg-cream px-1">sk_test_</code> key and card 4242 4242 4242 4242, then swap in live keys.</li>
        </ol></section>
    </div>
  );
}
