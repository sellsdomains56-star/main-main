"use client";
import { useActionState } from "react";
import { refundOrder, type RefundState } from "../../../actions";

export function RefundForm({ id, left, hasPayment }: { id: string; left: number; hasPayment: boolean }) {
  const [st, action, pending] = useActionState<RefundState, FormData>(refundOrder.bind(null, id), {});
  if (left <= 0) return null;
  return (
    <form action={action} className="card flex flex-wrap items-end gap-3 p-4">
      <div><label className="label" htmlFor="amount">Refund to customer's card (AED, up to {left.toFixed(2)})</label><input id="amount" name="amount" type="number" step="0.01" min="0.01" max={left} defaultValue={left} className="input w-40" /></div>
      <button disabled={pending || !hasPayment} className="btn btn-ghost px-4 py-2.5 text-sm text-cherry">{pending ? "Refunding…" : "Refund via Stripe"}</button>
      {!hasPayment && <p className="basis-full text-xs">No Stripe payment is recorded for this order. Refund it in the Stripe dashboard.</p>}
      {st.error && <p role="alert" className="basis-full rounded-xl bg-red-100 p-2 text-sm font-bold text-red-800">{st.error}</p>}
      {st.ok && <p role="status" className="basis-full rounded-xl bg-green-100 p-2 text-sm font-bold text-green-900">Refund sent. The customer's bank usually shows it within 5–10 days.</p>}
    </form>
  );
}
