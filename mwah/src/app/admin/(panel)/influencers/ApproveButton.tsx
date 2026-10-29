"use client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { approveInfluencer, type InfState } from "../../actions";

export function ApproveButton({ id, label = "Approve" }: { id: string; label?: string }) {
  const router = useRouter();
  const [st, action, pending] = useActionState<InfState, FormData>(approveInfluencer.bind(null, id), {});
  if (st.password) return (
    <div role="status" className="space-y-2 rounded-2xl bg-butter p-3 text-sm font-bold">
      <p>{st.message}</p>
      <code className="block select-all rounded bg-white px-2 py-1 text-base">{st.password}</code>
      <p className="text-xs font-normal">Copy it now. It can&apos;t be shown again (you can reset it later).</p>
      <button type="button" onClick={() => router.refresh()} className="btn btn-ink px-4 py-1.5 text-xs">Done</button>
    </div>
  );
  return (
    <form action={action}>
      <button disabled={pending} className="btn btn-pink px-4 py-2 text-sm">{pending ? "…" : label}</button>
      {st.message && <p role="status" className="mt-1 text-xs font-bold">{st.message}</p>}
    </form>
  );
}
